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

const BasicInfo = observer(
  ({
    dataSet,
    isEdit,
    pubEdit,
    customizeForm,
    custLoading,
    isCreate,
    id,
    customizeCode,
    customizeReadOnly = false,
  }) => {
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
        name: 'reportStatus',
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
        componentType: 'DATETIMEPICKER',
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
        name: 'evalType',
        componentType: 'SELECT',
      },
      {
        name: 'evalTplId',
        componentType: 'LOV',
      },
      {
        name: 'showParentFlag',
        componentType: 'CHECKBOX',
      },
      {
        name: 'progressStatus',
        componentType: 'SELECT',
      },
      {
        name: 'feedbackDate',
      },
      {
        name: 'publishDate',
      },
      {
        name: 'evalRemark',
        componentType: 'TextArea',
        resize: 'both',
        newLine: true,
        colSpan: 2,
      },
    ];

    const newIsEdit =
      isCreate ||
      pubEdit ||
      (isEdit &&
        ['EVAL_PREPARE', 'EVAL_RESULT'].includes(progressStatus) &&
        ['NEW', 'REJECTED', 'FINAL_COLLECTED'].includes(reportStatus));
    const disabledFlag =
      ['EVAL_RESULT'].includes(progressStatus) && ['FINAL_COLLECTED'].includes(reportStatus);
    return (
      <Spin dataSet={dataSet} id={id}>
        {customizeForm(
          {
            code: customizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.BASICINFO',
            readOnly: customizeReadOnly,
          },
          <Form
            useWidthPercent
            columns={3}
            dataSet={dataSet}
            custLoading={custLoading}
            labelLayout={newIsEdit ? 'float' : 'vertical'}
            className={newIsEdit ? '' : 'c7n-pro-vertical-form-display'}
          >
            {formColumns.map(props => {
              return (
                <FormField key={props.name} isEdit={newIsEdit} disabled={disabledFlag} {...props} />
              );
            })}
          </Form>
        )}
      </Spin>
    );
  }
);

export default BasicInfo;
