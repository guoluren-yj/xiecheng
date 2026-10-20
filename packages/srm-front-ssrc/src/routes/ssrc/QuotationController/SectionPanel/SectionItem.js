/* eslint-disable eqeqeq */
// 分标段切换面板

import React from 'react';
import classnames from 'classnames';

import Checkbox from 'components/Checkbox';
import { Popover } from 'hzero-ui';

import styles from './index.less';

function SectionItem(props = {}) {
  const {
    data = {},
    openedFlag = 1,
    isBatchMaintainSection = false,
    handleClick = () => {},
    sectionItemCheck = () => {},
    checkedList = [],
    parentPage: { queryParams = {}, name },
  } = props;
  const { redactFlag = true, sourceHeaderId, adjustRecordId } = data;

  // const currentLineId = queryParams.sourHeaderId;
  const isChecked = checkedList.some(
    (item = {}) => item.sourceHeaderId && item.sourceHeaderId == sourceHeaderId
  );

  const IsSectionActive = adjustRecordId == queryParams.adjustRecordId;

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
                disabled={!redactFlag && name === 'checkPrice'}
              />
            </div>
          ) : null}
          <div className={styles['item-title']}>
            <Popover content={`${data.sectionName} - ${data.sourceHeaderNum}`}>
              {data.sectionName}
            </Popover>
          </div>
          {redactFlag && name === 'checkPrice' ? <div className={styles['item-saved']} /> : ''}
          <span />
        </div>
      ) : (
        <div className={styles['section-items-item-collapsed-container']}>
          <span
            className={classnames(styles['section-items-item-collapsed'], {
              [styles['item-collapsed']]: redactFlag,
            })}
          >
            <span>
              <Popover content={`${data.sectionName} - ${data.sourceHeaderNum}`}>
                {data.sectionNum}
              </Popover>
            </span>
            {IsSectionActive ? <span className={styles['active-stars']} /> : ''}
          </span>
        </div>
      )}
    </div>
  );
}

export default SectionItem;
