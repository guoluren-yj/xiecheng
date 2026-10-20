import React, { useContext, useMemo, useCallback } from 'react';
import { Table } from 'choerodon-ui/pro';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import { Store } from '../../stores';
import { StatementLineCodeMap } from '../../../utils/type';
import { statusTagRender } from '../../../../../components/StatusTag';
import { getSelectedNegActConfirmMsg } from '../../../../../utils/utils';

const StatementLineOfflineInfo = () => {
  const {
    boolMap,
    headerDs,
    customizeTable,
    statementLineDs,
  } = useContext(Store);

  const columns = useMemo(() => {
    return [
      { name: 'lineNum', width: 200 },
      { name: 'payTypeName', width: 200 },
      { name: 'payFormMeaning', width: 200 },
      { name: 'payStatus', width: 200, renderer: statusTagRender },
      { name: 'payAmount', width: 200, editor: boolMap.editFlag },
    ];
  }, [boolMap]);

  const handleAddLine = useCallback(() => {
    statementLineDs.create({ amountPrecision: headerDs.current?.get('amountPrecision') }, 0);
  }, [headerDs, statementLineDs]);

  const handleDeleteLine = useCallback(async () => {
    const deleteRes = await statementLineDs.delete(statementLineDs.selected, getSelectedNegActConfirmMsg('delete', statementLineDs));
    if (!deleteRes) return;
    headerDs.query(undefined, undefined, true);
  }, [headerDs, statementLineDs]);

  const buttons = useMemo<Buttons[]>(() => boolMap.editFlag ? [
    [TableButtonType.add, { onClick: handleAddLine }],
    [TableButtonType.delete, { onClick: handleDeleteLine }],
  ] : [], [
    boolMap,
    handleAddLine,
    handleDeleteLine,
  ]);


  return customizeTable({
    code: StatementLineCodeMap.OfflineGrid,
    readOnly: !boolMap.editFlag,
  }, (
    <Table
      columns={columns}
      buttons={buttons}
      dataSet={statementLineDs}
      style={{ maxHeight: 430 }}
    />
  ));
};

export default StatementLineOfflineInfo;