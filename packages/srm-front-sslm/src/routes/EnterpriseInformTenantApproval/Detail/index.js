/*
 * Detail - 企业信息变更审批详情
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { useDataSet, Spin, Button, DataSet, Modal, Form, TextArea } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { compose, isEmpty } from 'lodash';
import React, { Fragment, useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ApproveButton from '_components/ApproveButton';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';

import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { getRenderFieldProps } from '@/routes/EnterpriseInformNew/utils';
import { useSetState } from '@/routes/components/utils';
import HeaderInfo from '@/routes/EnterpriseInformNew/Detail/HeaderInfo';
import EnterpriseBasicInfo from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo';
import AttachmentInfo from '@/routes/EnterpriseInformNew/Detail/AttachmentInfo';
import Investiga from '@/routes/EnterpriseInformNew/Detail/Investiga';
import { getHeaderDS } from '@/routes/EnterpriseInformNew/stores/getHeaderDS';
import { getPanelList } from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/utils/getPanel';
import {
  confirm,
  approveReject,
  tenantConfirmBefore,
  tenantConfirm,
  queryInfoChangeApprovalDetail,
} from '@/services/enterpriseInformService';
import {
  queryAllApprovalData,
  handleRevokeApprova,
  handleApprove,
} from '@/routes/components/WorkFlowApproval';

import styles from '@/routes/EnterpriseInformNew/styles.less';

import { getHeaderTitle, getBtnsPermissions } from './utils';
import { approvalModalDS } from '../stores/getListDS';

const Index = ({
  dispatch,
  location,
  custLoading,
  customizeForm,
  customizeTable,
  customizeTabPane,
  match: {
    params: { changeConfirmId },
  },
}) => {
  const enterpriseBasicRef = useRef(null); // 企业基础信息ref
  const investigRef = useRef(null); // 调查表信息ref

  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [enterpriseBasicPanels, setEnterpriseBasicPanels] = useState([]);
  const [viewUpdate, setViewUpdate] = useState(false);
  const [state, setState] = useSetState({
    templateConfig: {}, // 模版配置
    approvalDataInfo: {}, // 工作流审批相关
  });

  const { templateConfig } = state;

  const {
    reqStatus,
    approvalOpinion,
    configNames,
    domesticForeignRelation,
    businessKey,
    hideConfigNames,
    businessApvMethod,
  } = headerInfo;
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { changeReqId, partnerTenantId, pageType, openMenuType } = routerParams;
  const isAllPlatform = useMemo(() => pageType === 'confirm', [pageType]);

  const headerDs = useDataSet(() => getHeaderDS({ partnerTenantId, pageSource: 'approval' }), []);
  const approvalDs = new DataSet(approvalModalDS()); // 审批弹框ds
  const approvalRecord = approvalDs?.current || {};

  // 工作流审批指定审批人
  const designatedFlag = useMemo(() => businessApvMethod === 'PUR_WFL_DYNAMICALLY', [
    businessApvMethod,
  ]);

  // 平台确认按钮
  const showConfirmBtn = useMemo(
    () =>
      ['CONFIRM_REJECTED', 'WAIT_TENANT_CONFIRMED', 'REJECTED@WFL'].includes(reqStatus) &&
      isAllPlatform,
    [reqStatus, isAllPlatform]
  );
  // 租户审批按钮
  const showApprovelBtn = useMemo(() => ['WAIT_CONFIRMED'].includes(reqStatus) && !isAllPlatform, [
    reqStatus,
    isAllPlatform,
  ]);

  // 头信息个性化字段可编辑
  const cuzFieldEdit = showConfirmBtn || showApprovelBtn;

  const hiddenBackPath = ['openTab'].includes(openMenuType);

  const customizeHeaderCode = isAllPlatform
    ? 'SSLM.ENTERPRISE_TENANT_CONFIRM_DETAIL.HEADER'
    : 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.HEADER';

  useEffect(() => {
    handleQuery();
  }, [changeReqId]);

  // 处理查询
  const handleQuery = useCallback(
    async ({ investigQueryFlag = false } = {}) => {
      try {
        setLoading(true);
        headerDs.setQueryParameter('queryParmas', {
          changeReqId,
          newPageQuery: 1,
          customizeUnitCode: customizeHeaderCode,
        });
        let personalFlag = false;
        let hiddenPlatformTabs = [];
        // const headerResp = await headerDs.query();
        const result = await Promise.all([headerDs.query(), queryConfig()]);
        const [headerResp, investgConfig] = result;
        if (getResponse(headerResp)) {
          setHeaderInfo(headerResp);
          const {
            domesticForeignRelation: newDomesticForeignRelation,
            hideConfigNames: hideNames = [],
          } = headerResp;
          hiddenPlatformTabs = hideNames;
          personalFlag = newDomesticForeignRelation === 2;
          // 查询审批/撤销审批
          handleQueryAllApprovalData(headerResp);
        }
        let temptConfig = {};
        if (getResponse(investgConfig)) {
          temptConfig = investgConfig;
          setState({ templateConfig: temptConfig });
        }
        setEnterpriseBasicPanels(
          getPanelList({
            isAllPlatform,
            partnerTenantId,
            readOnlyFlag: true,
            personalFlag,
            temptConfig,
            changeReqId,
            cusCodeSuorce: 'approval',
            hiddenPlatformTabs,
          })
        );
        await Promise.all([
          enterpriseBasicRef.current && enterpriseBasicRef.current.handleQuery(),
          investigQueryFlag && investigRef.current && investigRef.current.handleQuery(), // 仅按钮回调查询调查表页签，初始化无需查询
        ]);
      } finally {
        setLoading(false);
      }
    },
    [changeReqId, enterpriseBasicRef.current, investigRef.current]
  );

  const handleQueryAllApprovalData = (params = {}) => {
    const { businessKey: key } = params;
    if (key) {
      queryAllApprovalData({ businessKeys: [key], queryHistoryFlag: false }).then(res => {
        if (res) {
          const { approvalDataMap, revokeDataMap } = res;
          setState({
            approvalDataInfo: {
              approvalDataMap,
              revokeDataMap,
            },
          });
        }
      });
    } else {
      setState({
        approvalDataInfo: {},
      });
    }
  };

  // 查询调查表配置
  const queryConfig = useCallback(async () => {
    // 查询模板配置
    const payload = {
      changeReqId,
      partnerTenantId,
    };
    return queryInfoChangeApprovalDetail(payload);
  }, [changeReqId, partnerTenantId]);

  /**
   * fieldName: 标红字段，没配置displayField则用fieldName取旧数据
   * displayField: 取旧数据
   */
  const getFieldProps = useCallback(
    ({ currentRecord, fieldName, type, displayField, hidden } = {}) => {
      const { hidden: formFeildHidden = {}, renderer } = getRenderFieldProps({
        currentRecord,
        fieldName,
        fieldType: type,
        displayField,
        hidden,
      });
      // 处理hidden
      const hiddenProps = viewUpdate ? formFeildHidden : { hidden };
      return {
        renderer: ({ value, record, name, type: renderType, displayField: renderDisplayField }) =>
          renderer({ value, record, name, renderType, renderDisplayField }),
        ...hiddenProps,
      };
    },
    [viewUpdate]
  );

  // 处理只读表格渲染
  const handleFieldRender = useCallback(({ value, record, name, type, displayField } = {}) => {
    const { renderer } = getRenderFieldProps({
      currentRecord: record,
      fieldName: name,
      fieldType: type,
      displayField,
    });
    return renderer({ value, record, name, renderType: type, renderDisplayField: displayField });
  }, []);

  // 操作记录回调
  const handleOperationRecord = useCallback(() => {
    if (isAllPlatform) {
      operationRecordsModal({
        documentType: 'ENTERPRISE_PLATFORM_CONFIRM',
        approveDocumentType: 'ENTERPRISE_TENANT_CONFIRM',
        documentId: changeConfirmId,
      });
    } else {
      operationRecordsModal({
        documentType: 'ENTERPRISE_TENANT_CONFIRM',
        changeReqId,
        documentId: changeConfirmId,
      });
    }
  }, [changeConfirmId, changeReqId]);

  // 审批回调
  const handleApproveCb = (key, resolve) => {
    setLoading(true);
    const data = approvalRecord.toJSONData();
    const headerData = headerDs.current.toJSONData();
    const { approvalOpinion: newApprovalOpinion } = data;
    const payload = {
      data: [
        {
          ...headerData,
          approvalOpinion: newApprovalOpinion,
          changeConfirmId,
        },
      ],
      customizeUnitCode: ['SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.HEADER'],
    };
    const handleApproval = key === 'approved' ? confirm : approveReject;
    handleApproval(payload)
      .then(res => {
        if (getResponse(res)) {
          notification.success();
          handleGotoList();
          if (resolve) {
            resolve(true);
          }
        } else if (resolve) {
          resolve(false);
        }
      })
      .finally(() => setLoading(false));
  };

  const handleOpenApprovelModal = useCallback(
    key => {
      if (isEmpty(approvalRecord)) {
        approvalRecord.set({
          approvalOpinion,
        });
      }
      return new Promise(solve => {
        Modal.open({
          key: Modal.key(),
          closable: false,
          movable: false,
          destroyOnClose: true,
          drawer: true,
          style: { width: 380 },
          title: intl.get('sslm.enterpriseInform.model.application.approvalOpinion').d('审批意见'),
          children: (
            <Form record={approvalRecord} labelLayout="float">
              <TextArea name="approvalOpinion" />
            </Form>
          ),
          onOk: () => {
            return new Promise(async resolve => {
              // 租户审批通过校验个性化字段
              if (key === 'approved') {
                const validateFlag = headerDs.current
                  ? await headerDs.current.validate(true)
                  : false;
                if (!validateFlag) {
                  // 提示
                  notification.error({
                    message: intl
                      .get('sslm.common.view.message.maintainInfo')
                      .d('请维护相关信息！'),
                  });
                  resolve(true);
                  return;
                }
              }
              if (key === 'designated') {
                solve(true);
                resolve(true);
                return;
              }
              handleApproveCb(key, resolve);
            });
          },
          onCancel: () => {
            solve(false);
          },
        });
      });
    },
    [headerInfo]
  );

  // 平台确认
  const handleConfirm = useCallback(async () => {
    // 校验个性化字段
    const validateFlag = headerDs.current ? await headerDs.current.validate(true) : false;
    if (!validateFlag) {
      // 提示
      notification.error({
        message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
      });
      return;
    }
    const payload = {
      data: [
        {
          ...headerDs.current.toJSONData(),
          changeConfirmId,
        },
      ],
      customizeUnitCode: customizeHeaderCode,
    };
    setLoading(true);
    // 校验是否需要弹窗提示
    tenantConfirmBefore(payload)
      .then(res => {
        if (getResponse(res)) {
          const { errorFlag, docmentNumList = [] } = res;
          const title = !errorFlag
            ? intl.get('sslm.enterpriseInform.view.confirm.tenantConfirmMsg').d('是否确认？')
            : intl
                .get('sslm.enterpriseInform.view.confirm.tenantConfirmBeforeMsg', {
                  docmentNumStr: (docmentNumList || []).join('、'),
                })
                .d(
                  `存在历史版本的单据【${(docmentNumList || []).join(
                    '、'
                  )}】仍在审批中，继续操作将会终止原单据的审批流程，请确认是否继续？`
                );
          Modal.confirm({
            title: intl.get('hzero.common.message.confirm.title').d('提示'),
            children: title,
            onOk: () => {
              return new Promise(resolve => {
                setLoading(true);
                tenantConfirm(payload)
                  .then(resp => {
                    if (getResponse(resp)) {
                      notification.success();
                      // 返回列表
                      handleGotoList();
                      resolve();
                    } else {
                      resolve(false);
                    }
                  })
                  .finally(() => setLoading(false));
              });
            },
          });
        }
      })
      .finally(() => setLoading(false));
  }, [headerInfo]);

  // 返回列表
  const handleGotoList = useCallback(() => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/enterprise-inform-tenant-approval-new/list',
      })
    );
  }, []);

  // 查看变更内容
  const handleViewUpdate = viewUpdateFlag => {
    // 已经激活的按钮再次点击无效果
    if (viewUpdateFlag === viewUpdate) {
      return;
    }
    handleOnlyUpdateQuery({ operateType: !viewUpdateFlag ? '' : 'MODIFY' });
  };

  // 查询变更后数据
  const handleOnlyUpdateQuery = async ({ operateType } = {}) => {
    try {
      setLoading(true);
      const panelList = getPanelList({
        isAllPlatform,
        partnerTenantId,
        readOnlyFlag: true,
        operateType,
        configNames,
        personalFlag: domesticForeignRelation === 2,
        temptConfig: templateConfig,
        changeReqId,
        cusCodeSuorce: 'approval',
        hiddenPlatformTabs: hideConfigNames,
      });
      await Promise.all(
        panelList.map(item => {
          const { dataSet } = item;
          dataSet.setState('dsState', headerInfo);
          return dataSet.query();
        })
      );
      // 查询报错不执行下边代码
      // 获取变更后激活的第一个key
      const activeKey = isEmpty(panelList) ? '' : panelList[0].key;
      setViewUpdate(!viewUpdate);
      setEnterpriseBasicPanels(panelList);
      // eslint-disable-next-line no-unused-expressions
      enterpriseBasicRef.current && enterpriseBasicRef.current.setActiveKey(activeKey);
    } finally {
      setLoading(false);
    }
  };

  const ViewUpdateBtn = () => {
    return (
      <Spin spinning={loading} wrapperClassName={styles['enterprise-info-header-center-btn']}>
        <div className={!viewUpdate ? styles.active : ''} onClick={() => handleViewUpdate(false)}>
          <span>{intl.get('sslm.enterpriseInform.button.viewAllInfo').d('展示全部内容')}</span>
        </div>
        <div className={viewUpdate ? styles.active : ''} onClick={() => handleViewUpdate(true)}>
          <span>{intl.get('sslm.enterpriseInform.button.onlyViewUpdate').d('仅展示变更内容')}</span>
        </div>
      </Spin>
    );
  };

  // 审批通过指定审批人
  const submitDesignatedProps = {
    businessKey,
    customizeCode: 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.DESIGNATED_APPROVER',
    documentCode: 'SSLM.FIRM_CHANGE_DOCUMENT',
    beforeClick: () => handleOpenApprovelModal('designated'),
    onSuccess: () => handleApproveCb('approved'),
    buttonText: intl.get('hzero.common.view.message.title.approved').d('审批通过'),
    buttonProps: {
      loading,
      icon: 'check_circle',
      color: 'primary',
    },
  };

  // 操作按钮集合
  const OperationButtons = observer(() => {
    const { approvalDataInfo = {} } = state;
    const { approvalDataMap, revokeDataMap } = approvalDataInfo || {};
    const approvalBtnProps = approvalDataMap ? approvalDataMap[businessKey] : {};
    const buttons = [
      {
        name: 'approve',
        btnComp: designatedFlag ? ApproveButton : Button,
        btnProps: {
          icon: 'check_circle',
          color: 'primary',
          hidden: !showApprovelBtn,
          onClick: () => handleOpenApprovelModal('approved'),
          loading,
          ...(designatedFlag ? submitDesignatedProps : {}),
        },
        child: intl.get('hzero.common.view.message.title.approved').d('审批通过'),
      },
      {
        name: 'reject',
        btnComp: Button,
        btnProps: {
          icon: 'cancel',
          hidden: !showApprovelBtn,
          funcType: 'flat',
          onClick: () => handleOpenApprovelModal('reject'),
          wait: 200,
          waitType: 'throttle',
          loading,
        },
        child: intl.get('hzero.common.view.message.title.reject').d('审批拒绝'),
      },
      {
        name: 'confirm',
        btnComp: Button,
        btnProps: {
          icon: 'check_circle',
          color: 'primary',
          hidden: !showConfirmBtn,
          onClick: () => handleConfirm(),
          loading,
        },
        child: intl.get('hzero.common.button.confirm').d('确认'),
      },
      {
        name: 'operationRecord',
        btnComp: Button,
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => handleOperationRecord(),
          wait: 200,
          waitType: 'throttle',
          loading,
        },
        child: intl.get('hzero.common.button.operation').d('操作记录'),
      },
      {
        name: 'approval',
        hidden: isEmpty(approvalDataMap),
        child: intl.get('hzero.common.button.approval').d('审批'),
        btnProps: {
          funcType: 'flat',
          icon: 'authorize',
          onClick: () =>
            handleApprove({
              approveProps: {
                ...approvalBtnProps,
                onSuccess: () => handleQuery(true),
              },
            }),
        },
      },
      {
        name: 'revokeApproval',
        hidden: isEmpty(revokeDataMap),
        child: intl.get('hzero.common.button.revokeApproval').d('撤销审批'),
        btnProps: {
          funcType: 'flat',
          icon: 'reply',
          onClick: () =>
            handleRevokeApprova({
              businessKey,
              onSuccess: () => handleQuery(true),
            }),
        },
      },
    ];
    return (
      <DynamicButtons
        buttons={buttons}
        maxNum={5}
        trigger="hover"
        defaultBtnType="c7n-pro"
        permissions={getBtnsPermissions(isAllPlatform)}
      />
    );
  });

  return (
    <Fragment>
      <Header
        title={getHeaderTitle(pageType)}
        backPath={hiddenBackPath ? '' : '/sslm/enterprise-inform-tenant-approval-new/list'}
      >
        <OperationButtons />
        <ViewUpdateBtn />
      </Header>
      <Alert
        banner
        showIcon
        closable
        type="info"
        iconType="help"
        message={intl
          .get('sslm.enterpriseInform.view.message.readOnlyTips')
          .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
        className={styles['enterprise-info-detail-alert-banner']}
      />
      <Content wrapperClassName={styles['enterprise-info-detail-content']}>
        <Spin spinning={loading}>
          <div className="card-content-wrap">
            <HeaderInfo
              dataSet={headerDs}
              customizeForm={customizeForm}
              custLoading={custLoading}
              isEdit={false}
              viewUpdate={viewUpdate}
              code={customizeHeaderCode}
              cuzFieldEdit={cuzFieldEdit}
            />
            <EnterpriseBasicInfo
              isAllPlatform={isAllPlatform}
              partnerTenantId={partnerTenantId}
              headerInfo={headerInfo}
              panelList={enterpriseBasicPanels}
              ref={enterpriseBasicRef}
              customizeTabPane={customizeTabPane}
              customizeForm={customizeForm}
              customizeTable={customizeTable}
              getFieldProps={getFieldProps}
              isEdit={false}
              handleFieldRender={handleFieldRender}
              viewUpdate={viewUpdate}
              tabCode={
                isAllPlatform ? '' : 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.BASIC_TABS'
              }
            />
            <Investiga
              headerInfo={headerInfo}
              changeReqId={changeReqId}
              partnerTenantId={partnerTenantId}
              investigRef={investigRef}
              getFieldProps={getFieldProps}
              isEdit={false}
              viewUpdate={viewUpdate}
              templateConfig={templateConfig}
            />
            <AttachmentInfo dataSet={headerDs} isEdit={false} viewUpdate={viewUpdate} />
          </div>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.enterpriseInform',
      'sslm.supplierInform',
      'sslm.supplierDetail',
      'hptl.portalAssign',
      'spfm.enterprise',
      'spfm.address',
      'spfm.certificationApproval',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.ENTERPRISE_TENANT_CONFIRM_DETAIL.HEADER',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.HEADER',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.REGISTRATION_OVERSEAS',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.REGISTRATION_PERSONAL',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.BUSINESS_INFO',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.CONTACT',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.ADDRESS',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.BANK',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.INVOICE',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.FINANCIAL',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.ATTA_INFO',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.CLASSIFY',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.OTHER_INFO',
      'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.APPROVAL.BASIC_TABS', // 基本信息-tab页
    ],
  })
)(Index);
