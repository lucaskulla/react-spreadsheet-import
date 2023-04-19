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
import type { Fields } from "../../../types"
import type { Translations } from "../../../translationsRSIProps"
import { MatchColumnSelect } from "../../../components/Selects/MatchColumnSelect"
import type { Styles } from "./ColumnGrid"
import React, { useState } from "react"
import AddIcon from "./AddIcon"
import { SubMatchingSelect } from "./SubMatchingSelect"
import MyModal from "./InputDialog"

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
}

export const TemplateColumn = <T extends string>({ column, onChange, onSubChange }: TemplateColumnProps<T>) => {
  const { translations } = useRsi<T>() //removed fields from { fields, translations}
  const styles = useStyleConfig("MatchColumnsStep") as Styles
  const isIgnored = column.type === ColumnType.ignored
  const isChecked = //LK: wird benötigt um zu ermitteln, ob etwas ausgewählt wurde, um die Checkbox auszufüllen.
    column.type === ColumnType.matched ||
    column.type === ColumnType.matchedCheckbox ||
    column.type === ColumnType.matchedSelectOptions
  const fields = useRsi<T>().getFields()
  const isSelect = "matchedOptions" in column
  const selectOptions = fields.map(({ label, key }) => ({ value: key, label })) //beinhaltet alle möglichen Optionien, die man auwählen kann.

  const selectValue = selectOptions.find(({ value }) => "value" in column && column.value === value) //LK: gibt alle selektierten Values zurück
  const [savedInput, setSavedInput] = useState("")

  const handleFormSubmit = (inputValue: FormData) => {
    setSavedInput(inputValue["label"])
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <Flex minH={10} w="100%" flexDir="column" justifyContent="center">
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
                options={selectOptions}
                name={column.header}
              />
            </Box>
            <MatchIcon isChecked={isChecked} />
            <Tooltip label="Add a field" aria-label="A tooltip">
              <Button leftIcon={<AddIcon />} variant="light" onClick={handleOpenModal} boxSize={1}></Button>
            </Tooltip>
            <Box>
              <MyModal isOpen={isModalOpen} onClose={handleCloseModal} onSubmit={handleFormSubmit} />
              {useRsi().setFields(savedInput)}
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
