import type XLSX from "xlsx"
import { Box, Checkbox, Heading, ModalBody, Select, Text, useStyleConfig } from "@chakra-ui/react"
import { DropZone } from "./components/DropZone"
import { useRsi } from "../../hooks/useRsi"
import { ExampleTable } from "./components/ExampleTable"
import React, { useCallback, useState } from "react"
import { FadingOverlay } from "./components/FadingOverlay"
import type { themeOverrides } from "../../theme"

type UploadProps = {
  onContinue: (data: XLSX.WorkBook) => Promise<void>
}

export const UploadStep = ({ onContinue }: UploadProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const styles = useStyleConfig("UploadStep") as typeof themeOverrides["components"]["UploadStep"]["baseStyle"]
  const { translations, fields } = useRsi()
  const handleOnContinue = useCallback(
    async (data) => {
      setIsLoading(true)
      await onContinue(data)
      setIsLoading(false)
    },
    [onContinue],
  )

  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false)
  const [dropdownValue, setDropdownValue] = useState<string | undefined>(undefined)

  // Add this function to handle the checkbox change and update the state
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIsCheckboxChecked(isChecked)
    localStorage.setItem("schemaUsed", isChecked.toString())
    console.log(isChecked, "isChecked")
    if (!e.target.checked) {
      setDropdownValue(undefined)
    }
  }

  const handleSelectBoxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectValue = e.target.value
    setDropdownValue(selectValue)
    localStorage.setItem("schemaToUse", selectValue)
  }

  return (
    <ModalBody>
      <Heading sx={styles.heading}>{translations.uploadStep.title}</Heading>
      {/* Add the Checkbox component */}
      <Checkbox isChecked={isCheckboxChecked} onChange={handleCheckboxChange}>
        Reuse an existing schema
      </Checkbox>
      {localStorage.setItem("schemaUsed", isCheckboxChecked.toString())} {/* Ensures default to be "false" */}
      {/* Add the Select component and make sure it only appears when the checkbox is selected */}
      {isCheckboxChecked && (
        <Select placeholder="Select an option" value={dropdownValue} onChange={handleSelectBoxChange} mb={4}>
          <option value="A">testSchema1</option>
          <option value="B">testSchema2</option>
        </Select>
      )}
      <Text sx={styles.title}>{translations.uploadStep.manifestTitle}</Text>
      <Text sx={styles.subtitle}>{translations.uploadStep.manifestDescription}</Text>
      <Box sx={styles.tableWrapper}>
        <ExampleTable fields={fields} />
        <FadingOverlay />
      </Box>
      <DropZone onContinue={handleOnContinue} isLoading={isLoading} />
    </ModalBody>
  )
}
