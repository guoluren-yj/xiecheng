import React, { useMemo } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop, isFunction } from 'lodash';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

// 标段/包信息
const AllotMaterialModal = observer((props) => {
  const {
    customizeTable,
    getCustomizeUnitCode,
    allotMaterialDs,
    doubleUnitFlag,
    handleAddMaterial = noop,
    refreshHeaderAndTableData = noop,
  } = props;

  // 标红渲染
  const renderTextRed = ({ value, record }) => {
    if (record.get('appendChangeFlag')) {
      return <span style={{ color: 'red' }}>{value}</span>;
    }
    return value;
  };

  const columns = [
    {
      name: 'projectLineItemNum',
      renderer: renderTextRed,
    },
    {
      name: 'itemCode',
      renderer: renderTextRed,
    },
    {
      name: 'itemName',
      renderer: renderTextRed,
    },
    {
      name: 'itemCategoryName',
      renderer: renderTextRed,
    },
    doubleUnitFlag
      ? {
          name: 'secondaryQuantity',
          align: 'right',
          renderer: renderTextRed,
        }
      : null,
    {
      name: 'requiredQuantity',
      align: 'right',
      renderer: renderTextRed,
    },
    doubleUnitFlag
      ? {
          name: 'secondaryUomName',
          renderer: renderTextRed,
        }
      : null,
    {
      name: 'uomName',
      renderer: renderTextRed,
    },
  ];

  // 批量删除
  const handleDeleteMaterial = () => {
    const selectedRecords = allotMaterialDs?.selected || [];
    // 删除线上数据
    allotMaterialDs
      .delete(selectedRecords, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      })
      .then((res) => {
        if (getResponse(res) && isFunction(refreshHeaderAndTableData)) {
          // 刷新标段表格 & 保留缓存的变更数据
          refreshHeaderAndTableData();
        }
      });
  };

  // 批量删除按钮禁用逻辑
  const batchDisabledFlag = useMemo(() => {
    return (
      !allotMaterialDs ||
      !allotMaterialDs.selected?.length ||
      (!allotMaterialDs.length && !allotMaterialDs.cachedRecords?.length) ||
      allotMaterialDs?.status === 'loading'
    );
  }, [
    allotMaterialDs?.selected,
    allotMaterialDs.length,
    allotMaterialDs.cachedRecords?.length,
    allotMaterialDs?.status,
  ]);

  // 获取表格按钮
  const getTableButtons = useMemo(
    () => [
      ['add', { onClick: isFunction(handleAddMaterial) ? handleAddMaterial : noop }],
      ['delete', { name: 'delete', onClick: handleDeleteMaterial }],

      <Button
        name="add"
        funcType="flat"
        icon="playlist_add"
        onClick={isFunction(handleAddMaterial) ? handleAddMaterial : noop}
      >
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>,
      <Button
        name="delete"
        funcType="flat"
        icon="delete_sweep"
        onClick={handleDeleteMaterial}
        disabled={batchDisabledFlag}
      >
        {intl.get(`hzero.common.button.batchDelete`).d('批量删除')}
      </Button>,
    ],
    [handleAddMaterial, handleDeleteMaterial, batchDisabledFlag]
  );

  return customizeTable(
    {
      code: getCustomizeUnitCode('allotItemLineTable'),
      buttonCode: getCustomizeUnitCode('allotItemLineTableBtn'),
    },
    <Table
      dataSet={allotMaterialDs}
      columns={columns}
      buttons={getTableButtons}
      queryBar="none"
      style={{ maxHeight: 'calc(100vh - 250px)' }}
    />
  );
});

export default AllotMaterialModal;
