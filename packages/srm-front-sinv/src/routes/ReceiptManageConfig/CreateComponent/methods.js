import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const nodeCreateFormParams = [
  {
    type: 'string',
    required: true,
    compType: 'Select',
    name: 'nodeOrderType',
    lookupCode: 'SINV.RCV_NODE_ORDER_TYPE',
    label: intl.get('sinv.receiptManage.model.receipt.nodeOrderType').d('单据类型'),
  },
  {
    type: 'number',
    required: true,
    name: 'nodeConfigCode',
    compType: 'NumberField',
    label: intl.get('sinv.receiptManage.model.receipt.lineSeq').d('节点顺序'),
  },
  {
    type: 'intl',
    required: true,
    compType: 'IntlField',
    name: 'nodeConfigName',
    label: intl.get('sinv.receiptManage.model.receipt.nodeConfigName').d('业务流程节点'),
  },
  {
    type: 'object',
    compType: 'Lov',
    ignore: 'always',
    name: 'nodeCodeRuleLov',
    lovCode: 'SPUC.SINV.CODE.RULE',
    label: intl.get('sinv.receiptManage.model.receipt.nodeCodeRule').d('单号编码规则'),
    lovPara: {
      tenantId: organizationId,
    },
  },
  {
    name: 'nodeCodeRule',
    type: 'string',
    bind: 'nodeCodeRuleLov.ruleCode',
    customParam: true, // 自定义判断是否为bind 绑定参数
  },
  {
    name: 'nodeCodeRuleMeaning',
    type: 'string',
    bind: 'nodeCodeRuleLov.ruleName',
    customParam: true, // 自定义判断是否为bind 绑定参数
  },
  {
    type: 'object',
    compType: 'Lov',
    required: true,
    name: 'refRcvTypeCodeLov',
    lovCode: 'SINV.RECEIVE_TRX_TYPE_NEW',
    label: intl.get('sinv.receiptManage.model.receipt.receiptRcvTrxTypCode').d('平台收货类型编码'),
    lovPara: {
      tenantId: organizationId,
    },
  },
  {
    name: 'refRcvTypeCode',
    type: 'string',
    bind: 'refRcvTypeCodeLov.rcvTrxTypeCode',
    customParam: true, // 自定义判断是否为bind 绑定参数
  },
  {
    name: 'refRcvTypeId',
    type: 'string',
    bind: 'refRcvTypeCodeLov.rcvTrxTypeId',
    customParam: true, // 自定义判断是否为bind 绑定参数
  },
];

const strategyCreateFormParams = [
  {
    type: 'string',
    name: 'strategyCode',
    compType: 'NumberField',
    label: intl.get('sinv.receiptManage.model.receipt.strategyCode').d('策略编号'),
    required: true,
  },
  {
    name: 'strategyName',
    type: 'intl',
    compType: 'IntlField',
    label: intl.get('sinv.receiptManage.model.receipt.strategyName').d('策略名称'),
    required: true,
  },
  {
    type: 'string',
    required: true,
    compType: 'Select',
    name: 'sourceOrderType',
    lookupCode: 'SINV.RCV_SOURCE_ORDER_TYPE_SLOD',
    label: intl.get('sinv.receiptManage.model.receipt.sourceOrderType').d('单据来源'),
    // dynamicProps: ({ record }) => {
    //   return {
    //     lookupCode:
    //       workFlag || record.get('workFlag')
    //         ? 'SINV.RCV_SOURCE_ORDER_TYPE_SLOD'
    //         : 'SINV.RCV_SOURCE_ORDER_TYPE',
    //   };
    // },
  },
  {
    type: 'Select',
    required: true,
    compType: 'Select',
    name: 'enabledFlag',
    label: intl.get('sinv.receiptManage.model.receipt.enabledFlag').d('启用'),
  },
];

export { nodeCreateFormParams, strategyCreateFormParams };
