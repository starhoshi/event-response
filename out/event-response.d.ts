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
export interface IResult {
    status: Status;
    id?: string;
    error?: any;
}
export interface IFailure {
    errors: {
        result: IResult;
        createdAt: Date;
    }[];
    refPath: string;
    createdAt: FirebaseFirestore.FieldValue;
}
export declare class Failure {
    reference: FirebaseFirestore.DocumentReference;
    private makeQuerySnapshot(refPath);
    private makeError(result);
    add(result: IResult): Promise<FirebaseFirestore.DocumentReference | FirebaseFirestore.WriteResult | undefined>;
    clear(): Promise<FirebaseFirestore.WriteResult[] | undefined>;
    constructor(reference: FirebaseFirestore.DocumentReference);
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
