import // Button,
// DataSet,
// Form,
// TextField,
'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import { renderForm } from './renderUtils';

function BaseInfo(props) {
  const { readOnly, dataSet, lineDs } = props;

  const fields = [
    {
      name: 'applyCode',
      readOnly,
    },
    {
      name: 'applyType',
      fieldType: 'Select',
      readOnly,
      disabled: lineDs.totalCount > 0,
    },
    {
      name: 'applyStatus',
      fieldType: 'Select',
      readOnly,
    },
    {
      name: 'supplier',
      fieldType: 'Lov',
      readOnly,
      disabled: lineDs.totalCount > 0,
    },
    {
      name: 'applyUserName',
      readOnly,
    },
    {
      name: 'creationDate',
      fieldType: 'DateTimePicker',
      readOnly,
    },
    {
      name: 'remark',
      fieldType: 'TextArea',
      readOnly,
      rowSpan: 2,
      colSpan: 2,
      maxLength: 100,
    },
  ];

  return renderForm(dataSet, fields, readOnly);
}

export default observer(BaseInfo);
