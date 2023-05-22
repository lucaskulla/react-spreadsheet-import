import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Button, Code, Link, useDisclosure, useToast } from "@chakra-ui/react"
import { mockRsiValues } from "./mockRsiValues"
import React, { useCallback, useEffect, useState } from "react"
import type { Data } from "../types"
import { saveAs } from "file-saver"
import apiClient from "../api/apiClient"
import fieldsToJsonSchema from "../utils/fieldsToSchema"
import type { JSONSchema6 } from "json-schema"

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
  const toast = useToast()

  const [isChecked, setIsChecked] = useState(false)
  const [selectedOption, setSelectedOption] = useState("")
  const [showPreview, setShowPreview] = useState(false)
  const [previewSchema, setPreviewSchema] = useState<JSONSchema6>()
  const [isOpenCodeEditor, setIsOpenCodeEditor] = useState(false)
  const [language, setLanguage] = useState("javascript")
  const [code, setCode] = useState("")

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

  const errorToast = useCallback(
    (description: string) => {
      toast({
        status: "error",
        variant: "left-accent",
        position: "bottom-left",
        title: "Upload failed",
        description: description,
        isClosable: true,
      })
    },
    [toast],
  )

  function uploadDataToAPI(): void {
    const urn = localStorage.getItem("schemaToUse")

    if (data && data["validData"]) {
      data["validData"].forEach((item: any) => {
        // Send a POST request for each item
        apiClient
          .post("/object/" + urn, item, { params: { skip_validation: false } })
          .then((response: any) => {
            console.log(`Data uploaded successfully for item: ${JSON.stringify(item)}`)
            console.log(response)
          })
          .catch((error: any) => {
            console.error(`Error occurred while uploading data for item: ${JSON.stringify(item)}`)
            console.error(error)
          })
      })
    }
  }

  useEffect(() => {
    const fields = localStorage.getItem("fieldsList")
    const schemaUsedStorage = localStorage.getItem("schemaUsed")
    const schemaUsed: boolean = schemaUsedStorage ? schemaUsedStorage === "true" : false
    if (fields) {
      const conversion = fieldsToJsonSchema(JSON.parse(fields), schemaUsed)
      setPreviewSchema(conversion)
    }
  }, [])

  function uploadNewSchemaToAPI(): void {
    //ToDo daten aus useEffekt nehmen bzw. aus previewSchema
    const fields = localStorage.getItem("fieldsList")
    const schemaUsedStorage = localStorage.getItem("schemaUsed")
    const schemaUsed: boolean = schemaUsedStorage ? schemaUsedStorage === "true" : false
    if (fields) {
      const conversion = fieldsToJsonSchema(JSON.parse(fields), schemaUsed)
      console.log(JSON.stringify(conversion, null, 2), "conversion")
      //setPreviewSchema(conversion)
      apiClient
        .post("/schema", conversion)
        .then((r: any) => console.log(r))
        .catch((e: { message: string }) => {
          const errorMessage = e.message || "An unexpected error occurred"
          errorToast(errorMessage)
        })
    }
  }

  function removeOldStorage(): void {
    localStorage.removeItem("fieldsList")
    localStorage.removeItem("fields")
    localStorage.removeItem("schemaToUse")
    localStorage.removeItem("schemaUsed")
    localStorage.removeItem("schemaFromAPI")
  }

  const options = [
    { label: "Python", value: "python" },
    { label: "JavaScript", value: "javascript" },
    { label: "Java", value: "java" },
    { label: "XSLT", value: "xml" },
  ]

  const handleSend = async () => {
    try {
      //await axios.post("/code", { code });
      alert("Code sent successfully")
    } catch (error) {
      alert("Failed to send code")
      console.error(error)
    }
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
          Start harmonizing your data
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
              onClick={() => setShowPreview(!showPreview)}
              bg="blue.500"
              color="black"
              p="8px"
              border="2px solid #718096"
              borderRadius="8px"
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700" }}
            >
              {showPreview ? "Hide Schema Preview" : "Show Schema Preview"}
            </Button>
            <Button
              onClick={uploadDataToAPI}
              bg="blue.500"
              color="black"
              p="8px"
              border="2px solid #718096"
              borderRadius="8px"
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700" }}
            >
              Upload Data to API
            </Button>
            <Button
              onClick={uploadNewSchemaToAPI}
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
      {showPreview && previewSchema && (
        <Box pt={64} display="flex" gap="8px" flexDirection="column">
          <b>Schema:</b>
          <Code
            display="flex"
            alignItems="center"
            borderRadius="16px"
            fontSize="12px"
            background="#4A5568"
            color="white"
            p={32}
          >
            <pre>{JSON.stringify(previewSchema, undefined, 4)}</pre>{" "}
          </Code>
        </Box>
      )}
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
