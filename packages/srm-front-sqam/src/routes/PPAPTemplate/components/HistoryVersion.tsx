import { stringify } from 'querystring';
import React, { useState, useLayoutEffect, useCallback, memo } from 'react';
// import { Menu } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchTemplateHistory } from '../Detail/stores/api';
import styles from './index.less';

interface historyVersionProps {
  templateNum: string,
  history: any,
  currentTemplateId: string,
}

export default memo(({ templateNum, history, currentTemplateId }: historyVersionProps) => {
  const [data, setData] = useState<any[]>([]);

  const handleFetchHistory = useCallback(async () => {
    const res = getResponse(await fetchTemplateHistory({ templateNum, page: 0, size: 0, templateId: currentTemplateId }));
    setData(res?.content || []);
  }, [templateNum, currentTemplateId]);

  const handleViewHistory = useCallback((termHeaderData: Record<string, any>) => {
    const { templateId } = termHeaderData || {};
    if (!templateId) return;
    history.push({
      pathname: `/sqam/PPAPTemplate/detail/${templateId}`,
      search: stringify({ operate: 'view', viewVersion: 1 }),
    });
  }, [history]);

  useLayoutEffect(() => {
    handleFetchHistory();
  }, [handleFetchHistory]);

  return (
    <div className={styles['version-wrapper']}>
      {isEmpty(data) ? (
        <div className={styles[`empty-version-wrapper`]}>
          {intl.get('sqam.ppap.view.title.noHistoricalVersionInfo').d('暂无历史版本信息')}
        </div>
      ) : (
        data.map((record) => {
          const { publishedByName, publishedLoginName, publishedDate } = record || {};
          return (
            <div className={styles['version-item']} key={record.key} onClick={() => handleViewHistory(record)}>
              <div className={styles[`version-item-wrapper`]}>
                <div className={styles[`version-item-content`]}>
                  <span className={styles['version-number']}>{intl.get('sqam.ppap.view.message.versionVNumber', { versionNumber: record?.versionNumber }).d('版本v{versionNumber}')}</span>
                  <div className={styles[`version-item-extra`]}>
                    <span>{publishedLoginName ? `${publishedByName}(${publishedLoginName})` : publishedByName}</span>
                    {/* <span>{createdBy}</span> */}
                    {publishedDate}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );

  // return (
  //   <Menu style={{ maxHeight: '600px', overflow: 'auto' }}>
  //     {isEmpty(data) ? (
  //       <Menu.Item disabled>
  //         {intl.get('sqam.ppap.view.title.noHistoricalVersionInfo').d('暂无历史版本信息')}
  //       </Menu.Item>
  //     ) : (
  //       data.map((item) => (
  //         <Menu.Item onClick={() => handleViewHistory(item, 'view')}>
  //           <span>{intl.get('sqam.ppap.view.title.version').d('版本')}</span>
  //           <span>{item?.versionNumber}</span>
  //           <span>【{item?.creationDate || '-'}】</span>
  //           <span>【{item?.createdByName || '-'}】</span>
  //         </Menu.Item>
  //       ))
  //     )}
  //   </Menu>
  // );
});
