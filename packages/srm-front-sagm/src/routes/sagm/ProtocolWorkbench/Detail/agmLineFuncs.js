import React from 'react';
import intl from 'utils/intl';
import { Modal, Form, Lov, DataSet, Select } from 'choerodon-ui/pro';
import { getCurrentOrganizationId } from 'utils/utils';

import c7nModal from '@/utils/c7nModal';
import { openCategory } from '@/routes/pageTree';
import { fetchPlatformCategory } from '@/services/mallProtocolManagementService';
import ProductModal from '../Modal/ProductModal';
// import QuoteModal from '../component/QuoteDataModal';
import { itemProductDs } from './ds';
import { historyProductDs, productDs } from '../Modal/modalDs';

// 商品穿梭
export function openTransfer() {}

// 批量维护
export function openBatchLine() {}

// export function openPriceModal(params){
//   c7nModal({
//     title: intl.get('small.mallProtocolManagement.view.quotePriceData').d('引用价格库'),
//     key: 'price',
//     // style: { width: 1200 },
//     drawer: false,
//     children: <QuoteModal {...params} />,
//   });
// }

// 批量新建商品 (基于物料创建)
export function openProductModal({ handleProductOK = (e) => e, catalogId = '' }) {
  const ds = new DataSet(itemProductDs());
  // 拿到 categoryId 初始化表单
  if (catalogId && ds) {
    fetchPlatformCategory({
      page: 0,
      size: 1,
      catalogId,
      enabledFlag: 1,
      tenantId: getCurrentOrganizationId(),
    }).then((res) => {
      if (res && res[0]) {
        const { categoryId, categoryName } = res[0] || {};
        ds.loadData([{ categoryId, categoryName }]);
      }
    });
  }
  Modal.open({
    drawer: true,
    style: { width: 380 },
    title: intl.get('sagm.common.model.addSkuBasedOnItem').d('基于物料新增商品'),
    onOk: async () => {
      const flag = await ds.validate();
      if (!flag) return false;
      return handleProductOK(ds.current.toJSONData());
    },
    children: (
      <Form dataSet={ds} labelLayout="float">
        <Select name="details" />
        <Lov
          name="categoryLov"
          onClick={() => openCategory({ name: 'categoryLov', record: ds.current })}
        />
      </Form>
    ),
  });
}

export function viewHistoryProduct({ agreementLineId, versionNum }) {
  const ds = new DataSet(
    historyProductDs({
      agreementLineId,
      versionNum,
    })
  );
  c7nModal({
    style: { width: 800 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    // footer: readOnly ? null : undefined,
    title: intl.get('small.common.model.productInfo').d('商品信息'),
    children: (
      <ProductModal readOnly backPath="/sagm/sagm-protocol-workbench/history" dataSet={ds} />
    ),
  });
}

export function viewProduct({ agreementLineId }, backPath) {
  const ds = new DataSet(
    productDs({
      agreementLineId,
    })
  );
  c7nModal({
    style: { width: 800 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    // footer: readOnly ? null : undefined,
    title: intl.get('small.common.model.productInfo').d('商品信息'),
    children: <ProductModal readOnly backPath={backPath} dataSet={ds} />,
  });
}
