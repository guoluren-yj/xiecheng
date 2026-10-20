/*
 * @Date: 2023-04-18 11:50:40
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { useDataSet, Modal, Spin, Tabs } from 'choerodon-ui/pro';
import { compose, isEmpty, isFunction, head, forEach, isNil, isBoolean } from 'lodash';
import React, { Fragment, useState, useCallback, useMemo, useEffect, useRef } from 'react';

import remote from 'utils/remote';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import { aiApprove, checkBankAccountCommon, fetchApproveStatus } from '@/services/commonService';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { investigationTemplateHeaderQueryAll } from '@/services/investigationService';
import {
  saveAll,
  submitAll,
  submitAllCheck,
  deleteApplication,
} from '@/services/supplierInformService';
import { getBankAccountTips, BANK_ACCOUNT_CONSTANT } from '@/routes/components/utils';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';

import styles from '../styles.less';
import HeaderBtns from './HeaderBtns';
import { getPanelList } from './SupplierBasic/utils';
import { getBasicDS } from '../stores/getBasicDS';
import { getHeaderTitle, getComponentList } from '../utils';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const customizeUnitCode = [
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT', // 联系人
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS', // 地址
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK', // 银行信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OTHERS', // 其他信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BUSINESS', // 业务信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.INVOICE', // 开票信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT', // 附件信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SCLASSIFY', // 供应商分类
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION', // 地点层
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_HEAD', // 采购财务-头信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE', // 采购财务-行信息
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY', // 供货能力清单
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS', // 登记信息-境内外
  'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL', // 登记信息-个人
];

const Index = ({
  onLoad,
  dispatch,
  location,
  custLoading,
  customizeForm,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  match: {
    params: { status },
  },
  supplierInformRemote,
}) => {
  const supplierBasicRef = useRef(null); // 供应商基础信息ref
  const investigRef = useRef(null); // 调查表信息ref

  const [loading, setLoading] = useState(false);
  const [compareFlag, setCompareFlag] = useState(false); // 是否开启版本对比
  const [activeKey, setActiveKey] = useState('basic');
  const [headerInfo, setHeaderInfo] = useState({});
  const [investigationTab, setInvestigationTab] = useState([]);
  const [supplierBasicPanels, setSupplierBasicPanels] = useState([]);
  const [approvalBtnInfo, setApprovalBtnInfo] = useState({});
  const [relTableList, setRelTableList] = useState([]);
  const [headerQueryFinished, setHeaderQueryFinished] = useState(false); // 头信息是否查询完成
  const [initQueryCompleteFlag, setInitQueryCompleteFlag] = useState(false); // 初始化查询是否完成
  const [aiApproveStatus, setAiApproveStatus] = useState(null);
  const [reviewIsClick, setReviewIsClick] = useState(false); // 记录【智能预审】按钮是否点击了

  const timerRef = useRef(null); // 定时器
  const timerTime = useRef(0); // 记录轮询次数

  const {
    reqStatus,
    changeLevel,
    businessKey,
    supplierCategoryChangeFlag,
    aiApproveDTOList,
  } = headerInfo;
  const isRead = useMemo(() => status === 'read', [status]);
  const isPub = useMemo(() => location.pathname.match('/pub/'), [location.pathname]);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const {
    changeReqId,
    investgHeaderId,
    investigateTemplateId,
    openMenuType = '',
    sourceType,
  } = routerParams;
  const isEdit = useMemo(() => ['NEW', 'REJECTED', null].includes(reqStatus) && !isRead, [
    reqStatus,
    isRead,
  ]);

  const hiddenBachPath = useMemo(() => isPub || openMenuType === 'openTab', [isPub, openMenuType]);

  const basicDs = useDataSet(() => getBasicDS(), []);

  useEffect(() => {
    handleQuery();
  }, [handleQuery]);

  useEffect(() => {
    // 查询配置表
    const code = 'sslm_supplier_change_req_new';
    const relTableCofigParams = supplierInformRemote
      ? supplierInformRemote.process('SSLM_SUPPLIER_INFORM_REL_TABLE_CONFIG_PARAMS', [code], {
          changeReqId,
        })
      : [code];
    queryRelTableConfig(...relTableCofigParams).then(res => {
      setRelTableList(res);
    });
  }, []);

  // 工作流审批通过调功能端保存
  useEffect(() => {
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, [onLoad]);

  // 处理审批/撤销审批
  useEffect(() => {
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
  }, [businessKey, reqStatus]);

  const workflowSubmit = useCallback(
    approveResult => {
      return new Promise(async (resolve, reject) => {
        if (approveResult === 'Approved') {
          const payload = await getSaveParams();
          if (!isEmpty(payload)) {
            saveAll(payload).then(response => {
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
    },
    [getSaveParams]
  );

  // 处理查询
  const handleQuery = useCallback(
    async investigQueryFlag => {
      setLoading(true);
      try {
        basicDs.setQueryParameter('changeReqId', changeReqId);
        await basicDs
          .query()
          .then(async response => {
            if (response) {
              const {
                investigateTemplateId: headerInvestigateTemplateId,
                hideConfigNames = [],
              } = response;
              if (headerInvestigateTemplateId) {
                const { investigateConfigHeaders = [] } =
                  getResponse(
                    await investigationTemplateHeaderQueryAll({
                      investigateTemplateId: headerInvestigateTemplateId,
                      organizationId,
                    })
                  ) || {};
                const newInvestigationTab = investigateConfigHeaders.map(n => n.configName);
                setSupplierBasicPanels(
                  getPanelList({
                    basicDs,
                    remote: supplierInformRemote,
                    investigationTab: newInvestigationTab,
                    platformTabsHidden: hideConfigNames,
                  })
                );
                setInvestigationTab(newInvestigationTab);
              } else {
                setSupplierBasicPanels(
                  getPanelList({
                    basicDs,
                    remote: supplierInformRemote,
                    platformTabsHidden: hideConfigNames,
                  })
                );
              }
              setAiApproveStatus(response.aiApproveStatus);
              setHeaderInfo({ ...response, defaultBankCompanyName: response.supplierCompanyName });
            }
          })
          .finally(() => {
            setHeaderQueryFinished(true);
          });
        await Promise.all([
          supplierBasicRef.current && supplierBasicRef.current.handleQuery(),
          investigQueryFlag && investigRef.current && investigRef.current.handleQuery(), // 仅按钮回调查询调查表页签，初始化无需查询
        ]);
      } finally {
        setLoading(false);
        setInitQueryCompleteFlag(true);
      }
    },
    [changeReqId, supplierBasicRef.current, investigRef.current, supplierBasicPanels]
  );

  // 获取保存所需参数
  // type 获取参数类型，NO_CHECK 调查表不校验必输性
  const getSaveParams = useCallback(
    async type => {
      const validateFlag = await basicDs.current.validate(true);
      if (validateFlag) {
        const payload = { customizeUnitCode };
        payload.supplierChangeReq = basicDs.current.toJSONData();
        // 供应商基础信息
        if (supplierBasicRef.current) {
          const supplierBasicParams = await supplierBasicRef.current.handleSaveParams();
          // 当表单数据changeReqId为空时，取路由changeReqId
          forEach(supplierBasicParams, current => {
            if (
              typeof current === 'object' &&
              !Array.isArray(current) &&
              isNil(current.changeReqId)
            ) {
              Object.assign(current, { changeReqId });
            }
          });

          if (supplierBasicParams) {
            payload.supplierChangeReqDTO = supplierBasicParams;
          } else {
            return false;
          }
        }
        // 调查表信息
        if (investigRef.current) {
          const investigParams =
            type === 'NO_CHECK'
              ? await investigRef.current.handleSaveParamsWithoutValidate()
              : await investigRef.current.handleSaveParams();
          if (investigParams) {
            payload.investigateDTO = {
              ...investigParams,
              operationCode: type === 'NO_CHECK' ? 'SAVE' : null,
            };
          } else {
            return false;
          }
        }
        // 保存参数埋点
        const payloadInfo = supplierInformRemote.process(
          'SSLM_SUPPLIER_INFORM_NEW_GET_SAVE_PARRAMS',
          payload
        );
        return payloadInfo;
      } else {
        const errorsMsg = [];
        const { errors = [] } = head(basicDs.getValidationErrors()) || {};
        if (!isEmpty(errors)) {
          forEach(errors, curent => {
            const { validationMessage } = head(curent?.errors) || {};
            if (validationMessage) {
              errorsMsg.push(<div>{validationMessage}</div>);
            }
          });
        }
        notification.warning({
          message: intl
            .get('sslm.supplierInform.view.warn.basicInfoNotFilled')
            .d('【申请单基础信息】页签信息未填写'),
          description: errorsMsg,
        });
        return false;
      }
    },
    [supplierBasicRef.current, investigRef.current]
  );

  // 保存回调
  const handleSave = useCallback(async () => {
    const payload = await getSaveParams('NO_CHECK');
    if (payload) {
      const cuxFlag = await supplierInformRemote.event.fireEvent('cuxHandleBeforeSave', {
        checkBankAccountCommon,
        payload,
        headerInfo,
        changeReqId,
        handleQuery,
      });
      if (!cuxFlag) {
        return;
      }
      setLoading(true);
      return saveAll(payload)
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
  }, [supplierBasicRef.current, investigRef.current]);

  const onCheckBankAccount = (payload, type) => {
    const {
      supplierChangeReqDTO: { comBankAccReqs, comBasicReq = {}, supInvoiceReq = {} },
      investigateDTO: { sslmInvestgBankAccount } = {},
    } = payload;
    const { checkMode, isSubdomainsRegister } = headerInfo;
    const { companyName } = comBasicReq || {};
    const { invoiceHeader } = supInvoiceReq || {};
    let invoiceHeaderMsg = '';
    if (!isEmpty(supInvoiceReq)) {
      // 企业名称和开票头不一致标识
      const invoiceHeaderFlag = companyName !== invoiceHeader;
      const needTipInvoiceHeader = invoiceHeaderFlag && isSubdomainsRegister;
      // 开票信息是否校验标识
      const invoiceMsgFlag = supplierInformRemote.process(
        'SSLM_SUPPLIER_INFORM_NEW_INVOICE_MSG_FLAG',
        needTipInvoiceHeader
      );
      invoiceHeaderMsg = invoiceMsgFlag
        ? intl
            .get('sslm.supplierInform.view.message.invoiceHeaderAtypismTips')
            .d('企业名称与发票头不一致')
        : '';
    }
    const data = sslmInvestgBankAccount || comBankAccReqs || [];
    const bankAccountList = data.map(n => {
      const {
        bankAccReqId,
        investgBankAccountId,
        bankAccountName,
        bankAccountNum,
        enabledFlag,
      } = n;
      return {
        bankAccountId: investgBankAccountId || bankAccReqId,
        bankAccountName,
        bankAccountNum,
        enabledFlag,
      };
    });
    setLoading(true);
    return new Promise(resolve => {
      checkBankAccountCommon({
        bankAccountList,
        documentSource: 'SUP_CHANGE',
        companyName: headerInfo.supplierName,
        documentId: changeReqId || -1,
      })
        .then(res => {
          if (getResponse(res)) {
            let bankRepeatMsg = '';
            let bankAccountDifferentMsg = '';
            const { bankDataFlag = true, bankNameFlag = true } = res || {};
            // 银行名称不一致需要前端校验的场景
            const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
            const checkDifferent =
              isBoolean(bankNameFlag) && !bankNameFlag && checkMode === 'weakCheck';
            if (checkRepeat || checkDifferent) {
              bankRepeatMsg = checkRepeat
                ? getBankAccountTips(BANK_ACCOUNT_CONSTANT.DUPLICATE)
                : '';
              bankAccountDifferentMsg = checkDifferent ? getBankAccountTips() : '';
            }
            if (invoiceHeaderMsg || bankRepeatMsg || bankAccountDifferentMsg) {
              Modal.confirm({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: (
                  <Fragment>
                    <div>{bankRepeatMsg}</div>
                    <div>{bankAccountDifferentMsg}</div>
                    <div>{invoiceHeaderMsg}</div>
                  </Fragment>
                ),
                onOk: () => {
                  classifyRepeatCheck(payload, resolve, type);
                },
              });
            } else {
              classifyRepeatCheck(payload, resolve, type);
            }
          }
        })
        .finally(() => {
          setLoading(false);
        });
    });
  };

  // 供应商分类弱校验，产品要求单独校验，不可合并校验
  // 公司级变更，对比供应商分类是否变更，如有变更，弹框确认
  const classifyRepeatCheck = (payload = {}, resolve, type) => {
    if (supplierCategoryChangeFlag) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.common.classfiy.repeatMsg')
          .d('当前为公司级供应商信息变更，供应商分类变更会同步至全集团，请确认是否变更'),
        onOk: () => {
          onSubmit(payload, resolve, type);
        },
      });
    } else {
      onSubmit(payload, resolve, type);
    }
  };

  // 提交前的后端校验(工作流指定审批人时，需要所有校验通过才能弹出选择审批人的弹框)
  const checkSubmit = async (payload, resolve) => {
    setLoading(true);
    await submitAllCheck(payload)
      .then(response => {
        const res = getResponse(response);
        if (res) {
          resolve(true);
        } else {
          resolve(false);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const submit = async () => {
    const payload = await getSaveParams();
    setLoading(true);
    return submitAll(payload)
      .then(async response => {
        const eventProps = {
          ...response,
        };
        const res = getResponse(response);
        if (res) {
          const submitAfterRes = await supplierInformRemote.event.fireEvent('cuxSubmitAfter', {
            payload,
            setLoading,
          });
          if (!submitAfterRes) {
            return;
          }
          notification.success();
          dispatch(
            routerRedux.push({
              pathname: '/sslm/supplier-inform-change-new/list',
            })
          );
        } else {
          const submitMsg = await supplierInformRemote.event.fireEvent(
            'cuxHandleSubmitMsg',
            eventProps
          );
          if (!submitMsg) {
            return;
          }
          // 提交失败也刷新页面，因为后端报错也会更新数据，导致版本号+1
          await handleQuery(true);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onSubmit = (payload, resolve, type) => {
    const { supplierChangeReqDTO: { supChangeOther: { tempFlag } = {} } = {} } = payload;
    // 【临时】从【勾选】被修改为【不勾选】时，增加弱校验弹窗提醒
    const oldTempFlag = supplierBasicRef.current?.supplierBasicData?.supChangeOther?.tempFlag;
    const children =
      oldTempFlag && !tempFlag
        ? intl
            .get('sslm.supplierInform.view.message.cancelTempFlag')
            .d(
              '取消供应商临时标记，不会触发自动升降级，如果您配置了临时相关的生命周期阶段或升降级规则，请检查是否需要手工发起生命周期申请单修改供应商阶段'
            )
        : intl.get('hzero.common.message.confirm.submit').d('是否确认提交?');
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children,
      onOk: async () => {
        // 提交前的数据校验(适用于指定审批人的工作流)
        if (type === 'WFL_DYNAMICALLY') {
          await checkSubmit(payload, resolve);
          return true;
        } else {
          return submit();
        }
      },
    });
  };

  // 提交回调
  const handleSubmit = useCallback(
    async type => {
      const payload = await getSaveParams();
      if (!isEmpty(payload)) {
        return onCheckBankAccount(payload, type);
      }
    },
    [headerInfo]
  );

  // 删除回调
  const handleDelete = useCallback(() => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
      onOk: () => {
        setLoading(true);
        return deleteApplication({ changeReqIdList: [changeReqId] })
          .then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: '/sslm/supplier-inform-change-new/list',
                })
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, [changeReqId]);

  // 操作记录回调
  const handleOperationRecord = useCallback(() => {
    operationRecordsModal({
      changeReqId,
      documentId: changeReqId,
      documentType: 'SUPPLIER_INFO_CHANGE',
      remote: supplierInformRemote,
    });
  }, [changeReqId]);

  // 清除轮循计时器
  const clearTimerRef = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 【智能审核】回调
  const handleIntelligentReview = () => {
    const investigChange = investigRef?.current?.handleIsChange();
    const supplierBasicChange = supplierBasicRef?.current?.handleIsChange();
    if (basicDs.dirty || supplierBasicChange || investigChange) {
      notification.warning({
        message: intl
          .get('sslm.common.view.message.intelligentReviewMsg')
          .d('操作失败，存在未保存的数据，请保存数据后重新点击智能预审'),
      });
    } else {
      setLoading(true);
      aiApprove({
        documentType: 'SUP_CHANGE_REQ',
        documentId: changeReqId,
      })
        .then(async response => {
          const res = getResponse(response);
          if (res) {
            notification.success();
            await handleQuery();
            setReviewIsClick(true);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // 轮询【智能审核】结果
  const getAiApproveResult = async () => {
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'SUP_CHANGE_REQ', documentId: changeReqId })
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

  // 版本对比
  const handleVersionComparison = useCallback(() => {
    setCompareFlag(curState => !curState);
  }, []);

  // 跳转360查询
  const handleSupplierInfo = useCallback(() => {
    handleSupplierDetail({ ...headerInfo, sourceType });
  }, [headerInfo, sourceType]);

  // tab改变时的回调
  const handleTabChange = useCallback(key => {
    setActiveKey(key);
  }, []);

  const componentList = getComponentList({ investigateTemplateId });

  // 组件属性
  const commonProps = {
    isEdit,
    isRead,
    headerInfo,
    changeReqId,
    custLoading,
    changeLevel,
    customizeForm,
    customizeTable,
    customizeTabPane,
    setLoading,
    setActiveKey,
    initQueryCompleteFlag,
  };
  const componentProps = {
    basic: {
      dataSet: basicDs,
    },
    supplierBasic: {
      relTableList,
      investigationTab,
      ref: supplierBasicRef,
      panelList: supplierBasicPanels,
      supplierInformRemote,
    },
    investigation: {
      investigRef,
      investgHeaderId,
      headerQueryFinished,
      investigateTemplateId,
      supplierInformRemote,
    },
  };

  return (
    <Fragment>
      <Header
        title={getHeaderTitle(status)}
        backPath={hiddenBachPath ? '' : '/sslm/supplier-inform-change-new/list'}
      >
        <HeaderBtns
          isEdit={isEdit}
          loading={loading}
          headerInfo={headerInfo}
          compareFlag={compareFlag}
          onSave={handleSave}
          onSubmit={handleSubmit}
          onDelete={handleDelete}
          setLoading={setLoading}
          onSupplierInfo={handleSupplierInfo}
          onOperationRecord={handleOperationRecord}
          onVersionComparison={handleVersionComparison}
          onIntelligentReview={handleIntelligentReview}
          customizeBtnGroup={customizeBtnGroup}
          approvalBtnInfo={approvalBtnInfo}
          aiApproveStatus={aiApproveStatus}
          handleQuery={handleQuery}
          isPub={isPub}
          submit={submit}
        />
      </Header>
      <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
      <Content wrapperClassName={styles['supplier-info-wrapper']}>
        <Spin spinning={loading}>
          <Tabs activeKey={activeKey} onChange={handleTabChange}>
            {componentList.map(item => {
              return (
                <TabPane forceRender key={item.key} tab={item.stepTitle}>
                  {/* 明细对比时,仍可操作保存、提交按钮,故非对比页dom需一直存在，否则必输校验有问题 */}
                  <div
                    style={{
                      opacity: compareFlag ? 0 : 1,
                      height: compareFlag ? 0 : 'auto',
                      visibility: compareFlag ? 'hidden' : 'visible',
                    }}
                  >
                    {React.createElement(
                      item.component,
                      Object.assign(commonProps, componentProps[item.key])
                    )}
                  </div>
                  {compareFlag &&
                    React.createElement(
                      item.compareComponent,
                      Object.assign(commonProps, componentProps[item.key])
                    )}
                </TabPane>
              );
            })}
          </Tabs>
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
      'spfm.enterprise',
      'sslm.supplyAbility',
      'sslm.supplierDetail',
      'sslm.supplierInform',
      'sslm.enterpriseInform',
      'sslm.commonApplication',
      'spfm.bank',
    ],
  }),
  remote(
    {
      code: 'SSLM_SUPPLIER_INFORM_NEW', // 对应二开模块暴露的Expose的编码
      name: 'supplierInformRemote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        cuxHandleSubmitMsg() {}, // 二开提交按钮校验信息
        cuxSubmitAfter() {}, // 二开提交按钮提交后的逻辑
        cuxHandleBeforeSave() {}, // 二开保存前的校验逻辑
        cuxHandleSupplierBasicInit() {}, // 供应商基础信息，增加额外的初始化
      },
    }
  ),
  withCustomize({
    unitCode: [
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BASIC', // 基础信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.CONTACT', // 联系人
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ADDRESS', // 地址
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BANK', // 银行信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OTHERS', // 其他信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.BUSINESS', // 业务信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.INVOICE', // 开票信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ATTACHMENT', // 附件信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SCLASSIFY', // 供应商分类
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.LOCATION', // 地点层
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.OU', // ou层
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_HEAD', // 采购财务-头信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.PURCHASE_LINE', // 采购财务-行信息
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLY_ABILITY', // 供货能力清单
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_OVERSEAS', // 登记信息-境内外
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.REGISTRATION_PERSONAL', // 登记信息-个人
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.ABILITY_LINE_ATTACHMENT', // 供货能力清单-行附件
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.SUPPLIER_BASIC_TABS', // 供应商基础信息-标签页
      'SSLM.SUPPLIER_INFORM_CHANGE_NEW_DETAIL.HEADER_BTNGROUP', // 头按钮组
    ],
  })
)(Index);
