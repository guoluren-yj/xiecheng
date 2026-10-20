import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { useC7NComponent } from '@/routes/components/utils';
import StoreProvider from './stores';
import Detail from './Detail';
import OldIndex from '../Detail';

const Index = function Index(props) {
  return (
    <StoreProvider {...props}>
      <Detail />
    </StoreProvider>
  );
};

export default useC7NComponent(
  'sendOrderDetail',
  OldIndex
)(
  formatterCollections({
    code: [
      'sodr.sendOrder',
      'sodr.common',
      'sodr.confirmOrder',
      'sprm.common',
      'sodr.confirmOrder',
      'entity.item',
      'entity.company',
      'entity.attachment',
      'entity.order',
      'item.order',
      'entity.roles',
      'entity.item',
      'sodr.quotePurchase',
      'sodr.quotePurchaseRequisition',
      'hpfm.employee',
      'entity.business',
      'sodr.orderEvaluation',
      'sprm.purchaseReqCreation',
      'sodr.orderMaintenanceEntry',
      'sodr.packingData',
      'spcm.common',
    ],
  })(
    withCustomize({
      unitCode: [
        'SODR.SEND_ORDER_DETAIL.BASIC',
        'SODR.SEND_ORDER_DETAIL.HEADER',
        'SODR.SEND_ORDER_DETAIL.OTHER',
        'SODR.SEND_ORDER_DETAIL.INVOICE',
        'SODR.SEND_ORDER_DETAIL.DELIVERY_CATA',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.HEADER',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.LINE',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.OTHER',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.INVOICE',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.DELIVERY_CATA',
        'SODR.SEND_ORDER_DETAIL.TAB',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.TAB',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.CANCEL_MODEL',
        'SODR.SEND_ORDER_DETAIL.HEADER_BUTTONS',
        'SODR.ORDER_PROCESS_CONTROL_DETAIL.BUTTONS',
        'SODR.SEND_ORDER_DETAIL.DOCRELATE_DSC',
        'SODR.SEND_ORDER_DETAIL.DOCRELATE_BILL',
        'SODR.SEND_ORDER_DETAIL.DOCRELATE_BILL_NEW',
      ],
    })(Index)
  )
);
