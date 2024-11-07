import React, { useEffect, useState } from 'react';
import { Country } from 'country-state-city';
import CustomInput from '../CustomInput/CustomInput';

interface CountrySelectProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
  label?: string;
  placeholder?:string;
  props?:any;
  showError?:boolean;
  error?:any
}

const CountrySelect: React.FC<CountrySelectProps> = ({ label, name, value, onChange, placeholder, showError, error , props }) => {
  const [countries, setCountries] = useState<any[]>([]);

  useEffect(() => {
    const fetchCountries = async () => {
      const allCountries = await Country.getAllCountries();
      setCountries(allCountries || []);
    };
    fetchCountries();
  }, []);

  const handleCountryChange = (selectedOption: any) => {
    if(selectedOption?.isoCode){
      onChange(selectedOption?.isoCode);
    }
    else{
      onChange('')
    }
  };

  return (
    <CustomInput
      required
      label={label}
      type="select"
      name={name}
      value={countries.find(country => country.isoCode === value)}
      options={countries}
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.isoCode}
      onChange={handleCountryChange}
      showError={showError}
      error={error}
      placeholder={placeholder ? placeholder : "Select Country"}
      {...props}
    />
  );
};

export default CountrySelect;
