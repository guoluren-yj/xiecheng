/**
 * PlatformList -平台供应商查询页面(查询部分)
 * @date: 2018-8-16
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { Button, Form, Input, Row, Col, Select, InputNumber, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import LovMultiple from '@/routes/components/LovMultiple';

const FormItem = Form.Item;
const { Option } = Select;

export default function getPlatform(cacheKey) {
  class FilterBasicForm extends PlatformList {}
  return Form.create({
    fieldNameProp: null,
  })(cacheComponent({ cacheKey })(FilterBasicForm));
}
class PlatformList extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      itemCategorySelectRows: [],
    };
  }

  componentDidMount() {
    const { stageId, handeFirstQuery } = this.props;
    handeFirstQuery(stageId);
  }

  /**
   * 按条件查询
   * @param {object} filedValues --表单输入的查询条件
   */
  @Bind()
  handleSearch() {
    const { onSearch } = this.props;
    onSearch();
  }

  // 表单重置
  @Bind()
  handleReset() {
    // const { emitEmpty } = this.props;
    this.props.form.resetFields();
    // 删除品类选择内容
    // emitEmpty();
  }

  // 是否展开
  @Bind()
  toggle() {
    const { onToggle } = this.props;
    onToggle();
  }

  renderForm() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
      organizationId,
      code,
      expand,
      remote,
      custLoading,
      clearSourceKey,
      customizeFilterForm,
    } = this.props;
    const { itemCategorySelectRows } = this.state;
    const formlayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };

    getFieldDecorator('companyName');
    getFieldDecorator('categoryDescription');
    getFieldDecorator('purchaseAgentName');
    getFieldDecorator('industryName');
    getFieldDecorator('categoryName');
    getFieldDecorator('chainFlag');

    const dateFormat = getDateFormat();

    return customizeFilterForm(
      {
        code: 'SSLM.SUPPLIER_LIFE_CYCLE.SUMMARY_FORM', // 单元编码，必传
        form,
        expand, // 控制查询表单收起展开状态的参数
      },
      <Form layout="inline" className="more-fields-search-form" custLoading={custLoading}>
        <Row gutter={24}>
          <Col span={18}>
            <Row>
              <Col span={8}>
                <FormItem
                  label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCompanyNum')(
                    <Input inputChinese={false} dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCompanyName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ display: expand ? 'block' : 'none' }}>
              <Col span={8}>
                <FormItem
                  label={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                  {...formlayout}
                >
                  {getFieldDecorator('categoryIds')(
                    <LovMultiple
                      isCascade // 是否级联勾选
                      textField="categoryDescription"
                      code="SSLM.SUPPLIER_CATEGORY_TREE"
                      queryParams={{ tenantId: organizationId }}
                      parentRowKey="parentCategoryId" // 父级id
                      // 供应商分类改变时，清空sourceKey，走正常逻辑
                      onChange={() => {
                        clearSourceKey();
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.supplierShortName')
                    .d('供应商简称')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierCompanyShortName')(<Input dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.erpFlag')
                    .d('ERP供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('erpFlag')(
                    <Select allowClear>
                      <option value={1}>{intl.get('hzero.common.status.yes').d('是')}</option>
                      <option value={0}>{intl.get('hzero.common.status.no').d('否')}</option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.erpSupplierCode')
                    .d('ERP供应商编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('supplierErpNum')(
                    <Input inputChinese={false} dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.specialSupplier')
                    .d('特准供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('specialSupplierFlag')(
                    <Select allowClear>
                      <option value={1}>{intl.get('hzero.common.status.yes').d('是')}</option>
                      <option value={0}>{intl.get('hzero.common.status.no').d('否')}</option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl.get('sslm.common.view.company.name').d('公司')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyId')(
                    <Lov
                      textValue={getFieldValue('companyName')}
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                      isDbc2Sbc={false}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({
                          companyName: lovRecord.companyName,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.businessNature')
                    .d('经营性质')}
                  {...formlayout}
                >
                  {getFieldDecorator('businessNature')(
                    <Select allowClear>
                      {(code.businessNature || []).map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.ForeignRelation')
                    .d('境内外关系')}
                  {...formlayout}
                >
                  {getFieldDecorator('domesticForeignRelation')(
                    <Select allowClear>
                      {(code.foreignRelationList || []).map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.companyType')
                    .d('企业类型')}
                  {...formlayout}
                >
                  {getFieldDecorator('companyType')(
                    <Select allowClear>
                      {(code.companyType || []).map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.organizeInsCode')
                    .d('组织机构代码')}
                  {...formlayout}
                >
                  {getFieldDecorator('organizingInstitutionCode')(
                    <Input typeCase="upper" inputChinese={false} trimAll dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.blacklistFlag')
                    .d('黑名单供应商')}
                  {...formlayout}
                >
                  {getFieldDecorator('blacklistFlag')(
                    <Select allowClear>
                      <option value={1}>{intl.get('hzero.common.status.yes').d('是')}</option>
                      <option value={0}>{intl.get('hzero.common.status.no').d('否')}</option>
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.registerCapitalFrom')
                    .d('注册资本(万元)从')}
                  {...formlayout}
                >
                  {getFieldDecorator('registeredCapitalFrom')(<InputNumber />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.registeredCapitalTo')
                    .d('注册资本(万元)至')}
                  {...formlayout}
                >
                  {getFieldDecorator('registeredCapitalTo')(<InputNumber />)}
                </FormItem>
              </Col>
              {/* {stageId === 'all' && ( */}
              <Col span={8}>
                <FormItem
                  label={intl.get('sslm.siteInvestigateReport.modal.mange.category').d('品类')}
                  {...formlayout}
                >
                  {getFieldDecorator('itemCategoryId')(
                    <LovMultiple
                      isCascade // 是否级联勾选
                      code="SMDM.TREE_ITEM_CATEGORY"
                      queryParams={{ enabledFlag: 1 }}
                      textField="itemCategoryName"
                      selectedRows={itemCategorySelectRows}
                      changeSelectRows={newSelectedRows =>
                        this.setState({ itemCategorySelectRows: newSelectedRows })
                      }
                    />
                  )}
                </FormItem>
              </Col>
              {/* )} */}
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.lifeStageAgent')
                    .d('生命阶段经办人')}
                  {...formlayout}
                >
                  {getFieldDecorator('chargeName')(<Input trimAll dbc2sbc={false} />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.newUpdateDateStart')
                    .d('最近更新时间从')}
                  {...formlayout}
                >
                  {getFieldDecorator('newUpdateDateStart')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('newUpdateDateEnd') &&
                        moment(getFieldValue('newUpdateDateEnd')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.newUpdateDateEnd')
                    .d('最近更新时间至')}
                  {...formlayout}
                >
                  {getFieldDecorator('newUpdateDateEnd')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={currentDate =>
                        getFieldValue('newUpdateDateStart') &&
                        moment(getFieldValue('newUpdateDateStart')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.purchaseAgent')
                    .d('采购员')}
                  {...formlayout}
                >
                  {getFieldDecorator('purchaseAgentId')(
                    <Lov
                      code="SPFM.TENANT_PURCHASE_AGENT"
                      textValue={getFieldValue('purchaseAgentName')}
                      isDbc2Sbc={false}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({ purchaseAgentName: lovRecord.purchaseAgentName });
                      }}
                      lovOptions={{
                        displayField: 'purchaseAgentName',
                        valueField: 'purchaseAgentId',
                      }}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.industryName')
                    .d('行业类型')}
                >
                  {getFieldDecorator('industryIdList')(
                    <LovMultiple
                      code="HPFM.INDUSTRY_SECOND"
                      textValue={getFieldValue('industryName')}
                      isDbc2Sbc={false}
                      onChange={(_, lovRecord) => {
                        this.props.form.setFieldsValue({
                          categoryIdList: undefined,
                          industryName:
                            (lovRecord.map && lovRecord?.map(i => i.industryName).join()) || '',
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.industryCategoryName')
                    .d('主营品类')}
                >
                  {getFieldDecorator('categoryIdList')(
                    <LovMultiple
                      textValue={getFieldValue('categoryName')}
                      code="HPFM.INDUSTRY.CATEGORY"
                      isDbc2Sbc={false}
                      onChange={(_, lovRecord) => {
                        this.props.form.setFieldsValue({
                          categoryName:
                            (lovRecord.map && lovRecord?.map(i => i.categoryName).join()) || '',
                        });
                      }}
                      queryParams={{
                        industryIds: this.props.form.getFieldValue('industryIdList'),
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.esignCaAuthStatus')
                    .d('E签宝CA状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('esignCaAuthStatus')(
                    <Select allowClear>
                      {(code.caAuthStatusList || []).map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplier.platform.fddCaAuthStatus')
                    .d('法大大签CA状态')}
                  {...formlayout}
                >
                  {getFieldDecorator('fddCaAuthStatus')(
                    <Select allowClear>
                      {(code.caAuthStatusList || []).map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.unifiedSocialCode')
                    .d('统一社会信用代码')}
                  {...formlayout}
                >
                  {getFieldDecorator('unifiedSocialCode')(
                    <Input inputChinese={false} trim dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.dunsCode')
                    .d('邓白氏编码')}
                  {...formlayout}
                >
                  {getFieldDecorator('dunsCode')(
                    <Input inputChinese={false} trim dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  label={intl
                    .get('sslm.supplierManage.model.supplierManage.businessRegistrationNumber')
                    .d('商业注册登记号/税号')}
                  {...formlayout}
                >
                  {getFieldDecorator('businessRegistrationNumber')(
                    <Input inputChinese={false} trim dbc2sbc={false} />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get(`sslm.supplierDetail.model.supplierDetail.countryName`)
                    .d('注册国家')}
                >
                  {getFieldDecorator('registeredCountryId')(
                    <Lov
                      code="HPFM.COUNTRY"
                      lovOptions={{ displayField: 'countryName', valueField: 'countryId' }}
                      onChange={(_, lovRecord) => {
                        const { countryCode, quickIndex } = lovRecord || {};
                        const chainFlag = countryCode === 'CN' || quickIndex === 'CN';
                        setFieldsValue({
                          registeredRegionId: undefined,
                          registeredCityId: undefined,
                          registeredDistrictId: undefined,
                          chainFlag,
                        });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get(`sslm.supplierDetail.model.supplierDetail.regionName`)
                    .d('注册省份')}
                >
                  {getFieldDecorator('registeredRegionId')(
                    <LovMulti
                      code="SSLM.REGION"
                      queryParams={{
                        countryId: getFieldValue('registeredCountryId'),
                      }}
                      disabled={!getFieldValue('chainFlag')}
                      onChange={(_, lovRecord = {}) => {
                        setFieldsValue({
                          registeredCityId: undefined,
                          registeredDistrictId: undefined,
                          registeredRegionMeaning: lovRecord,
                        });
                      }}
                      translateData={getFieldValue('registeredRegionMeaning')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get(`sslm.supplierDetail.model.supplierDetail.cityName`)
                    .d('注册城市')}
                >
                  {getFieldDecorator('registeredCityId')(
                    <LovMulti
                      code="SSLM.REGION"
                      queryParams={{
                        parentRegionIds: getFieldValue('registeredRegionId'),
                      }}
                      disabled={!getFieldValue('registeredRegionId')}
                      onChange={(_, lovRecord = {}) => {
                        setFieldsValue({
                          registeredDistrictId: undefined,
                          registeredCityMeaning: lovRecord,
                        });
                      }}
                      translateData={getFieldValue('registeredCityMeaning')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get(`sslm.supplierDetail.model.supplierDetail.registerDistrict`)
                    .d('注册区县')}
                >
                  {getFieldDecorator('registeredDistrictId')(
                    <LovMulti
                      code="SSLM.REGION"
                      queryParams={{
                        parentRegionIds: getFieldValue('registeredCityId'),
                      }}
                      disabled={!getFieldValue('registeredCityId')}
                      onChange={(_, lovRecord = {}) => {
                        setFieldsValue({
                          registeredDistrictMeaning: lovRecord,
                        });
                      }}
                      translateData={getFieldValue('registeredDistrictMeaning')}
                    />
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formlayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
                    .d('送货服务范围')}
                >
                  {getFieldDecorator('serviceAreaCode')(
                    <Select allowClear mode="multiple">
                      {(code.serviceAreaCodeList || []).map(n =>
                        (n || {}).value ? (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ) : (
                          undefined
                        )
                      )}
                    </Select>
                  )}
                </FormItem>
              </Col>
              {remote &&
                remote.process('SSLM_SUPPLIER_MANAGE_LIST_SEARCH_FORM', null, { form, Col })}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggle}>
                {expand
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get(`hzero.common.button.viewMore`).d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleReset}>
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

  render() {
    return this.renderForm();
  }
}
