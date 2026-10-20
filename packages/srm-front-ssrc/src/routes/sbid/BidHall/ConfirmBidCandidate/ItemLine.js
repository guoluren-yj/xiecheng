/**
 * bidHall - 寻源服务/确认招标候选人 - 物品明细
 * @date: 2019-07-03
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox, Popover, Table } from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
import EditTable from 'components/EditTable';
import QuotationDetail from '@/routes/components/QuotationDetailNew/Detail';

export default class ItemLine extends PureComponent {
  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  /**
   * 分配供应商弹窗
   *
   * @returns
   * @memberof ItemLine
   */
  _renderModal(pathFrom) {
    const {
      cancelViewItemSupplier,
      itemSupplierModalVisible,
      supplierData,
      supplierRecordLoading,
    } = this.props;

    const supplierColumns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.whetherDistribute`).d('是否分配'),
        dataIndex: 'assignFlag',
        width: 100,
        render: (val, record) =>
          pathFrom ? (
            <Checkbox disabled checked={val} />
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('assignFlag', {
                initialValue: val,
              })(<Checkbox disabled checked={val} />)}
            </Form.Item>
          ),
      },
    ];

    return (
      <Modal
        visible={itemSupplierModalVisible}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.bidHall.model.bidHall.viewSupplier`).d('查看供应商')}</span>
          </div>
        }
        footer={null}
        onCancel={cancelViewItemSupplier}
      >
        <Form>
          {pathFrom ? (
            <Table
              bordered
              loading={supplierRecordLoading}
              columns={supplierColumns}
              rowKey="itemSupAssignId"
              dataSource={supplierData}
              pagination={false}
            />
          ) : (
            <EditTable
              bordered
              loading={supplierRecordLoading}
              columns={supplierColumns}
              rowKey="itemSupAssignId"
              dataSource={supplierData}
              pagination={false}
            />
          )}
        </Form>
      </Modal>
    );
  }

  render() {
    const {
      match,
      loading,
      dataSource = [],
      subjectMatterRule,
      viewItemLineSupplier,
      customizeTable,
    } = this.props;
    const pathFrom = match.path === '/pub/ssrc/expert-scoring/workflow/bid/:sourceHeaderId';

    // 标的规则  区分
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
        fixed: 'left',
        render: (val, record) =>
          record.parentSectionNum !== null
            ? `${record.parentSectionNum}.${record.bidLineItemNum}`
            : record.bidLineItemNum,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionPacNum`).d('标段/包编号'),
        dataIndex: 'sectionNum',
        fixed: 'left',
        width: 120,
        render: (val) => <Form.Item>{val}</Form.Item>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionPacName`).d('标段/包名称'),
        dataIndex: 'sectionName',
        fixed: 'left',
        width: 120,
        render: (val) => <Form.Item>{val}</Form.Item>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: (value) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationDetail`).d('报价明细'),
        dataIndex: 'quotationDetails',
        width: 100,
        render: (_, record) => <QuotationDetail rowData={record} sourceFrom="BID" />,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          pathFrom ? (
            <Checkbox disabled checked={val} />
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(<Checkbox disabled checked={val} />)}
            </Form.Item>
          ),
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNum`).d('采购申请行号'),
        dataIndex: 'lineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.filter`).d('操作'),
        dataIndex: 'action',
        width: 100,
        fixed: 'right',
        render: (_, record) =>
          record._status === 'update' && record.sectionFlag ? (
            <Form.Item>
              <a onClick={() => viewItemLineSupplier(record)}>
                {intl.get(`ssrc.bidHall.view.message.button.viewSupplier`).d('查看供应商')}
              </a>
            </Form.Item>
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
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 200,
        render: (val) => <Popover content={val}>{val}</Popover>,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 150,
        render: (val) => <Popover content={val}>{val}</Popover>,
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
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.taxIncludedFlag`).d('是否含税'),
        dataIndex: 'taxIncludedFlag',
        width: 100,
        render: (val, record) =>
          pathFrom ? (
            <Checkbox disabled checked={val} />
          ) : (
            <Form.Item>
              {record.$form.getFieldDecorator('taxIncludedFlag', {
                initialValue: val,
              })(<Checkbox disabled checked={val} />)}
            </Form.Item>
          ),
      },
      {
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}(%)</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.prNum`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.lineNum`).d('采购申请行号'),
        dataIndex: 'lineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.filter`).d('操作'),
        dataIndex: 'action',
        width: 80,
        fixed: 'right',
        render: (_, record) =>
          record.bidLineItemNum ? (
            <Form.Item>
              <a onClick={() => viewItemLineSupplier(record)}>
                {intl.get(`ssrc.bidHall.view.message.button.view`).d('查看')}
              </a>
            </Form.Item>
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
        {pathFrom
          ? subjectMatterRule === 'PACK'
            ? customizeTable(
                {
                  code: 'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE',
                },
                <Table
                  bordered
                  loading={loading}
                  columns={columns}
                  scroll={{ x: scrollX }}
                  dataSource={dataSource}
                  pagination={false}
                />
              )
            : customizeTable(
                {
                  code: 'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE_NONE',
                },
                <Table
                  bordered
                  loading={loading}
                  columns={columnsNone}
                  scroll={{ x: scrollX }}
                  dataSource={dataSource}
                  pagination={false}
                />
              )
          : subjectMatterRule === 'PACK'
          ? customizeTable(
              {
                code: 'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE',
              },
              <EditTable
                bordered
                rowKey="bidLineItemId"
                loading={loading}
                columns={columns}
                scroll={{ x: scrollX }}
                dataSource={dataSource}
                pagination={false}
              />
            )
          : customizeTable(
              {
                code: 'SSRC.EXPERT_SCORE_MANAGE.ITEM_LINE_NONE',
              },
              <EditTable
                bordered
                rowKey="bidLineItemId"
                loading={loading}
                columns={columnsNone}
                scroll={{ x: scrollX }}
                dataSource={dataSource}
                pagination={false}
              />
            )}
        {this._renderModal(pathFrom)}
      </React.Fragment>
    );
  }
}
