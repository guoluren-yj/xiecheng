import React, { useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import ExcelExport from 'components/ExcelExport';
import { SRM_SPUC } from '_utils/config';
import { useDataSet, Table } from 'choerodon-ui/pro';

import { operationRecordDS } from './stores/OrderLineInfoDS';

const modelPrompt = 'sodr.sendOrder.model.common';

const OperateTable = function OperateTable(props) {
  const { poHeaderId, organizationId } = props;

  const operationRecordDs = useDataSet(() => operationRecordDS({ poHeaderId }));

  let needLoadFlag = true;
  const rowCombineArr = [];

  useEffect(() => {
    operationRecordDs.query();
    operationRecordDs.addEventListener('load', handleLoad);
    return () => {
      operationRecordDs.removeEventListener('load', handleLoad);
    };
  }, []);

  const handleLoad = ({ dataSet }) => {
    if (dataSet.records.length === 0) return;
    if (needLoadFlag) {
      needLoadFlag = false;
      transformData(dataSet);
    } else {
      needLoadFlag = true;
    }
  };

  const transformData = (ds) => {
    const data = ds.toData();
    // let currentName = null;
    // let repeatNum = 0;
    // let repeatStart = 0;
    // for (let i = 0; i < data.length; i++) {
    //   const record = data[i];
    //   // 根据name进行合并
    //   const { processUserName } = record;
    //   if (currentName === null) {
    //     currentName = processUserName;
    //     repeatNum = 1;
    //     repeatStart = i;
    //     rowCombineArr[repeatStart] = 1;
    //   } else if (currentName === processUserName) {
    //     rowCombineArr[i] = 0;
    //     repeatNum++;
    //   } else {
    //     currentName = null;
    //     rowCombineArr[repeatStart] = repeatNum;
    //     repeatNum = 0;
    //     i--;
    //   }
    //   if (i === data.length - 1) {
    //     rowCombineArr[repeatStart] = repeatNum;
    //   }
    // }
    ds.loadData(data);
  };

  const columns = useMemo(
    () => [
      {
        title: intl.get(`${modelPrompt}.statusChangeRecord`).d('状态变更记录'),
        children: [
          {
            name: 'processUserName',
            width: 80,
            onCell({ record }) {
              const { index } = record;
              const rowSpan = rowCombineArr[index];
              return {
                rowSpan,
                hidden: rowSpan === 0,
              };
            },
          },
          {
            name: 'processedDate',
            width: 150,
          },
          {
            name: 'processTypeMeaning',
            width: 80,
            onCell({ record }) {
              const { index } = record;
              const rowSpan = rowCombineArr[index];
              return {
                rowSpan,
                hidden: rowSpan === 0,
              };
            },
          },
          {
            name: 'processRemark',
            width: 150,
            onCell({ record }) {
              const { index } = record;
              const rowSpan = rowCombineArr[index];
              return {
                rowSpan,
                hidden: rowSpan === 0,
              };
            },
          },
          {
            name: 'versionNum',
            width: 80,
            onCell({ record }) {
              const { index } = record;
              const rowSpan = rowCombineArr[index];
              return {
                rowSpan,
                hidden: rowSpan === 0,
              };
            },
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
            ...operationRecordDs.queryDataSet.current?.toData(),
            tenantId: organizationId,
            poHeaderId,
          })}
        />
      </div>,
    ],
    [organizationId, poHeaderId, operationRecordDs]
  );
  return (
    <Table
      columns={columns}
      dataSet={operationRecordDs}
      buttons={buttons}
      style={{ maxHeight: 300 }}
    />
  );
};

export default observer(OperateTable);
