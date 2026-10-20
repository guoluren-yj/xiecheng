import moment from 'moment';
import { HZERO_HWFP } from 'utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

const currentOrganizationId = getCurrentOrganizationId();

export function getSettingConfig() {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'enabledFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.model.todoRemind.newTitle').d('待办定时提醒（SRM消息通知）'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'remindDate',
        type: 'time',
        format: 'HH:mm:ss',
        label: intl.get('hwfp.common.model.remind.everyDay').d('提醒时间(每天)'),
        transformResponse: (value) => {
          return moment().set({ hour: value, minute: 0, second: 0 }).format(); // 对时间处理使组件可以格式化
        },
        transformRequest: (value) => {
          return moment(value).hour(); // 专门获取小时
        },
        computedProps: {
          disabled: ({ record }) => !record.get('enabledFlag'),
          required: ({ record }) => record.get('enabledFlag'),
        },
      },
      {
        name: 'remindIntervalTime',
        type: 'number',
        label: intl
          .get('hwfp.common.model.todoRemind.time.interval')
          .d('允许再次催办的间隔（小时）'),
        min: 0.5,
        precision: 1,
        step: 0.5,
      },
      {
        name: 'msgFormMenuDisplayFlag',
        type: 'boolean',
        label: intl
          .get('hwfp.common.model.msgFormMenuDisplayFlag.newTitle')
          .d('消息推送外部系统，跳转SRM展示表单'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        required: true,
      },
      {
        name: 'msgTabCloseFlag',
        defaultValue: 0,
      },
      {
        name: 'todoJumpApprovedFlag',
        defaultValue: 0,
      },
      {
        name: 'approvalFormMergeFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.model.approvalFormMergeFlag').d('合并审批表单和记录'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'autoApprovalFilterFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.filter.auto').d('过滤自行审批或已审批自动同意'),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'noAssigneeApprovalFilterFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.filtering.auto').d('过滤无审批人自动同意'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        name: 'multiApprovalFilterFlag',
        type: 'boolean',
        label: intl
          .get('hwfp.common.filtering.multiApprovalFilterFlag')
          .d('过滤会签中未实际参与的审批人'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'commentUnfoldFlag',
        type: 'boolean',
        label: intl
          .get('hwfp.common.filtering.defaultExpandHistoryFlag')
          .d('审批记录/评论回复默认展开'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'forecastUnfoldFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.filtering.defaultExpandForecastFlag').d('流程预览默认展开'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'modelStandardTimeFlag',
        type: 'boolean',
        label: intl.get('hwfp.common.filtering.modelStandardTimeFlag').d('展示人工节点标准用时'),
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
      {
        name: 'approvalActionSeqDataMap',
        type: 'object',
      },
      {
        name: 'approved',
        type: 'intl',
        label: intl.get('hwfp.task.button.approvalAdopt').d('审批通过'),
      },
      {
        name: 'rejected',
        type: 'intl',
        label: intl.get('hzero.common.view.message.title.reject').d('审批拒绝'),
      },
      {
        name: 'delegate',
        type: 'intl',
        label: intl.get('hzero.common.message.delegate').d('转交'),
      },
      {
        name: 'rebut',
        type: 'intl',
        label: intl.get('hwfp.task.view.option.jumped', { name: '驳回' }).d('驳回'),
      },
      {
        name: 'addSign',
        type: 'intl',
        label: intl.get('hwfp.task.view.option.addUser', { name: '加签' }).d('加签'),
      },
      {
        name: 'approveAndAddSign',
        type: 'intl',
        label: intl
          .get('hwfp.task.view.option.ApproveAndAddSign', { name: `同意并加签` })
          .d('同意并加签'),
      },
      {
        name: 'recall',
        type: 'intl',
        label: intl.get('hwfp.common.view.message.recall').d('撤回'),
      },
      {
        name: 'revoke',
        type: 'intl',
        label: intl.get('hzero.common.status.revoke').d('撤销'),
      },
      {
        name: 'carbonCopy',
        type: 'intl',
        label: intl.get('hzero.common.record.circulate').d('传阅'),
      },
      {
        name: 'remind',
        type: 'intl',
        label: intl.get('hwfp.common.view.message.remind').d('催办'),
      },
      {
        name: 'labelConfList',
        label: intl.get('hwfp.common.view.message.taskTag').d('待办标签定义'),
      },
      {
        name: 'fastReplyList',
        label: intl.get('hwfp.common.view.title.fasetReplySetting').d('预定义快捷回复设置'),
      },
      {
        name: 'jumpConsistencyCheckFlag',
        type: 'boolean',
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
      {
        label: intl
          .get('hwfp.common.view.title.addsignNotautoApproved')
          .d('加签/转交审批人不执行已审批自动同意'),
        name: 'disableAutoApprovalFlag',
        type: 'boolean',
        help: intl
          .get('hwfp.common.view.title.addsignNotautoApproved.help')
          .d(
            '开启该配置后，审批人作为加签人、转交人时则不会执行自动同意（配置包含："自动处理规则-自动同意"、"自审批自动同意"、"已审批自动同意")，需要在页面上再次审批'
          ),
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'stepRebutFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'approverResignDefaultEmpLov',
        type: 'object',
        lovCode: 'HWFP.EMPLOYEE',
        lovPara: {
          tenantId: currentOrganizationId,
          enabledFlag: 1,
        },
        textField: 'name',
        valueField: 'employeeNum',
      },
      {
        name: 'approverResignStrategy',
        defaultValue: 'DELEGATE_SUSPENDED',
      },
      {
        name: 'rejectJumpOriginApproverFlag',
        label: intl
          .get('hwfp.common.view.message.rejectJumpOriginApproverFlag')
          .d('拒绝跳过成功，新发起流程回到节点原始审批人'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'rejectJumpAutoApprovedFlag',
        label: intl
          .get('hwfp.common.view.message.rejectJumpAutoApprovedFlag')
          .d('拒绝跳过成功会签节点审批人无需审批'),
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
      },
      {
        name: 'approvalShowSuspend',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HWFP}/v1/${currentOrganizationId}/notification`,
          method: 'POST',
        };
      },
    },
  };
}
