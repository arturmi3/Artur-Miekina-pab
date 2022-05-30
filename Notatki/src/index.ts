import * as express from "express";
import * as jsonwebtoken from "jsonwebtoken";

import { Note, NoteRec } from "./Note";
import { User, UserRec } from "./User";
import { Storage } from "./storage";
import { MongoStorage } from "./MongoStorage";

import config from "./config";
import { DataStorage } from "./DataStorage";

const app = express();
app.use(express.json());

let storage: DataStorage;

if (config.storageMongo) {
  storage = new MongoStorage(config.mongoUrl, config.mongoDbName);
} else {
  storage = new Storage(config.notesFile, config.usersFile);
}

class UserLogin {
  login: string;
  password: string;
}

class ValidToken {
  login: string;
  issuedAtTime: number;
  token: string;
  isAdmin: boolean;
}
let validTokens: ValidToken[] = [];

function parseBoolean(value?: string | number | boolean | null) {
  value = value?.toString().toLowerCase();
  return value === "true" || value === "1";
}

function isAdmin(login: string, password: string): boolean {
  // uproszczenie
  return login === config.adminLogin && password === config.adminPassword;
}

async function VerifyJwt(
  req: express.Request<any>,
  res: express.Response,
  next: express.NextFunction
) {
  let jwtToken: string = req.headers.authorization;
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

  const foundToken: ValidToken = validTokens.find((x) => x.token === jwtToken);
  if (foundToken === undefined)
    return res.status(401).json({ error: "Invalid authorization" });

  // zapamiętanie w res loginu i isAdmin  --- dostęp w następnych funkcjach
  res.locals.loggedInAs = foundToken.login;
  res.locals.isAdmin = foundToken.isAdmin;

  next();
}

app.post(
  "/login",
  async function (req: express.Request<UserLogin>, res: express.Response) {
    console.log(req.body.login);
    console.log(req.body.password);

    if (!req.body.login) {
      return res.status(401).json({ error: "Nieprawidłowy login" });
    }
    if (!req.body.password) {
      return res.status(401).json({ error: "Nieprawidłowe hasło" });
    }

    let validToken: ValidToken = undefined;
    // musi być admin, albo zdefiniowany user
    if (isAdmin(req.body.login, req.body.password)) {
      validToken = {
        login: req.body.login,
        issuedAtTime: Date.now(),
        isAdmin: true,
        token: "",
      };
    } else {
      // czy zdefiniowany user
      let users: UserRec[] = await storage.readUsers();
      let foundUser: UserRec = users.find(
        (x) => x.login.toLowerCase() === req.body.login.toLowerCase()
      );
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
  }
);

app.post(
  "/note",
  VerifyJwt,
  async function (req: express.Request<Note>, res: express.Response) {
    let data: NoteRec = new NoteRec();

    data.id = Date.now();
    data.login = res.locals.loggedInAs;

    data.title = req.body.title;
    data.content = req.body.content;
    data.tags = req.body.tags;

    data.createDate = req.body.createDate ?? data.id;
    data.public = parseBoolean(req.body.public); // koszmarek

    let notes: NoteRec[] = await storage.readNotes();
    notes.push(data);
    await storage.updateNotes(notes);

    return res.status(200).json(data);
  }
);

app.get(
  "/note/:id",
  VerifyJwt,
  async function (req: express.Request, res: express.Response) {
    let notes: NoteRec[] = await storage.readNotes();
    let foundNote: Note = notes.find(
      (e) =>
        e.id == Number.parseInt(req.params.id) &&
        e.login.toUpperCase() === res.locals.loggedInAs.toUpperCase()
    );
    if (foundNote === undefined) {
      return res.status(404);
    } else {
      let note: Note = {
        title: foundNote.title,
        content: foundNote.content,
        createDate: foundNote.createDate,
        tags: foundNote.tags,
        public: foundNote.public,
      };
      return res.status(200).json(note);
    }
  }
);

app.get(
  "/notes/user/:userName",
  async function (req: express.Request, res: express.Response) {
    let notes: NoteRec[] = await storage.readNotes();

    let foundNotes: Note[] = notes
      .filter(
        (e) =>
          e.public &&
          e.login.toUpperCase() === req.params.userName.toUpperCase()
      )
      .map((v) => {
        let note: Note = {
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
  }
);

app.post(
  "/user",
  async function (req: express.Request<User>, res: express.Response) {
    let data: UserRec = new UserRec();

    data.id = Date.now();
    data.login = req.body.login;
    data.password = req.body.password;

    let users: UserRec[] = await storage.readUsers();
    let foundUser: UserRec = users.find(
      (x) => x.login.toLowerCase() === req.body.login.toLowerCase()
    );
    if (foundUser !== undefined) {
      return res.status(401).json({ error: "User already exists" });
    }

    users.push(data);
    await storage.updateUsers(users);

    return res.status(200).json(data);
  }
);

// pobrać dane użytkownika może użytkownik (własne konto) i admin (wszystkie konta)
app.get(
  "/user/:id",
  VerifyJwt,
  async function (req: express.Request, res: express.Response) {
    const id_: number = Number.parseInt(req.params.id);

    let users: UserRec[] = await storage.readUsers();
    let foundUser: UserRec = users.find((x) => x.id == id_);
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
  }
);

// edycji może dokonać zalogowany użytkownik (tylko swoje konto) oraz admin (wszystkie konta --- na razie admin jest tylko jeden)
app.put(
  "/user/:id",
  VerifyJwt,
  async function (req: express.Request<User>, res: express.Response) {
    const id_: number = Number.parseInt(req.route.keys["id"]); // dla put req.params działa inaczej?

    let users: UserRec[] = await storage.readUsers();
    let foundUser: UserRec = users.find((x) => x.id == id_);
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
  }
);

// usunąć konto może jedynie admin . Usunięcie konta powinno również usunąć wszystkie notatki
app.delete(
  "/user/:id",
  VerifyJwt,
  async function (req: express.Request, res: express.Response) {
    const id_: number = Number.parseInt(req.params.id);

    if (!res.locals.isAdmin) {
      return res
        .status(403)
        .json({
          error: "The client does not have access rights to the content",
        });
    }

    let users: UserRec[] = await storage.readUsers();
    let foundUser: UserRec = users.find((x) => x.id == id_);
    if (foundUser == undefined) {
      return res.status(404).json({ error: "User not found" });
    }
    const login_: string = foundUser.login;
    users = users.filter((x) => x.id != id_);
    await storage.updateUsers(users);

    let notes: NoteRec[] = await storage.readNotes();
    notes = notes.filter((x) => x.login.toLowerCase() != login_.toLowerCase());
    await storage.updateNotes(notes);

    return res.status(200).json(foundUser);
  }
);

app.get("/", function (req: express.Request, res: express.Response) {
  console.log(req.body); // e.x. req.body.title
  return res.status(200).send("GET  Hello World");
});

app.listen(3000);
