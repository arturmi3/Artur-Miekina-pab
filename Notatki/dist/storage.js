"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Storage = void 0;
const fs = require("fs");
class Storage {
    constructor(notesFile, usersFile) {
        this.notesFile = notesFile;
        this.usersFile = usersFile;
    }
    readNotes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let s = yield fs.promises.readFile(this.notesFile, "utf-8");
                return JSON.parse(s);
            }
            catch (err) {
                if (err.code === 'ENOENT')
                    return [];
                console.log(err);
            }
        });
    }
    updateNotes(dataToSave) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.promises.writeFile(this.notesFile, JSON.stringify(dataToSave));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
    readUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let s = yield fs.promises.readFile(this.usersFile, "utf-8");
                return JSON.parse(s);
            }
            catch (err) {
                if (err.code === 'ENOENT')
                    return [];
                console.log(err);
            }
        });
    }
    updateUsers(dataToSave) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield fs.promises.writeFile(this.usersFile, JSON.stringify(dataToSave));
            }
            catch (err) {
                console.log(err);
            }
        });
    }
}
exports.Storage = Storage;
