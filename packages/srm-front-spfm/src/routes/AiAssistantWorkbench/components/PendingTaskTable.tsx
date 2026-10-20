import React, { useMemo } from 'react';
import { observer } from 'mobx-react';
import { Table } from 'choerodon-ui/pro';
import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import intl from 'utils/intl';
import { useStore } from '../stores';
// import PriorityTag, { PriorityType } from './PriorityTag';

interface PendingTaskTableProps {}

const PendingTaskTable: React.FC<PendingTaskTableProps> = observer(() => {
  const { pendingTaskDs, handleToDetail } = useStore();

  const columns = useMemo<ColumnProps[]>(
    () => [
      {
        name: 'title',
        width: 280,
        renderer: ({ record }) => {
          const title = record?.get('title') || '';
          const chatCode = record?.get('chatCode') || '';
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{title}</span>
              {chatCode && (
                <span
                  style={{
                    display: 'inline-block',
                    height: 16,
                    lineHeight: '16px',
                    padding: '0 6px',
                    borderRadius: 999,
                    backgroundColor: '#F2F3F5',
                    color: '#4E5769',
                    fontSize: 10,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {chatCode}
                </span>
              )}
            </div>
          );
        },
      },
      {
        name: 'sourceAgentName',
        width: 100,
      },
      {
        name: 'taskTypeMeaning',
        width: 100,
      },
      // {
      //   name: 'priority',
      //   width: 70,
      //   renderer: ({ record }) => {
      //     const priority = record?.get('priority');
      //     return <PriorityTag priority={priority as PriorityType} />;
      //   },
      // },
      {
        name: 'creationDate',
        width: 160,
      },
      {
        header: intl.get('spfm.aiAssistant.model.action').d('操作'),
        width: 110,
        renderer: ({ record }) => (
          <a onClick={() => handleToDetail(record)}>
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
    ],
    [handleToDetail]
  );

  return (
    <div className="ai-workbench-pending-task">
      <div className="ai-workbench-section-header">
        <h3 className="ai-workbench-section-title">
          {intl.get('spfm.aiAssistant.view.title.pendingTasks').d('待处理任务')}
        </h3>
        <span className="ai-workbench-section-count">({pendingTaskDs.totalCount || 0})</span>
      </div>
      <Table dataSet={pendingTaskDs} columns={columns} />
    </div>
  );
});

export default PendingTaskTable;
