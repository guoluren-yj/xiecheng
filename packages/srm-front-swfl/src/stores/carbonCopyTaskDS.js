/*
 * @Descripttion:
 * @Date: 2021-06-04 16:31:09
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HWFP } from 'utils/config';
import { stringify } from 'qs';
import intl from 'utils/intl';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';

const tenantId = getCurrentOrganizationId();
// 请求API前缀
const prefix = `${HZERO_HWFP}/v1/${tenantId}`;

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

// 列表页-查询表单
export const listFormDS = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'processDescriptionLike',
      type: 'string',
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
    },
    {
      name: 'processDefinitionNameLike',
      label: intl.get('hwfp.common.model.process.name').d('流程名称'),
    },
    {
      name: 'startedUserLov',
      // label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
      type: 'object',
      lovCode: 'HWFP.EMPLOYEE',
      textField: 'name',
      lovPara: { tenantId: getCurrentOrganizationId(), empStatus: 'ALL' },
      ignore: 'always',
      multiple: true,
      lovQueryAxiosConfig: (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': 'HWFP.EMPLOYEE',
            's-lov-display-field': 'name',
          },
        }),
    },
    {
      name: 'startedUserList',
      bind: 'startedUserLov.employeeNum',
    },
    {
      name: 'documentLov',
      // label: intl.get('hwfp.common.model.documents.class').d('流程单据'),
      type: 'object',
      lovCode: 'HWFP.PROCESS_DOCUMENT',
      textField: 'description',
      lovPara: { tenantId: getCurrentOrganizationId() },
      ignore: 'always',
      lovQueryAxiosConfig: (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': 'HWFP.PROCESS_DOCUMENT',
            's-lov-display-field': 'description',
          },
        }),
    },
    {
      name: 'documentCode',
      bind: 'documentLov.documentCode',
    },
    {
      name: 'processInstanceId',
      label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
    },
    {
      name: 'finishedTime',
      type: 'date',
      range: ['finishedAfter', 'finishedBefore'],
      label: intl.get('hwfp.task.view.message.title.endTime').d('结束时间'),
    },
    {
      name: 'finishedAfter',
      label: intl.get('hwfp.monitor.view.message.finishedAfter').d('结束时间从'),
    },
    {
      name: 'finishedBefore',
      label: intl.get('hwfp.monitor.view.message.finishedBefore').d('结束时间至'),
    },
    {
      name: 'createdTime',
      type: 'date',
      range: ['startedAfter', 'startedBefore'],
      // label: intl.get('hwfp.task.model.task.creationTime').d('创建时间'),
    },
    {
      name: 'startedAfter',
      label: intl.get('hzero.common.date.creation.from').d('创建日期从'),
    },
    {
      name: 'startedBefore',
      label: intl.get('hzero.common.date.creation.to').d('创建日期至'),
    },
    {
      name: 'readFlag',
      // label: intl.get('hwfp.carbonCopyTask.view.message.priority').d('状态'),
    },
    {
      name: 'processStatusList',
      // label: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
      multiple: true,
    },
    {
      name: 'sortCode',
    },
    {
      name: 'sortType',
    },
    {
      name: 'startedUserUnitList',
      label: intl.get('hwfp.common.task.applyDepartment').d('申请部门'),
      type: 'object',
      lovCode: 'SPFM.UNIT.DEPARTMENT',
      ignore: 'always',
      multiple: true,
    },
  ],
  data: [
    {
      sortCode: 'createdTime',
      sortType: 'desc',
    },
  ],
});

// 列表页-表格
export const listTableDS = () => ({
  fields: [
    {
      name: 'processStatus',
      label: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
    },
    {
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
      name: 'description',
    },
    {
      label: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
      name: 'taskName',
    },
    {
      label: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
      name: 'currentApprover',
    },
    {
      label: intl.get('hwfp.carbonCopyTask.model.carbonCopyTask.endTime').d('结束时间'),
      name: 'endTime',
    },
    {
      label: intl.get('hwfp.carbonCopyTask.model.carbonCopyTask.readFlag').d('状态'),
      name: 'readFlag',
    },
    {
      label: intl.get('hzero.common.button.action').d('操作'),
      name: 'operator',
    },
    {
      name: 'processDetail',
      label: intl.get('hwfp.common.model.process.detail').d('流程明细'),
    },
    {
      name: 'preStage',
      label: intl.get('hwfp.common.view.message.current.preStage').d('上一节点'),
    },
    {
      name: 'previousNodeName',
      label: intl.get('hwfp.common.view.message.current.preStage').d('上一节点'),
    },
    {
      name: 'previousApprover',
      label: intl.get('hwfp.common.view.message.current.preStage.approver').d('上一节点审批人'),
    },
    {
      name: 'previousComment',
      label: intl.get('hwfp.common.view.message.current.preStage.comment').d('上一节点审批意见'),
    },
    {
      name: 'modelStandardTime',
      label: intl.get('hwfp.common.view.message.current.preStage.modelStandardTime').d('标准用时'),
    },
  ],
  autoCount: false,
  transport: {
    read: ({ data, params }) => {
      const { carbonCopy = true, page, size } = params;
      const { queryParams = {} } = data;
      return {
        url: `${prefix}/process/instance/query/new-page?${stringify({
          carbonCopy,
        })}&needPreviousComment=true&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.CC,HWFP.APPROVAL_WORKBENCH_LIST.CC_FILTER`,
        method: 'POST',
        data: {
          ...queryParams,
          page,
          size,
        },
      };
    },
  },
});
