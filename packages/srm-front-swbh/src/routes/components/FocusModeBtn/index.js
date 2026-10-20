import React from 'react';
import { Tooltip, Spin } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from 'hzero-front/lib/utils/intl';
import { routerRedux } from 'dva/router';
import riskIcon from '@/assets/risk_ monitoring.svg';
import MyIcon from '../MyIcon';
import styles from './index.less';

const FocusModeBtn = ({
  currentMode = 'focus',
  changeMode = () => {},
  setSdatPageShow = () => {},
  sdatPage,
  handleIconMouseDown = () => {},
  showReportCards = false,
  riskLinkFlag = false,
  loading,
  showGuide,
  dispatch,
}) => {
  return (
    <div className={`${styles.btnBox}`} id="swbh-drag-btn">
      <div className={`${styles.btnBlock} ${showGuide ? 'swbh-btn-mode' : ''}`}>
        {/* <Spin spinning={loading || false}> */}
        <div className={`${styles.focusModeBtnBox}`}>
          <Tooltip title={intl.get('swbh.common.model.common.focusMode').d('精简视图')} placement="left">
            <div
              className={`${styles.iconBox} ${styles.commonModeIcon} ${
                currentMode === 'focus' ? (sdatPage ? '' : styles.activeIcon) : styles.modeIcon
              }
          `}
              // onClick={() => changeMode(currentMode === 'focus' ? 'common' : 'focus')}
              onClick={() => changeMode('focus')}
            >
              <MyIcon type="jujiaomoshi" />
            </div>
          </Tooltip>
          <Tooltip title={intl.get('swbh.common.model.common.commonMode').d('经典视图')} placement="left">
            <div
              className={`${styles.iconBox}   ${
                currentMode === 'common' ? (sdatPage ? '' : styles.activeIcon) : styles.modeIcon
              }`}
              // onClick={() => changeMode(currentMode === 'focus' ? 'common' : 'focus')}
              onClick={() => changeMode('common')}
            >
              {/* <MyIcon type={currentMode === 'focus' ? 'jujiaomoshi' : 'morenmoshi'} /> */}
              <MyIcon type="morenmoshi" />
            </div>
          </Tooltip>
        </div>
        {showReportCards ? (
          <div className={styles.baobiaoIconBox}>
            <Tooltip title={intl.get('swbh.common.model.common.reportCardsConfig').d('采购驾驶舱')} placement="left">
              <div
                className={`${styles.iconBox} ${styles.baobiaoIcon} ${
                  sdatPage === 'cardConfig' ? styles.activeIcon : ''
                }`}
                // onClick={() => { // 0612-pur-15374注释：新增风控工作台需调整采购驾驶舱的跳转逻辑
                //   setSdatPageShow();
                // }}
                onClick={() => changeMode('cardConfig')}
              >
                <MyIcon type="baobiao" />
              </div>
            </Tooltip>
          </div>
        ) : null}
        {riskLinkFlag ? (
          <div className={styles.baobiaoIconBox}>
            <Tooltip title={intl.get('swbh.common.model.common.riskLink').d('风控工作台')} placement="left">
              <div
                className={`${styles.iconBox} ${styles.baobiaoIcon} ${
                  sdatPage === 'riskConfig' ? styles.activeIcon : ''
                }`}
                onClick={() => changeMode('riskConfig')}
              >
                <img src={riskIcon} className={`${styles['icon-swbh']}`} />
              </div>
            </Tooltip>
          </div>
        ) : null}
        {/* </Spin> */}
      </div>
      <Icon
        type="baseline-drag_indicator"
        id="swbh-drag-icon"
        className={styles.dragIcon}
        onMouseDown={(e) => handleIconMouseDown(e)}
      />
    </div>
  );
};

export default FocusModeBtn;
