import * as mongoDB from "mongodb";
import { connections } from "mongoose";
import config from "./config";
import Danie from "./danie";
import Pracownik from "./pracownik";
import Produkt from "./produkt";
import Restauracja from "./restauracja";
import Rezerwacja from "./rezerwacja";
import Stolik from "./stolik";
import Zamówienie from "./zamówienie";

export const collections: {
  restauracje?: mongoDB.Collection<Restauracja>
  pracownicy?: mongoDB.Collection<Pracownik>
  stoliki?: mongoDB.Collection<Stolik>
  rezerwacje?: mongoDB.Collection<Rezerwacja>
  produkty?: mongoDB.Collection<Produkt>
  dania?: mongoDB.Collection<Danie>
  zamówienia?: mongoDB.Collection<Zamówienie>
  isConnected: boolean
} = { isConnected: false }

export async function connectToDatabase() {
  if (!collections.isConnected) {
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(config.mongoUrl)

    await client.connect()

    const db: mongoDB.Db = client.db(config.mongoDbName)

    //await db.dropDatabase()

    collections.restauracje = db.collection("restauracje")
    collections.pracownicy = db.collection("pracownicy")
    collections.stoliki = db.collection("stoliki")
    collections.rezerwacje = db.collection("rezerwacje")
    collections.produkty = db.collection("produkty")
    collections.dania = db.collection("dania")
    collections.zamówienia = db.collection("zamowienia")
    collections.isConnected = true

    console.log(`Successfully connected to database: ${db.databaseName}`);
  }
  else {
    console.log(`Still connected`)
  }
  //console.log(`collection: ${collections.zamówienia.collectionName}`)
}
