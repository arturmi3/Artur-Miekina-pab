
// do przesyłania
class Note {
    title: string
    content: string
    createDate?: string /* data w formmacie ISO) */
    tags?: string[]
    public?: boolean
}

// do zapamiętywania
class NoteRec extends Note {
    id: number
    login: string
}

export { Note, NoteRec };