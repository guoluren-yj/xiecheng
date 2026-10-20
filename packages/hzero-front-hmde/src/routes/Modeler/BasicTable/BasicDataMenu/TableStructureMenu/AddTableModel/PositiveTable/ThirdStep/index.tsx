/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Select, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';

import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import ImgIcon from '@/utils/ImgIcon';

import styles from '../index.less';

const { Option } = Select;
const { Column } = Table;

// 索引类型枚举
const indexType = [
  {
    value: 'UNIQUE',
    meaning: 'UNIQUE',
  },
  {
    value: 'NORMAL',
    meaning: 'NORMAL',
  },
];

interface IIndex {
  indexTableDataSet: DataSet;
  fieldTableDataSet: DataSet;
}
export default observer(({ indexTableDataSet, fieldTableDataSet }: IIndex) => {
  /**
   * 索引字段编辑框
   */
  const nameArr: any[] = useMemo(
    () =>
      fieldTableDataSet
        ? fieldTableDataSet.toJSONData().filter((i: any) => i.primaryFlag !== 1) // fixme
        : [],
    [fieldTableDataSet]
  );

  useEffect(() => {
    const arr = indexTableDataSet.toData().map((item: any) => ({
      ...item,
      columnNameList: (item.columnNameList || []).map((columnName) => {
        const id = indexTableDataSet.getState(columnName);
        const { name } = nameArr?.find(({ __id }) => __id === id) || {};
        if (name && name !== columnName) {
          indexTableDataSet.setState(columnName, undefined);
          indexTableDataSet.setState(name, id);
          return name;
        } else {
          return columnName;
        }
      }),
    }));
    indexTableDataSet.loadData(arr);
  }, [fieldTableDataSet]);

  const indexFieldSelect = () => (
    <Select
      multiple
      searchable
      clearButton={false}
      searchMatcher={searchMatcher}
      onChange={(value) => {
        value.forEach((val) => {
          const { __id: id } = (fieldTableDataSet.toJSONData() as any).find(
            (record: any) => record?.name === val
          );
          indexTableDataSet.setState(val, id);
        });
      }}
      name="columnNameList"
    >
      {(nameArr || []).map((item: any) => (
        <Option value={item.name} key={item.name}>
          {item.name}
        </Option>
      ))}
    </Select>
  );

  /**
   * 删除一条记录
   */
  const handleTableDelete = () => {
    indexTableDataSet.delete(indexTableDataSet.currentSelected);
  };

  /**
   * 新增一条记录
   */
  const handleTableAdd = () => {
    indexTableDataSet.create({}, 0);
  };

  return (
    <div>
      <div className={styles['table-toolbar']}>
        <div />
        <div>
          <Button
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            disabled={indexTableDataSet.currentSelected.length === 0}
            onClick={handleTableDelete}
          >
            <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
            批量删除
          </Button>
          <Button
            funcType={FuncType.flat}
            color={ButtonColor.primary}
            icon="add"
            onClick={handleTableAdd}
          >
            添加索引
          </Button>
        </div>
      </div>
      <Table
        className={`${styles.tableDetailContain} ${globalStyles['table-style']}`}
        dataSet={indexTableDataSet}
        rowHeight={30}
      >
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="indexName"
          editor
          align={ColumnAlign.center}
        />
        <Column
          name="columnNameList"
          editor={(record) => (record.get('primaryFlag') !== 1 ? indexFieldSelect() : false)}
          tooltip={TableColumnTooltip.overflow}
          align={ColumnAlign.center}
        />
        <Column
          name="indexType"
          align={ColumnAlign.center}
          tooltip={TableColumnTooltip.overflow}
          editor={(record) =>
            record.get('primaryFlag') !== 1 ? (
              <Select searchMatcher={searchMatcher}>
                {indexType.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            ) : (
              false
            )
          }
        />
      </Table>
    </div>
  );
});
