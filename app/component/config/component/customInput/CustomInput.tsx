"use client";

import React, { useCallback, useState } from "react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Switch,
  Textarea,
  useTheme,
  InputRightElement,
  InputGroup,
  useColorMode,
  useColorModeValue,
  Box,
  Wrap,
  WrapItem,
  Tag,
  TagLabel,
  TagCloseButton,
  Checkbox,
  Button,
} from "@chakra-ui/react";
import Select from "react-select";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface CustomInputProps {
  type?:
    | "editor"
    | "password"
    | "number"
    | "text"
    | "radio"
    | "file"
    | "switch"
    | "textarea"
    | "select"
    | "date"
    | "time"
    | "checkbox"
    | "url"
    | "phone"
    | "dateAndTime"
    | "file-drag"
    | "tags"
    | "real-time-user-search";
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string | null;
  maxDate?: string; // Date string type
  minDate?: string; // Date string type
  disabledDates?: string[]; // Array of date strings
  name: string;
  isClear?: boolean;
  onChange?: any;
  value?: any;
  w?: string;
  options?: { label: string; value: string }[]; // Options for select dropdown
  isSearchable?: boolean;
  isMulti?: boolean;
  getOptionLabel?: any;
  getOptionValue?: any;
  rows?: number;
  disabled?: boolean;
  showError?: boolean;
  style?: React.CSSProperties;
  phone?: string;
  accept?: string; // File accept type (string)
  readOnly?: boolean;
  labelcolor?: string;
  isPortal?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  type,
  label,
  placeholder,
  error,
  name,
  value,
  onChange,
  required,
  isClear = false,
  options,
  isSearchable,
  isMulti,
  getOptionLabel,
  getOptionValue,
  disabled,
  rows,
  style,
  showError,
  accept,
  readOnly,
  labelcolor,
  isPortal,
  ...rest
}) => {
  const [inputValue, setInputValue] = useState<string>("");
  const theme = useTheme();
  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleFileDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const files = event.dataTransfer.files;
      if (onChange) {
        onChange({ target: { name, files } });
      }
    },
    [name, onChange]
  );

  const handleTagAdd = (e?: React.KeyboardEvent<HTMLInputElement>) => {
    if ((!e || e.key === "Enter") && inputValue) {
        const newTags = [...(value || []), inputValue];
        if (onChange) {
            onChange(newTags);
        }
        setInputValue("");
    }
};

const handleTagRemove = (tagToRemove: string) => {
  const newTags = (value || []).filter((tag: string) => tag !== tagToRemove);
  if (onChange) {
    onChange(newTags);
  }
};


  const inputBg = useColorModeValue("transparent", "gray.700");

  const renderInputComponent = () => {
    switch (type) {
      case "password":
        return (
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              name={name}
              isRequired={required}
              disabled={disabled}
              fontSize="sm"
              {...rest}
            />
            <InputRightElement cursor="pointer" onClick={handleTogglePassword}>
              {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
            </InputRightElement>
          </InputGroup>
        );

      case "number":
        return (
          <Input
            type="number"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            {...rest}
          />
        );

      case "textarea":
        return (
          <Textarea
            rows={rows || 3}
            placeholder={placeholder}
            bg={inputBg}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            {...rest}
          />
        );

      case "switch":
        return (
          <Switch name={name} onChange={onChange} isChecked={value} {...rest} />
        );

      case "checkbox":
        return (
          <Checkbox
            name={name}
            onChange={onChange}
            isChecked={value}
            {...rest}
          />
        );

      case "phone":
        return (
          <PhoneInput
            country="in"
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            inputStyle={{
              backgroundColor: "transparent",
              borderColor: "gray.400",
            }}
          />
        );
      case "dateAndTime":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            bg={inputBg}
            type="datetime-local"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            {...rest}
          />
        );
      case "tags":
        return (
          <Box>
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              name={name}
              disabled={disabled}
              onKeyDown={handleTagAdd}
            />
            <Wrap mt={2}>
              {value?.map((tag: string, index: number) => (
                <WrapItem key={index}>
                  <Tag size="md" borderRadius="full" colorScheme="blue">
                    <TagLabel>{tag}</TagLabel>
                    <TagCloseButton onClick={() => handleTagRemove(tag)} />
                  </Tag>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        );
      case "file-drag":
        return (
          <div
            style={{
              border: "2px dashed #ddd",
              borderRadius: "8px",
              padding: "1rem",
              textAlign: "center",
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
          >
            <p>Drag & drop files here or click to browse</p>
            <input
              type="file"
              name={name}
              multiple={isMulti}
              onChange={onChange}
              style={{ display: "none" }}
              id={`multiple-file-upload-with-draggable-${name}`}
              accept={accept}
            />
            <Button
              colorScheme="blue"
              onClick={() =>
                (
                  document.getElementById(
                    `multiple-file-upload-with-draggable-${name}`
                  ) as unknown as HTMLInputElement
                )?.click()
              }
            >
              Browse
            </Button>
          </div>
        );
      case "url":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            type="url"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            {...rest}
          />
        );

      case "file":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            type="file"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            accept={accept}
            {...rest}
          />
        );
      case "select":
        return (
          <Select
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            isClearable={isClear ? true : undefined}
            className={`chakra-select ${theme ? theme.components.Select.baseStyle : ""}`}
            isMulti={isMulti}
            isSearchable={isSearchable}
            getOptionLabel={getOptionLabel}
            getOptionValue={getOptionValue}
            isDisabled={disabled}
            styles={{
              control: (baseStyles, state) => ({
                ...baseStyles,
                borderColor: state.isFocused ? "gray.200" : "gray.300",
                backgroundColor: colorMode === "light" ? "white" : "#2D3748",
                fontSize: "14px",
              }),
              option: (styles, { isSelected, isFocused }) => ({
                ...styles,
                backgroundColor:
                  colorMode === "light"
                    ? isSelected
                      ? "#4299e1"
                      : isFocused
                      ? "gray.100"
                      : "white"
                    : isSelected
                    ? "#2b6cb0"
                    : isFocused
                    ? "gray.700"
                    : "#2D3748",
                color: colorMode === "light" ? "black" : "white",
                padding: "8px 12px",
                ":hover": {
                  backgroundColor:
                    colorMode === "light" ? "#bee3f8" : "#2b6cb0",
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: colorMode === "light" ? "white" : "#2D3748",
                borderColor: colorMode === "light" ? "gray.200" : "#4A5568",
              }),
              multiValue: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? "#bee3f8" : "#2b6cb0",
                color: colorMode === "light" ? "black" : "white",
              }),
              multiValueLabel: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "blue.400" : "blue.200",
              }),
              singleValue: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "black" : "white",
              }),
              clearIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "black" : "white",
              }),
              dropdownIndicator: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "black" : "white",
              }),
              indicatorSeparator: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? "gray.300" : "#4A5568",
              }),
            }}
            components={{
              IndicatorSeparator: null,
              DropdownIndicator: () => (
                <div className="chakra-select__dropdown-indicator" />
              ),
            }}
            menuPosition={isPortal ? "fixed" : undefined}
          />
        );
      default:
        return (
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            {...rest}
          />
        );
    }
  };

  return (
    <FormControl id={name} isInvalid={!!error && showError}>
      <FormLabel color={labelcolor}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </FormLabel>
      {renderInputComponent()}
      {showError && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default CustomInput;
