interface Projects {
    id: number,
    title: string,
    description?: string | null,
    link_text?: string | null,
    link_url?: string | null,
    tags?: object | null,
    turn: number,
    language: string,
    created_by: number,
    updated_by?: number | null,
    status: boolean,
    created_at: Date,
    updated_at?: Date | null
}

export default Projects;