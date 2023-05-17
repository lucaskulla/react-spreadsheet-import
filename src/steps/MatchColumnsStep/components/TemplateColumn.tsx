import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  Text,
  Tooltip,
  useStyleConfig,
} from "@chakra-ui/react"
import { useRsi } from "../../../hooks/useRsi"
import type { Column } from "../MatchColumnsStep"
import { ColumnType } from "../MatchColumnsStep"
import { MatchIcon } from "./MatchIcon"
import type { Field, Fields } from "../../../types"
import type { Translations } from "../../../translationsRSIProps"
import { MatchColumnSelect } from "../../../components/Selects/MatchColumnSelect"
import type { Styles } from "./ColumnGrid"
import React, { useEffect, useState } from "react"
import { SubMatchingSelect } from "./SubMatchingSelect"
import ModalAddField from "./InputDialog"
import { EditOrAddIcon } from "./AddEditIcon"
import type { JSONSchema6 } from "json-schema"
//TODO welche Schema migrieren und auch anschauen
//TODO X Daten abfragen nebeneinader anzeigen -> eindruck bekommen, wie unterschiedlich die Daten sind ggf. Diff Tool anschuane
//TODO Textbox xslt, java script (ggf. preview) (React comopents)
//TODO M Ende Validierung, ob Daten noch konform sind
const getAccordionTitle = <T extends string>(fields: Fields<T>, column: Column<T>, translations: Translations) => {
  const fieldLabel = fields.find((field) => "value" in column && field.key === column.value)!.label
  return `${translations.matchColumnsStep.matchDropdownTitle} ${fieldLabel} (${
    "matchedOptions" in column && column.matchedOptions.length
  } ${translations.matchColumnsStep.unmatched})`
}

type TemplateColumnProps<T extends string> = {
  onChange: (val: T, index: number) => void
  onSubChange: (val: T, index: number, option: string) => void
  column: Column<T>
  schema: JSONSchema6
  convertedSchema: Fields<string>
}

export const TemplateColumn = <T extends string>({ column, onChange, onSubChange }: TemplateColumnProps<T>) => {
  const { translations, getFields } = useRsi<T>() //removed fields from { fields, translations}
  const styles = useStyleConfig("MatchColumnsStep") as Styles
  const isIgnored = column.type === ColumnType.ignored
  const isChecked = //LK: wird benötigt um zu ermitteln, ob etwas ausgewählt wurde, um die Checkbox auszufüllen.
    column.type === ColumnType.matched ||
    column.type === ColumnType.matchedCheckbox ||
    column.type === ColumnType.matchedSelectOptions
  const fields = getFields()
  const isSelect = "matchedOptions" in column
  const [selectOption, setSelectOption] = useState<any>(fields.map(({ label, key }) => ({ value: key, label })))

  const selectValue = selectOption.find(({ value }) => "value" in column && column.value === value) //LK: gibt alle selektierten Values zurück
  const [savedInput, setSavedInput] = useState<Field<string>>({
    alternateMatches: [],
    description: "",
    example: "",
    fieldType: {
      type: "input",
    },
    key: "",
    label: "",
    validations: [],
  })

  const { setFields } = useRsi()

  const handleFormSubmit = (inputValue: Field<string>) => {
    setSavedInput(inputValue)
    localStorage.removeItem("fieldsList")
    localStorage.setItem("fieldsList", JSON.stringify(getFields()))
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    setSelectOption(fields.map(({ label, key }) => ({ value: key, label })))
  }, [fields])

  const addMissingFieldsFromHeader = (fields: Fields<string>, setFieldsFn: (field: Field<string>) => void) => {
    const schemaUsed = localStorage.getItem("schemaUsed")
    if (schemaUsed === "false") {
      console.log("ADdMissingFieldsFromHeader")
      const header = column.header
      if (fields === undefined) {
        return null
      } else {
        const key = fields.find((f) => f.key === header)
        if (key === undefined) {
          const alterMatches = []

          const headerWithoutUnderscore = header.replace(/_/g, " ")
          const headerInLowerCase = headerWithoutUnderscore.toLowerCase()
          const headerInUpperCase = headerInLowerCase.charAt(0).toUpperCase() + headerInLowerCase.slice(1)
          const headerInUpperCaseWithRest = headerInUpperCase + headerInLowerCase.slice(1)
          const headerInUpperCaseWithRestAndSpaces = headerInUpperCaseWithRest.replace(/ /g, "")

          alterMatches.push(headerWithoutUnderscore)

          if (alterMatches.some((item) => item === headerInLowerCase)) {
            alterMatches.push(headerInLowerCase)
          }
          if (alterMatches.some((item) => item === headerInUpperCase)) {
            alterMatches.push(headerInUpperCase)
          }
          if (alterMatches.some((item) => item === headerInUpperCaseWithRest)) {
            alterMatches.push(headerInUpperCaseWithRest)
          }
          if (alterMatches.some((item) => item === headerInUpperCaseWithRestAndSpaces)) {
            alterMatches.push(headerInUpperCaseWithRestAndSpaces)
          }

          const fieldToAdd: Field<string> = {
            alternateMatches: alterMatches,
            description: "This field element is automatically generated",
            example: "",
            fieldType: {
              type: "input",
            },
            key: header,
            label: header,
            validations: [],
          }
          setFieldsFn(fieldToAdd)
        } else {
          // do nothing, key exists.
        }
      }
      const allFields = getFields()

      // Check if "id" field exists
      const idField = allFields.find((f) => f.key === "id")
      if (!idField) {
        const idFieldToAdd: Field<string> = {
          alternateMatches: ["id"],
          description: "This id field is automatically generated",
          example: "",
          fieldType: {
            type: "input",
          },
          key: "id",
          label: "id",
          validations: [],
        }
        setFieldsFn(idFieldToAdd)
      }

      const allFieldsNew = getFields()
      localStorage.setItem("fieldsList", JSON.stringify(allFieldsNew))
    }
  }

  return (
    <Flex minH={10} w="100%" flexDir="column" justifyContent="center">
      {(() => addMissingFieldsFromHeader(useRsi().getFields(), setFields))()}
      {isIgnored ? (
        <Text sx={styles.selectColumn.text}>{translations.matchColumnsStep.ignoredColumnText}</Text>
      ) : (
        <>
          <Flex alignItems="center" minH={10} w="100%">
            <Box flex={1}>
              <MatchColumnSelect //LK: replace MatchColumnSelect with AddColumn and you can add test :)
                placeholder={translations.matchColumnsStep.selectPlaceholder}
                value={selectValue} //LK: Wenn ich hier was veränder, funktioniert select column nicht mehr.
                onChange={(value) => onChange(value?.value as T, column.index)}
                options={selectOption}
                name={column.header}
              />
            </Box>
            <MatchIcon isChecked={isChecked} />
            <Tooltip label={!isChecked ? "Add a field" : "Edit Text"} aria-label="A tooltip">
              <Button
                leftIcon={<EditOrAddIcon isEdit={isChecked} />}
                variant="light"
                onClick={handleOpenModal}
                boxSize={1}
              ></Button>
            </Tooltip>
            <Box>
              <ModalAddField
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleFormSubmit}
                isChecked={isChecked}
                column={column}
              />
            </Box>
          </Flex>
          {isSelect && (
            <Flex width="100%">
              <Accordion allowMultiple width="100%">
                <AccordionItem border="none" py={1}>
                  <AccordionButton
                    _hover={{ bg: "transparent" }}
                    _focus={{ boxShadow: "none" }}
                    px={0}
                    py={4}
                    data-testid="accordion-button"
                  >
                    <AccordionIcon />
                    <Box textAlign="left">
                      <Text sx={styles.selectColumn.accordionLabel}>
                        {getAccordionTitle<T>(fields, column, translations)}
                      </Text>
                    </Box>
                  </AccordionButton>
                  <AccordionPanel pb={4} pr={3} display="flex" flexDir="column">
                    {column.matchedOptions.map((option) => (
                      <SubMatchingSelect option={option} column={column} onSubChange={onSubChange} key={option.entry} />
                    ))}
                  </AccordionPanel>
                </AccordionItem>
              </Accordion>
            </Flex>
          )}
        </>
      )}
    </Flex>
  )
}
