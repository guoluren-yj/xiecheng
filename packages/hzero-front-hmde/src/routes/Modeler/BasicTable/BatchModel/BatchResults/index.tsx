/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { useEffect, useMemo, FC } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';
import { runInAction } from 'mobx';
import { TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';

import globalStyles from '@/lowcodeGlobalStyles/global.less';

import BatchResultTableDs from './BatchResultTableDs';
import styles from '../../global.less';

const { Column } = Table;

interface IShowResults {
  success: boolean;
  data: model.TableToModelVO[];
}
interface INodeData {
  grade: string;
  type: string;
  name: string;
  id: string | number;
  schemaName?: string;
  dataSourceType?: string;
}
interface IIndex {
  showResults: IShowResults | undefined;
  tableObj: INodeData | undefined;
}
const Index: FC<IIndex> = ({ showResults, tableObj }) => {
  const batchResultTableDs: DataSet = useMemo(() => new DataSet(BatchResultTableDs() as any), []);
  useEffect(() => {
    if (!(showResults as IShowResults).success) {
      batchResultTableDs.removeAll();
      runInAction(() => {
        (showResults as IShowResults).data.forEach((item) => {
          batchResultTableDs.create(item);
        });
      });
    }
  }, [showResults]);

  return (
    <section className={globalStyles['model-body']}>
      <div
        style={{
          padding: '0.12rem 0',
          fontSize: '16px',
        }}
      >
        <span
          style={{
            // display: 'inline-block',
            paddingRight: '5px',
          }}
        >
          {!(showResults as IShowResults).success ? (
            <Icon type="cancel" style={{ color: '#FF4141' }} />
          ) : (
            <Icon type="check_circle" style={{ color: '#44CE6E' }} />
          )}
        </span>
        <span
          style={{
            fontWeight: 'bold',
          }}
        >
          {!(showResults as IShowResults).success ? '生成逻辑模型失败' : '生成逻辑模型成功'}
        </span>
      </div>
      {!(showResults as IShowResults).success && (
        <div className={styles.table}>
          <Table dataSet={batchResultTableDs}>
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="serviceCode"
              width={200}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="schemaName"
              width={200}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="tableName"
              width={150}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="modelName"
              width={150}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="modelDescription"
              width={150}
              align={ColumnAlign.left}
            />
            <Column
              tooltip={TableColumnTooltip.overflow}
              name="cause"
              width={200}
              align={ColumnAlign.left}
            />
          </Table>
        </div>
      )}
      {!(showResults as IShowResults).success ? (
        <div
          style={{
            margin: '10px 0',
          }}
        >
          {!tableObj && <>其他表均生成逻辑模型成功！可进入模型设计器内查看模型详情</>}
        </div>
      ) : (
        <div
          style={{
            margin: '30px',
          }}
        >
          表生成逻辑模型成功！可进入模型设计器内查看模型详情
        </div>
      )}
    </section>
  );
};
export default Index;
