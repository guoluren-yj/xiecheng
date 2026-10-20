import React, { useContext, useCallback } from 'react';
import { DataSet, Modal, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SearchBarTable from '_components/SearchBarTable';
import { Content } from 'components/Page';
import { isEmpty } from 'lodash';
import { Button } from 'components/Permission';
import { getResponse } from 'hzero-front/lib/utils/utils';
import {
  saveCurrentTask,
  deleteCurrentTask,
  savepurList,
  checkoutCurrentTask,
} from '@/services/projectSpaceService.js';
import notification from 'utils/notification';
import { Store } from '../commonDetail/sotreProvider';
import { TaskChildDs, PurListDs } from '../commonDetail/store';
import PurList from './PurList';
import './index.less';

import TaskChildForm from '../commonDetail/AllModal/editTaskInfo';

const TaskTable = function TaskTable() {
  const store = useContext(Store);

  const {
    taskDs,
    purListDs,
    headerDs,
    customizeTable,
    customizeForm,
    organizationId,
    projectId,
  } = store;

  const handleEditChild = ({ taskId, type = 'create', record }) => {
    const parentTaskId = record.get('parentTaskId');
    const taskChildDs = new DataSet(
      TaskChildDs({
        taskId: type === 'create' ? null : taskId,
        hasChildFlag: !isEmpty(record.children) && type !== 'create',
      })
    );
    taskChildDs.setState('amountRules', taskDs.getState('amountRules'));
    if (type === 'create') {
      taskChildDs.create({ parentTaskId: taskId, tenantId: organizationId, projectId });
    }
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: '380px' },
      bodyStyle: { paddingTop: '20px' },
      title:
        type === 'create'
          ? intl.get('hzero.common.button.addChildren').d('新增下级')
          : parentTaskId
          ? intl.get('sprm.project.title.editChildren').d('编辑下级')
          : intl.get('sprm.project.title.editTask').d('编辑任务'),
      children: <TaskChildForm dataSet={taskChildDs} customizeForm={customizeForm} />,
      closable: true,
      movable: false,
      okText:
        type === 'create'
          ? intl.get(`hzero.common.button.confrim`).d('确定')
          : intl.get('hzero.common.button.save').d('保存'),
      destroyOnClose: true,
      // todo
      onOk: async () => {
        const validateFlag = await taskChildDs.validate();
        if (validateFlag) {
          const data = taskChildDs.current.toJSONData();
          const res = getResponse(
            await saveCurrentTask({ ...data, customizeUnitCode: 'SIEC.PROJECT_EDIT.COST_FORM' })
          );
          if (res && !res?.failed) {
            notification.success();
            // taskDs.query();
            headerDs.query(undefined, undefined, true); // 缓存
          } else {
            return false;
          }
        } else {
          return false;
        }
      },
    });
  };

  const handleDelete = async ({ record }) => {
    return new Promise(async (resolve) => {
      if (!record?.get('taskId')) {
        taskDs.remove(record);
      } else {
        const deleteFlagRes = getResponse(await checkoutCurrentTask({ ...record.toJSONData() }));
        if (deleteFlagRes.hasChildFlag || deleteFlagRes.hasPurchaseItemFlag) {
          Modal.confirm({
            bodyStyle: { padding: '20px' },
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <p>
                {deleteFlagRes.hasChildFlag
                  ? intl
                      .get('sprm.project.confirm.deleteTaskPur')
                      .d('该任务层级下存在子任务，其下所有子任务均会被删除。请确认是否删除？')
                  : intl
                      .get('sprm.project.confirm.deleteTaskchildren')
                      .d('该任务层级下存在采购件，其下所有采购件均会被删除。请确认是否删除？')}
              </p>
            ),
            onOk: async () => {
              const res = getResponse(await deleteCurrentTask({ ...record.toJSONData() }));
              if (res && !res?.failed) {
                notification.success();
                const { updated, created } = purListDs;
                const recordList = updated
                  .concat(created)
                  .filter((e) => e?.get('taskId') === record.get('taskId'));
                purListDs.remove(recordList, true);
                // purListDs.query({}, {}, true);
                // taskDs.query();
                headerDs.query({}, {}, true);
                resolve();
              } else {
                resolve();
              }
            },
          });
        } else {
          const res = getResponse(await deleteCurrentTask({ ...record.toJSONData() }));
          if (res) {
            notification.success();
            const { created } = purListDs;
            purListDs.remove(
              created.filter((e) => e.get('taskId') === record?.get('taskId')),
              true
            );
            // taskDs.query();
            headerDs.query({}, {}, true);
            // purListDs.query({}, {}, true);
            resolve();
          }
        }
      }
    });
  };

  const handleAssignPurList = useCallback(
    (record) => {
      const updatedData = purListDs.toJSONData().filter((e) => e?.taskId === record?.get('taskId'));
      const filterParams = headerDs?.getState('deletePurList') || [];
      const purModalDs = new DataSet(
        PurListDs({
          customizeUnitCode: 'SIEC.PROJECT_EDIT.PUR_LIST',
          taskId: record?.get('taskId'),
          projectId: record?.get('projectId'),
          updatedData,
          filterParams,
        })
      );
      const taskInfo = record.toJSONData();
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
            customizeTable={customizeTable}
            type="modal"
            taskId={record?.get('taskId')}
          />
        ),
        okText: intl.get('hzero.common.button.save').d('保存'),
        closable: true,
        movable: false,
        destroyOnClose: true,
        onOk: async () => {
          const validateFlag = await purModalDs.validate();
          if (validateFlag) {
            const data = purModalDs.toJSONData();
            const res = getResponse(
              await savepurList({
                taskPurchaseItemList: data || [],
                deleteTaskPurchaseItemList:
                  headerDs
                    .getState('deletePurList')
                    ?.filter((e) => e.taskId === record?.get('taskId')) || [],
                customizeUnitCode: 'SIEC.PROJECT_EDIT.PUR_LIST',
                ...taskInfo,
              })
            );
            if (res && !res?.failed) {
              notification.success();
              // taskDs.query();
              headerDs.setState(
                'deletePurList',
                headerDs
                  .getState('deletePurList')
                  ?.filter((e) => e.taskId !== record?.get('taskId'))
              );
              headerDs.query({}, {}, 1);
              // purListDs.query({}, {}, true);
            } else {
              return false;
            }
          } else {
            return false;
          }
        },
      });
    },
    [headerDs, projectId]
  );

  const cols = [
    { name: 'level', width: 200, tooltip: 'overflow' },
    { name: 'taskNum' },
    { name: 'taskName' },
    { name: 'principalUserId' },
    { name: 'budgetAmount' },
    { name: 'taskExplanation' },
    {
      name: 'assignPurItem',
      renderer: ({ record }) => (
        <Button type="text" onClick={() => handleAssignPurList(record)}>
          {intl.get('sprm.project.button.assignPurItem').d('分配采购件')}
        </Button>
      ),
    },
    {
      name: 'action',
      width: 140,
      renderer: ({ record }) => (
        <div>
          <Button
            type="text"
            onClick={() => handleEditChild({ taskId: record.get('taskId'), record })}
            style={{ marginRight: '10px' }}
          >
            {intl.get('hzero.common.button.addChildren').d('新增下级')}
          </Button>
          <Tooltip
            title={
              record?.get('level') === '0'
                ? intl
                    .get('sprm.project.view.toolTip.rootTaskOnlyAttrFieldsEditable')
                    .d('根节点的任务信息仅允许编辑个性化字段，其他信息需通过基础信息页签更改')
                : undefined
            }
          >
            <Button
              type="text"
              onClick={() =>
                handleEditChild({ taskId: record.get('taskId'), record, type: 'edit' })
              }
              style={{ marginRight: '10px' }}
            >
              {intl.get('hzero.common.button.edit').d('编辑')}
            </Button>
          </Tooltip>
          {record?.get('parentTaskId') && (
            <Button
              type="text"
              onClick={() => handleDelete({ record })}
              style={{ marginRight: '10px' }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          )}
        </div>
      ),
    },
  ];
  return (
    <Content className="content-padding">
      <h3 className="content-title">
        {intl.get('sprm.project.title.maintainTask').d('任务成本维护')}
      </h3>
      {customizeTable(
        {
          code: 'SIEC.PROJECT_EDIT.COST_LIST',
        },
        <SearchBarTable
          dataSet={taskDs}
          columns={cols}
          searchCode="SIEC.PROJECT_EDIT.TASK_FILTER"
          mode="tree"
          defaultRowExpanded
          className="tree-table-project"
          style={{ maxHeight: `calc(100vh - 300px)` }}
        />
      )}
    </Content>
  );
};

export default TaskTable;
