import React, { Component } from 'react';
import { Modal, Form, Table, Button, Row, Col, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isUndefined, isNil } from 'lodash';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { showBigNumber } from '@/routes/components/utils';

// 初始化通用布局
const formItemLayout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 },
};

/**
 * 事务接收维护界面
 *
 * @export
 * @class AddModal - 新增弹窗组件
 * @extends {Component} - React.Component
 * @reactProps {object} form - 表单对象
 * @reactProps {function} onSearch - 表单查询方法
 * @reactProps {function} onCancle - 关闭弹窗方法
 * @reactProps {function} onOk -弹窗确认方法
 * @retruns React.element
 */
export default class AddModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
    };
  }

  componentDidUpdate(prevProps) {
    const { onSearch, visible } = this.props;
    if (visible && !prevProps.visible) {
      onSearch();
    }
  }

  /**
   * 发起查询请求
   *
   * @memberof AddModal
   */
  @Bind()
  handleSearch() {
    const {
      onSearch,
      form: { getFieldsValue },
    } = this.props;
    const filterValues = isUndefined(getFieldsValue())
      ? {}
      : filterNullValueObject(getFieldsValue());
    const params = filterValues;
    onSearch(params);
  }

  /**
   * 重置查询表单
   *
   * @memberof AddModal
   */
  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * 关闭弹窗model
   */
  @Bind()
  handleCancelModal() {
    const { onCancel, form } = this.props;
    form.resetFields();
    onCancel();
  }

  /**
   * 弹窗确认
   *
   * @memberof AddModal
   */
  @Bind()
  handleOkModal() {
    const { onOk, form } = this.props;
    onOk();
    form.resetFields();
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  @Bind()
  getColumns(receiveOrderType) {
    const columns = {
      order: [
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 180,
          fixed: 'left',
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          dataIndex: 'lineNum',
          width: 120,
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 120,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.needQuantity`).d('需求数量'),
          dataIndex: 'shippedQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.canPackagesNumber`).d('可收货数量'),
          dataIndex: 'canReceiveQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.invOrganization`).d('收货组织'),
          dataIndex: 'invOrganizationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.inventoryName`).d('收货库房'),
          dataIndex: 'inventoryId',
          width: 180,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.locationNames`).d('收货库位'),
          dataIndex: 'locationName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.message.contactInfo`).d('联系人信息'),
          dataIndex: 'contactInfo',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 180,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 120,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierName',
          width: 180,
        },
      ],
      delivery: [
        {
          title: intl.get(`sinv.purchaseReception.view.message.asnNum`).d('送货单号'),
          dataIndex: 'asnNum',
          fixed: 'left',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.asnLineNum`).d('行号'),
          dataIndex: 'asnLineNum',
          width: 100,
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.asnTypeCode`).d('送货单类型'),
          dataIndex: 'asnTypeCodeMeaning',
          width: 150,
        },
        {
          title: intl.get(`entity.item.code`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 120,
        },
        {
          title: intl.get(`entity.item.name`).d('物料名称'),
          dataIndex: 'itemName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
          dataIndex: 'uomName',
          width: 120,
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.common.model.common.shipQuantity`).d('发货数量'),
          dataIndex: 'shipQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.purchaseReception.view.message.canReceiveQuantity`).d('可接收数量'),
          dataIndex: 'canReceiveQuantity',
          width: 120,
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.common.model.common.displayPoNum`).d('订单号'),
          dataIndex: 'displayPoNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayReleaseNum`).d('发放号'),
          dataIndex: 'displayReleaseNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号'),
          dataIndex: 'lineNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.displayLineLocationNum`).d('发运号'),
          dataIndex: 'displayLineLocationNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.versionNum`).d('版本号'),
          dataIndex: 'versionNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.expectedArriveDate`).d('预计到货日期'),
          dataIndex: 'expectedArriveDate',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.organizationName`).d('收货组织'),
          dataIndex: 'receiveOrganization',
          width: 120,
        },
        {
          title: intl.get(`sinv.purchaseReception.message.inventoryName`).d('收货库房'),
          dataIndex: 'inventoryName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.shipToLocationAddress`).d('收货地点'),
          dataIndex: 'shipToLocationAddress',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.purchaseAgentName`).d('采购员'),
          dataIndex: 'agentName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.number`).d('商品编码'),
          dataIndex: 'productNum',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.product.name`).d('商品名称'),
          dataIndex: 'productName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.catalog.name`).d('商品目录'),
          dataIndex: 'catalogName',
          width: 120,
        },
        {
          title: intl.get(`sinv.common.model.common.contactor`).d('联系人'),
          dataIndex: 'contactInfo',
          width: 120,
        },
        {
          title: intl.get(`entity.supplier.tag`).d('供应商'),
          dataIndex: 'supplierName',
          width: 120,
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
        },
      ],
    };
    if (receiveOrderType === 'ASN') {
      return columns.delivery;
    } else {
      return columns.order;
    }
  }

  render() {
    const { tenantId } = this.state;
    const {
      loading,
      visible,
      modalDataSource,
      modalPagination,
      rowSelection,
      onSearch,
      okLoading,
      form: { getFieldDecorator },
      receiveOrderType,
    } = this.props;
    const columns = this.getColumns(receiveOrderType);
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240;
    return (
      <Modal
        title={intl.get('hzero.common.button.add').d('新增')}
        visible={visible}
        onCancel={this.handleCancelModal}
        onOk={this.handleOkModal}
        confirmLoading={okLoading}
        width={1000}
      >
        <Form layout="inline" className="more-fields-search-form">
          <Row>
            <Col span={18}>
              {receiveOrderType === 'ASN' && (
                <Col span={8}>
                  <Form.Item
                    label={intl.get(`sinv.purchaseReception.view.message.asnNum`).d('送货单号')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('asnNum')(<Input inputChinese={false} />)}
                  </Form.Item>
                </Col>
              )}

              <Col span={8}>
                <Form.Item
                  label={intl.get(`sinv.common.model.common.displayPoNum`).d('订单号')}
                  {...formItemLayout}
                >
                  {getFieldDecorator('displayPoNum')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label={intl.get(`entity.item.tag`).d('物料')} {...formItemLayout}>
                  {getFieldDecorator('itemId')(
                    <Lov
                      code="SODR.PO_ITEM"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'itemId', displayField: 'itemName' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button onClick={this.handleReset} style={{ marginRight: 8 }}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <Table
          loading={loading}
          columns={columns}
          dataSource={modalDataSource}
          pagination={modalPagination}
          bordered
          rowSelection={rowSelection}
          scroll={{ x: scrollX }}
          onChange={(page) => onSearch(page)}
          rowKey={receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId'}
          key={receiveOrderType === 'ASN' ? 'asnLineId' : 'poLineLocationId'}
        />
      </Modal>
    );
  }
}
