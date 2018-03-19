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
    makeResult(status, id, message) {
        const result = { status: status };
        if (id) {
            result.id = id;
        }
        if (message) {
            result.message = message;
        }
        return result;
    }
    updateWithBatch(status, batch, id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.makeResult(status, id, message);
            batch.update(this.reference, result);
            return result;
        });
    }
    update(status, id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.makeResult(status, id, message);
            yield this.reference.update({ result: result });
            return result;
        });
    }
    updateOrBatch(status, batch, id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            if (batch) {
                return this.updateWithBatch(status, batch, id, message);
            }
            else {
                return this.update(status, id, message);
            }
        });
    }
    setOK(id, message, batch) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateOrBatch(Status.OK, batch, id, message);
        });
    }
    setBadRequest(id, message, batch) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateOrBatch(Status.BadRequest, batch, id, message);
        });
    }
    setInternalError(id, message, batch) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.updateOrBatch(Status.InternalError, batch, id, message);
        });
    }
}
exports.Result = Result;
