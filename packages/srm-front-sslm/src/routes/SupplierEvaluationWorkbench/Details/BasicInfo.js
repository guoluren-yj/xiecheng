/**
 * 采购方评估 - 详情 - 基本信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-31 17:34:06
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/BasicInfo.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';
import '../index.less';

const BasicInfo = observer(
  ({ dataSet, isEdit, customizeForm, custLoading, isCreate, customizeCode }) => {
    const { reportStatus, progressStatus } =
      dataSet?.current?.get(['reportStatus', 'progressStatus']) || {};
    const formColumns = [
      {
        name: 'evalNum',
        componentType: 'TextField',
      },
      {
        name: 'evalDescription',
        componentType: 'TextField',
      },
      {
        name: 'reportStatusMeaning',
        componentType: 'TextField',
        renderer: renderStatus,
      },
      {
        name: 'sourceTypeMeaning',
        componentType: 'TextField',
      },
      {
        name: 'evalPlanNum',
        componentType: 'TextField',
      },
      {
        name: 'creationDate',
        componentType: 'TextField',
      },
      {
        name: 'realName',
        componentType: 'TextField',
      },
      {
        name: 'unitName',
        componentType: 'TextField',
      },
      {
        name: 'strategyLov',
        componentType: 'LOV',
      },
      {
        name: 'evalDateFrom',
        componentType: 'DatePicker',
      },
      {
        name: 'evalDateTo',
        componentType: 'DatePicker',
      },
      {
        name: 'assessType',
        componentType: 'SELECT',
      },
      {
        name: 'investigationType',
        componentType: 'SELECT',
      },
      {
        name: 'evalRemark',
        componentType: 'TextArea',
        newLine: true,
        colSpan: 2,
        resize: 'vertical',
      },
    ];

    const newIsEdit =
      isCreate ||
      (isEdit &&
        ['EVAL_PREPARE'].includes(progressStatus) &&
        ['NEW', 'REJECTED'].includes(reportStatus));

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            readOnly: !isEdit,
            code: customizeCode,
          },
          <Form
            useWidthPercent
            dataSet={dataSet}
            columns={3}
            custLoading={custLoading}
            labelLayout={newIsEdit ? 'float' : 'vertical'}
            className={newIsEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            {formColumns.map(props => {
              return <FormField key={props.name} isEdit={newIsEdit} {...props} />;
            })}
          </Form>
        )}
      </Spin>
    );
  }
);

export default BasicInfo;
