import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import type { ActiveKey} from '../../utils/type';
import { ActionMap, GridCustCodeMap, SearchCustCodeMap, RefundFlowListCode } from '../../utils/type';


export const listDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    autoQuery: false,
    pageSize: 20,
    dataToJSON: DataToJSON.selected,
    autoQueryAfterSubmit: false,
    primaryKey: 'serialId',
    fields: [
      {
        name: 'urid',
        label: intl.get('sbsm.bankFlow.model.bankFlow.urid').d('资金系统ID'),
      },
      {
        name: 'noteCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.noteCode').d('资金系统单据号'),
      },
      {
        name: 'applyNoteCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.applyNoteCode').d('资金系统申请单号'),
      },
      {
        name: 'type',
        label: intl.get('sbsm.bankFlow.model.bankFlow.type').d('类型'),
        lookupCode: 'SBSM.BANK_SERIAL_TYPE',
      },
      {
        name: 'orgCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.orgCode').d('资金系统组织编码'),
      },
      {
        name: 'ourBankAccountNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBankAccountNum').d('我方银行账号'),
      },
      {
        name: 'ourBankAccountName',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBankAccountName').d('我方银行户名'),
      },
      {
        name: 'ourBank',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBank').d('我方银行'),
      },
      {
        name: 'oppositeAccountNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeAccountNum').d('对方银行账号'),
      },
      {
        name: 'oppositeAccountName',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeAccountName').d('对方银行户名'),
      },
      {
        name: 'oppositeBank',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeBank').d('对方银行'),
      },
      {
        name: 'tradeDate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.tradeDate').d('交易日期'),
        type: FieldType.date,
      },
      {
        name: 'tradeDateTime',
        label: intl.get('sbsm.bankFlow.model.bankFlow.tradeDateTime').d('交易时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'valueDate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.valueDate').d('起息日起'),
        type: FieldType.date,
      },
      {
        name: 'moneyWay',
        label: intl.get('sbsm.bankFlow.model.bankFlow.moneyWay').d('交易方向'),
        lookupCode: 'SBSM.BANK_TRANSACTION_DIRECTION',
      },
      {
        name: 'amount',
        label: intl.get('sbsm.bankFlow.model.bankFlow.amount').d('金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'currentBalance',
        label: intl.get('sbsm.bankFlow.model.bankFlow.currentBalance').d('当前余额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'curCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.curCode').d('币种'),
      },
      {
        name: 'purpose',
        label: intl.get('sbsm.bankFlow.model.bankFlow.purpose').d('用途'),
      },
      {
        name: 'comments',
        label: intl.get('sbsm.bankFlow.model.bankFlow.comments').d('备注'),
      },
      {
        name: 'bankSerialNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.bankSerialNum').d('银行流水号'),
      },
      {
        name: 'fileUrl',
        label: intl.get('sbsm.bankFlow.model.bankFlow.fileUrl').d('电子回单链接'),
      },
      {
        name: 'payCommandNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.payCommandNum').d('支付指令编号'),
      },
      {
        name: 'pmtbizNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.pmtbizNum').d('支付单编号'),
      },
      {
        name: 'pmtbizLineNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.pmtbizLineNum').d('支付单流水行编号'),
      },
      {
        name: 'operate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.operate').d('操作'),
      },
    ],
    queryParameter: {
      tab: ActionMap[activeKey],
      customizeUnitCode: [GridCustCodeMap[activeKey], SearchCustCodeMap[activeKey]].join(),
    },
    transport: {
      read: () => {
        const url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/list`;
        return { url, method: 'GET' };
      },
    },
  };
};


export const refundFlowInfoDS = (abnormalRecord, readOnly): DataSetProps => {
  const moneyWay = abnormalRecord?.get('moneyWay');
  const queryFlag = readOnly && Number(moneyWay) === 1;
  return {
    autoCreate: true,
    autoQuery: queryFlag,
    paging: false,
    dataToJSON: DataToJSON.all,
    primaryKey: 'serialId',
    data: !queryFlag ? [abnormalRecord?.toJSONData() || {}] : [],
    selection: false,
    fields: [
      {
        name: 'urid',
        label: intl.get('sbsm.bankFlow.model.bankFlow.urid').d('资金系统ID'),
      },
      {
        name: 'noteCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.noteCode').d('资金系统单据号'),
      },
      {
        name: 'applyNoteCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.applyNoteCode').d('资金系统申请单号'),
      },
      {
        name: 'type',
        label: intl.get('sbsm.bankFlow.model.bankFlow.type').d('类型'),
        lookupCode: 'SBSM.BANK_SERIAL_TYPE',
      },
      {
        name: 'orgCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.orgCode').d('资金系统组织编码'),
      },
      {
        name: 'ourBankAccountNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBankAccountNum').d('我方银行账号'),
      },
      {
        name: 'ourBankAccountName',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBankAccountName').d('我方银行户名'),
      },
      {
        name: 'oppositeAccountNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeAccountNum').d('对方银行账号'),
      },
      {
        name: 'oppositeAccountName',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeAccountName').d('对方银行户名'),
      },
      {
        name: 'oppositeBank',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeBank').d('对方银行'),
      },
      {
        name: 'tradeDate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.tradeDate').d('交易日期'),
        type: FieldType.date,
      },
      {
        name: 'tradeDateTime',
        label: intl.get('sbsm.bankFlow.model.bankFlow.tradeDateTime').d('交易时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'valueDate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.valueDate').d('起息日起'),
        type: FieldType.date,
      },
      {
        name: 'moneyWay',
        label: intl.get('sbsm.bankFlow.model.bankFlow.moneyWay').d('交易方向'),
        lookupCode: 'SBSM.BANK_TRANSACTION_DIRECTION',
      },
      {
        name: 'amount',
        label: intl.get('sbsm.bankFlow.model.bankFlow.amount').d('金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'currentBalance',
        label: intl.get('sbsm.bankFlow.model.bankFlow.currentBalance').d('当前余额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'curCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.curCode').d('币种'),
      },
      {
        name: 'purpose',
        label: intl.get('sbsm.bankFlow.model.bankFlow.purpose').d('用途'),
      },
      {
        name: 'comments',
        label: intl.get('sbsm.bankFlow.model.bankFlow.comments').d('备注'),
      },
      {
        name: 'bankSerialNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.bankSerialNum').d('银行流水号'),
      },
      {
        name: 'fileUrl',
        label: intl.get('sbsm.bankFlow.model.bankFlow.fileUrls').d('电子回单文件URL链接地址'),
      },
      {
        name: 'fileDownloadUrl',
        label: intl.get('sbsm.bankFlow.model.bankFlow.fileDownloadUrl').d('电子回单文件下载URL链接'),
      },
      {
        name: 'receiptCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.receiptCode').d('电子回单编号'),
      },
    ],
    transport: {
      read: () => {
        const serialId = abnormalRecord?.get('serialId');
        const url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/refund-pay/matched-list?serialId=${serialId}&customizeUnitCode=${RefundFlowListCode}`;
        return {
          url,
          method: 'GET',
        };
      },
    },
  };
};

export const matchExpendFlowInfoDS = (queryParameter, type, abnormalRecord?: any, readOnly?: any): DataSetProps => {
  const isMathModal = type === 'matchFlow';
  const moneyWay = abnormalRecord?.get('moneyWay');
  const defaultValueFlag = readOnly && Number(moneyWay) === 1;
  return {
    autoQuery: !isMathModal && !defaultValueFlag,
    paging: isMathModal,
    dataToJSON: DataToJSON.all,
    data: defaultValueFlag ? [abnormalRecord?.toJSONData() || {}] : [],
    primaryKey: 'serialId',
    record: {
      dynamicProps: {
        selectable: (record) => (record?.get('_status') === 'create' && !isMathModal) || isMathModal,
      },
    },
    fields: [
      {
        name: 'urid',
        label: intl.get('sbsm.bankFlow.model.bankFlow.urid').d('资金系统ID'),
      },
      {
        name: 'noteCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.noteCode').d('资金系统单据号'),
      },
      {
        name: 'applyNoteCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.applyNoteCode').d('资金系统申请单号'),
      },
      {
        name: 'type',
        label: intl.get('sbsm.bankFlow.model.bankFlow.type').d('类型'),
        lookupCode: 'SBSM.BANK_SERIAL_TYPE',
      },
      {
        name: 'orgCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.orgCode').d('资金系统组织编码'),
      },
      {
        name: 'ourBankAccountNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBankAccountNum').d('我方银行账号'),
      },
      {
        name: 'ourBankAccountName',
        label: intl.get('sbsm.bankFlow.model.bankFlow.ourBankAccountName').d('我方银行户名'),
      },
      {
        name: 'oppositeAccountNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeAccountNum').d('对方银行账号'),
      },
      {
        name: 'oppositeAccountName',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeAccountName').d('对方银行户名'),
      },
      {
        name: 'oppositeBank',
        label: intl.get('sbsm.bankFlow.model.bankFlow.oppositeBank').d('对方银行'),
      },
      {
        name: 'tradeDate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.tradeDate').d('交易日期'),
        type: FieldType.date,
      },
      {
        name: 'tradeDateTime',
        label: intl.get('sbsm.bankFlow.model.bankFlow.tradeDateTime').d('交易时间'),
        type: FieldType.dateTime,
      },
      {
        name: 'valueDate',
        label: intl.get('sbsm.bankFlow.model.bankFlow.valueDate').d('起息日起'),
        type: FieldType.date,
      },
      {
        name: 'moneyWay',
        label: intl.get('sbsm.bankFlow.model.bankFlow.moneyWay').d('交易方向'),
        lookupCode: 'SBSM.BANK_TRANSACTION_DIRECTION',
      },
      {
        name: 'amount',
        label: intl.get('sbsm.bankFlow.model.bankFlow.amount').d('金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'currentBalance',
        label: intl.get('sbsm.bankFlow.model.bankFlow.currentBalance').d('当前余额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'curCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.curCode').d('币种'),
      },
      {
        name: 'purpose',
        label: intl.get('sbsm.bankFlow.model.bankFlow.purpose').d('用途'),
      },
      {
        name: 'comments',
        label: intl.get('sbsm.bankFlow.model.bankFlow.comments').d('备注'),
      },
      {
        name: 'bankSerialNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.bankSerialNum').d('银行流水号'),
      },
      {
        name: 'fileUrl',
        label: intl.get('sbsm.bankFlow.model.bankFlow.fileUrls').d('电子回单文件URL链接地址'),
      },
      {
        name: 'fileDownloadUrl',
        label: intl.get('sbsm.bankFlow.model.bankFlow.fileDownloadUrl').d('电子回单文件下载URL链接'),
      },
      {
        name: 'receiptCode',
        label: intl.get('sbsm.bankFlow.model.bankFlow.receiptCode').d('电子回单编号'),
      },
      {
        name: 'payCommandNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.payCommandNum').d('支付指令编号'),
      },
      {
        name: 'pmtbizNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.pmtbizNum').d('支付单编号'),
      },
      {
        name: 'pmtbizLineNum',
        label: intl.get('sbsm.bankFlow.model.bankFlow.pmtbizLineNum').d('支付单流水行编号'),
      },
    ],
    queryParameter,
    transport: {
      read: ({ data }) => {
        const url = isMathModal ? `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/match-refund-pay?customizeUnitCode=${queryParameter.customizeUnitCode}` : `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/refund-pay/matched-list`;
        return {
          url,
          method: isMathModal ? 'POST' : 'GET',
          data: isMathModal ? {
            ...queryParameter,
            ...data,
          } : queryParameter,
        };
      },
      submit: ({ data, dataSet }): any => {
        const abnormalData = dataSet?.getState('abnormalData');
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-serial/refund-pay/save`,
          method: 'POST',
          data: {
            payBankSerialList: data,
            ...abnormalData,
          },
        };
      },
    },
  };
};
