/*
 * @Date: 2023-03-20 11:54:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import moment from 'moment';
import { Form } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'utils/renderer';
import FormField from '@/routes/components/FormField';

const StatusInfo = ({
  dataSet,
  isEdit,
  custLoading,
  customizeForm,
  customizeUnitCode,
  readOnlyFlag,
  sourceKey,
  isCreate,
}) => {
  const { toStageCode } = dataSet?.current?.get(['toStageCode']) || {};
  // 单据样式定制，审批表单只读
  const custProps = sourceKey === 'APPROVAL_FORM' ? { readOnly: true } : { readOnly: readOnlyFlag };
  const hidden = isCreate || toStageCode !== 'ELIMINATED';

  return customizeForm(
    {
      code: customizeUnitCode,
      ...custProps,
      // 解决状态信息页签动态渲染时，个性化默认值不生效问题
      afterCustomizeDs: () => {
        // 仅新建时默认值生效
        if (isCreate && dataSet.current) {
          dataSet.current.set({
            blacklistFlag: 0,
            tempFlag: 0,
          });
        }
      },
    },
    <Form
      columns={3}
      useWidthPercent
      dataSet={dataSet}
      custLoading={custLoading}
      labelLayout={isEdit ? 'float' : 'vertical'}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      <FormField
        isEdit={isEdit}
        hidden={hidden}
        name="blacklistFlag"
        componentType="CHECKBOX"
        renderer={({ value }) => yesOrNoRender(value) || '-'}
      />
      <FormField isEdit={isEdit} hidden={hidden} name="blacklistDateType" componentType="SELECT" />
      <FormField
        newLine
        min={moment()}
        isEdit={isEdit}
        hidden={hidden}
        name="blacklistStartDate"
        componentType="DATEPICKER"
      />
      <FormField
        isEdit={isEdit}
        hidden={hidden}
        name="blacklistEndDate"
        componentType="DATEPICKER"
      />
      <FormField newLine isEdit={isEdit} name="tempFlag" componentType="CHECKBOX" />
      <FormField isEdit={isEdit} name="tempEndDate" componentType="DATEPICKER" />
    </Form>
  );
};

export default StatusInfo;
