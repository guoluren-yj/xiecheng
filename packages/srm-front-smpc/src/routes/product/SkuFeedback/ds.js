import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';

const organizationId = getCurrentOrganizationId();

// 用户问题反馈
export function getUserProblemDataSetProps() {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      { name: 'manageStatusMeaning', label: intl.get('hzero.common.status').d('状态') },
      { name: 'realName', label: intl.get('smpc.feedback.view.feedbackUser').d('反馈人') },
      { name: 'feedbackTime', label: intl.get('smpc.feedback.view.feedbackTime').d('反馈时间') },
      {
        name: 'manageTypeMeaning',
        label: intl.get('smpc.feedback.view.problemType').d('问题类型'),
      },
      { name: 'remark', label: intl.get('smpc.feedback.view.supplyDesc').d('补充说明') },
      { name: 'mainSkuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
      { name: 'skuInfo', label: intl.get('smpc.product.view.skuInfo').d('商品信息') },
      { name: 'mainSkuPrice', label: intl.get('smpc.product.view.price.tax	').d('单价(含税)') },
      { name: 'mainSupplierName', label: intl.get('smpc.product.view.supplier').d('供应商') },
      { name: 'action', label: intl.get('hzero.common.action').d('操作') },
    ],
    transport: {
      read: {
        url: `${SRM_SMPC}/v1/${organizationId}/same-sku-manages`,
        method: 'GET',
      },
    },
  };
}

// 用户问题反馈操作同款商品
export function getUserSameSkuDataSetProps(manageId) {
  return {
    selection: false,
    autoQuery: true,
    pageSize: 20,
    fields: [
      { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
      { name: 'skuName', label: intl.get('smpc.product.view.skuName').d('商品名称') },
      { name: 'skuPrice', label: intl.get('smpc.product.view.price.tax	').d('单价(含税)') },
      { name: 'supplierCompanyName', label: intl.get('smpc.product.view.supplier').d('供应商') },
      {
        name: 'blacklistFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        disabled: true,
        label: intl.get('smpc.feedback.model.removeSameSku').d('移出同款'),
      },
    ],
    transport: {
      read: {
        url: `${SRM_SMPC}/v1/${organizationId}/same-sku-manage-lines/${manageId}`,
        method: 'GET',
      },
    },
  };
}

// 用户问题反馈操作记录
export function getUserRecordDataSetProps(manageId) {
  return {
    paging: false,
    autoQuery: true,
    transport: {
      read: {
        url: `${SRM_SMPC}/v1/${organizationId}/same-sku-operation-records/${manageId}`,
        method: 'GET',
      },
    },
  };
}

// 同款商品黑名单
export function getSameBlackListDataSetProps() {
  return {
    selection: false,
    pageSize: 20,
    transport: {
      read: {
        url: `${SRM_SMPC}/v1/${organizationId}/same-sku-blacklists`,
        method: 'GET',
      },
    },
  };
}

// 用户白名单
export function getUserWhiteListDataSetProps() {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      { name: 'realName', label: intl.get('smpc.feedback.view.user').d('用户') },
      { name: 'skuCode', label: intl.get('smpc.product.view.skuCode').d('商品编码') },
      { name: 'skuInfo', label: intl.get('smpc.product.view.skuInfo').d('商品信息') },
      { name: 'supplierCompanyName', label: intl.get('smpc.product.view.supplier').d('供应商') },
      { name: 'action', label: intl.get('hzero.common.action').d('操作') },
    ],
    transport: {
      read: {
        url: `${SRM_SMPC}/v1/${organizationId}/same-sku-whitelists`,
        method: 'GET',
      },
    },
  };
}
