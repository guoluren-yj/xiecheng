import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Prefix, PrefixV2 } from '@/utils/globalVariable';

import { getUomName, getPriceName, getNetPriceName } from '@/utils/utils';

const promptCode = 'ssrc.resultsQuery';

const getDoubleFlag = (ds) => {
  if (!ds) {
    return;
  }

  const doubleFlag = ds.getState('doubleUnitFlag');
  return doubleFlag;
};

/**
 * resultPoolId 寻源结果池id
  poolStatus 结果池状态 SSRC_RESULT_POOL_APPROVE_STATUS
  poolStatusMeaning
  allocateRule 结果池分配规则 SSRC_RESULT_POOL_ALLOCATE_RULE
  allocateRuleMeaning
  tenantId 租户ID
  sourceHeaderId 寻源单头ID
  sourceNum 寻源单号
  companyId 采购方企业ID
  companyNum 采购方企业编码
  companyName 采购方企业名称
  itemId 物料ID
  itemCode 物料代码
  itemName 物料描述
  itemNum 行号
  supplierCompanyId 供应商企业ID
  supplierCompanyNum 供应商企业编码
  supplierCompanyName 供应商企业名称
  taxPrice 含税单价
  unitPrice 未税单价
  uomId 单位id
  quantity 根据拆分维度分配的数量
  quotationLineId 报价行id
  quotationLineQuantity 报价行分配数量
  tabCode 查询tab页编码
  allocateCompanyQuantity 分配公司数量
*/

const TableDS = (options) => {
  const { selection = false, idName = '' } = options || {};

  return {
    primaryKey: idName || 'resultPoolId',
    autoQuery: false,
    selection,
    cacheSelection: true,
    fields: [
      {
        name: 'poolStatus',
        type: 'string',
        label: intl.get('ssrc.inquiryHall.view.status').d('状态'),
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.sourceNum`).d('寻源单号'),
        name: 'sourceNum',
      },
      {
        label: intl.get('ssrc.common.companyName').d('公司名称'),
        name: 'companyName',
        type: 'string',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.itemName`).d('物品描述'),
        name: 'itemName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        name: 'itemNum',
        type: 'string',
      },
      {
        label: intl.get('ssrc.common.supplierNum').d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get('ssrc.common.supplierName').d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl
          .get(`ssrc.bidEventQuery.model.supplierQuotation.taxIncludedPrice`)
          .d('单价(含税)'),
        name: 'taxPrice',
        align: 'right',
      },
      // {
      //   label: getNetPriceName(doubleUnitFlag),
      //   name: 'unitPrice',
      //   align: 'right',
      //   render: numberSeparatorRender,
      // },
      {
        label: intl.get('ssrc.common.view.expandCompanyQuantity').d('拓展公司数量'),
        // itemName 拓展公司数量
        name: 'allocateCompanyQuantity',
        type: 'number',
      },

      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        name: 'operate',
        type: 'string',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.priceSyncStatusMeaning`)
          .d('导入价格库状态'),
        name: 'priceSyncStatusMeaning',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.priceSyncFeedbackMeaning`)
          .d('导入失败原因'),
        name: 'priceSyncFeedback',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.importOutSystermStatusMeaning`)
          .d('导入外部系统状态'),
        name: 'importErpStatusMeaning',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.importOutSystermFeedback`)
          .d('导入外部系统反馈'),
        name: 'importErpFeedback',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.executiveStrategy`).d('寻源执行策略'),
        name: 'resultExecutionStrategy',
        type: 'string',
        lookupCode: 'SSRC.RESULT_EXECUTION_STRATEGY',
        dynamicProps: {
          disabled({ record }) {
            const strategyEditFlag = record.get('strategyEditFlag');

            const flag = strategyEditFlag === 0;
            return flag;
          },
        },
      },
      {
        label: intl
          .get(`${promptCode}.model.inquiryHall.amountUsageRecordQuery`)
          .d('金额占用记录查询'),
        name: 'amountUsageRecordQuery',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.syncStatus`).d('导入状态'),
        name: 'syncStatusMeaning',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.syncResponseMsg`).d('导入反馈'),
        name: 'syncResponseMsg',
      },
      {
        label: intl.get(`${promptCode}.model.inquiryHall.docFlow`).d('单据流'),
        name: 'docFlow',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.purOrganizationCode`).d('采购组织编码'),
        name: 'purOrganizationCode',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.purOrganizationName`).d('采购组织名称'),
        name: 'purOrganizationName',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.ouName`).d('业务实体'),
        name: 'ouName',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.invOrganizationName`).d('库存组织'),
        name: 'invOrganizationName',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.categoryName`).d('物品分类'),
        name: 'categoryName',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.itemCode`).d('物料编码'),
        name: 'itemCode',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.itemName`).d('物品描述'),
        name: 'itemName',
      },
      {
        // label: getUomName(doubleUnitFlag),
        name: 'uomName',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            return getUomName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.uomName`).d('单位'),
        name: 'secondaryUomName',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.companyNum`).d('供应商编码'),
        name: 'companyNum',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.erpSupplierCompanyNum`)
          .d('ERP供应商编码'),
        name: 'erpSupplierCompanyNum',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.supplierCompanyName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        // label: getPriceName(doubleUnitFlag),
        name: 'taxPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            return getPriceName(doubleUnitFlag);
          },
        },
      },
      {
        // label: getNetPriceName(doubleUnitFlag),
        name: 'unitPrice',
        dynamicProps: {
          label({ dataSet }) {
            const doubleUnitFlag = getDoubleFlag(dataSet);
            return getNetPriceName(doubleUnitFlag);
          },
        },
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.unitPrice`).d('单价'),
        name: 'taxSecondaryPrice',
        align: 'right',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.netPrice`).d('单价(不含税)'),
        name: 'netSecondaryPrice',
        align: 'right',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.quotationDetail`).d('报价明细'),
        name: 'quotationDetailFlag',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.ladderInquiry`).d('阶梯报价'),
        name: 'ladderInquiryFlag',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.taxCode`).d('税码'),
        name: 'taxCode',
      },
      {
        label: `${intl.get(`${promptCode}.model.resultsQuery.taxRate`).d('税率')}(%)`,
        name: 'taxRate',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.currencyCode`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.exchangeRate`).d('汇率'),
        name: 'rate',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.validQuotationRemark`).d('报价说明'),
        name: 'validQuotationRemark',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.quotationType`).d('报价方式'),
        name: 'quotationTypeMeaning',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.validPromisedDate`).d('承诺交货期'),
        name: 'validPromisedDate',
        type: 'date',
      },
      {
        label: intl.get('ssrc.common.deliveryCycleDay').d('供货周期(天)'),
        name: 'validDeliveryCycle',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.quotationExpiryDateFrom`)
          .d('报价有效期从'),
        name: 'quotationExpiryDateFrom',
        type: 'date',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.quotationExpiryDateTo`).d('报价有效期至'),
        name: 'quotationExpiryDateTo',
        type: 'date',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.priceBatchQuantity`).d('价格批量'),
        name: 'priceBatchQuantity',
        align: 'right',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.controlProtocolFlag`).d('控制协议数量'),
        name: 'controlProtocolFlag',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.purchasapplicationNum`).d('采购申请号'),
        name: 'prNum',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.purchasappitemNum`).d('采购申请行号'),
        name: 'prLineNum',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.executionStates`).d('执行状态'),
        name: 'receiptsStatusMeaning',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.occupationQuantit`).d('占用数量'),
        name: 'occupationQuantity',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.rfxCreated`).d('询价单创建人'),
        name: 'rfxCreated',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.creationTime`).d('创建时间'),
        name: 'creationDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.finishDate`).d('完成时间'),
        name: 'finishDate',
        type: 'dateTime',
      },
      {
        label: intl.get(`ssrc.common.model.common.model`).d('型号'),
        name: 'model',
      },
      {
        label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
        name: 'specs',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.sourceNum`).d('寻源单号'),
        name: 'sourceNum',
        fixed: 'right',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.budgetImportStatusMeaning`)
          .d('预算导入状态'),
        name: 'budgetImportStatusMeaning',
      },
      {
        label: intl.get(`${promptCode}.model.resultsQuery.budgetImportFeedback`).d('预算导入反馈'),
        name: 'budgetImportFeedback',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.synChronizationResultStatus`)
          .d('供货能力清单同步状态'),
        name: 'supplyImportStatusMeaning',
      },
      {
        label: intl
          .get(`${promptCode}.model.resultsQuery.synChronizationResults`)
          .d('供货能力清单同步结果'),
        name: 'supplyImportFeedback',
      },
    ],
    transport: {
      read: ({ data }) => {
        const { commons, searchBar = {}, ...dataOthers } = data || {};
        const { key = 'pending' } = commons || {};

        const organizationId = getCurrentOrganizationId();

        let url = `${PrefixV2}/${organizationId}/source/result-pool/list`;

        if (key === 'all') {
          url = `${Prefix}/${organizationId}/source/result/result-list`;
        }

        return {
          url,
          method: 'GET',
          data: {
            ...dataOthers,
            ...(searchBar || {}), // 筛选器数据
            ...(commons || {}),
          },
        };
      },
    },
  };
};

/**
 * resultPoolId 寻源结果池id
    allocateRule 结果池分配规则 SSRC_RESULT_POOL_ALLOCATE_RULE
    allocateRuleMeaning
    tenantId 租户ID
    companyId 采购方企业ID
    companyNum 采购方企业编码
    companyName 采购方企业名称
    quantity 根据拆分维度分配的数量
    quotationLineId 报价行id

*/

const allotHeadDataSet = () => {
  return {
    autoQuery: false,
    selection: false,
    cacheSelection: false,
    paging: false,
    fields: [
      {
        name: 'allocateRule',
        type: 'string',
        label: intl.get('ssrc.common.allocateRule').d('分配规则'),
        lookupCode: 'SSRC_RESULT_POOL_ALLOCATE_RULE',
        dynamicProps: {
          disabled({ record }) {
            const nonEditableFlag = record.get('nonEditableFlag');
            const flag = nonEditableFlag === 1 || nonEditableFlag === '1';
            return flag;
          },
        },
      },
    ],
  };
};

const allotDataSet = () => {
  // 平均分配
  const isEqualRule = (ds) => {
    const allotHeadDS = ds.getState('allotHeadDS');
    const allocateRule = allotHeadDS?.current?.get('allocateRule');

    const flag = allocateRule === 'EQUAL';
    return flag;
  };

  return {
    primaryKey: 'resultPoolId',
    autoQuery: false,
    selection: false,
    cacheSelection: false,
    paging: false,
    fields: [
      {
        name: 'companyNum',
        type: 'string',
        label: intl.get('ssrc.common.companyNum').d('公司编码'),
      },
      {
        label: intl.get('ssrc.common.companyName').d('公司名称'),
        name: 'companyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.allottedQuantity`).d('分配数量'),
        name: 'quantity',
        type: 'number',
        min: 0,
        dynamicProps: {
          disabled({ dataSet, record }) {
            const poolStatus = record.get('poolStatus');
            const flag =
              isEqualRule(dataSet) || poolStatus === 'APPROVING' || poolStatus === 'FINISHED';
            return flag;
          },
        },
      },
    ],
  };
};

export { TableDS, allotDataSet, allotHeadDataSet };
