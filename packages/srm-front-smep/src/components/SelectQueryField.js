import React, { useEffect } from 'react';
import { Select, Lov } from 'choerodon-ui/pro';

export default function SelectQueryField(props) {
  const { placeholder, name, dataSet, tableDs, onRef = (e) => e, ...other } = props;

  useEffect(() => {
    onRef({ handleClear });
  }, []);

  function handleClear() {
    dataSet.current.set(name, '');
    tableDs.setQueryParameter(name, null);
  }

  function handleQueryChange(val) {
    if (val) {
      tableDs.setQueryParameter(name, val);
      tableDs.query(tableDs.currentPage);
    }
  }

  return (
    <Select
      searchable
      // combo
      dropdownMatchSelectWidth
      name={name}
      placeholder={placeholder}
      dataSet={dataSet}
      {...other}
      onChange={handleQueryChange}
    />
  );
}

export function LovQueryField(props) {
  const { placeholder, name, dataSet, tableDs, onRef = (e) => e, ...other } = props;

  useEffect(() => {
    onRef({ handleClear });
  }, []);

  function handleClear() {
    dataSet.current.set(name, '');
    tableDs.setQueryParameter(name, null);
    tableDs.query(tableDs.currentPage);
  }

  function handleQueryChange(val) {
    if (val) {
      tableDs.setQueryParameter(name, val?.pullType);
      tableDs.query(tableDs.currentPage);
    }
  }

  return (
    <Lov
      name={name}
      placeholder={placeholder}
      dataSet={dataSet}
      {...other}
      onChange={handleQueryChange}
      onClear={handleClear}
    />
  );
}
