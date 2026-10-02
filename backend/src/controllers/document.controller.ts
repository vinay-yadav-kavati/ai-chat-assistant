import { Request, Response } from 'express';
import { extractTextFromPdf, DocumentError } from '../services/document.service.js';

/**
 * GET /api/documents/extract/:fileName
 * Extracts text and metadata from a PDF stored in Supabase Storage.
 */
export async function extractDocumentText(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const rawFileName = req.params.fileName;
    if (!rawFileName) {
      res.status(400).json({
        error: {
          code: 'MISSING_FILENAME',
          message: 'Document filename parameter is required.',
        },
      });
      return;
    }

    const decodedFileName = decodeURIComponent(rawFileName).trim();
    if (!decodedFileName) {
      res.status(400).json({
        error: {
          code: 'INVALID_FILENAME',
          message: 'Document filename cannot be empty.',
        },
      });
      return;
    }

    const result = await extractTextFromPdf(decodedFileName);

    res.status(200).json(result);
  } catch (err: any) {
    if (err instanceof DocumentError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: err.message || 'An unexpected error occurred during document extraction.',
      },
    });
  }
}
