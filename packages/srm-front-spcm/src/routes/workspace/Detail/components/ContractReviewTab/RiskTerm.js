import React, { useState, useEffect } from 'react';
import { Tabs, useDataSet, Icon, Button, Spin } from 'choerodon-ui/pro';

import { observer } from 'mobx-react-lite';
import { isFunction, flow } from 'lodash';
// import { getResponse } from 'utils/utils';

import { EventManager } from '_utils/utils';
import intl from 'utils/intl';

// import { generateSmartReview } from '@/services/contractCommonService';
import { ReactComponent as NoData } from '@/assets/smartReview/review-no-data.svg';
import RiskTermInfo from '@/routes/components/SmartReview/RiskTermInfo';
import { getIndexDS } from '@/routes/components/SmartReview/stores/indexDS';

import styles from './styles.less';

const { TabPane } = Tabs;

export const getTabPane = () => [
  {
    key: 'unPassedRisk',
    tab: intl.get('spcm.workspace.view.title.unPassedRisk').d('不通过'),
  },
  {
    key: 'ignoreRish',
    tab: intl.get('spcm.workspace.view.title.ignoreRish').d('已忽略'),
  },
  {
    key: 'passedRisk',
    tab: intl.get('spcm.workspace.view.title.passedRisk').d('通过'),
  },
];

const RiskTerm = (props) => {
  const {
    pcHeaderId,
    customizeForm = () => {},
    onChangeState,
    editorOnlineRef,
    handleSaveAndSmartReview,
    code = 'SPCM.WORKSPACE_DETAIL.SMART_REVIEW_C',
  } = props;

  const [activeKey, setActiveKey] = useState('unPassedRisk');
  const [loading, setLoading] = useState(false);
  const [defaultActiveKey, setDefaultActiveKey] = useState([]);

  const dataSet = useDataSet(() => getIndexDS({ pcHeaderId, isEdit: false }), [pcHeaderId]);

  useEffect(() => {
    // 设置默认查询条件
    initDefaultQueryParam();
  }, [pcHeaderId, activeKey]);

  // 设置默认查询条件
  const initDefaultQueryParam = () => {
    let queryParams = {
      ignoreFlag: 0,
      onlyPassFlag: 0,
    };
    switch (activeKey) {
      case 'passedRisk':
        queryParams = {
          ignoreFlag: 0,
          onlyPassFlag: 1,
        };
        break;
      case 'ignoreRish':
        queryParams = {
          ignoreFlag: 1,
          onlyPassFlag: 0,
        };
        break;
      default:
        queryParams = {
          ignoreFlag: 0,
          onlyPassFlag: 0,
        };
    }
    dataSet.setQueryParameter('queryParams', {
      sortField: 'riskLevel',
      customizeUnitCode: code,
      ...queryParams,
    });
    dataSet.query().then(() => {
      if (activeKey === 'unPassedRisk') {
        const keys = dataSet.map((record) => `${record.get('lineNum')}`);
        setDefaultActiveKey(keys);
      } else {
        setDefaultActiveKey([]);
      }
    });
  };

  const handleTabChange = (key) => {
    setActiveKey(key);
  };

  const handleSearchKeyWords = (text = '') => {
    EventManager.emit('SEARCH_KEY_INFO', text); // 搜索当前文本
  };

  const closeReviewResult = () => {
    onChangeState({ hiddenReviewResultFlag: true });
  };

  // 生成审查信息
  // const handleGenerateReviewInfo = async () => {
  //   const payload = {
  //     pcHeaderId,
  //     ignoreSmartFlag: false,
  //     ignoreSmartCompareFlag: false,
  //   };
  //   const res = await generateSmartReview(payload);
  //   if (getResponse(res)) {
  //     initDefaultQueryParam();
  //   }
  // };

  // 重新审查
  const handleAgainReview = async () => {
    try {
      setLoading(true);
      // 手动保存编辑文档
      if (editorOnlineRef?.current && isFunction(editorOnlineRef?.current.saveDocument)) {
        const res = await editorOnlineRef.current.saveDocument({ data: 'saveDocument' });
        if (!res) {
          return false;
        }
      }
      // 重新审查
      // await handleGenerateReviewInfo();
      await handleSaveAndSmartReview({
        triggerType: 'REFRESH_REVIEW',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className={styles['review-result-wrapper-title']}>
        <div>
          <h3>{intl.get('spcm.workspace.title.reviewResult').d('审查结果')}</h3>
          <Button icon="cached" loading={loading} onClick={handleAgainReview} funcType="flat">
            {intl.get('spcm.workspace.button.againReview').d('重新审查')}
          </Button>
        </div>
        <Icon type="close" onClick={closeReviewResult} />
      </div>
      <Tabs activeKey={activeKey} onChange={handleTabChange} animated={false}>
        {getTabPane().map((panl) => {
          const { key, tab = '' } = panl;
          return (
            <TabPane forceRender key={key} tab={tab}>
              {dataSet?.length ? (
                <Spin spinning={loading}>
                  <RiskTermInfo
                    hiddenIgnoreBtn={false}
                    pcHeaderId={pcHeaderId}
                    defaultActiveKey={defaultActiveKey}
                    handleSearchKeyWords={handleSearchKeyWords}
                    dataSet={dataSet}
                    customizeForm={customizeForm}
                    code={code}
                    riskStyleClass={styles['review-result-content']}
                  />
                </Spin>
              ) : (
                <div className={styles['review-result-noData']}>
                  <NoData />
                </div>
              )}
            </TabPane>
          );
        })}
      </Tabs>
    </>
  );
};

export default flow(observer)(RiskTerm);
