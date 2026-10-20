import React from 'react';
import { Icon } from 'choerodon-ui';

import './index.less';

const DataCard = (props) => {
  const {
    title = '',
    totalTitle = '',
    item1 = '',
    item1Count = '',
    item2 = '',
    item2Count = '',
    item3 = '',
    item3Count = '',
    startItem = '',
    startVal = '',
    endItem = '',
    endVal = '',
    showIcon = true,
    titleStyle = '',
  } = props;

  let label = '';
  if (typeof item1Count === 'number') {
    if (Math.abs(item1Count) > 0) {
      label = (Math.abs(item1Count) * 100).toFixed(2);
    } else {
      label = 0;
    }
  } else if (typeof item1Count === 'string') {
    label = item1Count;
  }

  return (
    <>
      <div className="monitor-card">
        <div className="monitor-card-title">{title}</div>
        <div className="monitor-card-count">{totalTitle}</div>
        <div
          className="monitor-card-item"
          style={{ display: 'flex', justifyContent: 'space-between' }}
        >
          {item1 && (
            <span>
              {item1} &nbsp;
              <span
                style={{ fontSize: '14px', fontWeight: 600, lineHeight: '22px', color: '#000000' }}
              >
                <span>{label}</span>
                {showIcon && label !== '-' && (
                  <span>
                    %
                    <Icon
                      type={item1Count > 0 ? 'baseline-arrow_drop_up' : 'baseline-arrow_drop_down'}
                    />
                  </span>
                )}
              </span>
            </span>
          )}

          {item3 && (
            <span>
              {item3} &nbsp;
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '22px',
                  color: titleStyle === 'normal' ? '#000' : '#F56349',
                }}
              >
                {item3Count}
              </span>
            </span>
          )}

          {item2 && (
            <span>
              {item2} &nbsp;
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  lineHeight: '22px',
                  color: titleStyle === 'normal' ? '#000' : '#F56349',
                }}
              >
                {item2Count}
              </span>
            </span>
          )}
        </div>
        <div className="monitor-card-date">{`${startItem} ${startVal}`}</div>
        <div className="monitor-card-date">{`${endItem} ${endVal}`}</div>
      </div>
    </>
  );
};

export default DataCard;
