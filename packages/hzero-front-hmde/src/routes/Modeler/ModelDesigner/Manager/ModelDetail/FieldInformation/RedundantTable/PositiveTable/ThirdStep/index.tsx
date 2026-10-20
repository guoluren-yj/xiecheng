/*
 * @filename:
 * @Date: 2020-03-18 12:39:27
 * @Author: 汪渊  <yuan.wang07@hand-china.com>
 * @version: 1.0.0
 * @copyright: copyright: HAND ® 2020
 */
import React, { useEffect, FC } from 'react';
import { DataSet, Table, Select, Button } from 'choerodon-ui/pro';
import { ColumnAlign, TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react-lite';

import ImgIcon from '@/utils/ImgIcon';
import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { indexType } from '@/routes/Modeler/ModelDesigner/utils/selectType';

const { Option } = Select;
const { Column } = Table;

enum ETableType {
  OWNER = 'OWNER',
  REFERENCE = 'REFERENCE',
}
let nameArr: any[] | undefined = [];
interface IIndex {
  indexTableDataSet: DataSet;
  tableId: string | number | null;
  secondData: any[] | undefined;
  lockStatus: boolean;
  tableType: string | null;
  secondQuery: any[];
}
const Index: FC<IIndex> = observer(
  ({ indexTableDataSet, tableId, secondData, lockStatus, tableType, secondQuery }) => {
    const editorFlag =
      tableType === ETableType.OWNER || (tableType === ETableType.REFERENCE && !lockStatus); // 是否可编辑
    useEffect(() => {
      if (tableId) {
        indexTableDataSet.query().then((res) => {
          if (!res?.failed) {
            // 匹配索引字段中的相较于第二步表字段更改后的字段名
            const arr = res.map((item) => ({
              ...item,
              columnNameList: item.columnNameList.map((columnName) => {
                const { code } = secondQuery.find(({ name }) => name === columnName) || {};
                if (
                  code &&
                  secondData?.find(({ code: _code }) => code === _code)?.name !== columnName
                ) {
                  return secondData?.find(({ code: _code }) => code === _code)?.name;
                } else {
                  return columnName;
                }
              }),
            }));
            indexTableDataSet.loadData(arr);
          }
        });
      }
    }, [tableId]);
    useEffect(() => {
      indexTableDataSet.forEach((ele) => {
        if (ele.get('keyword')) {
          Object.assign(ele, { selectable: false });
        }
      });
    }, [indexTableDataSet.data.length]);

    /**
     * 索引字段编辑框
     */
    const indexFieldSelect = () => {
      nameArr = secondData;
      return (
        <Select
          multiple
          searchable
          clearButton={false}
          name="columnNameList"
          searchMatcher={searchMatcher}
        >
          {(nameArr || [])
            .filter((i) => i.primaryFlag !== 1)
            .map((item) => (
              <Option value={item.name} key={item.name}>
                {item.name}
              </Option>
            ))}
        </Select>
      );
    };

    const buttons = [
      <Button
        disabled={!editorFlag || indexTableDataSet.currentSelected.length === 0}
        onClick={() => indexTableDataSet.delete(indexTableDataSet.selected)}
        key="delete"
      >
        <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
        批量删除
      </Button>,
      <Button
        disabled={!editorFlag}
        icon="add"
        onClick={() => indexTableDataSet.create({}, 0)}
        key="add"
      >
        添加扩展表索引
      </Button>,
    ];
    return (
      <div>
        <Table
          className={globalStyles['table-style']}
          dataSet={indexTableDataSet}
          rowHeight={30}
          buttons={buttons}
        >
          <Column
            tooltip={TableColumnTooltip.overflow}
            name="indexName"
            editor={(record) => editorFlag && !record.get('keyword')}
            align={ColumnAlign.center}
          />
          <Column
            name="columnNameList"
            tooltip={TableColumnTooltip.overflow}
            align={ColumnAlign.center}
            editor={(record) => {
              if (!editorFlag) return false;
              if (record.get('keyword') || record.get('primaryFlag') === 1) {
                return false;
              }
              return indexFieldSelect();
            }}
          />
          <Column
            name="indexType"
            align={ColumnAlign.center}
            tooltip={TableColumnTooltip.overflow}
            editor={(record) => {
              if (!editorFlag) return false;
              if (record.get('keyword') || record.get('primaryFlag') === 1) {
                return false;
              }
              return (
                <Select searchMatcher={searchMatcher}>
                  {indexType.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              );
            }}
          />
        </Table>
      </div>
    );
  }
);
export default Index;
