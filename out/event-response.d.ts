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
    error?: any;
}
export declare class Result {
    reference: FirebaseFirestore.DocumentReference;
    constructor(reference: FirebaseFirestore.DocumentReference);
    private makeResult(status);
    setOK(id?: string): Promise<IResult>;
    private setError(status, id, error?);
    setBadRequest(id: string, error?: any): Promise<IResult>;
    setInternalError(id: string, error?: any): Promise<IResult>;
}
