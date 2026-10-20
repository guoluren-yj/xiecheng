import request from 'utils/request';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SAGM, SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId(); // 租户ID

// 引用价格库新建协议
export async function getUnitListByMatchIds(params) {
  return request(
    `${SRM_SAGM}/v1/${organizationId}/price-lib-matchs/agreement-line?customizeUnitCode=SMAL.AGREEMENT_MANAGEMENT.PRICR_LIB_REVERSE`,
    {
      method: 'POST',
      body: params,
    }
  );
}

// 引用价格库创建商品
export async function createSkuByPriceLibs(params) {
  return request(`${SRM_SAGM}/v1/${organizationId}/agreement/price-lib/agreement`, {
    method: 'POST',
    body: params,
    headers: {
      's-request-web': 'srm_web',
    },
  });
}

// 商品介绍模板
export async function fetchSkuIntroTemplate() {
  return request(`${SRM_SMPC}/v1/${organizationId}/sku-detail-templates`, {
    method: 'GET',
    query: { enabledFlag: 1, size: 0 },
  });
}

// 商品介绍模板
export async function fetchCategoryByCatalog(catalogId) {
  return request(
    `${SRM_SMPC}/v1/${organizationId}/catalog-mappings/catalog-ref-categories/${catalogId}`,
    {
      method: 'GET',
    }
  );
}
