/*
 * @Descripttion:
 * @Date: 2021-05-28 14:24:06
 * @Author: xshen <xia.shen@going-link.com>
 * @version:
 * @copyright: Copyright (c) 2018, Hand
 */
import { getCurrentOrganizationId } from 'utils/utils';
import { HZERO_HWFP } from 'utils/config';
import { stringify } from 'qs';
import moment from 'moment';
import intl from 'utils/intl';
import request from 'utils/request';
import notification from 'utils/notification';
import { isEmpty } from 'lodash';
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
      label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
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
      label: intl.get('hwfp.common.view.message.handler').d('当前处理人'),
      name: 'assignLov',
      type: 'object',
      textField: 'name',
      lovCode: 'HWFP.EMPLOYEE',
      lovPara: { tenantId: getCurrentOrganizationId(), empStatus: 'ALL' },
      ignore: 'always',
      lovQueryAxiosConfig: (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': 'HWFP.EMPLOYEE',
            's-lov-display-field': 'name',
          },
        }),
    },
    {
      name: 'assignee',
      bind: 'assignLov.employeeNum',
    },
    {
      name: 'documentLov',
      label: intl.get('hwfp.common.model.documents.class').d('流程单据'),
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
      name: 'startedTime',
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
      name: 'empLastApprovalTime',
      type: 'date',
      range: ['empLastApprovalTimeAfter', 'empLastApprovalTimeBefore'],
      label: intl.get('hwfp.common.model.approval.time').d('审批时间'),
    },
    {
      name: 'empLastApprovalTimeAfter',
      label: intl.get('hzero.common.date.approve.empLastApprovalTimeAfter').d('审批时间从'),
    },
    {
      name: 'empLastApprovalTimeBefore',
      label: intl.get('hzero.common.date.approve.empLastApprovalTimeBefore').d('审批时间至'),
    },
    {
      name: 'processStatusList',
      label: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
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
      sortCode: 'startedTime',
      sortType: 'desc',
      startedTime: {
        startedAfter: moment().subtract(1, 'years').format('YYYY-MM-DD'),
      },
    },
  ],
});

// 列表页-表格
export const listTableDS = () => ({
  fields: [
    {
      name: 'id',
      label: intl.get('hwfp.common.model.process.ID').d('流程标识'),
    },
    {
      name: 'process',
      label: intl.get('hwfp.common.model.process.process').d('流程'),
    },
    {
      name: 'processStatus',
      label: intl.get('hwfp.common.model.process.approvalStatus').d('审批状态'),
    },
    {
      name: 'processName',
      label: intl.get('hwfp.common.model.process.approvalStatus').d('流程名称'),
    },
    {
      name: 'description',
      label: intl.get('hwfp.common.model.process.description').d('流程描述'),
    },
    {
      name: 'taskName',
      label: intl.get('hwfp.common.view.message.current.stage').d('当前节点'),
    },
    {
      name: 'startUserName',
      label: intl.get('hwfp.common.model.apply.owner').d('申请人'),
    },
    {
      name: 'startUserUnitName',
      label: intl.get('hwfp.common.model.apply.startUserUnitName').d('申请部门'),
    },
    {
      name: 'startTime',
      label: intl.get('hwfp.common.model.apply.time').d('申请时间'),
    },
    {
      name: 'empLastApprovalTime',
      label: intl.get('hwfp.common.view.message.empLastApprovalTime').d('审批时间'),
    },
    {
      name: 'endTime',
      label: intl.get('hwfp.involvedTask.model.involvedTask.endTime').d('结束时间'),
    },
    {
      name: 'addCc',
      type: 'object',
      lovCode: 'HPFM.HR.UNIT_EMPLOYEE_CODE_TREE',
      multiple: true,
      label: intl.get('hwfp.common.view.piece.data').d('条数据'),
      ignore: 'always',
      lovPara: { tenantId: getCurrentOrganizationId(), employeeResign: true },
    },
    {
      name: 'operator',
      label: intl.get('hzero.common.button.action').d('操作'),
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
    {
      name: 'processExceptionInformation',
    },
  ],
  autoCount: false,
  transport: {
    read: ({ data, params }) => {
      const { involved = true, page, size } = params;
      const { queryParams = {} } = data;
      return {
        url: `${prefix}/process/instance/query/new-page?${stringify({
          involved,
        })}&needPreviousComment=true&customizeUnitCode=HWFP.APPROVAL_TABLE_UNIT_GROUP.APPROVED,HWFP.APPROVAL_WORKBENCH_LIST.INVOLVED_TASK.FILTER`,
        method: 'POST',
        data: {
          ...queryParams,
          page,
          size,
        },
      };
    },
  },
  events: {
    update: ({ record, name, value }) => {
      if (name === 'addCc') {
        const id = record.get('id');
        const employeeNum = [];
        value.forEach((item) => {
          employeeNum.push(item.code);
        });
        request(`${prefix}/process/instance/carbon-copy?processInstanceId=${id}&type=involved`, {
          method: 'POST',
          body: employeeNum,
          responseType: 'text',
        }).then((res) => {
          if (isEmpty(res)) {
            notification.success();
          } else {
            notification.warning({
              message: res,
            });
          }
        });
      }
    },
  },
});
