/**
 * 采购方评估 - 详情 - 公司信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-31 17:34:06
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { yesOrNoRender } from 'utils/renderer';
import '../index.less';

const CompanyInfo = observer(
  ({ dataSet, isEdit, customizeForm, custLoading, isCreate, customizeCode }) => {
    const { reportStatus, progressStatus } =
      dataSet?.current?.get(['reportStatus', 'progressStatus']) || {};
    const formColumns = [
      !newIsEdit && {
        name: 'groupFlag',
        componentType: 'SELECT',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      newIsEdit && {
        name: 'groupFlag',
        componentType: 'SELECT',
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
    ].filter(Boolean);

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

export default CompanyInfo;
