// 分标段切换面板

import React from 'react';
import classnames from 'classnames';
import { isFunction } from 'lodash';

import Checkbox from 'components/Checkbox';
import { Tooltip } from 'choerodon-ui/pro';

import styles from './index.less';

function SectionItem(props = {}) {
  const {
    data = {},
    index = 0,
    openedFlag = false,
    isBatchMaintainSection = false,
    handleClick = () => {},
    activeSection = {},
    sectionItemCheck = () => {},
    checkedList = [],
    pageName = '',
    getSectionItemTooltip = () => {},
  } = props;
  const {
    redactFlag = 1,
    sectionName = '',
    sourceHeaderNum = '',
    sourceNum = '',
    sectionNum = '',
  } = data;

  const currentLineId = data.projectLineSectionId;
  const isChecked = checkedList.some(
    (item = {}) => item.projectLineSectionId && item.projectLineSectionId === currentLineId
  );
  const IsSectionActive = activeSection?.projectLineSectionId === currentLineId;
  const savedIconFlag = redactFlag === 1 || redactFlag === -1; // 标段是否保存对号标识显示
  const pageUnSavedIconFlag = pageName && pageName === 'supplierQuotationNew'; // 具体页面标段已保存表示显示逻辑

  // 多标段item气泡
  const tooltipTitle = isFunction(getSectionItemTooltip)
    ? getSectionItemTooltip(data) || `${sectionName}-${sourceHeaderNum || sourceNum}`
    : `${sectionName}-${sourceHeaderNum || sourceNum}`;

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
                disabled={redactFlag !== 1 && redactFlag !== -1}
              />
            </div>
          ) : null}
          <div className={styles['item-title']}>
            <Tooltip title={tooltipTitle}>{sectionName}</Tooltip>
          </div>
          {savedIconFlag && !pageUnSavedIconFlag ? <div className={styles['item-saved']} /> : ''}
          <span />
        </div>
      ) : (
        <div className={styles['section-items-item-collapsed-container']}>
          <span
            className={classnames(styles['section-items-item-collapsed'], {
              [styles['item-collapsed']]: redactFlag,
            })}
          >
            <Tooltip title={tooltipTitle}>{sectionNum || index + 1}</Tooltip>
            {IsSectionActive ? <span className={styles['active-stars']} /> : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export default SectionItem;
