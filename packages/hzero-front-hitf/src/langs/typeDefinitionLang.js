/**
 * 组合应用定义-多语言
 * @author wanjun.feng@hand-china.com
 * @date 2021-11-2
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.typeDefinition';
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
    EXPLAIN: intl.get('hzero.common.explain').d('说明'),
    CODE_UPPER: intl
      .get('hzero.common.validation.codeUpper')
      .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),

    HEADER_TITLE: intl.get(`${PREFIX}.view.message.title.header`).d('组合应用定义'),
    APPLICATION_CODE: intl.get(`${PREFIX}.model.typeDefinition.code`).d('应用代码'),
    APPLICATION_NAME: intl.get(`${PREFIX}.model.typeDefinition.name`).d('应用名称'),
    MAJOR_CATEGORY: intl.get(`${PREFIX}.model.typeDefinition.majorCategory`).d('应用大类'),
    MINOR_CATEGORY: intl.get(`${PREFIX}.model.typeDefinition.minorCategory`).d('应用小类'),
    SERVICE_TYPE: intl.get(`${PREFIX}.model.typeDefinition.type`).d('服务类型'),
    PUBLIC_INTERFACE: intl.get(`${PREFIX}.model.typeDefinition.interfaceId`).d('开放接口'),
    COMPOSE_POLICY: intl.get(`${PREFIX}.model.typeDefinition.composePolicy`).d('编排策略'),
    FAST_FAIL: intl.get(`${PREFIX}.model.typeDefinition.fastFail`).d('快速失败'),
    EMPTY_VALIDATE: intl
      .get(`${PREFIX}.model.typeDefinition.emptyValidate`)
      .d('请先选择需要删除的组合应用定义'),
    EMPTY_INST_VALIDATE: intl
      .get(`${PREFIX}.model.typeDefinition.emptyInstValidate`)
      .d('请先选择需要删除的实例配置'),
    COMPOSE_POLICY_TIP: intl.get(`${PREFIX}.model.typeDefinition.composePolicyTip`)
      .d(`编排策略影响组合接口应用下实例接口的调用顺序以及频次，策略说明如下：\n
      轮询 - 轮询即调用实例接口时，交替轮流调用，如组合接口应用下有3个应用实例接口a、b、c，优先级分别为1、2、3，则按照优先级排序，第一次请求时调用a接口、第二次请求时调用b接口、第三次请求时调用c接口，如此往复\n
      权重 - 权重即调用实例接口时，按照接口权重调用，如组合接口应用下有3个应用实例接口a、b、c，优先级分别为1、2、3，则按照优先级排序，第一次请求时调用a接口、第二三次请求时调用b接口、第四五六次请求时调用c接口，如此往复\n
      全部执行 - 全部执行即调用实例接口时，同时异步调用所有实例接口，如组合接口应用下有3个应用实例接口a、b、c，则每次调用组合接口应用时，都会将a、b、c三个实例接口全部异步调用一遍，如此往复`),

    INSTANCE_CODE: intl.get(`${PREFIX}.model.typeDefinition.instance.code`).d('实例接口代码'),
    INSTANCE_NAME: intl.get(`${PREFIX}.model.typeDefinition.instance.name`).d('实例接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.typeDefinition.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.typeDefinition.serverName`).d('服务名称'),
    WEIGHT: intl.get(`${PREFIX}.model.typeDefinition.instance.weight`).d('权重'),
    PRIORITY: intl.get(`${PREFIX}.model.typeDefinition.instance.priority`).d('优先级'),
    INSTANCE_CLASS: intl.get(`${PREFIX}.model.typeDefinition.instance.class`).d('映射类'),
    MAPPING_CLASS_DETAIL: intl
      .get(`${PREFIX}.view.message.title.detail.mapping.class`)
      .d('查看映射类详情'),
    INSTANCE_TITLE: intl.get(`${PREFIX}.view.message.title.instance.config`).d('实例配置'),
    INSTANCE_CREATE_TITLE: intl
      .get(`${PREFIX}.view.message.title.instance.create`)
      .d('新建实例配置'),
    INSTANCE_EDIT_TITLE: intl.get(`${PREFIX}.view.message.title.instance.edit`).d('编辑实例配置'),
    APPLICATION_TYPE: intl.get(`${PREFIX}.view.message.title.application.type`).d('应用类型'),
  };
  return LANGS[key];
};

export default getLang;
