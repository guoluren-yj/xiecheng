/*
 * @Description: 结算策略详情-查验规则设置
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { memo, useEffect } from 'react';
import { Form } from 'choerodon-ui/pro';

import { FormItem } from '@/routes/Components';

/**
 * @description: 校验规则设置
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ headerDs, editFlag, modal }) => {
  const commonFormProps = {
    editor: 'select',
    editable: editFlag,
  };

  useEffect(() => {
    modal.handleOk(async () => {
      headerDs.current.set('checkRuleConfig', 1);
      const valiFields = ['verifyTaxNumConsistencyList'];
      const res = await Promise.all(
        valiFields.map((item) => headerDs.current.getField(item).checkValidity())
      );
      return res.every((item) => item);
    });
  }, [modal, headerDs]);

  return (
    <Form
      columns={1}
      dataSet={headerDs}
      showHelp="tooltip"
      labelLayout={editFlag ? 'float' : 'vertical'}
    >
      <FormItem
        name="invoiceVerifyNodeList"
        optionsFilter={(record) =>
          headerDs.current.get('enableCheckFlag') === 0
            ? record?.data?.value !== 'AFTER_INVOICE_CHECK'
            : true
        }
        {...commonFormProps}
      />
      <FormItem name="verifyTaxNumConsistencyList" {...commonFormProps} />
    </Form>
  );
});
