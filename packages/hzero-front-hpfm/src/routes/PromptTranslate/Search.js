import React from 'react';
import { Form, Input, Button, Select, Row, Col } from 'hzero-ui';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { isTenantRoleLevel } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';

import {
  FORM_COL_3_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_4_LAYOUT,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

const { Option } = Select;
const FormItem = Form.Item;

const isTenant = isTenantRoleLevel();

function Search(props = {}) {
  const { languageInfo } = props;
  const handleSearch = () => {
    const { onFilterChange, form } = props;
    if (form) {
      const values = form.getFieldsValue();
      if (onFilterChange) {
        onFilterChange(values);
      }
    }
  };

  const handleFormReset = () => {
    const { form } = props;
    form.resetFields();
  };

  const {
    form: { getFieldDecorator },
  } = props;

  return (
    <Form className="more-fields-search-form">
      <Row {...SEARCH_FORM_ROW_LAYOUT}>
        <Col {...FORM_COL_3_4_LAYOUT}>
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.prompt.model.prompt.promptKey').d('模板代码')}
              >
                {getFieldDecorator('promptKey')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.prompt.model.prompt.promptCode').d('代码')}
              >
                {getFieldDecorator('promptCode')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl.get('hpfm.prompt.model.prompt.description').d('描述')}
              >
                {getFieldDecorator('description')(<Input />)}
              </FormItem>
            </Col>
          </Row>
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_3_LAYOUT}>
              <FormItem
                {...SEARCH_FORM_ITEM_LAYOUT}
                label={intl
                  .get('spfm.promptTranslate.model.promptTranslate.langExclude')
                  .d('未维护语言')}
              >
                {getFieldDecorator('langExclude')(
                  <Select allowClear>
                    {languageInfo.map((item) => (
                      <Option key={item.code} value={item.code}>
                        {item.description}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormItem>
            </Col>
            {!isTenant && (
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl
                    .get('spfm.promptTranslate.model.promptTranslate.tenant')
                    .d('选择租户')}
                >
                  {getFieldDecorator('tenantId')(<Lov code="HPFM.TENANT" textField="tenantName" />)}
                </Form.Item>
              </Col>
            )}
          </Row>
        </Col>
        <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
          <FormItem>
            <Button onClick={handleFormReset}>
              {intl.get(`hzero.common.button.reset`).d('重置')}
            </Button>
            <Button type="primary" htmlType="submit" onClick={handleSearch}>
              {intl.get(`hzero.common.button.search`).d('查询')}
            </Button>
          </FormItem>
        </Col>
      </Row>
    </Form>
  );
}

export default Form.create({ fieldNameProp: null })(cacheComponent()(Search));
