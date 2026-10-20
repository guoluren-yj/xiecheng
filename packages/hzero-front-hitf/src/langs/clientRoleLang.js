/**
 * 接口授权-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-10-11
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.clientRole';

  const LANGS = {
    PREFIX,
    STATUS: intl.get('hzero.common.status').d('状态'),
    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    EXPLAIN: intl.get('hzero.common.explain').d('说明'),
    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),

    AT_LEAST: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据	'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口授权'),
    INTERFACE_INFO: intl.get(`${PREFIX}.view.title.interfaceInfo`).d('接口信息'),

    COPY_AUTH: intl.get(`${PREFIX}.view.button.copyAuth`).d('复制授权'),
    AUTH: intl.get(`${PREFIX}.view.button.auth`).d('授权'),
    DELETE_AUTH: intl.get(`${PREFIX}.view.button.deleteAuth`).d('删除授权'),
    ADD_AUTH: intl.get(`${PREFIX}.view.button.addAuth`).d('添加授权'),

    NAME: intl.get(`${PREFIX}.model.clientRole.name`).d('角色名称'),
    CODE: intl.get(`${PREFIX}.model.clientRole.code`).d('角色编码'),
    LEVEL: intl.get(`${PREFIX}.model.clientRole.level`).d('角色层级'),
    TOP_ROLE: intl.get(`${PREFIX}.model.clientRole.topRole`).d('上级角色'),
    ROLE_SOURCE: intl.get(`${PREFIX}.model.clientRole.roleSource`).d('角色来源'),
    BELONG: intl.get(`${PREFIX}.model.clientRole.belong`).d('继承自'),
    LEVEL_PATH: intl.get(`${PREFIX}.model.clientRole.levelPath`).d('角色路径'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.clientRole.sourceType`).d('接口来源'),

    NAMESPACE: intl.get(`${PREFIX}.model.clientRole.namespace`).d('服务命名空间'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.clientRole.interfaceCode`).d('接口代码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.clientRole.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.clientRole.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.clientRole.serviceName`).d('服务名称'),
    CODE_OR_NAME: intl.get(`${PREFIX}.model.clientRole.codeOrName`).d('查询条件'),
    SEARCH_NAME: intl
      .get(`${PREFIX}.model.clientRole.searchName`)
      .d('接口代码|接口名称|服务代码|服务名称'),
    AUTH_TIP: intl.get(`${PREFIX}.view.title.header.tip`).d('用户当前所属角色只能查看接口权限'),
  };
  return LANGS[key];
};

export default getLang;
