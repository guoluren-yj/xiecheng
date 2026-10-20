/**
 * 接口转发-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-7-2
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.interfaceForward';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    CANCEL: intl.get('hzero.common.button.cancel').d('取消'),
    ENABLE: intl.get('hzero.common.enable').d('启用'),
    DISABLE: intl.get('hzero.common.disable').d('禁用'),
    PREVIEW: intl.get('hzero.common.preview').d('预览'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    UPLOAD: intl.get('hzero.common.button.upload').d('上传'),
    ADD: intl.get('hzero.common.button.add').d('新增'),
    UP: intl.get('hzero.common.button.up').d('收起'),
    EXPAND: intl.get('hzero.common.button.expand').d('展开'),
    ENABLE_FLAG: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    TENANT: intl.get('hzero.common.model.common.tenant').d('租户'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口转发配置'),
    DETAIL: intl.get(`${PREFIX}.view.title.detail`).d('接口转发配置详情'),
    BASIC_INFO: intl.get(`${PREFIX}.view.title.basicInfo`).d('基础信息'),
    USER_TENANT_LIST: intl.get(`${PREFIX}.view.title.userTenantList`).d('用户/租户列表'),
    USER_TENANT_INFO: intl.get(`${PREFIX}.view.title.userTenantInfo`).d('用户/租户信息'),

    BATCH_CREATE_RULE: intl.get(`${PREFIX}.view.button.batchCreateRule`).d('批量新建规则'),
    CREATE_RULE: intl.get(`${PREFIX}.view.button.createRule`).d('新建规则'),
    EDIT_RULE: intl.get(`${PREFIX}.view.button.editRule`).d('编辑规则'),
    UPDATE_URL: intl.get(`${PREFIX}.view.button.updateUrl`).d('更新限流地址'),

    URL_RULE_CODE: intl.get(`${PREFIX}.model.interfaceForward.urlRuleCode`).d('配置编码'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.interfaceForward.interfaceCode`).d('接口编码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.interfaceForward.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.interfaceForward.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.interfaceForward.serverName`).d('服务名称'),
    NAMESPACE: intl.get(`${PREFIX}.model.interfaceForward.namespace`).d('服务命名空间'),
    TARGET_SERVICE: intl.get(`${PREFIX}.model.interfaceForward.targetService`).d('目标服务'),
    TARGET_URL: intl.get(`${PREFIX}.model.interfaceForward.targetUrl`).d('目标URL'),
    TARGET_URL_TIP: intl
      .get(`${PREFIX}.model.interfaceForward.targetUrlTip`)
      .d('示例：/v1/rest/invoke，为空时与接口地址一致。'),
    PRIORITY: intl.get(`${PREFIX}.model.interfaceForward.priority`).d('优先级'),
    PRIORITY_TIP: intl
      .get(`${PREFIX}.model.interfaceForward.priorityTip`)
      .d('数字越小，优先级越高；相同优先级，创建时间越后优先级越高。'),
    STATUS: intl.get(`${PREFIX}.model.interfaceForward.status`).d('配置状态'),
    DESCRIPTION: intl.get(`${PREFIX}.model.interfaceForward.description`).d('描述'),
    TYPE: intl.get(`${PREFIX}.model.interfaceForward.type`).d('类型'),
    NAME: intl.get(`${PREFIX}.model.interfaceForward.name`).d('用户/租户'),
    USER: intl.get(`${PREFIX}.model.interfaceForward.use`).d('用户'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.interfaceForward.saveValidate`).d('请先完善必输内容'),
  };
  return LANGS[key];
};

export default getLang;
