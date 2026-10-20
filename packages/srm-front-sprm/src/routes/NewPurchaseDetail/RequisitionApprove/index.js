/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-21 19:38:42
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Detail from './Detail';
import StoreProvider from '../stores';

const Index = function Index(props) {
  const {
    match: { params = {} },
  } = props;

  const prHeaderId = params.id;
  const headerUnitCode =
    'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASEORGINFO,SPRM.PURCHASE_PLAFORM_QUERY.BASE_HEADER,SPRM.PURCHASE_PLAFORM_QUERY.BILLINGINFO,SPRM.PURCHASE_PLAFORM_QUERY.DELIVERYINFO,SPRM.PURCHASE_PLAFORM_QUERY.ATTACHMENT';
  const listUnitCode = 'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE';

  return (
    <StoreProvider {...{ ...props, prHeaderId, headerUnitCode, listUnitCode, source: 'approve' }}>
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
      'SPRM.PURCHASE_PLAFORM_QUERY.ATTACHMENT',
      'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE',
      'SPRM.PURCHASE_PLAFORM_QUERY.SECTION',
      'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASEORG_SECTION',
      'SPRM.PURCHASE_PLAFORM_QUERY.BILLINGINFO_SECTION',
      'SPRM.PURCHASE_PLAFORM_QUERY.DELIVERYINFO_SECTION',
      'SPRM.PURCHASE_PLAFORM_QUERY.PURCHASELINE_SECTION',
      'SPRM.PURCHASE_PLAFORM_QUERY.ATTACH_SECTION',
      'SRPM.PURCHAE_REQUISITION_APPROVE.DETAIL.BTNS',
    ],
  })(Index)
);
