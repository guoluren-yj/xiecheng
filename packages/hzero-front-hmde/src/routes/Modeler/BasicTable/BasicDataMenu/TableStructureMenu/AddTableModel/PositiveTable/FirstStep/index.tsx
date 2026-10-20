import React from 'react';
import { DataSet, Form, TextField, TextArea, Select } from 'choerodon-ui/pro';
import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form';

import Lov from '@/components/LowcodeLov';

import styles from '../index.less';

interface IIndex {
  baseTableDataSet: DataSet;
  serviceCode: string | undefined;
}
export default ({ baseTableDataSet, serviceCode }: IIndex) => (
  <div className={styles['first-step']}>
    <Form labelLayout={'vertical' as LabelLayoutType} columns={1} dataSet={baseTableDataSet}>
      {!serviceCode && <Lov name="service" clearButton={false} noCache />}
      {!serviceCode && <Select name="source" clearButton={false} />}
      <TextField name="name" />
      <TextArea name="description" />
    </Form>
  </div>
);
