import intl from 'utils/intl';
import moment from 'moment';
import { SRM_PLATFORM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

const autoTransferDs = (queryParams) => {
  const { deliverFromId, deliverType } = queryParams;
  return {
    selection: false,
    autoQuery: true,
    pageSize: 20,
    fields: [
      {
        name: 'status',
        type: 'string',
        lookupCode: 'SPFM.AUTO_DELIVER_STATUS',
        label: intl.get('spfm.docTransfer.model.autoDeliverStatus').d('状态'),
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.autoDeliverName').d('自动转交标题'),
      },
      {
        name: 'deliverToName',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.receiveUserInfo').d('接收人'),
      },
      {
        name: 'createdByName',
        label: intl.get('spfm.docTransfer.model.createdBy').d('操作人'),
        type: 'string',
      },
      {
        name: 'runDateRange',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.runDateRange').d('转交周期'),
      },
    ],
    queryFields: [
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.docTransfer.model.autoDeliverName').d('自动转交标题'),
        display: true,
      },
      {
        name: 'receiveUserInfo',
        type: 'object',
        label: intl.get('spfm.docTransfer.model.receiveUserInfo').d('接收人'),
        display: true,
        ignore: 'always',
        lovCode: deliverType === 'AGENT' ? 'HPFM.ORGANIZATION_PURCHASE_AGENT' : 'HIAM.USER_ACCOUNT',
        lovPara: { tenantId: getCurrentOrganizationId() },
        textField: deliverType === 'AGENT' ? 'purchaseAgentName' : 'realName',
        valueField: deliverType === 'AGENT' ? 'purchaseAgentId' : 'id',
        noCache: true,
        transformRequest: (val) =>
          (val || {})[
          deliverType === 'AGENT' ? 'purchaseAgentId' : 'id'
          ],
      },
      {
        name: 'deliverToId',
        forceQuery: true,
        visible: false,
        transformValue: (value, record) =>
          (record.get('receiveUserInfo') || {})[deliverType === 'AGENT' ? 'purchaseAgentId' : 'id'],
      },
    ],
    transport: {
      read: ({ data }) => {
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/auto-deliver-rules`,
          method: 'GET',
          params: {
            ...data,
            deliverFromId,
            deliverType,
          },
        };
      },
      destroy: ({ data }) => {
        const { ruleId } = data[0];
        return {
          url: `${SRM_PLATFORM}/v1/${getCurrentOrganizationId()}/auto-deliver-rules/${ruleId}`,
          method: 'DELETE',
        };
      },
    },
  };
};
const baseInfoDs = ({ deliverType }) => ({
  fields: [
    {
      name: 'description',
      type: 'string',
      label: intl.get('spfm.docTransfer.model.autoDeliverName').d('自动转交标题'),
      required: true,
    },
    {
      name: 'receiveUserInfo',
      type: 'object',
      label: intl.get('spfm.docTransfer.model.receiveUserInfo').d('接收人'),
      display: true,
      ignore: 'always',
      required: true,
      textField: deliverType === 'AGENT' ? 'purchaseAgentName' : 'realName',
      valueField: deliverType === 'AGENT' ? 'purchaseAgentId' : 'id',
      lovCode: deliverType === 'AGENT' ? 'HPFM.ORGANIZATION_PURCHASE_AGENT' : 'HIAM.USER_ACCOUNT',
      lovPara: { tenantId: getCurrentOrganizationId() },
      noCache: true,
      transformResponse: (_, recordData) => {
        const { deliverToId, deliverToName } = recordData;
        return deliverType === 'AGENT' ? { purchaseAgentName: deliverToName, purchaseAgentId: deliverToId } : { id: deliverToId, realName: deliverToName }
      },
    },
    {
      name: 'deliverToId',
      bind: deliverType === 'AGENT' ? 'receiveUserInfo.purchaseAgentId' : 'receiveUserInfo.id',
    },
    {
      name: 'runDateRange',
      type: 'dateTime',
      label: intl.get('spfm.docTransfer.model.runDateRange').d('转交周期'),
      required: true,
      ignore: 'always',
      range: ['startTime', 'endTime'],
      min: moment(moment().format(DATETIME_MIN)),
      max: moment(moment().add(1, 'month').format(DATETIME_MAX)),
      validator(value, name, record) {
        console.log('value', value, name, record)
        if(value && !value.startTime) {
          return intl.get('spfm.docTransfer.validation.startTime').d('请输入转交周期起始时间');
        }
      }
    },
    {
      name: 'startTime',
      type: 'dateTime',
      bind: 'runDateRange.startTime',
    },
    {
      name: 'endTime',
      type: 'dateTime',
      bind: 'runDateRange.endTime',
    },
  ],
});

const receiptDs = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      name: 'docHeaderCode',
      type: 'string',
      label: intl.get('spfm.docTransfer.model.receiptCode').d('单据编码'),
    },
    {
      name: 'docHeaderName',
      type: 'string',
      label: intl.get('spfm.docTransfer.model.receiptName').d('单据名称'),
    },
  ],
});

const addLovDs = ({ deliverType }, getDisabledIds = () => []) => ({
  fields: [
    {
      name: 'deliverDocs',
      type: 'object',
      lovCode: deliverType === 'AGENT' ? 'SPFM.AUTO_DELIVER_DOC_TYPE_AGEMT_LOV' : 'SPFM.AUTO_DELIVER_DOC_TYPE_LOV',
      label: intl.get('spfm.docTransfer.model.selectDeliverDocs').d('选择单据'),
      multiple: true,
      optionsProps: {
        record: {
          dynamicProps: {
            selectable: (record) => {
              const disabledIds = getDisabledIds();
              return !disabledIds.includes(record.get('docHeaderId'));
            },
          },
        },
      },
    },
  ],
});
export { autoTransferDs, baseInfoDs, receiptDs, addLovDs };
