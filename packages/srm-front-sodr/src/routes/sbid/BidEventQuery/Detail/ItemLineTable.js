import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox } from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import moment from 'moment';
import EditTable from 'components/EditTable';

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
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.supplierCode`).d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidEventQuery.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.whetherDistribute`).d('是否分配'),
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

    const scrollX = sum(supplierColumns.map(n => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        visible={distributeModalVisible}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.viewSupplier`).d('查看供应商')}</span>
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
      dataSource = [],
      pagination,
      subjectMatterRule,
      onDistributeSupplierForItemLine,
    } = this.props;

    // 标的规则  区分
    const columns = [
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidLineItemNum`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 100,
        render: (val, record) =>
          record.parentSectionNum !== null
            ? `${record.parentSectionNum}.${record.bidLineItemNum}`
            : record.bidLineItemNum,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.sectionNum`).d('标段/包编号'),
        dataIndex: 'sectionNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.sectionName`).d('标段/包名称'),
        dataIndex: 'sectionName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 100,
        render: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.itemCode`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidCostPrice`).d('成本单价'),
        dataIndex: 'costPrice',
        align: 'right',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.taxIncludedFlag`).d('是否含税'),
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
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate`).d('税率'),
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.prNum.`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.lineNum.`).d('采购申请行号'),
        dataIndex: 'lineNum',
        width: 120,
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
                  {intl.get(`ssrc.bidEventQuery.view.message.button.viewSupplier`).d('查看供应商')}
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
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidLineItemNum.`).d('行号'),
        dataIndex: 'bidLineItemNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.itemCode`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 150,
        render: value => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.bidQuantity`).d('需求数量'),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.unit`).d('单位'),
        dataIndex: 'uomName',
        width: 80,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.costPrice`).d('标底单价'),
        dataIndex: 'costPrice',
        width: 100,
        align: 'right',
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.taxIncludedFlag`).d('是否含税'),
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
        title: <span>{intl.get(`ssrc.bidEventQuery.model.bidHall.taxRate`).d('税率')}%</span>,
        dataIndex: 'taxRate',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.prNum.`).d('采购申请号'),
        dataIndex: 'prNum',
        width: 100,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.lineNum.`).d('采购申请行号'),
        dataIndex: 'lineNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.drawingNum`).d('图号'),
        dataIndex: 'drawingNum',
        width: 130,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.drawingVersion`).d('图纸版本'),
        dataIndex: 'drawingVersionNumber',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.surfaceFlag`).d('表面处理'),
        dataIndex: 'surfaceFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.referencePrice`).d('参考价'),
        dataIndex: 'referencePrice',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidEventQuery.model.bidHall.supplierItemNum`).d('供应商料号'),
        dataIndex: 'supplierItemNum',
        width: 120,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 80,
        fixed: 'right',
        render: (_, record) =>
          record.bidLineItemNum ? (
            <a onClick={() => onDistributeSupplierForItemLine(record)}>
              {intl.get(`ssrc.bidEventQuery.view.message.button.view`).d('查看')}
            </a>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(
      subjectMatterRule === 'PACK'
        ? columns.map(n => (isNumber(n.width) ? n.width : 0))
        : columnsNone.map(n => (isNumber(n.width) ? n.width : 0))
    );

    return (
      <React.Fragment>
        <EditTable
          bordered
          rowKey="bidLineItemId"
          loading={loading}
          columns={subjectMatterRule === 'PACK' ? columns : columnsNone}
          expandedRowKeys={subjectMatterRule === 'PACK' ? '' : ''}
          scroll={{ x: scrollX }}
          dataSource={dataSource}
          pagination={pagination}
        />
        {this._renderModal()}
      </React.Fragment>
    );
  }
}
