import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
    allowedTags: [
        ...sanitizeHtml.defaults.allowedTags,
        'img',
        'h1',
        'h2',
        'del',
        'ins'
    ],
    allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        img: ['src', 'alt', 'title'],
        a: ['href', 'title', 'rel', 'target'],
        code: ['class'],
        pre: ['class']
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
        img: ['http', 'https']
    },
    allowProtocolRelative: false,
    transformTags: {
        a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    }
};

export const renderMarkdown = async (markdown?: string | null): Promise<string> => {
    const html = await marked.parse(markdown || '');
    return sanitizeHtml(html, SANITIZE_OPTIONS);
};

export default { renderMarkdown };
