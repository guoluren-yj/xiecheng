/*
 * @Description: 结算策略详情-审批方式
 * @Date: 2022-01-20 14:44:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext } from 'react';
import { Table } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import intl from 'utils/intl';
import CardTitle from './CardTitle';
import { Store } from '../StoreProvider';
import ConditionModal from './ConditionModal';

/**
 * @description: 审批方式
 * @param {Object} props
 * @return {*}
 */
export default ({ name, tableDs }) => {
  const { editFlag, collectRef, settleConfigId } = useContext(Store);

  const columns = useMemo(() => {
    return [
      { name: 'typeCode', width: 150 },
      { name: 'approvedMethodCode', width: 200, editor: editFlag },
      settleConfigId && {
        name: 'operation',
        title: intl.get('hzero.common.button.operator').d('操作'),
        width: 200,
        help: intl
          .get(`ssta.settleStrategy.view.settleStrategy.approveCondition`)
          .d(
            '审批方式列表中设置默认审批方式。当启用条件配置时，则按条件配置中设置的返回规则执行审批方式，若条件未匹配到，则按审批方式列表中的设置执行默认审批方式'
          ),
        renderer: ({ record }) => (
          <ConditionModal
            record={record}
            tableDs={tableDs}
            idField="configId"
            configType="approvalMode"
          />
        ),
      },
    ];
  }, [editFlag]);

  return (
    <Card
      bordered={false}
      className={DETAIL_CARD_CLASSNAME}
      ref={(dom) => collectRef(dom, name)}
      title={
        <CardTitle
          title={intl.get('ssta.settleStrategy.view.title.approveMethod').d('审批方式')}
          effectiveText={intl.get(`ssta.settleStrategy.view.message.submitEffective`).d('提交生效')}
          effectiveTip={intl
            .get(`ssta.settleStrategy.view.message.submitEffectiveTip`)
            .d('点击单据提交按钮时生效')}
        />
      }
    >
      <Table
        columns={columns}
        dataSet={tableDs}
        customizedCode="SSTA_STRATEGY_DETAIL.APPROVE_METHOD"
      />
    </Card>
  );
};
