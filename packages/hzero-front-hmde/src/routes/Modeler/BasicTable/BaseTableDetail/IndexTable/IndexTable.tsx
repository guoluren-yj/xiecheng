/* eslint-disable react/jsx-indent */
/*
 * @filename:
 * @Date: 2021-04-01
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2021
 */
import React, { useState, useContext, useMemo, useEffect, useImperativeHandle, FC } from 'react';
import { observer } from 'mobx-react-lite';
import { Select, Table, Button, DataSet } from 'choerodon-ui/pro';
import {
  TableColumnTooltip,
  ColumnAlign,
  TableQueryBarType,
  TableEditMode,
} from 'choerodon-ui/pro/lib/table/enum';

import ImgIcon from '@/utils/ImgIcon';
import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { indexType } from '@/routes/Modeler/ModelDesigner/utils/selectType';
import Store, { IBaseTableList } from '@/routes/Modeler/BasicTable/stores';

import IndexDataSet from '../store/IndexDataSet';
import styles from '../index.less';

const { Option } = Select;
const { Column } = Table;

enum EKey {
  indexTable = 'indexTable',
}

interface IIndexTable {
  columnNameList?: string[];
  status: string;
  tableType?: string;
  activeTabKey: string;
}
const IndexTable: FC<IIndexTable> = observer(
  ({ columnNameList = [], status = 'edit', tableType, activeTabKey }) => {
    const {
      ref: { indexTableDetailRef },
      storeData: { tableId, tableName, refreshNum, editTableFlag },
      setCurrentDs,
    }: IBaseTableList = useContext<IBaseTableList>(Store as any).store;
    const indexDataSet: DataSet = useMemo(
      () => new DataSet(IndexDataSet(tableId, tableName, tableType)),
      [tableId, tableName, tableType]
    );
    setCurrentDs(indexDataSet); // 将ds存储进store里，用于切换tab页时的校验
    const [isEditAll, setIsEditAll] = useState<boolean>(false);
    useImperativeHandle(indexTableDetailRef, () => ({
      indexTableDetailRefresh: () => {
        indexDataSet.query();
      },
    }));

    useEffect(() => {
      if (activeTabKey !== 'indexTab') return;
      indexDataSet.query(); // 查询
      setIsEditAll(false);
    }, [tableName, activeTabKey, refreshNum]);

    const buttons =
      status === 'edit'
        ? [
            <Button hidden={!editTableFlag} onClick={() => handleAdd()} key="edit">
              <ImgIcon name="create-new@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
              新增
            </Button>,
            <Button
              hidden={!editTableFlag}
              disabled={indexDataSet.selected.length === 0}
              onClick={() => indexDataSet.delete(indexDataSet.selected)}
              key="delete"
            >
              <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
              批量删除
            </Button>,
            <Button
              hidden={!editTableFlag}
              disabled={indexDataSet.toData().length === 0}
              onClick={() => handleEditAll()}
              key="poEdit"
            >
              <ImgIcon name="edit@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
              {isEditAll ? '取消' : '批量编辑'}
            </Button>,
          ]
        : [<Button hidden />];
    if (isEditAll) {
      buttons.push(
        <Button icon="save" onClick={() => saveAll()} key="save">
          保存
        </Button>
      );
    } else if (status === 'edit') {
      buttons.splice(3, 1);
    }

    /**
     * 索引字段编辑框
     */
    const indexFieldSelect = () => (
      <Select
        multiple
        searchable
        clearButton={false}
        name="indexField"
        searchMatcher={searchMatcher}
      >
        {columnNameList.map((item) => (
          <Option value={item} key={item}>
            {item}
          </Option>
        ))}
      </Select>
    );

    /**
     * 新增
     */
    const handleAdd = async () => {
      if (!isEditAll) {
        setIsEditAll(true);
      }
      indexDataSet.create({}, 0); // 新增
    };

    /**
     * 批量编辑
     */
    const handleEditAll = () => {
      setIsEditAll(!isEditAll);
      if (isEditAll) {
        indexDataSet.query();
        // indexDataSet.reset(); // 重置
      }
    };

    /**
     * 批量保存
     */
    const saveAll = async () => {
      const val: boolean = await indexDataSet.validate();
      if (val) {
        const res = await indexDataSet.submit();
        if (res && res.failed) return;
        setIsEditAll(false);
      }
    };

    return (
      <>
        <Table
          key={EKey.indexTable}
          className={`${styles.tableDetailContain} ${styles.table} ${styles.btnFloatRight} ${globalStyles['table-style']} ${globalStyles['header-border-no']}`}
          dataSet={indexDataSet}
          rowHeight={30}
          queryBar={TableQueryBarType.none}
          editMode={TableEditMode.cell} // 批量编辑
          buttons={buttons}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="indexName"
            editor={(record) =>
              !record.get('_token') || // 新增的数据可以编辑
              (isEditAll && !record.get('disabled') ? true : record.get('indexName'))
            }
            align={ColumnAlign.left}
          />
          <Column
            name="columnNameList"
            tooltip={TableColumnTooltip.overflow}
            align={ColumnAlign.left}
            editor={(record) =>
              isEditAll && record.get('primaryFlag') !== 1 && !record.get('disabled')
                ? indexFieldSelect()
                : record.get('indexName')
            }
          />
          <Column
            name="indexType"
            align={ColumnAlign.left}
            tooltip={TableColumnTooltip.overflow}
            editor={(record) =>
              isEditAll && record.get('primaryFlag') !== 1 && !record.get('disabled') ? (
                <Select searchMatcher={searchMatcher}>
                  {indexType.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              ) : (
                record.get('indexName')
              )
            }
          />
        </Table>
      </>
    );
  }
);
export default IndexTable;
