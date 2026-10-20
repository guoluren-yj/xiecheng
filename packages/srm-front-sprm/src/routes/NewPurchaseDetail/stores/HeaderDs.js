import intl from 'utils/intl';
import moment from 'moment';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import { c7nAmountFormatterOptions, getBatchOperationFlag } from '@/routes/utils';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { fetchAutoGetCompany, fetchAutoGetPurchasing } from '@/services/purchasePlatformService';
import { fetchBasePrice } from '@/services/purchaseRequisitionCreationService';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { queryBatchApprovaFlag } from '_utils/utils';

// 设置sprm国际化前缀 - common - model
const commonPrompt = 'sprm.common.model.common';

export default ({
  listDs,
  addLineDs,
  organizationId,
  prHeaderId,
  customizeUnitCode,
  pubPathFlag,
  limitAttr = (e) => e,
  limitator = (e) => e,
  cuxUpdate = (e) => e,
  cuxQueryPageHeaderUrl = undefined,
  cuxNotBringPurchaseOrgLov = undefined,
  cuxNotBringPurchaseAgentLov = undefined,
  cuxAddField = [],
}) => {
  return {
    autoQuery: false,
    autoCreate: false,
    primaryKey: 'prHeaderId',
    dataToJSON: 'all',
    dataKey: null,
    transport: {
      read: () => {
        const cuxQuery = cuxQueryPageHeaderUrl
          ? cuxQueryPageHeaderUrl({ customizeUnitCode, prHeaderId })
          : {};
        const { cuxParams = {} } = cuxQuery || {};
        return {
          url: cuxQuery?.url || `${SRM_SPRM}/v1/${organizationId}/purchase-request/${prHeaderId}`,
          params: {
            customizeUnitCode,
            workFlowFlag: pubPathFlag ? undefined : '1',
            ...(cuxParams || {}),
          },
          method: 'GET',
        };
      },
    },
    events: {
      update: ({ record, name, value, oldValue, dataSet }) => {
        // 二开埋点编辑
        cuxUpdate({ record, name, value, oldValue, listDs });
        // 基础信息

        if (name === 'requestedByLov') {
          record.set({
            prRequestedNumAndName:
              value && value.loginName ? `${value.loginName}-${value.userName}` : null,
          });
        }

        if (name === 'originalCurrencyLov' && value) {
          listDs.forEach((lineRecord) => {
            lineRecord.init({
              currencyName: value.currencyName,
              currencyCode: value.currencyCode,
              defaultPrecision: value.defaultPrecision,
              financialPrecision: value.financialPrecision,
            });
          });
        }

        if (name === 'localCurrencyLov') {
          listDs.forEach((lineRecord) => {
            lineRecord.init({
              localDefaultPrecision: value.defaultPrecision,
              localFinancialPrecision: value.financialPrecision,
            });
          });
        }

        // 采买组织信息

        if (name === 'companyLov') {
          // 舍得跳过公司等字段的
          const skipCompanyLinkFlag = dataSet.getState('skipCompanyLinkFlag') || false;
          if (value) {
            const lastUpdateBaseFlag = dataSet.getState('basePriceFlag');
            fetchBasePrice({
              companyId: value?.companyId,
              prSourcePlatform: record.get('prSourcePlatform') || 'SRM',
            }).then((res) => {
              if (getResponse(res) && lastUpdateBaseFlag !== res) {
                dataSet.setState('basePriceFlag', res);
                listDs.forEach((lineRecord) => {
                  lineRecord.set({
                    taxIncludedUnitPrice: null,
                  });
                });
              }
            });
            if (!skipCompanyLinkFlag) {
              fetchAutoGetCompany({ companyId: value?.companyId }).then((res) => {
                if (res) {
                  const { ouId, ouCode, ouName, purchaseOrgId, purchaseOrgName } = res;
                  record.set({
                    purchaseOrgLov:
                      // 老娘舅二开：当cuxNotBringPurchaseOrgLov = true时此处不要带出默认采购对象
                      purchaseOrgId && !cuxNotBringPurchaseOrgLov
                        ? {
                            purchaseOrgId,
                            purchaseOrgName,
                            organizationName: purchaseOrgName,
                          }
                        : null,
                    ouLov: ouId ? { ouId, ouCode, ouName } : null,
                  });
                }
              });
            }
          }
          if (!skipCompanyLinkFlag && !value) {
            record.set({
              ouLov: null,
            });
          }
        }

        if (name === 'ouLov') {
          if (value) {
            listDs.forEach((lineRecord) => {
              lineRecord.init({
                invOrganizationIdLov: null,
              });
            });
            fetchAutoGetCompany({
              companyId: record.get('companyId'),
              ouId: value.ouId,
            }).then((res) => {
              if (res) {
                const {
                  purchaseOrgId,
                  purchaseOrgName,
                  organizationId: invOrganizationId,
                  organizationName,
                } = res;
                record.set({
                  purchaseOrgLov: purchaseOrgId
                    ? {
                        purchaseOrgId,
                        purchaseOrgName,
                        organizationName: purchaseOrgName,
                      }
                    : null,
                });
                listDs.forEach((lineRecord) => {
                  lineRecord.set({
                    invOrganizationIdLov: {
                      organizationId: invOrganizationId,
                      organizationName,
                    },
                  });
                });
              }
            });
          } else {
            record.set({
              purchaseOrgLov: null,
            });
          }
        }

        // pur-28381 集度二开 当cuxNotBringPurchaseOrgId为true时采购组织不带出采购员
        if (name === 'purchaseOrgLov' && value && !cuxNotBringPurchaseAgentLov) {
          fetchAutoGetPurchasing({ purchaseOrgId: value.purchaseOrgId, functionCode: 'PR' }).then(
            (res) => {
              if (res) {
                const { purchaseAgentId, purchaseAgentCode, purchaseAgentName } = res;
                record.set({
                  purchaseAgentLov: purchaseAgentId
                    ? {
                        purchaseAgentId,
                        purchaseAgentCode,
                        purchaseAgentName,
                      }
                    : null,
                });
              }
            }
          );
        }

        // 收货/收单信息
        if (name === 'invoiceAddressLov' && value) {
          const { contactName, mobile, email } = value;
          record.set({
            invoiceContactName: contactName,
            invoiceTelNum: mobile,
            receiverEmailAddress: email,
          });
        }
        dataSet.setState('updated', true);
      },
      load: async ({ dataSet }) => {
        const { current } = dataSet;
        dataSet.setState('updated', false);
        if (current) {
          current.init({
            prRequestedNumAndName:
              current.get('prRequestedName') && current.get('prRequestedNum')
                ? `${current.get('prRequestedNum')}-${current.get('prRequestedName')}`
                : current.get('prRequestedName') || current.get('prRequestedNum'),
          });
          const workflowBusinessKey = dataSet.current.get('workflowBusinessKey');
          if (workflowBusinessKey) {
            // 获取审批按钮显示状态
            const approvaFlags = await queryBatchApprovaFlag([workflowBusinessKey]);
            // 获取撤销审批按钮状态
            const operationFlags = await getBatchOperationFlag([workflowBusinessKey]);
            dataSet.setState({ approvaFlags, operationFlags });
          }
        }
      },
    },
    fields: [
      // 基本信息
      {
        name: 'rpSourceFlag',
        label: intl.get(`${commonPrompt}.rpSourceFlag`).d('需求计划来源标识'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'prNum',
        disabled: true,
        label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
      },
      {
        name: 'displayPrNum',
        disabled: true,
        label: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
      },
      {
        name: 'title',
        maxLength: 200,
        label: intl.get(`${commonPrompt}.title`).d('标题'),
      },
      {
        name: 'createByName',
        disabled: true,
        label: intl.get(`entity.roles.creator`).d('创建人'),
      },
      {
        name: 'creationDate',
        type: 'dateTime',
        disabled: true,
        label: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
      },
      {
        name: 'prTypeLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPUC.PR_DEMAND_TYPE',
        dynamicProps: {
          disabled({ record }) {
            return record.get('prSourcePlatform') === 'SHOP';
          },
        },
        lovPara: { tenantId: organizationId },
        label: intl.get(`${commonPrompt}.sqType`).d('申请类型'),
        textField: 'prTypeName',
      },
      {
        name: 'prTypeId',
        bind: 'prTypeLov.prTypeId',
      },
      {
        name: 'prTypeCode',
        bind: 'prTypeLov.prTypeCode',
      },
      {
        name: 'prTypeName',
        bind: 'prTypeLov.prTypeName',
      },
      {
        name: 'prSourcePlatform',
        label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
        lookupCode: 'SPRM.SRC_PLATFORM',
        disabled: true,
      },
      {
        name: 'originalCurrencyLov',
        label: intl.get(`${commonPrompt}.originalCurrency`).d('原币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        dynamicProps: {
          required: ({ record }) => {
            return record.get('prSourcePlatform') !== 'ERP';
          },
        },
        type: 'object',
        ignore: 'always',
        valueField: 'currencyCode',
      },
      {
        name: 'originalCurrency',
        bind: 'originalCurrencyLov.currencyCode',
      },
      {
        name: 'financialPrecision',
        bind: 'originalCurrencyLov.financialPrecision',
      },
      {
        name: 'defaultPrecision',
        bind: 'originalCurrencyLov.defaultPrecision',
      },
      {
        name: 'amount',
        label: intl.get(`${commonPrompt}.amount`).d('申请总额'),
        type: 'number',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            record.get('prSourcePlatform') === 'SRM' ? record.get('financialPrecision') : undefined
          ),
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('financialPrecision') || record.get('financialPrecision') === 0)
              ? record.get('financialPrecision')
              : undefined;
          },
        },
        disabled: true,
      },
      { name: 'financialPrecision' },
      {
        name: 'localCurrencyLov',
        label: intl.get(`${commonPrompt}.localCurrency`).d('本币币种'),
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        lovPara: { tenantId: organizationId },
        disabled: true,
        type: 'object',
      },
      {
        name: 'localCurrency',
        bind: 'localCurrencyLov.currencyCode',
      },
      {
        name: 'localFinancialPrecision',
        bind: 'localCurrencyLov.financialPrecision',
      },
      {
        name: 'localDefaultPrecision',
        bind: 'localCurrencyLov.defaultPrecision',
      },
      {
        name: 'localCurrencyNoTaxSum',
        label: intl.get(`${commonPrompt}.localCurrencyNoTaxSum`).d('本币金额(不含税)'),
        type: 'number',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return (
              record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
            );
          }),
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localFinancialPrecision') || record.get('localFinancialPrecision') === 0)
              ? Number(record.get('localFinancialPrecision'))
              : undefined;
          },
        },
      },
      {
        name: 'localCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)'),
        type: 'number',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return (
              record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
            );
          }),
          precision: ({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' &&
              (record.get('localFinancialPrecision') || record.get('localFinancialPrecision') === 0)
              ? Number(record.get('localFinancialPrecision'))
              : undefined;
          },
        },
      },
      {
        name: 'paymentMethodCode',
        label: intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式'),
      },
      {
        name: 'paymentMethodName',
        label: intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式'),
        type: 'string',
      },
      {
        name: 'lotNum',
        label: intl.get(`${commonPrompt}.lotNum`).d('批次号'),
      },
      {
        name: 'requestedByLov',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
        lovCode: 'SPCM.ACCEPT_USER',
        lovPara: { tenantId: organizationId },
        textField: 'prRequestedNumAndName',
        ignore: 'always',
        type: 'object',
      },
      {
        name: 'requestedBy',
        bind: 'requestedByLov.userId',
      },
      {
        name: 'prRequestedNum',
        bind: 'requestedByLov.loginName',
      },
      {
        name: 'prRequestedName',
        bind: 'requestedByLov.userName',
        label: intl.get(`${commonPrompt}.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'requestedByLov.prRequestedNumAndName',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'requestDate',
        label: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
        type: 'dateTime',
        min: moment('1970-01-01'),
      },
      {
        name: 'unitLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.USER_UNIT',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        textField: 'unitName',
        valueField: 'unitId',
        dynamicProps: {
          lovPara: ({ record }) => {
            return {
              tenantId: organizationId,
              companyId: record.get('companyId'),
              unitId: record.get('unitId'),
            };
          },
        },
        optionsProps: {
          paging: 'server',
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
                  idField: 'unitId',
                  parentIdField: 'parentUnitId',
                };
              },
            ],
          };
        },
      },
      {
        name: 'unitId',
        bind: 'unitLov.unitId',
      },
      {
        name: 'unitName',
        bind: 'unitLov.unitName',
        label: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
      },
      {
        name: 'remark',
        label: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
        validator: (value) => {
          // 校验器 自定义校验规则对内容进行校验
          if (value?.length > 480) {
            return intl.get('hzero.common.validation.max', { max: 480 });
          } else {
            return true;
          }
        },
      },
      {
        name: 'lineAmount',
        type: 'currency',
        disabled: true,
        label: intl.get(`${commonPrompt}.reqLineAmount`).d('申请总额(不含税)'),
      },
      {
        name: 'batchEditFieldMap',
        type: 'object',
      },
      // 批量维护字段弃用
      // {
      //   name: 'batchMaintainDate',
      // },
      // {
      //   name: 'batchInvOrganizationId',
      // },
      // {
      //   name: 'batchCostId',
      // },
      // {
      //   name: 'batchWbsCode',
      // },
      // {
      //   name: 'batchReceiveAddress',
      // },
      // {
      //   name: 'batchReceiveContactName',
      // },
      // {
      //   name: 'batchReceiveTelNum',
      // },
      // {
      //   name: 'batchBudgetAccountId',
      // },
      // {
      //   name: 'batchBudgetAccountNum',
      // },
      // {
      //   name: 'batchProjectNum',
      // },
      // {
      //   name: 'batchProjectName',
      // },
      // {
      //   name: 'batchInnerPoNum',
      // },
      // {
      //   name: 'batchRemark',
      // },
      // {
      //   name: 'batchProjectCategory',
      // },
      // {
      //   name: 'batchExpBearDepId',
      // },
      // {
      //   name: 'batchAccountSubjectId',
      // },
      // {
      //   name: 'batchAccountSubjectNum',
      // },
      {
        name: 'prHeaderId',
      },
      // 采买组织
      {
        name: 'prSourcePlatform',
        label: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
      },
      {
        name: 'companyLov',
        label: intl.get(`entity.company.tag`).d('公司'),
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        ignore: 'always',
        textField: 'companyName',
        valueField: 'companyId',
        type: 'object',
        dynamicProps: {
          required: ({ record }) =>
            !record.get('prSourcePlatform') || record.get('prSourcePlatform') !== 'ERP',
          disabled: ({ record }) => {
            return (
              (record.get('prSourcePlatform') && record.get('prSourcePlatform') !== 'SRM') ||
              record.get('prHeaderId')
            );
          },
        },
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
      },
      {
        name: 'companyId',
        bind: 'companyLov.companyId',
      },
      {
        name: 'companyName',
        bind: 'companyLov.companyName',
        label: intl.get(`entity.company.tag`).d('公司'),
      },
      {
        name: 'ouLov',
        label: intl.get(`entity.business.tag`).d('业务实体'),
        lovCode: 'SPFM.USER_AUTH.OU',
        textField: 'ouName',
        type: 'object',
        ignore: 'always',
        dynamicProps: {
          required: ({ record }) =>
            !record.get('prSourcePlatform') || record.get('prSourcePlatform') !== 'ERP',
          disabled({ record }) {
            return (
              !record.get('companyId') ||
              !!(record.get('prSourcePlatform') && record.get('prSourcePlatform') !== 'SRM') ||
              !!record.get('prHeaderId')
            );
          },
          lovPara({ record }) {
            return {
              companyId: record.get('companyId'),
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'ouId',
        bind: 'ouLov.ouId',
      },
      {
        name: 'ouName',
        bind: 'ouLov.ouName',
        label: intl.get(`entity.business.tag`).d('业务实体'),
      },
      {
        name: 'purchaseOrgLov',
        ignore: 'always',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
          required: ({ record }) =>
            !record.get('prSourcePlatform') || record.get('prSourcePlatform') !== 'ERP',
          disabled({ record }) {
            return !record.get('companyId') || !record.get('ouId');
          },
          lovPara({ record }) {
            return {
              ouId: record.get('ouId'),
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'purchaseOrgId',
        bind: 'purchaseOrgLov.purchaseOrgId',
      },
      {
        name: 'purchaseOrgName',
        bind: 'purchaseOrgLov.organizationName',
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
      },
      {
        name: 'purchaseAgentLov',
        ignore: 'always',
        label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
        lovCode: 'SPUC.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        dynamicProps: {
          required: ({ record }) =>
            !record.get('prSourcePlatform') || record.get('prSourcePlatform') !== 'ERP',
          lovPara: ({ record }) => {
            return {
              purchaseOrgIds: record.get('purchaseOrgId'),
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'purchaseAgentId',
        bind: 'purchaseAgentLov.purchaseAgentId',
        label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentLov.purchaseAgentName',
        label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
      },

      // 收货/收单信息
      {
        name: 'receiverContactName',
        label: intl.get(`${commonPrompt}.receiverContactName`).d('收货联系人'),
      },
      {
        name: 'receiverTelNum',
        label: intl.get(`${commonPrompt}.receiverTelNum`).d('收货联系电话'),
      },
      {
        name: 'receiverAddressName',
        label: intl.get(`${commonPrompt}.receiverAddress`).d('收货方地址'),
      },
      {
        name: 'invoiceAddressLov',
        label: intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址'),
        type: 'object',
        ignore: 'always',
        valueField: 'addressId',
        textField: 'areaAddress',
        lovCode: 'SMAL.INVOICE_ADDRESS_LIST',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lovPara: ({ record }) => {
            return {
              addressType: 'INVOICE',
              companyId: record.get('companyId'),
              enabledFlag: 1,
              belongType: 1,
            };
          },
        },
      },
      {
        name: 'invoiceAddressId',
        bind: 'invoiceAddressLov.addressId',
      },
      {
        name: 'invoiceAddress',
        bind: 'invoiceAddressLov.areaAddress',
        label: intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址'),
      },
      {
        name: 'invoiceAddressName',
        bind: 'invoiceAddressLov.areaAddress',
        label: intl.get(`${commonPrompt}.invoiceAddress`).d('收单方地址'),
      },
      {
        name: 'invoiceContactName',
        label: intl.get(`${commonPrompt}.invoiceContactName`).d('收单联系人'),
      },
      {
        name: 'invoiceTelNum',
        label: intl.get(`${commonPrompt}.invoiceTelNum`).d('收单联系电话'),
      },
      {
        name: 'receiverEmailAddress',
        label: intl.get(`${commonPrompt}.receiverEmail`).d('收单邮箱'),
      },
      {
        name: 'purchaseUnitName',
        label: intl.get(`${commonPrompt}.purchaseUnitName`).d('收货方组织'),
      },

      // 开票信息
      {
        name: 'invoiceTitle',
        label: intl.get(`${commonPrompt}.invoiceTitle`).d('发票抬头'),
      },
      {
        name: 'taxRegisterNum',
        label: intl.get(`${commonPrompt}.taxRegisterNum`).d('税务登记号'),
      },
      {
        name: 'taxRegisterAddress',
        label: intl.get(`${commonPrompt}.taxRegisterAddress`).d('税务登记地址'),
      },
      {
        name: 'taxRegisterTel',
        label: intl.get(`${commonPrompt}.taxRegisterTel`).d('公司电话'),
      },
      {
        name: 'taxRegisterBank',
        label: intl.get(`${commonPrompt}.taxRegisterBank`).d('开户行'),
      },
      {
        name: 'taxRegisterBankAccount',
        label: intl.get(`${commonPrompt}.taxRegisterBankAccount`).d('开户行账号'),
      },
      {
        name: 'invoiceMethodCodeLov',
        label: intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式'),
        type: 'object',
        valueField: 'valueCode',
        ignore: 'always',
        textField: 'valueName',
        lookupCode: 'SMAL.EC_INVOICE_METHOD_TYPE_VAL',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lovPara: ({ record }) => ({
            companyId: record.get('companyId'),
            valueType: 'INVOICE_METHOD',
            tenantId: organizationId,
            platformCode: record.get('platformCode'),
          }),
        },
      },
      {
        name: 'invoiceMethodCode',
        bind: 'invoiceMethodCodeLov.valueCode',
      },
      {
        name: 'invoiceMethodName',
        bind: 'invoiceMethodCodeLov.valueName',
        label: intl.get(`${commonPrompt}.invoiceMethodCode`).d('开票方式'),
      },
      {
        name: 'invoiceTypeCodeLov',
        label: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
        type: 'object',
        valueField: 'valueCode',
        ignore: 'always',
        textField: 'valueName',
        lookupCode: 'SMAL.EC_INVOICE_METHOD_TYPE_VAL',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lovPara: ({ record }) => ({
            companyId: record.get('companyId'),
            valueType: 'INVOICE_TITLE',
            tenantId: organizationId,
            platformCode: record.get('platformCode'),
          }),
        },
      },
      {
        name: 'invoiceTypeCode',
        bind: 'invoiceTypeCodeLov.valueCode',
      },
      {
        name: 'invoiceTypeName',
        bind: 'invoiceTypeCodeLov.valueName',
        label: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
      },
      {
        name: 'invoiceTitleTypeCodeLov',
        label: intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式'),
        type: 'object',
        valueField: 'valueCode',
        ignore: 'always',
        textField: 'valueName',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lookupAxiosConfig: ({ record }) => ({
            url: '/smal/v1/lovs/sql/data',
            params: {
              companyId: record.get('companyId'),
              lovCode: 'SMAL.EC_CLIENT_VALUES',
              valueType: 'INVOICE_TITLE',
              tenantId: organizationId,
              platformCode: record.get('platformCode'),
            },
            transformResponse(data) {
              const paymentArr = typeof data === 'string' ? JSON.parse(data).content : data;
              return paymentArr || [];
            },
          }),
        },
      },
      {
        name: 'invoiceTitleTypeCode',
        bind: 'invoiceTitleTypeCodeLov.valueCode',
      },
      {
        name: 'invoiceTitleTypeName',
        bind: 'invoiceTitleTypeCodeLov.valueName',
        label: intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式'),
      },
      {
        name: 'invoiceDetailTypeCodeLov',
        label: intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细'),
        type: 'object',
        valueField: 'valueCode',
        ignore: 'always',
        textField: 'valueName',
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lookupAxiosConfig: ({ record }) => ({
            url: '/smal/v1/lovs/sql/data',
            params: {
              companyId: record.get('companyId'),
              lovCode: 'SMAL.EC_CLIENT_VALUES',
              valueType: 'INVOICE_DETAIL',
              tenantId: organizationId,
              platformCode: record.get('platformCode'),
            },
            transformResponse(data) {
              const paymentArr = typeof data === 'string' ? JSON.parse(data).content : data;
              return paymentArr || [];
            },
          }),
        },
      },
      {
        name: 'invoiceDetailTypeCode',
        bind: 'invoiceDetailTypeCodeLov.valueCode',
        label: intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细'),
      },
      {
        name: 'invoiceDetailTypeName',
        bind: 'invoiceDetailTypeCodeLov.valueName',
        label: intl.get(`${commonPrompt}.invoiceDetail`).d('发票明细'),
      },

      // 附件信息
      {
        name: 'attachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        label: intl.get('sprm.common.model.common.enterEnclosure').d('内部附件'),
        bucketDirectory: limitAttr()?.bucketDirectory || limitator()?.bucketDirectory || 'sprm-pr',
        max: limitAttr()?.maxCount || limitator()?.maxCount,
      },
      {
        name: 'externalAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        label: intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件'),
        bucketDirectory: limitAttr()?.bucketDirectory || 'sprm-pr',
        max: limitAttr()?.maxCount,
      },
      {
        name: 'changeAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        label: intl.get('sprm.common.view.attachment.changeAttachmentUuid').d('变更说明附件'),
        bucketDirectory: limitAttr()?.bucketDirectory || 'sprm-pr',
        max: limitAttr()?.maxCount,
      },
      {
        name: 'prStatusCode',
        label: intl.get(`hzero.common.status`).d('状态'),
        lookupCode: 'SPRM.PR_STATUS',
      },
      // 审批意见 保留字段
      {
        name: 'approvedRemark',
      },
      // 采购申请变更，删除行Ids
      {
        name: 'changeDeleteLineIds',
      },
    ].concat(cuxAddField),
    children: {
      prLineList: listDs,
      addLineList: pubPathFlag ? [] : addLineDs,
    },
  };
};
