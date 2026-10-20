import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { filterNullValueObject, getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const organizationRoleLevel = isTenant ? `/${organizationId}` : '';

export const getLovQueryAxiosConfig = (code, config, options) => {
  const axiosConfig = lovQueryAxiosConfig(code, config);
  return {
    ...axiosConfig,
    headers: {
      ...axiosConfig.headers,
      ...options.headers,
    },
  };
};

// 应用管理列表页-表格
export const listTableDS = (): DataSetProps => {
  return {
    fields: [
      {
        name: 'statusMeaning',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'applicationCode',
        type: FieldType.string,
        label: intl.get('hitf.application.code').d('应用编码'),
      },
      {
        name: 'applicationName',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.name').d('应用名称'),
      },
      {
        name: 'applicationTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.type').d('应用类型'),
      },
      {
        name: 'comments',
        type: FieldType.string,
        label: intl.get('hitf.application.introduction').d('应用介绍'),
      },
      {
        name: 'dataSourceMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.source').d('应用来源'),
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        label: intl.get('hzero.common.tenantName').d('所属租户'),
      },
      {
        name: 'creationName',
        type: FieldType.string,
        label: intl.get('hzero.common.date.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('hzero.common.date.creation').d('创建时间'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-headers`,
          method: 'GET',
          data: {
            page,
            size,
            ...queryParam,
          },
        };
      },
    },
  };
};

// 应用管理详情页-表单
export const detailFormDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'applicationCode',
        type: FieldType.string,
        label: intl.get('hitf.application.code').d('应用编码'),
      },
      {
        name: 'applicationName',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.name').d('应用名称'),
      },
      {
        name: 'statusMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.app.status').d('应用状态'),
      },
      {
        name: 'applicationTypeCode',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.application.type').d('应用类型'),
        lookupCode: 'HITF.OPEN.APPLICATION_TYPE',
        dynamicProps: {
          disabled: ({ record }) => !record.get('tenantLov'),
        },
      },
      {
        name: 'tenantLov',
        required: true,
        label: intl.get('hzero.common.tenantName').d('所属租户'),
        type: FieldType.object,
        lovCode: 'HPFM.TENANT',
        textField: 'tenantName',
        valueField: 'tenantId',
        ignore: FieldIgnore.always,
        lovQueryAxiosConfig: (code, config) =>
        getLovQueryAxiosConfig(code, config, {
          headers: {
            's-lov-view-code': 'HPFM.TENANT',
            's-lov-display-field': 'tenantName',
          },
        }),
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: 'tenantLov.tenantId',
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        bind: 'tenantLov.tenantName',
      },
      {
        name: 'dataSourceMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.source').d('应用来源'),
      },
      {
        name: 'ebTypeLov',
        label: intl.get('hitf.common.eb.tenant').d('电商租户'),
        type: FieldType.object,
        lovCode: 'SCEC.EC_PLATFORM',
        textField: 'ecPlatformName',
        valueField: 'ecPlatformCode',
        ignore: FieldIgnore.always,
        dynamicProps: {
          required: ({ record }) => record.get('applicationTypeCode') === 'EB_API' || record.get('applicationTypeCode') === 'EB_PUNCHOUT',
        },
      },
      {
        name: 'ebTypeCode',
        type: FieldType.string,
        bind: 'ebTypeLov.ecPlatformCode',
      },
      {
        name: 'ebTypeMeaning',
        type: FieldType.string,
        bind: 'ebTypeLov.ecPlatformName',
      },
      {
        name: 'systemTypeCode',
        type: FieldType.string,
        label: intl.get('hitf.application.system.type').d('系统类别'),
        lookupCode: 'HITF.OPEN.APPLICATION_SYSTEM_TYPE',
      },
      {
        name: 'creationName',
        type: FieldType.string,
        label: intl.get('hzero.common.date.creator').d('创建人'),
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('hzero.common.date.creation').d('创建时间'),
      },
      {
        name: 'comments',
        type: FieldType.string,
        label: intl.get('hitf.application.introduction').d('应用介绍'),
      },
      {
        name: 'externalSystemCode',
        type: FieldType.string,
        label: intl.get('hitf.application.external.system.code').d('外部系统编码'),
      },
      {
        name: 'clientId',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.clientId').d('客户端ID'),
      },
    ],
  };
};

// 应用管理详情页-API信息-表格
export const apiTableDS = (headerId): DataSetProps => {
  return {
    // autoQuery: headerId,
    fields: [
      {
        name: 'statusMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.interface.status').d('接口状态'),
      },
      {
        name: 'interfaceCode',
        type: FieldType.string,
        label: intl.get('hzero.common.interfaceCode').d('接口编码'),
      },
      {
        name: 'interfaceName',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.interfaceName').d('接口名称'),
      },
      {
        name: 'requestMethodMeaning',
        type: FieldType.string,
        label: intl.get('hzero.common.requestMethod').d('请求方式'),
      },
      {
        name: 'publishTypeMeaning',
        type: FieldType.string,
        label: intl.get('hzero.common.releaseType').d('发布类型'),
      },
      {
        name: 'interfaceTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.interfaceType').d('接口类型'),
      },
      {
        name: 'interfaceCategoryMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.apiType').d('API类型'),
      },
      {
        name: 'interactiveMethodMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.interactiveType').d('交互方式'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-application-lines?applicationHeaderId=${headerId}`,
          method: 'GET',
          data: {
            page,
            size,
            ...queryParam,
          },
        };
      },
    },
  };
};

// 应用管理详情页-API信息-表格-新增
export const addApiDS = (headerId): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'addApi',
        textField: 'interfaceName',
        valueField: 'interfaceCode',
        type: FieldType.object,
        lovCode: isTenant ? 'HITF.OPEN.UNASSIGNED.INTERFACE.ORG.VIEW' : 'HITF.OPEN.UNASSIGNED.INTERFACE.VIEW',
        multiple: true,
        lovPara: { applicationHeaderId: headerId },
      },
    ],
  };
};
