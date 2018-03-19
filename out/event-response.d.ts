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
    private updateOrBatch(status, batch?, id?, message?);
    setOK(id?: string): Promise<IResult>;
    setBadRequest(id: string, message?: string): Promise<IResult>;
    setInternalError(id: string, message?: string): Promise<IResult>;
}
