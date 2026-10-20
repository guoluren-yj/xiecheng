import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import { SEARCH_FORM_ITEM_LAYOUT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';

const modelPrompt = 'hpfm.libraryPosition.model.lp';

/**
 * 库位查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  state = {
    display: true,
  };

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 表单查询
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
   * 表单重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 多查询条件展示
   */
  @Bind()
  toggleForm() {
    const { display } = this.state;
    this.setState({
      display: !display,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form: { getFieldDecorator },
      organizationId,
      customizeFilterForm,
    } = this.props;
    const { display = true } = this.state;
    const statusMap = [
      {
        value: 1,
        meaning: intl.get('hzero.common.status.enableFlag').d('启用'),
      },
      {
        value: 0,
        meaning: intl.get('hzero.common.status.disable').d('禁用'),
      },
    ];
    return customizeFilterForm(
      {
        code: 'SPFM_ORG-INFO_LIBRARY_POSITION.SEARCH',
        form: this.props.form,
        expand: !display,
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.locationCode`).d('库位编码')}
                >
                  {getFieldDecorator('locationCode')(<Input inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.locationName`).d('库位名称')}
                >
                  {getFieldDecorator('locationName')(<Input />)}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.ouId`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(
                    <Lov code="SPFM.TENANT_OU" queryParams={{ organizationId }} />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: display ? 'none' : 'block' }}>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hpfm.libraryPosition.model.lp.inventoryName').d('库房')}
                >
                  {getFieldDecorator('inventoryId')(
                    <Lov
                      code="HPFM.LOCATION.INVENTORY"
                      queryParams={{ tenantId: organizationId }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${modelPrompt}.invOrganizationName`).d('库存组织')}
                >
                  {getFieldDecorator('organizationId')(
                    <Lov
                      code="HPFM.INV_ORG"
                      queryParams={{ organizationId: getCurrentOrganizationId() }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('hzero.common.status').d('状态')}
                >
                  {getFieldDecorator('enabledFlag')(
                    <Select allowClear>
                      {statusMap.map((n) => (
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
              {display ? (
                <Button onClick={this.toggleForm}>
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
              ) : (
                <Button onClick={this.toggleForm}>
                  {intl.get('hzero.common.button.collected').d('收起查询')}
                </Button>
              )}
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{ marginLeft: 8 }}
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
