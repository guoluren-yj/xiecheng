/**
 * index.js - 供应商录入样式定制表单
 * @date: 2023-09-18
 * @author: zlh
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { compose, forEach, isEmpty, isFunction, isArray } from 'lodash';
import { Spin } from 'choerodon-ui';
import { useDataSet, DataSet, Modal } from 'choerodon-ui/pro';
import querystring from 'querystring';
import React, { useState, useMemo, useEffect, useCallback } from 'react';

import { getResponse, getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { operationRecordsModal } from '@/routes/components/OperationRecords';
import { RiskProfile, openRelationChart } from '@/routes/components/EnterpriseRelationSearch';
import { AFBasic } from '_components/AFCards';
import DynamicButtons from '_components/DynamicButtons';
import { TopSection, SecondSection } from '_components/Section';
import {
  batchExtractDataSetData,
  batchInitDataSetByPlainData,
  batchSetDataSetByPlainData,
} from '_utils/workflow';

import { enterpriseTagsConfig, fetchApproveStatus } from '@/services/commonService';
import { handleJoinedMointor } from '@/routes/components/utils/utils';
import {
  queryCurrentUserPurchaseAgent,
  fetchPartnerShip,
  saveCooperativeInfo,
  fetchAiApproveData,
} from '@/services/supplierEntryService';
import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { fetchUserDetail } from '@/services/enterpriseCertificationService';
import { investigationTemplateHeaderQueryAll } from '@/services/investigationService';
import { dealConfigData } from '@/routes/components/Investigation/utils';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { getInvestigationDS } from '@/routes/components/Investigation/stores/getInvestigationDS';
import EnterpriseBasicInfo from './EnterpriseBasicInfo';
import InvitationInfo from './InvitationInfo';
import InvestigationInfo from './InvestigationInfo';
import Attachment from './Attachment';
import RemarkInfo from './RemarkInfo';
import Supplement from './Supplement';

import {
  getEntryBaseInfoDs, // 录入单基础信息Ds
  getCompanyBaseInfoDs, // 企业基本信息Ds
  getBusinessInfoDs, // 业务信息Ds
  getContactDS, // 联系人信息Ds
  getAddressInfoDS, // 地址信息Ds
  getBankInfoDS, // 银行信息Ds
  getInvoiceDS, // 开票信息Ds
  getFinanceDS, // 财务信息Ds
  getAttachmentDS, // 附件信息Ds
  getInvitationInfoDs, // 邀约信息Ds
  getOtherInfoDs, // 其它信息Ds
  getPurchaseHeaderDS, // 采购财务头
  getPurchaseLineDS, // 采购财务行
} from '../stores';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();
const sourceKey = 'SUPPLIER_ENTRY_WORKFLOW';
const language = getCurrentLanguage();
const isChinese = language === 'zh_CN'; // 中文语言环境

// 调查表重合页签
const duplicateList = [
  'sslmInvestgContact',
  'sslmInvestgAddress',
  'sslmInvestgBankAccount',
  'sslmInvestgFin',
  'sslmInvestgAttachment',
];

const saveUnitCode = [
  'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.INVITATION_INFO',
  'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.OTHER_FORM',
];

const pageCode = 'SUPPLIER_ENTRY_APPROVAL_DETAILS';

const SupplierEntryDetail = props => {
  const {
    onLoad,
    location,
    custLoading,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    match: {
      params: { changeReqId, editStatus },
    },
    custConfig = {},
    queryTemplateConfig,
    customizeCommon,
    customizeTabPane,
    getHocInstance = () => {},
  } = props;
  const [companyBaseInfo, setCompanyBaseInfo] = useState({});
  const [entryBaseInfo, setEntryBaseInfo] = useState({});
  const [purchaseSelectedRows, setPurchaseSelectedRows] = useState([]);
  const [showSurveyFlag, setShowSurveyFlag] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  const [showTagsFlag, setShowTagsFlag] = useState(true);
  const [disabledObj, setDisabledObj] = useState({
    filterCompanyLovFlag: false, // 部分合作新建关系 合作信息节点需过滤已合作的子公司
    invoiceInitFlag: 1, // 开票信息可编辑且需把录单头部分信息更新至开票信息
    allDisabled: false, // 所有供应商主数据不可编辑, 且合作信息页签不展示
  }); // 带出已认证的某些页签不让编辑
  // 平台展示页签集合
  const [configNameList, setConfigNameList] = useState([]);
  const [allLoading, setAllLoading] = useState(false);
  const [waitCustomize, setWaitCustomize] = useState(false);
  const [aiApproveDTOList, setAiApproveDTOList] = useState([]);
  const [aiApproveStatus, setAiApproveStatus] = useState(null);

  // 处理调查表重合页签
  const [notDuplicateConfigList, setNotDuplicateConfigList] = useState([]); // 不重合调查表页签
  const [duplicateConfigList, setDuplicateConfigList] = useState([]); // 重合的调查表页签
  const [templateDsList, setTemplateDsList] = useState([]); // 模版ds

  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { templateCode, templateVersion, stageCode } = routerParams;

  const { allDisabled = false, filterCompanyLovFlag = false } = disabledObj;

  const { domesticForeignRelation = 1, companyName, zhimaLabels } = companyBaseInfo;

  const wfParams = {
    cuszTplStageCode: stageCode,
    cuszTplPageCode: pageCode,
    cuszTplTemplateCode: templateCode,
    cuszTplVersion: templateVersion,
  };

  const entryBaseInfoDs = useDataSet(() => getEntryBaseInfoDs({ changeReqId }), []);
  const companyBaseInfoDs = useDataSet(() => getCompanyBaseInfoDs({ changeReqId }), []);
  const businessInfoDs = useDataSet(() => getBusinessInfoDs({ changeReqId }), []);
  const contactPersonDs = useDataSet(() => getContactDS({ changeReqId }), []);
  const addressInfoDS = useDataSet(() => getAddressInfoDS({ changeReqId }), []);
  const bankInfoDS = useDataSet(() => getBankInfoDS({ changeReqId }), []);
  const invoiceDS = useDataSet(() => getInvoiceDS({ changeReqId, domesticForeignRelation }), []);
  const financeDS = useDataSet(() => getFinanceDS({ changeReqId }), []);
  const purchaseHeaderDS = useDataSet(() => getPurchaseHeaderDS({ changeReqId }), [changeReqId]);
  const purchaseLineDS = useDataSet(() => getPurchaseLineDS({ changeReqId }), [changeReqId]);
  const attachmentDS = useDataSet(() => getAttachmentDS({ changeReqId }), []);
  const invitationInfoDs = useDataSet(
    () => getInvitationInfoDs({ changeReqId, upstageFlag: companyBaseInfo.upstageFlag }),
    []
  );
  const otherInfoDs = useDataSet(() => getOtherInfoDs({ changeReqId }), []);

  const commonProps = {
    changeReqId,
    domesticForeignRelation,
    entryBaseInfo,
    entryBaseInfoDs,
    companyBaseInfo,
    companyBaseInfoDs,
    customizeForm,
    customizeTable,
    customizeTabPane,
    custLoading,
  };
  const tabProps = {
    // 企业信息
    enterpriseBasic: {
      ...commonProps,
      businessInfoDs,
      contactPersonDs,
      addressInfoDS,
      bankInfoDS,
      invoiceDS,
      financeDS,
      attachmentDS,
      otherInfoDs,
      disabledObj,
      purchaseHeaderDS,
      purchaseLineDS,
      configNameList,
      templateDsList,
      duplicateConfigList,
    },
    // 邀请信息
    invitation: {
      ...commonProps,
      invitationInfoDs,
      purchaseSelectedRows,
      filterCompanyLovFlag,
    },
    // 调查表
    investigation: {
      ...commonProps,
      userInfo,
    },
  };

  // 取个性化隐藏页签配置，隐藏的页签ds不校验
  const tabCustCode = custConfig['SSLM.SUPPLIER_ENTRY_DETAIL.SECONDARY_INFO_CARDS'] || {};
  const { fields = [] } = tabCustCode || {};
  const custHiddenTabs = fields.filter(item => item.visible === 0).map(item => item.fieldCode);

  // 采购方是否展示企业标签
  const handleTagsConfig = () => {
    enterpriseTagsConfig({ menuNum: '2' }).then(response => {
      const res = getResponse(response);
      if (res === 0) {
        setShowTagsFlag(false);
      }
    });
  };

  // 查询智能审核相关数据
  const handleAiApproveData = () => {
    fetchAiApproveData({
      documentType: 'ENTERING',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        setAiApproveDTOList(res);
      }
    });
    fetchApproveStatus({
      documentType: 'ENTERING',
      documentId: changeReqId,
    }).then(res => {
      if (getResponse(res)) {
        setAiApproveStatus(res.status);
      }
    });
  };

  useEffect(() => {
    if (waitCustomize) {
      setAllLoading(true);
      // 查询合作伙伴关系标识
      handleQueryPartnerShip();

      // 查询企业基本信息供其它地方使用
      companyBaseInfoDs.query().then(res => {
        if (getResponse(res)) {
          setCompanyBaseInfo(res);
        }
      });

      // 查询录入单信头息供其它地方使用
      entryBaseInfoDs.query().then(res => {
        if (getResponse(res)) {
          const { configNameList: tabNameList = [] } = res;
          // 标准展示的页签，个性化配置隐藏也需隐藏
          const showTabs = (tabNameList || []).filter(item => !custHiddenTabs.includes(item));
          setConfigNameList(showTabs || []);
          setEntryBaseInfo(res);
        }
      });
      // 查询当前登陆人对应的采购员
      queryCurrentUserPurchaseAgent().then(res => {
        if (res) {
          setPurchaseSelectedRows(res);
        }
      });
      handleUserInfo();
      invitationInfoDs.query().then(res => {
        const result = getResponse(res);
        if (result) {
          const { investigateTemplateId, investgHeaderId } = result;
          if (editStatus === 'view') {
            entryBaseInfoDs.setState('investgateObj', { investgHeaderId, investigateTemplateId });
          }
          // 以后端的调查表头id来判断是否展示调查表节点
          setShowSurveyFlag(!!investgHeaderId);
          // 存在调查表时，需要将调查表页签上移到标准页签
          if (investgHeaderId) {
            investigationTemplateHeaderQueryAll({
              investigateTemplateId,
              organizationId,
              investgHeaderId,
            }).then(investigateRes => {
              if (getResponse(investigateRes)) {
                const { configList = [] } = dealConfigData(investigateRes) || {};
                let curDuplicateConfigList = [];
                let curNotDuplicateConfigList = [];
                // 过滤出重合页签
                curDuplicateConfigList = (configList || []).filter(item =>
                  duplicateList.includes(item.configName)
                );
                // 过滤出不重合的
                curNotDuplicateConfigList = (configList || []).filter(
                  item => !duplicateList.includes(item.configName)
                );
                handelTemplateDs(curDuplicateConfigList, investgHeaderId);
                setNotDuplicateConfigList(curNotDuplicateConfigList);
                setDuplicateConfigList(curDuplicateConfigList);
              }
            });
          }
        }
      });
      setAllLoading(false);
    }
  }, [changeReqId, waitCustomize]);

  useEffect(() => {
    setWaitCustomize(true);
    setWflCode();
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

  // 获取需保存的参数
  const getSaveParams = () => {
    const supChangeOther = otherInfoDs?.current?.toJSONData() || {};
    const {
      categoryIds,
      itemCategoryIds,
      purchaseAgentIds,
      companyId,
      companyNum,
      companyName: curCompanyName,
      ...others
    } = invitationInfoDs?.current?.toJSONData() || {};
    const params = {
      changeReqId,
      wfParams,
      supChangeOther,
      customizeUnitCode: saveUnitCode.join(','),
      firmEnteringParent: {
        ...others,
        categoryIds: isArray(categoryIds)
          ? categoryIds.map(({ categoryId }) => categoryId).join(',')
          : categoryIds && categoryIds.categoryId,
        companyIds: typeof curCompanyName === 'object' ? companyId.join(',') : companyId,
        companyId: typeof curCompanyName === 'object' ? companyId[0] : companyId,
        companyName: typeof curCompanyName === 'object' ? curCompanyName.join(',') : curCompanyName,
        companyNum: typeof companyNum === 'object' ? companyNum.join(',') : companyNum,
        itemCategoryIds: itemCategoryIds.map(({ categoryId }) => categoryId).join(','),
        purchaseAgentIds: purchaseAgentIds.map(({ purchaseAgentId }) => purchaseAgentId).join(','),
      },
    };
    return params;
  };

  const workflowSubmit = approveResult => {
    return new Promise((resolve, reject) => {
      if (approveResult === 'Approved') {
        const payload = getSaveParams();
        saveCooperativeInfo(payload).then(response => {
          const res = getResponse(response);
          if (res) {
            resolve(res);
          } else {
            reject();
          }
        });
      } else {
        resolve();
      }
    });
  };

  useEffect(() => {
    handleTagsConfig();
    handleAiApproveData();
    if (isFunction(onLoad)) {
      onLoad({
        submit: workflowSubmit,
      });
    }
  }, []);

  // 赋值表单样式编码
  const setWflCode = useCallback(() => {
    entryBaseInfoDs.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.ENTRY_BASIC_INFO',
    });
    companyBaseInfoDs.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: [
        'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BASIC_INFO_DOMESTIC',
        'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BASIC_INFO_OVERSEAS',
        'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BASIC_INFO_LICENSE',
      ].join(),
    });
    businessInfoDs.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BUSINESS_INFO',
    });
    contactPersonDs.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.CONTACT_INFO',
    });
    addressInfoDS.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.ENTRY_ADDRESS_INFO',
    });
    bankInfoDS.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.BANK_INFO',
    });
    invoiceDS.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.INVOICE_FORM',
    });
    attachmentDS.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.ATTACHMENT_INFO',
    });
    invitationInfoDs.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.INVITATION_INFO',
    });
    otherInfoDs.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.OTHER_FORM',
    });
    purchaseHeaderDS.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.PURCHASE_HEAD',
    });
    purchaseLineDS.setQueryParameter('queryParams', {
      ...wfParams,
      customizeUnitCode: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.PURCHASE_LINE',
    });
  }, []);

  const handleQueryPartnerShip = () => {
    const payload = {
      changeReqId,
      dataSource: 3,
    };
    fetchPartnerShip(payload).then(res => {
      if (getResponse(res)) {
        const { partnerType } = res;
        // NONE_PARTNER 完全未合作  ALL_PARTNER 完全合作 PART_PARTNER_NEW 部分合作新建关系 PART_PARTNER_NO 部分合作不新建关系
        // 完全合作，部分合作选不新增关系不可编公司平台所有信息
        const allDisabledFlag = ['ALL_PARTNER', 'PART_PARTNER_NO'].includes(partnerType);
        const invoiceEditFlag = !allDisabled; // 开票信息可编辑且需把录单头部分信息更新至开票信息
        // 部分合作新建关系 合作信息节点需过滤已合作的子公司
        const filterCompanyLov = ['PART_PARTNER_NEW'].includes(partnerType);
        setDisabledObj({
          invoiceInitFlag: invoiceEditFlag ? 1 : 0,
          filterCompanyLovFlag: filterCompanyLov,
          allDisabled: allDisabledFlag,
        });
      }
    });
  };

  // 根据配置生成DataSet
  const handleDataSet = (config, investgHeaderId) => {
    const { configName } = config;
    if (configName) {
      const dataSet = new DataSet(getInvestigationDS({ config }));
      dataSet.setQueryParameter('queryParam', {
        investgHeaderId,
        tenantId: organizationId,
      });
      dataSet.query();
      return { dataSet };
    }
  };

  // 生成调查表模版ds
  const handelTemplateDs = (config, investgHeaderId) => {
    const dsList = {};
    forEach(config, item => {
      const { configName } = item;
      const { dataSet } = handleDataSet(item, investgHeaderId) || {};
      dsList[configName] = dataSet;
    });
    setTemplateDsList(dsList);
  };

  // 查询当前用户信息
  const handleUserInfo = useCallback(() => {
    fetchUserDetail().then(res => {
      if (getResponse(res)) {
        setUserInfo(res);
      }
    });
  }, []);

  // 信息补录弹框
  const handleSupplement = async () => {
    const supplementInvitDs = new DataSet(invitationInfoDs.props);
    const supplementOtherDs = new DataSet(otherInfoDs.props);
    // 提取当前页面ds的数据
    const externalFromData = await batchExtractDataSetData([invitationInfoDs, otherInfoDs]);
    // 用提取的数据初始化内部表单ds，并返回初始化前后record.id的对应关系
    const mappings = batchInitDataSetByPlainData(externalFromData, [
      supplementInvitDs,
      supplementOtherDs,
    ]);
    // 将初始化后的record.id与当前页面ds中record的对应关系转成map结构
    const initMappings = [new Map(), new Map()];
    mappings.forEach((mapping, mappingIndex) => {
      mapping.forEach(([fromRecordId, targetRecordId]) => {
        initMappings[mappingIndex].set(targetRecordId, fromRecordId);
      });
    });
    Modal.open({
      drawer: true,
      key: Modal.key(),
      style: { width: 1090 },
      title: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
      children: (
        <Supplement
          wfParams={wfParams}
          stageCode={stageCode}
          templateCode={templateCode}
          custLoading={custLoading}
          customizeForm={customizeForm}
          templateVersion={templateVersion}
          supplementInvitDs={supplementInvitDs}
          supplementOtherDs={supplementOtherDs}
          purchaseSelectedRows={purchaseSelectedRows}
          pageCode="SUPPLIER_ENTRY_APPROVAL_SUPPLEMENT"
        />
      ),
      onOk: async () => {
        const validatorFlag =
          (await supplementInvitDs.validate()) && (await supplementOtherDs.validate());
        if (validatorFlag) {
          // 提取内部表单ds的数据
          const fromData = await batchExtractDataSetData([supplementInvitDs, supplementOtherDs]);
          // 将所提取数据中的来源recordId按照记录的对应关系，替换成当前页面ds的recordId，并过滤掉对应关系不存在的数据
          const dataList = [];
          fromData.forEach((item, index) => {
            const mappingData = item.data
              .filter(r => initMappings[index].has(r[0]))
              .map(r => [initMappings[index].get(r[0]), r[1]]);
            dataList.push({ data: mappingData });
          });
          // 使用替换后的提取数据设置当前页面ds
          batchSetDataSetByPlainData(dataList, [[invitationInfoDs], [otherInfoDs]]);
        } else {
          return false;
        }
      },
    });
  };

  // AFBasic组件底部按钮渲染
  const contentBottomRender = () => {
    const params = { documentId: changeReqId, documentType: 'SUPPLIER_ENTRY', changeReqId };
    const buttons = [
      !allDisabled && {
        name: 'infoSupplement',
        child: intl.get('sslm.common.model.field.infoSupplement').d('信息补录'),
        btnProps: {
          icon: 'mode_edit',
          color: 'primary',
          onClick: () => handleSupplement(),
        },
      },
      {
        name: 'operation',
        child: intl.get('sslm.supplierEntryDetail.button.options.operationRecord').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          onClick: () => operationRecordsModal(params),
        },
      },
      {
        name: 'riskScan',
        hidden: domesticForeignRelation !== 1,
        child: intl.get('sslm.common.view.button.isScan').d('风险扫描'),
        btnProps: {
          icon: 'document_scanner-o',
          funcType: 'flat',
          onClick: () =>
            handleJoinedMointor({
              setLoading: setAllLoading,
              companyName,
              documentId: changeReqId,
              documentType: 'ENTERING',
            }),
        },
      },
      {
        name: 'relationSearch',
        child: intl.get('sslm.common.view.common.relationSearch').d('关系排查'),
        btnProps: {
          icon: 'relate',
          funcType: 'flat',
          onClick: () =>
            openRelationChart({ supplierCompanyName: companyName, businessType: 'SUPPLIER_ENTRY' }),
        },
      },
    ]
      .filter(Boolean)
      .map(btn => ({
        ...btn,
        btnProps: { ...btn.btnProps, wait: 500, waitType: 'throttle', loading: allLoading },
      }));
    return customizeBtnGroup(
      {
        code: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.HEADER_BTNS',
        pro: true,
      },
      <DynamicButtons trigger="hover" defaultBtnType="c7n-pro" buttons={buttons} />
    );
  };

  const getAFBasicFieldsConfig = () => {
    return {
      changeReqNumber: {
        render: ({ record }) => {
          const { partnerCompanyName } = (record && record.get(['partnerCompanyName'])) || {};
          const type = intl
            .get('sslm.supplierEntryDetail.view.title.approvalRegistration')
            .d('代注册审批');
          return `${partnerCompanyName}${type}`;
        },
      },
    };
  };

  const tagShowFlag = showTagsFlag && !isEmpty(zhimaLabels) && isChinese;

  return waitCustomize ? (
    <Spin spinning={waitCustomize} />
  ) : (
    <Spin spinning={allLoading}>
      <div className={styles.workflow}>
        <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        <div className={styles['workflow-extra']}>
          {customizeCommon(
            {
              code: 'SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.DOCUMENT_CUSTOM.BASICS',
              processUnitTag: 'AF-BASIC',
            },
            <AFBasic
              dataSet={entryBaseInfoDs}
              titleField="changeReqNumber"
              normalFields={['createUserName', 'departmentName', 'creationDate']}
              contentRemainWidth="130px"
              contentBottomRender={contentBottomRender}
              fieldsConfig={getAFBasicFieldsConfig()}
            />
          )}
        </div>
        <Content wrapperClassName={styles['workflow-wrap']}>
          <TopSection
            code="SSLM.SUPPLIER_ENTRY_DETAIL_CUSTOM.CARDS"
            getHocInstance={getHocInstance}
          >
            <SecondSection code="remark">
              <RemarkInfo commonProps={commonProps} />
            </SecondSection>
            <SecondSection code="riskProfile">
              <RiskProfile params={{ companyName, organizationId }} />
            </SecondSection>
            {tagShowFlag && (
              <SecondSection code="enterpriseTags">
                <div className={styles['enterprise-tags-wrap']}>
                  <div className={styles['enterprise-tags-title']}>{companyName}</div>
                  <EnterpriseTags
                    key={sourceKey}
                    tagList={zhimaLabels}
                    parentId="sslmSupplierEntryWorkflow"
                    tagClassName="sslm-supplier-entry-workflow"
                  />
                </div>
              </SecondSection>
            )}
            <SecondSection className={styles.supplierEntryCard} code="enterpriseBasicInfo">
              <EnterpriseBasicInfo commonProps={tabProps.enterpriseBasic} />
            </SecondSection>
            {showSurveyFlag && !isEmpty(notDuplicateConfigList) && (
              <SecondSection code="investigationInfo">
                <InvestigationInfo commonProps={tabProps.investigation} />
              </SecondSection>
            )}
            <SecondSection code="invitationInfo">
              <InvitationInfo commonProps={tabProps.invitation} />
            </SecondSection>
            <SecondSection code="attachment">
              <Attachment commonProps={commonProps} />
            </SecondSection>
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
      'sslm.supplierEntryDetail',
      'sslm.common',
      'spfm.supplierRegister',
      'spfm.attachment',
      'spfm.bank',
      'spfm.importErp',
      'sslm.enterpriseInform',
      'sslm.supplierInform',
    ],
  })
)(SupplierEntryDetail);
