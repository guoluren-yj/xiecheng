/**
 * 接口监控-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-9-23
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.interfaceLogs';
  const LANGS = {
    PREFIX,
    VIEW: intl.get('hzero.common.button.view').d('查看'),
    RETRY: intl.get('hzero.common.retry').d('重试'),
    VIEW_DETAIL: intl.get('hzero.common.button.detail').d('详情'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    DOWNLOAD: intl.get('hzero.common.button.download').d('下载'),
    SUCCESS: intl.get('hzero.common.status.success').d('成功'),
    FAILURE: intl.get('hzero.common.status.failure').d('失败'),
    ASYNC: intl.get('hzero.common.status.async').d('异步'),
    SYNC: intl.get('hzero.common.status.sync').d('同步'),

    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('接口监控'),
    DETAIL: intl.get(`${PREFIX}.view.title.interfaceLogsDetail`).d('接口监控详情'),
    BASIC_MESSAGE: intl.get(`${PREFIX}.view.title.baseMessage`).d('基本信息'),
    REQ_PARAM: intl.get(`${PREFIX}.view.title.reqParam`).d('第三方接口调用参数'),
    RESP: intl.get(`${PREFIX}.view.title.resp`).d('第三方接口响应内容'),
    REQ_BODY_PARAM: intl.get(`${PREFIX}.view.title.reqBodyParam`).d('平台接口调用参数'),
    RESP_CONETNT: intl.get(`${PREFIX}.view.title.respContent`).d('平台接口响应内容'),
    STACK_TRACE_MESSAGE: intl.get(`${PREFIX}.view.title.stacktraceMessage`).d('异常信息'),
    LASTEST: intl.get(`${PREFIX}.view.title.lastest`).d('当前接口最新版本为'),
    RETRY_CONFIRM: intl.get(`${PREFIX}.view.title.retryConfirm`).d('是否进行重试'),
    TRANSLATE_ERROR: intl.get(`${PREFIX}.view.message.translateError`).d('字段解析失败'),

    CLEAR_LOG: intl.get(`${PREFIX}.view.button.clearLogs`).d('日志清理'),

    INTERFACE_CODE: intl.get(`${PREFIX}.model.interfaceLogs.interfaceCode`).d('接口编码'),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.interfaceLogs.interfaceName`).d('接口名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.interfaceLogs.serverCode`).d('服务代码'),
    SERVER_NAME: intl.get(`${PREFIX}.model.interfaceLogs.serverName`).d('服务名称'),
    INTERFACE_SERVER_VERSION: intl
      .get(`${PREFIX}.model.interfaceLogs.interfaceServerVersion`)
      .d('服务版本'),
    INTERFACE_VERSION: intl.get(`${PREFIX}.model.interfaceLogs.interfaceVersion`).d('接口版本'),
    CLIENT_ID: intl.get(`${PREFIX}.model.interfaceLogs.clientId`).d('客户端ID'),
    INTERFACE_URL: intl.get(`${PREFIX}.model.interfaceLogs.interfaceUrl`).d('第三方接口地址'),
    INVOKE_TYPE: intl.get(`${PREFIX}.model.interfaceLogs.invokeType`).d('接口调用类型'),
    INVOKE_KEY: intl.get(`${PREFIX}.model.interfaceLogs.invokeKey`).d('请求ID'),
    REQUEST_TIME: intl.get(`${PREFIX}.model.interfaceLogs.requestTime`).d('平台接口请求时间'),
    REQUEST_TIME_START: intl
      .get(`${PREFIX}.model.interfaceLogs.requestTimeStart`)
      .d('平台接口请求时间从'),
    REQUEST_TIME_END: intl
      .get(`${PREFIX}.model.interfaceLogs.requestTimeEnd`)
      .d('平台接口请求时间至'),
    ASYNC_FLAG: intl.get(`${PREFIX}.model.interfaceLogs.asyncFlag`).d('调用方式'),
    RESPONSE_STATUS: intl.get(`${PREFIX}.model.interfaceLogs.respStatus`).d('平台接口响应状态'),
    CLEAR_TYPE: intl.get(`${PREFIX}.model.interfaceLogs.clearType`).d('类型'),
    REQ_TIME: intl.get(`${PREFIX}.model.interfaceLogs.reqTime`).d('第三方接口请求时间'),
    REQUEST_METHOD: intl.get(`${PREFIX}.model.interfaceLogs.requestMethod`).d('平台接口请求方式'),
    RESPONSE_TIME: intl.get(`${PREFIX}.model.interfaceLogs.responseTime`).d('平台接口响应时间(ms)'),
    RESP_TIME: intl.get(`${PREFIX}.model.interfaceLogs.respTime`).d('第三方接口响应时间(ms)'),
    INTERFACE_TYPE: intl.get(`${PREFIX}.model.interfaceLogs.interfaceType`).d('第三方接口类型'),
    USER_AGENT: intl.get(`${PREFIX}.model.interfaceLogs.userAgent`).d('User-Agent'),
    REFERER: intl.get(`${PREFIX}.model.interfaceLogs.referer`).d('Referer'),
    IP: intl.get(`${PREFIX}.model.interfaceLogs.ip`).d('请求IP'),
    MORE_LOG: intl
      .get(`${PREFIX}.model.interfaceLogs.moreLog`)
      .d('日志内容过大，请点击下载来查看更多日志'),
    INTERFACE_TENANT: intl.get(`${PREFIX}.model.interfaceLogs.interfaceTenant`).d('接口租户'),
    INTERFACE_TENANT_TIP: intl
      .get(`${PREFIX}.model.interfaceLogs.interfaceTenantTip`)
      .d(
        '接口所属租户，接口租户与所属租户区别为：所属租户为触发接口时用户的所属租户，接口租户为所触发接口的所属租户'
      ),
    INTERFACE_SOURCE: intl.get(`${PREFIX}.model.interfaceLogs.interfaceSource`).d('接口来源'),

    SAVE_VALIDATE: intl.get(`${PREFIX}.model.interfaceLogs.saveValidate`).d('请先完善必输内容'),
    CLEAR_LOG_SUCCESS: intl
      .get(`${PREFIX}.model.interfaceLogs.clearLogSuccess`)
      .d('操作成功，日志清理将执行后台操作，请重新执行查询或刷新列表操作查看最新进度'),
  };
  return LANGS[key];
};

export default getLang;
