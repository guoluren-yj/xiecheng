import React, { memo, useEffect, useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { TableBoxSizing } from 'choerodon-ui/pro/lib/table/enum';
import indexDataSet, {lineDataColumns} from "@/components/CustomWrapperDs";
import { fetchLineChange, columns } from './methods';

interface IProps {
  fromPoLineLocationId?: string;
  nodeConfigId?: string;
  campKey?: string;
  remote?: {
    process: Function,
  }
}

const ModalTable = ({ fromPoLineLocationId, nodeConfigId, campKey, remote }:IProps) => {
  const indexDs = useMemo(() => new DataSet(remote ? remote.process('ASN_PLAN_LINE_DS', indexDataSet({
    componentData: columns,
    read: fetchLineChange,
    selection: false,
    pageSize: 20,
    paging: true,
  })) :indexDataSet({
    componentData: columns,
    read: fetchLineChange,
    selection: false,
    pageSize: 20,
    paging: true,
  })), [nodeConfigId]);

  useEffect(() => {
    indexDs.setQueryParameter('params', {
      nodeConfigId: nodeConfigId || null,
      fromPoLineLocationId,
      campKey,
    });
    indexDs.query();
  }, [nodeConfigId]);

  return (
    <div style={{ height: 'calc(100vh - 160px)' }}>
      <Table
        virtual
        virtualCell
        columns={remote ?
          remote.process('ASN_PLAN_LINE_COLUMNS', lineDataColumns(columns)) :
          lineDataColumns(columns)}
        dataSet={indexDs}
        boxSizing={TableBoxSizing.wrapper}
        style={{ maxHeight: `calc(100% - 25px)` }}
        customizable
        customizedCode="new-strategy-receiptManageConfig-workbench"
      />
    </div>
  );
};

export default memo(ModalTable);