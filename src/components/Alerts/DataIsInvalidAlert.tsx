import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react"
import { useRef } from "react"
import { useRsi } from "../../hooks/useRsi"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const DataIsInvalid = ({ isOpen, onClose, onConfirm }: Props) => {
  const { translations } = useRsi()
  const cancelRef = useRef<HTMLButtonElement | null>(null)

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} leastDestructiveRef={cancelRef} isCentered id="rsi">
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>{translations.alerts.invalidData.headerTitle}</AlertDialogHeader>
          <AlertDialogBody>{translations.alerts.invalidData.bodyText}</AlertDialogBody>
          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose} variant="secondary">
              {translations.alerts.invalidData.cancelButtonTitle}
            </Button>
            <Button colorScheme="red" onClick={onConfirm} ml={3}>
              {translations.alerts.invalidData.exitButtonTitle}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}
