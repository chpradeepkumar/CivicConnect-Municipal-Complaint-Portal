import ApiError from '../utils/ApiError.js';

/**
 * Validates req.body/query/params against zod schemas.
 * Parsed (coerced) values replace the originals.
 */
export const validate = (schemas) => (req, _res, next) => {
  try {
    for (const key of ['body', 'query', 'params']) {
      if (schemas[key]) {
        const result = schemas[key].safeParse(req[key]);
        if (!result.success) {
          const details = result.error.issues.map((i) => ({
            field: i.path.join('.') || key,
            message: i.message,
          }));
          throw ApiError.badRequest('Validation failed', details);
        }
        req[key] = result.data;
      }
    }
    return next();
  } catch (err) {
    return next(err);
  }
};

export default validate;
