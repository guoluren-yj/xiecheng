import React, { PureComponent } from 'react';
import { sum, isNumber } from 'lodash';
import { Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, yesOrNoRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { getQtyName, getUomName } from '@/utils/utils';
import { numberSeparatorRender } from '@/utils/renderer';
import OperationItemRecord from './OperationItemRecord';

export default class ItemDetailsTable extends PureComponent {
  state = {
    itemViewModalVisible: false, // 打开查看供应商模态框
    itemIds: undefined,
  };

  /**
   * 点击查看打开筛选供应商模态框，查询供应商列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  viewItemDetail(record = {}) {
    const { searchSupplier } = this.props;
    const { rfxLineItemId: itemIds } = record;
    this.setState(
      {
        itemIds,
        itemViewModalVisible: true,
      },
      () => {
        searchSupplier(itemIds);
      }
    );
  }

  /**
   * hideOperationRecord - 关闭筛选供应商弹窗
   */
  @Bind()
  hideOperationRecord() {
    this.setState({ itemViewModalVisible: false, itemIds: undefined });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { itemViewModalVisible, itemIds } = this.state;
    const {
      header: { rfxStatus = '' },
      loading,
      dataSource = [],
      pagination,
      onSearch,
      organizationId,
      viewLadderLevel = () => {},
      supplierDataSource = [],
      customizeTable = () => {},
      linktoPrNumDetail,
      rfx = {},
      doubleUnitFlag = false,
    } = this.props;
    const { unitCodeSymbol, bidFlag = false } = rfx;

    const itemViewModalProps = {
      visible: itemViewModalVisible,
      itemIds,
      hideModal: this.hideOperationRecord,
      supplierDataSource,
    };

    const couldRfxStatusShowQuotationDetailLink =
      rfxStatus === 'NEW' || rfxStatus === 'RELEASE_APPROVING' || rfxStatus === 'RELEASE_REJECTED';

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemName`).d('物料名称'),
        width: 150,
        dataIndex: 'itemName',
        render: (value) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        dataIndex: 'specs',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        dataIndex: 'itemCategoryName',
        width: 120,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
            render: (value) => numberSeparatorRender(value),
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: (value) => numberSeparatorRender(value),
      },
      {
        title: getUomName(doubleUnitFlag),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.priceQuantity`).d('价格批量'),
        dataIndex: 'batchPrice',
        align: 'right',
        width: 110,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxRate`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.controlProtocolFlag`).d('控制协议数量'),
        dataIndex: 'controlProtocolFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.startLadderLevel`).d('启用阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价'),
        dataIndex: 'ladderOffer',
        width: 100,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.ladderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        width: 100,
        dataIndex: 'quotationDetailFlag',
        render: (val, record) =>
          couldRfxStatusShowQuotationDetailLink ||
          (!couldRfxStatusShowQuotationDetailLink && record.quotationDetailFlag) ? (
            <QuotationDetail rowData={record} sourceFrom="RFX" bidFlag={bidFlag} />
          ) : null,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        dataIndex: 'floatType',
        width: 140,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        dataIndex: 'quotationRange',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 150,
        render: (val, record) => <a onClick={() => linktoPrNumDetail(record)}> {val}</a>,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.RFxAttachment`).d('询价单附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val) => (
          <Upload
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            attachmentUUID={val}
            tenantId={organizationId}
            icon="download"
            viewOnly
            filePreview
          />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.filterSupplier`).d('筛选供应商'),
        dataIndex: 'uoSelect',
        width: 120,
        render: (_, record) => (
          <span>
            <a onClick={() => this.viewItemDetail(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')}
            </a>
          </span>
        ),
      },
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          { code: `SSRC.${unitCodeSymbol}_DETAIL.ITEM_LINE`, readOnly: true },
          <EditTable
            bordered
            rowKey="rfxLineItemId"
            loading={loading}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={pagination}
            onChange={(page) => onSearch(page)}
          />
        )}
        {itemViewModalVisible && <OperationItemRecord {...itemViewModalProps} />}
      </React.Fragment>
    );
  }
}
