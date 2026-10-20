import React, { useCallback } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { debounce } from 'lodash';

import intl from 'utils/intl';

const SearchInput = ({ filterData }: {
  // eslint-disable-next-line no-unused-vars
  filterData: (filterValue?: string) => void,
}) => {
  const _hanldeInput = useCallback(
    debounce(value => {
      filterData(value);
    }, 300),
    []
  );

  const handleInput = useCallback(event => {
    _hanldeInput(event.target.value);
  }, []);

  return (
    <TextField
      placeholder={intl
        .get('hmde.boComposition.export.view.placeholder.inputCodeOrName')
        .d('请输入组合对象、单元名称或单元编码查询')}
      prefix={<Icon type="search" />}
      onInput={handleInput}
    />
  );
};

export default SearchInput;
