import { noop, isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import type { DataSetProps } from "choerodon-ui/dataset/data-set/DataSet";
import { DataToJSON, FieldIgnore, FieldType } from "choerodon-ui/dataset/data-set/enum";

import intl from "utils/intl";
import { SRM_SBDM, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from "utils/utils";

import { amountFormatterOptions } from "../../../../utils/utils";
import { BUCKET_DIRECTORY, HeadCustCodeMap } from '../../utils/type';


export const headerDS = (paperId?: string | number): DataSetProps => {
  return {
    paging: false, // 拆分列表页也用头DS
    autoQuery: !isNil(paperId),
    autoCreate: isNil(paperId),
    forceValidate: true,
    autoQueryAfterSubmit: false,
    dataToJSON: DataToJSON.all,
    fields: [
      {
        name: 'paperNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billNum').d('票号'),
        required: true,
      },
      {
        name: 'companyLov',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.belongCompanyNum').d('所属公司编码'),
        type: FieldType.object,
        lovCode: 'SPFM.USER_AUTH.COMPANY',
        textField: 'companyNum',
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'companyId',
        bind: 'companyLov.companyId',
      },
      {
        name: 'companyNum',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.belongCompanyNum').d('所属公司编码'),
        bind: 'companyLov.companyNum',
      },
      {
        name: 'companyName',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.belongCompanyName').d('所属公司名称'),
        bind: 'companyLov.companyName',
      },
      {
        name: 'dataSource',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billSource').d('票据来源'),
        lookupCode: 'SBSM.BANK_PAPER_SOURCE',
        required: true,
      },
      {
        name: 'paperType',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billType').d('票据类型'),
        lookupCode: 'SBSM.BANK_PAPER_TYPE',
        required: true,
      },
      {
        name: 'paperStatus',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billActualStatus').d('票据实际状态'),
        lookupCode: 'SBSM.BAKN_PAPER_STATUS',
        required: true,
      },
      {
        name: 'paperSystemStatus',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.billSystemStatus').d('票据系统状态'),
        lookupCode: 'SBSM.BANK_PAPER_SYSTEM_STATUS',
        required: true,
      },
      {
        name: 'bankName',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.receivingBillBank').d('收票银行'),
      },
      {
        name: 'drawer',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.drawer').d('出票人'),
        required: true,
      },
      {
        name: 'acceptor',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.acceptor').d('承兑人'),
        required: true,
      },
      {
        name: 'payer',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.payer').d('付款人'),
        required: true,
      },
      {
        name: 'invoiceDate',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.receiptOrIssuanceDate').d('收票日/开立日'),
        type: FieldType.date,
        required: true,
      },
      {
        name: 'issueDate',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.draftDate').d('出票日'),
        type: FieldType.date,
        required: true,
      },
      {
        name: 'draftsDeadLine',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.dueDate').d('到期日'),
        type: FieldType.date,
        required: true,
      },
      {
        name: 'paperAmount',
        label: intl.get('sbsm.bankBillPool.model.bankBillPool.amount').d('金额'),
        type: FieldType.number,
        computedProps: { formatterOptions: amountFormatterOptions },
        required: true,
        validator: (value) => {
          if (!isNil(value) && math.lte(value, 0)) {
            return intl.get(`sbsm.common.view.validation.mustBeGreaterThanZero`).d(`必须大于零`);
          }
        },
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
      paperId,
      customizeUnitCode: Object.values(HeadCustCodeMap).join(),
    },
    transport: {
      read: () => {
        return {
          url: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/detail/${paperId}`,
          method: 'GET',
        };
      },
      submit: ({ data, params, dataSet }): any => {
        const submitType = dataSet?.getState('submitType');
        const options = {
          url: '',
          method: 'POST',
          data: data[0],
          params: {
            ...params,
            customizeUnitCode: [
              HeadCustCodeMap.Basic,
              HeadCustCodeMap.Attachment,
            ].join(),
          },
        };
        switch (submitType) {
          case 'create':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/create`;
            break;
          case 'createValidate':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/create-validate`;
            break;
          case 'update':
            options.url = `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/bank-papers/update`;
            break;
          default:
        }
        return options;
      },
    },
    feedback: {
      submitSuccess: noop,
    },
  };
};
