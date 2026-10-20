import React, { useState, useCallback, useEffect } from 'react';
import { Progress as C7nProgress, Button, Icon, Tooltip } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

export default function Progress({ taskInfo = {}, handleBack, reExecute }) {
  const { status, process = '', remainder, operationId, executeCount, totalCount } = taskInfo;
  // const successBackTime = observable.box(3);
  const [successBackTime, setSuccessBackTime] = useState(5);
  let successBackTimer = null;

  const getProgressNumber = (v) => {
    if (typeof v === 'string') {
      return Number(v.substring(0, v.length - 1));
    }
    return 0;
  };

  // 执行成功的倒计时
  useEffect(() => {
    if (status === 'SUCCESS') {
      successBackTimer = setInterval(() => {
        // successBackTime.set(successBackTime.get() > 0 ? successBackTime.get() - 1 : 0);
        setSuccessBackTime((v) => (v > 1 ? v - 1 : 1));
        if (successBackTime === 1) {
          // 自动立即返回并清除定时器
          handleSelfBack();
        }
      }, 1000);
    }
    return () => {
      clearInterval(successBackTimer); // 组件卸载
    };
  }, [status, successBackTime]);

  const getProgressDesc = useCallback(() => {
    switch (status) {
      case 'EXECUTING':
        return {
          title: intl.get('smpc.product.view.nowExecuting').d('正在执行…'),
          color: 'active',
        };
      case 'SUCCESS':
        return {
          title: intl.get('smpc.product.view.executeSuccess').d('执行成功'),
          color: 'success ',
        };
      case 'PART_FAILED':
        return {
          title: intl.get('smpc.product.view.partException').d('部分执行失败'),
          color: 'exception ',
        };
      case 'FAILED':
        return {
          title: intl.get('smpc.product.view.executeException').d('执行失败'),
          color: 'exception',
        };
      default:
        return {};
    }
  }, [status]);

  const handleSelfBack = () => {
    // 清空定时器
    clearInterval(successBackTimer);
    handleBack();
  };

  const { title, color } = getProgressDesc();
  return (
    <div className={styles['ec-operate-progress']}>
      <C7nProgress value={getProgressNumber(process)} type="circle" status={color} />
      <div className="progress-info">
        <p className="progress-status">{title}</p>
        {status === 'EXECUTING' && (
          <div className="execute">
            <p>
              {intl.get('smpc.product.view.restExecuteTime').d('预估剩余时间：')}
              {remainder}
            </p>
            <p>
              {intl
                .get('smpc.product.view.executingInfo')
                .d('您可以先返回进行其他操作，完成后会自动弹出提示')}
            </p>
          </div>
        )}
        {status === 'SUCCESS' && (
          <div className="execute executed-success">
            <p>
              <span>{intl.get('smpc.product.view.executedSuccessInfo.prefix').d('页面将于 ')}</span>
              {/* <Observer>
                  {() => <span className='success-last-time'>{successBackTime}s</span>}
                </Observer> */}
              <span className="success-last-time">{successBackTime}s</span>
              <span>
                {intl.get('smpc.product.view.executedSuccessInfo.suffix').d(' 后自动返回')}
              </span>
            </p>
            <p className="execute-operate">
              <div className="btn" onClick={handleSelfBack}>
                <Button funcType="link" icon="arrow_back">
                  {intl.get('smpc.product.view.executeSuccessInfo').d('立即返回')}
                </Button>
              </div>
            </p>
          </div>
        )}
        {!['EXECUTING', 'SUCCESS'].includes(status) && (
          <div className="execute executed-error">
            {status === 'PART_FAILED' && (
              <div className="error-count-wrap">
                <p className="count-field">
                  <span>{intl.get('smpc.product.view.success').d('成功：')}</span>
                  <span className="count-field-success">{executeCount}</span>
                </p>
                <p className="count-field">
                  <span>{intl.get('smpc.product.view.error').d('失败：')}</span>
                  <span className="count-field-error">{totalCount - executeCount}</span>
                </p>
              </div>
            )}
            <p style={{ wordBreak: 'break-all' }}>
              {intl
                .get('smpc.product.view.networkErrorInfo')
                .d('网络异常，请重新执行，若仍未成功请联系管理员')}
            </p>
            <p className="execute-operate">
              <div className="btn">
                <Button
                  funcType="link"
                  size="small"
                  icon="refresh"
                  onClick={() => reExecute(operationId)}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    {intl.get('smpc.product.view.reExecute').d('重新执行')}
                    <Tooltip
                      title={intl
                        .get('smpc.product.view.reExecuteInfo')
                        .d('将开启同样条件的新任务,当前任务操作失败的商品将在新任务中执行')}
                      popupClassName="condition-reExecute-tooltip"
                    >
                      <Icon type="help" style={{ fontSize: 12, color: '#868D9C', marginLeft: 4 }} />
                    </Tooltip>
                  </span>
                </Button>
              </div>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
