import * as functions from 'firebase-functions'
import * as FirebaseFirestore from '@google-cloud/firestore'
import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import * as admin from 'firebase-admin'
// import { Pring, property } from 'pring'
import { FieldValue } from '@google-cloud/firestore'

let _firestore: FirebaseFirestore.Firestore
let _failureOptions: FailureOptions | undefined
interface FailureOptions {
  collectionPath: string
}

export function initialize(adminOptions: any, failureOptions?: FailureOptions) {
  _firestore = new FirebaseFirestore.Firestore(adminOptions)
  _failureOptions = failureOptions
  // Pring.initialize(options)
}

export enum Status {
  OK = 200,
  BadRequest = 400,
  InternalError = 500
}

interface IResponse {
  status: Status
  id?: string
  errors?: [{ [key: string]: any }]
}

export class Response {
  reference: FirebaseFirestore.DocumentReference

  constructor(reference: FirebaseFirestore.DocumentReference) {
    this.reference = reference
  }

  private makeResponse(status: Status): IResponse {
    return { status: status }
  }

  async setOK(id?: string) {
    const response = this.makeResponse(Status.OK)
    if (id) {
      response.id = id
    }

    await Promise.all([
      this.reference.update({ response: response }),
      new Failure(this.reference).clear()
    ])

    return response
  }

  private async setError(status: Status, id: string, errors?: [{ [key: string]: any }]) {
    const response = this.makeResponse(status)
    response.id = id
    if (errors) {
      response.errors = errors
    }

    await Promise.all([
      this.reference.update({ response: response }),
      new Failure(this.reference).add(response)
    ])

    return response
  }

  async setBadRequest(id: string, errors?: [{ [key: string]: any }]) {
    return this.setError(Status.BadRequest, id, errors)
  }

  async setInternalError(id: string, errors?: [{ [key: string]: any }]) {
    return this.setError(Status.InternalError, id, errors)
  }
}

interface IFailure {
  errors: {
    response: IResponse,
    createdAt: FirebaseFirestore.FieldValue
  }[],
  refPath: string,
  reference: FirebaseFirestore.DocumentReference,
  createdAt: FirebaseFirestore.FieldValue
}

export class Failure {
  reference: FirebaseFirestore.DocumentReference

  private makeQuerySnapshot(refPath: string) {
    return _firestore.collection(_failureOptions!.collectionPath)
      .where('refPath', '==', refPath)
      .get()
  }

  private makeError(response: IResponse) {
    return {
      response: response,
      createdAt: FirebaseFirestore.FieldValue.serverTimestamp()
    }
  }

  async add(response: IResponse) {
    if (!_failureOptions) {
      return
    }

    const querySnapshot = await this.makeQuerySnapshot(this.reference.path)

    if (querySnapshot.docs.length === 0) {
      const failureRef = _firestore.collection(_failureOptions.collectionPath)
      const failure: IFailure = {
        errors: [this.makeError(response)],
        createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
        reference: this.reference,
        refPath: this.reference.path
       }
      return failureRef.add(failure)
    } else {
      const failure = querySnapshot.docs[0].data() as IFailure
      failure.errors.push(this.makeError(response))

      return querySnapshot.docs[0].ref.update(failure)
    }
  }

  async clear() {
    if (!_failureOptions) {
      return
    }

    const querySnapshot = await this.makeQuerySnapshot(this.reference.path)

    return Promise.all(querySnapshot.docs.map(doc => {
      return doc.ref.delete()
    }))
  }

  constructor(reference: FirebaseFirestore.DocumentReference) {
    this.reference = reference
  }
}

// export class ValidationError extends Error {
//   validationErrorType: string
//   reason: string
//   option?: any

//   constructor(validationErrorType: string, reason: string) {
//     super()
//     this.validationErrorType = validationErrorType
//     this.reason = reason
//   }
// }

// export class Failure<T extends HasNeoTask> extends Pring.Base {
//   @property ref: FirebaseFirestore.DocumentReference
//   @property refPath: string
//   @property neoTask: NeoTask

//   static querySnapshot(refPath: string) {
//     return firestore.collection('version/1/failure')
//       .where('refPath', '==', refPath)
//       .get()
//   }

//   static async setFailure<T extends HasNeoTask>(model: T, neoTask: NeoTask) {
//     const querySnapshot = await Failure.querySnapshot(model.reference.path)

//     if (querySnapshot.docs.length === 0) {
//       const failure = new Failure()
//       // FIXME: Error: Cannot encode type ([object Object])
//       // failure.ref = documentSnapshot.ref
//       failure.refPath = model.reference.path
//       failure.neoTask = neoTask.rawValue()
//       return failure.save()
//     } else {
//       const failure = new Failure()
//       failure.init(querySnapshot.docs[0])
//       // FIXME: Error: Cannot encode type ([object Object])
//       // failure.ref = documentSnapshot.ref
//       failure.refPath = model.reference.path
//       failure.neoTask = neoTask.rawValue()
//       return failure.update()
//     }
//   }

//   static async deleteFailure<T extends HasNeoTask>(model: T) {
//     const querySnapshot = await Failure.querySnapshot(model.reference.path)

//     for (const doc of querySnapshot.docs) {
//       const failure = new Failure()
//       failure.init(doc)
//       await failure.delete()
//     }
//   }
// }

// export enum NeoTaskStatus {
//   none = 0,
//   success = 1,
//   failure = 2
// }

// export interface HasNeoTask extends Pring.Base {
//   neoTask?: NeoTask
// }

// export class NeoTask extends Pring.Base {
//   @property status?: NeoTaskStatus
//   @property invalid?: { validationError: string, reason: string }
//   @property fatal?: { step: string, error: string }

//   static makeNeoTask<T extends HasNeoTask>(model: T) {
//     let neoTask = new NeoTask()
//     if (model.neoTask) {
//       if (model.neoTask.status) { neoTask.status = model.neoTask.status }
//       if (model.neoTask.invalid) { neoTask.invalid = model.neoTask.invalid }
//       if (model.neoTask.fatal) { neoTask.fatal = model.neoTask.fatal }
//     }
//     return neoTask
//   }

//   static async setInvalid<T extends HasNeoTask>(model: T, error: ValidationError) {
//     let neoTask = NeoTask.makeNeoTask(model)

//     neoTask.status = NeoTaskStatus.failure
//     neoTask.invalid = {
//       validationError: error.validationErrorType,
//       reason: error.reason
//     }

//     await model.reference.update({ neoTask: neoTask.rawValue() })

//     model.neoTask = neoTask.rawValue()

//     return model
//   }

//   static async setFatal<T extends HasNeoTask>(model: T, step: string, error: any) {
//     let neoTask = NeoTask.makeNeoTask(model)

//     neoTask.status = NeoTaskStatus.failure
//     neoTask.fatal = {
//       step: step,
//       error: error
//     }

//     await model.reference.update({ neoTask: neoTask.rawValue() })
//     await Failure.setFailure(model, neoTask)

//     model.neoTask = neoTask.rawValue()

//     return model
//   }

//   static async setSuccess<T extends HasNeoTask>(model: T) {
//     let neoTask = new NeoTask()
//     neoTask.status = NeoTaskStatus.success

//     await model.reference.update({ neoTask: neoTask.rawValue() })
//     await Failure.deleteFailure(model)

//     model.neoTask = neoTask.rawValue()

//     return model
//   }
// }
