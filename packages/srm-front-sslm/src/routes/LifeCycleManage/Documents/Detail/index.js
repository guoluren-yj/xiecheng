/*
 * @Date: 2022-12-08 15:43:57
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { Collapse } from 'choerodon-ui';
import { routerRedux } from 'dva/router';
import { compose, isEmpty, head, pullAt, isFunction, concat } from 'lodash';
import React, { Fragment, useMemo, useState, useEffect, useRef } from 'react';
import { Spin, Modal, useDataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import remote from 'utils/remote';
import { openTab } from 'utils/menuTab';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, getCurrentUser, getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import {
  checkSubmit,
  queryInitInfo,
  querySupplierClassify,
  queryPurchase,
  saveApplication,
  submitApplication,
  discardApplication,
  verifySupplierLife,
} from '@/services/lifeCycleManageService';
import { aiApprove, fetchApproveStatus } from '@/services/commonService';
import styles from '@/routes/index.less';
import { useSetState } from '@/routes/components/utils';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { riskScan } from '@/routes/LifeCycleManage/utils';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';
import DynamicTable from '@/routes/components/DynamicTable/components/DynamicTable';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';

import HeaderBtns from './HeaderBtns';
import { getBaseInfoDS } from '../stores/getBaseInfoDS';
import { getSupplierAbilityDS } from '../stores/getSupplierAbilityDS';
import { getSupplierClassifyDS } from '../stores/getSupplierClassifyDS';
import { getPurchaseHeaderDS, getPurchaseLineDS } from '../stores/getPurchaseInfoDS';
import { getSubmitMsg, getDetailTitle } from '../../utils';
import { getPanelList } from './utils';

const { Panel } = Collapse;
const userInfo = getCurrentUser() || {};
const tenantId = getCurrentOrganizationId();
const defaultActiveKey = [
  'baseInfo',
  'statusInfo',
  'otherInfo',
  'supplierAbility',
  'supplierClassify',
  'purchaseInfo',
  'attachmentInfo',
];
const unitCodeList = [
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.BASE_INFO',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.OTHER_INFO',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.STATUS_INFO',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_ABILITY',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_CLASSIFY',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_INFO',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_LINE',
  'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.ATT_INFO',
];

const Detail = ({
  modal, // 风控工作台传入的modal
  location,
  dispatch,
  match,
  onLoad,
  custLoading,
  customizeForm,
  customizeTable,
  customizeCollapse,
  customizeBtnGroup,
  lifeCycleDetailRemote,
}) => {
  const {
    requisitionId,
    toStageId,
    documentType,
    pubEdit,
    sourceType,
    documentFrom,
    riskEventNum,
    riskProcessUuid,
    // routerStatus解决工作流，include表单status未配置成流程变量导致match.params拿不到值问题
    status: routerStatus,
    supplierCompanyId: routerSupplierCompanyId,
  } = querystring.parse(location.search.substr(1));
  const isCreate = useMemo(() => match.params.status === 'create', [match]);
  const readOnlyFlag = useMemo(() => match.params.status === 'read' || routerStatus === 'read', [
    match,
    routerStatus,
  ]);
  const isPub = useMemo(() => !!location.pathname.match('/pub/'), [location]);
  const isAmktClient = useMemo(() => documentFrom === 'AMKT_CLIENT', [documentFrom]); // 单据来源为风控工作台
  const laneCreate = isCreate && toStageId; // 泳道新建
  const [allLoading, setAllLoading] = useState(false);
  const [activeKey, setActiveKey] = useState(defaultActiveKey);
  const [processStatus, setProcessStatus] = useState(null);
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});
  const [relTableList, setRelTableList] = useState([]);
  const [relTableRef, setRelTableRef] = useState({});
  const [relCollapseActiveKey, setRelCollapseActiveKey] = useState([]);
  const [headerInfo, setHeaderInfo] = useState({});
  const [aiApproveStatus, setAiApproveStatus] = useState(null);
  const [reviewIsClick, setReviewIsClick] = useState(false); // 记录【智能预审】按钮是否点击了

  const timerRef = useRef(null); // 定时器
  const timerTime = useRef(0); // 记录轮询次数

  const editFlag = useMemo(
    () => !!['NEW', 'REJECTED', null].includes(processStatus) && !readOnlyFlag && !isPub,
    [processStatus, readOnlyFlag, isPub]
  );
  const isEdit = lifeCycleDetailRemote.process('SSLM.LIFE_CYCLE_MANAGE_DETAIL_EDIT', editFlag, {
    isPub,
    editFlag,
  });

  const remoteRef = useRef({}); // 存储埋点增加的页签ref

  // 第一次新建，带出的历史数据无需必输校验，故放在state中处理
  const [historyState, setHistoryState] = useSetState({
    supplierClassifyHistory: [], // 供应商分类历史数据
    purchaseHeaderHistory: {}, // 采购财务头信息历史数据
    purchaseLineHistory: [], // 采购财务行信息历史数据
  });

  const baseInfoDsProps = lifeCycleDetailRemote.process(
    'SSLM.LIFE_CYCLE_MANAGE_DETAIL_BASIC_DS',
    getBaseInfoDS(),
    {}
  );

  const baseInfoDs = useDataSet(() => baseInfoDsProps, []);
  const purLineDsProps = getPurchaseLineDS();
  const remotePurLineDsProps = lifeCycleDetailRemote.process(
    'SSLM.LIFE_CYCLE_MANAGE_DETAIL_PUR_LINE_DS_PROPS',
    purLineDsProps
  );
  const purchaseLineDs = useDataSet(() => remotePurLineDsProps, []);
  const purchaseHeaderDs = useDataSet(() => getPurchaseHeaderDS(), []);
  const supplierClassifyDs = useDataSet(() => getSupplierClassifyDS(), []);
  const supplierAbilityDs = useDataSet(() => getSupplierAbilityDS(), []);

  purchaseHeaderDs.bind(baseInfoDs, 'lifeCycleChangeSync');
  purchaseLineDs.bind(baseInfoDs, 'lifeCycleChangeSyncPfs');
  supplierAbilityDs.bind(baseInfoDs, 'lifeCycleChangeSupplyRecs');
  supplierClassifyDs.bind(baseInfoDs, 'lifeCycleChangeCtgAlterLines');

  const { aiApproveDTOList } = headerInfo;

  const panelList = getPanelList({ isCreate, baseInfoDs });

  const handleCollapseChange = keys => {
    setActiveKey(keys);
  };

  useEffect(() => {
    const code = 'sslm_life_cycle_manage';
    const relTableCofigParams = lifeCycleDetailRemote
      ? lifeCycleDetailRemote.process(
          'SSLM.LIFE_CYCLE_MANAGE_DETAIL.REL_TABLE_CONFIG_PARAMS',
          [code],
          { requisitionId }
        )
      : [code];
    // 查询配置表
    queryRelTableConfig(...relTableCofigParams).then(res => {
      setRelTableList(res);
      setRelCollapseActiveKey(res.map(n => n.uniqueCode));
    });
  }, []);

  useEffect(() => {
    // 供应商新建
    if (isCreate && (toStageId || routerSupplierCompanyId)) {
      const routerParam = querystring.parse(location.search.substr(1));
      hanldeInitInfo(routerParam);
    } else if (isCreate) {
      // 单据新建
      if (baseInfoDs.current) {
        lifeCycleDetailRemote.event.fireEvent('SSLM.LIFE_CYCLE_MANAGE_DETAIL.INIT_CUXPARAMS', {
          baseInfoDs,
        });
        baseInfoDs.current.set({
          documentType,
        });
      }
    }
    if (requisitionId || requisitionId === 0) {
      handleRefresh();
    }
    handleResetData();
    // 处理工作流审批保存
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
    baseInfoDs.setState('isEdit', isEdit); // 存ds中供二开使用
  }, [requisitionId, isCreate, routerSupplierCompanyId]);

  const workflowSubmit = approveResult => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = await getSaveParams();
        const validateProps = {
          supplierClassifyDs,
          pubEdit: !!Number(pubEdit),
        };
        const validateFlag = lifeCycleDetailRemote.process(
          'SSLM.LIFE_CYCLE_MANAGE_DETAIL.WORKFLOW_VALIDATE',
          true,
          validateProps
        );
        if (!isEmpty(payload) && validateFlag) {
          setAllLoading(true);
          saveApplication(payload)
            .then(response => {
              const res = getResponse(response);
              if (res) {
                resolve(res);
              } else {
                resolve(false);
              }
            })
            .finally(() => {
              setAllLoading(false);
            });
        } else {
          reject();
        }
      } else {
        resolve();
      }
    });
  };

  const onRef = (form = {}, tableCode = '') => {
    const tableCodeRef = {
      [tableCode]: form,
    };
    setRelTableRef(prevState => ({ ...prevState, ...tableCodeRef }));
  };

  // 初始化信息
  const hanldeInitInfo = params => {
    setAllLoading(true);
    const allParams = {
      ...params,
      customizeUnitCode:
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.BASE_INFO,SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.ATT_INFO',
    };
    // 基础信息
    queryInitInfo(allParams)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { companyId, dimensionCode, supplierCompanyId, supplierTenantId } = res;
          const newCompanyId = dimensionCode === 'COMPANY' ? companyId : null;
          // 风控工作台跳过来的，无companyId参数时，起始阶段查询不到，故手动清空公司和起始阶段相关信息，手动选择公司时在赋相关值
          if (isAmktClient && !params.companyId && dimensionCode === 'COMPANY') {
            const {
              companyId: resCompanyId,
              companyName,
              companyNum,
              fromStageId,
              fromStageCode,
              fromStageDescription,
              erpSupplierNum,
              erpSupplierName,
              ...rest
            } = res;
            baseInfoDs.create({
              ...rest,
              realName: userInfo.realName,
              documentFrom: 'AMKT_CLIENT',
            });
          } else {
            baseInfoDs.create({
              ...res,
              documentFrom: isAmktClient ? 'AMKT_CLIENT' : 'MANUALLY',
            });
          }
          if (baseInfoDs.current) {
            lifeCycleDetailRemote.event.fireEvent('SSLM.LIFE_CYCLE_MANAGE_DETAIL.INIT_CUXPARAMS', {
              baseInfoDs,
              ...params,
            });
          }
          // 查询供应商分类历史数据
          handleClassifyHistory({ supplierCompanyId, supplierTenantId });
          // 查询采购财务历史数据
          handlePurchaseHistory({ companyId: newCompanyId, supplierCompanyId });
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  };

  // 清空带出的历史数据
  const handleResetData = () => {
    setHistoryState({
      supplierClassifyHistory: [],
      purchaseHeaderHistory: {},
      purchaseLineHistory: [],
    });
  };

  // 查询供应商分类历史数据
  const handleClassifyHistory = ({ supplierCompanyId, supplierTenantId }) => {
    const params = {
      page: 0,
      size: 0,
      isAssignFlag: 1,
      supplierCompanyId,
      supplierTenantId,
      // 第一次创建单据传主数据单元编码
      customizeUnitCode: 'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.CLASSIFY',
    };
    setAllLoading(true);
    querySupplierClassify(params)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { content = [] } = res;
          setHistoryState({ supplierClassifyHistory: content });
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  };

  // 查询采购财务历史数据
  const handlePurchaseHistory = ({ companyId, supplierCompanyId }) => {
    const params = {
      companyId,
      supplierCompanyId,
      // 查的主数据，传360的编码（新老）
      customizeUnitCode: [
        'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.PURCHASE_HEADER',
        'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.PURCHASE_LINE',
        'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_HEADER',
        'SSLM.SUPPLIER_LIFE_CYCLE.PURCHASE_INFO',
      ].join(','),
    };
    setAllLoading(true);
    queryPurchase(params)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          const { lifeChangeSync = {}, lifeChangeSyncPfs = [] } = res;
          setHistoryState({
            purchaseHeaderHistory: lifeChangeSync,
            purchaseLineHistory: lifeChangeSyncPfs,
          });
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  };

  // 刷新数据
  const handleRefresh = () => {
    setAllLoading(true);
    baseInfoDs.setQueryParameter('queryParmas', {
      requisitionId,
      customizeUnitCode: [
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.BASE_INFO',
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.OTHER_INFO',
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.STATUS_INFO',
        'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.ATT_INFO',
      ].join(),
    });
    supplierAbilityDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_ABILITY'
    );
    supplierClassifyDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_CLASSIFY'
    );
    purchaseHeaderDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_INFO'
    );
    purchaseLineDs.setQueryParameter(
      'customizeUnitCode',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_LINE'
    );
    baseInfoDs.query().then(res => {
      if (res && res.processStatus) {
        setHeaderInfo(res);
        setProcessStatus(res.processStatus);
        setAiApproveStatus(res.aiApproveStatus);
        handleQueryAllApprovalData({ businessKey: res.businessKey });
      }
      setAllLoading(false);
    });
  };

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

  // 返回列表页
  const handleBackList = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/life-cycle-manage/list',
      })
    );
  };

  // 获取保存参数
  const getSaveParams = async () => {
    // 校验模型表数据
    let checkModelTableFlag = true;
    let modelDatas = [];
    relTableList.forEach(n => {
      if (relTableRef[n.tableCode]) {
        const tableData = relTableRef[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    const validateFlag = await baseInfoDs?.current?.validate(true);
    const { supplierClassifyHistory, purchaseHeaderHistory, purchaseLineHistory } = historyState;
    let payload = {};
    if (validateFlag && checkModelTableFlag) {
      const {
        lifeCycleChangeSync = [],
        lifeCycleChangeSyncPfs = [],
        lifeCycleChangeCtgAlterLines = [],
        ...others
      } = baseInfoDs?.current?.toJSONData() || {};
      payload = {
        ...others,
        tenantId,
        modelDatas,
        riskEventNum,
        riskProcessUuid,
        customizeUnitCode: unitCodeList.join(','),
        lifeCycleChangeSyncPfs: isEmpty(purchaseLineHistory)
          ? lifeCycleChangeSyncPfs
          : purchaseLineHistory,
        lifeCycleChangeSync: isEmpty(purchaseHeaderHistory)
          ? head(lifeCycleChangeSync)
          : purchaseHeaderHistory,
        lifeCycleChangeCtgAlterLines: isEmpty(supplierClassifyHistory)
          ? lifeCycleChangeCtgAlterLines
          : supplierClassifyHistory,
      };
    }
    const remotePayload = lifeCycleDetailRemote.process(
      'SSLM.LIFE_CYCLE_MANAGE_DETAIL_SAVE_PAYLOAD',
      payload,
      { pubEdit, remoteRef }
    );
    return remotePayload;
  };

  // 保存
  const handleSave = payload => {
    setAllLoading(true);
    return saveApplication(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          notification.success();
          const { requisitionId: newRequisitionId, documentType: newDocumentType } = res;
          if (isAmktClient && modal) {
            modal.close();
          } else if (isCreate) {
            dispatch(
              routerRedux.push({
                pathname: '/sslm/life-cycle-manage/detail',
                search: querystring.stringify({
                  requisitionId: newRequisitionId,
                  documentType: newDocumentType,
                }),
              })
            );
          } else {
            handleRefresh();
            relTableList.forEach(n => {
              if (relTableRef[n.tableCode]) {
                relTableRef[n.tableCode].queryDynamicTable();
              }
            });
          }
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  };

  // 校验并保存
  const handleCheckAndSave = async () => {
    if (isAmktClient) {
      const { fromStageId, dimensionCode } = baseInfoDs?.current?.toData() || {};
      if (!fromStageId) {
        if (dimensionCode === 'COMPANY') {
          notification.error({
            description: intl
              .get('sslm.lifeCycleManage.view.message.companyErrorMsg')
              .d('供应商与所选公司不存在合作关系，无法创建单据'),
          });
          return;
        } else if (dimensionCode === 'GROUP') {
          notification.error({
            description: intl
              .get('sslm.lifeCycleManage.view.message.groupErrorMsg')
              .d('供应商与采购方租户不存在合作关系，无法创建单据'),
          });
          return;
        }
      }
    }
    const payload = await getSaveParams();
    if (!isEmpty(payload)) {
      const {
        companyId,
        strategyId,
        fromStageId,
        dimensionCode,
        supplierCompanyId,
        toStageId: newToStageId,
        documentType: newDocumentType,
      } = payload;
      if (isCreate) {
        return verifySupplierLife({
          strategyId,
          toStageId: newToStageId,
          stageId: fromStageId,
          supplierCompanyId,
          companyId: dimensionCode === 'COMPANY' ? companyId : null,
          documentType: newDocumentType,
        }).then(response => {
          const res = getResponse(response);
          if (res) {
            return handleSave(payload);
          }
        });
      } else {
        return handleSave(payload);
      }
    }
  };

  // 提交
  const handleSubmit = async () => {
    const payload = await getSaveParams();
    setAllLoading(true);
    return submitApplication(payload)
      .then(submitResponse => {
        const submitRes = getResponse(submitResponse);
        if (submitRes) {
          notification.success();
          if (isAmktClient && modal) {
            modal.close();
          } else {
            handleBackList();
          }
        }
      })
      .finally(() => {
        setAllLoading(false);
      });
  };

  // 校验并提交
  let _submitModal = null;
  const handleCheckAndSubmit = async type => {
    const payload = await getSaveParams();
    const index = 0;
    if (!isEmpty(payload)) {
      setAllLoading(true);
      const checkcuxModalFlag = await lifeCycleDetailRemote.process(
        'SSLM.LIFE_CYCLE_MANAGE_DETAIL.SUBMIT_VALIDATE',
        true,
        { payload, baseInfoDs }
      );
      if (!checkcuxModalFlag) {
        setAllLoading(false);
        return;
      }
      return new Promise(resolve => {
        checkSubmit({ requisitionId })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              const submitMsg = getSubmitMsg({
                ...res,
                blacklistDateType: payload.blacklistDateType,
              });
              _submitModal = Modal.open({
                border: false,
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: submitMsg[index].message,
                bodyStyle: { padding: '0 24px 24px' },
                onOk: () => {
                  pullAt(submitMsg, index);
                  if (submitMsg.length) {
                    _submitModal.update({
                      children: submitMsg[index].message,
                    });
                    return false;
                  } else {
                    // 提交前的数据校验(适用于指定审批人的工作流)
                    if (type === 'WFL_DYNAMICALLY') {
                      resolve(true);
                      return;
                    }
                    return handleSubmit();
                  }
                },
              });
            }
          })
          .finally(() => {
            setAllLoading(false);
          });
      });
    }
  };

  // 废弃回调
  const handleDiscard = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('sslm.commonApplication.message.confirmCancel').d('是否确认废弃?'),
      onOk: () => {
        setAllLoading(true);
        return discardApplication({ requisitionId, customizeUnitCode: unitCodeList.join(',') })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              handleBackList();
            }
          })
          .finally(() => {
            setAllLoading(false);
          });
      },
    });
  };

  // 清除轮循计时器
  const clearTimerRef = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 【智能审核】回调
  const handleIntelligentReview = () => {
    if (baseInfoDs.dirty) {
      notification.warning({
        message: intl
          .get('sslm.common.view.message.intelligentReviewMsg')
          .d('操作失败，存在未保存的数据，请保存数据后重新点击智能预审'),
      });
    } else {
      setAllLoading(true);
      aiApprove({
        documentType: 'LIFE_CYCLE_CHANGE',
        documentId: requisitionId,
      })
        .then(response => {
          const res = getResponse(response);
          if (res) {
            handleRefresh();
            setReviewIsClick(true);
            notification.success();
          }
        })
        .finally(() => {
          setAllLoading(false);
        });
    }
  };

  // 轮询【智能审核】结果
  const getAiApproveResult = async () => {
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'LIFE_CYCLE_CHANGE_REQ', documentId: requisitionId })
    );
    if (res) {
      setAiApproveStatus(res.status);
      timerTime.current++;
      if (timerTime.current > 4 || res.status !== 'APPROVING') {
        timerTime.current = 0;
        clearTimerRef();
      }
    } else {
      clearTimerRef();
    }
  };

  useEffect(() => {
    clearTimerRef();
    timerRef.current = setInterval(() => getAiApproveResult(), 5000);
    return () => {
      setReviewIsClick(false);
      clearTimerRef();
    };
  }, [reviewIsClick]);

  // 操作记录回调
  const handleOperationRecord = () => {
    const params = { documentType: 'LIFE_CYCLE_MANAGE', documentId: requisitionId };
    operationRecordsModal(params);
  };

  // 风险扫描回调
  const handleRiskScan = () => {
    const record = baseInfoDs?.current?.toData() || {};
    const extraParams = {
      baseInfoDs,
    };
    riskScan(record, false, false, lifeCycleDetailRemote, extraParams);
  };

  // 关联业务单据回调
  const handleRelatedDoc = () => {
    const { companyId, toStageId: newToStageId, supplierCompanyId, supplierTenantId } =
      baseInfoDs?.current?.toData() || {};
    openTab({
      title: 'hzero.common.view.title.supplierRelatedDoc',
      key: '/sslm/supplier-related-doc/list',
      path: '/sslm/supplier-related-doc/list',
      search: querystring.stringify({
        companyId,
        requisitionId,
        supplierCompanyId,
        supplierTenantId, // src-31940 用于关联单据查询供应商分类
        toStageId: newToStageId,
        sourceKey: 'LIFE_CYCLE',
        customizeUnitCode: 'SSLM.LIFE_CYCLE.RELATED_DOC.TABS',
      }),
    });
  };

  // 组件属性
  const componentProps = {
    isEdit,
    isCreate,
    laneCreate,
    custLoading,
    isAmktClient,
    documentType,
    readOnlyFlag,
    requisitionId,
    customizeForm,
    customizeTable,
    lifeCycleDetailRemote,
    routerSupplierCompanyId,
    pubEdit: !!Number(pubEdit),
    onInit: hanldeInitInfo,
    onRest: handleResetData,
  };
  const dataSetObj = {
    baseInfo: baseInfoDs,
    statusInfo: baseInfoDs,
    otherInfo: baseInfoDs,
    supplierAbility: supplierAbilityDs,
    supplierClassify: supplierClassifyDs,
    purchaseInfo: {
      purchaseHeaderDs,
      purchaseLineDs,
    },
    attachmentInfo: baseInfoDs,
  };

  const btnFlag = !!['NEW', 'REJECTED'].includes(processStatus) && !readOnlyFlag && !isPub;

  // 跳转360查询
  const handleSupplierInfo = () => {
    handleSupplierDetail({
      ...baseInfoDs?.current?.toData(),
      sourceType,
    });
  };

  const collapseProps = {
    isEdit,
    pubEdit,
    baseInfoDs,
    requisitionId,
    remoteRef,
  };

  return (
    <Fragment>
      <Header
        backPath={isPub || isAmktClient ? '' : '/sslm/life-cycle-manage/list'}
        title={getDetailTitle(isCreate, isEdit, documentType)}
      >
        <HeaderBtns
          isPub={isPub}
          isEdit={isEdit}
          btnFlag={btnFlag}
          isCreate={isCreate}
          loading={allLoading}
          onDiscard={handleDiscard}
          onSave={handleCheckAndSave}
          isAmktClient={isAmktClient}
          requisitionId={requisitionId}
          onSubmit={handleCheckAndSubmit}
          onRelatedDoc={handleRelatedDoc}
          onSupplierInfo={handleSupplierInfo}
          aiApproveStatus={aiApproveStatus}
          customizeBtnGroup={customizeBtnGroup}
          onOperationRecord={handleOperationRecord}
          onRiskScan={handleRiskScan}
          unitCodeList={unitCodeList}
          approvalBtnInfo={approvalBtnInfo}
          baseInfoDs={baseInfoDs}
          handleRefresh={handleRefresh}
          handleSubmit={handleSubmit}
          onIntelligentReview={handleIntelligentReview}
        />
      </Header>
      <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
      <Content wrapperClassName={styles['content-wrap']} className={styles['customize-wrap']}>
        <Spin spinning={allLoading}>
          {customizeCollapse(
            {
              code: 'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.COLLAPSE',
              custDefaultActive: key => {
                handleCollapseChange(key);
              },
            },
            <Collapse
              trigger="text-icon"
              activeKey={activeKey}
              expandIconPosition="text-right"
              onChange={handleCollapseChange}
            >
              {panelList.map(panel => (
                <Panel header={panel.header} key={panel.key} hidden={panel.hidden}>
                  <panel.component
                    {...componentProps}
                    dataSet={dataSetObj[panel.key]}
                    customizeUnitCode={panel.customizeUnitCode}
                    buttonCode={panel.buttonCode}
                  />
                </Panel>
              ))}
            </Collapse>
          )}
          <Collapse
            trigger="text-icon"
            expandIconPosition="text-right"
            activeKey={relCollapseActiveKey}
            style={{ paddingTop: 8 }}
            onChange={key => setRelCollapseActiveKey(key)}
          >
            {(relTableList || []).map(n => {
              return (
                <Panel header={n.tableName} key={n.uniqueCode}>
                  <DynamicTable
                    c7nButton
                    modelTable={n}
                    readOnly={!isEdit}
                    relationId={requisitionId}
                    viewSaveButton={!!requisitionId}
                    onRef={(ref = {}) => {
                      onRef(ref, n.tableCode);
                    }}
                    readyQuery={!!(toStageId || routerSupplierCompanyId)}
                    interfaceChange={!!(toStageId || routerSupplierCompanyId)}
                  />
                </Panel>
              );
            })}
          </Collapse>
          {lifeCycleDetailRemote.render(
            'SSLM.LIFE_CYCLE_MANAGE_DETAIL.COLLAPSE',
            null,
            collapseProps
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'spfm.importErp',
      'sslm.supplyAbility',
      'sslm.supplierInform',
      'sslm.lifeCycleManage',
      'sslm.commonApplication',
      'sslm.supplierLifeManage',
      'spfm.supplier',
      'spfm.common',
      'smbl.checkRules',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.BASE_INFO',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.OTHER_INFO',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.STATUS_INFO',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_ABILITY',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_CLASSIFY',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_INFO',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_LINE',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.COLLAPSE', // 折叠面板
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.HEADER_BTNS', // 头按钮
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_ABILITY_BTN',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.SUPPLIER_CLASSIFY_BTN',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.PURCHASE_LINE_BTN',
      'SSLM.LIFE_CYCLE.DOCUMENTS_DETAIL.ATT_INFO',
    ],
  }),
  remote({
    code: 'SSLM.LIFE_CYCLE_MANAGE_DETAIL',
    name: 'lifeCycleDetailRemote',
  })
)(Detail);
