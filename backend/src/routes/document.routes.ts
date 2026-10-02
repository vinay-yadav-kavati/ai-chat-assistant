import { Router } from 'express';
import { extractDocumentText } from '../controllers/document.controller.js';

const router = Router();

// GET /api/documents/extract/:fileName
router.get('/extract/:fileName', extractDocumentText);

export default router;
