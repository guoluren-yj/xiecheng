import React from 'react';
import PropTypes from 'prop-types';
import { Form, Input, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

@Form.create({ fieldNameProp: null })
export default class SearchForm extends React.Component {
  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  state = {
    display: false,
  };

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

  @Bind()
  handleResetBtnClick(e) {
    e.preventDefault();
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleSearchBtnClick(e) {
    e.preventDefault();
    const { onSearch } = this.props;
    onSearch();
  }

  render() {
    const { form, esStatus, isOldTenant } = this.props;
    const { display } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    return !isOldTenant ? (
      <Form layout="inline" className="more-fields-form">
        <Row>
          <Col span={18}>
            <Row>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('hpfm.region.model.region.condition').d('区域代码/区域名称')}
                >
                  {form.getFieldDecorator('srmCondition')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('smdm.regionalMapping.model.region.esCondition')
                    .d('映射区域代码/映射区域名称')}
                >
                  {form.getFieldDecorator('esCondition')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.regionalMapping.status').d('映射状态')}
                >
                  {form.getFieldDecorator('status')(
                    <Select style={{ width: '100%' }}>
                      {esStatus.map((m) => (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'block' : 'none' }}>
              <Col span={6}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('hpfm.region.model.region.standardRegionCode').d('国标代码')}
                >
                  {form.getFieldDecorator('standardRegionCode')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
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
              <Button onClick={this.handleResetBtnClick}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                type="primary"
                htmlType="submit"
                onClick={this.handleSearchBtnClick}
              >
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    ) : (
      <Form>
        <Row type="flex" align="bottom" gutter={24}>
          <Col span={6}>
            <Form.Item
              label={intl.get('hpfm.region.model.region.condition').d('区域代码/区域名称')}
            >
              {form.getFieldDecorator('srmCondition')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item
              label={intl
                .get('smdm.regionalMapping.model.region.esCondition')
                .d('映射区域代码/映射区域名称')}
            >
              {form.getFieldDecorator('esCondition')(<Input />)}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item label={intl.get('smdm.regionalMapping.status').d('映射状态')}>
              {form.getFieldDecorator('status')(
                <Select style={{ width: '100%' }}>
                  {esStatus.map((m) => (
                    <Select.Option key={m.value} value={m.value}>
                      {m.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item>
              <Button style={{ marginRight: 8 }} onClick={this.handleResetBtnClick}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.handleSearchBtnClick}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
