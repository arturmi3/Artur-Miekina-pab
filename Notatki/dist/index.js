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
const express = require("express");
const jsonwebtoken = require("jsonwebtoken");
const Note_1 = require("./Note");
const User_1 = require("./User");
const storage_1 = require("./storage");
const MongoStorage_1 = require("./MongoStorage");
const config_1 = require("./config");
const app = express();
app.use(express.json());
let storage;
if (config_1.default.storageMongo) {
    storage = new MongoStorage_1.MongoStorage(config_1.default.mongoUrl, config_1.default.mongoDbName);
}
else {
    storage = new storage_1.Storage(config_1.default.notesFile, config_1.default.usersFile);
}
class UserLogin {
}
class ValidToken {
}
let validTokens = [];
function parseBoolean(value) {
    value = value === null || value === void 0 ? void 0 : value.toString().toLowerCase();
    return value === "true" || value === "1";
}
function isAdmin(login, password) {
    // uproszczenie
    return login === config_1.default.adminLogin && password === config_1.default.adminPassword;
}
function VerifyJwt(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let jwtToken = req.headers.authorization;
        // verify request has token
        if (!jwtToken) {
            return res.status(401).json({ error: "Invalid token" });
        }
        // remove Bearer if using Bearer Authorization mechanism
        if (jwtToken.toLowerCase().startsWith("bearer")) {
            jwtToken = jwtToken.slice("bearer".length).trim();
        }
        const payload = jsonwebtoken.verify(jwtToken, "secretKey");
        console.log(payload);
        if (!payload) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const foundToken = validTokens.find((x) => x.token === jwtToken);
        if (foundToken === undefined)
            return res.status(401).json({ error: "Invalid authorization" });
        // zapamiętanie w res loginu i isAdmin  --- dostęp w następnych funkcjach
        res.locals.loggedInAs = foundToken.login;
        res.locals.isAdmin = foundToken.isAdmin;
        next();
    });
}
app.post("/login", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(req.body.login);
        console.log(req.body.password);
        if (!req.body.login) {
            return res.status(401).json({ error: "Nieprawidłowy login" });
        }
        if (!req.body.password) {
            return res.status(401).json({ error: "Nieprawidłowe hasło" });
        }
        let validToken = undefined;
        // musi być admin, albo zdefiniowany user
        if (isAdmin(req.body.login, req.body.password)) {
            validToken = {
                login: req.body.login,
                issuedAtTime: Date.now(),
                isAdmin: true,
                token: "",
            };
        }
        else {
            // czy zdefiniowany user
            let users = yield storage.readUsers();
            let foundUser = users.find((x) => x.login.toLowerCase() === req.body.login.toLowerCase());
            if (foundUser !== undefined) {
                if (foundUser.password === req.body.password) {
                    validToken = {
                        login: req.body.login,
                        issuedAtTime: Date.now(),
                        isAdmin: isAdmin(foundUser.login, foundUser.password),
                        token: "",
                    };
                }
            }
        }
        if (validToken === undefined) {
            return res.status(401).json({ error: "Nieprawidłowy login lub hasło" });
        }
        // payload do odesłania JWT
        let payload = {
            loggedInAs: validToken.login,
            issuedAtTime: validToken.issuedAtTime,
        };
        // generowanie tokena
        validToken.token = jsonwebtoken.sign(payload, "secretKey");
        // zapamiętanie tokenów w sesji
        validTokens.push(validToken);
        return res.status(200).json({ token: validToken.token });
    });
});
app.post("/note", VerifyJwt, function (req, res) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        let data = new Note_1.NoteRec();
        data.id = Date.now();
        data.login = res.locals.loggedInAs;
        data.title = req.body.title;
        data.content = req.body.content;
        data.tags = req.body.tags;
        data.createDate = (_a = req.body.createDate) !== null && _a !== void 0 ? _a : data.id;
        data.public = parseBoolean(req.body.public); // koszmarek
        let notes = yield storage.readNotes();
        notes.push(data);
        yield storage.updateNotes(notes);
        return res.status(200).json(data);
    });
});
app.get("/note/:id", VerifyJwt, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let notes = yield storage.readNotes();
        let foundNote = notes.find((e) => e.id == Number.parseInt(req.params.id) &&
            e.login.toUpperCase() === res.locals.loggedInAs.toUpperCase());
        if (foundNote === undefined) {
            return res.status(404);
        }
        else {
            let note = {
                title: foundNote.title,
                content: foundNote.content,
                createDate: foundNote.createDate,
                tags: foundNote.tags,
                public: foundNote.public,
            };
            return res.status(200).json(note);
        }
    });
});
app.get("/notes/user/:userName", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let notes = yield storage.readNotes();
        let foundNotes = notes
            .filter((e) => e.public &&
            e.login.toUpperCase() === req.params.userName.toUpperCase())
            .map((v) => {
            let note = {
                title: v.title,
                content: v.content,
                createDate: v.createDate,
                tags: v.tags,
                public: v.public,
            };
            return note;
        });
        console.log("--------------------------------");
        console.log(JSON.stringify(foundNotes));
        console.log("--------------------------------");
        return res.status(200).json(foundNotes);
    });
});
app.post("/user", function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = new User_1.UserRec();
        data.id = Date.now();
        data.login = req.body.login;
        data.password = req.body.password;
        let users = yield storage.readUsers();
        let foundUser = users.find((x) => x.login.toLowerCase() === req.body.login.toLowerCase());
        if (foundUser !== undefined) {
            return res.status(401).json({ error: "User already exists" });
        }
        users.push(data);
        yield storage.updateUsers(users);
        return res.status(200).json(data);
    });
});
// pobrać dane użytkownika może użytkownik (własne konto) i admin (wszystkie konta)
app.get("/user/:id", VerifyJwt, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id_ = Number.parseInt(req.params.id);
        let users = yield storage.readUsers();
        let foundUser = users.find((x) => x.id == id_);
        if (foundUser == undefined) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!res.locals.isAdmin && res.locals.loggedInAs.toLowerCase() !== foundUser.login.toLowerCase()) {
            return res
                .status(403)
                .json({
                error: "The client does not have access rights to the content",
            });
        }
        return res.status(200).json(foundUser);
    });
});
// edycji może dokonać zalogowany użytkownik (tylko swoje konto) oraz admin (wszystkie konta --- na razie admin jest tylko jeden)
app.put("/user/:id", VerifyJwt, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id_ = Number.parseInt(req.route.keys["id"]); // dla put req.params działa inaczej?
        let users = yield storage.readUsers();
        let foundUser = users.find((x) => x.id == id_);
        if (foundUser == undefined) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!res.locals.isAdmin && res.locals.loggedInAs.toLowerCase() !== foundUser.login.toLowerCase()) {
            return res
                .status(403)
                .json({
                error: "The client does not have access rights to the content",
            });
        }
        foundUser.password = req.body.password;
        storage.updateUsers(users);
        return res.status(200).json(foundUser);
    });
});
// usunąć konto może jedynie admin . Usunięcie konta powinno również usunąć wszystkie notatki
app.delete("/user/:id", VerifyJwt, function (req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id_ = Number.parseInt(req.params.id);
        if (!res.locals.isAdmin) {
            return res
                .status(403)
                .json({
                error: "The client does not have access rights to the content",
            });
        }
        let users = yield storage.readUsers();
        let foundUser = users.find((x) => x.id == id_);
        if (foundUser == undefined) {
            return res.status(404).json({ error: "User not found" });
        }
        const login_ = foundUser.login;
        users = users.filter((x) => x.id != id_);
        yield storage.updateUsers(users);
        let notes = yield storage.readNotes();
        notes = notes.filter((x) => x.login.toLowerCase() != login_.toLowerCase());
        yield storage.updateNotes(notes);
        return res.status(200).json(foundUser);
    });
});
app.get("/", function (req, res) {
    console.log(req.body); // e.x. req.body.title
    return res.status(200).send("GET  Hello World");
});
app.listen(3000);
