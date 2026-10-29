/**
 * 供应商报价情况列表
 */
import React, { PureComponent } from 'react';
import { Table, Attachment } from 'choerodon-ui/pro';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { PRIVATE_BUCKET } from '_utils/config';

import intl from 'utils/intl';
import { INQUIRY, BID } from 'srm-front-ssrc/lib/utils/globalVariable';
import { abandonRemarkRender } from 'srm-front-ssrc/lib/utils/renderer';
import { FIlESIZE, ChunkUploadProps } from 'srm-front-ssrc/lib/utils/SsrcRegx';

// 二开：附件列统一渲染为只读链接，点击弹窗查看
const attachmentRender = (name) => ({ record }) => (
  <Attachment
    readOnly
    record={record}
    funcType="link"
    name={name}
    fileSize={FIlESIZE}
    bucketName={PRIVATE_BUCKET}
    viewMode="popup"
    {...ChunkUploadProps}
  />
);

// 二开：技术附件（下发评分人）——创建人可编辑，非创建人只读
const editableAttachmentRender = (name, editable) => ({ record }) => (
  <Attachment
    readOnly={!editable}
    record={record}
    funcType={editable ? undefined : 'link'}
    name={name}
    fileSize={FIlESIZE}
    bucketName={PRIVATE_BUCKET}
    viewMode="popup"
    {...ChunkUploadProps}
  />
);

class SupplierQuotationTable extends PureComponent {
  get columns() {
    // 二开：是否为寻源行创建人，决定商务/技术附件列是否展示
    const { isCreator = false } = this.props;
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
      // 二开：商务附件、技术附件仅创建人可见，非创建人不展示这两列
      ...(isCreator
        ? [
            {
              name: 'businessAttachmentUuid',
              width: 120,
              renderer: attachmentRender('businessAttachmentUuid'),
            },
            {
              name: 'techAttachmentUuid',
              width: 120,
              renderer: attachmentRender('techAttachmentUuid'),
            },
          ]
        : []),
      // 二开：新增技术附件（下发评分人）列，所有人可见，创建人可编辑
      {
        name: 'attributeVarchar11',
        width: 150,
        renderer: editableAttachmentRender('attributeVarchar11', isCreator),
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
