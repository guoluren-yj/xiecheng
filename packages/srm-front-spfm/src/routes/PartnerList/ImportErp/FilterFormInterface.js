import moment from 'moment';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Form, Row, Col, Button, Select, DatePicker, Input } from 'hzero-ui';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateFormat } from 'utils/utils';
import CacheComponent from 'components/CacheComponent';

const { Option } = Select;

@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/spfm/partner-list/import-erp/interface' })
export default class FilterFormInterface extends Component {
  state = {
    expand: false,
  };

  componentDidMount() {
    const { onRef } = this.props;
    onRef(this);
  }

  /**
   * 展开/收起方法
   */
  @Bind()
  toggle() {
    this.setState({
      expand: !this.state.expand,
    });
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      importStatusList,
      triggerEventList,
      eventClassifyList,
      queryLoading,
      customizeFilterForm,
      handleSearch,
    } = this.props;
    const { expand } = this.state;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };

    return customizeFilterForm(
      {
        code: 'SPFM.PARTNER_LIST_INTERFACE_QUERY.FILTER', // 单元编码，必传
        form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spfm.importErp.model.importErp.syncStatus`).d('导入状态')}
                >
                  {getFieldDecorator('syncStatus')(
                    <Select allowClear>
                      {importStatusList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spfm.importErp.model.importErp.supplier`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTH.SUPPLIER" textField="supplierCompanyName" />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.importErp.model.importErp.sourceDocumentNo`)
                    .d('触发单据编号')}
                >
                  {getFieldDecorator('sourceDocumentNo')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24} style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spfm.importErp.model.importErp.triggerEvent`).d('触发事件')}
                >
                  {getFieldDecorator('cfCode')(
                    <Select allowClear>
                      {triggerEventList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.triggerTimeForm').d('触发时间从')}
                >
                  {getFieldDecorator('syncDateFrom')(
                    <DatePicker
                      placeholder={null}
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('syncDateTo') &&
                        moment(getFieldValue('syncDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('spfm.importErp.model.importErp.triggerTimeTo').d('触发时间至')}
                >
                  {getFieldDecorator('syncDateTo')(
                    <DatePicker
                      placeholder={null}
                      format={getDateFormat()}
                      disabledDate={(currentDate) =>
                        getFieldValue('syncDateFrom') &&
                        moment(getFieldValue('syncDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`spfm.importErp.model.importErp.eventClassify`).d('触发事件分类')}
                >
                  {getFieldDecorator('cfCategory')(
                    <Select allowClear>
                      {eventClassifyList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand
                  ? intl.get(`hzero.common.button.collected`).d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={() => this.props.form.resetFields()}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={handleSearch}
                loading={queryLoading}
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
