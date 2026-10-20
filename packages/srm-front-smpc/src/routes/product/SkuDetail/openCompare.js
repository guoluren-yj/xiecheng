import React from 'react';
import intl from 'utils/intl';
import c7nModal from '@/utils/c7nModal';
import styles from './index.less';

function ModalCompare({ children }) {
  return (
    <div className={styles['sku-modal-compare']}>
      <div className="sku-compare-wrapper">
        <div className="sku-compare-header sku-current">
          {intl.get('smpc.product.view.currentVersion').d('当前版本')}
        </div>
        <div className="sku-compare-body">{children[0]}</div>
      </div>
      <div className="sku-compare-wrapper">
        <div className="sku-compare-header sku-history">
          {intl.get('smpc.product.view.historyVersion').d('历史版本')}
        </div>
        <div className="sku-compare-body">{children[1]}</div>
      </div>
    </div>
  );
}

export default function openCompare({ title, childs }) {
  c7nModal({
    title,
    style: { width: 1090 },
    bodyStyle: { padding: 0 },
    okCancel: false,
    okText: intl.get('hzero.common.button.close').d('关闭'),
    children: <ModalCompare>{childs}</ModalCompare>,
  });
}
