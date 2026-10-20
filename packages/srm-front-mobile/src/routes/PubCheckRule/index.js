/**
 * 审核结果页面
 */
import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import uuid from 'uuid/v4';
import { connect } from 'dva';
import classNames from 'classnames';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { Icon } from 'choerodon-ui/pro';

import { fetchRuleResult } from '@/services/pubCheckRuleService';
import { getLocationParam } from '@/utils/utils';

import styles from './index.less';

function PubCheckRule({ location }) {
  const {
    documentCode = '',
    categoryCode = '',
    bindObjFieldValue = '',
    batchId = '',
    needHeader = true,
  } = location && location.search ? getLocationParam(location.search) : {};

  const [expandedItems, setExpandedItems] = useState({});
  const [resultList, setResultList] = useState([]);

  useEffect(() => {
    if (documentCode && categoryCode && bindObjFieldValue) {
      fetchRuleResult({
        documentCode,
        categoryCode,
        bindObjFieldValue,
        batchId,
      }).then(res => {
        if (getResponse(res) && Array.isArray(res)) {
          const resultArray = [];
          const toogleMap = {};

          const result = res.length ? [res[0]] : [];

          if (result.length) {
            result.forEach(item => {
              if (item.ruleResultDetail && item.ruleResultDetail.length) {
                item.ruleResultDetail.forEach(item2 => {
                  const _uuid = uuid();
                  resultArray.push({
                    ...item,
                    ...item2,
                    ruleResultDetail: null,
                    _uuid,
                  });
                  toogleMap[_uuid] = true;
                });
              }
            });
          }

          setResultList(resultArray);
          setExpandedItems(toogleMap);
        }
      });
    }
  }, [documentCode, categoryCode, bindObjFieldValue, batchId]);

  const toggleExpand = id => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const finalResultMap = {
    EXECUTING: styles.executing, // 执行中
    FAIL: styles.alert, // 审核失败
    APPROVED: styles.passed, // 审核通过
    REJECTED: styles.rejected, // 审核拒绝
  };

  const finalResultMsg = {
    EXECUTING: intl.get('smbl.checkRules.view.title.executing').d('审核中'), // 执行中
    FAIL: intl.get('smbl.checkRules.view.title.fail').d('执行失败'), // 执行失败
    APPROVED: intl.get('smbl.checkRules.view.title.approved').d('审核通过'), // 审核通过
    REJECTED: intl.get('smbl.checkRules.view.title.rejected').d('审核拒绝'), // 审核拒绝
  };

  return (
    <>
      {needHeader && needHeader !== 'false' ? (
        <Header title={intl.get('smbl.checkRules.view.title.checkRuleTitle').d('智能审核')} />
      ) : null}

      <div
        className={styles['check-rule-result-body']}
        style={{ height: needHeader && needHeader !== 'false' ? 'calc(100vh - 172px)' : '100%' }}
      >
        {resultList.map(item => (
          <div key={item._uuid} className={styles['rule-item']}>
            <div
              className={classNames(styles['rule-header'], styles[item.finalResult])}
              onClick={() => toggleExpand(item._uuid)}
            >
              <div className={styles['expand-icon']}>
                <span
                  className={classNames(
                    styles.arrow,
                    expandedItems[item._uuid] ? styles.expanded : ''
                  )}
                >
                  <Icon type="baseline-arrow_drop_up" style={{ color: '#1D2129' }} />
                </span>
              </div>
              {/* <div
                className={classNames(styles['rule-status'], executeStatusMap[item.executeStatus])}
              >
                <span className={styles['status-icon']} style={{ marginLeft: '8px' }}>
                  {executeStatusMsg[item.executeStatus]}
                </span>
              </div> */}

              <div className={styles['rule-title']}>
                {item.documentName && item.categoryName
                  ? `${item.documentName}-${item.categoryName}`
                  : item.documentName || item.categoryName || item.ruleName || ''}
              </div>
              <div
                className={classNames(
                  styles['rule-status'],
                  finalResultMap[
                    ['REJECTED', 'APPROVED'].includes(item.finalResult)
                      ? item.approveStatus
                      : item.finalResult
                  ]
                )}
              >
                <span className={styles['status-icon']}>
                  {['REJECTED', 'APPROVED'].includes(item.finalResult)
                    ? finalResultMsg[item.approveStatus]
                    : finalResultMsg[item.finalResult]}
                </span>
              </div>
            </div>
            {expandedItems[item._uuid] && (
              <div className={styles['rule-content']}>
                <div>
                  <div className={styles['rule-row']}>
                    <div className={styles['rule-label']}>
                      {intl.get('smbl.checkRules.view.title.ruleRequirement').d('规则要求')}
                    </div>
                    <div className={styles['rule-text']}> {item.ruleDetail}</div>
                  </div>
                  <div className={styles['rule-row']}>
                    <div className={styles['rule-label']}>
                      {intl.get('smbl.checkRules.view.title.matchResult').d('匹配结果')}
                    </div>
                    <div className={styles['rule-text']}>{item.executeResult}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default connect()(
  formatterCollections({
    code: ['smbl.checkRules'],
  })(PubCheckRule)
);
