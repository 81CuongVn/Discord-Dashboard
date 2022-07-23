export type Client = {
    id: string,
    secret: string,
}

export type UserStatic = {
    url: string,
    path: string,
}

export type SSLOptions = {
    cert: string,
    key: string,
    httpRedirect: boolean,
}

export type ProjectInfo = {
    accountToken: string,
    projectId: string
}

export type SessionSettings = {
    store: (fastifySession: any)=>any,
    secret: string,
    expires: number,
    saveUninitialized: boolean,
}