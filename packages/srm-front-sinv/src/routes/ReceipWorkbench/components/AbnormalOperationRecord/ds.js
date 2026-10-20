import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';

import { getCurrentOrganizationId } from 'utils/utils';

const organizationId = getCurrentOrganizationId();

// 列表ds
const ds = () => ({
  primaryKey: 'strategyHeaderId',
  forceValidate: true,
  dataToJSON: 'all',
  pageSize: 20,
  selection: false,
  fields: [
    {
      name: 'trxSourceNum',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.trxSourceNum`).d('收货单单号-行号'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.nodeConfigName`).d('收货节点'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get(`sinv.receiptWorkbench.model.view.quantity`).d('单据数量'),
    },
    {
      name: 'poSourceNum',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.poSourceNum`).d('来源订单编号-行号'),
    },
    {
      name: 'asnSourceNum',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.asnSourceNum`).d('来源送货单编号-行号'),
    },
    {
      name: 'pcSourceNum',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.pcSourceNum`).d('来源协议编号-行号'),
    },
    {
      name: 'operationUserName',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.operationUserName`).d('操作人'),
    },
    {
      name: 'operationDate',
      type: 'dateTime',
      label: intl.get(`sinv.receiptWorkbench.model.view.operationDate`).d('操作日期'),
    },
    {
      name: 'operationTypeMeaning',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.operationTypeMeaning`).d('操作类型'),
    },
    {
      name: 'operationStatusMeaning',
      type: 'string',
      label: intl.get(`sinv.receiptWorkbench.model.view.operationStatusMeaning`).d('操作状态'),
    },
    {
      name: 'reason',
      label: intl.get(`sinv.receiptWorkbench.model.view.reason`).d('原因'),
      type: 'string',
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/rcv/exception/record/list`,
        method: 'GET',
        data,
      };
    },
  },
});

export default ds;
