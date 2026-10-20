import React from 'react';
import { DataSet, Table, NumberField, Select } from 'choerodon-ui/pro';
import Record from 'choerodon-ui/pro/lib/data-set/Record';
import { TableButtonType, TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';

import { searchMatcher } from '@/utils/common';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { getSelectType } from '@/routes/Modeler/ModelDesigner/utils/selectType';

const { Option } = Select;
const { Column } = Table;

interface IIndex {
  fieldTableDataSet: DataSet;
  dataSourceType: string | undefined;
}
interface ITypeSelect {
  value: string;
  meaning: string;
}
export default ({ fieldTableDataSet, dataSourceType }: IIndex) => {
  const typeSelect: ITypeSelect[] = getSelectType(dataSourceType);
  const buttons = [TableButtonType.add, TableButtonType.delete];

  const defaultValueEditColumn = (record: Record) => {
    const defaultValueObj = (record.get('typeCascade') || {}).defaultValue || {};
    if (
      record.get('defaultValueDisabled') ||
      defaultValueObj.type === 'readOnly' ||
      record.get('keyword')
    ) {
      return false;
    }
    if (defaultValueObj.style === 'select') {
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
    if (defaultValueObj.style === 'number') {
      return <NumberField step={1} />;
    }
    if (defaultValueObj.style === 'float') {
      return <NumberField />;
    }
    return true;
  };

  return (
    <Table
      buttons={buttons}
      rowHeight={30}
      className={`${globalStyles['table-style']}`}
      dataSet={fieldTableDataSet}
    >
      <Column
        tooltip={TableColumnTooltip.overflow}
        name="name"
        width={120}
        editor={(record) => !record.get('keyword')}
        align={ColumnAlign.left}
      />
      <Column
        tooltip={TableColumnTooltip.overflow}
        name="type"
        width={150}
        editor={(record) =>
          ['TENANT_ID'].includes(record.get('name')) ||
          record.get('typeDisabled') ||
          record.get('primaryFlag') ||
          record.get('keyword') ? (
            false
          ) : (
            <Select searchable clearButton={false} name="type" searchMatcher={searchMatcher}>
              {typeSelect.map((item) => (
                <Option key={item.value} value={item.value}>
                  {item.meaning}
                </Option>
              ))}
            </Select>
          )
        }
        align={ColumnAlign.left}
      />
      <Column
        tooltip={TableColumnTooltip.overflow}
        name="description"
        editor={(record) => !record.get('keyword')}
        align={ColumnAlign.left}
      />
      <Column
        tooltip={TableColumnTooltip.overflow}
        name="dataSize"
        width={100}
        editor={(record) =>
          record.get('primaryFlag') ||
          ['TENANT_ID'].includes(record.get('name')) ||
          ((record.get('typeCascade') || {}).dataSize || {}).type === 'readOnly' ||
          record.get('keyword') ? (
            false
          ) : (
            <NumberField step={1} />
          )
        }
        align={ColumnAlign.left}
      />
      <Column
        name="decimalDigits"
        editor={(record) =>
          record.get('primaryFlag') ||
          ((record.get('typeCascade') || {}).decimalDigits || {}).type === 'readOnly' ||
          record.get('keyword') ? (
            false
          ) : (
            <NumberField step={1} />
          )
        }
        width={100}
        align={ColumnAlign.left}
        tooltip={TableColumnTooltip.overflow}
      />
      <Column
        tooltip={TableColumnTooltip.overflow}
        name="defaultValue"
        width={120}
        editor={defaultValueEditColumn}
        align={ColumnAlign.left}
      />
      <Column
        name="requiredFlag"
        width={100}
        editor={(record) => record.get('primaryFlag') !== 1 && !record.get('keyword')}
      />
      <Column
        name="primaryFlag"
        width={70}
        editor={(record) => !['TENANT_ID'].includes(record.get('name')) && !record.get('keyword')}
      />
    </Table>
  );
};
