/*
 * SubmitApprove - 提交申请单审批表单
 * @Date: 2023-12-21 15:16:51
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { Collapse } from 'choerodon-ui';
import { compose, isFunction } from 'lodash';
import React, { useState, useEffect, useMemo } from 'react';
import { Spin, useDataSet, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import {
  batchExtractDataSetData,
  batchInitDataSetByPlainData,
  batchSetDataSetByPlainData,
} from '_utils/workflow';
import hocRemote from 'utils/remote';

import styles from '@/routes/index.less';
import { getPanelList } from '@/routes/AppraisalPurchaser/Detail/utils';
import { saveAppraisal } from '@/services/appraisalPurchaserService';

import Supplement from '../Supplement';
import HeaderBtns from '../../Detail/HeaderBtns';
import { getBasicDs } from '../../stores/getBasicDS';
import StatisticsChart from './StatisticsChart';
import { getScoreCombineTableDs } from '../../stores/getScoreCombineTableDS';
import { getAppraisalAttachmentDs } from '../../stores/getAppraisalAttachmentDS';

const { Panel } = Collapse;
const defaultActiveKey = ['basicInfo', 'scoreResult', 'appraisalAttachment', 'resultAttachment'];
// 保存所需的code
const saveUnitCode = [
  'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.BASIC',
  'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.INDICATOR_LISTS',
  'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.PARTICIP_SUPPLIER_LIST',
  'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.SCORE_RESULT_LIST',
  'SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.SCORE_RESULT_DETAIL',
];

const Index = ({
  onLoad,
  location,
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  customizeCommon,
  customizeBtnGroup,
  queryTemplateConfig,
  remote,
  match: {
    params: { evalTplId, evalHeaderId, evalGranularity },
  },
}) => {
  const evalStatus = 'APPROVING'; // 指定状态，防止单据审批通过以后页签展示变化
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { templateCode, templateVersion, stageCode } = routerParams;
  const pageCode = 'SUBMIT_DETAIL';

  const basicDs = useDataSet(() => getBasicDs({ editFlag: false, evalHeaderId }), [evalHeaderId]);
  const scoreCombineTableDsProps = remote.process(
    'SSLM_APPRAISAL_PURCHASER_SUBMIT_APPROVE_SCORE_COMBINE_TABLE_DS_PROPS',
    getScoreCombineTableDs({ evalTplId, evalHeaderId }),
    {}
  );
  const scoreCombineTableDs = useDataSet(() => scoreCombineTableDsProps, [evalTplId, evalHeaderId]);
  const appraisalAttachmentDs = useDataSet(() => getAppraisalAttachmentDs({ evalHeaderId }), [
    evalHeaderId,
  ]);

  const dsObj = {
    basicInfo: basicDs,
    scoreResult: scoreCombineTableDs,
    appraisalAttachment: appraisalAttachmentDs,
  };
  const panelList = useMemo(() => {
    const sourcePanelList = getPanelList({ evalStatus, workflowFlag: true });
    return remote
      ? remote.process(
          'SSLM_APPRAISAL_PURCHASER_SUBMIT_APPROVE_PROCESS_PANEL_LIST',
          sourcePanelList,
          {
            dsObj,
            evalHeaderId,
            evalGranularity,
          }
        )
      : sourcePanelList;
  }, [evalStatus, evalHeaderId, remote]);

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
    if (evalHeaderId) {
      handleQuery();
    }
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

  // 获取需保存的参数
  const getSaveParams = () => {
    const basicData = basicDs.current?.toJSONData() || {};
    const collectKpiEvalLines = scoreCombineTableDs.toJSONData();
    const params = {
      ...basicData,
      wfParams,
      collectKpiEvalLines,
      customizeUnitCode: saveUnitCode.join(','),
    };
    return params;
  };

  const workflowSubmit = approveResult => {
    return new Promise((resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = getSaveParams();
        saveAppraisal(payload).then(response => {
          const res = getResponse(response);
          if (res) {
            resolve(res);
          } else {
            reject();
          }
        });
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, []);

  // 信息补录弹框
  const handleSupplement = async () => {
    const supplementBasicDs = new DataSet(basicDs.props);
    const supplementCombineTableDs = new DataSet({
      ...scoreCombineTableDs.props,
      paging: false, // 不分页，解决主页面100条数据时，补录单只显示20条数据问题
    });
    // 提取当前页面ds的数据
    const externalFromData = await batchExtractDataSetData([basicDs, scoreCombineTableDs]);
    // 用提取的数据初始化内部表单ds，并返回初始化前后record.id的对应关系
    const mappings = batchInitDataSetByPlainData(externalFromData, [
      supplementBasicDs,
      supplementCombineTableDs,
    ]);
    // 将初始化后的record.id与当前页面ds中record的对应关系转成map结构
    const initMappings = [new Map(), new Map()];
    mappings.forEach((mapping, mappingIndex) => {
      mapping.forEach(([fromRecordId, targetRecordId]) => {
        initMappings[mappingIndex].set(targetRecordId, fromRecordId);
      });
    });
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      title: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          wfParams={wfParams}
          stageCode={stageCode}
          pageCode="SUBMIT_SUPPLEMENT"
          templateCode={templateCode}
          customizeTable={customizeTable}
          templateVersion={templateVersion}
          supplementBasicDs={supplementBasicDs}
          supplementCombineTableDs={supplementCombineTableDs}
        />
      ),
      onOk: async () => {
        const validatorFlag =
          (await supplementBasicDs.validate()) && (await supplementCombineTableDs.validate());
        if (validatorFlag) {
          // 提取内部表单ds的数据
          const fromData = await batchExtractDataSetData([
            supplementBasicDs,
            supplementCombineTableDs,
          ]);
          // 将所提取数据中的来源recordId按照记录的对应关系，替换成当前页面ds的recordId，并过滤掉对应关系不存在的数据
          const dataList = [];
          fromData.forEach((item, index) => {
            const mappingData = item.data
              .filter(r => initMappings[index].has(r[0]))
              .map(r => [initMappings[index].get(r[0]), r[1]]);
            dataList.push({ data: mappingData });
          });
          // 使用替换后的提取数据设置当前页面ds
          batchSetDataSetByPlainData(dataList, [[basicDs], [scoreCombineTableDs]]);
        } else {
          return false;
        }
      },
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
        workflowFlag
        loading={loading}
        basicDs={basicDs}
        wfParams={wfParams}
        custLoading={custLoading}
        customizeTable={customizeTable}
        evalGranularity={evalGranularity}
        evalHeaderId={evalHeaderId}
        onSupplement={handleSupplement}
        customizeUnitCode={saveUnitCode}
        customizeBtnGroup={customizeBtnGroup}
        customizeCode="SSLM.APPRAISAL_PURCHASER.DETAIL_CUSTOM.HEADER_BTN"
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
        <StatisticsChart evalHeaderId={evalHeaderId} evalTplId={evalTplId} />
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
      'scux.sslm',
    ],
  }),
  hocRemote({
    code: 'SSLM_APPRAISAL_PURCHASER_SUBMIT_APPROVE',
    name: 'remote',
  })
)(Index);
