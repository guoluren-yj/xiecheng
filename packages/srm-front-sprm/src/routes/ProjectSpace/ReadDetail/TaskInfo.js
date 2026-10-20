import React, { useContext, useCallback } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Button } from 'components/Permission';
import SearchBarTable from '_components/SearchBarTable';
import { Store } from '../commonDetail/sotreProvider';
import { PurListDs } from '../commonDetail/store';
import { colorTagRender } from '../commonDetail/util.js';
import PurList from './PurList';
import './index.less';

const TaskTable = function TaskTable({ taskCode, searchCode, purListKey = {} }) {
  const store = useContext(Store);
  const { taskDs, projectReqHeaderId, purListDs, customizeTable, source } = store;

  const handleAssignPurList = useCallback(
    (record) => {
      const updatedData = purListDs.toJSONData().filter((e) => e?.taskId === record?.get('taskId'));
      const codeObj = {
        changeRead: 'SIEC.PROJECT_CHANGE.PUR_FILTER,SIEC.PROJECT_CHANGE.PUR_LIST',
        actionDetail: 'SIEC.PROJECT_OTHER_TYPE.PURLIST_FILTER,SIEC.PROJECT_OTHER_TYPE.PUR_LIST',
        detailQuery: 'SIEC.PROJECT_OTHER_TYPE.PURLIST_FILTER,SIEC.PROJECT_OTHER_TYPE.PUR_LIST',
        others: 'SIEC.PROJECT_READ.PUR_LIST,SIEC.PROJECT_READ.PURLIST_FILTER',
      };
      const purModalDs = new DataSet(
        PurListDs({
          taskId: record?.get('taskId'),
          taskReqId: record?.get('taskReqId'),
          customizeUnitCode: codeObj[source] || codeObj.others,
          projectId: record?.get('projectId'),
          projectReqHeaderId,
          updatedData,
          source,
        })
      );
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: '1090px' },
        bodyStyle: { paddingTop: '20px' },
        title: intl.get('sprm.project.button.assignPurItem').d('分配采购件'),
        children: (
          <PurList
            store={store}
            purModalDs={purModalDs}
            type="modal"
            custTable={customizeTable}
            {...purListKey}
          />
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        onOk: () => {},
        okText: intl.get('hzero.common.status.closed').d('关闭'),
        footer: (okBtn) => okBtn,
      });
    },
    [projectReqHeaderId, purListDs]
  );

  const cols = [
    { name: 'level' },
    { name: 'cancelStatus', renderer: colorTagRender, width: 160 },
    { name: 'taskNum', width: 180 },
    { name: 'taskName', width: 180 },
    { name: 'principalUserId' },
    { name: 'budgetAmount' },
    { name: 'taskExplanation' },
    {
      name: 'assignPurItem',
      renderer: ({ record }) => (
        <Button type="text" onClick={() => handleAssignPurList(record)}>
          {intl.get('sprm.project.button.reviewPurItem').d('查看采购件')}
        </Button>
      ),
    },
  ];

  return (
    <div className="content-padding">
      <h3 className="content-title">
        {intl.get('sprm.project.title.maintainTask').d('任务成本维护')}
      </h3>
      {customizeTable(
        {
          code: taskCode || 'SIEC.PROJECT_READ.COST_LIST',
        },
        <SearchBarTable
          cacheState
          style={{ maxHeight: `calc(100vh - 300px)` }}
          searchCode={searchCode || 'SIEC.PROJECT_READ.TASK_FILTER'}
          dataSet={taskDs}
          className="tree-table-project"
          defaultRowExpanded
          mode="tree"
          searchBarConfig={{
            autoQuery: false,
            closeFilterSelector: true,
          }}
          columns={cols}
        />
      )}
    </div>
  );
};

export default TaskTable;
