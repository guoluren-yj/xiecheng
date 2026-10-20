import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import { queryBatchApprovaFlag, queryBatchSimpleApprovalHistory } from '_utils/utils';

import { fetchOperationFlagService } from './api';

const organizationId = getCurrentOrganizationId();

const SRM_STCK = '/stck';

const stockHeaderDS = ({ queryParams = {} }) => ({
  autoCreate: false,
  pageSize: 20,
  autoQuery: false,
  selection: 'multiple',
  primaryKey: 'inOutHeaderId',
  cacheSelection: true,
  fields: [
    {
      label: intl.get('sstk.common.model.status').d('状态'),
      name: 'statusCodeMeaning',
    },
    {
      label: intl.get('sstk.stockWorkbench.model.orderNum').d('库存单号'),
      name: 'orderNum',
    },
    {
      label: intl.get('sstk.stockWorkbench.model.remark').d('标题'),
      name: 'orderName',
    },
    {
      label: intl.get('sstk.stockWorkbench.model.orderType').d('业务类型'),
      name: 'orderTypeMeaning',
    },
    {
      label: intl.get('sstk.stockWorkbench.model.operateType').d('单据类型'),
      name: 'operateTypeMeaning',
    },
    {
      label: intl.get('sstk.common.model.creator').d('创建人'),
      name: 'realName',
    },
    {
      label: intl.get('sstk.common.model.model.creationDate').d('创建时间'),
      type: 'dateTime',
      name: 'creationDate',
    },
    {
      label: intl.get('hzero.common.action').d('操作'),
      name: 'action',
    },
  ],
  transport: {
    read({ data }) {
      return {
        url: `${SRM_STCK}/v1/${organizationId}/in-out-order-headers`,
        method: 'GET',
        data: { ...data, ...queryParams },
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      const keys = dataSet.reduce((pre, record) => {
        const workflowBusinessKey = record.get('workflowBusinessKey') || [];
        const _businessKey = workflowBusinessKey[0];
        if (_businessKey) {
          pre.push(_businessKey);
        }
        return pre;
      }, []);
      if (isEmpty(keys)) return;
      // 查询是否可以审批businessKey的对象
      const map = getResponse(await queryBatchApprovaFlag(keys));
      // 查询简易审批进度
      const historyMap = getResponse(await queryBatchSimpleApprovalHistory(keys));
      // 查询是否可以撤销审批接口
      const res = getResponse(await fetchOperationFlagService(keys));
      // 可以撤销审批businessKey集合
      const canRevokeList = Object.keys(res).filter(n => {
        const { REVOKE } = res[n] || {};
        return REVOKE;
      });
      dataSet.forEach(r => {
        const workflowBusinessKey = r.get('workflowBusinessKey') || [];
        const _businessKey = workflowBusinessKey[0];
        r.init({
          wflApproveFlag: Number(!!map[_businessKey]),
          wflRevokeApproveFlag: Number(canRevokeList.includes(_businessKey)),
          ...(map[_businessKey] || {}),
          simpleApprovalHistory: historyMap[_businessKey] || [],
        });
      });
    },
  },
});

export default stockHeaderDS;
