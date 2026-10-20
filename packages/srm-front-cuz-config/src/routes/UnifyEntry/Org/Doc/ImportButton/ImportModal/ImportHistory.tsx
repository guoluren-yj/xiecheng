/* eslint-disable no-nested-ternary */
import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import { Icon, Spin, Tooltip } from 'choerodon-ui/pro';
import { Tree } from 'choerodon-ui';
import { isNil, isEmpty } from 'lodash';

import { HZERO_PLATFORM, HZERO_FILE } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { getCurrentOrganizationId, getResponse } from 'hzero-front/lib/utils/utils';
import request from "hzero-front/lib/utils/request";
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { queryTplImportLogHeaders, queryImportTplLog } from '../../../../../../services/customizeConfigService';
import styles from '../index.less';
import { ImportStatusRenderer } from './util';

const ImportHistory = ({ fetchLinesData, isInDetail, templateCode, docCode }) => {
  const [listData, setListData] = useState([] as any[]);
  const [expandedKeys, setExpandedKeys] = useState([] as string[]);
  const [queryLoading, setQueryLoading] = useState(false);
  const [downLoading, setDownLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = useCallback(() => {
    setQueryLoading(true);
    (isInDetail ? queryImportTplLog({templateCode, docCode}) : queryTplImportLogHeaders())
      .then(res => {
        if (getResponse(res)) {
          if (res && res.length > 0) {
            const data = sortArrWithDate(res);
            setListData(data.map(i => ({ ...i, type: '_root_' })));
          }
        }
      })
      .finally(() => {
        setQueryLoading(false);
      });
  }, []);

  const loadSubNode = useCallback(e => {
    if (e.data.type !== '_root_') return Promise.resolve();
    return request(`${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/data-migrate/doc-templates/import/template-log`, {
      method: "POST",
      query: {
        headerId: e.data.id,
      },
    }).then(res => {
      if (getResponse(res)) {
        setListData(listData.map(i => ({ ...i, children: i.id === e.data.id ? res || [] : i.children })));
      }
    });
  }, [listData]);
  // 按时间倒序排序
  const sortArrWithDate = useCallback(arr => {
    return arr.sort((before, after) => {
      if (!before.date) {
        return 1;
      } else if (!after.date) {
        return -1;
      } else {
        return moment(before.date).isBefore(after.date) ? 1 : -1;
      }
    });
  }, []);

  const handleClickNode = useCallback((_selectedKeys, e) => {
    if(!e.node.data.pageCode) {
      if(expandedKeys.includes(e.node.key)){
        setExpandedKeys(expandedKeys.filter(i => i !== e.node.key));
      } else {
        setExpandedKeys([...expandedKeys, e.node.key]);
      }
    }
    fetchLinesData(e.node.data);
  }, [expandedKeys]);

  const onExpand = useCallback((keys) => {
    setExpandedKeys(keys);
  }, []);
  const onClickParentNode = useCallback((key) => {
    if(expandedKeys.includes(key)){
      setExpandedKeys(expandedKeys.filter(i => i !== key));
    } else {
      setExpandedKeys([...expandedKeys, key]);
    }
  }, [expandedKeys]);
  const renderItemSummaryDetail = useCallback(item => {
    const { status, statusCount } = item;
    const isImporting = isNil(status);
    if (isImporting) {
      return null;
    }
    if (isNil(statusCount) || isEmpty(statusCount)) {
      return (
        <div style={{ color: '#F56349' }}>
          {item.message || intl.get('hpfm.individual.view.message.allError').d('全部失败')}
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
  const downloadImportFile = useCallback(
    fileUrl => {
      const api = `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`;
      const queryParams = [
        { name: 'url', value: encodeURIComponent(fileUrl) },
        { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
      ];
      setDownLoading(true);
      downloadFileByAxios({
        requestUrl: api, queryParams,
        method: 'GET',
      }).finally(() => {
        setDownLoading(false);
      });
    },
    [downLoading]
  );
  const renderItemFooter = useCallback(item => {
    const { date, fileUrl } = item;
    return (
      <div className="download-file">
        <span>{date}</span>
        {fileUrl && (
          <span>
            <Tooltip
              title={intl.get('hpfm.individual.view.tooltip.downloadImportFile').d('下载导入文件')}
            >
              <Icon
                onClick={() => downloadImportFile(item.fileUrl)}
                type="get_app"
                className={styles['file-download-icon']}
              />
            </Tooltip>
          </span>
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
        <Tree
          className={styles['left-list-tree']}
          expandedKeys={expandedKeys}
          onSelect={handleClickNode}
          onExpand={onExpand}
          showLine={{ showLeafIcon: false }}
          showIcon
          loadData={loadSubNode}
        >
          {listData.map(item => {
            const { status, userName, statusCount } = item;
            const count = isNil(statusCount) ? 0 : Object.values<number>(statusCount).reduce((a, b) => a + b, 0);
            const children = isInDetail ? item.docTemplateLogEntityList : item.children;
            return (
              <Tree.TreeNode
                key={item.id}
                icon={ImportStatusRenderer(status)}
                className="level1"
                isLeaf={false}
                data={item}
                selectable={false}
                title={
                  <div
                    className='list-tree-node'
                    onClick={() => onClickParentNode(item.id)}
                  >
                    <div className="import-header">
                      <span>{userName || intl.get('hpfm.individual.import.system').d('系统')}</span>
                      <span>
                        {isNil(status)
                          ? intl.get('hpfm.individual.import.importing').d('正在执行导入')
                          : intl
                            .get('hpfm.individual.import.summary.tpl', { name: count || 0 })
                            .d(`共导入${count || 0}个模板`)
                        }
                      </span>
                    </div>
                    {renderItemSummaryDetail(item)}
                    {renderItemFooter(item)}
                    <div className={styles['list-item-border']} />
                  </div>
                }
              >
                {
                  children && children.length > 0 && children.map(subItem => {
                    const { status: s, id, docName, templateName } = subItem;
                    return (
                      <Tree.TreeNode
                        key={id}
                        icon={ImportStatusRenderer(s)}
                        isLeaf={!subItem.docPageList || subItem.docPageList.length === 0}
                        data={subItem}
                        selectable={false}
                        className={["level2", subItem.docPageList && subItem.docPageList.length > 1 ? "multiple-child" : "less-child"].filter(Boolean).join(" ")}
                        title={
                          <div
                            className='list-tree-node'
                            onClick={() => onClickParentNode(id)}
                          >
                            <div className="import-header"><span>{docName}-{templateName}</span></div>
                            {renderItemSummaryDetail(subItem)}
                            <div className={styles['list-item-border']} />
                          </div>
                        }
                      >
                        {
                          subItem.docPageList && subItem.docPageList.length > 0 && subItem.docPageList.map(p => {
                            const { status: s3, statusCount: sc3, id3, pageName, stageName, message } = p;
                            const c3 = isNil(sc3) ? 0 : Object.values<number>(sc3).reduce((a, b) => a + b, 0);
                            return (
                              <Tree.TreeNode
                                key={id3}
                                icon={ImportStatusRenderer(s3)}
                                isLeaf
                                data={p}
                                className={message ? "level3" : "level3-no-err"}
                                title={
                                  <div
                                    className='list-tree-node child'
                                  >
                                    <div className="import-header"><span>{pageName}-{stageName}</span></div>
                                    <div>{intl.get('hpfm.individual.import.summary', { name: c3 || 0 }).d(`共导入${c3 || 0}个单元`)}</div>
                                    <div style={{color: "rgb(245, 99, 73)"}}>{message}</div>
                                    {renderItemSummaryDetail(p)}
                                    {renderItemFooter(p)}
                                    <div className={styles['list-item-border']} />
                                  </div>
                                }
                              >
                              </Tree.TreeNode>
                            );
                          }
                          )
                        }
                      </Tree.TreeNode>
                    );
                  }
                  )
                }
              </Tree.TreeNode>
            );
          })}
        </Tree>
      )}
    </div>
  );
};

export default ImportHistory;
