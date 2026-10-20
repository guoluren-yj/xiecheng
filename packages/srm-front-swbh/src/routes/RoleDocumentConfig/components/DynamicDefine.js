/*
 * @Description: file content :动态定义
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-2317:09:36
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import intl from 'srm-front-boot/lib/utils/intl';
import { PublishStatus } from '../../components/utils/common';
import { statusRender } from '../../components/utils/render';

/**
 * 动态定义
 * @param {*} props
 * @returns
 */
const DynamicDefine = function DynamicDefine(props) {
  const { dynamicDefineDs, handleEdit, handleDynamicConfig, isTenant } = props;

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
        name: 'actionCode',
        align: ColumnAlign.left,
      },
      {
        name: 'actionTitle',
        align: ColumnAlign.left,
      },
      // {
      //   name: 'categoryName',
      //   align: ColumnAlign.left,
      // },
      {
        name: 'triggerMethodMeaning',
        align: ColumnAlign.left,
      },
      !isTenant && {
        name: 'priorityMeaning',
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
        renderer: ({ record }) => {
          const operators = [
            {
              key: 'edit',
              ele: (
                <a
                  onClick={() =>
                    handleEdit({ record }, intl.get('swbh.common.view.message.title.editFocusDefine').d('编辑关注定义'))
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
                <a style={{ width: '50px' }} onClick={() => handleDynamicConfig({ record })}>
                  {intl.get('swbh.common.view.button.focusDefine').d('关注定义')}
                </a>
              ),
              len: 4,
              title: intl.get('swbh.common.view.button.focusDefine').d('关注定义'),
            },
          ];
          return operatorRender(operators, record, { limit: 2 });
        },
        lock: ColumnLock.right,
      },
    ],
    []
  );
  return <Table dataSet={dynamicDefineDs} columns={columns} />;
};

export default DynamicDefine;
