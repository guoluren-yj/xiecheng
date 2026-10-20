import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
// import { getCurrentOrganizationId } from 'utils/utils';

// const tenantId = getCurrentOrganizationId();

const ListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/bank-pmt-details`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'id',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtNum').d('SDAT支付平台单号'),
      name: 'pmtNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.bankSerialNumber').d('第三方支付流水号'),
      name: 'pmtOutSerialNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtOutBatchNum').d('第三方系统支付批次号'),
      name: 'pmtOutBatchNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtSceneCode').d('支付业务场景编码'),
      name: 'pmtSceneCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtSceneName').d('支付业务场景名称'),
      name: 'pmtSceneName',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtBizSerialNum').d('支付业务流水号'),
      name: 'pmtBizSerialNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtTitle').d('支付标题'),
      name: 'pmtTitle',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtBizNum').d('支付业务单据号'),
      name: 'pmtBizNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtStatus').d('支付状态'),
      name: 'pmtStatus',
      lookupCode: 'SDAT.BANK_PAY_STATUS',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.tenantName').d('租户名称'),
      name: 'tenantName',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.organizationCode').d('单据所属组织代码'),
      name: 'pmtOrgCode',
      type: 'string',
    },
    // {
    //   label: intl.get('sdat.bankStatementInquiry.model.tradingDirection').d('交易方向'),
    //   name: 'tradingDirection',
    //   type: 'string',
    //   lookupCode: 'SDAT.BANK_ENTER_TRADING_DIRECTION_LIST',
    // },
    {
      label: intl.get('sdat.bankStatementInquiry.model.account').d('付方账号'),
      name: 'pmtAccountNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.accountName').d('付方组织代码'),
      name: 'pmtOurOrgCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtStartTime').d('支付发起时间'),
      name: 'pmtStartTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtEndTime').d('支付完成时间'),
      name: 'pmtEndTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.amount').d('金额'),
      name: 'pmtAmount',
      type: 'number',
      step: 0.01,
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.currency').d('币种'),
      name: 'pmtCurrencyCode',
      type: 'string',
      lookupCode: 'SPFM.CURRENCY_SQL',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.otherAccounts').d('对方账号'),
      name: 'reptAccountNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.otherAccountName').d('对方户名'),
      name: 'reptAccountName',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.otherBank').d('对方银行'),
      name: 'reptBankCode',
      type: 'string',
    },

    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtOutBizNum').d('第三方系统返回的支付单号'),
      name: 'pmtOutBizNum',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtApplyOrgCode').d('付款申请组织代码'),
      name: 'pmtApplyOrgCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.memo').d('支付备注'),
      name: 'memo',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.systemCode').d('租户对接系统代码'),
      name: 'systemCode',
    },
    {
      label: intl
        .get('sdat.bankStatementInquiry.model.refundSystemSerialNum')
        .d('第三方系统退款流水号'),
      name: 'refundSystemSerialNum',
    },
    {
      label: intl.get('sdat.bankStatementInquiry.model.pmtInfo').d('支付信息'),
      name: 'pmtInfo',
    },
  ],
  queryFields: [],
  events: {},
});

export { ListDS };
