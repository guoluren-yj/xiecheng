import intl from 'utils/intl';
import { isArray } from 'lodash';
import { getCurrentOrganizationId } from 'utils/utils';
import { omit } from 'lodash';
import { HZERO_PLATFORM } from 'utils/config';
// import { getDatas } from '@/utils/utils';
const organizationId = getCurrentOrganizationId();
const prefix = `ssta.invoiceRule`;
const commonPrompt = 'ssta.settleStrategy.model.settleStrategy';
// 头
const formInfoDs = (optionsDs) => ({
  selection: false,
  autoQuery: false,
  fields: [
    {
      name: 'ruleId',
      type: 'string',
      required: false,
    },
    {
      name: 'ruleStatus',
      type: 'string',
      required: false,
    },
    {
      name: 'scopeInvoiceType',
    },
    {
      name: 'ruleNum',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.ruleCode`).d('开票规则编码'),
      disabled: true,
    },
    {
      name: 'ruleName',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.ruleName`).d('开票规则名称'),
      required: true,
      validationGroup: 'base',
    },
    {
      name: 'ruleStatusMeaning',
      type: 'string',
      label: intl.get('hzero.common.status').d('状态'),
      disabled: true,
    },
    {
      name: 'displayStatus',
      type: 'string',
      lookupCode: 'SDIM.RULE_STATUS',
      label: intl.get(`hzero.common.status`).d('状态'),
      disabled: true,
    },
    {
      name: 'versionNumber',
      type: 'string',
      label: intl.get('ssta.settleStrategy.model.settleStrategy.versionNumber').d('版本号'),
    },
    {
      name: 'publishedByName',
      label: intl.get('hzero.common.entity.publisher').d('发布人'),
      type: 'string',
      transformResponse: (_, object) => {
        const { publishedByName, publishedLoginName } = object;
        return publishedLoginName ? `${publishedByName}(${publishedLoginName})` : publishedByName;
      },
      dynamicProps: {
        hidden: ({ record }) => record.get('ruleStatus') !== 'PUBLISH',
      },
    },
    {
      name: 'publishedDate',
      label: intl.get('hzero.common.date.releaseTime').d('发布时间'),
      type: 'dateTime',
    },
    {
      name: 'scopeInvoiceType',
      type: 'string',
      options: optionsDs,
      // lookupCode: 'SDIM.INVOICE_TYPE',
      label: intl.get('ssta.invoiceRule.model.invoiceRule.useTicket').d('适用票种'),
      multiple: true,
      transformRequest: (value) => (isArray(value) ? value.join() : value),
      transformResponse: (value) => (value ? value.split(',') : null),
      required: true,
      validationGroup: 'base',
    },
    {
      name: 'defaultInvoiceType',
      type: 'string',
      // lookupCode: 'SDIM.INVOICE_TYPE',
      options: optionsDs,
      label: intl.get('ssta.invoiceRule.model.invoiceRule.defaultTicket').d('默认票种'),
    },
    {
      name: 'previewFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
      label: intl.get('ssta.invoiceRule.model.invoiceRule.previewFlag').d('预览确认申请'),
    },
    {
      name: 'mergeCommodityDetailFlag',
      type: 'string',
      lookupCode: 'SDIM.RULE_MERGE_FLAG',
      label: intl
        .get(`ssta.invoiceRule.modal.invoiceRule.toBeInvedLineMergeRule`)
        .d('待开票行合并规则'),
    },
    {
      name: 'defaultRateType',
      type: 'string',
      lookupCode: 'SDIM.RATE_TYPE',
      label: intl.get('ssta.invoiceRule.model.invoiceRule.defaultRate').d('默认税率'),
      defaultValue: 'PENDING_INVOICING_LINE_RATE',
      required: true,
    },
    {
      name: 'defaultPayee',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.defaultReceiver`).d('默认收款人'),
    },
    {
      name: 'defaultReviewer',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.defaultReview`).d('默认复核'),
    },
    {
      name: 'defaultInvoiceBy',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.defaultDrawer`).d('默认开票人'),
    },
    {
      name: 'defaultReceiver',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.defaultInvoiceReceiver`).d('默认受票人'),
    },
    {
      name: 'defaultRecipientPhone',
      type: 'string',
      label: intl
        .get(`${prefix}.model.invoiceRule.defaultInvoiceReceiverPhone`)
        .d('默认受票人电话'),
    },
    {
      name: 'defaultRecipientEmail',
      type: 'email',
      label: intl
        .get(`${prefix}.model.invoiceRule.defaultInvoiceReceiverEmail`)
        .d('默认受票人邮箱'),
    },
    {
      name: 'defaultRecipientAddress',
      type: 'string',
      label: intl
        .get(`${prefix}.model.invoiceRule.defaultInvoiceReceiverAddress`)
        .d('默认受票人地址'),
    },
    {
      name: 'pushEmailFlag',
      type: 'boolean',
      label: intl
        .get(`ssta.invoiceRule.model.invoiceRule.pushEmailFlag`)
        .d('将电票版式文件推送至受票人邮箱'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'pushPhoneFlag',
      type: 'boolean',
      label: intl
        .get(`ssta.invoiceRule.model.invoiceRule.pushPhoneFlag`)
        .d('将电票版式文件推送至受票人手机短信'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'defaultRemark',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.remark`).d('默认备注'),
    },
    {
      name: 'defaultCommodityIdLov',
      type: 'object',
      lovCode: 'SDIM.COMMODITY_LOV',
      label: intl.get(`${prefix}.model.invoiceRule.defaultCommodityId`).d('缺省商品'),
      lovPara: { tenantId: getCurrentOrganizationId() },
    },
    {
      name: 'defaultCommodityId',
      bind: 'defaultCommodityIdLov.commodityId',
    },
    {
      name: 'defaultCommodityName',
      bind: 'defaultCommodityIdLov.commodityName',
    },
    // 备注合并
    {
      name: 'mergeDimension',
      type: 'string',
      lookupCode: 'SDIM.RULE_MERGE_DIMENSION',
      label: intl
        .get(`ssta.invoiceRule.modal.invoiceRule.customMergeDimension`)
        .d('自定义合并维度'),
      multiple: ',',
    },
    {
      name: 'mergeRemarkFlag',
      type: 'boolean',
      // lookupCode: 'SDIM.RULE_ENABLED_FLAG',
      label: intl.get(`${prefix}.model.invoiceRule.remarkConcat`).d('备注合并'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 0,
    },
    {
      name: 'mergeRemarkCombo',
      type: 'string',
      lookupCode: 'SDIM.RULE_SYMBOL',
      // required: ({ record }) => record.get('mergeRemarkFlag') === 1,
      label: intl.get(`${prefix}.model.invoiceRule.separator`).d('备注合并分隔符'),
    },

    {
      name: 'invoiceSpecialMark',
      type: 'string',
      label: intl.get(`${prefix}.model.rule.invoiceSpecialMark`).d('特殊票种标志'),
      lookupCode: 'SDIM.INVOICE_SPECIAL_MARK',
    },
    {
      name: 'defaultCommodityType',
      type: 'string',
      label: intl
        .get(`${prefix}.model.rule.itemNameOrGoods`)
        .d('项目名称/货物或应税劳务，服务名称'),
      lookupCode: 'SDIM.COMMODITY_TYPE',
    },

    {
      name: 'paperInvoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.rule.paperInvoiceType`).d('纸质发票类型'),
      lookupCode: 'SDIM.PAPER_INVOICE_TYPE',
    },
    {
      name: 'pushPriceFlag',
      type: 'string',
      label: intl.get(`${prefix}.model.rule.unitPriceRelease`).d('是否传出单价'),
      lookupCode: 'HPFM.FLAG',
      defaultValue: 1,
      help: intl
        .get(`${prefix}.model.rule.pushPriceFlagTips`)
        .d(
          '1、服务类采购，在无法量化数量和单价的场景下，可选择不传数量以及单价，票面上仅开具不含税金额、税额、含税金额2、特定业务场景下，由于单价精度问题，无法开具目标数额的税票，也可选择不传出单价，只传出金额、数量，由税局自行计算出票面展示单价'
        ),
    },
    {
      name: 'taxIncludedPriceFlag',
      type: 'string',
      label: intl.get(`${prefix}.model.rule.invoiceUnitPriceTaxFlag`).d('开票单价含税标志'),
      lookupCode: 'SDIM.TAX_INCLUDED_PRICE_FLAG',
      help: intl
        .get(`${prefix}.model.rule.invoiceUnitPriceTaxFlagTips`)
        .d('该配置影响功能端调用第三方开票服务商接口，开具税票时单价的传值为含税单价或不含税单价'),
    },
    {
      name: 'invoiceListMark',
      type: 'string',
      label: intl.get(`${prefix}.model.rule.inventoryFlag`).d('清单标志'),
      lookupCode: 'SDIM.INVOICE_LIST_MARK',
      help: intl
        .get(`${prefix}.model.rule.invoiceListMarkTips`)
        .d('数电票（电子形式）无需开具销货清单​​。'),
    },
  ],
  transport: {
    read: ({ data, params }) => {
      const { ruleId, operate } = data;
      return {
        url:
          operate === 'edit'
            ? `/ssta/v1/${organizationId}/direct-invoice-rules/create/${ruleId}`
            : `/ssta/v1/${organizationId}/direct-invoice-rules/detail/${ruleId}`, // operate === 'view'
        method: operate === 'edit' ? 'PUT' : 'GET',
        data: { ruleId },
        params,
      };
    },
  },
});

const limitDs = (optionsDs) => ({
  paging: false,
  autoQuery: false,
  validationGroup: 'split',
  // selection: false,
  fields: [
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.invoiceType`).d('票种'),
      // lookupCode: 'SDIM.INVOICE_TYPE',
      options: optionsDs,
      required: true,
    },
    {
      name: 'ruleData',
      type: 'number',
      label: intl.get(`${prefix}.model.invoiceRule.limtAmount`).d('单张限额'),
      required: true,
    },
    {
      name: 'ruleType',
      type: 'string',
    },
    {
      name: 'status',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/direct-rule-lines`,
      method: 'GET',
    }),
    create: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'DELETE',
      };
    },
  },
});

const productDs = (optionsDs) => ({
  paging: false,
  autoQuery: false,
  validationGroup: 'split',
  // selection: false,
  selection: 'multiple',
  fields: [
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.invoiceType`).d('票种'),
      // lookupCode: 'SDIM.INVOICE_TYPE',
      options: optionsDs,
      required: true,
    },
    {
      name: 'commodityLov',
      type: 'object',
      lovCode: 'SDIM.COMMODITY_LOV',
      label: intl.get(`${prefix}.model.invoiceRule.productInfo`).d('商品信息'),
      textField: 'commodityName',
      required: true,
      lovPara: { tenantId: organizationId },
      multiple: true,
      noCache: true,
    },
    {
      name: 'commodityName',
      type: 'string',
      bind: 'commodityLov.commodityName',
      transformResponse: (value, record) => {
        const { commodityIdListMeaning = '' } = record;
        return commodityIdListMeaning;
      },
      multiple: ',',
    },
    {
      name: 'ruleData',
      type: 'string',
      bind: 'commodityLov.commodityId',
      transformRequest: (value) => (isArray(value) ? value.join() : value),
      multiple: ',',
    },
    {
      name: 'commodityId',
      type: 'string',
      bind: 'commodityLov.commodityId',
      transformResponse: (value, record) => {
        const { ruleData = '' } = record;
        return ruleData;
      },
      multiple: ',',
    },
    {
      name: 'ruleType',
      type: 'string',
    },
    {
      name: 'status',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/direct-rule-lines`,
      method: 'GET',
    }),
    create: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'DELETE',
      };
    },
  },
});

const taxDs = (optionsDs) => ({
  paging: false,
  autoQuery: false,
  // selection: false,
  validationGroup: 'split',
  fields: [
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.invoiceType`).d('票种'),
      // lookupCode: 'SDIM.INVOICE_TYPE',
      options: optionsDs,
      required: true,
    },
    {
      name: 'ruleData',
      label: intl.get(`hzero.common.status`).d('状态'),
      type: 'string',
      defaultValue: '1',
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/direct-rule-lines`,
      method: 'GET',
    }),
    create: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'DELETE',
      };
    },
  },
});
const diffTaxCommodityDs = (optionsDs) => ({
  paging: false,
  autoQuery: false,
  // selection: false,
  validationGroup: 'split',
  fields: [
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.invoiceType`).d('票种'),
      // lookupCode: 'SDIM.INVOICE_TYPE',
      options: optionsDs,
      required: true,
    },
    {
      name: 'ruleData',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
      defaultValue: '1',
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/direct-rule-lines`,
      method: 'GET',
    }),
    create: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'DELETE',
      };
    },
  },
});

const excessLineDs = (optionsDs) => ({
  paging: false,
  autoQuery: false,
  validationGroup: 'split',
  // selection: false,
  fields: [
    {
      name: 'invoiceType',
      type: 'string',
      label: intl.get(`${prefix}.model.invoiceRule.invoiceType`).d('票种'),
      // lookupCode: 'SDIM.INVOICE_TYPE',
      options: optionsDs,
      required: true,
    },
    {
      name: 'ruleData',
      type: 'number',
      label: intl.get(`${commonPrompt}.limitQuantity`).d('行数'),
      required: true,
      max: 2000,
      validator: (value) => {
        if (value <= 0 || !Number.isInteger(value)) {
          return intl
            .get(`${commonPrompt}.quantityNeedIntegerAndExceedZero`)
            .d('行数需维护大于零的整数');
        }
        return true;
      },
    },
    {
      name: 'status',
      label: intl.get('hzero.common.status').d('状态'),
      type: 'string',
    },
  ],
  transport: {
    read: () => ({
      url: `/ssta/v1/${organizationId}/direct-rule-lines`,
      method: 'GET',
    }),
    create: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    update: ({ data, dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'POST',
        data,
      };
    },
    destroy: ({ dataSet }) => {
      const { ruleId } = dataSet.queryParameter;
      return {
        url: `/ssta/v1/${organizationId}/direct-rule-lines/${ruleId}`,
        method: 'DELETE',
      };
    },
  },
});

const recordDs = () => ({
  autoQuery: false,
  fields: [],
  transport: {
    /**
     * 查询
     */
    read: () => {
      return {
        url: `/ssta/v1/${organizationId}/direct-invoice-rules/history/page`,
        method: 'GET',
      };
    },
  },
});

const lovOptionDS = (props = {}) => {
  const { paging } = props;
  const queryParameter = omit(props, 'paging') || {};
  return {
    paging,
    queryParameter,
    autoQuery: true,
    selection: 'single',
    transport: {
      read() {
        return {
          url: `${HZERO_PLATFORM}/v1/${organizationId}/lovs/data`,
          method: 'get',
          transformResponse: (res) => {
            try {
              const data = JSON.parse(res);
              return [
                {
                  meaning: intl
                    .get(`ssta.invoiceRule.model.invoiceRule.allInvoiceType`)
                    .d('不区分票种'),
                  value: 'ALL',
                  orderSeq: 4,
                },
                ...data,
              ];
            } catch {
              return {};
            }
          },
        };
      },
    },
  };
};

export {
  formInfoDs,
  limitDs,
  productDs,
  recordDs,
  taxDs,
  diffTaxCommodityDs,
  excessLineDs,
  lovOptionDS,
};
