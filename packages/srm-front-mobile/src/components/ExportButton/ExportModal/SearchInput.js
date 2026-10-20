import React, { useCallback } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import { debounce } from 'lodash';

import intl from 'utils/intl';

const SearchInput = ({ filterData }) => {
  const _hanldeInput = useCallback(
    debounce((value) => {
      filterData(value);
    }, 300),
    []
  );

  const handleInput = useCallback((event) => {
    _hanldeInput(event.target.value);
  }, []);

  return (
    <TextField
      placeholder={intl
        .get('smbl.checkRules.view.placeholder.orderProcessQuery')
        .d('请输入流程单据/流程分类名称或编码查询')}
      prefix={<Icon type="search" />}
      onInput={handleInput}
    />
  );
};

export default SearchInput;
