/*
 * @Date: 2022-12-09 13:53:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';

const BaseInfo = ({ dataSet, custLoading, customizeForm, customizeUnitCode }) => {
  const isEdit = true;
  const isDisabled = true;

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: customizeUnitCode,
        },
        <Form columns={3} dataSet={dataSet} labelLayout="float" custLoading={custLoading}>
          <FormField isEdit={isEdit} name="documentNumber" />
          <FormField isEdit={isEdit} name="realName" />
          <FormField isEdit={isEdit} name="creationDate" />
          <FormField isEdit={isEdit} name="documentType" componentType="SELECT" />
          <FormField isEdit={isEdit} name="documentFrom" componentType="SELECT" />
          <FormField isEdit={isEdit} name="processStatus" renderer={renderStatus} />
          <FormField
            isEdit={isEdit}
            name="supplierCompanyId"
            componentType="LOV"
            disabled={isDisabled}
          />
          <FormField isEdit={isEdit} name="fromStageId" componentType="SELECT" />
          <FormField
            isEdit={isEdit}
            name="toStageId"
            componentType="SELECT"
            disabled={isDisabled}
          />
          <FormField isEdit={isEdit} name="dimensionCode" componentType="SELECT" />
          <FormField isEdit={isEdit} name="companyId" componentType="LOV" disabled={isDisabled} />
          <FormField
            newLine
            rows={3}
            colSpan={2}
            isEdit={isEdit}
            name="remark"
            resize="both"
            componentType="TextArea"
          />
        </Form>
      )}
    </Spin>
  );
};

export default BaseInfo;
