/*
 * @Date: 2023-10-20 15:47:59
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { compose, head, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { useObserver } from 'mobx-react-lite';
import React, { Fragment, useMemo, useState, useEffect, useRef } from 'react';
import { useDataSet, Spin, Modal, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import hocRemote from 'utils/remote';

import {
  revokeScore,
  fetchScoreLeft,
  saveScore,
  submitScore,
  weightSameJudge,
  transmitScorer,
  giveUpScore,
} from '@/services/appraisalScoreService';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import styles from '../index.less';
import HeaderBtns from './HeaderBtns';
import Basic from '../components/Basic';
import RiskScan from '../components/RiskScan';
import ScoreInfo from '../components/ScoreInfo';
import Attachment from '../components/Attachment';
import TransferModal from '../components/ScoreInfo/TransferModal';
import { getBasicDs } from '../stores/getBasicDS';
import { getRiskScanDs } from '../stores/getRiskScanDS';
import { getAttachmentDs } from '../stores/getAttachmentDS';
import { getLeftFitlterDs, getTransferDs } from '../stores/getScoreInfoDS';
import { queryName } from '../utils';

const customizeUnitCode = [
  'SSLM.SCORING_WORKBENCH_DETAIL.BASIC',
  'SSLM.SCORING_WORKBENCH_DETAIL.SCORE_LIST',
  'SSLM.SCORING_WORKBENCH_DETAIL.SCORE_SEARCH_BAR',
].join();

const Detail = ({
  location,
  dispatch,
  custLoading,
  customizeTable,
  customizeForm,
  customizeBtnGroup,
  match: {
    params: { status, evalHeaderId, evalGranularity },
  },
  remote,
}) => {
  const [leftData, setLeftData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});

  const scoreInfoRef = useRef(null); // 评分信息ref
  const readOnlyFlag = useMemo(() => status === 'view', [status]);
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location]);
  const basicDs = useDataSet(() => getBasicDs({ evalHeaderId }), [evalHeaderId]);
  const leftFitlterDs = useDataSet(() => getLeftFitlterDs(), []);
  const attachmentDs = useDataSet(() => getAttachmentDs({ evalHeaderId }), [evalHeaderId]);
  const { submitUserId } = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const { scoreStatus, evalStatus, businessKey } = useObserver(
    () => basicDs.current?.get(['scoreStatus', 'evalStatus', 'businessKey']) || {}
  );
  const isEdit = useMemo(
    () => status === 'edit' && ['UNSCORE', 'SCORE_REJECTED'].includes(scoreStatus),
    [status, scoreStatus]
  );

  useEffect(() => {
    handleQuery();
  }, [evalHeaderId]);

  // 处理审批/撤销审批
  const handleQueryAllApprovalData = () => {
    const { businessKey: key } = basicDs.current?.get(['businessKey']) || {};
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

  // 返回列表页
  const backList = () => {
    dispatch(routerRedux.push({ pathname: '/sslm/appraisal-score/list' }));
  };

  const handleQuery = async refresh => {
    const tableDs = scoreInfoRef?.current?.tableDs;
    basicDs.setQueryParameter('customizeUnitCode', 'SSLM.SCORING_WORKBENCH_DETAIL.BASIC');
    leftFitlterDs.setQueryParameter('submitUserId', submitUserId);
    attachmentDs.setQueryParameter('submitUserId', submitUserId);
    setLoading(true);
    return Promise.all(
      [
        basicDs.query().finally(() => handleQueryAllApprovalData()),
        attachmentDs.query(),
        queryScoreLeft(),
        refresh && tableDs && tableDs.query(tableDs.currentPage),
      ].filter(Boolean)
    ).finally(() => {
      setLoading(false);
    });
  };

  // 查询左侧数据 flag标识是否是切换tab调用保存后的查询
  const queryScoreLeft = (params = {}, flag = false) => {
    const { dimension = 'SU', lineScoreStatus, extraParameter } =
      leftFitlterDs.current?.toJSONData() || {};
    setLoading(true);
    return fetchScoreLeft({
      dimension,
      evalHeaderId,
      submitUserId,
      lineScoreStatus,
      [queryName[dimension]]: extraParameter,
      ...params,
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const newList = !isEmpty(res) && res.map(n => ({ ...n, tabChangeFlag: flag }));
          setLeftData(newList);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 获取需保存的参数
  const getSaveParams = async () => {
    const tableDs = scoreInfoRef?.current?.tableDs;
    const validateFlag =
      (await basicDs.validate()) && (await tableDs?.validate()) && (await attachmentDs.validate());
    if (validateFlag) {
      const basicInfo = basicDs.current.toJSONData();
      const scoreInfo = tableDs?.toData(); // toJSONData会有历史数据问题
      const kpiEvalHeaderAttList = attachmentDs.toJSONData();
      return {
        ...basicInfo,
        customizeUnitCode,
        kpiEvalHeaderAttList,
        kpiEvalDetailLineDTOPage: {
          content: scoreInfo,
        },
      };
    }
  };

  // 保存
  const handleSave = async () => {
    const saveParams = await getSaveParams();
    if (saveParams) {
      setLoading(true);
      return saveScore(saveParams)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleQuery(true);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 切换tab时，保存当前tab的数据
  const handleCurTabData = saveData => {
    setLoading(true);
    return saveScore(saveData)
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          await queryScoreLeft({}, true);
          return true;
        } else {
          return false;
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 提交
  const handleSubmit = async () => {
    const saveParams = await getSaveParams();
    if (saveParams) {
      setLoading(true);
      return submitScore(saveParams)
        .then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            backList();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 提交前的数据校验(适用于指定审批人的工作流)
  const submitValidate = async () => {
    const payload = await getSaveParams();
    return new Promise(resolve => {
      if (payload) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  };

  // 转交
  const handleTransfer = async () => {
    const tableDs = scoreInfoRef?.current?.tableDs;
    const queryParams = filterNullValueObject(tableDs?.queryDataSet?.current?.toJSONData() || {});
    const averageFlag = basicDs?.current?.get('averageFlag');
    let weightSameFlag = true; // 判断权重是否一致
    const selectedAll = tableDs?.isAllPageSelection;
    const selectedRowKeys = tableDs?.selected.map(record => record.get('evalDtlId'));
    const unSelectedRowKeys = tableDs?.unSelected.map(record => record.get('evalDtlId'));
    const params = {
      evalHeaderId,
      selectAllFlag: selectedAll ? 1 : 0,
      evalDtlIds: selectedAll ? [] : selectedRowKeys,
      unChooseEvalDtlIds: selectedAll ? unSelectedRowKeys : [],
      ...queryParams,
    };
    if (!averageFlag) {
      await weightSameJudge(params).then(response => {
        if ([false, true].includes(response)) {
          weightSameFlag = response;
        }
      });
    }
    const transferDs = new DataSet(getTransferDs({ averageFlag, weightSameFlag }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      title: intl.get('sslm.common.model.operate.referrer').d('转交评分人'),
      children: (
        <TransferModal
          dataSet={transferDs}
          averageFlag={averageFlag}
          weightSameFlag={weightSameFlag}
          currentRespWeight={head(tableDs?.selected.map(record => record.get('respWeight')))}
        />
      ),
      onOk: () => {
        return new Promise(async resolve => {
          const validateFlag = await transferDs.validate();
          const kpiEvalDtlRespList = transferDs.toJSONData();
          if (validateFlag) {
            transmitScorer({
              ...params,
              customizeUnitCode,
              kpiEvalDtlRespList,
            }).then(async response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                if (res.skipFlag) {
                  // 评分行都转交出去时，返回列表页
                  backList();
                } else {
                  await tableDs.query(tableDs.currentPage);
                }
                resolve(true);
              } else {
                resolve(false);
              }
            });
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  // 放弃评分
  const handleGiveUp = () => {
    const tableDs = scoreInfoRef?.current?.tableDs;
    const selectedAll = tableDs?.isAllPageSelection;
    const unSelectedRowKeys = tableDs?.unSelected.map(record => record.get('evalDtlId'));
    const queryParams = filterNullValueObject(tableDs?.queryDataSet?.current?.toJSONData() || {});
    giveUpScore({
      evalHeaderId,
      body: {
        customizeUnitCode,
        selectAllFlag: selectedAll ? 1 : 0,
        unKpiEvalDetailLineDTOS: selectedAll ? unSelectedRowKeys : [],
        kpiEvalDetailLineDTOS: tableDs?.selected.map(record => record.toData()),
        ...queryParams,
      },
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        notification.success();
        tableDs.query(tableDs.currentPage);
      }
    });
  };

  // 撤回评分
  const handleScoreCancel = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.appraisalScore.view.message.ScoreCancelConfirm')
        .d('将撤回已提交的所有指标评分，撤回后可以在待评分页面修改指标评分后重新提交'),
      onOk: () => {
        return new Promise(resolve => {
          setLoading(true);
          const basicInfo = basicDs.current?.toData() || {};
          revokeScore({
            ...basicInfo,
            customizeUnitCode,
          })
            .then(async response => {
              const res = getResponse(response);
              if (res) {
                resolve();
                notification.success();
                await handleQuery(true);
              }
            })
            .finally(() => {
              resolve(false);
              setLoading(false);
            });
        });
      },
    });
  };

  // 风险扫描
  const handleRiskScan = () => {
    const riskScanDs = new DataSet(getRiskScanDs({ evalHeaderId }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      cancelButton: false,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
      children: <RiskScan dataSet={riskScanDs} />,
    });
  };

  // 获取导出参数
  const getQueryParams = () => {
    let params = {};
    // 表格查询条件
    if (scoreInfoRef?.current?.tableDs) {
      const tableParams = scoreInfoRef.current.tableDs.queryDataSet?.current?.toData() || {};
      const { __dirty, ...rest } = tableParams;
      params = rest;
    }
    // 左侧筛选条件
    if (leftFitlterDs.current) {
      const { dimension = 'SU', lineScoreStatus, extraParameter } =
        leftFitlterDs.current.toJSONData() || {};
      params.dimension = dimension;
      params.lineScoreStatus = lineScoreStatus;
      params[queryName[dimension]] = extraParameter;
    }
    return params;
  };

  return (
    <Fragment>
      <Header
        title={
          isEdit
            ? intl.get('sslm.common.model.field.score').d('评分')
            : intl.get('sslm.common.model.field.viewScore').d('查看评分')
        }
        backPath={isPub ? '' : '/sslm/appraisal-score/list'}
      >
        <HeaderBtns
          isEdit={isEdit}
          loading={loading}
          evalStatus={evalStatus}
          scoreStatus={scoreStatus}
          evalHeaderId={evalHeaderId}
          customizeBtnGroup={customizeBtnGroup}
          onSave={handleSave}
          onSubmit={handleSubmit}
          onRefresh={handleQuery}
          onRiskScan={handleRiskScan}
          getQueryParams={getQueryParams}
          submitValidate={submitValidate}
          onScoreCancel={handleScoreCancel}
          approvalBtnInfo={approvalBtnInfo}
          businessKey={businessKey}
          backList={backList}
          basicDs={basicDs}
          remote={remote}
        />
      </Header>
      <Content className={styles['score-wrap']}>
        <Spin spinning={loading}>
          <div className={styles['score-content']}>
            <Basic dataSet={basicDs} custLoading={custLoading} customizeForm={customizeForm} />
            {remote ? (
              remote.render('SSLM_APPRAISAL_SCORE_DETAIL_RENDER_CONTENT_CUX_DOM', <></>, {
                styles,
                evalHeaderId,
                isEdit,
              })
            ) : (
              <></>
            )}
            <ScoreInfo
              isEdit={isEdit}
              basicDs={basicDs}
              leftData={leftData}
              ref={scoreInfoRef}
              remote={remote}
              readOnlyFlag={readOnlyFlag}
              submitUserId={submitUserId}
              evalHeaderId={evalHeaderId}
              leftFitlterDs={leftFitlterDs}
              evalGranularity={evalGranularity}
              customizeTable={customizeTable}
              queryScoreLeft={queryScoreLeft}
              onGiveUp={handleGiveUp}
              onTransfer={handleTransfer}
              saveCurTabData={handleCurTabData}
              customizeUnitCode="SSLM.SCORING_WORKBENCH_DETAIL.SCORE_LIST"
            />
            <Attachment
              isEdit={isEdit}
              dataSet={attachmentDs}
              evalHeaderId={evalHeaderId}
              setLoading={setLoading}
            />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.supplierDocManage', 'sslm.appraisalScore', 'sslm.common', 'scux.sslm'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SCORING_WORKBENCH_DETAIL.BASIC',
      'SSLM.SCORING_WORKBENCH_DETAIL.SCORE_LIST',
      'SSLM.SCORING_WORKBENCH_DETAIL.HEADER_BTNS',
    ],
  }),
  hocRemote({
    code: 'SSLM_APPRAISAL_SCORE_DETAIL',
    name: 'remote',
  })
)(Detail);
