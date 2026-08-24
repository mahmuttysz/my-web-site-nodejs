import AboutMe from "../dbTables/aboutMe";
import Articles from "../dbTables/articles";
import Experiences from "../dbTables/experiences";
import Projects from "../dbTables/projects";
import SocialMedias from "../dbTables/socialMedias";

interface IndexPageResponse {
    aboutMe: AboutMe;
    experiences: Experiences[];
    projects: Projects[];
    articles: Articles[];
    socialMedias: SocialMedias[];
    turnstileSiteKey?: string | null;
}
export default IndexPageResponse;