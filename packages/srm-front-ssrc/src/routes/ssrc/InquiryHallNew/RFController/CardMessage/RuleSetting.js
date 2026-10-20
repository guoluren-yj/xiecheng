/*
 * @Descripttion: 寻源过程控制--规则设置
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 16:47:15
 * @LastEditors: Please set LastEditors
 */
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react'; // useState // useContext,
import intl from 'utils/intl';
// import CollapseForm from '_components/CollapseForm';
// import { TextField } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';

import { withOverride } from '@/utils/utils';
import styles from '../../rfComponents/common.less';
// import Consultation from './Consultation';
import TimeControl from './TimeControl.js';
import Expert from './Expert';
import ScoringElements from './ScoringElements';
import Store from '../store';
import style from './index.less';

const RuleSetting = forwardRef((props, ref) => {
  const { consultationDs, header } = props;
  const timeControlRef = useRef(null);
  const {
    customizeForm,
    cuxProps = {}, // 用于存放重写二开方法的集合
  } = useContext(Store);
  const [show, setShow] = useState(true);

  // 通过 useImperativeHandle 暴露 C 组件的方法
  useImperativeHandle(ref, () => ({
    initDSFields: (data) => {
      if (timeControlRef.current) {
        return timeControlRef.current.initDSFields(data);
      }
    },
  }));

  /** consultationDs update事件
   * @protected 番缆服务二开
   */
  function consultationDsUpdateEvent({ name, value, record }) {
    if (name === 'technologyWeight') {
      if (value === 100) {
        return;
      }
      record.set('businessWeight', 100 - value);
    }
    if (name === 'businessWeight') {
      if (value === 100) {
        return;
      }
      record.set('technologyWeight', 100 - value);
    }
  }

  const _update = withOverride.call(
    cuxProps,
    consultationDsUpdateEvent,
    'consultationDsUpdateEvent'
  );

  useEffect(() => {
    consultationDs.addEventListener('update', _update);
  }, []);

  /**
   * @description: 收起展开
   * @param {*}
   */
  const handleShow = () => {
    setShow(!show);
  };

  // const consultationProps = {
  //   consultationDs,
  //   startVisible: Boolean(header?.rfConfRuleAdjustDTO?.fieldPropertyDTOList[0]?.visible),
  //   endVisible: Boolean(header?.rfConfRuleAdjustDTO?.fieldPropertyDTOList[1]?.visible),
  // };

  const TimeControlProps = {
    header,
    customizeForm,
    onRef: (node) => {
      timeControlRef.current = node;
    },
    timeControlDS: consultationDs,
    // match,
    // rfxId,
    // custKey,
    // custLoading,
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
              <Expert />
              <ScoringElements />
              {/* <CollapseForm dataSet={evaluationDs} columns={3} labelLayout="float">
            <TextField name="openBidOrder" />
            <TextField name="bidRuleType" />
          </CollapseForm> */}
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

export default RuleSetting;
