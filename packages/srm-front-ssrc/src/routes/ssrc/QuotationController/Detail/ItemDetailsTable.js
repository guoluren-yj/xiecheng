import React, { PureComponent } from 'react';
import { sum, isNumber } from 'lodash';
import { Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { dateRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import EditTable from 'components/EditTable';
import Upload from 'srm-front-boot/lib/components/Upload';
// import LadderLevel from '../../components/LadderLevel';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import ItemLineQutationDetailModal from '@/routes/ssrc/components/ItemLineQutationDetailModal';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import OperationItemRecord from './OperationItemRecord';
import LadderLevel from '../../InquiryHall/Detail/LadderLevelModal';

const promptCode = 'ssrc.quoController';

@formatterCollections({ code: ['ssrc.inquiryHall'] })
export default class ItemDetailsTable extends PureComponent {
  state = {
    itemViewModalVisible: false,
    itemIds: undefined,
  };

  /**
   * 根据浮动方式调整报价幅度单位
   */
  @Bind()
  handleFloatingWay(val) {
    let mean = '';
    if (val) {
      if (val === 'money') {
        mean = intl.get(`ssrc.inquiryHall.view.message.floatingMoney`).d('金额（元）');
      } else {
        mean = intl.get(`ssrc.inquiryHall.view.message.floatingRatio`).d('比率（%）');
      }
    }
    return mean;
  }

  /**
   * 根据浮动方式调整报价幅度单位
   */
  @Bind()
  handleQuotationRange(value, record) {
    let mean = '';
    if (isNumber(value) && record.floatType) {
      if (record.floatType === 'money') {
        mean = `${value}${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}`;
      } else {
        mean = `${value}%`;
      }
    }
    return mean;
  }

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
   * 保存Uuid
   */
  afterOpenUploadModal = (attachmentUUID) => {
    const { attachmentList = [] } = this.props;
    const { investgCfAttTemplId } = this.state;

    const index = attachmentList.findIndex((item) => item[this.rowKey] === investgCfAttTemplId);
    const newAttachmentList = [
      ...attachmentList.slice(0, index),
      {
        ...attachmentList[index],
        purchaseTemplUuid: attachmentUUID,
      },
      ...attachmentList.slice(index + 1),
    ];

    this.updateState('attachmentList', newAttachmentList);
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { itemViewModalVisible, itemIds } = this.state;
    const {
      loading,
      dataSource = [],
      pagination,
      onSearch,
      organizationId,
      supplierDataSource = [],
      hideModal,
      viewLadderLevel,
      quotaLadderLevelData,
      viewLadderLevelVisible,
      LadderLevelHeaderData,
      fetchLadderLevelTableLoading,
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetail,
      cancelItemLineQutationDetail,
      sureItemLineQutationDetail,
      itemLineQuotationDetailModalVisible,
      customizeTable = () => {},
      linktoPrNumDetail,
    } = this.props;
    const ladderLevelModalProps = {
      visible: viewLadderLevelVisible,
      hideModal,
      ladderLevelData: quotaLadderLevelData,
      LadderLevelHeaderData,
      fetchLadderLevelLoading: fetchLadderLevelTableLoading,
    };
    const itemViewModalProps = {
      visible: itemViewModalVisible,
      itemIds,
      hideModal: this.hideOperationRecord,
      supplierDataSource,
      customizeTable,
    };

    const QuotationDetailModalProps = {
      showQuotationAttachmentNeedFlag: true,
      showSupplierAttachment: false,
      organizationId,
      fetchItemLineQuotationDetailLoading,
      itemLineQuotationDetail,
      cancelItemLineQutationDetail,
      sureItemLineQutationDetail,
      itemLineQuotationDetailModalVisible,
    };

    const columns = [
      {
        title: intl.get(`${promptCode}.model.quoController.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 80,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.quotationStartTime`).d('报价开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.quotationDeadline`).d('报价截止时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.filterSupplier`).d('筛选供应商'),
        dataIndex: 'uoSelect',
        width: 100,
        render: (_, record) => (
          <span>
            <a onClick={() => this.viewItemDetail(record)}>
              {intl.get('hzero.common.button.view').d('查看')}
            </a>
          </span>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 100,
      },
      // {
      //   title: intl.get(`${promptCode}.model.quoController.itemName`).d('物品描述'),
      //   dataIndex: 'itemName',
      //   width: 100,
      // },
      {
        title: intl.get(`${promptCode}.model.quoController.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        dataIndex: 'specs',
        width: 80,
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
        title: intl.get(`${promptCode}.model.quoController.quotationDetail`).d('报价明细'),
        width: 100,
        dataIndex: 'quotationDetailFlag',
        render: (val, record) => (
          <React.Fragment>{<QuotationDetail rowData={record} sourceFrom="RFX" />}</React.Fragment>
        ),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.quantity`).d('需求数量'),
        dataIndex: 'rfxQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.taxInclude`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.taxRate`).d('税率（%）'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式'),
        dataIndex: 'floatType',
        width: 140,
        render: (val) => this.handleFloatingWay(val),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.quotationRange`).d('报价幅度'),
        dataIndex: 'quotationRange',
        width: 100,
        render: (val, record) => this.handleQuotationRange(val, record),
      },
      {
        title: intl.get(`${promptCode}.model.quoController.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.startLadderLevel`).d('启用阶梯报价'),
        dataIndex: 'ladderInquiryFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.LadderLevel`).d('阶梯报价'),
        dataIndex: 'ladderOffer',
        width: 100,
        render: (val, record) =>
          record.ladderInquiryFlag === 1 ? (
            <a onClick={() => viewLadderLevel(record)}>
              {intl.get(`${promptCode}.model.quoController.LadderLevel`).d('阶梯报价')}
            </a>
          ) : null,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.requisitionNo.`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 150,
        render: (val, record) => <a onClick={() => linktoPrNumDetail(record)}> {val}</a>,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.requisitionLineNo.`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.quoController.RFxAttachment`).d('询价单附件'),
        dataIndex: 'attachmentUuid',
        width: 110,
        render: (val) => (
          <Upload
            filePreview
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            attachmentUUID={val}
            tenantId={organizationId}
            icon="download"
            viewOnly
          />
        ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SSRC.QUOTATION_CONTROLLER_DETAIL.ITEM_LINE', readOnly: true },
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
        {viewLadderLevelVisible && <LadderLevel {...ladderLevelModalProps} />}
        {itemLineQuotationDetailModalVisible ? (
          <ItemLineQutationDetailModal {...QuotationDetailModalProps} />
        ) : null}
      </React.Fragment>
    );
  }
}
