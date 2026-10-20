import intl from 'utils/intl';
import moment from 'moment';
import { PRIVATE_BUCKET, SRM_SRPM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import moment from 'moment';
// import { DATETIME_MIN } from 'utils/constants';
import { c7nAmountFormatterOptions } from '@/routes/components/utils';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'srpm.common.model.common';

const baseDs = () => {
  return {
    paging: false,
    autoQuery: false,
    forceValidate: true,
    validationTitle: intl.get('srpm.common.title.baseInfo').d('基本信息'),
    fields: [
      {
        name: 'displayRpNum',
        disabled: true,
        label: intl.get(`${commonPrompt}.rpNum`).d('需求计划单号'),
      },
      {
        name: 'rpStatus',
        disabled: true,
        label: intl.get(`${commonPrompt}.rpStatus`).d('状态'),
        lookupCode: 'SRPM.RP_STATUS',
      },
      {
        name: 'rpTypeId',
        label: intl.get(`${commonPrompt}.rpType`).d('需求计划类型'),
        lovCode: 'SRPM_RP_TYPE',
        textField: 'rpTypeName',
        valueField: 'rpTypeId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              rpTypeId: value,
              rpTypeName: data.rpTypeName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value && value.rpTypeId,
      },
      {
        name: 'rpTypeName',
        bind: 'rpTypeId.rpTypeName',
      },
      {
        name: 'createdByName',
        disabled: true,
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'containerId',
        type: 'object',
        label: intl.get(`${commonPrompt}.containerName`).d('需求计划'),
        lovCode: 'SRPM.RP_CONTAINER',
        lovPara: { latestFlag: 1 },
        required: true,
        textField: 'containerName',
        valueField: 'containerCode',
        transformResponse(value, data) {
          if (value) {
            return {
              containerId: value,
              containerCode: data.containerCode,
              containerName: data.containerName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.containerId,
      },
      {
        name: 'containerCode',
        bind: 'containerId.containerCode',
      },
      {
        name: 'containerName',
        bind: 'containerId.containerName',
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        disabled: true,
        label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
      },
      {
        name: 'originalCurrency',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        required: true,
        type: 'object',
        valueField: 'currencyCode',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.financialPrecision,
              defaultPrecision: data.defaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'financialPrecision',
        bind: 'originalCurrency.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'originalCurrency.defaultPrecision',
      },
      {
        name: 'localCurrency',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        disabled: true,
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              currencyCode: value,
              financialPrecision: data.localFinancialPrecision,
              defaultPrecision: data.localDefaultPrecision,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrency.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrency.defaultPrecision',
      },
      {
        name: 'amount',
        label: intl.get(`${commonPrompt}.amount`).d('计划总额'),
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('financialPrecision')
                : undefined)
          ),
        },
        disabled: true,
      },
      // {
      //   name: 'originalCurrencyNoTaxSum',
      //   label: intl.get(`${commonPrompt}.originalCurrencyNoTaxSum`).d('原币总金额(不含税)'),
      //   type: 'currency',
      //   disabled: true,
      //   dynamicProps: {
      //       formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //         record && (record.get('rpSourcePlatform') === 'REQUEST_PLAN' ? record.get('financialPrecision'): undefined)
      //      ),
      //   },
      // },
      // {
      //   name: 'originalCurrencyTaxSum',
      //   label: intl.get(`${commonPrompt}.originalCurrencyTaxSum`).d('原币总金额(含税)'),
      //   type: 'currency',
      //   disabled: true,
      //   dynamicProps: {
      //     formatterOptions: c7nAmountFormatterOptions(({ record }) =>
      //         record && (record.get('rpSourcePlatform') === 'REQUEST_PLAN' ? record.get('financialPrecision'): undefined)
      //     ),
      //   },
      // },
      {
        name: 'localCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.totalLocalCurrencyNoTaxSum`).d('本币总金额(不含税)'),
        type: 'currency',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('localFinancialPrecision')
                : undefined)
          ),
        },
      },
      {
        name: 'localCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.totalLocalCurrencyTaxSum`).d('本币总金额(含税)'),
        type: 'currency',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(
            ({ record }) =>
              record &&
              (record.get('rpSourcePlatform') === 'REQUEST_PLAN'
                ? record.get('localFinancialPrecision')
                : undefined)
          ),
        },
      },
      {
        name: 'requestedBy',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'userName',
        // valueField: 'userId',
        type: 'object',
        transformResponse(value, data) {
          if (value) {
            return {
              userId: value,
              loginName: data.prRequestedNum,
              userName: data.requestedByName,
              prRequestedNumAndName: data.prRequestedNumAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.userId,
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedBy.loginName',
      },
      {
        name: 'requestedByName',
        bind: 'requestedBy.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'requestedBy.prRequestedNumAndName',
        label: intl.get(`srpm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        // required: true,
        min: moment('1970-01-01'),
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'date',
      },
      {
        name: 'remark',
        maxLength: 480,
        label: intl.get(`${commonPrompt}.remark`).d('备注'),
      },
      {
        name: 'rpSourcePlatform',
        label: intl.get(`${commonPrompt}.rpSourcePlatform`).d('单据来源'),
        //   lookupCode: 'SPRM.SRC_PLATFORM',
        disabled: true,
      },
      {
        name: 'cancelStatusCode',
        disabled: true,
        lookupCode: 'SRPM.RP_CANCEL_STATUS',
        label: intl.get(`${commonPrompt}.cancelStatusCode`).d('取消状态'),
      },
      {
        name: 'srmExecuteFlag',
        disabled: true,
        lookupCode: 'HPFM.FLAG',
        label: intl.get(`${commonPrompt}.cancelStatusCode`).d('是否需在SRM继续执行'),
      },
      {
        name: 'syncStatus',
        disabled: true,
        lookupCode: 'SRPM.RP_SYNC_STATUS',
        label: intl.get(`${commonPrompt}.syncStatus`).d('需求计划回传状态'),
      },
    ],
  };
};

const purchaseOrgInfoDs = () => {
  return {
    paging: false,
    // autoCreate: true,
    autoQuery: false,
    forceValidate: true,
    validationTitle: intl.get('srpm.common.title.purchaseOrgInfo').d('交易方及采买组织信息'),
    fields: [
      {
        name: 'companyId',
        label: intl.get(`entity.company.tag`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        required: true,
        dynamicProps: {
          disabled: ({ record }) => {
            return (
              (record.get('rpSourcePlatform') &&
                record.get('rpSourcePlatform') !== 'REQUEST_PLAN') ||
              record.get('rpHeaderId')
            );
          },
        },
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
        transformResponse(value, data) {
          if (value) {
            return {
              companyId: value,
              companyName: data.companyName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value && value.companyId,
      },
      {
        name: 'companyName',
        bind: 'companyId.companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouId',
        label: intl.get(`entity.business.tag`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        type: 'object',
        required: true,
        dynamicProps: {
          disabled({ record }) {
            return (
              !record.get('companyId')?.companyId ||
              !!(
                record.get('rpSourcePlatform') && record.get('rpSourcePlatform') !== 'REQUEST_PLAN'
              ) ||
              !!record.get('rpHeaderId')
            );
          },
          lovPara({ record }) {
            return {
              companyId: record.get('companyId')?.companyId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              ouId: value,
              ouName: data.ouName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.ouId,
      },
      {
        name: 'ouName',
        bind: 'ouId.ouName',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgId',
        required: true,
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('companyId')?.companyId || !record.get('ouId')?.ouId;
          },
          lovPara({ record }) {
            return {
              ouId: record.get('ouId')?.ouId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseOrgId: value,
              purchaseOrgName: data.purchaseOrgName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseOrgId,
      },
      {
        name: 'purchaseOrgName',
        bind: 'purchaseOrgId.organizationName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'unitId',
        type: 'object',
        lovCode: 'SPRM.USER_UNIT',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        textField: 'unitName',
        valueField: 'unitId',
        dynamicProps: {
          disabled({ record }) {
            return !record.get('companyId')?.companyId;
          },

          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              companyId: record.get('companyId')?.companyId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              unitId: value,
              unitName: data.unitName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.unitId,
      },
      {
        name: 'unitName',
        bind: 'unitId.unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      },
      {
        name: 'purchaseAgentId',
        required: true,
        label: intl.get(`srpm.common.model.common.planner`).d('计划员'),
        lovCode: 'SRPM.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              purchaseOrgIds: record.get('purchaseOrgId')?.purchaseOrgId,
              tenantId: organizationId,
            };
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              purchaseAgentId: value,
              purchaseAgentName: data.purchaseAgentName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.purchaseAgentId,
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentId.purchaseAgentName',
        label: intl.get(`srpm.common.model.common.planner`).d('计划员'),
      },
    ],
  };
};

const lineDs = ({
  rpHeaderId,
  handleDetailField,
  customizeUnitCode,
  itemLimitRule = [],
  pubPathFlag,
}) => {
  return {
    autoQuery: false,
    dataToJSON: 'all',
    cacheSelection: true,
    cacheModified: true,
    primaryKey: 'rpLineId',
    pageSize: 20,
    forceValidate: true,
    validationNum: 'displayLineNum',
    validationTitle: intl.get('srpm.common.title.detailLineInfo').d('需求计划明细信息'),
    fields: [
      {
        name: 'displayLineNum',
        label: intl.get(`srpm.common.model.common.lineNumber`).d('行号'),
      },
      {
        name: 'rpLineStatus',
        disabled: true,
        lookupCode: 'SRPM.RP_LINE_STATUS',
        label: intl.get(`${commonPrompt}.rpLineStatus`).d('行状态'),
      },
      // {
      //     name: 'prLineStatusCodeMeaning',
      //     label: intl.get('hzero.common.status').d('状态'),
      // },
      {
        name: 'invOrganizationId',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        dynamicProps: {
          lovPara() {
            return {
              ouId: handleDetailField('purchaseOrgInfoRef', 'ouId')?.ouId,
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
          required() {
            return !(
              handleDetailField('baseRef', 'rpSourcePlatform') &&
              handleDetailField('baseRef', 'rpStatusCode') === 'reject'
            );
          },
        },
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
        transformResponse(value, data) {
          if (value) {
            return {
              organizationId: value,
              organizationName: data.invOrganizationName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.organizationId,
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationId.organizationName',
      },
      {
        name: 'itemCode',
        label: intl.get(`srpm.common.model.common.itemCode`).d('物料编码'),
        type: 'object',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          disabled({ record }) {
            // 物料分类
            // console.log(other);
            // const { itemLimitRule = [] } = dataSet.queryParameter;
            // const categoryId = record.get('categoryId')?.categoryId;
            // if (itemLimitRule.find(rule => rule === 'categoryId')) {
            //     if (!categoryId) {
            //         return true;
            //     }
            // }

            const invOrganizationId = record.get('invOrganizationId')?.organizationId;
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              if (!invOrganizationId) {
                return true;
              }
            }
            const rpSourcePlatform = handleDetailField('baseRef', 'rpSourcePlatform');
            return rpSourcePlatform !== 'REQUEST_PLAN' && rpSourcePlatform;
          },
          lovPara({ record }) {
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId')?.companyId,
              headerCategoryId: handleDetailField('baseRef', 'categoryId')?.categoryId,
              lineCategoryId: record.get('categoryId')?.categoryId,
              prTypeId: handleDetailField('baseRef', 'prTypeId')?.prTypeId,
            };
            // const { itemLimitRule = [] } = dataSet.queryParameter;
            // // 物料分类
            // if (itemLimitRule.find(rule => rule === 'categoryId')) {
            //     params.categoryId = record.get('categoryId')?.categoryId;
            // }
            // 库存组织
            if (itemLimitRule.find((rule) => rule === 'invOrganizationId')) {
              params.invOrganizationId = record.get('invOrganizationId')?.organizationId;
            }
            return params;
          },
        },
        transformResponse(value, data) {
          if (value) {
            return {
              itemCode: value,
              itemId: data.itemId,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.itemCode,
      },
      {
        name: 'itemId',
        bind: 'itemCode.itemId',
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get('entity.item.name').d('物料名称'),
        type: 'string',
        maxLength: 360,
      },
      {
        label: intl.get(`srpm.common.model.common.categoryName`).d('物料分类'),
        name: 'categoryId',
        type: 'object',
        lovCode: 'SMDM.CATEGORY.LEVEL_CONTROL_TREE',
        // lovCode: 'SPRM.ITEM_CATEGOR_TILED',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        optionsProps: {
          paging: 'server',
          record: {
            dynamicProps: {
              selectable: (record) => record.get('isCheck') !== false,
            },
          },
        },
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              purchaseOrgId: handleDetailField('purchaseOrgInfoRef', 'purchaseOrgId')
                ?.purchaseOrgId,
              queryCategoryId: handleDetailField('baseRef', 'purchaseOrgId')?.purchaseOrgId,
              itemId: record.get('itemId'),
              businessObjectCode: 'SRM_C_SRM_SRPM_REQUEST_PLAN_BL_HEADER',
            };
          },
        },
        lovDefineAxiosConfig: (code) => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              (data) => {
                return {
                  ...data,
                  treeFlag: 'Y',
                  idField: 'categoryId',
                  parentIdField: 'parentCategoryId',
                };
              },
            ],
          };
        },
        transformResponse(value, data) {
          if (value) {
            return {
              categoryId: value,
              categoryName: data.categoryName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.categoryId,
      },
      {
        name: 'categoryName',
        bind: 'categoryId.categoryName',
        label: intl.get(`srpm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`srpm.common.model.common.itemModel`).d('型号'),
        name: 'itemModel',
        // disabled: true,
      },
      {
        label: intl.get(`srpm.common.model.common.itemSpecs`).d('规格'),
        name: 'itemSpecs',
        // disabled: true,
      },
      {
        name: 'uomId',
        label: intl.get(`srpm.common.model.common.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM',
        type: 'object',
        textField: 'uomName',
        required: true,
        valueField: 'uomId',
        transformResponse(value, data) {
          if (value) {
            return {
              uomId: value,
              uomCode: data.uomCode,
              uomName: data.uomName,
              uomPrecision: data.uomPrecision,
              // uomCodeAndName: data.uomCodeAndName,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.uomId,
        dynamicProps: {
          // disabled: ({ record }) => record.get('itemCode')?.itemCode,
        },
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomId.uomPrecision',
      },
      {
        label: intl.get(`srpm.common.model.common.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomId.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`srpm.common.model.common.uomName`).d('单位'),
        bind: 'uomId.uomName',
      },
      // {
      //   label: intl.get(`srpm.common.model.common.uomName`).d('单位'),
      //   name: 'uomCodeAndName',
      //   bind: 'uomId.uomCodeAndName',
      // },
      {
        label: intl.get(`srpm.common.model.common.neededDate`).d('需求日期'),
        name: 'neededDate',
        required: true,
        min: moment('1970-01-01'),
        type: 'date',
      },
      {
        label: intl.get(`srpm.common.model.common.lineQuantity`).d('数量'),
        name: 'quantity',
        type: 'number',
        validator(value) {
          if (value <= 0) {
            return intl.get(`srpm.common.message.mustExceedZero`).d('数量必须大于零');
          } else {
            return true;
          }
        },
        required: true,
        dynamicProps: {
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
        },
      },
      {
        name: 'taxId',
        type: 'object',
        lovCode: 'SPRM.TAX',
        textField: 'taxCode',
        label: intl.get(`srpm.common.model.common.taxType`).d('税种'),
        transformResponse(value, data) {
          if (value) {
            return {
              taxId: value,
              taxRate: data.taxRate,
              taxCode: data.taxCode,
              includedTaxFlag: data.includedTaxFlag,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.taxId,
      },
      {
        name: 'taxCode',
        bind: 'taxId.taxCode',
      },
      {
        name: 'includedTaxFlag',
        bind: 'taxId.includedTaxFlag',
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        bind: 'taxId.taxRate',
      },
      {
        name: 'currencyCode',
        type: 'object',
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currenyCode',
        disabled: true,
        label: intl.get('srpm.common.model.common.currency').d('币种'),
        transformResponse(value) {
          if (value) {
            return {
              currencyCode: value,
            };
          } else {
            return null;
          }
        },
        transformRequest: (value) => value?.currencyCode,
      },
      {
        label: intl.get(`srpm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        name: 'taxIncludedUnitPrice',
        type: 'number',
        numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) => {
            return handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('defaultPrecision')
              : undefined;
          },
        },
      },
      {
        label: intl.get(`srpm.common.model.common.unitPrice`).d('预估单价(不含税)'),
        name: 'unitPrice',
        type: 'number',
        numberGrouping: true,
        dynamicProps: {
          precision: ({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('defaultPrecision')
              : undefined,
        },
      },
      {
        label: intl.get(`srpm.common.model.common.taxIncludedLineAmount`).d('原币行金额(含税)'),
        name: 'taxIncludedLineAmount',
        type: 'currency',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('financialPrecision')
              : undefined
          ),
        },
      },
      {
        label: intl.get(`srpm.common.model.common.lineAmount`).d('原币行金额(不含税)'),
        name: 'lineAmount',
        type: 'currency',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('financialPrecision')
              : undefined
          ),
        },
      },
      {
        name: 'localCurrencyNoTaxSum',
        type: 'currency',
        disabled: true,
        label: intl.get('srpm.common.model.common.localCurrencyNoTaxSum').d('本币金额(不含税)'),
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('localFinancialPrecision')
              : undefined
          ),
        },
      },
      {
        name: 'localCurrencyNoTaxUnit',
        type: 'number',
        disabled: true,
        label: intl.get('srpm.common.model.common.localCurrencyNoTaxUnit').d('本币单价(不含税)'),
        dynamicProps: {
          precision: ({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('localDefaultPrecision')
              : undefined,
        },
      },
      {
        type: 'currency',
        label: intl.get(`srpm.common.model.common.localCurrencyTaxSum`).d('本币金额(含税)'),
        name: 'localCurrencyTaxSum',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('localFinancialPrecision')
              : undefined
          ),
        },
      },
      {
        label: intl.get(`srpm.common.model.common.localCurrencyTaxUnit`).d('本币单价(含税)'),
        name: 'localCurrencyTaxUnit',
        type: 'number',
        dynamicProps: {
          precision: ({ record }) =>
            handleDetailField('baseRef', 'rpSourcePlatform') === 'REQUEST_PLAN'
              ? record.get('localDefaultPrecision')
              : undefined,
        },
        disabled: true,
      },
      {
        name: 'remark',
        label: intl.get(`srpm.common.model.common.remark`).d('备注'),
      },
      {
        label: intl.get('entity.attachment.tag').d('附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'srpm',
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { currentId } = data;
        return {
          url: `${SRM_SRPM}/v1/${organizationId}/request-plan/lines/${rpHeaderId || currentId}`,
          data: { ...data, customizeUnitCode, workFlowFlag: pubPathFlag ? 1 : undefined },
          method: 'GET',
        };
      },
    },
  };
};

const remarkDs = ({ required = false }) => {
  return {
    dataToJSON: 'all',
    autoCreate: true,
    fields: [
      {
        required,
        name: 'cancelRemark',
      },
    ],
  };
};

const attachmentDs = () => {
  return {
    autoQuery: false,
    forceValidate: true,
    validationTitle: intl.get('hzero.common.upload.modal.title').d('附件'),
    fields: [
      {
        name: 'attachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'srpm',
        label: intl.get('hzero.common.upload.modal.title').d('附件'),
      },
      {
        name: 'externalAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'srpm',
        label: intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件'),
      },
    ],
  };
};

const batchEditDs = (headerInfo = {}) => ({
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'invOrganizationId',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      dynamicProps: {
        lovPara() {
          return {
            ouId: headerInfo?.ouId,
            enabledFlag: 1,
            tenantId: organizationId,
          };
        },
      },
      valueField: 'organizationId',
      textField: 'organizationName',
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
      transformResponse(value, data) {
        if (value) {
          return {
            organizationId: data?.organizationId,
            organizationName: data.invOrganizationName,
          };
        } else {
          return null;
        }
      },
      transformRequest: (value) => value?.organizationId,
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationId.organizationName',
    },
    {
      label: intl.get(`srpm.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      min: moment('1970-01-01'),
      type: 'date',
    },
    {
      name: 'remark',
      label: intl.get(`srpm.common.model.common.remark`).d('备注'),
    },
  ],
});

export { lineDs, purchaseOrgInfoDs, baseDs, remarkDs, attachmentDs, batchEditDs };
