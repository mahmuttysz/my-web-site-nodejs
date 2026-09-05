interface AboutMe {
    id: number,
    title: string,
    description: string,
    now_text?: string | null,
    meta_description: string,
    created_by: number,
    updated_by?: number | null,
    language: string,
    status: boolean,
    created_at: Date,
    updated_at?: Date | null
}

export default AboutMe;