import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import {
  queryBatchApprovaFlag,
  queryBatchSimpleApprovalHistory,
} from 'srm-front-boot/lib/utils/utils';
import intl from 'utils/intl';

import { SRM_SPC } from '_utils/config';
import { operationRevoke } from '@/services/priceLibraryNewService';
import { isEmpty } from 'lodash';

const organizationId = getCurrentOrganizationId();

const lineManualDS = (param) => ({
  pageSize: 20,
  primaryKey: 'requestId',
  autoQuery: false,
  // table表单显示的字段
  fields: [
    {
      name: 'requestStatus',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestStatus').d('状态'),
      lookupCode: 'SSRC.PRICE_LIB_REQUEST_STATUS',
    },
    {
      name: 'requestNum',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.requestNum').d('申请单号'),
    },
    {
      name: 'reqType',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.reqType').d('变更类型'),
      lookupCode: 'SSRC.PLM_REQ_STATUS',
    },
    {
      name: 'realName',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.realName').d('申请人'),
    },
    {
      name: 'approveMethod',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approveMethod').d('审批方式'),
      lookupCode: 'SSRC.PRICE_LIB_APPROVE_METHOD',
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.creationDate').d('创建日期'),
    },
    {
      name: 'approveDate',
      type: 'string',
      label: intl.get('ssrc.priceLibraryNew.model.library.approveDate').d('审批时间'),
    },
  ],
  // 查询表单字段
  transport: {
    read: ({ data }) => {
      const { routerParams = {}, ...queryParams } = data;
      return {
        url: `${SRM_SPC}/v1/${organizationId}/price-lib-reqs`,
        method: 'GET',
        data: {
          ...queryParams,
          ...routerParams,
          ...param,
          customizeUnitCode: 'SSRC.PRICE_LIBRARY_NEW.FILTER_BAR,SSRC.PRICE_LIB_NEW.REQ_QUERY_LIST',
        },
        transformResponse: async (tableData) => {
          let returnData = null;
          try {
            returnData = JSON.parse(tableData);
          } catch (error) {
            console.log(error);
            returnData = tableData;
          }
          if (returnData?.content?.length) {
            const { content = [] } = returnData || {};
            // 审批中数据的businessKey集合
            const businessKeyArr = content
              .filter(
                (record) =>
                  record.requestStatus === 'APPROVING' &&
                  record.businessKey &&
                  record.approveMethod === 'WFL'
              )
              .map((rec) => rec.businessKey);
            if (!isEmpty(businessKeyArr)) {
              await Promise.all([
                operationRevoke(businessKeyArr),
                queryBatchApprovaFlag(businessKeyArr),
                queryBatchSimpleApprovalHistory(businessKeyArr),
              ]).then(([res1, res2, res3]) => {
                const res = getResponse(res1);
                if (res && res2 && res3) {
                  returnData.content = content.map((record) => ({
                    ...record,
                    revokeByBusKeyFlag: res?.[record.businessKey]?.REVOKE,
                    approvalByBusKey: res2?.[record.businessKey],
                    approvalProcessByBusKey: res3?.[record.businessKey],
                  }));
                }
              });
            }
          }
          return returnData;
        },
      };
    },
  },
});
export { lineManualDS };
