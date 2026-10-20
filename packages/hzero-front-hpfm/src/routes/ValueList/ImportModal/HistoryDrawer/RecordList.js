import React, { useState, useEffect, useCallback, memo } from 'react';
import classnames from 'classnames';
import { Spin, Button, Tooltip } from 'choerodon-ui/pro';
import { isNil, values } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { getResponse, getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import { queryImportLovLog } from '@/services/valueListService';
import { importStatusRenderer, ImprotStatus, StatusColor } from '../util';
import styles from './index.less';

function RecordList({ currentRecord, setCurrentRecord }) {
  const [listLoading, setListLoading] = useState(false);
  const [recordList, setRecordList] = useState([]);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = () => {
    setListLoading(true);
    queryImportLovLog().then(res => {
      if (getResponse(res)) {
        setRecordList(res);
        if (res && res.length && res[0]) {
          setCurrentRecord(res[0]);
        }
      }
    }).finally(() => {
      setListLoading(false);
    });
  };

  const computeTotalCount = (statusCount) => {
    return !statusCount ? 0 : values(statusCount).reduce((total, current) => total + (current || 0));
  };

  const downloadImportFile = useCallback(
    fileUrl => {
      downloadFileByAxios({
        requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
        queryParams: [
          { name: 'url', value: encodeURIComponent(fileUrl) },
          { name: 'bucketName', value: PRIVATE_BUCKET },
        ],
        method: 'GET'
      });
    },
    []
  );

  const listItemSummaryRender = useCallback((listItem) => {
    const { userName, importStatus, statusCount } = listItem;
    const isImporting = isNil(importStatus);
    const totalCount = computeTotalCount(statusCount);
    return (
      <div style={{ color: '#000' }}>
        <span style={{ fontWeight: 500, marginRight: '8px' }}>
          {userName || intl.get('srm.common.view.title.system').d('系统')}
        </span>
        <span>
          {isImporting
            ? intl.get('srm.common.view.message.import.importing').d('正在执行导入')
            : intl
              .get('srm.common.view.message.importLov.summaryTitle', { name: totalCount })
              .d(`共导入 ${totalCount} 个值集`)}
        </span>
      </div>
    );
  }, [computeTotalCount]);

  const listItemSummaryDetailRender = useCallback((listItem) => {
    const { importStatus, statusCount, message } = listItem;
    const successCount = statusCount && statusCount[ImprotStatus.SUCCESS] ? statusCount[ImprotStatus.SUCCESS] : 0;
    const failCount = statusCount && statusCount[ImprotStatus.ERROR] ? statusCount[ImprotStatus.ERROR] : 0;
    const warnCount = statusCount && statusCount[ImprotStatus.WARN] ? statusCount[ImprotStatus.WARN] : 0;
    const noPassCount = statusCount && statusCount[ImprotStatus.NOT_PROCESS] ? statusCount[ImprotStatus.NOT_PROCESS] : 0;
    const total = computeTotalCount(statusCount);
    if (isNil(importStatus) || total === 0) {
      return null;
    }
    if (total === successCount) {
      return (
        <div style={{ color: StatusColor.SUCCESS }}>
          {intl.get('srm.common.view.message.importResult.allPass').d('全部成功')}
        </div>
      );
    } else if (total === failCount) {
      return (
        <div>
          <span style={{ color: StatusColor.ERROR }}>
            {intl.get('srm.common.view.message.importResult.allError').d('全部失败')}
          </span>
          {message && (
            <span style={{ marginLeft: '8px' }}>
              {intl.get('srm.common.view.message.importResult.errorInfo').d('失败原因')}:{message}
            </span>
          )}
        </div>
      );
    } else {
      return (
        <div>
          <span>{intl.get('srm.common.view.message.importReport.importResult').d('其中')}</span>
          {successCount > 0 && (
            <>
              <span style={{ color: StatusColor.SUCCESS, margin: '0 4px', fontWeight: 500 }}>{successCount}</span>
              <span>{intl.get('srm.common.view.message.importReport.importSuccessCount').d('个成功')}</span>
            </>
          )}
          {failCount > 0 && (
            <>
              <span style={{ color: StatusColor.ERROR, margin: '0 4px', fontWeight: 500 }}>{failCount}</span>
              <span>{intl.get('srm.common.view.message.importReport.importErrorCount').d('个失败')}</span>
            </>
          )}
          {warnCount > 0 && (
            <>
              <span style={{ color: StatusColor.WARN, margin: '0 4px', fontWeight: 500 }}>{warnCount}</span>
              <span>{intl.get('srm.common.view.message.importReport.importWarnCount').d('个异常')}</span>
            </>
          )}
          {noPassCount > 0 && (
            <>
              <span style={{ color: StatusColor.NOT_PROCESS, margin: '0 4px', fontWeight: 500 }}>{noPassCount}</span>
              <span>{intl.get('srm.common.view.message.importReport.importNoPassCount').d('个未处理')}</span>
            </>
          )}
          {message && (
            <span style={{ marginLeft: '8px' }}>
              {intl.get('srm.common.view.message.importResult.errorInfo').d('失败原因')}:{message}
            </span>
          )}
        </div>
      );
    }
  }, [computeTotalCount]);

  const listItemSummaryFooterRender = useCallback((listItem) => {
    const { date, fileUrl } = listItem;
    return (
      <div>
        {date}
        {fileUrl && (
          <Tooltip
            title={intl.get('srm.common.view.tooltip.downloadImportFile').d('下载导入文件')}
          >
            <Button
              funcType={FuncType.link}
              color={ButtonColor.primary}
              icon='get_app'
              className={styles['file-download-icon']}
              onClick={() => downloadImportFile(fileUrl)}
            />
          </Tooltip>
        )}
      </div>
    );
  }, [downloadImportFile]);

  const listItemRender = useCallback((listItem, index) => {
    const { id, importStatus } = listItem;
    const isLast = index !== recordList.length - 1;
    return (
      <div
        key={id}
        className={classnames(styles['list-item'], {
          [styles['list-item-active']]: currentRecord && currentRecord.id === id,
        })}
        onClick={() => setCurrentRecord(listItem)}
      >
        <div className={styles['list-item-content-left']}>
          <div className={styles['list-item-dot']}>{importStatusRenderer(importStatus)}</div>
          {isLast ? <div className={styles['list-item-line']} /> : null}
        </div>
        <div className={styles['list-item-content-right']}>
          {listItemSummaryRender(listItem)}
          <div className={styles['list-item-summary-detail']}>{listItemSummaryDetailRender(listItem)}</div>
          {listItemSummaryFooterRender(listItem)}
          {isLast ? <div className={styles['list-item-border']} /> : null}
        </div>
      </div>
    );
  }, [recordList, currentRecord, setCurrentRecord, listItemSummaryRender, listItemSummaryDetailRender, listItemSummaryFooterRender]);

  return listLoading ? (
    <Spin spinning={listLoading} className={styles['list-loading']} />
  ) : !recordList.length ? (
    <div className={styles['list-no-data']}>
      {intl.get('srm.common.view.title.emptyImportRecord').d('暂无导入记录')}
    </div>
  ) : (
    <div className={styles['left-list']}>{recordList.map(listItemRender)}</div>
  );
};

export default memo(RecordList);