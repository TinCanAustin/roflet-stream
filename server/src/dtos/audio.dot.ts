export interface bio{
    id?: string,
    name: string,
    artist: string | null,
    fileFormat: string | null,
    thumbnail_link: string | null
}

export interface songIdParam{
    id: string
}