import React, { useEffect, useState } from 'react';
import { State } from 'country-state-city';
import CustomInput from '../CustomInput/CustomInput';

interface StateSelectProps {
  country: string;
  value: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  showError?:boolean;
  error?:any

}

const StateSelect: React.FC<StateSelectProps> = ({ country, value, onChange, name, label, showError, error }) => {
  const [states, setStates] = useState<any[]>([]);
  const [selectedStates,setSelectedState ]  = useState<any>(value)

  useEffect(() => {
    const fetchStates = async () => {
      const countryStates = await State.getStatesOfCountry(country);
      setStates(countryStates || []);
    };

    if (country) {
      fetchStates();
    }
  }, [country]);

  const handleStateChange = (selectedOption: any) => {
    if (selectedOption?.isoCode) {
      onChange(selectedOption.isoCode);
      setSelectedState(selectedOption.isoCode)
    }
    else{
      setSelectedState(null)
      onChange('')
    }
  };

  const getStateNameByCode = (code: string) => {
    const selectedState = states.find((state: any) => state.isoCode === code);

    if (selectedState) {
      return { label: selectedState.name, isoCode: selectedState.isoCode };
    }

    return null;
  }

  return (
    <CustomInput
      type="select"
      name={name}
      label={label}
      options={states.map((state) => ({ label: state.name, isoCode: state.isoCode }))}
      value={getStateNameByCode(selectedStates)}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.isoCode}
      onChange={handleStateChange}
      placeholder="Select State"
      showError={showError}
      error={error}
    />
  );
};

export default StateSelect;