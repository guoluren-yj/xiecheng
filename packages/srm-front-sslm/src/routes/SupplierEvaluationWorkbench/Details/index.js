/**
 * @description: 供应商评估 - 供应商自评
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-13 09:12:56
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo, useState, useEffect, useCallback } from 'react';
import { Header, Content } from 'components/Page';
import { DataSet, Spin, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { compose, isEmpty, isNil } from 'lodash';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import qs from 'querystring';
import { getResponse, getCurrentTenant } from 'utils/utils';
import notification from 'utils/notification';

import {
  handleQueryHeader,
  saveFeedBackInfo,
  submitFeedBack,
} from '@/services/purchaserEvaluationWorkbenchServices';
import { fetchConfigTable } from '@/services/commonService';

import SupplierInfo from '@/routes/PurchaserEvaluationWorkbench/Details/SupplierInfo';
import AssessmentInfo from '@/routes/PurchaserEvaluationWorkbench/Details/AssessmentInfo';
import AllAttachments from '@/routes/PurchaserEvaluationWorkbench/Details/AllAttachments';

import styles from '@/routes/index.less';
import BasicInfo from './BasicInfo';
import HeaderBtns from './HeaderBtns';
import CompanyInfo from './CompanyInfo';
import ItemCategoryInfo from './ItemCategoryInfo';
import AssessmentPanel from './AssessmentPanel';
import AssessmentResult from './AssessmentResult';
import ReformContent from './ReformContent';

import {
  getBasicInfoDs,
  getAssessmentInfoDs,
  getItemCategoryInfoDs,
  getAssessmentPanelDs,
  getReformContentDs,
} from '../stores/details';
import style from '../index.less';

const { Panel } = Collapse;

const SupplierEvaluationDetail = props => {
  const {
    remote,
    history,
    location,
    match: {
      params: { status },
      path,
    },
    customizeForm,
    custLoading,
    customizeTable,
    customizeCollapse,
  } = props;
  const title = {
    edit: intl.get('sslm.supplierEvaluationDetail.view.header.editTitle').d('供应商自评'),
    view: intl.get('sslm.supplierEvaluationDetail.view.header.viewTitle').d('查看已发布的评估报告'),
  };
  const isPub = path.includes('/pub/');
  const isPublishedFlag = status === 'view';
  // 待自评:toBeSelfEvaluated | 已发布:published
  const { evalHeaderId, tabPaneKey } = qs.parse(location.search.substr(1));
  // 已发布评估报告单据标识
  const issuedDocumentFlag = tabPaneKey === 'published';

  const [loading, setLoading] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [isShowReformContent, setIsShowReformContent] = useState(false);
  const [defaultCollapseKey, setDefaultCollapseKey] = useState([
    'supplierInfo',
    'assessmentInfo',
    'attachment',
    'basicInfo',
    'companyInfo',
    'itemCategoryInfo',
    'assessmentPanel',
    'assessmentResult',
    'reformContent',
  ]);
  // const [inAttCatch, setInAttCatch] = useState([]); // 内部附件缓存
  // const [extAttCatch, setExtAttCatch] = useState([]); // 外部附件缓存
  // const [extAttCatch, setExtAttCatch] = useState([]); // 外部附件缓存

  const [showOldModal, setShowOldModal] = useState(false);
  const [basicInfoData, setBasicInfoData] = useState({});
  const basicInfoDs = useMemo(() => new DataSet(getBasicInfoDs(showOldModal)), [showOldModal]);
  const reportStatus = basicInfoDs?.current?.get('reportStatus');
  // 工作流页面以及，status === 'view'；都是只读页面
  const newReadOnly =
    isPub ||
    status === 'view' ||
    !['WAITINGREJECTED', 'BACK'].includes(reportStatus) ||
    ['selfRatedEvaluated'].includes(tabPaneKey);
  const readOnly = remote.process(
    'SSLM_SUPPLIER_EVALUATION_WORKBENCH_DETAIL_READONLY',
    newReadOnly,
    { ...props, basicInfoDs }
  );

  // 单据状态
  const {
    progressStatus,
    averageFlag,
    evalType,
    needFeedbackFlag,
    selfIndicatorType,
    evalPlanStrategy: { viewParentFlag, selfIndicatorType: inSelfIndicatorType } = {},
  } = basicInfoData || {};

  // selfIndicatorType 后端可能返在里面也可能返在外面了

  // 评估策略为勾选‘按照指标类型自评’，‘供应商自评’且为线上打分，显示字段
  const showSelfEvaluation =
    evalType === 'ONLINE' && needFeedbackFlag && (selfIndicatorType || inSelfIndicatorType);
  const assessmentInfoDs = useMemo(
    () =>
      new DataSet(
        getAssessmentInfoDs({
          tabPaneKey,
          showSelfEvaluation,
          selection: false,
          source: 'feedback',
          // code: +flag ? 'UN_COMPLETE' : 'COMPLETED',
          searchCode: issuedDocumentFlag
            ? 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO_PUBLISHED'
            : 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO',
          tableCode: issuedDocumentFlag
            ? 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE_PUBLISHED,SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION'
            : 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE',
        })
      ),
    []
  );
  const itemCategoryInfoDs = useMemo(
    () => new DataSet(getItemCategoryInfoDs(evalHeaderId, tabPaneKey)),
    []
  );
  const assessmentPanelDs = useMemo(
    () => new DataSet(getAssessmentPanelDs(evalHeaderId, tabPaneKey)),
    []
  );

  const reformContentDs = useMemo(
    () =>
      new DataSet(
        getReformContentDs({
          evalHeaderId,
          orderSource: 'siteEval',
        })
      ),
    [evalHeaderId]
  );
  // 【已发布】进详情，去掉传参supplierEvalFlag=1
  assessmentInfoDs.setQueryParameter('supplierEvalFlag', isPublishedFlag ? null : 1);
  // 用于 配置了自评范围为仅底层指标，且允许查看上级指标 数据查询,避免影响其他引用到的功能
  assessmentInfoDs.setQueryParameter('viewParentFlag', viewParentFlag);
  assessmentInfoDs.bind(basicInfoDs, 'siteEvalLines'); // 评分信息
  itemCategoryInfoDs.bind(basicInfoDs, 'siteEvalItemCates');
  assessmentPanelDs.bind(basicInfoDs, 'siteEvalGroups'); // 评估小组

  // 查询、保存、提交所需的个性化单元编码
  const customizeUnitCode = issuedDocumentFlag
    ? [
        'SSLM.SUPPLIER_ASSESS_DETAIL.BASIC_INFO_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.COMPANYINFO_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.SUPPLIER_INFO_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_RESULT_PUBLISHED',
        'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION_PUBLISHED',
      ].join(',')
    : [
        'SSLM.SUPPLIER_ASSESS_DETAIL.BASIC_INFO',
        'SSLM.SUPPLIER_ASSESS_DETAIL.COMPANYINFO',
        'SSLM.SUPPLIER_ASSESS_DETAIL.SUPPLIER_INFO',
        'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO',
        'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_RESULT',
        'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION',
      ].join(',');

  // 基本信息查询
  const handleQuery = useCallback(() => {
    setLoading(true);
    // 头信息数据
    handleQueryHeader({ evalHeaderId, customizeUnitCode, tabPaneKey })
      .then(res => {
        const result = getResponse(res);
        if (result) {
          setBasicInfoData(result);
          basicInfoDs.loadData([result]);
          setIsPublished(basicInfoDs?.current?.get('reportStatus') === 'PUBLISHED');
          reformContentDs.query().then(r => {
            const response = getResponse(r);
            setIsShowReformContent(response.content.length !== 0);
          });
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [showOldModal]);

  const saveOrSubmit = (saveFlag, assessmentInfoData) => {
    setLoading(true);
    const operationFun = saveFlag ? submitFeedBack : saveFeedBackInfo;
    let data = {};
    const params = basicInfoDs?.current?.toJSONData() || {};
    const siteEvalGroups = assessmentPanelDs.toJSONData() || {};
    data = {
      ...params,
      siteEvalGroups,
      customizeUnitCode,
      siteEvalLines: assessmentInfoData || params.siteEvalLines,
    };
    if (isPublished) {
      const siteEvalLines = assessmentInfoDs?.toData() || [];
      const siteEvalItemCates = itemCategoryInfoDs.toJSONData() || {};
      data = {
        ...params,
        siteEvalLines: assessmentInfoData || siteEvalLines,
        siteEvalItemCates,
        siteEvalGroups,
      };
    }
    return operationFun(data)
      .then(resp => {
        const res = getResponse(resp);
        if (res) {
          notification.success();
          if (saveFlag) {
            history.push('/sslm/supplier-evaluation-workbench/list');
          } else {
            handleQuery();
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 提交、保存
  const handleSaveAndSubmit = async saveFlag => {
    const checkFlag = await basicInfoDs?.current?.validate();
    if (!checkFlag) {
      console.log('头报错：', basicInfoDs?.current?.getValidationErrors());
      console.log('评估信息报错：', assessmentInfoDs?.getValidationErrors());
    } else {
      const vetoScoreFlag = basicInfoDs?.current?.get('evalPlanStrategy')?.vetoScoreFlag;
      if (saveFlag && vetoScoreFlag) {
        const vetoList = assessmentInfoDs.filter(record => record.get('indicatorType') === 'VETO');
        const checkVetoFlag = vetoList.some(record => Boolean(record.get('selfIsVeto')));
        // 除否决项的其他指标
        const otherList = assessmentInfoDs.filter(record => record.get('indicatorType') !== 'VETO');
        // 判断是否有指标打了分
        const scoredFlag = otherList.some(record =>
          record.get('indicatorType') === 'SCORE'
            ? !isNil(record.get('selfSupplierScore'))
            : record.get('indicatorType') === 'TICK'
            ? record.get('selfIsStandard')
            : record.get('indicatorType') === 'OPT'
            ? !isNil(record.get('selfIndOptId'))
            : null
        );
        if (checkVetoFlag && scoredFlag) {
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            okText: intl.get('sslm.common.button.continueSubmit').d('继续提交'),
            children: intl
              .get('sslm.purchaserEvaluationDetail.view.message.continueSubmitMsg')
              .d(
                '根据评估策略配置，本次评分勾选了否决项时其他指标无需评分，继续提交会清空已维护的其他指标的评分，请确认是否继续提交？'
              ),
            onOk: () => {
              const siteEvalLines = assessmentInfoDs.map(record => {
                const indicatorType = record.get('indicatorType');
                switch (indicatorType) {
                  case 'SCORE':
                    record.set('selfSupplierScore', null);
                    break;
                  case 'TICK':
                    record.set('selfIsStandard', 0);
                    break;
                  case 'OPT':
                    record.set('selfIndOptId', null);
                    break;
                  default:
                    break;
                }
                return record.toData();
              });
              return saveOrSubmit(saveFlag, siteEvalLines);
            },
          });
        } else {
          return saveOrSubmit(saveFlag);
        }
      } else {
        return saveOrSubmit(saveFlag);
      }
    }
  };

  useEffect(() => {
    fetchConfigTable({
      configCode: 'source_supplier_lov_old_config',
      data: {
        tenantNum: getCurrentTenant().tenantNum,
      },
    }).then(res => {
      if (getResponse(res)) {
        setShowOldModal(!isEmpty(res));
      }
    });
    handleQuery();
  }, [showOldModal]);

  return (
    <Fragment>
      <Header
        title={title[status]}
        backPath={isPub ? '' : '/sslm/supplier-evaluation-workbench/list'}
      >
        <HeaderBtns
          remote={remote}
          loading={loading}
          history={history}
          readOnly={readOnly}
          dataSet={basicInfoDs}
          evalHeaderId={evalHeaderId}
          setLoading={setLoading}
          handleQuery={handleQuery}
          onSave={() => handleSaveAndSubmit()}
          onSubmit={() => handleSaveAndSubmit(1)}
        />
      </Header>
      <Content className={styles['customize-wrap']} wrapperClassName={styles['content-wrap']}>
        <Spin spinning={loading}>
          {customizeCollapse(
            {
              code: issuedDocumentFlag
                ? 'SSLM.SUPPLIER_ASSESS_DETAIL.COLLAPSE_PUBLISHED'
                : 'SSLM.SUPPLIER_ASSESS_DETAIL.COLLAPSE',
            },
            <Collapse
              bordered={false}
              activeKey={defaultCollapseKey}
              expandIconPosition="text-right"
              trigger="text-icon"
              onChange={newActiveKey => setDefaultCollapseKey(newActiveKey)}
            >
              <Panel
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.basicInfo')
                  .d('基础信息')}
                key="basicInfo"
                forceRender
              >
                <BasicInfo
                  isEdit={!readOnly}
                  dataSet={basicInfoDs}
                  customizeCode={
                    issuedDocumentFlag
                      ? 'SSLM.SUPPLIER_ASSESS_DETAIL.BASIC_INFO_PUBLISHED'
                      : 'SSLM.SUPPLIER_ASSESS_DETAIL.BASIC_INFO'
                  }
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  progressStatus={progressStatus}
                />
              </Panel>
              <Panel
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.companyInfo')
                  .d('公司信息')}
                key="companyInfo"
                forceRender
              >
                <CompanyInfo
                  isEdit={!readOnly}
                  dataSet={basicInfoDs}
                  customizeCode={
                    issuedDocumentFlag
                      ? 'SSLM.SUPPLIER_ASSESS_DETAIL.COMPANYINFO_PUBLISHED'
                      : 'SSLM.SUPPLIER_ASSESS_DETAIL.COMPANYINFO'
                  }
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  progressStatus={progressStatus}
                />
              </Panel>
              <Panel
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.supplierInfo')
                  .d('供应商信息')}
                key="supplierInfo"
                forceRender
              >
                <SupplierInfo
                  isEdit={!readOnly}
                  dataSet={basicInfoDs}
                  customizeCode={
                    issuedDocumentFlag
                      ? 'SSLM.SUPPLIER_ASSESS_DETAIL.SUPPLIER_INFO_PUBLISHED'
                      : 'SSLM.SUPPLIER_ASSESS_DETAIL.SUPPLIER_INFO'
                  }
                  customizeReadOnly={readOnly}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                  showOldModal={showOldModal}
                  isFeedBack
                  isSupplier
                />
              </Panel>
              <Panel
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.itemCategoryInfo')
                  .d('评估物料/品类')}
                key="itemCategoryInfo"
                forceRender
              >
                <ItemCategoryInfo
                  isEdit={!readOnly}
                  dataSet={itemCategoryInfoDs}
                  customizeCode={
                    issuedDocumentFlag
                      ? 'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL_PUBLISHED'
                      : 'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL'
                  }
                  customizeTable={customizeTable}
                  custLoading={custLoading}
                  progressStatus={progressStatus}
                />
              </Panel>
              <Panel
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.assessmentTeam')
                  .d('评估小组')}
                key="assessmentPanel"
                forceRender
              >
                <AssessmentPanel
                  isEdit={!readOnly}
                  dataSet={assessmentPanelDs}
                  customizeCode={
                    issuedDocumentFlag
                      ? 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM_PUBLISHED'
                      : 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM'
                  }
                  customizeTable={customizeTable}
                  custLoading={custLoading}
                  progressStatus={progressStatus}
                  assessmentInfoDs={assessmentInfoDs}
                />
              </Panel>
              {evalType === 'ONLINE' && (
                <Panel
                  header={intl
                    .get('sslm.purchaserEvaluationDetail.view.content.assessmentInfo')
                    .d('评估信息')}
                  key="assessmentInfo"
                  forceRender
                >
                  <AssessmentInfo
                    issuedDocumentFlag={issuedDocumentFlag}
                    isEdit={!readOnly}
                    customizeReadOnly={readOnly}
                    showSelfEvaluation={showSelfEvaluation}
                    dataSet={assessmentInfoDs}
                    customizeCode={
                      issuedDocumentFlag
                        ? 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE_PUBLISHED'
                        : 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE'
                    }
                    customizeTable={customizeTable}
                    custLoading={custLoading}
                    averageFlag={averageFlag}
                    progressStatus={progressStatus}
                    dataSource="feedback"
                    searchCode={
                      issuedDocumentFlag
                        ? 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO_PUBLISHED'
                        : 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO'
                    }
                    statusCustomizeCode="SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION"
                    history={history}
                  />
                </Panel>
              )}
              {isPublished && (
                <Panel
                  header={intl
                    .get('sslm.purchaserEvaluationDetail.view.content.assessmentResult')
                    .d('评估结果')}
                  key="assessmentResult"
                  forceRender
                >
                  <AssessmentResult
                    isEdit={!readOnly}
                    dataSet={basicInfoDs}
                    customizeCode={
                      issuedDocumentFlag
                        ? 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_RESULT_PUBLISHED'
                        : 'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_RESULT'
                    }
                    customizeForm={customizeForm}
                    custLoading={custLoading}
                    pubEditFlag={isPub}
                  />
                </Panel>
              )}
              {isShowReformContent && (
                <Panel
                  key="reformContent"
                  forceRender
                  header={intl
                    .get('sslm.purchaserEvaluationDetail.view.content.reformContent')
                    .d('整改内容')}
                >
                  <ReformContent
                    history={history}
                    isEdit={false}
                    dataSet={reformContentDs}
                    customizeCode={
                      issuedDocumentFlag
                        ? 'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION_PUBLISHED'
                        : 'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION'
                    }
                    customizeTable={customizeTable}
                  />
                </Panel>
              )}
              <Panel key="attachment" forceRender showArrow={false} className={style.noHeader}>
                <AllAttachments
                  isEdit={!readOnly}
                  dataSet={basicInfoDs}
                  dataSource="feedback"
                  customizeReadOnly={readOnly}
                />
              </Panel>
            </Collapse>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.purchaserEvaluation',
      'sslm.purchaserEvaluationDetail',
      'sslm.supplierEvaluation',
      'sslm.supplierEvaluationDetail',
      'sslm.evaluationStrategy',
      'sslm.evaluationStrategyDetail',
      'sslm.common',
      'sslm.commonApplication',
    ],
  }),
  remotes({
    code: 'SSLM_SUPPLIER_EVALUATION_WORKBENCH_DETAIL',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_ASSESS_DETAIL.BASIC_INFO',
      'SSLM.SUPPLIER_ASSESS_DETAIL.BASIC_INFO_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.COMPANYINFO',
      'SSLM.SUPPLIER_ASSESS_DETAIL.COMPANYINFO_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.SUPPLIER_INFO',
      'SSLM.SUPPLIER_ASSESS_DETAIL.SUPPLIER_INFO_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL',
      'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATE_MATERIAL_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TEAM_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_INFO_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_RESULT',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_RESULT_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION',
      'SSLM.SUPPLIER_ASSESS_DETAIL.QUALIT_RECTIFICATION_PUBLISHED',
      'SSLM.SUPPLIER_ASSESS_DETAIL.COLLAPSE',
      'SSLM.SUPPLIER_ASSESS_DETAIL.COLLAPSE_PUBLISHED',
      'SSLM.PURCHASER_ASSESS_LIST.REFORMCONTENT_MODAL',
      'SSLM.SUPPLIER_ASSESS_DETAIL.ASSESSMENT_TABLE_PUBLISHED.ATTACHMENT',
    ],
  })
)(SupplierEvaluationDetail);
