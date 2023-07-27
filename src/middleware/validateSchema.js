export function validateSchema(schema, type) {
  return (req, res, next) => {
    if (!type) return res.status(422).send(`Invalid data type: ${type}`);

    const validation = schema.validate(req[type], { abortEarly: false });

    if (validation.error) {
      const errors = validation.error.details.map((detail) => detail.message);
      console.error(errors);
      return res.status(422).send(errors);
    }

    res.locals[type] = validation.value;

    next();
  };
}
