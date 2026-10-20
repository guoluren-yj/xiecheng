/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-10 15:41:27
 * @LastEditors: yanglin
 * @LastEditTime: 2022-06-17 15:14:22
 */
import intl from 'utils/intl';
import { SRM_SRPM } from '_utils/config';
import { isEmpty } from 'lodash';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { queryBatchSimpleApprovalHistory, queryBatchApprovaFlag } from '_utils/utils';
import { getBatchOperationFlag } from '../util.js';

const organizationId = getCurrentOrganizationId();
const commonPrompt = 'srpm.common.model.common';

const underApprovalDs = () => ({
  autoQuery: false,
  pageSize: 20,
  primaryKey: 'rpHeaderId',
  autoLocateFirst: false,
  cacheModified: true,
  // cacheSelection: true,
  selection: false,
  fields: [
    {
      name: 'rpStatus',
      label: intl.get(`hzero.common.status`).d('状态'),
    },
    {
      name: 'displayRpNum',
      label: intl.get(`${commonPrompt}.rpNum`).d('需求计划单号'),
    },
    {
      name: 'templateCode',
      label: intl.get(`${commonPrompt}.templateCode`).d('计划模版编码'),
    },
    {
      name: 'templateName',
      label: intl.get(`${commonPrompt}.templateName`).d('计划模版名称'),
    },
    {
      name: 'templateType',
      label: intl.get(`${commonPrompt}.templateType`).d('模版类型'),
    },
    {
      name: 'companyName',
      label: intl.get(`entity.company.tag`).d('公司'),
    },
    {
      name: 'ouName',
      label: intl.get(`entity.business.tag`).d('业务实体'),
    },
    {
      name: 'purchaseOrgName',
      label: intl.get(`entity.organization.class.purchase`).d('采购组织'),
    },
    {
      name: 'originalCurrency',
      label: intl.get('srpm.common.model.common.currency').d('币种'),
    },
    {
      name: 'purchaseAgentName',
      label: intl.get(`${commonPrompt}.planner`).d('计划员'),
    },
    {
      name: 'createdByName',
      label: intl.get(`entity.roles.creator`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'dateTime',
      label: intl.get(`${commonPrompt}.creationDate`).d('创建日期'),
    },
    {
      name: 'operator',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'workFlowApproveProcess',
      label: intl.get('hzero.common.button.approve.process').d('审批进度'),
    },
  ],
  transport: {
    read: ({ data }) => {
      return {
        url: `${SRM_SRPM}/v1/${organizationId}/request-plan/list`,
        method: 'GET',
        data: filterNullValueObject({
          ...data,
          queryType: 'SUBMITTED',
          customizeUnitCode:
            'SRPM.RP_PLATFORM.UNDERAPPROVAL_SEARCHBAR,SRPM.RP_PLATFORM.UNDERAPPROVAL.LIST',
        }),
      };
    },
  },
  events: {
    load: async ({ dataSet }) => {
      if (!dataSet.getState('initFlag')) {
        dataSet.setState('initFlag', true);
      }
      const workFlowBussinessKeys = dataSet.reduce((acc, cur) => {
        const value = cur.get('workflowBusinessKey');
        const approvalMethod = cur.get('approvalMethod');
        if (value && approvalMethod === 'WORKFLOW') {
          acc.push(value);
        }
        return acc;
      }, []);
      if (!isEmpty(workFlowBussinessKeys)) {
        // 获取审批按钮显示状态
        const approvaFlags = await queryBatchApprovaFlag(workFlowBussinessKeys);
        // 获取撤销审批按钮状态
        const operationFlags = await getBatchOperationFlag(workFlowBussinessKeys);
        // 查询审批记录数据
        const simpleApprovalHistoryData = await queryBatchSimpleApprovalHistory(
          workFlowBussinessKeys
        );
        dataSet.setState({ simpleApprovalHistoryData, approvaFlags, operationFlags });
      }
    },
  },
});

export { underApprovalDs };
