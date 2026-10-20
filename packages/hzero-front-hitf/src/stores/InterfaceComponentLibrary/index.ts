import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { filterNullValueObject } from 'hzero-front/lib/utils/utils';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

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

// 列表页-表格
export const listTableDS = (): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'enableFlag',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'moduleCode',
        type: FieldType.string,
        label: intl.get('hitf.common.component.code').d('组件编码'),
      },
      {
        name: 'moduleName',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.component.name').d('组件名称'),
      },
      {
        name: 'moduleTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.component.type').d('组件类型'),
      },
      {
        name: 'moduleDesc',
        type: FieldType.string,
        label: intl.get('hitf.common.component.description').d('组件描述'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1/open-module-headers`,
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

// 详情页-表单
export const detailFormDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'moduleCode',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.component.code').d('组件编码'),
      },
      {
        name: 'moduleName',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.component.name').d('组件名称'),
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
        name: 'moduleType',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.component.type').d('组件类型'),
        defaultValue: 'PARAM_CONVERT',
        lookupCode: 'HITF.OPEN.MODULE_TYPE',
      },
      {
        name: 'convertMethod',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.convert.method').d('转换方式'),
        defaultValue: 'METHOD',
        lookupCode: 'HITF.OPEN.CONVERT_MODE',
      },
      {
        name: 'methodPath',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.method.path').d('方法名'),
        pattern: /^[a-zA-Z][a-zA-Z./]*$/,
      },
      {
        name: 'moduleDesc',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.component.description').d('组件描述'),
      },
    ],
  };
};

// 详情页-表格-入参
export const detailInputDS = (headerId): DataSetProps => {
  return {
    autoQuery: headerId,
    paging: false,
    fields: [
      {
        name: 'fieldCode',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.input.field.code').d('组件入参字段'),
      },
      {
        name: 'fieldDesc',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.input.field.desc').d('组件入参描述'),
      },
      {
        name: 'fieldType',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.field.type').d('字段类型'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1/open-module-lines/input/${headerId}`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1/open-module-lines/delete`,
          method: 'POST',
          data,
        };
      },
    },
  };
};

// 详情页-表格-出参
export const detailOutputDS = (headerId): DataSetProps => {
  return {
    autoQuery: headerId,
    paging: false,
    fields: [
      {
        name: 'fieldCode',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.output.field.code').d('组件出参字段'),
      },
      {
        name: 'fieldDesc',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.output.field.desc').d('组件出参描述'),
      },
      {
        name: 'fieldType',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.field.type').d('字段类型'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: `${HZERO_HITF}/v1/open-module-lines/output/${headerId}`,
          method: 'GET',
        };
      },
      destroy: ({ data }) => {
        return {
          url: `${HZERO_HITF}/v1/open-module-lines/delete`,
          method: 'POST',
          data,
        };
      },
    },
  };
};
