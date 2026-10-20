import React, { memo, useCallback } from 'react';
import { TextField, Icon } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';

function SearchInput({ filterData }) {
  const handleInput = useCallback((event) => {
    if (event && event.target) {
      filterData(event.target.value);
    }
  }, []);

  return (
    <TextField
      placeholder={intl
        .get('srm.common.view.placeholder.searchDocumentByNameOrCode')
        .d('请输入流程分类、单据编码或名称查询')}
      prefix={<Icon type="search" />}
      onInput={handleInput}
    />
  );
}

export default memo(SearchInput);
