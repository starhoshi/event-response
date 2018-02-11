import * as FirebaseFirestore from '@google-cloud/firestore';
export interface FailureOptions {
    collectionPath: string;
}
export declare function initialize(adminOptions: any, failureOptions?: FailureOptions): void;
export declare enum Status {
    OK = 200,
    BadRequest = 400,
    InternalError = 500,
}
export interface IResponse {
    status: Status;
    id?: string;
    errors?: any[];
}
export declare class Failure {
    reference: FirebaseFirestore.DocumentReference;
    private makeQuerySnapshot(refPath);
    private makeError(response);
    add(response: IResponse): Promise<FirebaseFirestore.DocumentReference | FirebaseFirestore.WriteResult | undefined>;
    clear(): Promise<FirebaseFirestore.WriteResult[] | undefined>;
    constructor(reference: FirebaseFirestore.DocumentReference);
}
export declare class Response {
    reference: FirebaseFirestore.DocumentReference;
    constructor(reference: FirebaseFirestore.DocumentReference);
    private makeResponse(status);
    setOK(id?: string): Promise<IResponse>;
    private setError(status, id, errors?);
    setBadRequest(id: string, errors?: [{
        [key: string]: any;
    }]): Promise<IResponse>;
    setInternalError(id: string, errors?: [{
        [key: string]: any;
    }]): Promise<IResponse>;
}
