import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import querystring from 'querystring';

import Detail from './Detail';
import StoreProvider from '../stores';

const Index = function Index(props) {
  const { match = {}, location = {}, href = '', onLoad, onFormLoaded } = props;
  const modalSearch = href.substr(href.indexOf('?'), href.length);
  const { prHeaderId: modalPrHeaderId, docLinkFlag } = querystring.parse(modalSearch.substr(1));
  const params = match?.params || {};
  const path = match?.path || '';
  const prHeaderId = params.id || params.prHeaderId || modalPrHeaderId;
  const backViodPageFlag = location?.search?.includes('backVoidPage');
  const pubPathFlag = !(path.includes('/pub/sprm/') || href.includes('/pub/sprm/'));
  const headerUnitCode =
    'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASEORGINFO,SPRM.PURCHASE_PLAFORM_QUERY.BASE_HEADER,SPRM.PURCHASE_PLAFORM_QUERY.BILLINGINFO,SPRM.PURCHASE_PLAFORM_QUERY.DELIVERYINFO,SPRM.PURCHASE_PLAFORM_QUERY.ATTACHMENT,SPRM.PURCHASE_PLAFORM_QUERY.ATTACH_EX';
  const listUnitCode = 'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE';

  return (
    <StoreProvider
      {...{
        ...props,
        prHeaderId,
        headerUnitCode,
        listUnitCode,
        pubPathFlag,
        backViodPageFlag,
        source: 'inquery',
        docLinkFlag,
      }}
    >
      <Detail onLoad={onLoad} onFormLoaded={onFormLoaded} />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'entity.supplier',
    'sprm.common',
    'sprm.purchasePlatform',
    'hzero.common',
    'hzero.c7nProUI',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.roles',
    'entity.attachment',
    'entity.item',
    'sprm.purchaseRequisitionInquiry',
    'sprm.purchaseReqCreation',
    'sprm.purchaseRequisitionCancel',
    'sprm.purchaseRequisitionAssign',
    'sodr.sendOrder',
    'sodr.common',
    'ssrc.priceLibrary',
    'sprm.purchaseReqCancel',
  ],
})(
  withCustomize({
    unitCode: [
      'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASEORGINFO',
      'SPRM.PURCHASE_PLAFORM_QUERY.BASE_HEADER',
      'SPRM.PURCHASE_PLAFORM_QUERY.BILLINGINFO',
      'SPRM.PURCHASE_PLAFORM_QUERY.DELIVERYINFO',
      'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE',
      'SPRM.PURCHASE_PLAFORM_QUERY.ATTACHMENT',
      'SPRM.PURCHASE_PLAFORM_QUERY.BTNS',
      'SPRM.PURCHASE_PLAFORM.CANCELMODAL',
      'SPRM.PURCHASE_PLAFORM.CLOSEMODAL',
      'SPRM.PURCHASE_PLAFORM_QUERY.SECTION',
      'SPRM.PURCHASE_PLAFORM_QUERY.EXECUTIONBILL',
      'SPRM.PURCHASE_PLAFORM_QUERY.ATTACH_EX',
      'SPRM.PURCHASE_PLAFORM_QUERY.TABLE_BTN',
      'SPRM.PURCHASE_PLAFORM_QUERY.OUTSOURCINGBOM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CANCEL_FORM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CLOSE_FORM',
    ],
  })(Index)
);
