import React, { PureComponent } from 'react';
import { Form, Button, Input, Row, Col, DatePicker, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import { isEmpty } from 'lodash';

import { getDateFormat } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import CacheComponent from 'components/CacheComponent';
import LovMultiple from '@/routes/components/LovMultiple';
import querystring from 'querystring';

const FormItem = Form.Item;
const { Option } = Select;

/**
 * 币种定义(租户级)表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onSearch - 表单查询
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@CacheComponent({ cacheKey: `/sslm/supplier-ablility-query/list-definitionTable` })
export default class Search extends PureComponent {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { routeParams } = this.props;
    this.state = {
      expandForm: false,
      filterRouteParams: routeParams,
    };
  }

  componentDidMount() {
    const { form } = this.props;
    const { filterRouteParams } = this.state;
    form.setFieldsValue({
      ...filterRouteParams,
    });
    this.handleSearch();
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { search: oldSearch } = prevProps;
    const { search: newSearch } = this.props;
    const oldRouteParams = querystring.parse(oldSearch.substr(1));
    const newRouteParams = querystring.parse(newSearch.substr(1));

    const flag = JSON.stringify(oldRouteParams) !== JSON.stringify(newRouteParams);
    if (flag) {
      this.setState({
        filterRouteParams: newRouteParams,
      });
    }
    return flag;
  }

  componentDidUpdate(...rest) {
    const snapshot = rest[2];
    const { search: newSearch } = this.props;
    const newRouteParams = querystring.parse(newSearch.substr(1));
    const filterRouteParams = newRouteParams;
    if (snapshot) {
      const filterRouteParamsTemp = {};
      const { form } = this.props;
      for (const i in filterRouteParams) {
        if (isEmpty(filterRouteParams[i])) {
          filterRouteParamsTemp[i] = null;
        } else {
          filterRouteParamsTemp[i] = filterRouteParams[i];
        }
      }
      form.setFieldsValue({
        ...filterRouteParamsTemp,
      });
      this.handleSearch();
    }
  }

  /**
   * 查询
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    if (onSearch) {
      onSearch();
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
      userId,
      headerStatus,
      organizationId,
      userOrganizationId,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      form,
      customizeFilterForm,
      custLoading,
      stageList,
    } = this.props;
    const { expandForm } = this.state;
    const dateFormat = getDateFormat();
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    getFieldDecorator('supplierCompanyId');
    return customizeFilterForm(
      {
        code: 'SSLM.SUPPLIER_ABILITY_QUERY.SUPPLYABILITYQUERY', // 单元编码，必传
        form,
        expand: expandForm, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get('sslm.common.view.supplier.supplierCompany').d('供应商')}
                >
                  {getFieldDecorator('supplierNameLov')(
                    <Lov
                      code="SSLM.USER_AUTH.SUPPLIER"
                      textField="supplierCompanyName"
                      queryParams={{ userId, tenantId: organizationId }}
                      lovOptions={{
                        valueField: 'uniqueKey',
                      }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({ supplierCompanyId: lovRecord.supplierCompanyId });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplierDocManage.model.docManage.purchaseProduct`)
                    .d('采购品类')}
                >
                  {getFieldDecorator('itemCategoryIds')(
                    <LovMultiple
                      code="SMDM.TREE_ITEM_CATEGORY"
                      queryParams={{ enabledFlag: 1 }}
                      textField="itemCategoryName"
                      parentRowKey="parentCategoryId"
                      isCascade
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemId`).d('物料')}
                >
                  {getFieldDecorator('itemIds')(
                    <LovMultiple code="SMDM.CUSTOMER_ITEM" textField="itemName" />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expandForm ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                >
                  {getFieldDecorator('createUserName')(<Input />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.createdDate.from`).d('创建日期从')}
                >
                  {getFieldDecorator('startCreateDate')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('endCreateDate') &&
                        moment(getFieldValue('endCreateDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.createdDate.to`).d('创建日期至')}
                >
                  {getFieldDecorator('endCreateDate')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('startCreateDate') &&
                        moment(getFieldValue('startCreateDate')).isAfter(currentDate, 'day')
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
                  label={intl.get(`sslm.common.view.company.name`).d('公司')}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textField="companyName"
                      queryParams={{ organizationId: userOrganizationId }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.startUpdateDate`)
                    .d('最后更新日期从')}
                >
                  {getFieldDecorator('startUpdateDate')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('endUpdateDate') &&
                        moment(getFieldValue('endUpdateDate')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.endUpdateDate`)
                    .d('最后更新日期至')}
                >
                  {getFieldDecorator('endUpdateDate')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('startUpdateDate') &&
                        moment(getFieldValue('startUpdateDate')).isAfter(currentDate, 'day')
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
                    .get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning')
                    .d('服务国家')}
                >
                  {getFieldDecorator('countryId')(
                    <Lov
                      code="SSLM.SUPPLIER_ABILITY_COUNTRY"
                      textField="countryName"
                      lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                      queryParams={{
                        regionId: getFieldValue('regionId'),
                        cityId: getFieldValue('cityId'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.regionIdMeaning`)
                    .d('服务地区')}
                >
                  {getFieldDecorator('regionId')(
                    <Lov
                      code="SSLM.SUPPLIER_ABILITY_REGION"
                      textField="regionName"
                      lovOptions={{
                        displayField: 'regionName',
                        valueField: 'regionId',
                      }}
                      queryParams={{
                        countryId: getFieldValue('countryId'),
                        cityId: getFieldValue('cityId'),
                        provinceFlag: 1,
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get(`sslm.supplyAbility.model.supplyAbility.cityIdMeaning`)
                    .d('服务城市')}
                >
                  {getFieldDecorator('cityId')(
                    <Lov
                      code="SSLM.SUPPLIER_ABILITY_REGION"
                      textField="cityName"
                      queryParams={{
                        parentRegionId: getFieldValue('regionId'),
                        countryId: getFieldValue('countryId'),
                        cityFlag: 1,
                      }}
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
                    .get(`sslm.supplyAbility.model.supplyAbility.createUserDepartment`)
                    .d('创建人部门')}
                >
                  {getFieldDecorator('unitId')(
                    <Lov
                      code="SPRM.USER_DEPARTMENT"
                      textField="unitName"
                      queryParams={{ tenantId: organizationId }}
                      lovOptions={{
                        valueField: 'unitId',
                      }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({ unitId: lovRecord.unitId });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                  {getFieldDecorator('supplyAbilityStatus')(
                    <Select allowClear style={{ width: '100%' }}>
                      {headerStatus.map(n => (
                        <Option key={n.value} value={n.value}>
                          {n.meaning}
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
                    .get(`sslm.supplyAbility.model.supplyAbility.lifeCycleStage`)
                    .d('生命周期阶段')}
                >
                  {getFieldDecorator('stageId')(
                    <Select allowClear>
                      {stageList.map(item => (
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
            <FormItem>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
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
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
