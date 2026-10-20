import React, { PureComponent } from 'react';
import { Form, Button, Select, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';
import intl from 'utils/intl';

const { Option } = Select;
let enableSetCache = false; // 组件卸载时关闭cache的修改，抵消cacheComponent进行setFieldsValue触发onFieldsChange
let cacheFields = {}; // 缓存变更字段

/**
 * 导入Erp表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({
  fieldNameProp: null,
  onFieldsChange: (props, fields) => {
    if (enableSetCache) {
      cacheFields = { ...cacheFields, ...fields };
    }
  },
})
@CacheComponent({ cacheKey: '/spfm/partner-list/import-erp2' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expand: false,
      filterCompanyName: '',
    };
    const { form, bindForm } = this.props;
    bindForm(form);
  }

  componentDidMount() {
    const {
      form: { getFieldsValue },
    } = this.props;
    // 利用getFieldsValue获取表单上注册的所有字段
    const allFields = Object.keys(getFieldsValue());
    // 从缓存拿到变更的字段列表
    const filterFields = Object.keys(cacheFields);
    // 即将重置的字段列表
    let resetFields = allFields.filter((field) => !filterFields.includes(field));
    // 重置字段列表为空时传空值重置全部字段
    if (resetFields.length === 0) {
      resetFields = undefined;
    } else {
      this.props.form.resetFields(resetFields);
    }
    // 组件挂载后允许设置缓存
    enableSetCache = true;
  }

  componentWillUnmount() {
    // 组件卸载后禁止设置缓存
    enableSetCache = false;
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
    const { expand, filterCompanyName } = this.state;
    const {
      syncStatusEbsList = [],
      form,
      form: { getFieldDecorator },
      queryEbsLoading,
      organizationId,
      customizeFilterForm,
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
      style: { width: '100%' },
    };
    return customizeFilterForm(
      {
        code: 'SPFM.PARTNER_LIST_IMPORT_EBS.FILTER', // 单元编码，必传
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
                      {syncStatusEbsList.map((item) => (
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
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov code="SPFM.USER_AUTH.SUPPLIER" textField="supplierCompanyName" />
                  )}
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
                  {getFieldDecorator('categoryId')(
                    <Lov code="SSLM.SUPPLIER_CATEGORY" textField="categoryDescription" />
                  )}
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
                    .get(`spfm.supplier.model.supplier.platform.customCompanyName`)
                    .d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="HPFM.COMPANY"
                      textValue={filterCompanyName}
                      queryParams={{ tenantId: organizationId }}
                      onChange={(value, lovRecord) => {
                        this.setState({ filterCompanyName: lovRecord.companyName });
                      }}
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
                loading={queryEbsLoading}
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
