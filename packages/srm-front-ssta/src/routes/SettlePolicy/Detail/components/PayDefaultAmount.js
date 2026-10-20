/*
 * @Description: 结算策略详情-付款/预付款核销默认金额
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

/**
 * @description: 付款/预付款核销默认金额
 * @param {Object} props
 * @return {ReactNode}
 */
export default memo(({ tableDs, invDisabled }) => {
  const { editFlag, collectRef } = useContext(Store);

  const columns = useMemo(() => {
    return [
      { name: 'initType' },
      {
        name: 'defaultMode',
        editor: editFlag && !invDisabled,
        help: intl
          .get(`ssta.settleStrategy.view.message.defaultMode`)
          .d('独立计算，付款金额/预付款金额'),
      },
    ];
  }, [editFlag, invDisabled]);

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
      ref={(dom) => collectRef(dom, 'paymentAmountInits')}
    >
      <Table
        dataSet={tableDs}
        columns={columns}
        customizedCode="SSTA_STRATEGY_DETAIL.PAY_DEFAULT_AMOUNT"
      />
    </Card>
  );
});
