import intl from 'utils/intl';
import { SRM_SPRM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
// import moment from 'moment';
// import { DATETIME_MIN } from 'utils/constants';
import { fetchAutoGetCompany } from '@/services/purchasePlatformService';
import { lovDefineAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { c7nAmountFormatterOptions } from '@/routes/utils';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'sprm.common.model.common';

const baseDs = ({ handleDetailField }) => {
  return {
    paging: false,
    dataToJSON: 'all',
    // autoCreate: true,
    autoQuery: false,
    fields: [
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
        maxLength: 120,
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
          required: ({ record }) => record.get('prSourcePlatform') !== 'ERP',
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

        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('financialPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) =>
            record.get('prSourcePlatform') === 'SRM' ? record.get('financialPrecision') : undefined
          ),
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
        disabled: true,
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return (
              record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
            );
          }),
        },
      },
      {
        name: 'localCurrencyTaxSum',
        label: intl.get(`${commonPrompt}.localCurrencyTaxSum`).d('本币金额(含税)'),
        disabled: true,
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return (
              record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
            );
          }),
        },
      },
      {
        name: 'paymentMethodCode',
        label: intl.get(`${commonPrompt}.paymentMethodCode`).d('支付方式'),
        type: 'object',
        valueField: 'valueCode',
        ignore: 'always',
        textField: 'valueName',
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
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
              unitId: record.get('unitId'),
            };
          },
        },
        optionsProps: {
          paging: 'server',
        },
        lovDefineAxiosConfig: code => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              data => {
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
      },
      {
        name: 'lineAmount',
        disabled: true,
        label: intl.get(`${commonPrompt}.reqLineAmount`).d('申请总额(不含税)'),
        dynamicProps: {
          type: ({ record }) => (record.get('prSourcePlatform') === 'SRM' ? 'currency' : 'number'),
          formatterOptions: c7nAmountFormatterOptions(() => {}),
        },
      },
      {
        label: intl.get('sprm.common.model.common.enterEnclosure').d('内部附件'),
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        type: 'attachment',
        viewMode: 'popup',
        name: 'attachmentUuid',
      },
      {
        label: intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件'),
        type: 'attachment',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        name: 'externalAttachmentUuid',
        viewMode: 'popup',
      },
      {
        name: 'batchMaintainDate',
      },
      {
        name: 'batchInvOrganizationId',
      },
      {
        name: 'batchCostId',
      },
      {
        name: 'batchWbsCode',
      },
      {
        name: 'batchReceiveAddress',
      },
      {
        name: 'batchReceiveContactName',
      },
      {
        name: 'batchReceiveTelNum',
      },
      {
        name: 'batchBudgetAccountId',
      },
      {
        name: 'batchBudgetAccountNum',
      },
      {
        name: 'batchProjectNum',
      },
      {
        name: 'batchProjectName',
      },
      {
        name: 'batchInnerPoNum',
      },
      {
        name: 'batchRemark',
      },
      {
        name: 'batchProjectCategory',
      },
      {
        name: 'batchExpBearDepId',
      },
      {
        name: 'batchAccountSubjectId',
      },
      {
        name: 'batchAccountSubjectNum',
      },
    ],
  };
};

const purchaseOrgInfoDs = () => {
  return {
    paging: false,
    // autoCreate: true,
    autoQuery: false,
    fields: [
      {
        name: 'prHeaderId',
      },
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
        required: true,
        dynamicProps: {
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
        required: true,
        dynamicProps: {
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
        required: true,
        label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        lovCode: 'HPFM.PURCHASE_ORGANIZATION',
        textField: 'organizationName',
        type: 'object',
        dynamicProps: {
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
        required: true,
        label: intl.get(`entity.organization.class.purchaseAgentName`).d('采购员'),
        lovCode: 'SPUC.PURCHASE_AGENT',
        textField: 'purchaseAgentName',
        valueField: 'purchaseAgentId',
        type: 'object',
        dynamicProps: {
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
    ],
    events: {
      update: ({ record, name, value = {} }) => {
        if (name === 'companyLov' && value) {
          fetchAutoGetCompany({ companyId: value.companyId }).then(res => {
            if (res) {
              const { ouId, ouCode, ouName, purchaseOrgId, purchaseOrgName } = res;
              record.set({ ouLov: { ouId, ouCode, ouName } });
              record.set({ purchaseOrgLov: { purchaseOrgId, purchaseOrgName } });
            }
          });
        }
        if (name === 'ouLov' && value) {
          fetchAutoGetCompany({ companyId: record.get('companyId'), ouId: value.ouId }).then(
            res => {
              if (res) {
                const { purchaseOrgId, purchaseOrgName } = res;
                record.set({ purchaseOrgLov: { purchaseOrgId, purchaseOrgName } });
              }
            }
          );
        }
      },
    },
  };
};

const deliveryInfoDs = ({ handleDetailField }) => {
  return {
    fields: [
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
        required: true,
        valueField: 'addressId',
        textField: 'areaAddress',
        lovCode: 'SMAL.INVOICE_ADDRESS_LIST',
        dynamicProps: {
          // textField: ({ record }) =>
          //   record.get('newMallFlag') === 0 ? 'areaAddress' : 'fullAddress',
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lovPara: () => {
            return {
              addressType: 'INVOICE',
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
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
    ],
    events: {
      update: ({ record, name, value = {} }) => {
        if (name === 'invoiceAddressLov' && value) {
          const { contactName, mobile, email } = value;
          record.set({ invoiceContactName: contactName });
          record.set({ invoiceTelNum: mobile });
          record.set({ receiverEmailAddress: email });
        }
      },
    },
  };
};

const billInfoDs = ({ handleDetailField }) => {
  return {
    fields: [
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
        dynamicProps: {
          required: ({ record }) => record.get('prSourcePlatform') === 'E-COMMERCE',
          lookupAxiosConfig: ({ record }) => ({
            url: '/smal/v1/lovs/sql/data',
            params: {
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
              lovCode: 'SMAL.EC_CLIENT_VALUES',
              valueType: 'INVOICE_METHOD',
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
              valueType: 'INVOICE_TYPE',
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
        name: 'invoiceTypeCode',
        bind: 'invoiceTypeCodeLov.valueCode',
      },
      {
        name: 'invoiceTypeName',
        bind: 'invoiceTypeCodeLov.valueName',
        label: intl.get(`${commonPrompt}.invoiceTypeCode`).d('发票形式'),
      },
      // 开票方式】【开票抬头类型】【开票类型】【开票明细类型
      {
        name: 'invoiceTitleTypeCodeLov',
        label: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
        type: 'object',
        valueField: 'valueCode',
        ignore: 'always',
        required: true,
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
        label: intl.get(`${commonPrompt}.invoiceType`).d('发票类型'),
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
    ],
  };
};

const batchMaintainDs = ({ handleDetailField }) => ({
  paging: false,
  autoQuery: false,
  autoCreate: true,
  fields: [
    {
      name: 'receiveAddress',
      label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
      dynamicProps: {
        disabled() {
          const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
          return prSourcePlatform !== 'SRM' && prSourcePlatform;
        },
      },
    },
    {
      name: 'receiveContactName',
      label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
      dynamicProps: {
        disabled() {
          const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
          return prSourcePlatform !== 'SRM' && prSourcePlatform;
        },
      },
    },
    {
      name: 'receiveTelNum',
      label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
      dynamicProps: {
        disabled() {
          const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
          return prSourcePlatform !== 'SRM' && prSourcePlatform;
        },
      },
    },
    {
      label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
      name: 'projectNum',
    },
    {
      label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
      name: 'projectName',
    },
    {
      name: 'innerPoNum',
      label: intl.get(`sprm.common.model.common.inpaperNum`).d('内部订单号'),
    },
    {
      name: 'remark',
      label: intl.get(`sprm.common.model.common.remark`).d('备注'),
    },
    {
      label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
      name: 'budgetAccountLov',
      type: 'object',
      // ignore: 'always',
      lovCode: 'SMDM.BUDGET_ACCOUNT',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
          };
        },
      },
      valueField: 'budgetAccountId',
      textField: 'budgetAccountName',
    },
    {
      bind: 'budgetAccountLov.budgetAccountId',
      name: 'budgetAccountId',
    },
    {
      bind: 'budgetAccountLov.budgetAccountNum',
      name: 'budgetAccountNum',
    },
    {
      bind: 'budgetAccountLov.budgetAccountName',
      label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
      name: 'budgetAccountName',
    },
    {
      label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      name: 'projectCategoryLov',
      type: 'object',
      // ignore: 'always',
      lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
    },
    {
      name: 'projectCategory',
      bind: 'projectCategoryLov.value',
    },
    {
      name: 'projectCategoryMeaning',
      bind: 'projectCategoryLov.meaning',
      label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
    },
    {
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      name: 'expBearDepLov',
      type: 'object',
      // ignore: 'always',
      valueField: 'unitId',
      textField: 'unitName',
      lovCode: 'SPFM.UNIT_G_C',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
            // unitTypeCode: 'D',
            unitCompanyId: handleDetailField('baseRef', 'parentUnitId'),
          };
        },
      },
    },
    {
      name: 'expBearDepName',
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      bind: 'expBearDepLov.unitName',
    },
    {
      name: 'expBearDepId',
      bind: 'expBearDepLov.unitId',
    },
    {
      name: 'expBearDep',
      label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
      bind: 'expBearDepLov.unitName',
    },
    {
      name: 'accountSubjectLov',
      type: 'object',
      // ignore: 'always',
      lovCode: 'SPRM.ACCOUNT_SUBJECT',
      label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      valueField: 'accountSubjectId',
      textField: 'accountSubjectName',
      lovPara: {
        tenantId: organizationId,
        // companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
      },
    },
    {
      name: 'accountSubjectId',
      bind: 'accountSubjectLov.accountSubjectId',
    },
    {
      name: 'accountSubjectNum',
      bind: 'accountSubjectLov.accountSubjectNum',
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
      name: 'accountSubjectName',
      bind: 'accountSubjectLov.accountSubjectName',
    },
    {
      name: 'inventoryId',
      type: 'object',
      // ignore: 'always',
      lovCode: 'SPRM.INVENTORY',
      label: intl.get(`sprm.common.model.inventoryName`).d('库房'),
      valueField: 'inventoryId',
      textField: 'inventoryName',
      lovPara: { tenantId: organizationId },
      dynamicProps: {
        disabled({ record }) {
          return !record.get('invOrganizationId');
        },
      },
      transformResponse(value, data) {
        if (value) {
          return {
            inventoryId: value,
            inventoryName: data.inventoryName,
            inventoryIdMeaning: data.inventoryName,
          };
        } else {
          return null;
        }
      },
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('库房'),
      name: 'inventoryIdMeaning',
      bind: 'inventoryId.inventoryName',
    },
    {
      label: intl.get(`sprm.common.model.sumProject`).d('库房'),
      name: 'inventoryName',
      bind: 'inventoryId.inventoryName',
    },
    {
      label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
      name: 'neededDate',
      type: 'date',
    },
    {
      name: 'invOrganizationIdLov',
      type: 'object',
      lovCode: 'SPFM.USER_AUTH.INVORG',
      // ignore: 'always',
      dynamicProps: {
        lovPara() {
          return {
            ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
            enabledFlag: 1,
            tenantId: organizationId,
          };
        },
      },
      valueField: 'organizationId',
      textField: 'organizationName',
      label: intl.get('entity.organization.class.inventory').d('库存组织'),
    },
    {
      name: 'invOrganizationId',
      bind: 'invOrganizationIdLov.organizationId',
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationIdLov.organizationName',
    },
    {
      name: 'batchAddress',
      bind: 'invOrganizationIdLov.address',
    },
    {
      name: 'costLov',
      type: 'object',
      // ignore: 'always',
      label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      lovCode: 'SPRM.COST_CENTER',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
            companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
          };
        },
      },
      valueField: 'costId',
      textField: 'costName',
    },
    {
      name: 'costId',
      bind: 'costLov.costId',
    },
    {
      label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
      name: 'costName',
      bind: 'costLov.costName',
    },
    {
      name: 'costCode',
      bind: 'costLov.costCode',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbsLov',
      type: 'object',
      // ignore: 'always',
      lovCode: 'SMDM.WBS',
      dynamicProps: {
        lovPara() {
          return {
            tenantId: organizationId,
            companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
            ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
          };
        },
      },
      valueField: 'wbsCode',
      textField: 'wbsName',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbsCode',
      bind: 'wbsLov.wbsCode',
    },
    {
      label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
      name: 'wbs',
      bind: 'wbsLov.wbsName',
    },
  ],
});

const historyDs = prHeaderId => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      label: intl.get('entity.roles.operator').d('操作人'),
      name: 'processUserName',
    },
    {
      label: intl.get(`${commonPrompt}.handleDate`).d('操作时间'),
      name: 'processedDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`${commonPrompt}.motion`).d('动作'),
      width: 100,
      name: 'processTypeCodeMeaning',
    },
    {
      label: intl.get(`${commonPrompt}.handleRemark`).d('操作说明'),
      name: 'processRemark',
    },
    {
      label: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
      name: 'changeField',
    },
    {
      label: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
      name: 'displayLineNum',
    },
    {
      label: intl.get(`${commonPrompt}.beforeModify`).d('修改前'),
      name: 'oldValue',
    },
    {
      label: intl.get(`${commonPrompt}.afterModify`).d('修改后'),
      name: 'newValue',
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId}/actions`,
        method: 'GET',
      };
    },
  },
});

const lineDs = ({ prHeaderId, handleDetailField, customizeUnitCode, workFlowFlag, pageType }) => {
  const precisionType = pageType === 'query' ? 'formatterOptions' : 'precision';
  return {
    autoQuery: false,
    dataToJSON: 'all',
    cacheSelection: true,
    cacheModified: true,
    pageSize: 20,
    paging: prHeaderId,
    primaryKey: 'displayLineNum',
    fields: [
      {
        name: 'displayLineNum',
        label: intl.get(`sprm.common.model.common.lineNumber`).d('行号'),
      },
      {
        label: intl.get(`sprm.common.model.common.docFlow`).d('单据流'),
        type: 'string',
        name: 'docFlow',
      },
      {
        name: 'prLineStatusCodeMeaning',
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'invOrganizationIdLov',
        type: 'object',
        lovCode: 'SPFM.USER_AUTH.INVORG',
        ignore: 'always',
        dynamicProps: {
          lovPara() {
            return {
              ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
              enabledFlag: 1,
              tenantId: organizationId,
            };
          },
          required() {
            return !(
              handleDetailField('baseRef', 'prSourcePlatform') &&
              handleDetailField('baseRef', 'prStatusCode') === 'reject'
            );
          },
        },
        valueField: 'organizationId',
        textField: 'organizationName',
        label: intl.get('entity.organization.class.inventory').d('库存组织'),
      },
      {
        name: 'invOrganizationId',
        bind: 'invOrganizationIdLov.organizationId',
      },
      {
        name: 'invOrganizationName',
        bind: 'invOrganizationIdLov.organizationName',
      },
      {
        label: intl.get(`sprm.common.model.common.productNum`).d('商品编码'),
        name: 'productNum',
        dynamicProps: {
          disabled({ record }) {
            return record.get('freightLineFlag') !== 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.thirdSkuCode`).d('第三方商品编码'),
        name: 'thirdSkuCode',
      },
      {
        label: intl.get(`sprm.common.model.common.thirdSkuName`).d('第三方商品名称'),
        name: 'thirdSkuName',
      },
      {
        label: intl.get(`sprm.common.model.common.productName`).d('商品名称'),
        name: 'productName',
        dynamicProps: {
          disabled({ record }) {
            return record.get('freightLineFlag') !== 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.productBrand`).d('商品品牌'),
        name: 'productBrand',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.productModel`).d('商品型号'),
        name: 'productModel',
      },
      {
        label: intl.get(`sprm.common.shoppingMall.model.packingList`).d('商品规格'),
        name: 'packingList',
      },
      // {
      //   name: 'itemLimitRule',
      //   label: intl.get(`sprm.common.model.common.itemLimitRule`).d('物料限制条件'),
      // },
      {
        name: 'itemCodeLov',
        label: intl.get(`sprm.common.model.common.itemCode`).d('物料编码'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_RELATE_PUR_PRICE',
        textField: 'itemCode',
        valueField: 'itemId',
        dynamicProps: {
          disabled({ record, dataSet }) {
            // 物料分类
            // console.log(other);
            const { itemLimitRule = [] } = dataSet.queryParameter;
            const categoryId = record.get('categoryId');
            const invOrganizationId = record.get('invOrganizationId');
            if (itemLimitRule.find(rule => rule === 'categoryId')) {
              if (!categoryId) {
                return true;
              }
            }
            // 库存组织
            if (itemLimitRule.find(rule => rule === 'invOrganizationId')) {
              if (!invOrganizationId) {
                return true;
              }
            }
            const prSourcePlatform = handleDetailField('baseRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
          lovPara({ record, dataSet }) {
            const params = {
              enabledFlag: 1,
              tenantId: organizationId,
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
              headerCategoryId: handleDetailField('baseRef', 'categoryId'),
              lineCategoryId: record.get('categoryId'),
              prTypeId: handleDetailField('baseRef', 'prTypeId'),
            };
            const { itemLimitRule = [] } = dataSet.queryParameter;
            // 物料分类
            if (itemLimitRule.find(rule => rule === 'categoryId')) {
              params.categoryId = record.get('categoryId');
            }
            // 库存组织
            if (itemLimitRule.find(rule => rule === 'invOrganizationId')) {
              params.invOrganizationId = record.get('invOrganizationId');
            }
            return params;
          },
        },
      },
      {
        name: 'itemCode',
        bind: 'itemCodeLov.itemCode',
      },
      {
        name: 'itemId',
        bind: 'itemCodeLov.itemId',
      },
      {
        name: 'itemName',
        required: true,
        label: intl.get('entity.item.name').d('物料名称'),
        type: 'string',
      },
      {
        label: intl.get(`${commonPrompt}.customMadeFlag`).d('是否定制'),
        name: 'customMadeFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl.get(`${commonPrompt}.customAttributeList`).d('物料定制属性'),
        name: 'customAttributeList',
      },
      {
        label: intl.get(`sprm.common.model.common.itemModel`).d('型号'),
        name: 'itemModel',
        dynamicProps: {
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform && prSourcePlatform !== 'SRM';
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.itemSpecs`).d('规格'),
        name: 'itemSpecs',
        dynamicProps: {
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'poLineId',
        label: intl.get(`sprm.common.model.common.lastPurPrice`).d('上次采购单价'),
      },
      {
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
        name: 'categoryLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ITEM_CATEGOR_TILED',
        // lovCode: 'SPRM.ITEM_CATEGOR',
        // textField: 'itemCode',
        // valueField: 'itemId',
        dynamicProps: {
          lovPara({ record }) {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              purchaseOrgId: handleDetailField('purchaseOrgInfoRef', 'purchaseOrgId'),
              queryCategoryId: handleDetailField('baseRef', 'purchaseOrgId'),
              itemId: record.get('itemId'),
              prTypeId: handleDetailField('baseRef', 'prTypeId'),
            };
          },
        },
        optionsProps: {
          paging: 'server',
        },
        lovDefineAxiosConfig: code => {
          const lovConfig = lovDefineAxiosConfig(code);
          return {
            ...lovConfig,
            transformResponse: [
              ...lovConfig.transformResponse,
              data => {
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
      },
      {
        name: 'categoryId',
        bind: 'categoryLov.categoryId',
      },
      {
        name: 'categoryName',
        bind: 'categoryLov.categoryName',
        label: intl.get(`sprm.common.model.common.categoryName`).d('物料分类'),
      },
      {
        label: intl.get(`sprm.common.model.common.catalogName`).d('商品目录'),
        name: 'catalogName',
        dynamicProps: {
          disabled({ record }) {
            return record.get('freightLineFlag') !== 1;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.neededDate`).d('需求日期'),
        name: 'neededDate',
        required: true,
        // min: moment().format(DATETIME_MIN),
        type: 'date',
      },
      {
        name: 'quantity',
        validator(value) {
          if (value <= 0) {
            return intl.get(`sprm.common.message.mustExceedZero`).d('数量必须大于零');
          } else {
            return true;
          }
        },
        dynamicProps: {
          required() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return !(prSourcePlatform === 'E-COMMERCE' || prSourcePlatform === 'CATALOGUE');
          },
          precision: ({ record }) => {
            return record.get('uomPrecision') ?? 10;
          },
          disabled: () => {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform);
          },
        },
        label: intl.get(`sprm.common.model.common.purchaseQuantity`).d('申请数量'),
        type: 'number',
      },
      {
        name: 'orderExecuteStatus',
        lookupCode: 'SPRM.PR_ORDER_EXECUTE_STATUS',
        label: intl.get(`${commonPrompt}.orderExecuteStatus`).d('履约链路执行状态'),
      },
      {
        name: 'sourceExecuteStatus',
        lookupCode: 'SPRM.PR_SOURCE_EXECUTE_STATUS',
        label: intl.get(`${commonPrompt}.sourceExecuteStatus`).d('寻源链路执行状态'),
      },
      {
        label: intl.get(`${commonPrompt}.sourceOccupiedQuantity`).d('寻源链路占用数量'),
        name: 'sourceOccupiedQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.orderOccupiedQuantity`).d('履约链路占用数量'),
        name: 'orderOccupiedQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.restSourceQuantity`).d('寻源链路可用数量'),
        name: 'restSourceQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.orderRestPoQuantity`).d('履约链路可用数量'),
        name: 'restPoQuantity',
        type: 'number',
      },
      {
        name: 'secondLevelStrategyCode',
        label: intl.get(`${commonPrompt}.secondLevelStrategyCode`).d('寻源链路执行规则'),
        type: 'string',
        lookupCode: 'SPRM.SECOND_LEVEL_STRATEGY',
      },
      {
        name: 'uomLov',
        label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
        lovCode: 'SMDM.DUAL_UOM_ID',
        type: 'object',
        textField: 'uomCodeAndName',
        ignore: 'always',
        required: true,
        valueField: 'uomId',
      },
      {
        name: 'uomPrecision',
        type: 'number',
        bind: 'uomLov.uomPrecision',
      },
      {
        name: 'uomId',
        bind: 'uomLov.uomId',
      },
      {
        label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
        name: 'uomCode',
        bind: 'uomLov.uomCode',
      },
      {
        name: 'uomName',
        label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
        bind: 'uomLov.uomName',
      },
      {
        label: intl.get(`sprm.common.model.common.uomName`).d('单位'),
        name: 'uomCodeAndName',
        bind: 'uomLov.uomCodeAndName',
      },
      {
        name: 'taxLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.TAX',
        textField: 'taxCode',
        label: intl.get(`sprm.common.model.common.taxType`).d('税种'),
      },
      {
        name: 'taxId',
        bind: 'taxLov.taxId',
      },
      {
        name: 'taxCode',
        bind: 'taxLov.taxCode',
      },
      {
        name: 'includedTaxFlag',
        bind: 'taxLov.includedTaxFlag',
      },
      {
        name: 'taxRate',
        type: 'number',
        label: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        bind: 'taxLov.taxRate',
      },
      {
        name: 'currencyLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.EXCHANGE_RATE.CURRENCY',
        textField: 'currencyCode',
        valueField: 'currenyCode',
        disabled: true,
        label: intl.get('sprm.common.model.common.currency').d('币种'),
      },
      {
        name: 'currencyCode',
        bind: 'currencyLov.currencyCode',
        label: intl.get('sprm.common.model.common.currency').d('币种'),
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedUnitPrice`).d('预估单价(含税)'),
        name: 'taxIncludedUnitPrice',
        numberGrouping: true,
        dynamicProps: {
          [precisionType]:
            precisionType === 'formatterOptions'
              ? c7nAmountFormatterOptions(({ record }) => {
                  return record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
                    ? Number(record.get('defaultPrecision'))
                    : undefined;
                })
              : ({ record }) => {
                  return record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
                    ? Number(record.get('defaultPrecision'))
                    : undefined;
                },
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
              ? 'currency'
              : 'number',
          disabled: () => {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return ['E-COMMERCE', 'CATALOGUE'].includes(prSourcePlatform);
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.lineAmount`).d('行金额(不含税)'),
        name: 'lineAmount',
        numberGrouping: true,
        type: 'number',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' && record.get('financialPrecision')
              ? Number(record.get('financialPrecision'))
              : undefined;
          }),
        },
      },
      {
        label: intl.get(`sprm.common.model.common.unitPrice`).d('单价(不含税)'),
        name: 'unitPrice',
        numberGrouping: true,
        type: 'number',
        disabled: true,
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision') // 单价
              ? Number(record.get('defaultPrecision'))
              : undefined;
          }),
        },
      },

      {
        label: intl.get(`sprm.common.model.common.lastPurPrice`).d('上次采购单价'),
        name: 'lastPurPrice',
        type: 'number',
      },
      {
        label: intl.get(`sprm.common.model.common.unitPriceBatch`).d('每'),
        type: 'number',
        name: 'unitPriceBatch',
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedLineAmount`).d('行金额'),
        name: 'taxIncludedLineAmount',
        disabled: true,
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('financialPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('financialPrecision')
              : undefined;
          }),
        },
      },
      {
        name: 'localCurrencyNoTaxSum',
        disabled: true,
        label: intl.get('sprm.common.model.common.localCurrencyNoTaxSum').d('本币金额(不含税)'),
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('localFinancialPrecision')
              : undefined;
          }),
        },
      },
      {
        name: 'localCurrencyNoTaxUnit',
        disabled: true,
        label: intl.get('sprm.common.model.common.localCurrencyNoTaxUnit').d('本币单价(不含税)'),
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localDefaultPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('localDefaultPrecision')
              : undefined;
          }),
        },
      },
      {
        label: intl.get(`sprm.common.model.common.localCurrencyTaxSum`).d('本币金额(含税)'),
        name: 'localCurrencyTaxSum',
        disabled: true,
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localFinancialPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('localFinancialPrecision')
              : undefined;
          }),
        },
      },
      {
        label: intl.get(`sprm.common.model.common.localCurrencyTaxUnit`).d('本币单价(含税)'),
        name: 'localCurrencyTaxUnit',
        dynamicProps: {
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('localDefaultPrecision')
              ? 'currency'
              : 'number',
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('localDefaultPrecision')
              : undefined;
          }),
        },
        disabled: true,
      },
      {
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        name: 'supplierList',
        type: 'object',
        // ignore: 'always',
        multiple: true,
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
            };
          },
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
        lovCode: 'SPRM.SUPPLIER',
      },
      {
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        name: 'supplierCompanyIdLov',
        type: 'object',
        ignore: 'always',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              enabledFlag: 1,
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
            };
          },
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
        lovCode: 'SPRM.SUPPLIER',
      },
      {
        name: 'supplierCompanyId',
        bind: 'supplierCompanyIdLov.supplierCompanyId',
      },
      {
        name: 'supplierId',
        bind: 'supplierCompanyIdLov.supplierId',
      },
      {
        name: 'supplierCompanyCode',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
      },
      {
        name: 'supplierNum',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierNum',
      },
      {
        name: 'supplierCompanyNum',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyNum',
      },
      {
        name: 'supplierTenantId',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierTenantId',
      },
      {
        name: 'displaySupplierName',
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        type: 'string',
        bind: 'supplierCompanyIdLov.displaySupplierName',
      },
      {
        name: 'supplierName',
        label: intl.get(`sprm.common.model.common.supplierCompanyId`).d('建议供应商'),
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierName',
      },
      {
        name: 'supplierCompanyName',
        type: 'string',
        bind: 'supplierCompanyIdLov.supplierCompanyName',
      },
      {
        name: 'referencePriceDisplayFlag',
        label: intl.get(`sprm.common.model.common.referPrice`).d('参考价格'),
      },
      {
        name: 'prRequestedLov',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
        type: 'object',
        ignore: 'always',
        lovCode: 'SPCM.ACCEPT_USER',
        valueField: 'requestedBy',
        textField: 'prRequestedNumAndName',
        lovPara: { tenantId: organizationId },
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
            };
          },
        },
      },
      {
        name: 'requestedBy',
        bind: 'prRequestedLov.userId',
      },
      {
        name: 'prRequestedNum',
        bind: 'prRequestedLov.loginName',
      },
      {
        name: 'prRequestedName',
        bind: 'prRequestedLov.userName',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'prRequestedNumAndName',
        bind: 'prRequestedLov.prRequestedNumAndName',
        label: intl.get(`sprm.common.model.common.prMan`).d('申请人'),
      },
      {
        name: 'purchaseAgentLov',
        lovCode: 'SPRM.PURCHASE_AGENT',
        type: 'object',
        ignore: 'always',
        lovPara: { tenantId: organizationId },
        label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      },
      {
        name: 'purchaseAgentId',
        bind: 'purchaseAgentLov.purchaseAgentId',
      },
      {
        name: 'purchaseAgentName',
        bind: 'purchaseAgentLov.purchaseAgentName',
        label: intl.get(`sprm.common.model.common.purchaseAgents`).d('采购员'),
      },
      {
        label: intl.get(`sprm.common.model.common.handlePerson`).d('需求执行人'),
        name: 'executorName',
      },
      {
        name: 'accountSubjectLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPRM.ACCOUNT_SUBJECT',
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        valueField: 'accountSubjectId',
        textField: 'accountSubjectName',
        lovPara: { tenantId: organizationId },
      },
      {
        name: 'accountSubjectId',
        bind: 'accountSubjectLov.accountSubjectId',
      },
      {
        label: intl.get(`sprm.common.model.sumProject`).d('总账科目'),
        name: 'accountSubjectName',
        bind: 'accountSubjectLov.accountSubjectName',
      },
      {
        name: 'costLov',
        type: 'object',
        ignore: 'always',
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        lovCode: 'SPRM.COST_CENTER',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
            };
          },
        },
        textField: 'costName',
        valueField: 'costId',
      },
      {
        name: 'costId',
        bind: 'costLov.costId',
      },
      {
        name: 'costCode',
        bind: 'costLov.costCode',
      },
      {
        label: intl.get(`sprm.common.model.costCenter`).d('成本中心'),
        name: 'costName',
        bind: 'costLov.costName',
      },
      {
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        name: 'expBearDepLov',
        type: 'object',
        ignore: 'always',
        valueField: 'unitId',
        textField: 'unitName',
        lovCode: 'SPFM.UNIT_G_C',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
              unitCompanyId: handleDetailField('baseRef', 'parentUnitId'),
            };
          },
        },
      },
      {
        name: 'expBearDepName',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        bind: 'expBearDepLov.unitName',
      },
      {
        name: 'expBearDepId',
        bind: 'expBearDepLov.unitId',
      },
      {
        name: 'expBearDep',
        label: intl.get(`sprm.common.model.common.moneyPayPart`).d('费用承担部门'),
        bind: 'expBearDepLov.unitName',
      },
      {
        label: intl.get(`sprm.common.model.common.projectNum`).d('项目号'),
        name: 'projectNum',
      },
      {
        label: intl.get(`sprm.common.model.common.projectName`).d('项目名称'),
        name: 'projectName',
      },
      {
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
        name: 'projectCategoryLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SPUC.PR_LINE_PROJECT_CATEHORY',
      },
      {
        name: 'projectCategory',
        bind: 'projectCategoryLov.value',
      },
      {
        name: 'projectCategoryMeaning',
        bind: 'projectCategoryLov.meaning',
        label: intl.get(`sprm.common.model.common.projectCategory`).d('项目类别'),
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbsLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.WBS',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
              ouId: handleDetailField('purchaseOrgInfoRef', 'ouId'),
            };
          },
        },
        valueField: 'wbsCode',
        textField: 'wbsName',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbsCode',
        bind: 'wbsLov.wbsCode',
      },
      {
        label: intl.get(`sprm.common.model.wbs`).d('WBS元素'),
        name: 'wbs',
        bind: 'wbsLov.wbsName',
      },
      {
        label: intl.get(`sprm.common.model.common.taxIncludedBudgetUnitPrice`).d('预算单价(含税)'),
        name: 'taxIncludedBudgetUnitPrice',
        dynamicProps: {
          [precisionType]:
            precisionType === 'formatterOptions'
              ? c7nAmountFormatterOptions(({ record }) => {
                  return record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
                    ? Number(record.get('defaultPrecision'))
                    : undefined;
                })
              : ({ record }) => {
                  return record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
                    ? Number(record.get('defaultPrecision'))
                    : undefined;
                },
          type: ({ record }) =>
            record.get('prSourcePlatform') === 'SRM' && record.get('defaultPrecision')
              ? 'currency'
              : 'number',
        },
      },
      {
        label: intl.get(`sprm.common.model.common.budgetIoFlag`).d('预算外标识'),
        name: 'budgetIoFlag',
        type: 'boolean',
        trueValue: '1',
        falseValue: '0',
        transformResponse(data) {
          const value = data ? data.toString() : '0';
          return value;
        },
      },
      {
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'SMDM.BUDGET_ACCOUNT',
        dynamicProps: {
          lovPara() {
            return {
              tenantId: organizationId,
              companyId: handleDetailField('purchaseOrgInfoRef', 'companyId'),
            };
          },
        },
        valueField: 'budgetAccountId',
        textField: 'budgetAccountName',
      },
      {
        bind: 'budgetAccountLov.budgetAccountId',
        name: 'budgetAccountId',
      },
      {
        bind: 'budgetAccountLov.budgetAccountNum',
        name: 'budgetAccountNum',
      },
      {
        bind: 'budgetAccountLov.budgetAccountName',
        label: intl.get(`sprm.common.model.common.budgetAccountName`).d('预算科目'),
        name: 'budgetAccountName',
      },
      {
        label: intl.get(`sprm.common.model.common.xyNum`).d('协议编号'),
        name: 'pcNum',
      },
      {
        name: 'receiveAddress',
        label: intl.get(`sprm.common.model.receiveAddress`).d('收货地址'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'receiveContactName',
        label: intl.get(`sprm.common.model.common.receiverContactName`).d('收货联系人'),
        dynamicProps: {
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        name: 'internationalTelCode',
        label: intl.get(`sprm.common.model.common.internationalTelCode`).d('国别码'),
        lookupCode: 'HPFM.IDD',
        dynamicProps: {
          disabled: ({ record }) => record.getField('receiveTelNum').disabled,
          required: ({ record }) => record.getField('receiveTelNum').required,
        },
      },
      {
        name: 'receiveTelNum',
        label: intl.get(`sprm.common.model.common.receiverTelNum`).d('收货联系电话'),
        type: 'string',
        dynamicProps: {
          disabled() {
            const prSourcePlatform = handleDetailField('purchaseOrgInfoRef', 'prSourcePlatform');
            return prSourcePlatform !== 'SRM' && prSourcePlatform;
          },
        },
      },
      {
        label: intl.get(`sprm.common.model.common.lineFreight`).d('行运费'),
        name: 'lineFreight',
        type: 'currency',
        dynamicProps: {
          formatterOptions: c7nAmountFormatterOptions(({ record }) => {
            return record.get('prSourcePlatform') === 'SRM'
              ? record.get('financialPrecision')
              : undefined;
          }),
          disabled: ({ record }) => record.get('prSourcePlatform') !== 'SRM',
        },
      },
      {
        name: 'remark',
        label: intl.get(`sprm.common.model.common.remark`).d('备注'),
      },
      {
        label: intl.get('entity.attachment.tag').d('附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'attachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
      },
      {
        label: intl.get('sprm.common.view.attachment.changeAttachmentUuid').d('变更说明附件'),
        type: 'attachment',
        viewMode: 'popup',
        name: 'changeAttachmentUuid',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
      },
      {
        label: intl.get(`sprm.purchaseReqCreation.view.message.priceList`).d('比价单'),
        name: 'priceList',
      },
      {
        name: 'skuType',
        label: intl.get(`${commonPrompt}.skuTypeMark`).d('定制品标示'),
      },
      {
        label: intl.get(`${commonPrompt}.customUomName`).d('定制单位'),
        name: 'customUomName',
      },
      {
        label: intl.get(`${commonPrompt}.customQuantity`).d('定制数量'),
        name: 'customQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.packageQuantity`).d('份数'),
        name: 'packageQuantity',
        type: 'number',
      },
      {
        label: intl.get(`${commonPrompt}.customSpecsJson`).d('定制品属性'),
        name: 'customSpecsJson',
      },
      {
        label: intl.get(`${commonPrompt}.productSpecsJson`).d('商品属性'),
        name: 'productSpecsJson',
      },
      {
        label: intl.get(`${commonPrompt}.executionBillDetail`).d('执行单据详情'),
        name: 'executionBillDetail',
      },
      {
        label: intl.get(`${commonPrompt}.occupiedQuantity`).d('已执行数量'),
        type: 'number',
        name: 'occupiedQuantity',
      },
      {
        label: intl.get(`${commonPrompt}.changeQuantity`).d('变更数量'),
        type: 'number',
        name: 'changeQuantity',
      },
      {
        label: intl.get(`${commonPrompt}.changeOrderFailCount`).d('自动转单失败次数'),
        type: 'number',
        name: 'changeOrderFailCount',
      },
      {
        name: 'operable',
        label: intl.get(`${commonPrompt}.operable`).d('可操作类型'),
      },
      {
        name: 'budgetOccupyFlag',
        type: 'string',
        label: intl.get(`${commonPrompt}.budgetOccupyFlag`).d('预算占用标识'),
        lookupCode: 'SPUC.PR.LINE_BUDGET_OCCUPY_FLAG',
      },
    ],
    transport: {
      read: ({ data = {} }) => {
        const { currentId } = data;
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/${prHeaderId ||
            currentId}/lines`,
          data: { customizeUnitCode, workFlowFlag },
          method: 'GET',
        };
      },
    },
  };
};

const attachmentDs = () => {
  return {
    autoQuery: false,
    autoCreate: true,
    fields: [
      {
        name: 'attachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.common.model.common.enterEnclosure').d('内部附件'),
      },
      {
        name: 'externalAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.common.view.attachment.externalAttachment').d('外部附件'),
      },
      {
        name: 'changeAttachmentUuid',
        type: 'attachment',
        // viewMode: 'popup',
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: 'sprm',
        label: intl.get('sprm.common.view.attachment.changeAttachmentUuid').d('变更说明附件'),
      },
    ],
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

const customDs = () => {
  return {
    selection: false,
    fields: [
      {
        label: intl.get(`${commonPrompt}.componentName`).d('属性名称'),
        name: 'componentName',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
        name: 'cpValue',
        width: 100,
      },
      {
        label: intl.get(`${commonPrompt}.pName`).d('属性描述'),
        name: 'pName',
        width: 120,
      },
      {
        label: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
        name: 'pValue',
        width: 100,
      },
    ],
  };
};

const itemCustomDs = () => {
  return {
    dataToJSON: 'all',
    selection: false,
    fields: [
      {
        label: intl.get(`${commonPrompt}.componentName`).d('属性名称'),
        name: 'attributeName',
      },
      {
        label: intl.get(`${commonPrompt}.cpValue`).d('属性值'),
        name: 'attributeValue',
      },
    ],
  };
};

const referPiceDs = data => {
  return {
    autoQuery: true,
    fields: [
      {
        label: intl.get(`entity.supplier.code`).d('供应商编码'),
        name: 'supplierCompanyNum',
      },
      {
        label: intl.get(`entity.supplier.name`).d('供应商名称'),
        name: 'supplierCompanyName',
      },
      {
        label: intl.get(`sodr.common.model.common.taxPrice`).d('单价(含税)'),
        name: 'taxPrice',
      },
      {
        label: intl.get(`sodr.common.model.common.unitPrice`).d('单价(不含税)'),
        name: 'unitPrice',
      },
      {
        label: intl.get(`sodr.common.model.common.uomName`).d('单位'),
        name: 'uomName',
      },
      {
        label: intl.get(`sodr.common.model.common.currencyName`).d('币种'),
        name: 'currencyCode',
      },
      {
        label: intl.get(`sodr.common.model.common.taxType`).d('税种'),
        name: 'taxCode',
      },
      {
        label: intl.get(`ssrc.priceLibrary.view.message.button.ladderPrice`).d('阶梯价格'),
        name: 'quantity',
      },
      {
        label: intl.get(`sodr.common.model.common.priceSource`).d('价格来源'),
        name: 'priceSourceMeaning',
      },
      {
        label: intl.get(`sodr.common.model.common.sourceOrderNum`).d('来源单号'),
        name: 'orderNum',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateFrom`).d('有效期从'),
        name: 'validDateFrom',
      },
      {
        label: intl.get(`sprm.common.model.common.validDateTo`).d('有效期至'),
        name: 'validDateTo',
      },
      {
        label: intl.get(`hzero.common.date.creation`).d('创建日期'),
        name: 'creationDate',
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${SRM_SPRM}/v1/${organizationId}/purchase-requests/line-create/price-library`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

export {
  lineDs,
  batchMaintainDs,
  historyDs,
  purchaseOrgInfoDs,
  baseDs,
  deliveryInfoDs,
  billInfoDs,
  remarkDs,
  customDs,
  referPiceDs,
  itemCustomDs,
  attachmentDs,
};
