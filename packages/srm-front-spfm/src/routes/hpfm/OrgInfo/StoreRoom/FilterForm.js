/*
 * FilterForm - 库房查询表单
 * @date: 2018/08/07 14:48:29
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';

import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

/**
 * 计量单位查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} handleSearch // 搜索
 * @reactProps {Function} handleFormReset // 重置表单
 * @return React.element
 */
const FormItem = Form.Item;
const modelPrompt = 'hpfm.storeRoom.model.storeRoom';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  state = {
    display: true,
  };

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (isFunction(onSearch)) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

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
    const { customizeFilterForm } = this.props;
    const { getFieldDecorator } = this.props.form;
    const { display } = this.state;
    const statusMap = [
      {
        value: 1,
        meaning: intl.get('hzero.common.status.enableFlag').d('启用'),
      },
      {
        value: 0,
        meaning: intl.get('hzero.common.status.disable').d('禁用'),
      },
    ];
    return customizeFilterForm(
      {
        code: 'SPFM_ORG-INFO_STOREROOM.SEARCH',
        form: this.props.form,
        expand: !display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.inventoryCode`).d('库房编码')}
                >
                  {getFieldDecorator('inventoryCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.inventoryName`).d('库房名称')}
                >
                  {getFieldDecorator('inventoryName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.ouId`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov
                      code="SPFM.TENANT_OU"
                      queryParams={{ organizationId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.invOrganizationName`).d('库存组织')}
                >
                  {getFieldDecorator('organizationId')(
                    <Lov
                      code="HPFM.INV_ORG"
                      queryParams={{ organizationId: getCurrentOrganizationId() }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hzero.common.status').d('状态')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      {statusMap.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <FormItem>
              {display ? (
                <Button onClick={this.toggleForm}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
              ) : (
                <Button onClick={this.toggleForm}>
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              )}
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                htmlType="submit"
                type="primary"
                style={{ marginLeft: 8 }}
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
