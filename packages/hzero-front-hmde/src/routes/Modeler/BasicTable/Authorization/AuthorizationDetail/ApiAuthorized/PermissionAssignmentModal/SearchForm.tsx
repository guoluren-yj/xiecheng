import React, { useMemo } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';

import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import styles from './index.less';

interface ISearchForm {
  handleSearch: (val: string) => void;
  serviceCode: string | number;
  apiMethod: string;
  description: string;
  apiPath: string;
}
export default function SearchForm(props: ISearchForm) {
  const formDs = useMemo(
    () =>
      new DataSet({
        data: [
          {
            serviceCode: props.serviceCode,
          },
        ],
        fields: [
          {
            label: '服务',
            name: 'serviceCode',
            type: 'string' as FieldType,
            required: true,
          },
          {
            label: 'API',
            name: 'apiPath',
            type: 'string' as FieldType,
            required: false,
          },
          {
            label: 'API描述',
            name: 'description',
            type: 'string' as FieldType,
            required: false,
          },
          {
            label: '请求方式',
            name: 'apiMethod',
            type: 'string' as FieldType,
            required: false,
          },
        ],
      }),
    []
  );

  return (
    <div className={styles['search-form-wrapper']}>
      <Form
        dataSet={formDs}
        labelLayout={'horizontal' as LabelLayoutType}
        columns={4}
        labelWidth={70}
      >
        <TextField disabled name="serviceCode" />
        <TextField name="apiPath" />
        <TextField name="description" />
        <TextField name="apiMethod" />
      </Form>
      <Button
        color={ButtonColor.primary}
        style={{ marginLeft: 8 }}
        onClick={() => {
          props.handleSearch(formDs?.current?.toData());
        }}
      >
        查询
      </Button>
    </div>
  );
}
