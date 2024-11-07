import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Switch,
  Textarea,
  useTheme,
  Button,
  Icon,
  Flex,
  Radio,
  RadioGroup,
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
} from "@chakra-ui/react";
import { RiCloseFill, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import Select from "react-select";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import AdvancedEditor from "../Editor/Editor";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import debounce from "lodash/debounce";
import store from "../../../store/store";

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
  error?: any;
  maxDate?: any;
  minDate?: any;
  disabledDates?: any;
  name: string;
  isClear?: boolean;
  onChange?: (value: any) => void;
  value?: any;
  w?: string;
  options?: any[];
  isSearchable?: boolean;
  isMulti?: boolean;
  getOptionLabel?: (option: any) => string;
  getOptionValue?: (option: any) => any;
  rows?: number;
  disabled?: boolean;
  showError?: boolean;
  style?: any;
  phone?: string;
  accept?: any;
  onFileDrop?: (files: FileList) => void;
  readOnly?: boolean;
  rest?: any;
  labelcolor?: any;
  isPortal?: any;
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
  maxDate,
  minDate,
  disabledDates,
  phone,
  onFileDrop,
  accept,
  readOnly,
  labelcolor,
  isPortal,
  // Added onFileDrop prop
  ...rest
}) => {
  const isMounted = useRef(false);
  const [inputValue, setInputValue] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const theme = useTheme();
  const [userOptions, setUserOptions] = useState(options || []);

  const { colorMode } = useColorMode();
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  // useEffect(() => {
  //   if (type === 'real-time-user-search') {
  //     setUserOptions(options || []);
  //   }
  // }, [options, type]);


  const fetchSearchUsers = useCallback(async (query: string) => {
    if (query?.trim() === "") {
      return;
    }
    try {
      const response: any = await store.auth.getCompanyUsers({
        page: 1,
        searchValue: query
      });
      setUserOptions(
        response.map((it: any) => ({
          label: it.user.username,
          value: it.user._id,
        }))
      );
    } catch (error) {
      // console.error("Error fetching search results:", error);
      // setOptions([]);
    }
  }, []);

  const debouncedFetchSearchUserResults = useMemo(
    () => debounce(fetchSearchUsers, 800),
    [fetchSearchUsers]
  );

  // const handleSelectChange = (selectedOption: any) => {
  //   if (onChange) {
  //     onChange(selectedOption ? selectedOption.value : "");
  //   }
  //   setSearchInput(selectedOption ? selectedOption.label : "");
  // };

  useEffect(() => {
    if (isMounted?.current && searchInput?.trim() !== "") {
      debouncedFetchSearchUserResults(searchInput);
    } else {
      isMounted.current = true;
    }
  }, [searchInput, debouncedFetchSearchUserResults]);

  const handleFileDrop = useCallback(
    (event : any) => {
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
      onChange && onChange(newTags);
      setInputValue("");
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    const newTags = (value || []).filter((tag: string) => tag !== tagToRemove);
    onChange && onChange(newTags);
  };

  const inputBg = useColorModeValue("transparent", "gray.700");

  const renderInputComponent = () => {
    switch (type) {
      case "password":
        return (
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              pr="4.5rem"
              position="relative"
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              name={name}
              isRequired={required}
              disabled={disabled}
              fontSize="sm"
              {...rest}
            />
            <InputRightElement
              cursor="pointer"
              onClick={() => {
                if (handleTogglePassword) {
                  handleTogglePassword();
                }
              }}
            >
              {showPassword ? (
                <RiEyeOffLine size={18} />
              ) : (
                <RiEyeLine size={18} />
              )}
            </InputRightElement>
          </InputGroup>
        );
      case "number":
        return (
          <Input
            type="text"
            style={style}
            bg={inputBg}
            value={value}
            onKeyDown={(e: any) => {
              const regex = /^[0-9]*$/;
              if (e.key === "Backspace") {
                const newValue = e.target?.value?.slice(0, -1);
                onChange &&
                  onChange({ target: { name, value: newValue || "" } });
              } else if (
                regex.test(e.key) ||
                (e.key === "." && e.target?.value?.indexOf(".") === -1) ||
                e.key === "ArrowLeft" ||
                e.key === "ArrowRight" ||
                e.key === "Home" ||
                e.key === "End"
              ) {
                const newValue = e.key.startsWith("Arrow")
                  ? e.target.value
                  : e.target.value + e.key;
                onChange && onChange({ target: { name, value: newValue } });
              } else {
                e.preventDefault();
              }
            }}
            name={name}
            placeholder={placeholder}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            {...rest}
          />
        );
      case "text":
        return (
          <Input
            type="text"
            placeholder={placeholder}
            style={style}
            value={value}
            bg={inputBg}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            readOnly={readOnly}
            {...rest}
          />
        );
      case "textarea":
        return (
          <Textarea
            style={style}
            rows={rows || 3}
            placeholder={placeholder}
            bg={inputBg}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            readOnly={readOnly}
            {...rest}
          />
        );
      case "radio":
        return (
          <RadioGroup
            name={name}
            value={value}
            onChange={(val) => onChange && onChange(val)}
          >
            <Flex>
              {options &&
                options.map((opt) => (
                  <Radio
                    key={`${name}-${opt.value}`}
                    value={opt.value}
                    isDisabled={disabled}
                    mr={4}
                  >
                    {opt.label}
                  </Radio>
                ))}
            </Flex>
          </RadioGroup>
        );
      case "switch":
        return (
          <Switch
            style={style}
            name={name}
            onChange={onChange}
            isChecked={value}
            readOnly={readOnly}
            {...rest}
          />
        );
      case "checkbox":
        return (
          <Checkbox
            style={style}
            name={name}
            onChange={onChange}
            isChecked={value}
            readOnly={readOnly}
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
            className={`chakra-select ${
              theme ? theme.components.Select.baseStyle : ""
            }`}
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
                border: "none", // Remove the border to avoid white lines
                padding: "8px 12px",
                ":hover": {
                  backgroundColor:
                    colorMode === "light" ? "#bee3f8" : "#2b6cb0",
                },
              }),
              menu: (baseStyles) => ({
                ...baseStyles,
                backgroundColor: colorMode === "light" ? "white" : "#2D3748",
                borderColor: colorMode === "light" ? "gray.200" : "#4A5568", // Match the border color to the dark mode
              }),
              multiValue: (styles) => ({
                ...styles,
                backgroundColor: colorMode === "light" ? "#bee3f8" : "#2b6cb0", // Blue with transparency
                color: colorMode === "light" ? "black" : "white",
              }),
              multiValueLabel: (styles) => ({
                ...styles,
                color: colorMode === "light" ? "blue.400" : "blue.200", // Blue color for the label
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
      case "time":
        return (
          <Input
            readOnly={readOnly}
            style={style}
            bg={inputBg}
            type="time"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            {...rest}
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
      case "date":
        return (
          <div style={{ position: "relative" }}>
            <SingleDatepicker
              name={name}
              date={value}
              onDateChange={onChange ? onChange : () => {}}
              maxDate={maxDate}
              minDate={minDate}
              disabled={disabled}
              disabledDates={disabledDates}
              usePortal={false}
              configs={{
                dateFormat: "dd-MM-yyyy",
              }}
              propsConfigs={{
                dayOfMonthBtnProps: {
                  defaultBtnProps: {
                    _hover: {
                      background: "blue.500",
                    },
                  },
                  selectedBtnProps: {
                    background: "blue.300",
                  },
                  todayBtnProps: {
                    border: "1px solid #38B2AC",
                  },
                },
                inputProps: {
                  size: "md",
                  fontSize: "14px",
                  placeholder: placeholder,
                },
              }}
            />
            {value && isClear && (
              <Button
                colorScheme="red"
                variant="link"
                onClick={() => onChange && onChange(undefined)}
                style={{
                  position: "absolute",
                  top: "50%",
                  right: "0.2rem",
                  transform: "translateY(-50%)",
                }}
              >
                <Icon as={RiCloseFill} />
              </Button>
            )}
          </div>
        );
      case "editor":
        return (
          <AdvancedEditor
            style={style}
            editorState={value}
            setEditorState={onChange}
          />
        );
      case "phone":
        return (
          <PhoneInput
            country={"in"}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            inputStyle={{
              backgroundColor:
                colorMode === "light" ? "transparent" : "transparent",
              borderColor: "gray.400",
            }}
            dropdownStyle={{
              backgroundColor: colorMode === "light" ? "white" : "#2D3748",
              color: colorMode === "light" ? "black" : "gray.300",
            }}
            buttonStyle={{
              backgroundColor:
                colorMode === "light" ? "transparent" : "transparent",
            }}
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
      // New case for file drag-and-drop
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
      case "tags":
        return (
          <Box>
            <Input
              style={style}
              bg={inputBg}
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              name={name}
              disabled={disabled}
              _placeholder={{ fontSize: "12px" }}
              {...rest}
            />
            <Button
              onClick={() => handleTagAdd()}
              mt={2}
              size="sm"
              colorScheme="blue"
            >
              Add Tag
            </Button>
            <Wrap mt={2}>
              {value &&
                value.map((tag: string, index: number) => (
                  <WrapItem key={index}>
                    <Tag
                      size="md"
                      borderRadius="full"
                      variant="solid"
                      colorScheme="blue"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <TagCloseButton onClick={() => handleTagRemove(tag)} />
                    </Tag>
                  </WrapItem>
                ))}
            </Wrap>
          </Box>
        );
        case "real-time-user-search":
          return (
            <Select
              key={name}
              name={name}
              options={userOptions}
              value={isMulti ? Array.isArray(value) ? value?.length > 0 ? value : null :  null : userOptions.find((opt : any) => opt?.value === value?.value)}
              onChange={(selectedOption : any) => {
                if (isMulti) {
                  onChange && onChange(selectedOption.map((opt: any) => opt));
                  setSearchInput(selectedOption ? selectedOption.label : "");
                } else {
                  onChange && onChange(selectedOption ? selectedOption : "");
                }
              }}
              inputValue={searchInput}
              onInputChange={(input) => setSearchInput(input)}
              placeholder={placeholder}
              isClearable={isClear ? true : undefined}
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
            readOnly={readOnly}
            style={style}
            bg={inputBg}
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            name={name}
            disabled={disabled}
            _placeholder={{ fontSize: "12px" }}
            {...rest}
          />
        );
    }
  };

  return (
    <FormControl id={name} isInvalid={!!error && showError}>
      <FormLabel color={labelcolor} fontSize={"small"} mt={2}>
        {label} {required && <span style={{ color: "red" }}>*</span>}
      </FormLabel>
      {renderInputComponent()}
      {showError && error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default CustomInput;
