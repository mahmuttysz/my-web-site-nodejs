import { query, dbQueries } from '../../config/db';
import Contacts from '../../types/dbTables/contacts';
import { parseMessageIds } from '../../utils/messageIds';

export const getMessages = async (): Promise<Contacts[]> => {
    const messages = await query<Contacts[]>(dbQueries.contacts.getAll);
    return messages || [];
};

export const markMessagesRead = async (ids: unknown): Promise<number[]> => {
    const unique = parseMessageIds(ids);
    if (unique.length === 0) {
        return [];
    }

    const placeholders = unique.map(() => '?').join(',');
    await query(
        `UPDATE contacts SET is_read = 1 WHERE id IN (${placeholders}) AND is_read = 0`,
        unique
    );
    return unique;
};

export const deleteMessage = async (contactId: number): Promise<void> => {
    await query(dbQueries.contacts.delete, [contactId]);
};

export default {
    getMessages,
    markMessagesRead,
    deleteMessage
};
