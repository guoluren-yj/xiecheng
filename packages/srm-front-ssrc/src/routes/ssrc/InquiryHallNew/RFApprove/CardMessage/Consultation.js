/*
 * @Descripttion: 寻源过程审批--征询阶段
 * @version:
 * @Author: yiping.liu<yiping.liu@going-link.com>
 * @Date: 2021-07-21 17:41:38
 * @LastEditors: yiping.liu
 */
import React, { useContext, useEffect } from 'react';

import { Output } from 'choerodon-ui/pro';
import CollapseForm from '_components/CollapseForm';

import Store from '../store';
import styles from './index.less';

const Consultation = (props) => {
  const {
    commonDs: { consultationDs },
  } = useContext(Store);

  const { currentMode = '' } = props;

  useEffect(() => {}, []);

  /**
   * @description: 获取className
   * @param {*}
   */
  const getClassName = () => {
    if (currentMode === 'current') {
      return styles['change-after'];
    }
    if (currentMode === 'history') {
      return styles['change-before'];
    }
    return '';
  };

  return (
    <React.Fragment>
      <CollapseForm
        className="c7n-pro-vertical-form-display"
        dataSet={consultationDs}
        columns={3}
        labelLayout="vertical"
      >
        <Output className={getClassName('startDate')} name="startDate" />
        <Output className={getClassName('endDate')} name="endDate" />
      </CollapseForm>
    </React.Fragment>
  );
};

export default Consultation;
