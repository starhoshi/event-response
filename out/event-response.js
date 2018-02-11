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
const FirebaseFirestore = require("@google-cloud/firestore");
let _firestore;
let collectionPath;
exports.initialize = (adminOptions) => {
    _firestore = new FirebaseFirestore.Firestore(adminOptions);
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
    makeError(response) {
        return {
            response: response,
            createdAt: new Date()
        };
    }
    add(response) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!collectionPath) {
                return;
            }
            const querySnapshot = yield this.makeQuerySnapshot(this.reference.path);
            if (querySnapshot.docs.length === 0) {
                const failureRef = _firestore.collection(collectionPath);
                const failure = {
                    errors: [this.makeError(response)],
                    createdAt: FirebaseFirestore.FieldValue.serverTimestamp(),
                    // reference: this.reference,
                    refPath: this.reference.path
                };
                return failureRef.add(failure);
            }
            else {
                const failure = querySnapshot.docs[0].data();
                failure.errors.push(this.makeError(response));
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
class Response {
    constructor(reference) {
        this.reference = reference;
    }
    makeResponse(status) {
        return { status: status };
    }
    setOK(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = this.makeResponse(Status.OK);
            if (id) {
                response.id = id;
            }
            yield Promise.all([
                this.reference.update({ response: response }),
                new Failure(this.reference).clear()
            ]);
            return response;
        });
    }
    setError(status, id, error) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = this.makeResponse(status);
            response.id = id;
            if (error) {
                response.error = error;
            }
            yield Promise.all([
                this.reference.update({ response: response }),
                new Failure(this.reference).add(response)
            ]);
            return response;
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
exports.Response = Response;
