// 周期类汇总类型配置
import { useMemo } from 'react';

import { getResponse } from 'utils/utils';
import { observer } from 'mobx-react-lite';
import { delInventoryWeek } from '@/services/inventoryManageService';
import { useTable } from '../../components/utils';

const WeekTotalConfig = observer((props) => {
  const { WeekDs, strategyHeaderId, editFlag = true } = props;
  const columns = [
    {
      name: 'stockMappingType',
      align: 'left',
      // width: 100,
      editor: editFlag,
    },
    {
      name: 'strategyCodeObj',
      // width: 120,
      editor: editFlag,
    },
    {
      name: 'strategyName',
      // width: 120,
      // editor: true,
    },
  ];
  const handleDel = async () => {
    const params = WeekDs.selected.map((i) => i.toJSONData()).filter((i) => i.stockMappingId);
    if (params.length > 0) {
      const res = await delInventoryWeek(params);
      if (getResponse(res)) {
        WeekDs.setQueryParameter('params', {
          strategyHeaderId,
        });
        WeekDs.query();
        WeekDs.remove(WeekDs.selected, true);
      }
    } else {
      WeekDs.remove(WeekDs.selected, true);
    }
  };

  const buttons = useMemo(() => {
    return editFlag ? ['add', ['delete', { onClick: handleDel, icon: 'delete_sweep' }]] : [];
  }, [editFlag]);
  return useTable(WeekDs, columns, {
    selectionMode: editFlag ? 'rowbox' : 'none',
    buttons,
    customizable: true,
    customizedCode: 'new-strategy-receiptManageConfig-workbench',
  });
});

export default WeekTotalConfig;
