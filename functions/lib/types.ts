export interface CreateAuthRequestData {
 'create-account': boolean
 password: string
 username: string
}

export interface CreateJournalRequestData {
 name: string
}

export interface Journal {
 createdAt: string
 name: string
 user: string
}
