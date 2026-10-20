import React, {
  useMemo,
  useCallback,
  useEffect,
  useState,
  Fragment,
  useImperativeHandle,
} from 'react';
import { Card, Popover, Result, Tooltip, Icon } from 'choerodon-ui';
import {
  useDataSet,
  Table,
  Button,
  Output,
  Modal,
  Attachment,
  DatePicker,
  Spin,
} from 'choerodon-ui/pro';
import { isNil, noop } from 'lodash';
import { observer } from 'mobx-react';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from '_components/DynamicButtons';

import homeSvg from '@/assets/home.svg';
import commonStyles from '@/routes/ssrc/common.less';
import EditForm from '@/routes/ssrc/components/EditorForm';
import { getQuotationAndPrice } from '@/services/inquiryHallNewService';
import { numberSeparatorRender, roundNumberRender } from '@/utils/renderer';
import StatusTag, { statusTagRender } from '@/routes/components/StatusTag';
import { ReactComponent as NoData } from '@/assets/noData.svg';
import OperationRecordExport from '@/routes/components/OperationRecordExport';

import { quotationFormDS, associateQuotationLineDS } from './mainDS';
import QuotationOperation from './QuotationOperation';
import styles from './index.less';

/**
 * 物料展示信息区域
 */
const ItemSummary = observer((props) => {
  const { header, remote } = props;
  const [quotationArr, setQuotationArr] = useState([]);
  const {
    companyName,
    itemName,
    itemCategoryName,
    brand,
    specs,
    purchaseAgentName,
    purOrganizationName,
    quotationStatusMeaning,
    roundNumber,
    secondaryUomName,
    secondaryTargetPrice, // 目标单价
    lastQuotationSecPrice, // 上次报价含税单价
    lastNetSecondaryPrice, // 上次报价不含税单价
    targetPriceType,
    rfqQuotationId,
  } = header?.toData() || {};

  // 根据基准价类型【targetPriceType】判断 展示 含税 | 不含税
  const price =
    targetPriceType === 'TAX_INCLUDED_PRICE' ? lastQuotationSecPrice : lastNetSecondaryPrice;
  const priceLable =
    targetPriceType === 'TAX_INCLUDED_PRICE'
      ? intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.lastQuotationPrice')
          .d('上轮含税单价')
      : intl
          .get('ssrc.quickInquiry.quickReply.model.quickInquiry.lastQuotationNetPrice')
          .d('上轮不含税单价');

  useEffect(() => {
    getQuotationAndPrice({ organizationId: getCurrentOrganizationId(), rfqQuotationId }).then(
      (res) => {
        if (getResponse(res)) {
          setQuotationArr(res);
        }
      }
    );
  }, [rfqQuotationId, setQuotationArr]);

  const popContentRender = useCallback(() => {
    const content = (
      <div className={styles['quotation-rounds-popover']}>
        <div className={styles['popover-title']}>
          <div className={styles['popover-title-left']}>
            {intl.get('ssrc.quickInquiry.model.quickInquiry.rounds').d('轮次')}
          </div>
          <div className={styles['popover-title-right']}>
            {intl.get('ssrc.quickInquiry.model.quickInquiry.price').d('单价')}
          </div>
        </div>
        <div className={styles['popover-wrapper']}>
          {quotationArr?.map((i) => {
            const {
              roundNumber: itemRoundNumber,
              targetPriceType: itemTargetPriceType,
              localQuotationSecPrice,
              localNetSecPrice,
            } = i;
            const itemPrice =
              itemTargetPriceType === 'TAX_INCLUDED_PRICE'
                ? localQuotationSecPrice
                : localNetSecPrice;
            return (
              <div className={styles['popover-content']}>
                <div className={styles['popover-content-left']}>
                  {intl
                    .get('ssrc.quickInquiry.model.quickInquiry.commonRound', {
                      roundNumber: itemRoundNumber,
                    })
                    .d(`第{roundNumber}轮`)}
                </div>
                <div className={styles['popover-content-right']}>
                  <Tooltip title={numberSeparatorRender(itemPrice)}>
                    {numberSeparatorRender(itemPrice)}
                  </Tooltip>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
    return content;
  }, [quotationArr]);

  const popBasicRender = useCallback(() => {
    return (
      <div className={styles['basic-popover']}>
        <div className="line">
          <span className="line-name">
            {intl.get('ssrc.quickInquiry.model.quickInquiry.purchaseName').d('采购员')}
          </span>
          <span className="line-value">
            <Tooltip title={purchaseAgentName}>{purchaseAgentName || '-'}</Tooltip>
          </span>
        </div>
        <div className="line">
          <span className="line-name">
            {intl.get('ssrc.quickInquiry.model.quickInquiry.purOrganizationName').d('采购组织')}
          </span>
          <span className="line-value">
            <Tooltip title={purOrganizationName}>{purOrganizationName || '-'}</Tooltip>
          </span>
        </div>
      </div>
    );
  }, []);

  // 多轮报价
  const roundPriceRender = useCallback(() => {
    const roundPriceDom =
      quotationArr.length > 0 && roundNumber > 1 ? (
        <Popover
          overlayClassName={styles['quotation-rounds-popover-wrapper']}
          trigger="hover"
          content={popContentRender()}
          placement="bottom"
        >
          {roundNumberRender({ value: roundNumber, icon: 'alt_route-o' })}
        </Popover>
      ) : (
        roundNumberRender({ value: roundNumber })
      );
    return remote
      ? remote.process(
          'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_PROCESS_QUOTATION_MODAL_VIEW_ROUNDER_DOM',
          roundPriceDom,
          {}
        )
      : roundPriceDom;
  }, [quotationArr]);

  // 目标价
  const targePriceRender = (type) => {
    if (type === 'meaning') {
      const meaningDom = (
        <>
          {!isNil(secondaryTargetPrice) &&
            intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.targetPricePer').d('目标价')}
          {!isNil(secondaryTargetPrice) && !isNil(price) ? '/' : null}
        </>
      );
      return remote
        ? remote.process(
            'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_PROCESS_QUOTATION_MODAL_VIEW_TARGET_PRICE_MEANING_DOM',
            meaningDom,
            {}
          )
        : meaningDom;
    }
    const valueDom = (
      <>
        {!isNil(secondaryTargetPrice) ? numberSeparatorRender(secondaryTargetPrice) : null}
        {!isNil(secondaryTargetPrice) && !isNil(price) ? ' / ' : null}
      </>
    );
    return remote
      ? remote.process(
          'SSRC_QUICK_INQUIRY_WORKBENCH_LIST_PROCESS_QUOTATION_MODAL_VIEW_TARGET_PRICE_DOM',
          valueDom,
          {}
        )
      : valueDom;
  };
  return (
    <div className="item-summary-area">
      <div className="left">
        <div className="line-gap">
          <img alt="" src={homeSvg} />
          <span>{companyName}</span>
          <Popover content={popBasicRender()} placement="right">
            <Icon type="info_outline" className="company-icon" />
          </Popover>
        </div>
        <div className="line-gap item-info">
          <span className="item-name">{itemName}</span>
          <span>
            <StatusTag text={secondaryUomName} />
            {statusTagRender({
              text: quotationStatusMeaning,
              dataSet: header.dataSet,
              record: header,
              name: 'quotationStatus',
            })}
            {roundPriceRender()}
          </span>
        </div>
        <div className="line-gap item-last">
          {itemCategoryName && (
            <span>
              {intl
                .get('ssrc.quickInquiry.quickReply.model.quickInquiry.itemCategory')
                .d('物料类别')}
              ：{itemCategoryName}
            </span>
          )}
          {brand && (
            <Fragment>
              <span className="text-line">|</span>
              <span className="model">
                {intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.brand').d('品牌')}：{' '}
                {brand}
              </span>
            </Fragment>
          )}
          {specs && (
            <Fragment>
              <span className="text-line">|</span>
              <span className="model">
                {intl.get('ssrc.quickInquiry.quickReply.model.quickInquiry.specs').d('规格')}：{' '}
                {specs}
              </span>
            </Fragment>
          )}
        </div>
      </div>
      <div className="right">
        <div>
          {targePriceRender('meaning')}
          {!isNil(price) && priceLable}
        </div>
        <div className="price">
          {targePriceRender('value')}
          {!isNil(price) ? numberSeparatorRender(price) : null}
        </div>
      </div>
    </div>
  );
});

const ViewQuotationModal = (props) => {
  const {
    modal,
    lineRecord = {},
    doubleUnitFlag = false,
    onShowQuoLadderLevelModal = noop,
    customizeCollapseForm = noop,
    customizeTable = noop,
    getQuotationModalFooter = noop,
    quotationModalContentRef,
    customizeBtnGroup = noop,
    remote,
  } = props;
  const { rfqQuotationId, rfqItemId } = lineRecord?.get(['rfqQuotationId', 'rfqItemId']) || {};

  const quotationFormDs = useDataSet(() => quotationFormDS({ rfqQuotationId }), [rfqQuotationId]); // 报价表单
  const associateQuotationLineDs = useDataSet(
    () => associateQuotationLineDS({ rfqQuotationId, rfqItemId }),
    [rfqQuotationId]
  ); // 报价历史表格

  useImperativeHandle(quotationModalContentRef, () => {
    return {
      handleOperation,
    };
  });

  const { ladderInquiryFlag, quotationStatus } =
    quotationFormDs?.current?.get(['ladderInquiryFlag', 'quotationStatus']) || {};

  const handleOperation = () => {
    // 获取最新rfqQuotationId
    const newRfqQuotationId = quotationFormDs?.getState('rfqQuotationId') || rfqQuotationId;
    return Modal.open({
      drawer: true,
      key: Modal.key(),
      title: intl
        .get('ssrc.quickInquiry.quickReply.view.message.title.operationRecord')
        .d('操作记录'),
      className: commonStyles['ssrc-medium-modal'],
      children: <QuotationOperation rfqQuotationId={newRfqQuotationId} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: (okBtn) => {
        return (
          <>
            {okBtn}
            <OperationRecordExport sourceId={newRfqQuotationId} type="QUICK_RFQ_LINE" />
          </>
        );
      },
    });
  };

  // useEffect(() => {

  //   modal.handleCancel(handleOperation);
  // }, [modal, handleOperation]);

  const handleRefresh = useCallback(
    async ({ record }) => {
      const {
        rfqQuotationId: newRfqQuotationId,
        rfqItemId: newRfqItemId,
        quotationStatus: newQuotationStatus,
      } = record.get(['rfqQuotationId', 'rfqItemId', 'quotationStatus']);
      // 重新查询头行数据
      if (newRfqQuotationId && newRfqItemId) {
        quotationFormDs.setState('rfqQuotationId', newRfqQuotationId).query();
        associateQuotationLineDs.setState('rfqQuotationId', newRfqQuotationId);
        associateQuotationLineDs.setState('rfqItemId', rfqItemId).query();
      }
      // 更新弹框底部按钮
      updateModalButtons({ newQuotationStatus, record });
    },
    [quotationFormDs, associateQuotationLineDs, quotationStatus]
  );

  const updateModalButtons = ({ newQuotationStatus, record }) => {
    // 当前行状态与查看报价行状态不一致
    if (newQuotationStatus !== quotationStatus) {
      modal.update({
        footer: () => {
          return customizeBtnGroup(
            {
              code: 'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.BOTTOM_BUTTONS',
              pro: true,
            },
            <DynamicButtons buttons={getQuotationModalFooter({ record })} />
          );
        },
      });
    }
  };

  const renderPrice = useCallback(({ text }) => {
    return !isNil(text) && text !== '' ? <span>{text}</span> : null;
  }, []);

  const supplierFormColumns = useMemo(() => {
    return [
      'supplierCompanyNum',
      'supplierCompanyName',
      'contactName',
      'contactMobilephone',
      'contactMail',
    ];
  }, []);

  const editorFormColumns = useMemo(() => {
    const { localCurrencyCode, currencyCode } =
      quotationFormDs?.current?.get(['localCurrencyCode', 'currencyCode']) || {};
    // 原币单价字段 当原币币种≠本币币种时展示
    const originalCurrencyColumns =
      localCurrencyCode !== currencyCode
        ? [
            'quotationSecPrice',
            doubleUnitFlag && 'quotationPrice',
            'netSecondaryPrice',
            doubleUnitFlag && 'netPrice',
            'currencyCode',
          ]
        : [];
    return [
      {
        name: 'localQuotationSecPrice',
        renderer: renderPrice,
      },
      doubleUnitFlag && 'localQuotationPrice',
      'localNetSecPrice',
      doubleUnitFlag && 'localNetPrice',
      'localCurrencyCode',
      'exchangeRate',
      'taxRate',
      { name: 'date', editor: DatePicker },
      ladderInquiryFlag && {
        name: 'ladderQuotationLink',
        editor: Output,
        renderer: () => (
          <Button
            funcType="link"
            onClick={() => onShowQuoLadderLevelModal(quotationFormDs?.current)}
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </Button>
        ),
      },
      { name: 'attachmentUuid', editor: Attachment },
      ...originalCurrencyColumns,
    ].filter(Boolean);
  }, [
    ladderInquiryFlag,
    doubleUnitFlag,
    onShowQuoLadderLevelModal,
    renderPrice,
    quotationFormDs?.current,
  ]);

  const columns = useMemo(() => {
    return [
      {
        name: 'quotationStatusMeaning',
        width: 120,
        renderer: ({ text }) => (
          <StatusTag
            text={text}
            color="warn"
            // icon={record.get('quotationStatus') === 'WAIT_OR_IN_QUOTATION' ? 'alarm' : ''}
          />
        ),
      },
      {
        name: 'action',
        width: 120,
        renderer: ({ record }) => (
          <Button funcType="link" onClick={() => handleRefresh({ record })}>
            {intl.get('ssrc.quickInquiry.quickReply.view.button.title.viewQuotation').d('查看报价')}
          </Button>
        ),
      },
      {
        name: 'localQuotationSecPrice',
        width: 120,
        renderer: renderPrice,
      },
      {
        name: 'localQuotationPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'localNetSecPrice',
        width: 120,
      },
      {
        name: 'localNetPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'currencyCode',
        width: 120,
      },
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 120,
      },
      {
        name: 'exchangeRate',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      { name: 'quotationExpiryDateFrom', width: 150 },
      { name: 'quotationExpiryDateTo', width: 150 },
    ];
  }, [handleRefresh, renderPrice, doubleUnitFlag, quotationStatus]);

  const cardList = useMemo(
    () => [
      {
        title: intl.get('ssrc.quickInquiry.quickReply.view.message.title.supplierInfo').d('供应商'),
        name: 'supplier',
        content: (
          <EditForm
            columns={3}
            useColon={false}
            dataSet={quotationFormDs}
            editorFlag={false}
            editorColumns={supplierFormColumns}
            customizeForm={customizeCollapseForm}
            customizeOptions={{ code: 'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.SUPPLIER_FORM' }}
          />
        ),
      },
      {
        title: intl
          .get('ssrc.quickInquiry.quickReply.view.message.title.quotationInfo')
          .d('报价信息'),
        name: 'quotation',
        content: ['WAIT_OR_IN_QUOTATION'].includes(quotationStatus) ? (
          <div className={styles['no-data-content']}>
            <Result
              status="warning"
              icon={<NoData />}
              title={intl
                .get(`ssrc.quickInquiry.quickReply.view.message.title.supplierNoQuotation`)
                .d('供应商未报价')}
            />
          </div>
        ) : (
          <EditForm
            columns={3}
            useColon={false}
            dataSet={quotationFormDs}
            editorFlag={false}
            editorColumns={editorFormColumns}
            customizeForm={customizeCollapseForm}
            customizeOptions={{ code: 'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.QUOTE_FORM' }}
          />
        ),
      },
      {
        title: intl
          .get('ssrc.quickInquiry.quickReply.view.message.title.associateQuotationLine')
          .d('关联报价行'),
        content: customizeTable(
          { code: 'SSRC.QUICK_INQUIRY.LIST.VIEW_QUOTE.QUOTE_LINES' },
          <Table
            dataSet={associateQuotationLineDs}
            columns={columns}
            selectionMode="none"
            style={{ maxHeight: 540 }}
          />
        ),
      },
    ],
    [
      quotationFormDs,
      editorFormColumns,
      associateQuotationLineDs,
      columns,
      supplierFormColumns,
      quotationStatus,
      quotationFormDs?.current,
    ]
  );
  if (!quotationFormDs?.current) return <Spin />;
  return (
    <div className={styles['quotation-modal']}>
      <ItemSummary header={quotationFormDs.current} remote={remote} />
      {cardList.map(({ title, content, name }, idx) => (
        <Card
          key={name}
          bordered={false}
          className={DETAIL_CARD_CLASSNAME + (idx === 0 ? ' first-card' : '')}
          title={title}
        >
          {content}
        </Card>
      ))}
    </div>
  );
};

export default observer(ViewQuotationModal);
