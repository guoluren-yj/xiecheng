/*
 * @Descripttion: 寻源过程审批--规则设置
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 16:47:15
 * @LastEditors: yiping.liu
 */
import React from 'react';
import intl from 'utils/intl';
// import CollapseForm from '_components/CollapseForm';
// import { TextField } from 'choerodon-ui/pro';
// import { Icon } from 'choerodon-ui';

import styles from '../../rfComponents/common.less';
import Consultation from './Consultation';
// import Expert from './Expert';
// import ScoringElements from './ScoringElements';
// import Store from '../store';
// import style from './index.less';

const RuleSetting = (props) => {
  // const {
  //   commonDs: { evaluationDs },
  // } = useContext(Store);
  const { currentMode } = props;

  const consultationProps = {
    currentMode,
  };

  return (
    <React.Fragment>
      <h3 className={styles['card-sub-title']}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rfDetail.view.card.subtitle.consultationStage').d('征询阶段')}
      </h3>
      <Consultation {...consultationProps} />
      {/* <div>
        <h3 className={styles['card-sub-title']}>
          <div className={styles['card-sub-title-line']} />
          {intl.get('ssrc.rfDetail.view.card.subtitle.expert').d('专家组')}
        </h3>
        <Expert />
        <ScoringElements />
        <CollapseForm dataSet={evaluationDs}  columns={3} labelLayout="float">
          <TextField name="openBidOrder" />
          <TextField name="bidRuleType" />
        </CollapseForm>
      </div> */}
    </React.Fragment>
  );
};

export default RuleSetting;
