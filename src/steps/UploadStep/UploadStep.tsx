import type XLSX from "xlsx"
import {
  Box,
  Button,
  Checkbox,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Select,
  Text,
  useStyleConfig,
} from "@chakra-ui/react"
import { DropZone } from "./components/DropZone"
import { useRsi } from "../../hooks/useRsi"
import { ExampleTable } from "./components/ExampleTable"
import React, { useCallback, useEffect, useState } from "react"
import { FadingOverlay } from "./components/FadingOverlay"
import type { themeOverrides } from "../../theme"
import apiClient from "../../api/apiClient"
import type { AxiosResponse } from "axios"
import type { RJSFSchema } from "@rjsf/utils"

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
  const [fetchedOptions, setFetchedOptions] = useState<Array<{ value: string; label: string }>>([])

  const [selectedSchema, setSelectedSchema] = useState<any>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const fetchSchema = async (schemaName: string) => {
    try {
      const response = (await apiClient.get("/schema/" + schemaName)) as AxiosResponse<RJSFSchema>
      setSelectedSchema(response.data)
    } catch (error) {
      console.error("Error fetching schema:", error)
    }
  }

  const handleSelectBoxChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectValue = e.target.value
    setDropdownValue(selectValue)
    localStorage.setItem("schemaToUse", selectValue)
    fetchSchema(selectValue) // Fetch the schema when a new one is selected
  }

  const handlePreviewClick = () => {
    setIsPreviewOpen(true) // Open the preview modal when "Preview" button is clicked
  }

  // Fetch options from API when component mounts
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const response = await apiClient.get("/schema", { params: { include_version: true } })
        if (Array.isArray(response.data)) {
          setFetchedOptions(response.data.map((item: string) => ({ value: item, label: item })))
        } else {
          console.error("Error: Unexpected data format. Expected an array.")
        }
      } catch (error) {
        console.error("Error fetching options:", error)
      }
    }

    fetchOptions()
  }, [])

  // Add this function to handle the checkbox change and update the state
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked
    setIsCheckboxChecked(isChecked)
    localStorage.setItem("schemaUsed", isChecked.toString())
    if (!e.target.checked) {
      setDropdownValue(undefined)
    }
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
        <Box>
          <Select
            placeholder="Select an option"
            value={dropdownValue}
            onChange={handleSelectBoxChange}
            mb={4}
            display="inline-block"
            width="auto"
          >
            {fetchedOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <Button onClick={handlePreviewClick} ml={2}>
            Preview
          </Button>{" "}
          {/* Add "Preview" button */}
        </Box>
      )}
      <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} size="auto">
        <ModalOverlay />
        <ModalContent maxW="80vw" maxH="80vh" overflow="auto">
          <ModalHeader>Schema Preview</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <pre>{JSON.stringify(selectedSchema, null, 2)}</pre>
          </ModalBody>
        </ModalContent>
      </Modal>
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
