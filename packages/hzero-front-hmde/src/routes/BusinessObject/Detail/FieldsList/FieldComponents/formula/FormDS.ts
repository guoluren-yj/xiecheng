import intl from 'hzero-front/lib/utils/intl';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

export default () =>
  ({
    autoCreate: true,
    fields: [
      {
        name: 'field',
        type: 'string',
        label: intl.get('hmde.bo.field.formula.field').d('字段'),
      },
      {
        name: 'logic',
        type: 'string',
        label: intl.get('hmde.bo.field.formula.operator').d('运算符'),
      },
      {
        name: 'fun',
        type: 'string',
        label: intl.get('hmde.bo.field.formula.function').d('函数'),
      },
    ],
  } as DataSetProps);
