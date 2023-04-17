import { Box, Text, useStyleConfig } from "@chakra-ui/react"
import { AddColumn } from "../../../components/Selects/MatchColumnSelect"
import { getFieldOptions } from "../utils/getFieldOptions"
import { useRsi } from "../../../hooks/useRsi"
import type { AddSelectColumn, InputOptions, MatchedOptions, MatchedSelectColumn, MatchedSelectOptionsColumn } from "../MatchColumnsStep"
import type { Styles } from "./ColumnGrid"

interface Props<T> {
  option: MatchedOptions<T>
  column: AddSelectColumn<T> | MatchedSelectColumn<T> | MatchedSelectOptionsColumn<T> //MatchSelect und Option wird benötigt, da über das Template "theoretishc" alles kommen kann...
  onSubChange: (val: T, index: number, option: string) => void
}

export const AddValueForColumn = <T extends string>({ option, column, onSubChange }: Props<T>) => {
  const styles = useStyleConfig("MatchColumnsStep") as Styles
  const { translations, fields } = useRsi<T>()
  const options = getFieldOptions(fields, column.value) //LK: schauen, ob ich die und die folgende Zeile überhaupt brauche
  const value = options.find((opt) => opt.value == option.value)

  return (
    <Box pl={2} pb="0.375rem">
      <Text sx={styles.selectColumn.selectLabel}>{"option.entry created by lucas"}</Text>
      <AddColumn
        value={value}
        placeholder={translations.matchColumnsStep.addPlaceholder}
        onChange={(value) => onChange(value?.value as T, column.index)}
        //options={options}
        name={option.entry}
      />
    </Box>
  )
}
