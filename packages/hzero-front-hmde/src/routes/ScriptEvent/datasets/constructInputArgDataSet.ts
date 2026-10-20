import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default function constructInputArgDataSet() {
  const material: DataSetProps = {
    paging: false,
    selection: false,
    parentField: 'parentId',
    idField: 'id',

    fields: [
      {
        name: 'code',
        type: FieldType.string,
        label: '编码',
        required: true,
      },
      {
        name: 'type',
        type: FieldType.string,
        label: '类型',
        required: true,
      },
      {
        name: 'remark',
        type: FieldType.string,
        label: '描述',
        // required: true,
      },
    ],
  };

  return new DataSet(material);
}
