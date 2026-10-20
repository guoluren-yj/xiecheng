import type { DataSet } from 'choerodon-ui/pro';
import type { TextFieldProps } from 'choerodon-ui/pro/lib/text-field/TextField';

import React, { useCallback, useEffect, memo } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { isArray, difference, uniq, words } from 'lodash';

interface MultiTextFilterProps extends TextFieldProps {
  name: string,
  dataSet: DataSet,
  multiple?: boolean,
}

const MultiTextFilter = memo((props: MultiTextFilterProps) => {

  const {
    name,
    dataSet,
    multiple = true,
    ...otherProps
  } = props;

  useEffect(() => {
    if (!dataSet.getField(name)?.get('transformRequest')) {
      dataSet.addField(name, { transformRequest: (v) => (isArray(v) ? v.join() : v) });
    }
  }, [name, dataSet]);

  const handleChange = useCallback(
    (value) => {
      if (!dataSet.current) return;
      dataSet.current.set(
        name,
        isArray(value)
          ? difference(uniq(value.map((item) => words(item, /[^, ]+/g)).flat()), ['', '\t'])
          : value
      );
    },
    [name, dataSet]
  );

  return (
    <TextField
      clearButton
      name={name}
      dataSet={dataSet}
      style={{ width: 300 }}
      multiple={multiple}
      onChange={handleChange}
      prefix={<Icon type="search" />}
      {...otherProps}
    />
  );
});

export default MultiTextFilter;