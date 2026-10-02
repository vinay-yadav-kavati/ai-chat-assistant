import { PDFParse } from 'pdf-parse';
import { getSupabaseClient } from '../lib/supabase.js';

export const DOCUMENTS_BUCKET = 'documents';

export interface ExtractedDocument {
  fileName: string;
  text: string;
  pages: number;
}

export class DocumentError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.name = 'DocumentError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

/**
 * Downloads a PDF document from Supabase Storage and extracts its textual content and page count.
 */
export async function extractTextFromPdf(fileName: string): Promise<ExtractedDocument> {
  const cleanFileName = fileName?.trim();
  if (!cleanFileName) {
    throw new DocumentError('Filename is required.', 400, 'INVALID_FILENAME');
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new DocumentError(
      'Supabase server client is not configured.',
      500,
      'SUPABASE_CONFIG_ERROR'
    );
  }

  // 1. Download file from Supabase Storage
  const { data: fileBlob, error: downloadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .download(cleanFileName);

  if (downloadError || !fileBlob) {
    const errorMsg = downloadError?.message || 'File could not be downloaded.';
    const isNotFound =
      (downloadError as any)?.statusCode === 404 ||
      (downloadError as any)?.status === 404 ||
      errorMsg.toLowerCase().includes('not found') ||
      errorMsg.toLowerCase().includes('404');

    if (isNotFound) {
      throw new DocumentError(
        `PDF document "${cleanFileName}" was not found in storage.`,
        404,
        'DOCUMENT_NOT_FOUND'
      );
    }

    throw new DocumentError(
      `Failed to download PDF from storage: ${errorMsg}`,
      502,
      'STORAGE_DOWNLOAD_FAILED'
    );
  }

  // 2. Convert Blob to Node.js Buffer
  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (buffer.length === 0) {
    throw new DocumentError(
      `The downloaded PDF "${cleanFileName}" is empty (0 bytes).`,
      422,
      'EMPTY_DOCUMENT'
    );
  }

  // 3. Parse PDF with pdf-parse
  let parser: PDFParse | null = null;
  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();

    return {
      fileName: cleanFileName,
      text: result.text || '',
      pages: result.total || (result.pages ? result.pages.length : 0),
    };
  } catch (err: any) {
    throw new DocumentError(
      `Failed to parse PDF document "${cleanFileName}": ${err.message || 'Unknown parsing error'}`,
      422,
      'PDF_PARSE_FAILED'
    );
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch {
        // Ignore destroy error
      }
    }
  }
}
