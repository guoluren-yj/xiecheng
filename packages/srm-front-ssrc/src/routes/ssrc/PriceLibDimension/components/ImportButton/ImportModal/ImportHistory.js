/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import classnames from 'classnames';
import moment from 'moment';
import { Tooltip, Spin, Button } from 'choerodon-ui/pro';
import { Timeline, Icon } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { downloadFile } from 'services/api';
import { queryImportHeaders } from '@/services/priceLibDimensionService';
import { ImportStatusRenderer, getCurrentStatusConfig } from './util';
import styles from '../index.less';

const TimelineItem = Timeline.Item;
const tenantId = getCurrentOrganizationId();

const ImportHistory = ({ fetchLinesData }) => {
  const [currentNodeId, setCurrentNodeId] = useState();
  const [listData, setListData] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setQueryLoading(true);
    queryImportHeaders()
      .then((res) => {
        if (getResponse(res)) {
          if (res && res.length > 0) {
            const data = sortArrWithDate(res);
            setCurrentNodeId(data[0].batchId);
            setListData(data);
            fetchLinesData(data[0].batchId);
          }
        }
      })
      .finally(() => {
        setQueryLoading(false);
      });
  };

  // 按时间倒序排序
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

  const handleClickNode = useCallback((item) => {
    setCurrentNodeId(item.batchId);
    fetchLinesData(item.batchId);
  }, []);

  const downloadImportFile = useCallback(
    (fileUrl) => {
      const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
      const queryParams = [
        { name: 'url', value: encodeURIComponent(fileUrl) },
        { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
      ];
      setDownLoading(true);
      downloadFile({ requestUrl: api, queryParams }).finally(() => {
        setDownLoading(false);
      });
    },
    [downLoading]
  );

  const renderItemSummary = useCallback((item) => {
    const { status, realName, loginName, count } = item;

    const isImporting = isNil(status);
    return (
      <div style={{ color: '#000' }}>
        <span style={{ fontWeight: 500, marginRight: '8px' }}>
          {`${realName}（${loginName}）` || intl.get('hpfm.individual.import.system').d('系统')}
        </span>
        <span>
          {isImporting
            ? intl.get('hpfm.individual.import.importing').d('正在执行导入')
            : intl
                .get('ssrc.priceLibDimension.import.summary', { count: count || 0 })
                .d(`共导入${count || 0}个价格库`)}
        </span>
      </div>
    );
  }, []);

  const renderItemSummaryDetail = useCallback((item) => {
    const { status, statusMeaning } = item;
    const isImporting = isNil(status);
    if (isImporting) {
      return null;
    }
    const { color } = getCurrentStatusConfig(status);
    return <div style={{ color }}>{statusMeaning}</div>;
  }, []);
  const renderItemFooter = useCallback((item) => {
    const { creationDate, fileUrl } = item;
    return (
      <div className="download-file">
        <span>{creationDate}</span>
        {fileUrl && (
          <Button
            funcType="link"
            color="primary"
            style={{ height: '18px', verticalAlign: 'text-bottom' }}
          >
            <Tooltip
              title={intl.get('hpfm.individual.view.tooltip.downloadImportFile').d('下载导入文件')}
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
  }, []);

  return (
    <div className={styles['left-list-wrapper']}>
      <div className={styles['left-title']}>
        {intl.get('hpfm.individual.view.title.historyImportTask').d('历史导入任务')}
      </div>
      {queryLoading ? (
        <Spin />
      ) : !listData.length ? (
        <div className={styles['left-list-no-data']}>
          {intl.get('hpfm.individual.view.message.noImportRecord').d('暂无导入记录')}
        </div>
      ) : (
        <Timeline className={styles['left-list']}>
          {listData.map((item) => (
            <TimelineItem
              dot={ImportStatusRenderer(item.status)}
              key={item.batchId}
              className={classnames(styles['list-item'], {
                [styles['list-item-active']]: currentNodeId === item.batchId,
              })}
              onClick={() => handleClickNode(item)}
            >
              {renderItemSummary(item)}
              {renderItemSummaryDetail(item)}
              {renderItemFooter(item)}
              <div className={styles['list-item-border']} />
            </TimelineItem>
          ))}
        </Timeline>
      )}
    </div>
  );
};

export default ImportHistory;
