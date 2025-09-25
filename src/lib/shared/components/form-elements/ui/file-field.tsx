import { Box, FileUpload, Icon } from "@chakra-ui/react"
import { LuUpload } from "react-icons/lu";

/* Props interface for text input field component */
interface FileFieldProps {
  label: string;
  value: string;
  placeholder: string;
  isInValid: boolean;
  required: boolean;
  errorMessage?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?: (files: File[]) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  name: string;
  maxFiles?: number;
  maxSizeMB?: number;
  isDebounced?: boolean;
  debounceMs?: number;
  icon?: React.ReactNode
}

const FileField: React.FC<FileFieldProps> = () => {
  return (
    <FileUpload.Root maxW="xl" alignItems="stretch" maxFiles={10}>
      <FileUpload.HiddenInput />
      <FileUpload.Dropzone>
        <Icon size="md" color="fg.muted">
          <LuUpload />
        </Icon>
        <FileUpload.DropzoneContent>
          <Box>Drag and drop files here</Box>
          <Box color="fg.muted">.png, .jpg up to 5MB</Box>
        </FileUpload.DropzoneContent>
      </FileUpload.Dropzone>
      <FileUpload.List />
    </FileUpload.Root>
  )
};

export default FileField;
