import Articles from "../dbTables/articles";
import SocialMedias from "../dbTables/socialMedias";
import IndexPageResponse from "./indexPageResponse";

export interface BlogIndexResponse {
    articles: Articles[] | null,
    socialMedias: SocialMedias[] | null
}

export interface BlogSlugResponse {
    title: string | null,
    article: Articles | null,
    socialMedias: SocialMedias[] | null,
    pageData?: IndexPageResponse | null
}