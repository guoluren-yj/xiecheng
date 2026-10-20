/* eslint-disable no-param-reassign */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Icon, Table, Spin, Pagination, Tooltip, DataSet } from 'choerodon-ui/pro';
import { ButtonColor, ButtonType, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { Nav, Footer } from 'srm-front-boot/lib/components/PortalCard';
import request from 'hzero-front/lib/utils/request';
import { isNil, isArray } from 'lodash';
import qs from 'query-string';
import moment from 'moment';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getEnvConfig } from 'hzero-front/lib/utils/iocUtils';
import {
  getHomeDefaultLanguage,
  newUrlPreviewList,
  imgs,
  supportPreviewList,
  getAttachmentUrlWithToken,
} from 'srm-front-boot/lib/utils/utils';
import Cookies from 'universal-cookie';
import {
  getResponse,
  setSession,
  filterNullValueObject,
  getSRMAccessCode,
  getAccessToken,
} from 'hzero-front/lib/utils/utils';
import { Size } from 'choerodon-ui/lib/_util/enum';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { SelectionMode, TableMode } from 'choerodon-ui/pro/lib/table/enum';
import { PUBLIC_BUCKET } from '_utils/config';
import styles from './index.less';

const cookie = new Cookies();
export default function ResourceCenter() {
  const langInfoRef = useMemo(() => ({ current: {}, valueListMeaningMap: {} }), []);
  const [, setLangInfoLoaded] = useState({});
  const [pathInfo, setPathInfo] = useState([] as any[]);
  const [allCardList, setAllCardList] = useState([] as any[]);
  const [currentCardList, setCurrentCardList] = useState([] as any[]);
  const [pagination, setPagination] = useState({});
  const [cardFlag, setCardFlag] = useState(false);
  const [collapseFlag, setCollapseFlag] = useState(false);
  const [init, setInit] = useState(false);
  const [loading, setLoading] = useState(true);
  const langInfo = langInfoRef.current || {};
  const accessToken = getAccessToken();
  const isLogin = !!accessToken;
  const dsRef = useMemo<{ current?: DataSet }>(() => ({ current: undefined }), []);
  useMemo(() => {
    dsRef.current = new DataSet({
      childrenField: 'children',
      expandField: '__expand_flag__',
      fields: [
        {
          name: 'dataClassCode',
          label: langInfoRef.current['srm.oauth.resource.download.name'] || '名称',
        },
        {
          name: 'dataClassName',
          label: langInfoRef.current['srm.oauth.resource.download.dataClassName'] || '分类名称',
        },
        {
          name: 'title',
          label: langInfoRef.current['srm.oauth.resourceDownload.data.title'] || '标题',
        },
        {
          name: 'categoryCodeMeaning',
          label: langInfoRef.current['srm.oauth.resource.download.categoryCode'] || '类别',
        },
        {
          name: 'creationDate',
          label: langInfoRef.current['hzero.common.date.creation'] || '创建时间',
        },
      ],
    });
  }, [init]);

  useEffect(() => {
    getHomeDefaultLanguage().then(langResp => {
      const newLang = langResp || 'zh_CN';
      Promise.all([
        queryMapIdpValue({
          category: 'SPFM.PORTAL.ATTACHMENT_CATEGORY',
          publicMode: true,
          lang: newLang,
        }).then(res => {
          if (getResponse(res) && res.category) {
            const lang = {};
            res.category.forEach(item => {
              lang[item.value] = item.meaning;
            });
            langInfoRef.valueListMeaningMap = lang;
          }
        }),
        queryIntl(newLang).then(() => {
          setInit(true);
          return searchCallback();
        }),
      ]).then(() => {
        setLoading(false);
      });
    });
  }, []);

  const queryIntl = useCallback(async lang => {
    const { HZERO_PLATFORM } = getEnvConfig() as any;
    // const lang = await getHomeDefaultLanguage();
    return request(`${HZERO_PLATFORM}/v1/prompt/${lang}`, {
      method: 'GET',
      query: {
        promptKey: 'spfm.portalSubPage,hzero.common,srm.common,srm.oauth',
      },
    }).then(res => {
      if (getResponse(res)) {
        langInfoRef.current = res;
        setSession(`${lang}-srm.portal`, res);
        setLangInfoLoaded(true);
      }
    });
  }, []);

  const searchCallback = useCallback(() => {
    const lang = cookie.get('language') || 'zh_CN';
    const input = document.getElementById('resource-search') as HTMLInputElement;
    setCollapseFlag(false);
    processLoading(true);
    return queryAttachments({ page: 0, size: 20, title: input.value, lang })
      .then(res => {
        if (res) {
          dsRef.current!.loadData(changeFileListToChildren(res.content));
          setAllCardList(res.content);
          setPagination({ page: res.number + 1, pageSize: res.size, total: res.totalElements });
          changeCollapse();
        }
      })
      .finally(() => {
        processLoading(false);
      });
  }, [dsRef.current!]);

  const handlePageChange = useCallback(
    (page, pageSize) => {
      const lang = cookie.get('language') || 'zh_CN';
      const input = document.getElementById('resource-search') as HTMLInputElement;
      setCollapseFlag(false);
      processLoading(true);
      return queryAttachments({ page: page - 1, pageSize, title: input.value, lang })
        .then(res => {
          if (res) {
            dsRef.current!.loadData(changeFileListToChildren(res.content));
            setAllCardList(res.content);
            setPathInfo([]);
            setCurrentCardList([]);
            setPagination({ page: res.number + 1, pageSize: res.size, total: res.totalElements });
            changeCollapse();
          }
        })
        .finally(() => {
          processLoading(false);
        });
    },
    [cardFlag]
  );
  const processLoading = useCallback(status => {
    setLoading(status);
    if (status) {
      dsRef.current!.status = DataSetStatus.loading;
    } else dsRef.current!.status = DataSetStatus.ready;
  }, []);
  const changeCollapse = useCallback(() => {
    setCollapseFlag(!collapseFlag);
    if (collapseFlag) {
      // 当前展开，做收起操作
      dsRef.current!.forEach(record => {
        record.set('__expand_flag__', false);
      });
    } else {
      // 当前收起，做展开操作
      dsRef.current!.forEach(record => {
        record.set('__expand_flag__', true);
      });
    }
  }, [collapseFlag]);
  const columns = React.useMemo(
    () => [
      {
        name: 'dataClassCode',
        renderer: options => {
          const { record } = options;
          const {
            fileUrl,
            fileName,
            fileType,
            dataClassName,
            dataClassCode,
            title,
            categoryCode,
          } = record.get([
            'title',
            'fileUrl',
            'fileName',
            'fileType',
            'dataClassName',
            'dataClassCode',
            'categoryCode',
          ]);
          const name =
            fileName ||
            title ||
            dataClassName ||
            langInfoRef.current['srm.oauth.resource.download.noName'] ||
            '未命名';
          return (
            <div className="file-name-cell">
              <div id={getIconId(fileType || '__dir__', fileName)} className="file-icon" />
              {fileUrl || categoryCode === 'DATA' ? (
                <div className="file-name">{name}</div>
              ) : (
                <div className="combineName">
                  <div className="name">{name}</div>
                  <div className="code">{dataClassCode}</div>
                </div>
              )}
            </div>
          );
        },
      },
      {
        name: 'categoryCodeMeaning',
        width: 160,
        renderer: options => {
          const { record, text } = options;
          const { fileUrl, categoryCode } = record.get(['fileUrl', 'categoryCode']);
          if (fileUrl) {
            return langInfoRef.current['hzero.common.upload.modal.attachment'] || '附件';
          }
          return langInfoRef.valueListMeaningMap[categoryCode] || text;
        },
      },
      {
        name: 'creationDate',
        width: 220,
      },
      {
        title: langInfoRef.current['hzero.common.upload.modal.attachment'] || '附件',
        name: 'operate',
        width: 200,
        renderer: options => {
          const fileUrl = options.record.get('fileUrl');
          if (fileUrl) {
            const recordData = options.record.get([
              'fileUrl',
              'bucketName',
              'tenantName',
              'currentUserName',
              'currentLoginName',
            ]);
            const ext = getFileExtension(fileUrl);
            const canPreview = imgs.includes(ext) || supportPreviewList.includes(ext);
            return (
              <>
                {isLogin && canPreview && (
                  <Button funcType={FuncType.link} onClick={() => previewFile(recordData)}>
                    {langInfoRef.current['srm.oauth.platformNoticeDetail.preview'] || '预览'}
                  </Button>
                )}
                <Button funcType={FuncType.link} onClick={() => downloadFile(recordData)}>
                  {langInfoRef.current['srm.oauth.platformNoticeDetail.downloadAttachment'] ||
                    '附件下载'}
                </Button>
              </>
            );
          }
        },
      },
    ],
    [init]
  );

  const toggleDisplayMode = useCallback(e => {
    switch (e.target.id) {
      case 'list':
        setCardFlag(false);
        setPathInfo([]);
        setCurrentCardList([]);
        break;
      case 'card':
        setCardFlag(true);
        break;
      default:
    }
  }, []);

  const clickCard = useCallback(
    cardInfo => {
      if (cardInfo.fileUrl) {
        downloadFile(cardInfo);
        return;
      }
      setCurrentCardList(cardInfo.children || cardInfo.fileList || []);
      const lastItem = pathInfo[pathInfo.length - 1] || {};
      if (
        (cardInfo.dataClassCode && lastItem.dataClassCode !== cardInfo.dataClassCode) ||
        cardInfo.categoryCode === 'DATA'
      ) {
        setPathInfo([...pathInfo, cardInfo]);
      }
    },
    [pathInfo]
  );

  const changePathInfo = useCallback(
    e => {
      const { id } = e.target.dataset;
      if (id === '-1') {
        setPathInfo([]);
        setCurrentCardList([]);
      } else if (id && Number(id) < pathInfo.length - 1) {
        setPathInfo([...pathInfo.slice(0, Number(id) + 1)]);
        setCurrentCardList(pathInfo[id].children || pathInfo[id].fileList || []);
      }
    },
    [currentCardList, pathInfo]
  );

  const renderCardList =
    ((currentCardList.length || pathInfo.length) && currentCardList) || allCardList;
  const isEmpty = cardFlag ? !renderCardList.length : !dsRef.current!.length;
  return (
    <Spin spinning={!init}>
      <div className={styles['resource-center']}>
        {init && <Nav auto />}
        <section className="search-area">
          <header>{langInfo['spfm.portalSubPage.common.title.resource'] || '资料下载'}</header>
          <form>
            <div className="search-input" onClick={interceptDefault}>
              <Icon type="search" />
              <input
                autoComplete="off"
                type="text"
                name="search"
                id="resource-search"
                placeholder={
                  langInfo['srm.oauth.platformNotice.enterWantQuery'] || '请输入您要查询的内容'
                }
              />
              <Button type={ButtonType.submit} color={ButtonColor.primary} onClick={searchCallback}>
                {langInfo['srm.common.view.title.search'] || '搜索'}
              </Button>
            </div>
          </form>
        </section>
        <section className="content">
          <header>
            <div className="path-info" onClick={changePathInfo}>
              <span
                data-id="-1"
                className={['path-item', !cardFlag && 'unselectable'].filter(Boolean).join(' ')}
              >
                {langInfo['spfm.portalSubPage.common.title.resource'] || '资料下载'}
              </span>
              {cardFlag
                ? pathInfo.map((p, index, arr) => {
                    if (arr.length > 4 && index > 0 && index < arr.length - 1) {
                      return (
                        <>
                          <Icon type="navigate_next" />
                          <Tooltip
                            title={
                              p.title ||
                              p.dataClassName ||
                              p.fileName ||
                              langInfoRef.current['srm.oauth.resource.download.noName'] ||
                              '未命名'
                            }
                          >
                            <span className="path-item" data-id={index}>
                              ...
                            </span>
                          </Tooltip>
                        </>
                      );
                    }
                    return (
                      <>
                        <Icon type="navigate_next" />
                        <span className="path-item" data-id={index}>
                          {p.title ||
                            p.dataClassName ||
                            p.fileName ||
                            langInfoRef.current['srm.oauth.resource.download.noName'] ||
                            '未命名'}
                        </span>
                      </>
                    );
                  })
                : null}
            </div>
            <div className="operator">
              {!isEmpty && !cardFlag && (
                <div className="operator-to-content">
                  <Button
                    funcType={FuncType.flat}
                    color={ButtonColor.default}
                    size={Size.small}
                    onClick={changeCollapse}
                  >
                    <i id="list" />
                    {collapseFlag
                      ? langInfo['hzero.common.button.collapseAll'] || '全部收起'
                      : langInfo['hzero.common.button.expandAll'] || '全部展开'}
                  </Button>
                </div>
              )}
              <div className="mode-switcher" onClick={toggleDisplayMode}>
                <i
                  id="card"
                  className={['mode-switcher-item', cardFlag && 'active'].filter(Boolean).join(' ')}
                />
                <i
                  id="list"
                  className={['mode-switcher-item', !cardFlag && 'active']
                    .filter(Boolean)
                    .join(' ')}
                />
              </div>
            </div>
          </header>
          <Spin spinning={init && loading}>
            <section className={`content-detail${isEmpty ? ' no-data' : ''}`}>
              {isEmpty && <span>{langInfo['hzero.common.message.data.none'] || '暂无数据'}</span>}
              {isEmpty ? null : cardFlag ? (
                <div className="resource-card-container">
                  {renderCardList.map((item, index) => {
                    const title =
                      item.title ||
                      item.dataClassName ||
                      item.fileName ||
                      langInfoRef.current['srm.oauth.resource.download.noName'] ||
                      '未命名';
                    return (
                      <div
                        className={`resource-card${
                          (index + 1) % 4 === 0 ? ' no-margin-right' : ''
                        }`}
                        onClick={() => clickCard(item)}
                      >
                        <Tooltip>
                          <div className="title" title={title}>
                            {title}
                          </div>
                        </Tooltip>
                        {item.dataClassCode && <div className="code">{item.dataClassCode}</div>}
                        <div className="date">{item.creationDate}</div>
                        <div
                          id={getIconId(item.fileType || '__dir__', item.fileName)}
                          className="file-icon"
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Table
                  className="table-wrap-resource"
                  mode={TableMode.tree}
                  selectionMode={SelectionMode.none}
                  dataSet={dsRef.current!}
                  columns={columns}
                  onRow={onRow}
                  style={{ height: 487 }}
                  headerRowHeight={18}
                  rowHeight="auto"
                  customizable
                  customizedCode="portal-resource-center-table"
                />
              )}
            </section>
            {!isEmpty && (!pathInfo.length || !cardFlag) && (
              <Pagination {...pagination} onChange={handlePageChange} />
            )}
          </Spin>
        </section>
        {init && <Footer auto />}
      </div>
    </Spin>
  );
}

function interceptDefault(e) {
  e.stopPropagation();
  e.preventDefault();
}

function queryAttachments(query): Promise<any> {
  const orgid = cookie.get('tenantId');
  const accessToken = cookie.get('access_token');
  let noticeUrl;
  /**
   * 本地开发无法获取orgid，不同域名
   */
  if (accessToken && orgid !== undefined) {
    noticeUrl = `/spfm/v1/${orgid}/portal-attachments-login`;
  } else {
    noticeUrl = '/spfm/v1/public-portal-attachments';
  }
  return request(noticeUrl, {
    mathod: 'GET',
    query,
  }).then(res => {
    if (getResponse(res)) {
      return res;
    }
  });
}
function getIconId(mimeType, fileName = '') {
  const matches = fileName.match(/\.(\S+)$/);
  const matches2 = mimeType.match(/^(\S+)\//);
  let ext;
  if (matches) [, ext] = matches;
  let mimeHeader;
  if (matches2) [, mimeHeader] = matches2;
  switch (ext) {
    case 'rar':
    case '7z':
    case 'gz':
    case 'tar':
    case 'tgz':
    case 'bz':
      return 'zip';
    case 'pdf':
      return 'pdf';
    case 'ppt':
    case 'pptx':
      return 'ppt';
    case 'doc':
    case 'docx':
      return 'word';
    case 'xls':
    case 'csv':
    case 'xlsx':
      return 'excel';
    default:
  }
  switch (mimeHeader) {
    case 'audio':
    case 'video':
      return 'play';
    case 'image':
      return 'img';
    case 'text':
      return 'text';
    default:
  }
  switch (mimeType) {
    case 'application/x-gzip':
    case 'application/x-bzip2':
    case 'application/x-rar':
    case 'application/x-7z-compressed':
    case 'application/x-compress':
    case 'application/zip':
    case 'application/x-tar':
      return 'zip';
    case 'application/vnd.ms-powerpoint':
      return 'ppt';
    case 'application/pdf':
      return 'pdf';
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      return 'excel';
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    case 'application/msword':
      return 'word';
    case '__dir__':
      return 'dir';
    default:
  }
  return 'unknown';
}
function onRow(onRowProps) {
  const { fileUrl, categoryCode } = onRowProps.record.get(['fileUrl', 'categoryCode']);
  let additionClassName = '';
  if (fileUrl) additionClassName = 'file';
  else if (categoryCode === 'DATA') additionClassName = 'data';
  else additionClassName = 'dir';
  return { ...onRowProps, className: additionClassName };
}
function downloadFile(recordData = {}) {
  const newRecordData = filterNullValueObject(recordData) as any;
  let downloadUrl;
  const { fileUrl, tenantName = '', currentUserName = '', currentLoginName = '' } = newRecordData;
  const url = encodeURIComponent(fileUrl);
  const { API_HOST } = getEnvConfig() as any;
  const tenantId = cookie.get('tenantId');
  const watermarkText = `${currentLoginName}${currentUserName}${tenantName}`;
  if (!isNil(tenantId)) {
    downloadUrl = `${API_HOST}/spfm/v2/portal-attachment/download?url=${url}&tenantId=${tenantId}&enableWatermark=true&watermarkText=${watermarkText}`;
  } else {
    downloadUrl = `${API_HOST}/spfm/v2/portal-attachment/download?url=${url}&enableWatermark=true&watermarkText=${watermarkText}&bucket-name=${PUBLIC_BUCKET}`;
  }
  window.open(downloadUrl);
}
// 提取fileUrl的文件后缀类型
function getFileExtension(fileUrl: string): string {
  // 从URL中提取文件名
  const fileName = fileUrl.split('/').pop();
  if (!fileName) return '';
  // 从文件名中提取后缀
  const lastDotIndex = fileName.lastIndexOf('.');
  if (lastDotIndex === -1) return '';
  // 返回后缀（不含点）
  return fileName.substring(lastDotIndex + 1).toLowerCase();
}

function fetchList({ attachmentUrls }) {
  const { HZERO_FILE } = getEnvConfig() as any;
  const tenantId = cookie.get('tenantId');
  const action = `${HZERO_FILE}/v1/${isNil(tenantId) ? '' : `${tenantId}/`}files`;
  return request(action, {
    method: 'POST',
    body: attachmentUrls || [],
  }).then(response => {
    if (getResponse(response) && isArray(response) && response[0]) {
      const file = response[0];
      return {
        ...file,
        uid: file.fileId,
        name: file.fileName,
        size: file.fileSize,
        type: file.fileType || '',
        url: file.fileUrl,
        creationDate: moment(file.creationDate).toDate(),
        status: 'done',
      };
    }
    throw new Error(response && response.message);
  });
}

async function previewFile(recordData) {
  const { BASE_PATH } = getEnvConfig() as any;
  const { fileUrl } = recordData;
  const fileInfo = await fetchList({ attachmentUrls: [fileUrl] });
  if (!fileInfo) {
    return;
  }
  const { _previewToken, _fileToken } = fileInfo;
  const tenantId = cookie.get('tenantId');
  const ext = getFileExtension(fileUrl);
  // 图片预览
  if (imgs.includes(ext)) {
    const basePath = (BASE_PATH || '').replace(/\//g, '');
    window.open(
      `/${basePath}/public/filePreview?url=${encodeURIComponent(
        getAttachmentUrlWithToken(
          fileUrl,
          PUBLIC_BUCKET,
          tenantId,
          undefined,
          undefined,
          _fileToken
        )
      )}`
    );
  }
  if (supportPreviewList.includes(ext)) {
    getSRMAccessCode({ expires: 15 }).then(_sac => {
      const { HZERO_HFLE } = getEnvConfig() as any;
      const version = '/v2';
      const postfix = newUrlPreviewList.includes(ext) ? '/preview/pro' : '/preview';
      // 暂不考虑未登录状态预览附件的场景，因为此前版本似从未支持过，其它附件组件同理
      const prevewUrl = !isNil(tenantId)
        ? `${HZERO_HFLE}${version}/${tenantId}${postfix}`
        : `${HZERO_HFLE}${version}${postfix}`;
      const params = qs.stringify(
        filterNullValueObject({
          url: fileUrl,
          bucketName: PUBLIC_BUCKET,
          directory: 'spfm-comp',
          _sac,
          _previewToken,
        })
      );
      const previewUrl = `${prevewUrl}?${params}`;
      window.open(previewUrl);
    });
  }
}

function changeFileListToChildren(res: any[]) {
  const traversal = item => {
    const newItem = { ...item };
    if (newItem.children) {
      newItem.children = item.children.map(sub => traversal(sub));
    }
    if (newItem.fileList) {
      newItem.children = item.fileList.map(i => i);
      delete newItem.fileList;
    }
    return newItem;
  };
  return res.map(traversal);
}
