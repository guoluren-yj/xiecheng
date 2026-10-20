import React, { PureComponent } from 'react';
import { Form, Button, Input, Select, Row, Col } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';
import { getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import LovMultiple from '@/routes/components/LovMultiple';

/**
 * 供应商生命周期管理
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: '/sslm/supplier-life-manage/manage' })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      expandForm: false,
      itemCategorySelectRows: [],
    };
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch, form } = this.props;
    if (onSearch) {
      form.validateFields(err => {
        if (!err) {
          // 如果验证成功,则执行onSearch
          onSearch();
        }
      });
    }
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
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 管控维度切换触发事件
   * @param {String} value - 管控维度
   */
  @Bind()
  dimensionCodeOnChange(value) {
    const { form, onSubsidiary } = this.props;
    if (value === 'GROUP') {
      form.setFieldsValue({
        companyId: undefined,
        companyName: undefined,
      });
    }
    if (value === 'COMPANY') {
      onSubsidiary(false);
    }
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      form,
      initInfo,
      supplierLifeRemote,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      dimensionList,
      currentDimensionCode,
      customizeFilterForm,
    } = this.props;
    const { expandForm, itemCategorySelectRows } = this.state;
    const isCompanyDimension = getFieldValue('dimensionCode') === 'COMPANY'; // 判断管控维度是否是公司级
    const formItemLayout = {
      labelCol: { span: 10 },
      wrapperCol: { span: 14 },
    };
    const companyDefaultValue = supplierLifeRemote
      ? supplierLifeRemote.process('SSLM.SUPPLIER_LIFE.QUERY_COMPANY_DEFAULT', null, {
          initInfo,
        })
      : null;
    getFieldDecorator('companyName');
    return customizeFilterForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_MANAGE.LIST_FILTER', // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form">
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('sslm.supplierLifeManage.model.supplier.dimension').d('管控维度')}
                >
                  {getFieldDecorator('dimensionCode', {
                    initialValue: currentDimensionCode === 'BOTH' ? 'GROUP' : currentDimensionCode,
                  })(
                    <Select
                      disabled={currentDimensionCode !== 'BOTH'}
                      onChange={this.dimensionCodeOnChange}
                    >
                      {dimensionList
                        .filter(item => item.value !== 'BOTH')
                        .map(item => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('sslm.common.view.company.name').d('公司')}
                >
                  {getFieldDecorator('companyId', {
                    rules: isCompanyDimension
                      ? [
                          {
                            required: true,
                            message: intl
                              .get('sslm.supplierLifeManage.view.validation.warning')
                              .d('公司名不能为空'),
                          },
                        ]
                      : [],
                    initialValue: companyDefaultValue ? companyDefaultValue.companyId : null,
                  })(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textField="companyName"
                      disabled={!isCompanyDimension}
                      textValue={companyDefaultValue ? companyDefaultValue.companyName : null}
                      queryParams={{
                        organizationId: getUserOrganizationId(),
                      }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({ companyName: lovRecord.companyName });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl.get('sslm.common.view.supplier.supplierCompany').d('供应商')}
                >
                  {getFieldDecorator('supplierCompany', {})(<Input dbc2sbc={false} />)}
                </Form.Item>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierLifeManage.view.supplier.supplierProduct')
                    .d('供货品类')}
                >
                  {getFieldDecorator('itemCategoryIds')(
                    <LovMultiple
                      isCascade // 是否级联勾选
                      code="SMDM.TREE_ITEM_CATEGORY"
                      queryParams={{ enabledFlag: 1 }}
                      textField="categoryName"
                      selectedRows={itemCategorySelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemCategorySelectRows: newSelectedRows })
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierLifeManage.view.supplier.supplyClass')
                    .d('供应商分类')}
                >
                  {getFieldDecorator('categoryId')(
                    <Lov
                      code="SSLM.SUPPLIER_CATEGORY"
                      textValue="categoryDescription"
                      lovOptions={{
                        displayField: 'categoryDescription',
                        valueField: 'categoryId',
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  {...formItemLayout}
                  label={intl
                    .get('sslm.supplierLifeManage.view.supplier.documentCreator')
                    .d('单据创建人')}
                >
                  {getFieldDecorator('lifeCycleProcessorId')(
                    <Lov
                      code="SSLM.HIAM.TENANT.USER"
                      queryParams={{ organizationId: getUserOrganizationId() }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get('hzero.common.status.reset').d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get('hzero.common.status.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
