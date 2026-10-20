/*
 * @Date: 2024-02-02 17:32:44
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import qs from 'querystring';
import { Collapse } from 'choerodon-ui';
import { useObserver } from 'mobx-react-lite';
import { compose, isFunction } from 'lodash';
import React, { useState, useEffect, useMemo } from 'react';
import { Spin, useDataSet, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  batchExtractDataSetData,
  batchInitDataSetByPlainData,
  batchSetDataSetByPlainData,
} from '_utils/workflow';
import hocRemote from 'utils/remote';

import styles from '@/routes/index.less';
import { handleSaveAllDetail } from '@/services/purchaserEvaluationWorkbenchServices';
import {
  getBasicInfoDs,
  getItemCategoryInfoDs,
  getAssessmentPanelDs,
  getAssessmentInfoDs,
  getReformContentDs,
} from '../../stores/details';
import Supplement from './Supplement';
import HeaderBtns from '../../Details/HeaderBtns';
import { getPanelList } from './utils';

const { Panel } = Collapse;
const defaultActiveKey = [
  'assessmentResult',
  'reformContent',
  'basicInfo',
  'companyInfo',
  'supplierInfo',
  'itemCategoryInfo',
  'assessmentPanel',
  'assessmentInfo',
  'attachment',
];
// 头查询接口个性化单元编码
const basicCustomizeCode = [
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.AF_BASIC',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.BASIC_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.COMPANY_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.EX_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.IN_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.SUPPLIER_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.ASSESSMENT_RESULT',
];
// 工作流保存接口个性化单元编码
const saveCustomizeCode = [
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.AF_BASIC',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.BASIC_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.COMPANY_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.EX_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.IN_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.SUPPLIER_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.ASSESSMENT_RESULT',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.ASSESSMENT_TEAM',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.EVALUATION_INFO',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.MATERIALS_TABLE',
  'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.QUALITY_RECTIFIC',
];
// 将初始化后的record.id与当前页面ds中record的对应关系转成map结构
const initMappings = [new Map()];

const Index = ({
  history,
  location,
  onLoad,
  custLoading,
  customizeForm,
  customizeTable,
  customizeCommon,
  customizeBtnGroup,
  queryTemplateConfig,
  remote,
}) => {
  const routerParams = useMemo(() => qs.parse(location.search.substr(1)), [location.search]);
  const { evalHeaderId, templateCode, templateVersion, stageCode } = routerParams;
  const pageCode = 'RESULTS_DETAIL'; // 写死，工作流配置返回的不对

  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);

  const basicInfoDs = useDataSet(() => getBasicInfoDs(), []);
  const supplementBasicDs = useDataSet(() => basicInfoDs.props, [basicInfoDs.props]);
  const reformContentDs = useDataSet(() => getReformContentDs({ evalHeaderId }), [evalHeaderId]);
  const itemCategoryInfoDs = useDataSet(() => getItemCategoryInfoDs(evalHeaderId), [evalHeaderId]);
  const assessmentPanelDs = useDataSet(() => getAssessmentPanelDs(evalHeaderId), [evalHeaderId]);
  const assessmentInfoDs = useDataSet(
    () =>
      getAssessmentInfoDs({
        selection: 'multiple',
        evalHeaderId,
        isCreate: false,
        readOnly: true,
        searchCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO',
      }),
    [evalHeaderId]
  );

  reformContentDs.bind(basicInfoDs, 'siteEvalExternalOrders'); // 质量整改
  itemCategoryInfoDs.bind(basicInfoDs, 'siteEvalItemCates'); // 评估物料/品类
  assessmentPanelDs.bind(basicInfoDs, 'siteEvalGroups'); // 评估小组
  assessmentInfoDs.bind(basicInfoDs, 'siteEvalLineList'); // 评分信息

  // 单据状态
  const { needFeedbackFlag, evalType, averageFlag, resultsFlag, selfIndicatorType } =
    useObserver(() =>
      basicInfoDs.current?.get([
        'needFeedbackFlag',
        'evalType',
        'averageFlag',
        'resultsFlag',
        'selfIndicatorType',
      ])
    ) || {};

  // 评估策略为勾选‘按照指标类型自评’，‘供应商自评’且为线上打分，显示字段
  const showSelfEvaluation = evalType === 'ONLINE' && needFeedbackFlag && selfIndicatorType;

  // 工作流单据样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

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
  const getSaveParams = async () => {
    const saveHeaderData = basicInfoDs?.current?.toJSONData() || {};
    const customizeUnitCode = saveCustomizeCode.join();
    return {
      wfParams,
      ...saveHeaderData,
      customizeUnitCode,
    };
  };

  const workflowSubmit = approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = await getSaveParams();
        handleSaveAllDetail(payload).then(response => {
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

  // 工作流审批通过调功能端保存
  useEffect(() => {
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, [onLoad]);

  useEffect(() => {
    hadnleQuery();
  }, [evalHeaderId, JSON.stringify(wfParams)]);

  const hadnleQuery = () => {
    setLoading(true);
    basicInfoDs.setQueryParameter('queryParams', {
      wfParams,
      evalHeaderId,
      customizeUnitCode: basicCustomizeCode.join(),
    });
    basicInfoDs.query().finally(() => {
      setLoading(false);
    });
    reformContentDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.QUALITY_RECTIFIC'
    );
    itemCategoryInfoDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.MATERIALS_TABLE'
    );
    assessmentPanelDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.ASSESSMENT_TEAM'
    );
    assessmentInfoDs.setQueryParameter(
      'customizeUnitCode',
      [
        'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO',
        'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.EVALUATION_INFO',
      ].join()
    );
  };

  const handleCollapseChange = key => {
    setActiveKey(key);
  };

  const handleInitData = async () => {
    // 提取当前页面ds的数据
    const externalFromData = await batchExtractDataSetData([basicInfoDs]);
    // 用提取的数据初始化内部表单ds，并返回初始化前后record.id的对应关系
    const mappings = batchInitDataSetByPlainData(externalFromData, [supplementBasicDs]);
    mappings[0].forEach(([fromRecordId, targetRecordId]) => {
      initMappings[0].set(targetRecordId, fromRecordId);
    });
  };

  useEffect(() => {
    handleInitData();
  }, [basicInfoDs.current]);

  // 信息补录弹框
  const handleSupplement = () => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      title: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          stageCode={stageCode}
          pageCode="RESULTS_SUPPLEMENT"
          templateCode={templateCode}
          basicInfoDs={supplementBasicDs}
          templateVersion={templateVersion}
        />
      ),
      onOk: async () => {
        const validatorFlag = await supplementBasicDs.validate();
        if (validatorFlag) {
          // 提取内部表单ds的数据
          const fromData = await batchExtractDataSetData([supplementBasicDs]);
          // 将所提取数据中的来源recordId按照记录的对应关系，替换成当前页面ds的recordId，并过滤掉对应关系不存在的数据
          const mappingData1 = fromData[0].data
            .filter(r => initMappings[0].has(r[0]))
            .map(r => [initMappings[0].get(r[0]), r[1]]);
          // 使用替换后的提取数据设置当前页面ds
          batchSetDataSetByPlainData([{ data: mappingData1 }], [[basicInfoDs]]);
        } else {
          return false;
        }
      },
    });
  };

  const getAFBasicFieldsConfig = () => ({
    evalNum: {
      render: ({ record }) => {
        const { evalNum, evalDescription } = record?.get(['evalNum', 'evalDescription']) || {};
        return evalDescription ? `${evalNum}—${evalDescription}` : evalNum;
      },
    },
  });

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
    return (
      <HeaderBtns
        readOnly
        workflowFlag
        isCreate={false}
        loading={loading}
        dataSet={basicInfoDs}
        onSupplement={handleSupplement}
        customizeBtnGroup={customizeBtnGroup}
        customizeCode="SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.HEADER_BTNS"
      />
    );
  };

  // AFBasic右侧渲染
  const contentRemainRender = () => {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          paddingRight: 20,
          paddingTop: 20,
        }}
      >
        <span style={{ color: '#868D9C' }}>
          {intl.get('sslm.purchaserEvaluationDetail.form.label.resultsFlag').d('评估结果')}
        </span>
        <span
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: resultsFlag === '0' ? '#f05434' : '#179454',
          }}
        >
          {/* 不直接取接口返回值，因为resultsFlag会随着补录变化而resultsFlagMeaning不会 */}
          {resultsFlag === '0'
            ? intl.get('sslm.common.view.field.noPass').d('不通过')
            : intl.get('sslm.common.view.field.pass').d('通过')}
        </span>
      </div>
    );
  };

  const panelList = remote
    ? remote.process(
        'SSLM_PURCHASER_EVALUATION_WORKBENCH_RESULT_APPROVE_PROCESS_PANEL_LIST',
        getPanelList({ evalType }),
        {
          evalHeaderId,
        }
      )
    : getPanelList({ evalType });

  const dataSetObj = {
    assessmentResult: basicInfoDs,
    reformContent: reformContentDs,
    basicInfo: basicInfoDs,
    supplierInfo: basicInfoDs,
    companyInfo: basicInfoDs,
    itemCategoryInfo: itemCategoryInfoDs,
    assessmentPanel: assessmentPanelDs,
    assessmentInfo: assessmentInfoDs,
    attachment: basicInfoDs,
  };

  const commonProps = {
    history,
    evalType,
    setLoading,
    custLoading,
    basicInfoDs,
    customizeForm,
    customizeTable,
    assessmentInfoDs,
    averageFlag,
    needFeedbackFlag,
    showSelfEvaluation,
    assessmentPanelDs,
    reportStatus: 'APPROVALING',
    progressStatus: 'EVAL_RESULT',
    isOnLine: evalType === 'ONLINE',
  };

  return (
    <Spin spinning={loading}>
      <div className={styles['af-wrap']}>
        {customizeCommon(
          {
            code: 'SSLM.PURCHASER_ASSESS_DETAIL_CUSTOM.AF_BASIC',
            processUnitTag: 'AF-BASIC',
          },
          <AFBasic
            titleField="evalNum"
            dataSet={basicInfoDs}
            custLoading={custLoading}
            contentRemainWidth="100px"
            fieldsConfig={getAFBasicFieldsConfig()}
            contentRemainRender={contentRemainRender}
            contentBottomRender={contentBottomRender}
            normalFields={['realName', 'creationDate']}
            tagFields={[
              'groupMeaning',
              'investigationTypeMeaning',
              'assessTypeMeaning',
              'sourceTypeMeaning',
            ]}
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
            <Panel
              key={panel.key}
              header={panel.title}
              showArrow={!panel.isNoAllowFolding}
              className={`${panel.title ? null : styles.noHeader}`}
            >
              <panel.component
                {...commonProps}
                {...panel.componentProps}
                dataSet={dataSetObj[panel.key]}
                customizeUnitCode={panel.customizeUnitCode}
              />
            </Panel>
          ))}
        </Collapse>
      </Content>
    </Spin>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.purchaserEvaluation',
      'sslm.purchaserEvaluationDetail',
      'sslm.evaluationStrategy',
      'sslm.evaluationStrategyDetail',
      'sslm.common',
      'sslm.commonApplication',
      'sslm.supplierDocManage',
      'sslm.siteInvestigateReport',
      'scux.sslm',
    ],
  }),
  withCustomize({ isTemplate: true }),
  hocRemote({
    code: 'SSLM_PURCHASER_EVALUATION_WORKBENCH_RESULT_APPROVE',
    name: 'remote',
  })
)(Index);
