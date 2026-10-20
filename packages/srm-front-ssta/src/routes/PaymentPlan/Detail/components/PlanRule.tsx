/*
 * @Description: 付款条款管控规则
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-10-27 15:42:01
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useContext } from 'react';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

// import DateRule from './DateRule';
import AmountRule from './AmountRule';
import MessageRule from './MessageRule';
import PayDateValidRule from './PayDateValidRule';
import type { StoreValueType } from '../stores';
import { Store } from '../stores';

const PlanRule = () => {

  const { remote } = useContext<StoreValueType>(Store);

  const cardList = useMemo(() => {
    const normalCards = [
      {
        key: 'messageRule',
        title: intl.get('ssta.paymentPlan.view.title.stageMsgRemindRule').d('阶段消息提醒规则'),
        content: <MessageRule />,
      },
      {
        key: 'amountRule',
        title: intl.get('ssta.paymentPlan.view.title.stageAmountExcVerRule').d('阶段金额超额校验规则'),
        content: <AmountRule />,
      },
      {
        key: 'payDateValidRule',
        title: intl.get('ssta.paymentPlan.view.title.stagePayAmountVerRule').d('阶段付款日期校验规则'),
        content: <PayDateValidRule />,
      },
    ];
    const otherProps = {};
    const processBtns = remote
      ? remote.process('SSTA.PAYMENT_PLAN_DETAIL_CUX.RULE_CARDS', normalCards, otherProps)
      : normalCards;
    return processBtns.filter(Boolean);
  }, [remote]);

  return (
    <div>
      {cardList.map((item) => {
        const { content, ...cardProps } = item;
        return (
          <Card
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
            {...cardProps}
          >
            {content}
          </Card>
        );
      })}
    </div>
  );
};

export default PlanRule;
