import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import {
  createScriptPageUrl,
  saveScriptPageUrl,
  getScriptDetailUrl,
  getScripParamUrl,
} from '@/services/scriptUtilityService';
import { DSTF } from '@/utils/common';

// 服务埋点脚本的出入参
export function constructScripParamDataSet() {
  const material: DataSetProps = {
    autoCreate: false,
    fields: [
      {
        name: 'scriptCode',
        type: FieldType.string,
        label: '脚本编码',
      },
      {
        name: 'scriptInputParam',
        type: FieldType.string,
        label: '入参',
      },
      {
        name: 'scriptOutputParam',
        type: FieldType.string,
        label: '出参',
      },
      {
        name: 'scriptTypeCode',
        type: FieldType.string,
        label: '编码类型',
      },
    ],

    transport: {
      read: ({ data }) => {
        return {
          url: `${getScripParamUrl}`,
          method: 'GET',
          query: data,
        };
      },
    },
  };

  return new DataSet(material);
}

// 出入参
export function constructParamDataSet() {
  const material: DataSetProps = {
    autoCreate: false,
    parentField: 'parentId',
    idField: 'id',
    paging: false,
    fields: [
      {
        name: 'code',
        type: FieldType.string,
        label: '参数编码',
      },
      {
        name: 'type',
        type: FieldType.string,
        label: '参数类型',
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: '描述',
      },
    ],
  };

  return new DataSet(material);
}

// 创建或修改服务埋点
export function constructSaveScriptUtilityDataSet() {
  const material: DataSetProps = {
    autoCreate: false,
    fields: [
      {
        name: 'servicePointCode',
        type: FieldType.string,
        label: '埋点任务',
      },
      {
        name: 'serviceName',
        type: FieldType.string,
        label: '所属服务',
      },
      {
        name: 'objectVersionNumber',
        type: FieldType.string,
      },
      {
        name: 'tenant',
        type: FieldType.object,
        label: '所属租户',
        lovCode: 'HPFM.TENANT',
        valueField: 'tenantId',
        textField: 'tenantName',
        ignore: 'always',
        required: true,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: 'tenant.tenantId',
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        bind: 'tenant.tenantName',
      },
      {
        name: 'servicePointDesc',
        type: FieldType.string,
        label: '描述',
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        label: '启用',
        defaultValue: 1,
        ...DSTF,
      },
    ],

    transport: {
      submit: (args) => {
        const record = args.data[0];
        return {
          ...saveScriptPageUrl,
          data: {
            tenantId: record.tenantId,
            tenantName: record.tenantName,
            servicePointDesc: record.servicePointDesc,
            serviceName: record.serviceName,
            enabledFlag: record.enabledFlag || 1,
            servicePointCode: record.servicePointCode,
            objectVersionNumber: record.objectVersionNumber,
          },
        };
      },
    },
  };

  return new DataSet(material);
}

// 创建或修改服务埋点
export function constructEidtScriptUtilityDataSet() {
  const material: any = {
    autoCreate: false,
    fields: [
      {
        name: 'servicePointCode',
        type: FieldType.string,
        label: '埋点任务',
      },
      {
        name: 'serviceName',
        type: FieldType.string,
        label: '所属服务',
      },
      {
        name: 'tenant',
        type: FieldType.object,
        label: '所属租户',
        lovCode: 'HPFM.TENANT',
        valueField: 'tenantId',
        textField: 'tenantName',
        ignore: 'always',
        required: true,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        bind: 'tenant.tenantId',
      },
      {
        name: 'tenantName',
        type: FieldType.string,
        bind: 'tenant.tenantName',
      },
      {
        name: 'enabledFlag',
        type: FieldType.boolean,
        label: '启用',
        defaultValue: 1,
        ...DSTF,
      },
      {
        name: 'pointScriptDesc',
        type: FieldType.string,
        label: '描述',
      },

      {
        name: 'scriptTypeCode',
        type: FieldType.string,
        label: '类型',
        lookupCode: 'HMDE.SCRIPT_TYPE',
        required: true,
      },
      {
        name: 'script',
        type: FieldType.object,
        label: '脚本',
        lovCode: 'HMDE.EVENT_SCRIPT',
        dynamicProps: {
          lovPara: ({ record }) => ({
            tenantId: record.get('tenant')?.tenantId,
            scriptTypeCode: record.get('scriptTypeCode'),
          }),
        },
        valueField: 'scriptCode',
        textField: 'scriptName',
        ignore: 'always',
        required: true,
      },
      {
        name: 'scriptCode',
        type: FieldType.string,
        label: '脚本编码',
        bind: 'script.scriptCode',
      },
      {
        name: 'scriptName',
        type: FieldType.string,
        label: '脚本名称',
        bind: 'script.scriptName',
      },
      {
        name: 'scriptCurrentVersion',
        type: FieldType.string,
        label: '当前版本',
        bind: 'script.scriptCurrentVersion',
      },
      {
        name: 'scriptRemark',
        type: FieldType.string,
        label: '脚本描述',
        bind: 'script.scriptRemark',
      },
    ],

    transport: {
      read: ({ data }) => {
        if (!data.pointScriptId) return;
        return {
          url: `${getScriptDetailUrl}/${data.pointScriptId}`,
          method: 'GET',
        };
      },
      submit: (args) => {
        const record = args.data[0];

        return {
          ...createScriptPageUrl,
          data: {
            scriptTypeCode: record.scriptTypeCode,
            scriptCode: record.scriptCode,
            scriptName: record.scriptName,
            scriptCurrentVersion: record.scriptCurrentVersion,
            scriptRemark: record.scriptRemark,
            tenantId: record.tenantId,
            enabledFlag: record.enabledFlag === undefined ? 1 : record.enabledFlag,
            servicePointId: args.dataSet.getState('servicePointId'),
            pointScriptId: record.pointScriptId,
            tenantName: record.tenantName,
            servicePointCode: record.servicePointCode,
            serviceName: record.serviceName,
            pointScriptDesc: record.pointScriptDesc,
            _token: record._token,
            objectVersionNumber: record.objectVersionNumber,
          },
        };
      },
    },
  };

  return new DataSet(material);
}
