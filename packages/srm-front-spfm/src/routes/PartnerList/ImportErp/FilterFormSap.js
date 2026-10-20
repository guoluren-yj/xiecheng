import React, { PureComponent } from 'react';
import { Form, Button, Select, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const { Option } = Select;

/**
 * 导入Erp表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/spfm/partner-list/import-erp1' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
    };
    const { form, bindForm } = this.props;
    bindForm(form);
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

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch(values);
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { expand } = this.state;
    const {
      syncStatusList = [],
      form,
      form: { getFieldDecorator },
      loading,
      customizeFilterForm,
      organizationId,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };
    return customizeFilterForm(
      {
        code: 'SPFM.PARTNER_LIST_IMPORT_SAP.FILTER', // 单元编码，必传
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
                      {syncStatusList.map((item) => (
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
                  label={intl.get('entity.supplier.name').d('供应商名称')}
                >
                  {getFieldDecorator('supplierCompanyId')(<Lov code="SPFM.USER_AUTH.SUPPLIER" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.importErp.model.importErp.stageDescription`)
                    .d('供应商生命周期')}
                >
                  {getFieldDecorator('stageDescription')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={24} style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.supplierCategory')
                    .d('供应商分类')}
                >
                  {getFieldDecorator('categoryId')(<Lov code="SSLM.SUPPLIER_CATEGORY" />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.importFlag')
                    .d('是否已导入')}
                >
                  {getFieldDecorator('importFlag')(
                    <Select allowClear>
                      <Option value="1">{intl.get('hzero.common.status.yes').d('是')}</Option>
                      <Option value="0">{intl.get('hzero.common.status.no').d('否')}</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('spfm.supplier.model.supplier.platform.frozenFlag')
                    .d('是否记账冻结')}
                >
                  {getFieldDecorator('frozenFlag')(
                    <Select allowClear>
                      <Option value="1">{intl.get('hzero.common.status.yes').d('是')}</Option>
                      <Option value="0">{intl.get('hzero.common.status.no').d('否')}</Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get(`spfm.supplier.model.supplier.platform.customCompanyName`)
                    .d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="HPFM.COMPANY"
                      textField="companyName"
                      queryParams={{ tenantId: organizationId }}
                    />
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
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
                loading={loading}
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
