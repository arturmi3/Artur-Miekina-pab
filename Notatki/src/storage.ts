import * as fs from "fs";
import { NoteRec } from "./Note"
import { UserRec } from "./User";
import { DataStorage } from "./DataStorage"

class Storage implements DataStorage {
  private notesFile: string
  private usersFile: string

  constructor(notesFile: string, usersFile: string) {
    this.notesFile = notesFile
    this.usersFile = usersFile
  }

  public async readNotes(): Promise<NoteRec[]> {
    try {
      let s : string = await fs.promises.readFile(this.notesFile, "utf-8")
      return <NoteRec[]>JSON.parse(s)
    } catch (err) {
      if (err.code === 'ENOENT') return []
      console.log(err)
    }
  }

  public async updateNotes(dataToSave: NoteRec[]): Promise<void> {
    try {
      await fs.promises.writeFile(this.notesFile, JSON.stringify(dataToSave))
    } catch (err) {
      console.log(err)
    }
  }

  public async readUsers(): Promise<UserRec[]> {
    try {
      let s : string = await fs.promises.readFile(this.usersFile, "utf-8")
      return <UserRec[]>JSON.parse(s)
    } catch (err) {
      if (err.code === 'ENOENT') return []
      console.log(err)
    }
  }

  public async updateUsers(dataToSave: UserRec[]): Promise<void> {
    try {
      await fs.promises.writeFile(this.usersFile, JSON.stringify(dataToSave))
    } catch (err) {
      console.log(err)
    }
  }
}

export { Storage };
