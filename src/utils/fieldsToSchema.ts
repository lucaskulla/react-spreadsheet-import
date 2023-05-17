import type { Field } from "../types"

type JSONSchema = {
  [key: string]: any
}

function incrementVersion(version: string): string {
  const parts = version.split(".")
  const lastIndex = parts.length - 1
  parts[lastIndex] = String(Number(parts[lastIndex]) + 1)
  return parts.join(".")
}

function fieldsToJsonSchema(fields: Field<string>[], schemaUsed: boolean): JSONSchema {
  let nextVersion = undefined
  let id = undefined
  if (schemaUsed) {
    const stringToMatch = localStorage.getItem("schemaToUse")

    if (stringToMatch) {
      const versionRegex = /(\d+\.\d+\.\d+)/
      const match = stringToMatch.match(versionRegex)
      if (match) {
        const version = match[1]
        nextVersion = incrementVersion(version)
      } else {
        console.log("Version not found")
      }

      const versionIndex = stringToMatch.lastIndexOf(":") // find the last occurrence of ":"
      id = stringToMatch.substring(0, versionIndex) // extract everything before the version
    }
  } else {
    id = "urn:kaapana:newschema"
    nextVersion = "0.0.1"
  }

  const schema: JSONSchema = {
    $defs: {},
    properties: {},
    $id: id,
    $schema: "http://json-schema.org/draft-07/schema#",
    additionalProperties: true,
    metamodel_version: "1.7.0",
    required: ["id"], //ToDO check with Philipp
    version: nextVersion,
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
        if (field.validations) {
          console.log(field.validations, "field.validations")
          for (let i = 0; i < field.validations.length; i++) {
            const validation = field.validations[i]
            if (validation.rule === "required") {
              schema.required.push(propertyName)
            } else if (validation.rule === "regex") {
              currentObject.properties[propertyName].pattern = validation.value
            }
          }
        }

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
            $ref: `#/$defs/${definitionName}`,
          }

          currentObject = schema.$defs[definitionName]
        } else {
          const definitionName = propertyName //TODO: check name that is liked e.g. +def
          currentObject = schema.$defs[definitionName]
        }
      }
    }
  }
  for (let i = 0; i < fields.length; i++) {
    const propertyPath = fields[i].label.split(".")
    addPropertyToSchema(schema, propertyPath, fields[i])
  }

  return schema
}

export default fieldsToJsonSchema
