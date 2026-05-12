import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ZodError } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body) as never;
      }
      if (schemas.query) {
        req.query = schemas.query.parse(req.query) as never;
      }
      if (schemas.params) {
        req.params = schemas.params.parse(req.params) as never;
      }
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const details: Record<string, string[]> = {};
        for (const issue of error.issues) {
          const path = issue.path.join('.');
          if (!details[path]) {
            details[path] = [];
          }
          details[path].push(issue.message);
        }

        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            details,
          },
        });
        return;
      }
      next(error);
    }
  };
}
