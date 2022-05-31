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
exports.MongoStorage = void 0;
const mongoDB = require("mongodb");
class MongoStorage {
    constructor(url, dbName) {
        this._url = url;
        this._dbName = dbName;
    }
    readNotes() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("readNotes");
            // url to then server
            const client = new mongoDB.MongoClient(this._url);
            try {
                yield client.connect();
                const db = client.db(this._dbName);
                let collection = db.collection(MongoStorage.collNotes);
                let cursor = collection.find();
                let result = yield cursor.toArray();
                cursor.close();
                return result;
            }
            catch (err) {
                console.log(err);
                throw (err);
            }
            finally {
                yield client.close();
            }
        });
    }
    updateNotes(dataToSave) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("updateStorage");
            // url to then server
            const client = new mongoDB.MongoClient(this._url);
            try {
                yield client.connect();
                const db = client.db(this._dbName);
                let collection = db.collection(MongoStorage.collNotes);
                // To delete all documents in a collection, pass in an empty document ({ }).
                yield collection.deleteMany({});
                if (dataToSave.length > 0)
                    yield collection.insertMany(dataToSave);
            }
            catch (err) {
                console.log(err);
                throw (err);
            }
            finally {
                yield client.close();
            }
        });
    }
    readUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("readUsers");
            // url to then server
            const client = new mongoDB.MongoClient(this._url);
            try {
                yield client.connect();
                const db = client.db(this._dbName);
                let collection = db.collection(MongoStorage.collUsers);
                let cursor = collection.find();
                let result = yield cursor.toArray();
                cursor.close();
                return result;
            }
            catch (err) {
                console.log(err);
                throw (err);
            }
            finally {
                yield client.close();
            }
        });
    }
    updateUsers(dataToSave) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("updateUsers");
            // url to then server
            const client = new mongoDB.MongoClient(this._url);
            try {
                yield client.connect();
                const db = client.db(this._dbName);
                let collection = db.collection(MongoStorage.collUsers);
                // To delete all documents in a collection, pass in an empty document ({ }).
                yield collection.deleteMany({});
                if (dataToSave.length > 0)
                    yield collection.insertMany(dataToSave);
            }
            catch (err) {
                console.log(err);
                throw (err);
            }
            finally {
                yield client.close();
            }
        });
    }
}
exports.MongoStorage = MongoStorage;
MongoStorage.collNotes = "notes";
MongoStorage.collUsers = "users";
