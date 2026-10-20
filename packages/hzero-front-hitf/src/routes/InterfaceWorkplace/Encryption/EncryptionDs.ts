import { HZERO_HITF } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { filterNullValueObject, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { lovQueryAxiosConfig } from 'srm-front-boot/lib/utils/c7nUiConfig';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';

const organizationId = getCurrentOrganizationId();

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

// 接口加密列表页-表格
export const listTableDS = (): DataSetProps => {
  return {
    autoQuery: true,
    fields: [
      {
        name: 'statusMeaning',
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
      },
      {
        name: 'encryCode',
        type: FieldType.string,
        label: intl.get('hitf.common.encryption.code').d('加密编码'),
      },
      {
        name: 'encryName',
        type: FieldType.string,
        label: intl.get('hitf.common.encryption.name').d('加密名称'),
      },
      {
        name: 'applicationName',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.name').d('应用名称'),
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hitf.application.remark').d('备注'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1/open-interface-encry-headers/${organizationId}/list`,
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

// 接口加密详情页-表单
export const detailFormDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'encryCode',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.encryption.code').d('加密编码'),
      },
      {
        name: 'encryName',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.common.encryption.name').d('加密名称'),
      },
      {
        name: 'applicationNameLov',
        required: true,
        label: intl.get('hitf.application.model.application.name').d('应用名称'),
        type: FieldType.object,
        lovCode: 'HITF.OPEN_APPLICATION_QUERY_BY_NAME',
        textField: 'applicationName',
        valueField: 'applicationHeaderId',
        ignore: FieldIgnore.always,
      },
      {
        name: 'applicationId',
        type: FieldType.string,
        bind: 'applicationNameLov.applicationHeaderId',
      },
      {
        name: 'applicationName',
        type: FieldType.string,
        bind: 'applicationNameLov.applicationName',
      },
      {
        name: 'status',
        required: true,
        type: FieldType.string,
        label: intl.get('hzero.common.status').d('状态'),
        lookupCode: 'HITF.OPEN_ENCRY_STATUS',
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: intl.get('hitf.application.remark').d('备注'),
      },
    ],
  };
};

// 接口加密详情页-表格
export const detailTableDS = (encryHeaderId): DataSetProps => {
  return {
    autoQuery: Boolean(encryHeaderId),
    fields: [
      {
        name: 'interfaceCode',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.interfaceCode').d('接口编码'),
      },
      {
        name: 'interfaceName',
        type: FieldType.string,
        label: intl.get('hitf.application.model.application.interfaceName').d('接口名称'),
      },
      {
        name: 'interfaceTypeMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.interfaceType').d('接口类型'),
      },
      {
        name: 'interfaceCategoryMeaning',
        type: FieldType.string,
        label: intl.get('hitf.common.api.type').d('API类别'),
      },
      {
        name: 'encryLineId',
        type: FieldType.string,
        label: intl.get('hitf.common.encryption.config').d('接口加密配置维护'),
      },
    ],
    transport: {
      read: ({ data, params }) => {
        const { page, size } = params;
        const { queryParams = {} } = data;
        const queryParam = filterNullValueObject(queryParams);
        return {
          url: `${HZERO_HITF}/v1/open-interface-encry-lines/${organizationId}/list`,
          method: 'GET',
          data: {
            page,
            size,
            ...queryParam,
            encryHeaderId,
          },
        };
      },
    },
  };
};

// 接口加密详情页-配置弹窗
export const detailModalDS = (): DataSetProps => {
  return {
    autoCreate: true,
    fields: [
      {
        name: 'encryDirection',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.services.model.services.encryptDirection').d('加密方向'),
        lookupCode: 'HITF.OPEN_ENCRY_DIRECTION',
      },
      {
        name: 'encryMethod',
        required: true,
        type: FieldType.string,
        label: intl.get('hitf.services.model.services.encryptAlgorithm').d('加密算法'),
        lookupCode: 'HITF.OPEN_ENCRY_METHOD',
      },
      {
        name: 'encryLineId',
      },
      {
        name: 'publicKey',
        type: FieldType.string,
        label: intl.get('hitf.services.model.encryption.public.key').d('加密公钥'),
        dynamicProps: {
          required: ({ record }) => {
            return record.get('encryMethod') && record.get('encryMethod') !== 'BASE64';
          },
        },
      },
      {
        name: 'privateKey',
        type: FieldType.string,
        label: intl.get('hitf.services.model.encryption.private.key').d('加密私钥'),
      },
      {
        name: 'inStatus',
        type: FieldType.boolean,
        label: intl.get('hzero.common.enabledFlag').d('是否启用'),
      },
      {
        name: 'outStatus',
        type: FieldType.boolean,
        label: intl.get('hzero.common.enabledFlag').d('是否启用'),
      },
    ],
  };
};
