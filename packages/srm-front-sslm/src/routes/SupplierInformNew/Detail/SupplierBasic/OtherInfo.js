/*
 * OtherInfo - 其他信息
 * @Date: 2023-04-13 09:15:25
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import FormField from '@/routes/components/FormField';
import { yesOrNoRender } from 'utils/renderer';

const OtherInfo = ({
  dataSet,
  isEdit,
  isRead,
  custLoading,
  customizeForm,
  supplierInformRemote,
}) => {
  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: 'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OTHERS',
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
          <FormField
            name="foreverBlacklistFlag"
            renderer={({ value }) => yesOrNoRender(Number(value))}
          />
          <FormField name="blacklistFlag" renderer={({ value }) => yesOrNoRender(Number(value))} />
          <FormField name="blacklistExpiryDate" isEdit={isEdit} componentType="DATEPICKER" />
          <FormField name="tempFlag" isEdit={isEdit} componentType="CHECKBOX" />
          <FormField name="tempEndDate" isEdit={isEdit} componentType="DATEPICKER" />
          {supplierInformRemote
            ? supplierInformRemote.process('SSLM_SUPPLIER_INFORM_NEW_OTHER_INFO_NODE', null, {
                dataSet,
                isEdit,
                isRead,
              })
            : null}
        </Form>
      )}
    </Spin>
  );
};

export default OtherInfo;
