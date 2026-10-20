import React from 'react';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import { Button, Col, Form, Input, Row, Select, TreeSelect } from 'hzero-ui';

import Lov from 'components/Lov';

import intl from 'utils/intl';
import {
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';
import cacheComponent from 'components/CacheComponent';

@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hmsg/send-config/search-form' })
export default class SearchForm extends React.Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
    this.state = {
      isExpendSearch: false,
    };
  }

  static propTypes = {
    onSearch: PropTypes.func.isRequired,
  };

  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }

  @Bind()
  handleReset() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  handleExpendSearch() {
    const { isExpendSearch } = this.state;
    this.setState({ isExpendSearch: !isExpendSearch });
  }

  render() {
    const { form, tenantRoleLevel, messageFrom = [], messageType = [] } = this.props;
    const { isExpendSearch } = this.state;
    const messageTypeList = messageType.map(item => ({
      title: item.meaning,
      value: item.value,
      key: item.value,
    }));
    return (
      <Form className="more-fields-search-form">
        <Row>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT} type="flex" gutter={24} align="bottom">
              {!tenantRoleLevel && (
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get('entity.tenant.tag').d('租户')}
                  >
                    {form.getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" />)}
                  </Form.Item>
                </Col>
              )}
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.sendConfig.model.sendConfig.messageCode').d('消息代码')}
                >
                  {form.getFieldDecorator('messageCode')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hmsg.sendConfig.model.sendConfig.messageName').d('消息名称')}
                >
                  {form.getFieldDecorator('messageName')(<Input />)}
                </Form.Item>
              </Col>
              <Col
                {...FORM_COL_3_LAYOUT}
                style={{ display: !tenantRoleLevel && !isExpendSearch ? 'none' : '' }}
              >
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('hmsg.sendConfig.model.sendConfig.roleWorkbenchShieldFlag')
                    .d('角色工作台站内信屏蔽')}
                >
                  {form.getFieldDecorator('roleWorkbenchShieldFlag')(
                    <Select allowClear>
                      <Select.Option value={1}>
                        {intl.get('hzero.common.enable').d('启用')}
                      </Select.Option>
                      <Select.Option value={0}>
                        {intl.get('hzero.common.disable').d('禁用')}
                      </Select.Option>
                    </Select>
                  )}
                </Form.Item>
              </Col>
              {tenantRoleLevel && (
                <Col {...FORM_COL_3_LAYOUT} style={{ display: isExpendSearch ? '' : 'none' }}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get('hmsg.common.view.source').d('来源')}
                  >
                    {form.getFieldDecorator('source')(
                      <Select allowClear>
                        {messageFrom.map(i => (
                          <Select.Option value={i.value}>{i.meaning}</Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              )}
              {tenantRoleLevel && (
                <Col {...FORM_COL_3_LAYOUT} style={{ display: isExpendSearch ? '' : 'none' }}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get('hmsg.sendConfig.model.sendConfig.typeMeaning').d('启用服务')}
                  >
                    {form.getFieldDecorator('serverTypeCode')(
                      <Select mode="tags" allowClear>
                        {messageType.map(i => (
                          <Select.Option value={i.value}>{i.meaning}</Select.Option>
                        ))}
                      </Select>
                      // <TreeSelect allowClear treeCheckable multiple treeData={messageTypeList} />
                    )}
                  </Form.Item>
                </Col>
              )}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.handleExpendSearch}>
                {isExpendSearch
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
      </Form>
    );
  }
}
