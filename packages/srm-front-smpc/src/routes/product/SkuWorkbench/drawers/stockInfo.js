import React from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { getSkuStock } from '@/routes/product/SkuWorkbench/tableColumns';
import openStockRecord from '@/routes/product/SkuStock/openStockRecord';
import { stockDs } from './ds';
import { precisionRender } from '../../utilsApi/precision';

// 查看库存信息
export default function openStockInfo({ skuId, data }, isSearch) {
  const ds = new DataSet(stockDs());
  ds.setQueryParameter('skuId', skuId);
  if (isSearch) {
    ds.query();
  } else {
    ds.loadData(data);
  }

  const columns = [
    {
      name: 'inventoryName',
      width: 120,
    },
    {
      name: 'warningStock',
      width: 150,
      renderer: precisionRender,
    },
    {
      name: 'consumedStock',
      width: 150,
      renderer: precisionRender,
    },
    {
      name: 'surplusStock',
      width: 150,
      renderer: ({ record, name }) => {
        return getSkuStock({ showLine: false, record, skuStockName: name });
      },
    },
    {
      name: 'totalStock',
      width: 150,
      renderer: ({ value, record }) =>
        value === -1 || isNaN(value)
          ? intl.get('smpc.product.model.noLimitStock').d('无限库存')
          : precisionRender({ name: 'totalStock', record }),
    },
    {
      name: 'option',
      header: intl.get('hzero.common.action').d('操作'),
      width: 80,
      lock: 'right',
      renderer: ({ record }) => (
        <a onClick={() => openStockRecord(record, false, true)}>
          {intl.get('smpc.product.button.stockRecord').d('库存记录')}
        </a>
      ),
    },
  ];
  return Modal.open({
    title: intl.get('smpc.product.view.lookStock').d('查看库存'),
    mask: true,
    drawer: true,
    closable: true,
    maskClosable: false,
    destroyOnClose: true,
    style: { width: 760 },
    okText: intl.get('hzero.common.button.close').d('关闭'),
    okCancel: false,
    children: <Table dataSet={ds} columns={columns} />,
  });
}
