import { SRM_SPCM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const executiveRecordDS = (pcHeaderId) => ({
  selection: false,
  fields: [
    {
      name: 'attributeVarchar1',
      type: 'string',
      label: `${intl
        .get(`spcm.purchaseRequisitionCreation.model.pcNum`)
        .d('协议编号')} | ${intl.get('spcm.common.model.common.lineNumber').d('行号')}`,
    },
    {
      name: 'attributeVarchar1',
      type: 'string',
      label: `${intl
        .get(`spcm.purchaseRequisitionCreation.model.pcNum`)
        .d('协议编号')} | ${intl.get('spcm.common.model.common.stageNumber').d('阶段号')}`,
    },
    {
      name: 'attributeVarchar1',
      type: 'string',
      label: `${intl.get(`spcm.purchaseRequisitionCreation.model.pcNum`).d('协议编号')}`,
    },
    {
      name: 'settleNumAndLineNum',
      type: 'string',
      label: `${intl.get(`spcm.common.model.common.statementNumber`).d('结算单编号')} | ${intl
        .get('spcm.common.model.common.lineNumber')
        .d('行号')}`,
    },
    {
      name: 'attributeVarchar1',
      type: 'string',
      label: `${intl.get(`spcm.common.model.common.prepaymentReceiptStatus`).d('预付款单据状态')}`,
    },
    {
      name: 'attributeVarchar1',
      type: 'string',
      label: `${intl.get(`spcm.common.model.common.receiptStatus`).d('收货单据状态')}`,
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.itemName`).d('物料名称'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.totalNumber`).d('总数量'),
    },
    {
      name: 'executeQuantity',
      type: 'string',
      label: intl.get(`sodr.common.model.common.executeQuantity`).d('执行数量'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`hzero.common.date.creation`).d('创建时间'),
    },
    {
      name: 'creatorName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.createByRealName`).d('创建人'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.stageName`).d('阶段名称'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get(`spcm.common.model.common.totalAmount`).d('总金额'),
    },
    {
      name: 'executedAmount',
      type: 'string',
      label: intl.get(`sodr.common.model.common.executedAmount`).d('执行金额'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { ...otherParams } = data;
      return {
        url: `${SRM_SPCM}/v1/${organizationId}/contract-report/prepayment/${pcHeaderId}`,
        method: 'GET',
        data: otherParams,
      };
    },
  },
});

export default executiveRecordDS;
