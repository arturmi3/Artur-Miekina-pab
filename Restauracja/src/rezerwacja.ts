import { ObjectId } from "mongodb";

export default class Rezerwacja {
  constructor(
    public stolikId: ObjectId,
    public start: Date,
    public koniec: Date,
    public klient: string,
    public _id?: ObjectId
  ) {}
}
