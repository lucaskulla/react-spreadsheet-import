import type { Field, Fields } from "../types"

function jsonSchemaToFields(schema: any): Fields<string> {
  const defs = schema.$defs

  const f = convertJsonToFields(schema, defs)

  //const flatten = require("flat").flatten
  const fields: Fields<string> = []
  //const schemaFlat = flatten(schema) as JSONSchema6
  for (const key in f) {
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

//TODO: flatten schema
//ToDo: Primitive Datentypen unterstützen; Nested Objekte auch können
//ToDo: validation rules auch einfügen
//ToDo: am Bsp. von Philipp testen
export default jsonSchemaToFields

interface JsonSchema {
  properties: {
    [key: string]: {
      description?: string
      type: string
      $ref?: string
      items?: {
        type: string
        $ref?: string
      }
    }
  }
}

function convertJsonToFields(json: JsonSchema, defs: { [key: string]: JsonSchema }): Fields<string> {
  const fields: Fields<string> = {}

  for (const key in json.properties) {
    const property = json.properties[key]
    let fieldType: "string" | "boolean" | "number" = "string"

    if (property.$ref) {
      const defKey = property.$ref.split("/").pop()!
      const def = defs[defKey]
      fields[key] = {
        label: key,
        key,
        description: property.description,
        fieldType: "object",
        ...convertJsonToFields(def, defs),
      }
    } else if (property.type === "array" && property.items?.$ref) {
      const defKey = property.items.$ref.split("/").pop()!
      const def = defs[defKey]
      fields[key] = {
        label: key,
        key,
        description: property.description,
        fieldType: "array",
        ...convertJsonToFields(def, defs),
      }
    } else {
      if (property.type === "string") fieldType = "string"
      else if (property.type === "boolean") fieldType = "boolean"
      else if (property.type === "number" || property.type === "integer") fieldType = "number"

      fields[key] = {
        label: key,
        key,
        description: property.description,
        fieldType,
      }
    }
  }

  return fields
}
