/*
 * @Description: file content
 * @Date: 2022-02-06 13:18:10
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React from 'react';
import { Steps } from 'choerodon-ui';
import { observer } from 'mobx-react';

import styles from '../Create/index.less';

const { Step } = Steps;

export default observer((props) => {
  const { current, showList } = props;
  return (
    <div className={styles['create-steps-wrapper']}>
      <div className={styles['create-steps-bar']}>
        <Steps size="small" current={current}>
          {showList.map(({ title, name }) => (
            <Step title={title} key={name} />
          ))}
        </Steps>
      </div>
      <div className="create-steps-content">{showList[current]?.content}</div>
    </div>
  );
});
