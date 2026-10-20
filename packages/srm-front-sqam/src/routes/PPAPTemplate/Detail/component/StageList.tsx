// 交付物配置
import React, { Fragment, useMemo, useContext, useCallback, useEffect } from 'react';
import { Select, Table } from 'choerodon-ui/pro';
import { TableButtonType, SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import type { TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';
import { observer } from 'mobx-react';
import { yesOrNoRender } from 'utils/renderer';

import { Store } from '../stores/StoreProvider';
import type { StoreValueType } from '../stores/StoreProvider';
import { getSelectedNegActConfirmMsg } from '../../../../utils/utils';
// import { filterDsDestroyed } from '../../utils/utils';

const StageList = () => {
  const { viewFlag, stageLineDs, headerDs, customizeTable } = useContext<StoreValueType>(Store);

  useEffect(() => {
    stageLineDs.query();
  }, [stageLineDs]);

  const stageCloseTypeOptionsFilter = useCallback((option: any, record: any) => {
    if (Number(record?.get('noDocumentStageFlag')) === 1) {
      return option?.get('value') !== 'DOC_COMPLETED';
    } else {
      return true;
    }
  }, []);

  const columns: any = useMemo(() => {
    return [
      {
        name: 'sequence',
        editor: !viewFlag,
        width: 120,
        align: 'left',
      },
      {
        name: 'stageNum',
        editor: !viewFlag,
        width: 120,
      },
      {
        name: 'stageName',
        editor: !viewFlag,
        width: 150,
      },
      {
        name: 'stageOpenType',
        editor: !viewFlag,
        width: 150,
      },
      {
        name: 'accessSupplierFlag',
        editor: !viewFlag,
        renderer: ({ value }) => viewFlag && yesOrNoRender(Number(value)),
        width: 150,
      },
      {
        name: 'stageCloseType',
        editor: (record) =>
          !viewFlag ? <Select optionsFilter={(option) => stageCloseTypeOptionsFilter(option, record)} /> : false,
        width: 150,
      },
      {
        name: 'closeApproveMethod',
        editor: !viewFlag,
        width: 220,
      },
      {
        name: 'closeApproveType',
        editor: !viewFlag,
        width: 220,
      },
      {
        name: 'roleNumLov',
        editor: !viewFlag,
        width: 220,
      },
      {
        name: 'noDocumentStageFlag',
        editor: !viewFlag,
        renderer: ({ value }) => viewFlag && yesOrNoRender(Number(value)),
        width: 100,
      },
      {
        name: 'documentLov',
        editor: !viewFlag,
        width: 240,
      },
      {
        name: 'supplyFlag',
        editor: !viewFlag,
        renderer: ({ value }) => viewFlag && yesOrNoRender(Number(value)),
        width: 100,
      },
    ];
  }, [viewFlag, stageCloseTypeOptionsFilter]);

  // 向下新增避免序号反转
  const handleAddLine = useCallback(() => {
    const len = stageLineDs.filter((v) => v?.get('_status') === 'create')?.length || 0; // 新增的数
    const { totalCount = 0 } = stageLineDs; // 现有的总数
    stageLineDs.create({ templateId: headerDs.current?.get('templateId'), sequence: len + totalCount + 1, _status: 'create' }, -1);
  }, [stageLineDs, headerDs]);

  // 删除行时清空无法回写的数据
  const handleDeleteLine = useCallback(async () => {
    const { selected } = stageLineDs;
    const res = await stageLineDs.delete(selected, getSelectedNegActConfirmMsg('delete', stageLineDs));
    if (!res) return;
    stageLineDs.query(undefined, undefined, true);
  }, [stageLineDs]);

  const buttons = useMemo(() => {
    return viewFlag ?
      [] :
      [
        [TableButtonType.add, { onClick: handleAddLine }] as [TableButtonType, TableButtonProps],
        [TableButtonType.delete, { onClick: handleDeleteLine, icon: 'delete_sweep' }] as [TableButtonType, TableButtonProps],
      ];
  }, [viewFlag, handleAddLine, handleDeleteLine]);

  return (
    <Fragment>
      {customizeTable(
        { code: 'SQAM.PPAP_DELIVERY_TEMP_DEFINITION_DETAIL.STAGE_LIST' },
        <Table
          columns={columns}
          buttons={buttons}
          dataSet={stageLineDs}
          selectionMode={viewFlag ? SelectionMode.none : SelectionMode.rowbox}
          style={{ maxHeight: `calc(100vh - 280px)` }}
        />
      )}
    </Fragment>

  );
};

export default observer(StageList);
