import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import request from 'utils/request';
import { SRM_INTERFACE } from '_utils/config';
import { isEmpty } from 'lodash';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

const SRM_SIFC = '/sifc';

const platformResData = () => ({
  fields: [
    {
      name: 'cnfStatus',
      type: FieldType.string,
      label: intl.get(`scux.interfaceFlowControl.model.interfaceFlowControl.cnfStatus`).d('状态'),
      lookupCode: 'SITF.REQUEST_LIMIT_CNF_STATUS',
    },
    {
      name: 'interfaceCode',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceCode`)
        .d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceName`)
        .d('接口名称'),
    },
    {
      name: 'module',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.module`)
        .d('所属模块'),
      lookupCode: 'SADA.MODULE',
    },
    {
      name: 'createdRealName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.createdRealName`)
        .d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdatedRealName`)
        .d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdateDate`)
        .d('更新时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/request-limit-cnf`,
        method: 'GET',
      };
    },
  },
});

const interfaceFlowData = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    // 五分钟处理数据量限制熔断策略 [dataCountLimitStrategyList]
    {
      name: 'dataCountLimitPerFiveMin',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.dataCountLimitPerFiveMin`)
        .d('每5分钟允许调用数据量'),
      required: true,
    },
    // 五分钟处理批次调用限制熔断策略 [batchLimitStrategyList]
    {
      name: 'batchLimitPerFiveMin',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.batchLimitPerFiveMin`)
        .d('每五分钟批量允许调用次数'),
      required: true,
    },
    // singleLimitStrategyList
    {
      name: 'singleLimitPerFiveMin',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.singleLimitPerFiveMin`)
        .d('每五分钟单条允许调用次数'),
      required: true,
    },
  ],
  transport: {
    read: () => {
      return {
        url: isTenantRoleLevel() ? `${SRM_INTERFACE}/v1/${getCurrentOrganizationId()}/request-limit-cnf/single` : `${SRM_SIFC}/v1/request-limit-cnf/single`,
        method: 'GET',
      };
    },
  },
});

const controlLinkData = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'concurrencyPermits',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.concurrencyPermits`)
        .d('并发连接数'),
      required: true,
    },
  ],
});

const controlSizeData = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'batchDataCountLimit',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.batchDataCountLimit`)
        .d('单次请求最大同步数量'),
      required: true,
    },
    {
      name: 'reqContCapLimit',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.reqContCapLimit`)
        .d('单次请求最大体'),
      required: true,
    },
  ],
});

const limitStrategyData = () => ({
  forceValidate: true,
  selection: false,
  fields: [
    {
      name: 'overLimitRatioLookup',
      type: FieldType.object,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.overLimitRatioNew`)
        .d('比例区间(实际检测数/限定值)'),
      lookupCode: 'SITF.REQUEST_LIMIT_OVER_RATIO',
      ignore: 'always',
      required: true,
    },
    {
      name: 'overLimitRatio',
      bind: 'overLimitRatioLookup.value',
    },
    {
      name: 'overLimitRatioMeaning',
      bind: 'overLimitRatioLookup.meaning',
    },
    {
      name: 'banDuration',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.banDuration.minuts`)
        .d('封禁时长(分钟)'),
      required: true,
    },
  ],
});

// 限制白名单列表
const whiteListData = () => ({
  fields: [
    {
      name: 'wlStatusMeaning',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.wlStatusMeaning`)
        .d('状态'),
    },
    {
      name: 'tenantNum',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantNum`)
        .d('租户编码'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantName`)
        .d('租户名称'),
    },
    {
      name: 'validTimeFrom',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.validTimeFrom`)
        .d('计划窗口起'),
    },
    {
      name: 'validTimeTo',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.validTimeTo`)
        .d('计划窗口止'),
    },
    {
      name: 'sourceApplyTime',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.sourceApplyTime`)
        .d('申请时间'),
    },
    {
      name: 'sourceNum',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.sourceNum`)
        .d('申请单号'),
    },
    {
      name: 'sourceFromMeaning',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.sourceFrom`)
        .d('申请来源'),
    },
    {
      name: 'createdRealName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.createdRealName`)
        .d('创建人'),
    },
    {
      name: 'lastUpdatedRealName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdatedRealName`)
        .d('更新人'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/request-limit-wls`,
        method: 'GET',
      };
    },
  },
});

const whiteListFormData = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'tenantIdLov',
      type: FieldType.object,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantNum`)
        .d('租户编码'),
      lovCode: 'HPFM.TENANT',
      required: true,
      ignore: 'always',
    },
    {
      name: 'tenantId',
      bind: 'tenantIdLov.tenantId',
    },
    {
      name: 'tenantNum',
      bind: 'tenantIdLov.tenantNum',
    },
    {
      name: 'tenantName',
      bind: 'tenantIdLov.tenantName',
    },
    {
      name: 'interfaceCodeList',
      type: FieldType.object,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceCodeList`)
        .d('接口编码'),
      lovCode: 'SIFC.LIMIT_WL_INTERFACE_PAGING',
      dynamicProps: {
        lovPara: ({record}) => ({
          tenantId: record.get('tenantId'),
        }),
        disabled: ({record}) => isEmpty(record.get('tenantNum')),
      },
      required: true,
      multiple: true,
    },
    {
      name: 'validTimeFrom',
      type: FieldType.dateTime,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.validTimeFrom`)
        .d('计划窗口起'),
      min: new Date(),
      max: 'validTimeTo',
      required: true,
    },
    {
      name: 'validTimeTo',
      type: FieldType.dateTime,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.validTimeTo`)
        .d('计划窗口止'),
      min: 'validTimeFrom',
      required: true,
    },
    {
      name: 'sourceNum',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.sourceNum`)
        .d('申请单号'),
    },
  ],

  events: {
    update: ({name, record}) => {
      if(name === 'tenantIdLov') {
        record.set('interfaceCodeList', null);
      }
    },
  },
});

const tenantRestrictionData = () => ({
  // selection: false,
  fields: [
    {
      name: 'cnfStatusMeaning',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.cnfStatusMeaning`)
        .d('状态'),
    },
    {
      name: 'interfaceCode',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceCode`)
        .d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.interfaceName`)
        .d('接口名称'),
    },
    {
      name: 'module',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.module`)
        .d('所属模块'),
      lookupCode: 'SADA.MODULE',
    },
    {
      name: 'limitRecCount',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.limitRecCount`)
        .d('熔断次数'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantName`)
        .d('所属租户'),
    },
    {
      name: 'createdRealName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.createdRealName`)
        .d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdatedRealName`)
        .d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdateDate`)
        .d('更新时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/request-limit-cnf`,
        method: 'GET',
      };
    },
  },
});

const tentRestrictionData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantName`)
        .d('租户名称'),
    },
  ],
});

// 租户限制 - 租户信息添加+新建
const addTenantData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'tenantNameLov',
      type: FieldType.object,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.tenantName`)
        .d('租户名称'),
      lovCode: 'SIFC.LIMIT_SOURCE_TENANT_PAGING',
      lovPara: {tenantId: getCurrentOrganizationId()},
      ignore: 'always',
    },
    {
      name: 'tenantName',
      bind: 'tenantNameLov.tenantName',
    },
    {
      name: 'tenantId',
      bind: 'tenantNameLov.tenantId',
    },
    {
      name: 'tenantNum',
      bind: 'tenantNameLov.tenantNum',
    },
  ],
});

// 租户限制 - 右侧新建
const drawerTenantData = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'tenantName',
      type: FieldType.object,
      lovCode: 'SIFC.LIMIT_INTERFACE_PAGING',
      multiple: true,
    },
  ],
});

// 熔断、解禁
const breakerBanData = () => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'limitType',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.limitType`)
        .d('熔断触发类型'),
      lookupCode: 'SITF.REQUEST_LIMIT_TYPE',
    },
    {
      name: 'lockingReason',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lockingReason`)
        .d('熔断触发原因'),
    },
    {
      name: 'triggerTime',
      type: FieldType.dateTime,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.triggerTime`)
        .d('熔断开始时间'),
    },
    {
      name: 'lockingDuration',
      type: FieldType.number,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lockingDuration`)
        .d('熔断时长(分钟)'),
    },
    {
      name: 'expiryDate',
      type: FieldType.dateTime,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.expiryDate`)
        .d('解禁时间'),
    },
    {
      name: 'unlockingReason',
      type: FieldType.string,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.unlockingReason`)
        .d('解禁原因'),
      dynamicProps: {
        required: ({dataSet}) => !dataSet.getState('cnfStatusFlag'),
      },
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/request-limit-blacklist`,
        method: 'GET',
      };
    },
  },
});

// 熔断详情
const circuitDetailsData = () => ({
  selection: false,
  fields: [
    {
      name: 'actionTypeMeaning',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.actionTypeMeaning`)
        .d('操作类'),
    },
    {
      name: 'limitTypeMeaning',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.limitTypeMeaning`)
        .d('熔断触发类型'),
    },
    {
      name: 'reason',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.reason`)
        .d('熔断触发原因'),
    },
    {
      name: 'triggerTime',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.triggerTime`)
        .d('熔断触发时间'),
    },
    {
      name: 'lockingDuration',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lockingDuration`)
        .d('熔断时长（分钟）'),
    },
    {
      name: 'expiryDate',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.expiryDate`)
        .d('解禁时间'),
    },
    {
      name: 'sourceFromMeaning',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.sourceFromMeaning`)
        .d('熔断来源'),
    },
    {
      name: 'createdRealName',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.createdRealName`)
        .d('创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdatedRealName`)
        .d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: FieldType.string,
      required: true,
      label: intl
        .get(`scux.interfaceFlowControl.model.interfaceFlowControl.lastUpdateDate`)
        .d('更新时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/request-limit-recs`,
        method: 'GET',
      };
    },
  },
});

export {
  platformResData,
  interfaceFlowData,
  limitStrategyData,
  controlSizeData,
  controlLinkData,
  whiteListData,
  whiteListFormData,
  tenantRestrictionData,
  tentRestrictionData,
  addTenantData,
  drawerTenantData,
  breakerBanData,
  circuitDetailsData,
};

/**
 *批量保存
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchInterFlowSave(params) {
  return request(`${SRM_SIFC}/v1/request-limit-cnf`, {
    method: 'POST',
    body: params,
  });
}

/**
 *白名单 - 保存
 *
 * @export
 * @param {Object} params 查询参数
 */
export async function fetchWhiteListSave(params) {
  return request(`${SRM_SIFC}/v1/request-limit-wls`, {
    method: 'POST',
    body: params,
  });
}

/**
 *租户规则 - 右侧新建弹窗批量保存
 *
 * @export
 * @param {Object} params 查询参数
 */
 export async function fetchTenantSave(params) {
  return request(`${SRM_SIFC}/v1/request-limit-cnf`, {
    method: 'POST',
    body: params,
  });
}

/**
 *租户规则 - 列表删除
 *
 * @export
 * @param {Object} params 查询参数
 */
 export async function fetchTenantDeleteLine(params) {
  return request(`${SRM_SIFC}/v1/request-limit-cnf`, {
    method: 'DELETE',
    body: params,
  });
}

/**
 *租户规则 - 熔断
 *
 * @export
 * @param {Object} params 查询参数
 */
 export async function fetchTenantBreakerLine(params, cnfStatusFlag) {
  return request(`${SRM_SIFC}/v1/request-limit-blacklist`, {
    method: cnfStatusFlag ? 'POST' : 'DELETE',
    body: params,
  });
}

/**
 *租户规则 - 导航删除
 *
 * @export
 * @param {Object} params 查询参数
 */
 export async function fetchDeleteAllLine(params) {
  return request(`${SRM_SIFC}/v1/request-limit-cnf/by-tenant-id`, {
    method: 'DELETE',
    body: params,
  });
}