import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { toJS } from 'mobx';
import intl from 'utils/intl';
import { enableRender, dateTimeRender } from 'utils/renderer';

import { renderDelegateStatus } from '@/utils/util';
import styles from './style/index.less';

export default class List extends Component {
  @Bind()
  getColumns() {
    const { handleEdit = () => {} } = this.props;
    return [
      {
        name: 'automaticProcessStatus',
        width: 120,
        renderer: renderDelegateStatus,
      },
      {
        name: 'processKey',
        width: 170,
      },
      {
        name: 'processName',
        width: 170,
      },
      {
        header: intl.get('hwfp.common.model.approval.processNode').d('审批节点'),
        width: 200,
        renderer: ({ record }) => {
          const delegateActList = toJS(record.get('delegateActList'));
          if (!delegateActList || !Array.isArray(delegateActList)) {
            return '';
          }
          return delegateActList.map((n) => n.name).join(',');
        },
      },
      {
        name: 'processConditionMeaning',
        width: 90,
      },
      {
        name: 'conditionDetail',
        width: 280,
        renderer: ({ text, record }) => {
          if (!record) {
            return '-';
          }
          const { processCondition, processStartDate, processEndDate } = record.get([
            'processCondition', 'processStartDate', 'processEndDate',
          ]);
          if (processCondition && processStartDate && processEndDate) {
            return (
              <>{dateTimeRender(processStartDate)}~{dateTimeRender(processEndDate)}</>
            );
          }
          return text;
        },
      },
      {
        name: 'processRuleMeaning',
        width: 90,
      },
      {
        name: 'processAction',
        width: 170,
      },
      {
        name: 'enabledFlag',
        renderer: ({ text }) => enableRender(parseInt(text, 10)),
        width: 120,
      },
      {
        header: intl.get('hzero.common.button.action').d('操作'),
        lock: 'right',
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleEdit(record)}>{intl.get('hzero.common.button.edit').d('编辑')}</a>
        ),
      },
    ];
  }

  @Bind()
  handleChange(pagination) {
    const { handleChangePagination = () => {}, handleSelectRows = () => {} } = this.props;
    // 翻页时清空已选择行数据
    handleSelectRows([], []);
    handleChangePagination({ page: pagination });
  }

  render() {
    const { tableDs } = this.props;

    return (
      <Table
        dataSet={tableDs}
        columns={this.getColumns()}
        className={styles['automatic-process-list']}
        autoHeight={{ type: 'maxHeight', diff: 50 }}
      />
    );
  }
}
