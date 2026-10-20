import React, { FC, useState, useEffect, useCallback, memo } from 'react';
import classnames from 'classnames';
import { Spin } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import intl from 'srm-front-boot/lib/utils/intl';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer';
import { getResponse } from 'hzero-front/lib/utils/utils';

import { queryModalDataImportHistory } from '@/services/businessObjectService';
import { ImportStatusRenderer } from '../util';
import styles from './index.less';

interface IRecordList {
  currentRecord: any;
  // eslint-disable-next-line no-unused-vars
  setCurrentRecord: (currentRecord: any) => void;
}

const RecordList: FC<IRecordList> = ({
  currentRecord,
  setCurrentRecord,
}) => {
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [recordList, setRecordList] = useState<any[]>([]);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = () => {
    setListLoading(true);
    queryModalDataImportHistory().then(res => {
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


  const listItemSummaryRender = useCallback((listItem) => {
    const { realName, loginName, taskStatus, totalCombines = 0, importTemplateScene } = listItem;
    const isImporting = isNil(taskStatus) || ['SUBMITTED', 'EXECUTING'].includes(taskStatus);
    return (
      <div style={{ color: '#000' }}>
        <span style={{ fontWeight: 500, marginRight: '8px' }}>
          {realName || intl.get('srm.common.view.title.system').d('系统')}
          {loginName ? `(${loginName})` : ''}
        </span>
        <span>
          {isImporting
            ? intl.get('srm.common.view.message.import.importing').d('正在执行导入')
            : importTemplateScene ? intl
            .get('srm.common.view.message.importTemplateResult.summaryTitle', { name: totalCombines })
            .d(`共导入 ${totalCombines} 个组合业务对象模版`) : intl
              .get('srm.common.view.message.importResult.summaryTitle', { name: totalCombines })
              .d(`共导入 ${totalCombines} 个组合业务对象`)}
        </span>
      </div>
    );
  }, []);

  const listItemSummaryDetailRender = useCallback((listItem) => {
    const { taskStatus, totalCombines, totalFailures } = listItem;
    const count = !isNil(totalCombines) ? Number(totalCombines) : 0;
    const failCount = !isNil(totalFailures) ? Number(totalFailures) : 0;
    const successCount = count - failCount;
    const isImporting = isNil(taskStatus) || ['SUBMITTED', 'EXECUTING'].includes(taskStatus);
    if (isImporting || count === 0) {
      return null;
    }
    if (count === failCount) {
      return (
        <div style={{ color: '#F56349' }}>
          {intl.get('srm.common.view.message.importResult.allError').d('全部失败')}
        </div>
      );
    } else if (!failCount) {
      return (
        <div style={{ color: '#47B881' }}>
          {intl.get('srm.common.view.message.importResult.allPass').d('全部成功')}
        </div>
      );
    } else {
      return (
        <div>
          <span>{intl.get('srm.common.view.message.importHistoryTip1').d('其中')}</span>
          {successCount && (
            <>
              <span style={{ color: '#47B881', margin: '0 4px', fontWeight: 500 }}>{successCount}</span>
              <span>
                {intl.get('srm.common.view.message.importHistoryTip2').d('个成功')}
              </span>
              <span>,</span>
            </>
          )}
          {failCount && (
            <>
              <span style={{ color: '#F56349', margin: '0 4px', fontWeight: 500 }}>{failCount}</span>
              <span>{intl.get('srm.common.view.message.importHistoryTip4').d('个失败')}</span>
            </>
          )}
        </div>
      );
    }
  }, []);

  const listItemRender = useCallback((listItem, index) => {
    const { id, taskStatus, startTime } = listItem;
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
          <div className={styles['list-item-dot']}>{ImportStatusRenderer(taskStatus)}</div>
          {isLast ? <div className={styles['list-item-line']} /> : null}
        </div>
        <div className={styles['list-item-content-right']}>
          <div>{listItemSummaryRender(listItem)}</div>
          <div className={styles['list-item-summary-detail']}>{listItemSummaryDetailRender(listItem)}</div>
          <div>{dateTimeRender(startTime)}</div>
          {isLast ? <div className={styles['list-item-border']} /> : null}
        </div>
      </div>
    );
  }, [recordList, currentRecord, setCurrentRecord, listItemSummaryRender, listItemSummaryDetailRender]);

  return listLoading ? (
    <Spin spinning={listLoading} className={styles['list-loading']} />
  ) : recordList.length === 0 ? (
    <div className={styles['list-no-data']}>
      {intl.get('srm.common.view.title.emptyImportRecord').d('暂无导入记录')}
    </div>
  ) : (
        <div className={styles['left-list']}>{recordList.map(listItemRender)}</div>
      );
};

export default memo(RecordList);