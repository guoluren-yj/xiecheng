/**
 * 接口限流规则-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-6-17
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key, otherProps = {}) => {
  const PREFIX = 'hitf.rateLimit';
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
    STATUS: intl.get('hzero.common.status').d('状态'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口限流配置'),
    RATE_LIMIT_INFO: intl.get(`${PREFIX}.view.title.ratelimitInfo`).d('限流规则详情'),
    LIMIT_RULE: intl.get(`${PREFIX}.view.title.limitRule`).d('限流规则'),
    INTERFACE_INFO: intl.get(`${PREFIX}.view.title.interfaceInfo`).d('接口信息'),

    CREATE_RULE: intl.get(`${PREFIX}.view.button.createRule`).d('新建规则'),
    EDIT_RULE: intl.get(`${PREFIX}.view.button.editRule`).d('编辑规则'),
    UPDATE_URL: intl.get(`${PREFIX}.view.button.updateUrl`).d('更新限流地址'),
    DELETE_RULE: intl.get(`${PREFIX}.view.button.deleteRule`).d('删除规则'),

    INTERFACE_CODE: intl.get(`${PREFIX}.model.rateLimit.interfaceCode`).d('接口编码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.rateLimit.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.rateLimit.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.rateLimit.serverName`).d('服务名称'),
    NAMESPACE: intl.get(`${PREFIX}.model.rateLimit.namespace`).d('服务命名空间'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.statistics.sourceType`).d('接口来源'),
    SERVICE_TYPE: intl.get(`${PREFIX}.model.rateLimit.serviceType`).d('服务类型'),
    PUBLIC_FLAG: intl.get(`${PREFIX}.model.rateLimit.publicFlag`).d('是否公开'),
    LIMIT_STATUS: intl.get(`${PREFIX}.model.rateLimit.status`).d('限流状态'),
    RATE_LIMIT_FLAG: intl.get(`${PREFIX}.model.rateLimit.rateLimitFlag`).d('是否维护规则'),
    RATE_LIMIT_TYPE: intl.get(`${PREFIX}.model.rateLimit.rateLimitType`).d('限流方式'),

    REPLENISH_RATE_MAX: intl
      .get(`${PREFIX}.model.rateLimit.replenishRateMax`)
      .d('每秒流量限制值上限'),
    REPLENISH_RATE_MAX_TIP: intl
      .get(`${PREFIX}.model.rateLimit.replenishRateMaxTip`)
      .d('令牌桶的大小，即系统在突发增流情况下最大承受的请求量上限'),
    SIGNAL_MAX: intl.get(`${PREFIX}.model.rateLimit.signalMax`).d('信号量上限'),
    SIGNAL_MAX_TIP: intl
      .get(`${PREFIX}.model.rateLimit.signalMaxTip`)
      .d('系统在任意时间切面内，最多持有的请求数量上限值'),
    REPLENISH_RATE: intl.get(`${PREFIX}.model.rateLimit.replenishRate`).d('每秒流量限制值'),
    REPLENISH_RATE_TIP: intl
      .get(`${PREFIX}.model.rateLimit.replenishRateTip`)
      .d('令牌桶每秒生成的令牌的数量'),
    SIGNAL: intl.get(`${PREFIX}.model.rateLimit.signal`).d('信号量'),
    SIGNAL_TIP: intl
      .get(`${PREFIX}.model.rateLimit.signalTip`)
      .d('系统在任意时间切面内，最多持有的请求数量'),
    SOURCE_ADDRESS: intl.get(`${PREFIX}.model.rateLimit.sourceAddress`).d('源地址'),
    SOURCE_ADDRESS_TIP: intl
      .get(`${PREFIX}.model.rateLimit.sourceAddressTip`)
      .d('源地址指请求头中的Origin，支持正则表达式，例如：http://www.***.com'),
    STRICT_URL: intl
      .get(`${PREFIX}.model.rateLimit.strictUrl`)
      .d('源地址格式不正确。例如：http://www.***.com'),
    ROLE: intl.get(`${PREFIX}.model.rateLimit.role`).d('角色'),
    USER: intl.get(`${PREFIX}.model.rateLimit.user`).d('用户'),
    HEADER_FIELD: intl.get(`${PREFIX}.model.rateLimit.header`).d('请求头'),
    HEADER_FIELD_TIP: intl
      .get(`${PREFIX}.model.rateLimit.headerTip`)
      .d('配置限流的请求头信息，支持正则表达式，例如：Accept-Encoding=gzip&Host=xxx'),
    BODY: intl.get(`${PREFIX}.model.rateLimit.body`).d('请求体'),
    BODY_TIP: intl
      .get(`${PREFIX}.model.rateLimit.bodyTip`)
      .d('配置限流的请求体参数，支持多层，例如：page=1&people.name=xxx'),

    REPLENISH_RATE_MAX_VALIDATE: intl
      .get(`${PREFIX}.model.rateLimit.replenishRateMaxValidate`)
      .d(`每秒流量限制值上限为${otherProps.maxReplenishRate}，请不要大于该值`),

    DELETE_ALL_RULE_CONFIRM: intl
      .get(`${PREFIX}.view.confirm.deleteAllRuleConfirm`)
      .d('确认删除该接口下所有的限流规则？'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.rateLimit.saveValidate`).d('请先完善必输内容'),
  };
  return LANGS[key];
};

export default getLang;
