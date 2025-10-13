"use client"

import { useCallback, useRef } from 'react'
import { Box, FileUpload, Flex, Icon, SimpleGrid } from "@chakra-ui/react"
import { LuUpload } from "react-icons/lu"
import { Field } from '@/components/ui/field'
import { lighten } from 'polished'

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config'
import { createToastNotification } from '@shared/utils'

type FileError = "TOO_MANY_FILES" | "FILE_INVALID_TYPE" | "FILE_TOO_LARGE" | "FILE_TOO_SMALL" | "FILE_INVALID" | "FILE_EXISTS" | string;

/* Helper function to clean duplicate extensions from filename */
const cleanFileName = (filename: string): string => {
  const parts = filename.split('.')

  /* If filename has at least 2 parts and last two extensions are the same */
  if (parts.length >= 3) {
    const lastExt = parts[parts.length - 1]
    const secondLastExt = parts[parts.length - 2]

    if (lastExt.toLowerCase() === secondLastExt.toLowerCase()) {
      /* Remove the duplicate extension */
      return parts.slice(0, -1).join('.')
    }
  }

  return filename
}

/* File attachment type for form values */
interface FileAttachment {
  filename: string;
  file_size: number;
  mime_type: string;
  file_content: string;
  is_public: boolean;
  file_extension?: string | null;
}

/* Props interface for file field component */
interface FileFieldProps {
  label: string;
  value?: File[] | string | FileAttachment[];
  placeholder?: string;
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
  accept?: string;
  width?: string;
  height?: string;
  previewWidth?: string;
  previewHeight?: string;
}

const FileField: React.FC<FileFieldProps> = ({
  label,
  placeholder = "Drag and drop files here",
  isInValid,
  required,
  errorMessage,
  disabled = false,
  readOnly = false,
  onChange,
  name,
  maxFiles = 5,
  maxSizeMB = 2,
  accept = "image/*,.pdf,.doc,.docx",
  width = "full",
  height,
  previewWidth = "40px",
  previewHeight = "40px"
}) => {
  /* Track all uploaded files across multiple uploads */
  const uploadedFilesRef = useRef<Set<string>>(new Set())

  /* Validate function to check for duplicate files */
  const validateFile = useCallback((file: File, details: { acceptedFiles: File[] }) => {
    const { acceptedFiles } = details
    const fileKey = `${file.name}-${file.size}`

    /* Check against already uploaded files */
    if (uploadedFilesRef.current.has(fileKey)) {
      return ['FILE_EXISTS']
    }

    /* Check against current batch of accepted files */
    const isDuplicate = acceptedFiles.some(
      (existingFile) => existingFile.name === file.name && existingFile.size === file.size
    )

    if (isDuplicate) {
      return ['FILE_EXISTS']
    }

    return null
  }, [])

  /* Handle file selection and validation */
  const handleFileChange = useCallback((details: { acceptedFiles: File[] }) => {
    const { acceptedFiles } = details

    /* Call onChange with accepted files */
    if (onChange && acceptedFiles.length > 0) {
      onChange(acceptedFiles)
    }
  }, [onChange])

  /* Handle file rejection errors */
  const handleFileReject = useCallback((details: { files: { file: File, errors: FileError[]}[] }) => {
    const { files } = details

    console.log('handleFileReject called:', files)

    /* Show validation errors for rejected files */
    files.forEach(({ file, errors }) => {
      const fileSizeMB = file.size / (1024 * 1024)
      const cleanedFileName = cleanFileName(file.name)

      /* Check for specific error types */
      if (errors.includes('FILE_TOO_LARGE')) {
        const errorMsg = `"${cleanedFileName}" exceeds the maximum file size of ${maxSizeMB}MB (${fileSizeMB.toFixed(2)}MB)`
        createToastNotification({
          title: 'File Too Large',
          description: errorMsg,
          type: 'error',
        })
      } else if (errors.includes('FILE_TOO_SMALL')) {
        const errorMsg = `"${cleanedFileName}" is too small to be uploaded.`
        createToastNotification({
          title: 'File Too Small',
          description: errorMsg,
          type: 'error',
        })
      } else if (errors.includes('FILE_INVALID_TYPE')) {
        const errorMsg = `"${cleanedFileName}" is not an accepted file type. Accepted types: ${accept}`
        createToastNotification({
          title: 'Invalid File Type',
          description: errorMsg,
          type: 'error',
        })
      } else if (errors.includes('TOO_MANY_FILES')) {
        const errorMsg = `You can only upload up to ${maxFiles} files at a time.`
        createToastNotification({
          title: 'Too Many Files',
          description: errorMsg,
          type: 'error',
        })
      } else if (errors.includes('FILE_EXISTS')) {
        const errorMsg = `"${cleanedFileName}" has already been added to the upload list.`
        createToastNotification({
          title: 'Duplicate File',
          description: errorMsg,
          type: 'error',
        })
      } else if (errors.includes('FILE_INVALID')) {
        const errorMsg = `"${cleanedFileName}" is not a valid file and cannot be uploaded.`
        createToastNotification({
          title: 'Invalid File',
          description: errorMsg,
          type: 'error',
        })
      } else {
        const errorMsg = `"${cleanedFileName}" could not be uploaded. ${errors.join(', ')}`
        /* Fallback for unhandled error types */
        createToastNotification({
          title: 'File Upload Error',
          description: errorMsg,
          type: 'error',
        })
      }
    })
  }, [accept, maxFiles, maxSizeMB])

  return (
    <Field
      label={label}
      invalid={isInValid}
      readOnly={readOnly}
      errorText={errorMessage}
      required={required}
    >
      <FileUpload.Root
        maxW={width}
        w={width}
        alignItems="stretch"
        maxFiles={maxFiles}
        maxFileSize={maxSizeMB * 1024 * 1024}
        accept={accept}
        onFileChange={handleFileChange}
        onFileReject={handleFileReject}
        disabled={disabled || readOnly}
        name={name}
        validate={validateFile}
      >
        <FileUpload.HiddenInput />
        <FileUpload.Dropzone
          borderWidth={2}
          borderStyle="dashed"
          borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
          borderRadius="2xl"
          p={6}
          h={height}
          minH={height}
          maxH={height}
          _hover={{
            borderColor: isInValid ? 'red.600' : lighten(0.2, GRAY_COLOR),
            bg: lighten(0.65, GRAY_COLOR)
          }}
        >
          <Icon size="lg" color="fg.muted">
            <LuUpload />
          </Icon>
          <FileUpload.DropzoneContent>
            <Box fontWeight="medium">{placeholder}</Box>
            <Box color="fg.muted" fontSize="sm">
              Max {maxFiles} files, up to {maxSizeMB}MB each
            </Box>
          </FileUpload.DropzoneContent>
        </FileUpload.Dropzone>
        <FileUpload.ItemGroup mt={4}>
          <FileUpload.Context>
            {({ acceptedFiles }) =>
              <SimpleGrid columns={1} gap={3}>
                {acceptedFiles.map((file, index) => (
                  <FileUpload.Item key={index + file.name} file={file}>
                    <Flex w={'100%'} alignItems={'center'} justifyContent={'space-between'}>
                      <Flex alignItems={'center'} gap={5}>
                        <FileUpload.ItemPreview type="image/*" width={previewWidth} height={previewHeight}>
                          <FileUpload.ItemPreviewImage
                            objectFit="cover"
                            width="100%"
                            height="100%"
                            borderRadius="md"
                          />
                        </FileUpload.ItemPreview>
                        <FileUpload.ItemName />
                        <FileUpload.ItemSizeText fontSize={'14px'}/>
                      </Flex>
                      <Flex>
                        <FileUpload.ItemDeleteTrigger />
                      </Flex>
                    </Flex>
                  </FileUpload.Item>
                ))}
              </SimpleGrid>
            }
          </FileUpload.Context>
        </FileUpload.ItemGroup>
        <FileUpload.Trigger mt={4} />
      </FileUpload.Root>
    </Field>
  )
};

export default FileField;
