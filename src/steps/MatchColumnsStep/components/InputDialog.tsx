import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
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
import Form, { IChangeEvent } from "@rjsf/core"
import React, { FormEvent } from "react"
import type { themeOverrides } from "../../../theme"
import type { Column } from "../MatchColumnsStep"
import { useRsi } from "../../../hooks/useRsi"
import ReactSelect from "react-select"
import validator from "@rjsf/validator-ajv8"
import type { RJSFSchema } from "@rjsf/utils"
import type { Field } from "../../../types"
import type { MultiValue } from "chakra-react-select"

//TODO Ende Validierung
//TODO Post der Daten ggf. 5 Seite erstellen

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (formData: Field<string>) => void
  isChecked: boolean
  column: Column<string>
}

interface ValidationEditorProps {
  index: React.Key | null | undefined
}

const ModalAddField: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, isChecked, column }) => {
  const { getSpecificField, addField, getFields } = useRsi()

  const [createNewField, setCreateNewField] = React.useState(false)

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
        enum: ["checkbox", "select", "input"],
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
    },
  }

  interface MyFormData extends FormData {
    fieldType?: { type: string } | string
  }

  const handleSubmit = (data: IChangeEvent<MyFormData, RJSFSchema, any>, event: FormEvent<any>) => {
    const { formData } = data

    //This if is needed because officially FieldType is an array, however, in the schema above it is just an enum, because it is easier to display. Here is the array created
    if (formData) {
      if (typeof formData.fieldType === "string") {
        formData.fieldType = { type: formData.fieldType }
      }
    }

    const f = formData as unknown as Field<string>
    addField(f)
    setCreateNewField(false)
    onSubmit(f)
    onClose()
  }

  const [scrollBehavior, setScrollBehavior] = React.useState("inside")
  const btnRef = React.useRef(null)

  const styles = useStyleConfig(
    "MatchColumnsStep",
  ) as typeof themeOverrides["components"]["MatchColumnsStep"]["baseStyle"]

  const handleToggleCreateNewField = () => {
    setCreateNewField((prevValue) => !prevValue)
  }

  // Reset createNewField whenever the modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setCreateNewField(false)
    }
  }, [isOpen])

  //Key is a special case. If the key already exists, the field is disabled
  const ChakraInputKey = (props: { onChange: any; onBlur: any; onFocus: any; value?: "" | undefined }) => {
    const { onChange, onBlur, onFocus, value = "" } = props

    // Get specific field data based on the current key
    const currentField = getSpecificField(value)

    return (
      <>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onFocus={onFocus}
          // Disable the field if the key already exists
          isDisabled={currentField !== undefined}
        />
      </>
    )
  }

  const ChakraInput = (props: { onChange: any; onBlur: any; onFocus: any; value?: "" | undefined }) => {
    const { onChange, onBlur, onFocus, value = "" } = props
    return (
      <>
        <Input value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onFocus={onFocus} />
      </>
    )
  }

  const ChakraTextarea = (props: { onChange: any; onBlur: any; onFocus: any; value: any }) => {
    const { onChange, onBlur, onFocus, value } = props
    return (
      <>
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} onFocus={onFocus} />
      </>
    )
  }

  const AlternateMatchesWidget = (props: { id: any; value: any; onChange: any; onBlur: any; onFocus: any }) => {
    const { id, value, onChange, onBlur, onFocus } = props

    const [inputValue, setInputValue] = React.useState("")
    const [options, setOptions] = React.useState(
      value.map((val: { label: any; value: any }) => ({ value: val, label: val })),
    )

    const handleTagsChange = (selectedOptions: MultiValue<any>) => {
      const updatedOptions = selectedOptions.map((option) => ({ value: option.value, label: option.value }))
      onChange(updatedOptions)
    }

    const handleInputChange = (inputValue: React.SetStateAction<string>) => {
      setInputValue(inputValue)
    }

    const handleKeyDown = (event: { key: any; preventDefault: () => void }) => {
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

    const selectedOptions = (value || []).map((val: { label: any; value: any }) => ({ value: val, label: val }))

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

  const ChakraSelect = (props: { id: any; options: any; value: any; onChange: any; onBlur: any; onFocus: any }) => {
    const { id, options, value, onChange, onBlur, onFocus } = props
    const handleChange = (event: { target: { value: any } }) => {
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
          {options.enumOptions.map(
            (
              // @ts-ignore
              { value, label },
              // @ts-ignore
              index,
            ) => (
              <option key={index} value={value}>
                {label}
              </option>
            ),
          )}
        </Select>
      </FormControl>
    )
  }

  const ValidationsField = (props: { formData: any; onChange: any }) => {
    const { formData, onChange } = props

    const [currentValidations, setCurrentValidations] = React.useState(formData || [])

    const updateValidation = (index: React.Key | null | undefined, updatedValidation: any) => {
      const newValidations = currentValidations.slice()
      if (index === null || index === undefined) return
      newValidations[index] = updatedValidation
      setCurrentValidations(newValidations)
      onChange(newValidations)
    }

    const handleAddValidation = () => {
      setCurrentValidations([...currentValidations, {}])
      onChange([...currentValidations, {}])
    }

    return (
      <Box>
        {currentValidations.map((validation: any, index: React.Key | null | undefined) => (
          <ValidationEditor
            key={index}
            index={index}
            validation={validation}
            onChange={(updatedValidation: any) => updateValidation(index, updatedValidation)}
          />
        ))}
        <Button onClick={handleAddValidation} mt={2} colorScheme="gray">
          Add Validation
        </Button>
      </Box>
    )
  }

  const ValidationEditor = ({
    index,
    validation,
    onChange,
  }: {
    index: React.Key | null | undefined
    validation: any
    onChange: (updatedValidation: any) => void
  }) => {
    const [currentValidation, setCurrentValidation] = React.useState(validation)

    const handleFieldChange = (field: string, value: string | boolean) => {
      setCurrentValidation({ ...currentValidation, [field]: value })
      onChange({ ...currentValidation, [field]: value })
    }

    return (
      <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
        <FormControl>
          <FormLabel>Rule</FormLabel>
          <Select value={currentValidation.rule || ""} onChange={(e) => handleFieldChange("rule", e.target.value)}>
            <option value="">Select a rule</option>
            <option value="required">Required</option>
            <option value="unique">Unique</option>
            <option value="regex">Regex</option>
          </Select>
        </FormControl>
        {currentValidation.rule === "regex" && (
          <FormControl>
            <FormLabel>Value</FormLabel>
            <Input value={currentValidation.value || ""} onChange={(e) => handleFieldChange("value", e.target.value)} />
          </FormControl>
        )}
        {currentValidation.rule === "regex" && (
          <FormControl>
            <FormLabel>Flags</FormLabel>
            <Input value={currentValidation.flags || ""} onChange={(e) => handleFieldChange("flags", e.target.value)} />
          </FormControl>
        )}
        <FormControl>
          <FormLabel>Error Message</FormLabel>
          <Input
            value={currentValidation.errorMessage || ""}
            onChange={(e) => handleFieldChange("errorMessage", e.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Level</FormLabel>
          <Select value={currentValidation.level || ""} onChange={(e) => handleFieldChange("level", e.target.value)}>
            <option value="">Select a level</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </Select>
        </FormControl>
        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Allow Empty</FormLabel>
          <Checkbox
            isChecked={currentValidation.allowEmpty || false}
            onChange={(e) => handleFieldChange("allowEmpty", e.target.checked)}
          />
        </FormControl>
      </Box>
    )
  }

  const uiSchema = {
    "ui:rootFieldId": "label",
    "ui:autofocus": true,
    label: {
      "ui:widget": (
        props: JSX.IntrinsicAttributes & { onChange: any; onBlur: any; onFocus: any; value?: "" | undefined },
      ) => <ChakraInput {...props} />,
    },
    key: {
      "ui:widget": (
        props: JSX.IntrinsicAttributes & { onChange: any; onBlur: any; onFocus: any; value?: "" | undefined },
      ) => <ChakraInput {...props} />,
    },
    description: {
      "ui:widget": (props: JSX.IntrinsicAttributes & { onChange: any; onBlur: any; onFocus: any; value: any }) => (
        <ChakraTextarea {...props} />
      ),
    },
    alternateMatchesArray: {
      "ui:widget": (
        props: JSX.IntrinsicAttributes & { id: any; value: any; onChange: any; onBlur: any; onFocus: any },
      ) => <AlternateMatchesWidget {...props} />,
    },
    validations: {
      "ui:widget": (props: JSX.IntrinsicAttributes & { formData: any; onChange: any }) => (
        <ValidationsField {...props} />
      ),
    },
    fieldType: {
      "ui:widget": (
        props: JSX.IntrinsicAttributes & {
          id: any
          options: any
          value: any
          onChange: any
          onBlur: any
          onFocus: any
        },
      ) => <ChakraSelect {...props} />,
    },
    example: {
      "ui:widget": (props: JSX.IntrinsicAttributes & { onChange: any; onBlur: any; onFocus: any; value: any }) => (
        <ChakraTextarea {...props} />
      ),
    },
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        // @ts-ignore
        scrollBehavior={scrollBehavior}
      >
        <Heading {...styles.heading}></Heading>
        <ModalOverlay />
        <ModalContent {...styles.userTable}>
          <ModalHeader>Add Item Field</ModalHeader>
          <ModalBody>
            <Form
              schema={schemaField}
              uiSchema={uiSchema}
              onSubmit={handleSubmit}
              // @ts-ignore
              formData={createNewField ? "" : getSpecificField(column.value)}
              validator={validator}
            >
              <Button type="submit">save</Button>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={handleToggleCreateNewField}>
              {createNewField ? "Modify Existing Field" : "Create New Field"}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default ModalAddField
