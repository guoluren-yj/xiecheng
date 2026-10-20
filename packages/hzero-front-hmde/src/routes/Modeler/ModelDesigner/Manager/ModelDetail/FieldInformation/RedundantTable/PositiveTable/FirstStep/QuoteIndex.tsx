/*
 * @filename:
 * @Date: 2020-04-03 23:43:55
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useEffect } from 'react';
import { DataSet, Form, Select } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import Lov from '@/components/LowcodeLov';

import styles from '../index.less';

const { Option } = Select;

interface IVal {
  id: number;
  dataSourceType: string;
  name: string;
}
interface IQuoteIndex {
  modelId: string | number | null;
  quoteIndexDataSet: DataSet;
  baseTableDataSet: DataSet;
  onChangeTable: (val: IVal | null) => void;
  redundantTableName: string | null;
}
export default ({
  modelId,
  quoteIndexDataSet,
  baseTableDataSet,
  onChangeTable,
  redundantTableName,
}: IQuoteIndex) => {
  useEffect(() => {
    if (modelId && redundantTableName) {
      quoteIndexDataSet.query();
    }
  }, []);
  return (
    <div className={`${styles.input} ${styles['first-step']}`}>
      <Form labelLayout={LabelLayout.vertical} columns={1} dataSet={quoteIndexDataSet}>
        <Select searchable searchMatcher="name" name="dataSourceType" value="TABLE" disabled>
          <Option value="TABLE">数据表</Option>
        </Select>
        <Lov
          name="reFTable"
          noCache
          onChange={(val) => {
            baseTableDataSet.reset();
            onChangeTable(val);
          }}
        />
      </Form>
    </div>
  );
};
