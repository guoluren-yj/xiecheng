// 分标段切换面板

import React from 'react';
import classnames from 'classnames';

import Checkbox from 'components/Checkbox';
import { Popover } from 'hzero-ui';

import styles from '../index.less';

function SectionItem(props = {}) {
  const {
    data = {},
    openedFlag = 1,
    isBatchMaintainSection = false,
    handleClick = () => {},
    activeSection = {},
    sectionItemCheck = () => {},
    checkedList = [],
  } = props;
  const { redactFlag = 1, sectionName = '', sourceHeaderNum = '', sectionNum = '' } = data;

  const currentLineId = data.projectLineSectionId;
  const isChecked = checkedList.some(
    (item = {}) => item.projectLineSectionId && item.projectLineSectionId === currentLineId
  );
  const IsSectionActive = activeSection.projectLineSectionId === currentLineId;

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
            <Popover content={`${sectionName}-${sourceHeaderNum}`}>{sectionName}</Popover>
          </div>
          {redactFlag === 1 ? <div className={styles['item-saved']} /> : ''}
          <span />
        </div>
      ) : (
        <div className={styles['section-items-item-collapsed-container']}>
          <span
            className={classnames(styles['section-items-item-collapsed'], {
              [styles['item-collapsed']]: redactFlag,
            })}
          >
            <Popover content={`${sectionName}-${sourceHeaderNum}`}>{sectionNum}</Popover>
            {IsSectionActive ? <span className={styles['active-stars']} /> : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export default SectionItem;
