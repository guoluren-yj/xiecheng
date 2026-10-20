/*
 * @Description: file content :动态类型
 * @Author: jiwei.liu01@hand-china.com
 * @Date: 2022-05-23 17:09:36
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'srm-front-boot/lib/utils/intl';
import { operatorRender, TagRender } from 'hzero-front/lib/utils/renderer';
import { ColumnLock, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';
import { PublishStatus } from '../../components/utils/common';
import { statusRender } from '../../components/utils/render';

/**
 * 动态类型
 * @param {*} props
 * @returns
 */
const DynamicType = function DynamicType(props) {
  const { dynamicTypeDs, handleEdit, isTenant } = props;

  const columns = useMemo(
    () => [
      !isTenant && {
        name: 'tenantName',
        align: ColumnAlign.left,
      },
      {
        name: 'categoryCode',
        align: ColumnAlign.left,
      },
      {
        name: 'categoryName',
        align: ColumnAlign.left,
      },
      {
        name: 'color',
        align: ColumnAlign.center,
        renderer: ({ value }) => {
          const statusList = [
            {
              status: PublishStatus.NORMAL,
              color: 'grey',
              text: intl.get('swbh.common.status.normalFollow').d('普通关注'),
            },
            {
              status: PublishStatus.REMIND,
              color: '#FC8800',
              text: intl.get('swbh.common.status.remindFollow').d('提醒关注'),
            },
            {
              status: PublishStatus.WARN,
              color: '#f56349',
              text: intl.get('swbh.common.status.warnFollow').d('重要关注'),
            },
          ];
          return TagRender(value, statusList);
        },
      },
      {
        name: 'orderSeq',
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
                    handleEdit({ record }, intl.get('swbh.common.view.message.title.editType').d('编辑关注类型'))
                  }
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.view.button.edit').d('编辑'),
            },
          ];
          return operatorRender(operators, record, { limit: 1 });
        },
        lock: ColumnLock.right,
      },
    ],
    [handleEdit, statusRender]
  );
  return <Table dataSet={dynamicTypeDs} columns={columns} />;
};

export default DynamicType;
