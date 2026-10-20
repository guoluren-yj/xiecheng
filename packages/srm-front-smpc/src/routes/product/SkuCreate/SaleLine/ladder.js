import React from 'react';
import { Table, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { ladderDs } from './ds';

export default function openLadder({
  data = [],
  columns = [],
  readOnly = true,
  onSave = (e) => e,
}) {
  const ds = new DataSet(ladderDs());
  ds.loadData(data);

  const footers = readOnly
    ? { okText: intl.get('hzero.common.button.close').d('关闭'), okCancel: false }
    : { okText: intl.get('hzero.common.button.save').d('保存') };

  Modal.open({
    ...footers,
    drawer: true,
    closable: true,
    style: { width: 742 },
    onOk: async () => {
      if (readOnly) return true;
      const flag = await ds.validate();
      if (flag) {
        const ladders = ds.toData();
        return onSave(ladders);
      } else {
        return false;
      }
    },
    children: <Table dataSet={ds} columns={columns} />,
    title: intl.get('smpc.product.model.ladderPrice').d('阶梯价格'),
  });
}
