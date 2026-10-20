/**
 * 采购方评估 - 详情 - 评估结果
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-02 11:16:29
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { PRIVATE_BUCKET } from '_utils/config';
import '../index.less';

const AssessmentResult = observer(
  ({
    pubEdit,
    dataSet,
    isEdit,
    customizeForm,
    custLoading,
    customizeCode,
    customizeReadOnly = false,
    remote,
  }) => {
    const { reportStatus, progressStatus } =
      dataSet?.current?.get(['reportStatus', 'progressStatus']) || {};
    const newIsEdit =
      (isEdit &&
        (['NEW', 'REJECTED', 'FEEDBACK', 'FINAL_COLLECTED'].includes(reportStatus) ||
          (reportStatus === 'APPROVED' && progressStatus !== 'EVAL_COMPLETE'))) ||
      pubEdit;

    const formColumns = [
      {
        name: 'finalScore',
        componentType: 'INPUTENUMBER',
      },
      {
        name: 'grade',
        componentType: 'TextField',
      },
      {
        name: 'resultsFlag',
        componentType: 'Select',
      },
      {
        name: 'opinion',
        componentType: 'TEXTAREA',
        newLine: true,
        rows: 3,
        cols: 2,
        colSpan: 2,
        resize: 'vertical',
      },
      {
        name: 'respUserRemarks',
        componentType: 'TEXTAREA',
        newLine: true,
        rows: 3,
        cols: 2,
        colSpan: 2,
        resize: 'vertical',
      },
      {
        name: 'userNames',
        componentType: 'Lov',
        newLine: true,
      },
      {
        name: 'resultLinkUuid',
        componentType: 'Attachment',
        newLine: true,
        bucketName: PRIVATE_BUCKET,
        readOnly: !newIsEdit,
        colSpan: 3,
      },
      {
        name: 'selfFinalSupplierScore',
        componentType: 'INPUTENUMBER',
        newLine: true,
      },
      {
        name: 'lastTotalScore',
        componentType: 'INPUTENUMBER',
      },
    ];

    // 获取评估结果字段
    const getFormFields = remote
      ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.ASSESSMENT_RESULT_FORM', formColumns, {
          readOnly: customizeReadOnly,
          dataSet,
        })
      : formColumns;

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_RESULT',
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
            {getFormFields.map(props => {
              return <FormField key={props.name} isEdit={newIsEdit} {...props} />;
            })}
          </Form>
        )}
      </Spin>
    );
  }
);

export default AssessmentResult;
