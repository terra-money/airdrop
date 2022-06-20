import Joi from "joi";

export const ClaimRequest = Joi.object({
  body: Joi.object({
    signature: Joi.string().required(),
    new_terra_address: Joi.string().required(),
  }),
  params: Joi.object({
    chain: Joi.string().required(),
    address: Joi.string().required(),
  }).unknown(),
}).unknown();

export const AllocationValidation = Joi.object({
  address: Joi.string().lowercase().required(),
  amount0: Joi.string().default("0"),
  amount1: Joi.string().default("0"),
  amount2: Joi.string().default("0"),
  amount3: Joi.string().default("0"),
  amount4: Joi.string().default("0"),
});

export const validateAndClean = <T>(obj: T, schema: Joi.Schema): T => {
  const { value: clean } = schema.validate(obj);
  return clean;
};
