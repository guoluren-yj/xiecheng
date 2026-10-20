/**
 * 我的接口申请-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-8-24
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.myApplication';
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
    TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),

    ADD: intl.get(`${PREFIX}.view.button.add`).d('添加'),
    RECALL: intl.get(`${PREFIX}.view.button.recall`).d('撤回'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('我的接口申请'),
    INTERFACE_APPLY: intl.get(`${PREFIX}.view.title.interfaceApply`).d('接口权限申请'),
    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基础信息'),
    INTERFACE_INFO: intl.get(`${PREFIX}.view.title.interfaceInfo`).d('接口信息'),

    PERMISSION_APPLY: intl.get(`${PREFIX}.view.button.permissionApply`).d('权限申请'),

    APPLY_CODE: intl.get(`${PREFIX}.model.myApplication.applyCode`).d('申请编码'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.myApplication.interfaceCode`).d('接口编码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.myApplication.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.myApplication.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.myApplication.serverName`).d('服务名称'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.statistics.sourceType`).d('接口来源'),
    APPROVAL_STATUS: intl.get(`${PREFIX}.model.myApplication.approvalStatus`).d('审批状态'),
    SUBMITTED_TIME_FROM: intl
      .get(`${PREFIX}.model.myApplication.submittedTimeFrom`)
      .d('提交时间从'),
    SUBMITTED_TIME_TO: intl.get(`${PREFIX}.model.myApplication.submittedTimeTo`).d('提交时间至'),
    NAMESPACE: intl.get(`${PREFIX}.model.myApplication.namespace`).d('服务命名空间'),
    APPLY_REASON: intl.get(`${PREFIX}.model.myApplication.applyReason`).d('申请理由'),
    SUBMITTED_TIME: intl.get(`${PREFIX}.model.myApplication.submittedTime`).d('提交时间'),
    APPROVAL_REASON: intl.get(`${PREFIX}.model.myApplication.approvalReason`).d('审批意见'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.myApplication.saveValidate`).d('请先完善必输内容'),
    EMPTY_INTERFACE_VALIDATE: intl
      .get(`${PREFIX}.model.myApplication.emptyInterfaceValidate`)
      .d('请先选择需要申请权限的接口'),
  };
  return LANGS[key];
};

export default getLang;
