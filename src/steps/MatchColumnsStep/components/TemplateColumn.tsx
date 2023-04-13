import {
  Flex,
  Text,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  Box,
  AccordionPanel,
  useStyleConfig,
} from "@chakra-ui/react"
import { useRsi } from "../../../hooks/useRsi"
import type { Column } from "../MatchColumnsStep"
import { ColumnType } from "../MatchColumnsStep"
import { MatchIcon } from "./MatchIcon"
import type { Fields } from "../../../types"
import type { Translations } from "../../../translationsRSIProps"
import { MatchColumnSelect, AddColumn } from "../../../components/Selects/MatchColumnSelect"
import { SubMatchingSelect } from "./SubMatchingSelect"
import type { Styles } from "./ColumnGrid"
import { AddValueForColumn } from "./AddLabel"
import InputForm from "../../../../src/components/Selects/InputFormAddValue"
import { useState } from "react";


const getAccordionTitle = <T extends string>(fields: Fields<T>, column: Column<T>, translations: Translations) => {
  const fieldLabel = fields.find((field) => "value" in column && field.key === column.value)!.label
  return `${translations.matchColumnsStep.matchDropdownTitle} ${fieldLabel} (${"matchedOptions" in column && column.matchedOptions.length
    } ${translations.matchColumnsStep.unmatched})`
}

type TemplateColumnProps<T extends string> = {
  onChange: (val: T, index: number) => void
  onSubChange: (val: T, index: number, option: string) => void
  column: Column<T>
}



export const TemplateColumn = <T extends string>({ column, onChange, onSubChange }: TemplateColumnProps<T>) => {
  const { translations, fields } = useRsi<T>()
  const styles = useStyleConfig("MatchColumnsStep") as Styles
  const isIgnored = column.type === ColumnType.ignored
  const isChecked = //LK: wird benötigt um zu ermitteln, ob etwas ausgewählt wurde, um die Checkbox auszufüllen. 
    column.type === ColumnType.matched ||
    column.type === ColumnType.matchedCheckbox ||
    column.type === ColumnType.matchedSelectOptions ||
    column.type === ColumnType.addSelectOption
  const isSelect = "matchedOptions" in column
  const selectOptions = fields.map(({ label, key }) => ({ value: key, label })) //beinhaltet alle möglichen Optionien, die man auwählen kann.

  let selectValue = selectOptions.find(({ value }) => "value" in column && column.value === value) //LK: gibt alle selektierten Values zurück
  const [savedInput, setSavedInput] = useState("");


  const handleFormSubmit = (inputValue: string) => {
    setSavedInput(inputValue);
  };

  return (
    <Flex minH={10} w="100%" flexDir="column" justifyContent="center">
      {isIgnored ? (
        <Text sx={styles.selectColumn.text}>{translations.matchColumnsStep.ignoredColumnText}</Text>
      ) : (
        <>
        {console.log("selectOptions: "+ selectOptions.at(1)?.label)}
          <Flex alignItems="center" minH={10} w="100%">
            <Box flex={1}>
              <MatchColumnSelect //LK: replace MatchColumnSelect with AddColumn and you can add test :) 
                placeholder={translations.matchColumnsStep.selectPlaceholder}
                value={selectValue} //LK: Wenn ich hier was veränder, funktioniert select column nicht mehr. 
                onChange={(value) => onChange(value?.value as T, column.index)}
                options={selectOptions}
                name={column.header}
              />
            </Box>
            <MatchIcon isChecked={isChecked} />
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
                  <Box>
                    <InputForm onSubmit={handleFormSubmit} />
                    {savedInput && (
                      <Box mt={4}>
                        <p>Your input: {savedInput}</p>
                      </Box>
                    )}
                  </Box>

                </AccordionItem>
              </Accordion>
            </Flex>
          )}
        </>
      )}
    </Flex>
  )
}
