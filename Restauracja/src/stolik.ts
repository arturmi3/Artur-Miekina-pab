import { ObjectId } from "mongodb";

export enum StatusStolika {
  Wolny = 1,
  Zajęty,
  Niedostępny,
}

export default class Stolik {
  constructor(
    public nazwa: string,
    public iloscOsob: number,
    public status: StatusStolika,
    public _id?: ObjectId
  ) {}
}
