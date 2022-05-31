import { ObjectId } from "mongodb";
import Danie from "./danie";

export enum StatusZamówienia {
  Złożone = 1,
  WRealizacji,
  Zrealizowane,
  Rachunek,
}

export default class Zamówienie {
  constructor(
    public pracownikId: ObjectId,
    public pozycje: ObjectId[],
    public status: StatusZamówienia,
    public stolikId: ObjectId,
    public kwota: number,
    public _id?: ObjectId
  ) {}
}
