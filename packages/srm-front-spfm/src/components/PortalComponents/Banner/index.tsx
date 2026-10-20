/**
 * PortalBanner - 门户轮播图
 * @date: 2021-07-05
 * @author: Danica <ke.wang01@gonig-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { useState, useMemo } from 'react';
import { Carousel, Spin } from 'choerodon-ui';
import Cookies from 'universal-cookie';
import styles from './index.less';

const cookies = new Cookies();

interface PortalBannerProps {
  bannerList?:
    | Array<{
        name: string;
        link: string;
        // eslint-disable-next-line
        zh_CN: string;
        // eslint-disable-next-line
        en_US: string;
        // eslint-disable-next-line
        ja_JP: string;
        enabledFlag: number;
        blankEnabled: number;
        position: number;
      }>
    | [];
}

const PortalBanner: React.FC<PortalBannerProps> = ({ bannerList }) => {
  const newList = useMemo(() => {
    const list = (bannerList && bannerList.filter((item) => item.enabledFlag === 1)) || [];
    return list.sort((a, b) => {
      return a.position - b.position;
    });
  }, [bannerList]);
  const [loading] = useState(!newList);
  const [language] = useState(cookies.get('language') || 'zh_CN');

  return (
    <Spin spinning={loading}>
      <div className={styles['portal-banner-container']}>
        <Carousel autoplay arrows>
          {newList &&
            newList.map((item) => {
              if (item.link) {
                return (
                  <a href={item.link} className="banner-link" target={item.blankEnabled === 0 ? '' : '_blank'} rel="noopener noreferrer">
                    <img src={item[language] && item[language].url} className="banner-img" alt='' />
                  </a>
                );
              } else {
                return <img src={item[language] && item[language].url} className="banner-img" alt='' />;
              }
            })}
        </Carousel>
      </div>
    </Spin>
  );
};

export default React.memo(PortalBanner);
