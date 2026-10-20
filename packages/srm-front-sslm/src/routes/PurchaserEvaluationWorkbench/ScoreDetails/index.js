/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-06 18:03:01
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useState, useMemo, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import { DataSet, Spin, useDataSet, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import { compose, isNil } from 'lodash';
import qs from 'querystring';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import remote from 'utils/remote';

import {
  // handleQueryHeader,
  saveFillingScore,
  submitFillingScore,
} from '@/services/purchaserEvaluationWorkbenchServices';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import AssessmentInfo from '../Details/AssessmentInfo';
import AllAttachments from '../Details/AllAttachments';
import ReformContent from '../Details/ReformContent';
import ScoreSumInfo from './ScoreSumInfo';
import HeaderBtns from './HeaderBtns';
import ItemCategoryInfo from '../Details/ItemCategoryInfo';

import {
  getBasicInfoDs,
  getAssessmentInfoDs,
  getScoreSumInfoDs,
  getReformContentDs,
  getItemCategoryInfoDs,
} from '../stores/details';

import styles from '../index.less';
import '@/routes/index.less';

const sourceKey = 'SCORE_DETAILS';
const saveUnitCode = [
  'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
  'SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFY',
  'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_INFORMATION',
  'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_SUM_INFORMATION',
  'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE_SCORE',
];

const { Panel } = Collapse;
const defaultCollapseKeys = [
  'assessmentInfo',
  'itemCategoryInfo',
  'reformContent',
  'scoreSumInfo',
  'attachments',
];

const ScoreDetails = ({
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
  customizeBtnGroup,
  purEvaluationScoreRemote,
}) => {
  const isPub = path.includes('/pub/');
  const { evalHeaderId, flag, submitUserId } = qs.parse(location.search.substr(1));

  const title = {
    edit: intl.get('sslm.purchaserEvaluationScoreDetail.view.header.editTitle').d('评分'),
    view: intl.get('sslm.purchaserEvaluationScoreDetail.view.header.viewTitle').d('查看评分'),
  };
  const [loading, setLoading] = useState(false);
  const [basicInfo, setBasicInfo] = useState({});
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});

  const {
    reportStatus,
    averageFlag,
    progressStatus,
    evalNum,
    supplierName,
    assessTypeMeaning,
    scoreStatus,
  } = basicInfo || {};
  // 工作流页面以及，status === 'view'；都是只读页面
  const readOnly =
    isPub || status === 'view' || !['UNSCORE', 'SCORE_REJECTED'].includes(scoreStatus);

  const basicInfoDs = useMemo(() => new DataSet(getBasicInfoDs()), [
    readOnly,
    status,
    evalHeaderId,
  ]);

  const assessmentInfoDs = useDataSet(
    () =>
      getAssessmentInfoDs({
        selection: 'multiple',
        source: 'score',
        code: +flag ? 'UN_COMPLETE' : 'COMPLETED',
        allFlag: readOnly ? 1 : null,
        searchCode: 'SSLM.PURCHASER_ASSESS_DETAIL.SCORE.ASSESSMENT_INFO',
        evalHeaderId,
        submitUserId: isPub ? submitUserId : '',
      }),
    [readOnly, evalHeaderId, flag]
  );
  const scoreSumInfoDs = useDataSet(
    () =>
      getScoreSumInfoDs({
        submitUserId: isPub ? submitUserId : '',
        customizeUnitCode: 'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_SUM_INFORMATION',
      }),
    [status, evalHeaderId]
  );
  const reformContentDs = useDataSet(() => getReformContentDs({ evalHeaderId, sourceKey }), [
    sourceKey,
    evalHeaderId,
  ]);
  const itemCategoryInfoDs = useDataSet(() => getItemCategoryInfoDs(evalHeaderId, sourceKey), [
    status,
    sourceKey,
    evalHeaderId,
  ]);

  assessmentInfoDs.bind(basicInfoDs, 'siteEvalLineResps'); // 评分信息
  scoreSumInfoDs.bind(basicInfoDs, 'siteEvalRespHeader'); // 评分汇总信息
  reformContentDs.bind(basicInfoDs, 'siteEvalExternalOrders'); // 质量整改
  itemCategoryInfoDs.bind(basicInfoDs, 'siteEvalItemCates'); // 评估物料/品类

  // 基础信息
  const { needFeedbackFlag, evalType, selfIndicatorType } =
    basicInfoDs.current?.get(['needFeedbackFlag', 'evalType', 'selfIndicatorType']) || {};
  // 评估策略为勾选‘按照指标类型自评’，‘供应商自评’且为线上打分，显示字段
  const showSelfEvaluation = evalType === 'ONLINE' && needFeedbackFlag && selfIndicatorType;

  // 基本信息查询
  const handleQuery = () => {
    setLoading(true);
    reformContentDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFY'
    );
    // 头信息数据
    const params = {
      evalHeaderId,
      customizeUnitCode: [
        'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
        'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
      ].join(','),
    };
    basicInfoDs.setQueryParameter('queryParams', params);
    basicInfoDs
      .query()
      .then(res => {
        const result = getResponse(res);
        if (result) {
          const { businessKey } = result;
          setBasicInfo(result);
          handleQueryAllApprovalData(businessKey);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const saveOrSubmit = (saveFlag, assessmentInfoData) => {
    setLoading(true);
    const operationFun = saveFlag ? submitFillingScore : saveFillingScore;
    const params = basicInfoDs?.current?.toJSONData() || {};
    const siteEvalRespHeader = scoreSumInfoDs?.current?.toData() || {};
    const siteEvalLineResps = assessmentInfoData || assessmentInfoDs?.toData() || [];
    return operationFun({
      ...params,
      siteEvalRespHeader,
      siteEvalLineResps,
      customizeUnitCode: saveUnitCode.join(','),
    })
      .then(resp => {
        const res = getResponse(resp);
        if (res) {
          notification.success();
          if (saveFlag) {
            history.push('/sslm/purchaser-evaluation-workbench/list');
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
    // 埋点修改保存方法
    if (purEvaluationScoreRemote.event) {
      const eventProps = {
        saveUnitCode,
        saveFlag,
        basicInfoDs,
        scoreSumInfoDs,
        assessmentInfoDs,
        handleQuery,
        saveFillingScore,
        submitFillingScore,
        setLoading,
        history,
      };
      // 默认返回true,当返回false时走二开逻辑不走标准逻辑
      const res = await purEvaluationScoreRemote.event.fireEvent('handleSaveAndSubmit', eventProps);
      if (!res) {
        return;
      }
    }
    const checkFlag = await basicInfoDs?.current?.validate();
    if (checkFlag) {
      const vetoScoreFlag = basicInfoDs?.current?.get('evalPlanStrategy')?.vetoScoreFlag;
      if (saveFlag && vetoScoreFlag) {
        const vetoList = assessmentInfoDs.filter(record => record.get('indicatorType') === 'VETO');
        const checkVetoFlag = vetoList.some(record => Boolean(record.get('isVeto')));
        // 除否决项的其他指标
        const otherList = assessmentInfoDs.filter(record => record.get('indicatorType') !== 'VETO');
        // 判断是否有指标打了分
        const scoredFlag = otherList.some(record =>
          record.get('indicatorType') === 'SCORE'
            ? !isNil(record.get('score'))
            : record.get('indicatorType') === 'TICK'
            ? record.get('isStandard')
            : record.get('indicatorType') === 'OPT'
            ? !isNil(record.get('evalTplIndOptId'))
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
              const siteEvalLineResps = assessmentInfoDs.map(record => {
                const indicatorType = record.get('indicatorType');
                switch (indicatorType) {
                  case 'SCORE':
                    record.set('score', null);
                    break;
                  case 'TICK':
                    record.set('isStandard', 0);
                    break;
                  case 'OPT':
                    record.set({
                      indOptLov: null,
                      score: null,
                      evalTplIndOptId: null,
                      indOptName: null,
                    });
                    break;
                  default:
                    break;
                }
                return record.toData();
              });
              return saveOrSubmit(saveFlag, siteEvalLineResps);
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

  const handleViewEval = () => {
    openTab({
      key: '/sslm/include/purchaser-evaluation-workbench/details/view',
      title: intl.get('sslm.purchaserEvaluationDetail.view.header.viewTitle').d('查看评估报告'),
      search: qs.stringify({
        evalHeaderId,
      }),
    });
  };

  useEffect(() => {
    handleQuery();
  }, [readOnly, status, evalHeaderId]);

  // 处理审批/撤销审批
  const handleQueryAllApprovalData = key => {
    if (key) {
      queryAllApprovalData({ businessKeys: [key], queryHistoryFlag: false }).then(res => {
        if (res) {
          const { approvalDataMap, revokeDataMap } = res;
          setApprovalBtnInfo({
            approvalDataMap,
            revokeDataMap,
          });
        }
      });
    } else {
      setApprovalBtnInfo({});
    }
  };

  return (
    <Fragment>
      <Header
        title={title[status]}
        backPath={isPub ? '' : '/sslm/purchaser-evaluation-workbench/list'}
      >
        <HeaderBtns
          isPub={isPub}
          loading={loading}
          readOnly={readOnly}
          submitUserId={submitUserId}
          evalHeaderId={evalHeaderId}
          customizeBtnGroup={customizeBtnGroup}
          basicInfo={basicInfo}
          handleViewEval={handleViewEval}
          handleSaveAndSubmit={handleSaveAndSubmit}
          approvalBtnInfo={approvalBtnInfo}
          handleQuery={handleQuery}
          remote={purEvaluationScoreRemote}
          history={history}
        />
      </Header>
      <Content className="customize-wrap" wrapperClassName="content-wrap">
        <Spin spinning={loading}>
          {customizeCollapse(
            {
              code: 'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_COLLAPSE',
            },
            <Collapse
              bordered={false}
              trigger="text-icon"
              activeKey={defaultCollapseKeys}
              expandIconPosition="text-right"
            >
              <Panel
                forceRender
                key="assessmentInfo"
                showArrow={false}
                className={`${styles.noHeader}`}
              >
                {purEvaluationScoreRemote.process(
                  'SSLM_PURCHASER_EVALUATION_WORKBENCH_SCORE_DETAILS_ASSESSMENT_INFO_TITLE',
                  <div className={styles.scoreTitle}>
                    {`${evalNum}-${supplierName}`}
                    <span>{assessTypeMeaning}</span>
                  </div>,
                  {
                    basicInfo,
                  }
                )}
                <AssessmentInfo
                  isEdit={!readOnly}
                  dataSet={assessmentInfoDs}
                  customizeTable={customizeTable}
                  customizeCode="SSLM.PURCHASER_ASSESS_DETAIL.SCORE_INFORMATION"
                  custLoading={custLoading}
                  dataSource="score"
                  evalHeaderId={evalHeaderId}
                  averageFlag={averageFlag}
                  customizeReadOnly={readOnly}
                  progressStatus={progressStatus}
                  showSelfEvaluation={showSelfEvaluation}
                  searchCode="SSLM.PURCHASER_ASSESS_DETAIL.SCORE.ASSESSMENT_INFO"
                  history={history}
                  setLoading={setLoading}
                  remote={purEvaluationScoreRemote}
                  customizeBtnGroupCode="SSLM.PURCHASER_ASSESS_DETAIL.SCORE.ASSESSMENT_BTN_GROUP"
                />
              </Panel>
              <Panel
                forceRender
                key="itemCategoryInfo"
                showArrow={false}
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.itemCategoryInfo')
                  .d('评估物料/品类')}
              >
                <ItemCategoryInfo
                  isEdit={false}
                  sourceKey={sourceKey}
                  custLoading={custLoading}
                  dataSet={itemCategoryInfoDs}
                  customizeReadOnly={readOnly}
                  customizeTable={customizeTable}
                  customizeCode="SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE_SCORE"
                />
              </Panel>
              <Panel
                forceRender
                key="scoreSumInfo"
                showArrow={false}
                header={intl
                  .get('sslm.purchaserEvaluationDetail.form.title.scoreSumInfo')
                  .d('评分人汇总信息')}
              >
                <ScoreSumInfo
                  isEdit={!readOnly}
                  dataSet={scoreSumInfoDs}
                  customizeReadOnly={readOnly}
                  customizeCode="SSLM.PURCHASER_ASSESS_DETAIL.SCORE_SUM_INFORMATION"
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                />
              </Panel>
              <Panel
                forceRender
                key="reformContent"
                showArrow={false}
                header={intl
                  .get('sslm.purchaserEvaluationDetail.view.content.reformContent')
                  .d('质量整改')}
              >
                <ReformContent
                  isPub={isPub}
                  history={history}
                  readOnly={readOnly}
                  setLoading={setLoading}
                  basicInfoDs={basicInfoDs}
                  reportStatus={reportStatus}
                  dataSet={reformContentDs}
                  sourceKey={sourceKey}
                  evalHeaderId={evalHeaderId}
                  customizeReadOnly={readOnly}
                  customizeTable={customizeTable}
                  progressStatus={progressStatus}
                  customizeCode="SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFY"
                />
              </Panel>
              <Panel key="attachments" showArrow={false} className={`${styles.noHeader}`}>
                <AllAttachments
                  dataSet={basicInfoDs}
                  isEdit={!readOnly}
                  dataSource="score"
                  customizeForm={customizeForm}
                  pubEditFlag={isPub}
                  custLoading={custLoading}
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
      'sslm.purchaserEvaluationScoreDetail',
      'sslm.evaluationStrategy',
      'sslm.evaluationStrategyDetail',
      'sslm.common',
      'sslm.commonApplication',
      'scux.sslm',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
      'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
      'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_INFORMATION',
      'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_SUM_INFORMATION',
      'SSLM.PURCHASER_ASSESS_DETAIL.SCORE.ASSESSMENT_BTN_GROUP',
      'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_COLLAPSE',
      'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_HEADER_BTN',
      'SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFY',
      'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE_SCORE',
    ],
  }),
  remote({
    code: 'SSLM_PURCHASER_EVALUATION_WORKBENCH_SCORE',
    name: 'purEvaluationScoreRemote',
  })
)(ScoreDetails);
