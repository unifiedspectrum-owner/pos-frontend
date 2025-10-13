'use client';

/* React and Chakra UI component imports */
import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Box } from '@chakra-ui/react';
import { Field } from '@/components/ui/field';
import { lighten } from 'polished';
import Quill from 'quill';
import type { QuillOptions } from 'quill';

/* Shared module imports */
import { GRAY_COLOR } from '@shared/config';

/* Toolbar configuration for Quill editor */
const TOOLBAR_CONFIG = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  // [{ font: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ list: 'ordered' }, { list: 'bullet' }, { list: 'check' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  // ['link', 'image', 'video'],
  ['clean'],
];

/* Toolbar button tooltip mappings */
const TOOLTIP_MAP: Record<string, string> = {
  '.ql-header': 'Heading',
  // '.ql-font': 'Font',
  '.ql-bold': 'Bold',
  '.ql-italic': 'Italic',
  '.ql-underline': 'Underline',
  '.ql-strike': 'Strikethrough',
  '.ql-blockquote': 'Blockquote',
  '.ql-code-block': 'Code Block',
  // '.ql-link': 'Insert Link',
  // '.ql-image': 'Insert Image',
  // '.ql-video': 'Insert Video',
  '.ql-clean': 'Remove Formatting',
  '.ql-align': 'Text Alignment',
};

/* Multi-element tooltip mappings */
const MULTI_TOOLTIP_MAP: Array<{ selector: string; tooltips: string[] }> = [
  { selector: '.ql-color', tooltips: ['Text Color'] },
  { selector: '.ql-background', tooltips: ['Background Color'] },
  { selector: '.ql-indent', tooltips: ['Decrease Indent', 'Increase Indent'] },
];

/* Attribute-based tooltip mappings */
const ATTR_TOOLTIP_MAP: Array<{ selector: string; title: string }> = [
  { selector: '.ql-script[value="sub"]', title: 'Subscript' },
  { selector: '.ql-script[value="super"]', title: 'Superscript' },
  { selector: '.ql-list[value="ordered"]', title: 'Ordered List' },
  { selector: '.ql-list[value="bullet"]', title: 'Bullet List' },
  { selector: '.ql-list[value="check"]', title: 'Checklist' },
];

/* Props interface for rich text editor field component */
interface RichTextEditorFieldProps {
  label: string; /* Field label text */
  value: string; /* Current HTML content value */
  placeholder?: string; /* Placeholder text */
  isInValid?: boolean; /* Whether field has validation errors */
  required?: boolean; /* Whether field is required */
  errorMessage?: string; /* Error message to display */
  disabled?: boolean; /* Whether field is disabled */
  readOnly?: boolean; /* Whether field is read-only */
  onChange: (e: React.ChangeEvent<HTMLInputElement> | string) => void; /* Value change handler - accepts event or string */
  onBlur?: () => void; /* Blur event handler */
  fieldName?: string; /* Field name attribute */
  helperText?: string; /* Helper text to display below field */
  height?: string; /* Editor height */
}

/* Helper function to add tooltips to toolbar buttons */
const addToolbarTooltips = (toolbarElement: HTMLElement): void => {
  /* Single element tooltips */
  Object.entries(TOOLTIP_MAP).forEach(([selector, title]) => {
    const element = toolbarElement.querySelector(selector);
    if (element) element.setAttribute('title', title);
  });

  /* Multi-element tooltips */
  MULTI_TOOLTIP_MAP.forEach(({ selector, tooltips }) => {
    const elements = toolbarElement.querySelectorAll(selector);
    tooltips.forEach((title, index) => {
      if (elements[index]) elements[index].setAttribute('title', title);
    });
  });

  /* Attribute-based tooltips */
  ATTR_TOOLTIP_MAP.forEach(({ selector, title }) => {
    const element = toolbarElement.querySelector(selector);
    if (element) element.setAttribute('title', title);
  });
};

const RichTextEditorField: React.FC<RichTextEditorFieldProps> = ({
  label,
  value,
  placeholder = 'Write something...',
  isInValid = false,
  required = false,
  errorMessage,
  disabled = false,
  readOnly = false,
  onChange,
  onBlur,
  fieldName,
  helperText,
  height = '300px',
}) => {
  /* Refs for Quill instance and editor DOM element */
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const isInitialized = useRef<boolean>(false);
  const isUpdating = useRef<boolean>(false); /* Prevent circular updates */
  const blurHandlerRef = useRef<(() => void) | null>(null);

  /* Memoize Quill options */
  const quillOptions = useMemo<QuillOptions>(() => ({
    theme: 'snow',
    modules: {
      toolbar: TOOLBAR_CONFIG,
    },
    placeholder,
    readOnly: readOnly || disabled,
  }), [placeholder, readOnly, disabled]);

  /* Memoize text change handler */
  const handleTextChange = useCallback(() => {
    if (!isUpdating.current && quillRef.current) {
      const html = quillRef.current.root.innerHTML;
      /* Create synthetic event for form compatibility */
      const syntheticEvent = {
        target: {
          value: html,
          name: fieldName || '',
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  }, [onChange, fieldName]);

  /* Initialize Quill editor */
  useEffect(() => {
    if (editorRef.current && !isInitialized.current) {
      isInitialized.current = true;

      quillRef.current = new Quill(editorRef.current, quillOptions);

      /* Add tooltips to toolbar buttons */
      const toolbar = quillRef.current.getModule('toolbar') as { container: HTMLElement };
      addToolbarTooltips(toolbar.container);

      /* Set initial content */
      if (value) {
        quillRef.current.root.innerHTML = value;
      }

      /* Listen to text changes */
      quillRef.current.on('text-change', handleTextChange);

      /* Listen to blur events */
      blurHandlerRef.current = () => {
        if (onBlur) {
          onBlur();
        }
      };
      quillRef.current.root.addEventListener('blur', blurHandlerRef.current);
    }

    /* Cleanup function */
    return () => {
      if (quillRef.current && !isInitialized.current) {
        quillRef.current.off('text-change', handleTextChange);
        if (blurHandlerRef.current) {
          quillRef.current.root.removeEventListener('blur', blurHandlerRef.current);
          blurHandlerRef.current = null;
        }
        quillRef.current = null;
      }
    };
  }, [handleTextChange, onBlur, quillOptions, value]);

  /* Update text-change handler when onChange or fieldName changes */
  useEffect(() => {
    if (quillRef.current && isInitialized.current) {
      quillRef.current.off('text-change', handleTextChange);
      quillRef.current.on('text-change', handleTextChange);
    }
  }, [handleTextChange]);

  /* Update blur handler when onBlur changes */
  useEffect(() => {
    if (quillRef.current && isInitialized.current) {
      if (blurHandlerRef.current) {
        quillRef.current.root.removeEventListener('blur', blurHandlerRef.current);
      }
      blurHandlerRef.current = () => {
        if (onBlur) {
          onBlur();
        }
      };
      quillRef.current.root.addEventListener('blur', blurHandlerRef.current);
    }
  }, [onBlur]);

  /* Update editor content when value prop changes externally */
  useEffect(() => {
    if (quillRef.current && !isUpdating.current) {
      const currentContent = quillRef.current.root.innerHTML;
      if (currentContent !== value) {
        isUpdating.current = true;
        quillRef.current.root.innerHTML = value || '';
        isUpdating.current = false;
      }
    }
  }, [value]);

  /* Update readOnly state */
  useEffect(() => {
    if (quillRef.current) {
      quillRef.current.enable(!readOnly && !disabled);
    }
  }, [readOnly, disabled]);

  return (
    <Field
      label={label}
      invalid={isInValid}
      errorText={errorMessage}
      required={required}
      helperText={helperText}
      css={{
        '& label': {
          userSelect: 'text',
          cursor: 'text',
          pointerEvents: 'auto'
        },
        '& label:hover': {
          cursor: 'text'
        }
      }}
    >
      <Box
        borderWidth="1px"
        borderColor={isInValid ? 'red.500' : lighten(0.3, GRAY_COLOR)}
        borderRadius="md"
        w={'100%'}
        overflow="hidden"
        opacity={disabled ? 0.6 : 1}
        pointerEvents={disabled ? 'none' : 'auto'}
        css={{
          '& .ql-container': {
            height: height,
            fontSize: '14px',
          },
          '& .ql-editor': {
            minHeight: height,
          },
        }}
      >
        <Box ref={editorRef} />
      </Box>
    </Field>
  );
};

export default RichTextEditorField;