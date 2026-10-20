import React, { useCallback, useEffect, memo } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { isArray, difference, uniq, words } from 'lodash';

export default memo(({ name, dataSet, multiple = true, ...otherProps }) => {
  useEffect(() => {
    if (!dataSet.getField(name)?.get('transformRequest')) {
      dataSet.addField(name, { transformRequest: (v) => (isArray(v) ? v.join() : v) });
    }
  }, [name, dataSet]);

  const handleChange = useCallback(
    (value) => {
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
