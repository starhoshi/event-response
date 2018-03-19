import * as FirebaseFirestore from '@google-cloud/firestore';
export declare const initialize: (firestore: FirebaseFirestore.Firestore) => void;
export declare enum Status {
    OK = "OK",
    BadRequest = "BadRequest",
    InternalError = "InternalError",
}
export interface IResult {
    status: Status;
    id?: string;
    message?: string;
}
export declare class Result {
    reference: FirebaseFirestore.DocumentReference;
    constructor(reference: FirebaseFirestore.DocumentReference);
    private makeResult(status, id?, message?);
    private updateWithBatch(status, batch, id?, message?);
    private update(status, id?, message?);
    setOK(id?: string): Promise<IResult>;
    setOKWithBatch(batch: FirebaseFirestore.WriteBatch, id?: string): IResult;
    setBadRequest(id: string, message?: string): Promise<IResult>;
    setBadRequestWithBatch(batch: FirebaseFirestore.WriteBatch, id: string, message?: string): IResult;
    setInternalError(id: string, message?: string): Promise<IResult>;
    setInternalErrorWithBatch(batch: FirebaseFirestore.WriteBatch, id: string, message?: string): IResult;
}
