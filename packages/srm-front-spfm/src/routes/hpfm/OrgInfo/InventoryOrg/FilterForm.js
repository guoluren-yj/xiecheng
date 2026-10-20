/**
 * InventoryOrg -库存组织页面 -查询条件
 * @date: 2018-11-5
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.3
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Button, Col, Form, Input, Row, Select } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

@Form.create({ fieldNameProp: null })
export default class FilterForm extends Component {
  state = {
    display: true,
  };

  componentDidMount() {
    this.props.onHandleBindRef(this);
  }

  @Bind()
  queryByconditon() {
    const { form, onFetchOrg } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (isEmpty(err)) {
        onFetchOrg(fieldsValue);
      }
    });
  }

  @Bind()
  resetCondition() {
    this.props.form.resetFields();
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
      getOrganizationId,
      customizeFilterForm,
    } = this.props;
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
    return (
      <>
        {customizeFilterForm(
          {
            code: 'SPFM_ORG-INFO_INVENTORYORG.SEARCH',
            form,
            expand: !display,
          },
          <Form layout="inline" className="more-fields-form">
            <Row gutter={12}>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hpfm.inventoryOrg.model.inventoryOrg.headerTitle')
                        .d('库存组织编码')}
                    >
                      {getFieldDecorator('organizationCode')(<Input trim inputChinese={false} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl
                        .get('hpfm.inventoryOrg.model.inventoryOrg.organizationName')
                        .d('库存组织名称')}
                    >
                      {getFieldDecorator('organizationName')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('hpfm.inventoryOrg.model.inventoryOrg.ouId').d('业务实体')}
                    >
                      {getFieldDecorator('ouId')(
                        <Lov
                          code="SPFM.TENANT_OU"
                          queryParams={{
                            organizationId: getOrganizationId,
                            // enabledFlag: 1,
                          }}
                        />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: display ? 'none' : 'block' }}>
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
                <Form.Item>
                  {display ? (
                    <Button onClick={this.toggleForm}>
                      {intl.get('hzero.common.button.viewMore').d('更多查询')}
                    </Button>
                  ) : (
                    <Button onClick={this.toggleForm}>
                      {intl.get('hzero.common.button.collected').d('收起查询')}
                    </Button>
                  )}
                  <Button onClick={this.resetCondition}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ marginLeft: 8 }}
                    onClick={this.queryByconditon}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </>
    );
  }
}
