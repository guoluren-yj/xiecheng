/**
 * EcCategoryCatalog -集团目录映射 -form
 * @date: 2019-1-30
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Row, Col, Button, Input, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import CacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const modelPrompt = 'scec.ecCategoryPlatformCatalog.model';
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/scec/ec-category-catalog' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
      tenantId: getCurrentOrganizationId(),
      companyId: '-1',
    };
  }

  /**
   * 展开收起
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchEcAcquirerAddressList() {
    const { form, onFetchData } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        onFetchData({
          ...values,
        });
      }
    });
  }

  /**
   * 表单重置
   */
  @Bind()
  reset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { display, tenantId, companyId } = this.state;
    const {
      form: { getFieldDecorator },
      mapStatusList = [],
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem label={intl.get(`${modelPrompt}.ecCategory`).d('电商分类')} {...formLayout}>
              {getFieldDecorator('ecCategoryName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get(`${modelPrompt}.mappingStatus`).d('映射状态')}
              {...formLayout}
            >
              {getFieldDecorator('mappingStatus')(
                <Select allowClear>
                  {mapStatusList.map(item => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl
                .get('scec.ecCategoryCatalog.model.ecCategoryCatalog.catalogId')
                .d('集团目录')}
              {...formLayout}
            >
              {getFieldDecorator('catalogId')(<Lov code="SCEC.TENANT.CATALOG" />)}
            </FormItem>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              <Button
                style={{ display: display ? 'inline-block' : 'none' }}
                onClick={this.toggleForm}
              >
                {intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button
                onClick={this.toggleForm}
                style={{ display: display ? 'none' : 'inline-block' }}
              >
                {intl.get('hzero.common.button.collected').d('收起查询')}
              </Button>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={this.fetchEcAcquirerAddressList}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.ecPlatformName').d('电商名称')}
              {...formLayout}
            >
              {getFieldDecorator('ecPlatformCode')(
                <Lov
                  code="SCEC.EC_PLATFORM_NAME"
                  textField="ecPlatformName"
                  queryParams={{ tenantId, companyId }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
