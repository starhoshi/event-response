import * as FirebaseFirestore from '@google-cloud/firestore'

let _firestore: FirebaseFirestore.Firestore

export const initialize = (firestore: FirebaseFirestore.Firestore) => {
  _firestore = firestore
}

export enum Status {
  OK = 'OK',
  BadRequest = 'BadRequest',
  InternalError = 'InternalError'
}

export interface IResult {
  status: Status
  id?: string
  message?: string
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

    await this.reference.update({ result: result })

    return result
  }

  private async setError(status: Status, id: string, message?: string) {
    const result = this.makeResult(status)
    result.id = id
    if (message) {
      result.message = message
    }

    await this.reference.update({ result: result })

    return result
  }

  async setBadRequest(id: string, message?: string) {
    return this.setError(Status.BadRequest, id, message)
  }

  async setInternalError(id: string, message?: string) {
    return this.setError(Status.InternalError, id, message)
  }
}
