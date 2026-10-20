/**
 * 接口能力汇总-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-3-23
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.interfaces';
  const LANGS = {
    PREFIX,
    CREATE: intl.get('hzero.common.create').d('新建'),
    INCREASE: intl.get('hzero.common.button.add').d('新增'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    SURE: intl.get('hzero.common.button.ok').d('确定'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    CANCEL: intl.get('hzero.common.button.cancel').d('取消'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),

    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    NAMESPACE: intl.get(`${PREFIX}.model.interfaces.namespace`).d('服务命名空间'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.interfaces.interfaceCode`).d('接口编码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.interfaces.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.interfaces.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.interfaces.serverName`).d('服务名称'),
    SERVER_TYPE: intl.get(`${PREFIX}.model.interfaces.serverType`).d('服务类型'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.interfaces.source`).d('接口来源'),
    IS_PUBLIC_FLAG: intl.get(`${PREFIX}.model.interfaces.isPublicFlag`).d('是否公开'),
    AUTH_TENANT: intl.get(`${PREFIX}.model.interfaces.authTenant`).d('授权租户'),
    AUTH_TENANT_TIP: intl
      .get(`${PREFIX}.model.interfaces.authTenantTip`)
      .d('当前租户是否有该接口权限'),
    AUTH_ROLE: intl.get(`${PREFIX}.model.interfaces.authRole`).d('授权角色'),
    AUTH_ROLE_TIP: intl.get(`${PREFIX}.model.interfaces.authRoleTip`).d('当前角色是否有该接口权限'),
    INTERFACE_CONTEXT_DIGEST: intl
      .get(`${PREFIX}.model.interfaces.interfaceContextDigest`)
      .d('路由摘要'),
    INTERFACE_CONTEXT_DIGEST_TIP: intl
      .get(`${PREFIX}.model.interfaces.interfaceContextDigestTip`)
      .d('v2p版本接口透传路由上下文信息base64摘要'),

    VIEW_DOCUMENT: intl.get(`${PREFIX}.view.button.viewDocument`).d('查看文档'),
    AUTH: intl.get(`${PREFIX}.view.button.auth`).d('认证配置'),

    INTERFACE_HEADER: intl.get(`${PREFIX}.view.message.title.header`).d('接口能力汇总'),
    BATCH_ADD: intl.get(`${PREFIX}.view.button.add`).d('批量添加认证'),
    TEST: intl.get(`${PREFIX}.view.button.test`).d('测试'),

    AUTH_LEVEL: intl.get(`${PREFIX}.model.interfaces.authLevel`).d('认证层级'),
    AUTH_LEVEL_VALUE: intl.get(`${PREFIX}.model.interfaces.authLevelValue`).d('认证层级值'),
    AUTH_LEVEL_CLIENT: intl.get(`${PREFIX}.model.interfaces.client`).d('客户端'),
    AUTH_LEVEL_TENANT: intl.get(`${PREFIX}.model.interfaces.tenant`).d('租户'),
    AUTH_LEVEL_ROLE: intl.get(`${PREFIX}.model.interfaces.role`).d('角色'),
    AUTH_TYPE: intl.get(`${PREFIX}.model.interfaces.authType`).d('认证模式'),
    REMARK: intl.get(`${PREFIX}.model.interfaces.remark`).d('备注'),
    AUTH_INFO: intl.get(`${PREFIX}.model.interfaces.authInfo`).d('认证信息'),

    AUTH_CONFIG_HEADER: intl.get(`${PREFIX}.view.message.title.authConfigHeader`).d('认证配置'),
    EDIT_AUTH: intl.get(`${PREFIX}.view.message.title.auth.edit`).d('编辑认证配置'),
    CREATE_AUTH: intl.get(`${PREFIX}.view.message.title.auth.create`).d('创建认证配置'),

    TEST_SUCCESS: intl.get(`${PREFIX}.view.message.test.success`).d('测试成功'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.dataMapping.saveValidate`).d('请先完善必输内容'),
    SAVE_EMPTY: intl.get(`${PREFIX}.model.dataMapping.saveEmpty`).d('无修改内容,无需保存'),
    EMPTY_INTERFACE_VALIDATE: intl
      .get(`${PREFIX}.model.interfaces.emptyInterfaceValidate`)
      .d('请先选择需要配置认证信息的接口'),
    EMPTY_AUTH_VALIDATE: intl
      .get(`${PREFIX}.model.authConfig.emptyValidate`)
      .d('请先选择需要删除的认证信息'),
  };
  return LANGS[key];
};

export default getLang;
