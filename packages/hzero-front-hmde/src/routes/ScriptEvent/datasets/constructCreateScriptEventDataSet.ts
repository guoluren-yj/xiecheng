import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { createScriptPageUrl, copyScriptPageUrl } from '@/services/scriptEventService';
import intl from 'hzero-front/lib/utils/intl';
import { CODE } from 'utils/regExp';
import { DSTF } from '@/utils/common';

export default function constructTableDataSet() {
  const material: DataSetProps = {
    autoCreate: true,

    fields: [
      {
        name: 'code',
        type: FieldType.string,
        label: '脚本编码',
        required: true,
        pattern: CODE,
        defaultValidationMessages: {
          patternMismatch: intl
            .get('hzero.common.validation.code')
            .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
        },
        maxLength: 50,
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
      submit: ({ data, dataSet }) => {
        const record = data[0];
        const { isCreate } = dataSet?.current?.get('params');
        return {
          url: isCreate ? `${createScriptPageUrl}` : `${copyScriptPageUrl(record.id)}`,
          method: 'post',
          data: {
            scriptCode: record.code,
            scriptName: record.scriptName,
            tenantId: record.tenant.tenantId,
            remark: record.remark,
            enabledFlag: record.enabled,
            _tls: record._tls,
          },
        };
      },
    },
  };

  return new DataSet(material);
}
