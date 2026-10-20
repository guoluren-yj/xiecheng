import React, { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Table, Modal } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import { StoreContext } from '../store/StoreProvider';
import TabList from './TabList';
import LadderLevel from './LadderLevel';

const SupplierQuotationTable = () => {
  const {
    commonDs: { supplierQuotationTableDs, basicFormDs, ladderLevelModalDS },
    bidFlag = false,
    templateInfo = {},
    doubleUnitFlag = false,
    sourceHeaderId,
    organizationId,
    supplierList = [],
    getCustomizeUnitCode = noop,
    customizeTable = noop,
  } = useContext(StoreContext);

  const [activateId, setActivateId] = useState('');

  // 初始化激活的供应商
  useEffect(() => {
    if (!isEmpty(supplierList)) {
      const quotationHeaderId = supplierList[0]?.quotationHeaderId || '';
      setActivateId(quotationHeaderId);
      supplierQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
      supplierQuotationTableDs.setQueryParameter('commonProps', {
        templateInfo,
        quotationHeaderId,
        customizeUnitCode: getCustomizeUnitCode('supplierList'),
      });
      supplierQuotationTableDs.query();
    }
  }, [supplierList, templateInfo]);

  // 每个供应商点击事件
  const handleClick = useCallback(
    (id) => {
      setActivateId(id);
      supplierQuotationTableDs.setQueryParameter('commonProps', {
        templateInfo,
        quotationHeaderId: id,
        customizeUnitCode: getCustomizeUnitCode('supplierList'),
      });
      supplierQuotationTableDs.query();
    },
    [supplierQuotationTableDs, activateId, getCustomizeUnitCode, templateInfo]
  );

  // 点击阶梯报价
  const handleLadderOffer = (record = {}) => {
    const recordData = record.toData() || {};
    const { quotationLineId } = recordData || {};

    ladderLevelModalDS.setQueryParameter('commonProps', {
      templateInfo,
      organizationId,
      sourceHeaderId,
      quotationLineId,
      customizeUnitCode: getCustomizeUnitCode('ladderLevel'),
    });
    ladderLevelModalDS.setState('doubleUnitFlag', doubleUnitFlag);
    ladderLevelModalDS.query();

    const Props = {
      recordData,
      doubleUnitFlag,
      customizeTable,
      ladderLevelModalDS,
      getCustomizeUnitCode,
    };

    Modal.open({
      destroyOnClose: true,
      closable: true,
      drawer: true,
      style: {
        width: '742px',
      },
      key: 'ssrc-price-clarification-ladder-price',
      title: intl.get(`ssrc.inquiryHall.view.message.title.ladderLevelQuot`).d('阶梯报价'),
      children: <LadderLevel {...Props} />,
      cancelText: intl.get('ssrc.inquiryHall.model.inquiryHall.closed').d('关闭'),
      footer: (_, cancelBtn) => cancelBtn,
      cancelProps: {
        color: 'primary',
      },
    });
  };

  const columns = useMemo(() => {
    const benchmarkPriceType = basicFormDs?.current?.get?.('benchmarkPriceType');
    const isUnTaxPriceFlag = benchmarkPriceType && benchmarkPriceType === 'NET_PRICE';
    return [
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 120,
      },
      {
        name: 'model',
        width: 100,
      },
      {
        name: 'specs',
        width: 100,
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'newNetSecPrice',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'validQuotationPrice',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'validNetPrice',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'ladderOffer',
        width: 100,
        renderer: ({ record }) => {
          return record.get('ladderInquiryFlag') && record.get('rfxLineItemId') ? (
            <a onClick={() => handleLadderOffer(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : null;
        },
      },
      {
        name: 'quotationDetail',
        width: 100,
        align: 'left',
        renderer: ({ record }) => (
          <QuotationDetail
            bidFlag={bidFlag}
            rowData={record}
            sourceFrom="RFX"
            uiType="c7n-pro"
            allowBuyerViewFlag
            buttonText={intl.get(`hzero.common.button.view`).d('查看')}
          />
        ),
      },
      doubleUnitFlag
        ? !isUnTaxPriceFlag
          ? {
              name: 'lastQuotationSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
          : {
              name: 'lastNetSecPrice',
              width: 100,
              // align: 'left',
              renderer: ({ value }) => numberSeparatorRender(value),
            }
        : !isUnTaxPriceFlag
        ? {
            name: 'lastQuotationPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : {
            name: 'lastNetPrice',
            width: 100,
            // align: 'left',
            renderer: ({ value }) => numberSeparatorRender(value),
          },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'validQuotationQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'rfxQuantity',
        width: 100,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'origin',
        width: 100,
      },
      {
        name: 'validExpiryDateFrom',
      },
      {
        name: 'validExpiryDateTo',
      },
      {
        name: 'validPromisedDate',
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'validQuotationRemark',
      },
      {
        name: 'minPurchaseQuantity',
      },
      {
        name: 'minPackageQuantity',
      },
      {
        name: 'freightIncludedFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freightAmount',
      },
      {
        name: 'attachmentUuid',
      },
    ].filter(Boolean);
  }, [doubleUnitFlag, basicFormDs?.current]);

  const tabListProps = useMemo(() => {
    return {
      activateId,
      onClick: handleClick,
      tabList: supplierList,
      key: 'quotationHeaderId',
      title: intl
        .get('ssrc.supplierQuotation.model.supQuo.currentQuotationAmountTotalCount', {
          quotationName: getQuotationName(bidFlag),
        })
        .d('{quotationName}总金额'),
    };
  }, [activateId, handleClick, supplierList, bidFlag, getQuotationName]);

  return (
    <React.Fragment>
      {isEmpty(supplierList) ? null : (
        <TabList {...tabListProps}>
          {customizeTable(
            {
              code: getCustomizeUnitCode('supplierList'),
              dataSet: supplierQuotationTableDs,
            },
            <Table
              dataSet={supplierQuotationTableDs}
              columns={columns}
              style={{ maxHeight: '440px' }}
            />
          )}
        </TabList>
      )}
    </React.Fragment>
  );
};

export default observer(SupplierQuotationTable);
