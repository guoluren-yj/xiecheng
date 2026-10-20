/**
 * 发布历史
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { map, noop, isEmpty, throttle } from 'lodash';
import { Icon } from 'choerodon-ui';
import { Progress, Tooltip, Spin } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import styles from './index.less';

const prefixCls = 'release-history-record';
// 配置项
const PAGE_SIZE = 30; // 每次加载30条
const TRIGGER_OFFSET = 100; // 距离底部100px触发加载
const THROTTLE_DELAY = 200; // 节流延迟 200ms

export default function ReleaseHistory(props) {
  const {
    dataSource = {},
    onRepublish = noop,
    onQueryReleasedProgress = noop,
    onDeleteReleasedHistory = noop,
  } = props;
  const [spinning, setSpinning] = useState(false);

  // 1. 状态管理
  const [rawData, setRawData] = useState([]); // 原始3000条数据
  const [renderList, setRenderList] = useState([]); // 渲染列表
  const [currentPage, setCurrentPage] = useState(1); // 当前页码
  const [isLoading, setIsLoading] = useState(false); // 加载中
  const [isAllLoaded, setIsAllLoaded] = useState(false); // 已加载全部
  const scrollContainerRef = useRef(null); // 滚动容器Ref

  useEffect(() => {
    // 当 dataSource 变化时，重新初始化分页与渲染列表
    if (isEmpty(dataSource)) {
      setRawData([]);
      setRenderList([]);
      setCurrentPage(1);
      setIsLoading(false);
      setIsAllLoaded(false);
      return;
    }
    const data = Object.entries(dataSource);
    setRawData(data);
    // 初始化加载第一页
    setRenderList(data.slice(0, PAGE_SIZE));
    setCurrentPage(1);
    setIsAllLoaded(data.length <= PAGE_SIZE);
  }, [dataSource]);

  // 3. 加载下一页数据
  const loadMoreData = useCallback(async () => {
    // 边界校验：加载中/无更多数据 不执行
    if (isLoading || isAllLoaded) return;

    setIsLoading(true);
    try {
      const nextPage = currentPage + 1;
      const startIdx = (nextPage - 1) * PAGE_SIZE;
      const endIdx = nextPage * PAGE_SIZE;
      const newData = rawData.slice(startIdx, endIdx);

      if (newData.length === 0) {
        setIsAllLoaded(true); // 无更多数据
      } else {
        setRenderList((prev) => [...prev, ...newData]); // 追加数据
        setCurrentPage(nextPage);
      }
    } catch (err) {
      console.error('加载数据失败：', err);
    } finally {
      setIsLoading(false); // 无论成功失败，结束加载状态
    }
  }, [currentPage, rawData, isLoading, isAllLoaded]);

  // 4. 滚动监听（用Lodash节流优化）
  const handleScroll = useCallback(
    throttle(() => {
      if (!scrollContainerRef.current) return;

      const { scrollTop, clientHeight, scrollHeight } = scrollContainerRef.current;
      // 计算滚动条距离底部的距离
      const distanceToBottom = scrollHeight - scrollTop - clientHeight;
      // 达到触发条件则加载更多
      if (distanceToBottom <= TRIGGER_OFFSET) {
        loadMoreData();
      }
    }, THROTTLE_DELAY), // Lodash节流：200ms内只执行一次
    [loadMoreData]
  );

  // 5. 绑定/解绑滚动事件
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    // 组件卸载时移除监听，避免内存泄漏
    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
        // 取消Lodash节流的剩余任务（可选，增强鲁棒性）
        handleScroll.cancel();
      }
    };
  }, [handleScroll]);

  const finishedCount = useMemo(() => {
    let count = 0;
    Object.values(dataSource).forEach((value) => {
      if (value.status === 'success' && value.progress === 100) {
        count++;
      }
    });
    return count;
  }, [dataSource]);

  const processingCount = useMemo(() => {
    // 发布中
    let count = 0;
    Object.values(dataSource).forEach((value) => {
      if (value.status === 'success' && value.progress < 100) {
        count++;
      }
    });
    return count;
  }, [dataSource]);

  const totalCount = useMemo(() => Object.values(dataSource).length, [dataSource]);

  const failedCount = totalCount - finishedCount - processingCount;

  const releaseLoading = finishedCount + failedCount < totalCount;

  const releaseStatus = useMemo(() => {
    if (releaseLoading) {
      return 'processing';
    }
    if (failedCount) {
      return 'failed';
    } else {
      return 'success';
    }
  }, [finishedCount, totalCount, releaseLoading]);

  const handleClear = useCallback(async (releaseBatch) => {
    try {
      setSpinning(true);
      await onDeleteReleasedHistory(releaseBatch);
      onQueryReleasedProgress();
    } finally {
      setSpinning(false);
    }
  }, []);

  const handleRepublish = useCallback(async (releaseBatch) => {
    try {
      setSpinning(true);
      await onRepublish(releaseBatch);
      onQueryReleasedProgress();
    } finally {
      setSpinning(false);
    }
  }, []);

  const renderProcessingItem = (item) => {
    const { totalCount: count, progress } = item;
    return (
      <div className={styles[`${prefixCls}-processing-item-wrapper`]}>
        <Icon type="publish2" />
        <span className={styles[`${prefixCls}-item-count`]}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.priceReleaseCount`, {
              count,
            })
            .d('发布{count}条价格')}
        </span>
        <span className={styles[`${prefixCls}-item-rate`]}>
          {intl.get(`ssrc.priceLibraryNew.view.message.priceReleaseStatus`).d('正在发布价格')}{' '}
          {progress}%
        </span>
        <div className={styles[`${prefixCls}-item-progress`]}>
          <div
            className={styles[`${prefixCls}-item-progress-finished`]}
            style={{ width: `${Number(progress)}%` }}
          />
          <div
            className={styles[`${prefixCls}-item-progress-pending`]}
            style={{ width: `${100 - Number(progress)}%` }}
          />
        </div>
      </div>
    );
  };
  const renderSucceedItem = (item) => {
    const { totalCount: count, deliveryDate, releaseBatch } = item;
    return (
      <div className={styles[`${prefixCls}-succeed-item-wrapper`]}>
        <Icon type="publish2" />
        <span className={styles[`${prefixCls}-item-count`]}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.priceReleaseCount`, {
              count,
            })
            .d('发布{count}条价格')}
        </span>
        <span className={styles[`${prefixCls}-succeed-item-time`]}>
          {deliveryDate}
          <Icon type="check_circle" className={styles['icon-succeed']} />
          <Icon
            type="close"
            className={styles['icon-close']}
            onClick={() => handleClear(releaseBatch)}
          />
        </span>
      </div>
    );
  };
  const renderFailedItem = (item) => {
    const { totalCount: count, releaseBatch, errorMsg } = item;
    return (
      <div className={styles[`${prefixCls}-failed-item-wrapper`]}>
        <Icon type="publish2" />
        <span className={styles[`${prefixCls}-item-count`]}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.priceReleaseCount`, {
              count,
            })
            .d('发布{count}条价格')}
        </span>
        <span className={styles[`${prefixCls}-failed-item-desc`]}>
          {intl.get(`ssrc.priceLibraryNew.view.message.releaseFailed`).d('发布失败, 请重新发布')}
          <Tooltip title={intl.get(`ssrc.priceLibraryNew.view.message.releaseAgain`).d('重新发布')}>
            <Icon
              type="replay"
              className={styles['icon-replay']}
              onClick={() => handleRepublish(releaseBatch)}
            />
          </Tooltip>
          <Icon
            type="close"
            className={styles['icon-close']}
            onClick={() => handleClear(releaseBatch)}
          />
        </span>
        {errorMsg ? (
          <div className={styles['release-msg']}>
            <div className={styles['release-msg-name']}>
              {intl.get(`ssrc.priceLibraryNew.view.message.failedReasons`).d('失败原因:')}
            </div>
            <div
              className={styles['release-msg-content']}
              onMouseEnter={(e) => handleEnter(e, errorMsg)}
              onMouseLeave={handleLeave}
            >
              {errorMsg}
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  // 鼠标进入事件（使用 useCallback memoize）
  const handleEnter = useCallback((e, errorMsg) => {
    const { target } = e;
    if (target && target.scrollHeight > target.clientHeight) {
      Tooltip.show(target, {
        title: errorMsg,
        placement: 'leftTop',
      });
    }
  }, []);

  const handleLeave = useCallback(() => {
    Tooltip.hide();
  }, []);

  const renderItem = (item) => {
    if (item.status === 'success' && item.progress === 100) {
      return renderSucceedItem(item);
    } else if (item.status === 'success' && item.progress < 100) {
      return renderProcessingItem(item);
    } else {
      return renderFailedItem(item);
    }
  };

  const renderProcessingTitle = () => {
    return (
      <>
        <Progress key="loading" type="loading" size="small" />
        <span className={styles['release-status']}>
          {intl.get(`ssrc.priceLibraryNew.view.message.finished`).d('已完成')}（
          {`${finishedCount}/${totalCount}`}）
        </span>
      </>
    );
  };
  const renderSucceedTitle = () => {
    return (
      <>
        <Icon type="check_circle" className={styles['icon-succeed']} />
        <span className={styles['release-status']}>
          {intl.get(`ssrc.priceLibraryNew.view.message.finished`).d('已完成')}（
          {`${finishedCount}/${totalCount}`}）
        </span>
        {!isEmpty(dataSource) && (
          <span className={styles['clear-btn']} onClick={() => handleClear()}>
            {intl.get(`ssrc.priceLibraryNew.view.button.clearAll`).d('全部清空')}
          </span>
        )}
      </>
    );
  };
  const renderFailedTitle = () => {
    return (
      <>
        <Icon type="cancel" className={styles['icon-failed']} />
        <span className={styles['release-status']}>
          {intl
            .get(`ssrc.priceLibraryNew.view.message.releaseFailedInfo`, { count: failedCount })
            .d('{count}项发布失败')}
        </span>
        {!isEmpty(dataSource) && (
          <span className={styles['clear-btn']} onClick={() => handleClear()}>
            {intl.get(`ssrc.priceLibraryNew.view.button.clearAll`).d('全部清空')}
          </span>
        )}
      </>
    );
  };

  const renderTitle = () => {
    switch (releaseStatus) {
      case 'processing':
        return renderProcessingTitle();
      case 'success':
        return renderSucceedTitle();
      case 'failed':
        return renderFailedTitle();
      default:
        return renderProcessingTitle();
    }
  };

  return (
    <Spin spinning={spinning}>
      <div className={styles[`${prefixCls}-container`]}>
        <div className={styles[`${prefixCls}-title`]}>{renderTitle()}</div>
        <div className={styles[`${prefixCls}-content`]} ref={scrollContainerRef}>
          {isEmpty(dataSource) && (
            <div className={styles[`${prefixCls}-empty-wrapper`]}>
              <span>{intl.get('ssrc.priceLibraryNew.view.message.emptyData').d('暂无数据')}</span>
            </div>
          )}
          {map(renderList, ([key, item]) => {
            return <div key={key}>{renderItem(item)}</div>;
          })}
          {/* 加载状态提示 */}
          <div style={{ textAlign: 'center', padding: '16px', color: '#6b7280' }}>
            {isAllLoaded && !isLoading && (
              <span>
                {intl
                  .get('ssrc.priceLibraryNew.view.message.loadEnd', {
                    length: renderList.length,
                  })
                  .d(`已加载全部${renderList.length}条历史记录`)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Spin>
  );
}
