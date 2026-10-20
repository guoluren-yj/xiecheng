// 业务流程配置
import React, { useMemo, memo } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { delInventoryLine } from '@/services/inventoryManageService';

function FlowConfig(props) {
  const { configDs, processFactory, strategyHeaderId } = props;
  const processFactoryType = processFactory === 0 || processFactory === 2; // 调拨或普通
  const getColumns = () => {
    const columns = [
      {
        name: 'createCampCode',
        align: 'left',
        width: 100,
        editor: true,
      },
      {
        name: 'sourceCode',
        width: 120,
        editor: true,
        // editor: (record) => (
        //   <Select
        //     onOption={({ record: r }) => {
        //       const createCampCodeFlag = record.get('createCampCode') === 'SUPPLIER';
        //       const disabled = createCampCodeFlag && r.get('value') === 'EXTERNAL_SYSTEM';
        //       return { disabled };
        //     }}
        //   />
        // ),
      },
      {
        name: 'submitConfirm',
        width: 120,
        fixed: 'left',
        editor: true,
        // editor: (record) => (
        //   <Select
        //     onOption={({ record: r }) => {
        //       const createCampCodeFlag = record.get('createCampCode') === 'SUPPLIER';
        //       const disabled = createCampCodeFlag && ['SUPPLIER_CONFIRM'].includes(r.get('value'));
        //       return { disabled };
        //     }}
        //   />
        // ),
      },

      processFactory === 0 && {
        name: 'supplierNeedConfirm',
        width: 140,
        editor: true,
      },
      processFactory !== 1 && {
        name: 'supplierShippedConfirm',
        width: 140,
        editor: true,
        header:
          processFactory === 0
            ? intl
                .get(`sinv.inventoryBench.model.view.zeroSupplierShippedConfirms`)
                .d('调入供应商收货确认')
            : intl
                .get(`sinv.inventoryBench.model.view.supplierShippedConfirms`)
                .d('供应商收货确认'),
      },
      processFactory === 0 && {
        name: 'purchaseReview',
        width: 120,
        editor: true,
      },
      (processFactory === 0 || processFactory === 2) && {
        name: 'rejectExportStatus',
        width: 130,
        editor: true,
      },
      {
        name: 'exportFlag',
        width: 100,
        editor: true,
      },

      processFactoryType && {
        name: 'exportUpdate',
        width: 130,
        editor: true,
      },

      processFactoryType && {
        name: 'exportUpdateStatus',
        width: 130,
        editor: true,
      },

      processFactoryType && {
        name: 'exportSubmitStatus',
        width: 170,
        editor: true,
      },

      processFactoryType && {
        name: 'exportCancel',
        width: 130,
        editor: true,
      },
      processFactoryType && {
        name: 'exportCancelStatus',
        width: 130,
        editor: true,
      },
    ];
    return columns.filter(Boolean);
  };

  const handleDel = async () => {
    const params = configDs.selected.map((i) => i.toJSONData()).filter((i) => i.strategyLineId);
    if (params.length > 0) {
      const res = await delInventoryLine(params);
      if (getResponse(res)) {
        configDs.setQueryParameter('strategyHeaderId', strategyHeaderId);
        configDs.query();
        configDs.remove(configDs.selected, true);
      }
    } else {
      configDs.remove(configDs.selected, true);
    }
  };

  const handleAdd = () => {
    configDs.create({ processFactory });
  };

  const buttons = useMemo(() => {
    return [
      ['add', { onClick: handleAdd }],
      ['delete', { onClick: handleDel, icon: 'delete_sweep' }],
    ];
  }, []);

  // return useTable(configDs, columns, { buttons });
  return (
    <Table dataSet={configDs} columns={getColumns()} style={{ maxHeight: 300 }} buttons={buttons} />
  );
}

export default memo(FlowConfig);
