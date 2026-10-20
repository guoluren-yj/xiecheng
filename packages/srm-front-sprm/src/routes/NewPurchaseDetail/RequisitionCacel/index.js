/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-21 19:38:30
 */
import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Detail from './Detail';
import StoreProvider from '../stores';

const Index = function Index(props) {
  const {
    match: { params = {} },
    location,
  } = props;

  const prHeaderId = params.id;
  const urlflagIf = location.search.includes('flag');
  const { type: sourceType = 'normal', back: backPath } = querystring.parse(
    location.search.substr(1)
  );
  const headerUnitCode =
    'SPRM.PURCHASE_PLAFORM_CANCEL.BASE,SPRM.PURCHASE_PLAFORM_CANCEL.BILLINGINFO,SPRM.PURCHASE_PLAFORM_CANCEL.DELIVERYINFO,SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASEORGINFO,SPRM.PURCHASE_PLAFORM_CANCEL.ATTACHMENT,SPRM.PURCHASE_PLAFORM_CANCEL.ATTACH_EX';
  const listUnitCode = urlflagIf
    ? 'SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_PURCHASELINE'
    : 'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE';

  return (
    <StoreProvider
      {...{
        ...props,
        prHeaderId,
        headerUnitCode,
        listUnitCode,
        urlflagIf,
        sourceType,
        backPath,
        source: 'cacel',
      }}
    >
      <Detail />
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
      'SPRM.PURCHASE_PLAFORM_CANCEL.BASE',
      'SPRM.PURCHASE_PLAFORM_CANCEL.BILLINGINFO',
      'SPRM.PURCHASE_PLAFORM_CANCEL.DELIVERYINFO',
      'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASEORGINFO',
      'SPRM.PURCHASE_PLAFORM_CANCEL.PURCHASELINE',
      'SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_PURCHASELINE',
      'SPRM.PURCHASE_PLAFORM_CANCEL.HEADER_BTN',
      'SPRM.PURCHASE_PLAFORM_CANCEL.ATTACHMENT',
      'SPRM.PURCHASE_PLAFORM_CANCEL.BASEINFO_SECTION',
      'SPRM.PURCHASE_PLAFORM.CANCELMODAL',
      'SPRM.PURCHASE_PLAFORM_CANCEL.TABLE_BTN',
      'SPRM.PURCHASE_PLAFORM.CLOSEMODAL',
      'SPRM.PURCHASE_PLAFORM_CANCEL.ADDLINE',
      'SPRM.PURCHASE_PLAFORM_CANCEL.ATTACH_EX',
      'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_ADD',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OUTSOURCINGBOM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.CHANGE_OUTSOURCINGBOM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_SUBMIT_FORM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CANCEL_FORM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CLOSE_FORM',
    ],
  })(Index)
);
