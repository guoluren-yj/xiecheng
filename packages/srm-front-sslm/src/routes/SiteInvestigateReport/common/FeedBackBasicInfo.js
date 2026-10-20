/**
 * FeedBackBasicInfo - 现场考评档案反馈基本信息组件
 * @date: 2020/11/25
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { memo } from 'react';
import { Form, Output, TextField, TextArea, Select } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';
import '@/routes/index.less';

const FeedBackBasicInfo = memo(
  ({
    dataSet,
    isView = true,
    customizeForm = () => {},
    customizeCode = '',
    custLoading = false,
  }) => {
    const basicInfo = (dataSet && dataSet.toData()) || [];
    const { evalStatus = '' } = basicInfo[0] || {};
    const isShowBackReason = ['BACK'].includes(evalStatus);
    return customizeForm(
      {
        code: customizeCode,
      },
      <Form
        labelWidth={[110, 170, 170]}
        dataSet={dataSet}
        columns={3}
        disabled={isView}
        className="addon-before-style"
        custLoading={custLoading}
      >
        <Output name="evalNum" />
        <Output name="evalDescription" />
        <Output name="evalStatusMeaning" />
        <Output name="creationDate" />
        <Output name="realName" />
        <Output name="unitName" />
        <Output name="companyName" />
        <Output name="ouName" />
        <Output name="organizationName" />
        <Output name="inventoryName" />
        <Output name="evalTypeMeaning" />
        <Output name="evalTplName" />
        <Output name="weightedFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Output name="evalDateFrom" />
        <Output name="evalDateTo" />
        <Output name="supplierName" />
        <TextField name="supplierContactor" />
        <TextField name="supplierContactMail" />
        <TextField
          name="supplierContactPhone"
          restrict="0-9,-"
          addonBefore={<Select name="internationalTelCode" clearButton={false} />}
        />
        <Output name="needFeedbackFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Output name="callSuppliersFlag" renderer={({ value }) => yesOrNoRender(value)} />
        <Output name="supplierTypeMeaning" />
        <Output colSpan={2} name="investigationTypeMeaning" />
        <Output newLine colSpan={1.5} name="supplierOverview" />
        <Output newLine colSpan={1.5} name="supplierRegisteredAddress" />
        <TextArea newLine colSpan={1.5} name="evalAddress" resize="vertical" />
        <Output newLine colSpan={1.5} name="evalRemark" />
        <TextArea newLine colSpan={1.5} name="backRemark" resize="vertical" />
        {isShowBackReason && (
          <TextArea newLine colSpan={1.5} name="backReason" resize="vertical" disabled />
        )}
      </Form>
    );
  }
);

export default FeedBackBasicInfo;
