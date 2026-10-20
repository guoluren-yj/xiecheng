/**
 * @Description: 供应商评估计划单-创建/详情
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-04 22:27:30
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import qs from 'querystring';
import { Card } from 'choerodon-ui';
import { compose, isFunction } from 'lodash';
import { DataSet, Form, Attachment, Modal } from 'choerodon-ui/pro';
import React, { Fragment, useEffect, useCallback, useState, useMemo } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import '@/routes/index.less';
import {
  handleBatchDeleteRecord,
  handleSaveDetail,
  handlePublishDetail,
  getUserDefaultMsg,
} from '@/services/vendorEvaluationPlanService';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import styles from '../index.less';
import BasicInfo from './BasicInfo';
import PlanLines from './PlanLines';
import HeaderBtns from './HeaderBtns';
import { getBasicInfoDs, getPlanLinesDs } from '../stores/detailsDs';

let planLinesSearchRef = null;

const VenEvaPlaDetail = ({
  history,
  location,
  match: {
    params: { status },
  },
  customizeForm,
  custLoading,
  customizeTable,
  customizeBtnGroup,
  onLoad,
  remote,
}) => {
  const { evalPlanHeaderId } = qs.parse(location.search.substr(1));

  const basicInfoDs = useMemo(() => new DataSet(getBasicInfoDs()), []);

  const planLineDs = useMemo(() => new DataSet(getPlanLinesDs()), []);

  planLineDs.bind(basicInfoDs, 'evalPlanLineList');

  const isPub = location.pathname.includes('/pub/');

  // 编辑状态控制----- view,!isPub,
  const [isEdit, setIsEdit] = useState(status === 'create' ? true : status !== 'view' && !isPub);
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});

  const title = {
    create: intl.get('sslm.vendorEvaluationPlanDetail.view.header.createTitle').d('新建评估计划'),
    edit: intl.get('sslm.vendorEvaluationPlanDetail.view.header.editTitle').d('编辑评估计划'),
    view: intl.get('sslm.vendorEvaluationPlanDetail.view.header.viewTitle').d('查看评估计划'),
  };

  const [loading, setLoading] = useState(false);
  const [linesLoading, setLinesLoading] = useState(false);
  const allLoading = loading || linesLoading;

  // 查询详情头数据
  const handleQueryHeader = useCallback(() => {
    setLoading(true);
    basicInfoDs.setQueryParameter('evalPlanHeaderId', evalPlanHeaderId);
    basicInfoDs
      .query()
      .then(async res => {
        const result = getResponse(res);
        if (result) {
          const { evalStatus, businessKey } = result;
          planLineDs.setState('evalStatus', evalStatus);
          setIsEdit(
            status === 'create'
              ? true
              : status !== 'view' && !isPub && ['NEW', 'REJECT'].includes(evalStatus)
          );
          // 查询能否审批/撤销审批
          handleQueryAllApprovalData({ businessKey });
        }
        // cdp-108503需求新增：設置默認值邏輯
        if (remote && remote.event) {
          remote.event.fireEvent('cuxInitEffect', { basicInfoDs, evalPlanHeaderId });
        }
      })
      .finally(() => setLoading(false));
  }, [evalPlanHeaderId, status]);

  // 查询审批按钮
  const handleQueryAllApprovalData = ({ businessKey }) => {
    if (businessKey) {
      queryAllApprovalData({ businessKeys: [businessKey], queryHistoryFlag: false }).then(res => {
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

  // 查询行数据
  const handleSearchLines = ({ params = {} } = {}) => {
    setLinesLoading(true);
    planLineDs.setQueryParameter('evalPlanHeaderId', evalPlanHeaderId);
    planLineDs.unSelectAll();
    planLineDs.clearCachedSelected();
    if (planLineDs?.queryDataSet?.current) {
      const clearParams = {}; // 清理
      // eslint-disable-next-line no-unused-expressions
      const dataObj = planLineDs?.queryDataSet?.current?.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums', 'planMonthFrom', 'planMonthTo'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty?.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 评估计划月份查询处理
      const { planMonth_range: planMonthRange } = params;
      const planMonth = {};
      if (planMonthRange) {
        const planMonthRangeList = planMonthRange.split(',');
        // eslint-disable-next-line prefer-destructuring
        planMonth.planMonthFrom = planMonthRangeList[0];
        // eslint-disable-next-line prefer-destructuring
        planMonth.planMonthTo = planMonthRangeList[1];
      }
      // eslint-disable-next-line no-unused-expressions
      planLineDs?.queryDataSet?.current?.set({
        ...params,
        ...planMonth,
        ...clearParams,
      });
      planLineDs.query().finally(() => setLinesLoading(false));
    } else if (planLinesSearchRef) {
      planLinesSearchRef.handleQuery(true);
    } else {
      planLineDs.query().finally(() => setLinesLoading(false));
    }
  };

  // 大查询
  const handleQueryDetail = () => {
    handleQueryHeader();
    // handleSearchLines();
  };

  // 保存当前页面数据
  const handleSave = async () => {
    const flag = await basicInfoDs?.current?.validate();
    const lineFlag = await planLineDs?.validate();

    if (!flag || !lineFlag) {
      return false;
    }

    if (flag && lineFlag) {
      setLoading(true);
      const isCreate = status === 'create';
      const { evalPlanLineList, evalType, evalTplId, evalTplName, ...evalPlanHeader } =
        basicInfoDs?.current.toJSONData() || {};
      const newEvalPlanLineList = planLineDs?.toJSONData() || [];

      return new Promise(resolve => {
        handleSaveDetail({
          evalPlanHeader: { ...evalPlanHeader, evalType, evalTplId, evalTplName },
          evalPlanLineList: newEvalPlanLineList,
          customizeUnitCode:
            'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BASICINFO,SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE',
        })
          .then(res => {
            const result = getResponse(res);
            if (result) {
              if (isCreate) {
                notification.success();
                const { evalPlanHeader: newEvalPlanHeader } = result;
                history.push({
                  pathname: `/sslm/vendor-evaluation-plan-workbench/details/edit`,
                  search: qs.stringify({
                    evalPlanHeaderId: newEvalPlanHeader.evalPlanHeaderId,
                  }),
                });
                resolve(res);
              } else {
                notification.success();
                // 刷新数据
                handleQueryDetail();
                resolve(res);
              }
            } else {
              resolve(false);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      });
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.vendorEvaluationPlanDetail.view.message.maintainInfo')
          .d('请维护相关信息！'),
      });
    }
  };

  // 发布
  const handlePublish = async () => {
    const flag = await basicInfoDs?.current?.validate();
    const lineFlag = await planLineDs?.validate();

    if (!flag || !lineFlag) {
      return false;
    }

    if (flag && lineFlag) {
      setLoading(true);
      const { evalPlanLineList, evalType, evalTplId, evalTplName, ...evalPlanHeader } =
        basicInfoDs?.current.toJSONData() || {};
      const newEvalPlanLineList = planLineDs?.toJSONData() || [];
      // 发布
      await handlePublishDetail({
        evalPlanHeader: { ...evalPlanHeader, evalType, evalTplId, evalTplName },
        evalPlanLineList: newEvalPlanLineList,
        customizeUnitCode:
          'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BASICINFO,SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE,SSLM.SUP_PLAN_WORKBENCH_DETAIL.BATCH_ALLOCATION_TABLE',
      })
        .then(resp => {
          const response = getResponse(resp);
          if (response) {
            notification.success();
            // 发布成功返回列表页
            history.push(`/sslm/vendor-evaluation-plan-workbench/list`);
          }
        })
        .finally(() => setLoading(false));
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.vendorEvaluationPlanDetail.view.message.maintainInfo')
          .d('请维护相关信息！'),
      });
    }
  };

  // 删除当前记录
  const handleRecordDelete = () => {
    const params = basicInfoDs?.current?.toData();
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.vendorEvaluationPlan.modal.confirm.deleteDocs')
        .d('确定要删除此评估计划吗？'),
      onOk: () => {
        setLoading(true);
        return handleBatchDeleteRecord([params])
          .then(res => {
            const result = getResponse(res);
            setLoading(false);
            if (result) {
              notification.success();
              // 删除成功重新查询数据
              history.push(`/sslm/vendor-evaluation-plan-workbench/list`);
            }
          })
          .finally(() => setLoading(false));
      },
    });
  };

  // 查看评估策略
  // const handleView = (strategyId) => {};

  // 工作流中审批通过、拒绝的回调
  const handlePubSubmit = async approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const res = await handleSave();
        if (res) {
          resolve(res);
        } else {
          reject(new Error(res)); // 异常
        }
      } else {
        resolve();
      }
    });
  };

  // 页面初始化查询数据
  useEffect(() => {
    if (status === 'create') {
      let createObj = {};
      getUserDefaultMsg()
        .then(res => {
          if (getResponse(res)) {
            const { realName, unitName, unitId } = res || {};
            createObj = {
              realName,
              creatorUnitName: unitName,
              creatorUnitId: unitId,
            };
          }
        })
        .finally(() => {
          basicInfoDs.create({ ...createObj });
          // 行初始化时，头必须存在，故在头创建后初始化
          if (remote && remote.event) {
            remote.event.fireEvent('cuxInit', { status, basicInfoDs, planLineDs, location });
          }
        });
    } else {
      handleQueryDetail();
    }

    // 处理工作流审批保存
    if (isFunction(onLoad)) {
      onLoad({
        submit: handlePubSubmit,
      });
    }
  }, [status]);

  // 绑定筛选器的ref
  const onSearchBarRef = ref => {
    planLinesSearchRef = ref;
  };

  return (
    <Fragment>
      <Header
        backPath={isPub ? null : '/sslm/vendor-evaluation-plan-workbench/list'}
        title={title[status]}
      >
        <HeaderBtns
          isEdit={isEdit}
          status={status}
          allLoading={allLoading}
          handleRecordDelete={handleRecordDelete}
          handleSave={handleSave}
          handlePublish={handlePublish}
          evalPlanHeaderId={evalPlanHeaderId}
          dataSet={basicInfoDs}
          customizeBtnGroup={customizeBtnGroup}
          approvalBtnInfo={approvalBtnInfo}
          handleQueryDetail={handleQueryDetail}
          isPub={isPub}
        />
      </Header>
      <Content className={styles['detail-content']}>
        <Content className={styles['card-content']}>
          <Card className={styles['detail-card']} bodyStyle={{ padding: 20 }} bordered={false}>
            <div className={styles['card-title']}>
              {intl
                .get('sslm.vendorEvaluationPlanDetail.content.cardTitle.basicInfo')
                .d('基本信息')}
            </div>
            <BasicInfo
              isEdit={isEdit}
              isPub={isPub}
              remote={remote}
              dataSet={basicInfoDs}
              customizeForm={customizeForm}
              custLoading={custLoading}
            />
          </Card>
        </Content>
        <Content className={styles['card-content']}>
          <Card className={styles['detail-card']} bodyStyle={{ padding: 20 }} bordered={false}>
            <div className={styles['card-title']}>
              {intl
                .get('sslm.vendorEvaluationPlanDetail.content.cardTitle.planLine')
                .d('评估计划行')}
            </div>
            <PlanLines
              isPub={isPub}
              remote={remote}
              evalPlanHeaderId={evalPlanHeaderId}
              isEdit={isEdit}
              customizeTable={customizeTable}
              dataSet={planLineDs}
              custLoading={custLoading}
              handleSearch={handleSearchLines}
              basicInfoDs={basicInfoDs}
              handleSave={handleSave}
              onSearchBarRef={onSearchBarRef}
            />
          </Card>
        </Content>
        <Content className={styles['card-content']}>
          <Card className={styles['detail-card']} bodyStyle={{ padding: 20 }} bordered={false}>
            <div className={styles['card-title']}>
              {intl.get('sslm.vendorEvaluationPlanDetail.content.cardTitle.attachment').d('附件')}
            </div>
            <Form
              style={{ width: '100%' }}
              dataSet={basicInfoDs}
              columns={2}
              labelLayout="float"
              className={
                isEdit
                  ? 'addon-before-style'
                  : 'addon-before-style,c7n-pro-vertical-form-display  c7n-pro-readOnly-style'
              }
              custLoading={custLoading}
            >
              <Attachment name="attachmentUuid" bucketName={PRIVATE_BUCKET} readOnly={!isEdit} />
            </Form>
          </Card>
        </Content>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.vendorEvaluationPlan',
      'sslm.vendorEvaluationPlanDetail',
      'sslm.common',
      'evaluationStrategyDetail',
      'sslm.evaluationStrategyDetail',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE',
      'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BASICINFO',
      'SSLM.SUP_PLAN_WORKBENCH_DETAIL.BATCH_ALLOCATION_TABLE',
      'SSLM.SUP_PLAN_WORKBENCH_DETAIL.LINE_NEW',
      'SSLM.SUP_PLAN_WORKBENCH_DETAIL.HEADER_BTNS',
      'SSLM.SUP_PLAN_WORKBENCH_DETAIL.DETAIL_TABLE_BTNS',
    ],
  }),
  remotes(
    {
      code: 'SSLM_EVALUATION_PLAN',
    },
    {
      events: {
        cuxInit: () => {}, // 二开初始化
      },
    }
  )
)(VenEvaPlaDetail);
