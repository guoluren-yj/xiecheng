import React from 'react';
import { Tag, Popover, Icon } from 'choerodon-ui';
import { Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

import styles from './index.less';

// 渲染状态列
const statusRender = (status, statusMeaning) => {
  let color = 'orange'; // 橙色
  if (status === 'SELECTED_OR_FINISHED') color = 'green';
  if (status === 'NOTE_SELECT_OR_PENDING') color = 'gray';
  if (status === 'QUOTED_OR_SELECT_FAIL') color = 'red';
  return (
    statusMeaning && (
      <Tag color={color} style={{ border: 'none' }}>
        {statusMeaning}
      </Tag>
    )
  );
};

// 渲染报价轮次
const quotationRoundsRender = (record = {}) => {
  const { roundNumber, quickRfqQuotationRecords = [] } = record?.get([
    'roundNumber',
    'quickRfqQuotationRecords',
  ]);
  const content = (
    <div className={styles['quotation-rounds-popover']}>
      <div className={styles['popover-title']}>
        <div className={styles['popover-title-left']}>
          {intl.get('ssrc.quickInquiry.model.quickInquiry.rounds').d('轮次')}
        </div>
        <div className={styles['popover-title-right']}>
          {intl.get('ssrc.quickInquiry.model.quickInquiry.price').d('单价')}
        </div>
      </div>
      <div className={styles['popover-wrapper']}>
        {quickRfqQuotationRecords?.map((i) => (
          <div className={styles['popover-content']}>
            <div className={styles['popover-content-left']}>
              {intl
                .get('ssrc.quickInquiry.model.quickInquiry.commonRound', {
                  roundNumber: i.roundNumber,
                })
                .d(`第{roundNumber}轮`)}
            </div>
            <div className={styles['popover-content-right']}>
              <Tooltip title={numberSeparatorRender(i.quotationPrice)}>
                {numberSeparatorRender(i.quotationPrice)}
              </Tooltip>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  return Number(roundNumber) > 1 ? (
    <Popover
      overlayClassName={styles['quotation-rounds-popover-wrapper']}
      content={content}
      trigger="hover"
    >
      <Tag color="orange" border={false}>
        <span>
          {intl
            .get('ssrc.quickInquiry.model.quickInquiry.commonRound', {
              roundNumber,
            })
            .d(`第{roundNumber}轮`)}
        </span>
        <Icon type="alt_route-o" style={{ marginLeft: 4, marginTop: -2, fontSize: 12 }} />
      </Tag>
    </Popover>
  ) : (
    <Tag color="orange" border={false}>
      {intl
        .get('ssrc.quickInquiry.model.quickInquiry.commonRound', {
          roundNumber,
        })
        .d(`第{roundNumber}轮`)}
    </Tag>
  );
};

// 调价单状态渲染
const priceStatusRender = ({ value, name = '', record = {}, iconType = '' }) => {
  const fieldCode = name.replace('Meaning', '');
  const status = record.get && record.get(fieldCode);
  const description = (record.get && record.get(`${fieldCode}Meaning`)) || value;
  const color = getTagColor(status);
  return (
    description && (
      <Tag color={color} style={{ border: 'none' }}>
        {description}
        {iconType && (
          <Icon
            type={iconType}
            style={{
              fontSize: 14,
              cursor: 'pointer',
              position: 'relative',
              margin: '-3px 0px 0 4px',
            }}
          />
        )}
      </Tag>
    )
  );
};

// 获取Tag组件color
function getTagColor(status) {
  let color = 'orange'; // 橙色
  if (status === 'APPROVED') color = 'green';
  if (status === 'CANCELED') color = 'gray';
  return color;
}

export { statusRender, quotationRoundsRender, priceStatusRender };
