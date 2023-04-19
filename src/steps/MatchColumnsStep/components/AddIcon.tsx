import { Icon, IconProps } from "@chakra-ui/react"
import { FaPlus } from "react-icons/fa"

const AddIcon: React.FC<IconProps> = ({ ...props }) => <Icon as={FaPlus} {...props} />

export default AddIcon
