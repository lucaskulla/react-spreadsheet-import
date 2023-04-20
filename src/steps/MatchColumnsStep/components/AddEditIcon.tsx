import { FaEdit, FaPlus } from "react-icons/fa"

type EditOrAddIconProps = {
  isEdit: boolean
}

export const EditOrAddIcon = ({ isEdit }: EditOrAddIconProps) => {
  const Icon = isEdit ? FaEdit : FaPlus

  return <Icon />
}
