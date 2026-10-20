import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Row, Col, DatePicker } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Bind } from 'lodash-decorators';
// import { isUndefined } from 'lodash';
import moment from 'moment';
import CacheComponent from 'components/CacheComponent';
import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import intl from 'utils/intl';
import Lov from 'components/Lov';

const prefix = `sqam.common`;

@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SQAM.CLAIM_FORM_LIST.FILTER'],
})
@CacheComponent({ cacheKey: '/sqam/my-recived-claim-form' })
export default class FilterForm extends PureComponent {
  /**
   * state初始化
   */
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      dateFormat: getDateFormat(),
      expandForm: false,
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
      enumMap = {},
      // customizeFilterForm,
    } = this.props;
    const { statusValue = [] } = enumMap;
    const { dateFormat, expandForm } = this.state;
    const { getFieldDecorator, getFieldValue, registerField, setFieldsValue } = form;
    return (
      // {
      //   code: 'SQAM.CLAIM_FORM_LIST.FILTER',
      //   form,
      //   expand: expandForm,
      // },
      <Form layout="inline" className="more-fields-search-form">
        <Row gutter={12}>
          <Col span={18}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`${prefix}.model.claimNum`).d('索赔单号')}
                >
                  {getFieldDecorator('formNum', {
                    rules: [
                      {
                        max: 20,
                        message: intl.get(`hzero.common.validation.max`, {
                          max: 20,
                        }),
                      },
                    ],
                  })(<Input trim typeCase="upper" inputChinese={false} />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.formTitle`).d('索赔单标题')}
                >
                  {getFieldDecorator('formTitle', {
                    rules: [
                      {
                        max: 150,
                        message: intl.get('hzero.common.validation.max', {
                          max: 150,
                        }),
                      },
                    ],
                  })(<Input trim />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.supplier.tag`).d('供应商')}
                >
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      textField="erpSupplierName"
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={(val, record) => {
                        registerField('supplierId');
                        registerField('supplierCompanyIdStash');
                        setFieldsValue({
                          supplierId: record.supplierId,
                          supplierCompanyIdStash: record.supplierCompanyId,
                          erpSupplierName: record.erpSupplierName
                            ? record.erpSupplierName
                            : record.supplierCompanyName,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>

              {/* <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`sqam.common.model.claimType`).d('索赔类型')}
                >
                  {getFieldDecorator('claimTypeId')(
                    <Lov
                      code="SQAM.CLAIM_TYPE"
                      lovOptions={{ valueField: 'claimTypeId', displayField: 'typeDesc' }}
                      queryParams={{ tenantId: getCurrentOrganizationId() }}
                    />
                  )}
                </Form.Item>
              </Col> */}
            </Row>
            {/* 以下为隐藏选项 */}
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: expandForm ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`hzero.common.status`).d('状态')}
                >
                  {getFieldDecorator('statusCode', {
                    initialValue: 'CONFIRMED',
                  })(
                    <Select allowClear>
                      {statusValue
                        .filter((item) =>
                          ['CONFIRMED', 'FINISHED', 'EXECUTE_APPROVING'].includes(item.value)
                        )
                        .map((item) => (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                    </Select>
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.organization.class.createName`).d('创建人')}
                >
                  {getFieldDecorator('createName')(<Input />)}
                </Form.Item>
              </Col>

              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.company.tag`).d('公司')}
                >
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTH.COMPANY" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.business.tag`).d('业务实体')}
                >
                  {getFieldDecorator('ouId')(<Lov code="SPRM.OU" />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.from`).d('创建日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateFrom')(
                    <DatePicker
                      placeholder=""
                      format={dateFormat}
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`hzero.common.date.creation.to`).d('创建日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('creationDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              {/* <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.date.requireFeedbackDate.from`).d('要求反馈日期从')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('feedbackDateFrom')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('feedbackDateTo') &&
                        moment(getFieldValue('feedbackDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${prefix}.date.requireFeedbackDate.to`).d('要求反馈日期至')}
                  {...SEARCH_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('feedbackDateTo')(
                    <DatePicker
                      format={dateFormat}
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('feedbackDateFrom') &&
                        moment(getFieldValue('feedbackDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col> */}
            </Row>
          </Col>
          <Col span={6} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {expandForm
                  ? intl.get('hzero.common.button.collected').d('收起查询')
                  : intl.get('hzero.common.button.viewMore').d('更多查询')}
              </Button>
              <Button data-code="reset" onClick={this.handleFormReset}>
                {intl.get(`hzero.common.button.reset`).d('重置')}
              </Button>
              <Button
                data-code="search"
                type="primary"
                htmlType="submit"
                onClick={this.handleSearch}
              >
                {intl.get(`hzero.common.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
