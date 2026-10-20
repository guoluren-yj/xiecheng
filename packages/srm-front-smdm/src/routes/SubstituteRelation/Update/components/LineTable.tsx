import React, { useContext, useMemo, useCallback } from 'react';
import { Table, Lov } from 'choerodon-ui/pro';
import { TableButtonType } from 'choerodon-ui/pro/lib/table/enum';
import type { ColumnProps, TableButtonProps } from 'choerodon-ui/pro/lib/table/interface';

import { UpdateCustomizeCode } from '../../utils/constant';
import type { StoreValueType} from '../stores/StoreProvider';
import { Store } from '../stores/StoreProvider';

const LineTable = () => {
  const {
    lineDS,
    customizeTable,
  } = useContext(Store) as StoreValueType;

  const columns: ColumnProps[] = useMemo(() => {
    return [
      { name: 'displayLineNum' },
      {
        name: 'itemId',
        editor: (record) => {
          return (
            <Lov
              onChange={(val) => handleItemChangeEvent(val, record)}
            />
          );
        },
      },
      { name: 'itemName' },
      { name: 'mainItemFlag', editor: true },
      { name: 'specifications' },
      { name: 'categoryName' },
      { name: 'uomName' },
    ];
  }, []);

  // 物料值集点击改变事件
  const handleItemChangeEvent = useCallback((curVal = {}, record)=> {
    const { uomCode, uomId, uomName, model, specifications, categoryId, categoryName } = curVal || {};
    record.set({
      uomCode,
      uomId,
      uomName,
      model,
      specifications,
      categoryId,
      categoryName,
    });
  }, []);

  // 删除数据
  const handleDeleteLine = useCallback(
    () => {
      const { selected = [] } = lineDS;
      if(!selected.length) return;
      lineDS.delete(selected).then(async () => {
        // 重置查询页数
        await lineDS.query(1);
      });
    },
    [lineDS],
  );

  // table按钮
  const buttons = useMemo(() => {
    return [
      TableButtonType.add as TableButtonType,
      [TableButtonType.delete, { onClick: handleDeleteLine }] as [TableButtonType, TableButtonProps],
    ];
  }, [handleDeleteLine]);

  return customizeTable(
    {
      code: UpdateCustomizeCode.LineTableCode,
    },
    <Table dataSet={lineDS} columns={columns} buttons={buttons} />
  );
};

export default LineTable;