import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';

import cacheComponent from 'components/CacheComponent';

import { SEARCH_FORM_ITEM_LAYOUT, FORM_COL_4_LAYOUT } from 'utils/constants';
import intl from 'utils/intl';

// import withFlexFieldsTriggers from '@/components/FlexFields/withFlexFieldsTriggers';

/**
 * 员工定义-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
// @withFlexFieldsTriggers()
@cacheComponent({ cacheKey: '/hpfm/hr/staff' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expand: false,
    };
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

  @Bind()
  toggleMore() {
    this.setState({ expand: !this.state.expand });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { form = {}, customizeFilterForm /* , flexFieldsTriggers */ } = this.props;
    const { getFieldDecorator } = form;
    const { expand } = this.state;
    // const flexFieldsColumns = getFlexFieldFormItems(flexFieldsTriggers, form);

    return customizeFilterForm(
      { code: 'HPFM.EMPLOYEE_DEFINITION.HEADER_FILTER', form, expand },
      <Form>
        <Row>
          <Col span={18}>
            <Row>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.employee.code').d('员工编码')}
                >
                  {getFieldDecorator('employeeNum', {})(<Input trim inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get('entity.employee.name').d('员工姓名')}
                >
                  {getFieldDecorator('name', {})(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`entity.employee.unitName`).d('所属部门')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('positionUnitId')(
                    <Lov
                      code="SPRM.USER_DEPARTMENT"
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                      // textField="unitName"
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get(`entity.employee.parentUnit`).d('所属公司')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('positionUnitCompanyId')(
                    <Lov
                      code="HPFM.UNIT.COMPANY"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_4_LAYOUT}>
                <Form.Item
                  label={intl.get('hpfm.employee.model.employee.positionName').d('所属岗位')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('positionId')(
                    <Lov
                      code="LOV_POSITION"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          {/* {flexFieldsColumns.map(o => (
            <Col key={o.key} {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
              {o.component({ formItemProps: {...SEARCH_FORM_ITEM_LAYOUT} })}
            </Col>
          ))} */}
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button data-code="reset" onClick={this.toggleMore}>
                {expand
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
