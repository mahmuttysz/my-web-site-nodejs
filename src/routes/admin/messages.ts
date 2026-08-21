import { Router } from 'express';
import { getAllMessages, deleteMessage } from '../../controllers/admin/messagesController';

const router = Router();

router.get('/', getAllMessages);
router.delete('/delete/:id', deleteMessage);

export default router;