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
let _firestore;
exports.initialize = (firestore) => {
    _firestore = firestore;
};
var Status;
(function (Status) {
    Status["OK"] = "OK";
    Status["BadRequest"] = "BadRequest";
    Status["InternalError"] = "InternalError";
})(Status = exports.Status || (exports.Status = {}));
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
            yield this.reference.update({ result: result });
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
            yield this.reference.update({ result: result });
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
