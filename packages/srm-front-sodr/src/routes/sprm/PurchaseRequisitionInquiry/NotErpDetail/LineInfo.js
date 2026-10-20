import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import { dateRender } from 'utils/renderer';
import UploadModal from 'components/Upload/index';
import intl from 'utils/intl';

import { formatAumont } from '../../../components/utils';
import { BUCKET_NAME } from '@/routes/components/utils/constant';

const commonPrompt = 'sprm.common.model.common';
const modelPrompt = 'sprm.purchaseRequisitionInquiry.model.common';
export default class ListTable extends PureComponent {
  render() {
    const { dataSource, pagination, prSourcePlatform, onChange } = this.props;
    let columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prLineStatusMeaning',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.lineNumber`).d('行号'),
        dataIndex: 'displayLineNum',
        width: 80,
      },
      {
        title: intl.get(`sodr.quotePurchaseRequisition.view.message.projectCategory`).d('项目类别'),
        dataIndex: 'projectCategoryMeaning',
        width: 100,
      },
      {
        title: intl.get('sodr.quotePurchase.model.quotePurchase.accountType').d('账户分配类别'),
        width: 120,
        dataIndex: 'accountAssignTypeCode',
      },
      {
        title: intl.get(`entity.organization.class.inventory`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.productNum`).d('商品编码'),
        dataIndex: 'productNum',
        width: 120,
      },
      {
        title: intl.get(`${commonPrompt}.productName`).d('商品名称'),
        dataIndex: 'productName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.catalogName`).d('商品目录'),
        dataIndex: 'catalogName',
        width: 150,
      },
      {
        title: intl.get(`entity.item.code`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`entity.item.name`).d('物料名称'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.categoryName`).d('物料品类'),
        dataIndex: 'categoryName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
        render: (val, record) => <span>{`${record.uomCode}/${record.uomName}`}</span>,
      },
      {
        title: intl.get(`${commonPrompt}.quantity`).d('数量'),
        dataIndex: 'quantity',
        width: 80,
        render: (value) => formatAumont(value),
      },
      {
        title: intl.get(`${commonPrompt}.taxType`).d('税种'),
        dataIndex: 'taxCode',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.currencyCode`).d('币种'),
        dataIndex: 'currencyCode',
        width: 80,
      },
      {
        title: intl.get(`${commonPrompt}.taxIncludedUnitPrice`).d('预估单价(含税)'),
        dataIndex: 'taxIncludedUnitPrice',
        width: 130,
        align: 'right',
      },
      {
        title: intl.get(`sodr.common.model.common.jdPrice`).d('划线价'),
        dataIndex: 'jdPrice',
        width: 130,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.lineAmount`).d('行金额'),
        dataIndex: 'taxIncludedLineAmount',
        width: 150,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.lineFreight`).d('行运费'),
        dataIndex: 'lineFreight',
        width: 120,
        align: 'right',
      },
      {
        title: intl.get(`${commonPrompt}.neededDate`).d('需求日期'),
        dataIndex: 'neededDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`entity.supplier.tag`).d('供应商'),
        dataIndex: 'supplierName',
        width: 150,
        render: (_, record) => <span>{record.supplierName || record.supplierCompanyName}</span>,
      },
      {
        title: intl.get(`${commonPrompt}.ERPstatus`).d('ERP状态'),
        dataIndex: 'erpStatus',
        width: 110,
      },
      {
        title: intl.get(`${commonPrompt}.handleStatus`).d('执行状态'),
        dataIndex: 'executionStatusMeaning',
        width: 110,
        render: (_, { headerSyncStatus, headerSyncStatusMeaning, executionStatusMeaning } = {}) => {
          return headerSyncStatus === 'SYNC_FAILURE'
            ? headerSyncStatusMeaning
            : executionStatusMeaning;
        },
      },
      {
        title: intl.get(`${modelPrompt}.executionNum`).d('执行单据编号'),
        dataIndex: 'displayExecutionBillNum',
        width: 150,
        render: (
          _,
          {
            headerSyncResponseMsg,
            headerExecutionBillNum,
            executionBillNum,
            executionHeaderBillNum,
            headerSyncStatus,
          } = {}
        ) => {
          const headerBillNum = headerExecutionBillNum || executionHeaderBillNum;
          let otherStatus;
          if (headerBillNum && executionBillNum) {
            otherStatus = `${headerBillNum}|${executionBillNum}`;
          } else {
            otherStatus = headerBillNum || executionBillNum || '';
          }
          return headerSyncStatus === 'SYNC_FAILURE' ? headerSyncResponseMsg : otherStatus;
        },
      },
      {
        title: intl.get(`${commonPrompt}.handlePerson`).d('执行人'),
        dataIndex: 'executorName',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.assignedDate`).d('分配日期'),
        dataIndex: 'assignedDate',
        width: 100,
      },
      {
        title: intl.get(`${modelPrompt}.infoRecord`).d('信息记录'),
        dataIndex: 'infoRecord',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.historicalSheet`).d('历史询价单'),
        dataIndex: 'historicalInquirySheet',
        width: 120,
      },
      {
        title: intl.get(`${modelPrompt}.suspendReason`).d('暂挂原因'),
        dataIndex: 'stayReason',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.closedStatus`).d('关闭状态'),
        dataIndex: 'closedFlagMeaning',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.closedReason`).d('关闭原因'),
        dataIndex: 'closedRemark',
        width: 150,
      },
      {
        title: intl.get(`${modelPrompt}.cancelledStatus`).d('取消状态'),
        dataIndex: 'cancelledFlagMeaning',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 200,
      },
      {
        title: intl.get(`entity.attachment.tag`).d('附件'),
        dataIndex: 'enclosure',
        width: 150,
        render: (_, { attachmentUuid }) => {
          const uploadProps = {
            bucketName: BUCKET_NAME,
            bucketDirectory: 'sprm-pr',
            btnText: intl.get(`entity.attachment.view`).d('附件查看'),
            attachmentUUID: attachmentUuid,
            viewOnly: true,
            showFilesNumber: false,
            icon: false,
          };
          return <UploadModal {...uploadProps} />;
        },
      },
    ];
    if (!['CATALOGUE', 'E-COMMERCE'].includes(prSourcePlatform)) {
      columns.splice(3, 3);
    }
    if (prSourcePlatform !== 'E-COMMERCE') {
      columns = columns.filter(({ dataIndex }) => dataIndex !== 'lineFreight');
    }
    return (
      <Table
        bordered
        columns={
          prSourcePlatform !== 'E-COMMERCE'
            ? columns.filter((item) => item.dataIndex !== 'jdPrice')
            : columns
        }
        rowKey="prLineId"
        pagination={pagination}
        dataSource={dataSource}
        onChange={(page) => onChange(page)}
        scroll={{ x: columns.map((item) => item.width || 0).reduce((sum, val) => sum + val) }}
      />
    );
  }
}
