import React, { useCallback, useState } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';

import intl from 'hzero-front/lib/utils/intl';

const SearchInput = ({ filterData }) => {
  const [search, setSearch] = useState('');

  const syncFilterData = useCallback(() => {
    filterData(search);
  }, [search]);
  return (
    <TextField
      placeholder={intl
        .get('hpfm.individual.view.placeholder.inputMenuOrUnitName')
        .d('请输入菜单、单元名称或单元编码查询')}
      prefix={<Icon type="search" />}
      value={search}
      onBlur={syncFilterData}
      onInput={(e) => setSearch((e.target as any).value)}
    />
  );
};

export default SearchInput;
