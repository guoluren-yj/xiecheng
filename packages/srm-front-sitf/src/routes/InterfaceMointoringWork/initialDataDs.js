import intl from 'utils/intl';
import { isNil } from 'lodash';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_INTERFACE } from '_utils/config';

const prefix = 'sitf.interfaceMointoringWork';
const organizationId = getCurrentOrganizationId();
const isLevelFlag = isTenantRoleLevel();

// 按批次查询
const byBatchData = () => ({
  autoQuery: isLevelFlag,
  validateBeforeQuery: true,
  fields: [
    {
      name: 'externalSystemCode',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceMointoringWork.externalSystemCode`)
        .d('外部系统编码'),
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceCode`).d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceName`).d('接口名称'),
    },
    {
      name: 'traceId',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.traceId`).d('TraceId'),
    },
    {
      name: 'batchNum',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.batchNum`).d('批次号'),
    },
    {
      name: 'externalRequestId',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceMointoringWork.externalRequestId`)
        .d('外部请求编号'),
    },
    {
      name: 'status',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.status`).d('批次状态'),
      lookupCode: 'SITF.BATCH_STATUS',
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.errorMessage`).d('错误信息'),
    },
    {
      name: 'dataExecuteResultMeaning',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceMointoringWork.dataExecuteResultMeaning`)
        .d('数据执行结果'),
    },
    {
      name: 'errorRunTimes',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.errorRunTimes`).d('错误次数'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDate`).d('创建时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/batch-infos`
          : `${SRM_INTERFACE}/v1/batch-infos`,
        method: 'GET',
      };
    },
  },

  events: {
    load: ({ dataSet }) => {
      dataSet.forEach(record => {
        // eslint-disable-next-line
        record.selectable =
          record.get('status') === 'SUCCESS' &&
          ['PART', 'FAILED'].indexOf(record.get('dataExecuteResult')) !== -1;
      });
    },
  },
});

const byInterfaceLeftData = () => ({
  autoQuery: false,
  selection: false,
  fields: [
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceCode`).d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceName`).d('接口名称'),
    },
  ],
  queryFields: [
    !isLevelFlag && {
      name: 'tenantIdLov',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.tenantId`).d('租户名称'),
      lovCode: 'SITF.TENANT_PAGING',
      required: true,
      ignore: 'always',
    },
    {
      name: 'tenantId',
      bind: 'tenantIdLov.tenantId',
    },
    {
      name: 'interfaceIdLov',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceName`).d('接口名称'),
      lovCode: 'SITF.INTERFACE',
      dynamicProps: ({ record }) => {
        return {
          lovPara: { tenantId: record.get('tenantId') || organizationId },
          disabled: !isLevelFlag && isNil(record.get('tenantId')),
        };
      },
      ignore: 'always',
    },
    {
      name: 'interfaceId',
      bind: 'interfaceIdLov.interfaceId',
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/interfaces?enabledFlag=1`
          : `${SRM_INTERFACE}/v1/interfaces-site?enabledFlag=1`,
        method: 'GET',
      };
    },
  },
});

const byInterfaceRightData = () => ({
  selection: false,
  fields: [
    {
      name: 'traceId',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.traceId`).d('TraceId'),
    },
    {
      name: 'batchNum',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.batchNum`).d('批次号'),
    },
    {
      name: 'externalRequestId',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceMointoringWork.externalRequestId`)
        .d('外部请求编号'),
    },
    {
      name: 'statusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.statusMeaning`).d('状态'),
    },
    {
      name: 'errorMessage',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.errorMessage`).d('错误消息'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDate`).d('创建时间'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.lastUpdateDate`).d('最后更新时间'),
    },
    {
      name: 'errorTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.errorTypeMeaning`).d('错误类型'),
    },
    {
      name: 'errorRunTimes',
      type: 'number',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.errorRunTimes`).d('错误次数'),
    },
    {
      name: 'contentId',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.contentId`).d('数据详情'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/document-infos`
          : `${SRM_INTERFACE}/v1/document-infos`,
        method: 'GET',
      };
    },
  },
});

const getInterfaceMessage = () => [
  {
    name: 'invokeTypeMeaning',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.invokeType`).d('调用类型'),
  },
  {
    name: 'externalSystemCode',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.externalSystemCode`).d('外部系统'),
  },
  {
    name: 'traceId',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.traceId`).d('TraceId'),
  },
  {
    name: 'batchNum',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.batchNum`).d('批次号'),
  },
  {
    name: 'externalRequestId',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.externalRequestId`).d('外部请求编号'),
  },
  {
    name: 'interfaceCode',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceCode`).d('接口编码'),
  },
  {
    name: 'interfaceName',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.interfaceName`).d('接口名称'),
  },
  {
    name: 'requestUrl',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.requestUrl`).d('请求url'),
  },
  {
    name: 'requestFunction',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.requestFunction`).d('请求方法'),
  },
  {
    name: 'requestMethod',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.requestMethod`).d('调用方法'),
  },
  {
    name: 'creationDate',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.creationDate`).d('请求时间'),
  },
  {
    name: 'clientPort',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.clientPort`).d('客户端端口'),
  },
  {
    name: 'clientIp',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.clientIp`).d('客户端IP'),
  },
  {
    name: 'requestHeader',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.requestHeaxer`).d('请求header'),
  },
  {
    name: 'requestBody',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.requestHBody`).d('请求body'),
  },
  {
    name: 'requestParameter',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.requestParams`).d('请求参数'),
  },
  {
    name: 'responseBody',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.feedbackMessage`).d('反馈报文'),
  },
  {
    name: 'limitType',
    type: 'string',
    label: intl.get(`${prefix}.model.interfaceMointoringWork.limitTypeNew`).d('异常类型'),
    lookupCode: 'SITF.REQUEST_LIMIT_TYPE',
  },
];

const interfaceMessData = () => ({
  autoQuery: false,
  selection: false,
  fields: getInterfaceMessage(),
  transport: {
    read: () => {
      return {
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/request-infos`
          : `${SRM_INTERFACE}/v1/request-infos`,
        method: 'GET',
      };
    },
  },
});

const interfaceAbnormalData = () => ({
  autoQuery: false,
  fields: [...getInterfaceMessage(),
    {
      name: 'processStatus',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.processStatus`).d('重试状态'),
      lookupCode: 'SITF.REQUEST_PROCESS_STATUS',
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/request-limit-infos`
          : `${SRM_INTERFACE}/v1/request-limit-infos`,
        method: 'GET',
      };
    },
  },
});

const breakerCircuitData = () => ({
  selection: false,
  fields: [
    {
      name: 'cnfStatusMeaning',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.cnfStatusMeaning`)
        .d('状态'),
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.interfaceCode`)
        .d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.interfaceName`)
        .d('接口名称'),
    },
    {
      name: 'limitRecCount',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.limitRecCount`)
        .d('熔断次数'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.tenantName`)
        .d('所属租户'),
    },
    {
      name: 'createdRealName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.createdRealName`)
        .d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.lastUpdatedRealName`)
        .d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.lastUpdateDate`)
        .d('更新时间'),
    },
  ],
  queryFields: [
    !isLevelFlag && {
      name: 'tenantIdLov',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.tenantId`).d('租户名称'),
      lovCode: 'SITF.TENANT_PAGING',
      required: true,
      ignore: 'always',
    },
    {
      name: 'tenantId',
      bind: 'tenantIdLov.tenantId',
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.interfaceCode`)
        .d('接口编码'),
      display: true,
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.interfaceName`)
        .d('接口名称'),
      display: true,
    },
    {
      name: 'cnfStatus',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.cnfStatus`).d('状态'),
      lookupCode: 'SITF.REQUEST_LIMIT_CNF_STATUS_ORG',
      display: true,
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag ? `${SRM_INTERFACE}/v1/${organizationId}/request-limit-cnf` : `${SRM_INTERFACE}/v1/request-limit-cnf`,
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
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.actionTypeMeaning`)
        .d('操作类'),
    },
    {
      name: 'limitTypeMeaning',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.limitTypeMeaning`)
        .d('熔断触发类型'),
    },
    {
      name: 'reason',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.reason`)
        .d('熔断触发原因'),
    },
    {
      name: 'triggerTime',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.triggerTime`)
        .d('熔断触发时间'),
    },
    {
      name: 'lockingDuration',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.lockingDuration`)
        .d('熔断时长（分钟）'),
    },
    {
      name: 'expiryDate',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.expiryDate`)
        .d('解禁时间'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.sourceFromMeaning`)
        .d('熔断来源'),
    },
    {
      name: 'createdRealName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.createdRealName`)
        .d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.creationDate`)
        .d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.lastUpdatedRealName`)
        .d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl
        .get(`${prefix}.model.interfaceFlowControl.lastUpdateDate`)
        .d('更新时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag ? `${SRM_INTERFACE}/v1/${organizationId}/request-limit-recs` : `${SRM_INTERFACE}/v1/request-limit-recs`,
        method: 'GET',
      };
    },
  },
});

export {
  byBatchData,
  byInterfaceLeftData,
  byInterfaceRightData,
  interfaceMessData,
  interfaceAbnormalData,
  breakerCircuitData,
  circuitDetailsData,
};
