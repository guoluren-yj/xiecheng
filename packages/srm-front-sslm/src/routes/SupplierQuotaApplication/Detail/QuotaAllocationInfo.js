/*
 * 配额分配信息
 * @Date: 2024-01-03
 * @Author: zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2024, Hand
 */
import React, { useMemo } from 'react';
import { Table } from 'choerodon-ui/pro';

const Index = ({
  source,
  remote,
  dataSet,
  customizeTable,
  customizeUnitCode,
  customizeBtnGroupCode,
  custLoading,
  isEdit = false,
}) => {
  const columns = [
    {
      name: 'supplierNum',
      width: 200,
      displayField: 'companyNum',
      editor: isEdit,
    },
    {
      name: 'supplierName',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'erpSupplierNum',
      width: 200,
      editor: isEdit,
    },
    {
      name: 'quotaRatio',
      width: 180,
      editor: isEdit,
    },
    {
      name: 'orderSeq',
      width: 150,
      editor: isEdit,
    },
  ];
  const remoteColumns = remote
    ? remote.process('SSLM_SUP_QUOTA_APPLICATION_DEFINITION_AUOTA_ASIGN_COLUMNS', columns, {
        isEdit,
        source,
      })
    : columns;

  const buttons = useMemo(() => (isEdit ? ['add', 'delete'] : []), [isEdit]);
  const remoteButtons = remote
    ? remote.process('SSLM_SUP_QUOTA_APPLICATION_DEFINITION_AUOTA_ASIGN_BUTTONS', buttons, {
        isEdit,
        source,
      })
    : buttons;

  return customizeTable(
    {
      code: customizeUnitCode,
      buttonCode: customizeBtnGroupCode, // 行按钮个性化
    },
    <Table
      dataSet={dataSet}
      columns={remoteColumns}
      buttons={remoteButtons}
      custLoading={custLoading}
      selectionMode="rowbox"
      style={{ maxHeight: 'calc(100vh - 400px)' }}
    />
  );
};

export default Index;
