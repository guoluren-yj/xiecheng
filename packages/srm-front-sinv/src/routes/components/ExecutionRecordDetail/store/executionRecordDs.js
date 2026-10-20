import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

const ExecutionRecordDs = (from, cuxFormProps) => ({
  forceValidate: true,
  selection: false,
  autoQuery: true,
  pageSize: 20,
  fields: [
    {
      name: 'realName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.actor').d('操作人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get('sinv.receiptExecution.model.receipt.recordTime').d('时间'),
    },
    {
      name: 'processTypeMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.recordType').d('类型'),
    },
    {
      name: 'processStatusMeaning',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.executionStatus')
        .d('执行状态'),
    },
    {
      name: 'processRemark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.orderTypeName.recordReason').d('结果'),
    },
    {
      name: 'recordHeaderId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.orderTypeName.recordLink').d('超链接'),
    },
  ],
  transport: {
    read: () => {
      const url =
        from === 'one'
          ? `${SRM_SPUC}/v1/${organizationId}/rcv-trx-record-headers?processType=1`
          : from === 'two'
            ? `${SRM_SPUC}/v1/${organizationId}/rcv-trx-record-headers?processType=4`
            : from === 'four'
              ? `${SRM_SPUC}/v1/${organizationId}/rcv-trx-record-headers?processType=5`
              : `${SRM_SPUC}/v1/${organizationId}/rcv-trx-record-headers`;
      return {
        url: cuxFormProps?.url ? cuxFormProps?.url : url,
        method: 'GET',
      };
    },
  },
});

export default ExecutionRecordDs;
