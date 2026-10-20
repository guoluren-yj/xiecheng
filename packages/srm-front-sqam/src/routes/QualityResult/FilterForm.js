/**
 * 质检结果查询
 * @date: 2020-4-9
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Button, Row, Col, Input, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import CacheComponent from 'components/CacheComponent';
import intl from 'utils/intl';
import ValueList from 'components/ValueList';
import moment from 'moment';
import { getDateTimeFormat } from 'utils/utils';
import {
  // SEARCH_FORM_ITEM_LAYOUT,
  FORM_COL_3_4_LAYOUT,
  FORM_COL_4_LAYOUT,
  FORM_COL_3_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  DATETIME_MIN,
  DATETIME_MAX,
} from 'utils/constants';

const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const commonPrompt = 'hzero.common';
const promptCode = 'sqam.incomingInspectionQuery';

@withCustomize({
  unitCode: ['SQAM.QUALITY_RESULT_LIST.FILTER'],
})
@CacheComponent({ cacheKey: '/sqam/quality-result/list' })
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
    const { getFieldDecorator, getFieldValue } = form;
    const { display, dateFormat } = this.state;
    return customizeFilterForm(
      {
        code: 'SQAM.QUALITY_RESULT_LIST.FILTER',
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
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`sqam.common.model.qualityRectification.clientCompany`)
                    .d('客户公司')}
                >
                  {getFieldDecorator('companyName')(<Input />)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item {...formLayout} label={intl.get(`entity.item.name`).d('物料名称')}>
                  {getFieldDecorator('itemName')(<Input />)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...SEARCH_FORM_ROW_LAYOUT} style={{ display: display ? 'block' : 'none' }}>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...formLayout}
                  label={intl.get(`entity.organization.class.inventory`).d('库存组织')}
                >
                  {getFieldDecorator('organizationName')(<Input />)}
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
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.common.assessmentResult`).d('评价结果')}
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
                      maxTagCount={2} // 限制最大tag数，避免多选过多时也没被撑太高
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.incomingInspectionQuery.printFlag`)
                    .d('打印状态')}
                  {...formLayout}
                >
                  {getFieldDecorator('printFlag')(
                    <ValueList
                      style={{ width: '100' }}
                      lovCode="SQAM.INSPECTION_PRINT_STATUS"
                      lazyLoad={false}
                      allowClear
                    />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  {...formLayout}
                  label={intl
                    .get(`${promptCode}.model.incomingInspectionQuery.claimForm1`)
                    .d('关联索赔单号')}
                >
                  {getFieldDecorator('formNum')(
                    <Input trim typeCase="upper" inputChinese={false} />
                  )}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
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
              <Col {...FORM_COL_3_LAYOUT}>
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
