interface SocialMedias {
    id: number,
    title: string,
    username: string,
    url?: string | null,
    icon?: string | null,
    turn: number,
    created_by: number,
    updated_by?: number | null,
    status: boolean,
    created_at: Date,
    updated_at?: Date | null
}

export default SocialMedias;