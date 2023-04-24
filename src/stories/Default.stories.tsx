import { ReactSpreadsheetImport } from "../ReactSpreadsheetImport"
import { Box, Button, Code, Link, useDisclosure } from "@chakra-ui/react"
import { mockRsiValues } from "./mockRsiValues"
import { useState } from "react"
import convertJsonSchemaToFieldType from "../utils/schemaToFields"

export default {
  title: "React spreadsheet import",
}

const schema = {
  $id: "https://example.com/person.schema.json",
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Person",
  type: "object",
  properties: {
    firstName: {
      type: "string",
      description: "The person's first name.",
      examples: ["John"],
    },
    lastName: {
      type: "string",
      description: "The person's last name.",
      examples: ["Doe"],
    },
    age: {
      description: "Age in years which must be equal to or greater than zero.",
      type: "integer",
      minimum: 0,
      examples: [25],
    },
    email: {
      description: "Email address of the user",
      type: "string",
      format: "email",
    },
    phone: {
      description: "Phone number of the user",
      type: "string",
      pattern: "^(\\d{3})-(\\d{3})-(\\d{4})$",
    },
  },
  required: ["firstName", "lastName", "email"],
}

// Output: { label: 'The person\'s first name.', key: 'firstName', fieldType: { type: 'input' }, validations: [ { rule: 'required', errorMessage: 'This field is required.' } ] }

export const Basic = () => {
  const [data, setData] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    //LK: startet den kompletten Flow, so wie wenn man das erste mal drauf geht.
    <>
      {console.log(convertJsonSchemaToFieldType(schema))}
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow
        </Button>
        (make sure you have a file to upload)
      </Box>
      <Link href="./exampleFile.csv" border="2px solid #718096" p="8px" borderRadius="8px" download="exampleCSV">
        Download example file
      </Link>
      <Box py={200} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow without Schema
        </Button>
      </Box>
      <Box py={20} display="flex" gap="8px" alignItems="center">
        <Button onClick={onOpen} border="2px solid #7069FA" p="8px" borderRadius="8px">
          Open Flow with Schema
        </Button>
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
    </>
  )
}
