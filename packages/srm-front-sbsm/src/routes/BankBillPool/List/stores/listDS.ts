import { DataToJSON, FieldType } from 'choerodon-ui/dataset/data-set/enum';
import type { DataSetProps } from 'choerodon-ui/dataset/data-set/DataSet';

import intl from 'utils/intl';
import { SRM_SBDM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import { amountFormatterOptions } from '../../../../utils/utils';
import { PaperLineAddCodeMap } from '../../../PaymentWorkbench/utils/type';
import { ActiveKey, ActionMap, GridCustCodeMap, FilterCustCodeMap, BUCKET_DIRECTORY } from '../../utils/type';

export const usableListDS = () => listDS(ActiveKey.Usable);

export const listDS = (activeKey: ActiveKey): DataSetProps => {
  return {
    pageSize: 20,
    autoQuery: false,
    primaryKey: 'paperId',
    cacheSelection: true,
    dataToJSON: DataToJSON.selected,
    fields: [
      {
        name: 'paperSystemStatus',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billSystemStatus').d('票据系统状态'),
        lookupCode: 'SBSM.BANK_PAPER_SYSTEM_STATUS',
      },
      {
        name: 'paperNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billNum').d('票号'),
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.belongCompanyNum').d('所属公司编码'),
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.belongCompanyName').d('所属公司名称'),
      },
      {
        name: 'dataSourceMeaning',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billSource').d('票据来源'),
      },
      {
        name: 'paperTypeMeaning',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billType').d('票据类型'),
      },
      {
        name: 'paperStatus',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billActualStatus').d('票据实际状态'),
        lookupCode: 'SBSM.BAKN_PAPER_STATUS',
      },
      {
        name: 'bankName',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.receivingBillBank').d('收票银行'),
      },
      {
        name: 'drawer',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.drawer').d('出票人'),
      },
      {
        name: 'acceptor',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.acceptor').d('承兑人'),
      },
      {
        name: 'payer',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.payer').d('付款人'),
      },
      {
        name: 'invoiceDate',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.receiptOrIssuanceDate').d('收票日/开立日'),
        type: FieldType.date,
      },
      {
        name: 'issueDate',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.draftDate').d('出票日'),
        type: FieldType.date,
      },
      {
        name: 'draftsDeadLine',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.dueDate').d('到期日'),
        type: FieldType.date,
      },
      {
        name: 'paperAmount',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.amount').d('金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
      },
      {
        name: 'associatePayNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.associatedPayDocNum').d('关联支付单号'),
      },
      {
        name: 'associateStatementLineNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.associatedPayDocStatementLineNum').d('关联支付单流水行号'),
      },
      {
        name: 'createdByName',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.createdBy').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.dateTime,
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.creationTime').d('创建时间'),
      },
      {
        name: 'sourcePaperNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.originalBillNumSplit').d('原票据编号(拆分)'),
      },
      {
        name: 'attachmentUuid',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.attachment').d('附件'),
        type: FieldType.attachment,
        bucketName: PRIVATE_BUCKET,
        bucketDirectory: BUCKET_DIRECTORY,
      },
    ],
    queryParameter: {
      type: ActionMap[activeKey],
      customizeUnitCode: [GridCustCodeMap[activeKey], FilterCustCodeMap[activeKey]].join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/page-list`,
          method: 'GET',
        };
      },
      submit: ({ dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const payHeaderId = dataSet?.getQueryParameter('payHeaderId');
        switch (submitType) {
          case 'addStatementLine':
            return {
              url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-statement-lines/${payHeaderId}/bank-paper/confirm`,
              method: 'POST',
              params: { customizeUnitCode: PaperLineAddCodeMap.Grid },
            };
          default:
        }
      },
    },
    feedback: {
      submitSuccess: () => {},
    },
  };
};
