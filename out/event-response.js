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
        const result = this.makeResult(status, id, message);
        batch.update(this.reference, { result: result });
        return result;
    }
    update(status, id, message) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = this.makeResult(status, id, message);
            yield this.reference.update({ result: result });
            return result;
        });
    }
    setOK(id) {
        return this.update(Status.OK, id);
    }
    setOKWithBatch(batch, id) {
        return this.updateWithBatch(Status.OK, batch, id);
    }
    setBadRequest(id, message) {
        return this.update(Status.BadRequest, id, message);
    }
    setBadRequestWithBatch(batch, id, message) {
        return this.updateWithBatch(Status.BadRequest, batch, id, message);
    }
    setInternalError(id, message) {
        return this.update(Status.InternalError, id, message);
    }
    setInternalErrorWithBatch(batch, id, message) {
        return this.updateWithBatch(Status.InternalError, batch, id, message);
    }
}
exports.Result = Result;
