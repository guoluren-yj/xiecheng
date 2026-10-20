import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { SEARCH_FORM_ROW_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';

const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
/**
 * WBS
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} onSearch - 表单查询
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      expandForm: false,
    };
  }

  // 查询条件展开/收起
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
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
    const {
      form: { getFieldDecorator },
      form,
      flag,
      mdmSourcePlatformList,
      customizeFilterForm,
    } = this.props;
    const { tenantId, expandForm } = this.state;
    return customizeFilterForm(
      {
        code: 'SMDM.WBSELE.SEARCH_FORM',
        form, // 无论个性化单元是否只读，均必传
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.common.model.wbs.code`).d('WBS编码')}
                >
                  {getFieldDecorator('wbsCode')(<Input trim />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.common.model.wbs.desc').d('WBS描述')}
                >
                  {getFieldDecorator('wbsName', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.common.model.wbs.companyName').d('公司名称')}
                >
                  {getFieldDecorator(
                    'companyId',
                    {}
                  )(
                    <Lov
                      // lovOptions={{ displayField: 'companyNum' }}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ tenantId }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('smdm.common.model.wbs.ouName').d('业务实体')}
                >
                  {getFieldDecorator(
                    'ouId',
                    {}
                  )(<Lov code="SPFM.USER_AUTH.OU" queryParams={{ tenantId }} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.common.model.common.externalSystemCode`).d('来源系统')}
                >
                  {getFieldDecorator('sourceCode')(
                    <Select allowClear>
                      {mdmSourcePlatformList.map((n) => (
                        <Select.Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get(`smdm.common.model.common.deleteFlag`).d('是否启用')}
                >
                  {getFieldDecorator('deleteFlag')(
                    <Select allowClear>
                      {flag.map((n) => (
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
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
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
    );
  }
}
