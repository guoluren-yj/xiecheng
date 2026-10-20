/**
 * 积分管理 - 积分发放弹窗
 * @Author: qingxiang.luo@going-link.com
 * @version: 0.0.1
 * @Date: 2021-03-23
 * @Copyright: Copyright (c) 2021, Hand
 */

import React from 'react';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import styles from './index.less';

const { Step } = Steps;
const PointsIssuanceModal = observer((props) => {
  const { current, steps = [] } = props;
  return (
    <>
      <Steps current={current}>
        {steps.map((item) => (
          <Step key={item.title} title={item.title} />
        ))}
      </Steps>
      <div className={styles['steps-content']}>
        {steps[current] && steps[current].content ? steps[current].content : null}
      </div>
    </>
  );
});

export default PointsIssuanceModal;
