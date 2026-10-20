/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2022-09-21 19:38:21
 */
import React from 'react';
import querystring from 'querystring';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import Detail from './Detail';
import StoreProvider from '../stores';
import AutoFillFormProvider from './AutoFillFormProvider';

const Index = function Index(props) {
  const params = querystring.parse(props.location.search.substr(1)) || {};
  const { prHeaderId, back: backPath } = params;
  const idParams = props?.match?.params || {};
  const headerUnitCode =
    'SPRM.PURCHASE_PLAFORM_CREATE.BASE_HEADER,SPRM.PURCHASE_PLAFORM_CREATE.PURCHASEORGINFO,SPRM.PURCHASE_PLAFORM_CREATE.BILLINGINFO,SPRM.PURCHASE_PLAFORM_CREATE.DELIVERYINFO,SPRM.PURCHASE_PLAFORM_CREATE.ATTACHMENT,SPRM.PURCHASE_PLAFORM_CREATE.ATTACH_EX';
  const listUnitCode = 'SPRM.PURCHASE_PLAFORM_CREATE.PURCHASELINE';
  return (
    <StoreProvider
      {...{
        ...props,
        prHeaderId: prHeaderId || idParams.id,
        backPath,
        headerUnitCode,
        listUnitCode,
        source: 'create',
      }}
    >
      <AutoFillFormProvider>
        <Detail />
      </AutoFillFormProvider>
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
    'sprm.common',
    'entity.supplier',
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
  ],
})(
  withCustomize({
    unitCode: [
      'SPRM.PURCHASE_PLAFORM_CREATE.BASE_HEADER',
      'SPRM.PURCHASE_PLAFORM_CREATE.PURCHASEORGINFO',
      'SPRM.PURCHASE_PLAFORM_CREATE.BILLINGINFO',
      'SPRM.PURCHASE_PLAFORM_CREATE.DELIVERYINFO',
      'SPRM.PURCHASE_PLAFORM_CREATE.PURCHASELINE',
      'SPRM.PURCHASE_PLAFORM_CREATE.ATTACHMENT',
      'SPRM.PURCHASE_PLAFORM_CREATE.BTNS',
      'SPRM.PURCHASE_PLAFORM.CANCELMODAL',
      'SPRM.PURCHASE_PLAFORM_CREATE.BASEINFO_SECTION',
      'SPRM.PURCHASE_PLAFORM_CREATE.TABLE_BTNS',
      'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_EDIT',
      'SPRM.PURCHASE_PLAFORM_CREATE.NOTSRM',
      'SPRM.PURCHASE_PLAFORM_CREATE.ATTACH_EX',
      'SPRM.PURCHASE_PLAFORM_CREATE.BATCH_ADD',
      'SPRM.PURCHASE_PLAFORM_CREATE.OUTSOURCINGBOM',
      'SPRM.PURCHASE_PLAFORM_CREATE.OPERATION_SUBMIT_FORM',
      'SPRM.PURCHASE_PLAFORM_CANCEL.OPERATION_CANCEL_FORM',
    ],
  })(Index)
);
