import {
  Button,
  FormControl,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Textarea,
  useStyleConfig,
} from "@chakra-ui/react"
import Form from "@rjsf/core"
import React from "react"
import type { themeOverrides } from "../../../theme"
import type { Column } from "../MatchColumnsStep"
import { useRsi } from "../../../hooks/useRsi"
import ReactSelect from "react-select"
import validator from "@rjsf/validator-ajv8"
import type { RJSFSchema } from "@rjsf/utils"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: FormData) => void
  isChecked: boolean
  column: Column<string>
}

const MyModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, isChecked, column }) => {
  const schemaField: RJSFSchema = {
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
      alternateMatchesArray: {
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
    "MatchColumnsStep",
  ) as typeof themeOverrides["components"]["MatchColumnsStep"]["baseStyle"]

  const ChakraInput = (props) => {
    const { propertyName, onChange, onBlur, onFocus, value } = props
    return (
      <>
        <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onFocus={onFocus} />
      </>
    )
  }

  const ChakraTextarea = (props) => {
    const { propertyName, onChange, onBlur, onFocus, value } = props
    return (
      <>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onFocus={onFocus} />
      </>
    )
  }

  const AlternateMatchesWidget = (props) => {
    const { id, label, value, onChange, onBlur, onFocus } = props

    const [inputValue, setInputValue] = React.useState("")
    const [options, setOptions] = React.useState(value.map((val) => ({ value: val, label: val })))

    const handleTagsChange = (selectedOptions) => {
      onChange(selectedOptions.map((option) => option.value))
    }

    const handleInputChange = (inputValue) => {
      setInputValue(inputValue)
    }

    const handleKeyDown = (event) => {
      if (!inputValue) return
      switch (event.key) {
        case "Enter":
        case "Tab":
          event.preventDefault()
          setInputValue("")
          setOptions([...options, { value: inputValue, label: inputValue }])
          onChange([...value, inputValue])
          break
        default:
          break
      }
    }

    const handleBlur = () => {
      onBlur(id, value)
    }

    const handleFocus = () => {
      onFocus(id, value)
    }

    const selectedOptions = (value || []).map((val) => ({ value: val, label: val }))

    return (
      <FormControl id={id}>
        <ReactSelect
          isMulti
          value={selectedOptions}
          options={options}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          onChange={handleTagsChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Type and press enter..."
        />
      </FormControl>
    )
  }

  const ChakraSelect = (props) => {
    const { id, label, options, value, onChange, onBlur, onFocus } = props

    const handleChange = (event) => {
      onChange(event.target.value)
    }

    const handleBlur = () => {
      onBlur(id, value)
    }

    const handleFocus = () => {
      onFocus(id, value)
    }

    return (
      <FormControl id={id}>
        <Select value={value || ""} onChange={handleChange} onBlur={handleBlur} onFocus={handleFocus}>
          {options.enumOptions.map(({ value, label }, index) => (
            <option key={index} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </FormControl>
    )
  }

  const uiSchema = {
    "ui:rootFieldId": "label",
    "ui:autofocus": true,
    label: {
      "ui:widget": (props) => <ChakraInput {...props} />,
    },
    key: {
      "ui:widget": (props) => <ChakraInput {...props} />,
    },
    description: {
      "ui:widget": (props) => <ChakraTextarea {...props} />,
    },
    alternateMatchesArray: {
      "ui:widget": (props) => <AlternateMatchesWidget {...props} />,
    },
    validations: {
      "ui:widget": "select",
      "ui:options": {
        className: "form-control",
      },
    },
    fieldType: {
      "ui:widget": (props) => <ChakraSelect {...props} />,
    },
    example: {
      "ui:widget": (props) => <ChakraTextarea {...props} />,
    },
  }

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} scrollBehavior={scrollBehavior}>
        <Heading {...styles.heading}></Heading>
        <ModalOverlay />
        <ModalContent {...styles.userTable}>
          <ModalHeader>Add Item Field</ModalHeader>
          <ModalBody>
            <Form
              schema={schemaField}
              uiSchema={uiSchema}
              onSubmit={handleSubmit}
              formData={useRsi().getSpecificField(column.value)}
              validator={validator}
            >
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
