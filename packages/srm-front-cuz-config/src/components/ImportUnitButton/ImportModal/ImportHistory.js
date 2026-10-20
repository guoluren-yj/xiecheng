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
import { downloadFileByAxios } from '@/utils/file';

import { queryImportUnitLog } from '@/services/customizeConfigService';
import styles from '../index.less';
import { ImportStatusRenderer } from './util';

const TimelineItem = Timeline.Item;
const tenantId = getCurrentOrganizationId();

const ImportHistory = ({ groupCode, unitCode, setLinesData }) => {
  const [currentNodeId, setCurrentNodeId] = useState();
  const [listData, setListData] = useState([]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setQueryLoading(true);
    queryImportUnitLog({ groupCode, unitCode })
      .then(res => {
        if (getResponse(res)) {
          if (res && res.length > 0) {
            setListData(res);
            const data = sortArrWithDate(res);
            setCurrentNodeId(data[0].id);
            setLinesData(data[0]);
          }
        }
      })
      .finally(() => {
        setQueryLoading(false);
      });
  };

  // 按时间倒序排序
  const sortArrWithDate = arr => {
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

  const handleClickNode = useCallback(item => {
    setCurrentNodeId(item.id);
    setLinesData(item);
  }, []);

  const downloadImportFile = useCallback(
    fileUrl => {
      const api = `${HZERO_FILE}/v1/${tenantId}/files/download`;
      const queryParams = [
        { name: 'url', value: encodeURIComponent(fileUrl) },
        { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
      ];
      setDownLoading(true);
      downloadFileByAxios({ requestUrl: api, queryParams }).finally(() => {
        setDownLoading(false);
      });
    },
    [downLoading]
  );

  const renderItemSummary = useCallback(item => {
    const { status, userName, statusCount } = item;
    const count = isNil(statusCount) ? 0 : Object.values(statusCount).reduce((a, b) => a + b);

    const isImporting = isNil(status);
    return (
      <div style={{ color: '#000' }}>
        <span style={{ fontWeight: 500, marginRight: '8px' }}>
          {userName || intl.get('hpfm.individual.import.system').d('系统')}
        </span>
        <span>
          {isImporting
            ? intl.get('hpfm.individual.import.importing').d('正在执行导入')
            : intl
                .get('hpfm.individual.import.unit.summary', { name: count || 0 })
                .d(`共导入${count || 0}个字段`)}
        </span>
      </div>
    );
  }, []);

  const renderItemSummaryDetail = useCallback(item => {
    const { status, statusCount } = item;
    const isImporting = isNil(status);
    if (isImporting) {
      return null;
    }
    if (isNil(statusCount)) {
      return (
        <div style={{ color: '#F56349' }}>
          {intl.get('hpfm.individual.view.message.allError').d('全部失败')}
        </div>
      );
    } else if (statusCount.pass && isNil(statusCount.error) && isNil(statusCount.warn)) {
      return (
        <div style={{ color: '#47B881' }}>
          {intl.get('hpfm.individual.view.message.allPass').d('全部成功')}
        </div>
      );
    } else {
      return (
        <div>
          <span>{intl.get('hpfm.individual.view.message.importHistoryTip1').d('其中')}</span>
          {statusCount.pass && (
            <>
              <span style={{ color: '#47B881', margin: '0 4px', fontWeight: 500 }}>{statusCount.pass}</span>
              <span>
                {intl.get('hpfm.individual.view.message.importHistoryTip2').d('个成功，')}
              </span>
            </>
          )}
          {statusCount.warn && (
            <>
              <span style={{ color: '#FCA000', margin: '0 4px', fontWeight: 500 }}>{statusCount.warn}</span>
              <span>
                {intl.get('hpfm.individual.view.message.importHistoryTip3').d('个异常，')}
              </span>
            </>
          )}
          {statusCount.error && (
            <>
              <span style={{ color: '#F56349', margin: '0 4px', fontWeight: 500 }}>{statusCount.error}</span>
              <span>{intl.get('hpfm.individual.view.message.importHistoryTip4').d('个失败')}</span>
            </>
          )}
        </div>
      );
    }
  }, []);
  const renderItemFooter = useCallback(item => {
    const { date, fileUrl } = item;
    return (
      <div className='download-file'>
        <span>{date}</span>
        {fileUrl && (
          <Button funcType="link" color="primary" style={{height: "18px", verticalAlign: "text-bottom"}}>
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
        {intl.get('hpfm.individual.view.title.importRecord').d('导入记录')}
      </div>
      {queryLoading ? (
        <Spin />
      ) : !listData.length ? (
        <div className={styles['left-list-no-data']}>
          {intl.get('hpfm.individual.view.message.noImportRecord').d('暂无导入记录')}
        </div>
      ) : (
        <Timeline className={styles['left-list']}>
          {listData.map(item => (
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
              {item.message && (
                <Tooltip>
                  <div className={styles['list-item-error']}>{item.message}</div>
                </Tooltip>
              )}
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
