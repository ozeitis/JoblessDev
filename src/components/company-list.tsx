import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

const CompanySearchSelect = ({ onCompanySelect }) => {
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  const loadOptions = async (inputValue) => {
    try {
      const response = await axios.get(`/api/companies?search=${inputValue}`);
      return response.data.map(company => ({
        label: company.name,
        value: company.id
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  const handleChange = (selectedOptions) => {
    console.log('Selected companies:', selectedOptions);
    setSelectedCompanies(selectedOptions);
    onCompanySelect(selectedOptions); // Trigger the callback on selection
  };

  return (
    <AsyncSelect
      isMulti
      cacheOptions
      defaultOptions
      value={selectedCompanies}
      getOptionLabel={e => e.label}
      getOptionValue={e => e.value}
      loadOptions={loadOptions}
      onChange={handleChange}
      placeholder="Search for companies..."
      noOptionsMessage={() => 'No companies found'}
      loadingMessage={() => 'Loading companies...'}
      
    />
  );
};

export default CompanySearchSelect;
