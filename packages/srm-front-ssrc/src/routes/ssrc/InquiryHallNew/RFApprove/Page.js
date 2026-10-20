/*
 * @Descripttion: 寻源过程控制--页面
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-26 11:02:54
 * @LastEditors: yiping.liu
 */
import React, { useState } from 'react';
import intl from 'utils/intl';
import { Header } from 'components/Page';
import classNames from 'classnames';
import { Button } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from '../rfComponents/common.less';
import CompareWrapper from './CompareWrapper';
import style from './index.less';

const Page = () => {
  const [compareView, setCompareView] = useState(false);

  /**
   * @description: 对比变更
   * @param {*}
   */
  const handleCompare = () => {
    setCompareView(!compareView);
  };

  const currentWrapperProps = {
    currentMode: 'current',
  };

  const hisWrapperProps = {
    currentMode: 'history',
  };

  const wrapperProps = {};

  return (
    <React.Fragment>
      <Header
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.RFxProcessControl`).d('寻源过程控制')}
        backPath="/ssrc/new-inquiry-hall/list"
      >
        {compareView ? (
          <Button onClick={handleCompare}>
            <Icon type="cancel" />
            {intl.get('ssrc.inquiryHall.model.inquiryHall.closeCompare').d('关闭对比')}
          </Button>
        ) : (
          <Button onClick={handleCompare}>
            <Icon type="compare" />
            {intl.get('ssrc.inquiryHall.model.inquiryHall.changeCompare').d('变更对比')}
          </Button>
        )}

        <Button>
          <Icon type="find_in_page" />
          {intl.get('ssrc.inquiryHall.model.inquiryHall.preview').d('询价单预览')}
        </Button>
      </Header>
      <div className={classNames('rf-page-content-warp', styles['rf-page-content'])}>
        <div className={styles['rf-card-content-wrapper']}>
          {compareView ? (
            <div className={style['compare-wrapper']}>
              <div className={style['compare-half']}>
                <CompareWrapper {...currentWrapperProps} />
              </div>
              <div className={style['compare-divide']} />
              <div className={style['compare-half']}>
                <CompareWrapper {...hisWrapperProps} />
              </div>
            </div>
          ) : (
            <CompareWrapper {...wrapperProps} />
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default formatterCollections({
  code: [
    'ssrc.rfController',
    'ssrc.rfCheck',
    'ssrc.inquiryHall',
    'ssrc.bidChange',
    'ssrc.rfDetail',
    'ssrc.rf',
    'ssrc.rfApprove',
  ],
})(Page);
