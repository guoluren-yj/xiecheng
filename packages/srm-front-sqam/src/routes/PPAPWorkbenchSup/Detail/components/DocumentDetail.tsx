import React, { useCallback, useContext, useEffect, useState } from 'react';
import { Tabs } from 'choerodon-ui/pro';
// import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import DocumentInfo from './DocumentInfo';

import styles from '../../../PPAPWorkbench/Detail/index.less';

const { TabPane } = Tabs;

const DocumentDetail = observer(() => {
  const {
    documentListDs,
    documentInfoDs,
    activeDocumentNum,
    headerDs,
    remoteProps,
  } = useContext<StoreValueType>(Store);

  const [activeKey, setActiveKey] = useState(activeDocumentNum);

  const handleLoadInfo = useCallback((record) => {
    setActiveKey(record?.get('documentNum'));
    documentInfoDs.loadData([record]);
  }, [documentInfoDs, setActiveKey]);

  useEffect(() => {
    documentListDs.paging = false;
    documentListDs.setQueryParameter('size', 0);
    documentListDs.setQueryParameter('view', 'DOCUMENT');
    headerDs.status = DataSetStatus.loading;
    // documentListDs.setQueryParameter('camp', campCode);
    documentListDs.query().then(() => {
      headerDs.status = DataSetStatus.ready;
      if (activeDocumentNum) {
        documentListDs.forEach((record) => {
          if (record?.get('documentNum') === activeDocumentNum) handleLoadInfo(record);
        });
      } else handleLoadInfo(documentListDs.current);
    });
  }, [documentListDs, handleLoadInfo, activeDocumentNum, headerDs]);


  const getRenderHeaDer = useCallback(() => {
    return (
      <div className={styles['detail-tab-extra-content']}>
        <div className={styles['detail-tips']}>{intl.get(`sqam.ppap.model.template.deliverableDetail`).d('交付物清单')}</div>
        <div className={styles['detail-tips-text']}>{intl.get(`sqam.ppap.model.document.tips`).d('点击对应的交付物查看详情')}</div>
      </div>
    );
  }, []);

  const getTabHeaderRander = useCallback((
    params: {
      documentName: string | null,
      documentNum: string | null,
      documentStatus: string,
      documentStatusMeaning: string | null,
      stageStatus: string | null,
      record: any,
      remoteProps: any,
    }) => {
    const { documentName, documentNum, documentStatus, documentStatusMeaning, stageStatus, record, remoteProps } = params;
    const statusTag =  <StatusTag value={documentStatusMeaning} flag color={stageStatus === 'NOT_STARTED' ? 'gray' : TagColor[documentStatus] || 'success'} />;
    const statusTagRender = remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_SUP_DETAIL_CUX_DOCUMENT_DETAIL_TAB_HEADER_STATUS_RENDERER', statusTag, { record, text: documentStatusMeaning, stageStatus, documentStatus, TagColor, StatusTag }) : statusTag;
    return (
      <div className={styles['detail-tab-header']}>
        <div className={styles['detail-tab-status']}>
          <div className={classNames(styles['detail-tab-title'], { [styles['detail-tab-title-active']]: documentNum === activeKey })}>{documentName}</div>
          {statusTagRender}
        </div>
        <div>
          <span className={styles['detail-tab-document-num']}>{documentNum}</span>
        </div>
      </div>
    );
  }, [activeKey]);

  const handleChangeTabs = useCallback((keys) => {
    const record = documentListDs.find((v) => v?.get('documentNum') === keys);
    if (record) {
      handleLoadInfo(record);
    }
  }, [documentListDs, handleLoadInfo]);


  return (
    <div className={styles['document-detail']}>
      <Tabs tabPosition={TabsPosition.left} activeKey={activeKey} tabBarExtraContent={getRenderHeaDer()} onChange={handleChangeTabs}>
        {documentListDs.map((item) => {
          const { documentNum, documentName, documentStatus, documentStatusMeaning, stageStatus } = item?.get(['documentNum', 'documentName', 'documentStatus', 'documentStatusMeaning', 'stageStatus']) || {};
          return (
            <TabPane key={documentNum} tab={getTabHeaderRander({documentName, documentNum, documentStatus, documentStatusMeaning, stageStatus, record: item, remoteProps})}>
              <DocumentInfo />
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
});

export default DocumentDetail;
