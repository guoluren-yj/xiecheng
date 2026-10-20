import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, InputNumber, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';

import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 付款方式定义表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
const tenantId = getCurrentOrganizationId();
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      expandForm: false,
    };
  }

  componentDidMount() {
    this.props.onRef(this);
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
   * 查询条件展开/收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { expandForm } = this.state;
    const { customizeFilterForm, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        {customizeFilterForm(
          {
            code: 'SMDM_TAXRATE_ORG.SEARCH',
            form,
            expand: expandForm,
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`smdm.taxRateOrg.model.taxRate.taxCode`).d('税率代码')}
                    >
                      {getFieldDecorator('taxCode')(<Input inputChinese={false} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`smdm.taxRateOrg.model.taxRate.description`).d('税率描述')}
                    >
                      {getFieldDecorator('description')(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={`${intl.get(`smdm.taxRateOrg.model.taxRate.taxRate`).d('税率')}（%）`}
                    >
                      {getFieldDecorator('taxRate')(
                        <InputNumber precision={3} max={100} min={0} />
                      )}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`smdm.taxRateOrg.model.taxRate.company`).d('公司')}
                    >
                      {getFieldDecorator(
                        'companyId',
                        {}
                      )(<Lov code="SPFM.USER_AUTHORITY_COMPANY" queryParams={{ tenantId }} />)}
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
              <Col span={6} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {expandForm
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
                  </Button>
                  <Button data-code="reset" onClick={this.handleFormReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    style={{ marginLeft: 8 }}
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Fragment>
    );
  }
}
