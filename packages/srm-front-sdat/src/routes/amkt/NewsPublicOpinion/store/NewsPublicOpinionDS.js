/**
 * 新闻舆情 租户级
 * @date: 2022-09-02
 * @author: Zip <zepeng.huang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import intl from 'utils/intl';
import { SRM_DATA_SDAT } from '@/utils/config';
import { getCurrentOrganizationId, getCurrentUser } from 'utils/utils';

const tenantId = getCurrentOrganizationId();
const { id: userId } = getCurrentUser();

const passParams = {
  tenant: tenantId,
  useTenant: tenantId,
  userId,
};

/**
 * 数据详情 DS
 * @returns
 */
const newsListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/risk-news`,
        params: {
          ...data,
          ...params,
          ...passParams,
        },
        method: 'GET',
      };
    },
  },
  pageSize: 20,
  primaryKey: 'riskStuffList',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.newsPublicOpinion.model.enterpriseName').d('企业名称'),
      name: 'EnterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.enterpriseCode').d('企业编码'),
      name: 'EnterpriseCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.socialCode').d('统一社会信用代码'),
      name: 'SocialCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.tickerSymbol').d('股票代码'),
      name: 'TickerSymbol',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.erpFlag').d('是否ERP'),
      name: 'ErpFlag',
      type: 'number',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.riskLevel').d('风险等级'),
      name: 'RiskLevel',
      type: 'number',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.lastScanTime').d('上次扫描时间'),
      name: 'LastScanTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.scanNum').d('扫描次数'),
      name: 'ScanNum',
      type: 'number',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.addMonitorTime').d('加入监控时间'),
      name: 'AddMonitorTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.cancelMonitorTime').d('取消监控时间'),
      name: 'CancelMonitorTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.userId').d('用户id'),
      name: 'UserId',
      type: 'number',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.userCode').d('用户编码'),
      name: 'UserCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.userName').d('用户名称'),
      name: 'UserName',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.client').d('客户端'),
      name: 'Client',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.srmTenantId').d('租户ID'),
      name: 'SrmTenantId',
      type: 'number',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.emotionType').d('情感类别'),
      name: 'EmotionType',
      lookupCode: 'SDAT.RISK_NEWS_EMOTION_TYPE',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.startDate').d('开始时间'),
      name: 'StartDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.endDate').d('结束时间'),
      name: 'EndDate',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.newsTitle').d('新闻标题'),
      name: 'Title',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.newsTags').d('标签'),
      name: 'NewsTags',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.publishDate').d('发布日期'),
      name: 'PublishTime',
      type: 'dateTime',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.source').d('来源'),
      name: 'Source',
      type: 'string',
    },
    {
      label: intl.get('sdat.newsPublicOpinion.model.category').d('新闻类型'),
      name: 'Category',
      type: 'string',
    },
  ],
  queryFields: [],
  events: {},
});

export { newsListDS };
