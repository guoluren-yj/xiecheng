/**
 * 查询表单
 * @date: 2018-8-15
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Select, Col, Row, Input } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import Lov from 'components/Lov';

const FormItem = Form.Item;
const { Option } = Select;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const tenantId = getCurrentOrganizationId();

@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  @Bind()
  handleSearch() {
    const { onFilterChange } = this.props;
    if (onFilterChange) {
      onFilterChange();
    }
  }

  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      investigateTypes,
      investigateType,
      industryMeaning,
      industryId,
      form: { getFieldDecorator },
    } = this.props;
    return (
      <div className="table-list-search">
        <Form layout="inline" className="more-fields-form">
          <Row>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get(`sslm.referTemp.model.referTemp.investigateTypeMeaning`)
                  .d('调查表类型')}
              >
                {getFieldDecorator('investigateType', {
                  initialValue: investigateType,
                })(
                  <Select allowClear>
                    {(investigateTypes || []).map(n =>
                      (n || {}).value ? (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
                        </Option>
                      ) : (
                        undefined
                      )
                    )}
                  </Select>
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sslm.referTemp.model.referTemp.industryMeaning`).d('行业')}
              >
                {getFieldDecorator('industryId', {
                  initialValue: industryId,
                })(
                  <Lov
                    code="SPFM.INDUSTRYS"
                    textValue={industryMeaning}
                    queryParams={{ tenantId }}
                  />
                )}
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`sslm.referTemp.model.referTemp.templateName`).d('模板名称')}
              >
                {getFieldDecorator('templateName')(<Input />)}
              </FormItem>
            </Col>
            <Col span={6} className="search-btn-more">
              <FormItem>
                <Button
                  data-code="search"
                  type="primary"
                  htmlType="submit"
                  onClick={this.handleSearch}
                >
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
                <Button data-code="reset" style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
