import React, { useEffect, useMemo, useCallback, useContext, useState } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { TabsPosition } from 'choerodon-ui/lib/tabs/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import classNames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';

import StatusTag from '../../../PPAPTemplate/components/StatusTag';
import { TagColor, DetailStageFormCode, DetailStageCollapse } from '../../utils/type';
import { Store } from '../stores';
import type { StoreValueType } from '../stores';
import StageDocumentList from './StageDocumentList';
import EditorForm from '../../../components/EditorForm';

import styles from '../../../PPAPWorkbench/Detail/index.less';

const { TabPane } = Tabs;
const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'list',
];

const DocumentDetail = observer(() => {
  const {
    stageListDs,
    stageInfoDs,
    documentStageLineDs,
    activeStageNum,
    customizeForm,
    customizeCollapse,
    remoteProps,
    headerDs,
  } = useContext<StoreValueType>(Store);

  const [activeKey, setActiveKey] = useState(activeStageNum);

  const handleLoadInfo = useCallback((record) => {
    const stageId = record?.get('stageId');
    setActiveKey(record?.get('stageNum'));
    stageInfoDs.loadData([record]);
    documentStageLineDs.setQueryParameter('stageId', stageId);
    documentStageLineDs.query();
  }, [stageInfoDs, documentStageLineDs]);

  useEffect(() => {
    stageListDs.paging = false;
    stageListDs.setQueryParameter('size', 0);
    headerDs.status = DataSetStatus.loading;
    stageListDs.query().then(() => {
      headerDs.status = DataSetStatus.ready;
      if (activeStageNum) {
        stageListDs.forEach((record) => {
          if (record?.get('stageNum') === activeStageNum) handleLoadInfo(record);
        });
      } else handleLoadInfo(stageListDs.current);
    });
  }, [stageListDs, activeStageNum, handleLoadInfo, headerDs]);


  const getRenderHeaDer = useCallback(() => {
    return (
      <div className={styles['detail-tab-extra-content']}>
        <div className={styles['detail-tips']}>{intl.get(`sqam.ppap.model.template.stage`).d('阶段')}</div>
        <div className={styles['detail-tips-text']}>{intl.get(`sqam.ppap.model.stage.tips`).d('点击对应的阶段查看详情')}</div>
      </div>
    );
  }, []);

  const editorColumns = useMemo(() => {
    return [
      {
        name: 'stageStatus',
        renderer: ({ record, text, value }) => {
          const statusTag = <StatusTag value={record?.get('stageStatusMeaning')} flag color={TagColor[record?.get('stageStatus')] || 'success'} />;
          return remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_SUP_DETAIL_CUX_STAGE_DETAIL_STATUS_RENDERER', statusTag, { record, text, value, TagColor, StatusTag }) : statusTag;
        },
      },
      'stageNum',
      'stageName',
      'companyName',
      'supplierCompanyName',
      'projectNum',
      'openDate',
      'closeDate',
      'openExpectDate',
      'closeExpectDate',
      'documentsCompletedPercent',
      'stageApproveOpinion',
      'stageRemark',
      {
        name: 'supplyFlag',
        renderer: ({ value }) => yesOrNoRender(Number(value || 0)),
      },
    ];
  }, []);

  const handleChangeTabs = useCallback((keys) => {
    const record = stageListDs.find((v) => v?.get('stageNum') === keys);
    if (record) {
      handleLoadInfo(record);
    }
  }, [stageListDs, handleLoadInfo]);

  const getTabHeaderRander = useCallback((stageName: string | null, stageNum: string | null, stageStatus: string, stageStatusMeaning: string | null, record: any, remoteProps: any) => {
    const statusTag =  <StatusTag value={stageStatusMeaning} flag color={TagColor[stageStatus] || 'success'} />;
    const statusTagRender = remoteProps.process ? remoteProps.process('SQAM_PPAPWORKBENCH_SUP_DETAIL_CUX_STAGE_DETAIL_TAB_HEADER_STATUS_RENDERER', statusTag, { record, text: stageStatusMeaning, stageStatus, TagColor, StatusTag }) : statusTag;
    return (
      <div className={styles['detail-tab-header']}>
        <div className={styles['detail-tab-status']}>
          <div className={classNames(styles['detail-tab-title'], { [styles['detail-tab-title-active']]: stageNum === activeKey })}>{stageName}</div>
          {statusTagRender}
        </div>
        <div>
          <span className={styles['detail-tab-document-num']}>{stageNum}</span>
        </div>
      </div>
    );
  }, [activeKey]);

  if (!stageInfoDs?.current) return null;

  return (
    <div className={styles['document-detail']}>
      <Tabs tabPosition={TabsPosition.left} activeKey={activeKey} tabBarExtraContent={getRenderHeaDer()} onChange={handleChangeTabs}>
        {stageListDs.map((item) => {
          const { stageName, stageNum, stageStatus, stageStatusMeaning } = item?.get(['stageName', 'stageNum', 'stageStatus', 'stageStatusMeaning']) || {};
          return (
            <TabPane key={stageNum} tab={getTabHeaderRander(stageName, stageNum, stageStatus, stageStatusMeaning, item, remoteProps)}>
              <div className={styles['sqam-detail-content-ppapWorkbench']}>
                {
                  customizeCollapse(
                    {
                      code: DetailStageCollapse,
                    },
                    <Collapse
                      ghost
                      trigger="icon"
                      expandIconPosition="text-right"
                      defaultActiveKey={defaultActiveKey}
                    >
                      <Panel key='basic' forceRender header={`${stageName || ''}-${intl.get(`hzero.common.view.baseInfo`).d('基本信息')}`} showArrow={false}>
                        <EditorForm
                          columns={3}
                          useColon={false}
                          dataSet={stageInfoDs}
                          editorFlag={false}
                          editorColumns={editorColumns}
                          customizeForm={customizeForm}
                          customizeOptions={{ code: DetailStageFormCode }}
                        />
                      </Panel>
                      <Panel forceRender header={intl.get(`sqam.ppap.model.template.deliverableDetail`).d('交付物清单')} key='list' showArrow={false}>
                        <StageDocumentList />
                      </Panel>
                    </Collapse>
                  )
                }
              </div>
            </TabPane>
          );
        })}
      </Tabs>
    </div>
  );
});

export default DocumentDetail;
