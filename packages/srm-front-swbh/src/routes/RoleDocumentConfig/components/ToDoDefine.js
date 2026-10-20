/*
 * @Description: file content :待办定义
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-23 17:09:36
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { PublishStatus } from '../../components/utils/common';
import { statusRender } from '../../components/utils/render';

/**
 * 待办定义
 * @param {*} props
 * @returns
 */
const ToDoDefinition = function ToDoDefinition(props) {
  const { isTenant, toDoDefinitionDs, handleEdit, handleToDoConfig } = props;

  const columns = useMemo(
    () => [
      !isTenant && {
        name: 'tenantName',
        align: ColumnAlign.left,
      },
      {
        name: 'combineName',
        align: ColumnAlign.left,
      },
      {
        name: 'todoCode',
        align: ColumnAlign.left,
      },
      {
        name: 'todoTitle',
        align: ColumnAlign.left,
      },
      {
        name: 'type',
        align: ColumnAlign.left,
      },
      {
        name: 'buttonName',
        align: ColumnAlign.left,
      },
      {
        name: 'detailPageLink',
        align: ColumnAlign.left,
      },
      {
        name: 'parameters',
        align: ColumnAlign.left,
      },
      {
        name: 'enabledFlag',
        align: ColumnAlign.center,
        renderer: ({ value }) => {
          const statusList = [
            {
              text: intl.get('hzero.common.button.enabled').d('启用'),
              value: PublishStatus.ENABLE,
              status: 'success',
            },
            {
              text: intl.get('hzero.common.button.disable').d('禁用'),
              value: PublishStatus.DISABLE,
              status: 'warning',
            },
          ];
          return statusRender(value, statusList);
        },
      },
      {
        name: 'operation',
        align: ColumnAlign.left,
        renderer: ({ record, dataSet }) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a
                  onClick={() =>
                    handleEdit(
                      { status: 'edit', record, dataSet },
                      intl.get('swbh.common.view.message.title.editToDo').d('编辑待办')
                    )
                  }
                >
                  {intl.get('hzero.common.view.button.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.view.button.edit').d('编辑'),
            },
            {
              key: 'dynamic',
              ele: (
                <a style={{ width: '50px' }} onClick={() => handleToDoConfig({ record })}>
                  {intl.get('swbh.common.view.button.toDoDefine').d('待办定义')}
                </a>
              ),
              len: 4,
              // title: intl.get('swbh.common.view.button.toDoDefine').d('待办定义'),
              title: isTenant
                ? intl
                    .get('swbh.common.view.button.toDoDefine.tenantInfo')
                    .d(
                      '待办事件生效后，条件规则不可修改，如需修改，请新增待办事件。如需禁用本待办事件，请确认本待办事项已经全部处理完成，否则相关待办任务可能会一并清除。'
                    )
                : intl.get('swbh.common.view.button.toDoDefine.info').d('请谨慎修改待办生成条件。'),
            },
          ];
          return operatorRender(operators, record, { limit: 2 });
        },
        lock: ColumnLock.right,
      },
    ],
    []
  );
  return <Table dataSet={toDoDefinitionDs} columns={columns} />;
};

export default ToDoDefinition;
