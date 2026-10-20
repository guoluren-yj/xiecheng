/*
 * SmartReview - 智能审查
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect } from 'react';
import classnames from 'classnames';
import { isFunction, compose } from 'lodash';

import { Spin, useDataSet } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import intl from 'utils/intl';
import { EventManager } from '_utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import ReviewInfo from './ReviewInfo';
import { getIndexDS } from './stores/indexDS';

import styles from './styles.less';

const { Panel } = Collapse;

const Index = ({
  hiddenIgnoreBtn = true,
  pcHeaderId,
  handleSearchKeyWords,
  isEdit = false,
  customizeForm,
  code,
  workFlowFlag,
  approvalFLag,
} = {}) => {
  const ds = useDataSet(() => getIndexDS({ pcHeaderId, isEdit }), [pcHeaderId, isEdit]);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleQueryRiskInfo();
  }, [pcHeaderId]);

  // 查询风险信息
  const handleQueryRiskInfo = () => {
    if (pcHeaderId) {
      ds.setQueryParameter('queryParams', {
        sortField: 'riskLevel',
        // 审批工作台默认查询失败的和已忽略的
        onlyPassFlag: 0,
        customizeUnitCode: code,
      });
      setLoading(true);
      ds.query().finally(() => setLoading(false));
    }
  };

  const onSearchKeyWords = (text = '') => {
    if (isFunction(handleSearchKeyWords)) {
      handleSearchKeyWords(text);
    } else {
      EventManager.emit('SEARCH_KEY_INFO', text); // 搜索当前文本
    }
  };

  return (
    <Spin spinning={loading}>
      <div
        className={classnames(styles['spcm-contract-review-wapper'], {
          // [styles['spcm-contract-review-embed']]: embedFlag,
          [styles['spcm-contract-review-workflow']]: workFlowFlag,
          [styles['spcm-contract-review-approval']]: approvalFLag,
        })}
      >
        <Collapse
          bordered={false}
          defaultActiveKey={['smartReview']}
          expandIconPosition="text-right"
          trigger="text-icon"
        >
          <Panel
            header={intl.get('spcm.common.view.title.smartReview').d('智能审查')}
            key="smartReview"
            forceRender
          >
            <ReviewInfo
              hiddenIgnoreBtn={hiddenIgnoreBtn}
              pcHeaderId={pcHeaderId}
              handleSearchKeyWords={onSearchKeyWords}
              dataSet={ds}
              customizeForm={customizeForm}
              code={code}
            />
          </Panel>
        </Collapse>
      </div>
    </Spin>
  );
};

export default compose(
  formatterCollections({
    code: ['spcm.common', 'spcm.workspace'],
  })
)(Index);
