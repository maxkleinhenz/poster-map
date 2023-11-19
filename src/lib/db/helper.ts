import { z } from 'zod';

const whitespaceToUndefined = z
	.string()
	.trim()
	.max(0)
	.transform(() => undefined);

/**
 * Provide a schema and get a schema that is optional and empty strings are transformed to `undefined`.
 * When someone removes his input of this field, the then empty string is transformed to `undefined`.
 *
 * Example:
 *
 * A password field that is either filled with minimum 5 characters. If it is not filled,
 * it is "valid" as well, because it is `undefined` via the `transform`:
 *
 * `password: asOptionalStringWithoutEmpty(z.string().min(5)),`
 *
 * Imagine inputs in this order:
 *
 * | INPUT            | VALUE               | VALID?              |
 * | :--------------- | :------------------ | :------------------ |
 * | -nothing-        | undefined           | no
 * | a                | a                   | no
 * | bcdef            | abcdef              | yes (is min. 5)
 * | -def             | abc                 | no
 * | -abc             | "" -> undefined     | yes (is undefined)
 */
export function asOptionalString<T extends z.ZodString>(schema: T) {
	return schema.optional().or(whitespaceToUndefined);
}
