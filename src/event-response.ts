// import * as functions from 'firebase-functions'
import * as FirebaseFirestore from '@google-cloud/firestore'
// import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'

let _firestore: FirebaseFirestore.Firestore
let collectionPath: string | undefined

export const initialize = (firestore: FirebaseFirestore.Firestore) => {
  _firestore = firestore
}

export const configure = (options: { collectionPath?: string }) => {
  collectionPath = options.collectionPath
}

export enum Status {
  OK = 'OK',
  BadRequest = 'BadRequest',
  InternalError = 'InternalError'
}

export interface IResult {
  status: Status
  id?: string
  error?: any
}

export interface IFailure {
  errors: {
    result: IResult,
    createdAt: Date
  }[],
  refPath: string,
  // reference: FirebaseFirestore.DocumentReference,
  createdAt: FirebaseFirestore.FieldValue
}

export class Failure {
  reference: FirebaseFirestore.DocumentReference

  private makeQuerySnapshot(refPath: string) {
    return _firestore.collection(collectionPath!)
      .where('refPath', '==', refPath)
      .get()
  }

  private makeError(result: IResult) {
    return {
      result: result,
      createdAt: new Date()
    }
  }

  async add(result: IResult) {
    if (!collectionPath) {
      return
    }

    const querySnapshot = await this.makeQuerySnapshot(this.reference.path)

    if (querySnapshot.docs.length === 0) {
      const failureRef = _firestore.collection(collectionPath)
      const failure: IFailure = {
        errors: [this.makeError(result)],
        createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
        // reference: this.reference,
        refPath: this.reference.path
      }
      return failureRef.add(failure)
    } else {
      const failure = querySnapshot.docs[0].data() as IFailure
      failure.errors.push(this.makeError(result))

      return querySnapshot.docs[0].ref.update(failure)
    }
  }

  async clear() {
    if (!collectionPath) {
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

export class Result {
  reference: FirebaseFirestore.DocumentReference

  constructor(reference: FirebaseFirestore.DocumentReference) {
    this.reference = reference
  }

  private makeResult(status: Status): IResult {
    return { status: status }
  }

  async setOK(id?: string) {
    const result = this.makeResult(Status.OK)
    if (id) {
      result.id = id
    }

    await Promise.all([
      this.reference.update({ result: result }),
      new Failure(this.reference).clear()
    ])

    return result
  }

  private async setError(status: Status, id: string, error?: any) {
    const result = this.makeResult(status)
    result.id = id
    if (error) {
      result.error = error
    }

    if (status === Status.BadRequest) {
      await Promise.all([
        this.reference.update({ result: result })
      ])
    } else {
      await Promise.all([
        this.reference.update({ result: result }),
        new Failure(this.reference).add(result)
      ])
    }

    return result
  }

  async setBadRequest(id: string, error?: any) {
    return this.setError(Status.BadRequest, id, error)
  }

  async setInternalError(id: string, error?: any) {
    return this.setError(Status.InternalError, id, error)
  }
}
