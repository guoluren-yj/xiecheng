/*
 * Search.js - 查询组件
 * @date: 2019-01-04
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Button, Row, Col } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import SearchDrawer from './SearchDrawer';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 11 },
  wrapperCol: { span: 13 },
};

/**
 * 查询组件
 * @extends {Component} - React.Component
 * @reactProps {Function} toggleForm - 收起展开查询条件
 * @reactProps {Function} onClick - 查询
 * @reactProps {Function} onReset - 重置表单
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class Search extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      moreSearchParams: false,
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { fetchList } = this.props;
    if (isFunction(fetchList)) {
      fetchList();
    }
  }

  /**
   * 重置表单
   */
  @Bind()
  handleFormReset() {
    const {
      form: { resetFields },
    } = this.props;
    resetFields();
  }

  /**
   * 打开滑窗搜索
   */
  @Bind()
  handleSearchMore() {
    this.setState({ moreSearchParams: false }, this.handleSearch());
  }

  /**
   * 重置表单
   */
  onReset() {
    const {
      form: { resetFields = (e) => e },
    } = this.props;
    resetFields();
  }

  /**
   * 改变滑窗Visible
   * @param {String} field
   * @param {Boolean} flag
   */
  @Bind()
  handleMoreParamsVisible(field, flag) {
    this.setState({ [field]: !!flag });
  }

  /**
   * 关闭滑窗搜索
   */
  @Bind()
  handleHideDrawer() {
    this.handleMoreParamsVisible('moreSearchParams', false);
  }

  render() {
    const { form, enumMap = {}, customizeForm = () => {} } = this.props;
    const { getFieldDecorator } = form;
    const { moreSearchParams } = this.state;
    const searchDrawerProps = {
      form,
      enumMap,
      customizeForm,
      visible: moreSearchParams,
      onHideDrawer: this.handleHideDrawer,
      onSearch: this.handleSearchMore,
      onReset: this.handleFormReset,
    };
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row gutter={12}>
            <Col span={18}>
              <Row gutter={12}>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sinv.common.model.common.displayTrxNum`).d('事务编号')}
                  >
                    {getFieldDecorator('displayTrxNum')(
                      <Input trim typeCase="upper" inputChinese={false} />
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sinv.common.model.common.displaySourcePoNum`).d('来源订单号')}
                  >
                    {getFieldDecorator('displayPoNum')(<Input />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sinv.common.model.common.displayLineNum`).d('订单行号')}
                  >
                    {getFieldDecorator('displayLineNum')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more" gutter={12}>
              <FormItem>
                <Button onClick={() => this.handleMoreParamsVisible('moreSearchParams', true)}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
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
        <SearchDrawer {...searchDrawerProps} />
      </div>
    );
  }
}
