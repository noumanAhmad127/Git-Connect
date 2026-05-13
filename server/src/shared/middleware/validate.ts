import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';

interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, _res: Response, next: NextFunction): void => {
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
      next(error);
    }
  };
}
