/*
 * @Date: 2022-12-09 13:53:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const OtherInfo = ({
  dataSet,
  isEdit,
  custLoading,
  customizeForm,
  customizeUnitCode,
  readOnlyFlag,
  sourceKey,
}) => {
  // 单据样式定制，审批表单只读
  const custProps = sourceKey === 'APPROVAL_FORM' ? { readOnly: true } : { readOnly: readOnlyFlag };
  return customizeForm(
    {
      code: customizeUnitCode,
      ...custProps,
    },
    <Form
      columns={3}
      useWidthPercent
      dataSet={dataSet}
      custLoading={custLoading}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      <FormField isEdit={isEdit} name="purchaseAgentId" componentType="LOV" />
      <FormField isEdit={isEdit} name="termId" componentType="LOV" />
      <FormField isEdit={isEdit} name="typeCode" componentType="LOV" />
    </Form>
  );
};

export default OtherInfo;
