import { Request, Response, NextFunction } from 'express';
import { getSupabaseClient } from '../lib/supabase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
  token?: string;
}

/**
 * Authentication Middleware
 * Validates Supabase JWT from the Authorization header and attaches the verified user to the request.
 */
export async function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Missing or invalid Authorization header. Expected Bearer token.',
        },
      });
      return;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Bearer token is empty.',
        },
      });
      return;
    }

    const supabase = getSupabaseClient();
    if (!supabase) {
      res.status(500).json({
        error: {
          code: 'CONFIG_ERROR',
          message: 'Supabase server configuration is missing or incomplete.',
        },
      });
      return;
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: error?.message || 'Invalid or expired authentication token.',
        },
      });
      return;
    }

    // Attach verified user and token
    req.user = {
      id: data.user.id,
      email: data.user.email,
    };
    req.token = token;

    next();
  } catch (err: any) {
    res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication failed.',
      },
    });
  }
}
