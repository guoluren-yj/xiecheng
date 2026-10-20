/*
 * @Description: 结算策略详情-查验规则设置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { memo, useMemo } from 'react';
import { Select, CheckBox } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';

import EditorForm from '@/routes/Components/EditorForm';

/**
 * @description: 查验规则设置
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ headerDs, editFlag }) => {
  const editorColumns = useMemo(() => {
    return [
      { name: 'checkPointCode', editor: Select, clearButton: false },
      { name: 'autoCheckFlag', editor: CheckBox, renderer: ({ value }) => yesOrNoRender(value) },
      { name: 'ignoreCheckInvoiceType', editor: Select, maxTagCount: 100 },
    ];
  }, []);

  return (
    <EditorForm
      columns={1}
      useColon={false}
      dataSet={headerDs}
      editorFlag={editFlag}
      editorColumns={editorColumns}
    />
  );
});
