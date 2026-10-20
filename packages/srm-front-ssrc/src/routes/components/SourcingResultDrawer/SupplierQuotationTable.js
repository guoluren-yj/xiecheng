/**
 * 供应商报价情况列表
 */
import React, { PureComponent } from 'react';
import { Table } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import { yesOrNoRender } from 'utils/renderer';
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
              intl.get(`ssrc.common.model.common.noQuotation`).d('未报价')
            )}
          </React.Fragment>
        ),
      },
      {
        name: 'prequalStatusMeaning',
        width: 130,
      },
      {
        name: 'attachmentFlag',
        align: 'left',
        width: 130,
        renderer: ({ value }) => yesOrNoRender(value),
      },
    ];
    return columns;
  }

  render() {
    const { tableDs, customizeTable, bidFlag = false, rfxStatus } = this.props;

    // 区分是报价响应不足个性化按钮还是开标个性化按钮
    const customizeCode =
      rfxStatus === 'LACK_QUOTED'
        ? `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`
        : `SSRC.${bidFlag ? 'BID' : 'INQUIRY'}_HALL.OPERATION_OPEN_BID.SUPPLIER_QUOTATION`;
    return (
      <React.Fragment>
        {customizeTable(
          { code: customizeCode },
          <Table
            columns={this.columns}
            rowKey="rfxLineSupplierId"
            dataSet={tableDs}
            style={{ maxHeight: '430px' }}
          />
        )}
      </React.Fragment>
    );
  }
}

const HOCComponent = (Comp, type = INQUIRY) => {
  return WithCustomizeC7N({
    unitCode: [
      `SSRC.${type}_HALL.LACK_QUOTED.SUPPLIER_QUOTATION`, // 供应商报价情况表格-报价响应不足
      `SSRC.${type}_HALL.OPERATION_OPEN_BID.SUPPLIER_QUOTATION`, // 供应商报价情况表格-开标
    ],
  })(Comp);
};

const BidSupplierQuotationTable = HOCComponent(SupplierQuotationTable, BID);

export default HOCComponent(SupplierQuotationTable, INQUIRY);

export { HOCComponent, SupplierQuotationTable, BidSupplierQuotationTable };
