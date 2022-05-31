import { ObjectId } from "mongodb";

export enum KategoriaDania {
  Śniadanie = 1,
  Obiad,
  Przystawka,
}

export default class Danie {
  constructor(
    public nazwa: string,
    public cena: number,
    public kategoria: KategoriaDania,
    public _id?: ObjectId
  ) {}
}

/**
import mongoose, { Schema } from "mongoose";
const DanieM = mongoose.model("Danie", new Schema({
  nazwa: String,
  cena: Number,
  kategoria: KategoriaDania,

}))
*/