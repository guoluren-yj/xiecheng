/**
 * 采购方评估 - 详情 - 评估结果
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-02 11:16:29
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/AssessmentResult.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { PRIVATE_BUCKET } from '_utils/config';
import '../index.less';

const style = { width: '75%', maxWidth: 1172 };

const AssessmentResult = observer(
  ({ dataSet, isEdit, customizeForm, custLoading, customizeCode }) => {
    const { reportStatus, progressStatus } =
      dataSet?.current?.get(['reportStatus', 'progressStatus']) || {};
    const newIsEdit =
      isEdit &&
      (['NEW', 'REJECTED', 'FEEDBACK', 'FINAL_COLLECTED'].includes(reportStatus) ||
        (reportStatus === 'APPROVED' && progressStatus !== 'EVAL_COMPLETE'));

    const formColumns = [
      {
        name: 'finalScore',
        componentType: 'TextField',
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
        componentType: 'TextArea',
        newLine: true,
        colSpan: 2,
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
      },
    ];

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeCode,
            readOnly: !isEdit,
          },
          <Form
            dataSet={dataSet}
            columns={3}
            style={style}
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

export default AssessmentResult;
