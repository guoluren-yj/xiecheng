/**
 * @Description: 销售方-评估计划-详情页
 * @Author: zlh
 * @Date: 2023-09-06
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useEffect, useCallback, useState, useMemo } from 'react';
import { Header, Content } from 'components/Page';
import { DataSet, Button, Form, Attachment, Spin } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';

import qs from 'querystring';
import { compose } from 'lodash';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse } from 'utils/utils';
import { getUserDefaultMsg } from '@/services/vendorEvaluationPlanService';
import { handleOpenHistoryVersion as handleViewStrategy } from '@/routes/EvaluationStrategy/utils';
import BasicInfo from './BasicInfo';
import PlanLines from './PlanLines';

import { getBasicInfoDs, getPlanLinesDs } from '../stores/planDetails';

import styles from '../index.less';
import '@/routes/index.less';

const style = { width: '75%', maxWidth: 1172 };

const { Panel } = Collapse;
const defaultCollapseKeys = ['basicInfo', 'planLinesInfo', 'attachments'];

const OperationButtons = observer(({ dataSet, status, allLoading }) => {
  const isCreate = status === 'create';

  const evalPlanStrategyId = dataSet?.current?.get('evalPlanStrategyId');

  return (
    <Fragment>
      <Button
        icon="find_in_page"
        funcType="flat"
        loading={allLoading}
        disabled={!evalPlanStrategyId}
        hidden={isCreate}
        onClick={() =>
          handleViewStrategy({
            title: intl.get('sslm.vendorEvaluationPlanDetail.button.header.view').d('查看评估策略'),
            strategyId: evalPlanStrategyId,
          })
        }
      >
        {intl.get('sslm.vendorEvaluationPlanDetail.button.header.view').d('查看评估策略')}
      </Button>
    </Fragment>
  );
});

const VenEvaPlaDetail = ({
  location,
  match: {
    params: { status },
  },
  customizeForm,
  custLoading,
  customizeTable,
  customizeCollapse,
}) => {
  const { evalPlanHeaderId } = qs.parse(location.search.substr(1));

  const basicInfoDs = useMemo(() => new DataSet(getBasicInfoDs()), []);

  const planLineDs = useMemo(() => new DataSet(getPlanLinesDs()), []);

  planLineDs.bind(basicInfoDs, 'evalPlanLineList');

  const isPub = location.pathname.includes('/pub/');

  const title = {
    view: intl.get('sslm.vendorEvaluationPlanDetail.view.header.viewTitle').d('查看评估计划'),
  };

  const [loading, setLoading] = useState(false);
  const [linesLoading, setLinesLoading] = useState(false);
  const allLoading = loading && linesLoading;
  const [defaultCollapseKey, setDefaultCollapseKey] = useState(defaultCollapseKeys);

  // 查询详情头数据
  const handleQueryHeader = useCallback(() => {
    setLoading(true);
    basicInfoDs.setQueryParameter('evalPlanHeaderId', evalPlanHeaderId);
    basicInfoDs.query().finally(() => setLoading(false));
  }, [evalPlanHeaderId, status]);

  // 查询行数据
  const handleSearchLines = ({ params = {} } = {}) => {
    setLinesLoading(true);
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
    } else {
      planMonth.planMonthFrom = undefined;
      planMonth.planMonthTo = undefined;
    }
    // eslint-disable-next-line no-unused-expressions
    planLineDs?.queryDataSet?.current?.set({
      ...params,
      ...planMonth,
      ...clearParams,
    });
    planLineDs.setQueryParameter('evalPlanHeaderId', evalPlanHeaderId);
    planLineDs.unSelectAll();
    planLineDs.clearCachedSelected();
    planLineDs.query().finally(() => setLinesLoading(false));
  };

  // 大查询
  const handleQueryDetail = () => {
    handleQueryHeader();
    handleSearchLines();
  };

  const handleCollapseChange = useCallback(keys => {
    setDefaultCollapseKey(keys);
  }, []);

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
        });
    } else {
      handleQueryDetail();
    }
  }, [status]);

  return (
    <Fragment>
      <Header
        backPath={isPub ? null : '/sslm/supplier-evaluation-workbench/list'}
        title={title[status]}
      >
        <OperationButtons
          status={status}
          allLoading={allLoading}
          evalPlanHeaderId={evalPlanHeaderId}
          dataSet={basicInfoDs}
        />
      </Header>
      <Content className="customize-wrap" wrapperClassName="content-wrap">
        <Spin spinning={allLoading}>
          {customizeCollapse(
            {
              code: 'SSLM.SUPPLIER_ASSESS_DETAIL.PLAN_COLLAPSE',
              custDefaultActive: key => {
                handleCollapseChange(key);
              },
            },
            <Collapse
              bordered={false}
              trigger="text-icon"
              activeKey={defaultCollapseKey}
              expandIconPosition="text-right"
              className={styles['collapse-content']}
              onChange={handleCollapseChange}
            >
              <Panel
                key="basicInfo"
                header={intl
                  .get('sslm.vendorEvaluationPlanDetail.content.cardTitle.basicInfo')
                  .d('基本信息')}
              >
                <BasicInfo
                  isPub={isPub}
                  dataSet={basicInfoDs}
                  customizeForm={customizeForm}
                  custLoading={custLoading}
                />
              </Panel>
              <Panel
                key="planLinesInfo"
                header={intl
                  .get('sslm.vendorEvaluationPlanDetail.content.cardTitle.planLine')
                  .d('评估计划行')}
              >
                <PlanLines
                  evalPlanHeaderId={evalPlanHeaderId}
                  customizeTable={customizeTable}
                  dataSet={planLineDs}
                  custLoading={custLoading}
                  handleSearch={handleSearchLines}
                  basicInfoDs={basicInfoDs}
                />
              </Panel>
              <Panel
                key="attachments"
                header={intl
                  .get('sslm.vendorEvaluationPlanDetail.content.cardTitle.attachment')
                  .d('附件')}
              >
                <Form
                  dataSet={basicInfoDs}
                  columns={3}
                  labelLayout="float"
                  className="addon-before-style,c7n-pro-vertical-form-display  c7n-pro-readOnly-style"
                  style={style}
                  custLoading={custLoading}
                >
                  <Attachment name="attachmentUuid" bucketName={PRIVATE_BUCKET} readOnly />
                </Form>
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
      'sslm.vendorEvaluationPlan',
      'sslm.vendorEvaluationPlanDetail',
      'sslm.common',
      'evaluationStrategyDetail',
      'sslm.evaluationStrategyDetail',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.BASIC_INFO', // 评估计划-基础表单
      'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.PLAN_TABLE', // 评估计划-评估计划行表格
      'SSLM.SUPPLIER_ASSESS_DETAIL.EVALUATION_PLAN.PLAN_FILTER_NEW', // 评估计划-评估计划行筛选器
      'SSLM.SUPPLIER_ASSESS_DETAIL.PLAN_COLLAPSE',
    ],
  })
)(VenEvaPlaDetail);
