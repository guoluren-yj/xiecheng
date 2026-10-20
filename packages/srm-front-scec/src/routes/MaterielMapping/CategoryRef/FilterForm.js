/**
 * Categoryref -目录映射物料 -form
 * @date: 2019-2-20
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';

import intl from 'utils/intl';

const FormItem = Form.Item;
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const modelPrompt = 'scec.ecMaterielMapping.model';
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: true,
    };
  }

  /**
   * 表单查询
   */
  @Bind()
  fetchEcCatalog() {
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

  render() {
    const { display } = this.state;
    const {
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      mapStatusList = [],
    } = this.props;
    return (
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={6}>
            <FormItem
              label={intl
                .get('scec.ecMaterielMapping.view.ecMaterielMapping.companyName')
                .d('公司名称')}
              {...formLayout}
            >
              {getFieldDecorator('companyId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('scec.ecMaterielMapping.view.ecMaterielMapping.companyName')
                        .d('公司名称'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  onChange={() => {
                    setFieldsValue({
                      invOrganizationId: undefined,
                    });
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.organizaiton').d('库存组织')}
              {...formLayout}
            >
              {getFieldDecorator('invOrganizationId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('scec.common.model.organizaiton').d('库存组织'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SQAM.INVORGNIZATION"
                  disabled={!getFieldValue('companyId')}
                  queryParams={{ companyId: getFieldValue('companyId') }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem label={intl.get(`${modelPrompt}.item`).d('物料')} {...formLayout}>
              {getFieldDecorator('itemName')(<Input />)}
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
              <Button type="primary" htmlType="submit" onClick={this.fetchEcCatalog}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </FormItem>
          </Col>
        </Row>
        <Row gutter={12} style={{ display: display ? 'none' : 'block' }}>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.common.model.catalogName').d('目录名称')}
              {...formLayout}
            >
              {getFieldDecorator('catalogName')(<Input />)}
            </FormItem>
          </Col>
          <Col span={6}>
            <FormItem
              label={intl.get('scec.ecCategoryPlatformCatalog.model.mappingStatus').d('映射状态')}
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
            <FormItem label={intl.get(`${modelPrompt}.category`).d('品类')} {...formLayout}>
              {getFieldDecorator('categoryName')(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
