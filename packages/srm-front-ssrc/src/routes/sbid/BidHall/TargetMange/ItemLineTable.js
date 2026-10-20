import React, { PureComponent } from 'react';
import { Form, Modal, Checkbox } from 'hzero-ui';
import { sum, isNumber, isFunction } from 'lodash';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import intl from 'utils/intl';
import moment from 'moment';
import EditTable from 'components/EditTable';

import { getUomName, getQtyName } from '@/utils/utils';

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
        title: intl.get(`ssrc.bidHall.model.bidHall.supplierName`).d('供应商名称'),
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

    const scrollX = sum(supplierColumns.map((n) => (isNumber(n.width) ? n.width : 100)));

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
      doubleUnitFlag,
    } = this.props;

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
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 120,
      },
      {
        title: intl.get(`ssrc.common.goodsDescription`).d('物品描述'),
        dataIndex: 'itemName',
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类'),
        dataIndex: 'itemCategoryName',
        width: 120,
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
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.bidQuantity`).d('需求数量'),
            dataIndex: 'secondaryQuantity',
            width: 100,
          }
        : null,
      doubleUnitFlag
        ? {
            title: intl.get(`ssrc.bidHall.model.bidHall.unit`).d('单位'),
            dataIndex: 'secondaryUomName',
            width: 100,
          }
        : null,
      {
        title: getQtyName(doubleUnitFlag),
        dataIndex: 'bidQuantity',
        width: 100,
      },
      {
        title: getUomName(doubleUnitFlag),
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
        render: (_, record) => {
          const { prLineNum } = record || {};

          return prLineNum || '';
        },
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
                {intl.get(`ssrc.bidHall.view.button.viewSupplier`).d('查看供应商')}
              </a>
            </div>
          ) : (
            ''
          ),
      },
    ].filter(Boolean);

    const scrollX = sum(columnsNone.map((n) => (isNumber(n.width) ? n.width : 150)));

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_CHECK_PRICE.ITEM_LINE',
          },
          <EditTable
            bordered
            rowKey="quotationLineId"
            loading={loading}
            columns={columnsNone}
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
