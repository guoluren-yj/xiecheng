/*
 * @Descripttion: 寻源过程审批--对比容器
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-27 10:37:13
 * @LastEditors: yiping.liu
 */
import React from 'react';
import intl from 'utils/intl';

import Card from '../rfComponents/Card';
import BasicInfo from './CardMessage/BasicInfo';
import InquiryScope from './CardMessage/InquiryScope';
import RuleSetting from './CardMessage/RuleSetting';
// import Purchasing from './CardMessage/Purchasing';
import styles from './index.less';

const CompareWrapper = (props) => {
  const { currentMode = '', num = 0 } = props;
  const ruleSettingProps = {
    currentMode,
  };

  return (
    <React.Fragment>
      {currentMode === 'current' ? (
        <div className={styles['compare-current']}>
          <span className={styles['compare-green']}>
            {intl.get('ssrc.inquiryHall.view.inquiryHall.currentMode').d('当前版本')}
          </span>
          <span>
            {intl
              .getHTML('ssrc.inquiryHall.view.inquiryHall.current.changeNumber', {
                number: num,
              })
              .d(
                <span>
                  <span className={styles['compare-num']}>{num}</span>
                  {intl.get('ssrc.inquiryHall.view.inquiryHall.infoUpdate').d('处信息更改')}
                </span>
              )}
          </span>
        </div>
      ) : currentMode === 'history' ? (
        <div className={styles['compare-history']}>
          {intl.get('ssrc.inquiryHall.view.inquiryHall.historyMode').d('历史版本')}
        </div>
      ) : (
        ''
      )}
      <Card
        title={intl.get(`ssrc.inquiryHall.view.message.tab.baseInfos`).d('基本信息')}
        component={<BasicInfo />}
      />
      {/* <Card
            title={intl.get('ssrc.inquiryHall.view.inquiryHall.purOrganizationAndStaff').d('采购组织及人员')}
            component={<Purchasing />}
          /> */}
      <Card
        title={intl.get(`ssrc.rfController.model.inquiry.scope`).d('征询范围')}
        component={<InquiryScope />}
      />
      <Card
        title={intl.get(`ssrc.rfController.model.rule.setting`).d('规则设置')}
        component={<RuleSetting {...ruleSettingProps} />}
      />
      <div className={styles['bottom-line']} />
    </React.Fragment>
  );
};

export default CompareWrapper;
