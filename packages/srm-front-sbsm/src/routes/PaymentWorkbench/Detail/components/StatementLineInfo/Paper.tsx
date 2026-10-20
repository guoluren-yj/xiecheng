import React, { useCallback, useContext, useMemo } from 'react';
import { Table, useModal } from 'choerodon-ui/pro';
import type { Buttons } from 'choerodon-ui/pro/lib/table/Table';
import { SelectionMode, TableButtonType } from 'choerodon-ui/pro/lib/table/enum';

import intl from 'utils/intl';

import { Store } from '../../stores';
import QuoteBillPool from '../QuoteBillPool';
import { useModalOpen } from '../../../../../hooks';
import { StatementLineCodeMap } from '../../../utils/type';
import { getSelectedNegActConfirmMsg } from '../../../../../utils/utils';
import { statusTagRender } from '../../../../../components/StatusTag';

interface StatementLinePaperInfoProps {
  source?: 'approveEdit',
}

const StatementLinePaperInfo = (props: StatementLinePaperInfoProps) => {
  const { source } = props;
  const modalOpen = useModalOpen(useModal());
  const { boolMap, headerDs, statementLineDs, customizeTable } = useContext(Store);

  const columns = useMemo(() => {
    return [
      { name: 'lineNum', width: 150 },
      { name: 'payTypeName', width: 150 },
      { name: 'payFormMeaning', width: 150 },
      { name: 'paperNum', width: 150 },
      { name: 'dataSourceMeaning', width: 150 },
      { name: 'paperTypeMeaning', width: 150 },
      { name: 'paperStatus', width: 150 },
      { name: 'payAmount', width: 150 },
      { name: 'receiveBankName', width: 150 },
      { name: 'drawer', width: 150 },
      { name: 'acceptor', width: 150 },
      { name: 'payer', width: 150 },
      { name: 'invoiceDate', width: 150 },
      { name: 'issueDate', width: 150 },
      { name: 'draftsDeadLine', width: 150 },
      { name: 'payStatus', width: 200, renderer: statusTagRender },
    ];
  }, []);

  const handleAddLine = useCallback(() => {
    modalOpen({
      editFlag: true,
      size: 'large',
      title: intl.get('hzero.common.button.add').d('新增'),
      children: <QuoteBillPool />,
    });
  }, [modalOpen]);

  const handleDeleteLine = useCallback(async () => {
    const deleteRes = await statementLineDs.delete(statementLineDs.selected, getSelectedNegActConfirmMsg('delete', statementLineDs));
    if (!deleteRes) return;
    headerDs.query(undefined, undefined, true);
  }, [headerDs, statementLineDs]);

  const buttons = useMemo<Buttons[]>(() => boolMap.editFlag || source === 'approveEdit' ? [
    [TableButtonType.add, { onClick: handleAddLine }],
    [TableButtonType.delete, { onClick: handleDeleteLine }],
  ] : [], [
    source,
    boolMap,
    handleAddLine,
    handleDeleteLine,
  ]);

  return customizeTable({
    code: StatementLineCodeMap.PaperGrid,
  }, (
    <Table
      columns={columns}
      buttons={buttons}
      dataSet={statementLineDs}
      style={{ maxHeight: 430 }}
      selectionMode={(boolMap.editFlag || source === 'approveEdit')? SelectionMode.rowbox : SelectionMode.none}
    />
  ));
};

export default StatementLinePaperInfo;
