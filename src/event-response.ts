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

  private makeResult(status: Status, id?: string, message?: string): IResult {
    const result: IResult = { status: status }
    if (id) {
      result.id = id
    }
    if (message) {
      result.message = message
    }

    return result
  }

  private updateWithBatch(status: Status, batch: FirebaseFirestore.WriteBatch, id?: string, message?: string) {
    const result = this.makeResult(status, id, message)
    batch.update(this.reference, { result: result })
    return result
  }

  private async update(status: Status, id?: string, message?: string) {
    const result = this.makeResult(status, id, message)
    await this.reference.update({ result: result })
    return result
  }

  setOK(id?: string) {
    return this.update(Status.OK, id)
  }

  setOKWithBatch(batch: FirebaseFirestore.WriteBatch, id?: string) {
    return this.updateWithBatch(Status.OK, batch, id)
  }

  setBadRequest(id: string, message?: string) {
    return this.update(Status.BadRequest, id, message)
  }

  setBadRequestWithBatch(batch: FirebaseFirestore.WriteBatch, id: string, message?: string) {
    return this.updateWithBatch(Status.BadRequest, batch, id, message)
  }

  setInternalError(id: string, message?: string) {
    return this.update(Status.InternalError, id, message)
  }

  setInternalErrorWithBatch(batch: FirebaseFirestore.WriteBatch, id: string, message?: string) {
    return this.updateWithBatch(Status.InternalError, batch, id, message)
  }
}
