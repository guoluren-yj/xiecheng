import React, { useContext, useCallback } from 'react';
import { DataSet, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import intl from 'utils/intl';

import { Content } from 'components/Page';
import { getResponse } from 'hzero-front/lib/utils/utils';
import {
  saveChangedTask,
  deleteCurrentTaskPur,
  savepurChangeList,
  cancelCurrentTask,
  checkoutChangeTask,
} from '@/services/projectSpaceService.js';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import { colorTagRender } from '../commonDetail/util.js';
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
    projectReqHeaderId,
    source,
    getLineErrorMsg,
  } = store;
  const currentHeader = headerDs.current;

  const handleEditChild = ({ taskReqId, type = 'create', record }) => {
    const customizeUnitCode = 'SIEC.PROJECT_CHANGE.COST_FORM';
    const parentTaskId = record.get('parentTaskId');
    const childFilterList =
      record.children?.filter((e) => ['UNCANCELED'].includes(e.get('cancelStatus'))) || [];
    const taskChildDs = new DataSet(
      TaskChildDs({
        customizeUnitCode,
        taskReqId: type === 'create' ? null : taskReqId,
        hasChildFlag: !isEmpty(childFilterList) && type !== 'create',
      })
    );
    taskChildDs.setState('amountRules', taskDs.getState('amountRules'));
    if (type === 'create') {
      taskChildDs.create({
        parentTaskReqId: taskReqId,
        tenantId: organizationId,
        projectReqHeaderId,
        projectId: currentHeader.get('projectId'),
      });
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
      children: (
        <TaskChildForm
          dataSet={taskChildDs}
          customizeForm={customizeForm}
          code={customizeUnitCode}
        />
      ),
      closable: true,
      movable: false,
      destroyOnClose: true,
      okText:
        type === 'create'
          ? intl.get(`hzero.common.button.confrim`).d('确定')
          : intl.get('hzero.common.button.save').d('保存'),
      onOk: async () => {
        const validateFlag = await taskChildDs.validate();
        if (validateFlag) {
          const data = taskChildDs.current.toJSONData();
          const res = getResponse(await saveChangedTask({ ...data, customizeUnitCode }));
          if (res && !res?.failed) {
            notification.success();
            // taskDs.query();
            headerDs.query({}, {}, true);
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
      if (!record?.get('taskReqId')) {
        taskDs.remove(record);
      } else {
        const deleteFlagRes = getResponse(await checkoutChangeTask({ ...record.toJSONData() }));
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
              const res = getResponse(await deleteCurrentTaskPur({ ...record.toJSONData() }));
              if (res && !res?.failed) {
                notification.success();
                const { updated, created } = purListDs;
                const recordList = updated
                  .concat(created)
                  .filter((e) => e?.get('taskReqId') === record.get('taskReqId'));
                purListDs.remove(recordList, true);
                headerDs.query({}, {}, true);
                resolve();
              } else {
                resolve();
              }
            },
          });
        } else {
          const res = getResponse(await deleteCurrentTaskPur({ ...record.toJSONData() }));
          if (res && !res?.failed) {
            notification.success();
            headerDs.query({}, {}, true);
            resolve();
          }
        }
      }
    });
  };

  const handleCancel = async ({ record, actionType }) => {
    return new Promise(async (resolve) => {
      const deleteFlagRes = getResponse(
        await checkoutChangeTask({ ...record.toJSONData(), actionType })
      );
      if (deleteFlagRes.hasChildFlag) {
        Modal.confirm({
          bodyStyle: { padding: '20px' },
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <p>
              {actionType === 'cancel'
                ? intl
                    .get('sprm.project.confirm.change.deleteTaskPur')
                    .d(
                      '该任务层级下存在子任务，其下所有子任务均会被取消，此次变更新增的子任务会被删除。请确认是否取消？ '
                    )
                : intl
                    .get('sprm.project.confirm.cancelRevokeTaskPur')
                    .d('该任务层级下存在子任务，其下所有子任务均会被撤销取消。请确认是否撤销？')}
            </p>
          ),
          onOk: async () => {
            const res = getResponse(
              await cancelCurrentTask({ ...record.toJSONData(), actionType })
            );
            if (res && !res?.failed) {
              const { associationDeleteTaskReqIds = [] } = res;
              notification.success();
              headerDs.query({}, {}, true);
              const { updated, created } = purListDs;
              const recordList = updated
                .concat(created)
                .filter((e) =>
                  associationDeleteTaskReqIds
                    .concat([record.get('taskReqId')])
                    .includes(e.get('taskReqId'))
                );
              purListDs.remove(recordList, true);
              purListDs.query({}, {}, true);
              resolve();
            } else {
              resolve();
            }
          },
        });
      } else {
        const res = getResponse(await cancelCurrentTask({ ...record.toJSONData(), actionType }));
        if (res && !res?.failed) {
          notification.success();
          headerDs.query({}, {}, true);
          resolve();
        }
      }
    });
  };

  const handleAssignPurList = useCallback(
    (record) => {
      const updatedData = purListDs
        .toJSONData()
        .filter((e) => e?.taskReqId === record?.get('taskReqId'));
      const filterParams = headerDs?.getState('deletePurList') || [];
      const purModalDs = new DataSet(
        PurListDs({
          customizeUnitCode: 'SIEC.PROJECT_CHANGE.PUR_LIST',
          taskReqId: record?.get('taskReqId'),
          projectReqHeaderId,
          updatedData,
          filterParams,
          source,
        })
      );
      const taskInfo = record.toJSONData();
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: '1090px' },
        bodyStyle: { paddingTop: '20px' },
        title: intl.get('sprm.project.button.assignPurItem').d('分配采购件'),
        okText: intl.get('hzero.common.button.save').d('保存'),
        children: (
          <PurList
            store={store}
            purModalDs={purModalDs}
            custTable={customizeTable}
            type="modal"
            readOnly={['CANCELING', 'CANCELED'].includes(record.get('cancelStatus'))}
            taskReqId={record?.get('taskReqId')}
          />
        ),
        closable: true,
        movable: false,
        destroyOnClose: true,
        onOk: async () => {
          const validateFlag = await purModalDs.validate();
          if (validateFlag) {
            const data = purModalDs.toJSONData();
            const res = getResponse(
              await savepurChangeList({
                taskPurchaseItemList: data || [],
                deleteTaskPurchaseItemList:
                  headerDs
                    .getState('deletePurList')
                    ?.filter((e) => e.taskReqId === record?.get('taskReqId')) || [],
                customizeUnitCode: 'SIEC.PROJECT_CHANGE.PUR_LIST',
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
                  ?.filter((e) => e.taskReqId !== record?.get('taskReqId'))
              );
              headerDs.query({}, {}, 1);
              // purListDs.query({}, {}, true);
            } else {
              return false;
            }
          } else {
            const errorList = purModalDs.getAllValidationErrors() || {};
            const errorMsg = getLineErrorMsg(errorList);
            notification.error({ message: errorMsg });
            return false;
          }
        },
      });
    },
    [purListDs, headerDs]
  );

  const cols = [
    { name: 'level' },
    { name: 'cancelStatus', renderer: colorTagRender, width: 160 },
    { name: 'taskNum', width: 180 },
    { name: 'taskName', width: 180 },
    { name: 'principalUserId', width: 180 },
    { name: 'budgetAmount' },
    { name: 'taskExplanation' },
    {
      name: 'assignPurItem',
      renderer: ({ record }) => (
        <Button funcType="link" onClick={() => handleAssignPurList(record)}>
          {['CANCELING', 'CANCELED'].includes(record.get('cancelStatus'))
            ? intl.get('sprm.project.button.reviewPurItem').d('查看采购件')
            : intl.get('sprm.project.button.assignPurItem').d('分配采购件')}
        </Button>
      ),
    },
    {
      name: 'action',
      width: 140,
      renderer: ({ record }) =>
        record?.get('cancelStatus') !== 'CANCELED' ? (
          <div>
            {currentHeader?.get('sourcePlatform') !== 'ERP' && (
              <Button
                type="text"
                funcType="link"
                onClick={() => handleEditChild({ taskReqId: record.get('taskReqId'), record })}
                style={{ marginLeft: 0, marginRight: 16 }}
                hidden={record?.get('cancelStatus') !== 'UNCANCELED'}
              >
                {intl.get('hzero.common.button.addChildren').d('新增下级')}
              </Button>
            )}
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
                funcType="link"
                onClick={() =>
                  handleEditChild({ taskReqId: record.get('taskReqId'), type: 'edit', record })
                }
                hidden={record?.get('cancelStatus') !== 'UNCANCELED'}
                style={{ marginLeft: 0, marginRight: 16 }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </Button>
            </Tooltip>

            {record?.get('parentTaskReqId') && (
              <>
                <Button
                  type="text"
                  funcType="link"
                  onClick={() => handleDelete({ record })}
                  style={{ marginLeft: 0, marginRight: 16 }}
                  hidden={record?.get('taskId')}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </Button>

                <Button
                  type="text"
                  funcType="link"
                  onClick={() => handleCancel({ record, actionType: 'cancel' })}
                  style={{ marginLeft: 0, marginRight: 16 }}
                  hidden={record?.get('cancelStatus') !== 'UNCANCELED' || !record?.get('taskId')}
                >
                  {intl.get('hzero.common.button.cance').d('取消')}
                </Button>
                <Button
                  type="text"
                  funcType="link"
                  onClick={() => handleCancel({ record, actionType: 'revoke' })}
                  style={{ marginLeft: 0, marginRight: 16 }}
                  hidden={
                    record?.get('cancelStatus') !== 'CANCELING' ||
                    !record?.get('taskId') ||
                    record.parent?.get('cancelStatus') === 'CANCELING'
                  }
                >
                  {intl.get('hzero.common.button.revolve').d('撤销取消')}
                </Button>
              </>
            )}
          </div>
        ) : null,
    },
  ];
  return (
    <Content className="content-padding">
      <h3 className="content-title">
        {intl.get('sprm.project.title.maintainTask').d('任务成本维护')}
      </h3>
      {customizeTable(
        {
          code: 'SIEC.PROJECT_CHANGE.TASK',
        },
        <SearchBarTable
          dataSet={taskDs}
          searchCode="SIEC.PROJECT_CHANGE.TASK_FILTER"
          columns={cols}
          mode="tree"
          defaultRowExpanded
          style={{ maxHeight: `calc(100vh - 300px)` }}
          className="tree-table-project"
        />
      )}
    </Content>
  );
};

export default TaskTable;
