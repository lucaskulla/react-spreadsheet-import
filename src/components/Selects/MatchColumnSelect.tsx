import { Select } from "chakra-react-select"
import { Input, useStyleConfig } from "@chakra-ui/react"
import type { SelectOption } from "../../types"
import { customComponents } from "./MenuPortal"
import type { Styles } from "../../steps/MatchColumnsStep/components/ColumnGrid"
import type { SetStateAction } from "react"
import React from "react"

interface Props {
  onChange: (value: SelectOption | null) => void
  value?: SelectOption
  options?: readonly SelectOption[] //LK: nur optional wegen dem input field -> braucht ja keine options!
  placeholder?: string
  name?: string
}

export const MatchColumnSelect = ({ onChange, value, options, placeholder, name }: Props) => {
  const styles = useStyleConfig("MatchColumnsStep") as Styles
  return (
    <Select<SelectOption, false>
      value={value || null}
      colorScheme="gray"
      onChange={onChange}
      placeholder={placeholder}
      options={options}
      chakraStyles={styles.select}
      menuPosition="fixed"
      components={customComponents}
      aria-label={name}
    />
  )
}

export const AddColumn = ({ value, placeholder, name }: Props) => {
  const [value2, setValue] = React.useState("")
  const handleChange = (event: { target: { value: SetStateAction<string> } }) => setValue(event.target.value)
  return (
    <>
      <Input value={value2} onChange={handleChange} colorScheme="gray" placeholder={placeholder} aria-label={name} />
    </>
  )
}
