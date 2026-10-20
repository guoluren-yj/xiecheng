// 分标段切换面板

import React from 'react';
import classnames from 'classnames';
import { isFunction, isNil } from 'lodash';

import Checkbox from 'components/Checkbox';
import { Popover } from 'hzero-ui';

import intl from 'utils/intl';

import styles from './index.less';

const colorMap = {
  default: {
    color: '#4F9EE9',
    backgroundColor: '#E8EFF7',
  },
  SCORE: {
    color: '#0B0B0B',
    backgroundColor: '#E6E6E6',
  },
};

function Tag({ color, backgroundColor, children }) {
  const style = {
    position: 'absolute',
    right: '10px',
    width: '30px',
    height: '18px',
    lineHeight: '18px',
    textAlign: 'center',
    fontWeight: 500,
    fontSize: '12px',
  };
  return <div style={{ color, backgroundColor, ...style }}>{children}</div>;
}

/**
 * 渲染标签
 * @param {value} - 对应操作值 1/0
 */
function renderTag(value) {
  // 以后优化, 由于2个需求产品设计冲突, 无法导致此组件复用, 后续迁移到, [SourcingResultDrawer] 组件
  const roundQuotationMeaning = intl.get('ssrc.common.view.message.roundQuotation').d('多轮');
  const scoringMeaning = intl.get('ssrc.common.view.message.scoring').d('评分');
  const { color, backgroundColor } = colorMap[value ? 'default' : 'SCORE'];
  return (
    <Tag color={color} backgroundColor={backgroundColor}>
      {value ? roundQuotationMeaning : scoringMeaning}
    </Tag>
  );
}

function SectionItem(props = {}) {
  const {
    index,
    rowKey,
    data = {},
    openedFlag = 1,
    isBatchMaintainSection = false,
    handleClick = () => {},
    activeSection = {},
    sectionItemCheck = () => {},
    checkedList = [],
    renderDisplay,
    renderPopover,
    displayName,
    popoverName,
    showTag = false,
    sectionTagMap = {},
    // sectionList = [],
  } = props;
  const { redactFlag = true } = data;

  const currentLineId = data[rowKey];
  const isChecked = checkedList.some((item = {}) => item[rowKey] === currentLineId);
  const IsSectionActive = activeSection[rowKey] === currentLineId;

  const displayValue = isFunction(renderDisplay)
    ? renderDisplay(data)
    : data[displayName || 'sectionName'] || '-';
  const popoverValue = isFunction(renderPopover)
    ? renderPopover(data)
    : popoverName
    ? data[popoverName]
    : `${data.sectionName}-${data.sourceNum}`;

  return (
    <div onClick={(e) => handleClick(e, data)}>
      {openedFlag ? (
        <div
          className={classnames(styles['section-items-item'], {
            [styles['active-panel']]: IsSectionActive,
          })}
        >
          {isBatchMaintainSection ? (
            <div className={styles['checkbox-container']}>
              <Checkbox
                checked={isChecked}
                onClick={(e) => sectionItemCheck(e, data)}
                disabled={redactFlag === 0}
              />
            </div>
          ) : null}
          <div className={styles['item-title']}>
            <Popover content={popoverValue}>{displayValue}</Popover>
          </div>
          {showTag &&
            !isNil(sectionTagMap[currentLineId]) &&
            renderTag(sectionTagMap[currentLineId])}
          {!showTag && (redactFlag ? <div className={styles['item-saved']} /> : '')}
          <span />
        </div>
      ) : (
        <div className={styles['section-items-item-collapsed-container']}>
          <span
            className={classnames(styles['section-items-item-collapsed'], {
              [styles['item-collapsed']]: IsSectionActive,
            })}
          >
            <span>{index + 1}</span>
            {redactFlag && IsSectionActive ? <span className={styles['active-stars']} /> : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export default SectionItem;
