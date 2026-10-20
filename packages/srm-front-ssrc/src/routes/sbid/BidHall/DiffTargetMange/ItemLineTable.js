import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox } from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
import EditTable from 'components/EditTable';
import styles from './index.less';
import { numberSeparatorRender } from '@/utils/renderer';

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
      },
      {
        title: intl.get(`ssrc.common.supplierName`).d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        width: 100,
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
      dataSource = [],
      subjectMatterRule,
      onDistributeSupplierForItemLine,
      customizeTable,
    } = this.props;

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
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionPacNum`).d('标段/包编号'),
        dataIndex: 'sectionNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionPacName`).d('标段/包名称'),
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
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 150,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
        width: 150,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 100,
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
        title: <span>{intl.get(`ssrc.bidHall.model.bidHall.taxRate`).d('税率')}(%)</span>,
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
        title: intl.get(`hzero.common.button.action`).d('操作'),
        dataIndex: 'action',
        width: 100,
        fixed: 'right',
        render: (_, record) =>
          record.bidLineItemNum ? (
            <div style={{ height: '28px', lineHeight: '28px' }}>
              <a onClick={() => onDistributeSupplierForItemLine(record)}>
                {intl.get(`ssrc.bidHall.model.bidHall.viewSupplier`).d('查看供应商')}
              </a>
            </div>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 150)));

    return (
      <React.Fragment>
        <div
          className={styles['item-list-search']}
          style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}
        >
          <span style={{ marginBottom: '16px' }}>
            {intl.get(`ssrc.bidHall.view.message.view.itemLineDetail`).d('物品明细')}
          </span>
        </div>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
          },
          <EditTable
            bordered
            rowKey="bidLineItemId"
            loading={loading}
            columns={columns}
            expandedRowKeys={subjectMatterRule === 'PACK' ? '' : ''}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={false}
          />
        )}
        {this._renderModal()}
      </React.Fragment>
    );
  }
}
