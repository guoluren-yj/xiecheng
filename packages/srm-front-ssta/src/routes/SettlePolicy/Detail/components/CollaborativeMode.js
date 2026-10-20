/*
 * @Description: 结算策略详情-协同模式
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext, memo, useEffect } from 'react';
import { CheckBox, Table } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import CardTitle from './CardTitle';
import { Store } from '../StoreProvider';
import ConditionModal from './ConditionModal';

/**
 * @description: 协同模式
 * @param {Object} props name-级联名
 * @return {ReactNode}
 */
export default memo(({ tableDs, name }) => {
  const { editFlag, collectRef, settleConfigId, activeKey } = useContext(Store);

  useEffect(() => {
    tableDs.addEventListener('update', handleUpdateCollaborative);
    return () => {
      tableDs.removeEventListener('update', handleUpdateCollaborative);
    };
  }, [tableDs]);

  // 更新销售方可见
  const handleUpdateCollaborative = ({ record }) => {
    const { typeCode, collaborativeModeCode } = record.get(['typeCode', 'collaborativeModeCode']);
    if (collaborativeModeCode === 'DOUBLE') {
      record.set('supplierViewFlag', 1);
    }
    if (!(typeCode === 'CONFIRM' && collaborativeModeCode === 'DOUBLE')) {
      record.set('founderCampCode', 'UNLIMIT');
    }
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'typeCode',
        width: 100,
        editor: (record) => editFlag && !['CANCEL', 'CONFIRM'].includes(record.get('typeCode')),
      },
      { name: 'collaborativeModeCode', width: 100, editor: editFlag },
      {
        name: 'supplierViewFlag',
        width: 150,
        editor: (record) =>
          editFlag && record.get('typeCode') !== 'CANCEL' ? <CheckBox /> : false,
        help: intl
          .get(`ssta.settleStrategy.view.settleStrategy.visible.seller`)
          .d('「销售方可见=是」时，采购方内部确认完成后的流程状态供应商可见；反之不可见'),
        renderer: ({ value, record }) =>
          record.get('typeCode') !== 'CANCEL' ? yesOrNoRender(Number(value)) : null,
      },
      { name: 'founderCampCode', width: 150, editor: editFlag },
      settleConfigId && {
        name: 'operation',
        title: intl.get('hzero.common.button.operator').d('操作'),
        width: 120,
        help: intl
          .get(`ssta.settleStrategy.view.settleStrategy.collaborativeCondition`)
          .d(
            '协同模式列表中设置默认协同模式。当启用条件配置时，则按条件配置中设置的返回规则执行协同模式，若条件未匹配到，则按协同模式列表中的设置执行默认协同模式'
          ),
        renderer: ({ record }) => (
          <ConditionModal
            record={record}
            tableDs={tableDs}
            idField={activeKey === 'bill' ? 'billModeId' : 'collaborativeModeId'}
            configType="collaborativeMode"
          />
        ),
      },
    ];
  }, [editFlag, settleConfigId]);

  return (
    <Card
      className={DETAIL_CARD_CLASSNAME}
      bordered={false}
      title={
        <CardTitle
          title={intl.get('ssta.settleStrategy.view.title.collaborativeMode').d('协同模式')}
          help={intl
            .get(`ssta.settleStrategy.view.message.validationType`)
            .d(
              '仅决定单据是否流转到供应商功能，采购双方操作需结合「审批方式」配置使用，如双边协同+无需审批，则由一方发起，另一方查看；双边协同+功能审批，则由一方发起，另一方审批。'
            )}
          effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
          effectiveTip={intl
            .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
            .d('点击单据提交按钮时生效')}
        />
      }
      ref={(dom) => collectRef(dom, name)}
    >
      <Table
        columns={columns}
        dataSet={tableDs}
        customizedCode="SSTA_STRATEGY_DETAIL.COLLABORATIVE_MODE"
      />
    </Card>
  );
});
