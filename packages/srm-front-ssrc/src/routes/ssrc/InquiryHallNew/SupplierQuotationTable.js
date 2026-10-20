/**
 * 供应商报价情况列表
 */
import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import { INQUIRY, BID } from '@/utils/globalVariable';
import { abandonRemarkRender } from '@/utils/renderer';

class SupplierQuotationTable extends PureComponent {
  get columns() {
    const columns = [
      {
        name: 'supplierCompanyNum',
        width: 120,
      },
      {
        name: 'supplierCompanyName',
        width: 200,
      },
      {
        name: 'feedbackStatusMeaning',
        width: 100,
        renderer: ({ value, record }) => abandonRemarkRender({ val: value, record }),
      },
      {
        name: 'quotationNumber',
        width: 100,
        renderer: ({ value }) => (
          <React.Fragment>
            {value ? (
              <span>{value}</span>
            ) : (
              intl.get(`ssrc.inquiryHall.model.inquiryHall.noQuotation`).d('未报价')
            )}
          </React.Fragment>
        ),
      },
      {
        name: 'prequalStatusMeaning',
        width: 120,
      },
      {
        name: 'attachmentFlagMeaning',
        width: 130,
      },
    ];
    return columns;
  }

  render() {
    const { tableDs, customizeTable, bidFlag = false } = this.props;
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.OPERATION_OPEN_BID.SUPPLIER_QUOTATION`,
          },
          <Table columns={this.columns} dataSet={tableDs} style={{ maxHeight: '430px' }} />
        )}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return WithCustomizeC7N({
    unitCode: [
      `SSRC.${type}_HALL.OPERATION_OPEN_BID.SUPPLIER_QUOTATION`, // 供应商报价情况表格
    ],
  })(Comp);
};

const BidSupplierQuotationTable = HOCComponent(SupplierQuotationTable, BID);

export default HOCComponent(SupplierQuotationTable, INQUIRY);

export { HOCComponent, SupplierQuotationTable, BidSupplierQuotationTable };
