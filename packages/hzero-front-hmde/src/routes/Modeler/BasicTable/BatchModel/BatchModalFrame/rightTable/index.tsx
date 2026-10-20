import React, { FC } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { TableColumnTooltip, ColumnAlign } from 'choerodon-ui/pro/lib/table/enum';

import globalStyles from '@/lowcodeGlobalStyles/global.less';

const { Column } = Table;
interface IIndex {
  rightMenuDs: DataSet;
}
const Index: FC<IIndex> = observer(({ rightMenuDs }) => (
  <Table
    dataSet={rightMenuDs}
    rowHeight={30}
    style={{ height: '1rem' }}
    className={globalStyles['table-style']}
  >
    <Column
      name="serviceCode"
      width={150}
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    />
    <Column
      name="schemaName"
      width={200}
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    />
    <Column
      name="tableName"
      width={180}
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    />
    <Column
      name="modelName"
      width={150}
      editor
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    />
    <Column
      name="modelCode"
      width={150}
      editor
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    />
    <Column
      name="modelDescription"
      width={180}
      editor
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    />
    {/* <Column
      name="type"
      width={180}
      editor
      align={ColumnAlign.left}
      tooltip={TableColumnTooltip.overflow}
    /> */}
  </Table>
));
export default Index;
