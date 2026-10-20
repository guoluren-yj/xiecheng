import React from 'react';
import { ModalProvider } from 'choerodon-ui/pro';
import { compose } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import remotes from 'hzero-front/lib/utils/remote';

import { IsOpenDoubleUnitHOC } from '@/utils/utils';
import { StoreProvider } from './store/index';

import Page from './Page';

// 所有功能组件都是StoreProvider的子组件 所以context能传递到任何子组件
const Index = (props) => {
  return (
    <StoreProvider {...props}>
      <ModalProvider {...props}>
        <Page {...props} />
      </ModalProvider>
    </StoreProvider>
  );
};

export default compose(
  IsOpenDoubleUnitHOC(),
  WithCustomizeC7N({
    unitCode: [
      `SSRC.QUICK_INQUIRY.EDIT.HEADER_BUTTONS`, // 头部按钮组
      `SSRC.QUICK_INQUIRY.EDIT.BASE_HEADER_FORM`, // 基础信息表单
      `SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM`, // 物料行
      `SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER`, // 供应商行
      `SSRC.QUICK_INQUIRY.EDIT.LINE_ITEM_BUTTONS`, // 物料行-按钮组
      `SSRC.QUICK_INQUIRY.EDIT.LINE_SUPPLIER_BUTTONS`, // 供应商行-按钮组
      'SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_HEADER', // 物料行-阶梯报价头
      `SSRC.QUICK_INQUIRY.EDIT.LADDER_QUOTATION_LINE`, // 物料行-阶梯报价行
      `SSRC.QUICK_INQUIRY.EDIT.BATCH_ITEM_FORM`, // 物料行-批量编辑表单
      `SSRC.QUICK_INQUIRY.EDIT.ITEM_SUP_ASSIGN`, // 供应商行-分配物料
      `SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_LINE`, // 物料行-引用采购申请
      `SSRC.QUICK_INQUIRY.EDIT.PURCHASE_REQUEST_FILTER`, // 物料行-引用采购申请筛选器
    ],
  }),
  formatterCollections({
    code: ['ssrc.quickInquiry', 'ssrc.common', 'hzero.c7nProUI'],
  }),
  remotes({
    code: 'SSRC_QUICK_INQUIRY_UPDATE',
    name: 'remote',
  })
)(Index);
