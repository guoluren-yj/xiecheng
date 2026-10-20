import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { DSTF } from '@/utils/common';
import { updateScriptAbstractService } from '@/services/scriptEventService';

export default function constructEditScriptEventDataSet() {
  const material: DataSetProps = {
    autoCreate: true,

    fields: [
      {
        name: 'code',
        type: FieldType.string,
        label: '脚本编码',
        required: true,
      },
      {
        name: 'scriptName',
        type: FieldType.intl,
        label: '脚本名称',
        required: true,
        maxLength: 30,
      },
      {
        name: 'tenant',
        type: FieldType.object,
        label: '所属租户',
        lovCode: 'HPFM.TENANT',
        required: true,
      },
      {
        name: 'tenantId',
        type: FieldType.string,
        label: '所属租户ID',
        required: true,
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: '描述',
        // required: true,
      },
      {
        name: 'enabled',
        type: FieldType.boolean,
        label: '是否启用',
        required: true,
        defaultValue: 1,
        ...DSTF,
      },
    ],

    transport: {
      submit: (args) => {
        const record = args.data[0];

        return {
          url: `${updateScriptAbstractService.url}`,
          method: updateScriptAbstractService.method,
          data: {
            scriptName: record.scriptName,
            scriptCode: record.code,
            scriptId: record.id,
            remark: record.remark,
            tenantName: record.tenant,
            tenantId: record.tenantId,
            enabledFlag: record.enabled,
            objectVersionNumber: record.objectVersionNumber,
            _token: record._token,
            _tls: record._tls,
          },
        };
      },
    },
  };

  const dataset = new DataSet(material);

  return dataset;
}
