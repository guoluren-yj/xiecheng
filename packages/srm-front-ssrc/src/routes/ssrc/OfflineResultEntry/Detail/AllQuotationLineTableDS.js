import moment from 'moment';
// import { math } from 'choerodon-ui/dataset';
import { isString } from 'lodash';

import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { Prefix, BID, getQuotationName } from '@/utils/globalVariable';
import {
  getPriceName,
  getNetPriceName,
  getQtyName,
  getUomName,
  getAvailableQtyName,
} from '@/utils/utils';

import { PRIVATE_BUCKET } from '_utils/config';

import { ChunkUploadProps } from '@/utils/SsrcRegx';

// import { calculationRender } from '@/utils/renderer';

const organizationId = getCurrentOrganizationId();
const promptCode = 'ssrc.offlineResultEntry';

const allQuotationDS = (configs = {}) => ({
  autoQuery: false,
  primaryKey: 'quotationLineId',
  modifiedCheck: false,
  cacheSelection: true,
  cacheModified: true,
  queryFields: [
    {
      name: 'itemNameLov',
      lovCode: 'SSRC.OFF_LINE_ITEM',
      type: 'object',
      label: intl.get(`${promptCode}.model.offlineEntry.itemName`).d('物品描述'),
      lovPara: {
        tenantId: organizationId,
        rfxHeaderId: configs.rfxHeaderId,
      },
      ignore: 'always',
    },
    {
      name: 'itemName',
      bind: 'itemNameLov.itemName',
    },
    {
      name: 'supplierLov',
      type: 'object',
      lovCode: 'SSLM.SUPPLIER', // 固定值, 不可更改
      label: intl.get(`${promptCode}.model.offlineEntry.supplierName`).d('供应商名称'),
    },
    {
      name: 'supplierId', // 外部供应商, 使用新的lov带值
      bind: 'supplierLov.supplierId',
    },
    {
      name: 'supplierName',
      bind: 'supplierLov.supplierName',
    },
    {
      name: 'supplierCompanyLov',
      type: 'object',
      lovCode: 'SSRC.OFF_LINE_SPUULIER',
      label: intl.get(`${promptCode}.model.offlineEntry.supplierName`).d('供应商名称'),
      lovPara: {
        tenantId: organizationId,
        rfxHeaderId: configs.rfxHeaderId,
      },
      ignore: 'always',
    },
    {
      name: 'supplierCompanyName',
      bind: 'supplierCompanyLov.supplierCompanyName',
    },
  ],
  fields: [
    {
      name: 'rfxLineItemNumLov',
      type: 'object',
      lovCode: 'SSRC.RFX_QUOTATION.ITEMS',
      required: true,
      label: intl.get(`ssrc.offlineResultEntry.model.offlineEntry.lineNo.`).d('行号'),
      valueField: 'rfxLineItemId',
      textField: 'rfxLineItemNum',
      ignore: 'always',
      lovQueryAxiosConfig: () => {
        const { rfxHeaderId = null } = configs;
        return {
          url: `${Prefix}/${organizationId}/rfx/${rfxHeaderId}/items`,
          method: 'GET',
          params: { organizationId },
        };
      },
      dynamicProps: {
        disabled({ record }) {
          return (
            record.get('quotationLineStatus') === 'SUBMITTED' || record.get('eliminateRoundNumber')
          );
        },
      },
    },
    {
      name: 'rfxLineItemNum',
      type: 'string',
      bind: 'rfxLineItemNumLov.rfxLineItemNum',
    },
    {
      name: 'suggestedFlag',
      type: 'number',
      suggestedFlag: 0,
    },
    {
      name: 'quotationDetailFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'rfxLineItemId',
      type: 'string',
      bind: 'rfxLineItemNumLov.rfxLineItemId',
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get(`ssrc.offlineResultEntry.model.offlineEntry.itemCode`).d('物料编码'),
      disabled: true,
    },
    {
      name: 'itemCategoryName',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.itemCategory`).d('物品分类'),
      disabled: true,
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.itemName`).d('物品描述'),
      disabled: true,
    },
    {
      name: 'rfxHeaderId',
      type: 'string',
    },
    {
      name: 'secondaryUomName',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.unit`).d('单位'),
      disabled: true,
    },
    {
      name: 'uomName',
      type: 'string',
      disabled: true,
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getUomName(doubleUnitFlag);
        },
      },
    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.businessUnit`).d('业务实体'),
      disabled: true,
    },
    {
      name: 'ouId',
      type: 'string',
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.inventoryOrg`).d('库存组织'),
      disabled: true,
    },
    {
      name: 'invOrganizationId',
      type: 'string',
    },
    {
      name: 'supplierCompanyNumLov',
      type: 'object',
      label: intl.get(`${promptCode}.model.offlineEntry.supplierCode`).d('供应商编码'),
      lovCode: 'SSRC.SUPPLIER',
      ignore: 'always',
      valueField: 'businesskey',
      textField: 'supplierCompanyNum',
      dynamicProps: {
        lovPara({ record, dataSet }) {
          const { companyId, templateId, sourceHeaderId, userId } =
            dataSet.queryParameter.rfxHeader || {};
          return {
            organizationId,
            userId,
            companyId,
            templateId,
            sourceHeaderId,
            itemId: record.get('itemId'),
            sourceFrom: 'RFX',
            offlineFlag: 1, // HACK 区分是寻源维护还是线下寻源结果录入维护供应商信息, 固定值
          };
        },
        disabled({ record }) {
          return record.get('quotationLineId');
        },
      },
    },
    {
      name: 'supplierCompanyNum',
      type: 'string',
      bind: 'supplierCompanyNumLov.supplierCompanyNum',
    },
    {
      name: 'supplierCompanyId',
      type: 'string',
      bind: 'supplierCompanyNumLov.supplierCompanyId',
    },
    {
      name: 'supplierCompanyName', // 配置表配置了使用新供应商lov,这里渲染新的lov组件SupplierLov, 使用新的赋值逻辑处理
      type: 'object',
      lovCode: 'SSRC.SUPPLIER',
      label: intl.get(`${promptCode}.model.offlineEntry.supplierName`).d('供应商名称'),
      maxLength: 360,
      textField: 'supplierCompanyName',
      transformRequest: (val) => val?.supplierCompanyName,
      dynamicProps: {
        lovPara({ record, dataSet }) {
          const { companyId, templateId, sourceHeaderId, userId } =
            dataSet.queryParameter.rfxHeader || {};
          return {
            organizationId,
            userId,
            companyId,
            templateId,
            sourceHeaderId,
            itemId: record.get('itemId'),
            sourceFrom: 'RFX',
            offlineFlag: 1, // HACK 区分是寻源维护还是线下寻源结果录入维护供应商信息, 固定值
          };
        },
        required({ record }) {
          return !record.get('supplierCompanyNum') && !record.get('eliminateRoundNumber');
        },
        disabled({ record }) {
          return record.get('supplierCompanyNum') || record.get('eliminateRoundNumber');
        },
      },
    },
    {
      name: 'contactName',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.contacts`).d('联系人'),
      maxLength: 360,
      dynamicProps: {
        required({ record }) {
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            eliminateRoundNumber = null,
          } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
          const result =
            (supplierType === 'external' || (supplierType !== 'external' && !supplierCompanyNum)) &&
            !eliminateRoundNumber;
          return result;
        },
        disabled({ record }) {
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            eliminateRoundNumber = null,
          } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
          const result =
            (supplierCompanyNum && supplierType !== 'external') || eliminateRoundNumber;
          return result;
        },
      },
    },
    {
      name: 'internationalTelCode',
      type: 'string',
      lookupCode: 'HPFM.IDD',
      defaultValue: '+86',
      dynamicProps: {
        required({ record }) {
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            eliminateRoundNumber = null,
          } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
          const result =
            (supplierType === 'external' || (supplierType !== 'external' && !supplierCompanyNum)) &&
            !eliminateRoundNumber;
          return result;
        },
        // disabled({ record }) {
        //   const {
        //     supplierType = 'internal',
        //     supplierCompanyNum = null,
        //     eliminateRoundNumber = null,
        //   } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
        //   const result =
        //     (supplierCompanyNum && supplierType !== 'external') || eliminateRoundNumber;
        //   return result;
        // },
      },
    },
    {
      name: 'contactMobilephoneContainer',
      type: 'string',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.contactMobilePhone`).d('联系方式'),
    },
    {
      name: 'contactMobilephone',
      type: 'string',
      label: intl.get(`${promptCode}.model.offlineEntry.tel`).d('联系电话'),
      dynamicProps: {
        required({ record }) {
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            eliminateRoundNumber = null,
          } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
          const result =
            (supplierType === 'external' || (supplierType !== 'external' && !supplierCompanyNum)) &&
            !eliminateRoundNumber;
          return result;
        },
        // disabled({ record }) {
        //   const {
        //     supplierType = 'internal',
        //     supplierCompanyNum = null,
        //     eliminateRoundNumber = null,
        //   } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
        //   const result =
        //     (supplierCompanyNum && supplierType !== 'external') || eliminateRoundNumber;
        //   return result;
        // },
        pattern({ record }) {
          const patternFlag =
            (record.get('internationalTelCode') || '+86') === '+86' ? PHONE : NOT_CHINA_PHONE;
          return patternFlag;
        },
      },
    },
    {
      name: 'contactMail',
      label: intl.get(`${promptCode}.model.offlineEntry.email`).d('电子邮件'),
      maxLength: 100,
      validator: (value, _, record) => {
        if (value && !EMAIL.test(record.get('contactMail'))) {
          return intl.get('hzero.common.validation.email').d('邮箱格式不正确');
        }
        return true;
      },
      dynamicProps: {
        required({ record }) {
          const {
            supplierType = 'internal',
            supplierCompanyNum = null,
            eliminateRoundNumber = null,
          } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
          const result =
            (supplierType === 'external' || (supplierType !== 'external' && !supplierCompanyNum)) &&
            !eliminateRoundNumber;
          return result;
        },
        // disabled({ record }) {
        //   const {
        //     supplierType = 'internal',
        //     supplierCompanyNum = null,
        //     eliminateRoundNumber = null,
        //   } = record.get(['supplierType', 'supplierCompanyNum', 'eliminateRoundNumber']);
        //   const result =
        //     (supplierCompanyNum && supplierType !== 'external') || eliminateRoundNumber;
        //   return result;
        // },
      },
    },
    {
      name: 'lastBidPrice',
      type: 'string',
    },
    {
      name: 'quotationLineStatusMeaning',
      type: 'string',
      label: intl
        .get(`${promptCode}.model.offlineEntry.commonQuotationStatus`, {
          quotationName: getQuotationName(configs.sourceKey === BID),
        })
        .d('{quotationName}状态'),
      readOnly: true,
    },
    {
      name: 'currentQuotationSecPrice',
      type: 'number',
      label: intl.get(`${promptCode}.model.offlineEntry.unitPrice`).d('单价'),
      dynamicProps: {
        required({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            doubleUnitFlag &&
            configTaxIncludeFlag &&
            !record.get('eliminateRoundNumber') &&
            (ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1))
          ); // 已淘汰的单据不可编辑
        },
        disabled({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            !configTaxIncludeFlag ||
            record.get('eliminateRoundNumber') ||
            (ladderInquiryFlag === 1 && ladderQuotationFlag === 1)
          );
        },
      },
      min: '0',
      max: '99999999999999999999',
    },
    {
      name: 'currentQuotationPrice',
      type: 'number',
      min: '0',
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getPriceName(doubleUnitFlag);
        },
        required({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            !doubleUnitFlag &&
            configTaxIncludeFlag &&
            !record.get('eliminateRoundNumber') &&
            (ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1))
          ); // 已淘汰的单据不可编辑
        },
        disabled({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            doubleUnitFlag ||
            !configTaxIncludeFlag ||
            record.get('eliminateRoundNumber') ||
            (ladderInquiryFlag === 1 && ladderQuotationFlag === 1)
          );
        },
      },
    },
    {
      name: 'quotationCurrencyCodeLov',
      type: 'object',
      ignore: 'always',
      textField: 'currencyCode',
      valueField: 'currencyCode',
      lovCode: 'SMDM.EXCHANGE_RATE.CURRENCY',
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationCurrencyType`).d('币种'),
      dynamicProps: {
        required({ dataSet }) {
          const { multiCurrencyFlag = 0 } = dataSet.queryParameter.rfxHeader || {};
          return multiCurrencyFlag;
        },
      },
    },
    {
      name: 'quotationCurrencyCode',
      type: 'string',
      bind: 'quotationCurrencyCodeLov.currencyCode',
    },
    {
      name: 'netSecondaryPrice',
      type: 'number',
      label: intl.get(`${promptCode}.model.offlineEntry.netPrice`).d('单价(不含税)'),
      dynamicProps: {
        required({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            doubleUnitFlag &&
            !configTaxIncludeFlag &&
            !record.get('eliminateRoundNumber') &&
            (ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1))
          ); // 已淘汰的单据不可编辑
        },
        disabled({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            configTaxIncludeFlag ||
            record.get('eliminateRoundNumber') ||
            (ladderInquiryFlag === 1 && ladderQuotationFlag === 1)
          );
        },
      },
      min: '0',
      max: '99999999999999999999',
    },
    {
      name: 'netPrice',
      type: 'number',
      min: '0',
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getNetPriceName(doubleUnitFlag);
        },
        required({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            !doubleUnitFlag &&
            !configTaxIncludeFlag &&
            !record.get('eliminateRoundNumber') &&
            (ladderInquiryFlag !== 1 || (ladderInquiryFlag === 1 && ladderQuotationFlag !== 1))
          ); // 已淘汰的单据不可编辑
        },
        disabled({ record, dataSet }) {
          const { ladderQuotationFlag, ladderInquiryFlag } = record.get([
            'ladderQuotationFlag', // 当前价格是否在阶梯报价区间内
            'ladderInquiryFlag',
          ]);
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { configTaxIncludeFlag = false } = dataSet.queryParameter.tableProps || {};
          return (
            doubleUnitFlag ||
            configTaxIncludeFlag ||
            record.get('eliminateRoundNumber') ||
            (ladderInquiryFlag === 1 && ladderQuotationFlag === 1)
          );
        },
      },
    },
    {
      name: 'specs',
      type: 'string',
      label: intl.get(`ssrc.common.model.common.specs`).d('规格'),
      disabled: true,
    },
    {
      name: 'model',
      type: 'string',
      label: intl.get('ssrc.common.specification').d('型号'),
      disabled: true,
    },
    {
      name: 'priceBatchQuantity',
      type: 'number',
      label: intl.get('ssrc.inquiryHall.model.inquiryHall.priceBatch').d('价格批量'),
      max: '99999999999999999999',
      readOnly: true,
    },
    {
      name: 'priceDetail',
      type: 'string',
      label: intl.get(`ssrc.supplierQuotation.model.supQuo.quotationDetails`).d('报价明细'),
    },
    {
      name: 'ladderInquiryFlag',
      type: 'boolean',
      label: intl.get(`${promptCode}.model.offlineEntry.ladderLevel`).d('阶梯报价'),
      trueValue: 1,
      falseValue: 0,
    },
    {
      name: 'ladderOffer',
      type: 'string',
      label: intl.get(`${promptCode}.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.taxInclude`).d('是否含税'),
      name: 'taxIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
      dynamicProps: {
        disabled({ record, dataSet }) {
          const { taxChangeFlag = false, systemVersion } = dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
            return record.get('eliminateRoundNumber');
          }
          return !taxChangeFlag || record.get('eliminateRoundNumber');
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.taxRate`).d('税率（%）'),
      name: 'taxLov',
      type: 'object',
      ignore: 'always',
      valueField: 'taxId',
      textField: 'taxRate',
      lovCode: 'SMDM.TAX',
      dynamicProps: {
        disabled({ record, dataSet }) {
          const { taxChangeFlag = false, systemVersion } = dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
            return !record.get('taxIncludedFlag') || record.get('eliminateRoundNumber');
          }
          return (
            !record.get('taxIncludedFlag') || !taxChangeFlag || record.get('eliminateRoundNumber')
          );
        },
        required({ record, dataSet }) {
          const { taxChangeFlag = false, systemVersion } = dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消taxChangeFlag控制
            return record.get('taxIncludedFlag') && !record.get('eliminateRoundNumber');
          }
          return (
            record.get('taxIncludedFlag') && taxChangeFlag && !record.get('eliminateRoundNumber')
          );
        },
      },
    },
    {
      name: 'taxId',
      bind: 'taxLov.taxId',
    },
    {
      name: 'taxRate',
      bind: 'taxLov.taxRate',
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.quantity`).d('需求数量'),
      name: 'secondaryQuantity',
      type: 'number',
      disabled: true,
      min: 0,
      max: '99999999999999999999',
      // step: 0.000001,
    },
    {
      name: 'rfxQuantity',
      type: 'number',
      disabled: true,
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getQtyName(doubleUnitFlag);
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.availableQuantity`).d('可供数量'),
      name: 'currentQuotationSecQuantity',
      type: 'number',
      dynamicProps: {
        // disabled({ record, dataSet, }) {
        //   const { quantityChangeFlag = false } = dataSet.queryParameter.rfxHeader || {};
        //   return !quantityChangeFlag || record.get('eliminateRoundNumber');
        // },
        required({ record, dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { quantityChangeFlag = false, systemVersion } =
            dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消quantityChangeFlag控制
            return doubleUnitFlag && !record.get('eliminateRoundNumber');
          }
          return doubleUnitFlag && quantityChangeFlag && !record.get('eliminateRoundNumber');
        },
      },
      min: 0,
      max: '99999999999999999999',
      // step: 0.000001,
    },
    {
      name: 'currentQuotationQuantity',
      type: 'number',
      min: 0,
      max: '99999999999999999999',
      dynamicProps: {
        label({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return getAvailableQtyName(doubleUnitFlag);
        },
        required({ record, dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          const { quantityChangeFlag = false, systemVersion } =
            dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消quantityChangeFlag控制
            return !doubleUnitFlag && !record.get('eliminateRoundNumber');
          }
          return !doubleUnitFlag && quantityChangeFlag && !record.get('eliminateRoundNumber');
        },
        disabled({ dataSet }) {
          const doubleUnitFlag = dataSet.getState('doubleUnitFlag');
          return doubleUnitFlag;
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.quotationTime`).d('报价时间'),
      name: 'quotedDate',
      type: 'dateTime',
      disabled: true,
    },
    {
      label: intl
        .get(`${promptCode}.model.offlineEntry.commonQuotationDesc`, {
          quotationName: getQuotationName(configs.sourceKey === BID),
        })
        .d('{quotationName}说明'),
      name: 'currentQuotationRemark',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.paymentTypeId`).d('付款方式'),
      name: 'paymentTypeLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.PAYMENTTYPE',
      lovPara: {
        paymentTypeId: 'paymentTypeId',
        tenantId: organizationId,
      },
    },
    {
      name: 'paymentTypeName',
      bind: 'paymentTypeLov.typeName',
      type: 'string',
    },
    {
      name: 'paymentTypeId',
      bind: 'paymentTypeLov.typeId',
      type: 'string',
    },
    {
      label: intl.get(`ssrc.bidHall.model.bidHall.paymentTerm`).d('付款条款'),
      name: 'paymentTermLov',
      type: 'object',
      ignore: 'always',
      lovCode: 'SMDM.PAYMENT.TERM',
    },
    {
      name: 'paymentTermId',
      bind: 'paymentTermLov.termId',
      type: 'string',
    },
    {
      name: 'paymentTermName',
      bind: 'paymentTermLov.termName',
      type: 'string',
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.miniMumPrice`).d('最低限价'),
      name: 'minLimitPrice',
      type: 'number',
      disabled: true,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.maxiMumPrice`).d('最高限价'),
      name: 'maxLimitPrice',
      type: 'number',
      disabled: true,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.costPrice`).d('成本单价'),
      name: 'costPrice',
      type: 'number',
      disabled: true,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.promDelDate`).d('承诺交货期'),
      name: 'currentPromisedDate',
      type: 'date',
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.deliveryPeriod`).d('供货周期'),
      name: 'currentDeliveryCycle',
      type: 'number',
      min: 0,
      step: 1,
    },
    {
      label: intl.get('ssrc.common.productionPlace').d('产地'),
      name: 'origin',
      type: 'string',
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.qVFrom`).d('报价有效期从'),
      name: 'currentExpiryDateFrom',
      type: 'date',
      // format: getDateFormat(),
      defaultValue: null,
      max: 'currentExpiryDateTo',
      dynamicProps: {
        disabled({ record, dataSet }) {
          const { validDateInputType = null, systemVersion } =
            dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
            return record.get('eliminateRoundNumber');
          }
          return validDateInputType === 'READONLY' || record.get('eliminateRoundNumber');
        },
        required({ record, dataSet }) {
          const { validDateInputType = null, systemVersion } =
            dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
            return false;
          }
          return validDateInputType === 'REQUIRED' && !record.get('eliminateRoundNumber');
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.qVTo`).d('报价有效期至'),
      name: 'currentExpiryDateTo',
      type: 'date',
      // format: getDateFormat(),
      min: 'currentExpiryDateFrom',
      dynamicProps: {
        disabled({ record, dataSet }) {
          const { validDateInputType = null, systemVersion } =
            dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
            return record.get('eliminateRoundNumber');
          }
          return validDateInputType === 'READONLY' || record.get('eliminateRoundNumber');
        },
        required({ record, dataSet }) {
          const { validDateInputType = null, systemVersion } =
            dataSet.queryParameter.rfxHeader || {};
          if (Number(systemVersion) === 2) {
            // systemVersion代表此单子走的新模板 新模板取消validDateInputType控制
            return false;
          }
          return validDateInputType === 'REQUIRED' && !record.get('eliminateRoundNumber');
        },
      },
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.minPurchaseAmount`).d('最小采购量'),
      name: 'minPurchaseQuantity',
      type: 'number',
      min: 0,
      // step: 0.01,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.minPackageAmount`).d('最小包装量'),
      name: 'minPackageQuantity',
      type: 'number',
      min: 0,
      // step: 0.01,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.includingFreight`).d('是否含运费'),
      name: 'freightIncludedFlag',
      type: 'boolean',
      trueValue: 1,
      falseValue: 0,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.prNum`).d('采购申请号'),
      name: 'prNum',
      type: 'string',
      // disabled: true,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.requisitionLineNo`).d('采购申请行号'),
      name: 'prLineNum',
      type: 'number',
      disabled: true,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.remark`).d('备注'),
      name: 'lineItemRemark',
      type: 'string',
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.supAttachment`).d('供应商附件'),
      name: 'currentAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'ssrc-rfx-quotationline',
      ...(ChunkUploadProps || {}),
    },
    {
      name: 'objectVersionNumber',
      type: 'string',
    },
    {
      name: 'quotationCurrencyDefaultPrecision',
      type: 'number',
      defaultValue: 6,
    },
    { name: 'supplierId', defaultValue: null },
    { name: 'supplierType' },
    {
      name: 'supplierName', // 外部供应商, 使用新的lov带值
    },
    {
      name: 'supplierNum', // 外部供应商, 使用新的lov带值
    },
    {
      name: 'supplierTenantId',
      defaultValue: null,
    },
    { name: 'supplierContactId', defaultValue: null },
    {
      name: 'taxRateType',
    }
  ],
  events: {
    load: ({ dataSet }) => {
      const { length: dataLenght = 0 } = dataSet || {};
      if (!dataLenght) {
        return;
      }

      const { batchUpdateLines = () => {}, getBatchUpdateFlag = () => {} } = configs || {};
      const { batchEditQuotationLineDTO = {}, allEditFlag = -1 } = getBatchUpdateFlag() || {};

      dataSet.forEach((record) => {
        if (record.get('eliminateRoundNumber')) {
          Object.assign(record, { selectable: false });
        }
      });

      // line update
      batchUpdateLines(dataSet, batchEditQuotationLineDTO, allEditFlag);
    },
    update: ({ record, name, value }) => {
      // 改变单价
      // const onChangeUnitPrice = (val, curRecord) => {
      //   if (!val) {
      //     return;
      //   }

      //   const taxIncludedFlag = curRecord.get('taxIncludedFlag');
      //   let taxRate = curRecord.get('taxRate') || null;

      //   let netPrice = val;
      //   if (taxIncludedFlag && taxRate && taxRate !== 0) {
      //     taxRate = math.plus(math.div(Number(taxRate), 100), 1);
      //     const quotationCurrencyDefaultPrecision = record.get('quotationCurrencyDefaultPrecision');
      //     netPrice = calculationRender(val, taxRate, '/', quotationCurrencyDefaultPrecision);
      //   }

      //   record.set('currentQuotationSecondaryPrice', val);
      //   record.set('netSecondaryPrice', netPrice);
      // };

      // 改变未税单价
      // const onChangeNetPrice = (val, curRecord) => {
      //   if (!val) {
      //     return;
      //   }

      //   const taxIncludedFlag = curRecord.get('taxIncludedFlag');
      //   let taxRate = curRecord.get('taxRate');
      //   let currentQuotationPrice = val;

      //   if (taxIncludedFlag && taxRate && taxRate !== 0) {
      //     taxRate = math.plus(math.div(Number(taxRate), 100), 1);
      //     const quotationCurrencyDefaultPrecision = record.get('quotationCurrencyDefaultPrecision');
      //     currentQuotationPrice = calculationRender(
      //       val,
      //       taxRate,
      //       '*',
      //       quotationCurrencyDefaultPrecision
      //     );
      //   }

      //   record.set('netSecondaryPrice', val);
      //   record.set('currentQuotationSecondaryPrice', currentQuotationPrice);
      // };

      if (name === 'rfxLineItemNumLov') {
        if (!value) {
          return;
        }
        record.set('rfxLineItemNum', value.rfxLineItemNum);
        record.set('rfxLineItemId', value.rfxLineItemId);
        record.set('itemCategoryId', value.itemCategoryId);
        record.set('itemCategoryName', value.itemCategoryName);
        record.set('itemId', value.itemId);
        record.set('itemCode', value.itemCode);
        record.set('itemName', value.itemName);
        record.set('uomId', value.uomId);
        record.set('uomName', value.uomName);
        record.set('secondaryUomId', value.secondaryUomId);
        record.set('secondaryUomName', value.secondaryUomName);
        record.set('ouId', value.ouId);
        record.set('ouName', value.ouName);
        record.set('invOrganizationId', value.invOrganizationId);
        record.set('invOrganizationName', value.invOrganizationName);
        record.set('taxIncludedFlag', value.taxIncludedFlag);
        record.set('taxRate', value.taxRate);
        record.set('taxId', value.taxId);
        record.set('freightIncludedFlag', value.freightIncludedFlag);
        record.set('secondaryQuantity', value.secondaryQuantity);
        record.set('rfxQuantity', value.rfxQuantity);
        record.set('prNum', value.prNum);
        record.set('prLineNum', value.prLineNum);
        record.set('currentQuotationQuantity', value.rfxQuantity);
        record.set('currentQuotationSecQuantity', value.secondaryQuantity);
        record.set('minLimitPrice', value.minLimitPrice);
        record.set('maxLimitPrice', value.maxLimitPrice);
        record.set('costPrice', value.costPrice);
        record.set('specs', value.specs);
        record.set('model', value.model);
        record.set('lineItemRemark', value.lineItemRemark);
        record.set('priceBatchQuantity', value.batchPrice);
        record.set(
          'currentExpiryDateFrom',
          value.validExpiryDateFrom && moment(value.validExpiryDateFrom)
        );
        record.set(
          'currentExpiryDateTo',
          value.validExpiryDateTo && moment(value.validExpiryDateTo)
        );
      } else if (name === 'supplierCompanyNumLov') {
        // if (!value) {
        //   return;
        // }

        const currentValue = value || {};
        const {
          supplierType = 'internal',
          supplierCompanyNum = null,
          supplierCompanyName = null,
          supplierName = null,
          supplierNum = null,
          name: supplierContactName = null,
          contactName = null,
        } = currentValue;
        const newSupplierCompanyNum = supplierCompanyNum || supplierNum;
        const newSupplierCompanyName = {
          ...currentValue,
          supplierCompanyName: supplierCompanyName || supplierName,
        };
        // if (supplierType === 'external') { 这个字段不可靠
        //   newSupplierCompanyNum = supplierNum;
        //   newSupplierCompanyName = supplierName;
        // }

        record.set('supplierCompanyId', currentValue.supplierCompanyId);
        record.set('supplierCompanyNum', newSupplierCompanyNum);
        record.set('supplierType', supplierType);
        record.set(
          'supplierCompanyName',
          supplierCompanyName || supplierName ? newSupplierCompanyName : null
        );
        record.set('contactName', contactName || supplierContactName);
        record.set('contactMobilephone', currentValue.mobilephone);
        record.set('internationalTelCode', currentValue.internationalTelCode);
        record.set('contactMail', currentValue.mail);
        record.set('lastBidPrice', currentValue.lastBidPrice);
        record.set('supplierId', currentValue.supplierId || null);
      } else if (name === 'supplierCompanyName') {
        if (isString(value)) {
          return;
        }
        const currentValue = value || {};
        const {
          supplierType = 'internal',
          supplierCompanyNum = null,
          supplierCompanyName = null,
          supplierName = null,
          supplierNum = null,
          name: supplierContactName = null,
          contactName = null,
          supplierCompanyId,
        } = currentValue;
        if (
          !supplierName &&
          !supplierContactName &&
          !supplierNum &&
          !contactName &&
          !supplierCompanyId
        ) {
          return;
        }

        const newSupplierCompanyNum = supplierCompanyNum || supplierNum;
        const supplierCompanyNumLov = {
          ...currentValue,
          supplierCompanyName: supplierCompanyName || supplierName,
          supplierCompanyNum: newSupplierCompanyNum,
          supplierCompanyId: newSupplierCompanyNum ? supplierCompanyId : null,
        };

        record.set('supplierCompanyId', currentValue.supplierCompanyId);
        record.set('supplierCompanyNum', newSupplierCompanyNum);
        record.set('supplierType', supplierType);
        record.set('supplierCompanyNumLov', supplierCompanyNumLov);
        record.set('contactName', contactName || supplierContactName);
        record.set('contactMobilephone', currentValue.mobilephone);
        record.set('internationalTelCode', currentValue.internationalTelCode);
        record.set('contactMail', currentValue.mail);
        record.set('lastBidPrice', currentValue.lastBidPrice);
        record.set('supplierId', currentValue.supplierId || null);
      } else if (name === 'taxLov') {
        // const { configTaxIncludeFlag } = dataSet.queryParameter.tableProps;
        // const currentValue = value || {};
        // record.set('taxRate', currentValue.taxRate);
        // record.set('taxId', currentValue.taxId);
        // if (configTaxIncludeFlag) {
        //   const currentQuotationPrice = record.get('currentQuotationSecondaryPrice');
        //   onChangeUnitPrice(currentQuotationPrice, record);
        // } else {
        //   const netPrice = record.get('netSecondaryPrice');
        //   onChangeNetPrice(netPrice, record);
        // }
      } else if (name === 'quotationCurrencyCodeLov') {
        // const { currencyCode = null, quotationCurrencyDefaultPrecision = null } = value || {};
        // record.set('quotationCurrencyCode', currencyCode);
        // record.set('quotationCurrencyDefaultPrecision', quotationCurrencyDefaultPrecision);
      } else if (name === 'taxIncludedFlag') {
        // if (!record.get('taxIncludedFlag')) {
        //   record.set('taxId', undefined);
        //   record.set('taxRate', undefined);
        // }
      } else {
        // todo anything
      }
    },
  },
  transport: {
    read: ({ dataSet, data }) => {
      const {
        queryParameter: { params = {} },
      } = dataSet;
      const {
        itemName = null,
        supplierCompanyName = null,
        supplierId = null,
        supplierName = null,
      } = data;
      return {
        url: `${Prefix}/${organizationId}/rfx/off-line/supplier/list-by-condition`,
        method: 'GET',
        data: { ...params, itemName, supplierCompanyName, supplierId, supplierName },
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${Prefix}/${organizationId}/rfx/off-line`,
        method: 'DELETE',
        data,
      };
    },
  },
});

const attachmentDS = (param) => ({
  autoQuery: false,
  primaryKey: 'quotationHeaderId',
  selection: false,
  // table表单显示的字段
  fields: [
    {
      label: intl.get(`${promptCode}.model.offlineEntry.supplierCode`).d('供应商编码'),
      name: 'supplierCompanyNum',
      width: 180,
    },
    {
      label: intl.get(`${promptCode}.model.offlineEntry.supplierName`).d('供应商名称'),
      name: 'supplierCompanyName',
      width: 120,
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessAttachments`).d('商务附件'),
      name: 'currentBusinessAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'offline-businessAttachments',
      ...(ChunkUploadProps || {}),
    },
    {
      label: intl.get(`ssrc.inquiryHall.model.inquiryHall.techAttachments`).d('技术附件'),
      name: 'currentTechAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'offline-techAttachments',
      ...(ChunkUploadProps || {}),
    },
  ],
  transport: {
    read: ({ dataSet }) => {
      const { queryParameter: { commons = {} } = {} } = dataSet;

      return {
        url: `${Prefix}/${organizationId}/rfx/off-line/quotation-header/query`,
        method: 'GET',
        data: {
          rfxHeaderId: param.rfxHeaderId,
          ...(commons || {}),
        },
      };
    },
  },
});

const SupplierBulkExpiredModalDS = () => {
  return {
    primaryKey: 'index',
    autoQuery: false,
    selection: 'multiple',
    dataToJSON: 'selected',
    paging: false,
    fields: [
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentName`).d('附件名称'),
        name: 'attachmentDesc',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.attachmentsName`).d('文件到期日'),
        name: 'expirationDate',
      },
      {
        label: intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierAttachment`).d('供应商附件'),
        name: 'supplierAttachmentUuid',
        type: 'attachment',
        readOnly: true,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'ssrc-rfx-quotationline',
      },
    ],
  };
};

export { allQuotationDS, attachmentDS, SupplierBulkExpiredModalDS };
