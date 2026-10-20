/**
 * HeaderInfo - 采购财务头信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import FormField from '@/routes/components/FormField';

const HeaderInfo = ({
  dataSet,
  isEdit,
  customizeForm,
  custLoading,
  code = '',
  // type = '',
  proxyDsCreate = {},
}) => {
  // 历史记录弹框不需要样式
  const style = { marginBottom: 16 };
  return customizeForm(
    {
      code,
      enableCreate: false,
      labelLayout: isEdit ? 'float' : 'vertical',
      readOnly: !isEdit,
      enableReLoad: false,
      proxyDsCreate,
    },
    <Form
      dataSet={dataSet}
      columns={3}
      labelLayout={isEdit ? 'float' : 'vertical'}
      custLoading={custLoading}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      style={style}
      useWidthPercent
    >
      <FormField isEdit={isEdit} name="programmeGroups" componentType="SELECT" />
      <FormField isEdit={isEdit} name="schemeGroup" />
      <FormField isEdit={isEdit} name="accountGroup" componentType="LOV" />

      <FormField isEdit={isEdit} name="reconciliationAccount" componentType="LOV" />
      <FormField isEdit={isEdit} name="ouId" componentType="LOV" />
      <FormField isEdit={isEdit} name="termId" componentType="LOV" />

      <FormField
        isEdit={isEdit}
        name="frozenFlag"
        componentType="CHECKBOX"
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
      />
      <FormField isEdit={isEdit} name="paymentFrozen" componentType="SELECT" />
    </Form>
  );
};

export default HeaderInfo;
