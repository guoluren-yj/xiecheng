import qs from 'qs';
import { Modal } from 'choerodon-ui/pro';
// import { routerRedux } from 'dva/router';
import { openTab } from 'utils/menuTab';
// import { getDvaApp } from 'utils/iocUtils';
import { filterNullValueObject } from 'utils/utils';
// import intl from 'utils/intl';

// const userTenantId = getUserOrganizationId();
// const currentTenantId = getCurrentOrganizationId();

// const isToggleTenant = userTenantId !== currentTenantId;

// 商品创建/修改
export function openSkuEdit(params = {}) {
  // params: { submitBack, spuId, backPath }, other: { type, toggleFlag }
  const { type = 'pur', ...param } = params;
  // const title = read
  //   ? intl.get('small.common.view.skuDetail').d('商品详情')
  //   : type === 'pur'
  //   ? intl.get('small.common.view.skuPublishPur').d('商品发布（采）')
  //   : intl.get('small.common.view.skuPublishSup').d('商品发布（供）');
  const menuPath = `/smpc/sku-release-${type}`;
  const titleCode =
    type === 'pur' ? 'srm.common.view.skuReleasePur' : 'srm.common.view.skuReleaseSup';
  const search = qs.stringify({ ...param, submitBack: 'y' });

  openTab({
    search,
    key: menuPath,
    title: titleCode, // 商品发布
  });

  // getDvaApp()._store.dispatch(
  //   routerRedux.push({
  //     pathname: menuPath,
  //     search,
  //   })
  // );
  // 如果开启切换判断同时没有切换租户
  // if (toggleFlag && !isToggleTenant) {
  //   push({
  //     pathname: menuPath,
  //     search,
  //   });
  // } else {
  //   openTab({
  //     key: menuPath,
  //     title,
  //     search,
  //   });
  // }
}

// 商品预览
export function openSkuPreview(params) {
  Modal.destroyAll();
  openTab({
    key: `/smpc/sku-preview`,
    title: 'srm.common.view.skuPreview', // 商品预览
    search: qs.stringify(params),
  });
}

// 商品详情
export function openSkuDetail({ record, recordData, type = 'pur', backPath }) {
  const { spuId, skuId, agreementBusinessType } =
    recordData || record.get(['spuId', 'skuId', 'agreementBusinessType']);
  const searchPara = qs.stringify(
    filterNullValueObject({
      spuId,
      skuId,
      backPath,
      anchor: type === 'pur' ? 'SKU_DETAIL_PUR' : 'SKU_DETAIL_SUP',
      hiddenSku: 'y',
      req: agreementBusinessType === 'RECEIVE' ? 'receive' : '',
    })
  );
  openTab({
    key: `/smpc/sku-detail-${type}`,
    title: 'srm.common.view.skuDetail',
    search: searchPara,
  });
}
