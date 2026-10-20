/**
 * 采购方评估 - 详情
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-30 14:40:05
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
// import moment from 'moment';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';
import { compose, isEmpty, head, isFunction } from 'lodash';
import { Steps, Collapse, Input, Row, Col } from 'choerodon-ui';
import React, { Fragment, useState, useEffect, useCallback, useMemo, createRef } from 'react';
import { DataSet, Form, Spin, Modal, TextArea, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
// import { dateTimeRender } from 'utils/renderer';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import PositionAnchor from '_components/PositionAnchor';
import { getResponse, getCurrentOrganizationId, getCurrentTenant } from 'utils/utils';
import remotes from 'utils/remote';
import {
  handleSaveAllDetail,
  handleGetSteps,
  handleSExecutiveScore,
  submitApproval,
  summaryStatistics,
  publishReport,
  submitFeedback,
  handleBackScore,
  handleBack as handleSelfBack,
  detailDelete,
  detailInvalid,
  exportAttachment,
} from '@/services/purchaserEvaluationWorkbenchServices';
import { fetchConfigTable, querySupplierInfo } from '@/services/commonService';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import styles from '@/routes/index.less';
import HeaderBtns from './HeaderBtns';
import BasicInfo from './BasicInfo';
import BackScore from './BackScore';
import CompanyInfo from './CompanyInfo';
import SupplierInfo from './SupplierInfo';
import ItemCategoryInfo from './ItemCategoryInfo';
import AssessmentPanel from './AssessmentPanel';
import AssessmentInfo from './AssessmentInfo';
import AssessmentResult from './AssessmentResult';
import AllAttachments from './AllAttachments';
import ReformContent from './ReformContent';
import ExportReportAttachment from '../ExportReportAttachment';
import {
  getBasicInfoDs,
  getItemCategoryInfoDs,
  getAssessmentPanelDs,
  getAssessmentInfoDs,
  getReformContentDs,
} from '../stores/details';
import style from '../index.less';

const { Step } = Steps;
const { Panel } = Collapse;
const { Link } = PositionAnchor;
const organizationId = getCurrentOrganizationId();
const defaultCollapseKeys = [
  'basicInfo',
  'companyInfo',
  'supplierInfo',
  'itemCategoryInfo',
  'assessmentPanel',
  'assessmentInfo',
  'assessmentResult',
  'reformContent',
  'attachment',
];

const PurchaserEvaluationDetail = observer(
  ({
    modal,
    history,
    location,
    match: {
      params: { status },
      path,
    },
    onLoad,
    customizeForm,
    custLoading,
    customizeTable,
    customizeBtnGroup,
    customizeCollapse,
    remote,
  }) => {
    const exportReportAttRef = createRef(null);
    // 是否是新建的单子
    const isCreate = status === 'create';
    // 显示步骤条标识
    const showStepFlag = !['create', 'view'].includes(status);
    const isPub = path.includes('/pub/');
    // 工作流页面以及，status === 'view'；都是只读页面
    const newReadOnly = isPub || status === 'view';
    const {
      evalHeaderId,
      companyId,
      supplierCompanyId,
      wfEdit,
      sourceType,
      riskEventNum,
      riskProcessUuid,
    } = qs.parse(location.search.substr(1));
    const [loading, setLoading] = useState(false);
    const [stepsConfig, setStepsConfig] = useState([]);
    const [showOldModal, setShowOldModal] = useState(false);
    const [inAttCatch, setInAttCatch] = useState([]); // 内部附件缓存
    const [extAttCatch, setExtAttCatch] = useState([]); // 外部附件缓存
    const [defaultCollapseKey, setDefaultCollapseKey] = useState(defaultCollapseKeys);
    const [currentStep, setCurrentStep] = useState(null); // 当前步骤值，初始化时候不能为0，防止出现个性化渲染错误问题
    const [oldEvalTplId, setOldEvalTplId] = useState(null);
    const [approvalBtnInfo, setApprovalBtnInfo] = useState({});

    const isAmktClient = useMemo(() => sourceType === 'AMKT_CLIENT', [sourceType]); // 单据来源为应用商店
    const basicInfoDsProps = getBasicInfoDs(showOldModal, newReadOnly, isCreate, isAmktClient);
    const basicInfoDs = useDataSet(
      () => remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.BASIC_DS', basicInfoDsProps),
      [status, evalHeaderId, showOldModal, newReadOnly, isCreate, isAmktClient]
    );
    const itemCategoryInfoDs = useDataSet(
      () =>
        remote.process(
          'SSLM.PURCHASER_EVALUATION_WORKBENCH.ITEM_CATEGORY_DS',
          getItemCategoryInfoDs(evalHeaderId)
        ),
      [status, evalHeaderId]
    );
    const assessmentPanelDs = useDataSet(() => getAssessmentPanelDs(evalHeaderId), [
      status,
      evalHeaderId,
    ]);
    const assessmentInfoDs = useDataSet(
      () =>
        getAssessmentInfoDs({
          selection: 'multiple',
          evalHeaderId,
          isCreate,
          readOnly: newReadOnly,
          searchCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO',
        }),
      [status, evalHeaderId, newReadOnly]
    );
    const reformContentDs = useDataSet(
      () =>
        remote.process(
          'SSLM.PURCHASER_EVALUATION_WORKBENCH.REFORM_CONTENT_DS',
          getReformContentDs({ evalHeaderId })
        ),
      [evalHeaderId]
    );

    itemCategoryInfoDs.bind(basicInfoDs, 'siteEvalItemCates'); // 评估物料/品类
    assessmentPanelDs.bind(basicInfoDs, 'siteEvalGroups'); // 评估小组
    assessmentInfoDs.bind(basicInfoDs, 'siteEvalLineList'); // 评分信息
    reformContentDs.bind(basicInfoDs, 'siteEvalExternalOrders'); // 质量整改

    // 用于控制页面是否可编辑，不控制头按钮
    const readOnly = remote.process(
      'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAIL_READONLY',
      newReadOnly,
      { isPub, location, basicInfoDs }
    );

    // 单据状态
    const {
      reportStatus,
      needFeedbackFlag,
      evalType,
      progressStatus,
      averageFlag,
      selfIndicatorType,
      hasCancelFlag,
    } =
      basicInfoDs.current?.get([
        'reportStatus',
        'needFeedbackFlag',
        'evalType',
        'progressStatus',
        'averageFlag',
        'selfIndicatorType',
        'hasCancelFlag',
      ]) || {};
    // 评估策略为勾选‘按照指标类型自评’，‘供应商自评’且为线上打分，显示字段
    const showSelfEvaluation = evalType === 'ONLINE' && needFeedbackFlag && selfIndicatorType;

    // 评估准备工作流，wfEdit配置为1时，评估准备可编辑
    const prepareEdit = isPub && Boolean(Number(wfEdit)) && progressStatus === 'EVAL_PREPARE';

    const title = {
      create: intl.get('sslm.purchaserEvaluationDetail.view.header.createTitle').d('新建评估报告'),
      edit: ['NEW'].includes(reportStatus)
        ? intl.get('sslm.purchaserEvaluationDetail.view.header.editTitle').d('编辑评估报告')
        : intl
            .get('sslm.purchaserEvaluation.button.tableAction.evaluationReportManagement')
            .d('评估报告管理'),
      view: intl.get('sslm.purchaserEvaluationDetail.view.header.viewTitle').d('查看评估报告'),
    };

    // 【评估结果】、【质量整改】确认页签显、隐控制
    const getResultAndReformHidden = () => {
      let hiddenFlag = null;
      // 评估结果确认下标
      const resultIndex = stepsConfig.findIndex(config => config.progressStatus === 'EVAL_RESULT');
      // 评估结果确认、评估完成才显示这两页签
      if (
        ['EVAL_RESULT', 'EVAL_COMPLETE'].includes(progressStatus) ||
        currentStep === resultIndex
      ) {
        if (evalType === 'ONLINE') {
          hiddenFlag = ![
            'FINAL_COLLECTED',
            'APPROVALING',
            'REJECTED',
            'APPROVED',
            'PUBLISHED',
            'FEEDBACK',
          ].includes(reportStatus);
        }
        hiddenFlag = false; // 线下评分，在评估结果确认和评估完成页签下都展示
      } else {
        hiddenFlag = true;
      }
      const remoteHiddenFlag = remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_RESULT_HIDDEN_FLAG',
        hiddenFlag,
        { isPub, basicInfoDs, stepsConfig, currentStep }
      );
      return remoteHiddenFlag;
    };

    const detailsContentConfig = () => {
      const customizeReadOnly = remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH_CUSTOMIZE_READONLY',
        readOnly,
        { isPub, status }
      );
      // 工作流参数
      const pubProps = {
        isPub,
        evalType,
        basicInfoDs,
        reportStatus,
        progressStatus,
      };
      // 基础信息，工作流编辑逻辑
      const basicPubEdit = remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_BASIC_PUB_EDIT',
        prepareEdit,
        pubProps
      );
      // 评估结果，工作流编辑逻辑
      const resultPubEdit = remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS_RESULT_PUB_EDIT',
        false,
        pubProps
      );
      const sourcePanelList = [
        {
          key: 'basicInfo',
          title: intl.get('sslm.purchaserEvaluationDetail.view.content.basicInfo').d('基础信息'),
          component: (
            <BasicInfo
              isEdit={!readOnly}
              isCreate={isCreate}
              pubEdit={basicPubEdit}
              dataSet={basicInfoDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              progressStatus={progressStatus}
              customizeReadOnly={customizeReadOnly}
            />
          ),
        },
        {
          key: 'companyInfo',
          title: intl.get('sslm.purchaserEvaluationDetail.view.content.companyInfo').d('公司信息'),
          component: (
            <CompanyInfo
              isEdit={!readOnly}
              isCreate={isCreate}
              pubEdit={prepareEdit}
              dataSet={basicInfoDs}
              custLoading={custLoading}
              customizeForm={customizeForm}
              progressStatus={progressStatus}
              customizeReadOnly={customizeReadOnly}
            />
          ),
        },
        {
          key: 'supplierInfo',
          title: intl
            .get('sslm.purchaserEvaluationDetail.view.content.supplierInfo')
            .d('供应商信息'),
          component: (
            <SupplierInfo
              isEdit={!readOnly}
              isCreate={isCreate}
              pubEdit={prepareEdit}
              dataSet={basicInfoDs}
              showOldModal={showOldModal}
              custLoading={custLoading}
              customizeForm={customizeForm}
              progressStatus={progressStatus}
              customizeReadOnly={customizeReadOnly}
              remote={remote}
            />
          ),
        },
        {
          key: 'itemCategoryInfo',
          hidden: isCreate,
          title: intl
            .get('sslm.purchaserEvaluationDetail.view.content.itemCategoryInfo')
            .d('评估物料/品类'),
          component: (
            <ItemCategoryInfo
              isPub={isPub}
              isEdit={!readOnly}
              pubEdit={prepareEdit}
              basicInfoDs={basicInfoDs}
              custLoading={custLoading}
              dataSet={itemCategoryInfoDs}
              customizeTable={customizeTable}
              progressStatus={progressStatus}
              customizeReadOnly={customizeReadOnly}
              remote={remote}
            />
          ),
        },
        {
          key: 'assessmentPanel',
          hidden: isCreate,
          title: intl
            .get('sslm.purchaserEvaluationDetail.view.content.assessmentPanel')
            .d('评估小组'),
          component: (
            <AssessmentPanel
              isPub={isPub}
              remote={remote}
              readOnly={readOnly}
              pubEdit={prepareEdit}
              basicInfoDs={basicInfoDs}
              custLoading={custLoading}
              dataSet={assessmentPanelDs}
              customizeTable={customizeTable}
              isOnLine={evalType === 'ONLINE'}
              reportStatus={reportStatus}
              progressStatus={progressStatus}
              assessmentInfoDs={assessmentInfoDs}
              customizeReadOnly={customizeReadOnly}
            />
          ),
        },
        {
          key: 'assessmentInfo',
          hidden: isCreate || evalType !== 'ONLINE',
          title: intl
            .get('sslm.purchaserEvaluationDetail.view.content.assessmentInfo')
            .d('评估信息'),
          component: (
            <AssessmentInfo
              history={history}
              isEdit={!readOnly}
              pubEdit={prepareEdit}
              showSelfEvaluation={showSelfEvaluation}
              basicInfoDs={basicInfoDs}
              custLoading={custLoading}
              averageFlag={averageFlag}
              dataSet={assessmentInfoDs}
              progressStatus={progressStatus}
              customizeTable={customizeTable}
              needFeedbackFlag={needFeedbackFlag}
              assessmentPanelDs={assessmentPanelDs}
              customizeReadOnly={customizeReadOnly}
              remote={remote}
              customizeCode="SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_INFORMATION"
              statusCustomizeCode="SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION"
              searchCode="SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO"
              customizeBtnGroupCode="SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_BTN_GROUP"
            />
          ),
        },
        {
          key: 'assessmentResult',
          hidden: getResultAndReformHidden(),
          title: intl
            .get('sslm.purchaserEvaluationDetail.view.content.assessmentResult')
            .d('评估结果'),
          component: (
            <AssessmentResult
              isEdit={!readOnly}
              dataSet={basicInfoDs}
              pubEdit={resultPubEdit}
              custLoading={custLoading}
              customizeForm={customizeForm}
              customizeReadOnly={customizeReadOnly}
              remote={remote}
            />
          ),
        },
        {
          key: 'reformContent',
          hidden: getResultAndReformHidden(),
          title: intl
            .get('sslm.purchaserEvaluationDetail.view.content.reformContent')
            .d('质量整改'),
          component: (
            <ReformContent
              isPub={isPub}
              history={history}
              readOnly={readOnly}
              setLoading={setLoading}
              basicInfoDs={basicInfoDs}
              reportStatus={reportStatus}
              dataSet={reformContentDs}
              sourceKey="EVALUATION_REPORT"
              customizeTable={customizeTable}
              progressStatus={progressStatus}
              customizeReadOnly={customizeReadOnly}
              remote={remote}
            />
          ),
        },
        {
          // 内部、外部附件
          key: 'attachment',
          title: null,
          hidden: isCreate,
          isNoAllowFolding: true,
          component: (
            <AllAttachments
              isEdit={!readOnly}
              pubEdit={prepareEdit}
              dataSet={basicInfoDs}
              inAttCatch={inAttCatch}
              extAttCatch={extAttCatch}
              custLoading={custLoading}
              customizeForm={customizeForm}
              setInAttCatch={setInAttCatch}
              setExtAttCatch={setExtAttCatch}
              customizeReadOnly={customizeReadOnly}
              remote={remote}
            />
          ),
        },
      ];
      return remote
        ? remote.process(
            'SSLM.PURCHASER_EVALUATION_WORKBENCH_PROCESS_PANEL_LIST',
            sourcePanelList,
            {
              readOnly,
              evalHeaderId,
            }
          )
        : sourcePanelList;
    };

    // 获取需保存的参数
    const getSaveParams = async () => {
      const validateFlag = await basicInfoDs?.current?.validate();
      // 拼接必输字段提示信息
      const errorList = head(basicInfoDs.getValidationErrors())?.errors;
      const errorMsg = [];
      if (!isEmpty(errorList) && !validateFlag) {
        (errorList || []).forEach(curent => {
          const { validationMessage } = head(curent?.errors) || {};
          if (validationMessage) {
            errorMsg.push(<div>{validationMessage}</div>);
          }
        });
      }
      // 评估信息的校验
      const assessmentInfoValidate = await assessmentInfoDs.validate();
      if (!assessmentInfoValidate) {
        errorMsg.push(
          <div>
            {intl
              .get('sslm.purchaserEvaluationDetail.view.message.maintainAssessmentInfo')
              .d('请维护评分信息')}
          </div>
        );
      }
      // 评估小组的校验
      const assessmentPanelValidate = await assessmentPanelDs.validate();
      if (!assessmentPanelValidate) {
        errorMsg.push(
          <div>
            {intl
              .get('sslm.purchaserEvaluationDetail.view.message.maintainassessmentPanel')
              .d('请维护评估小组')}
          </div>
        );
      }
      if (!validateFlag) {
        notification.error({
          message: intl.get('sslm.common.view.title.error').d('错误'),
          description: errorMsg,
        });
        return false;
      } else {
        const saveHeaderData = basicInfoDs?.current.toJSONData() || {};
        const customizeUnitCode = [
          'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
          'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
          'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_INFORMATION',
          'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION',
          'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_INFORMATION',
          'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_TEAM',
          'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_RESULT',
          'SSLM.PURCHASER_ASSESS_DETAIL.BASICINFO',
          'SSLM.PURCHASER_ASSESS_DETAIL.COMPANY_INFO',
          'SSLM.PURCHASER_ASSESS_DETAIL.SUPPLIER_INFO',
          'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE',
          'SSLM.PURCHASER_ASSESS_DETAIL.BTN_GROUP',
        ].join(',');
        return {
          ...saveHeaderData,
          sourceType,
          riskEventNum,
          riskProcessUuid,
          customizeUnitCode,
        };
      }
    };

    // 保存
    const handleSaveAll = async () => {
      const params = await getSaveParams();
      const payload = remote.process(
        'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAIL_SAVE_PAYLOAD',
        params
      );
      if (payload) {
        setLoading(true);
        return handleSaveAllDetail(payload)
          .then(res => {
            const result = getResponse(res);
            if (result) {
              if (isCreate) {
                notification.success();
                if (isAmktClient && modal) {
                  modal.close();
                } else {
                  const { evalHeaderId: newEvalHeaderId } = result;
                  history.push({
                    pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                    search: qs.stringify({
                      evalHeaderId: newEvalHeaderId,
                    }),
                  });
                }
              } else {
                notification.success();
                // 刷新数据
                handleQuery();
              }
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    // 提交审批
    const handleSubmit = async () => {
      return new Promise(async resolve => {
        const payload = await getSaveParams();
        if (payload) {
          const submit = params => {
            setLoading(true);
            submitApproval({
              ...payload,
              ...params,
            })
              .then(res => {
                const result = getResponse(res);
                if (result) {
                  if (isCreate) {
                    notification.success();
                    if (isAmktClient && modal) {
                      modal.close();
                    } else {
                      const { evalHeaderId: newEvalHeaderId } = result;
                      history.push({
                        pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                        search: qs.stringify({
                          evalHeaderId: newEvalHeaderId,
                        }),
                      });
                    }
                  } else {
                    notification.success();
                    // 刷新数据
                    handleQuery();
                  }
                  basicInfoDs.setState('currentStepConfig', {});
                  resolve();
                }
              })
              .finally(() => {
                setLoading(false);
                resolve(false);
              });
          };
          const eventProps = {
            setLoading,
            saveParam: payload,
            onSubmit: submit,
          };
          const result = await remote.event.fireEvent('cuxHandleSubmit', eventProps);
          if (!result) {
            return resolve();
          }
          submit();
        } else {
          resolve(false);
        }
      });
    };

    // 基本信息查询
    const handleQuery = () => {
      setLoading(true);
      basicInfoDs.setQueryParameter('queryParams', {
        evalHeaderId,
        customizeUnitCode: [
          'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
          'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
          'SSLM.PURCHASER_ASSESS_DETAIL.BASICINFO',
          'SSLM.PURCHASER_ASSESS_DETAIL.SUPPLIER_INFO',
          'SSLM.PURCHASER_ASSESS_DETAIL.COMPANY_INFO',
          'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_RESULT',
        ].join(','),
      });
      basicInfoDs.query().finally(() => {
        const { evalTplId, businessKey } =
          basicInfoDs?.current?.get(['evalTplId', 'businessKey']) || {};
        setOldEvalTplId(evalTplId);
        setLoading(false);
        handleQueryAllApprovalData(businessKey);
      });
    };

    // 查询步骤条
    const handleQuerySteps = () => {
      handleGetSteps().then(res => {
        const resp = getResponse(res);
        if (resp) {
          const result = resp
            .map(i => {
              if (!isCreate) {
                if (i.progressStatus === 'SUPPLIER_EVAL') {
                  return { ...i, hidden: !needFeedbackFlag };
                }
                if (i.progressStatus === 'INTERNAL_EVAL') {
                  return { ...i, hidden: evalType !== 'ONLINE' };
                }
              }
              return { ...i, hidden: false };
            })
            .filter(n => !n.hidden);
          const remoteResult = remote.process(
            'SSLM.PURCHASER_EVALUATION_WORKBENCH_DETAILS.STEPS_CONFIG',
            result,
            { resp, evalType, needFeedbackFlag, basicInfoDs }
          );
          setStepsConfig(remoteResult);
        }
      });
    };

    // 执行评分
    const handleExecutiveScoring = async () => {
      return new Promise(async resolve => {
        const payload = await getSaveParams();
        if (payload) {
          const executiveScore = params => {
            setLoading(true);
            handleSExecutiveScore({
              ...payload,
              ...params,
            })
              .then(res => {
                const result = getResponse(res);
                if (result) {
                  notification.success();
                  // 刷新数据
                  handleQuery();
                  resolve();
                }
              })
              .finally(() => {
                setLoading(false);
                resolve(false);
              });
          };
          const eventProps = {
            setLoading,
            saveParam: payload,
            onExecutiveScore: executiveScore,
          };
          const result = await remote.event.fireEvent('cuxHandleExecutiveScoring', eventProps);
          if (!result) {
            return resolve();
          }
          executiveScore();
        } else {
          resolve(false);
        }
      });
    };

    // 汇总统计回调
    const handleScoreSum = async resolve => {
      setLoading(true);
      return summaryStatistics({ evalHeaderId })
        .then(res => {
          const result = getResponse(res);
          if (result) {
            notification.success();
            if (resolve) {
              resolve();
            }
            // 刷新数据
            handleQuery();
          }
        })
        .finally(() => {
          setLoading(false);
          if (resolve) {
            resolve(false);
          }
        });
    };

    // 汇总统计弹框
    const handleScoreSumModal = () => {
      if (hasCancelFlag) {
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('sslm.siteInvestigateReport.view.message.handleSumConfirm')
            .d('存在评分人放弃评分，请确认是否继续汇总？'),
          onOk: () => {
            return new Promise(resolve => {
              handleScoreSum(resolve);
            });
          },
        });
      } else {
        handleScoreSum();
      }
    };

    // 发布
    const handleRelease = async () => {
      const payload = await getSaveParams();
      if (payload) {
        setLoading(true);
        return publishReport({
          ...payload,
        })
          .then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              // 刷新数据
              handleQuery();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    // 执行自评
    const handleFeedBack = async () => {
      return new Promise(async resolve => {
        const payload = await getSaveParams();
        if (payload) {
          const feedBack = params => {
            setLoading(true);
            submitFeedback({
              ...payload,
              ...params,
            })
              .then(res => {
                const result = getResponse(res);
                if (result) {
                  notification.success();
                  // 刷新数据
                  handleQuery();
                  resolve();
                }
              })
              .finally(() => {
                setLoading(false);
                resolve(false);
              });
          };
          const eventProps = {
            setLoading,
            saveParam: payload,
            onFeedBack: feedBack,
          };
          const result = await remote.event.fireEvent('cuxHandleFeedBack', eventProps);
          if (!result) {
            return resolve();
          }
          feedBack();
        } else {
          resolve(false);
        }
      });
    };

    // 退回自评
    const handleBack = async formDs => {
      const payload = await getSaveParams();
      if (payload) {
        setLoading(true);
        // 添加退回原因
        const backReasonData = formDs.toData();
        const backReason =
          backReasonData && backReasonData[0] && backReasonData[0].backReason
            ? backReasonData[0].backReason
            : '';
        return handleSelfBack({
          ...payload,
          backReason,
        })
          .then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              // 刷新数据
              handleQuery();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    };

    // 退回自评弹窗
    const backModal = () => {
      // 退回原因
      const formDs = new DataSet({
        autoCreate: true,
        autoQuery: false,
        fields: [
          {
            name: 'backReason',
            type: 'string',
            label: intl.get('sslm.siteInvestigateReport.view.title.backReason').d('退回原因'),
            required: false,
          },
        ],
      });
      Modal.open({
        key: Modal.key(),
        style: {
          width: 380,
        },
        drawer: true,
        onOk: () => handleBack(formDs),
        title: intl.get('sslm.siteInvestigateReport.view.title.backReason').d('退回原因'),
        children: (
          <Form dataSet={formDs} labelLayout="float">
            <TextArea name="backReason" resize="both" />
          </Form>
        ),
      });
    };

    // 删除
    const handleDelete = () => {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.purchaserEvaluationDetail.view.message.deleteConfirm')
          .d('确认删除？'),
        onOk: () => {
          detailDelete({ evalHeaderId }).then(res => {
            if (res) {
              notification.success();
              history.push('/sslm/purchaser-evaluation-workbench/list');
            }
          });
        },
      });
    };

    // 作废
    const handleInvalid = () => {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.purchaserEvaluationDetail.view.message.destroyConfirm')
          .d('确认作废？'),
        onOk: () => {
          detailInvalid({ evalHeaderId }).then(res => {
            if (getResponse(res)) {
              if (remote) {
                remote.event.fireEvent('cuxDetailsHandleAfterDiscard', {
                  basicInfoDs,
                });
              }
              notification.success();
              history.push('/sslm/purchaser-evaluation-workbench/list');
            }
          });
        },
      });
    };

    // 退回评分
    const handleBackScoreOk = async ({ dataSet, headerId }) => {
      // 判断弹框是否关闭
      let closeFlag = true;
      //  权限批量维护的退回原因字段
      let backReason = '';
      // 获取勾选数据
      const checkData = dataSet.toJSONData();
      // 是否跨页全选
      const checkAll = dataSet.isAllPageSelection;
      // 获取查询条件
      const queryData = dataSet.queryDataSet?.current.toJSONData();
      const { indicatorId, userId } = queryData;
      // 未选中的值
      const unCheckData = dataSet.unSelected.map(record => record.toData());
      const payload = {
        evalHeaderId: headerId,
        userId,
        indicatorId,
        tenantId: organizationId,
        selectAllFlag: checkAll ? 1 : 0,
        siteEvalLineResps: checkAll ? [] : checkData,
        unChooseSiteEvalLineResps: unCheckData,
      };
      const result = await remote.event.fireEvent('cuxBackScoreBefore', { payload, dataSet });
      if (!result) {
        return result;
      }
      if (checkAll) {
        // 勾选跨页全选，，弹窗批量维护退回原因
        return Modal.confirm({
          title: intl.get('sslm.commonApplication.model.message.backReason').d('退回原因'),
          children: (
            <React.Fragment>
              <Row>
                <Col span={24}>
                  <Input
                    style={{ width: '100%' }}
                    onChange={e => {
                      backReason = e.target.value;
                    }}
                  />
                </Col>
              </Row>
            </React.Fragment>
          ),
        }).then(async button => {
          if (button === 'ok') {
            if (!isEmpty(checkData)) {
              await handleBackScore({ ...payload, backReason }).then(res => {
                if (res) {
                  notification.success();
                  handleQuery();
                } else {
                  closeFlag = false;
                }
              });
            }
            return closeFlag;
          }
          if (button === 'cancel') {
            return false;
          }
          return false;
        });
      }
      // 没有勾选跨页全选直接退回
      if (!isEmpty(checkData)) {
        await handleBackScore({ ...payload, backReason }).then(res => {
          if (res) {
            notification.success();
            handleQuery();
          } else {
            closeFlag = false;
          }
        });
        return closeFlag;
      }
      return false;
    };

    // 退回评分弹框
    const backScoreModal = () => {
      const evalTplId = basicInfoDs?.current?.get('evalTplId');
      let backDs;
      Modal.open({
        closable: true,
        drawer: true,
        key: Modal.key(),
        style: { width: 1090 },
        okProps: { disabled: true },
        onOk: () => handleBackScoreOk({ headerId: evalHeaderId, evalTplId, dataSet: backDs }),
        title: intl.get('sslm.purchaserEvaluationDetail.view.button.backScore').d('退回评分'),
        children: (
          <BackScore
            onRef={node => {
              backDs = node;
            }}
            remote={remote}
            evalTplId={evalTplId}
            headerId={evalHeaderId}
            searchCode="SSLM.PURCHASER_ASSESS_DETAIL.BACK_SCORE_FILTER"
          />
        ),
      });
    };

    // 获取当前日期
    const getNowDate = () => {
      const date = new Date();
      return date;
    };

    const getAfterDate = N => {
      const date = new Date();
      const DateN = new Date(date.getTime() + N * 24 * 60 * 60 * 1000);
      return DateN;
    };

    // 处理新建、工作台跳转过来的新建
    const handleCreate = async () => {
      setCurrentStep(0);
      // 标准属性
      const standardProps = {
        evalDateTo: getAfterDate(7),
      };
      // 埋点额外所需参数
      const remoteParams = {
        getAfterDate,
      };
      // 字段属性
      const fieldAttribute =
        remote?.process(
          'SSLM.PURCHASER_EVALUATION_WORKBENCH.FIELD_ATTRIBUTE',
          standardProps,
          remoteParams
        ) || {};
      // cdp-109072新增埋点逻辑
      const cuxInitAttributeData =
        (await remote?.process('SSLM.PURCHASER_EVALUATION_WORKBENCH.CUXINIT_ATTRIBUTE', {}, {})) ||
        {};
      // 供应商管理工作台新建
      if (companyId || supplierCompanyId) {
        setLoading(true);
        querySupplierInfo({ companyId, supplierCompanyId })
          .then(response => {
            const supplierInfoRes = getResponse(response);
            if (supplierInfoRes) {
              basicInfoDs.create({
                evalDateFrom: getNowDate(),
                evalDateTo: fieldAttribute.evalDateTo,
                realName: supplierInfoRes.realName,
                internationalTelCode: supplierInfoRes.internationalTelCode,
                supplierCompanyLov: {
                  supplierCompanyId: supplierInfoRes.partnerCompanyId,
                  supplierCompanyNum: supplierInfoRes.supplierCompanyNum,
                  supplierCompanyName: supplierInfoRes.supplierCompanyName,
                  supplierName: supplierInfoRes.supplierCompanyName,
                  supplierTenantId: supplierInfoRes.partnerTenantId,
                  name: supplierInfoRes.partnerContactor,
                  mobilephone: supplierInfoRes.partnerContactPhone,
                  mail: supplierInfoRes.partnerContactMail,
                  addressDetail: supplierInfoRes.addressDetail,
                },
                ...(cuxInitAttributeData || {}),
              });
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        basicInfoDs.create({
          evalDateFrom: getNowDate(),
          evalDateTo: fieldAttribute.evalDateTo,
          ...(cuxInitAttributeData || {}),
        });
      }
    };

    const handleCollapseChange = useCallback(keys => {
      setDefaultCollapseKey(keys);
    }, []);

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
        if (isCreate) {
          handleCreate();
        } else {
          handleQuery();
        }
      });
    }, [isCreate, showOldModal, evalHeaderId, companyId, supplierCompanyId]);

    useEffect(() => {
      // 查询步骤条配置
      handleQuerySteps();
    }, [isCreate, evalType, needFeedbackFlag, evalHeaderId]);

    useEffect(() => {
      // 设置当前步骤
      if (stepsConfig.length > 0 && progressStatus && !isCreate) {
        const newCurrentStep = stepsConfig.findIndex(i => i.progressStatus === progressStatus);
        setCurrentStep(newCurrentStep);
      }
    }, [isCreate, stepsConfig, progressStatus, evalHeaderId]);

    const workflowSubmit = approveResult => {
      return new Promise(async (resolve, reject) => {
        if (approveResult === 'Approved') {
          const payload = await getSaveParams();
          if (!isEmpty(payload)) {
            handleSaveAllDetail(payload).then(response => {
              const res = getResponse(response);
              if (res) {
                resolve(res);
              } else {
                reject();
              }
            });
          } else {
            reject();
          }
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

    // 导出评估报告附件
    const exportReportAttachment = () => {
      Modal.open({
        key: Modal.key(),
        drawer: true,
        style: { width: 742 },
        title: intl.get('sslm.purchaserEvaluation.view.title.exportReportAttachment').d('导出评估'),
        children: <ExportReportAttachment ref={exportReportAttRef} />,
        onOk: () => {
          return new Promise(async resolve => {
            const exportReportAttData = await exportReportAttRef.current?.getSaveParams();
            if (exportReportAttData) {
              exportAttachment({
                evalHeaderId,
                ...exportReportAttData,
              })
                .then(response => {
                  const res = getResponse(response);
                  if (res) {
                    resolve();
                    notification.success();
                  }
                })
                .finally(() => {
                  resolve(false);
                });
            } else {
              resolve(false);
            }
          });
        },
      });
    };

    // 获取返回路径
    const getBackPath = useCallback(() => {
      const isInclude = location.pathname.includes('/include');
      if (isPub || isInclude || isAmktClient) {
        return '';
      } else {
        return '/sslm/purchaser-evaluation-workbench/list';
      }
    }, [isPub, isAmktClient]);

    // 执行评分按钮显示状态获取
    const getExeScoringDisableFlag = () => {
      return oldEvalTplId !== basicInfoDs?.current?.get('evalTplId');
    };

    const finallyConfig = detailsContentConfig().filter(n => !n.hidden);

    return (
      <Fragment>
        <Header
          title={
            progressStatus === 'EVAL_COMPLETE'
              ? intl.get('sslm.purchaserEvaluationDetail.view.header.viewTitle').d('查看评估报告')
              : title[status]
          }
          backPath={getBackPath()}
        >
          <HeaderBtns
            customizeBtnGroup={customizeBtnGroup}
            customizeCode="SSLM.PURCHASER_ASSESS_DETAIL.BTN_GROUP"
            dataSet={basicInfoDs}
            status={status}
            isCreate={isCreate}
            readOnly={newReadOnly}
            isAmktClient={isAmktClient}
            handleSaveAll={handleSaveAll}
            loading={loading}
            handleExecutiveScoring={handleExecutiveScoring}
            handleSubmit={handleSubmit}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            stepsConfig={stepsConfig}
            handleScoreSum={handleScoreSumModal}
            handleRelease={handleRelease}
            handleFeedBack={handleFeedBack}
            backModal={backModal}
            handleDelete={handleDelete}
            handleInvalid={handleInvalid}
            backScoreModal={backScoreModal}
            exeScoringDisableFlag={getExeScoringDisableFlag()}
            remote={remote}
            assessmentDataSet={assessmentPanelDs}
            approvalBtnInfo={approvalBtnInfo}
            handleQuery={handleQuery}
            isPub={isPub}
            exportReportAttachment={exportReportAttachment}
          />
        </Header>
        {showStepFlag && (
          <div className={style.stepContent}>
            <Steps className={style.steps} current={currentStep}>
              {stepsConfig.map(config => (
                <Step
                  hidden={config.hidden}
                  key={config.progressStatus}
                  title={config.progressStatusMeaning}
                />
              ))}
            </Steps>
          </div>
        )}
        <Content
          style={{ marginTop: showStepFlag ? 0 : '8px' }}
          className={styles['customize-wrap']}
          wrapperClassName={styles['content-wrap']}
        >
          <div id="purchaserEvaluationAnchor">
            <Spin spinning={loading}>
              {customizeCollapse(
                {
                  code: 'SSLM.PURCHASER_ASSESS_DETAIL.MANAGE_COLLAPSE',
                  custDefaultActive: key => {
                    handleCollapseChange(key);
                  },
                },
                <Collapse
                  bordered={false}
                  trigger="text-icon"
                  activeKey={defaultCollapseKey}
                  expandIconPosition="text-right"
                  onChange={handleCollapseChange}
                >
                  {finallyConfig.map(config => (
                    <Panel
                      forceRender
                      id={config.key}
                      key={config.key}
                      header={config.title}
                      showArrow={!config.isNoAllowFolding}
                      className={`${config.title ? null : style.noHeader}`}
                    >
                      {config.component}
                    </Panel>
                  ))}
                </Collapse>
              )}
            </Spin>
          </div>
        </Content>
        <PositionAnchor getContainer={() => document.getElementById('purchaserEvaluationAnchor')}>
          {finallyConfig.map(link => {
            return <Link href={`#${link.key}`} title={link.title} />;
          })}
        </PositionAnchor>
      </Fragment>
    );
  }
);

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
  withCustomize({
    unitCode: [
      'SSLM.PURCHASER_ASSESS_DETAIL.EX_ATT_FORM',
      'SSLM.PURCHASER_ASSESS_DETAIL.IN_ATT_FORM',
      'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_INFORMATION',
      'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATION_STATUS_INFORMATION',
      'SSLM.PURCHASER_ASSESS_DETAIL.SCORE_INFORMATION',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_TEAM',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_TEAM_BTN',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_RESULT',
      'SSLM.PURCHASER_ASSESS_DETAIL.BASICINFO',
      'SSLM.PURCHASER_ASSESS_DETAIL.COMPANY_INFO',
      'SSLM.PURCHASER_ASSESS_DETAIL.SUPPLIER_INFO',
      'SSLM.PURCHASER_ASSESS_DETAIL.EVALUATE_MATERIALS_TABLE',
      'SSLM.PURCHASER_ASSESS_DETAIL.BTN_GROUP',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_BTN_GROUP',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR',
      'SSLM.PURCHASER_ASSESS_DETAIL.MANAGE_COLLAPSE',
      'SSLM.PURCHASER_ASSESS_DETAIL.QUALITY_RECTIFICATION',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR_LIST',
      'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR_BTN',
    ],
  }),
  remotes(
    {
      code: 'SSLM.PURCHASER_EVALUATION_WORKBENCH',
      name: 'remote',
    },
    {
      events: {
        cuxIndicatorMaintain() {}, // 二开指标维护按钮逻辑
        cuxHandleSubmit() {}, // 二开提交审批
        cuxHandleFeedBack() {}, // 二开执行自评
        cuxHandleExecutiveScoring() {}, // 二开执行评分
        cuxDetailsHandleAfterDiscard() {}, // 二开废弃之后的逻辑
        cuxBackScoreBefore() {}, // 二开退回评分前置动作
      },
    }
  )
)(PurchaserEvaluationDetail);
