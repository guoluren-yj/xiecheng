/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2022-07-15 14:35:02
 */
import React from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { Form, Table, Select, CheckBox, Modal } from 'choerodon-ui/pro';

const commonPrompt = 'srpm.common.model.common';

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
        editor: true,
      },
      {
        name: 'dimensionField',
        editor: true,
      },
      {
        name: 'editFlag',
        // editor: true,
        renderer: ({ record }) => (
          <div>
            <CheckBox record={record} name="editFlag" />
            <span> {intl.get(`${commonPrompt}.editAble`).d('允许修改')} </span>
          </div>
        ),
      },
    ];
  };

  const mergeColumns = () => {
    return [
      {
        name: 'dimensionType',
        editor: true,
      },
      {
        name: 'dimensionField',
        editor: true,
      },
      {
        name: 'mergeFlag',
        editor: true,
      },
      {
        name: 'dimensionConfig',
        editor: true,
      },
      {
        name: 'mergeAfterEditFlag',
        editor: true,
      },
    ];
  };

  const splitBtns = [
    'add',
    [
      'delete',
      {
        icon: 'delete_sweep',
        onClick: () => {
          const { selected } = splitlineDs;
          const deleUpdateArr = selected.filter((ele) => ele.get('configId'));
          if (deleUpdateArr.length > 0) {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: (
                <p>
                  {intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？')}
                </p>
              ),
              onOk: () => {
                splitlineDs.delete(selected, false);
              },
              onCancel: () => {},
            });
          } else {
            splitlineDs.remove(selected);
          }
        },
      },
    ],
  ];

  const buttons = [
    'add',
    [
      'delete',
      {
        icon: 'delete_sweep',
        onClick: () => {
          const { selected } = mergelineDs;
          const deleUpdateArr = selected.filter((ele) => ele.get('configId'));
          if (deleUpdateArr.length > 0) {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: (
                <p>
                  {intl.get('hzero.common.view.delete_selected_row_confirm').d('确认删除选中行？')}
                </p>
              ),
              onOk: () => {
                mergelineDs.delete(selected, false);
              },
              onCancel: () => {},
            });
          } else {
            mergelineDs.remove(selected);
          }
        },
      },
    ],
  ];

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
          labelLayout="float"
          useColon={false}
          useWidthPercent
          style={{
            marginBottom: ['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(
              splitInfoDs?.current?.get('splitNode')
            )
              ? '16px'
              : 0,
          }}
        >
          <Select name="splitNode" />
          {splitInfoDs?.current?.get('splitNode') === 'BALANCE_SPLIT' && (
            <Select name="splitMode" />
          )}
          {['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(splitInfoDs?.current?.get('splitNode')) && (
            <Select name="splitQuantityControlRule" />
          )}
        </Form>

        {['BALANCE_SPLIT', 'RELEASE_SPLIT'].includes(splitInfoDs?.current?.get('splitNode')) && (
          <Table
            dataSet={splitlineDs}
            columns={splitColumns()}
            buttons={splitBtns}
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
          labelLayout="float"
          useColon={false}
          style={{ marginBottom: '16px' }}
        >
          <Select name="mergeQuantityControlRule" />
        </Form>

        <Table
          dataSet={mergelineDs}
          columns={mergeColumns()}
          buttons={buttons}
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
          <Select name="balanceQuantityControlRule" />
        </Form>
      </div>
    </div>
  );
};

export default observer(RuleConfig);
