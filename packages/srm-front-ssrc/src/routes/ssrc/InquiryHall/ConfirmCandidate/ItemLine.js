/**
 * inquiryHall - 寻源服务/确认招标候选人 - 物品明细
 * @date: 2019-07-03
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Popover, Table } from 'hzero-ui';
import { sum, isNumber, noop } from 'lodash';
import { Bind } from 'lodash-decorators';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { getDocumentTypeName } from '@/utils/globalVariable';
import { dateRender, dateTimeRender, yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import OperationItemRecord from './OperationItemRecord';

export default class ItemLine extends PureComponent {
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
      bidFlag,
      loading,
      dataSource = [],
      pagination,
      onSearch,
      organizationId,
      viewLadderLevel,
      supplierDataSource = [],
      doubleUnitFlag,
      customizeTable = noop,
    } = this.props;

    const itemViewModalProps = {
      visible: itemViewModalVisible,
      itemIds,
      hideModal: this.hideOperationRecord,
      supplierDataSource,
      viewLadderLevel,
    };
    // const ladderLevelModalProps = {
    //   visible,
    //   hideModal,
    //   ladderLevelData,
    //   LadderLevelHeaderData,
    //   fetchLadderLevelLoading,
    // };

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.startTime`).d('开始时间'),
        dataIndex: 'quotationStartDate',
        width: 150,
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.endTime`).d('结束时间'),
        dataIndex: 'quotationEndDate',
        width: 150,
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.filter`).d('筛选'),
        dataIndex: 'uoSelect',
        width: 80,
        render: (_, record) => (
          <span>
            <a onClick={() => this.viewItemDetail(record)}>
              {intl.get(`ssrc.inquiryHall.view.message.button.view`).d('查看')}
            </a>
          </span>
        ),
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
        title: intl.get(`ssrc.common.goodsSorts`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specs`).d('规格'),
        dataIndex: 'specs',
        width: 80,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemNote`).d('物品说明'),
        dataIndex: 'itemRemark',
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.deliveryAddress`).d('送货地址'),
        dataIndex: 'deliveryAddress',
        width: 120,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'secondaryQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'secondaryUomName',
        width: 100,
      },
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.inquiryHall.basicQuantity`).d('基本数量'),
            dataIndex: 'rfxQuantity',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.common.model.inquiryHall.basicUomName`).d('基本单位'),
            dataIndex: 'uomName',
            width: 100,
          }
        : null,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度'),
        dataIndex: 'quotationRange',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.minimumPrice`).d('最低限价'),
        dataIndex: 'minLimitPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.maximumPrice`).d('最高限价'),
        dataIndex: 'maxLimitPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.costPrice`).d('成本单价'),
        dataIndex: 'costPrice',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.needSample`).d('需要样品'),
        dataIndex: 'sampleRequestedFlag',
        width: 100,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.neededDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: dateRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetails',
        width: 100,
        render: (_, record) => <QuotationDetail rowData={record} sourceFrom="RFX" bidFlag={bidFlag} />,
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
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prDisplayLineNum',
        width: 120,
      },
      {
        title: intl
          .get(`ssrc.inquiryHall.model.inquiryHall.commonRFxAttachment`, {
            documentTypeName: getDocumentTypeName(bidFlag),
          })
          .d('{documentTypeName}附件'),
        dataIndex: 'attachmentUuid',
        width: 120,
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
    ].filter(Boolean);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.EXPERT_SCORE_MANAGE.CONFIRM_CANDIDATE_DETAIL_ITEMLINE_TABLE',
          },
          <Table
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
        {/* {visible && <LadderLevelModal {...ladderLevelModalProps} />} */}
        {itemViewModalVisible && <OperationItemRecord {...itemViewModalProps} />}
      </React.Fragment>
    );
  }
}
