/*
 * Basic - 基础信息
 * @Date: 2023-04-06 10:19:06
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, TextField, Select, Lov, TextArea, Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import FormField from '@/routes/components/FormField';

const Detail = ({ dataSet, custLoading, customizeForm, showOldModal, otherModalProps }) => {
  return (
    <div className="basic-content-wrap">
      <div className="basic-content">
        <div className="basic-content-title">
          {intl.get('sslm.common.view.title.baseInfo').d('基础信息')}
        </div>
        {customizeForm(
          {
            code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC',
          },
          <Form
            columns={3}
            dataSet={dataSet}
            labelLayout="float"
            custLoading={custLoading}
            style={{ width: '75%', maxWidth: 1172 }}
          >
            <TextField name="changeReqNumber" />
            <TextField name="createUserRealName" />
            <TextField name="creationDate" />
            <TextField name="reqStatus" />
            <FormField
              isEdit
              dataSet={dataSet}
              name="supplierLov"
              otherModalProps={otherModalProps}
              pageSource="SUPPLIER_INFO_NEW"
              componentType={showOldModal ? 'LOV' : 'SUPPLIERLOV'}
            />
            <Select name="changeLevel" />
            <Lov name="companyName" />
            <Lov name="companyIds" />
            <Lov name="purchaseAgentId" maxTagCount={2} hidden />
            <TextField name="erpSupplierNum" hidden />
            <TextField name="erpSupplierName" hidden />
            <Lov name="investigateTemplateId" />
            <TextArea newLine rows={3} cols={2} colSpan={2} name="remark" resize="vertical" />
            <Attachment newLine name="attachmentUuid" />
          </Form>
        )}
      </div>
    </div>
  );
};

export default Detail;
