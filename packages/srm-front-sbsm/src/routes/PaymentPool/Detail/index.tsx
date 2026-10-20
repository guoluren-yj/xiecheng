import React, { Fragment, useContext, useMemo } from 'react';
import { observer } from 'mobx-react';
import { Card } from 'choerodon-ui';
import { Modal, Tabs } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';

import Amount from './components/Amount';
import Execution from './components/Execution';
import commonStyles from '../../../common.less';
import StoreProvider, { Store } from './stores';
import Transaction from './components/Transaction';
import Counterparty from './components/Counterparty';

const { TabPane } = Tabs;

const Detail = observer(() => {

  const { boolMap } = useContext(Store);

  const paneList = useMemo(() => {
    return [
      {
        key: 'detail',
        title: intl.get('sbsm.paymentPool.view.title.payTransactionDetailInfo').d('支付事务详情信息'),
        children: [
          {
            key: 'counterparty',
            title: intl.get(`sbsm.paymentPool.view.title.counterpartyInfo`).d('交易方信息'),
            children: <Counterparty />,
          },
          {
            key: 'transaction',
            title: intl.get(`sbsm.paymentPool.view.title.transactionInfo`).d('交易事务信息'),
            children: <Transaction />,
          },
        ],
      },
      {
        key: 'execution',
        title: intl.get('sbsm.paymentPool.view.title.payTransactionExecutionInfo').d('支付事务执行信息'),
        children: [
          {
            key: 'amount',
            title: intl.get(`sbsm.paymentPool.view.title.payTransactionAmountInfo`).d('交易事务金额信息'),
            children: <Amount />,
          },
          {
            key: 'execution',
            title: intl.get(`sbsm.paymentPool.view.title.payTransactionExecutionInfo`).d('支付事务执行信息'),
            children: <Execution />,
          },
        ],
      },
    ];
  }, []);

  return (
    <Fragment>
      {boolMap.errorFlag ? (
        <Fragment>
          {paneList[0].children.map((child) => {
            const { key, title, children } = child;
            return (
              <Card key={key} title={title} bordered={false} className={DETAIL_CARD_CLASSNAME}>
                {children}
              </Card>
            );
          })}
        </Fragment>
      ) : (
        <Tabs>
          {paneList.map((item) => {
            const { key, title, children } = item;
            return (
              <TabPane tab={title} key={key}>
                {children.map((child) => {
                  const { key, title, children } = child;
                  return (
                    <Card key={key} title={title} bordered={false} className={DETAIL_CARD_CLASSNAME}>
                      {children}
                    </Card>
                  );
                })}
              </TabPane>
            );
          })}
        </Tabs>
      )}
    </Fragment>
  );
});

const PaymentPoolDetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export const viewPaymentPoolDetail = ({ payId, payErrorId, history }: { payId?: string, payErrorId?: string, history: any }) => {
  if (!payId && !payErrorId) return;
  Modal.open({
    drawer: true,
    key: Modal.key(),
    closable: true,
    className: commonStyles['sbsm-large-modal'],
    title: intl.get('sbsm.paymentPool.view.title.viewPayTransaction').d('查看支付事务'),
    children: <PaymentPoolDetail payId={payId} payErrorId={payErrorId} history={history} />,
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
  });
};

export default PaymentPoolDetail;