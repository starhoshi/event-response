import * as functions from 'firebase-functions'
import * as FirebaseFirestore from '@google-cloud/firestore'
import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
import * as admin from 'firebase-admin'
import { FieldValue } from '@google-cloud/firestore'

let _firestore: FirebaseFirestore.Firestore
let collectionPath: string | undefined

export const initialize = (adminOptions: any) => {
  _firestore = new FirebaseFirestore.Firestore(adminOptions)
}

export const configure = (options: { collectionPath?: string }) => {
  collectionPath = options.collectionPath
}

export enum Status {
  OK = 'OK',
  BadRequest = 'BadRequest',
  InternalError = 'InternalError'
}

export interface IResponse {
  status: Status
  id?: string
  error?: any
}

export interface IFailure {
  errors: {
    response: IResponse,
    createdAt: FirebaseFirestore.FieldValue
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

  private makeError(response: IResponse) {
    return {
      response: response,
      createdAt: new Date().toUTCString()
    }
  }

  async add(response: IResponse) {
    if (!collectionPath) {
      return
    }

    const querySnapshot = await this.makeQuerySnapshot(this.reference.path)

    if (querySnapshot.docs.length === 0) {
      const failureRef = _firestore.collection(collectionPath)
      const failure: IFailure = {
        errors: [this.makeError(response)],
        createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
        // reference: this.reference,
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

  private async setError(status: Status, id: string, error?: any) {
    const response = this.makeResponse(status)
    response.id = id
    if (error) {
      response.error = error
    }

    await Promise.all([
      this.reference.update({ response: response }),
      new Failure(this.reference).add(response)
    ])

    return response
  }

  async setBadRequest(id: string, error?: any) {
    return this.setError(Status.BadRequest, id, error)
  }

  async setInternalError(id: string, error?: any) {
    return this.setError(Status.InternalError, id, error)
  }
}
