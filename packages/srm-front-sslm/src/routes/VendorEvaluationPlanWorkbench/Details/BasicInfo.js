/**
 * @Description: 供应商评估计划工作台-详情页 - 基本信息
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-07 10:56:59
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React from 'react';
import { Form, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';
import { renderStatus } from '@/routes/components/utils';
import '../index.less';
import { readOnlyRenderer, handleExtTextRenderIntercept } from './utils';

const BasicInfo = observer(
  ({ remote, dataSet, isPub, isEdit, customizeForm, pubEditFlag, custLoading }) => {
    const isGroup = +dataSet?.current?.get('groupFlag');
    const formColumns = [
      {
        name: 'evalPlanNum',
      },
      {
        name: 'evalPlanDescription',
      },
      {
        name: 'evalPlanStrategyId',
        componentType: 'LOV',
        displayField: 'strategyName',
      },
      {
        name: 'groupFlag',
        componentType: 'SELECT',
      },
      {
        name: 'companyId',
        hidden: isGroup,
        componentType: 'LOV',
        displayField: 'companyName',
      },
      {
        name: 'evalStatus',
        renderer: renderStatus,
      },
      {
        name: 'realName',
      },
      {
        name: 'creationDate',
        componentType: 'DATEPICKER',
      },
      {
        name: 'creatorUnitName',
      },
      {
        name: 'assessType',
        componentType: 'SELECT',
      },
      {
        name: 'publishDate',
      },
      {
        name: 'planTypeCode',
        componentType: 'SELECT',
      },
      {
        name: 'planRemark',
        componentType: 'TextArea',
        newLine: true,
        resize: 'vertical',
        colSpan: 2,
      },
    ];

    return (
      <Spin dataSet={dataSet}>
        {customizeForm(
          {
            code: 'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BASICINFO',
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !isEdit || pubEditFlag,
            enableReLoad: false,
            extTextRenderIntercept: (props, node) =>
              handleExtTextRenderIntercept({ ...props, remote, isPub }, node),
          },
          <Form
            dataSet={dataSet}
            columns={3}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={
              isEdit
                ? 'addon-before-style'
                : 'addon-before-style,c7n-pro-vertical-form-display c7n-pro-readOnly-style'
            }
            useWidthPercent
            custLoading={custLoading}
          >
            {formColumns.map(props => {
              return (
                <FormField
                  key={props.name}
                  isEdit={isEdit}
                  renderer={rendererProps =>
                    readOnlyRenderer({ ...rendererProps, ...props, remote, isPub })
                  }
                  {...props}
                />
              );
            })}
          </Form>
        )}
      </Spin>
    );
  }
);

export default BasicInfo;
