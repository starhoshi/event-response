"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// import * as functions from 'firebase-functions'
const FirebaseFirestore = require("@google-cloud/firestore");
// import { DeltaDocumentSnapshot } from 'firebase-functions/lib/providers/firestore'
let _firestore;
let collectionPath;
exports.initialize = (firestore) => {
    _firestore = firestore;
};
exports.configure = (options) => {
    collectionPath = options.collectionPath;
};
var Status;
(function (Status) {
    Status["OK"] = "OK";
    Status["BadRequest"] = "BadRequest";
    Status["InternalError"] = "InternalError";
})(Status = exports.Status || (exports.Status = {}));
class Failure {
    makeQuerySnapshot(refPath) {
        return _firestore.collection(collectionPath)
            .where('refPath', '==', refPath)
            .get();
    }
    makeError(result) {
        return {
            result: result,
            createdAt: new Date()
        };
    }
    add(result) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionPath) {
                return;
            }
            const querySnapshot = yield this.makeQuerySnapshot(this.reference.path);
            if (querySnapshot.docs.length === 0) {
                const failureRef = _firestore.collection(collectionPath);
                const failure = {
                    errors: [this.makeError(result)],
                    createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
                    // reference: this.reference,
                    refPath: this.reference.path
                };
                return failureRef.add(failure);
            }
            else {
                const failure = querySnapshot.docs[0].data();
                failure.errors.push(this.makeError(result));
                return querySnapshot.docs[0].ref.update(failure);
            }
        });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionPath) {
                return;
            }
            const querySnapshot = yield this.makeQuerySnapshot(this.reference.path);
            return Promise.all(querySnapshot.docs.map(doc => {
                return doc.ref.delete();
            }));
        });
    }
    constructor(reference) {
        this.reference = reference;
    }
}
exports.Failure = Failure;
class Result {
    constructor(reference) {
        this.reference = reference;
    }
    makeResult(status) {
        return { status: status };
    }
    setOK(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.makeResult(Status.OK);
            if (id) {
                result.id = id;
            }
            yield Promise.all([
                this.reference.update({ result: result }),
                new Failure(this.reference).clear()
            ]);
            return result;
        });
    }
    setError(status, id, error) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.makeResult(status);
            result.id = id;
            if (error) {
                result.error = error;
            }
            if (status === Status.BadRequest) {
                yield Promise.all([
                    this.reference.update({ result: result })
                ]);
            }
            else {
                yield Promise.all([
                    this.reference.update({ result: result }),
                    new Failure(this.reference).add(result)
                ]);
            }
            return result;
        });
    }
    setBadRequest(id, error) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setError(Status.BadRequest, id, error);
        });
    }
    setInternalError(id, error) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.setError(Status.InternalError, id, error);
        });
    }
}
exports.Result = Result;
