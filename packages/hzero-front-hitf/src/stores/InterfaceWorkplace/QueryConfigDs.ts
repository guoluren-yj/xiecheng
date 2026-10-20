import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import {
  getCurrentOrganizationId,
  isTenantRoleLevel,
  filterNullValueObject,
} from 'hzero-front/lib/utils/utils';
import intl from 'hzero-front/lib/utils/intl';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { getLovQueryAxiosConfig } from 'srm-front-boot/lib/components/SearchBarTable/util';

const organizationId = getCurrentOrganizationId();
const level = isTenantRoleLevel() ? `/${organizationId}` : '';

// 是否为租户
const isTenant = isTenantRoleLevel();

const treeSearchDs = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'searchIn',
        type: FieldType.string,
      },
    ],
  };
};

const formDs = (): DataSetProps => {
  return {
    fields: [
      {
        label: intl.get('hitf.interfaceWorkplace.model.paramCode').d('字段编码'),
        name: 'params',
        type: FieldType.object,
        lovCode: isTenant ? 'HITF.OPEN_TENANT_PARAM_QUERY' : 'HITF.OPEN_TENANT_PARAM_QUERY_SITE',
        textField: 'paramName',
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': isTenant
                ? 'HITF.OPEN_TENANT_PARAM_QUERY'
                : 'HITF.OPEN_TENANT_PARAM_QUERY_SITE',
              's-lov-display-field': 'paramName',
            },
          }),
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'paramCode',
        bind: 'params.paramName',
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.paramName').d('字段描述'),
        name: 'paramName',
        type: FieldType.intl,
        bind: 'params.paramDescribe',
        required: true,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.targetParamCode').d('映射字段名称'),
        name: 'targetParam',
        type: FieldType.object,
        lovCode: isTenant
          ? 'HITF.OPEN_MONITOR_TARGET_PARAM'
          : 'HITF.OPEN_MONITOR_TARGET_PARAM_SITE',
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': isTenant
                ? 'HITF.OPEN_MONITOR_TARGET_PARAM'
                : 'HITF.OPEN_MONITOR_TARGET_PARAM_SITE',
              's-lov-display-field': 'targetParam',
            },
          }),
        ignore: FieldIgnore.always,
        required: true,
      },
      {
        name: 'targetParamCode',
        bind: 'targetParam.targetParamCode',
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.isQueryCondition').d('是否作为查询条件'),
        name: 'isQueryCondition',
        type: FieldType.boolean,
        required: true,
        trueValue: 1,
        falseValue: 0,
        defaultValue: 1,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.priority').d('位置'),
        name: 'priority',
        type: FieldType.number,
        min: 0,
        precision: 0,
        required: true,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.width').d('宽度'),
        name: 'width',
        type: FieldType.number,
        precision: 0,
        min: 0,
        defaultValue: 100,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.moduleType').d('组件类型'),
        name: 'moduleType',
        lookupCode: 'HWFP.PROCESS.COMPONENT_TYPE',
        required: true,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.enable').d('是否启用'),
        name: 'status',
        required: true,
        type: FieldType.boolean,
        defaultValue: 1,
        trueValue: 1,
        falseValue: 0,
      },
    ],
  };
};

const listTableDS = (): DataSetProps => {
  return {
    autoQuery: false,
    selection: DataSetSelection.multiple,
    cacheSelection: true,
    primaryKey: 'monitorManageId',
    pageSize: 10,
    fields: [
      {
        label: intl.get('hitf.interfaceWorkplace.model.source').d('来源'),
        name: 'source',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.operate').d('操作'),
        name: 'operate',
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.paramCode').d('字段编码'),
        name: 'paramCode',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.paramName').d('字段描述'),
        name: 'paramName',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.targetParamCode').d('映射字段名称'),
        name: 'targetParamCode',
        type: FieldType.string,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.isQueryCondition').d('是否作为查询条件'),
        name: 'isQueryCondition',
        lookupCode: 'HITF.OPEN_QUERY_FLAG',
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.priority').d('位置'),
        name: 'priority',
        type: FieldType.number,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.width').d('宽度'),
        name: 'width',
        type: FieldType.number,
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.moduleType').d('组件类型'),
        name: 'moduleType',
        type: FieldType.string,
        lookupCode: 'HWFP.PROCESS.COMPONENT_TYPE',
      },
      {
        label: intl.get('hitf.interfaceWorkplace.model.status').d('状态'),
        name: 'status',
        lookupCode: 'HITF.OPEN_STATUS',
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { paramCode } = data;
        const query: any = {};
        if (paramCode) {
          query.paramName = paramCode;
          query.targetParamCode = paramCode;
        }
        const param = filterNullValueObject(params);
        return {
          url: `${HZERO_HITF}/v1${level}/open-monitor-manages`,
          method: 'GET',
          data: { ...data, ...param, ...query },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${level}/open-monitor-manages`,
          method: 'DELETE',
          data,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach(item => {
          // eslint-disable-next-line no-param-reassign
          item.selectable = isTenant ? item.get('source') === 'CUSTOM' : true;
        });
      },
    },
  };
};
// 接口查询左侧树
const treeListDs = (): DataSetProps => {
  return {
    fields: [
      {
        name: 'interfaceId',
        type: FieldType.number,
      },
      {
        name: 'name',
        type: FieldType.string,
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const param = filterNullValueObject(params);
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1${level}/open-monitor-manages/list-banner`,
          method: 'GET',
          data: { ...param, ...queryParam },
        };
      },
    },
  };
};

export { treeListDs, treeSearchDs, listTableDS, formDs };
