/**
 * @Description: 销售方-评估计划-详情页 - 基本信息
 * @Author: zlh
 * @Date: 2023-09-06
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';
import '../index.less';

const style = { width: '75%', maxWidth: 1172 };

const BasicInfo = observer(({ dataSet, customizeForm, custLoading }) => {
  const isGroup = +dataSet?.current?.get('groupFlag');
  const formColumns = [
    {
      name: 'evalPlanNum',
      componentType: 'TextField',
    },
    {
      name: 'evalPlanDescription',
      componentType: 'TextField',
    },
    {
      name: 'evalPlanStrategyLov',
      componentType: 'LOV',
    },
    {
      name: 'groupFlag',
      componentType: 'SELECT',
    },
    {
      name: 'companyLov',
      hidden: isGroup,
      componentType: 'LOV',
    },
    {
      name: 'evalStatusMeaning',
      componentType: 'TextField',
      renderer: renderStatus,
    },
    {
      name: 'realName',
      componentType: 'TextField',
    },
    {
      name: 'creationDate',
      componentType: 'DatePicker',
    },
    {
      name: 'creatorUnitName',
      componentType: 'TextField',
    },
    {
      name: 'assessType',
      componentType: 'SELECT',
    },
    {
      name: 'planRemark',
      componentType: 'TextArea',
      newLine: true,
      colSpan: 2,
    },
  ];

  return (
    <Spin dataSet={dataSet}>
      {customizeForm(
        {
          code: 'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.BASIC_INFO',
          enableCreate: false,
          labelLayout: 'vertical',
          readOnly: true,
          enableReLoad: false,
        },
        <Form
          dataSet={dataSet}
          columns={3}
          labelLayout="vertical"
          className="addon-before-style,c7n-pro-vertical-form-display c7n-pro-readOnly-style"
          style={style}
          custLoading={custLoading}
        >
          {formColumns.map(props => {
            return <FormField key={props.name} isEdit={false} {...props} />;
          })}
        </Form>
      )}
    </Spin>
  );
});

export default BasicInfo;
