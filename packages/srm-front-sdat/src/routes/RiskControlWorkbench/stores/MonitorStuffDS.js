/**
 * 监控事件 租户级
 * @date: 2022-09-16
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
 * 事件列表详情 DS
 * @returns
 */
const eventsListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${tenantId}/monitor-enterprise/risk-events`,
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
  primaryKey: 'eventsList',
  selection: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.model.enterpriseName').d('企业名称'),
      name: 'enterpriseName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.riskLevel').d('风险级别'),
      name: 'riskLevel',
      lookupCode: 'SDAT.RISK_EVENT_LEVEL',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.dimensionCode').d('事件维度'),
      name: 'dimensionCode',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.overview').d('风险内容'),
      name: 'overview',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.publishDate').d('变动日期'),
      name: 'publishDate',
      type: 'dateTime',
    },
  ],
  queryFields: [],
  events: {},
});

/**
 * 详情弹窗1 DS
 */
const getDetailOneDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.beforeInfo').d('变更前'),
      name: 'beforeInfo',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.afterInfo').d('变更后'),
      name: 'afterInfo',
      type: 'string',
    },
  ],
});

/**
 * 详情弹窗2 DS
 */
const getDetailTwoDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.SHAREHOLDER_CHANGE.result.StockName').d('投资人姓名'),
      name: 'StockName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SHAREHOLDER_CHANGE.result.StockPercent').d('持股比例'),
      name: 'StockPercent',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SHAREHOLDER_CHANGE.result.HoldType.').d('持股类型'),
      name: 'HoldType',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.STOCKHOLDER.result.Amount').d('持股数(股)/股本(万元)'),
      name: 'Amount',
      type: 'string',
    },
  ],
});

/**
 * 详情弹窗3 DS
 */
const getDetailThreeDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.SHAREHOLDER_CHANGE.result.StockName').d('投资人姓名'),
      name: 'StockName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SHAREHOLDER_CHANGE.result.StockPercent').d('持股比例'),
      name: 'StockPercent',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SHAREHOLDER_CHANGE.result.HoldType.').d('持股类型'),
      name: 'HoldType',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.STOCKHOLDER.result.Amount').d('持股数(股)/股本(万元)'),
      name: 'Amount',
      type: 'string',
    },
  ],
});

/**
 * 详情弹窗4 DS
 */
const getDetailFourDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.KEY_PERSONNEL.result.Name').d('姓名'),
      name: 'Name',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.KEY_PERSONNEL.result.Job').d('职务'),
      name: 'Job',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.beforeAdapt').d('调整前'),
      name: 'beforeInfo',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.afterAdapt').d('调整后'),
      name: 'afterInfo',
      type: 'string',
    },
  ],
});

/**
 * 详情弹窗5 DS
 */
const getDetailFiveDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl
        .get('sdat.monitorStuff.BENEFICIARY_CHANGE.result.breakThroughList.name')
        .d('受益所有人名称'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get('hzero.common.model.type').d('类型'),
      name: 'benifitType',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.BENEFICIARY_CHANGE.result.position').d('任职类型'),
      name: 'position',
      type: 'string',
    },
    {
      label: intl
        .get('sdat.monitorStuff.BENEFICIARY_CHANGE.result.breakThroughList.totalStockPercent')
        .d('受益所有人穿透总持股比例'),
      name: 'totalStockPercent',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.beforeInfo').d('变更前'),
      name: 'beforeName',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.SCOPE_OF_BUS.afterInfo').d('变更后'),
      name: 'afterName',
      type: 'string',
    },
  ],
});

/**
 * 详情弹窗6 DS
 */
const getDetailSixDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.BUS_TYPE_CHANGE.Name').d('企业名称'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.corpStatus').d('经营状态'),
      name: 'corpStatus',
      type: 'string',
    },
    {
      label: intl
        .get('sdat.monitorStuff.BENEFICIARY_CHANGE.result.breakThroughList.totalStockPercent')
        .d('受益所有人穿透总持股比例'),
      name: 'totalStockPercent',
      type: 'string',
    },
  ],
});

/**
 * 详情弹窗7 DS
 */
const getDetailSevenDS = () => ({
  selection: false,
  autoLocateFirst: false,
  paging: false,
  fields: [
    {
      label: intl.get('sdat.monitorStuff.model.realController').d('实际控制人'),
      name: 'name',
      type: 'string',
    },
    {
      label: intl
        .get('sdat.monitorStuff.CONTROL_CHANGE.result.ControllerData.ControlPercent')
        .d('表决权'),
      name: 'controlPercent',
      type: 'string',
    },
    {
      label: intl.get('sdat.monitorStuff.model.benifitStock').d('受益股份'),
      name: 'StockPercent',
      type: 'string',
    },
  ],
});

export {
  eventsListDS,
  getDetailOneDS,
  getDetailTwoDS,
  getDetailThreeDS,
  getDetailFourDS,
  getDetailFiveDS,
  getDetailSixDS,
  getDetailSevenDS,
};
