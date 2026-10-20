import intl from 'hzero-front/lib/utils/intl';
import { FieldType, FieldIgnore } from 'choerodon-ui/pro/lib/data-set/enum';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { normalField } from 'srm-front-boot/lib/components/FilterBarTable/util';
import request from 'hzero-front/lib/utils/request';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import { SRM_ADAPTOR } from 'srm-front-boot/lib/utils/config';

const SRM_SIFC = '/sifc';
const tenantFlag = isTenantRoleLevel();
const requestUrlPre = tenantFlag ? `${SRM_ADAPTOR}/v1/${getCurrentOrganizationId()}` : `${SRM_ADAPTOR}/v1`;

const tableData = (): DataSetProps => ({
  forceValidate: true,
  fields: [
    {
      name: 'functionCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.functionCode`).d('方法编码'),
    },
    {
      name: 'functionName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.functionName`).d('方法名称'),
    },
    {
      name: 'functionTypeMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.functionTypeMeaning`).d('方法类型'),
    },
    {
      name: 'applyFieldTypesMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.applyFieldTypesMeaning`).d('适用字段类型'),
    },
    {
      name: 'tenantName',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.tenantId`).d('所属租户'),
    },
    {
      name: 'belongsToMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.belongsToMeaning`).d('归属'),
    },
    {
      name: 'enabledFlagMeaning',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.enabledFlagMeaning`).d('启用状态'),
    },
  ],

  queryFields: [
    {
      name: 'nameOrCode',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.nameOrCode`).d('对象名称/编码'),
      display: true,
      merge: true,
    },
    {
      name: 'tenantId',
      type: FieldType.object,
      lovCode: 'SITF.EXT_ITF_TENANT',
      display: true,
      valueField: 'tenantId',
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.tenantId`).d('所属租户'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_ENABLED',
      display: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.enabledFlagMeaning`).d('启用状态'),
    },
  ] as normalField[],

  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/function-library/page`,
        method: 'GET',
      };
    },
  },
});

const headerData = (): DataSetProps => ({
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'functionCode',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.functionCode`).d('方法编码'),
      format: 'uppercase',
      validator: (value) => {
        const pattern = /[A-Z0-9][A-Z0-9-_./]/g;
        if(pattern.test(value)) {
          return true;
        } else {
          return intl.get('scux.externalInterfaceDefinition.view.message.code').d('只能输入大写字母、数字以及特殊字符【- _ . /】')
        }
      },
    },
    {
      name: 'functionName',
      type: FieldType.intl,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.functionName`).d('方法名称'),
    },
    {
      name: 'tenantNameLov',
      type: FieldType.object,
      lovCode: 'SITF.EXT_ITF_TENANT',
      required: true,
      ignore: FieldIgnore.always,
      textField: 'tenantName',
      valueField: 'tenantNum',
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.tenantName`).d('所属租户'),
    },
    {
      name: 'tenantId',
      bind: 'tenantNameLov.tenantId',
    },
    {
      name: 'tenantName',
      bind: 'tenantNameLov.tenantName',
    },
    {
      name: 'functionType',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.EXT_ITF_FUNCTION_TYPE',
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.functionType`).d('类型'),
    },
    {
      name: 'applyFieldTypes',
      type: FieldType.string,
      required: true,
      lookupCode: 'SITF.EXT_ITF_FIELD_TYPE',
      multiple: ',',
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.applyFieldTypes`).d('适用字段类型'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.remark`).d('说明'),
    },
    {
      name: 'enabledFlag',
      type: FieldType.string,
      lookupCode: 'SITF.EXT_ITF_ENABLED',
      required: true,
      defaultValue: '1',
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.enabledFlag`).d('启用状态'),
    },
  ],
})

const inputData = (): DataSetProps => ({
  forceValidate: true,
  paging: false,
  fields: [
    {
      name: 'columnCode',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.columnCode`).d('输入字段编码'),
    },
    {
      name: 'columnName',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.columnName`).d('输入字段描述'),
    },
    {
      name: 'columnType',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.columnType`).d('输入字段类型'),
      lookupCode: 'SITF.EXT_ITF_FIELD_TYPE',
    },
    {
      name: 'nullable',
      type: FieldType.boolean,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.nullable`).d('是否必输'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'type',
      type: FieldType.string,
      defaultValue: 'INPUT',
    }
  ],

  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/function-library/detail?type=INPUT`,
        method: 'GET',
      };
    },
  },
});

const outputData = (): DataSetProps => ({
  forceValidate: true,
  paging: false,
  fields: [
    {
      name: 'columnCode',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.columnCode.out`).d('输出字段编码'),
    },
    {
      name: 'columnName',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.columnName.out`).d('输出字段描述'),
    },
    {
      name: 'columnType',
      type: FieldType.string,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.columnType.out`).d('输出字段类型'),
      lookupCode: 'SITF.EXT_ITF_FIELD_TYPE',
    },
    {
      name: 'nullable',
      type: FieldType.boolean,
      required: true,
      label: intl.get(`scux.interfaceMethodLibrary.model.interfaceMethodLibrary.nullable.out`).d('是否必输'),
      trueValue: 1,
      falseValue: 0,
      defaultValue: 1,
    },
    {
      name: 'type',
      type: FieldType.string,
      defaultValue: 'OUTPUT',
    }
  ],

  transport: {
    read: () => {
      return {
        url: `${SRM_SIFC}/v1/function-library/detail?type=OUTPUT`,
        method: 'GET',
      };
    },
  },
});

export {tableData, headerData, inputData, outputData};

export async function fetchCreate(params) {
  return request(`${SRM_SIFC}/v1/function-library/create`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchUpdate(params) {
  return request(`${SRM_SIFC}/v1/function-library/update`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDisable(params) {
  return request(`${SRM_SIFC}/v1/function-library/disable`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchEnable(params) {
  return request(`${SRM_SIFC}/v1/function-library/enable`, {
    method: 'POST',
    body: params,
  });
}

export async function fetchDelete(params) {
  return request(`${SRM_SIFC}/v1/function-library/deleteDetail`, {
    method: 'DELETE',
    body: params,
  });
}

export async function fetchSave(params) {
  return request(`${SRM_SIFC}/v1/function-library/create/detail`, {
    method: 'POST',
    body: params,
  });
}

export async function getComplementaryWordsService() {
  return request(`${requestUrlPre}/adaptor-script/auto-prompt`, {
    method: 'GET',
    responseType: 'text',
  });
}

export async function fetchMarmotSave(params) {
  return request(`${SRM_SIFC}/v1/function-library/updateScript`, {
    method: 'POST',
    body: params
  });
}