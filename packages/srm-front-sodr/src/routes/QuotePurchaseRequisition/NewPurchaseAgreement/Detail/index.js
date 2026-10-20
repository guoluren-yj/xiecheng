import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { useC7NComponent } from '@/routes/components/utils';
import StoreProvider from './stores';
import Detail from './Detail';
import OldIndex from '../../PurchaseAgreement/Detail';

const Index = function Index(props) {
  return (
    <StoreProvider {...props}>
      <Detail />
    </StoreProvider>
  );
};

export default useC7NComponent(
  'orderMaintain',
  OldIndex
)(
  formatterCollections({
    code: [
      'sodr.quotePurchaseRequisition',
      'sodr.common',
      'sodr.order',
      'entity.attachment',
      'sodr.quotePurchase',
      'sodr.orderMaintain',
      'hpfm.employee',
      'srm.common',
      'ssrc.priceLibrary',
      'sprm.purchaseReqCreation',
      'sprm.common',
      'sodr.workspace',
      'spcm.orderMaintenanceEntry',
      'entity.roles',
      'entity.company',
    ],
  })(
    withCustomize({
      unitCode: [
        'SODR.ORDER_CREATE_LINE_LIST.PO_LINE_LOCATION',
        'SODR.ORDER_CREATE_LINE_LIST.HEADER_BY_REQUEST',
        'SODR.REFERENCE_PURCHASE_AGREEMENT.FILTER',
        'SODR.REFERENCE_PURCHASE_AGREEMENT.LINE',
        'SODR.ORDER_CREATE_LINE_LIST.AGREEMENT_BTNS',
        'SODR.ORDER_CREATE_LINE_LIST.BATCH_SRM',
      ],
    })(Index)
  )
);
