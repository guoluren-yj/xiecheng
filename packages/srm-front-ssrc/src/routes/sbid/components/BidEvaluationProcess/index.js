/**
 * component - 招标步骤
 * @date: 2019-07-04
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Steps } from 'hzero-ui';

import common from '@/routes/sbid/common.less';

const { Step } = Steps;

export default class BidEvaluationProcess extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  /**
   * 找出当前步骤的索引
   *
   * @param {*} dataSource
   * @returns
   * @memberof BidEvaluationProcess
   */
  findCurrentIndex(dataSource = []) {
    const minStepIndex = Number(dataSource && dataSource[0] && dataSource[0].progressSequence); // 最小进度条下标, 应对符合性检查改造
    const current = dataSource.find((item) => !!item.isCurrentFlag);
    if (!current || current.progressSequence < minStepIndex) {
      return;
    }

    return current.progressSequence - minStepIndex;
  }

  /**
   * 遍历渲染step
   *
   * @param {*} item
   * @param {*} index
   * @returns ReactNode
   * @memberof BidEvaluationProcess
   */
  renderStep(item, index) {
    const { dataSource = [] } = this.props;
    const minStepIndex = Number(dataSource && dataSource[0] && dataSource[0].progressSequence); // 最小进度条下标, 应对符合性检查改造
    if (item.progressSequence !== index + minStepIndex) {
      return null;
    }

    return (
      <Step
        key={item.progressSequence}
        title={item.progressNameMeaning}
        description={item.progressMeaning}
      />
    );
  }

  render() {
    const { dataSource = [], ...others } = this.props;

    if (!Array.isArray(dataSource) || !dataSource.length) {
      return null;
    }

    return (
      <Steps
        className={common['exclude-content-card']}
        current={this.findCurrentIndex(dataSource)}
        {...others}
        size={dataSource.length > 5 ? 'small' : 'default'}
      >
        {dataSource.map((item, index) => this.renderStep(item, index))}
      </Steps>
    );
  }
}
