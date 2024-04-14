import React, { useState } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

interface CompanyOption {
  label: string;
  value: string;
}

const CompanySearchSelect = ({ onCompanySelect }: { onCompanySelect: (selectedOptions: any) => void }) => {
  const [selectedCompanies, setSelectedCompanies] = useState([] as CompanyOption[]);

  const loadOptions = async (inputValue: string) => {
    try {
      const response = await axios.get(`/api/companies?search=${inputValue}`);
      return response.data.map((company: any) => ({
        label: company.name,
        value: company.id
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  const handleChange = (selectedOptions: any) => {
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
