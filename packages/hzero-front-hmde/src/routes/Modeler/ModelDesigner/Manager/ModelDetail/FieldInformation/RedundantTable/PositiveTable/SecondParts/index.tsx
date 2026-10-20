import React, { useEffect, useState, FC } from 'react';
import { DataSet, Table, Button, NumberField, Select, TextField } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { TableColumnTooltip, ColumnAlign, TableEditMode } from 'choerodon-ui/pro/lib/table/enum';

import ImgIcon from '@/utils/ImgIcon';
import { EWhoFieldsList } from '@/globalData/modelManager';
import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { getSelectType } from '@/routes/Modeler/ModelDesigner/utils/selectType';

import styles from '../index.less';

const { Option } = Select;
const { Column } = Table;
const redNameList = ['REDUNDANT_ID', 'REDUNDANT_RELATION_TABLE', 'REDUNDANT_RELATION_KEY']; // 扩展字段
const whoNameList = [
  'LAST_UPDATE_DATE',
  'LAST_UPDATED_BY',
  'CREATION_DATE',
  'CREATED_BY',
  'OBJECT_VERSION_NUMBER',
]; // who字段
enum ETableType {
  OWNER = 'OWNER',
  REFERENCE = 'REFERENCE',
}
enum EValueObj {
  readOnly = 'readOnly',
  select = 'select',
  number = 'number',
  float = 'float',
}
interface IIndex {
  fieldTableDataSet: DataSet;
  tableId: string | number | null;
  refDataSourceType: string;
  tableType: string | null;
  lockStatus: boolean;
  setLockStatus: any;
  setSecondQuery: any;
}
const Index: FC<IIndex> = observer(
  ({
    fieldTableDataSet,
    tableId,
    refDataSourceType,
    tableType,
    lockStatus,
    setLockStatus,
    setSecondQuery,
  }) => {
    const editorFlag =
      tableType === ETableType.OWNER || (tableType === ETableType.REFERENCE && !lockStatus); // 是否可编辑
    useEffect(() => {
      if (tableId) {
        if (fieldTableDataSet.data.length === 0) {
          fieldTableDataSet.query().then((res) => {
            if (!res?.failed) {
              setSecondQuery(res);
            }
          });
        }
      }
    }, [tableId]);
    useEffect(() => {
      // 设置扩展字段和who字段不可选
      fieldTableDataSet.forEach((ele) => {
        if (ele.get('keyword')) {
          Object.assign(ele, { selectable: false });
        }
      });
    }, [fieldTableDataSet.data.length, tableId]);

    const defaultValueEditColumn = (record: Record) => {
      if (!editorFlag) return false;
      const defaultValueObj = (record.get('typeCascade') || {}).defaultValue || {};
      if (
        record.get('defaultValueDisabled') ||
        defaultValueObj.type === EValueObj.readOnly ||
        redNameList.includes(record.get('name')) ||
        whoNameList.includes(record.get('name'))
      ) {
        return false;
      }
      if (defaultValueObj.style === EValueObj.select) {
        if (record.get('type') === 'DATE') {
          return (
            <Select name="defaultValue" searchMatcher={searchMatcher}>
              {[{ key: 'CURRENT_TIMESTAMP', value: 'CURRENT_TIMESTAMP' }].map((item) => (
                <Option key={item.key} value={item.key}>
                  {item.value}
                </Option>
              ))}
            </Select>
          );
        }
        return (
          <Select name="defaultValue" searchMatcher={searchMatcher}>
            {(defaultValueObj.optionArr || []).map((item) => (
              <Option key={item.key} value={item.key}>
                {item.value}
              </Option>
            ))}
          </Select>
        );
      }
      if (defaultValueObj.style === EValueObj.number) {
        return <NumberField step={1} />;
      }
      if (defaultValueObj.style === EValueObj.float) {
        return <NumberField />;
      }
      return true;
    };

    // 字段类型枚举
    const typeSelect = getSelectType(refDataSourceType);

    const [visible, setVisible] = useState(false);

    const content = (
      <div className={styles['popover-content-contain']}>
        <p>
          <ImgIcon name="tips@2x.png" size={12} />
          解锁提示
        </p>
        <div>
          新建/编辑/删除
          扩展表字段将会全量更新基础扩展表结构，基于该扩展表的其他相关模型扩展字段数据将均会受到影响。
        </div>
        <div>确认要解锁吗?</div>
        <div className={styles['button-control']}>
          <Button onClick={() => setVisible(false)}>取消</Button>
          <Button
            color={ButtonColor.primary}
            onClick={() => {
              setVisible(false);
              setLockStatus(false);
            }}
          >
            确认
          </Button>
        </div>
      </div>
    );

    const buttons = [
      tableType === 'REFERENCE' && editorFlag ? (
        <Button key="unlock" className={styles['table-button-style']}>
          <ImgIcon name="unlock@2x.png" size={12} />
          已解锁
        </Button>
      ) : (
        <></>
      ),
      tableType === 'REFERENCE' && !editorFlag ? (
        <Popover
          visible={visible}
          content={content}
          trigger="click"
          placement="bottomRight"
          onVisibleChange={(val) => setVisible(val)}
        >
          <Button funcType={FuncType.flat} key="lock" className={styles['table-button-style']}>
            <ImgIcon name="Unlocking-hzero.svg" size={14} style={{ marginRight: '4px' }} />
            解锁编辑
          </Button>
        </Popover>
      ) : (
        <></>
      ),
      <Button
        disabled={!editorFlag || fieldTableDataSet.currentSelected.length === 0}
        onClick={async () => {
          const createData: any[] = [];
          // 使用唯一 ID 做区分
          const selectIdList = fieldTableDataSet.selected.map((item: any) => item?.id);
          fieldTableDataSet.created.forEach((item: any) => {
            if (!selectIdList.includes(item?.id)) {
              createData.push(item.toData()); // 转化为普通数据
            }
          });
          await fieldTableDataSet.delete(fieldTableDataSet.selected);
          if (tableId) {
            // 自建扩展表不需要查询
            await fieldTableDataSet.query();
            createData.forEach((item) => fieldTableDataSet.create(item, 0));
          }
        }}
        key="delete"
      >
        <ImgIcon name="batch-operation@v4.0.svg" size={16} style={{ marginRight: '5px' }} />
        批量删除
      </Button>,
      <Button
        icon="add"
        onClick={() => {
          fieldTableDataSet.create({}, 0);
        }}
        key="add"
        disabled={!editorFlag}
      >
        添加扩展表字段
      </Button>,
    ];
    return (
      <Table
        rowHeight={30}
        editMode={TableEditMode.cell} // 批量编辑
        dataSet={fieldTableDataSet}
        className={globalStyles['table-style']}
        buttons={buttons}
      >
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="name"
          width={180}
          editor={(record) => editorFlag && !record.get('keyword') && <TextField />}
          align={ColumnAlign.left}
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="type"
          width={160}
          align={ColumnAlign.left}
          editor={(record) =>
            editorFlag &&
            !record.get('keyword') &&
            !record.get('typeDisabled') && (
              <Select searchable clearButton={false} name="type" searchMatcher={searchMatcher}>
                {typeSelect.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.meaning}
                  </Option>
                ))}
              </Select>
            )
          }
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="description"
          width={160}
          editor={(record) => editorFlag && !record.get('keyword')}
          align={ColumnAlign.left}
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="dataSize"
          width={120}
          align={ColumnAlign.left}
          editor={(record) => {
            if (!editorFlag) return false;
            if (
              [EWhoFieldsList.TENANT_ID].includes(record.get('name')) ||
              ((record.get('typeCascade') || {}).dataSize || {}).type === 'readOnly' ||
              record.get('keyword')
            ) {
              return record.get('dataSize');
            }
            return <NumberField step={1} />;
          }}
        />
        <Column
          name="decimalDigits"
          width={120}
          align={ColumnAlign.left}
          tooltip={TableColumnTooltip.overflow}
          editor={(record) => {
            if (!editorFlag) return false;
            if (
              ((record.get('typeCascade') || {}).decimalDigits || {}).type === 'readOnly' ||
              record.get('keyword')
            ) {
              return record.get('decimalDigits');
            }
            return <NumberField step={1} />;
          }}
        />
        <Column
          tooltip={TableColumnTooltip.overflow}
          name="defaultValue"
          width={120}
          align={ColumnAlign.left}
          editor={defaultValueEditColumn}
        />
        <Column
          name="requiredFlag"
          width={120}
          editor={(record) =>
            editorFlag && !record.get('keyword') && record.get('primaryFlag') !== 1
          }
        />
        <Column name="primaryFlag" width={70} editor={false} />
      </Table>
    );
  }
);
export default Index;
