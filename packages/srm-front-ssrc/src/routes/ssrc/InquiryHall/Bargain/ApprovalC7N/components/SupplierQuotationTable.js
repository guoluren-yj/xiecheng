import React, { useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { Table, Modal, DataSet } from 'choerodon-ui/pro';
import { noop, isEmpty } from 'lodash';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender, renderRedMinPrice } from '@/utils/renderer';
import { getQuotationName } from '@/utils/globalVariable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { renderStatusTag } from '@/routes/ssrc/RFSupplierQuotation/util';

import { StoreContext } from '../store/StoreProvider';
import TabList from './TabList';
import LadderLevel from './LadderLevel';
import { LadderLevelModalDS } from '../store/storeDS';

const SupplierQuotationTable = () => {
  const {
    commonDs: { supplierQuotationTableDs, basicFormDs },
    bidFlag = false,
    organizationId,
    templateInfo = {},
    doubleUnitFlag = false,
    supplierList = [],
    rfxHeaderSnapId,
    getCustomizeUnitCode = noop,
    customizeTable = noop,
  } = useContext(StoreContext);

  const { current } = basicFormDs || {};

  const [activateId, setActivateId] = useState('');

  // 初始化激活的供应商
  useEffect(() => {
    if (!isEmpty(supplierList)) {
      const rfxLineSupplierId = supplierList[0]?.rfxLineSupplierId || '';
      setActivateId(rfxLineSupplierId);
      supplierQuotationTableDs.setState('doubleUnitFlag', doubleUnitFlag);
      supplierQuotationTableDs.setQueryParameter('commonProps', {
        templateInfo,
        rfxHeaderSnapId,
        rfxLineSupplierId,
        rfxHeaderId: current?.get('rfxHeaderId'),
        customizeUnitCode: getCustomizeUnitCode('supplierList'),
      });
      supplierQuotationTableDs.query();
    }
  }, [supplierList, templateInfo, current, rfxHeaderSnapId]);

  // 每个供应商点击事件
  const handleClick = useCallback(
    (id) => {
      setActivateId(id);
      supplierQuotationTableDs.setQueryParameter('commonProps', {
        templateInfo,
        rfxHeaderSnapId,
        rfxLineSupplierId: id,
        rfxHeaderId: current?.get('rfxHeaderId'),
        customizeUnitCode: getCustomizeUnitCode('supplierList'),
      });
      supplierQuotationTableDs.query();
    },
    [
      supplierQuotationTableDs,
      activateId,
      getCustomizeUnitCode,
      templateInfo,
      current,
      rfxHeaderSnapId,
    ]
  );

  // 点击阶梯报价
  const handleLadderOffer = (record = {}) => {
    const ladderQuotationTableDs = new DataSet(
      LadderLevelModalDS({
        organizationId,
        lineRecord: record,
      })
    );

    const Props = {
      record,
      doubleUnitFlag,
      customizeTable,
      getCustomizeUnitCode,
      ladderQuotationTableDs,
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

  // 单位
  const renderUom = (_, record = {}) => {
    const { uomCode: code = '', uomName: name = '' } = record;

    return code && name ? `${code}/${name}` : `${code || name || ''}`;
  };

  const columns = useMemo(() => {
    return [
      {
        name: 'quotationLineStatusMeaning',
        width: 160,
        renderer: ({ value, record }) => {
          const { quotationLineStatus } = record.get(['quotationLineStatus']);

          return renderStatusTag({
            status: quotationLineStatus,
            statusMeaning: value,
          });
        },
      },
      {
        name: 'rfxLineItemNum',
        width: 80,
      },
      {
        name: 'itemCategoryName',
        width: 120,
      },
      {
        name: 'itemCode',
        width: 100,
      },
      {
        name: 'itemName',
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
          }
        : null,
      {
        name: 'validQuotationPrice',
        width: 120,
        renderer: ({ value, record }) =>
          renderRedMinPrice({ value, record, name: 'validQuotationPrice', isNeedSeparator: false }),
      },
      doubleUnitFlag
        ? {
            name: 'validNetSecondaryPrice',
            width: 100,
          }
        : null,
      {
        name: 'validNetPrice',
        width: 120,
        renderer: ({ value, record }) =>
          renderRedMinPrice({ value, record, name: 'validNetPrice', isNeedSeparator: false }),
      },
      {
        name: 'preQuotationPrice',
        width: 100,
      },
      {
        name: 'priceFluctuation',
        width: 100,
      },
      {
        name: 'currentBargainPrice',
        width: 120,
      },
      {
        name: 'currentBargainRemark',
        width: 100,
      },
      {
        name: 'validBargainPrice',
        width: 130,
      },
      {
        name: 'validBargainRemark',
        width: 120,
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
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => handleLadderOffer(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : null,
      },
      {
        name: 'quotationDetailFlag',
        width: 100,
        renderer: ({ record }) => (
          <QuotationDetail
            rowData={record}
            bidFlag={bidFlag}
            sourceFrom="RFX"
            allowBuyerViewFlag
            pageFrom="bargainApprove"
            uiType="c7n-pro"
            buttonText={intl.get(`hzero.common.button.view`).d('查看')}
          />
        ),
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 100,
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'rfxQuantity',
        width: 120,
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      doubleUnitFlag
        ? {
            name: 'validQuotationSecQuantity',
            width: 100,
          }
        : null,
      {
        name: 'validQuotationQuantity',
        width: 120,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 120,
          }
        : null,
      {
        name: 'uomName',
        width: 100,
        renderer: ({ value, record }) => renderUom(value, record),
      },
      {
        name: 'validExpiryDateFrom',
        width: 120,
      },
      {
        name: 'validExpiryDateTo',
        width: 120,
      },
      {
        name: 'validPromisedDate',
        width: 120,
      },
      {
        name: 'validDeliveryCycle',
        width: 120,
      },
      {
        name: 'minPurchaseQuantity',
        width: 100,
      },
      {
        name: 'minPackageQuantity',
        width: 100,
      },
      {
        name: 'freightIncludedFlag',
        width: 100,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'freightAmount',
        width: 100,
      },
      {
        name: 'quotedDate',
        width: 150,
      },
      {
        name: 'companyName',
        width: 120,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 150,
      },
    ].filter(Boolean);
  }, [doubleUnitFlag, basicFormDs?.current, bidFlag]);

  const tabListProps = useMemo(() => {
    return {
      activateId,
      onClick: handleClick,
      tabList: supplierList,
      primaryKey: 'rfxLineSupplierId',
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
