/*
 * DemandForm - 需求类型维护查询表单
 * @date: 2019/12/17
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Col, Row } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
// import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 需求类型维护查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const { Option } = Select;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class DemandForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: false,
    };
  }

  /**
   * 查询
   * @param {*} e
   */
  @Bind()
  handleSearch(e) {
    e.preventDefault();
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
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
      form: { getFieldDecorator },
      customizeFilterForm,
      flags,
    } = this.props;
    const { display } = this.state;
    return customizeFilterForm(
      {
        code: 'SODR.PR_TYPE.SEARCH',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={6}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.order.type.prTypeCode`).d('需求类型编码')}
                >
                  {getFieldDecorator('prTypeCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`entity.order.type.prTypeName`).d('需求类型')}
                >
                  {getFieldDecorator('prTypeName')(<Input maxLength={120} />)}
                </FormItem>
              </Col>
              <Col span={6}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sodr.orderTypeOrg.model.orderTypeOrg.enabledFlag`).d('是否启用')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      {flags.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }} />
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                style={{ display: !display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button
                style={{ display: !display ? 'none' : 'inline-block' }}
                onClick={this.toggleForm}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
