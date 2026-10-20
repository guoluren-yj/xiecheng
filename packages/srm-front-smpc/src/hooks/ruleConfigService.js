import request from 'utils/request';
import { getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import { SRM_SMPC, SRM_PLATFORM, SRM_SAGM } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 是否开启双单位 -> boolean
function fetchSecondaryUom() {
  return request(`${SRM_SMPC}/v1/${organizationId}/custom-attr-templates/enable-secondary-uom`, {
    method: 'GET',
  });
}

// 供应商组件配置表控制
function fetchSupplierLovConfig() {
  return request(
    `${SRM_PLATFORM}/v1/${organizationId}/rel-table-records/source_supplier_lov_old_config/list-from-site`,
    {
      method: 'POST',
      body: { tenantNum: getCurrentTenant().tenantNum },
    }
  );
}

// 自定义权限的集合
function fetchCustDimensions() {
  return request(`${SRM_SAGM}/v1/${organizationId}/auth-dimensions/edit`, {
    method: 'GET',
  });
}

export default {
  secondaryUom: { api: fetchSecondaryUom, value: undefined }, // 双单位业务规则配置
  supplierLov: { api: fetchSupplierLovConfig, value: undefined }, // 新老供应商配置表查询
  custDimensions: {
    api: fetchCustDimensions,
    value: undefined,
  }, // 自定义维度查询
};
