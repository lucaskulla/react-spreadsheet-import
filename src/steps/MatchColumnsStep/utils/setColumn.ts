import type { Field } from "../../../types"
import { Column, ColumnType, MatchColumnsProps } from "../MatchColumnsStep"
import { uniqueEntries } from "./uniqueEntries"

export const setColumn = <T extends string>(
  oldColumn: Column<T>,
  field?: Field<T>,
  data?: MatchColumnsProps<T>["data"],
): Column<T> => {
  switch (field?.fieldType.type) {
    case "select":
      return {
        ...oldColumn,
        type: ColumnType.matchedSelect,
        value: field.key,
        matchedOptions: uniqueEntries(data || [], oldColumn.index),
      }
    case "checkbox":
      return { index: oldColumn.index, type: ColumnType.matchedCheckbox, value: field.key, header: oldColumn.header }
    case "input":
      return { index: oldColumn.index, type: ColumnType.matched, value: field.key, header: oldColumn.header }
    case "addOption": //LK: Hier wird das Column aufgebaut.
      return {
        ...oldColumn,
        type: ColumnType.addSelectOption,
        value: field.key, //wenn ich hier label hinschreibe, wird das Label zurückgegeben
        matchedOptions: uniqueEntries(data || [], oldColumn.index),
      }
    default:
      return { index: oldColumn.index, header: oldColumn.header, type: ColumnType.empty }
  }
}
