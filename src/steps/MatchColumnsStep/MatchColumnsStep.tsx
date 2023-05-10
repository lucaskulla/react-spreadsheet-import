import { useCallback, useEffect, useMemo, useState } from "react"
import { useToast } from "@chakra-ui/react"
import { UserTableColumn } from "./components/UserTableColumn"
import { useRsi } from "../../hooks/useRsi"
import { TemplateColumn } from "./components/TemplateColumn"
import { ColumnGrid } from "./components/ColumnGrid"
import { setColumn } from "./utils/setColumn"
import { setIgnoreColumn } from "./utils/setIgnoreColumn"
import { setSubColumn } from "./utils/setSubColumn"
import { normalizeTableData } from "./utils/normalizeTableData"
import type { Field, Fields, RawData } from "../../types"
import { getMatchedColumns } from "./utils/getMatchedColumns"
import { UnmatchedFieldsAlert } from "../../components/Alerts/UnmatchedFieldsAlert"
import { findUnmatchedRequiredFields } from "./utils/findUnmatchedRequiredFields"
import apiClient from "../../api/apiClient"
import schemaToFields from "../../utils/schemaToFields"

export type MatchColumnsProps<T extends string> = {
  data: RawData[]
  headerValues: RawData
  onContinue: (data: any[], rawData: RawData[], columns: Columns<T>) => void
}

export enum ColumnType {
  empty,
  ignored,
  matched,
  matchedCheckbox,
  matchedSelect,
  matchedSelectOptions,
}

export type MatchedOptions<T> = {
  entry: string
  value: T
}

export type InputOptions<T> = {
  entry: string
  inputValue: T
}

type EmptyColumn = { type: ColumnType.empty; index: number; header: string }
type IgnoredColumn = { type: ColumnType.ignored; index: number; header: string }
type MatchedColumn<T> = { type: ColumnType.matched; index: number; header: string; value: T }
type MatchedSwitchColumn<T> = { type: ColumnType.matchedCheckbox; index: number; header: string; value: T }

export type MatchedSelectColumn<T> = {
  type: ColumnType.matchedSelect
  index: number
  header: string
  value: T
  matchedOptions: Partial<MatchedOptions<T>>[]
}
export type MatchedSelectOptionsColumn<T> = {
  type: ColumnType.matchedSelectOptions
  index: number
  header: string
  value: T
  matchedOptions: MatchedOptions<T>[]
}

export type Column<T extends string> =
  | EmptyColumn
  | IgnoredColumn
  | MatchedColumn<T>
  | MatchedSwitchColumn<T>
  | MatchedSelectColumn<T>
  | MatchedSelectOptionsColumn<T>

export type Columns<T extends string> = Column<T>[]

export const MatchColumnsStep = <T extends string>({ data, headerValues, onContinue }: MatchColumnsProps<T>) => {
  const toast = useToast()
  const dataExample = data.slice(0, 2)
  const { autoMapHeaders, autoMapDistance, translations } = useRsi<T>() // LK: Hier war eigentlich noch fields drin
  const [isLoading, setIsLoading] = useState(false)
  const [columns, setColumns] = useState<Columns<T>>(
    // Do not remove spread, it indexes empty array elements, otherwise map() skips over them
    ([...headerValues] as string[]).map((value, index) => ({ type: ColumnType.empty, index, header: value ?? "" })),
  )
  const fields = useRsi<T>().getFields() //LK: Die Daten kommen an!!!
  const [showUnmatchedFieldsAlert, setShowUnmatchedFieldsAlert] = useState(false)

  const [fetchedSchema, setFetchedSchema] = useState<string>()
  const [convertedSchema, setConvertedSchema] = useState<Field<string>[]>()
  const onChange = useCallback(
    (value: T, columnIndex: number) => {
      const field = fields.find((field) => field.key === value) as unknown as Field<T>
      const existingFieldIndex = columns.findIndex((column) => "value" in column && column.value === field.key)
      setColumns(
        columns.map<Column<T>>((column, index) => {
          columnIndex === index ? setColumn(column, field, data) : column
          if (columnIndex === index) {
            return setColumn(column, field, data)
          } else if (index === existingFieldIndex) {
            toast({
              status: "warning",
              variant: "left-accent",
              position: "bottom-left",
              title: translations.matchColumnsStep.duplicateColumnWarningTitle,
              description: translations.matchColumnsStep.duplicateColumnWarningDescription,
              isClosable: true,
            })
            return setColumn(column)
          } else {
            return column
          }
        }),
      )
    },
    [
      columns,
      data,
      fields,
      toast,
      translations.matchColumnsStep.duplicateColumnWarningDescription,
      translations.matchColumnsStep.duplicateColumnWarningTitle,
    ],
  )

  const onIgnore = useCallback(
    (columnIndex) => {
      setColumns(columns.map((column, index) => (columnIndex === index ? setIgnoreColumn<T>(column) : column)))
    },
    [columns, setColumns],
  )

  const onRevertIgnore = useCallback(
    (columnIndex) => {
      setColumns(columns.map((column, index) => (columnIndex === index ? setColumn(column) : column)))
    },
    [columns, setColumns],
  )

  const onSubChange = useCallback(
    (value, columnIndex, entry) => {
      setColumns(
        columns.map((column, index) =>
          columnIndex === index && "matchedOptions" in column ? setSubColumn(column, entry, value) : column,
        ),
      )
    },
    [columns, setColumns],
  )
  const unmatchedRequiredFields = useMemo(() => findUnmatchedRequiredFields(fields, columns), [fields, columns])

  const handleOnContinue = useCallback(async () => {
    if (unmatchedRequiredFields.length > 0) {
      setShowUnmatchedFieldsAlert(true)
    } else {
      setIsLoading(true)
      await onContinue(normalizeTableData(columns, data, fields), data, columns)
      setIsLoading(false)
    }
  }, [unmatchedRequiredFields.length, onContinue, columns, data, fields])

  const handleAlertOnContinue = useCallback(async () => {
    setShowUnmatchedFieldsAlert(false)
    setIsLoading(true)
    await onContinue(normalizeTableData(columns, data, fields), data, columns)
    setIsLoading(false)
  }, [onContinue, columns, data, fields])

  useEffect(() => {
    if (autoMapHeaders) {
      setColumns(getMatchedColumns(columns, fields, data, autoMapDistance))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields])

  const [isSchemaFetched, setIsSchemaFetched] = useState(false)

  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const selectedSchema = localStorage.getItem("schemaToUse")
        if (selectedSchema !== null) {
          const response = await apiClient.get("/schema/" + selectedSchema)
          if (response.data) {
            const version = selectedSchema.substring(selectedSchema.lastIndexOf(":") + 1) // "0.0.1"
            console.log(response.data[version], "response.data[version]")
            localStorage.setItem("schemaFromAPI", JSON.stringify(response.data[version]))
            setFetchedSchema(response.data[version])
            setConvertedSchema(schemaToFields(response.data[version]))
            setIsSchemaFetched(true)
          }
        } else {
          console.log("Schema already fetched")
        }
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }
    fetchSchema()
  }, [])

  const addMissingFieldsFromHeader = async (fields: Fields<string>, setFieldsFn: (field: Field<string>) => void) => {
    const schemaUsed = localStorage.getItem("schemaUsed")
    if (schemaUsed === "true") {
      console.log("User wants to reuse a schema")
      if (convertedSchema === undefined) {
        console.log("ATTENTION SCHEam is undefined")
      } else {
        for (let i = 0; i < convertedSchema.length; i++) {
          console.log(i)
          if (convertedSchema) {
            setFieldsFn(convertedSchema[i])
            console.log(i)
          } else {
            console.log("No schema available - ATTENTION!")
          }
        }
        setFieldsAdded(true)
      }
    }
  }
  const rsiInstance = useRsi()
  const [fieldsAdded, setFieldsAdded] = useState(false)
  useEffect(() => {
    if (!fieldsAdded && isSchemaFetched) {
      addMissingFieldsFromHeader(rsiInstance.getFields(), rsiInstance.setFields)
        .then(() => setFieldsAdded(true))
        .catch((error) => console.error("Error adding missing fields:", error))
    }
  }, [fieldsAdded, isSchemaFetched])

  return (
    <>
      <UnmatchedFieldsAlert
        isOpen={showUnmatchedFieldsAlert}
        onClose={() => setShowUnmatchedFieldsAlert(false)}
        fields={unmatchedRequiredFields}
        onConfirm={handleAlertOnContinue}
      />
      <ColumnGrid
        columns={columns}
        onContinue={handleOnContinue}
        isLoading={isLoading}
        userColumn={(column) => (
          <UserTableColumn
            column={column}
            onIgnore={onIgnore}
            onRevertIgnore={onRevertIgnore}
            entries={dataExample.map((row) => row[column.index])}
          />
        )}
        templateColumn={(column) => (
          <TemplateColumn
            column={column}
            onChange={onChange}
            onSubChange={onSubChange}
            schema={fetchedSchema}
            convertedSchema={convertedSchema}
          /> //field={field} hinzugefügen
        )}
      />
    </>
  )
}
