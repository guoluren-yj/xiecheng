import React, { PureComponent } from 'react';
import { Bind, Throttle } from 'lodash-decorators';
import { Button, Col, Form, Input, Row, Select } from 'hzero-ui';

import cacheComponent from 'components/CacheComponent';
import Lov from 'components/Lov';

import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import {
  DEBOUNCE_TIME,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_FIELD_CLASSNAME,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

import styles from './styles.less';

const expandFormStyle = {
  display: '',
};
const noExpandFormStyle = {
  display: 'none',
};

/**
 * 查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/hpfm/value-list/list' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      expandForm: false,
    };
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

  /**
   * 查询
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
   * 重置
   */
  @Bind()
  handleFormReset() {
    const { form } = this.props;
    form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form, lovType, labelType } = this.props;
    const { expandForm } = this.state;
    const isSite = !isTenantRoleLevel();
    return (
      <Form className={`${styles['value-list-search-form']} more-fields-search-form`}>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.valueList.model.header.lovCode').d('值集编码')}
                >
                  {form.getFieldDecorator('lovCode')(
                    <Input
                      trim
                      typeCase="upper"
                      inputChinese={false}
                      className={FORM_FIELD_CLASSNAME}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.valueList.model.header.lovName').d('值集名称')}
                >
                  {form.getFieldDecorator('lovName')(<Input className={FORM_FIELD_CLASSNAME} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.valueList.model.header.lovTypeCode').d('值集类型')}
                >
                  {form.getFieldDecorator('lovTypeCode')(
                    <Select className={FORM_FIELD_CLASSNAME} allowClear>
                      {lovType.map((m) => (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row
              {...SEARCH_FORM_ROW_LAYOUT}
              style={expandForm ? expandFormStyle : noExpandFormStyle}
            >
              {isSite ? (
                <Col {...FORM_COL_3_LAYOUT}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get('hpfm.valueList.model.header.tenantName').d('所属租户')}
                  >
                    {form.getFieldDecorator('tenantId')(
                      <Lov
                        code="HPFM.TENANT"
                        textField="tenantName"
                        className={FORM_FIELD_CLASSNAME}
                      />
                    )}
                  </Form.Item>
                </Col>
              ) : (
                <>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('hzero.common.source').d('来源')}
                    >
                      {form.getFieldDecorator('enabledCustom')(
                        <Select allowClear>
                          <Select.Option value={false}>
                            {intl.get('hzero.common.predefined').d('预定义')}
                          </Select.Option>
                          <Select.Option value>
                            {intl.get('hzero.common.custom').d('自定义')}
                          </Select.Option>
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                  <Col {...FORM_COL_3_LAYOUT}>
                    <Form.Item
                      {...SEARCH_FORM_ITEM_LAYOUT}
                      label={intl.get('hzero.common.status').d('状态')}
                    >
                      {form.getFieldDecorator('enabledFlag')(
                        <Select allowClear>
                          <Select.Option value={1}>
                            {intl.get('hzero.common.status.enable').d('启用')}
                          </Select.Option>
                          <Select.Option value={0}>
                            {intl.get('hzero.common.status.disable').d('禁用')}
                          </Select.Option>
                        </Select>
                      )}
                    </Form.Item>
                  </Col>
                </>
              )}
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.valueList.model.header.labelCode').d('值集使用方')}
                >
                  {form.getFieldDecorator('labelCode')(
                    <Select allowClear>
                      {labelType && labelType.length
                        ? labelType.map((item) => (
                          <Select.Option value={item.value}>{item.meaning}</Select.Option>
                          ))
                        : null}
                    </Select>
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
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
