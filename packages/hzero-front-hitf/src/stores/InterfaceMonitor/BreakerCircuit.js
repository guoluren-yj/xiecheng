import intl from 'utils/intl';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { SRM_INTERFACE } from 'srm-front-boot/lib/utils/config';

const prefix = 'sitf.interfaceMointoringWork';
const organizationId = getCurrentOrganizationId();
const isLevelFlag = isTenantRoleLevel();

const breakerCircuitData = () => ({
  selection: false,
  fields: [
    {
      name: 'cnfStatusMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.cnfStatusMeaning`).d('状态'),
    },
    {
      name: 'interfaceCode',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.interfaceCode`).d('接口编码'),
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.interfaceName`).d('接口名称'),
    },
    {
      name: 'limitRecCount',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.limitRecCount`).d('熔断次数'),
    },
    {
      name: 'tenantName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.tenantName`).d('所属租户'),
    },
    {
      name: 'createdRealName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.createdRealName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.creationDate`).d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.lastUpdatedRealName`).d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.lastUpdateDate`).d('更新时间'),
    },
  ],
  queryFields: [
    !isLevelFlag && {
      name: 'tenantIdLov',
      type: 'object',
      label: intl.get(`${prefix}.model.interfaceMointoringWork.tenantId`).d('租户名称'),
      lovCode: isLevelFlag ? 'SITF.TENANT_PAGING' : 'HPFM.TENANT',
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
      label: intl.get(`${prefix}.model.interfaceFlowControl.interfaceCode`).d('接口编码'),
      display: true,
    },
    {
      name: 'interfaceName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.interfaceName`).d('接口名称'),
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
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/request-limit-cnf?itfSrcPlatform=HITF_OPEN`
          : `${SRM_INTERFACE}/v1/request-limit-cnf?itfSrcPlatform=HITF_OPEN`,
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
      label: intl.get(`${prefix}.model.interfaceFlowControl.actionTypeMeaning`).d('操作类'),
    },
    {
      name: 'limitTypeMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.limitTypeMeaning`).d('熔断触发类型'),
    },
    {
      name: 'reason',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.reason`).d('熔断触发原因'),
    },
    {
      name: 'triggerTime',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.triggerTime`).d('熔断触发时间'),
    },
    {
      name: 'lockingDuration',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.lockingDuration`).d('熔断时长（分钟）'),
    },
    {
      name: 'expiryDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.expiryDate`).d('解禁时间'),
    },
    {
      name: 'sourceFromMeaning',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.sourceFromMeaning`).d('熔断来源'),
    },
    {
      name: 'createdRealName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.createdRealName`).d('创建人'),
    },
    {
      name: 'creationDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.creationDate`).d('创建时间'),
    },
    {
      name: 'lastUpdatedRealName',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.lastUpdatedRealName`).d('更新人'),
    },
    {
      name: 'lastUpdateDate',
      type: 'string',
      label: intl.get(`${prefix}.model.interfaceFlowControl.lastUpdateDate`).d('更新时间'),
    },
  ],
  transport: {
    read: () => {
      return {
        url: isLevelFlag
          ? `${SRM_INTERFACE}/v1/${organizationId}/request-limit-recs`
          : `${SRM_INTERFACE}/v1/request-limit-recs`,
        method: 'GET',
      };
    },
  },
});

export { breakerCircuitData, circuitDetailsData };
