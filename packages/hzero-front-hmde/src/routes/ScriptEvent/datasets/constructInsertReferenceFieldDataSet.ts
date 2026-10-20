import { DataSet } from 'choerodon-ui/pro/lib';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';

export default function constructTableDataSet() {
  const material: DataSetProps = {
    autoCreate: true,

    fields: [
      {
        name: 'businessObject',
        type: FieldType.object,
        label: '业务对象',
        lovCode: 'HMDE.BUSINESS_OBJECT.SITE',
        required: true,
      },
      {
        name: 'field',
        type: FieldType.object,
        label: '字段',
        lovCode: 'HMDE.BUSINESS_OBJECT_FIELD_SITE',
        // required: true,
        cascadeMap: {
          businessObjectId: 'businessObject.businessObjectId',
        },
      },
    ],
  };

  return new DataSet(material);
}
