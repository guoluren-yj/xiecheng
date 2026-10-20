import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Spin, useDataSet, Icon, Tooltip } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import { throttle, isUndefined, isFunction } from 'lodash';
import { AFBasic, AFExtra } from 'srm-front-boot/lib/components/AFCards';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { flow } from 'lodash';
import { observer } from 'mobx-react';
import querystring from 'querystring';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import classNames from 'classnames';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { dateRender } from 'utils/renderer';
import hocRemote from 'utils/remote';

import DynamicButtons from '_components/DynamicButtons';
import { readOnlyWFCodeList } from '@/utils/enum';
import { allSignList } from '@/utils/util';
import { renderSmartTips } from '@/utils/renderer';

import { fetchPcAttachmentList } from '@/services/contractCommonService';
import {
  queryShareEditConfig,
  getExtractConfig,
  queryAiApproveResult,
} from '@/services/workspaceService';
import { previewContractText } from '@/services/newContractService';
import useOperationRecordModal from '@/routes/components/C7nOperationRecord/useModal';
import PrintButton from '@/routes/components/PrintButton/index';
import { operationTextCompareModal } from '@/routes/components/TextCompareModalNew/index';
import IntelligentPreReview from '@/routes/components/IntelligentPreReview/index';

import { headerFormDS, basicDS } from './store/storeDS';
// import StoreProvider, { StoreContext } from './store/StoreProvider';
import ModeTag from '../Detail/components/modeTag';
import ContentTable from './List/ContnetTable';
import ContractAttachments from '../Detail/components/ContractAttachments';
import TextComparisonModal from '../Detail/components/TextComparisonModal';
import styles from './index.less';

const { openModal } = useOperationRecordModal();
const headerCode = [
  'SPCM.WORKSPACE.APPROVAL.HEADER_INFO_AF_BASIC', // 协议头-基础信息
  'SPCM.WORKSPACE.APPROVAL.HEADER_INFO_AF_EXTRA', // 协议头汇总数据
  ...Object.values(readOnlyWFCodeList.ATTACHMENT), // 协议采购方附件
  // readOnlyWFCodeList.ELECTRONIC, // 协议电子签章附件
];
const pcKindAttachList = ['ATTACHMENT', 'ATTACHMENT_FRAMEWORK'];
const CONTRACT_WORKSPACE_MAINTAIN = 'srm.pc-admin.pc-purchaser.workspace2';

const Page = (props) => {
  const {
    location = {},
    customizeBtnGroup,
    customizeForm,
    customizeTable,
    getHocInstance,
    match: { params: { pcHeaderId } = {}, path = '' },
    queryTemplateConfig,
    customizeCommon,
    onLoad,
    remote,
  } = props;

  const routerParams = useMemo(() => querystring.parse(location?.search?.substr(1)), [
    location?.search,
  ]);
  // 是否是审批表单
  const pubFlag = useMemo(() => path?.indexOf('/pub') > -1, []);
  const [headerInfo, setHeaderInfo] = useState({});
  const [contentLoading, setContentLoading] = useState(true);
  const headerFormDs = useDataSet(() => headerFormDS(), []);
  const basicDs = useDataSet(() => basicDS(), []);
  // const attachmentDs = useDataSet(() => attachmentDS(), []);

  const [isTextMode, setTextMode] = useState(true);
  const [templateList, setTemplateList] = useState([]);
  const [templateListFlag, setTemplateListFlag] = useState(false);
  const [textComparisonVisible, setTextComparisonVisible] = useState(false);
  const [shareEditConfig, setShareEditConfig] = useState({});
  const [smartContractConfig, setSmartContractConfig] = useState({});

  const [aiApproveParam, setAiApproveParam] = useState({});

  const contentRef = useRef();

  const aiResultTimer = useRef(null);

  const {
    attachmentUuid,
    supplierAttachmentUuid,
    purchaserAttachmentUuid,
    pcHeaderElectronicSignatureAttachment,
    pcHeaderElectronicSignatureAttachmentIsSigned,
    signatureType,
    electricSignFlag,
    authType,
    pcKindCode,
    pcStatusCode,
    electronicSignatureAttachmentDisplayFlag,
    mainContractId,
  } = headerInfo;

  const differeFlag = pcHeaderId && mainContractId;

  // 是否附件签章
  const isAttachmentSignUpload = useMemo(
    () =>
      signatureType === 'ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList?.includes(authType),
    [signatureType, electricSignFlag, authType]
  );

  // 是否附件和文本签章
  const isAttachmentSignAndText =
    (signatureType === 'TEXT_AND_ANNEX_SIGNATURE' &&
      electricSignFlag === 1 &&
      allSignList?.includes(authType)) ||
    electronicSignatureAttachmentDisplayFlag === 'Y';

  // templateCode：单据样式模板, templateVersion: 单据样式模板版本，stageCode：阶段，pageCode：页面
  const templateInfo = useMemo(() => {
    return {
      cuszTplTemplateCode: routerParams?.templateCode,
      cuszTplVersion: routerParams?.templateVersion,
      cuszTplStageCode: routerParams?.stageCode || 'CONTRACT_APPROVED', // 默认CONTRACT_APPROVED
      cuszTplPageCode: routerParams?.pageCode || 'CONTRACT_APPROVED_GROUP', // 默认CONTRACT_APPROVED_GROUP
    };
  }, [routerParams]);

  useEffect(() => {
    initFetchService();
    fetchShareEditConfig();
    fetchExtractConfig();
    handleAiApproveResult(true);
    if (onLoad) {
      onLoad({
        submit: handleWpsSave,
      });
    }
    return () => {
      clearAIResultTimer();
    };
  }, [pcHeaderId, templateInfo]);

  useEffect(() => {
    if (pcKindCode) {
      setTextMode(!['ATTACHMENT', 'ATTACHMENT_FRAMEWORK'].includes(pcKindCode));
    }
  }, [pcKindCode]);

  const initFetchService = useCallback(async () => {
    setContentLoading(true);
    const queryParams = new Promise((resolve) => {
      resolve({
        templateCode: templateInfo?.cuszTplTemplateCode,
        templateVersion: templateInfo?.cuszTplVersion,
      });
    });
    await queryTemplateConfig(queryParams, {
      // 阶段编码，页面编码
      stageCode: templateInfo?.cuszTplStageCode,
      pageCode: templateInfo?.cuszTplPageCode,
    });
    queryHeaderInfo();
  }, [pcHeaderId, templateInfo]);

  /**
   * 查询头信息和自定义附件，数据初始化
   */
  const queryHeaderInfo = useCallback(async () => {
    const { cuszTplTemplateCode, cuszTplVersion, cuszTplStageCode, cuszTplPageCode } = templateInfo;
    setContentLoading(true);
    headerFormDs.setQueryParameter('pcHeaderId', pcHeaderId);
    headerFormDs.setQueryParameter('customizeUnitCode', headerCode.toString());
    headerFormDs.setQueryParameter('cuszTplStageCode', cuszTplStageCode);
    headerFormDs.setQueryParameter('cuszTplPageCode', cuszTplPageCode);
    headerFormDs.setQueryParameter('cuszTplTemplateCode', cuszTplTemplateCode);
    headerFormDs.setQueryParameter('cuszTplVersion', cuszTplVersion);
    const res = await headerFormDs.query();
    if (getResponse(res)) {
      setHeaderInfo(res);
      // attachmentDs.loadData([res]);
      basicDs.loadData([res]);
    }
    // 查询自定义附件
    const templateList = await fetchPcAttachmentList(pcHeaderId);
    if (getResponse(templateList)) {
      templateList.forEach((item) => {
        const { attachmentTypeCode, attachmentTypeName, attachmentUuid } = item;
        const fieldName = `template-${attachmentTypeCode}`;
        if (!headerFormDs.getField(fieldName)) {
          headerFormDs.addField(fieldName, { label: attachmentTypeName, type: 'attachment' });
        }
        if (headerFormDs?.current) {
          headerFormDs.current.set(fieldName, attachmentUuid);
        }
      });
      setTemplateList(templateList);
      setTemplateListFlag(true);
    }
    setContentLoading(false);
  }, [pcHeaderId, templateInfo]);

  // 在线编辑共享配置
  const fetchShareEditConfig = () => {
    queryShareEditConfig().then((res) => {
      if (getResponse(res)) {
        setShareEditConfig(res);
      }
    });
  };

  /**
   * 获取配置表是否开启【智能合同提取控制】、是否在【附件合同在线编辑黑名单】
   */
  const fetchExtractConfig = async () => {
    const res = getResponse(await getExtractConfig());
    if (res) {
      setSmartContractConfig(res);
    }
  };

  // 审批时手动保存WPS文档
  const handleWpsSave = (approvalResult, task) => {
    return new Promise(async (resolve, reject) => {
      if (remote?.event) {
        const cuxFlag = await remote.event.fireEvent('handleCuxWpsSave', {
          approvalResult,
          resolve,
          reject,
          props,
          workflowTask: task,
          contentRef,
          headerFormDs,
        });
        if (!cuxFlag) {
          return false;
        }
      }
      // 文本模式，手动保存编辑文档
      if (
        isTextMode &&
        contentRef?.current?.editorOnlineRef &&
        isFunction(contentRef.current?.editorOnlineRef.saveDocument)
      ) {
        contentRef.current.editorOnlineRef.saveDocument({ data: 'saveDocument' }).then((res) => {
          if (res) {
            resolve(); // 文件保存成功继续执行
          } else {
            reject(); // 文件保存失败中断审批
          }
        });
      } else {
        resolve();
      }
    });
  };

  /**
   * 打开操作记录
   */
  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        pcHeaderId,
      });
    }, 500),
    [pcHeaderId]
  );

  const handleAiApproveResult = useCallback((initQueryFlag = false) => {
    const payload = {
      headerDataId: pcHeaderId,
    };
    queryAiApproveResult(payload).then((res) => {
      if (getResponse(res)) {
        const { result, aiApproveResultQueryDTOList } = res;
        setAiApproveParam({
          aiApproveReslultParams: aiApproveResultQueryDTOList,
          resultStatus: result,
        });
        // 页面初始化查询，并且resultStatus是审核中就继续轮询查询
        if(initQueryFlag && result === "APPROVING"){
          rollingFetchAiResult();
        }
      }
    });
  }, [pcHeaderId]);


  // 轮询查询ai预审结果
  const rollingFetchAiResult = ()=> {
    clearAIResultTimer();
    aiResultTimer.current = setInterval(() => {
      handleAiApproveResult();
    }, 5000);
  };

   // 清空定时器
  const clearAIResultTimer = ()=> {
    if (aiResultTimer.current) {
      clearInterval(aiResultTimer.current);
      aiResultTimer.current = null;
    }
  };

  /**
   * 预览合同文本
   */
  const previewContract = async () => {
    // 文本模式，手动保存编辑文档
    if (
      isTextMode &&
      contentRef?.current?.editorOnlineRef &&
      isFunction(contentRef.current?.editorOnlineRef.saveDocument)
    ) {
      const res = await contentRef.current.editorOnlineRef.saveDocument({ data: 'saveDocument' });
      if (!res) {
        return false;
      }
    }
    const res = await previewContractText({ pcHeaderId, menuCode: CONTRACT_WORKSPACE_MAINTAIN });
    if (getResponse(res) && window?.open && res?.url) {
      if (res.version === 'V7' && res.componentType === 'new_wps') {
        window.open(
          `${window.$$env.BASE_PATH}pub/spcm/contract-workspace/wps-v7-preview/${pcHeaderId}?previewUrl=${res?.url}`
        );
      } else {
        window.open(res?.url);
      }
    }
  };

  // 文本对比
  const handleTextCompare = async () => {
    await handleWpsSave();
    setContentLoading(true);
    operationTextCompareModal({
      headerInfo,
    }).finally(() => setContentLoading(false));
  };

  /**
  //  * 协议提交预览按钮
  //  */
  // const getOverviewButtons = useMemo(() => {
  //   return [
  //     {
  //       name: 'operating',
  //       btnType: 'c7n-pro',
  //       child: intl.get(`hzero.common.button.operating`).d('操作记录'),
  //       btnProps: {
  //         funcType: 'flat',
  //         icon: 'operation_service_request',
  //         onClick: handleShowOperationRecordModal,
  //       },
  //     },
  //     !['ATTACHMENT', 'ATTACHMENT_FRAMEWORK'].includes(pcKindCode) &&
  //       !isAttachmentSignUpload && {
  //         name: 'print',
  //         btnType: 'c7n-pro',
  //         btnComp: PrintButton,
  //         btnProps: {
  //           funcType: 'flat',
  //           icon: 'print',
  //           pcHeaderId,
  //           isBtnPro: true,
  //           type: 'c7n-pro',
  //           btnComp: () => {
  //             return (
  //               <PrintButton pcHeaderId={pcHeaderId} isBtnPro funcType="flat" type="c7n-pro" />
  //             );
  //           },
  //         },
  //       },
  //   ];
  // }, [pcHeaderId, isAttachmentSignUpload]);

  /**
   * 协议审批按钮
   */
  const getApprovalButtons = useMemo(() => {
    return [
      {
        name: 'operating',
        btnType: 'c7n-pro',
        child: intl.get(`hzero.common.button.operating`).d('操作记录'),
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
        },
      },
      !['ATTACHMENT', 'ATTACHMENT_FRAMEWORK'].includes(pcKindCode) &&
        !isAttachmentSignUpload && {
          name: 'print',
          btnType: 'c7n-pro',
          btnComp: PrintButton,
          btnProps: {
            funcType: 'flat',
            icon: 'print',
            pcHeaderId,
            isBtnPro: true,
            type: 'c7n-pro',
            btnComp: () => {
              return (
                <PrintButton pcHeaderId={pcHeaderId} isBtnPro funcType="flat" type="c7n-pro" />
              );
            },
          },
        },
      pcStatusCode !== 'PENDING' &&
        !isAttachmentSignUpload && {
          name: 'textComparison',
          btnType: 'c7n-pro',
          btnProps: {
            funcType: 'flat',
            type: 'c7n-pro',
            icon: 'compare',
            wait: 500,
            waitType: 'throttle',
            onClick: () => setTextComparisonVisible(!textComparisonVisible),
          },
          child: !textComparisonVisible
            ? intl.get('spcm.common.view.title.textComparison').d('文本对比')
            : intl.get(`mallf.common.model.cancelCompare`).d('取消对比'),
        },
      !pcKindAttachList.includes(pcKindCode) &&
        shareEditConfig?.enableEditShare === '1' &&
        shareEditConfig?.onlyEditReplaceWildcardBefore === '1' && {
          name: 'previewContract',
          btnType: 'c7n-pro',
          btnProps: {
            icon: 'preview',
            type: 'c7n-pro',
            funcType: 'flat',
            wait: 500,
            waitType: 'throttle',
            onClick: previewContract,
          },
          child: intl.get('spcm.common.view.button.previewContract').d('预览合同文本'),
        },
      !['PENDING', 'DELETED'].includes(pcStatusCode) && {
        name: 'onlineTextCompare',
        btnType: 'c7n-pro',
        child: intl.get('spcm.common.button.contractTextComparison').d('合同文本对比'),
        btnProps: {
          funcType: 'flat',
          icon: 'compare',
          onClick: handleTextCompare,
        },
      },
    ];
  }, [pcHeaderId, textComparisonVisible, headerInfo, isAttachmentSignUpload, pcStatusCode]);

  // const renderOverviewHeaderButton = useCallback(() => {
  //   return customizeBtnGroup(
  //     {
  //       code: `SPCM.WORKSPACE.APPROVAL.BTN_GROUP`,
  //       pro: true,
  //       btnType: 'c7n-pro',
  //     },
  //     <DynamicButtons buttons={getOverviewButtons} />
  //   );
  // }, [getOverviewButtons]);

  const renderApprovalHeaderButton = useCallback(() => {
    return customizeBtnGroup(
      {
        code: `SPCM.WORKSPACE.APPROVAL.BTN_GROUP`,
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getApprovalButtons} />
    );
  }, [getApprovalButtons]);

  const changeToolTip = (change, node) => (
    <Tooltip
      title={intl
        .get('spcm.common.view.message.changeBefore', {
          name: change || '-',
        })
        .d(`修改前：${change || '-'}`)}
    >
      <span className={styles['afextra-update']}>{node || '-'}</span>
    </Tooltip>
  );

  const afBasicConfig = {
    pcName: {
      render: ({ record }) => {
        return (
          <>
            {record?.get('pcName')}
            {renderSmartTips({ smartTaskId: record?.get('smartTaskId'), isPub: true })}
          </>
        );
      },
    },
  };

  const basicConfig = {
    supplierCompanyId: {
      widthRatio: '2x',
      renderValue: ({ record }) => {
        const { supplierCompanyName, supplierName } = record?.get('different') || {};
        const change = supplierCompanyName || supplierName;
        if (!isUndefined(change)) {
          return changeToolTip(
            change,
            record?.get('supplierCompanyName') || record?.get('supplierName')
          );
        }
        return record?.get('supplierCompanyName') || record?.get('supplierName');
      },
    },
    companyName: {
      widthRatio: '2x',
      renderValue: ({ record }) => {
        const { companyName } = record?.get('different') || {};
        if (!isUndefined(companyName)) {
          return changeToolTip(companyName, record?.get('companyName'));
        }
        return record?.get('companyName');
      },
    },
    dateActive: {
      widthRatio: '2x',
      aggregation: true,
      aggregationFields: ['startDateActive', 'endDateActive'],
      aggregationValueRender: ({ record, node }) => {
        const { startDateActive, endDateActive } = record?.get('different') || {};
        if (!isUndefined(startDateActive) || !isUndefined(endDateActive)) {
          const change = `${dateRender(startDateActive) || '-'}/${
            dateRender(endDateActive) || '-'
          }`;
          return changeToolTip(change, node);
        }
        return node;
      },
    },
    startDateActive: {},
    endDateActive: {},
    remark: {
      widthRatio: '2x',
      renderValue: ({ record }) => {
        const { remark } = record?.get('different') || {};
        if (!isUndefined(remark)) {
          return changeToolTip(remark, record?.get('remark'));
        }
        return record?.get('remark');
      },
    },
  };

  // 附件
  const attachmentViewProps = {
    headerInfo,
    isShowTips: true,
    templateList,
    supplierAttachmentUuid,
    attachmentUUID: attachmentUuid,
    isTemplateContract: true,
    supplierParams: { supplierViewFlag: true },
    showRemoveIcon: false,
    showHistory: !!differeFlag,
    btnProps: {
      isBtn: false,
    },
  };

  const uploadProps = {
    showHistory: !!differeFlag,
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'purchaser-attachment',
    btnText: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
    title: intl.get('spcm.common.view.spcm.btn.purchaserAttachment').d('采购方附件'),
    attachmentUUID: purchaserAttachmentUuid,
    viewOnly: true,
  };

  const electricSignAttachmentProps = {
    showHistory: !!differeFlag,
    bucketName: PRIVATE_BUCKET,
    bucketDirectory: 'purchase-contract',
    btnText: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
    title: intl.get(`spcm.common.view.btn.electronicSignatureAttachment`).d('电子签章附件'),
    attachmentUUID: pcHeaderElectronicSignatureAttachment,
    rightAttachmentUUID: pcHeaderElectronicSignatureAttachmentIsSigned,
    fileSize: 25 * 1024 * 1024,
    fileMaxNum: 4,
    fileType:
      'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    viewOnly: true,
  };

  const contractAttachmentsProps = {
    showHistory: !!differeFlag,
    customizeForm,
    getHocInstance,
    headerFormDs,
    templateListFlag,
    attachmentProps: attachmentViewProps,
    uploadProps,
    electricSignAttachmentProps,
    remoteWorkDetail: remote,
    workFlowProps: props,
    showSignAttachement: isAttachmentSignUpload || isAttachmentSignAndText,
    custCode: readOnlyWFCodeList.ATTACHMENT,
    // custElecCode: readOnlyWFCodeList.ELECTRONIC,
    custCardCode: readOnlyWFCodeList.ATTACHMENTCARD,
  };

  const renderRightSummary = useCallback(() => {
    return (
      <div className={styles['right-amount']}>
        <span>{intl.get(`spcm.common.model.amount`).d('协议总额')}</span>
        <div>
          {headerInfo.taxIncludeAmount}
          <span className={styles.currency}>{headerInfo.purchaseCurrencyCode}</span>
        </div>
      </div>
    );
  }, [headerInfo, pcHeaderId]);

  return (
    <React.Fragment>
      <Spin spinning={contentLoading}>
        {/* {!pubFlag && (
          <Header title={intl.get('spcm.common.view.title.submitPreview').d('协议提交预览')}>
            {renderOverviewHeaderButton()}
          </Header>
        )} */}
        <div className={classNames('clearfix', styles.approval)}>
          <div className={styles['basic-box']}>
            <IntelligentPreReview {...aiApproveParam} />
            {headerFormDs?.current?.get('mainContractId') && (
              <Alert
                className={styles['change-top-alert']}
                type="info"
                message={
                  <div>
                    <Icon type="help" />
                    {intl
                      .get('spcm.common.view.message.changeAlert')
                      .d('单据变更的内容用红色字体标识，鼠标定位在变更处可以查看变更前的原始内容')}
                  </div>
                }
                closable
                border={false}
              />
            )}
            {customizeCommon(
              {
                code: 'SPCM.WORKSPACE.APPROVAL.HEADER_INFO_AF_BASIC',
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={headerFormDs}
                titleField="pcName"
                tagFields={['pcKindCode', 'pcTypeId', 'pcSourceCode']}
                normalFields={['createdBy', 'creationDate']}
                fieldsConfig={afBasicConfig}
                contentRemainWidth={300}
                contentRemainRender={renderRightSummary}
              />
            )}
          </div>
          {pubFlag && (
            <div className={styles['approval-buttons-content']}>
              <div className="page-head">
                <div className="page-head-operator">{renderApprovalHeaderButton()}</div>
                {!['ATTACHMENT', 'ATTACHMENT_FRAMEWORK'].includes(pcKindCode) && (
                  <ModeTag
                    activeKey={isTextMode}
                    onRightClick={() => setTextMode(!isTextMode)}
                    onLeftClick={() => setTextMode(!isTextMode)}
                  />
                )}
              </div>
            </div>
          )}
          <div className={styles['basic-afextra']}>
            {customizeCommon(
              {
                code: `SPCM.WORKSPACE.APPROVAL.HEADER_INFO_AF_EXTRA`,
                processUnitTag: 'AF-EXTRA',
              },
              <AFExtra
                dataSet={basicDs}
                fieldsConfig={basicConfig}
                fields={['companyName', 'supplierCompanyId', 'dateActive', 'remark']}
              />
            )}
          </div>
          {!textComparisonVisible ? (
            headerInfo?.pcHeaderId && (
              <ContentTable
                pcHeaderId={pcHeaderId}
                templateInfo={templateInfo}
                getHocInstance={getHocInstance}
                headerInfo={headerInfo}
                headerFormDs={headerFormDs}
                isTextMode={isTextMode}
                customizeTable={customizeTable}
                customizeForm={customizeForm}
                shareEditConfig={shareEditConfig}
                contentRef={contentRef}
                smartContractConfig={smartContractConfig}
              >
                <ContractAttachments {...contractAttachmentsProps} />
              </ContentTable>
            )
          ) : (
            <TextComparisonModal
              compareStyles={{ className: styles['approval-compare'] }}
              pcHeaderId={pcHeaderId}
              visible={textComparisonVisible}
              onCancel={() => setTextComparisonVisible(!textComparisonVisible)}
            />
          )}
        </div>
      </Spin>
    </React.Fragment>
  );
};

export default flow(
  observer,
  WithCustomize({
    isTemplate: true,
  }),
  formatterCollections({
    code: [
      'spcm.workspace',
      'spcm.contractChange',
      'spcm.common',
      'entity.company',
      'entity.business',
      'entity.organization',
      'entity.supplier',
      'entity.roles',
      'component.docFlow',
      'hzero.common',
      'spcm.contractSubject',
      'spcm.purchaseRequisitionCreation',
      'spcm.contractControl',
      'sodr.sendOrder',
      'ssta.purchaseSettle',
      'sodr.workspace',
      'entity.item',
      'entity.attachment',
      'ssrc.inquiryHall',
      'spcm.workspace',
      'spcm.purchaseContractView',
      'spcm.contractSign',
      'sodr.common',
      'spcm.contractChapter',
      'mallf.common',
      'hzero.c7nProUI',
      'sodr.quotePurchase',
      'spfp.ruleMaintenance',
      'spfp.common',
    ],
  }),
  hocRemote(
    {
      code: 'SPCM_WORKSPACE_APPROVAL_FLOW',
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    },
    {
      events: {
        // 给审批流程提供一个钩子函数
        handleCuxWpsSave() {},
      },
    }
  )
)(Page);
