import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Button, Code, Link, useDisclosure } from "@chakra-ui/react"
import { mockRsiValues } from "./mockRsiValues"
import { useState } from "react"
import type { Data } from "../types"
import { saveAs } from "file-saver"
import fieldsToJsonSchema from "../utils/fieldsToSchema"
import apiClient from "../api/apiClient"

export default {
  title: "React spreadsheet import",
}

interface Option {
  label: string
  value: string
}

const options: Option[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" },
]

// Output: { label: 'The person\'s first name.', key: 'firstName', fieldType: { type: 'input' }, validations: [ { rule: 'required', errorMessage: 'This field is required.' } ] }

export const Basic = () => {
  const [data, setData] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [isChecked, setIsChecked] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")

  function handleCheckboxChange(event: React.ChangeEvent<HTMLInputElement>) {
    setIsChecked(event.target.checked)
    setSelectedOption("")
  }

  function handleSelectChange(event: React.ChangeEvent<HTMLSelectElement>) {
    setSelectedOption(event.target.value)
  }

  function convertToCSV(data: Data<string>[]): string {
    const header = Object.keys(data[0]).join(",")
    const rows = data.map((row) => Object.values(row).join(",")).join("\n")

    return `${header}\n${rows}`
  }

  // Function to download data as a CSV file
  function downloadCSV(data: Data<string>[], fileName: string): void {
    const csvData = convertToCSV(data)
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" })
    saveAs(blob, fileName)
  }

  function handleDownloadButtonClick(fileName: string): void {
    if (data) {
      downloadCSV(data[fileName], fileName + ".csv")
    } else {
      console.log("Data not avaiable")
    }
  }

  function handleDownloadNewSchema(): void {
    const fields = localStorage.getItem("fieldsList")
    const schemaUsedStorage = localStorage.getItem("schemaUsed")
    const schemaUsed: boolean = schemaUsedStorage ? schemaUsedStorage === "true" : false
    if (fields) {
      const conversion = fieldsToJsonSchema(JSON.parse(fields), schemaUsed)
      console.log(JSON.stringify(conversion, null, 2), "conversion")
      apiClient.post("/schema", conversion).then((r) => console.log(r))
    }
  }

  function removeOldStorage(): void {
    localStorage.removeItem("fieldsList")
    localStorage.removeItem("fields")
    localStorage.removeItem("schemaToUse")
    localStorage.removeItem("schemaUsed")
    localStorage.removeItem("schemaFromAPI")
  }

  return (
    <>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button
          onClick={() => {
            removeOldStorage()
            onOpen()
          }}
          border="2px solid #7069FA"
          p="8px"
          borderRadius="8px"
        >
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <Link href="./exampleFile.csv" border="2px solid #718096" p="8px" borderRadius="8px" download="exampleCSV">
        Download example file
      </Link>

      {data && (
        <Box py={20} display="flex" flexDirection="column" alignItems="center" gap="16px">
          <Box display="flex" gap="16px">
            <Button
              onClick={() => handleDownloadButtonClick("all")}
              bg="teal.500"
              color="black"
              p="8px"
              border="2px solid #718096"
              borderRadius="8px"
              _hover={{ bg: "teal.600" }}
              _active={{ bg: "teal.700" }}
            >
              Download all Data
            </Button>
            <Button
              onClick={() => handleDownloadButtonClick("validData")}
              bg="purple.500"
              color="black"
              p="8px"
              border="2px solid #718096"
              borderRadius="8px"
              _hover={{ bg: "purple.600" }}
              _active={{ bg: "purple.700" }}
            >
              Download Valid Data
            </Button>
            <Button
              onClick={() => handleDownloadButtonClick("invalidData")}
              bg="blue.500"
              color="black"
              p="8px"
              border="2px solid #718096"
              borderRadius="8px"
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700" }}
            >
              Download Invalid Data
            </Button>
            <Button
              onClick={() => handleDownloadNewSchema()}
              bg="blue.500"
              color="black"
              p="8px"
              border="2px solid #718096"
              borderRadius="8px"
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700" }}
            >
              Upload new Schema to API
            </Button>
          </Box>
        </Box>
      )}

      <ReactSpreadsheetImport {...mockRsiValues} isOpen={isOpen} onClose={onClose} onSubmit={setData} />
      {data && (
        <Box pt={64} display="flex" gap="8px" flexDirection="column">
          <b>Returned data:</b>
          <Code
            display="flex"
            alignItems="center"
            borderRadius="16px"
            fontSize="12px"
            background="#4A5568"
            color="white"
            p={32}
          >
            <pre>{JSON.stringify(data, undefined, 4)}</pre>
          </Code>
        </Box>
      )}
    </>
  )
}
