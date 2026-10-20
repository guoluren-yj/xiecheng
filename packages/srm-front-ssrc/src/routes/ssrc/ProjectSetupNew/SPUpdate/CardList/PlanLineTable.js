import React, { useContext, useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { isEmpty, noop } from 'lodash';

import { StoreContext } from '../store/StoreProvider';

// 标段/包信息
const planLineTable = observer((props) => {
  const { handleSetOperateLoading = noop } = props;

  const { commonDs: { planLineTableDs } = {}, customizeTable, getCustomizeUnitCode } = useContext(
    StoreContext
  );

  const columns = [
    {
      name: 'projectLinePlanNum',
    },
    {
      name: 'projectStage',
      editor: true,
    },
    {
      name: 'planCompleteDate',
      editor: true,
    },
  ];

  // 批量删除
  const handleBatchDeletePlan = () => {
    const selectedRecords = planLineTableDs?.selected || [];
    const addRecords = selectedRecords?.filter((r) => r.status === 'add') || [];
    const oldRecords = selectedRecords?.filter((r) => r.get('projectLinePlanId')) || [];

    // 删除新增数据
    planLineTableDs.remove(addRecords);

    if (!isEmpty(oldRecords)) {
      handleSetOperateLoading(true);
      // 删除线上数据
      planLineTableDs
        .delete(oldRecords, {
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl
            .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
            .d('确认删除选中行？'),
        })
        .then(async (res) => {
          if (getResponse(res)) {
            try {
              // 刷新标段表格 & 保留缓存的变更数据
              await planLineTableDs.query(undefined, undefined, true);
            } catch (err) {
              handleSetOperateLoading(false);
              throw err;
            }
          }
          handleSetOperateLoading(false);
        })
        .finally(() => {
          handleSetOperateLoading(false);
        });
    }
  };

  // 批量删除按钮、复制禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !planLineTableDs ||
      !planLineTableDs.selected?.length ||
      (!planLineTableDs.length && !planLineTableDs.cachedRecords?.length) ||
      planLineTableDs?.status === 'loading'
    );
  }, [
    planLineTableDs?.selected,
    planLineTableDs.length,
    planLineTableDs.cachedRecords?.length,
    planLineTableDs?.status,
  ]);

  // 新增
  const handleAdd = () => {
    planLineTableDs.create({}, 0);
  };

  // table buttons
  const buttons = useMemo(
    () => [
      <Button name="add" funcType="flat" icon="playlist_add" onClick={handleAdd}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        name="delete"
        funcType="flat"
        icon="delete_sweep"
        onClick={handleBatchDeletePlan}
        disabled={batchDisabledFlag}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </Button>,
    ],
    [batchDisabledFlag, handleAdd, handleBatchDeletePlan]
  );

  return customizeTable(
    {
      code: getCustomizeUnitCode('projectPlanTable'),
      buttonCode: getCustomizeUnitCode('projectPlanTableBtn'),
    },
    <Table
      dataSet={planLineTableDs}
      columns={columns}
      buttons={buttons}
      style={{ maxHeight: '4.5rem' }}
    />
  );
});

export default planLineTable;
