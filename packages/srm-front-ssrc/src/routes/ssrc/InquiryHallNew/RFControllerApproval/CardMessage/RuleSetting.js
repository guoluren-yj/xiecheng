import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import intl from 'utils/intl';
import { Icon } from 'choerodon-ui';
import { observer } from 'mobx-react';

import styles from '../../rfComponents/common.less';
import TimeControl from './TimeControl.js';
import Expert from './Expert.js';
import ScoringElements from './ScoringElements.js';
import style from './index.less';

const RuleSetting = forwardRef((props, ref) => {
  const { consultationDs, header, customizeForm } = props;
  const timeControlRef = useRef(null);

  const [show, setShow] = useState(true);

  // 通过 useImperativeHandle 暴露 C 组件的方法
  useImperativeHandle(ref, () => ({
    initDSFields: (data) => {
      if (timeControlRef.current) {
        return timeControlRef.current.initDSFields(data);
      }
    },
  }));

  /**
   * @description: 收起展开
   * @param {*}
   */
  const handleShow = () => {
    setShow(!show);
  };

  const TimeControlProps = {
    ...props,
    header,
    customizeForm,
    onRef: (node) => {
      timeControlRef.current = node;
    },
    timeControlDS: consultationDs,
  };

  const expertProps = {
    ...props,
  };

  const scoreProps = {
    ...props,
  };

  return (
    <React.Fragment>
      <h3 className={styles['card-sub-title']} style={{ margin: '16px 0' }}>
        <div className={styles['card-sub-title-line']} />
        {intl.get('ssrc.rfDetail.view.card.subtitle.consultationStage').d('征询阶段')}
      </h3>
      {consultationDs?.current && <TimeControl {...TimeControlProps} />}
      {consultationDs?.current?.get('expertScoreFlag') ? (
        <>
          {show && (
            <div>
              <h3 className={styles['card-sub-title']}>
                <div className={styles['card-sub-title-line']} />
                {intl.get('ssrc.rfDetail.view.card.subtitle.expert').d('专家组')}
              </h3>
              <Expert {...expertProps} />
              <ScoringElements {...scoreProps} />
            </div>
          )}
          <div className={style['controller-fold']}>
            <a onClick={handleShow}>
              {show
                ? intl.get(`hzero.common.button.up`).d('收起')
                : intl.get(`hzero.common.button.expand`).d('展开')}
              <Icon type={show ? 'expand_less' : 'expand_more'} />
            </a>
          </div>
        </>
      ) : null}
    </React.Fragment>
  );
});

export default observer(RuleSetting);
