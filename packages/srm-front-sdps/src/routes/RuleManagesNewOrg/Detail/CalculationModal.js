import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { NumberField, Button, TextField, Tooltip } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import { Alert } from 'choerodon-ui';

// import { ReactComponent as NoContent } from '@/assets/no_result.svg';
import { fetchGetCalculationResult, fetchIndexList } from '@/services/ruleManagesOrgService';

import styles from './index.less';

// let dynamicFormDS = null;

let paramObj = {};

export default function CalculationModal(props) {
  const { ruleManagementHeaderId, ruleCode, code } = props;

  const [fieldsList, setFieldsList] = useState([]);
  const [fetchEnd, setFetchEnd] = useState(false);
  const [calculateResult, setResult] = useState({});
  const [showAlert, setShowAlert] = useState(true);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchIndexList({
      ruleManagementHeaderId,
    }).then((res) => {
      if (getResponse(res) && res.content && res.content.length) {
        res.content.forEach((item) => {
          paramObj[item.indexCode] = '';
        });
        setFieldsList(res?.content ?? []);
      }
    });

    return () => {
      paramObj = {};
    };
  }, [ruleManagementHeaderId]);

  useEffect(() => {
    if (refresh) {
      setRefresh(false);
    }
  }, [refresh]);

  /**
   * 试算 能点击按钮 说明标识都有值
   */
  const handleCalculation = () => {
    const indexList = Object.keys(paramObj).map((item) => {
      return {
        indexCode: item,
        value: paramObj[item],
      };
    });

    fetchGetCalculationResult({
      ruleManagementHeaderId,
      ruleCode,
      code,
      indexList,
    }).then((res) => {
      if (getResponse(res)) {
        setResult(res);
        setFetchEnd(true);
      }
    });
  };

  const handleInput = (e, field) => {
    if (field) {
      paramObj[field] = e?.target?.value ?? '';
    }
    setRefresh(true);
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
  };

  const resultRow = (text, value, stys = {}) => {
    return (
      <div className={styles['calculated-result-row']} style={{ ...stys }}>
        <div style={{ color: '#868D9C' }}>{text}</div>
        <div
          style={{
            color: '#1D2129',
            maxWidth: '220px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          <Tooltip title={value}>{value}</Tooltip>
        </div>
      </div>
    );
  };

  // 是否可点击试算按钮，全部字段填完才可以
  const isCanClick = Object.keys(paramObj).filter((item) => !paramObj[item] && paramObj[item] !== 0)
    .length;

  let maxHeightVal = 'calc(100vh - 196px)';
  if (showAlert && fetchEnd) {
    maxHeightVal = 'calc(100vh - 388px)';
  } else if (showAlert && !fetchEnd) {
    maxHeightVal = 'calc(100vh - 250px)';
  } else if (!showAlert && fetchEnd) {
    maxHeightVal = 'calc(100vh - 334px)';
  }

  return (
    <div className={styles['calculate-modal-basic']}>
      {fieldsList.length ? (
        <>
          <Alert
            showIcon
            iconType="help"
            message={intl
              .get('sdps.ruleManagesDetail.view.message.alertMsg')
              .d('当前规则下策略包含如下指标，输入对应指标值后点击“试算”将得出该条件下匹配的策略')}
            type="success"
            closable
            onClose={handleCloseAlert}
          />
          <div
            style={{
              maxHeight: maxHeightVal,
              overflow: 'auto',
              padding: '20px 20px 0 20px',
            }}
          >
            {fieldsList.map((item) => {
              return (
                <div
                  key={item?.indexCode}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div
                      style={{
                        color: '#1D2129',
                        width: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item?.indexName}
                    </div>
                    <div
                      style={{
                        color: '#868D9C',
                        width: '160px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item?.indexCode}
                    </div>
                  </div>
                  <div>
                    {item.dataType === 'number' ? (
                      <NumberField
                        name={item.indexCode}
                        style={{ width: '160px' }}
                        onInput={(e) => handleInput(e, item?.indexCode)}
                      />
                    ) : (
                      <TextField
                        name={item.indexCode}
                        style={{ width: '160px' }}
                        onInput={(e) => handleInput(e, item?.indexCode)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className={styles['calculate-result-panel']}>
            <Button
              style={{ width: '100%', marginTop: '16px' }}
              color="primary"
              onClick={handleCalculation}
              disabled={isCanClick}
            >
              {intl.get('sdps.ruleManagesDetail.view.button.trial').d('试算')}
            </Button>

            {fetchEnd ? (
              <div style={{ padding: '16px', backgroundColor: '#F2F3F5', marginTop: '16px' }}>
                {resultRow(
                  intl.get('sdps.ruleManagesDetail.view.button.trialResult').d('试算结果'),
                  calculateResult?.resultValue ?? ''
                )}
                {resultRow(
                  intl.get('sdps.ruleManagesDetail.view.button.matchedStrategy').d('匹配策略'),
                  calculateResult?.actionName ?? '',
                  { marginTop: '4px' }
                )}
                {resultRow(
                  intl.get('sdps.ruleManagesDetail.view.button.strategyPriority').d('策略优先级'),
                  calculateResult?.priority ?? '',
                  { marginTop: '4px' }
                )}
                {resultRow(
                  intl
                    .get('sdps.ruleManagesDetail.view.button.conditionExpression')
                    .d('条件表达式'),
                  calculateResult?.conditionExpression ?? '',
                  { marginTop: '4px' }
                )}
                {resultRow(
                  intl.get('sdps.ruleManagesDetail.view.button.executedExpression').d('执行表达式'),
                  calculateResult?.executeExpression ?? '',
                  { marginTop: '4px' }
                )}
              </div>
            ) : null}
          </div>
        </>
      ) : (
        <>
          {/* <div>
            <NoContent style={{ width: '136px', height: '96px' }} />
          </div> */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '300px',
              color: '#101319',
              fontSize: '12px',
            }}
          >
            {intl.get('hzero.common.components.noticeIcon.null').d('暂无数据')}
          </div>
        </>
      )}
    </div>
  );
}
