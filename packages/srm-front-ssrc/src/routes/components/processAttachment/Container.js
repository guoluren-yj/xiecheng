import React, { useEffect, useState, useCallback } from 'react';
import classnames from 'classnames';
import { Icon, Spin } from 'choerodon-ui/pro';
import { isEmpty, compose, noop } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';

import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';

import { ReactComponent as NoProcessAttach } from '@/assets/no-process-attach.svg';
import { fetchOperationRecords, fetchOperationScoreRecords } from './service';
import OperationList from './OperationList';
// import data from './mock';
import styles from './index.less';

const promptCode = 'ssrc.inquiryHall';

const Container = (props) => {
  const { rfxHeaderId, myStore, modal, processRemote, sourceFrom = 'check' } = props;
  // sourceFrom: 'check' | 'score-rpt'
  const [fileLists, setFileLists] = useState([]);
  const [currentTab, setCurrentTab] = useState('NEW');
  const [loading, setLoading] = useState(false);
  const [iconDirection, setIconDirection] = useState({}); // 分模块判断每个模块展开收起

  const getQueryApi = () => {
    let api = noop;
    switch (sourceFrom) {
      case 'check':
        api = fetchOperationRecords;
        break;
      case 'score-rpt':
        api = fetchOperationScoreRecords;
        break;
      default:
        api = fetchOperationRecords;
        break;
    }
    return api;
  };
  const getFileList = useCallback(
    async (current) => {
      try {
        setLoading(true);
        const listResult = getResponse(
          await getQueryApi()({
            rfxHeaderId,
            fileType: current || 'NEW',
            permissionFilterFlag: myStore?.permissionFilterFlag || 0,
          })
        );
        const res = processRemote
          ? await processRemote.process(
              'SSRC_COMPONENTS_PROCESS_ATTACHMENT_PROCESS_FILE_LISTS',
              listResult,
              { rfxHeaderId }
            )
          : listResult;
        if (res) {
          setFileLists(res);
        }
        if (!res?.length) {
          modal.update({
            okProps: { disabled: true },
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [rfxHeaderId, myStore]
  );

  useEffect(() => {
    getFileList();
  }, [getFileList]);

  useEffect(() => {
    myStore.currentTab = currentTab;
  }, [currentTab]);

  const handleChangeButtonGroup = useCallback(
    (current) => {
      if (currentTab === current) {
        return;
      }
      setCurrentTab(current);
      modal.update({
        okText:
          current === 'ALL'
            ? intl.get(`ssrc.common.model.common.downloadAll`).d('下载全部文档')
            : intl.get(`ssrc.common.model.common.downloadNew`).d('下载最新文档'),
      });
      getFileList(current);
    },
    [currentTab]
  );

  // 点击头
  const handleOpen = useCallback(
    (sourceNode) => {
      setIconDirection({ ...iconDirection, [sourceNode]: !iconDirection[sourceNode] });
    },
    [iconDirection]
  );

  const allAttachmentFlag = processRemote
    ? processRemote.process('SSRC_COMPONENTS_PROCESS_ATTACHMENT_PROCESS_ALL_ATTACHMENT_FLAG', true)
    : true;

  return (
    <Spin spinning={loading}>
      {isEmpty(fileLists) ? (
        // <div className={styles['empty-wrapper']}>
        //   <span>{intl.get('ssrc.common.view.message.emptyData').d('暂无数据')}</span>
        // </div>
        <div className={styles['no-content-wrapper']}>
          <span className={styles['no-content-img']}>
            <NoProcessAttach />
          </span>
          <span className={styles['no-content-text']}>
            {intl.get('ssrc.common.view.message.noProcessAttach').d('暂无过程附件')}
          </span>
        </div>
      ) : (
        <>
          <div className={styles['header-groups']}>
            <ul className={styles['left-button-group']}>
              <li
                key="NEW"
                className={classnames(styles['button-group-item'], {
                  [styles['button-group-item-selected']]: currentTab === 'NEW',
                })}
                onClick={() => handleChangeButtonGroup('NEW')}
              >
                {intl.get(`${promptCode}.view.button.theNewestAttachment`).d('最新附件')}
              </li>
              {allAttachmentFlag && (
                <li
                  key="ALL"
                  className={classnames(styles['button-group-item'], {
                    [styles['button-group-item-selected']]: currentTab === 'ALL',
                  })}
                  onClick={() => handleChangeButtonGroup('ALL')}
                >
                  {intl.get(`${promptCode}.view.button.allAttachment`).d('全部附件')}
                </li>
              )}
            </ul>
          </div>
          <div className={styles['all-list-container']}>
            {!!fileLists?.length &&
              fileLists.map((ele) => {
                return (
                  <div key={ele.node} className={styles['operation-wrapper']}>
                    <span className={styles['operation-record']}>{ele.nodeMeaning}</span>
                    <Icon
                      className={styles['operation-icon']}
                      onClick={() => handleOpen(ele.node)}
                      type={!iconDirection[ele.node] ? 'expand_less' : 'expand_more'}
                    />
                    <div
                      className={
                        !iconDirection[ele.node]
                          ? styles['operation-content']
                          : styles['operation-content-closed']
                      }
                    >
                      <OperationList dataSource={ele.newCheckRfxNodeAttachmentDTOS} />
                    </div>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </Spin>
  );
};

export default compose(
  formatterCollections({
    code: ['ssrc.common', 'ssrc.inquiryHall'],
  }),
  remote({
    code: 'SSRC_COMPONENTS_PROCESS_ATTACHMENT',
    name: 'processRemote',
  })
)(Container);
