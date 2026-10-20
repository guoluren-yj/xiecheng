/**
 * 采购方评估 - 详情 - 公司信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-31 17:34:06
 * @FilePath: /srm-front-sslm/src/routes/PurchaserEvaluationWorkbench/Details/CompanyInfo.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { yesOrNoRender } from 'utils/renderer';
import '../index.less';

const CompanyInfo = observer(
  ({
    dataSet,
    isEdit,
    pubEdit,
    customizeForm,
    pubEditFlag,
    custLoading,
    isCreate,
    customizeCode,
    customizeReadOnly = false,
  }) => {
    const { reportStatus, progressStatus } =
      dataSet?.current?.get(['reportStatus', 'progressStatus']) || {};
    const formColumns = [
      {
        name: 'groupFlag',
        componentType: 'SELECT',
        renderer: ({ value }) => {
          return yesOrNoRender(value);
        },
      },
      {
        name: 'companyLov',
        componentType: 'Lov',
      },
      {
        name: 'ouLov',
        componentType: 'Lov',
      },
      {
        name: 'invOrganizationLov',
        componentType: 'Lov',
      },
      {
        name: 'inventoryLov',
        componentType: 'Lov',
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
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: customizeCode || 'SSLM.PURCHASER_ASSESS_DETAIL.COMPANY_INFO',
            enableCreate: false,
            labelLayout: newIsEdit ? 'float' : 'vertical',
            readOnly: !newIsEdit || pubEditFlag || customizeReadOnly,
            enableReLoad: false,
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

export default CompanyInfo;
