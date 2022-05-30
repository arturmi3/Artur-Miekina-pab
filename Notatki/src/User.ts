
// do przesyłania
class User {
    login: string
    password: string
    createDate?: string /* data w formmacie ISO) */
}

// do zapamiętywania
class UserRec extends User{
    id: number
}

export { User, UserRec };