/*
 * NewApprove - 新建审批表单
 * @Date: 2023-12-21 15:16:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose } from 'lodash';
import querystring from 'querystring';
import { Collapse } from 'choerodon-ui';
import { useObserver } from 'mobx-react-lite';
import React, { useState, useEffect, useMemo } from 'react';
import { Spin, useDataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from '@/routes/index.less';
import { getPanelList } from '@/routes/AppraisalPurchaser/Detail/utils';

import HeaderBtns from '../../Detail/HeaderBtns';
import { getBasicDs } from '../../stores/getBasicDS';
import ScoreCombineTable from '../../components/ScoreCombineTable';
import { getParticipSupplierDs } from '../../stores/getParticipSupplierDS';
import { getAppraisalIndicatorDs } from '../../stores/getAppraisalIndicatorDS';
import { getAppraisalPersonDs } from '../../stores/getAppraisalPersonDS';
import { getScoreCombineTableDs } from '../../stores/getScoreCombineTableDS';

const { Panel } = Collapse;
const defaultActiveKey = ['basicInfo', 'participSupplier', 'appraisalIndicator', 'appraisalPerson'];

const Index = ({
  location,
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  customizeCommon,
  queryTemplateConfig,
  match: {
    params: { evalHeaderId, evalGranularity },
  },
}) => {
  const evalStatus = 'NEW_APPROVING'; // 指定状态，防止单据审批通过以后页签展示变化
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { templateCode, templateVersion, stageCode, pageCode } = routerParams;

  const basicDs = useDataSet(() => getBasicDs({ editFlag: false, evalHeaderId }), [evalHeaderId]);
  const participSupplierDs = useDataSet(
    () => getParticipSupplierDs({ evalHeaderId, evalGranularity }),
    [evalHeaderId, evalGranularity]
  );
  const appraisalIndicatorDs = useDataSet(() => getAppraisalIndicatorDs({ evalHeaderId }), [
    evalHeaderId,
  ]);
  const { evalRespRule } = useObserver(() => basicDs.current?.get(['evalRespRule']) || {});
  const appraisalPersonDs = useDataSet(() => getAppraisalPersonDs({ evalHeaderId, evalRespRule }), [
    evalHeaderId,
    evalRespRule,
  ]);
  const scoreCombineTableDs = useDataSet(() => getScoreCombineTableDs({ evalHeaderId }), [
    evalHeaderId,
  ]);

  const dsObj = {
    basicInfo: basicDs,
    participSupplier: participSupplierDs,
    appraisalIndicator: appraisalIndicatorDs,
    appraisalPerson: appraisalPersonDs,
  };
  const panelList = useMemo(
    () => getPanelList({ evalStatus, workflowFlag: true, newWorkflowFlag: true }),
    [evalStatus]
  );

  // 工作流单据样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  const handleQuery = () => {
    setLoading(true);
    const params = {
      ...wfParams,
      customizeUnitCode: [
        'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.AF_BASIC',
        'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.BASIC',
      ].join(),
    };
    basicDs.setQueryParameter('queryParams', params);
    basicDs.query().finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    handleQuery();
  }, [evalHeaderId, JSON.stringify(wfParams)]);

  useEffect(() => {
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  // 预览考评档案
  const handlePreview = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1090 },
      title: intl.get('sslm.common.field.previewAppraisal').d('预览考评档案'),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: false,
      children: (
        <ScoreCombineTable
          readOnlyFlag
          basicDs={basicDs}
          dispatch={dispatch}
          wfParams={wfParams}
          sourceKey="PREVIEW"
          custLoading={custLoading}
          evalHeaderId={evalHeaderId}
          dataSet={scoreCombineTableDs}
          customizeTable={customizeTable}
          evalGranularity={evalGranularity}
          searchCode="SSLM.APPRAISAL_PURCHASER_DETAIL.PREVIEW_SEARCH"
          customizeUnitCode="SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.PREVIEW_LISTS"
        />
      ),
    });
  };

  const getAFBasicFieldsConfig = () => ({
    evalName: {
      render: ({ record }) => {
        const { evalName, evalNum } = record?.get(['evalName', 'evalNum']) || {};
        return `${evalName}—${evalNum}`;
      },
    },
  });

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
    return (
      <HeaderBtns
        loading={loading}
        basicDs={basicDs}
        wfParams={wfParams}
        custLoading={custLoading}
        customizeTable={customizeTable}
        evalGranularity={evalGranularity}
        evalHeaderId={evalHeaderId}
        onPreview={handlePreview}
      />
    );
  };

  // 折叠栏展开、收起回调
  const handleCollapseChange = key => {
    setActiveKey(key);
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['af-wrap']}>
        {customizeCommon(
          {
            code: 'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.AF_BASIC',
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            dataSet={basicDs}
            titleField="evalName"
            custLoading={custLoading}
            fieldsConfig={getAFBasicFieldsConfig()}
            contentBottomRender={contentBottomRender}
            normalFields={['createdUserName', 'creationDate']}
            tagFields={['evalDimensionMeaning', 'evalCycleMeaning', 'evalTplTypeMeaning']}
          />
        )}
      </div>
      <Content wrapperClassName={styles['content-wrap']} className={styles['customize-wrap']}>
        <Collapse
          trigger="text-icon"
          activeKey={activeKey}
          expandIconPosition="text-right"
          onChange={handleCollapseChange}
        >
          {panelList.map(panel => (
            <Panel header={panel.header} key={panel.key}>
              <panel.component
                readOnlyFlag
                isEdit={false}
                basicDs={basicDs}
                wfParams={wfParams}
                dispatch={dispatch}
                baseInfoEdit={false}
                dataSet={dsObj[panel.key]}
                custLoading={custLoading}
                evalHeaderId={evalHeaderId}
                customizeForm={customizeForm}
                customizeTable={customizeTable}
                evalGranularity={evalGranularity}
                {...panel.componentProps}
              />
            </Panel>
          ))}
        </Collapse>
      </Content>
    </Spin>
  );
};

export default compose(
  withCustomize({ isTemplate: true }),
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.supplierDocManage',
      'sslm.appraisalPurchaser',
      'sslm.supplierKpiIndicator',
      'spfm.supplierKpiIndicator',
      'sslm.siteInvestigateReport',
    ],
  })
)(Index);
