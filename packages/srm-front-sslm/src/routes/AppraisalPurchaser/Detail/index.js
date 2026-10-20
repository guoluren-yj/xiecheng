/*
 * @Date: 2023-11-03 16:56:26
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { useObserver } from 'mobx-react-lite';
import { Alert, Collapse } from 'choerodon-ui';
import { compose, head, isEmpty, isFunction } from 'lodash';
import React, { Fragment, useEffect, useMemo, useState, useRef } from 'react';
import {
  useDataSet,
  Modal,
  Spin,
  DataSet,
  Form,
  SelectBox,
  TextArea,
  Table,
  Button,
} from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { routerRedux } from 'dva/router';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { queryUnifyIdpValue } from 'services/api';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import styles from '@/routes/index.less';
import {
  deleteAppraisal,
  recalculate,
  saveAppraisal,
  executeScore,
  submitNewApproval,
  sumStatisticsCheck,
  sumStatistics,
  backScore,
  weightSameJudge,
  batchTransfer,
  submitAppraisal,
  publish,
} from '@/services/appraisalPurchaserService';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import HeaderBtns from './HeaderBtns';
import { getBasicDs } from '../stores/getBasicDS';
import { getPanelList, getHeaderTitle } from './utils';
import ScoreCombineTable from '../components/ScoreCombineTable';
import { getParticipSupplierDs } from '../stores/getParticipSupplierDS';
import { getAppraisalIndicatorDs } from '../stores/getAppraisalIndicatorDS';
import { getAppraisalPersonDs } from '../stores/getAppraisalPersonDS';
import { getBackScoreDs, getBackScoreColumns } from '../stores/getBackScoreDS';
import { getAppraisalAttachmentDs } from '../stores/getAppraisalAttachmentDS';
import { getScoreCombineTableDs } from '../stores/getScoreCombineTableDS';
import {
  getTransferDs,
  getTransferColumns,
  getScorerDS,
  getScorerColumns,
} from '../stores/getTransferDS';

const { Panel } = Collapse;
const tenantId = getCurrentOrganizationId();
const defaultActiveKey = [
  'basicInfo',
  'participSupplier',
  'appraisalIndicator',
  'appraisalPerson',
  'scoreInfo',
  'scoreResult',
  'resultAttachment',
  'appraisalAttachment',
];
const customizeUnitCode = [
  'SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC',
  'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_LIST',
  'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_INFO_LIST',
  'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_LIST',
  'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_DETAIL',
  'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_LIST',
];

const Detail = ({
  dispatch,
  custLoading,
  customizeForm,
  customizeTable,
  customizeBtnGroup,
  remote,
  match: {
    path,
    params: { status, evalTplId, evalHeaderId, evalGranularity },
  },
}) => {
  const combineRef = useRef(); // 组合表格组件ref
  const editFlag = useMemo(() => status === 'edit', [status]); // 可编辑页面
  const isPub = useMemo(() => path.includes('/pub/'), [path]);
  const [loading, setLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});

  const basicDs = useDataSet(() => {
    const basicDsProps = getBasicDs({
      editFlag,
      evalHeaderId,
      remote,
    });
    return remote
      ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_BASIC_DS_PROPS', basicDsProps, {})
      : basicDsProps;
  }, [editFlag, evalHeaderId, remote]);

  const participSupplierDs = useDataSet(
    () => getParticipSupplierDs({ evalHeaderId, evalGranularity }),
    [evalHeaderId, evalGranularity]
  );
  const appraisalIndicatorDs = useDataSet(() => getAppraisalIndicatorDs({ evalHeaderId }), [
    evalHeaderId,
  ]);
  const appraisalAttachmentDs = useDataSet(() => getAppraisalAttachmentDs({ evalHeaderId }), [
    evalHeaderId,
  ]);
  const scoreCombineTableDs = useDataSet(
    () =>
      getScoreCombineTableDs({
        evalTplId,
        evalHeaderId,
      }),
    [evalTplId, evalHeaderId]
  );

  const {
    abandonedFlag,
    averageFlag,
    evalStatus,
    evalRespRule,
    respCalMethod,
    recordEvalStatus,
    autoPushVendorFlag,
    newApproveConfigFlag,
  } = useObserver(() =>
    basicDs.current.get([
      'abandonedFlag',
      'averageFlag',
      'evalStatus',
      'evalRespRule',
      'respCalMethod',
      'recordEvalStatus',
      'autoPushVendorFlag',
      'newApproveConfigFlag',
    ])
  );
  const personDsProps = useMemo(
    () => getAppraisalPersonDs({ evalHeaderId, evalRespRule, respCalMethod }),
    [evalHeaderId, evalRespRule, respCalMethod]
  );
  const personDsRemoteProps = useMemo(
    () =>
      remote
        ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_PERSON_DS_PROPS', personDsProps, {})
        : personDsProps,
    [JSON.stringify(personDsProps)]
  );
  const appraisalPersonDs = useDataSet(() => personDsRemoteProps, [
    JSON.stringify(personDsRemoteProps),
  ]);

  const isEdit = useMemo(() => editFlag && ['NEW', 'NEW_REJECTED'].includes(evalStatus), [
    editFlag,
    evalStatus,
  ]);
  const baseInfoEdit = useMemo(
    () => editFlag && ['NEW', 'NEW_REJECTED', 'FINAL_COLLECTED', 'REJECTED'].includes(evalStatus),
    [editFlag, evalStatus]
  );
  const isInclude = useMemo(() => path.includes('/include/'), [path]);

  // 大刷新
  const handleRefresh = () => {
    return Promise.allSettled(
      [
        basicDs.query().finally(() => queryApprovalData()),
        participSupplierDs.query(),
        appraisalIndicatorDs.query(),
        appraisalPersonDs.query(),
        combineRef.current?.handleRefresh(),
      ].filter(Boolean)
    );
  };

  useEffect(() => {
    // 仅新建、新建审批拒绝状态下查询-集团级默认公司
    if (['NEW', 'NEW_REJECTED'].includes(evalStatus)) {
      queryUnifyIdpValue('SSLM.KPI_EVAL_DIM_GROUP', {
        tenantId,
      }).then(response => {
        const res = getResponse(response);
        if (res) {
          basicDs.setState('defaultCompany', head(res)); // 集团级维度时，默认的公司
        }
      });
    }
  }, [basicDs, evalStatus]);

  // 初始化查询
  useEffect(() => {
    setLoading(true);
    basicDs.setQueryParameter('customizeUnitCode', 'SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC');
    basicDs.query().finally(() => {
      setLoading(false);
      queryApprovalData();
    });
  }, [evalHeaderId]);

  // 查询审批相关
  const queryApprovalData = () => {
    const { evalStatus: newEvalStatus, businessKey } =
      basicDs?.current?.get(['evalStatus', 'businessKey']) || {};
    // 绩效详情-评分中不展示审批，撤销审批按钮
    if (newEvalStatus === 'MANUAL_EVALUATING') {
      return;
    }
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

  // 获取需保存的参数
  const getSaveParams = async () => {
    const validateFlag =
      (await basicDs.validate()) &&
      (await participSupplierDs.validate()) &&
      (await appraisalIndicatorDs.validate()) &&
      (await appraisalPersonDs.validate());
    const params = {};
    let combineValidateFlag = true;
    const combineTableData = await combineRef.current?.getSaveParams();
    if (combineTableData) {
      const { validateFlag: newValidateFlag } = combineTableData;
      combineValidateFlag = newValidateFlag;
    }
    if (validateFlag && combineValidateFlag) {
      const { saveParams } = combineTableData || {};
      Object.assign(params, basicDs.current?.toJSONData());
      params.customizeUnitCode = customizeUnitCode.join();
      params.kpiEvalLineList = participSupplierDs.toJSONData();
      params.indKpiEvalHeaderDataDTOList = appraisalIndicatorDs.toJSONData();
      params.kpiEvalHeaderDataRespDTOList = appraisalPersonDs.toJSONData();
      params.collectKpiEvalLines = saveParams ? saveParams.collectKpiEvalLines : [];
      params.kpiEvalDetailLines = saveParams ? saveParams.kpiEvalDetailLines : [];
    } else {
      notification.warning({
        message: intl.get('sslm.common.view.message.requiredMsg').d('请检查是否有必填项未填写！'),
      });
    }
    return params;
  };

  // 保存
  const handleSave = async () => {
    const saveParams = await getSaveParams();
    if (!isEmpty(saveParams)) {
      setLoading(true);
      return saveAppraisal(saveParams)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleRefresh();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 执行评分
  const handleExecuteScore = async resolve => {
    const saveParams = await getSaveParams();
    if (!isEmpty(saveParams)) {
      setLoading(true);
      return executeScore(saveParams)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            if (resolve) {
              resolve();
            }
            await handleRefresh();
          }
        })
        .finally(() => {
          setLoading(false);
          if (resolve) {
            resolve(false);
          }
        });
    }
  };

  // 新建提交审批
  const handleCreateSubmit = async resolve => {
    const saveParams = await getSaveParams();
    if (!isEmpty(saveParams)) {
      setLoading(true);
      return submitNewApproval(saveParams)
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            if (resolve) {
              resolve();
            }
            await handleRefresh();
          }
        })
        .finally(() => {
          setLoading(false);
          if (resolve) {
            resolve(false);
          }
        });
    }
  };

  // 汇总统计回调
  const handleSumCallback = (finalCollectIdentification, resolve) => {
    return sumStatistics({
      evalHeaderId,
      createPage: 'ASSESS', // 后端区分新老
      finalCollectIdentification,
      customizeUnitCode: customizeUnitCode.join(),
    })
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          if (isFunction(resolve)) {
            resolve();
          }
          Modal.destroyAll(); // 关闭所有弹框
          await handleRefresh();
        }
      })
      .finally(() => {
        if (isFunction(resolve)) {
          resolve(false);
        }
      });
  };

  // 汇总统计
  const handleSum = (finalCollectIdentification, resolve) => {
    if (abandonedFlag) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.common.view.message.scoreSumConfirm')
          .d('存在评分人放弃评分，请确认是否继续汇总？'),
        onOk: () => {
          return new Promise(curResolve => {
            handleSumCallback(finalCollectIdentification, curResolve);
          });
        },
        afterClose: () => {
          if (isFunction(resolve)) {
            // 关闭第一层弹框的loading
            resolve(false);
          }
        },
      });
    } else {
      return handleSumCallback(finalCollectIdentification, resolve);
    }
  };

  // 汇总统计校验
  const handleSumCheck = () => {
    const checkDs = new DataSet(getBasicDs());
    setLoading(true);
    return sumStatisticsCheck({ evalHeaderId })
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          const { cherkErrorMessage } = res;
          if (cherkErrorMessage) {
            Modal.confirm({
              title: intl.get('hzero.common.message.confirm.title').d('提示'),
              children: (
                <Fragment>
                  <div>
                    {intl
                      .get('sslm.common.view.message.scoreSumConfirmCheck', {
                        name: cherkErrorMessage,
                      })
                      .d(`指标【${cherkErrorMessage}】汇总后的分数超出指标定义中维护的区间范围`)}
                  </div>
                  <Form dataSet={checkDs}>
                    <SelectBox name="finalCollectIdentification" />
                  </Form>
                </Fragment>
              ),
              onOk: () => {
                return new Promise(resolve => {
                  const finalCollectIdentification = checkDs.current?.get(
                    'finalCollectIdentification'
                  );
                  handleSum(finalCollectIdentification, resolve);
                });
              },
            });
          } else {
            await handleSum();
          }
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 退回评分查询条件参数
  const getBackScoreFieldProps = () => ({
    indicatorId: {
      lovPara: { evalHeaderId },
    },
    supplierId: {
      lovPara: { evalHeaderId },
    },
    categoryIds: {
      lovPara: { evalHeaderId },
    },
    itemId: {
      lovPara: { evalHeaderId },
    },
  });

  // 退回评分
  const handleBackScore = (params, resolve) => {
    setLoading(true);
    backScore(params)
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          resolve();
          Modal.destroyAll();
          await handleRefresh();
        }
      })
      .finally(() => {
        resolve(false);
        setLoading(false);
      });
  };

  // 退回评分弹框回调
  const backScoreCallback = (dataSet, resolve) => {
    // 获取勾选数据
    const checkData = dataSet.toJSONData();
    // 是否跨页全选
    const checkAll = dataSet.isAllPageSelection;
    // 未选中的值
    const unCheckData = dataSet.unSelected.map(record => record.toData());
    // 获取查询条件
    const queryData = dataSet.queryDataSet?.current?.toJSONData();
    const payload = {
      evalHeaderId,
      tenantId,
      createPage: 'ASSESS',
      selectAllFlag: checkAll ? 1 : 0,
      kpiEvalDtlResps: checkAll ? [] : checkData,
      unChooseKpiEvalDtlResps: unCheckData,
      standardFlag: 1,
      ...queryData,
    };
    if (isEmpty(checkData)) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      resolve(false);
    } else if (checkAll) {
      // 勾选跨页全选，弹窗批量维护退回原因
      const backReasonDs = new DataSet(getBasicDs());
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: (
          <Form dataSet={backReasonDs} labelLayout="float" style={{ marginTop: 16 }}>
            <TextArea name="backReason" colSpan={2} resize="vertical" />
          </Form>
        ),
        onOk: () => {
          return new Promise(curResolve => {
            const backReason = backReasonDs.current?.get('backReason');
            handleBackScore(
              {
                ...payload,
                backReason,
              },
              curResolve
            );
          });
        },
      });
    } else {
      handleBackScore(payload, resolve);
    }
  };

  // 退回评分弹框
  const backScoreModal = () => {
    const backScoreDs = new DataSet(getBackScoreDs(evalHeaderId));
    const backScoreColumns = getBackScoreColumns(evalGranularity);
    Modal.open({
      closable: true,
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      title: intl.get('sslm.common.view.button.backScore').d('退回评分'),
      okText: intl.get(`sslm.supplierDocManage.model.docManage.back`).d('退回'),
      children: (
        <SearchBarTable
          dataSet={backScoreDs}
          columns={backScoreColumns}
          showAllPageSelectionButton
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          customizedCode="SSLM.APPRAISAL_PURCHASER.BACK_SCORE"
          searchCode="SSLM.APPRAISAL_PURCHASER_DETAIL.BACK_SCORE_SEARCH"
          searchBarConfig={{
            fieldProps: getBackScoreFieldProps(),
          }}
        />
      ),
      onOk: () => {
        return new Promise(resolve => {
          backScoreCallback(backScoreDs, resolve);
        });
      },
    });
  };

  // 评分人转交-评分人新建
  const handleScorerTransferAdd = ({ dataSet, weightSameFlag, respWeight }) => {
    // 非平均式计算且权重不一致，只能新增一行数据
    const dataSource = dataSet.toJSONData();
    if (!averageFlag && !weightSameFlag && dataSource.length === 1) {
      notification.warning({
        message: intl
          .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
          .d('存在权重不一致的指标，无法转交给多个评分人'),
      });
      return;
    }
    // 非平均式计算且权重一致
    if (!averageFlag && weightSameFlag) {
      if (isEmpty(dataSource)) {
        dataSet.create({ respWeight }, 0);
      } else {
        dataSet.create({}, 0);
      }
    } else {
      dataSet.create({}, 0);
    }
  };

  // 转交弹框回调
  const handleTransfer = (dataSet, resolve) => {
    // 获取勾选数据
    const checkData = dataSet.toJSONData();
    // 是否跨页全选
    const checkAll = dataSet.isAllPageSelection;
    // 未选中的值
    const unCheckData = dataSet.unSelected.map(record => record.toData());
    // 获取查询条件
    const queryData = dataSet.queryDataSet?.current.toJSONData();
    const payload = {
      evalHeaderId,
      createPage: 'ASSESS',
      selectAllFlag: checkAll ? 1 : 0,
      kpiEvalDtlResps: checkAll ? [] : checkData,
      unChooseKpiEvalDtlResps: unCheckData,
      ...queryData,
    };
    weightSameJudge(payload).then(response => {
      const res = getResponse(response);
      if ([false, true].includes(res)) {
        const scorerDs = new DataSet(getScorerDS({ weightSameFlag: res, averageFlag }));
        const scorerColumns = getScorerColumns({ weightSameFlag: res, averageFlag });
        const showFlag = !averageFlag && !res;
        Modal.open({
          drawer: true,
          key: Modal.key(),
          style: { width: 742 },
          bodyStyle: { padding: 0 },
          title: intl.get('sslm.supplierDocManage.view.title.editScorerInfo').d('编辑评分人信息'),
          children: (
            <Fragment>
              {showFlag && (
                <Alert
                  closable
                  showIcon
                  type="info"
                  iconType="help"
                  className={styles['alert-styles']}
                  message={intl
                    .get('sslm.supplierDocManage.view.tag.inconsistentWeightMsg')
                    .d('存在权重不一致的指标，无法转交给多个评分人')}
                />
              )}
              <Table
                dataSet={scorerDs}
                columns={scorerColumns}
                buttons={[
                  <Button
                    icon="playlist_add"
                    onClick={() =>
                      handleScorerTransferAdd({
                        dataSet: scorerDs,
                        weightSameFlag: res,
                        respWeight: head(checkData)?.respWeight,
                      })
                    }
                  >
                    {intl.get('hzero.common.button.add').d('新增')}
                  </Button>,
                  'delete',
                ]}
                style={{ padding: '16px 24px' }}
              />
            </Fragment>
          ),
          onOk: async () => {
            const validateFlag = await scorerDs?.validate();
            const scorerRows = scorerDs?.toJSONData() || [];
            if (isEmpty(scorerRows)) {
              notification.warning({
                message: intl
                  .get('sslm.appraisalPurchaser.view.message.atLastOneScore')
                  .d('至少维护一行评分人'),
              });
            } else if (validateFlag) {
              const transformReasonDs = new DataSet(getBasicDs());
              Modal.open({
                key: Modal.key(),
                drawer: true,
                style: { width: 380 },
                bodyStyle: { padding: 0 },
                title: intl
                  .get(`sslm.supplierDocManage.model.docManage.transmitReason`)
                  .d('转交原因'),
                children: (
                  <Form
                    columns={1}
                    labelLayout="float"
                    dataSet={transformReasonDs}
                    style={{ margin: 0, padding: '16px 12px' }}
                  >
                    <TextArea name="transformReason" resize="vertical" />
                  </Form>
                ),
                onOk: () => {
                  return new Promise(curResolve => {
                    const transformReason = transformReasonDs.current?.get('transformReason');
                    return batchTransfer({
                      ...payload,
                      transformDtlRespList: scorerRows.map(n => ({ ...n, transformReason })),
                    })
                      .then(async transferResponse => {
                        const transferRes = getResponse(transferResponse);
                        if (transferRes) {
                          Modal.destroyAll();
                          await handleRefresh();
                        }
                      })
                      .finally(() => {
                        curResolve(false);
                      });
                  });
                },
              });
            }
            return false;
          },
          afterClose: () => {
            resolve(false);
          },
        });
      }
    });
  };

  // 转交弹框
  const transferModal = () => {
    const transferDs = new DataSet(getTransferDs(evalHeaderId));
    // 查询条件参数
    const getFieldProps = {
      indicatorId: {
        lovPara: { evalHeaderId, tenantId },
      },
      supplierId: {
        lovPara: { evalHeaderId, tenantId },
      },
    };
    Modal.open({
      drawer: true,
      style: { width: 1090 },
      key: Modal.key(),
      okText: intl.get('sslm.common.button.transmit').d('转交'),
      title: intl.get('sslm.supplierDocManage.view.button.graderTransfer').d('评分人转交'),
      children: (
        <SearchBarTable
          dataSet={transferDs}
          showAllPageSelectionButton
          style={{ maxHeight: 'calc(100vh - 160px)' }}
          columns={getTransferColumns(evalGranularity)}
          customizedCode="SSLM.APPRAISAL_PURCHASER.TRANSFER"
          searchCode="SSLM.APPRAISAL_PURCHASER_DETAIL.TRANSFER_SEARCH"
          searchBarConfig={{
            fieldProps: getFieldProps,
          }}
        />
      ),
      onOk: () => {
        return new Promise(resolve => {
          if (isEmpty(transferDs.toJSONData())) {
            notification.warning({
              message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
            });
            resolve(false);
          } else {
            handleTransfer(transferDs, resolve);
          }
        });
      },
    });
  };

  // 废弃
  const handleDiscard = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.supplierDocManage.model.evalDocManage.destroyConfirm')
        .d('确认废弃档案?'),
      onOk: () => {
        return new Promise(resolve => {
          setLoading(true);
          deleteAppraisal([evalHeaderId])
            .then(response => {
              const res = getResponse(response);
              if (res) {
                if (remote) {
                  remote.event.fireEvent('cuxHandleAfterDiscard', {
                    basicDs,
                  });
                }
                notification.success();
                resolve();
                dispatch(
                  routerRedux.push({
                    pathname: '/sslm/appraisal-purchaser/list',
                  })
                );
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

  // 重新计算
  const handleRecalculate = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.supplierDocManage.view.modal.confirmRecalculateContent')
        .d('将重新计算所有系统计算指标的得分，请确认'),
      onOk: () => {
        return new Promise(resolve => {
          setLoading(true);
          recalculate({ evalHeaderId, createPage: 'ASSESS' })
            .then(async response => {
              const res = getResponse(response);
              if (res) {
                notification.success();
                resolve();
                await handleRefresh();
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

  // 预览考评档案
  const handlePreview = () => {
    // 提交新建审批
    const newSubmitFlag =
      ['WFL', 'EXT'].includes(newApproveConfigFlag) && ['NEW', 'NEW_REJECTED'].includes(evalStatus);
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 1090 },
      title: intl.get('sslm.common.field.previewAppraisal').d('预览考评档案'),
      okText: isEdit
        ? newSubmitFlag
          ? intl.get(`sslm.commonApplication.view.button.submitReview`).d('提交审批')
          : intl.get(`sslm.supplierDocManage.view.button.execute`).d('执行评分')
        : intl.get('hzero.common.button.close').d('关闭'),
      cancelButton: isEdit,
      children: (
        <ScoreCombineTable
          basicDs={basicDs}
          dispatch={dispatch}
          sourceKey="PREVIEW"
          readOnlyFlag={!editFlag}
          custLoading={custLoading}
          evalHeaderId={evalHeaderId}
          dataSet={scoreCombineTableDs}
          customizeTable={customizeTable}
          evalGranularity={evalGranularity}
          searchCode="SSLM.APPRAISAL_PURCHASER_DETAIL.PREVIEW_SEARCH"
          customizeUnitCode="SSLM.APPRAISAL_PURCHASER_DETAIL.PREVIEW_LIST"
        />
      ),
      onOk: () => {
        return new Promise(async resolve => {
          if (isEdit) {
            if (newSubmitFlag) {
              handleCreateSubmit(resolve);
            } else {
              handleExecuteScore(resolve);
            }
          } else {
            resolve();
          }
        });
      },
    });
  };

  //  提交考评档案
  const handleSubmit = async () => {
    const saveParams = await getSaveParams();
    setLoading(true);
    return submitAppraisal({
      ...saveParams,
      autoPushVendorFlag,
    })
      .then(async response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          await handleRefresh();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 发布全部/勾选行
  const handleReleaseLines = () => {
    Modal.confirm({
      title: intl.get(`sslm.supplierDocManage.view.modal.confirmRelease`).d('确认发布'),
      children: intl
        .get('sslm.supplierDocManage.view.modal.confirmReleaseContent')
        .d('发布后分数将分别公布至参评供应商查看，确定发布吗？'),
      onOk: () => {
        return new Promise(resolve => {
          const selectedRows = scoreCombineTableDs.selected.map(record => record.toData());
          const notOperateList = selectedRows.filter(n =>
            [
              'published',
              'appealing',
              'appealApprovaling',
              'appealApprovaRejected',
              'supplierConfirmed',
            ].includes(n.lineStatus)
          );
          if (!isEmpty(notOperateList)) {
            notification.warning({
              message: intl
                .get('sslm.supplierDocManage.view.message.notPublished')
                .d('存在行数据结果申诉审批中、申诉审批拒绝、已发布或正在申诉中，请勿重复操作'),
            });
            resolve(false);
          } else {
            const validateFlag = basicDs.validate();
            if (validateFlag) {
              const baseInfo = basicDs.current?.toJSONData() || {};
              setLoading(true);
              publish({
                ...baseInfo,
                kpiEvalLineList: selectedRows,
                customizeUnitCode: customizeUnitCode.join(),
              })
                .then(async response => {
                  const res = getResponse(response);
                  if (res) {
                    notification.success();
                    resolve();
                    await handleRefresh();
                  }
                })
                .finally(() => {
                  resolve(false);
                  setLoading(false);
                });
            }
          }
        });
      },
    });
  };

  // 折叠栏展开、收起回调
  const handleCollapseChange = key => {
    setActiveKey(key);
  };

  const panelList = useMemo(() => {
    const sourcePanelList = getPanelList({ evalStatus, recordEvalStatus });
    return remote
      ? remote.process('SSLM_APPRAISAL_PURCHASER_DETAIL_PROCESS_PANEL_LIST', sourcePanelList, {
          isEdit,
          evalStatus,
          evalHeaderId,
          recordEvalStatus,
        })
      : sourcePanelList;
  }, [evalStatus, recordEvalStatus, remote, isEdit, evalHeaderId]);
  const dsObj = {
    basicInfo: basicDs,
    participSupplier: participSupplierDs,
    appraisalIndicator: appraisalIndicatorDs,
    appraisalPerson: appraisalPersonDs,
    appraisalAttachment: appraisalAttachmentDs,
    scoreInfo: scoreCombineTableDs,
    scoreResult: scoreCombineTableDs,
  };
  const headerBtnRemoteProps = {
    loading,
    basicDs,
    setLoading,
    handleRefresh,
  };

  return (
    <Fragment>
      <Header
        backPath={isInclude ? '' : '/sslm/appraisal-purchaser'}
        title={getHeaderTitle(baseInfoEdit)}
      >
        <HeaderBtns
          loading={loading}
          basicDs={basicDs}
          editFlag={editFlag}
          custLoading={custLoading}
          evalHeaderId={evalHeaderId}
          customizeTable={customizeTable}
          evalGranularity={evalGranularity}
          customizeUnitCode={customizeUnitCode}
          scoreCombineTableDs={scoreCombineTableDs}
          onSave={handleSave}
          onSum={handleSumCheck}
          onSubmit={handleSubmit}
          onDiscard={handleDiscard}
          onPreview={handlePreview}
          onTransfer={transferModal}
          onBackScore={backScoreModal}
          onRecalculate={handleRecalculate}
          onExecuteScore={handleExecuteScore}
          onCreateSubmit={handleCreateSubmit}
          onReleaseLines={handleReleaseLines}
          customizeBtnGroup={customizeBtnGroup}
          remote={remote}
          customizeCode="SSLM.APPRAISAL_PURCHASER_DETAIL.HEADER_BTN"
          approvalBtnInfo={approvalBtnInfo}
          handleRefresh={handleRefresh}
          isPub={isPub}
        />
        {remote.render('SSLM_APPRAISAL_PURCHASER_DETAIL_HERDER_BTNS', null, headerBtnRemoteProps)}
      </Header>
      <Content wrapperClassName={styles['content-wrap']} className={styles['customize-wrap']}>
        <Spin spinning={loading}>
          <Collapse
            trigger="text-icon"
            activeKey={activeKey}
            expandIconPosition="text-right"
            onChange={handleCollapseChange}
          >
            {panelList.map(panel => (
              <Panel header={panel.header} key={panel.key}>
                <panel.component
                  isEdit={isEdit}
                  basicDs={basicDs}
                  dispatch={dispatch}
                  readOnlyFlag={!editFlag}
                  dataSet={dsObj[panel.key]}
                  baseInfoEdit={baseInfoEdit}
                  evalHeaderId={evalHeaderId}
                  evalRespRule={evalRespRule}
                  custLoading={custLoading}
                  customizeForm={customizeForm}
                  customizeTable={customizeTable}
                  evalGranularity={evalGranularity}
                  appraisalPersonDs={appraisalPersonDs}
                  participSupplierDs={participSupplierDs}
                  remote={remote}
                  setLoading={setLoading}
                  onRefresh={handleRefresh}
                  combineRef={combineRef}
                  {...panel.componentProps}
                />
              </Panel>
            ))}
          </Collapse>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.scoreLevel',
      'sslm.evaluationQuery',
      'sslm.supplierDocManage',
      'sslm.commonApplication',
      'sslm.indicatorTemplate',
      'sslm.appraisalPurchaser',
      'sslm.supplierKpiIndicator',
      'spfm.supplierKpiIndicator',
      'sslm.siteInvestigateReport',
      'scux.sslm',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.APPRAISAL_PURCHASER_DETAIL.BASIC',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.HEADER_BTN',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.PREVIEW_LIST',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.INDICATOR_LIST',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_INFO_LIST',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_LIST',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.SCORE_RESULT_DETAIL',
      'SSLM.APPRAISAL_PURCHASER_DETAIL.PARTICIP_SUPPLIER_LIST',
    ],
  }),
  remotes(
    {
      code: 'SSLM_APPRAISAL_PURCHASER_DETAIL',
      name: 'remote',
    },
    {
      events: {
        cuxHandleAfterDiscard() {}, // 二开废弃之后的逻辑
        cuxBasicDsUpdate() {}, // 二开基本信息更新
      },
    }
  )
)(Detail);
