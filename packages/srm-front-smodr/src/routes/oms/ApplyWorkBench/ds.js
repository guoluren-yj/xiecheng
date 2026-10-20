import { getResponse } from 'utils/utils';
import { queryBatchApprovaFlag, queryBatchSimpleApprovalHistory } from '_utils/utils';

import { dsFieldsMap } from './dataSource';
import { fetchOperationFlagService } from '@/services/oms/workflowApproveService';

const tableDs = (key, parentKey, singleConfig, DSMap) => ({
  selection: 'multiple',
  cacheSelection: true,
  cacheModified: false,
  modifiedCheck: false,
  primaryKey: parentKey === 'whole' ? 'requestId' : 'requestEntryId',
  pageSize: 20,
  fields: dsFieldsMap(key)[parentKey],
  transport: {
    read({ data }) {
      return {
        url: singleConfig.queryUrl,
        method: 'GET',
        data: {
          ...data,
          ...singleConfig?.params,
          customizeUnitCode: `${singleConfig.searchCode},${singleConfig.customizedTableCode}`,
        },
        // transformResponse: (value) => {
        //   return dataTransform(parentKey, value);
        // },
      };
    },
  },
  feedback: {
    loadSuccess: async (res) => {
      // 整单下的全部/审批中
      if(parentKey === 'whole' && ['wholeAll', 'approving'].includes(key)) {
        const { content = [] } = res || {};
        // 过滤出工作流审批
        const keys = content.reduce((pre, curr) => {
          const { approveType, requestCode } = curr;
          if(approveType === 'WORKFLOW_APPROVAL' && requestCode) {
            pre.push(requestCode);
          }
          return pre;
        }, []);
        if (keys.length > 0) {
          // 查询是否可以审批businessKey的对象
          const map = getResponse(await queryBatchApprovaFlag(keys));
          // 查询简易审批进度
          const historyMap = getResponse(await queryBatchSimpleApprovalHistory(keys));
          // 查询是否可以撤销审批接口
          const res = getResponse(await fetchOperationFlagService(keys));
          // 可以撤销审批businessKey集合
          const canRevokeList = Object.keys(res).filter((n) => {
            const { REVOKE } = res[n] || {};
            return REVOKE;
          });
          DSMap[key].forEach(r => {
            const _businessKey = r.get('requestCode');
            r.init({
              wflApproveFlag: Number(!!map[_businessKey]),
              wflRevokeApproveFlag: Number(canRevokeList.includes(_businessKey)),
              ...(map[_businessKey] || {}),
              simpleApprovalHistory: historyMap[_businessKey] || [],
            });
          });
        }
      }
    },
  },
});

export { tableDs };
