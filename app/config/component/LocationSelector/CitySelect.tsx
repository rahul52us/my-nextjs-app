import React, { useEffect, useState } from "react";
import { City } from "country-state-city";
import CustomInput from "../CustomInput/CustomInput";

interface CitySelectProps {
  country: string;
  state: string;
  value: string;
  onChange: (value: any) => void;
  name: string;
  label?: string;
  showError?: boolean;
  error?: any;
}

const CitySelect: React.FC<CitySelectProps> = ({
  country,
  state,
  value,
  onChange,
  name,
  label,
  showError,
  error,
}) => {
  const [cities, setCities] = useState<any[]>([]);

  useEffect(() => {
    const fetchCities = async () => {
      if (country && state) {
        const stateCities = await City.getCitiesOfState(country, state);
        setCities(stateCities || []);
      } else {
        setCities([]);
      }
    };

    fetchCities();
  }, [country, state]);

  const handleCityChange = (selectedOption: any) => {
    if (selectedOption?.isoCode) {
      onChange(selectedOption.isoCode);
    } else {
      onChange("");
    }
  };
  const getStateNameByCode = (code: string) => {
    const selectedState = cities.find((state: any) => state.name === code);
    if (selectedState) {
      return { label: selectedState.name, isoCode: selectedState.name };
    }
    return null;
  };

  return (
    <CustomInput
      type="select"
      name={name}
      label={label}
      options={cities.map((city) => ({ label: city.name, isoCode: city.name }))}
      value={getStateNameByCode(value)}
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.isoCode}
      onChange={handleCityChange}
      placeholder="Select City"
      showError={showError}
      error={error}
    />
  );
};

export default CitySelect;