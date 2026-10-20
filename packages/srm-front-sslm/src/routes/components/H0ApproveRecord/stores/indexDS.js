/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-07-21 21:12:28
 * @LastEditors: 杨一昊 yihao.yang@going-link.com
 * @LastEditTime: 2022-08-10 21:08:15
 * @FilePath: /srm-front-sslm/src/routes/components/H0ApproveRecord/stores/indexDS.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/*
 * @Date: 2022-07-02 13:37:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_SSLM } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { getInterfaceName } from '../utils';

const organizationId = getCurrentOrganizationId();

// 操作记录
const operationRecordDS = ({ documentId, params }) => ({
  autoQuery: true,
  selection: false,
  fields: [
    {
      name: 'realName',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.operator').d('操作人'),
    },
    {
      name: 'operatedDate',
      type: 'date',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.operationDate').d('操作日期'),
    },
    {
      name: 'operationMeaning',
      label: intl.get('hzero.common.button.action').d('操作'),
    },
    {
      name: 'operatedRemark',
      label: intl.get('sslm.siteInvestigateReport.modal.mange.operatedRemark').d('操作内容'),
    },
  ],
  transport: {
    read: ({ params: queryParams = {} }) => {
      const interfaceName = getInterfaceName({ documentType: 'SITE_EVAL', documentId });
      return {
        url: `${SRM_SSLM}/v1/${organizationId}/${interfaceName}`,
        method: 'GET',
        params: {
          ...queryParams,
          ...params,
        },
      };
    },
  },
});

// 审批记录
const approvedRecordDS = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get('sslm.operatingRecord.model.approveHistory.approvalNode').d('审批节点'),
      name: 'name',
    },
    {
      label: intl.get('sslm.operatingRecord.model.approveHistory.action').d('审批动作'),
      name: 'action',
    },
    {
      label: intl.get('sslm.operatingRecord.model.approveHistory.assigneeName').d('审批人'),
      name: 'assigneeName',
    },
    {
      label: intl.get('sslm.operatingRecord.model.approveHistory.comment').d('审批意见'),
      name: 'comment',
    },
    {
      label: intl.get('sslm.operatingRecord.model.approveHistory.assigneeDate').d('审批时间'),
      name: 'endTime',
      type: 'dateTime',
    },
  ],
});

export { operationRecordDS, approvedRecordDS };
