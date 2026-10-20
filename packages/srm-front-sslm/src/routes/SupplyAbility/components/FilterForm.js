import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Row, Col, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';

import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import LovMultiple from '@/routes/components/LovMultiple';

const { Option } = Select;
const FormItem = Form.Item;

const tenantId = getCurrentOrganizationId();

/**
 * 推荐物料品类/表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */

@connect(({ supplyAbility, loading }) => ({
  supplyAbility,
  queryLoading: loading.effects['supplyAbility/queryCategoryMaterial'],
}))
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) {
      onRef(this);
    }
    this.state = {
      expandForm: false,
      statusList: [],
      supplyList: [],
      itemCategorySelectRows: [],
      itemSelectRows: [],
    };
  }

  componentDidMount() {
    this.queryCode();
    this.handleSearch();
  }

  /**
   * 值集查询
   */
  @Bind()
  queryCode() {
    const { dispatch } = this.props;
    const lovCodes = {
      statusList: 'SUPPLY_ABILITY_REVIEW_LINE_STATUS',
      supplyList: 'HPFM.FLAG',
      tenantId,
    };

    dispatch({
      type: 'supplyAbility/init',
      payload: lovCodes,
    }).then(res => {
      if (res) {
        const { statusList, supplyList } = res;
        this.setState({
          statusList,
          supplyList,
        });
      }
    });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields((err, values) => {
        if (!err) {
          const { itemCategoryIdList, categoryName, itemIdList, itemName, ...others } = values;
          const newItemCategoryIdList = (itemCategoryIdList && itemCategoryIdList.split(',')) || [];
          const newItemIds = (itemIdList && itemIdList.split(',')) || [];
          // 如果验证成功,则执行onSearch
          const bodyData = filterNullValueObject({
            ...others,
            itemCategoryIdList: newItemCategoryIdList,
            itemIdList: newItemIds,
          });
          onSearch({
            bodyData,
          });
        }
      });
    }
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 表单展开收起
   */
  @Bind()
  toggleForm() {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      form: { getFieldDecorator },
      customizeFilterForm,
      // custLoading,
      code = '',
      queryLoading,
    } = this.props;
    const {
      expandForm,
      statusList,
      itemCategorySelectRows = [],
      supplyList = [],
      itemSelectRows = [],
    } = this.state;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    return customizeFilterForm(
      {
        code, // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('supplyReviewStatus')(
                    <Select allowClear>
                      {statusList.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryName`)
                    .d('品类名称')}
                >
                  {getFieldDecorator('itemCategoryIdList')(
                    <LovMultiple
                      code="SMDM.TREE_ITEM_CATEGORY"
                      queryParams={{
                        enabledFlag: 1,
                      }}
                      textField="categoryName"
                      selectedRows={itemCategorySelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemCategorySelectRows: newSelectedRows })
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.itemRelName`)
                    .d('物料名称')}
                >
                  {getFieldDecorator('itemIdList')(
                    <LovMultiple
                      code="SSLM.RELATED_CATEGORY_ITEM"
                      textField="itemName"
                      lovOptions={{ displayField: 'itemName' }}
                      selectedRows={itemSelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemSelectRows: newSelectedRows })
                      }
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`)
                    .d('是否可供')}
                >
                  {getFieldDecorator('supplyFlag')(
                    <Select allowClear style={{ width: '100%' }}>
                      {supplyList.map(item => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get(`hzero.common.button.collected`).d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
                loading={queryLoading}
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
