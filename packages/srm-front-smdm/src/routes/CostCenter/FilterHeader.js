import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import Lov from 'components/Lov';
import intl from 'utils/intl';

import { getCurrentOrganizationId } from 'utils/utils';
/**
 * 成本中心
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 表单查询
 * @return React.element
 */

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
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
      form.validateFields((err) => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
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
    const { tenantId, expandForm } = this.state;
    const { getFieldDecorator } = this.props.form;
    const { customizeFilterForm, form, yesOrNoList } = this.props;
    return (
      <Fragment>
        {customizeFilterForm(
          {
            code: 'SMDM.COSTCENTER.FILTER',
            form,
            expand: expandForm,
          },
          <Form layout="inline" className="more-fields-form">
            <Row>
              <Col span={18}>
                <Row>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('smdm.common.model.costCenter.code').d('成本中心编码')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('costCode', {})(<Input inputChinese={false} />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('smdm.common.model.costCenter.desc').d('成本中心描述')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator('costName', {})(<Input />)}
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      label={intl.get('smdm.common.model.costCenter.ouName').d('业务实体')}
                      {...formItemLayout}
                    >
                      {getFieldDecorator(
                        'ouId',
                        {}
                      )(<Lov code="HPFM.OU" queryParams={{ tenantId }} />)}
                    </Form.Item>
                  </Col>
                </Row>
                <Row style={{ display: expandForm ? 'block' : 'none' }}>
                  <Col span={8}>
                    <Form.Item
                      {...formItemLayout}
                      label={intl.get(`smdm.common.model.common.deleteFlag`).d('是否启用')}
                    >
                      {getFieldDecorator('enabledFlag')(
                        <Select allowClear>
                          {yesOrNoList.map((n) => (
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
