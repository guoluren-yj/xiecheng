import React from 'react';
import intl from 'utils/intl';
import styles from './styles.less';

// 240px
export default function operateRenderer({ record }, onView = (e) => e) {
  const { skuName, version, creationDate, publishUser } = record.toData();
  return {
    icon: 'check',
    time: creationDate,
    header: (
      <div className={styles['operate-action']}>
        {intl
          .getHTML('smpc.product.model.skuOperateContentName', {
            skuName,
            name: publishUser,
            // action,
          })
          .d(
            <div className="sku-wrapper">
              <span className="sku-createby">{publishUser}</span>
              <span className="operate-action">发布了</span>
              <span className="sku-text">
                【<span className="sku-name">{skuName}</span>】
              </span>
            </div>
          )}
      </div>
    ),
    content: (
      <div style={{ marginBottom: 8 }}>
        <span>{intl.get('smpc.product.view.versionAs').d('版本号为')}</span>
        <span style={{ fontWeight: 500, margin: '0 16px 0 4px' }}>{version}</span>
        <a onClick={() => onView(record)}>
          {intl.get('smpc.product.view.lookDetail').d('查看详情')}
        </a>
      </div>
    ),
  };
}
