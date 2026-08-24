import { query, dbQueries } from '../../config/db';
import Contacts from '../../types/dbTables/contacts';

// Mesajları Listeleme ve Okundu İşaretleme
export const getMessages = async (): Promise<Contacts[]> => {
    const messages = await query<Contacts[]>(dbQueries.contacts.getAll);
    await query(dbQueries.contacts.markedAsRead);

    return messages || [];
};

// Mesaj Silme
export const deleteMessage = async (contactId: number): Promise<void> => {
    await query(dbQueries.contacts.delete, [contactId]);
};

export default {
    getMessages,
    deleteMessage
};