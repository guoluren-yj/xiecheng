import React, { Fragment, useMemo } from 'react';
import { Card } from 'choerodon-ui';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import PaymentLineInfo from './PaymentLineInfo';
import BasicInfo from './BasicInfo';
import AttachmentInfo from './AttachmentInfo';

const PaymentLineStep = (props) => {

  const { onPrev } = props;

  const cardList = useMemo(() => {
    return [
      {
        key: 'basic',
        title: intl.get('sbsm.common.view.title.basicInfo').d('基础信息'),
        content: <BasicInfo />,
      },
      {
        key: 'line',
        title: intl.get('sbsm.common.view.title.paymentLineInfo').d('支付行信息'),
        content: <PaymentLineInfo onPrev={onPrev} />,
      },
      {
        key: 'attachment',
        title: intl.get('sbsm.common.view.title.attachment').d('附件'),
        content: <AttachmentInfo />,
      },
    ];
  }, [onPrev]);

  return (
    <Fragment>
      {cardList.map((item) => {
        const { content, ...panelProps } = item;
        return (
          <Card bordered={false} className={DETAIL_CARD_CLASSNAME} {...panelProps}>
            {content}
          </Card>
        );
      })}
    </Fragment>
  );
};

export default PaymentLineStep;