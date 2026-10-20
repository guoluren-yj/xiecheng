import React, { Component } from 'react';
import { Tag } from 'choerodon-ui';
import FilterBarTable from 'srm-front-boot/lib/components/FilterBarTable';
import MultipleTextSplitInput from 'srm-front-boot/lib/components/MultipleTextSplitInput';
import intl from 'utils/intl';

import { processStatusRender } from '@/utils/util';
import styles from './index.less';

export default class processDelegate extends Component {
  render() {
    const { tableDs, processStatus } = this.props;
    const processStatusObj = {};
    processStatus.forEach((item) => {
      processStatusObj[item.value] = item.meaning;
    });
    const columns = [
      {
        name: 'processInstanceId',
        width: 100,
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
        name: 'processStatus',
        width: 160,
        renderer: ({ value }) => (
          <div className={styles['process-status-tag']}>
            {processStatusRender(processStatusObj, value)}
          </div>
        ),
      },
      {
        name: 'processDefinitionKey',
        width: 250,
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
        name: 'taskAssigneeList',
        renderer: ({ value }) => {
          if (!Array.isArray(value)) {
            return null;
          }
          return value.map((v, i) => (
            <span>
              <span>{v.assigneeName}</span>
              {v.employeeResign && (
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
              {i < value.length - 1 && ','}
            </span>
          ));
        },
      },
      {
        name: 'startTime',
        width: 160,
      },
    ];
    return (
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
    );
  }
}
