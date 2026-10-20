import React from 'react';
import { Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import DocFlow from '_components/DocFlow';

import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

import { numberSeparatorRender } from '@/utils/renderer';

// 物料详情卡片
const ItemLineDetailCmp = observer((props) => {
  const { ds, doubleUnitFlag, headerDs, customizeTable, getCustomizeUnitCode } = props || {};

  const {
    projectFrom, // 立项单来源
    subjectMatterRule, // 是否分标段
  } = headerDs?.current?.get(['projectFrom', 'subjectMatterRule']) || {};

  const columns = [
    {
      name: 'projectLineItemNum',
    },
    {
      title: intl.get('ssrc.inquiryHall.model.inquiryHall.docFlow').d('单据流'),
      name: 'docFlow',
      width: 80,
      renderer: ({ record }) => (
        <DocFlow tableName="ssrc_project_line_item" tablePk={record?.get('projectLineItemId')} />
      ),
    },
    {
      name: 'ouName',
      width: 180,
    },
    {
      name: 'invOrganizationName',
      width: 180,
    },
    {
      name: 'itemCode',
    },
    {
      name: 'itemName',
    },
    {
      name: 'itemCategoryName',
    },
    {
      name: 'specifications',
    },
    doubleUnitFlag
      ? {
          name: 'secondaryQuantity',
        }
      : null,
    {
      name: 'requiredQuantity',
    },
    doubleUnitFlag
      ? {
          name: 'secondaryUomName',
        }
      : null,
    {
      name: 'uomName',
    },
    {
      name: 'priceBatch',
    },
    !doubleUnitFlag
      ? {
          name: 'costPrice',
          renderer: ({ value }) => numberSeparatorRender(value),
        }
      : null,
    !doubleUnitFlag
      ? {
          name: 'totalPrice',
          renderer: ({ value }) => numberSeparatorRender(value),
        }
      : null,
    {
      name: 'estimatedPrice',
      renderer: ({ value }) => numberSeparatorRender(value),
    },
    {
      name: 'estimatedAmount',
      renderer: ({ value }) => numberSeparatorRender(value),
    },
    {
      name: 'templateName',
    },
    {
      name: 'quotationDetail',
      renderer: ({ record }) => (
        <QuotationDetail rowData={record} uiType="c7n" sourceFrom="PROJECT" />
      ),
    },
    {
      name: 'itemRemark',
    },
    {
      name: 'itemAttachmentUuid',
    },
    projectFrom === 'REFERENCE'
      ? {
          name: 'prNum',
        }
      : null,
    projectFrom === 'REFERENCE'
      ? {
          name: 'prDisplayLineNum',
        }
      : null,
    {
      name: 'requestUserName',
    },
    {
      name: 'projectTaskName',
    },
    {
      name: 'executingStatusMeaning',
    },
    {
      name: 'occupiedQuantity',
    },
    {
      name: 'executableQuantity',
    },
    subjectMatterRule === 'PACK'
      ? {
          name: 'sectionCode',
        }
      : null,
    subjectMatterRule === 'PACK'
      ? {
          name: 'sectionName',
        }
      : null,
  ];

  return customizeTable(
    {
      code: getCustomizeUnitCode('itemDetailTable'),
      dataSet: ds,
    },
    <Table dataSet={ds} columns={columns} />
  );
});

export default ItemLineDetailCmp;
