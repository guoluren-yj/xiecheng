import React, { useMemo } from 'react';
import { DataSet, Form, TextField, Button } from 'choerodon-ui/pro';

import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form.d';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { ButtonColor } from 'choerodon-ui/pro/lib/button/enum';

import styles from '../../index.less';

interface ISearchForm {
  handleSearch: (val: string) => void;
  serviceCode: string;
  schemaName: string;
  dataSourceType: string;
}
export default function SearchForm(props: ISearchForm) {
  const formDs = useMemo(
    () =>
      new DataSet({
        data: [
          {
            serviceCode: props.serviceCode,
            schemaName: `${props.schemaName}${props.dataSourceType}`,
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
            label: '数据源',
            name: 'schemaName',
            type: 'string' as FieldType,
            required: true,
          },
          {
            label: '基础表名',
            name: 'tableName',
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
        columns={3}
        labelWidth={70}
      >
        <TextField disabled name="serviceCode" />
        <TextField disabled name="schemaName" />
        <TextField name="tableName" />
      </Form>
      <Button
        color={ButtonColor.primary}
        style={{ marginLeft: 8 }}
        onClick={() => {
          props.handleSearch(formDs?.current?.get('tableName'));
        }}
      >
        查询
      </Button>
    </div>
  );
}
