import React from 'react';
import { Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SkuCreate from './SkuCreate';

export default {
  create: ({ onSaveSuccess }) => {
    return Modal.open({
      drawer: true,
      title: intl.get('smpc.workbench.view.createSku').d('新建商品'),
      style: { width: 742 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <SkuCreate onSaveSuccess={onSaveSuccess} />,
    });
  },
  edit: ({ record, onSaveSuccess }) => {
    return Modal.open({
      drawer: true,
      title: intl.get('smpc.product.view.title.editSku').d('编辑商品'),
      style: { width: 742 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      children: <SkuCreate skuId={record.get('skuId')} onSaveSuccess={onSaveSuccess} />,
    });
  },
};
