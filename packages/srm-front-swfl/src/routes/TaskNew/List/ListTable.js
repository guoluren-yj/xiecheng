import React, { Component } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { menuTabEventManager } from 'utils/menuTab';

import styles from './index.less';

export default class ListTable extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectionMode: 'none',
    };
  }

  @Bind()
  handleSelectionMode() {
    this.setState({ selectionMode: this.state.selectionMode === 'none' ? 'rowbox' : 'none' });
  }

  @Bind()
  getColumns() {
    return [
      {
        header: intl.get('hwfp.common.model.process.detail').d('流程明细'),
        className: styles['list-table-cell'],
        width: 400,
        renderer: ({ record }) => {
          const startUserName = record.get('startUserName');
          const startTime = record.get('startTime');
          const processName = record.get('processName');
          const processInstanceId = record.get('processInstanceId');
          const employeeResign = record.get('employeeResign');
          return (
            <div className={styles['task-info']}>
              <div className={styles['task-info-link']}>
                <a onClick={() => this.linkToDetail(record)}>
                  {processInstanceId}
                  {` - ${processName}`}
                </a>
              </div>
              <div className={styles['task-info-content']}>
                <div>
                  <span className={styles['task-info-content-title']}>
                    {intl.get('hwfp.task.model.task.approveTime').d('申请时间')}
                  </span>
                  {startTime}
                </div>
                <div>
                  <span className={styles['task-info-content-title']}>
                    {intl.get('hwfp.common.model.apply.owner').d('申请人')}
                  </span>
                  {startUserName}
                  {employeeResign && (
                    <Tag color="#E5E7EC" className={styles['task-info-content-tag']}>
                      {intl.get('hpfm.organization.model.position.leave').d('离职')}
                    </Tag>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        name: 'name',
        width: 120,
      },
      {
        name: 'description',
        width: 350,
      },
    ];
  }

  @Bind()
  getWindow() {
    if (window.parent === window) {
      return window;
    } else {
      return window.parent;
    }
  }

  // 跳转到详情
  @Bind()
  linkToDetail(record) {
    const windowTarget = this.getWindow();
    const tabKey = `/hwfp/task/detail/:id/:processInstanceId-${record.get('processDefinitionKey')}`;
    if (windowTarget) {
      windowTarget.dvaApp._store
        .dispatch({
          type: 'global/removeTab',
          payload: tabKey,
        })
        .then(() => {
          menuTabEventManager.emit('close', { tabKey });
          windowTarget.openTab({
            title: record.get('assigneeName')
              ? `${record.get('processName')}-${record.get('assigneeName')}`
              : `${record.get('processName')}`,
            // key: `/hwfp/task/detail/${record.get('id')}/${record.get('encryptProcInstId')}`,
            key: tabKey,
            path: `/hwfp/task/detail/${record.get('id')}/${record.get('encryptProcInstId')}`,
            icon: 'edit',
            closable: true,
            state: {
              approveFormParams: {
                businessKey: record.get('businessKey'),
                formDefinitionCode: record.get('formDefinitionCode'),
                formKey: record.get('formKey'),
                moduleForm: record.get('moduleForm'),
                originFormKey: record.get('originFormKey'),
                processDefinitionId: record.get('processDefinitionId'),
                processDefinitionKey: record.get('processDefinitionKey'),
              },
            },
          });
        });
    }
  }

  render() {
    const { selectionMode } = this.state;
    const { tableDs, filterFlag } = this.props;
    return (
      <div className={`${styles['list-table']} ${filterFlag ? styles['list-table-filter'] : ''}`}>
        <Table
          ref={(ref) => {
            this.tableRef = ref;
          }}
          autoHeight={{
            type: 'minHeight',
            diff: 50,
          }}
          selectionMode={selectionMode}
          dataSet={tableDs}
          columns={this.getColumns()}
          pagination={false}
          showCachedTips={false}
          showSelectionTips={false}
        />
      </div>
    );
  }
}
