import React, { Component } from 'react';
import { Alert, Tag } from 'choerodon-ui';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import intl from 'utils/intl';

import { processStatusRender } from '@/utils/util';
import styles from './index.less';

export default class processDelegate extends Component {
  render() {
    const { processStatus, tableDs } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    const columns = [
      {
        name: 'suspended',
        width: 180,
        renderer: ({ value }) => (
          <div className={styles['process-status-tag']}>
            {processStatusRender(processStatusObj, value ? 'SUSPENDED' : '')}
          </div>
        ),
      },
      {
        name: 'processInstanceId',
        width: 100,
      },
      {
        name: 'processDefinitionKey',
        width: 200,
      },
      {
        name: 'processName',
        width: 250,
      },
      {
        name: 'processDefinitionVersion',
        width: 120,
        align: 'right',
      },
      {
        name: 'description',
        width: 250,
      },
      {
        name: 'name',
        width: 150,
      },
      {
        name: 'assigneeName',
        width: 200,
        renderer: ({ value, record }) => {
          return (
            <>
              <span>{value && value.replace(',', '，')}</span>
              {record.get('employeeResign') && (
                <Tag
                  color="#f50"
                  style={{
                    lineHeight: '18px',
                    height: '18px',
                    border: 'none',
                    padding: '0 4px',
                    cursor: 'default',
                    marginLeft: '4px',
                    marginRight: 0,
                  }}
                >
                  {intl.get('hpfm.organization.model.position.leave').d('离职')}
                </Tag>
              )}
            </>
          );
        },
      },
      {
        name: 'startUserName',
        width: 200,
        renderer: ({ value, record }) => (
          <>
            <span>{value}</span>
            {record.get('submitEmpResign') && (
              <Tag
                color="#f50"
                style={{
                  lineHeight: '18px',
                  height: '18px',
                  border: 'none',
                  padding: '0 4px',
                  cursor: 'default',
                  marginLeft: '4px',
                  marginRight: 0,
                }}
              >
                {intl.get('hpfm.organization.model.position.leave').d('离职')}
              </Tag>
            )}
          </>
        ),
      },
      {
        name: 'startTime',
        width: 160,
      },
    ];
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Alert
          closable
          type="info"
          showIcon
          className={styles['process-alert']}
          description={intl
            .get('hwfp.processDelegate.approver.alert')
            .d('"挂起中"状态流程，请先在【流程监控】功能下处理异常流程并恢复流程后转交')}
        />
        <FilterBarTable
          dataSet={tableDs}
          columns={columns}
          style={{ flex: 1 }}
          autoHeight={{ type: 'maxHeight', diff: -60 }}
          filterBarConfig={{
            expandable: true,
            left: {
              render: (ds) => (
                <MultipleTextSplitInput
                  dataSet={ds}
                  style={{ width: '280px' }}
                  name="processInstanceIds"
                  placeholder={intl
                    .get('hwfp.processDelegate.view.message.inputProInstId')
                    .d('请输入流程标识')}
                />
              ),
            },
          }}
        />
      </div>
    );
  }
}
