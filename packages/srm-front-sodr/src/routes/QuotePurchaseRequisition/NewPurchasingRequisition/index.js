import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { useC7NComponent } from '@/routes/components/utils';
import StoreProvider from './stores';
import List from './List';
import OldIndex from '../PurchasingRequisition';

const Index = function Index(props) {
  return (
    <StoreProvider {...props}>
      <List />
    </StoreProvider>
  );
};

export default useC7NComponent(
  'quotePurchaseRequisition',
  OldIndex
)(
  formatterCollections({
    code: [
      'sodr.quotePurchaseRequisition',
      'sodr.quotePurchase',
      'sodr.common',
      'entity.supplier',
      'entity.business',
      'entity.organization',
      'entity.applier',
      'entity.company',
      'entity.purchaser',
      'sodr.orderType',
      'ssrc.priceLibrary',
    ],
  })(
    withCustomize({
      unitCode: [
        'SODR.PURCHASE_REQUISITION_LIST.LINE',
        'SODR.PURCHASE_REQUISITION_LIST.FILTER_LINE',
        'SODR.PURCHASE_REQUISITION_LIST.FILTER_ALL',
        'SODR.PURCHASE_REQUISITION_LIST.ALL',
        'SODR.PURCHASE_REQUISITION_LIST.BUTTONS',
        'SODR.PURCHASE_REQUISITION_LIST.TAB',
        'SODR.PURCHASE_REQUISITION_LIST.PROPOSED.PRICE',
        'SODR.PURCHASE_REQUISITION_LIST.FILTER_PROPOSED_PRICE',
      ],
    })(Index)
  )
);
