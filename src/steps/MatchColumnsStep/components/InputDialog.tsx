import {
  Button,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useStyleConfig,
} from "@chakra-ui/react"
import Form from "react-jsonschema-form"
import React from "react"
import type { JSONSchema6 } from "json-schema"
import type { themeOverrides } from "../../../theme"
import type { Column } from "../MatchColumnsStep"
import { useRsi } from "../../../hooks/useRsi"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => void
  isChecked: boolean
  column: Column<string>
}

const MyModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, isChecked, column }) => {
  const schemaField: JSONSchema6 = {
    type: "object",
    properties: {
      label: {
        type: "string",
      },
      key: {
        type: "string",
      },
      description: {
        type: "string",
      },
      alternateMatches: {
        type: "array",
        items: {
          type: "string",
        },
      },
      validations: {
        type: "array",
        items: {
          $ref: "#/definitions/Validation",
        },
      },
      fieldType: {
        $ref: "#/definitions/FieldType",
      },
      example: {
        type: "string",
      },
    },
    required: ["label", "key", "fieldType"],
    additionalProperties: false,
    definitions: {
      Validation: {
        type: "object",
        properties: {
          rule: {
            type: "string",
            enum: ["required", "unique", "regex"],
          },
          value: {
            type: "string",
          },
          flags: {
            type: "string",
          },
          errorMessage: {
            type: "string",
          },
          level: {
            type: "string",
            enum: ["warning", "error"],
          },
          allowEmpty: {
            type: "boolean",
          },
        },
        required: ["rule", "errorMessage"],
        additionalProperties: false,
      },
      FieldType: {
        type: "object",
        oneOf: [
          {
            properties: {
              type: {
                type: "string",
                enum: ["checkbox"],
              },
              booleanMatches: {
                type: "object",
                additionalProperties: {
                  type: "boolean",
                },
              },
            },
            required: ["type"],
            additionalProperties: false,
          },
          {
            properties: {
              type: {
                type: "string",
                enum: ["select"],
              },
              options: {
                type: "array",
                items: {
                  $ref: "#/definitions/SelectOption",
                },
              },
            },
            required: ["type", "options"],
            additionalProperties: false,
          },
          {
            properties: {
              type: {
                type: "string",
                enum: ["addOption"],
              },
              value: {
                type: "string",
              },
            },
            required: ["type", "value"],
            additionalProperties: false,
          },
          {
            properties: {
              type: {
                type: "string",
                enum: ["input"],
              },
            },
            required: ["type"],
            additionalProperties: false,
          },
        ],
      },
      SelectOption: {
        type: "object",
        properties: {
          label: {
            type: "string",
          },
          value: {
            type: "string",
          },
        },
        required: ["label", "value"],
        additionalProperties: false,
      },
    },
  }
  const handleSubmit = ({ formData }: { formData: FormData }) => {
    onSubmit(formData)
    onClose()
  }
  const [scrollBehavior, setScrollBehavior] = React.useState("inside")
  const btnRef = React.useRef(null)

  const styles = useStyleConfig(
    "SelectHeaderStep",
  ) as typeof themeOverrides["components"]["SelectHeaderStep"]["baseStyle"]

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={scrollBehavior}>
        <Heading {...styles.heading}></Heading>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Item Field</ModalHeader>
          <ModalBody>
            <Form schema={schemaField} onSubmit={handleSubmit} formData={useRsi().getSpecificField(column.value)}>
              <Button type="submit">Add</Button>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default MyModal
