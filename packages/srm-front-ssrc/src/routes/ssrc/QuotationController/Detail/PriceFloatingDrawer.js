/**
 * PriceFloatingDrawer - 寻源过程控制 - 侧滑更新价格浮动数据Modal
 * @date: 2020-02-11
 * @version: 1.0.0
 * @author: YYM <yongming.yang@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Form, InputNumber, Select, Input, Button, Tooltip, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { sum, isNumber, isEmpty, isUndefined } from 'lodash';

import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getCurrentUserId,
  getEditTableData,
} from 'utils/utils';

import intl from 'utils/intl';

const { Option } = Select;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@connect(({ quotationController, inquiryHall, loading }) => ({
  quotationController,
  inquiryHall,
  saveItemLineLoading: loading.effects['inquiryHall/saveItemLine'],
  fetchItemLineLoading: loading.effects['inquiryHall/fetchInquiryItemLine'],
  organizationId: getCurrentOrganizationId(),
  userId: getCurrentUserId(),
}))
export default class PriceFloatingDrawer extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * render()调用后获取数据
   */
  componentDidMount() {
    this.handleSearch();
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch(page) {
    const {
      form,
      dispatch,
      match: { params },
      organizationId,
    } = this.props;
    const fieldValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'inquiryHall/fetchInquiryItemLine',
      payload: {
        page,
        ...fieldValues,
        organizationId,
        rfxHeaderId: params.rfxId,
      },
    });
  }

  /**
   * 物品明细保存整合
   *
   * @param {*} key
   * @param {*} [data=[]]
   * @returns
   * @memberof Update
   */
  getItemLineData(key = [], data = []) {
    if (isEmpty(data)) {
      return [];
    }

    const middleData = data.map((item) => {
      if (!item.quotationDetails || isEmpty(item.quotationDetails)) {
        return item;
      }
      const quotationList = item.quotationDetails.map((quotation) => {
        return {
          ...quotation,
          rfxLineItemId:
            typeof quotation.rfxLineItemId === 'string' ? null : quotation.rfxLineItemId,
        };
      });
      return {
        ...item,
        quotationDetails: quotationList,
      };
    });

    return getEditTableData(middleData, key);
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { itemLine = [], itemLinePagination = {} },
    } = this.props;
    const newParameters = this.getItemLineData(['rfxLineItemId'], itemLine);

    if (!isEmpty(newParameters)) {
      dispatch({
        type: 'inquiryHall/saveItemLine',
        payload: { newParameters, organizationId, rfxHeaderId: params.rfxId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch(itemLinePagination);
        }
      });
    }
  }

  /**
   * 改变分页时保存数据
   *
   * @memberof PriceFloatingDrawer
   */
  @Bind()
  handleTableChange(page) {
    const {
      dispatch,
      organizationId,
      match: { params },
      inquiryHall: { itemLine = [] },
    } = this.props;
    const newParameters = this.getItemLineData(['rfxLineItemId'], itemLine);

    if (!isEmpty(newParameters)) {
      dispatch({
        type: 'inquiryHall/saveItemLine',
        payload: { newParameters, organizationId, rfxHeaderId: params.rfxId },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleSearch(page);
        }
      });
    }
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 根据浮动方式调整报价幅度单位
   */
  @Bind()
  handleQuotationRange(value, record) {
    let mean = '';
    if (record.$form.getFieldValue('floatType')) {
      if (record.$form.getFieldValue('floatType') === 'money') {
        mean = `${value}${intl.get('ssrc.inquiryHall.model.inquiryHall.yuan').d('元')}`;
      } else {
        mean = `${value}%`;
      }
    } else {
      mean = null;
    }
    return mean;
  }

  /**
   * 根据浮动方式调整报价幅度的值
   */
  @Bind()
  handleFloatingWay(val, record) {
    if (isUndefined(val)) {
      record.$form.setFieldsValue({ quotationRange: null });
    }
  }

  /**
   * 渲染价格浮动物料表格
   */
  @Bind()
  handleItemDetailSearch() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={12}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.quoController.model.quoController.itemCode`)
                      .d('物品编码')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemCode')(<Input maxLength={40} />)}
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label={intl
                      .get(`ssrc.quoController.model.quoController.itemName`)
                      .d('物品描述')}
                    {...formLayout}
                  >
                    {getFieldDecorator('itemName')(<Input maxLength={40} />)}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button data-code="reset" onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }

  /**
   * 渲染价格浮动物料表格
   */
  @Bind()
  handleItemDetailList() {
    const {
      fetchItemLineLoading,
      inquiryHall: { itemLine = [], itemLinePagination = {} },
    } = this.props;
    const columns = [
      {
        title: intl.get(`ssrc.quoController.model.quoController.lineNo.`).d('行号'),
        dataIndex: 'rfxLineItemNum',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('rfxLineItemNum', {
              initialValue: val,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.quoController.model.quoController.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('ouName', {
              initialValue: val,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.quoController.model.quoController.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('invOrganizationName', {
              initialValue: val,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.quoController.model.quoController.itemCode`).d('物品编码'),
        dataIndex: 'itemCode',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('itemCode', {
              initialValue: val,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: intl.get(`ssrc.quoController.model.quoController.itemName`).d('物品描述'),
        dataIndex: 'itemName',
        width: 100,
        render: (val, record) => (
          <Form.Item>
            {record.$form.getFieldDecorator('itemName', {
              initialValue: val,
            })(<Input disabled />)}
          </Form.Item>
        ),
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingMoneyDetail`)
              .d('浮动方式：最小价格幅度的计算按照金额或者比率！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.floatingWay`).d('浮动方式')}
          </Tooltip>
        ),
        dataIndex: 'floatType',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('floatType', {
                initialValue: val,
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={(value) => this.handleFloatingWay(value, record)}
                >
                  <Option value="money">
                    {intl.get(`ssrc.inquiryHall.view.message.floatingMoney`).d('金额（元）')}
                  </Option>
                  <Option value="ratio">
                    {intl.get(`ssrc.inquiryHall.view.message.floatingRatio`).d('比率（%）')}
                  </Option>
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: (
          <Tooltip
            title={intl
              .get(`ssrc.inquiryHall.view.message.floatingRatioDetail`)
              .d('报价幅度：最小价格幅度，下次报价至少符合此价格浮动范围！')}
          >
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.quotationRange`).d('报价幅度')}
          </Tooltip>
        ),
        dataIndex: 'quotationRange',
        width: 140,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('quotationRange', {
                initialValue: val,
              })(
                <InputNumber
                  min={0}
                  max={9999999999}
                  style={{ width: '100%' }}
                  disabled={!record.$form.getFieldValue('floatType')}
                  formatter={(value) => this.handleQuotationRange(value, record)}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <EditTable
        bordered
        rowKey="rfxLineItemId"
        loading={fetchItemLineLoading}
        columns={columns}
        scroll={{ x: scrollX }}
        dataSource={itemLine}
        pagination={itemLinePagination}
        onChange={(page) => this.handleTableChange(page)}
      />
    );
  }

  render() {
    const { anchor, visibleModal, onCancel, saveItemLineLoading } = this.props;
    return (
      <Modal
        width={850}
        onOk={this.handleSave}
        onCancel={onCancel}
        visible={visibleModal}
        title={intl.get(`ssrc.quoController.view.message.title.setPriceFloating`).d('需求信息维护')}
        confirmLoading={saveItemLineLoading}
        transitionName={`move-${anchor}`}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
      >
        {this.handleItemDetailSearch()}
        {this.handleItemDetailList()}
      </Modal>
    );
  }
}
