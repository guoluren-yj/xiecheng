import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { queryScriptDetailUrl } from '@/services/scriptEventService';

export default function constructScriptCodeDataSet() {
  const material: DataSetProps = {
    autoCreate: true,

    fields: [
      {
        name: 'scriptCode',
        type: FieldType.string,
        label: '脚本代码内容',
        defaultValue: '',
      },
    ],

    transport: {
      read: (args) => {
        const scriptId: string = args.dataSet?.getState('scriptId');

        return {
          url: `${queryScriptDetailUrl}/${scriptId}`,
          method: 'get',
          transformResponse: (rawResponse) => {
            const response = JSON.parse(rawResponse) as any;
            return response;
          },
        };
      },
    },
  };

  return new DataSet(material);
}
