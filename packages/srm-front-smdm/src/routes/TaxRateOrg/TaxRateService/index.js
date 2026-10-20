import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

/**
 * 付款方式定义表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      display: true,
    };
  }

  componentDidMount() {
    const { onSearch, form } = this.props;
    onSearch();
    this.props.onRef(form);
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({ display: !display });
  }

  @Bind()
  renderForm() {
    const { form, fields, language } = this.props;
    const { getFieldDecorator } = form;
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const { display } = this.state;
    const searchFormAll = fields
      .filter((item) => !!parseInt(item.enabledFlag, 0))
      .sort((firstEl, secondEl) => {
        return firstEl.orderSeq >= secondEl.orderSeq ? 1 : -1;
      })
      .map((item) => {
        const { field, name, multiLanguage, tenantId, selectLov } = item;
        const { lovCode, textField, valueField, displayField } = JSON.parse(selectLov);
        let companyParams = null;
        if (field === 'supplierId') {
          companyParams = form && { companyId: form.getFieldValue('companyId') };
        }
        const lovOption =
          fields.length <= 0
            ? null
            : {
                lovOptions: {
                  displayField: displayField || textField,
                  valueField: valueField || field,
                },
              };
        return field === 'countryId' ? (
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={multiLanguage ? intl.get(multiLanguage).d(name) : name}
            >
              {getFieldDecorator(textField)(<Input />)}
            </Form.Item>
          </Col>
        ) : (
          <Col span={8}>
            <Form.Item
              {...formItemLayout}
              label={multiLanguage ? intl.get(multiLanguage).d(name) : name}
            >
              {getFieldDecorator(field)(
                <Lov code={lovCode} queryParams={{ tenantId, ...companyParams }} {...lovOption} />
              )}
            </Form.Item>
          </Col>
        );
      });
    const searchFormBeforeThree = searchFormAll.slice(0, 3);
    const searchFormLeft = searchFormAll.slice(3);
    return (
      fields.length > 0 && (
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={18}>
              <Row>{searchFormBeforeThree}</Row>
              <Row style={{ display: display ? 'none' : 'block' }}>
                {searchFormLeft}
                <Col span={8}>
                  <Form.Item
                    {...formItemLayout}
                    label={intl.get(`smdm.taxRateOrg.model.taxRate.taxRate`).d('税率')}
                  >
                    {getFieldDecorator('taxId')(
                      <Lov
                        code="SMDM.TAX"
                        queryParams={{ enabledFlag: 1, lang: language, taxFrom: 'RATIO' }}
                        lovOptions={{ displayField: 'taxCode', valueField: 'taxId' }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
                <Button onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button
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
      )
    );
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { loading, columns, content, pagination, onSearch } = this.props;
    return (
      <div>
        <div className="table-list-search">{this.renderForm()}</div>
        <EditTable
          bordered
          loading={loading}
          dataSource={content}
          columns={columns}
          pagination={pagination}
          onChange={(page) => {
            onSearch(page);
          }}
        />
      </div>
    );
  }
}
