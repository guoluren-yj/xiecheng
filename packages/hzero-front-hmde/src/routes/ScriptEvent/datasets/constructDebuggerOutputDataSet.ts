import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default function constructDebuggerOutputDataSet() {
  const material: DataSetProps = {
    autoCreate: true,

    fields: [
      {
        name: 'debuggerOutput',
        type: FieldType.string,
        label: '调试器输出',
        defaultValue: '',
      },
    ],
  };

  return new DataSet(material);
}
