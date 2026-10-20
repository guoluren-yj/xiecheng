/**
 * 接口权限审批-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-8-24
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.approval';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    SURE: intl.get('hzero.common.button.ok').d('确定'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    SUBMIT: intl.get('hzero.common.button.submit').d('提交'),
    ENABLE: intl.get('hzero.common.enable').d('启用'),
    DISABLE: intl.get('hzero.common.disable').d('禁用'),
    STATUS: intl.get('hzero.common.status').d('状态'),
    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),

    ADD: intl.get(`${PREFIX}.view.button.add`).d('添加'),
    RECALL: intl.get(`${PREFIX}.view.button.recall`).d('撤回'),
    AGREE: intl.get(`${PREFIX}.view.button.agree`).d('同意'),
    REJECT: intl.get(`${PREFIX}.view.button.reject`).d('拒绝'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口权限审批'),
    TODO_LIST: intl.get(`${PREFIX}.view.title.todoList`).d('待办列表'),
    APPROVAL_LIST: intl.get(`${PREFIX}.view.title.approvalList`).d('已办列表'),

    PERMISSION_APPLY: intl.get(`${PREFIX}.view.button.permissionApply`).d('权限申请'),

    APPLY_CODE: intl.get(`${PREFIX}.model.approval.applyCode`).d('申请编码'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.approval.interfaceCode`).d('接口编码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.approval.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.approval.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.approval.serverName`).d('服务名称'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.statistics.sourceType`).d('接口来源'),
    APPROVAL_STATUS: intl.get(`${PREFIX}.model.approval.approvalStatus`).d('审批状态'),
    SUBMITTED_TIME_FROM: intl.get(`${PREFIX}.model.approval.submittedTimeFrom`).d('提交时间从'),
    SUBMITTED_TIME_TO: intl.get(`${PREFIX}.model.approval.submittedTimeTo`).d('提交时间至'),
    NAMESPACE: intl.get(`${PREFIX}.model.approval.namespace`).d('服务命名空间'),
    APPLY_REASON: intl.get(`${PREFIX}.model.approval.applyReason`).d('申请理由'),
    SUBMITTED_TIME: intl.get(`${PREFIX}.model.approval.submittedTime`).d('提交时间'),
    APPROVAL_TIME: intl.get(`${PREFIX}.model.approval.approvalTime`).d('审批时间'),
    APPROVAL_REASON: intl.get(`${PREFIX}.model.approval.approvalReason`).d('审批意见'),
    APPLICANT: intl.get(`${PREFIX}.model.approval.Applicant`).d('申请人'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.approval.saveValidate`).d('请先完善必输内容'),
  };
  return LANGS[key];
};

export default getLang;
