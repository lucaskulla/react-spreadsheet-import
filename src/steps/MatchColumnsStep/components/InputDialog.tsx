import React, { useState } from "react"
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: string) => void
}

const MyModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState("")

  const handleSubmit = () => {
    // handle form submission
    onSubmit(inputValue)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter your input</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Input placeholder="Enter your input" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
          <Button mt={4} onClick={handleSubmit}>
            Submit
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default MyModal
