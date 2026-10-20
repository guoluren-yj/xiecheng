import intl from 'utils/intl';
// import { Prefix } from '@/utils/globalVariable';

/**
 *  // 核价-价格信息表
  {
    path: '/pub/ssrc/scux/ldjt/check/price-info-table',
    key: '/pub/ssrc/scux/ldjt/check/price-info-table',
    FilterSupplier: true,
    authorized: true,
    component: () => import('../routes/ssrc/TestComponent/ViewPriceLineTable.js'),
  },
*/

/**
 * 物料编码 itemCode
物料名称 itemName
含税单价 taxPrice
未税单价 netPrice
供应商编码 supplierCompanyNum
供应商名称supplierCompanyName
采购组织purOrganizationName
价格编号priceLibNumber
报价品牌attributeVarchar1
是否考核 examine(1是)
是否失效 expire(1是)
失效原因 expireRemark
*/

const priceInfoDataSetEditor = () => {
  return {
    primaryKey: 'priceLibId',
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'taxPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'netPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },

      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrg`).d('采购组织'),
        name: 'purOrganizationName',
      },
      {
        label: intl.get(`scux.ssrc.model.ldjt.priceLibNumber`).d('价格编号'),
        name: 'priceLibNumber',
      },
      {
        label: intl.get(`scux.ssrc.model.ldjt.quantitonBrand`).d('报价品牌'),
        name: 'attributeVarchar1',
      },
      {
        name: 'examine',
        label: intl.get('scux.ssrc.model.ldjt.priceModel.examine').d('是否考核'),
        lookupCode: 'HPFM.FLAG',
        type: 'string',
      },
      {
        name: 'expire',
        label: intl.get('scux.ssrc.model.ldjt.priceModel.expire').d('是否失效'),
        lookupCode: 'HPFM.FLAG',
        type: 'string',
      },
      {
        label: intl.get(`scux.ssrc.model.ldjt.supQuo.expireRemark`).d('失效原因'),
        name: 'expireRemark',
        type: 'string',
        maxLength: 500,
        dynamicProps: {
          required({ record }) {
            const expire = record.get('expire');
            return expire === 1 || expire === '1';
          },
        },
      },
    ],
    transport: {
      read: ({ data }) => {
        const { organizationId, rfxHeaderId } = data.commonProps || {};
        if (!rfxHeaderId) {
          return;
        }

        return {
          url: `/marmot/v1/${organizationId}/marmot-api/yLicK8p6VpH3rCzb2p9AGPjm9yzdbGqn21ZDFRLSFrhibQSZOdficaoHv0yY1Klx2zM`,
          method: 'GET',
          data: {
            rfxHeaderId,
            type: 'SUBMIT',
          },
        };
      },
    },
  };
};

const viewPriceDataSet = () => {
  return {
    primaryKey: 'rfxLadderLineNum',
    autoQuery: false,
    selection: false,
    pageSize: 10,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        name: 'itemName',
        type: 'string',
      },
      {
        label: intl.get('ssrc.inquiryHall.model.inquiryHall.unitPriceTax').d('单价(含税)'),
        name: 'taxPrice',
      },
      {
        label: intl.get(`ssrc.supplierQuotation.model.supQuo.netPrice`).d('单价(不含税)'),
        name: 'netPrice',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierCode`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },

      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.purchOrg`).d('采购组织'),
        name: 'purOrganizationName',
      },
      {
        label: intl.get(`scux.ssrc.model.ldjt.priceLibNumber`).d('价格编号'),
        name: 'priceLibNumber',
      },
      {
        label: intl.get(`scux.ssrc.model.ldjt.quantitonBrand`).d('报价品牌'),
        name: 'attributeVarchar1',
      },
      {
        name: 'examine',
        label: intl.get('scux.ssrc.model.ldjt.priceModel.examine').d('是否考核'),
      },
      {
        name: 'expire',
        label: intl.get('scux.ssrc.model.ldjt.priceModel.expire').d('是否失效'),
      },
      {
        label: intl.get(`scux.ssrc.model.ldjt.supQuo.expireRemark`).d('失效原因'),
        name: 'expireRemark',
        type: 'string',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { organizationId, rfxHeaderId } = data || {};
        if (!rfxHeaderId) {
          return;
        }

        return {
          url: `/marmot/v1/${organizationId}/marmot-api/yLicK8p6VpH3rCzb2p9AGPjm9yzdbGqn21ZDFRLSFrhibQSZOdficaoHv0yY1Klx2zM`,
          method: 'GET',
          data: {
            rfxHeaderId,
            type: 'DETIAL',
          },
        };
      },
    },
  };
};

export { priceInfoDataSetEditor, viewPriceDataSet };
