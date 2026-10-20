import React, { useRef } from 'react';
import { useModal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import SkuDetail from './SkuDetail';

export default function useSkuDetail(embedModal) {
  let Modal = useModal();
  if (typeof embedModal?.open === 'function') Modal = embedModal;
  const detailModal = useRef();
  return (record) => {
    if (detailModal.current) {
      detailModal.current.update({
        children: <SkuDetail skuId={record?.get('skuId')} />,
      });
    } else {
      detailModal.current = Modal.open({
        drawer: true,
        mask: false,
        title: intl.get('smpc.product.view.skuDetail').d('商品详情'),
        style: { width: 742 },
        okCancel: false,
        resizable: true,
        closeOnLocationChange: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
        children: <SkuDetail skuId={record?.get('skuId')} />,
        afterClose: () => {
          detailModal.current = null;
        },
      });
    }
  };
}
