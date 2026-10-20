/**
 * @Description: 供应商评估策略 - 历史版本
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-29 17:38:53
 * @FilePath: /srm-front-sslm/src/routes/EvaluationStrategy/Details/HistoryVersion.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { useState, useMemo, useEffect } from 'react';
import { DataSet, Form, Output, Spin } from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';
import { isNil } from 'lodash';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
// import { renderStatus } from '@/routes/components/utils';
import { getBasicInfoDs } from '../stores/detailsDs';
import styles from '../index.less';

const HistoryVersion = ({ strategyId }) => {
  const basicInfoDs = useMemo(() => new DataSet(getBasicInfoDs()), [strategyId]);

  const [loading, setLoading] = useState(false);

  const handleQuery = () => {
    setLoading(true);
    basicInfoDs.setQueryParameter('strategyId', strategyId);
    basicInfoDs.query().finally(() => setLoading(false));
  };

  // 页面初始化查询数据
  useEffect(() => {
    handleQuery();
  }, [strategyId]);
  return (
    <Spin spinning={loading}>
      <div className={styles.historyContent}>
        <TopSection>
          <SecondSection
            title={intl.get('sslm.evaluationStrategyDetail.tabs.TabPane.basicInfo').d('基础信息')}
          >
            <div className={styles.historyFormContent}>
              <Form
                dataSet={basicInfoDs}
                columns={3}
                labelLayout="vertical"
                className="addon-before-style,c7n-pro-vertical-form-display"
              >
                <Output name="strategyCode" />
                <Output name="strategyName" />
                {/* <Output
                  name="strategyStatusMeaning"
                  renderer={({ value }) => {
                    renderStatus({ value });
                  }}
                /> */}
                <Output name="assessType" />
                <Output name="versionNumber" />
                <Output name="realName" />
                <Output name="creationDate" />
              </Form>
            </div>
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.evaluationStrategyDetail.tabs.TabPane.supEvaProRules')
              .d('供应商评估计划规则')}
          >
            <div className={styles.historyFormContent}>
              <Form
                dataSet={basicInfoDs}
                columns={3}
                labelLayout="vertical"
                className="addon-before-style,c7n-pro-vertical-form-display"
              >
                <Output name="needFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Output name="preciseFlag" renderer={({ value }) => yesOrNoRender(value)} />
              </Form>
            </div>
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.evaluationStrategyDetail.tabs.TabPane.supEvaRules')
              .d('供应商评估规则')}
          >
            <div className={styles.historyFormContent}>
              <Form
                dataSet={basicInfoDs}
                columns={3}
                labelLayout="vertical"
                className="addon-before-style,c7n-pro-vertical-form-display"
              >
                <Output name="evalType" />
                <Output name="evalTplCode" />
              </Form>
            </div>
          </SecondSection>
          <SecondSection
            title={intl
              .get('sslm.evaluationStrategyDetail.tabs.TabPane.purSupIntRules')
              .d('采供方交互规则')}
          >
            <div className={styles.historyFormContent}>
              <Form
                dataSet={basicInfoDs}
                columns={3}
                labelLayout="vertical"
                className="addon-before-style,c7n-pro-vertical-form-display"
              >
                <Output
                  name="supplierSelfAssessmentFlag"
                  renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(value))}
                />
                <Output
                  name="selfIndicatorType"
                  renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(value))}
                />
                <Output name="evalScope" />
                <Output
                  name="supplierAutoPublishFlag"
                  renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(value))}
                />
                <Output
                  name="viewParentFlag"
                  renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(value))}
                />
                <Output
                  name="autoExecuteFlag"
                  renderer={({ value }) => (isNil(value) ? '-' : yesOrNoRender(value))}
                />
              </Form>
            </div>
          </SecondSection>
        </TopSection>
      </div>
    </Spin>
  );
};

export default HistoryVersion;
