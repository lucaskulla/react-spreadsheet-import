import type { Field, Fields, RsiProps } from "../types"
import { defaultRSIProps } from "../ReactSpreadsheetImport"

//Idee: fields in eine DB schreiben

//const [fields2, setFieldsState] = useState<Fields<string>>()

let fields: Fields<string> = [
  {
    label: "Name",
    key: "name",
    alternateMatches: ["first name", "first"],
    fieldType: {
      type: "input",
    },
    example: "Stephanie",
    validations: [
      {
        rule: "required",
        errorMessage: "Name is required",
      },
    ],
  },
  {
    label: "Surname",
    key: "surname",
    alternateMatches: ["second name", "last name", "last"],
    fieldType: {
      type: "input",
    },
    example: "McDonald",
    validations: [
      {
        rule: "unique",
        errorMessage: "Last name must be unique",
        level: "info",
      },
    ],
    description: "Family / Last name",
  },
  {
    label: "Age",
    key: "age",
    alternateMatches: ["years"],
    fieldType: {
      type: "input",
    },
    example: "23",
    validations: [
      {
        rule: "regex",
        value: "^\\d+$",
        errorMessage: "Age must be a number",
        level: "warning",
      },
    ],
  },
  {
    label: "Team",
    key: "team",
    alternateMatches: ["department"],
    fieldType: {
      type: "select",
      options: [
        { label: "Team One", value: "one" },
        { label: "Team Two", value: "two" },
      ],
    },
    example: "Team one",
    validations: [
      {
        rule: "required",
        errorMessage: "Team is required",
      },
    ],
  },
  {
    label: "Is manager",
    key: "is_manager",
    alternateMatches: ["manages"],
    fieldType: {
      type: "checkbox",
      booleanMatches: {},
    },
    example: "true",
  },
]

const mockComponentBehaviourForTypes = <T extends string>(props: RsiProps<T>) => props

export const mockRsiValues = mockComponentBehaviourForTypes({
  setFields: (field: Field<string>) => {
    console.log("setFields2")
    console.log(field)
    if (field.key === undefined || field.key === "") {
      console.log("field is empty")
      return null
    } else {
      const index = fields.findIndex((f) => f.key === field.key)
      if (index === -1) {
        //Field does not exist yet -> new entry
        fields = fields.concat(field)
      } else {
        console.log("field already exists")
        //Field already exists -> update entry
        fields[index] = field
      }
    }
  },

  getFields: () => {
    return fields
  },

  getSpecificField: (field: string) => {
    if (field === undefined || field === "") {
      return null
    } else {
      return fields.find((f) => f.key === field)
    }
  },

  //fields: getField(),
  ...defaultRSIProps, //LK: ohne geht Storybook "MatchColumnsStep" nicht
  fields: fields,
  onSubmit: (data) => {
    console.log(data.all.map((value) => value))
  },
  isOpen: true,
  onClose: () => {},
  uploadStepHook: async (data) => {
    await new Promise((resolve) => {
      setTimeout(() => resolve(data), 4000)
    })
    return data
  },
  selectHeaderStepHook: async (hData, data) => {
    await new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            headerValues: hData,
            data,
          }),
        4000,
      )
    })
    return {
      headerValues: hData,
      data,
    }
  },
  // Runs after column matching and on entry change, more performant
  matchColumnsStepHook: async (data) => {
    await new Promise((resolve) => {
      setTimeout(() => resolve(data), 4000)
    })
    return data
  },
})

export const editableTableInitialData = [
  {
    name: "Hello",
    surname: "Hello",
    age: "123123",
    team: "one",
    is_manager: true,
  },
  {
    name: "Hello",
    surname: "Hello",
    age: "12312zsas3",
    team: "two",
    is_manager: true,
  },
  {
    name: "Whooaasdasdawdawdawdiouasdiuasdisdhasd",
    surname: "Hello",
    age: "123123",
    team: undefined,
    is_manager: false,
  },
  {
    name: "Goodbye",
    surname: "Goodbye",
    age: "111",
    team: "two",
    is_manager: true,
  },
]

export const headerSelectionTableFields = [
  ["text", "num", "select", "bool"],
  ["Hello", "123", "one", "true"],
  ["Hello", "123", "one", "true"],
  ["Hello", "123", "one", "true"],
]
