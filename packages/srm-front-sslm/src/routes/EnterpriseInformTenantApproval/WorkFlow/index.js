/*
 * Detail - 企业信息变更审批-工作流表单
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { useDataSet, Spin, Button } from 'choerodon-ui/pro';
import { compose, isEmpty } from 'lodash';
import { Alert } from 'choerodon-ui';
import React, { Fragment, useState, useCallback, useMemo, useEffect, useRef } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import { Content } from 'components/Page';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { AFBasic } from '_components/AFCards';
import formatterCollections from 'utils/intl/formatterCollections';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse } from 'utils/utils';

import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { useSetState } from '@/routes/components/utils';
import { getRenderFieldProps } from '@/routes/EnterpriseInformNew/utils';
import EnterpriseBasicInfo from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo';
import AttachmentInfo from '@/routes/EnterpriseInformNew/Detail/AttachmentInfo';
import Investiga from '@/routes/EnterpriseInformNew/Detail/Investiga';
import { getHeaderDS } from '@/routes/EnterpriseInformNew/stores/getHeaderDS';
import { getPanelList } from '@/routes/EnterpriseInformNew/Detail/EnterpriseBasicInfo/utils/getPanel';
import { queryInfoChangeApprovalDetail } from '@/services/enterpriseInformService';
import styles from '@/routes/EnterpriseInformNew/styles.less';

import ExtraCard from './ExtraCard';
import wfStyles from './styles.less';

const Index = ({
  remote,
  onLoad,
  location,
  onFormLoaded,
  customizeForm,
  customizeTable,
  customizeTabPane,
  match: {
    params: { changeConfirmId },
  },
  queryTemplateConfig,
  customizeCommon,
}) => {
  const enterpriseBasicRef = useRef(null); // 企业基础信息ref
  const investigRef = useRef(null); // 调查表信息ref

  const [loading, setLoading] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [enterpriseBasicPanels, setEnterpriseBasicPanels] = useState([]);
  const [viewUpdate, setViewUpdate] = useState(false);
  const [state, setState] = useSetState({
    templateConfig: {}, // 模版配置
  });
  const { templateConfig } = state;

  const { configNames, domesticForeignRelation, hideConfigNames } = headerInfo;
  const [waitCustomize, setWaitCustomize] = useState(false);
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const {
    changeReqId,
    partnerTenantId,
    pageType,
    templateCode,
    templateVersion,
    stageCode,
    pageCode,
  } = routerParams;
  const isAllPlatform = useMemo(() => pageType === 'confirm', [pageType]);

  const headerDsProps = remote.process(
    'SSLM_ENTERPRISE_INFORM_TENANT_APPROVAL_WORKFLOW_HEADER_DS_PROPS',
    getHeaderDS({ partnerTenantId, pageSource: 'approval' }),
    { location }
  );
  const headerDs = useDataSet(() => headerDsProps, []);

  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  useEffect(() => {
    remote.event.fireEvent('cuxInit', {
      onLoad,
      location,
      headerDs,
    });
  }, []);

  useEffect(() => {
    if (waitCustomize) {
      handleQuery();
    }
  }, [waitCustomize, changeReqId]);

  useEffect(() => {
    setWaitCustomize(true);
    const templateInfoPromise = new Promise(resolve => {
      resolve({
        templateCode,
        templateVersion,
      });
    });
    queryTemplateConfig(templateInfoPromise, {
      stageCode,
      pageCode,
    }).then(() => {
      setWaitCustomize(false);
    });
  }, [templateCode, templateVersion, stageCode, pageCode]);

  // 处理查询
  const handleQuery = useCallback(
    async ({ investigQueryFlag = false } = {}) => {
      try {
        setLoading(true);
        headerDs.setQueryParameter('queryParmas', {
          changeReqId,
          newPageQuery: 1,
          ...wfParams,
        });
        let personalFlag = false;
        let hiddenPlatformTabs = [];
        const result = await Promise.all([headerDs.query(), queryConfig()]);
        const [headerResp, investgConfig] = result;
        if (getResponse(headerResp)) {
          setHeaderInfo(headerResp);
          const {
            domesticForeignRelation: newDomesticForeignRelation,
            hideConfigNames: hideNames = [],
          } = headerResp;
          personalFlag = newDomesticForeignRelation === 2;
          hiddenPlatformTabs = hideNames;
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
            cusCodeSuorce: 'workFlow',
            hiddenPlatformTabs,
          })
        );
        await Promise.all([
          enterpriseBasicRef.current && enterpriseBasicRef.current.handleQuery(),
          investigQueryFlag && investigRef.current && investigRef.current.handleQuery(), // 仅按钮回调查询调查表页签，初始化无需查询
        ]);
      } finally {
        setLoading(false);
        remote.event.fireEvent('cuxQueryAfter', {
          onLoad,
          location,
          headerDs,
          onFormLoaded,
        });
      }
    },
    [changeReqId]
  );

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

  // 查看变更内容
  const handleViewUpdate = (viewUpdateFlag = false) => {
    if (viewUpdateFlag !== viewUpdate) {
      return handleOnlyUpdateQuery({ operateType: viewUpdate ? '' : 'MODIFY', viewUpdateFlag });
    }
  };

  // 查询变更后数据
  const handleOnlyUpdateQuery = async ({ operateType, viewUpdateFlag } = {}) => {
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
        cusCodeSuorce: 'workFlow',
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
      setViewUpdate(viewUpdateFlag);
      setEnterpriseBasicPanels(panelList);
      // eslint-disable-next-line no-unused-expressions
      enterpriseBasicRef.current && enterpriseBasicRef.current.setActiveKey(activeKey);
    } finally {
      setLoading(false);
    }
  };

  const ViewUpdateBtn = () => {
    return (
      <div className={wfStyles['enterprise-info-work-flow-right-btn']}>
        <div className={!viewUpdate ? wfStyles.active : ''} onClick={() => handleViewUpdate(false)}>
          <span>
            {intl.get('sslm.enterpriseInform.button.viewCompleteInfo').d('展示变更后单据')}
          </span>
        </div>
        <div className={viewUpdate ? wfStyles.active : ''} onClick={() => handleViewUpdate(true)}>
          <span>
            {intl.get('sslm.enterpriseInform.button.onlyViewUpdateInfo').d('仅展示变更项')}
          </span>
        </div>
      </div>
    );
  };

  // 操作按钮集合
  const contentBottomRender = useCallback(() => {
    const buttons = [
      {
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
        btnComp: ViewUpdateBtn,
      },
    ];
    return <DynamicButtons buttons={buttons} />;
  }, [viewUpdate, loading]);

  return (
    <Fragment>
      {waitCustomize ? (
        <Spin spinning={waitCustomize} />
      ) : (
        <Spin spinning={loading} wrapperClassName={wfStyles['enterprise-info-work-flow']}>
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
          {customizeCommon(
            {
              code: isAllPlatform
                ? 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.PLATFORM_BASICS'
                : 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.BASICS',
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={headerDs}
              titleField="documentTitle"
              tagFields={isAllPlatform ? [] : ['changeLevelMeaning']}
              normalFields={['createUserRealName', 'creationDate']}
              contentBottomRender={contentBottomRender}
              fieldsConfig={{
                documentTitle: {
                  render: ({ record }) => {
                    const { companyName, changeReqNumber, changeLevel } = record.get([
                      'companyName',
                      'changeReqNumber',
                      'changeLevel',
                    ]);
                    const type =
                      changeLevel === 'PLATFORM'
                        ? intl
                            .get('sslm.enterpriseInform.view.title.confirmApplication')
                            .d('企业信息变更确认')
                        : intl
                            .get('sslm.enterpriseInform.view.title.changeApplication')
                            .d('企业信息变更');
                    return `【${companyName}】${type}—${changeReqNumber}`;
                  },
                },
              }}
            />
          )}
          <Content wrapperClassName={styles['enterprise-info-detail-content']}>
            <div className="card-content-wrap">
              <ExtraCard dataSet={headerDs} remote={remote} location={location} />
              <EnterpriseBasicInfo
                isAllPlatform={isAllPlatform}
                partnerTenantId={partnerTenantId}
                headerInfo={headerInfo}
                wfParams={wfParams}
                panelList={enterpriseBasicPanels}
                ref={enterpriseBasicRef}
                customizeTabPane={customizeTabPane}
                customizeForm={customizeForm}
                customizeTable={customizeTable}
                getFieldProps={getFieldProps}
                isEdit={false}
                handleFieldRender={handleFieldRender}
                tabCode={
                  isAllPlatform ? '' : 'SSLM.ENTERPRISE_TENANT_APPROVAL_DETAIL.WF.BASIC_TABS'
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
          </Content>
        </Spin>
      )}
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
  remotes(
    {
      code: 'SSLM_ENTERPRISE_INFORM_TENANT_APPROVAL_WORKFLOW',
      name: 'remote',
    },
    {
      events: {
        cuxInit: () => {}, // 二开初始化
        cuxQueryAfter: () => {}, // 二开查询后
      },
    }
  ),
  withCustomize({
    isTemplate: true,
  })
)(Index);
