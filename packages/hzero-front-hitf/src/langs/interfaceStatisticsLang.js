/**
 * 健康状况监控-多语言
 * @author baitao.huang@hand-china.com
 * @date 2021-9-22
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.interfaceStatistics';
  const LANGS = {
    PREFIX,
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),

    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    VIEW_MORE: intl.get(`${PREFIX}.view.button.viewMore`).d('查看历史异常信息'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('健康状况监控'),
    HISTORY_STATISTIC: intl.get(`${PREFIX}.view.title.historyStatistic`).d('历史异常信息'),
    NAMESPACE: intl.get(`${PREFIX}.model.statistics.namespace`).d('服务命名空间'),
    SERVER_CODE: intl.get(`${PREFIX}.model.statistics.serverCode`).d('服务代码'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.statistics.interfaceCode`).d('接口编码'),
    SOURCE_TYPE: intl.get(`${PREFIX}.model.statistics.sourceType`).d('接口来源'),
    COUNT: intl.get(`${PREFIX}.model.statistics.count`).d('异常次数'),
    LATEST_STATISTIC_DETAIL: intl
      .get(`${PREFIX}.model.statistics.latestStatisticDetail`)
      .d('最近异常信息'),
    LATEST_TIME: intl.get(`${PREFIX}.model.statistics.latestTime`).d('最近异常时间'),
    START_TIME: intl.get(`${PREFIX}.model.statistics.startTime`).d('异常时间从'),
    END_TIME: intl.get(`${PREFIX}.model.statistics.endTime`).d('异常时间至'),
    STATISTIC_DETAIL: intl.get(`${PREFIX}.model.statistics.statisticDetail`).d('异常信息'),
    STATISTIC_TIME: intl.get(`${PREFIX}.model.statistics.statisticTime`).d('异常时间'),
  };
  return LANGS[key];
};

export default getLang;
