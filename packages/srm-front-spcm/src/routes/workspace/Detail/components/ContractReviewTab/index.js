/*
 * @Description: 审查结果-侧边栏
 * @Date: 2025-11-26 17:18:18
 * @Author: MYT<yitian.mao@going-link.com>
 * @Version: 1.0.0
 * @Copyright: Copyright (c) 2021, ZhenYun
 */
import React from 'react';

import classNames from 'classnames';
import { flow } from 'lodash';
import formatterCollections from 'utils/intl/formatterCollections';

import RiskTerm from './RiskTerm';

import styles from './styles.less';

const Index = (props) => {
  const { hiddenReviewResultFlag, checkDuplicationFlag, textComparisonVisible } = props;

  return !hiddenReviewResultFlag && Number(checkDuplicationFlag) === 3 ? (
    <div
      className={classNames(styles['review-result-wrapper'], {
        [styles['review-result-hidden']]: hiddenReviewResultFlag,
        [styles['review-result-doc-mode']]: !textComparisonVisible,
        [styles['review-result-text-mode']]: textComparisonVisible,
      })}
    >
      <RiskTerm {...props} />
    </div>
  ) : null;
};

export default flow(
  formatterCollections({
    code: ['spcm.common', 'spcm.workspace'],
  })
)(Index);
