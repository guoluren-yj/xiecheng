import React, { useCallback } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { debounce } from 'lodash';

import intl from 'utils/intl';

const SearchInput = ({ filterData }) => {
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
        .get('hpfm.individual.view.placeholder.inputMenuOrUnitName')
        .d('请输入菜单、单元名称或单元编码查询')}
      prefix={<Icon type="search" />}
      onInput={handleInput}
    />
  );
};

export default SearchInput;
