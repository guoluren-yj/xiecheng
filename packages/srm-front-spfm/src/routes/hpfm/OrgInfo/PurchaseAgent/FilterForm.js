import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';

import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;

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
   * 采购员列表条件查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err) => {
        if (!err) {
          onSearch();
        }
      });
    }
  }

  /**
   * 采购员列表查询表单重置
   */
  @Bind()
  handleReset() {
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
    const { form = {}, customizeFilterForm } = this.props;
    const { getFieldDecorator } = form;
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
        code: 'SPFM_ORG-INFO_PURCHASEAGENT.FILTER',
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
                  label={intl
                    .get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentCode')
                    .d('采购员编码')}
                >
                  {getFieldDecorator('purchaseAgentCode', {
                    initialValue: '',
                  })(<Input trim inputChinese={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.purchaseAgent.model.purchaseAgent.purchaseAgentName')
                    .d('采购员名称')}
                >
                  {getFieldDecorator('purchaseAgentName', {
                    initialValue: '',
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hpfm.purchaseAgent.model.purchaseAgent.designatedUser')
                    .d('指定用户')}
                >
                  {getFieldDecorator('userId', {
                    initialValue: '',
                  })(
                    <Lov
                      code="HPFM.PURCHASE_AGENT.USER"
                      queryParams={{ organizationId: getCurrentOrganizationId() }}
                      lovOptions={{
                        valueField: 'id', // 选择值集后实际使用字段
                        displayField: 'realName', // 从模态框选取后输入框显示的字段
                      }}
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
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
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
