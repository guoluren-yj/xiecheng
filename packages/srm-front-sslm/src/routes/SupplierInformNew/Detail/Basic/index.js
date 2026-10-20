/*
 * Basic - 基础信息
 * @Date: 2023-04-06 10:19:06
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';

const Basic = ({ dataSet, isEdit, isRead, custLoading, customizeForm, changeLevel }) => {
  const companyHiddenFlag = ['GROUP'].includes(changeLevel);
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC',
          readOnly: isRead,
        },
        <Form
          columns={3}
          dataSet={dataSet}
          custLoading={custLoading}
          useWidthPercent
          labelLayout={isEdit ? 'float' : 'vertical'}
          className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
        >
          <FormField name="changeReqNumber" isEdit={isEdit} />
          <FormField name="createUserRealName" isEdit={isEdit} />
          <FormField name="creationDate" isEdit={isEdit} componentType="DATETIMEPICKER" />
          <FormField name="reqStatus" isEdit={isEdit} renderer={renderStatus} />
          <FormField name="supplierLov" isEdit={isEdit} componentType="LOV" />
          <FormField name="changeLevel" isEdit={isEdit} componentType="SELECT" />
          <FormField
            name="companyName"
            isEdit={isEdit}
            componentType="LOV"
            hidden={companyHiddenFlag}
          />
          <FormField
            name="companyIds"
            isEdit={isEdit}
            componentType="LOV"
            hidden={!['COMPANY'].includes(changeLevel)}
          />
          <FormField name="purchaseAgentId" isEdit={isEdit} componentType="LOV" maxTagCount={2} />
          <FormField name="erpSupplierNum" isEdit={isEdit} />
          <FormField name="erpSupplierName" isEdit={isEdit} />
          <FormField name="investigateTemplateId" isEdit={isEdit} componentType="LOV" />
          <FormField
            newLine
            rows={3}
            cols={2}
            colSpan={2}
            name="remark"
            isEdit={isEdit}
            resize="vertical"
            componentType="TEXTAREA"
          />
          <FormField
            newLine
            isEdit
            readOnly={!isEdit}
            name="attachmentUuid"
            componentType="ATTACHMENT"
          />
        </Form>
      )}
    </Spin>
  );
};

export default Basic;
