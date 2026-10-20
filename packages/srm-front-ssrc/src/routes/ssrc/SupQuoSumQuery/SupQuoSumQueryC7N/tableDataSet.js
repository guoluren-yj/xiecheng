import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix } from '@/utils/globalVariable';

import {
  getUomName,
  getPriceName,
  getNetPriceName,
  getAllottedQuantity,
  getQtyName,
  getAvailableQtyName,
} from '@/utils/utils';

const getDoubleFlag = (ds) => {
  if (!ds) {
    return;
  }

  const doubleFlag = ds.getState('doubleUnitFlag');
  return doubleFlag;
};

const TableDS = () => {
  return {
    primaryKey: 'quotationLineId',
    autoQuery: false,
    selection: 'multiple',
    cacheSelection: true,
    fields: [
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyNum`)
          .d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.erpSupplierNum`)
          .d('ERP供应商编码'),
        name: 'erpSupplierCompanyNum',
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyName`)
          .d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemRemark`).d('物料名称'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.netPrice`).d('单价(不含税)'),
        name: 'validNetSecondaryPrice',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.taxPrice`).d('单价(含税)'),
        name: 'validQuotationSecPrice',
      },
      {
        name: 'rfxTitle',
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxTitle`).d('询价单标题'),
      },
      {
        name: 'validNetPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            const label = getNetPriceName(doubleUnitFlag);
            return label;
          },
        },
      },
      {
        name: 'validQuotationPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            const label = getPriceName(doubleUnitFlag);
            return label;
          },
        },
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ladderInquiryFlag`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.quotationDetailFlag`)
          .d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.freightAmount`).d('运费'),
        name: 'freightAmount',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.suggestedFlag`).d('选用'),
        name: 'suggestedFlag',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.allottedQuantity`).d('分配数量'),
        name: 'allottedSecondaryQuantity',
      },
      {
        name: 'allottedQuantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            const label = getAllottedQuantity(doubleUnitFlag);
            return label;
          },
        },
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        name: 'secondaryQuantity',
      },
      {
        name: 'rfxQuantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            const label = getQtyName(doubleUnitFlag);
            return label;
          },
        },
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.currentQuotQuantity`)
          .d('可供数量'),
        name: 'currentQuotationSecQuantity',
      },
      {
        name: 'currentQuotationQuantity',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            const label = getAvailableQtyName(doubleUnitFlag);
            return label;
          },
        },
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.uomName`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        name: 'uomName',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            const label = getUomName(doubleUnitFlag);
            return label;
          },
        },
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.taxCode`).d('税码'),
        name: 'taxCode',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率(%)'),
        name: 'taxRate',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.currencyCode`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.exchangeRate`).d('汇率'),
        name: 'exchangeRate',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCategoryName`).d('物料类别'),
        name: 'itemCategoryName',
      },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.quotationType`).d('报价方式'),
        name: 'quotationTypeMeaning',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxLineItemNum`).d('行号'),
        name: 'rfxLineItemNum',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.roundNumber`).d('轮次'),
        name: 'roundNumber',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxNum`).d('RFX单号'),
        name: 'rfxNum',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxlabel`).d('询价单标题'),
        name: 'rfxlabel',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourcingTemplate`).d('寻源模板'),
        name: 'templateName',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.sourceMethod`).d('寻源方式'),
        name: 'sourceMethodMeaning',
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.purOrganizationCode`)
          .d('采购组织编码'),
        name: 'purOrganizationCode',
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.purOrganizationName`)
          .d('采购组织名称'),
        name: 'purOrganizationName',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ouName`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.invOrganizationName`)
          .d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`ssrc.common.model.common.createdByName`).d('创建人'),
        name: 'createByName',
      },
      {
        label: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.finishDate`).d('完成时间'),
        name: 'finishDate',
        type: 'date',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationTime`).d('创建时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { commons, searchBar = {}, multiRfxNumOrTitle = '', ...dataOthers } = data || {};

        const organizationId = getCurrentOrganizationId();

        return {
          url: `${Prefix}/${organizationId}/rfx/quotation/summary`,
          method: 'GET',
          data: {
            ...dataOthers,
            ...(searchBar || {}), // 筛选器数据
            ...(commons || {}),
            customizeUnitCode:
              'SSRC.SUPPLIER_QUOTATION_COLLECT.QUERY,SSRC.SUPPLIER_QUOTATION_COLLECT.TABLE_FILTER',
            multiRfxNumOrTitle,
          },
        };
      },
    },
  };
};

export { TableDS };
