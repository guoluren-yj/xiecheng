import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { filterNullValueObject, getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { FieldType, FieldIgnore, DataSetSelection } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();
const isTenant = isTenantRoleLevel();
const organizationRoleLevel = isTenant ? `/${organizationId}` : '';

const targetFieldCode = isTenant ? 'HITF.OPEN_INTEFACE_PARAM_QUERY_TENANT' : 'HITF.OPEN_INTEFACE_PARAM_QUERY';

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

// 列表页-树目录
export const listTreeDS = (): DataSetProps => {
  return {
    primaryKey: 'id',
    parentField: 'parentId',
    expandField: 'expand',
    idField: 'id',
    fields: [
      { name: 'id', type: FieldType.string },
      { name: 'expand', type: FieldType.boolean },
      { name: 'parentId', type: FieldType.number },
    ],
    transport: {
      read: ({ data, params }) => {
        const param = filterNullValueObject(params);
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-categorys`,
          method: 'GET',
          data: { ...param, ...queryParam },
        };
      },
    },
  };
};

export const listTableDS = (): DataSetProps => {
  return {
    fields: [
      {
        name: 'statusMeaning',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
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
        name: 'tenantName',
        type: FieldType.string,
        label: intl.get('hzero.common.tenantName').d('所属租户'),
      },
      {
        name: 'applicationTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.application.type').d('应用类型'),
      },
      {
        name: 'interfaceTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.interfaceType').d('接口类型'),
      },
      {
        name: 'interfaceStandardTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.interface.category').d('接口类别'),
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
        const { queryParams = {}, interfaceCategory } = data;
        const queryParam = filterNullValueObject({ ...queryParams, interfaceCategory });
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces`,
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

// 弹窗-内部接口
export const modalTableDS = (): DataSetProps => {
  return {
    selection: DataSetSelection.single,
    fields: [
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
        name: 'serviceCode',
        type: FieldType.string,
        label: intl.get('hitf.common.model.services.domainUrl').d('服务地址'),
      },
      {
        name: 'name',
        type: FieldType.string,
        label: intl.get('hitf.common.model.services.desc').d('服务描述'),
      },
      {
        name: 'requestMethod',
        type: FieldType.string,
        label: intl.get('hzero.common.requestMethod').d('请求方式'),
      },
      {
        name: 'path',
        type: FieldType.string,
        label: intl.get('hitf.common.model.services.interfaceUrl').d('接口地址'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {}, interfaceCategory } = data;
        const queryParam = filterNullValueObject({ ...queryParams, interfaceCategory });
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interfaces/api-list`,
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

// 详情页-基本信息-表单
export const detailFormDS = (serviceType): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'interfaceCode',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.interfaceCode').d('接口编码'),
        required: true,
      },
      {
        name: 'interfaceName',
        type: FieldType.intl,
        label: intl.get('hitf.application.model.application.interfaceName').d('接口名称'),
        required: true,
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
        name: 'interfaceType',
        type: FieldType.string,
        label: intl.get('hitf.common.interfaceType').d('接口类型'),
        required: true,
        lookupCode: 'SOPP.INTERFACE_TYPE',
      },
      {
        name: 'interfaceCategoryLov',
        type: FieldType.object,
        label: intl.get('hitf.common.api.type').d('API类别'),
        required: true,
        lovCode: isTenant ? 'HITF.OPEN.API_TYPE_TENANT' : 'HITF.OPEN.API_TYPE.VIEW',
        textField: 'interfaceCategoryName',
        valueField: 'interfaceCategoryCode',
        ignore: FieldIgnore.always,
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': isTenant ? 'HITF.OPEN.API_TYPE_TENANT' : 'HITF.OPEN.API_TYPE.VIEW',
              's-lov-display-field': 'interfaceCategoryName',
            },
          }),
      },
      {
        name: 'interfaceCategory',
        type: FieldType.string,
        bind: 'interfaceCategoryLov.interfaceCategoryCode',
      },
      {
        name: 'interfaceCategoryMeaning',
        type: FieldType.string,
        bind: 'interfaceCategoryLov.interfaceCategoryName',
      },
      {
        name: 'applicationType',
        type: FieldType.string,
        label: intl.get('hitf.common.application.type').d('应用类型'),
        required: true,
        lookupCode: 'SOPP.APPLICATION',
      },
      {
        name: 'publishType',
        type: FieldType.string,
        label: intl.get('hzero.common.releaseType').d('发布类型'),
        required: true,
        lookupCode: 'HITF.OPEN_PUBLISH_TYPE',
        defaultValue: 'restful',
      },
      {
        name: 'requestMethod',
        type: FieldType.string,
        label: intl.get('hzero.common.requestMethod').d('请求方式'),
        required: true,
        lookupCode: 'HITF.OPEN_REQUEST_METHOD',
      },
      {
        name: 'interactiveMethod',
        type: FieldType.string,
        label: intl.get('hitf.common.interactiveType').d('交互方式'),
        required: true,
        lookupCode: 'SOPP.INTERACTION_MODE',
        defaultValue: 'SYNC',
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
      // 更多
      {
        name: 'publishUrl',
        type: FieldType.string,
        label: intl.get('hzero.common.publishUrl').d('发布地址'),
        disabled: true,
      },
      {
        name: 'interfaceUrl',
        type: FieldType.string,
        label: intl.get('hzero.common.interfaceUrl').d('接口地址'),
        disabled: true,
      },
      {
        name: 'interfaceStandardType',
        type: FieldType.string,
        label: intl.get('hitf.common.interface.category').d('接口类别'),
        disabled: true,
        lookupCode: 'HITF.OPEN_INTERFACE_STANDARD_TYPE',
      },
      {
        name: 'serviceCode',
        type: FieldType.string,
        label: intl.get('hitf.common.services.address').d('服务地址'),
        disabled: true,
      },
      {
        name: 'serviceType',
        type: FieldType.string,
        label: intl.get('hitf.common.services.category').d('服务类别'),
        disabled: true,
        lookupCode: 'HITF.OPEN_SERVICE_TYPE',
      },
      {
        name: 'creationName',
        type: FieldType.string,
        label: intl.get('hzero.common.date.creator').d('创建人'),
        disabled: true,
      },
      {
        name: 'creationDate',
        type: FieldType.string,
        label: intl.get('hzero.common.date.creation').d('创建时间'),
        disabled: true,
      },
      {
        name: 'updateName',
        type: FieldType.string,
        label: intl.get('hzero.common.date.lastUpdatedBy').d('更新人'),
        disabled: true,
      },
      {
        name: 'lastUpdateDate',
        type: FieldType.string,
        label: intl.get('hzero.common.date.lastUpdateDate').d('更新时间'),
        disabled: true,
      },
      {
        name: 'exportType',
        type: FieldType.string,
        label: intl.get('hitf.common.export.type').d('导出传输类型'),
        dynamicProps: {
          required: ({ record }) => record.get('interfaceType') === 'EXPORT',
        },
        lookupCode: 'HITF.OPEN_EXPORT_TYPE',
      },
      {
        name: 'maxBatchAmount',
        type: FieldType.number,
        label: intl.get('hitf.common.single.query.max.num').d('单次请求最大同步单据数量(条)'),
        required: serviceType === 'inside',
      },
      {
        name: 'maxBatchSize',
        type: FieldType.number,
        label: intl.get('hitf.common.single.query.max.size').d('单次请求最大同步请求体大小(M)'),
        required: serviceType === 'inside',
      },
      {
        name: 'limitFlag',
        type: FieldType.number,
        label: intl.get('hitf.common.rateLimit.status').d('限流状态'),
        required: true,
        lookupCode: 'HITF.OPEN_STATUS',
        defaultValue: 0,
      },
      {
        name: 'limitSize',
        type: FieldType.number,
        label: intl.get('hitf.common.rateLimit.value').d('限流值(秒)'),
        dynamicProps: {
          required: ({ record }) => parseInt(record.get('limitFlag'), 10) === 1,
        },
      },
      {
        name: 'retryCount',
        type: FieldType.number,
        label: intl.get('hitf.common.fail.retry.num').d('失败重跑次数(次)'),
        dynamicProps: {
          required: ({ record }) => parseInt(record.get('retryFlag'), 10) === 1,
        },
      },
      {
        name: 'retryInterval',
        type: FieldType.number,
        label: intl.get('hitf.common.fail.retry.interval').d('失败重试间隔(秒)'),
        dynamicProps: {
          required: ({ record }) => parseInt(record.get('retryFlag'), 10) === 1,
        },
      },
      {
        name: 'retryFlag',
        type: FieldType.number,
        label: intl.get('hitf.common.fail.retry.status').d('重跑状态'),
        required: true,
        lookupCode: 'HITF.OPEN_STATUS',
        defaultValue: '0',
      },
    ],
  };
};

// 详情页-数据转换-表格
export const detailRelationTableDS = (id): DataSetProps => {
  return {
    autoQuery: Boolean(id),
    paging: false,
    fields: [
      {
        name: 'adaptorTaskCode',
        type: FieldType.string,
        label: intl.get('hitf.common.script.encoding').d('脚本编码'),
      },
      {
        name: 'adaptorTaskName',
        type: FieldType.string,
        label: intl.get('hitf.common.script.describle').d('脚本描述'),
      },
      {
        name: 'scriptTypeCode',
        type: FieldType.string,
        label: intl.get('hzero.common.model.common.scriptTypeMeaning').d('脚本类型'),
        lookupCode: 'HITF.OPEN.SCRIPT_TYPE_CODE',
        defaultValue: 'INVOKE',
        required: true,
        disabled: true,
      },
      {
        name: 'paramCode',
        type: FieldType.string,
        label: intl.get('hitf.common.fieldName').d('字段名'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('scriptTypeCode') !== 'INVOKE';
          },
          required: ({ record }) => {
            return record.get('scriptTypeCode') === 'INVOKE';
          },
        },
      },
      {
        name: 'triggerTypeCode',
        type: FieldType.string,
        label: intl.get('hitf.common.trigger.type.code').d('触发类型编码'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('scriptTypeCode') !== 'INVOKE';
          },
          required: ({ record }) => {
            return record.get('scriptTypeCode') === 'INVOKE';
          },
        },
      },
      {
        name: 'triggerTypeName',
        type: FieldType.string,
        label: intl.get('hitf.common.trigger.type.describe').d('触发类型描述'),
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('scriptTypeCode') !== 'INVOKE';
          },
          required: ({ record }) => {
            return record.get('scriptTypeCode') === 'INVOKE';
          },
        },
      },
      {
        name: 'comments',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-scrips?interfaceId=${id}&tenantId=${organizationId}`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-scrips/batch-delete`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

// 详情页-参数维护-主表、关联关系
export const paramsCreateDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'paramHeaderCode',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.structureCode').d('结构编码'),
      },
      {
        name: 'paramHeaderName',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.structureName').d('结构名称'),
      },
      {
        name: 'relationType',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.relationType').d('关系类型'),
        lookupCode: 'HITF.OPEN_RELATION_TYPE',
      },
      {
        name: 'paramType',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.paramType').d('参数类型'),
        lookupCode: 'HITF.OPEN_PARAM_HEADER_TYPE',
      },
      {
        name: 'parentId', // 父级id-主从关系时必填
        type: FieldType.string,
      },
      {
        name: 'notNull',
        type: FieldType.number,
        label: intl.get('hitf.common.structure.required').d('是否必传结构'),
        defaultValue: 0,
        lookupCode: 'HITF.OPEN_QUERY_FLAG',
      },
    ],
  };
};

// 详情页-参数维护-表格
export const paramsTableDS = (id, type): DataSetProps => {
  return {
    paging: false,
    idField: 'id',
    parentField: 'parentId',
    fields: [
      {
        name: 'paramName',
        required: true,
        type: FieldType.string,
        label: intl.get('hzero.common.fieldName').d('字段名称'),
      },
      {
        name: 'paramDescribe',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.fieldDesc').d('字段描述'),
      },
      {
        name: 'paramType',
        required: true,
        type: FieldType.string,
        label: intl.get('hzero.common.model.type').d('类型'),
        lookupCode: 'HITF.OPEN_PARAM_TYPE',
      },
      {
        name: 'paramLength',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.fieldLength').d('字段长度'),
      },
      {
        name: 'notNull',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.isRequired').d('是否必传'),
        lookupCode: 'HITF.OPEN_PARAM_NOT_NULL',
      },
      {
        name: 'paramDisplayRule',
        type: FieldType.string,
        label: intl.get('hitf.common.field.show.rule').d('字段显示规则'),
        lookupCode: 'HITF.OPEN_PARAM_DISPLAY_RULE',
        dynamicProps: {
          required: () => {
            return !type;
          },
        },
      },
      {
        name: 'targetParamName',
        type: FieldType.string,
        label: intl.get('hitf.common.function.field.name').d('功能字段名称'),
      },
      {
        name: 'conditionCode',
        type: FieldType.string,
        label: intl.get('hzero.common.conditionRule').d('条件规则'),
      },
      {
        name: 'isResponse',
        type: FieldType.string,
        label: intl.get('hitf.common.isResponse').d('是否响应字段'),
        lookupCode: 'HITF.OPEN_PARAM_NOT_NULL',
        dynamicProps: {
          required: () => {
            return type;
          },
        },
      },
      {
        name: 'successResult',
        type: FieldType.string,
        label: intl.get('hitf.common.successResult').d('成功标识'),
        lookupCode: 'HITF.OPEN_SUCCESS_RESULT',
        dynamicProps: {
          disabled: ({ record }) => {
            return record.get('isResponse') !== '1';
          },
          required: ({ record }) => {
            return record.get('isResponse') === '1';
          },
        },
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${type ? '-response': ''}-param-lines`,
          method: 'GET',
          params: { interfaceId: id },
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface${type ? '-response': ''}-param-lines`,
          method: 'DELETE',
          data,
        };
      },
    },
  };
};

// 详情页-数据转换-表格
export const detailTableDS = (id): DataSetProps => {
  return {
    // autoQuery: id,
    paging: false,
    fields: [
      {
        name: 'convertTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.data.conversion.type').d('数据转换类型'),
      },
      {
        name: 'convertCode',
        type: FieldType.string,
        label: intl.get('hitf.common.data.conversion.code').d('数据转换编码'),
      },
      {
        name: 'convertName',
        type: FieldType.string,
        label: intl.get('hitf.common.data.conversion.fieldName').d('数据转换名称'),
      },
      {
        name: 'enableFlag',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-converts?interfaceId=${id}`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-converts/delete`,
          method: 'POST',
          data,
        };
      },
    },
    events: {
      load: ({ dataSet }) => {
        dataSet.forEach((item, index) => {
          // eslint-disable-next-line no-param-reassign
          item.init('orderSeq', index + 1);
        });
      },
    },
  };
};

// 详情页-数据转换-侧弹窗-表单
export const dataFormDS = (id): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'openInterfaceConvertId',
      },
      {
        name: 'openSourceId',
      },
      {
        name: 'convertType',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.dataMapping.dataType').d('数据映射类型'),
        lookupCode: 'HITF.OPEN.CONVERT_TYPE',
      },
      {
        name: 'enableFlag',
        required: true,
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
        defaultValue: '1',
        lookupCode: 'HITF.OPEN_STATUS',
      },
      {
        name: 'targetFieldLov',
        type: FieldType.object,
        label: intl.get('hitf.common.field.code').d('字段编码'),
        lovCode: targetFieldCode,
        textField: 'paramName',
        valueField: 'interfaceParamLineId',
        ignore: FieldIgnore.always,
        lovPara: { interfaceId: id },
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': targetFieldCode,
              's-lov-display-field': 'paramName',
            },
          }),
        optionsProps: dsProps => {
          return {
            ...dsProps,
            paging: false,
            idField: 'id',
            parentField: 'parentId',
            selection: DataSetSelection.single,
            events: {
              load: ({ dataSet }) => {
                dataSet.forEach(item => {
                  // eslint-disable-next-line no-param-reassign
                  item.selectable = !!item.get('interfaceParamLineId');
                });
              },
            },
          };
        },
        dynamicProps: {
          required: ({ record }) => record.get('convertType') !== 'MODULE',
        },
      },
      {
        name: 'paramName',
        type: FieldType.string,
        bind: 'targetFieldLov.paramName',
      },
      {
        name: 'targetFieldId',
        type: FieldType.string,
        bind: 'targetFieldLov.interfaceParamLineId',
      },
      {
        name: 'interfaceParamHeaderId',
        type: FieldType.string,
        bind: 'targetFieldLov.interfaceParamHeaderId',
      },
      {
        name: 'formStructure',
        type: FieldType.string,
        label: intl.get('hitf.common.target.field.structure').d('所属结构'),
        bind: 'targetFieldLov.structure',
      },
      {
        name: 'moduleLov',
        type: FieldType.object,
        label: intl.get('hitf.common.component.code').d('组件编码'),
        lovCode: 'HITF.OPEN.MODULE',
        textField: 'moduleCode',
        valueField: 'moduleCode',
        ignore: FieldIgnore.always,
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': 'HITF.OPEN.MODULE',
              's-lov-display-field': 'moduleCode',
            },
          }),
        dynamicProps: {
          required: ({ record }) => record.get('convertType') === 'MODULE',
        },
      },
      {
        name: 'moduleCode',
        disabled: true,
        type: FieldType.string,
        bind: 'moduleLov.moduleCode',
        label: intl.get('hitf.common.component.code').d('组件编码'),
        dynamicProps: {
          required: ({ record }) => record.get('convertType') === 'MODULE',
        },
      },
      {
        name: 'moduleName',
        disabled: true,
        type: FieldType.string,
        bind: 'moduleLov.moduleName',
        label: intl.get('hitf.common.component.name').d('组件名称'),
        dynamicProps: {
          required: ({ record }) => record.get('convertType') === 'MODULE',
        },
      },
      {
        name: 'moduleDesc',
        disabled: true,
        type: FieldType.string,
        label: intl.get('hitf.common.component.description').d('组件描述'),
        bind: 'moduleLov.moduleDesc',
        dynamicProps: {
          required: ({ record }) => record.get('convertType') === 'MODULE',
        },
      },
      {
        name: 'moduleHeaderId',
        type: FieldType.string,
        bind: 'moduleLov.moduleHeaderId',
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
      {
        name: 'checkFlag',
        type: FieldType.number,
        label: intl.get('hitf.common.component.conversion.check').d('组件转换校验'),
        defaultValue: 0,
        lookupCode: 'HITF.OPEN_STATUS',
      },
    ],
  };
};

// 详情页-数据转换-侧弹窗-源数据表格
export const dataConversionDS = (id): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'sourceCategory',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.field.sourceType').d('转换类型'),
        lookupCode: 'HITF.OPEN.SOURCE_TYPE',
      },
      {
        name: 'sourceValueObj',
        label: intl.get('hitf.common.dataTransform.sourceValue').d('默认值'),
        required: true,
        ignore: FieldIgnore.always,
        computedProps: {
          type: ({ record }) => {
            return record && record.get('sourceCategory') === 'SOURCE_FIELD' ? FieldType.object : FieldType.string;
          },
          lovCode: ({ record }) => {
            return record && record.get('sourceCategory') === 'SOURCE_FIELD' ? targetFieldCode : undefined;
          },
        },
        textField: 'paramName',
        valueField: 'interfaceParamLineId',
        lovPara: { interfaceId: id },
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': targetFieldCode,
              's-lov-display-field': 'paramName',
            },
          }),
        optionsProps: dsProps => {
          return {
            ...dsProps,
            paging: false,
            idField: 'id',
            parentField: 'parentId',
            selection: DataSetSelection.single,
            events: {
              load: ({ dataSet }) => {
                dataSet.forEach(item => {
                  // eslint-disable-next-line no-param-reassign
                  item.selectable = !!item.get('interfaceParamLineId');
                });
              },
            },
          };
        },
      },
      {
        name: 'sourceValue',
        computedProps: {
          bind: ({ record }) => {
            return record && record.get('sourceCategory') === 'SOURCE_FIELD' ? 'sourceValueObj.interfaceParamLineId' : 'sourceValueObj';
          },
        },
      },
      {
        name: 'lineParamName',
        computedProps: {
          bind: ({ record }) => {
            return record && record.get('sourceCategory') === 'SOURCE_FIELD' ? 'sourceValueObj.paramName' : 'sourceValueObj';
          },
        },
      },
      {
        name: 'lineStructure',
        type: FieldType.string,
        label: intl.get('hitf.common.target.field.structure').d('所属结构'),
        computedProps: {
          bind: ({ record }) => {
            return record && record.get('sourceCategory') === 'SOURCE_FIELD' ? 'sourceValueObj.structure' : '';
          },
        },
      },
      {
        name: 'sourceRemark',
        type: FieldType.string,
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
  };
};

// 详情页-数据转换-侧弹窗-表格-关联脚本明细
export const dataScriptDS = (): DataSetProps => {
  return {
    autoQuery: false,
    paging: false,
    fields: [
      {
        name: 'targetValue',
        type: FieldType.string,
        required: true,
        label: intl.get('hitf.common.dataTransform.targetValue').d('目标值'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hzero.common.view.description').d('描述'),
      },
      {
        name: 'conditionCode',
        type: FieldType.string,
        label: intl.get('hzero.common.conditionRule').d('条件规则'),
      },
      {
        name: 'key',
        type: FieldType.string,
        label: intl.get('hitf.common.view.logicOperation.condition').d('条件'),
      },
    ],
    transport: {
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1${organizationRoleLevel}/open-interface-converts/condition/delete`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

// 详情页-数据转换-侧弹窗-表格-入参
export const dataInputDS = (id): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'fieldCode',
        type: FieldType.string,
        label: intl.get('hitf.common.input.field.code').d('组件入参字段'),
      },
      {
        name: 'fieldDesc',
        type: FieldType.string,
        label: intl.get('hitf.common.input.field.desc').d('组件入参描述'),
      },
      {
        name: 'fieldType',
        type: FieldType.string,
        label: intl.get('hitf.common.component.field.type').d('组件字段类型'),
      },
      {
        name: 'targetFieldLov',
        type: FieldType.object,
        label: intl.get('hitf.common.target.input.filed').d('目标入参字段'),
        lovCode: targetFieldCode,
        textField: 'paramName',
        valueField: 'interfaceParamLineId',
        ignore: FieldIgnore.always,
        lovPara: { interfaceId: id },
        dynamicProps: {
          required: ({ record }) => Boolean(record.get('enabledFlag')),
        },
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': targetFieldCode,
              's-lov-display-field': 'paramName',
            },
          }),
        optionsProps: dsProps => {
          return {
            ...dsProps,
            paging: false,
            idField: 'id',
            parentField: 'parentId',
            selection: DataSetSelection.single,
            events: {
              load: ({ dataSet }) => {
                dataSet.forEach(item => {
                  // eslint-disable-next-line no-param-reassign
                  item.selectable = !!item.get('interfaceParamLineId');
                });
              },
            },
          };
        },
      },
      {
        name: 'targetFieldId',
        type: FieldType.string,
        bind: 'targetFieldLov.interfaceParamLineId',
      },
      {
        name: 'paramName',
        type: FieldType.string,
        bind: 'targetFieldLov.paramName',
      },
      {
        name: 'structure',
        type: FieldType.string,
        label: intl.get('hitf.common.target.field.structure').d('所属结构'),
        bind: 'targetFieldLov.structure',
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hitf.common.target.input.field.desc').d('目标入参描述'),
        bind: 'targetFieldLov.paramDescribe',
      },
      {
        name: 'paramType',
        type: FieldType.string,
        label: intl.get('hitf.common.target.filed.ype').d('目标字段类型'),
        bind: 'targetFieldLov.paramType',
      },
      {
        name: 'moduleFieldCode',
        type: FieldType.string,
        bind: 'targetFieldLov.paramName',
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.status').d('状态'),
        defaultValue: 1,
      },
    ],
  };
};

// 详情页-数据转换-侧弹窗-表格-出参
export const dataOutputDS = (id): DataSetProps => {
  return {
    paging: false,
    fields: [
      {
        name: 'fieldCode',
        type: FieldType.string,
        label: intl.get('hitf.common.output.field.code').d('组件出参字段'),
      },
      {
        name: 'fieldDesc',
        type: FieldType.string,
        label: intl.get('hitf.common.output.field.desc').d('组件出参描述'),
      },
      {
        name: 'fieldType',
        type: FieldType.string,
        label: intl.get('hitf.common.component.field.type').d('组件字段类型'),
      },
      {
        name: 'targetFieldLov',
        type: FieldType.object,
        label: intl.get('hitf.common.target.output.filed').d('目标出参字段'),
        lovCode: targetFieldCode,
        textField: 'paramName',
        valueField: 'interfaceParamLineId',
        ignore: FieldIgnore.always,
        lovPara: { interfaceId: id },
        dynamicProps: {
          required: ({ record }) => Boolean(record.get('enabledFlag')),
        },
        lovQueryAxiosConfig: (code, config) =>
          getLovQueryAxiosConfig(code, config, {
            headers: {
              's-lov-view-code': targetFieldCode,
              's-lov-display-field': 'paramName',
            },
          }),
        optionsProps: dsProps => {
          return {
            ...dsProps,
            paging: false,
            idField: 'id',
            parentField: 'parentId',
            selection: DataSetSelection.single,
            events: {
              load: ({ dataSet }) => {
                dataSet.forEach(item => {
                  // eslint-disable-next-line no-param-reassign
                  item.selectable = !!item.get('interfaceParamLineId');
                });
              },
            },
          };
        },
      },
      {
        name: 'targetFieldId',
        type: FieldType.string,
        bind: 'targetFieldLov.interfaceParamLineId',
      },
      {
        name: 'paramName',
        type: FieldType.string,
        bind: 'targetFieldLov.paramName',
      },
      {
        name: 'structure',
        type: FieldType.string,
        label: intl.get('hitf.common.target.field.structure').d('所属结构'),
        bind: 'targetFieldLov.structure',
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hitf.common.target.output.field.desc').d('目标出参描述'),
        bind: 'targetFieldLov.paramDescribe',
      },
      {
        name: 'paramType',
        type: FieldType.string,
        label: intl.get('hitf.common.target.filed.ype').d('目标字段类型'),
        bind: 'targetFieldLov.paramType',
      },
      {
        name: 'moduleFieldCode',
        type: FieldType.string,
        bind: 'targetFieldLov.paramName',
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        trueValue: 1,
        falseValue: 0,
        label: intl.get('hzero.common.status').d('状态'),
        defaultValue: 1,
      },
    ],
  };
};
