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
let _failureOptions;
function initialize(adminOptions, failureOptions) {
    _firestore = new FirebaseFirestore.Firestore(adminOptions);
    _failureOptions = failureOptions;
    // Pring.initialize(options)
}
exports.initialize = initialize;
var Status;
(function (Status) {
    Status["OK"] = "OK";
    Status["BadRequest"] = "BadRequest";
    Status["InternalError"] = "InternalError";
})(Status = exports.Status || (exports.Status = {}));
class Failure {
    makeQuerySnapshot(refPath) {
        return _firestore.collection(_failureOptions.collectionPath)
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
            if (!_failureOptions) {
                return;
            }
            const querySnapshot = yield this.makeQuerySnapshot(this.reference.path);
            if (querySnapshot.docs.length === 0) {
                const failureRef = _firestore.collection(_failureOptions.collectionPath);
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
            if (!_failureOptions) {
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
// export class ValidationError extends Error {
//   validationErrorType: string
//   reason: string
//   option?: any
//   constructor(validationErrorType: string, reason: string) {
//     super()
//     this.validationErrorType = validationErrorType
//     this.reason = reason
//   }
// }
// export class Failure<T extends HasNeoTask> extends Pring.Base {
//   @property ref: FirebaseFirestore.DocumentReference
//   @property refPath: string
//   @property neoTask: NeoTask
//   static querySnapshot(refPath: string) {
//     return firestore.collection('version/1/failure')
//       .where('refPath', '==', refPath)
//       .get()
//   }
//   static async setFailure<T extends HasNeoTask>(model: T, neoTask: NeoTask) {
//     const querySnapshot = await Failure.querySnapshot(model.reference.path)
//     if (querySnapshot.docs.length === 0) {
//       const failure = new Failure()
//       // FIXME: Error: Cannot encode type ([object Object])
//       // failure.ref = documentSnapshot.ref
//       failure.refPath = model.reference.path
//       failure.neoTask = neoTask.rawValue()
//       return failure.save()
//     } else {
//       const failure = new Failure()
//       failure.init(querySnapshot.docs[0])
//       // FIXME: Error: Cannot encode type ([object Object])
//       // failure.ref = documentSnapshot.ref
//       failure.refPath = model.reference.path
//       failure.neoTask = neoTask.rawValue()
//       return failure.update()
//     }
//   }
//   static async deleteFailure<T extends HasNeoTask>(model: T) {
//     const querySnapshot = await Failure.querySnapshot(model.reference.path)
//     for (const doc of querySnapshot.docs) {
//       const failure = new Failure()
//       failure.init(doc)
//       await failure.delete()
//     }
//   }
// }
// export enum NeoTaskStatus {
//   none = 0,
//   success = 1,
//   failure = 2
// }
// export interface HasNeoTask extends Pring.Base {
//   neoTask?: NeoTask
// }
// export class NeoTask extends Pring.Base {
//   @property status?: NeoTaskStatus
//   @property invalid?: { validationError: string, reason: string }
//   @property fatal?: { step: string, error: string }
//   static makeNeoTask<T extends HasNeoTask>(model: T) {
//     let neoTask = new NeoTask()
//     if (model.neoTask) {
//       if (model.neoTask.status) { neoTask.status = model.neoTask.status }
//       if (model.neoTask.invalid) { neoTask.invalid = model.neoTask.invalid }
//       if (model.neoTask.fatal) { neoTask.fatal = model.neoTask.fatal }
//     }
//     return neoTask
//   }
//   static async setInvalid<T extends HasNeoTask>(model: T, error: ValidationError) {
//     let neoTask = NeoTask.makeNeoTask(model)
//     neoTask.status = NeoTaskStatus.failure
//     neoTask.invalid = {
//       validationError: error.validationErrorType,
//       reason: error.reason
//     }
//     await model.reference.update({ neoTask: neoTask.rawValue() })
//     model.neoTask = neoTask.rawValue()
//     return model
//   }
//   static async setFatal<T extends HasNeoTask>(model: T, step: string, error: any) {
//     let neoTask = NeoTask.makeNeoTask(model)
//     neoTask.status = NeoTaskStatus.failure
//     neoTask.fatal = {
//       step: step,
//       error: error
//     }
//     await model.reference.update({ neoTask: neoTask.rawValue() })
//     await Failure.setFailure(model, neoTask)
//     model.neoTask = neoTask.rawValue()
//     return model
//   }
//   static async setSuccess<T extends HasNeoTask>(model: T) {
//     let neoTask = new NeoTask()
//     neoTask.status = NeoTaskStatus.success
//     await model.reference.update({ neoTask: neoTask.rawValue() })
//     await Failure.deleteFailure(model)
//     model.neoTask = neoTask.rawValue()
//     return model
//   }
// }
