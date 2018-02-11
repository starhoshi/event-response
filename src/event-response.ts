import * as functions from 'firebase-functions'
import * as FirebaseFirestore from '@google-cloud/firestore'
import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import * as admin from 'firebase-admin'
// import { Pring, property } from 'pring'
import { FieldValue } from '@google-cloud/firestore'

let firestore: FirebaseFirestore.Firestore
let _isSetFailure: boolean

export function initialize(adminOptions: any, isSetFailure: boolean = false) {
  firestore = new FirebaseFirestore.Firestore(adminOptions)
  _isSetFailure = isSetFailure
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

    await this.reference.update({ response: response })

    return response
  }

  async setBadRequest(id: string, errors?: [{ [key: string]: any }]) {
    const response = this.makeResponse(Status.BadRequest)
    response.id = id
    if (errors) {
      response.errors = errors
    }

    await this.reference.update({ response: response })

    return response
  }

  async setInternalError(id: string, errors?: [{ [key: string]: any }]) {
    const response = this.makeResponse(Status.InternalError)
    response.id = id
    if (errors) {
      response.errors = errors
    }

    await this.reference.update({ response: response })

    return response
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
