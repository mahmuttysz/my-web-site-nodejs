interface Articles {
    id: number,
    title: string,
    excerpt?: string | null,
    content: string,
    contentHtml?: string | null,
    slug: string,
    cover_image?: string | null,
    hits: number,
    created_by: number,
    updated_by?: number | null,
    language: string,
    reading_time: number,
    status: boolean,
    published_at?: Date | null,
    created_at: Date | null,
    updated_at?: Date | null
}

export default Articles;