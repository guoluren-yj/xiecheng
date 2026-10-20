import React from 'react';
import classnames from 'classnames';
import { Popover } from 'choerodon-ui';
import styles from './index.less';

const SectionItem = (props = {}) => {
  const {
    data = {},
    rfxHeaderId = '',
    afterOpenSection = () => {},
    key,
    openedFlag = true,
    index = 0,
  } = props;
  const {
    sectionName = '',
    sourceHeaderId = '',
    projectLineSectionId = '',
    sectionNum = 0,
    sourceHeaderNum = 0,
    sourceNum = 0,
  } = data || {};
  return (
    <div
      className={classnames(styles['section-item'], {
        [styles['closed-panel']]: !openedFlag,
      })}
      onClick={() => afterOpenSection(sourceHeaderId, projectLineSectionId)}
      key={key}
    >
      {openedFlag ? (
        <div className={styles['section-left-list-item']}>
          <div
            className={classnames(styles['section-items-item-rfx-num'], {
              [styles['section-items-item-rfx-num-choose']]: rfxHeaderId === sourceHeaderId,
            })}
          >
            {sectionName}
          </div>
          {rfxHeaderId === sourceHeaderId ? (
            <div className={styles['active-item-vertical-icon']} />
          ) : (
            ''
          )}
        </div>
      ) : (
        <div className={styles['section-items-item-collapsed-container']}>
          <span
            className={classnames(styles['section-items-item-collapsed'], {
              [styles['item-collapsed']]: rfxHeaderId === sourceHeaderId,
            })}
          >
            <Popover content={`${sectionName}-${sourceHeaderNum || sourceNum}`}>
              {sectionNum || index + 1}
            </Popover>
            {rfxHeaderId === sourceHeaderId ? (
              <span className={styles['active-stars']} style={{ backgroundColor: '#29BEDB' }}>
                *
              </span>
            ) : (
              ''
            )}
          </span>
        </div>
      )}
    </div>
  );
};

export default SectionItem;
