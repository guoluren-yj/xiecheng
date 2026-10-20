import React, { useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';
import { useTable } from './hooks';

const modelPrompt = 'sodr.sendOrder.model.common';

const OperateTable = function OperateTable(props) {
  const { dataSet, poHeaderId, organizationId } = props;
  const columns = useMemo(
    () => [
      {
        title: intl.get(`${modelPrompt}.statusChangeRecord`).d('状态变更记录'),
        children: [
          {
            name: 'processUserName',
            width: 80,
          },
          {
            name: 'processedDate',
            width: 150,
          },
          {
            name: 'processTypeMeaning',
            width: 80,
          },
          {
            name: 'processRemark',
            width: 150,
          },
          {
            name: 'versionNum',
            width: 80,
          },
        ],
      },
      {
        title: intl.get(`${modelPrompt}.dataChangeRecord`).d('数据变更记录'),
        children: [
          {
            name: 'changeTypeMeaning',
            width: 80,
          },
          {
            name: 'displayLineNum',
            width: 80,
          },
          {
            name: 'displayLineLocationNum',
            width: 90,
          },
          {
            name: 'changeFieldNameMeaning',
            width: 100,
          },
          {
            name: 'oldValue',
            width: 80,
          },
          {
            name: 'newValue',
            width: 80,
          },
        ],
      },
    ],
    []
  );
  const buttons = useMemo(
    () => [
      <div key="export" style={{ textAlign: 'right' }}>
        <ExcelExport
          otherButtonProps={{
            icon: 'export',
            type: 'primary',
          }}
          requestUrl={`${SRM_SPUC}/v1/${organizationId}/po-process-actions/${poHeaderId}/export`}
          queryParams={() => ({
            ...dataSet.queryDataSet.current?.toData(),
            tenantId: organizationId,
            poHeaderId,
          })}
        />
      </div>,
    ],
    [organizationId, poHeaderId, dataSet]
  );
  return useTable(dataSet, columns, { buttons });
};

export default observer(OperateTable);
