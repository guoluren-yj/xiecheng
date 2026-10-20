import React, {
  useMemo,
  useCallback,
  Fragment,
  useImperativeHandle,
  useState,
  useEffect,
} from 'react';
import { Card, Alert, Popover, Tooltip, Icon } from 'choerodon-ui';
import {
  useDataSet,
  Table,
  Button,
  Output,
  Modal,
  Attachment,
  Lov,
  DatePicker,
  Spin,
} from 'choerodon-ui/pro';
import { isNil, isEmpty } from 'lodash';
import { observer } from 'mobx-react';

import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import homeSvg from '@/assets/home.svg';
import { amountCalcType } from '@/utils/utils';
import commonStyles from '@/routes/ssrc/common.less';
import EditForm from '@/routes/ssrc/components/EditorForm';
import StatusTag from '@/routes/components/StatusTag';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { numberSeparatorRender, roundNumberRender } from '@/utils/renderer';
import { validateQRModal } from '@/routes/components/ConfirmModal';
import { qrAbandon } from '@/services/quickReplyService';
import { quotationFormDS, quotationHistoryLineDS } from './mainDS';
import { QRQuotationHeaderCodes, QRQuotationHistoryCode } from '../../store/enum';
import LadderQuotationModal from '../LadderQuotationModal';
import styles from '../index.less';

const organizationId = getCurrentOrganizationId();
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
            'SSRC_QUOTATION_QUICK_REPLY_PROCESS_QUOTATION_MODAL_EDIT_TARGET_PRICE_MEANING_DOM',
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
          'SSRC_QUOTATION_QUICK_REPLY_PROCESS_QUOTATION_MODAL_EDIT_TARGET_PRICE_DOM',
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
                  'SSRC_QUOTATION_QUICK_REPLY_RENDER_QUOTATION_MODAL_EDIT_ROUNDER_DOM',
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

const QuotationModal = (props) => {
  const {
    modal,
    data,
    tableDs,
    statusTagColor,
    customizeForm,
    customizeTable,
    doubleUnitFlag,
    quotationModalRef,
    handleQuotationButton,
    searchBarParams = {},
    remote,
  } = props;
  const { rfqQuotationId, tenantId: currentTenantId } = data;
  const [caclRule, setCaclRule] = useState('Amount');
  const quotationFormDs = useDataSet(() => quotationFormDS({ rfqQuotationId, doubleUnitFlag }), [
    rfqQuotationId,
    doubleUnitFlag,
  ]); // 报价表单

  const qtHistoryLineDs = useDataSet(() => quotationHistoryLineDS({ rfqQuotationId }), [
    rfqQuotationId,
  ]); // 报价历史表格

  // 业务规则定义-金额计算方式
  const initCalcType = async (params) => {
    const result = (await amountCalcType(params)) || [];
    const _caclRule = result?.[0];
    setCaclRule(_caclRule);
    if (quotationFormDs?.current) {
      quotationFormDs.current.setState('caclRule', _caclRule);
    }
  };

  useEffect(() => {
    if (!currentTenantId) {
      return;
    }
    initCalcType({
      purTenantId: currentTenantId,
      organizationId,
      supplierFlag: 1,
    });
  }, [quotationFormDs?.current, currentTenantId, organizationId]);

  useImperativeHandle(quotationModalRef, () => {
    return {
      handleOkAndClose,
      handleOkAndNext,
      handleAbandonAndClose,
      handleAbandonAndNext,
    };
  });

  const { returnRemark, targetPriceType, ladderInquiryFlag } =
    quotationFormDs?.current?.get(['returnRemark', 'targetPriceType', 'ladderInquiryFlag']) || {};
  const isIncludePriceFlag = targetPriceType === 'TAX_INCLUDED_PRICE'; // 基准价是否是含税单价

  // 确认并关闭
  const handleOkAndClose = async () => {
    if (!quotationFormDs.current) return;
    // 1.前端校验头信息
    const validateFlag = await quotationFormDs.validate();
    if (!validateFlag) return;
    // 按钮操作类型 【确认并下一个】【确认并关闭】
    quotationFormDs.setState('submitOperation', 'CONFIRM_CLOSE');
    // 2.调校验接口，渲染报错信息
    quotationFormDs.dataToJSON = 'all';
    const validateRes = await quotationFormDs.setState('submitType', 'validate').submit();
    quotationFormDs.dataToJSON = 'dirty';
    if (!validateRes) return;

    const successCallBack = () => {
      // 刷新列表
      tableDs.query(tableDs.currentPage);
      notification.success();
      modal.close();
    };

    const warningOk = async () => {
      quotationFormDs.dataToJSON = 'all';
      quotationFormDs.setState('submitType', 'submit');
      return quotationFormDs.forceSubmit().then((res) => {
        if (res) {
          quotationFormDs.dataToJSON = 'dirty';
          tableDs.query(tableDs.currentPage);
          notification.success();
          modal.close();
        }
      });
    };

    validateQRModal({
      response: validateRes?.content?.[0] || {},
      successCallBack,
      warningOk,
    });
  };

  // 【确定并下一个】
  const handleOkAndNext = async () => {
    if (!quotationFormDs.current) return;
    // 1.前端校验头信息
    const validateFlag = await quotationFormDs.validate();
    if (!validateFlag) return;
    // 按钮操作类型 【确认并下一个】
    quotationFormDs.setState('submitOperation', 'CONFIRM_NEXT');
    // 2.调校验接口，渲染报错信息
    quotationFormDs.dataToJSON = 'all';
    // 设置列表页筛选器查询条件
    quotationFormDs.setState('searchBarParams', searchBarParams);
    const validateRes = await quotationFormDs.setState('submitType', 'validate').submit();
    quotationFormDs.dataToJSON = 'dirty';
    if (!validateRes) return;

    // 【确定并下一个】成功后回调
    const handleSuccessCBNext = (result = {}) => {
      // 刷新列表
      tableDs.query(tableDs.currentPage);
      const { nextQuotation = {} } = result?.content?.[0] || {};
      if (isEmpty(nextQuotation)) {
        Modal.info({
          title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
          children: intl.get('ssrc.quickInquiry.quickReply.view.message.noNext').d('没有下一个了'),
          onOk: () => {
            modal.close();
            notification.success();
          },
        });
      } else {
        // 刷新弹窗内容
        const { rfqQuotationId: newRfqQuotationId } = nextQuotation;
        quotationFormDs.setState('rfqQuotationId', newRfqQuotationId).query();
        qtHistoryLineDs.setState('rfqQuotationId', newRfqQuotationId).query();
        notification.success();
      }
    };

    const warningOk = () => {
      quotationFormDs.dataToJSON = 'all';
      quotationFormDs.setState('submitType', 'submit');
      return quotationFormDs.forceSubmit().then((res) => {
        if (res) {
          quotationFormDs.dataToJSON = 'dirty';
          handleSuccessCBNext(res);
        }
      });
    };

    validateQRModal({
      response: validateRes?.content?.[0] || {},
      successCallBack: () => handleSuccessCBNext(validateRes),
      warningOk,
    });
  };

  // 【放弃并关闭】只修改单子状态 不做数据保存
  // 无需页面数据校验 无需传个性化单元编码
  const handleAbandonAndClose = () => {
    const handleOk = () => {
      const params = {
        quickRfqQuotationCur: quotationFormDs?.current?.toData() || {},
      };
      return qrAbandon(params).then((res) => {
        const result = getResponse(res);
        if (result) {
          // 刷新列表
          tableDs.query(tableDs.currentPage);
          notification.success();
          modal.close();
        }
      });
    };

    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('ssrc.quickInquiry.quickReply.view.message.abandonQuotation.tips')
        .d('放弃后报价行不可恢复，是否放弃报价？'),
      onOk: handleOk,
    });
  };

  // 【放弃并下一个】
  // 无需页面数据校验 需传列表个性化单元编码及筛选参数 目的定位下一个报价行
  const handleAbandonAndNext = () => {
    const handleOk = () => {
      const { filterCode = '', filterParams = {} } = searchBarParams || {};
      const params = {
        quickRfqQuotationCur: quotationFormDs?.current?.toData() || {},
        operate: 'ABANDON_NEXT',
        query: {
          customizeUnitCode: filterCode,
          ...(filterParams || {}),
        },
      };
      return qrAbandon(params).then((res) => {
        const result = getResponse(res);
        if (result) {
          // 刷新列表
          tableDs.query(tableDs.currentPage);
          const { nextQuotation = {} } = result || {};
          if (isEmpty(nextQuotation)) {
            Modal.info({
              title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
              children: intl
                .get('ssrc.quickInquiry.quickReply.view.message.noNext')
                .d('没有下一个了'),
              onOk: () => {
                modal.close();
                notification.success();
              },
            });
          } else {
            // 刷新弹窗内容
            const { rfqQuotationId: newRfqQuotationId } = nextQuotation;
            quotationFormDs.setState('rfqQuotationId', newRfqQuotationId).query();
            qtHistoryLineDs.setState('rfqQuotationId', newRfqQuotationId).query();
            notification.success();
          }
        }
      });
    };

    Modal.confirm({
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('ssrc.quickInquiry.quickReply.view.message.abandonQuotation.tips')
        .d('放弃后报价行不可恢复，是否放弃报价？'),
      onOk: handleOk,
    });
  };

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
            caclRule={caclRule}
            headData={quotationFormDs.current.toData() || {}}
            rfqQuotationId={rfqQuotationId}
            doubleUnitFlag={doubleUnitFlag}
            customizeTable={customizeTable}
            customizeForm={customizeForm}
          />
        ),
        footer: (okBtn, cancelBtn) =>
          ladderPageType === 'view' ? [cancelBtn] : [okBtn, cancelBtn],
        cancelProps: ladderPageType === 'view' ? { color: 'primary' } : {},
        cancelText:
          ladderPageType === 'view'
            ? intl.get('hzero.common.button.close').d('关闭')
            : intl.get('hzero.common.button.cancel').d('取消'),
      });
    },
    [quotationFormDs, rfqQuotationId, doubleUnitFlag, customizeTable, customizeForm]
  );

  const priceConfig = useMemo(
    () => ({
      editor: C7nPrecisionInputNumber,
      omitZeroFlag: true,
      currency: 'currencyCode',
      record: quotationFormDs.current,
    }),
    [quotationFormDs.current]
  );

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
                ladderPageType: 'edit',
                source: 'header',
                record: quotationFormDs.current,
              })
            }
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
      { name: 'attachmentUuid', editor: Attachment },
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
          <>
            <EditForm
              columns={3}
              useColon={false}
              dataSet={quotationFormDs}
              editorFlag
              editorColumns={editorFormColumns}
              customizeOptions={{ code: QRQuotationHeaderCodes?.EDIT }}
              customizeForm={customizeForm}
            />
            {typeof handleQuotationButton === 'function' &&
              handleQuotationButton({ quotationFormDs })}
          </>
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
    [
      quotationFormDs,
      editorFormColumns,
      qtHistoryLineDs,
      columns,
      customizeForm,
      handleQuotationButton,
    ]
  );

  if (!quotationFormDs?.current) return <Spin />;
  return (
    <div className={styles['quotation-modal']}>
      {returnRemark && (
        <Alert
          message={`${intl
            .get('ssrc.quickInquiry.quickReply.view.message.reQuoteRemark')
            .d('重新报价理由')}: ${returnRemark}`}
          type="error"
          showIcon
          className={commonStyles['ssrc-alert-error']}
        />
      )}
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

export default observer(QuotationModal);
