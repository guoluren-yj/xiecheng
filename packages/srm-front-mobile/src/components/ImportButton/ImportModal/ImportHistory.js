/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { Tooltip, Spin, Button } from 'choerodon-ui/pro';
import { Timeline, Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import { downloadFileByAxios } from '@/utils/file';

import { queryImportLogHeaders } from '@/services/checkRuleService';
import styles from '../index.less';
import { ImportStatusRenderer } from './util';

const TimelineItem = Timeline.Item;
const tenantId = getCurrentOrganizationId();
const PAGE_SIZE = 20;
const SCROLL_BOTTOM_OFFSET = 20;
const STATUS_MAP = {
  SUCCESS: 'pass',
  FAIL: 'error',
  ERROR: 'error',
  WARNING: 'warn',
  WARN: 'warn',
  IMPORTING: null,
  PROCESSING: null,
};

const ImportHistory = ({ fetchLinesData }) => {
  const [currentNodeId, setCurrentNodeId] = useState();
  const [listData, setListData] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const fetchLinesDataRef = useRef(fetchLinesData);
  const [downLoading, setDownLoading] = useState(false);

  useEffect(() => {
    fetchLinesDataRef.current = fetchLinesData;
  }, [fetchLinesData]);

  const normalizeItem = useCallback((item) => {
    const passCount = item.successCount || item.passCount || 0;
    const warnCount = item.warnCount || item.warningCount || 0;
    const errorCount = item.failCount || 0;
    const totalCount = item.totalCount ?? passCount + warnCount + errorCount;
    const status = STATUS_MAP[item.importStatus] ?? item.importStatus?.toLowerCase();
    const statusCount = totalCount
      ? {
          ...(passCount ? { pass: passCount } : {}),
          ...(warnCount ? { warn: warnCount } : {}),
          ...(errorCount ? { error: errorCount } : {}),
        }
      : null;

    return {
      ...item,
      status,
      userName: item.importUserName,
      date: item.creationDate || item.createdDate || item.lastUpdateDate || item.date,
      statusCount,
      totalCount,
    };
  }, []);

  const fetchData = useCallback(
    (page = 0) => {
      const isFirstPage = page === 0;
      if (isFirstPage) {
        setQueryLoading(true);
      } else {
        setLoadingMore(true);
      }
      queryImportLogHeaders({ page, size: PAGE_SIZE })
        .then((res) => {
          const result = getResponse(res);
          const content = Array.isArray(result) ? result : result?.content;
          const nextList =
            content && content.length > 0 ? sortArrWithDate(content.map(normalizeItem)) : [];
          const totalPages = result?.totalPages;
          const isLast = Array.isArray(result)
            ? true
            : result?.last ?? (totalPages ? page + 1 >= totalPages : nextList.length < PAGE_SIZE);

          setHasMore(!isLast);
          pageRef.current = page;

          if (isFirstPage) {
            if (nextList.length > 0) {
              setCurrentNodeId(nextList[0].id);
              setListData(nextList);
              fetchLinesData(nextList[0].id);
            } else {
              setCurrentNodeId(undefined);
              setListData([]);
            }
          } else if (nextList.length > 0) {
            setListData((prevList) => sortArrWithDate([...prevList, ...nextList]));
          }
        })
        .finally(() => {
          if (isFirstPage) {
            setQueryLoading(false);
          } else {
            setLoadingMore(false);
          }
        });
    },
    [normalizeItem]
  );

  const sortArrWithDate = (arr) => {
    return arr.sort((before, after) => {
      if (!before.date) {
        return 1;
      } else if (!after.date) {
        return -1;
      } else {
        return moment(before.date).isBefore(after.date) ? 1 : -1;
      }
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleScrollList = useCallback(
    (event) => {
      const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
      const isScrollToBottom = scrollHeight - scrollTop - clientHeight <= SCROLL_BOTTOM_OFFSET;

      if (isScrollToBottom && hasMore && !queryLoading && !loadingMore) {
        fetchData(pageRef.current + 1);
      }
    },
    [fetchData, hasMore, loadingMore, queryLoading]
  );

  const handleClickNode = useCallback((item) => {
    setCurrentNodeId(item.id);
    fetchLinesDataRef.current(item.id);
  }, []);

  const downloadImportFile = useCallback((fileUrl) => {
    const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
    const queryParams = [
      { name: 'url', value: encodeURIComponent(fileUrl) },
      { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
    ];
    setDownLoading(true);
    downloadFileByAxios({ requestUrl: api, queryParams }).finally(() => {
      setDownLoading(false);
    });
  }, []);

  const renderItemSummary = useCallback((item) => {
    const { status, userName, statusCount, totalCount } = item;

    const count =
      totalCount ||
      (isNil(statusCount) ? 0 : Object.values(statusCount).reduce((a, b) => a + b, 0));

    const isImporting = isNil(status);
    return (
      <div style={{ color: '#000', fontSize: '14px', lineHeight: '22px' }}>
        <span style={{ fontWeight: 500, marginRight: '4px' }}>
          {userName || intl.get('smbl.checkRules.import.system').d('系统')}
        </span>
        <span>
          {isImporting
            ? intl.get('smbl.checkRules.import.importing').d('正在执行导入')
            : intl
                .get('smbl.checkRules.import.count', {
                  num: count || 0,
                })
                .d(`共导入${count || 0}个单元`)}
        </span>
      </div>
    );
  }, []);

  const renderItemSummaryDetail = useCallback((item) => {
    const { status, importStatus, statusCount } = item;

    const isImporting = isNil(status) || importStatus === 'IMPORTING';
    if (isImporting) {
      return (
        <div style={{ color: '#FCA000', lineHeight: '20px' }}>
          {intl.get('smbl.checkRules.import.status.importingInfo').d('导入中')}
        </div>
      );
    }
    if (isNil(statusCount) || (!statusCount.pass && !statusCount.warn && !statusCount.error)) {
      return (
        <div style={{ color: '#F56349', lineHeight: '20px' }}>
          {intl.get('smbl.checkRules.import.status.allError').d('全部失败')}
        </div>
      );
    }
    if (statusCount.pass && isNil(statusCount.error) && isNil(statusCount.warn)) {
      return (
        <div style={{ color: '#47B881', lineHeight: '20px' }}>
          {intl.get('smbl.checkRules.import.status.allPass').d('全部成功')}
        </div>
      );
    }
    return (
      <div style={{ lineHeight: '20px' }}>
        <span>{intl.get('smbl.checkRules.import.status.detail').d('其中')}</span>
        {statusCount.pass ? (
          <>
            <span style={{ color: '#47B881', margin: '0 4px', fontWeight: 500 }}>
              {statusCount.pass}
            </span>
            <span>{intl.get('smbl.checkRules.import.status.passInfo').d('个成功')}</span>
          </>
        ) : null}
        {statusCount.warn ? (
          <>
            <span style={{ color: '#FCA000', margin: '0 4px 0 8px', fontWeight: 500 }}>
              {statusCount.warn}
            </span>
            <span>{intl.get('smbl.checkRules.import.status.warnInfo').d('个异常')}</span>
          </>
        ) : null}
        {statusCount.error ? (
          <>
            <span style={{ color: '#F56349', margin: '0 4px 0 8px', fontWeight: 500 }}>
              {statusCount.error}
            </span>
            <span>{intl.get('smbl.checkRules.import.status.errorInfo').d('个失败')}</span>
          </>
        ) : null}
      </div>
    );
  }, []);

  const renderItemFooter = useCallback(
    (item) => {
      const { date, fileUrl } = item;
      return (
        <div
          className="download-file"
          style={{
            display: 'flex',
            alignItems: 'center',
            color: 'rgba(0, 0, 0, 0.45)',
            lineHeight: '20px',
          }}
        >
          <span>{date ? dateTimeRender(date) : '-'} </span>
          {fileUrl && (
            <Button
              funcType="link"
              color="primary"
              loading={downLoading}
              style={{
                height: '18px',
                minWidth: 'auto',
                padding: 0,
                marginLeft: '6px',
                verticalAlign: 'text-bottom',
              }}
            >
              <Tooltip
                title={intl.get('smbl.checkRules.import.downloadImportFile').d('下载导入文件')}
              >
                <Icon
                  onClick={() => downloadImportFile(item.fileUrl)}
                  type="get_app"
                  className={styles['file-download-icon']}
                />
              </Tooltip>
            </Button>
          )}
        </div>
      );
    },
    [downLoading, downloadImportFile]
  );

  return (
    <div className={styles['left-list-wrapper']}>
      <div className={styles['left-title']}>
        {intl.get('smbl.checkRules.import.history').d('历史导入任务')}
      </div>
      {queryLoading ? (
        <Spin />
      ) : !listData.length ? (
        <div className={styles['left-list-no-data']}>
          {intl.get('smbl.checkRules.import.noHistory').d('暂无导入记录')}
        </div>
      ) : (
        <Timeline className={styles['left-list']} onScroll={handleScrollList}>
          {listData.map((item) => (
            <TimelineItem
              dot={ImportStatusRenderer(item.status)}
              key={item.id}
              className={classnames(styles['list-item'], {
                [styles['list-item-active']]: currentNodeId === item.id,
              })}
              onClick={() => handleClickNode(item)}
            >
              {renderItemSummary(item)}
              {renderItemSummaryDetail(item)}
              {renderItemFooter(item)}
              <div className={styles['list-item-border']} />
            </TimelineItem>
          ))}
          {loadingMore ? <Spin /> : null}
        </Timeline>
      )}
    </div>
  );
};

export default ImportHistory;
