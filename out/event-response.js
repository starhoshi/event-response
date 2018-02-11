"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
const pring_1 = require("pring");
var firestore;
function initialize(options) {
    firestore = new FirebaseFirestore.Firestore(options);
    pring_1.Pring.initialize(options);
}
exports.initialize = initialize;
class ValidationError extends Error {
    constructor(validationErrorType, reason) {
        super();
        this.validationErrorType = validationErrorType;
        this.reason = reason;
    }
}
exports.ValidationError = ValidationError;
class Failure extends pring_1.Pring.Base {
    static querySnapshot(refPath) {
        return firestore.collection('version/1/failure')
            .where('refPath', '==', refPath)
            .get();
    }
    static setFailure(model, neoTask) {
        return __awaiter(this, void 0, void 0, function* () {
            const querySnapshot = yield Failure.querySnapshot(model.reference.path);
            if (querySnapshot.docs.length === 0) {
                const failure = new Failure();
                // FIXME: Error: Cannot encode type ([object Object])
                // failure.ref = documentSnapshot.ref
                failure.refPath = model.reference.path;
                failure.neoTask = neoTask.rawValue();
                return failure.save();
            }
            else {
                const failure = new Failure();
                failure.init(querySnapshot.docs[0]);
                // FIXME: Error: Cannot encode type ([object Object])
                // failure.ref = documentSnapshot.ref
                failure.refPath = model.reference.path;
                failure.neoTask = neoTask.rawValue();
                return failure.update();
            }
        });
    }
    static deleteFailure(model) {
        return __awaiter(this, void 0, void 0, function* () {
            const querySnapshot = yield Failure.querySnapshot(model.reference.path);
            for (const doc of querySnapshot.docs) {
                const failure = new Failure();
                failure.init(doc);
                yield failure.delete();
            }
        });
    }
}
__decorate([
    pring_1.property
], Failure.prototype, "ref", void 0);
__decorate([
    pring_1.property
], Failure.prototype, "refPath", void 0);
__decorate([
    pring_1.property
], Failure.prototype, "neoTask", void 0);
exports.Failure = Failure;
var NeoTaskStatus;
(function (NeoTaskStatus) {
    NeoTaskStatus[NeoTaskStatus["none"] = 0] = "none";
    NeoTaskStatus[NeoTaskStatus["success"] = 1] = "success";
    NeoTaskStatus[NeoTaskStatus["failure"] = 2] = "failure";
})(NeoTaskStatus = exports.NeoTaskStatus || (exports.NeoTaskStatus = {}));
class NeoTask extends pring_1.Pring.Base {
    static makeNeoTask(model) {
        let neoTask = new NeoTask();
        if (model.neoTask) {
            if (model.neoTask.status) {
                neoTask.status = model.neoTask.status;
            }
            if (model.neoTask.invalid) {
                neoTask.invalid = model.neoTask.invalid;
            }
            if (model.neoTask.fatal) {
                neoTask.fatal = model.neoTask.fatal;
            }
        }
        return neoTask;
    }
    static setInvalid(model, error) {
        return __awaiter(this, void 0, void 0, function* () {
            let neoTask = NeoTask.makeNeoTask(model);
            neoTask.status = NeoTaskStatus.failure;
            neoTask.invalid = {
                validationError: error.validationErrorType,
                reason: error.reason
            };
            yield model.reference.update({ neoTask: neoTask.rawValue() });
            model.neoTask = neoTask.rawValue();
            return model;
        });
    }
    static setFatal(model, step, error) {
        return __awaiter(this, void 0, void 0, function* () {
            let neoTask = NeoTask.makeNeoTask(model);
            neoTask.status = NeoTaskStatus.failure;
            neoTask.fatal = {
                step: step,
                error: error
            };
            yield model.reference.update({ neoTask: neoTask.rawValue() });
            yield Failure.setFailure(model, neoTask);
            model.neoTask = neoTask.rawValue();
            return model;
        });
    }
    static setSuccess(model) {
        return __awaiter(this, void 0, void 0, function* () {
            let neoTask = new NeoTask();
            neoTask.status = NeoTaskStatus.success;
            yield model.reference.update({ neoTask: neoTask.rawValue() });
            yield Failure.deleteFailure(model);
            model.neoTask = neoTask.rawValue();
            return model;
        });
    }
}
__decorate([
    pring_1.property
], NeoTask.prototype, "status", void 0);
__decorate([
    pring_1.property
], NeoTask.prototype, "invalid", void 0);
__decorate([
    pring_1.property
], NeoTask.prototype, "fatal", void 0);
exports.NeoTask = NeoTask;
