import type { Field, Fields } from "../types"

function jsonSchemaToFields(schema: any): Fields<string> {
  const fields: Field<string>[] = []

  for (const key in schema.properties) {
    const property = schema.properties[key]
    const field: Field<string> = {
      label: property.title ?? key,
      key: key,
      description: property.description,
      validations: property.required ? [{ rule: "required" }] : [],
      fieldType: {
        type: property.enum ? "select" : "input",
        options: property.enum
          ? property.enum.map((value: any) => ({
              label: value.toString(),
              value: value.toString(),
            }))
          : undefined,
      },
    }
    fields.push(field)
  }

  return fields
}

export default jsonSchemaToFields
