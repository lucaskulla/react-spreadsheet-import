import type { Field } from "../types"

type JSONSchema = {
  [key: string]: any
}
function fieldsToJsonSchema(fields: Field<string>[]): JSONSchema {
  const schema: JSONSchema = {
    $defs: {},
    properties: {},
    required: [],
  }

  const addPropertyToSchema = (schema: JSONSchema, propertyPath: string[], field: Field<string>) => {
    let currentObject = schema

    for (let i = 0; i < propertyPath.length; i++) {
      const propertyName = propertyPath[i]

      if (i === propertyPath.length - 1) {
        currentObject.properties[propertyName] = {
          type: "string",
          description: field.description,
          examples: field.example ? [field.example] : undefined,
        }

        // Add validations
        field.validations.forEach((validation) => {
          if (validation.rule === "required") {
            schema.required.push(propertyName)
          } else if (validation.rule === "regex") {
            currentObject.properties[propertyName].pattern = validation.value
          }
        })

        // Add alternateMatches
        if (field.alternateMatches) {
          currentObject.properties[propertyName]["x-alternateMatches"] = field.alternateMatches
        }
      } else {
        if (!currentObject.properties[propertyName]) {
          const definitionName = propertyName //TODO: check name that is liked e.g. +def
          schema.$defs[definitionName] = {
            type: "object",
            properties: {},
          }

          currentObject.properties[propertyName] = {
            $ref: `#/definitions/${definitionName}`,
          }

          currentObject = schema.$defs[definitionName]
        } else {
          const definitionName = propertyName //TODO: check name that is liked e.g. +def
          currentObject = schema.$defs[definitionName]
        }
      }
    }
  }

  fields.forEach((field) => {
    const propertyPath = field.label.split(".")
    addPropertyToSchema(schema, propertyPath, field)
  })

  return schema
}

export default fieldsToJsonSchema
