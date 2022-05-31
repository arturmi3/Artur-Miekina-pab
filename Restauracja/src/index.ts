import * as express from "express";
import * as storage from "./storage";
import config from "./config";

import Restauracja from "./restauracja";
import Stolik from "./stolik";
import Rezerwacja from "./rezerwacja";
import Zamówienie, { StatusZamówienia } from "./zamówienie";
import Pracownik from "./pracownik";
import Produkt from "./produkt";
import Danie, { KategoriaDania } from "./danie";

import { ObjectId } from "mongodb";
import { idText } from "typescript";

const app = express();
app.use(express.json());

// ----------------------------------------------------------------------------------------
// restauracja: post, put, get --- tylko jeden rekord
app.post(
  "/restauracja",
  async function (req: express.Request<Restauracja>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    await storage.connectToDatabase();

    // tylko jedna restauracja !
    if ((await storage.collections.restauracje.countDocuments()) == 0) {      
      const result = await storage.collections.restauracje.insertOne(req.body as Restauracja);
      let data = await storage.collections.restauracje.findOne({
        _id: result.insertedId,
      });
      return res.status(200).json(data);
    } else {
      return res.status(405).json({ error: "record exists" }); //  405 Method Not Allowed
    }
  }
);

app.put(
  "/restauracja",
  async function (req: express.Request<Restauracja>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    // bez sprawdzania _id - bo jest tylko jedna
    if ((await storage.collections.restauracje.countDocuments()) == 1) {
      let first = await storage.collections.restauracje.findOne({});

      // zmieniamy tylko pola, które są w body
      if (req.body.nazwa != null) first.nazwa = req.body.nazwa;
      if (req.body.adres != null) first.adres = req.body.adres;
      if (req.body.telefon != null) first.telefon = req.body.telefon;
      if (req.body.nip != null) first.nip = req.body.nip;
      if (req.body.email != null) first.email = req.body.email;
      if (req.body.www != null) first.www = req.body.www;

      const result = await storage.collections.restauracje.updateOne(
        { _id: first._id },
        {
          $set: first,
        }
      );
      console.log(`modifiedCount= ${result.modifiedCount}`);
      let data = await storage.collections.restauracje.findOne({
        _id: first._id,
      });
      return res.status(200).json(data);
    } else {
      return res.status(405).json({ error: "record does not exists" }); //  405 Method Not Allowed
    }
  }
);

app.get(
  "/restauracja",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    // bez sprawdzania _id - bo jest tylko jedna
    if ((await storage.collections.restauracje.countDocuments()) == 1) {
      let first = await storage.collections.restauracje.findOne({});

      return res.status(200).json(first);
    } else {
      return res.status(405).json({ error: "record does not exists" }); //  405 Method Not Allowed
    }
  }
);

// ----------------------------------------------------------------------------------------
//stoliki
app.post(
  "/stolik",
  async function (req: express.Request<Stolik>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const result = await storage.collections.stoliki.insertOne(req.body as Stolik);
    let data = await storage.collections.stoliki.findOne({
      _id: result.insertedId,
    });
    return res.status(200).json(data);
  }
);

app.put(
  "/stolik",
  async function (req: express.Request<Stolik>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    if (!req.body._id) return res.status(400).json({ error: "_id required" });
    const _id: ObjectId = new ObjectId(req.body._id);

    let obj = await storage.collections.stoliki.findOne({ _id: _id }); // If no document satisfies the query, the method returns null.
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    // zmieniamy tylko pola, które są w body
    if (req.body.nazwa != null) obj.nazwa = req.body.nazwa;
    if (req.body.iloscOsob != null) obj.iloscOsob = req.body.iloscOsob;
    if (req.body.status != null) obj.status = req.body.status;

    const result = await storage.collections.stoliki.updateOne(
      { _id: _id },
      {
        $set: obj,
      }
    );
    console.log(`modifiedCount= ${result.modifiedCount}`);
    let data = await storage.collections.stoliki.findOne({
      _id: _id,
    });
    return res.status(200).json(data);
  }
);

app.delete(
  "/stolik/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    console.log(`_id: ${req.params.id}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.stoliki.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    // można usunąć jeśli nie ma rezerwacji i zamówień
    const rezerwacje = storage.collections.rezerwacje.find({ stolikId: _id });
    if (await rezerwacje.hasNext())
      return res
        .status(405)
        .json({ error: "nie można usunąć istnieją rezerwacje" });
    const zamówienia = storage.collections.zamówienia.find({ stolikId: _id });
    if (await zamówienia.hasNext())
      return res
        .status(405)
        .json({ error: "nie można usunąć istnieją zamówienia" });

    const data = await storage.collections.stoliki.findOneAndDelete({
      _id: _id,
    }); // findOneAndDelete Returns the deleted document

    return res.status(200).json(data);
  }
);

app.get(
  "/stolik/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.stoliki.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    return res.status(200).json(obj);
  }
);

// pełna lista stolików
app.get(
  "/stoliki",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}, ${req.query}`);

    await storage.connectToDatabase();

    let result = storage.collections.stoliki.find();

    return res.status(200).json(await result.toArray());
  }
);

// localhost:3000/wolnystolik?data=2022-05-29T20:00&osoby=3
app.get(
  "/wolnystolik",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}, ${req.query}`);
    console.log(`data= ${req.query.data}, osoby= ${req.query.osoby}`);

    // jeśli data/godzina nie podana, to szukaj od teraz
    let data: Date =
      req.query.data != null ? new Date(req.query.data as string) : new Date();
    // jeśłi liczba osób nie podana, to stlik dla 2
    let osoby: number =
      req.query.osoby != null ? Number(req.query.osoby as string) : 2;

    console.log(`data= ${data}, osoby= ${osoby}`);

    await storage.connectToDatabase();

    // na starcie nie mamy wolnego
    let wolnyStolik: Stolik = null;
    // stoliki z liczbą osób >= osoby, posortowane wg liczby osób rosnąco
    const cursorStoliki = storage.collections.stoliki
      .find({ iloscOsob: { $gte: osoby } })
      .sort({ iloscOsob: 1 });
    const stoliki = await cursorStoliki.toArray();
    // dla każdego po kolei sprawdzamy rezerwacje
    for (const _stolik of stoliki) {
      const cursorRezerwacja = storage.collections.rezerwacje.find({
        stolikId: _stolik._id,
        start: { $lt: data },
        koniec: { $gt: data },
      });
      const rezerwacja = await cursorRezerwacja.toArray();
      if (rezerwacja.length == 0 && wolnyStolik == null) wolnyStolik = _stolik;
      cursorRezerwacja.close();
    }
    cursorStoliki.close();

    if (wolnyStolik != null) return res.status(200).json(wolnyStolik);
    else return res.status(404).json({ error: "brak wolnego stolika" });
  }
);

// ----------------------------------------------------------------------------------------
// Rezerwacje: post, get, delete, list  --- bez put bo rezerwację się usuwan i składa nową
app.post(
  "/rezerwacja",
  async function (req: express.Request<Rezerwacja>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    let rezerwacja: Rezerwacja = req.body as Rezerwacja
    // poprawienie typu stolikId
    if (req.body.stolikId != undefined) rezerwacja.stolikId = ObjectId.createFromHexString(req.body.stolikId as string)
    const result = await storage.collections.rezerwacje.insertOne(rezerwacja);
    let data = await storage.collections.rezerwacje.findOne({
      _id: result.insertedId,
    });
    return res.status(200).json(data);
  }
);

app.delete(
  "/rezerwacja/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    console.log(`_id: ${req.params.id}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.rezerwacje.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    const data = await storage.collections.rezerwacje.findOneAndDelete({
      _id: _id,
    }); // findOneAndDelete Returns the deleted document

    return res.status(200).json(data);
  }
);

app.get(
  "/rezerwacja/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.rezerwacje.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    return res.status(200).json(obj);
  }
);

// pełna lista
app.get(
  "/rezerwacje",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}, ${req.query}`);

    await storage.connectToDatabase();

    let result = storage.collections.rezerwacje.find();

    return res.status(200).json(await result.toArray());
  }
);

// ----------------------------------------------------------------------------------------
// Pracownicy: post, put, get, delete, list
app.post(
  "/pracownik",
  async function (req: express.Request<Pracownik>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const result = await storage.collections.pracownicy.insertOne(req.body);
    let data = await storage.collections.pracownicy.findOne({
      _id: result.insertedId,
    });
    return res.status(200).json(data);
  }
);

app.put(
  "/pracownik",
  async function (req: express.Request<Pracownik>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    if (!req.body._id) return res.status(400).json({ error: "_id required" });
    const _id: ObjectId = new ObjectId(req.body._id);

    let obj = await storage.collections.pracownicy.findOne({ _id: _id }); // If no document satisfies the query, the method returns null.
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    // zmieniamy tylko pola, które są w body
    if (req.body.imie != null) obj.imie = req.body.imie;
    if (req.body.nazwisko != null) obj.nazwisko = req.body.nazwisko;
    if (req.body.stanowisko != null) obj.stanowisko = req.body.stanowisko;

    const result = await storage.collections.pracownicy.updateOne(
      { _id: _id },
      {
        $set: obj,
      }
    );
    console.log(`modifiedCount= ${result.modifiedCount}`);
    let data = await storage.collections.pracownicy.findOne({
      _id: _id,
    });
    return res.status(200).json(data);
  }
);

app.delete(
  "/pracownik/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    console.log(`_id: ${req.params.id}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.pracownicy.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    const zamówienia = storage.collections.zamówienia.find({
      pracownikId: _id,
    });
    if (await zamówienia.hasNext())
      return res
        .status(405)
        .json({ error: "nie można usunąć istnieją zamówienia" });

    const data = await storage.collections.pracownicy.findOneAndDelete({
      _id: _id,
    }); // findOneAndDelete Returns the deleted document

    return res.status(200).json(data);
  }
);

app.get(
  "/pracownik/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.pracownicy.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    return res.status(200).json(obj);
  }
);

// pełna lista
app.get(
  "/pracownicy",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}, ${req.query}`);

    await storage.connectToDatabase();

    let result = storage.collections.pracownicy.find();

    return res.status(200).json(await result.toArray());
  }
);

// ----------------------------------------------------------------------------------------
// Produkty: post, put, get, delete, list
app.post(
  "/produkt",
  async function (req: express.Request<Produkt>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const result = await storage.collections.produkty.insertOne(req.body);
    let data = await storage.collections.produkty.findOne({
      _id: result.insertedId,
    });
    return res.status(200).json(data);
  }
);

app.put(
  "/produkt",
  async function (req: express.Request<Produkt>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    if (!req.body._id) return res.status(400).json({ error: "_id required" });
    const _id: ObjectId = new ObjectId(req.body._id);

    let obj = await storage.collections.produkty.findOne({ _id: _id }); // If no document satisfies the query, the method returns null.
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    // zmieniamy tylko pola, które są w body
    if (req.body.nazwa != null) obj.nazwa = req.body.nazwa;
    if (req.body.cena != null) obj.cena = req.body.cena;
    if (req.body.jednostkaMiary != null)
      obj.jednostkaMiary = req.body.jednostkaMiary;

    const result = await storage.collections.produkty.updateOne(
      { _id: _id },
      {
        $set: obj,
      }
    );
    console.log(`modifiedCount= ${result.modifiedCount}`);
    let data = await storage.collections.produkty.findOne({
      _id: _id,
    });
    return res.status(200).json(data);
  }
);

app.delete(
  "/produkt/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    console.log(`_id: ${req.params.id}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.produkty.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    const data = await storage.collections.produkty.findOneAndDelete({
      _id: _id,
    }); // findOneAndDelete Returns the deleted document

    return res.status(200).json(data);
  }
);

app.get(
  "/produkt/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.produkty.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    return res.status(200).json(obj);
  }
);

// pełna lista: produkty?page=1&limit=10
// page numerowane od 0
app.get(
  "/produkty",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}, ${req.query}`);
    console.log(`page= ${req.query.page}, limit= ${req.query.limit}`);

    if (req.query.page == null)
      return res.status(400).json({ error: "page required" });
    if (req.query.limit == null)
      return res.status(400).json({ error: "limit required" });
    let page: number;
    let limit: number;
    try {
      page = Number.parseInt(req.query.page as string);
      limit = Number.parseInt(req.query.limit as string);

      if (page < 0) return res.status(400).json({ error: "page < 0" });
      if (limit < 1) return res.status(400).json({ error: "limit < 1" });
    } catch (e) {
      console.log("Error", e);
      return res.status(400).json({ error: e });
    }

    await storage.connectToDatabase();

    let result = storage.collections.produkty
      .find()
      .skip(page * limit)
      .limit(limit);

    return res.status(200).json(await result.toArray());
  }
);

// ----------------------------------------------------------------------------------------
// Dania: post, put, get, delete, list
app.post(
  "/danie",
  async function (req: express.Request<Danie>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const result = await storage.collections.dania.insertOne(req.body);
    let data = await storage.collections.dania.findOne({
      _id: result.insertedId,
    });
    return res.status(200).json(data);
  }
);

app.put(
  "/danie",
  async function (req: express.Request<Danie>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    if (!req.body._id) return res.status(400).json({ error: "_id required" });
    const _id: ObjectId = new ObjectId(req.body._id);

    let obj = await storage.collections.dania.findOne({ _id: _id }); // If no document satisfies the query, the method returns null.
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    // zmieniamy tylko pola, które są w body
    if (req.body.nazwa != null) obj.nazwa = req.body.nazwa;
    if (req.body.cena != null) obj.cena = req.body.cena;
    if (req.body.kategoria != null) obj.kategoria = req.body.kategoria;

    const result = await storage.collections.dania.updateOne(
      { _id: _id },
      {
        $set: obj,
      }
    );
    console.log(`modifiedCount= ${result.modifiedCount}`);
    let data = await storage.collections.dania.findOne({
      _id: _id,
    });
    return res.status(200).json(data);
  }
);

app.delete(
  "/danie/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    console.log(`_id: ${req.params.id}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.dania.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    const data = await storage.collections.dania.findOneAndDelete({
      _id: _id,
    }); // findOneAndDelete Returns the deleted document

    return res.status(200).json(data);
  }
);

app.get(
  "/danie/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.dania.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    return res.status(200).json(obj);
  }
);

// pełna lista
app.get("/dania", async function (req: express.Request, res: express.Response) {
  console.log(`${req.method}, ${req.url}, ${req.query}`);

  await storage.connectToDatabase();

  let result = storage.collections.dania.find();

  return res.status(200).json(await result.toArray());
});


// ----------------------------------------------------------------------------------------
// Zamówienia: post, put, get, delete, list
app.post(
  "/zamowienie",
  async function (req: express.Request<Zamówienie>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    let zamówienie: Zamówienie = req.body as Zamówienie
    // poprawienie typu stolikId
    if (req.body.stolikId != undefined) zamówienie.stolikId = ObjectId.createFromHexString(req.body.stolikId as string)
    // poprawienie typu pracownikId
    if (req.body.pracownikId != undefined) zamówienie.pracownikId = ObjectId.createFromHexString(req.body.pracownikId as string)
    // pozycje -> poprawienie identyfikatorów dań
    let pozycje: ObjectId[] = []
    req.body.pozycje.forEach(element => { console.log(element); pozycje.push(ObjectId.createFromHexString(element as string)) });
    zamówienie.pozycje = pozycje

    const result = await storage.collections.zamówienia.insertOne(zamówienie);
    let data = await storage.collections.zamówienia.findOne({
      _id: result.insertedId,
    });
    return res.status(200).json(data);
  }
);

app.put(
  "/zamowienie",
  async function (req: express.Request<Zamówienie>, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    if (!req.body._id) return res.status(400).json({ error: "_id required" });
    const _id: ObjectId = new ObjectId(req.body._id);

    let zamówienie = await storage.collections.zamówienia.findOne({ _id: _id }); // If no document satisfies the query, the method returns null.
    if (zamówienie == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    // zmieniamy tylko pola, które są w body
    if (req.body.pracownikId != null) zamówienie.pracownikId = ObjectId.createFromHexString(req.body.pracownikId as string)    
    if (req.body.status != null) zamówienie.status = req.body.status;
    if (req.body.stolikId != null) zamówienie.stolikId = ObjectId.createFromHexString(req.body.stolikId as string)
    if (req.body.kwota != null) zamówienie.kwota = req.body.kwota;
    if (req.body.pozycje != null) {
        // pozycje -> poprawienie identyfikatorów dań
        let pozycje: ObjectId[] = []
        req.body.pozycje.forEach(element => { pozycje.push(ObjectId.createFromHexString(element as string)) });
        zamówienie.pozycje = pozycje
    }
    

    const result = await storage.collections.zamówienia.updateOne(
      { _id: _id },
      {
        $set: zamówienie,
      }
    );
    console.log(`modifiedCount= ${result.modifiedCount}`);
    let data = await storage.collections.zamówienia.findOne({
      _id: _id,
    });
    return res.status(200).json(data);
  }
);

app.delete(
  "/zamowienie/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);
    console.log(`_id: ${req.params.id}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.zamówienia.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    const data = await storage.collections.zamówienia.findOneAndDelete({
      _id: _id,
    }); // findOneAndDelete Returns the deleted document

    return res.status(200).json(data);
  }
);

app.get(
  "/zamowienie/:id",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    const _id: ObjectId = new ObjectId(req.params.id);

    let obj = await storage.collections.zamówienia.findOne({ _id: _id });
    if (obj == null)
      return res
        .status(404)
        .json({ error: `record not found ${req.body._id}` }); // 404 Not Found

    return res.status(200).json(obj);
  }
);

// pełna lista
app.get("/zamowienia", async function (req: express.Request, res: express.Response) {
  console.log(`${req.method}, ${req.url}, ${req.query}`);

  await storage.connectToDatabase();

  let result = storage.collections.zamówienia.find();

  return res.status(200).json(await result.toArray());
});




// RAPORTY
// ----------------------------------------------------------------------------------------

// raport obłożenia stolików (raport zamówień wg stolików)
app.get(
  "/zamowieniawgstolikow",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    let result = storage.collections.stoliki.aggregate([{$lookup: {from: "zamowienia", localField: "_id", foreignField: "stolikId", as: "zamowienia"}}])

    return res.status(200).json(await result.toArray());
  }
);



// raport zamówienie per kelner
app.get(
  "/zamowieniaperkelner",
  async function (req: express.Request, res: express.Response) {
    console.log(`${req.method}, ${req.url}`);

    await storage.connectToDatabase();

    let result = storage.collections.pracownicy.aggregate([{$lookup: {from: "zamowienia", localField: "_id", foreignField: "pracownikId", as: "zamowienia"}}])

    return res.status(200).json(await result.toArray());
  }
);







//
app.get("/", async function (req: express.Request, res: express.Response) {
  console.log(`${req.method}, ${req.url}`);

  return res.status(200).send("API Restauracja - Hello!");
});

app.listen(3000);
