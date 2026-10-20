import React from 'react';
import { compose } from 'lodash';
import remotes from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { useC7NComponent } from '@/routes/components/utils';
import { ChangeFieldsComponent } from './HOCComponent';
import StoreProvider from './stores';
import OrderChange from './OrderChange.js';
import OldIndex from '../OrderChange';
import remoteConfig from './remote';

const Index = function Index(props) {
  return (
    <StoreProvider {...props}>
      <OrderChange {...props} />
    </StoreProvider>
  );
};

export default compose(
  withCustomize({
    unitCode: [
      'SODR.ORDER_CANCEL_CHANGE.HEADER',
      'SODR.ORDER_CANCEL_CHANGE.LIST',
      'SODR.ORDER_CANCEL_CHANGE.BUTTONS',
      'SODR.ORDER_CANCEL_CHANGE.LIST_BUTTONS',
    ],
  }),
  formatterCollections({
    code: [
      'sodr.quotePurchase',
      'sodr.ordercancel',
      'sodr.common',
      'entity.company',
      'entity.organization',
      'entity.item',
      'sodr.orderType',
      'sodr.quotePurchaseRequisition',
      'sprm.common',
      'entity.purchaser',
      'sodr.receivedOrder',
      'entity.supplier',
      'hpfm.employee',
      'sodr.orderChange',
      'sodr.workspace',
      'sodr.sendOrder',
    ],
  }),
  remotes(...remoteConfig),
  useC7NComponent('orderChangeDetail', OldIndex),
  ChangeFieldsComponent
)(Index);
