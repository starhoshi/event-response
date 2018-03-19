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

  private async updateWithBatch(status: Status, batch: FirebaseFirestore.WriteBatch, id?: string, message?: string) {
    const result = this.makeResult(status, id, message)
    batch.update(this.reference, result)
    return result
  }

  private async update(status: Status, id?: string, message?: string) {
    const result = this.makeResult(status, id, message)
    await this.reference.update({ result: result })
    return result
  }

  private async updateOrBatch(status: Status, batch?: FirebaseFirestore.WriteBatch, id?: string, message?: string) {
    if (batch) {
      return this.updateWithBatch(status, batch, id, message)
    } else {
      return this.update(status, id, message)
    }
  }

  async setOK(id?: string): Promise<IResult>
  async setOK(id: string, message?: string, batch?: FirebaseFirestore.WriteBatch): Promise<IResult> {
    return this.updateOrBatch(Status.OK, batch, id, message)
  }

  async setBadRequest(id: string, message?: string): Promise<IResult>
  async setBadRequest(id: string, message?: string, batch?: FirebaseFirestore.WriteBatch): Promise<IResult> {
    return this.updateOrBatch(Status.BadRequest, batch, id, message)
  }

  async setInternalError(id: string, message?: string): Promise<IResult>
  async setInternalError(id: string, message?: string, batch?: FirebaseFirestore.WriteBatch): Promise<IResult> {
    return this.updateOrBatch(Status.InternalError, batch, id, message)
  }
}
