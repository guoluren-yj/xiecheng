/**
 * 服务领域-多语言
 * @author weikang.lin@hand-china.com
 * @date 2020-10-26
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.serverDomain';

  const LANGS = {
    PREFIX,

    ENABLE: intl.get('hzero.common.enable').d('启用'),
    STATES: intl.get('hzero.common.status').d('状态'),
    TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    DISABLED: intl.get('hzero.common.disable').d('禁用'),
    ENABLED: intl.get('hzero.common.enable').d('启用'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    CREATE: intl.get('hzero.common.create').d('新建'),
    OPTION: intl.get('hzero.common.button.action').d('操作'),
    EXPAND_ALL: intl.get('hzero.common.button.expandAll').d('全部展开'),
    COLLAPSE_ALL: intl.get('hzero.common.button.collapseAll').d('全部收起'),
    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    SAVE: intl.get('hzero.common.button.save').d('保存'),

    DISABLE_CONFIRM: intl.get(`${PREFIX}.view.message.disableConfirm`).d('是否禁用？'),
    ENABLE_CONFIRM: intl.get(`${PREFIX}.view.message.enableConfirm`).d('是否启用？'),
    SERVER_DOMAIN: intl.get(`${PREFIX}.view.placeholder.serverDomain`).d('服务领域'),
    DELETE_CONFIRM: intl
      .get(`${PREFIX}.view.message.deleteConfirm`)
      .d('删除操作将级联删除子级服务领域，确认执行吗？'),
    VALIDATE: intl.get(`${PREFIX}.view.message.validate`).d('请先完善必输内容'),
    DOMAIN_CODE: intl.get(`${PREFIX}.view.model.domainCode`).d('领域代码'),
    DOMAIN_NAME: intl.get(`${PREFIX}.view.model.domainName`).d('领域名称'),
    NAME_LEVEL_PATHS: intl.get(`${PREFIX}.view.model.nameLevelPaths`).d('领域层级'),
    SERVER_DOMAIN_PARENT: intl.get(`${PREFIX}.view.model.serverDomainParent`).d('上级领域'),
    SERVER_DOMAIN_SON: intl.get(`${PREFIX}.button.serverDomainSon`).d('新建子领域'),
    ADD_SERVER_DOMAIN: intl.get(`${PREFIX}.button.addServerDomain`).d('新建服务领域配置'),
    SOURCE: intl.get(`${PREFIX}.view.model.source`).d('来源'),
    ADD_SERVER_DOMAIN_NEXT: intl
      .get(`${PREFIX}.button.addServerDomainNext`)
      .d('新建服务领域配置下级'),
    SERVER_DOMAIN_CONFIG: intl
      .get('hitf.serverDomain.view.title.serverDomainConfig')
      .d('服务领域配置'),
    TREE_STRUCTURE: intl.get('hitf.serverDomain.view.title.treeStructure').d('树形结构'),
    PAGING_STRUCTURE: intl.get('hitf.serverDomain.view.title.pagingStructure').d('分页结构'),
  };

  return LANGS[key];
};

export default getLang;
