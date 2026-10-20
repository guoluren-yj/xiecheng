import React, { useContext, useMemo, useEffect } from 'react';
import { Modal } from 'choerodon-ui/pro';
import { isNil, noop } from 'lodash';
import intl from 'utils/intl';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { TopSection } from '_components/Section';
import { yesOrNoRender } from 'utils/renderer';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import { numberSeparatorRender, roundEliminate, useTernaryExpression } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import ApplicationScopeDetail from '@/routes/ssrc/components/ApplicationOrganization/Detail';
import FeedBackBargainHistoryC7N from '@/routes/ssrc/InquiryHall/Detail/FeedBackBargainHistoryC7N';
import FileGroup from '@/routes/components/SupplierQuotationAttachment';
import { idValidation } from '@/routes/components/Widget/dataVerification';
import { getQuotationName } from '@/utils/globalVariable';
import styles from './index.less';
import { StoreContext } from '../store/StoreProvider';
import FileTemplateAttachmentCheckPricePage from './FileTemplateAttachmentCheckPricePage';
import BasicInfoForm from './BasicInfoForm';
import CostRemarkForm from './CostRemarkForm';
import AttachmentForm from './AttachmentForm';
import LadderLevelCheckPrice from '../CheckPriceLadder';

const ContentTable = () => {
  const {
    commonDs: { itemTableDs, basicInfoDs, tableAttachmentDs, attachmentDs },
    doubleUnitFlag = false,
    bidFlag = false,
    newQuotationFlag = false,
    organizationId,
    headerInfo,
    templateInfo,
    rfxHeaderId,
    getHocInstance,
    customizeForm = noop,
    customizeTable = noop,
    getCustomizeUnitCode = noop,
    fileTemplateManageFlag = false,
    headerInfo: { multiCurrencyFlag, rankRule, applicationScopeFlag: scopeFlag },
  } = useContext(StoreContext);

  useEffect(() => {
    itemTableDs.setQueryParameter('commons', {
      templateInfo,
      customizeUnitCode: getCustomizeUnitCode(['tableFilter', 'table']),
    });
  }, []);

  // 价格标红
  const renderPriceWhetherRed = (value = null, record, name) => {
    if (isNil(value)) {
      return '-';
    }

    let mean = '';
    const formatValue = numberSeparatorRender(value);
    const { redField } = record.get(['redField']);
    const color = redField === name ? 'red' : '';

    mean = <span style={{ color }}>{formatValue}</span>;
    return mean;
  };

  // 阶梯报价
  const viewLadderLevelQuota = (data) => {
    const { record } = data || {};

    if (!record) {
      return;
    }

    const Props = {
      bidFlag,
      doubleUnitFlag,
      record,
      uiType: 'c7n',
      templateInfo,
      customizeTable,
      getCustomizeUnitCode,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: 'ssrc-back-to-ladder-quotation',
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderQuotation`).d('阶梯报价'),
      style: {
        width: 742,
      },
      children: <LadderLevelCheckPrice {...Props} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 还价历史
  const onComparePriceHistory = (record) => {
    if (!record) {
      return;
    }

    idValidation(rfxHeaderId);

    const Props = {
      rfxHeaderId,
      record,
      doubleUnitFlag,
      quotationName: getQuotationName(bidFlag),
      bidFlag,
    };

    Modal.open({
      drawer: true,
      key: 'ssrc-back-to-feed-back',
      destroyOnClose: true,
      style: { width: '1000px' },
      closable: true,
      title: intl.get(`ssrc.queryRfq.view.title.history`).d('还比价历史'),
      children: <FeedBackBargainHistoryC7N {...Props} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 查看适用范围
  const viewApplicationOrgModal = (param = {}) => {
    const Props = {
      queryParams: {
        organizationId,
        sourceHeaderId: rfxHeaderId,
        sourceFrom: 'RFX',
        applicationScopeFlag: scopeFlag,
        ...param,
      },
      sourceHeaderId: rfxHeaderId,
      organizationId,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: 'ssrc-back-to-application',
      drawer: true,
      bodyStyle: {
        padding: 0,
      },
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScopeDetail {...Props} />,
      style: { width: '1090px' },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  // 差异价
  const rendererDifferencepriceValue = ({ record }) => {
    const { priceTypeCode } = headerInfo || {};

    const {
      validNetSecondaryPrice,
      validNetPrice,
      validQuotationSecPrice,
      validQuotationPrice,
      referencePrice = null,
    } = record.get([
      'validNetSecondaryPrice',
      'validNetPrice',
      'validQuotationSecPrice',
      'validQuotationPrice',
      'referencePrice',
    ]);

    let price = null;

    if (priceTypeCode === 'NET_PRICE') {
      price = validNetPrice;
      if (doubleUnitFlag) {
        price = validNetSecondaryPrice;
      }
    } else {
      price = validQuotationPrice;
      if (doubleUnitFlag) {
        price = validQuotationSecPrice;
      }
    }

    if (isNil(price) || isNil(referencePrice)) {
      return '-';
    }

    price = numberSeparatorRender(math.minus(price, referencePrice));
    return price;
  };

  const columns = useMemo(
    () =>
      [
        {
          name: 'suggestedFlag',
          width: 60,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'categoryName',
          width: 120,
        },
        {
          name: 'itemCode',
          width: 120,
        },
        {
          name: 'itemName',
        },
        useTernaryExpression(doubleUnitFlag, {
          name: 'secondaryUomName',
          width: 100,
        }),
        {
          name: 'uomName',
          width: 120,
        },
        {
          name: 'companyNum',
          width: 120,
        },
        {
          name: 'companyName',
          width: 320,
          renderer: ({ value, record }) => {
            const nameValue = value ? roundEliminate(value, record, { uiType: 'c7n-pro' }) : '';
            return nameValue;
          },
        },
        {
          name: 'candidateSuggestion',
          width: 100,
        },
        multiCurrencyFlag
          ? {
              name: 'quotationCurrencyCode',
              width: 100,
            }
          : '',
        multiCurrencyFlag
          ? {
              name: 'exchangeRate',
              width: 100,
            }
          : '',
        useTernaryExpression(doubleUnitFlag, {
          name: 'validQuotationSecPrice',
          width: 120,
          align: 'right',
          renderer: ({ value, record }) =>
            renderPriceWhetherRed(value, record, 'validQuotationSecPrice'),
        }),
        {
          name: 'validQuotationPrice',
          width: 120,
          align: 'right',
          renderer: ({ value, record }) =>
            renderPriceWhetherRed(value, record, 'validQuotationPrice'),
        },
        rankRule === 'WEIGHT_PRICE'
          ? {
              name: 'priceCoefficient',
              width: 100,
            }
          : '',
        rankRule === 'WEIGHT_PRICE'
          ? {
              name: 'weightPrice',
              width: 100,
              align: 'right',
              renderer: ({ value }) => {
                if (isNil(value)) {
                  return '-';
                }
                return numberSeparatorRender(value);
              },
            }
          : '',
        useTernaryExpression(doubleUnitFlag, {
          name: 'validNetSecondaryPrice',
          width: 100,
          align: 'right',
          renderer: ({ value, record }) =>
            renderPriceWhetherRed(value, record, 'validNetSecondaryPrice'),
        }),
        {
          name: 'validNetPrice',
          width: 120,
          align: 'right',
          renderer: ({ value, record }) => renderPriceWhetherRed(value, record, 'validNetPrice'),
        },
        {
          name: 'perNetPrice',
          width: 120,
          align: 'right',
          renderer: ({ record }) => {
            const { perNetSecondaryPrice, perNetPrice } = record.get([
              'perNetSecondaryPrice',
              'perNetPrice',
            ]);
            return doubleUnitFlag ? perNetSecondaryPrice : perNetPrice;
          },
        },
        {
          name: 'perTaxIncludedPrice',
          width: 120,
          align: 'right',
          renderer: ({ record }) => {
            const { perTaxIncludedSecPrice, perTaxIncludedPrice } = record.get([
              'perTaxIncludedSecPrice',
              'perTaxIncludedPrice',
            ]);
            return doubleUnitFlag ? perTaxIncludedSecPrice : perTaxIncludedPrice;
          },
        },
        {
          name: 'referencePrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        multiCurrencyFlag
          ? {
              name: 'baseQuotationPrice',
              align: 'right',
              width: 100,
              renderer: ({ value, record }) =>
                renderPriceWhetherRed(value, record, 'baseQuotationPrice'),
            }
          : '',
        multiCurrencyFlag
          ? {
              name: 'baseNetPrice',
              align: 'right',
              width: 100,
              renderer: ({ value, record }) => renderPriceWhetherRed(value, record, 'baseNetPrice'),
            }
          : '',
        {
          name: 'quotationDetailFlag',
          width: 100,
          renderer: ({ record }) => {
            const currentQuotationDetailProps = {
              rowData: record,
              uiType: 'c7n-pro',
            };

            return (
              <QuotationDetail
                rowData={record}
                sourceFrom="RFX"
                allowBuyerViewFlag
                pageFrom="checkPriceDetail"
                bidFlag={bidFlag}
                {...currentQuotationDetailProps}
              />
            );
          },
        },
        {
          name: 'newPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'priceBatchQuantity',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        useTernaryExpression(doubleUnitFlag, {
          name: 'allottedSecondaryQuantity',
          width: 100,
        }),
        {
          name: 'allottedRatio',
          width: 120,
        },
        {
          name: 'allottedQuantity',
          width: 120,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'quotationLineStatusMeaning',
          width: 100,
        },
        {
          name: 'stageDescription',
          width: 100,
        },
        {
          name: 'taxIncludedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'taxRate',
          width: 100,
        },
        {
          name: 'suggestedRemark',
          width: 100,
        },
        {
          name: 'ladderInquiryFlag',
          width: 100,
          renderer: ({ value, record }) => {
            return value === 1 ? (
              <a onClick={() => viewLadderLevelQuota({ record })}>
                {intl.get(`ssrc.inquiryHall.view.message.button.ladderInquiryFlag`).d('阶梯报价')}
              </a>
            ) : (
              '-'
            );
          },
        },
        {
          name: 'preQuotationPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'priceFluctuation',
          width: 100,
          align: 'right',
        },
        {
          name: 'initialFluctuation',
          width: 130,
        },
        useTernaryExpression(doubleUnitFlag, {
          name: 'secondaryQuantity',
          width: 100,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        }),
        useTernaryExpression(doubleUnitFlag, {
          name: 'validQuotationSecQuantity',
          width: 100,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        }),
        {
          name: 'rfxQuantity',
          width: 100,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'validQuotationQuantity',
          width: 120,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'totalPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'netAmount',
          width: 140,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'estimatedPrice',
          width: 140,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'netEstimatedPrice',
          width: 140,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'estimatedAmount',
          width: 140,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'netEstimatedAmount',
          width: 140,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'validQuotationRemark',
          width: 120,
        },
        {
          name: 'paymentTypeName',
          width: 120,
        },
        {
          name: 'paymentTermName',
          width: 120,
        },
        {
          name: 'attachmentUuid',
          width: 150,
          renderer: ({ value, record }) => {
            return !newQuotationFlag ? (
              <Upload
                filePreview
                viewOnly
                icon="download"
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="ssrc-rfx-quotationline"
                attachmentUUID={value}
                tenantId={organizationId}
              />
            ) : (
              <FileGroup name="attachmentUuid" record={record} uiType="c7n-pro" fileType="LINE" />
            );
          },
        },
        {
          name: 'origin',
          width: 120,
        },
        {
          name: 'validExpiryDateFrom',
          width: 150,
        },
        {
          name: 'validExpiryDateTo',
          width: 150,
        },
        {
          name: 'validPromisedDate',
          width: 120,
        },
        {
          name: 'specs',
          width: 100,
        },
        {
          name: 'validDeliveryCycle',
          width: 120,
        },
        {
          name: 'minPurchaseQuantity',
          width: 120,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'minPackageQuantity',
          width: 100,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'freightIncludedFlag',
          width: 100,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'freightAmount',
          width: 100,
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'quotedDate',
          width: 150,
        },
        {
          name: 'rfxLineItemNum',
          width: 60,
        },
        {
          name: 'changePercent',
          width: 100,
        },
        {
          name: 'minPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'supplierSavingAmount',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'supplierSavingRatio',
          width: 100,
          renderer: ({ value }) => {
            return !isNil(value) ? `${value}%` : '';
          },
        },
        {
          name: 'supplierMinMaxSuggestedRatio',
          width: 100,
          renderer: ({ value }) => {
            return !isNil(value) ? `${value}%` : '';
          },
        },
        {
          name: 'itemSavingAmount',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'itemSavingRatio',
          width: 100,
          renderer: ({ value }) => {
            return !isNil(value) ? `${value}%` : '';
          },
        },
        {
          name: 'itemMinMaxSuggestedFlag',
          width: 120,
          renderer: ({ value }) => yesOrNoRender(value),
        },
        {
          name: 'quotationLineSavingAmount',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'quotationLineSavingRatio',
          width: 100,
          renderer: ({ value }) => {
            return !isNil(value) ? `${value}%` : '';
          },
        },
        {
          name: 'itemSignPostPrice',
          width: 100,
          align: 'right',
          renderer: ({ value }) => {
            if (isNil(value)) {
              return '-';
            }
            return numberSeparatorRender(value);
          },
        },
        {
          name: 'comparePriceHistory',
          width: 150,
          renderer: ({ record }) => {
            const { quotationLineId } = record.get(['quotationLineId']);

            return quotationLineId !== null ? (
              <a onClick={() => onComparePriceHistory(record)}>
                {intl.get(`hzero.common.button.view`).d('查看')}
              </a>
            ) : (
              ''
            );
          },
        },
        {
          name: 'applicationScopeFlag',
          width: 100,
          renderer: ({ record }) => {
            const { applicationScopeFlag, rfxLineItemId } = record.get([
              'applicationScopeFlag',
              'rfxLineItemId',
            ]);

            return (
              <a
                disabled={!applicationScopeFlag}
                onClick={() =>
                  viewApplicationOrgModal({ sourceLineItemId: rfxLineItemId, applicationScopeFlag })
                }
              >
                {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
              </a>
            );
          },
        },
        {
          name: 'differentPrice',
          width: 120,
          align: 'right',
          renderer: rendererDifferencepriceValue,
        },
      ].filter(Boolean),
    [multiCurrencyFlag, rankRule, newQuotationFlag, bidFlag, doubleUnitFlag]
  );

  const basicProps = {
    basicInfoDS: basicInfoDs,
    customizeForm,
    viewApplicationOrgModal,
    getCustomizeUnitCode,
  };

  const costProps = {
    basicInfoDS: basicInfoDs,
    customizeForm,
    getCustomizeUnitCode,
  };

  return (
    <React.Fragment>
      <TopSection
        title={intl.get(`ssrc.inquiryHall.view.message.tab.quoteLine`).d('全部报价明细')}
        className={`${styles['approval-common-top-section-card']}`}
        getHocInstance={getHocInstance}
        code={getCustomizeUnitCode('tableCard')}
      >
        {customizeTable(
          {
            code: getCustomizeUnitCode('table'),
          },
          <SearchBarTable
            cacheState
            dataSet={itemTableDs}
            columns={columns}
            searchCode={getCustomizeUnitCode('tableFilter')}
            style={{ maxHeight: '430px' }}
            searchBarConfig={{
              autoQuery: true,
              closeFilterSelector: true,
              expandable: false,
              isTemplate: true,
              templateConfig: { ...templateInfo },
              fieldProps: {
                rfxLineSupplierIds: {
                  lovPara: {
                    rfxHeaderId,
                    secondarySourceCategory: basicInfoDs?.current?.get('secondarySourceCategory'),
                  },
                },
                rfxLineItemIds: {
                  lovPara: {
                    rfxHeaderId,
                  },
                },
              },
            }}
          />
        )}
      </TopSection>
      <TopSection
        title={intl.get(`ssrc.inquiryHall.view.title.basicInformation`).d('基本信息')}
        className={`${styles['approval-common-top-section-card']}`}
        style={{ marginTop: '8px' }}
        getHocInstance={getHocInstance}
        code={getCustomizeUnitCode('basicInfoCard')}
      >
        <h3
          className={styles['card-sub-title']}
          style={{ marginBottom: '16px', marginTop: '16px' }}
        >
          <div className={styles['card-sub-title-line']} />
          {intl.get(`ssrc.inquiryHall.view.title.basicInformation`).d('基本信息')}
        </h3>
        <BasicInfoForm {...basicProps} />
        <h3 className={styles['card-sub-title']} style={{ marginBottom: '16px' }}>
          <div className={styles['card-sub-title-line']} />
          {intl.get(`ssrc.inquiryHall.view.message.panel.costComments`).d('成本备注')}
        </h3>
        <CostRemarkForm {...costProps} />
      </TopSection>
      <TopSection
        title={intl.get(`ssrc.common.model.common.attachments`).d('附件')}
        className={`${styles['approval-common-top-section-card']}`}
        style={{ marginTop: '8px' }}
        getHocInstance={getHocInstance}
        code={getCustomizeUnitCode('attachmentCard')}
      >
        {fileTemplateManageFlag !== 1 ? (
          <AttachmentForm
            attachmentDs={attachmentDs}
            customizeForm={customizeForm}
            getCustomizeUnitCode={getCustomizeUnitCode}
          />
        ) : (
          <FileTemplateAttachmentCheckPricePage
            customizeTable={customizeTable}
            tableAttachmentDs={tableAttachmentDs}
            getCustomizeUnitCode={getCustomizeUnitCode}
          />
        )}
      </TopSection>
    </React.Fragment>
  );
};

export default observer(ContentTable);
