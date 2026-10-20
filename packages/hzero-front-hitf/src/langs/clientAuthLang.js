/**
 * 授权客户端-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-7-14
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key, extraData = {}) => {
  const PREFIX = 'hitf.clientAuth';

  const LANGS = {
    PREFIX,
    EXPLAIN: intl.get('hzero.common.explain').d('说明'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),

    HEADER: intl.get(`${PREFIX}.view.message.title.header`).d('授权客户端'),
    AUTHED_INTERFACE: intl.get(`${PREFIX}.view.title.authedInterface`).d('已授权接口'),
    VIEW_AUTH: intl.get(`${PREFIX}.view.button.viewAuth`).d('权限查看'),
    ADD_ROLE: intl.get(`${PREFIX}.view.button.addRole`).d('添加角色'),
    DELETE_ROLE: intl.get(`${PREFIX}.view.button.deleteRole`).d('删除角色'),

    CLIENT: intl.get(`${PREFIX}.model.clientAuth.client`).d('客户端'),
    STATISTICS_LEVEL: intl.get(`${PREFIX}.model.clientAuth.statisticsLevel`).d('统计维度'),
    STATISTICS_LEVEL_TIP: intl
      .get(`${PREFIX}.model.clientAuth.statisticsLevelTip`)
      .d(
        '统计维度用于在接口配置维护里面对接口调用次数进行配置设置。比如要限制客户端调用某一个接口在某一个租户下调用多少次数，这里需要把统计维度设置为该租户。'
      ),
    AUTH_FLAG: intl.get(`${PREFIX}.model.clientAuth.authFlag`).d('是否授权'),
    ROLE_NAME: intl.get(`${PREFIX}.model.clientAuth.roleName`).d('角色名称'),
    ROLE_CODE: intl.get(`${PREFIX}.model.clientAuth.roleCode`).d('角色代码'),
    LEVEL_PATH: intl.get(`${PREFIX}.model.clientAuth.levelPath`).d('角色路径'),

    NAMESPACE: intl.get(`${PREFIX}.model.clientAuth.namespace`).d('服务命名空间'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.clientAuth.interfaceCode`).d('接口代码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.clientAuth.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.clientAuth.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.clientAuth.serviceName`).d('服务名称'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.clientAuth.sourceType`).d('接口来源'),

    REPEAT_ROLE: intl
      .get(`${PREFIX}.model.clientAuth.repeatRole`)
      .d(`角色【${extraData.name}：${extraData.levelPath}】已存在，请勿重复添加`),
    SAVE_VALIDATE: intl.get(`${PREFIX}.model.clientAuth.saveValidate`).d('请先完善必输内容'),
  };
  return LANGS[key];
};

export default getLang;
