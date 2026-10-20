import React, { Component } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction, noop } from 'lodash';

import Lov from 'components/Lov';
import intl from 'utils/intl';

const FormItem = Form.Item;

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    this.state = {
      display: true,
    };
  }

  /**
   * 提交查询表单
   */
  @Bind()
  handleSearch() {
    const {
      onSearch,
      form: { getFieldsValue },
    } = this.props;
    const values = getFieldsValue();
    onSearch(values);
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
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  render() {
    const {
      form,
      organizationId,
      customizeFilterForm = noop,
      form: { getFieldDecorator },
    } = this.props;
    const { display } = this.state;
    return customizeFilterForm(
      {
        form,
        expand: display,
        code: 'SSRC.BID_HALL_APPLY_TO_BID.FILTER',
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.applicationNumber`).d('申请编号')}
                  {...formLayout}
                >
                  {getFieldDecorator('displayPrNum')(<Input maxLength={40} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体')}
                  {...formLayout}
                >
                  {getFieldDecorator('ouId')(
                    <Lov code="SPFM.USER_AUTH.OU" textField="ouNameMeaning" />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.itemCategory`).d('物品分类')}
                  {...formLayout}
                >
                  {getFieldDecorator('categoryId')(
                    <Lov code="SMDM.TREE_ITEM_CATEGORY" textField="categoryNameMeaning" />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.buyer`).d('采购员')}
                  {...formLayout}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov
                      code="SPFM.USER_AUTH.PURCHASE_AGENT"
                      textField="purchaseAgentName"
                      queryParams={{ organizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get(`ssrc.bidHall.model.bidHall.itemCode`).d('物料编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemId')(
                    <Lov code="SSRC.CUSTOMER_ITEM" textField="itemNameMeaning" />
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
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
    );
  }
}
