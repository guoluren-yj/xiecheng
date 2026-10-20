import React, { useState, useCallback } from 'react';
import { Select } from 'hzero-ui';
import { isFunction } from 'lodash';
import { queryUnifyIdpValue } from 'services/api';
import { getResponse } from 'utils/utils';

const { Option } = Select;

const OptionsSelect = ({ disabled, lovCode, payload, record, value, onChange }) => {
  const [options, setOptions] = useState([]);
  // const [optionLoading, setOptionLoading] = useState(false);

  // const [value, setValue] = useState(defaultValue);
  const queryOption = useCallback(() => {
    // setOptionLoading(true);
    queryUnifyIdpValue(lovCode, payload).then(response => {
      const res = getResponse(response);
      if (res) {
        setOptions(res);
      }
    });
    // .finally(() => setOptionLoading(false));
  }, [record]);

  return (
    <Select
      allowClear
      value={value}
      onFocus={queryOption}
      // loading={optionLoading}
      style={{ width: '100%' }}
      disabled={disabled}
      onChange={(_, option = {}) => {
        if (isFunction(onChange)) {
          onChange(_, option);
        }
      }}
    >
      {options.map(n => (
        <Option value={n.value} key={n.value} optionRecord={n}>
          {n.meaning}
        </Option>
      ))}
    </Select>
  );
};

export default OptionsSelect;
