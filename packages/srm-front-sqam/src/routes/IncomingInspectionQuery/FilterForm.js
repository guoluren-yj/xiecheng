/**
 * riskAssessment -风险评估报告 查询页
 * @date: 2019-12-3
 * @author guozhiqiang <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import ValueList from 'components/ValueList';
import moment from 'moment';
import { getCurrentOrganizationId, getDateTimeFormat } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  DATETIME_MIN,
  DATETIME_MAX,
} from 'utils/constants';
import MultipleLov from '@/routes/components/MultipleLov';

const tenantId = getCurrentOrganizationId();
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'hzero.common';
const promptCode = 'sqam.incomingInspectionQuery';

@withCustomize({
  unitCode: ['SQAM.INCOMING_INSPECTION_QUERY_LIST.FILTER'],
})
@CacheComponent({ cacheKey: '/sqam/incoming-inspection-query/list' })
export default class FilterForm extends PureComponent {
  state = {
    display: false,
    dateFormat: getDateTimeFormat(),
  };

  componentDidMount() {
    const { bindForm, form } = this.props;
    bindForm(form);
  }

  /**
   * 收起打开
   */
  @Bind()
  toggleForm() {
    this.setState((prevState) => ({
      display: !prevState.display,
    }));
  }

  /**
   * 重置
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const { handleSearch, form, customizeFilterForm } = this.props;
    const { getFieldDecorator, registerField, setFieldsValue, getFieldValue } = form;
    const { display, dateFormat } = this.state;

    return customizeFilterForm(
      {
        code: 'SQAM.INCOMING_INSPECTION_QUERY_LIST.FILTER',
        form,
        expand: display,
      },
      <Form layout="inline" className="more-fields-search-form">
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_4_LAYOUT}>
            <Row {...SEARCH_FORM_ROW_LAYOUT}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.view.message.model.incomingInspectionQuery.inspectionNum`)
                    .d('检验批号')}
                >
                  {getFieldDecorator('inspectionNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item {...formLayout} label={intl.get(`entity.supplier.tag`).d('供应商')}>
                  {getFieldDecorator('supplierCompanyId')(
                    <Lov
                      code="SQAM.CLAIM_SEARCH_SUPPLIER"
                      textField="erpSupplierName"
                      queryParams={{
                        tenantId: getCurrentOrganizationId(),
                      }}
                      onChange={(_, lovRecord) => {
                        registerField('supplierId');
                        registerField('supplierCompanyIdStash');
                        setFieldsValue({
                          supplierId: lovRecord.supplierId,
                          supplierCompanyIdStash: lovRecord.supplierCompanyId,
                          erpSupplierName: lovRecord.erpSupplierName
                            ? lovRecord.erpSupplierName
                            : lovRecord.supplierCompanyName,
                        });
                      }}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item {...formLayout} label={intl.get(`entity.item.tag`).d('物料')}>
                  {getFieldDecorator('itemCode')(
                    <Lov
                      code="SQAM.ITEM"
                      queryParams={{ tenantId }}
                      lovOptions={{ valueField: 'itemCode', displayField: 'itemName' }}
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: display ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item {...formLayout} label={intl.get(`entity.company.tag`).d('公司')}>
                  {getFieldDecorator('companyId')(<Lov code="SPFM.USER_AUTH.COMPANY" />)}
                </Form.Item>
              </Col>

              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...SEARCH_FORM_ITEM_LAYOUT}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('invOrganizationIds')(
                    <MultipleLov
                      code="SPFM.USER_AUTH.INVORG"
                      maxTagCount={1}
                      searchIconStyle={{color: "initial"}}
                    />
                    )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`${promptCode}.model.common.sourceNum`).d('来源单据')}
                >
                  {getFieldDecorator('sourceNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(
                      `${promptCode}.view.message.model.incomingInspectionQuery.assessmentResult`
                    )
                    .d('评估结果')}
                  {...formLayout}
                >
                  {getFieldDecorator('assessmentResult')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SQAM.ASSESSMENT_RESULT"
                      lazyLoad={false}
                      allowClear
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.common.decisionResult`).d('决策结果')}
                  {...formLayout}
                >
                  {getFieldDecorator('decisionResult')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SQAM.DECISION_RESULT"
                      lazyLoad={false}
                      allowClear
                      mode="multiple"
                      maxTagCount={2}
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`sqam.common.model.syncStatusMeaning`).d('同步状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('syncStatus')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SQAM.INSPECTION_SYNC_STATUS"
                      lazyLoad={false}
                      allowClear
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`sqam.common.model.syncSystemDocNum`).d('同步外部系统单据编号')}
                >
                  {getFieldDecorator('syncFeedbackNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.common.handleStatus`).d('处理状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('inspectionState')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SQAM.INSPECTION_STATE"
                      lazyLoad={false}
                      allowClear
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.model.incomingInspectionQuery.problemNum`)
                    .d('关联整改报告')}
                >
                  {getFieldDecorator('problemNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`${commonPrompt}.date.creation.from`).d('创建日期从')}
                >
                  {getFieldDecorator('creationDateFrom', {
                    initialValue: moment(moment().subtract(6, 'month').format(DATETIME_MIN)),
                  })(
                    <DatePicker
                      format={dateFormat}
                      showTime={{ defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateTo') &&
                        moment(getFieldValue('creationDateTo')).isBefore(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`${commonPrompt}.date.creation.to`).d('创建日期至')}
                >
                  {getFieldDecorator('creationDateTo', {
                    initialValue: moment(moment().format(DATETIME_MAX)),
                  })(
                    <DatePicker
                      format={dateFormat}
                      showTime={{ defaultValue: moment('23:59:59', 'HH:mm:ss') }}
                      placeholder=""
                      disabledDate={(currentDate) =>
                        getFieldValue('creationDateFrom') &&
                        moment(getFieldValue('creationDateFrom')).isAfter(currentDate, 'day')
                      }
                    />
                  )}
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.model.incomingInspectionQuery.claimFrom`)
                    .d('关联索赔单')}
                >
                  {getFieldDecorator('formNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col {...FORM_COL_4_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.toggleForm}>
                {display
                  ? intl.get(`${commonPrompt}.button.collected`).d('收起查询')
                  : intl.get(`${commonPrompt}.button.viewMore`).d('更多查询')}
              </Button>
              <Button onClick={this.handleFormReset}>
                {intl.get(`${commonPrompt}.button.reset`).d('重置')}
              </Button>
              <Button type="primary" htmlType="submit" onClick={() => handleSearch(form)}>
                {intl.get(`${commonPrompt}.button.search`).d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
