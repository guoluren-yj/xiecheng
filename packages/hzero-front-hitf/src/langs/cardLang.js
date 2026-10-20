/**
 * 工作台-多语言
 * @author wanjun.feng@hand-china.com
 * @date 2021-1-14
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.card';

  const LANGS = {
    PREFIX,
    RELOAD: intl.get('hzero.common.button.reload').d('重新加载'),
    START_DATE: intl.get('hzero.common.date.startTime').d('开始时间'),
    END_DATE: intl.get('hzero.common.date.endTime').d('结束时间'),
    START_TIME: intl.get('hzero.common.date.startTime').d('开始时间'),
    END_TIME: intl.get('hzero.common.date.endTime').d('结束时间'),
    TENANT: intl.get('hzero.common.model.common.tenant').d('租户'),

    INTERFACE_SERVER_SUMMARY: intl
      .get(`${PREFIX}.card.view.title.interface.server.summary`)
      .d('已上线接口服务总数'),
    SERVER_SUMMARY: intl.get(`${PREFIX}.card.view.server.summary`).d('已上线服务总数'),
    INTERFACE_SUMMARY: intl.get(`${PREFIX}.card.view.interface.summary`).d('已上线接口总数'),
    INVOKE: intl.get(`${PREFIX}.card.view.title.invoke`).d('今日透传'),
    INVOKE_TIP: intl.get(`${PREFIX}.card.view.tip.invoke`).d('今日00:00:00-23:59:59的日志数量情况'),
    INVOKE_COUNT: intl.get(`${PREFIX}.card.view.invoke.count`).d('今日透传总量'),
    INVOKE_FAIL_COUNT: intl.get(`${PREFIX}.card.view.invoke.fail.count`).d('今日透传调用失败总量'),
    INVOKE_BUSINESS_FAIL_COUNT: intl
      .get(`${PREFIX}.card.view.invoke.business.fail.count`)
      .d('今日透传业务失败总量'),

    STATISTICS_INDICATOR: intl.get(`${PREFIX}.view.model.statisticsIndicator`).d('指标'),

    TIME: intl.get(`${PREFIX}.view.model.time`).d('时间'),
    TIMES: intl.get(`${PREFIX}.view.model.time`).d('次'),
    RESPONSE_TIME: intl.get(`${PREFIX}.view.model.responseTime`).d('ms'),
    SERVICE_INTERFACE: intl.get(`${PREFIX}.view.model.serviceInterface`).d('服务接口'),

    TRACE_LOGS_BUSINESS_FAIL_RANKING: intl
      .get(`${PREFIX}.card.view.title.traceLogs.business.fail.ranking`)
      .d('透传业务错误排行'),
    TRACE_LOGS_RESPONSE_FAIL_RANKING: intl
      .get(`${PREFIX}.card.view.title.traceLogs.response.fail.ranking`)
      .d('透传调用错误排行'),
    TRACE_LOGS_BUSINESS_FAIL_COUNT: intl
      .get(`${PREFIX}.card.view.title.traceLogs.business.fail.count`)
      .d('透传业务错误数量'),
    TRACE_LOGS_RESPONSE_FAIL_COUNT: intl
      .get(`${PREFIX}.card.view.title.traceLogs.response.fail.count`)
      .d('透传调用错误数量'),
    TRACE_LOGS_INTERFACE_CODE: intl
      .get(`${PREFIX}.card.view.title.traceLogs.intefaceCode`)
      .d('接口编码'),

    OPS_TITLE: intl.get(`${PREFIX}.qps.view.title.qpsTitle`).d('服务透传QPS'),
    TOTAL_TIME_PERCENT: intl.get(`${PREFIX}.qps.view.model.totalTimePercent`).d('时间占比'),
    QPS: intl.get(`${PREFIX}.qps.view.model.qps`).d('QPS'),
    AVG_TIME: intl.get(`${PREFIX}.qps.view.model.avgTime`).d('平均请求时间'),
    MIN_TIME: intl.get(`${PREFIX}.qps.view.model.minTime`).d('最小时间'),
    MAX_TIME: intl.get(`${PREFIX}.qps.view.model.maxTime`).d('最大时间'),
    STD_DEV: intl.get(`${PREFIX}.qps.view.model.stdDev`).d('标准差'),
    TOTAL_COUNT: intl.get(`${PREFIX}.qps.view.model.totalCount`).d('总请求数量'),
    TP_50: intl.get(`${PREFIX}.qps.view.model.tp50`).d('tp50'),
    TP_90: intl.get(`${PREFIX}.qps.view.model.tp90`).d('tp90'),
    TP_95: intl.get(`${PREFIX}.qps.view.model.tp95`).d('tp95'),
    TP_99: intl.get(`${PREFIX}.qps.view.model.tp99`).d('tp99'),
    TP_999: intl.get(`${PREFIX}.qps.view.model.tp999`).d('tp999'),
    TP_9999: intl.get(`${PREFIX}.qps.view.model.tp9999`).d('tp9999'),
    COUNT_UNIT: intl.get(`${PREFIX}.qps.view.model.countUnit`).d('度量'),
    TIME_UNIT: intl.get(`${PREFIX}.qps.view.model.tineUnit`).d('时间（ms）'),
  };
  return LANGS[key];
};

export default getLang;
