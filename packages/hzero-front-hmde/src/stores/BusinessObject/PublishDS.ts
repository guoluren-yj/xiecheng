import intl from 'srm-front-boot/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

const publishDS = () =>
  ({
    autoQuery: false,
    autoCreate: false,
    selection: 'multiple',
    paging: false,
    fields: [
      {
        name: 'index',
        type: 'string',
        label: intl.get('hmde.bo.publish.index').d('编辑'),
      },
      {
        name: 'businessObjectFieldName',
        label: intl.get('hmde.bo.field.name').d('字段名称'),
        type: 'string',
      },
      {
        name: 'businessObjectFieldId',
        type: 'string',
      },
      {
        name: 'businessObjectId',
        type: 'string',
      },
      {
        name: 'businessValue',
        type: 'string',
        label: intl.get('hmde.bo.publish.businessValue').d('业务对象值'),
      },
      {
        name: 'propertyType',
        type: 'string',
        label: intl.get('hmde.bo.publish.propertyType').d('属性名称'),
        lookupCode: 'HMDE.BUSINESS_OBJECT.VERIFY_TYPE',
        textField: 'meaning',
        valueField: 'value',
      },
      {
        name: 'errorCode',
        type: 'string',
      },
      {
        name: 'errorLevel',
        type: 'string',
      },
      {
        name: 'message',
        type: 'string',
        label: intl.get('hmde.bo.publish.message').d('警告原因'),
      },
      {
        name: 'physicsValue',
        type: 'string',
        label: intl.get('hmde.bo.publish.physicsValue').d('物理模型值'),
      },
    ],
  } as DataSetProps);

export { publishDS };
