/**
 * FilterForm - 报价模板表单查询
 * @date: 2019-08-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2019, Hand
 */

import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Button, Form, Row, Col, Input, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

const { Option } = Select;
const promptCode = 'ssrc.quotationTemplate';
const tenantId = getCurrentOrganizationId();

@formatterCollections({ code: ['ssrc.quotationTemplate'] })
@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    this.props.onRef(this);
    this.state = {
      display: false,
    };
  }

  /**
   * 查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const {
      form: { validateFields },
      onSearch,
    } = this.props;
    validateFields(err => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
  }

  render() {
    const { display } = this.state;
    const {
      form: { getFieldDecorator },
      dimensionCode,
    } = this.props;
    const formLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.template.code`).d('报价模板编码')}
                  {...formLayout}
                >
                  {getFieldDecorator('templateNum')(
                    <Input trim inputChinese={false} typeCase="upper" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.template.name`).d('报价模板名称')}
                  {...formLayout}
                >
                  {getFieldDecorator('templateName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.template.dimension`).d('模板维度')}
                  {...formLayout}
                >
                  {getFieldDecorator('templateDimension')(
                    <Select allowClear>
                      {dimensionCode.map(n => (
                        <Option value={n.value}>{n.meaning}</Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.template.category`).d('品类')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemCategoryId')(
                    <Lov code="SSRC.QUOTATION_TPL.ITEM_CAT" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.template.material`).d('物料')}
                  {...formLayout}
                >
                  {getFieldDecorator('itemId')(
                    <Lov code="SSRC.QUOTATION_TPL.ITEM" queryParams={{ tenantId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
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
