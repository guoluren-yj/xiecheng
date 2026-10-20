import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox, Tabs } from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';

import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
// import { yesOrNoRender } from 'utils/renderer';
import EditTable from 'components/EditTable';
import CPopover from '@/routes/sbid/components/CPopover';
import Upload from 'srm-front-boot/lib/components/Upload';
import { numberSeparatorRender } from '@/utils/renderer';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';
import { PRIVATE_BUCKET } from '_utils/config';
import DocFlow from '_components/DocFlow';

export default class ItemLineTable extends PureComponent {
  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  // 分配供应商弹窗
  _renderModal() {
    const {
      cancelDistribute,
      distributeModalVisible,
      supplierData,
      supplierRecordLoading,
    } = this.props;

    const supplierColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierNum`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.whetherDistribute`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 100,
        render: (val, record) => {
          return (
            <Form.Item>
              {record.$form.getFieldDecorator('assignFlag', {
                initialValue: val,
              })(<Checkbox disabled checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          );
        },
      },
    ];

    const scrollX = sum(supplierColumns.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        visible={distributeModalVisible}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.bidHall.model.bidHall.viewSupplier`).d('查看供应商')}</span>
          </div>
        }
        footer={null}
        onCancel={cancelDistribute}
      >
        <Form>
          <EditTable
            bordered
            loading={supplierRecordLoading}
            columns={supplierColumns}
            rowKey="itemSupAssignId"
            dataSource={supplierData}
            srcoll={{ x: scrollX }}
            pagination={false}
          />
        </Form>
      </Modal>
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading,
      header: { bidStatus = '' },
      dataSource = [],
      // pagination,
      subjectMatterRule,
      onDistributeSupplierForItemLine,
      customizeTabPane,
      customizeTable = () => {},
    } = this.props;
    const couldRfxStatusShowQuotationDetailLink =
      bidStatus === 'NEW' || bidStatus === 'RELEASE_APPROVING' || bidStatus === 'RELEASE_REJECTED';

    // 标的规则  区分
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
        render: (val, record) =>
          record.parentSectionNum !== null
            ? `${record.parentSectionNum}.${record.bidLineItemNum}`
            : record.bidLineItemNum,
      },
      {
        title: intl.get('ssrc.bidHall.model.bidHall.docFlow').d('单据流'),
        dataIndex: 'docFlow',
        width: 80,
        render: (_, record) =>
          record.sectionFlag ? null : (
            <DocFlow tableName="ssrc_bid_line_item" tablePk={record.bidLineItemId} />
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionPackNum`).d('标段/包编号'),
        dataIndex: 'sectionNum',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionPackName`).d('标段/包名称'),
        dataIndex: 'sectionName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationDetails`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 100,
        render: (_, record) =>
          couldRfxStatusShowQuotationDetailLink ||
          (!couldRfxStatusShowQuotationDetailLink && record.quotationDetailFlag) ? (
            <QuotationDetail rowData={record} sourceFrom="BID" />
          ) : null,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          !record.children ? (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(<Checkbox disabled checkedValue={1} unCheckedValue={0} />)}
            </Form.Item>
          ) : null,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 100,
        render: (val) => {
          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-bidItem"
              attachmentUUID={val}
            />
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prNum.`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNum.`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 100,
        fixed: 'right',
        render: (_, record) =>
          record._status === 'update' && record.sectionFlag ? (
            <div>
              <span>
                <a onClick={() => onDistributeSupplierForItemLine(record)}>
                  {intl.get(`ssrc.bidHall.view.message.button.viewSupplier`).d('查看供应商')}
                </a>
              </span>
            </div>
          ) : (
            ''
          ),
      },
    ];

    // 标的规则  不区分
    const columnsNone = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 60,
      },
      {
        title: intl.get('ssrc.bidHall.model.bidHall.docFlow').d('单据流'),
        dataIndex: 'docFlow',
        width: 80,
        render: (_, record) => (
          <DocFlow tableName="ssrc_bid_line_item" tablePk={record.bidLineItemId} />
        ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.quotationDetails`).d('报价明细'),
        dataIndex: 'quotationDetail',
        width: 100,
        render: (_, record) =>
          couldRfxStatusShowQuotationDetailLink ||
          (!couldRfxStatusShowQuotationDetailLink && record.quotationDetailFlag) ? (
            <QuotationDetail rowData={record} sourceFrom="BID" />
          ) : null,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.model`).d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('taxIncludedFlag', {
              initialValue: val,
            })(<Checkbox disabled checkedValue={1} unCheckedValue={0} />)}
          </Form.Item>
        ),
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.lineAttachmentUuid`).d('行附件')}</span>,
        dataIndex: 'lineAttachmentUuid',
        width: 100,
        render: (val) => {
          return (
            <Upload
              filePreview
              viewOnly
              icon="download"
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-bid-bidItem"
              attachmentUUID={val}
            />
          );
        },
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 120,
        render: (val) => <CPopover content={val}>{val}</CPopover>,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 80,
        fixed: 'right',
        render: (_, record) =>
          record.bidLineItemNum ? (
            <a onClick={() => onDistributeSupplierForItemLine(record)}>
              {intl.get(`hzero.common.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(
      subjectMatterRule === 'PACK'
        ? columns.map((n) => (isNumber(n.width) ? n.width : 0))
        : columnsNone.map((n) => (isNumber(n.width) ? n.width : 0))
    );

    return (
      <React.Fragment>
        {customizeTabPane(
          {
            code: 'SSRC.BID_HALL_DETAIL.ITEM_LINE_TAB',
          },
          <Tabs defaultActiveKey="itemLine" style={{ marginBottom: '20px' }}>
            <Tabs.TabPane
              tab={intl.get(`ssrc.bidHall.view.title.itemLine`).d('物品明细')}
              key="itemLine"
            >
              {customizeTable(
                {
                  code:
                    subjectMatterRule === 'PACK'
                      ? 'SSRC.BID_HALL_DETAIL.ITEM_LINE'
                      : 'SSRC.BID_HALL_DETAIL.ITEM_LINE_NONE',
                },
                <EditTable
                  bordered
                  rowKey="bidLineItemId"
                  loading={loading}
                  columns={subjectMatterRule === 'PACK' ? columns : columnsNone}
                  expandedRowKeys={subjectMatterRule === 'PACK' ? '' : ''}
                  scroll={{ x: scrollX }}
                  dataSource={dataSource}
                  pagination={false}
                />
              )}
            </Tabs.TabPane>
          </Tabs>
        )}
        {this._renderModal()}
      </React.Fragment>
    );
  }
}
