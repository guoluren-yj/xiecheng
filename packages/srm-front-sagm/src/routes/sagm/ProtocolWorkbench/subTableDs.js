// import moment from 'moment';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { protocolEventLoad } from '../commonUtils';

const SRM_AGM = '/sagm';
const organizationId = getCurrentOrganizationId();

const protocolDs = (config = {}) => {
  const { queryParams = {}, historyUrl = '' } = config;
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'agreementId',
    cacheSelection: true,
    fields: [
      {
        name: 'agreementStatusMeaning',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'agreementNumber',
        label: intl.get('sagm.common.model.agreementCode').d('协议编码'),
      },
      {
        name: 'agreementName',
        label: intl.get('sagm.common.model.agreementName').d('协议名称'),
      },
      {
        name: 'versionNum',
        label: intl.get('sagm.common.model.version').d('版本'),
        type: 'number',
      },
      {
        name: 'creationDate',
        label: intl.get('sagm.common.model.creationDate').d('创建日期'),
        type: 'date',
      },
      {
        name: 'companyName',
        label: intl.get('sagm.common.model.purchase').d('采购方'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('sagm.common.model.supplier').d('供应商'),
      },
      {
        name: 'sourceFromMeaning',
        label: intl.get('sagm.common.model.documentSource').d('单据来源'),
      },
      {
        name: 'createdByName',
        label: intl.get('sagm.common.model.createdByName').d('创建人'),
      },
    ],
    record: {
      dynamicProps: {
        selectable: record => record.get('agreementStatus') !== 'APPROVING',
      },
    },
    transport: {
      read({ data }) {
        const _url = historyUrl || '/agreements';
        return {
          url: `${SRM_AGM}/v1/${organizationId}${_url}`,
          method: 'GET',
          data: { tenantId: organizationId, ...data, ...queryParams },
        };
      },
    },
    events: {
      load: protocolEventLoad,
    },
  };
};

const protocolDetailDs = (config = {}) => {
  const { queryParams = {} } = config;
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'agreementLineId',
    cacheSelection: true,
    fields: [
      {
        name: 'agreementStatusMeaning',
        label: intl.get('sagm.common.view.agreementStatusMeaning').d('协议状态'),
      },
      // 已发布/失效
      // {
      //   name: 'statusMeaning',
      //   label: intl.get('sagm.common.view.statusMeaning').d('状态'),
      // },
      // -1:无效  0:有效  1:待生效
      {
        name: 'effectiveFlagMeaning',
        label: intl.get('sagm.common.model.effectiveFlagMeaning').d('明细状态'),
        // label: intl.get('sagm.common.view.protocolDetailStatus').d('协议明细状态'),
      },
      {
        name: 'agreementNumber',
        label: intl.get('sagm.common.model.agreementNumber').d('协议编码'),
      },
      {
        name: 'agreementName',
        label: intl.get('sagm.common.model.agreementName').d('协议名称'),
      },
      {
        name: 'versionNum',
        label: intl.get('sagm.common.model.versionNum').d('版本'),
        type: 'number',
      },
      {
        name: 'lineNum',
        label: intl.get('sagm.common.model.agreementLineNum').d('协议行号'),
        type: 'number',
      },
      {
        name: 'creationDate',
        label: intl.get('sagm.common.model.creationDate').d('创建日期'),
        type: 'date',
      },
      {
        name: 'companyName',
        label: intl.get('sagm.common.model.purchase').d('采购方'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('sagm.common.model.supplier').d('供应商'),
      },
      {
        name: 'itemCode',
        label: intl.get('sagm.common.model.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sagm.common.model.itemName').d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get('sagm.common.model.itemCategory').d('物料品类'),
      },
      {
        name: 'uomName',
        label: intl.get('sagm.common.model.uomName').d('单位'),
      },
      {
        name: 'taxPrice',
        label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
        type: 'number',
      },
      {
        name: 'currencyName',
        label: intl.get('sagm.common.model.currencyName').d('币种'),
      },
      {
        name: 'tax',
        label: intl.get('sagm.common.model.tax').d('税率'),
        type: 'number',
      },
      {
        name: 'validDateFrom',
        label: intl.get('sagm.common.model.validDateFrom').d('有效期从'),
        type: 'date',
      },
      {
        name: 'validDateTo',
        label: intl.get('sagm.common.model.validDateTo').d('有效期至'),
        type: 'date',
      },
      {
        name: 'sourceFromMeaning',
        label: intl.get('sagm.common.model.documentSource').d('单据来源'),
      },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_AGM}/v1/${organizationId}/agreement-lines`,
          method: 'GET',
          data: { tenantId: organizationId, ...data, ...queryParams },
        };
      },
    },
  };
};

const productDetailDs = (config = {}) => {
  const { queryParams = {} } = config;
  return {
    autoQuery: false,
    pageSize: 20,
    primaryKey: 'agreementDetailId',
    cacheSelection: true,
    fields: [
      {
        name: 'shelfFlagMeaning',
        label: intl.get('sagm.common.model.productStatus').d('商品状态'),
      },
      {
        name: 'purSkuStatusMeaning',
        label: intl.get('sagm.common.model.productStatus').d('商品状态'),
      },
      {
        name: 'agreementStatusMeaning',
        label: intl.get('sagm.common.view.agreementStatusMeaning').d('协议状态'),
      },
      // -1:无效  0:有效  1:待生效
      {
        name: 'effectiveFlagMeaning',
        label: intl.get('sagm.common.model.effectiveFlagMeaning').d('明细状态'),
      },
      {
        name: 'skuCode',
        label: intl.get('sagm.common.model.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        label: intl.get('sagm.common.model.skuName').d('商品名称'),
      },
      {
        name: 'skuUom',
        label: intl.get('sagm.common.model.skuUom').d('销售单位'),
      },
      {
        name: 'skuBrand',
        label: intl.get('sagm.common.model.skuBrand').d('商品品牌'),
      },
      {
        name: 'imagePath',
        label: intl.get('sagm.common.model.imagePath').d('商品图片'),
      },
      {
        name: 'agreementNumber',
        // label: intl.get('sagm.common.model.agreementNumber').d('协议编码'),
      },
      {
        name: 'agreementName',
        label: intl.get('sagm.common.model.agreementName').d('协议名称'),
      },
      {
        name: 'versionNum',
        label: intl.get('sagm.common.model.versionNum').d('版本'),
        type: 'number',
      },
      {
        name: 'lineNum',
        label: intl.get('sagm.common.model.agreementLineNum').d('协议行号'),
        type: 'number',
      },
      {
        name: 'creationDate',
        label: intl.get('sagm.common.model.creationDate').d('创建日期'),
        type: 'date',
      },
      {
        name: 'companyName',
        label: intl.get('sagm.common.model.purchase').d('采购方'),
      },
      {
        name: 'supplierCompanyName',
        label: intl.get('sagm.common.model.supplier').d('供应商'),
      },
      {
        name: 'itemCode',
        label: intl.get('sagm.common.model.itemCode').d('物料编码'),
      },
      {
        name: 'itemName',
        label: intl.get('sagm.common.model.itemName').d('物料名称'),
      },
      {
        name: 'itemCategoryName',
        label: intl.get('sagm.common.model.itemCategory').d('物料品类'),
      },
      {
        name: 'uomName',
        label: intl.get('sagm.common.model.uomName').d('单位'),
      },
      {
        name: 'taxPrice',
        label: intl.get('sagm.common.view.price.tax').d('单价(含税)'),
        type: 'number',
      },
      {
        name: 'currencyName',
        label: intl.get('sagm.common.model.currencyName').d('币种'),
      },
      {
        name: 'tax',
        label: intl.get('sagm.common.model.tax').d('税率'),
        type: 'number',
      },
      {
        name: 'validDateFrom',
        label: intl.get('sagm.common.model.validDateFrom').d('有效期从'),
        type: 'date',
      },
      {
        name: 'validDateTo',
        label: intl.get('sagm.common.model.validDateTo').d('有效期至'),
        type: 'date',
      },
      // {
      //   name: 'currencyName',
      //   label: intl.get('sagm.common.model.currencyName').d('币种'),
      // },
      // {
      //   name: 'currencyName',
      //   label: intl.get('sagm.common.model.currencyName').d('币种'),
      // },
      // {
      //   name: 'currencyName',
      //   label: intl.get('sagm.common.model.currencyName').d('币种'),
      // },
    ],
    transport: {
      read({ data }) {
        return {
          url: `${SRM_AGM}/v1/${organizationId}/agreement-details`,
          method: 'GET',
          data: { tenantId: organizationId, ...data, ...queryParams },
        };
      },
    },
  };
};

export { protocolDs, protocolDetailDs, productDetailDs };
