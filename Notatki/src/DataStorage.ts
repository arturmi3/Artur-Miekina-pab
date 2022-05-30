import { NoteRec } from "./Note"
import { UserRec } from "./User";

export interface DataStorage {
    readNotes(): Promise<NoteRec[]>
    updateNotes(dataToSave: NoteRec[]): Promise<void>
    readUsers(): Promise<UserRec[]>
    updateUsers(dataToSave: UserRec[]): Promise<void>
}
  