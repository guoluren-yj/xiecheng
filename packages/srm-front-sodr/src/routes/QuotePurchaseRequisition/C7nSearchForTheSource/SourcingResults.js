import React, { useCallback, useEffect, useMemo } from 'react';
import { Modal, Table } from 'choerodon-ui/pro';
import querystring from 'querystring';

import intl from 'utils/intl';

import LadderInquiryModal from '../components/LadderInquiryModal';

const SourcingResults = (props) => {
  const { dataSet, history, customizeTable } = props;

  useEffect(() => {
    dataSet.query();
  }, []);
  const toSourceDetail = useCallback((record) => {
    const { sourceHeaderId, sourceFrom, subjectMatterRule } = record.get([
      'sourceHeaderId',
      'sourceFrom',
      'subjectMatterRule',
    ]);
    if (sourceFrom === 'RFX') {
      history.push({
        pathname: `/sodr/purchase-order-maintain/source-from-requisition/query-rfq/${sourceHeaderId}`,
        search: querystring.stringify({
          libFlag: `order`,
          rfxStatus: subjectMatterRule,
          sourcePage: 'order',
        }),
      });
    } else {
      history.push({
        pathname: `/sodr/purchase-order-maintain/source-from-requisition/bid-event-query/${sourceHeaderId}`,
        search: querystring.stringify({ source: record.subjectMatterRule }),
      });
    }
  }, []);

  const showLadderInquiry = useCallback((record) => {
    const { itemCode, itemName, sourceLineItemId } = record.get([
      'itemCode',
      'itemName',
      'sourceLineItemId',
    ]);
    const modalProps = {
      sourceLineItemId,
      headerData: {
        itemCode,
        itemName,
      },
    };
    Modal.open({
      children: <LadderInquiryModal {...modalProps} />,
    });
  }, []);
  const columns = useMemo(
    () => [
      {
        name: 'sourceNum',
        width: 180,
        renderer: ({ record, value }) => <a onClick={() => toSourceDetail(record)}>{value}</a>,
      },
      {
        name: 'itemNum',
        width: 80,
      },
      {
        name: 'supplierCompanyNum',
        width: 120,
        renderer: ({ record }) =>
          record.get('supplierCompanyNum') || record.get('erpSupplierCompanyNum'),
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        renderer: ({ record }) =>
          record.get('supplierCompanyName') || record.get('erpSupplierCompanyName'),
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'itemCode',
        width: 100,
      },
      {
        name: 'itemName',
        width: 120,
      },
      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'currencyCode',
        width: 100,
      },
      {
        name: 'uomName',
        width: 100,
        renderer: ({ record }) => record.get('uomCodeAndName'),
      },
      {
        name: 'quantity',
        width: 100,
      },
      {
        name: 'changeQuantity',
        width: 120,
        editor: (record) => record.isSelected,
      },
      {
        name: 'occupationQuantity',
        width: 200,
      },
      {
        name: 'remainQuantity',
        width: 200,
      },
      {
        name: 'taxRate',
        width: 100,
      },
      {
        name: 'unitPrice',
        width: 100,
      },
      {
        name: 'netAmount',
        width: 100,
      },
      {
        name: 'taxprice',
        width: 100,
      },
      {
        name: 'taxAmount',
        width: 100,
      },
      {
        name: 'priceBatchQuantity',
        width: 100,
      },
      {
        name: 'validPromisedDate',
        width: 120,
      },
      {
        name: 'ladderInquiryFlag',
        width: 100,
        renderer: ({ value, record }) =>
          value === 1 ? (
            <a onClick={() => showLadderInquiry(record)}>
              {intl.get(`sodr.orderMaintain.sourceFrom.ladderInquiryFlag`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'purOrganizationName',
        width: 120,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        name: 'realName',
        width: 100,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        name: 'prNumAndLineNum',
        width: 150,
        renderer: ({ value }) => (value === '|' ? null : value),
      },
      {
        name: 'itemRemark',
        width: 100,
      },
    ],
    []
  );
  const tableProps = { dataSet, columns, virtual: true };
  return customizeTable(
    { code: 'SODR.PURCHASE_SOURCE_LIST.LINE', filterCode: 'SODR.PURCHASE_SOURCE_LIST.FILTER' },
    <Table {...tableProps} />
  );
};

export default SourcingResults;
