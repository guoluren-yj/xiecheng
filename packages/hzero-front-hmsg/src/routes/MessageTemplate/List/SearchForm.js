import React from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { Button, Col, Form, Input, Row, Select } from 'hzero-ui';

import Lov from 'components/Lov';
import cacheComponent from 'components/CacheComponent';

import intl from 'utils/intl';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'hzero-front/lib/utils/utils';
import {
  DEBOUNCE_TIME,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hmsg/message-template/list' })
export default class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      expandForm: false,
      lovCodes: {},
    };
    // HPFM.PROCESS_DOCUMENT_SOURCE
    queryMapIdpValue({ source: 'HPFM.PROCESS_DOCUMENT_SOURCE' }).then((res) => {
      if (getResponse(res)) {
        this.setState({ lovCodes: res || {} });
      }
    });
  }

  componentWillUnmount() {
    this.toggleForm.cancel();
  }

  @Throttle(DEBOUNCE_TIME)
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  @Bind()
  handleSearch() {
    const { form, onSearch } = this.props;
    onSearch(form);
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const { form, tenantRoleLevel } = this.props;
    const {
      expandForm,
      lovCodes: { source = [] },
    } = this.state;
    return (
      <Form className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col>
            <Row {...SEARCH_FORM_ROW_LAYOUT} type="flex" gutter={24} align="bottom">
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hmsg.messageTemplate.model.template.templateCode')
                    .d('消息模板代码')}
                >
                  {form.getFieldDecorator('templateCode')(
                    <Input typeCase="upper" trim inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.messageTemplate.model.templateTitle').d('消息模板标题')}
                >
                  {form.getFieldDecorator('templateTitle')(<Input trim />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hmsg.messageTemplate.model.template.templateName')
                    .d('消息模板名称')}
                >
                  {form.getFieldDecorator('templateName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
                <Form.Item>
                  <Button onClick={this.toggleForm}>
                    {expandForm
                      ? intl.get('hzero.common.button.collected').d('收起查询')
                      : intl.get('hzero.common.button.viewMore').d('更多查询')}
                  </Button>
                  <Button onClick={this.handleReset}>
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button type="primary" htmlType="submit" onClick={this.handleSearch}>
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Form.Item>
              </Col>
            </Row>
            <Row
              {...SEARCH_FORM_ROW_LAYOUT}
              style={{ display: expandForm ? '' : 'none' }}
              type="flex"
              gutter={24}
              align="bottom"
            >
              {tenantRoleLevel
                ? [
                  <Col {...FORM_COL_4_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('hmsg.messageTemplate.model.source').d('来源')}
                    >
                      {form.getFieldDecorator('source')(
                        <Select allowClear>
                          {source.map((item) => (
                            <Select.Option value={item.value}>{item.meaning}</Select.Option>
                            ))}
                        </Select>
                        )}
                    </Form.Item>
                  </Col>,
                  ]
                : [
                  <Col {...FORM_COL_4_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('entity.tenant.tag').d('租户')}
                    >
                      {form.getFieldDecorator('tenantId')(
                        <Lov code="HPFM.TENANT" textField="tenantName" />
                        )}
                    </Form.Item>
                  </Col>,
                  ]}
            </Row>
          </Col>
        </Row>
      </Form>
    );
  }
}
