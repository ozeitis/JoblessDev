import React, { useState, useEffect } from 'react';
import AsyncSelect from 'react-select/async';
import axios from 'axios';

interface CompanyOption {
  label: string;
  value: string;
}

const CompanySearchSelect = ({ onCompanySelect, initialSelectedCompanies }: { onCompanySelect: (selectedOptions: any) => void, initialSelectedCompanies: string[] }) => {
  const [selectedCompanies, setSelectedCompanies] = useState([] as CompanyOption[]);

  useEffect(() => {
    const initialOptions = initialSelectedCompanies.map(company => ({
      label: company,
      value: company,
    }));
    setSelectedCompanies(initialOptions);
  }, [initialSelectedCompanies]);

  const loadOptions = async (inputValue: string) => {
    try {
      const response = await axios.get(`/api/companies?search=${inputValue}`);
      return response.data.map((company: any) => ({
        label: `${company.name} (${company._count.jobs})`,
        value: company.name,
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return [];
    }
  };

  const handleChange = (selectedOptions: any) => {
    setSelectedCompanies(selectedOptions);
    onCompanySelect(selectedOptions);
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