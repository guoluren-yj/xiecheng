/*
 * index.js - 供应商信息变更样式定制表单
 * @Date: 2023-09-27
 * @Author:zlh
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { useDataSet, Spin, Button } from 'choerodon-ui/pro';
import { compose, isEmpty } from 'lodash';
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Alert } from 'choerodon-ui';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { TopSection, SecondSection } from '_components/Section';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { investigationTemplateHeaderQueryAll } from '@/services/investigationService';
import { handleCompareRender, getFieldHiddenProps, renderStatus } from '@/routes/components/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';
import { getToolTipPrefix, getPanelList, getInsertTip } from './SupplierBasicInfo/utils';
import RemarkInfo from './RemarkInfo/index';
import SupplierBasicInfo from './SupplierBasicInfo';
import Investiga from './Investiga';
import styles from './index.less';
import { getBasicDS } from '../stores/getBasicDS';

const organizationId = getCurrentOrganizationId();

const Index = ({
  location,
  custLoading,
  customizeForm,
  customizeTable,
  customizeTabPane,
  customizeCommon,
  queryTemplateConfig,
}) => {
  const supplierBasicRef = useRef(null); // 供应商基础信息ref

  const [loading, setLoading] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [headerInfo, setHeaderInfo] = useState({});
  const [relTableList, setRelTableList] = useState([]);
  const [investigationTab, setInvestigationTab] = useState([]); // 调查表显示的Tabs
  const [templateConfig, setTemplateConfig] = useState([]); // 调查表Panels
  const [supplierBasicPanels, setSupplierBasicPanels] = useState([]); // 供应商基本信息Panels
  const [viewUpdate, setViewUpdate] = useState(false); // 仅展示变更内容标识
  const [operateType, setOperateType] = useState(''); // 显示变更内容类型数据：‘MODIFY’

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { changeReqId, investgHeaderId, investigateTemplateId } = routerParams;
  const isEdit = false;

  const basicDs = useDataSet(() => getBasicDS(), []);

  const [waitCustomize, setWaitCustomize] = useState(false);
  const { templateCode, templateVersion, stageCode, pageCode } = routerParams;

  const {
    configNames,
    aiApproveStatus,
    aiApproveDTOList,
    domesticForeignRelation,
    hideConfigNames: platformTabsHidden = [],
  } = headerInfo;

  // 工作流样式表单阶段编码
  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  useEffect(() => {
    if (waitCustomize) {
      handleQuery();
    }
  }, [changeReqId, waitCustomize]);

  useEffect(() => {
    // 查询配置表
    queryRelTableConfig('sslm_supplier_change_req_new').then(res => {
      setRelTableList(res);
    });
  }, []);

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
  const handleQuery = useCallback(async () => {
    setSpinning(true);
    try {
      basicDs.setQueryParameter('changeReqId', changeReqId);
      basicDs.setQueryParameter('newPageQuery', 1); // 支持返回变更页签数据
      await basicDs.query().then(async response => {
        if (response) {
          const {
            investigateTemplateId: headerInvestigateTemplateId,
            hideConfigNames = [],
          } = response;
          if (headerInvestigateTemplateId) {
            const config =
              getResponse(
                await investigationTemplateHeaderQueryAll({
                  investigateTemplateId: headerInvestigateTemplateId,
                  organizationId,
                  investgHeaderId,
                })
              ) || {};

            const { investigateConfigHeaders = [] } = config;
            const newInvestigationTab = investigateConfigHeaders.map(n => n.configName);
            setSupplierBasicPanels(
              getPanelList({
                investigationTab: newInvestigationTab,
                domesticForeignRelation,
                platformTabsHidden: hideConfigNames,
              })
            );
            setInvestigationTab(newInvestigationTab);
            setTemplateConfig(config);
          } else {
            setSupplierBasicPanels(
              getPanelList({ domesticForeignRelation, platformTabsHidden: hideConfigNames })
            );
          }
          setHeaderInfo({ ...response, defaultBankCompanyName: response.supplierCompanyName });
        }
      });
      await Promise.all([supplierBasicRef.current && supplierBasicRef.current.handleQuery()]);
    } finally {
      setSpinning(false);
    }
  }, [changeReqId, supplierBasicRef.current, supplierBasicPanels]);

  // 标准页签，字段显示旧版本信息tooptip渲染
  const handleFieldRender = useCallback(({ value, record, name, type, displayField } = {}) => {
    return record
      ? handleCompareRender({
          value,
          record,
          name,
          type,
          displayField,
          toolTipPrefix: getToolTipPrefix(),
          showInsert: true,
          showInsertTip: getInsertTip(),
        })
      : handleCompareRender;
  }, []);

  // 处理标准页签表单，仅显示仅变更数据隐藏字段
  const handleFieldProp = useCallback(
    ({ currentRecord, fileName, hidden } = {}) => {
      const hiddenProps = viewUpdate
        ? getFieldHiddenProps({ record: currentRecord, name: fileName, hidden })
        : {
            hidden,
          };
      return hiddenProps;
    },
    [viewUpdate]
  );

  // 处理调查表只读页面字段属性
  const getFieldProps = useCallback(
    ({ currentRecord, fieldName, type, displayField, fieldValue, hidden } = {}) => {
      // 处理hidden
      const hiddenProps = viewUpdate
        ? getFieldHiddenProps({ record: currentRecord, name: fieldName, hidden })
        : {
            hidden,
          };
      return {
        renderer: ({ value, record, name, type: fieldType, displayField: fieldDisplayField }) =>
          handleCompareRender({
            value: fieldValue || value,
            record,
            name: fieldName || name,
            type: fieldType || type,
            displayField: fieldDisplayField || displayField,
            toolTipPrefix: getToolTipPrefix(),
          }),
        ...hiddenProps,
      };
    },
    [viewUpdate]
  );

  // 操作记录回调
  const handleOperationRecord = useCallback(() => {
    operationRecordsModal({
      changeReqId,
      documentId: changeReqId,
      documentType: 'SUPPLIER_INFO_CHANGE',
    });
  }, [changeReqId]);

  // 组件属性
  const commonProps = {
    domesticForeignRelation,
    viewUpdate,
    operateType,
    isEdit,
    headerInfo,
    changeReqId,
    custLoading,
    customizeForm,
    customizeTable,
    customizeTabPane,
    setLoading,
    relTableList,
  };
  const componentProps = {
    remark: {
      ...commonProps,
      remarkDs: basicDs,
    },
    supplierBasic: {
      ...commonProps,
      investigationTab,
      ref: supplierBasicRef,
      panelList: supplierBasicPanels,
      wfParams,
      handleFieldRender,
      handleFieldProp,
    },
    investigation: {
      ...commonProps,
      investgHeaderId,
      investigateTemplateId,
      templateConfig,
      getFieldProps,
    },
  };

  // 查看变更内容
  const handleViewUpdate = useCallback(() => {
    const curOperateType = viewUpdate ? '' : 'MODIFY';
    setViewUpdate(!viewUpdate);
    setOperateType(curOperateType);
    handleOnlyUpdateQuery({ curOperateType });
  }, [viewUpdate, configNames]);

  // 查询变更后数据
  const handleOnlyUpdateQuery = useCallback(
    async ({ curOperateType }) => {
      try {
        setSpinning(true);
        const panelList = getPanelList({
          operateType: curOperateType,
          configNames,
          domesticForeignRelation,
          investigationTab,
          platformTabsHidden,
        });
        // 获取变更后激活的第一个key
        const activeKey = isEmpty(panelList) ? '' : panelList[0].key;
        setSupplierBasicPanels(panelList);
        // eslint-disable-next-line no-unused-expressions
        supplierBasicRef.current && supplierBasicRef.current.setActiveKey(activeKey);
        // eslint-disable-next-line no-unused-expressions
        supplierBasicRef.current && supplierBasicRef.current.handleQuery(activeKey, curOperateType);
      } finally {
        setSpinning(false);
      }
    },
    [viewUpdate, configNames]
  );

  const getAFBasicFieldsConfig = () => {
    return {
      changeReqNumber: {
        render: ({ record }) => {
          const { supplierCompanyName, changeReqNumber } =
            (record && record.get(['supplierCompanyName', 'changeReqNumber'])) || {};
          const type = intl
            .get('sslm.supplierInform.view.title.changeSupplier')
            .d('供应商信息变更');
          return `【${supplierCompanyName}】 ${type}-${changeReqNumber}`;
        },
      },
      aiApproveStatusMeaning: {
        render: params => {
          return aiApproveStatus ? (
            <span className={styles['ai-approve-status']}>
              {renderStatus({ ...params, IconComp: IntelligentReviewIcon })}
            </span>
          ) : (
            '-'
          );
        },
      },
    };
  };

  const ViewUpdateBtn = () => {
    return (
      <div className={styles['work-flow-right-update-btn']}>
        <div className={!viewUpdate ? styles.active : ''} onClick={() => handleViewUpdate(false)}>
          <span>
            {intl.get('sslm.enterpriseInform.button.viewCompleteInfo').d('展示变更后单据')}
          </span>
        </div>
        <div className={viewUpdate ? styles.active : ''} onClick={() => handleViewUpdate(true)}>
          <span>
            {intl.get('sslm.enterpriseInform.button.onlyViewUpdateInfo').d('仅展示变更项')}
          </span>
        </div>
      </div>
    );
  };

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
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
  };

  const tagFields = aiApproveStatus
    ? ['changeLevelMeaning', 'aiApproveStatusMeaning']
    : ['changeLevelMeaning'];
  return waitCustomize ? (
    <Spin spinning={waitCustomize} />
  ) : (
    <Spin spinning={spinning || loading}>
      <div className={styles['workflow-extra']}>
        <Content wrapperClassName={styles['workflow-wrap']}>
          <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
          <Alert
            banner
            showIcon
            closable
            type="info"
            iconType="help"
            message={intl
              .get('sslm.enterpriseInform.view.message.readOnlyTips')
              .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
            className={styles['workflow-alert-banner']}
          />
          {customizeCommon(
            {
              code: 'SSLM.SUPPLIER_INFORM_CHANGE_CUSTOM.BASIC',
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={basicDs}
              titleField="changeReqNumber"
              normalFields={['createUserRealName', 'creationDate']}
              tagFields={tagFields}
              contentRemainWidth="130px"
              contentBottomRender={contentBottomRender}
              fieldsConfig={getAFBasicFieldsConfig()}
            />
          )}
          <TopSection>
            <SecondSection>
              <RemarkInfo commonProps={componentProps.remark} />
            </SecondSection>

            <SecondSection className={styles.supplierEntryCard}>
              <SupplierBasicInfo commonProps={componentProps.supplierBasic} />
            </SecondSection>
            {investigateTemplateId && (
              <SecondSection className={styles.supplierEntryCard}>
                <Investiga commonProps={componentProps.investigation} />
              </SecondSection>
            )}
          </TopSection>
        </Content>
      </div>
    </Spin>
  );
};

export default compose(
  WithCustomize({ isTemplate: true }),
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
    ],
  })
)(Index);
