import { dbQueries, query, queryOne } from '../config/db';
import AboutMe from '../types/dbTables/aboutMe';
import Articles from '../types/dbTables/articles';
import Experiences from '../types/dbTables/experiences';
import Projects from '../types/dbTables/projects';
import SocialMedias from '../types/dbTables/socialMedias';
import IndexPageResponse from '../types/response/indexPageResponse';

export const getHomePage = async (lang: string | undefined): Promise<IndexPageResponse> => {
    try {
        const [aboutMe, experiences, projects, articles, socialMedias] = await Promise.all([
            queryOne<AboutMe>(dbQueries.aboutMe.get, [lang]),
            query<Experiences[]>(dbQueries.experiences.get, [lang]),
            query<Projects[]>(dbQueries.projects.get, [lang]),
            query<Articles[]>(dbQueries.articles.get, [lang]),
            query<SocialMedias[]>(dbQueries.socialMedias.get)
        ]);

        return {
            aboutMe: aboutMe || <AboutMe>{},
            experiences: experiences || [],
            projects: projects || [],
            articles: articles || [],
            socialMedias: socialMedias || []
        };
    } catch (err) {
        console.error('❌ getIndexPageData Veri Çekme Hatası:', err);
        return {
            aboutMe: <AboutMe>{},
            experiences: [],
            projects: [],
            articles: [],
            socialMedias: []
        };
    }
};

export default { getHomePage };