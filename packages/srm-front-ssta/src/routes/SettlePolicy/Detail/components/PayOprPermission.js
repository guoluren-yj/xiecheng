/*
 * @Description: 结算策略详情-付款操作权限
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext, memo } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from './CardTitle';
import { Store } from '../StoreProvider';
import { getSelectedNegActConfirmMsg } from '@/utils/utils';

/**
 * @description: 付款操作权限
 * @param {Object} prosp
 * @return {ReactNode}
 */
export default memo(({ tableDs, documentType }) => {
  const { editFlag, collectRef, settleConifgId } = useContext(Store);

  const columns = useMemo(
    () => [
      {
        name: 'permissionType',
        width: 130,
        editor: editFlag,
      },
      {
        name: 'operationType',
        width: 100,
        editor: editFlag,
        help: intl.get(`ssta.settleStrategy.view.message.tooltip.operationType`).d('操作类型提示'),
      },
    ],
    [editFlag]
  );

  /**
   * 自定义行内 新增 为-1时行后新增
   */
  const handleAdd = () => {
    const record = tableDs.create({ documentType }, 0);
    record.setState('editing', true);
  };

  const handleDelete = async () => {
    const res = await tableDs.delete(
      tableDs.selected,
      getSelectedNegActConfirmMsg('delete', tableDs)
    );
    if (res && res.success) {
      tableDs.query(undefined, undefined, true);
    }
  };

  const buttons = () => {
    if (editFlag && settleConifgId !== 'create') {
      return [
        ['add', { onClick: handleAdd }],
        [
          'delete',
          {
            icon: 'delete_sweep',
            onClick: handleDelete,
            children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          },
        ],
      ];
    } else {
      return [];
    }
  };
  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      title={
        <CardTitle
          title={tableDs.props.validationTitle}
          effectiveText={intl.get('ssta.settleStrategy.view.message.createEffective').d('创建生效')}
          effectiveTip={intl
            .get('ssta.settleStrategy.view.message.createEffectivePool')
            .d('选择事务创建单据、单据内新增行时生效')}
        />
      }
      ref={(dom) => collectRef(dom, 'paymentOptPermissions')}
    >
      <Table
        dataSet={tableDs}
        selectionMode={!editFlag ? 'none' : 'rowbox'}
        buttons={buttons()}
        columns={columns}
        customizedCode="SSTA_STRATEGY_DETAIL.PAY_OPR_PERMISSION"
        style={{ maxHeight: 430 }}
      />
    </Card>
  );
});
