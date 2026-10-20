/**
 * @Description: 供应商评估策略 - 详情页面
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-26 16:37:34
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import qs from 'querystring';
import { compose } from 'lodash';
import { Card } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { DataSet, Modal, Spin } from 'choerodon-ui/pro';
import React, { Fragment, useState, useMemo, useEffect, useCallback } from 'react';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  handleSaveDetail,
  handleEditDetail,
  handlePublishDetail,
} from '@/services/evaluationStrategyServices';
import styles from './index.less';
import HeaderBtns from './HeaderBtns';
import { getBasicInfoDs } from '../stores/detailsDs.js';
import { getTitle, getBackPath, getTabPanes } from './utils';

const allUnitCode = [
  'SSLM.EVAL_PLAN_STRATEGY.DETAIL_BASIC_INFO',
  'SSLM.EVAL_PLAN_STRATEGY.DETAIL_EVA_RULES',
  'SSLM.EVAL_PLAN_STRATEGY.DETAIL_SUP_EVA_RULES',
  'SSLM.EVAL_PLAN_STRATEGY.DETAIL_PUR_SUP_INT_RULES',
].join();

const EvaluationStrategyDetails = ({
  dispatch,
  location,
  customizeForm,
  custLoading,
  match: {
    params: { status },
  },
}) => {
  const isPub = location.pathname.includes('/pub/');
  const { editFlag, draftId, historyFlag, jumpSource, strategyId, sourceStrategyId } = qs.parse(
    location.search.substr(1)
  );
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(status === 'create' ? true : status !== 'view' && !isPub);
  const readOnly = useMemo(() => status === 'view', [status]);
  const basicInfoDs = useMemo(() => new DataSet(getBasicInfoDs({ isEdit })), [strategyId, isEdit]);

  // 大查询
  const handleQueryDetail = useCallback(() => {
    setLoading(true);
    basicInfoDs.setQueryParameter('strategyId', strategyId);
    basicInfoDs.setQueryParameter('customizeUnitCode', allUnitCode);
    basicInfoDs.query().finally(() => setLoading(false));
  }, [strategyId, status]);

  // 编辑回调
  const handleEdit = () => {
    // 判断是否需要解锁单据 draftId 存在，需要解锁单据
    const editId = draftId || strategyId;
    // 重置页面编辑标识
    setIsEdit(true);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/evaluation-strategy/details/edit`,
        search: qs.stringify({
          strategyId: editId,
        }),
      })
    );
  };

  // 保存
  const handleSave = async () => {
    const validateFlag = await basicInfoDs?.current?.validate();
    if (validateFlag) {
      setLoading(true);
      const isCreate = status === 'create';
      const basicData = basicInfoDs?.current.toJSONData() || {};
      const payload = {
        ...basicData,
        customizeUnitCode: allUnitCode,
      };
      if (isCreate) {
        return handleSaveDetail(payload)
          .then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              const { strategyId: newStrategyId } = result;
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/evaluation-strategy/details/edit`,
                  search: qs.stringify({
                    strategyId: newStrategyId,
                  }),
                })
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        return handleEditDetail(payload)
          .then(res => {
            const result = getResponse(res);
            if (result) {
              notification.success();
              // 刷新数据
              handleQueryDetail();
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      notification.warning({
        message: intl
          .get('sslm.vendorEvaluationPlanDetail.view.message.maintainInfo')
          .d('请维护相关信息！'),
      });
    }
  };

  // 发布回调
  const publishCallback = params => {
    return handlePublishDetail(params)
      .then(res => {
        const result = getResponse(res);
        if (result) {
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: `/sslm/evaluation-strategy/list`,
            })
          );
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 发布
  const handlePublish = async () => {
    const validateFlag = await basicInfoDs?.current?.validate();
    if (validateFlag) {
      setLoading(true);
      const basicData = basicInfoDs?.current.toJSONData() || {};
      const { parentEnabledFlag } = basicData;
      const payload = {
        ...basicData,
        customizeUnitCode: allUnitCode,
      };
      if (+parentEnabledFlag === 0) {
        // 父级策略禁用时，发布增加提示
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: intl
            .get('sslm.common.view.message.publishMsg')
            .d('当前策略为禁用状态，发布后策略会变更为已发布状态，确认发布新版本?'),
          onOk: () => {
            return publishCallback(payload);
          },
        });
      } else {
        return publishCallback(payload);
      }
    } else {
      notification.warning({
        message: intl
          .get('sslm.vendorEvaluationPlanDetail.view.message.maintainInfo')
          .d('请维护相关信息！'),
      });
    }
  };

  // 页面初始化查询数据
  useEffect(() => {
    if (status === 'create') {
      basicInfoDs.create({});
    } else {
      handleQueryDetail();
    }
  }, [status, strategyId]);

  const versionNumber = basicInfoDs?.current?.get('versionNumber');

  const tabPanes = useMemo(() => getTabPanes(), []);

  return (
    <Fragment>
      <Header
        title={getTitle(status, jumpSource, versionNumber)}
        backPath={getBackPath({ jumpSource, sourceStrategyId, draftId, editFlag, isPub })}
      >
        <HeaderBtns
          isPub={isPub}
          status={status}
          isEdit={isEdit}
          loading={loading}
          draftId={draftId}
          dispatch={dispatch}
          editFlag={editFlag}
          dataSet={basicInfoDs}
          jumpSource={jumpSource}
          historyFlag={historyFlag}
          handleSave={handleSave}
          handleEdit={handleEdit}
          handlePublish={handlePublish}
          sourceStrategyId={sourceStrategyId}
        />
      </Header>
      <Content wrapperClassName={styles['content-wrap']} className={styles['customize-wrap']}>
        <Spin dataSet={basicInfoDs}>
          {tabPanes.map(item => (
            <Card className={styles['card-body']}>
              <h2
                style={{
                  fontWeight: 'bold',
                  marginBottom: 16,
                  fontSize: '16px',
                  lineHeight: '22px',
                }}
              >
                {item.tab}
              </h2>
              <item.component
                isEdit={isEdit}
                readOnly={readOnly}
                dataSet={basicInfoDs}
                customizeForm={customizeForm}
                custLoading={custLoading}
              />
            </Card>
          ))}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.evaluationStrategy',
      'sslm.evaluationStrategyDetail',
      'sslm.common',
      'sslm.vendorEvaluationPlanDetail',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.EVAL_PLAN_STRATEGY.DETAIL_BASIC_INFO',
      'SSLM.EVAL_PLAN_STRATEGY.DETAIL_EVA_RULES',
      'SSLM.EVAL_PLAN_STRATEGY.DETAIL_SUP_EVA_RULES',
      'SSLM.EVAL_PLAN_STRATEGY.DETAIL_PUR_SUP_INT_RULES',
    ],
  })
)(EvaluationStrategyDetails);
