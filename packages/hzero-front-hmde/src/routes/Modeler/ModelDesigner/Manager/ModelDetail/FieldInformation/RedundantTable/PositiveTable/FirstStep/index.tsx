/*
 * @filename:
 * @Date: 2020-04-08 13:07:42
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useEffect, FC } from 'react';
import { DataSet, Form, TextField, TextArea, Select } from 'choerodon-ui/pro';
import { LabelLayoutType } from 'choerodon-ui/pro/lib/form/Form';

import styles from '../index.less';

interface IIndex {
  modelId: string | number | null;
  baseTableDataSet: DataSet;
  redundantTableName: string | null;
}
const Index: FC<IIndex> = ({ modelId, baseTableDataSet, redundantTableName }) => {
  useEffect(() => {
    if (modelId && redundantTableName) {
      baseTableDataSet.query();
    }
  }, [modelId]);
  return (
    <div className={`${styles.input} ${styles['first-step']}`}>
      <Form labelLayout={'vertical' as LabelLayoutType} dataSet={baseTableDataSet}>
        <TextField name="name" disabled={!!redundantTableName} />
        <Select name="redundantMode" clearButton={false} disabled={!!redundantTableName} />
        <TextArea name="description" editor />
      </Form>
    </div>
  );
};
export default Index;
