/**
 * HeaderInfo - 详情头信息
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Form } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';

const HeaderInfo = ({
  // type = '',
  remote,
  dataSet,
  isEdit,
  pubEditFlag,
  customizeForm,
  custLoading,
  code,
}) => {
  // 历史记录弹框不需要样式
  // const style = type === 'history' ? {} : { width: '75%', maxWidth: 1172 };
  return customizeForm(
    {
      code,
      enableCreate: false,
      labelLayout: isEdit ? 'float' : 'vertical',
      readOnly: !(isEdit || pubEditFlag),
      enableReLoad: false,
    },
    <Form
      useWidthPercent
      dataSet={dataSet}
      columns={3}
      labelLayout={isEdit ? 'float' : 'vertical'}
      custLoading={custLoading}
      className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
    >
      <FormField isEdit={isEdit} name="reqNumber" />
      <FormField isEdit={isEdit} name="reqStatus" />
      <FormField isEdit={isEdit} name="creationDate" componentType="DATETIMEPICKER" />
      <FormField isEdit={isEdit} name="creator" />
      <FormField isEdit={isEdit} name="unitNameLov" componentType="LOV" />
      <FormField isEdit={isEdit} name="reqTypeCode" componentType="SELECT" />
      <FormField isEdit={isEdit} name="supplierNum" restrict="a-zA-Z0-9" />
      <FormField isEdit={isEdit} name="supplierName" />
      <FormField isEdit={isEdit} name="supplierTypeCode" componentType="SELECT" />
      <FormField
        isEdit
        name="idNum"
        border={isEdit}
        displayOutput={!isEdit}
        componentType="TextField"
        restrict="a-zA-Z0-9-_"
      />
      <FormField
        isEdit
        name="passport"
        border={isEdit}
        displayOutput={!isEdit}
        componentType="TextField"
        restrict="a-zA-Z0-9-_"
      />
      <FormField
        isEdit
        name="unifiedSocialCode"
        border={isEdit}
        displayOutput={!isEdit}
        componentType="TextField"
        restrict="a-zA-Z0-9-_"
      />
      <FormField isEdit={isEdit} name="organizingInstitutionCode" restrict="a-zA-Z0-9-_" />
      <FormField isEdit={isEdit} name="dunsCode" restrict="a-zA-Z0-9-_" />
      <FormField isEdit={isEdit} name="businessRegistrationNumber" restrict="a-zA-Z0-9-_" />
      <FormField isEdit={isEdit} name="remark" />
      <FormField isEdit={isEdit} name="externalSystemCodeLov" componentType="LOV" />
      <FormField isEdit={isEdit} name="enabledFlag" componentType="SELECT" />
      <FormField isEdit={isEdit} name="termId" componentType="LOV" />
      <FormField isEdit={isEdit} name="paymentTypeCode" componentType="LOV" />
      {remote &&
        remote.process('SSLM_SUPPLIER_WAREHOUSE_DETAIL_HEADER_INFO_EXTRA_NODE', null, { isEdit })}
    </Form>
  );
};

export default HeaderInfo;
