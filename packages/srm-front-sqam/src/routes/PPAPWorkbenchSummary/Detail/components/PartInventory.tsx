// 零件列表
import React, { Fragment, useMemo, useContext, useCallback } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import { stringify } from 'querystring';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import { DetailProjectPartDetailCode, TagColor } from '../../utils/type';
import Process from '../../../PPAPWorkbench/List/components/Process';


const PartInventory = () => {
  const { partInventoryDs, customizeTable, history, headerDs } = useContext<StoreValueType>(Store);

  const handleClickNum = useCallback((record) => {
    const { projectHeaderId, projectType } = record?.get(['projectHeaderId', 'projectType']) || [];
    const fromId = headerDs.current?.get('projectHeaderId');
    history.push({
      pathname: `/sqam/PPAPWorkbench/detail/${projectHeaderId}`,
      search: stringify({ operate: 'view', projectType, fromId }),
    });
  }, [history, headerDs]);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'itemCode',
      },
      {
        name: 'projectNum',
        renderer: ({ value, record }) => (
          <Button
            funcType={FuncType.link}
            color={ButtonColor.primary}
            style={{ userSelect: 'text' }}
            onClick={() => handleClickNum(record)}
          >
            {value}
          </Button>
        ),
      },
      {
        name: 'itemName',
      },
      {
        name: 'projectStatusMeaning',
        renderer: ({ value, record }) => (
          <StatusTag value={value} flag color={TagColor[record?.get('projectStatus')] || 'success'} />
        ),
      },
      {
        name: 'stageProcess',
        tooltip: 'none',
        renderer: ({ record }) => (
          <Process hide={record?.get('projectStatus') === 'NEW'} stageProcess={record?.get('stageProcess')} />
        ),
        width: 350,
      },
      {
        name: 'hisItemFlag',
        width: 180,
      },
    ];
  }, [handleClickNum]);

  return (
    <Fragment>
      {customizeTable(
        { code: DetailProjectPartDetailCode },
        <Table
          columns={columns}
          dataSet={partInventoryDs}
          selectionMode={SelectionMode.none}
          style={{ maxHeight: 430 }}
        />
      )}
    </Fragment>

  );
};

export default observer(PartInventory);
