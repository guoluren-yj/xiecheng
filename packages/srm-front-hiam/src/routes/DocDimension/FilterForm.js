/**
 * docDimension-单据维度
 * @date: 2019-09-19
 * @author: jinmingyang <mingyang.jin@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

import {
  FORM_COL_4_LAYOUT,
  SEARCH_COL_CLASSNAME,
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
} from 'utils/constants';

const { Option } = Select;
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
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

  // 租户API管理页面更多查询切换
  @Bind()
  handleMoreSearchItem() {
    const { searchMoreFlag = false } = this.state || {};
    console.log(this.state, this.setState)
    this.setState({ searchMoreFlag: !searchMoreFlag });
  }


  /**
   * 表单重置
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
    const { form, dimensionTypeList = [], statusList = [] } = this.props;
    const { searchMoreFlag = false } = this.state || {};
    return (

      <Form>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hiam.docDimension.model.docDimension.dimensionCode').d('维度编码')}
                >
                  {form.getFieldDecorator('dimensionCode')(
                    <Input typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hiam.docDimension.model.docDimension.dimensionName').d('维度名称')}
                >
                  {form.getFieldDecorator('dimensionName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hiam.docDimension.model.docDimension.dimensionType').d('维度类型')}
                >
                  {form.getFieldDecorator('dimensionType')(<Select allowClear>
                    {dimensionTypeList.map((item) => (
                      <Option value={item.value} key={item.meaning}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: searchMoreFlag ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hzero.common.status').d('状态')}
                >
                  {form.getFieldDecorator('enabledFlag')(<Select allowClear>
                    {statusList.map((item) => (
                      <Option value={item.value} key={item.meaning}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>)}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
            <Form.Item>
              <Button onClick={this.handleMoreSearchItem}>
                {searchMoreFlag
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button htmlType="submit" type="primary" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
