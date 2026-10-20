import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const executiveRecordDS = (pcHeaderId) => {
  return {
    selection: false,
    pageSize: 20,
    fields: [
      {
        name: 'pcNumAndLineNum',
        type: 'string',
        label: `${intl.get(`spcm.common.model.common.pcNum`).d('协议编号')} | ${intl
          .get('spcm.common.model.common.lineNumber')
          .d('行号')}`,
      },
      {
        name: 'settleNumAndLineNum',
        type: 'string',
        label: `${intl
          .get(`spcm.common.model.common.statementNumber`)
          .d('结算单编号')} | ${intl.get('spcm.common.model.common.lineNumber').d('行号')}`,
      },
      {
        name: 'acceptListNumAndLineNum',
        type: 'string',
        label: `${intl
          .get(`spcm.common.model.common.acceptanceSheetNo`)
          .d('验收单编号')} | ${intl.get('spcm.common.model.common.lineNumber').d('行号')}`,
      },
      {
        name: 'statusCodeMeaning',
        type: 'string',
        label: `${intl.get(`spcm.common.model.common.receiptStatus`).d('收货单据状态')}`,
      },
      {
        name: 'settleStatus',
        type: 'string',
        lookupCode: 'SSTA.SETTLE_STATUS',
      },
      {
        name: 'settleStatusMeaning',
        type: 'string',
        label: `${intl
          .get(`spcm.common.model.common.prepaymentReceiptStatus`)
          .d('预付款单据状态')}`,
      },
      {
        name: 'creatorName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
      },
      {
        name: 'itemName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
      },
      {
        name: 'acceptedQuantity',
        type: 'string',
        label: intl.get(`sodr.common.model.common.executeQuantity`).d('执行数量'),
      },
      {
        name: 'quantity',
        type: 'string',
        label: intl.get(`spcm.common.model.common.totalNumber`).d('总数量'),
      },
      {
        name: 'acceptDate',
        type: 'string',
        label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      },
      {
        name: 'creationDate',
        type: 'string',
        label: intl.get(`hzero.common.date.creation`).d('创建时间'),
      },
      {
        name: 'acceptorName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
      },
      {
        name: 'stageName',
        type: 'string',
        label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
      },
      {
        name: 'contractAmount',
        type: 'string',
        label: intl.get(`spcm.common.model.common.totalAmount`).d('总金额'),
      },
      {
        name: 'costQuantity',
        type: 'string',
        label: intl.get(`spcm.common.model.common.totalAmount`).d('总金额'),
      },
      {
        name: 'amount',
        type: 'string',
        label: intl.get(`sodr.common.model.common.executedAmount`).d('执行金额'),
      },
      {
        name: 'acceptCostQuantity',
        type: 'string',
        label: intl.get(`sodr.common.model.common.executedAmount`).d('执行金额'),
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_SPCM}/v1/${organizationId}/contract-report/common/execute-detail/${pcHeaderId}`,
          method: 'GET',
          data,
        };
      },
    },
  };
};

export default executiveRecordDS;
