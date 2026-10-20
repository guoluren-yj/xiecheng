/*
 * SupplierInvestigationWorkbench - 供应商调查表工作台详情页
 * @date: 2022/11/16 15:12:06
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */
import React, { Fragment, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { compose, isFunction, isBoolean } from 'lodash';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import querystring from 'querystring';
import { Header, Content } from 'components/Page';
import { Collapse, Card } from 'choerodon-ui';
import { Button, Dropdown, Icon, DataSet, notification, Menu, Spin, Modal } from 'choerodon-ui/pro';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import remote from 'utils/remote';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { Button as PermissionButton } from 'components/Permission';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { handlePrint, handleExcelPrint } from '@/services/supplierInvestWorkbenchService';
import {
  checkBankAccountCommon,
  aiApprove,
  fetchApproveStatus,
  queryAiConfig,
} from '@/services/commonService';
import { getBankAccountTips, BANK_ACCOUNT_CONSTANT } from '@/routes/components/utils';
import { queryMapIdpValue } from 'services/api';
import { saveData, submit } from '@/services/investigationService';
import { downloadFile } from 'hzero-front/lib/services/api';
import TempateDetail from '@/routes/components/Investigation';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { getAgreementModal } from '@/routes/components/PrivacyAgreement';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';
import { headerInfoDS } from './stores/headerInfoDS';
import HeaderInfo from './HeaderInfo';
import styles from '../index.less';

const { Panel } = Collapse;
const tenantId = getCurrentOrganizationId();
const deletePermissionCode = {
  sslmInvestgAttachment: 'srm.partner.supplier-investigation-workbench.api.ps.delete',
};
const addPermissionCode = {
  sslmInvestgAttachment: 'srm.partner.supplier-investigation-workbench.api.ps.insert',
};

const Detail = (props) => {
  const {
    custLoading,
    customizeForm,
    match: {
      params: { investgHeaderId },
      path,
    },
    dispatch,
    queryUnitConfig,
    onLoad,
    supplierInvestgRemote,
  } = props;
  const isPub = path.includes('/pub/'); // 工作流
  const routerParams = querystring.parse(props.location.search.substr(1));
  const {
    investigateTemplateId,
    organizationId,
    editStatus = 'view',
    triggerByCode,
  } = routerParams;
  const [state, setState] = useState({
    processStatus: null,
    isEdit: editStatus === 'edit', // 是否编辑
    printType: [], // 打印类型
    initLoading: false, // 初始化状态完成后再加载调查表组件控制
    defaultBankCompanyName: null,
    commonInvestigaFlag: false, // 普通调查表标识
    checkMode: 'noCheck',
    reviewIsClick: false,
    aiApproveStatus: null,
    aiApproveDTOList: [],
  });
  const [spinning, setSpinning] = useState(false);
  const [queryLoading, setQueryLoading] = useState(false);
  const [showAiApproveFlag, setShowAiApproveFlag] = useState(false);
  const tableDs = useMemo(() => new DataSet(headerInfoDS({ investgHeaderId })), []);
  const supplierInvestWorkbenchRef = useRef(null);
  const {
    isEdit,
    printType,
    initLoading,
    reviewIsClick,
    processStatus,
    aiApproveStatus,
    aiApproveDTOList,
    defaultBankCompanyName,
    commonInvestigaFlag,
  } = state;

  const allLoading = spinning || queryLoading;

  const timerRef = useRef(null); // 定时器
  const timerTime = useRef(0); // 记录轮询次数

  // 整合state
  const setAllState = useCallback(
    (newState) => {
      setState((prevState) => ({ ...prevState, ...newState }));
    },
    [setState]
  );

  // 业务规则是否开启AI审批
  const handleAiConfig = () => {
    queryAiConfig({
      documentId: investgHeaderId,
      documentType: 'SUPPLIER_INVESTG',
    }).then((response) => {
      const res = getResponse(response);
      if (res) {
        setShowAiApproveFlag(true);
      }
    });
  };

  // 保存回调
  const onHandleSave = useCallback(async () => {
    if (supplierInvestWorkbenchRef.current && tableDs.current) {
      const saveParams = supplierInvestWorkbenchRef.current.handleSaveParamsWithoutValidate();
      setSpinning(true);
      const headerInfo = tableDs.current.toJSONData();
      const payload = {
        customizeTenantId: organizationId,
        customizeUnitCode: 'SSLM.SUPPLIER_INVEST_WORKBENCH_DETAIL.BASIC_INFO',
        ...saveParams,
        headerInfo,
      };
      return new Promise((resolve) => {
        saveData(payload, investgHeaderId)
          .then((response) => {
            const res = getResponse(response);
            if (res) {
              setQueryLoading(true);
              Promise.all([
                tableDs.query(),
                // 避免点击保存后，保存操作未完全成功，返回到列表页，导致端侧报错问题（原因：返回列表页后 supplierInvestWorkbenchRef 将丢失）
                supplierInvestWorkbenchRef.current &&
                  supplierInvestWorkbenchRef.current.handleQuery(),
              ]).finally(() => {
                setQueryLoading(false);
              });
              resolve(true);
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
            } else {
              resolve(false);
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      });
    }
  }, []);

  const onSubmit = (payload) => {
    return submit(investgHeaderId, organizationId, payload)
      .then((response) => {
        const res = getResponse(response);
        if (res) {
          notification.success({
            placement: 'bottomRight',
            message: intl.get('hzero.common.notification.success').d('操作成功'),
          });
          dispatch(
            routerRedux.push({
              pathname: `/sslm/supplier-investigation-workbench/list`,
            })
          );
        }
      })
      .finally(() => {
        setSpinning(false);
      });
  };

  const onCheckBankAccount = (saveParams) => {
    const { checkMode } = state;
    const { sslmInvestgBankAccount } = saveParams;
    const companyName = tableDs.current?.get('partnerCompanyName');
    const data = sslmInvestgBankAccount || [];
    const bankAccountList = data.map((n) => {
      const { bankAccountName, bankAccountNum, bankId, enabledFlag } = n;
      return {
        bankAccountId: bankId,
        bankAccountName,
        bankAccountNum,
        enabledFlag,
      };
    });
    setSpinning(true);
    return checkBankAccountCommon({
      bankAccountList,
      documentSource: 'INVESTIGATE',
      companyName,
      documentId: investgHeaderId || -1,
    }).then((res) => {
      if (getResponse(res)) {
        const { bankDataFlag = true, bankNameFlag = true } = res || {};
        const checkRepeat = isBoolean(bankDataFlag) && !bankDataFlag;
        // 银行名称不一致需要前端校验的场景
        const checkDifferent =
          isBoolean(bankNameFlag) && !bankNameFlag && checkMode === 'weakCheck';
        if (checkRepeat || checkDifferent) {
          const bankRepeatMsg = checkRepeat
            ? getBankAccountTips(BANK_ACCOUNT_CONSTANT.DUPLICATE)
            : '';
          const bankAccountDifferentMsg = checkDifferent ? getBankAccountTips() : '';
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: (
              <Fragment>
                <div>{bankRepeatMsg}</div>
                <div>{bankAccountDifferentMsg}</div>
              </Fragment>
            ),
            onOk: () => {
              return new Promise((resolve) => {
                onSubmit(saveParams).finally(() => {
                  setSpinning(false);
                  resolve(true);
                });
              });
            },
            onCancel: () => {
              setSpinning(false);
            },
          });
        } else {
          return onSubmit(saveParams).finally(() => {
            setSpinning(false);
          });
        }
      } else {
        setSpinning(false);
      }
    });
  };

  // 提交回调
  const onHandleSubmit = useCallback(async () => {
    if (supplierInvestWorkbenchRef.current && tableDs.current) {
      const saveParams = await supplierInvestWorkbenchRef.current.handleSaveParams();
      const headerValidate = await tableDs.current.validate(true);
      if (headerValidate && saveParams) {
        const headerInfo = tableDs.current.toJSONData();
        const payload = {
          customizeTenantId: organizationId,
          customizeUnitCode: 'SSLM.SUPPLIER_INVEST_WORKBENCH_DETAIL.BASIC_INFO',
          headerInfo,
          ...saveParams,
        };
        return new Promise((resolve) => {
          onCheckBankAccount(payload).finally(() => resolve(true));
        });
      }
    }
  }, [state.checkMode]);

  // 操作记录弹窗
  const onHandleOperation = useCallback(() => {
    operationRecordsModal({
      documentType: 'SUPPLIER_INVESTIGATION_WORKBENCH',
      documentId: investgHeaderId,
      isSupplier: true,
    });
  }, []);

  /**
   * 打印功能
   */
  const handlePrintBtn = useCallback((e) => {
    const payload = {
      investgHeaderId,
      tenantId: organizationId,
    };
    const { key } = e;
    switch (key) {
      case 'PDF':
        setSpinning(true);
        handlePrint(payload)
          .then((res) => {
            if (res) {
              if (res.type.indexOf('application/json') > -1) {
                notification.warning({
                  description: intl
                    .get(`sslm.common.view.printwarning.noTemplate`)
                    .d('未设置打印模板，不可打印'),
                });
                return;
              }
              const file = new Blob([res], { type: 'application/pdf' });
              const fileURL = URL.createObjectURL(file);
              const printWindow = window.open(fileURL);
              if (printWindow) {
                printWindow.print();
              }
            }
          })
          .finally(() => {
            setSpinning(false);
          });
        break;
      case 'EXCEL':
        setSpinning(true);
        handleExcelPrint(payload)
          .then((res) => {
            if (res) {
              downloadFile({ requestUrl: res });
            }
          })
          .finally(() => {
            setSpinning(false);
          });
        break;
      default:
        break;
    }
  }, []);

  // 查看条款
  const handleViewAgreement = useCallback(() => {
    if (!tableDs.current) {
      return;
    }
    getAgreementModal({ record: tableDs.current, isEdit: false });
  }, []);

  // 查询打印类型lov
  const initLov = useCallback(() => {
    const lovCode = {
      printType: 'SSLM_INVESTIGATE_PRINT_CODE',
      tenantId,
    };
    queryMapIdpValue(lovCode).then((res) => {
      if (res) {
        setAllState({ printType: res.printType });
      }
    });
  }, []);

  const printMenu = (
    <Menu onClick={handlePrintBtn}>
      {(printType || []).map((n) => (
        <Menu.Item key={n.value}>{n.meaning}</Menu.Item>
      ))}
    </Menu>
  );

  // 清除轮循计时器
  const clearTimerRef = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  // 轮询【智能审核】结果
  const getAiApproveResult = async () => {
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'SUPPLIER_INVESTG', documentId: investgHeaderId })
    );
    if (res) {
      setAllState({ aiApproveStatus: res.status });
      if (supplierInvestgRemote && supplierInvestgRemote.event) {
        supplierInvestgRemote.event.fireEvent('cuxHandleAiResult', {
          tableDs,
          aiApproveStatus: res.status,
        });
      }
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
      setAllState({ reviewIsClick: false });
      clearTimerRef();
    };
  }, [reviewIsClick]);

  // 智能预审回调
  const handleIntelligentReview = async () => {
    onHandleSave().then((res) => {
      if (res) {
        setSpinning(true);
        aiApprove({
          documentType: 'SUPPLIER_INVESTG',
          documentId: investgHeaderId,
        })
          .then((response) => {
            if (getResponse(response)) {
              tableDs.query().then((queryRes) => {
                if (queryRes) {
                  setAllState({ aiApproveStatus: queryRes.aiApproveStatus });
                }
              });
              setAllState({ reviewIsClick: true });
            }
          })
          .finally(() => {
            setSpinning(false);
          });
      }
    });
  };

  // 工作流审批回调
  const workflowSubmit = async (approveResult) => {
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved' && isEdit) {
        onHandleSave().then((res) => {
          if (res) {
            resolve(res);
          } else {
            reject(new Error(res)); // 异常
          }
        });
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    initLov();
    handleAiConfig();
    setAllState({ initLoading: true });
    if (queryUnitConfig) {
      queryUnitConfig({ customizeTenantId: organizationId });
    }
    // 处理工作流审批保存
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, []);

  useEffect(() => {
    tableDs.query().then((response) => {
      if (response) {
        const editReqStatus = ['RELEASE', 'REJECT'].includes(response.processStatus);
        // 待提交｜审批拒绝审批状态 工作流中不可编辑
        setAllState({
          isEdit: isPub
            ? editStatus === 'edit' && !editReqStatus
            : editStatus === 'edit' && editReqStatus,
          processStatus: response.processStatus,
          defaultBankCompanyName: response.partnerCompanyName,
          commonInvestigaFlag: triggerByCode !== 'INVITE',
          checkMode: response.checkMode,
          aiApproveStatus: response.aiApproveStatus,
          aiApproveDTOList: response.aiApproveDTOList,
        });
      } else {
        setAllState({ isEdit: false });
      }
    });
  }, []);

  // 处理埋点
  const handleBurialPoint = () => {
    const result = {
      type: 'supplierInvestgWorkbench',
      otherProps: { headerDataSet: tableDs },
    };
    return result;
  };

  return (
    <Fragment>
      <Header
        backPath="/sslm/supplier-investigation-workbench/list"
        title={
          isEdit
            ? intl.get('sslm.supplierInvestWorkbench.view.title.investWrite').d('填写调查表')
            : intl.get('sslm.supplierInvestWorkbench.view.title.investView').d('查看调查表')
        }
      >
        {isEdit && (
          <Fragment>
            <Button
              icon="check"
              color="primary"
              loading={allLoading}
              hidden={!['RELEASE', 'REJECT'].includes(processStatus)}
              onClick={() => onHandleSubmit()}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>
            <Button
              icon="save"
              funcType="flat"
              loading={allLoading}
              onClick={() => onHandleSave()}
              hidden={!['RELEASE', 'REJECT'].includes(processStatus)}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
            <Dropdown overlay={printMenu} placement="bottomLeft">
              <PermissionButton
                type="c7n-pro"
                icon="print-o"
                funcType="flat"
                loading={allLoading}
                wait={500}
                waitType="throttle"
                permissionList={[
                  {
                    code: `srm.partner.supplier-investigation-workbench.api.ps.print`,
                    type: 'button',
                    meaning: '供应商调查表工作台-打印',
                  },
                ]}
              >
                {intl.get('hzero.common.button.print').d('打印')}
                {<Icon type="down" />}
              </PermissionButton>
            </Dropdown>
            {triggerByCode === 'INVITE' && (
              <Button
                icon="find_in_page"
                funcType="flat"
                loading={allLoading}
                onClick={handleViewAgreement}
                wait={500}
                waitType="throttle"
              >
                {intl.get('sslm.common.button.viewAgreement').d('查看条款')}
              </Button>
            )}
            {showAiApproveFlag && (
              <PermissionButton
                type="c7n-pro"
                funcType="flat"
                loading={allLoading}
                onClick={handleIntelligentReview}
                disabled={aiApproveStatus === 'APPROVING'}
              >
                <span style={{ display: !allLoading ? 'flex' : 'initial', alignItems: 'center' }}>
                  {!allLoading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
                  {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
                </span>
              </PermissionButton>
            )}
          </Fragment>
        )}
        {!isEdit && (
          <Fragment>
            <Button
              icon="operation_service_request"
              funcType="flat"
              loading={allLoading}
              onClick={() => onHandleOperation()}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.operation').d('操作记录')}
            </Button>
            <PermissionButton
              type="c7n-pro"
              icon="print-o"
              funcType="flat"
              loading={allLoading}
              onClick={() => handlePrintBtn({ key: 'PDF' })}
              permissionList={[
                {
                  code: `srm.partner.supplier-investigation-workbench.api.ps.print`,
                  type: 'button',
                  meaning: '供应商调查表工作台-打印',
                },
              ]}
              wait={500}
              waitType="throttle"
            >
              {intl.get('hzero.common.button.print').d('打印')}
            </PermissionButton>
          </Fragment>
        )}
      </Header>
      {showAiApproveFlag && (
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
      )}
      <Content className={styles['supplier-investigate-detail-content']}>
        <Spin spinning={allLoading} wrapperClassName={styles['supplier-investigate-detail']}>
          <Collapse
            bordered={false}
            defaultActiveKey={['investigateInfo']}
            trigger="text-icon"
            expandIconPosition="text-right"
          >
            <Panel
              header={intl.get('sslm.investTempConfig.view.title.InvestigateInfo').d('调查表信息')}
              key="investigateInfo"
              forceRender
            >
              <HeaderInfo
                isEdit={isEdit}
                dataSet={tableDs}
                custLoading={custLoading}
                customizeForm={customizeForm}
                customizeUnitCode="SSLM.SUPPLIER_INVEST_WORKBENCH_DETAIL.BASIC_INFO"
              />
            </Panel>
          </Collapse>
          <div className={styles['supplier-investigate-detail-line']}>
            <Card
              bordered={false}
              title={intl.get('sslm.common.view.title.detailInfo').d('详细信息')}
            >
              {initLoading && (
                <TempateDetail
                  source="write"
                  editable={isEdit}
                  showTabBar={false}
                  organizationId={organizationId}
                  ref={supplierInvestWorkbenchRef}
                  investgHeaderId={investgHeaderId}
                  addPermissionCode={addPermissionCode}
                  deletePermissionCode={deletePermissionCode}
                  investigateTemplateId={investigateTemplateId}
                  defaultBankCompanyName={defaultBankCompanyName}
                  allowDeleteAllLineFlag={!commonInvestigaFlag}
                  setLoading={setQueryLoading}
                  otherRemoteProps={handleBurialPoint()}
                  investgRemote={supplierInvestgRemote}
                />
              )}
            </Card>
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

const DetailWrapper = (props) => {
  const { purTenantNum } = props;
  const Wrapper = compose(
    formatterCollections({
      code: [
        'sslm.supplierInvestWorkbench',
        'hzero.common',
        'sslm.common',
        'sslm.investTempConfig',
        'sslm.supplierInform',
      ],
    }),
    WithCustomize({
      unitCode: [
        'SSLM.SUPPLIER_INVEST_WORKBENCH_DETAIL.BASIC_INFO', // 调查表基础信息
      ],
      manualQuery: true,
    }),
    remote(
      {
        code: 'SSLM_SUPPLIER_INVESTIGATION_WORKBENCH',
        name: 'supplierInvestgRemote',
        tenantNum: purTenantNum,
      },
      {
        events: {
          cuxHandleAiResult: () => {}, // 二开事件处理AI审批结果
        },
      }
    )
  )(Detail);
  return <Wrapper {...props} />;
};

export default DetailWrapper;
