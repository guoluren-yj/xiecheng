import { parse } from 'querystring';
import React, { Fragment, useMemo, useState } from 'react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import { createTypeMap } from '@/routes/NewPurchaseSettle/List';
import Create from './index';
import styles from './index.less';

const getCreateTitle = (settleType) => {
  const createTitleMap = {
    INVOICE: intl.get(`ssta.purchaseSettle.view.title.invoiceApplyCreate`).d('发票申请新建'),
    PAYMENT: intl.get(`ssta.purchaseSettle.view.title.paymentApplyCreate`).d('付款申请新建'),
    INVOICE_PAYMENT: intl
      .get(`ssta.purchaseSettle.view.title.payApplyIncludeInvCreate`)
      .d('付款申请（含发票）新建'),
  };
  return createTitleMap[settleType];
};

export default formatterCollections({
  code: ['ssta.purchaseSettle'],
})((props) => {
  const { modal, location, history } = props;
  const { search } = location;
  const { createType = 'invCreate' } = parse(search.substr(1));
  const partCreateProps = createTypeMap[createType];
  const [headerTitle, setHeaderTitle] = useState(getCreateTitle(partCreateProps.settleType));

  const createProps = useMemo(() => {
    return {
      modal,
      history,
      headerTitle,
      setHeaderTitle,
      ...partCreateProps,
    };
  }, [modal, history, headerTitle, setHeaderTitle, partCreateProps]);

  return (
    <Fragment>
      <Header title={headerTitle} />
      <Content className={styles['create-steps-page']}>
        <Create {...createProps} />
      </Content>
    </Fragment>
  );
});
