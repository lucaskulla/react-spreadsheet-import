import { useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Button,
  useToast,
} from "@chakra-ui/react";

interface Props {
  onSubmit: (input: string) => void
}

const InputForm = ({ onSubmit }: Props) => {
  const [inputValue, setInputValue] = useState("");
  const toast = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(inputValue);
    setInputValue("");
    toast({
      title: "Input saved.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <FormLabel>Input Field</FormLabel>
        <Input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Type something here..."
        />
        <Button type="submit" mt={4}>
          Submit
        </Button>
      </FormControl>
    </form>
  );
};

export default InputForm;
