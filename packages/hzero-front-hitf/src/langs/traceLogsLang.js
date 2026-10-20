/**
 * 服务注册-多语言
 * @author weikang.lin@hand-china.com
 * @date 2020-11-30
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.traceLog';

  const LANGS = {
    PREFIX,
    ACTION: intl.get('hzero.common.button.action').d('操作'),
    DOWNLOAD: intl.get('hzero.common.button.download').d('下载'),
    TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    INTERFACE_TENANT: intl.get(`${PREFIX}.model.traceLog.interfaceTenant`).d('接口租户'),
    INTERFACE_TENANT_TIP: intl
      .get(`${PREFIX}.model.traceLog.interfaceTenantTip`)
      .d(
        '接口所属租户，接口租户与所属租户区别为：所属租户为触发接口时用户的所属租户，接口租户为所触发接口的所属租户'
      ),
    INTERFACE_SOURCE: intl.get(`${PREFIX}.model.traceLog.interfaceSource`).d('接口来源'),
    SOURCE_CODE: intl.get(`${PREFIX}.model.traceLog.sourceCode`).d('来源代码'),
    SOURCE_NAME: intl.get(`${PREFIX}.model.traceLog.sourceName`).d('来源名称'),
    CLIENT_NAME: intl.get(`${PREFIX}.model.traceLog.clientName`).d('客户端名称'),
    REQUEST_URL: intl.get(`${PREFIX}.model.traceLog.requestUrl`).d('请求路径'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.traceLog.sourceType`).d('来源类型'),
    SOURCE_SYSTEM: intl.get(`${PREFIX}.model.traceLog.sourceSystem`).d('来源系统'),
    BATCH_NUM: intl.get(`${PREFIX}.model.traceLog.batchNum`).d('来源批次号'),
    INVOKE_KEY: intl.get(`${PREFIX}.model.traceLog.invokeKey`).d('请求ID'),
    REQUEST_TIME: intl.get(`${PREFIX}.model.traceLog.requestTime`).d('请求时间'),
    RESPONSE_STATUS: intl.get(`${PREFIX}.model.traceLog.responseStatus`).d('响应状态'),
    RESPONSE_TIME: intl.get(`${PREFIX}.model.traceLog.responseTime`).d('响应时间(ms)'),
    BUSINESS_STATE: intl.get(`${PREFIX}.model.traceLog.businessState`).d('业务状态'),
    ASYNC_FLAG: intl.get(`${PREFIX}.model.traceLog.asyncFlag`).d('是否异步调用'),
    SOURCE_DOCUMENT_NUM: intl.get(`${PREFIX}.model.traceLog.sourceDocumentNum`).d('来源单据号'),
    SOURCE_DOCUMENT_ID: intl.get(`${PREFIX}.model.traceLog.sourceDocumentId`).d('来源单据ID'),
    REQUEST_TIME_START: intl.get(`${PREFIX}.model.traceLog.requestTimeStart`).d('请求时间从'),
    REQUEST_TIME_END: intl.get(`${PREFIX}.model.traceLog.requestTimeEnd`).d('请求时间至'),
    CLEAR_TYPE: intl.get(`${PREFIX}.view.message.clearType`).d('类型'),
    IP: intl.get(`${PREFIX}.model.traceLog.ip`).d('请求IP'),
    REQUEST_METHOD: intl.get(`${PREFIX}.model.traceLog.requestMethod`).d('请求方式'),
    USER_AGENT: intl.get(`${PREFIX}.model.traceLog.userAgent`).d('User-Agent'),
    REFERER: intl.get(`${PREFIX}.model.traceLog.referer`).d('Referer'),
    CLEAR_LOG: intl.get(`${PREFIX}.button.clear.log`).d('日志清理'),
    DETAIL: intl.get(`${PREFIX}.model.traceLog.detail`).d('详情'),
    TRANSLATE_ERROR: intl.get(`${PREFIX}.view.message.translateError`).d('字段解析失败'),
    TRACE_LOG_DETAIL: intl.get(`${PREFIX}.view.message.title.traceLogDetail`).d('日志集成链路'),
    BASE_MESSAGE: intl.get(`${PREFIX}.view.message.baseMessage`).d('基本信息'),
    REQ_PARAM: intl.get(`${PREFIX}.view.message.reqParam`).d('请求参数'),
    RESP_CONTENT: intl.get(`${PREFIX}.view.message.respContent`).d('响应内容'),
    ERROR_STACK: intl.get(`${PREFIX}.view.message.errorStack`).d('异常信息'),
    MAPPING_TRACE_CONTENT: intl.get(`${PREFIX}.view.message.mappingTraceContent`).d('其它日志信息'),
    TRACE_LOG: intl.get(`${PREFIX}.view.message.title.traceLog`).d('日志集成链路'),
    TREE_STRUCTURE: intl.get(`${PREFIX}.title.tree.structure`).d('树形结构'),
    GROUPING_STRUCTURE: intl.get(`${PREFIX}.title.grouping.structure`).d('分组结构'),
    RETRY: intl.get(`${PREFIX}.model.traceLog.retry`).d('重试请求参数'),
    RETRY_BUTTON: intl.get('hzero.common.retry').d('重试'),
    MODIFY_FLAG: intl.get(`${PREFIX}.model.traceLog.reqParamModifyFlagMeaning`).d('重试参数值变更'),
    JSON_PARSE: intl.get(`${PREFIX}.view.button.jsonParse`).d('Json格式化'),
    MORE_LOG: intl
      .get(`${PREFIX}.model.interfaceLogs.moreLog`)
      .d('日志内容过大，请点击下载来查看更多日志'),
    CLEAR_LOG_SUCCESS: intl
      .get(`${PREFIX}.model.traceLog.clearLogSuccess`)
      .d('操作成功，日志清理将执行后台操作，请重新执行查询或刷新列表操作查看最新进度'),
  };
  return LANGS[key];
};

export default getLang;
