import * as FirebaseFirestore from '@google-cloud/firestore';
export declare const initialize: (adminOptions: any) => void;
export declare const configure: (options: {
    collectionPath?: string | undefined;
}) => void;
export declare enum Status {
    OK = "OK",
    BadRequest = "BadRequest",
    InternalError = "InternalError",
}
export interface IResponse {
    status: Status;
    id?: string;
    error?: any;
}
export interface IFailure {
    errors: {
        response: IResponse;
        createdAt: FirebaseFirestore.FieldValue;
    }[];
    refPath: string;
    createdAt: FirebaseFirestore.FieldValue;
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
    private setError(status, id, error?);
    setBadRequest(id: string, error?: any): Promise<IResponse>;
    setInternalError(id: string, error?: any): Promise<IResponse>;
}
