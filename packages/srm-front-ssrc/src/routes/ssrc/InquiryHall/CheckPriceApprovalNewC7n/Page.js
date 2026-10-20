import React, { useState, useCallback, useMemo, useEffect, useContext, useRef } from 'react';
import { Spin, Form, Attachment, Icon, useModal, Tooltip, Output } from 'choerodon-ui/pro';
import { Badge } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { throttle, isNil } from 'lodash';
import { AFBasic, AFExtra } from 'srm-front-boot/lib/components/AFCards';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_SSRC } from '_utils/config';
import { downloadFile } from 'hzero-front/lib/services/api';
import { getResponse } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';

import { queryBidFileTemplateConfig } from '@/utils/utils';
import useOperationRecordModal from '@/routes/components/OperationRecord/useModal';
import { HOCPriceComparison as PriceComparison } from '@/routes/ssrc/components/PriceComparison';
import { INQUIRY } from '@/utils/globalVariable';
import PrecisionInputNumber from '@/routes/components/Precision/PrecisionInputNumber';
import BidPriceComparison from '@/routes/ssrc/components/PriceComparison/BidIndex';
import { openC7nProcessAttachmentModal } from '@/routes/components/processAttachment';
import DownloadAttachments from '@/routes/ssrc/components/DownloadAttachments';
import {
  queryProcessAttachmentConfig,
  fetchAttachmentCount,
} from '@/services/checkPriceOverviewServices';

import FileTemplateAttachmentCheckPricePage from '@/routes/components/FileTemplateAttachmentCheckPricePage';
import { StoreContext } from './store/StoreProvider';
import SectionPanel from './components/SectionPanel';
import ContentTable from './Tables/ContnetTable';
import ExpertScore from './components/ExportScore';

import styles from './index.less';

const { openModal } = useOperationRecordModal();

const selectionStrategyMap = (flag = 0) => ({
  MAX_PRICE_WIN: intl
    .get('ssrc.inquiryHall.model.inquiryHall.highestPricePriority')
    .d('最高价优先'),
  MIN_PRICE_WIN: intl.get('ssrc.inquiryHall.model.inquiryHall.lowestPricePriority').d('最低价优先'),
  FIRST_SCORE_WIN: flag
    ? intl.get('ssrc.inquiryHall.model.inquiryHall.ratingFirstPriority').d('评分第一优先')
    : intl.get('ssrc.inquiryHall.model.inquiryHall.scoreFirst').d('评分优先'),
});

const Page = () => {
  const {
    pubFlag = true,
    isSection = false,
    sourceKey = INQUIRY,
    organizationId = '',
    customizeBtnGroup = () => {},
    rfxHeaderId = '',
    commonDs,
    commonDs: { headerDs, basicDs, supplierTableDs, itemTableDs, attachmentDs },
    customizeForm = () => {},
    customizeTable = () => {},
    customizeCommon = () => {},
    headerInfo = {},
    doubleUnitFlag = false,
    queryHeaderInfo = () => {},
    contentLoading = true,
    bidFlag = false,
    rfxHeaderIds = null,
    checkPriceUiIsNew = false,
    remote,
    onLoad,
  } = useContext(StoreContext);
  const [processVisible, setProcessVisible] = useState(false);
  const [processAttachmentNewUIFlag, setProcessAttachmentNewUIFlag] = useState(false); // 是否使用新过程附件下载
  const [attachmentNewUILoading, setAttachmentNewUILoading] = useState(true); // 过程附件下载loading
  const [attachemntCount, setAttachemntCount] = useState(0);
  const [fileTemplateManageFlag, setFileTemplateManageFlag] = useState(0); // 招标文件tab
  const attachmentTableRef = useRef({});

  const modal = useModal();

  useEffect(() => {
    // 查询过程附件下载配置
    handeleSearchProcessAttachmentConfig();
    queryFileTemplateManageSheetConfig();

    handleOverFlow();
  }, [rfxHeaderId]);

  /**
   * 查询过程下载附件配置表
   */
  const handeleSearchProcessAttachmentConfig = async () => {
    try {
      const result = getResponse(await queryProcessAttachmentConfig());
      if (result) {
        setProcessAttachmentNewUIFlag(!result?.length);
        queryAttachmentCount(!result?.length);
      }
    } finally {
      setAttachmentNewUILoading(false);
    }
  };

  // 查询招标文件模板管理配置
  const queryFileTemplateManageSheetConfig = async () => {
    const flag = await queryBidFileTemplateConfig();
    setFileTemplateManageFlag(flag);
  };

  const queryAttachmentCount = async (newCheckFlag) => {
    const result = getResponse(
      await fetchAttachmentCount({ rfxHeaderId, newCheckFlag: newCheckFlag ? 1 : 0 })
    );
    if (result) {
      setAttachemntCount(Number(result?.fileCount || 0) > 99 ? '99+' : result?.fileCount);
    }
  };

  const handleShowOperationRecordModal = useCallback(
    throttle(() => {
      openModal({
        rfxHeaderId,
      });
    }, 500),
    [rfxHeaderId]
  );

  const handleOverFlowSubmit = (approveResult, task) => {
    const { event } = remote || {};

    const submitCallBack = () => {
      // submit 函数需返回一个 Promise 对象
      return new Promise((resolve) => {
        resolve();
      });
    };

    return event
      ? event.fireEvent('submit', {
          submitCallBack,
          approveResult,
          task,
          commonDs,
          rfxHeaderId,
          bidFlag,
          rfxHeaderIds,
        })
      : submitCallBack();
  };

  const handleOverFlow = () => {
    // 使用 onLoad 函数注册 submit 回调函数
    if (typeof onLoad === 'function') {
      onLoad({
        submit: handleOverFlowSubmit,
      });
    }
  };

  // 比价助手
  const priceComparisonProps = {
    sourceCategory: headerInfo.sourceCategory,
    diyLadderQuotationFlag: headerInfo.diyLadderQuotationFlag,
    rfxId: rfxHeaderId,
  };

  const renderPriceComparisonModal = () => {
    modal.open({
      destroyOnClose: true,
      closable: true,
      title: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
      style: { width: '80%' },
      drawer: true,
      footer: null,
      children:
        sourceKey === INQUIRY ? (
          <PriceComparison {...priceComparisonProps} />
        ) : (
          <BidPriceComparison {...priceComparisonProps} />
        ),
    });
  };

  // 全部下载
  const downloadAll = useCallback(() => {
    const api = `${SRM_SSRC}/v1/${organizationId}/rfx/${rfxHeaderId}/process-attachment/download-all`;
    downloadFile({ requestUrl: api, method: 'GET' });
  }, [rfxHeaderId]);

  const openH0ProcessAttachmentModal = useCallback(() => {
    setProcessVisible(true);
  }, []);

  const onCancel = useCallback(() => {
    setProcessVisible(false);
  }, []);

  // 核价概览按钮组
  const getOverviewButtons = useMemo(() => {
    return [
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          funcType: 'flat',
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
        },
      },
      {
        name: 'priceComparisonAssistant',
        child: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
        btnType: 'c7n-pro',
        btnProps: {
          type: 'default',
          icon: 'manage_accounts',
          funcType: 'flat',
          onClick: renderPriceComparisonModal,
        },
      },
      {
        name: 'downloadAttachment',
        child: (
          <Badge count={attachemntCount} overflowCount={attachemntCount} size="small">
            <span>
              <Icon type="get_app" />
              {intl.get('hzero.common.button.open').d('过程附件下载')}
            </span>
          </Badge>
        ),
        btnType: 'c7n-pro',
        btnProps: {
          loading: attachmentNewUILoading,
          funcType: 'flat',
          onClick: processAttachmentNewUIFlag
            ? openC7nProcessAttachmentModal({ rfxHeaderId })
            : openH0ProcessAttachmentModal,
        },
      },
    ];
  }, [rfxHeaderId, processAttachmentNewUIFlag, attachmentNewUILoading, attachemntCount]);

  // 审批按钮组
  const getApprovalButtons = useMemo(() => {
    return [
      {
        name: 'downloadAttachment',
        child: (
          <Badge count={attachemntCount} overflowCount={attachemntCount} size="small">
            <span>{intl.get('hzero.common.button.open').d('过程附件下载')}</span>
          </Badge>
        ),
        btnType: 'c7n-pro',
        btnProps: {
          loading: attachmentNewUILoading,
          onClick: processAttachmentNewUIFlag
            ? openC7nProcessAttachmentModal({ rfxHeaderId })
            : openH0ProcessAttachmentModal,
          funcType: 'flat',
          icon: 'get_app',
        },
      },
      {
        name: 'priceComparisonAssistant',
        child: intl.get(`ssrc.inquiryHall.view.message.button.priceAssistant`).d('比价助手'),
        btnType: 'c7n-pro',
        btnProps: {
          type: 'default',
          icon: 'manage_accounts',
          onClick: renderPriceComparisonModal,
          funcType: 'flat',
        },
      },
      {
        name: 'operationRecord',
        btnType: 'c7n-pro',
        child: intl.get(`ssrc.inquiryHall.view.message.button.record`).d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          onClick: handleShowOperationRecordModal,
          funcType: 'flat',
        },
      },
    ];
  }, [rfxHeaderId, processAttachmentNewUIFlag, attachmentNewUILoading, attachemntCount]);

  const renderOverviewHeaderButton = useCallback(() => {
    return customizeBtnGroup(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_BUTTONS`,
        pro: true,
        btnType: 'c7n-pro',
      },
      <DynamicButtons buttons={getOverviewButtons} />
    );
  }, [getOverviewButtons]);

  const renderApprovalHeaderButton = useCallback(() => {
    return (
      <div className="content-bottom-render">
        {customizeBtnGroup(
          {
            code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_APPROVAL_BUTTONS`,
            pro: true,
            btnType: 'c7n-pro',
          },
          <DynamicButtons buttons={getApprovalButtons} />
        )}
      </div>
    );
  }, [getApprovalButtons]);

  /**
   * 切换标段后的处理回调
   * @param {*} curRfxHeaderId 最新标段的rfxHeaderId
   */
  const afterOpenSection = async (curRfxHeaderId = '') => {
    if (!curRfxHeaderId || curRfxHeaderId === rfxHeaderId) {
      return;
    }
    queryHeaderInfo({ rfxHeaderId: curRfxHeaderId });
  };

  const FormProps = {
    dataSet: attachmentDs,
    labelLayout: 'float',
  };

  const SpinProps = {
    spinning: contentLoading,
  };

  const ContentProps = {
    isSection,
    customizeForm,
    customizeTable,
    headerInfo,
    rfxHeaderId,
    organizationId,
    supplierTableDs,
    itemTableDs,
    customizeCommon,
    sourceKey,
    doubleUnitFlag,
    bidFlag,
    remote,
  };

  const SectionPanelProps = {
    rfxHeaderId,
    afterOpenSection,
    bidFlag,
    rfxHeaderIds,
  };

  const basicConfig = {
    totalPrice: {
      renderValue({ value = 0, record }) {
        const savingRatio = (record && record?.get('savingRatio')) || 0;
        const tooltipTitle =
          savingRatio > 0
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.rateGreaterThan`).d('节支率大于0')
            : savingRatio < 0
            ? intl.get(`ssrc.inquiryHall.model.inquiryHall.rateLessThan`).d('节支率小于0')
            : '';
        return (
          <div
            style={{
              color: savingRatio > 0 ? '#179454' : savingRatio < 0 ? 'red' : '',
              display: 'flex',
            }}
          >
            <div style={{ marginRight: '8px', fontSize: '18px' }}>
              {!isNil(value) ? (
                <PrecisionInputNumber
                  value={value}
                  financial={record?.get('currencyCode')}
                  type="c7n"
                  readOnly
                />
              ) : (
                '-'
              )}
            </div>
            {!isNil(savingRatio) && savingRatio !== 0 && (
              <div style={{ fontSize: '10px', display: 'flex', alignItems: 'center' }}>
                <Tooltip placement="topLeft" title={tooltipTitle}>
                  <Icon
                    type={savingRatio > 0 ? 'arrow_downward' : 'arrow_upward'}
                    style={{ fontSize: '14px', height: '16px' }}
                  />
                </Tooltip>
                <span>{savingRatio}%</span>
              </div>
            )}
          </div>
        );
      },
    },
    priceAmount: {
      aggregation: true,
      aggregationFields: ['minSuggestedAmount', 'maxSuggestedAmount'],
      aggregationTitleRender({ node }) {
        const tooltipTitle = (
          <div>
            <p>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.minimumAmountTitle`)
                .d('最低金额：所有物料的分配数量*供应商最低的报价单价*汇率/价格批量')}
            </p>
            <p>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.maximumAmountTitle`)
                .d('最高金额：所有物料的分配数量*供应商最高的报价单价*汇率/价格批量')}
            </p>
          </div>
        );
        return (
          <div className={styles['basic-afextra-label-box']}>
            <div className={styles['basic-afextra-label-node']}>{node}</div>
            <Tooltip placement="topLeft" title={tooltipTitle}>
              <Icon type="help" style={{ fontSize: '14px' }} />
            </Tooltip>
          </div>
        );
      },
    },
    minSuggestedAmount: {
      renderValue({ value, record }) {
        if (!isNil(value)) {
          return (
            <PrecisionInputNumber
              value={value}
              financial={record?.get('currencyCode')}
              type="c7n"
              readOnly
            />
          );
        }
      },
    },
    maxSuggestedAmount: {
      renderValue({ value, record }) {
        if (!isNil(value)) {
          return (
            <PrecisionInputNumber
              value={value}
              financial={record?.get('currencyCode')}
              type="c7n"
              readOnly
            />
          );
        }
      },
    },
    supplierAmount: {
      aggregation: true,
      aggregationFields: ['suggestedSupCount', 'notSuggestedSupCount', 'allSupCount'],
      aggregationTitleRender({ node }) {
        const tooltipTitle = (
          <div>
            <p>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.numberOfWonBidding`)
                .d('中标供应商数量')}
            </p>
            <p>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.numberOfLostBidding`)
                .d('未中标供应商数量')}
            </p>
            <p>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.numberOfQuotation`)
                .d('参与报价供应商数量')}
            </p>
          </div>
        );
        return (
          <div className={styles['basic-afextra-label-box']}>
            <div className={styles['basic-afextra-label-node']}>{node}</div>
            <Tooltip placement="topLeft" title={tooltipTitle}>
              <Icon type="help" style={{ fontSize: '14px' }} />
            </Tooltip>
          </div>
        );
      },
    },
    suggestedSupCount: {},
    notSuggestedSupCount: {},
    allSupCount: {},
    bidAmount: {
      aggregation: true,
      aggregationFields: ['minMaxPriceSuggestedLineCount', 'suggestedLineCount', 'itemLineCount'],
      aggregationTitleRender({ node }) {
        const tooltipTitle = (
          <div>
            <p>
              {headerInfo?.auctionDirection === 'FORWARD'
                ? intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.lowestPriceSelcted`)
                    .d('最高价的选用行数')
                : intl
                    .get(`ssrc.inquiryHall.model.inquiryHall.highestPriceSelcted`)
                    .d('最低价的选用行数')}
            </p>
            <p>
              {intl
                .get(`ssrc.inquiryHall.model.inquiryHall.thisTimeSelected`)
                .d('本次选用的标的行数')}
            </p>
            <p>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.docSelected`).d('本单据总的标的行数')}
            </p>
          </div>
        );
        return (
          <div className={styles['basic-afextra-label-box']}>
            <div className={styles['basic-afextra-label-node']}>{node}</div>
            <Tooltip placement="topLeft" title={tooltipTitle}>
              <Icon type="help" style={{ fontSize: '14px' }} />
            </Tooltip>
          </div>
        );
      },
    },
    minMaxPriceSuggestedLineCount: {},
    suggestedLineCount: {},
    itemLineCount: {},
    checkRecommendationStrategyDetail: {
      renderValue({ value = '' }) {
        return selectionStrategyMap(checkPriceUiIsNew)[value];
      },
    },
    checkRecommendationFlag: {
      hidden: !checkPriceUiIsNew,
      renderValue({ value = 0 }) {
        return yesOrNoRender(value);
      },
    },
    checkRemark: {
      widthRatio: '2x',
    },
  };

  // 过程附件下载
  const DownloadAttachmentsProps = useMemo(() => {
    return {
      rfxHeaderId,
      processVisible,
      downloadAll,
      onCancel,
      organizationId,
    };
  }, [rfxHeaderId, processVisible]);

  const renderBasicRight = useCallback(() => {
    return (
      <div className={styles['basic-box-right']}>
        <Output
          value={
            bidFlag
              ? intl.get(`ssrc.bidHall.model.bidHall.totalPrice`).d('定标总金额')
              : intl.get(`ssrc.inquiryHall.model.inquiryHall.totalPrice`).d('核价总金额')
          }
          className={styles['basic-box-right-total-price-label']}
        />
        <div className={styles['basic-box-right-total-price']}>
          <PrecisionInputNumber
            value={headerInfo?.totalPrice}
            financial={headerInfo?.currencyCode}
            type="c7n"
            readOnly
          />
          <div>&nbsp;{headerInfo?.currencyCode}</div>
        </div>
      </div>
    );
  }, [headerInfo, bidFlag]);

  const handleAttachmentTableRef = (node) => {
    attachmentTableRef.current = node;
  };

  const fileProps = {
    customizeTable,
    customizeBtnGroup,
    headerDS: headerDs,
    fileTemplateManageFlag,
    rfxHeaderId,
    editorFlag: 0,
    bidFlag,
    onRef: handleAttachmentTableRef,
    unitCodeSymbol: 'approvalOverView', // 个性化标识
  };

  let showScoreInfo = headerInfo?.expertScoreFlag === 1;
  showScoreInfo = remote
    ? remote.process(
        'SSRC_CHECK_PRICE_APPROVAL_OVERVIEW_PROCESS_PAGE_SCORE_INFO_VISIBLE',
        showScoreInfo,
        {
          headerInfo,
          headerDs,
        }
      )
    : showScoreInfo;

  return (
    <React.Fragment>
      <Spin {...SpinProps}>
        {!pubFlag && (
          <Header
            title={
              bidFlag
                ? intl.get(`ssrc.inquiryHall.model.inquiryHall.bidOverview`).d('定标提交预览')
                : intl.get(`ssrc.inquiryHall.model.inquiryHall.priceOverView`).d('核价提交预览')
            }
          >
            {renderOverviewHeaderButton()}
          </Header>
        )}
        <SectionPanel {...SectionPanelProps}>
          <div className={styles['basic-box']}>
            {customizeCommon(
              {
                code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_BASIC`,
                processUnitTag: 'AF-BASIC',
              },
              <AFBasic
                dataSet={headerDs}
                titleField="rfxTitle"
                tagFields={[
                  headerDs?.current?.get('secondarySourceCategoryMeaning')
                    ? 'secondarySourceCategoryMeaning'
                    : 'sourceCategoryMeaning',
                ]}
                normalFields={['checkedByName']}
                contentRemainRender={renderBasicRight}
                contentRemainWidth="25%"
                contentBottomRender={pubFlag && renderApprovalHeaderButton}
              />
            )}
          </div>
          <div className={styles['basic-afextra']}>
            {customizeCommon(
              {
                code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.HEADER_INFO_AF_EXTRA`,
                processUnitTag: 'AF-EXTRA',
              },
              <AFExtra
                dataSet={basicDs}
                fieldsConfig={basicConfig}
                fields={[
                  'totalPrice',
                  'priceAmount',
                  'supplierAmount',
                  'bidAmount',
                  'checkRecommendationStrategyDetail',
                  'checkRecommendationFlag',
                  'checkRemark',
                ]}
              />
            )}
          </div>
          <ContentTable {...ContentProps} />

          {showScoreInfo ? (
            <Content style={{ marginTop: '8px', marginBottom: '-8px', padding: '20px' }}>
              <div className={styles['attachment-title']}>
                {intl.get('ssrc.inquiryHall.view.tab.gradInformation').d('评分信息')}
              </div>
              <ExpertScore />
            </Content>
          ) : (
            ''
          )}

          <Content style={{ marginTop: '8px', padding: '20px' }}>
            <div className={styles['attachment-title']}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.attachment`).d('附件')}
            </div>
            {fileTemplateManageFlag !== 1 ? (
              <>
                {customizeForm(
                  {
                    code: `SSRC.${sourceKey}_HALL_CHECK_PRICE_OVERVIEW.ATTACHMENT`,
                    dataSet: attachmentDs,
                  },
                  <Form {...FormProps}>
                    <Attachment name="checkAttachmentUuid" />
                  </Form>
                )}
              </>
            ) : (
              <FileTemplateAttachmentCheckPricePage {...fileProps} />
            )}
          </Content>
          {/* 过程附件下载 */}
          {processVisible && <DownloadAttachments {...DownloadAttachmentsProps} />}
        </SectionPanel>
      </Spin>
    </React.Fragment>
  );
};

export default observer(Page);
