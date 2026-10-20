import React, { Component } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';

import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import SearchDrawer from './SearchDrawer';

const FormItem = Form.Item;
const { Option } = Select;
const promptCode = 'ssrc.queryRfq';
/**
 * 查询表单
 * @extends {Component} - React.Component
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} statusList - 状态
 * @return React.element
 */
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/ssrc/query-rfq/list' })
export default class FilterForm extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  state = {
    moreSearchParams: false,
  };

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearch();
      }
    });
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
   * 改变更多查询滑窗Visible
   * @param {String} field
   * @param {Boolean} flag
   */
  @Throttle(500)
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

  /**
   * 打开滑窗搜索
   */
  @Bind()
  handleSearchMore() {
    this.setState({ moreSearchParams: false }, this.handleSearch());
  }

  render() {
    const {
      customizeForm,
      form,
      form: { getFieldDecorator, getFieldValue },
      sourceMethod = [],
      rfxStatus = [],
      auctionDirection = [],
      quotationType = [],
      organizationId,
    } = this.props;
    const { moreSearchParams } = this.state;
    const searchDrawerProps = {
      form,
      customizeForm,
      organizationId,
      getFieldValue,
      getFieldDecorator,
      sourceMethod,
      rfxStatus,
      auctionDirection,
      quotationType,
      visible: moreSearchParams,
      onHideDrawer: this.handleHideDrawer,
      onSearch: this.handleSearchMore,
      onReset: this.handleFormReset,
    };
    return (
      <React.Fragment>
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`ssrc.inquiryHall.model.inquiryHall.sourceNum`).d('寻源单号')}
                    {...formLayout}
                  >
                    {getFieldDecorator('rfxNum')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`${promptCode}.model.queryRfq.inquiryTitle`).d('询价单标题')}
                    {...formLayout}
                  >
                    {getFieldDecorator('rfxTitle')(<Input maxLength={40} />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem
                    label={intl.get(`${promptCode}.model.queryRfq.sourcingApproach`).d('寻源方式')}
                    {...formLayout}
                  >
                    {getFieldDecorator('sourceMethod')(
                      <Select allowClear>
                        {sourceMethod &&
                          sourceMethod.map((item) => (
                            <Option key={item.meaning} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => this.handleMoreParamsVisible('moreSearchParams', true)}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
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
        <SearchDrawer {...searchDrawerProps} />
      </React.Fragment>
    );
  }
}
