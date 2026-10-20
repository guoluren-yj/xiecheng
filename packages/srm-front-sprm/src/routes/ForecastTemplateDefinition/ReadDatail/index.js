/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2022-02-14 17:30:29
 * @LastEditors: yanglin
 * @LastEditTime: 2022-03-06 23:09:57
 */
import React from 'react';
import formatterCollections from 'utils/intl/formatterCollections';
import Detail from './Detail';

import StoreProvider from './../Detail/stores';
import './../Detail/index.less';

const Index = function Index(props) {
  const {
    match: { params },
  } = props;
  const { id } = params;
  return (
    <StoreProvider {...{ ...props, templateHeaderId: id }}>
      <Detail />
    </StoreProvider>
  );
};

export default formatterCollections({
  code: [
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
})(Index);
