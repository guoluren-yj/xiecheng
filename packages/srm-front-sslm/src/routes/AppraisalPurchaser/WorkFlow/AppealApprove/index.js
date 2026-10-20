/*
 * SubmitApprove - 提交申请单审批表单
 * @Date: 2023-12-21 15:16:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose } from 'lodash';
import querystring from 'querystring';
import { Collapse } from 'choerodon-ui';
import React, { useState, useEffect, useMemo } from 'react';
import { Spin, useDataSet } from 'choerodon-ui/pro';

import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from '@/routes/index.less';
import { getPanelList } from '@/routes/AppraisalPurchaser/Detail/utils';

import HeaderBtns from '../../Detail/HeaderBtns';
import { getBasicDs } from '../../stores/getBasicDS';
import { getScoreCombineTableDs } from '../../stores/getScoreCombineTableDS';
import { getAppraisalAttachmentDs } from '../../stores/getAppraisalAttachmentDS';

const { Panel } = Collapse;
const defaultActiveKey = ['basicInfo', 'scoreResult', 'appraisalAttachment', 'resultAttachment'];

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
  const evalStatus = 'APPEALING'; // 指定状态，防止单据审批通过以后页签展示变化
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { templateCode, templateVersion, stageCode, pageCode } = routerParams;

  const basicDs = useDataSet(() => getBasicDs({ editFlag: false, evalHeaderId }), [evalHeaderId]);
  const scoreCombineTableDs = useDataSet(() => getScoreCombineTableDs({ evalHeaderId }), [
    evalHeaderId,
  ]);
  const appraisalAttachmentDs = useDataSet(() => getAppraisalAttachmentDs({ evalHeaderId }), [
    evalHeaderId,
  ]);

  const dsObj = {
    basicInfo: basicDs,
    scoreResult: scoreCombineTableDs,
    appraisalAttachment: appraisalAttachmentDs,
  };
  const panelList = useMemo(() => getPanelList({ evalStatus, workflowFlag: true }), [evalStatus]);

  // 工作流单据样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  const handleQuery = () => {
    setLoading(true);
    const queryParams = {
      ...wfParams,
      customizeUnitCode: [
        'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.AF_BASIC',
        'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.BASIC',
      ].join(),
    };
    basicDs.setQueryParameter('queryParams', queryParams);
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
        evalHeaderId={evalHeaderId}
        customizeTable={customizeTable}
        evalGranularity={evalGranularity}
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
                workflowFlag
                isEdit={false}
                basicDs={basicDs}
                wfParams={wfParams}
                dispatch={dispatch}
                baseInfoEdit={false}
                custLoading={custLoading}
                dataSet={dsObj[panel.key]}
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
      'sslm.evaluationQuery',
      'sslm.supplierDocManage',
      'sslm.appraisalPurchaser',
      'sslm.supplierKpiIndicator',
      'spfm.supplierKpiIndicator',
      'sslm.siteInvestigateReport',
    ],
  })
)(Index);
