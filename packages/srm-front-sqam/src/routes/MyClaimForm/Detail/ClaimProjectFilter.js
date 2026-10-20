import React, { PureComponent } from 'react';
import { Form, Button, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import '@/routes/ClaimStatement/Detail/stateDealFilter.less';

@Form.create({ fieldNameProp: null })
// @withCustomize({
//   unitCode: ['SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM_FILTER'],
// })
export default class StateDealFilter extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  /**
   * 表单查询
   */
  @Bind()
  handleSearch() {
    const { handleSearchLine, form } = this.props;
    if (handleSearchLine) {
      form.validateFields(err => {
        if (!err) {
          handleSearchLine();
        }
      });
    }
  }

  /**
   * 表单重置
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
    const { form, customizeFilterForm, custConfig = {} } = this.props;
    const { fields = [] } = custConfig['SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM_FILTER'] || {};
    const searchShow = fields.some(item => item.visible === 1);
    return customizeFilterForm(
      {
        code: 'SQAM.CLAIM_FORM_DETAIL.CLAIM_ITEM_FILTER',
        form,
      },
      <Form layout="inline" className="more-fields-search-form more-fields-search-form-filter">
        <Row gutter={12}>
          <Col span={16}>
            <Row />
          </Col>
          <Col span={8} className="search-btn-more">
            <Form.Item>
              {searchShow && (
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              )}
              {searchShow && (
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
