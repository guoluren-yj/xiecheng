import React, { useMemo, useCallback, Fragment } from 'react';
import { Card, Popover, Tooltip, Icon } from 'choerodon-ui';
import {
  useDataSet,
  Table,
  Button,
  Output,
  Modal,
  Attachment,
  NumberField,
  Lov,
  DatePicker,
  Spin,
} from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';

import homeSvg from '@/assets/home.svg';
import commonStyles from '@/routes/ssrc/common.less';
import EditForm from '@/routes/ssrc/components/EditorForm';
import StatusTag from '@/routes/components/StatusTag';
import { numberSeparatorRender, roundNumberRender } from '@/utils/renderer';
import { quotationFormDS, quotationHistoryLineDS } from './mainDS';
import { QRQuotationHeaderCodes, QRQuotationHistoryCode } from '../../store/enum';
import LadderQuotationModal from '../LadderQuotationModal';
import styles from '../index.less';

/**
 * 物料展示信息区域
 */
const ItemSummary = observer((props) => {
  const { data, statusTagColor, remote } = props;
  const {
    companyName,
    itemName,
    itemCategoryName,
    purchaseAgentName,
    purOrganizationName,
    brand,
    specs,
    quotationStatusMeaning,
    roundNumber,
    secondaryUomName,
    secondaryTargetPrice, // 目标单价
    lastQuotationSecPrice, // 上次报价含税单价
    lastNetSecondaryPrice, // 上次报价不含税单价
    targetPriceType,
  } = data;
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
            'SSRC_QUOTATION_QUICK_REPLY_PROCESS_QUOTATION_MODAL_VIEW_TARGET_PRICE_MEANING_DOM',
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
          'SSRC_QUOTATION_QUICK_REPLY_PROCESS_QUOTATION_MODAL_VIEW_TARGET_PRICE_DOM',
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
            <StatusTag text={quotationStatusMeaning} color={statusTagColor} />
            {remote
              ? remote.render(
                  'SSRC_QUOTATION_QUICK_REPLY_RENDER_QUOTATION_MODAL_VIEW_ROUNDER_DOM',
                  roundNumberRender({ value: roundNumber }),
                  {}
                )
              : roundNumberRender({ value: roundNumber })}
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

const QuotationQuery = (props) => {
  const { data, statusTagColor, customizeForm, customizeTable, doubleUnitFlag, remote } = props;
  const { rfqQuotationId } = data;

  const quotationFormDs = useDataSet(() => quotationFormDS({ rfqQuotationId }), [rfqQuotationId]); // 报价表单

  const qtHistoryLineDs = useDataSet(() => quotationHistoryLineDS({ rfqQuotationId }), [
    rfqQuotationId,
  ]); // 报价历史表格

  const { targetPriceType, ladderInquiryFlag } =
    quotationFormDs?.current?.get(['targetPriceType', 'ladderInquiryFlag']) || {};
  const isIncludePriceFlag = targetPriceType === 'TAX_INCLUDED_PRICE'; // 基准价是否是含税单价

  /**
   * @param ladderType 类型
   */
  const handleLadderModal = useCallback(
    ({ ladderPageType, source, record }) => {
      if (!quotationFormDs?.current) return;
      Modal.open({
        drawer: true,
        key: Modal.key(),
        title: intl
          .get('ssrc.quickInquiry.quickReply.view.message.title.ladderQuotation')
          .d('阶梯报价'),
        className: commonStyles['ssrc-large-modal'],
        children: (
          <LadderQuotationModal
            type={ladderPageType}
            source={source}
            record={record}
            headData={quotationFormDs.current.toData() || {}}
            rfqQuotationId={rfqQuotationId}
            doubleUnitFlag={doubleUnitFlag}
            customizeTable={customizeTable}
            customizeForm={customizeForm}
          />
        ),
        footer: (okBtn, cancelBtn) => [cancelBtn],
        cancelProps: { color: 'primary' },
        cancelText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [quotationFormDs, rfqQuotationId, doubleUnitFlag, customizeTable, customizeForm]
  );

  const priceConfig = useMemo(() => ({ editor: NumberField }), [quotationFormDs.current]);

  const editorFormColumns = useMemo(() => {
    return [
      {
        name: 'quotationSecPrice',
        ...priceConfig,
      },
      doubleUnitFlag && { name: 'quotationPrice', ...priceConfig },
      {
        name: 'netSecondaryPrice',
        ...priceConfig,
      },
      doubleUnitFlag && { name: 'netPrice', ...priceConfig },
      { name: 'currencyCode', editor: Lov },
      { name: 'taxId', editor: Lov },
      { name: 'date', editor: DatePicker },
      ladderInquiryFlag && {
        name: 'ladderQuotationLink',
        editor: Output,
        className: styles['quick-reply-ladder-quotation-link'],
        renderer: () => (
          <a
            onClick={() =>
              handleLadderModal({
                ladderPageType: 'view',
                source: 'header',
                record: quotationFormDs.current,
              })
            }
          >
            {intl.get('hzero.common.button.view').d('查看')}
          </a>
        ),
      },
      { name: 'attachmentUuid', editor: Attachment, viewMode: 'popup' },
    ].filter(Boolean);
  }, [handleLadderModal, ladderInquiryFlag, quotationFormDs?.current, doubleUnitFlag]);

  const columns = useMemo(() => {
    return [
      {
        name: 'roundNumber',
        width: 120,
        renderer: roundNumberRender,
      },
      {
        name: 'quotationSecPrice',
        width: 120,
        hidden: !isIncludePriceFlag,
      },
      {
        name: 'quotationPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'localQuotationSecPrice',
        width: 120,
        hidden: !isIncludePriceFlag,
      },
      {
        name: 'localQuotationPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'netSecondaryPrice',
        width: 120,
        hidden: isIncludePriceFlag,
      },
      {
        name: 'netPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'localNetSecPrice',
        width: 120,
        hidden: isIncludePriceFlag,
      },
      {
        name: 'localNetPrice',
        width: 120,
        hidden: !doubleUnitFlag,
      },
      {
        name: 'exchangeRate',
        width: 120,
      },
      {
        name: 'taxRate',
        width: 120,
      },
      {
        name: 'ladderQuotationLink',
        renderer: ({ record }) =>
          record.get('ladderInquiryFlag') ? (
            <Button
              funcType="link"
              onClick={() => handleLadderModal({ ladderPageType: 'view', source: 'line', record })}
            >
              {intl.get('hzero.common.button.view').d('查看')}
            </Button>
          ) : null,
      },
      { name: 'quotationExpiryDateFrom', width: 150 },
      { name: 'quotationExpiryDateTo', width: 150 },
      { name: 'quotedDate', width: 150 },
      { name: 'attachmentUuid', width: 150 },
    ];
  }, [handleLadderModal, isIncludePriceFlag, doubleUnitFlag]);

  const cardList = useMemo(
    () => [
      {
        title: intl.get('ssrc.quickInquiry.quickReply.view.message.title.quotation').d('报价'),
        content: (
          <EditForm
            columns={3}
            useColon={false}
            dataSet={quotationFormDs}
            editorFlag={false}
            editorColumns={editorFormColumns}
            customizeOptions={{ code: QRQuotationHeaderCodes?.VIEW }}
            customizeForm={customizeForm}
          />
        ),
      },
      {
        title: intl
          .get('ssrc.quickInquiry.quickReply.view.message.title.quotationHistory')
          .d('报价历史'),
        content: customizeTable(
          { code: QRQuotationHistoryCode },
          <Table
            dataSet={qtHistoryLineDs}
            columns={columns}
            selectionMode="none"
            style={{ maxHeight: 'calc(100vh - 370px)' }}
          />
        ),
      },
    ],
    [quotationFormDs, editorFormColumns, qtHistoryLineDs, columns, customizeForm]
  );

  if (!quotationFormDs?.current) return <Spin />;
  return (
    <div className={styles['quotation-modal']}>
      <ItemSummary
        data={quotationFormDs?.current?.toData() || {}}
        statusTagColor={statusTagColor}
        remote={remote}
      />
      {cardList.map(({ title, content }, idx) => (
        <Card
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

export default observer(QuotationQuery);
