/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-15 14:19:25
 */
import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Form, Table, Output } from 'choerodon-ui/pro';
import { yesOrNoRender } from 'hzero-front/lib/utils/renderer';

// const commonPrompt = 'srpm.common.model.common';

const RuleConfig = ({
  // containerId,
  splitInfoDs,
  splitlineDs,
  mergeInfoDs,
  mergelineDs,
  balanceInfoDS,
}) => {
  const splitColumns = () => {
    return [
      {
        name: 'dimensionType',
      },
      {
        name: 'dimensionField',
      },
      {
        name: 'editFlag',
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
        // renderer: ({ record }) => (
        //   <div>
        //     <CheckBox record={record} name="editFlag" disabled />
        //     <span> {intl.get(`${commonPrompt}.editAble`).d('允许修改')} </span>
        //   </div>
        // ),
      },
    ];
  };

  const mergeColumns = () => {
    return [
      {
        name: 'dimensionType',
      },
      {
        name: 'dimensionField',
      },
      {
        name: 'mergeFlag',
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
      {
        name: 'dimensionConfig',
      },
      {
        name: 'mergeAfterEditFlag',
        renderer: ({ value }) => (value || value === 0 ? yesOrNoRender(value) : null),
      },
    ];
  };

  return (
    <div className="config-right-content">
      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get('srpm.common.common.view.splitRule').d('拆分规则')}
        </div>
        <Form
          dataSet={splitInfoDs}
          showLines={6}
          columns={3}
          useColon={false}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          style={{
            marginBottom: ['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(
              splitInfoDs?.current?.get('splitNode')
            )
              ? '16px'
              : 0,
          }}
          useWidthPercent
        >
          <Output name="splitNode" />
          {splitInfoDs?.current?.get('splitNode') === 'BALANCE_SPLIT' && (
            <Output name="splitMode" />
          )}
          {['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(splitInfoDs?.current?.get('splitNode')) && (
            <Output name="splitQuantityControlRule" />
          )}
        </Form>

        {['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(splitInfoDs?.current?.get('splitNode')) && (
          <Table
            dataSet={splitlineDs}
            columns={splitColumns()}
            customizedCode="srpm-split-node-table"
            style={{ maxHeight: '450px' }}
          />
        )}
      </div>

      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get('srpm.common.common.view.mergeRule').d('合并规则')}
        </div>

        <Form
          dataSet={mergeInfoDs}
          showLines={6}
          columns={3}
          useColon={false}
          labelLayout="vertical"
          labelAlign="left"
          className="c7n-pro-vertical-form-display"
          style={{ marginBottom: '16px' }}
          useWidthPercent
        >
          <Output name="mergeQuantityControlRule" />
        </Form>

        <Table
          dataSet={mergelineDs}
          columns={mergeColumns()}
          customizedCode="srpm-merge-node-table"
          style={{ maxHeight: '450px' }}
        />
      </div>

      <div className="config-chunk-content">
        <div className="config-right-content-two-title">
          <div className="config-right-content-two-title-ink" />
          {intl.get('srpm.common.common.view.balanceRule').d('平衡规则')}
        </div>

        <Form
          dataSet={balanceInfoDS}
          showLines={6}
          columns={3}
          labelLayout="float"
          useColon={false}
          useWidthPercent
        >
          <Output name="balanceQuantityControlRule" />
        </Form>
      </div>
    </div>
  );
};

export default observer(RuleConfig);
