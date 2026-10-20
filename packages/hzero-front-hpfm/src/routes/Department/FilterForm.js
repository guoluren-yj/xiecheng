import React, { PureComponent, Fragment } from 'react';
import { Form, Button, Input, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import classNames from 'classnames';
// import CacheComponent from 'components/CacheComponent';

import { SEARCH_FORM_ITEM_LAYOUT, SEARCH_FORM_CLASSNAME } from 'utils/constants';
import { getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';

import styles from './index.less';

/**
 * 部门维护-数据修改滑窗(抽屉)
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询=
 * @reactProps {string} companyName - 公司名称
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@Form.create({ fieldNameProp: null })
// @CacheComponent({ cacheKey: '/hpfm/hr/org/department' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      display: false,
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
    const { display } = this.state;
    const flagArr = [
      {
        value: 1,
        meaning: intl.get('hzero.common.status.yes').d('是'),
      },
      {
        value: 0,
        meaning: intl.get('hzero.common.status.no').d('否'),
      },
      {
        value: -1,
        meaning: intl.get('hitf.common.view.logicOperation.isEmpty').d('为空'),
      },
    ];
    const { companyName, form } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Fragment>
        <Fragment>
          <p className={classNames(styles['hpfm-hr-title'])}>
            <span />
            {intl
              .get('hpfm.department.view.message.tips', {
                name: companyName,
              })
              .d(`当前正在为「${companyName}」公司，分配部门`)}
          </p>
        </Fragment>
        <Form className={SEARCH_FORM_CLASSNAME}>
          <Row>
            <Col span={18}>
              <Row>
                <Col span={8}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get('entity.department.code').d('部门编码')}
                  >
                    {getFieldDecorator('unitCode')(<Input trim inputChinese={false} />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl.get('entity.department.name').d('部门名称')}
                  >
                    {getFieldDecorator('unitName')(<Input />)}
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl
                      .get('hpfm.department.model.department.enableBudgetFlag')
                      .d('是否启用预算')}
                  >
                    {getFieldDecorator('enableBudgetFlag')(
                      <Select style={{ width: '100%' }}>
                        {flagArr.map((m) => (
                          <Select.Option key={m.value} value={m.value}>
                            {m.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )}
                  </Form.Item>
                </Col>
              </Row>
              <Row style={{ display: display ? 'block' : 'none' }}>
                <Col span={8}>
                  <Form.Item
                    {...SEARCH_FORM_ITEM_LAYOUT}
                    label={intl
                      .get('hpfm.department.model.department.ownerCostCentral')
                      .d('所属成本中心')}
                  >
                    {getFieldDecorator('costId')(
                      <Lov
                        code="SPRM.COST_CENTER"
                        lovOptions={{ valueField: 'costId' }}
                        queryParams={{ tenantId: getUserOrganizationId() }}
                      />
                    )}
                  </Form.Item>
                </Col>
              </Row>
            </Col>
            <Col span={6} className="search-btn-more">
              <Form.Item>
                <Button
                  style={{ display: !display ? 'inline-block' : 'none' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.viewMore').d('更多查询')}
                </Button>
                <Button
                  style={{ display: !display ? 'none' : 'inline-block' }}
                  onClick={this.toggleForm}
                >
                  {intl.get('hzero.common.button.collected').d('收起查询')}
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
      </Fragment>
    );
  }
}
