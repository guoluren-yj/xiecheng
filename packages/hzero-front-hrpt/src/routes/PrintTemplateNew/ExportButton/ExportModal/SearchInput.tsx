import React, { memo, useCallback } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';

interface ISearchInput {
  filterData: (value?: string) => void;
}

function SearchInput({ filterData }: ISearchInput) {

  const handleInput = useCallback((event) => {
    if (event && event.target) {
      filterData(event.target.value);
    }
  }, []);

  return (
    <TextField
      placeholder={intl
        .get('srm.common.view.placeholder.searchTemplateByNameOrCode')
        .d('请输入目录、单据、模板名称或模板编码查询')}
      prefix={<Icon type="search" />}
      onInput={handleInput}
    />
  );
};

export default memo(SearchInput);
