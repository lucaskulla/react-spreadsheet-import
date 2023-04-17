import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Button, Center, Code, Heading, Link, useDisclosure } from "@chakra-ui/react"
import { mockRsiValues } from "./mockRsiValues"
import { useState } from "react"

export default {
  title: "React spreadsheet import",
}

export const Basic = () => {
  const [data, setData] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    //LK: startet den kompletten Flow, so wie wenn man das erste mal drauf geht.
    <>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <Link href="./exampleFile.csv" border="2px solid #718096" p="8px" borderRadius="8px" download="exampleCSV">
        Download example file
      </Link>
      <ReactSpreadsheetImport {...mockRsiValues} isOpen={isOpen} onClose={onClose} onSubmit={setData} />
      {data && ( //Design wie die Daten am Ende aussehen
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

export const Basic2 = () => {
  type Option = "Option 1" | "Option 2"

  const WelcomePage: React.FC = () => {
    const [selectedOption, setSelectedOption] = useState<Option | null>(null)

    const handleOptionSelect = (option: Option) => {
      setSelectedOption(option)
    }
    const [data, setData] = useState<any>(null)
    const { isOpen, onOpen, onClose } = useDisclosure()

    return (
      <Center h="100vh">
        <Box textAlign="center">
          <Heading as="h1" mb="8">
            Welcome to my App!
          </Heading>
          <Box mb="8">
            <Button
              mr="4"
              onClick={() => handleOptionSelect("Option 1")}
              colorScheme={selectedOption === "Option 1" ? "green" : "gray"}
            >
              Option 1
            </Button>
            <Button
              onClick={() => handleOptionSelect("Option 2")}
              colorScheme={selectedOption === "Option 2" ? "green" : "gray"}
            >
              Option 2
            </Button>
          </Box>
          {selectedOption && <Box>You have selected {selectedOption}! This is just a dummy message.</Box>}
        </Box>
        <Box py={20} display="flex" gap="8px" alignItems="center">
          <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
            Open Flow
          </Button>
          (make sure you have a file to upload)
        </Box>
        <ReactSpreadsheetImport {...mockRsiValues} isOpen={isOpen} onClose={onClose} onSubmit={setData} />
        {data && ( //Design wie die Daten am Ende aussehen
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
      </Center>
    )
  }
}
