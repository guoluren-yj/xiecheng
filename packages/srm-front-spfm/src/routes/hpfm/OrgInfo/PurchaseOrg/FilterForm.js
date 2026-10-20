import React, { PureComponent } from 'react';
import { Button, Form, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  state = {
    display: true,
  };

  /**
   * handleSearchOrg - 搜索采购组织
   * @param {object} e - 事件对象
   */
  @Bind()
  handleSearchOrg(e) {
    e.preventDefault();
    const { form } = this.props;
    this.props.onSearch(form.getFieldsValue());
  }

  /**
   * handleResetSearch - 重置搜索表单
   * @param {object} e - 事件对象
   */
  @Bind()
  handleResetSearch() {
    const { form } = this.props;
    this.props.onReset(form);
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
        code: 'SPFM_ORG-INFO_PURCHASE_ORG.SEARCH',
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
                  label={intl.get('hpfm.purchaseOrg.model.org.organizationCode').d('采购组织编码')}
                >
                  {getFieldDecorator('organizationCode')(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.purchaseOrg.model.org.organizationName').d('采购组织名称')}
                >
                  {getFieldDecorator('organizationName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.purchaseOrg.model.org.purchaseAgent').d('指定采购员')}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov
                      code="SPFM.TENANT_PURCHASE_AGENT"
                      lovOptions={{
                        displayField: 'purchaseAgentCode',
                        valueField: 'purchaseAgentId',
                      }}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
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
              <Button onClick={this.handleResetSearch}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: 8 }}
                onClick={this.handleSearchOrg}
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
