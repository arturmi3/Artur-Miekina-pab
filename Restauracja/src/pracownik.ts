import { ObjectId } from "mongodb";

export default class Pracownik {
  constructor(
    public imie: string,
    public nazwisko: string,
    public stanowisko: string,
    public _id?: ObjectId
  ) {}
}
