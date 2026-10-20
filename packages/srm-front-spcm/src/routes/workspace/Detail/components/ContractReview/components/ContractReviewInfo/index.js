/*
 * ContractReviewInfo - 审查信息
 * @Date: 2025-03-10 10:19:06
 * @Author: CDJ
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { useState, useEffect } from 'react';
import { Tabs } from 'choerodon-ui/pro';

import { EventManager } from '_utils/utils';

import ReviewInfo from "@/routes/components/SmartReview/ReviewInfo";

import { getTabPane } from "../../utils/utils";

import styles from './styles.less';

const { TabPane } = Tabs;

const Index = (props) => {
  const {
    pcHeaderId,
    dataSet,
    customizeForm = () => {},
  } = props;

  const [activeKey, setActiveKey] = useState('allRisk');

  useEffect(() => {
  }, []);


  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleSearchKeyWords = (text = '') => {
    EventManager.emit('SEARCH_KEY_INFO', text); // 搜索当前文本
  };

  return (
    <div className={styles['spcm-workspace-review-risk-tabs']}>
      <Tabs activeKey={activeKey} onChange={handleTabChange} animated={false}>
        {getTabPane().map((panl) => {
          const { key, tab = '' } = panl;
          return (
            <TabPane
              forceRender
              key={key}
              tab={tab}
            >
              <ReviewInfo
                hiddenIgnoreBtn={false}
                pcHeaderId={pcHeaderId}
                handleSearchKeyWords={handleSearchKeyWords}
                dataSet={dataSet}
                customizeForm={customizeForm}
              />
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
};

export default Index;
