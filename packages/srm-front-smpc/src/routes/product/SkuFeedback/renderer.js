import React from 'react';
import intl from 'utils/intl';
import Image from '@/components/Image';
import OverflowTip from '@/components/OverflowTip';
import styles from './style.less';

export function skuInfoRenderer({ record }) {
  const { skuName, mainSkuName, mediaPath, categoryPath } = record.get([
    'skuName',
    'mainSkuName',
    'mediaPath',
    'categoryPath',
  ]);
  return (
    <div className={styles['sku-info-wrapper']}>
      <Image value={mediaPath} width={40} height={40} />
      <div className={styles['sku-info-content']}>
        <OverflowTip className={styles['sku-info-name']}>{skuName || mainSkuName}</OverflowTip>
        <div className={styles['sku-info-other']}>
          <OverflowTip className={styles['sku-info-category']}>{categoryPath}</OverflowTip>
        </div>
      </div>
    </div>
  );
}

export function operateRenderer({ record }, goApproval = (e) => e) {
  const { remark, realName, creationDate, operationCode, operationCodeMeaning } = record.get([
    'remark',
    'realName',
    'creationDate',
    'operationCode',
    'operationCodeMeaning',
  ]);

  const actions = {
    SUBMIT: {
      icon: 'check',
    },
    CONFIRM: {
      icon: 'check_circle',
    },
    APPROVED: {
      icon: 'authorize',
      color: '#47b883',
      header: (
        <div className={styles['operate-approve']} onClick={() => goApproval()}>
          {intl.get('smpc.feedback.view.approved').d('工作流审批通过')}
        </div>
      ),
    },
    REJECTED: {
      icon: 'authorize',
      color: '#f56649',
      header: (
        <div className={styles['operate-reject']} onClick={() => goApproval()}>
          {intl.get('smpc.feedback.view.rejected').d('工作流审批拒绝')}
        </div>
      ),
    },
    WITHDRAW: {
      icon: 'reply',
    },
  };

  const { icon = 'add', color, header } = actions[operationCode] || {};

  const actionMeaning = operationCodeMeaning ? `${operationCodeMeaning}了` : operationCodeMeaning;
  const destination = intl.get('smpc.feedback.view.problemFeedback').d('问题反馈');
  const defaultHeader = (
    <div className={styles['operate-action']}>
      {intl
        .getHTML('smpc.product.model.skuOperateContentName', {
          name: realName,
          skuName: destination,
          action: actionMeaning,
        })
        .d(
          <div className="sku-wrapper">
            <span className="sku-createby">{realName}</span>
            <span className="sku-action">{actionMeaning}</span>
            <span className="sku-text">
              【<span className="sku-name">{destination}</span>】
            </span>
          </div>
        )}
    </div>
  );

  return {
    icon,
    color,
    time: creationDate,
    header: header || defaultHeader,
    content: (
      <div hidden={!remark} className={styles['operate-remark']}>
        {remark}
      </div>
    ),
  };
}
