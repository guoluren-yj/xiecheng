import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default function constructDebuggerInputDataSet() {
  const material: DataSetProps = {
    autoCreate: true,

    fields: [
      {
        name: 'debuggerInput',
        type: FieldType.string,
        label: '调试器输入',
        defaultValue: '',
      },
    ],
  };

  return new DataSet(material);
}
