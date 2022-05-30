import { Note, NoteRec } from "./Note"
import { User, UserRec } from "./User"
import { DataStorage } from "./DataStorage"

import * as mongoDB from "mongodb";
import { Server } from "http";
import { Collection } from "mongoose";



class MongoStorage implements DataStorage {
  private _url: string
  private _dbName: string

  static readonly collNotes: string = "notes"
  static readonly collUsers: string = "users"

  constructor(url: string, dbName: string) {
    this._url = url
    this._dbName = dbName
  }

  public async readNotes(): Promise<NoteRec[]> {    
    console.log("readNotes")
    // url to then server
    const client = new mongoDB.MongoClient(this._url)
    try {
      await client.connect()
      const db: mongoDB.Db = client.db(this._dbName)
      let collection: mongoDB.Collection = db.collection(MongoStorage.collNotes)
      let cursor: mongoDB.FindCursor = collection.find()
      
      let result: NoteRec[] = await cursor.toArray()

      cursor.close()
      
      return result
    }
    catch(err) {
      console.log(err)
      throw(err)
    }
    finally {
      await client.close()
    }
  }

  public async updateNotes(dataToSave: NoteRec[]): Promise<void> {
    console.log("updateStorage")
    // url to then server
    const client = new mongoDB.MongoClient(this._url)
    try {
      await client.connect()
      const db: mongoDB.Db = client.db(this._dbName)
      let collection: mongoDB.Collection = db.collection(MongoStorage.collNotes)
            
      // To delete all documents in a collection, pass in an empty document ({ }).
      await collection.deleteMany( { } )
      if (dataToSave.length > 0)
        await collection.insertMany(dataToSave)
    }
    catch(err) {
      console.log(err)
      throw(err)
    }
    finally {
      await client.close()
    }
  }


  public async readUsers(): Promise<UserRec[]> {    
    console.log("readUsers")
    // url to then server
    const client = new mongoDB.MongoClient(this._url)
    try {
      await client.connect()
      const db: mongoDB.Db = client.db(this._dbName)
      let collection: mongoDB.Collection = db.collection(MongoStorage.collUsers)
      let cursor: mongoDB.FindCursor = collection.find()
      
      let result: UserRec[] = await cursor.toArray()

      cursor.close()
      
      return result
    }
    catch(err) {
      console.log(err)
      throw(err)
    }
    finally {
      await client.close()
    }
  }

  public async updateUsers(dataToSave: UserRec[]): Promise<void> {
    console.log("updateUsers")
    // url to then server
    const client = new mongoDB.MongoClient(this._url)
    try {
      await client.connect()
      const db: mongoDB.Db = client.db(this._dbName)
      let collection: mongoDB.Collection = db.collection(MongoStorage.collUsers)
            
      // To delete all documents in a collection, pass in an empty document ({ }).
      await collection.deleteMany( {} )
      if (dataToSave.length > 0)
        await collection.insertMany(dataToSave)
    }
    catch(err) {
      console.log(err)
      throw(err)
    }
    finally {
      await client.close()
    }
  }
}

export { MongoStorage };
