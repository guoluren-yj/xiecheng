import React, { useContext } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react';

import BasicInfo from './CardManage/Quotation/BasicInfo';
import SupplierResponse from './CardManage/Quotation/SupplierResponse';
import ItemLineDetail from './CardManage/Quotation/ItemLineDetail';
import Card from '../rfComponents/Card';
import Store from './store/index';

const InQuotation = observer((props) => {
  const { doubleUnitFlag } = props;
  const {
    commonDs: { consultBasicFormDs },
  } = useContext(Store);

  const itemLineDetailProps = {
    doubleUnitFlag,
  };

  return (
    <>
      <Card
        title={intl.get('ssrc.rfCheck.view.card.title.basicInfos').d('基本信息')}
        component={<BasicInfo />}
      />
      <Card
        title={intl.get('ssrc.rfCheck.view.card.title.supplier.response').d('供应商响应情况')}
        component={<SupplierResponse />}
      />
      {consultBasicFormDs?.current?.get('lineItemsFlag') &&
      consultBasicFormDs?.current?.get('sealedQuotationFlag') === 0 ? (
        <Card
          title={intl.get('ssrc.rfCheck.view.card.title.quotationDetail').d('报价明细')}
          component={<ItemLineDetail {...itemLineDetailProps} />}
        />
      ) : (
        ''
      )}
    </>
  );
});

export default InQuotation;
