// 多标段组件
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { getResponse } from 'utils/utils';
import { Icon } from 'choerodon-ui/pro';
import classnames from 'classnames';
import intl from 'utils/intl';
import { useVirtualList } from 'ahooks';
import { fetchSectionInfo } from '@/services/checkPriceOverviewServices';
import { getSourceName } from '@/utils/globalVariable';
import SectionItem from './SectionItem';
import styles from './index.less';

const SectionPanel = (props = {}) => {
  const {
    children,
    rfxHeaderId = '',
    afterOpenSection = () => {},
    bidFlag = false,
    rfxHeaderIds = null,
  } = props;
  const [sectionData, setSectionData] = useState([]);
  const [openedFlag, setOpenedFlag] = useState(true);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);

  const [list] = useVirtualList(sectionData, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 80,
    overscan: 10,
  });

  useEffect(() => {
    fetchSection();
  }, []);

  const fetchSection = useCallback(async () => {
    const params = {
      rfxHeaderIds,
    };
    const data = await fetchSectionInfo(params);
    if (getResponse(data)) {
      setSectionData(data?.projectLineSectionList);
    }
  }, []);

  const toggleOpened = useCallback(() => {
    setOpenedFlag(!openedFlag);
  }, [openedFlag]);

  // 打开/折叠指示器
  const renderDirect = useCallback(() => {
    return (
      <div
        className={!openedFlag ? styles['anchor-icon-expand'] : styles['anchor-icon-collapsed']}
        onClick={toggleOpened}
      >
        {!openedFlag ? <Icon type="baseline-arrow_right" /> : <Icon type="baseline-arrow_left" />}
      </div>
    );
  }, [openedFlag]);

  const itemProps = {
    rfxHeaderId,
    afterOpenSection,
    openedFlag,
  };

  return (
    <div className={styles.section}>
      {!isEmpty(sectionData) && (
        <div
          className={classnames(styles['section-left'], {
            [styles['closed-panel']]: !openedFlag,
          })}
        >
          {openedFlag ? (
            <div className={styles['section-left-title']}>
              <div className={styles['section-left-title-top']}>
                {`${getSourceName(bidFlag)}${intl
                  .get('ssrc.inquiryHall.view.title.sectionBiding')
                  .d('标段')}`}
              </div>
              <div className={styles['section-left-title-str']}>
                {intl.get('ssrc.inquiryHall.view.title.sectionQuickly').d('可以快速切换标段')}
              </div>
            </div>
          ) : (
            <div className={styles['section-left-title']}>
              <div className={styles['section-left-title-top']}>
                {intl.get('ssrc.inquiryHall.view.title.sectionBiding').d('标段')}
              </div>
            </div>
          )}
          <div className={styles['section-left-list']} ref={containerRef}>
            <div ref={wrapperRef}>
              {list.map((item, index) => (
                <SectionItem data={item.data} index={index} {...itemProps} />
              ))}
            </div>
          </div>
        </div>
      )}
      {!isEmpty(sectionData) && renderDirect()}
      <div
        className={styles['section-right']}
        style={{
          maxWidth: isEmpty(sectionData)
            ? '100%'
            : openedFlag
            ? 'calc(100% - 160px)'
            : 'calc(100% - 70px)',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default observer(SectionPanel);
