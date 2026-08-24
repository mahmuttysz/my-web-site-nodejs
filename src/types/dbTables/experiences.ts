interface Experiences {
    id: number,
    title: string,
    company_name: string,
    content: string,
    description: string,
    begin_date: Date,
    end_date?: Date | null,
    created_by: number,
    updated_by?: number | null,
    language: string,
    status: boolean,
    created_at: Date,
    updated_at?: Date | null
}

export default Experiences;