import React from 'react';
import { Form } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import FormField from '@/routes/components/FormField';

import '../index.less';

const style = { width: '75%', maxWidth: 1172 };

const ScoreSumInfo = observer(
  ({ dataSet, isEdit, customizeForm, custLoading, customizeCode, customizeReadOnly }) => {
    const formColumns = [
      {
        name: 'respUserName',
        componentType: 'TextField',
      },
      {
        name: 'userDepartmentName',
        componentType: 'TextField',
      },
      {
        name: 'sumScore',
        componentType: 'TextField',
      },
      {
        name: 'siteLocation',
        componentType: 'TextField',
      },
      {
        name: 'respUserRemark',
        componentType: 'TEXTAREA',
        newLine: true,
        rows: 3,
        cols: 2,
        colSpan: 2,
        resize: 'vertical',
      },
    ];

    return customizeForm(
      {
        readOnly: customizeReadOnly,
        code: customizeCode,
      },
      <Form
        columns={3}
        style={style}
        dataSet={dataSet}
        custLoading={custLoading}
        labelLayout={isEdit ? 'float' : 'vertical'}
        className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
      >
        {formColumns.map(props => {
          return <FormField key={props.name} isEdit={isEdit} {...props} />;
        })}
      </Form>
    );
  }
);

export default ScoreSumInfo;
