import React, { PureComponent } from 'react';
import { Form, Input, Row, Col } from 'hzero-ui';
// import { Bind } from 'lodash-decorators';
import classNames from 'classnames';
// import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { TextArea } = Input;
const promptCode = 'ssrc.expert.model.expert';

/**
 * 专家注册审批、专家注册查询表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class DetailForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  render() {
    const { form, formData, isApproval = true, customizeForm } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: isApproval
          ? 'SSRC.EXPERT_INFO_APPROVE.DETAIL_BASEFORM'
          : 'SSRC.EXPERT_INFO_REQQUERY.DETAIL_BASEFORM',
        form,
        dataSource: formData,
      },
      <Form
        layout="horizontal"
        className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
      >
        {isApproval && (
          <Row gutter={48} className="half-row">
            <Col span={12}>
              <FormItem label={intl.get(`${promptCode}.processRemark`).d('审批意见')}>
                {getFieldDecorator('processRemark', {
                  initialValue: formData.processRemark,
                })(
                  <TextArea
                    onChange={(val) => {
                      form.setFieldsValue({ processRemark: val?.target?.value });
                    }}
                  />
                )}
              </FormItem>
            </Col>
          </Row>
        )}
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.name`).d('姓名')} {...formLayOut}>
              {getFieldDecorator('expertName', {
                initialValue: formData.expertName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.gender`).d('性别')} {...formLayOut}>
              {getFieldDecorator('genderMeaning', {
                initialValue: formData.genderMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.birthday`).d('出生日期')} {...formLayOut}>
              {getFieldDecorator('birthday', {
                initialValue: dateRender(formData.birthday),
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.expertLevel`).d('专家级别')} {...formLayOut}>
              {getFieldDecorator('expertLevelMeaning', {
                initialValue: formData.expertLevelMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.expertType`).d('专家类型')} {...formLayOut}>
              {getFieldDecorator('expertTypeMeaning', {
                initialValue: formData.expertTypeMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.expertCategory`).d('专家类别')}
              {...formLayOut}
            >
              {getFieldDecorator('expertCategoryMeaning', {
                initialValue: formData.expertCategoryMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.telephone`).d('固定电话')} {...formLayOut}>
              {getFieldDecorator('telephone', {
                initialValue: formData.telephone,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <Form.Item {...formLayOut} label={intl.get(`${promptCode}.mobilephone`).d('移动电话')}>
              {form.getFieldDecorator('mobilephone', {
                initialValue: formData.mobilephone,
              })(<Input addonBefore={formData.internationalTelCodeMeaning} disabled />)}
            </Form.Item>
            {/* <FormItem label={intl.get(`${promptCode}.mobilephone`).d('移动电话')} {...formLayOut}>
                {getFieldDecorator('mobilephone', {
                  initialValue: formData.mobilephone,
                })(<Input disabled />)}
              </FormItem> */}
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.mail`).d('邮箱')} {...formLayOut}>
              {getFieldDecorator('mail', {
                initialValue: formData.mail,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.country`).d('国家')} {...formLayOut}>
              {getFieldDecorator('countryName', {
                initialValue: formData.countryName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.provinceAndCity`).d('省/市')} {...formLayOut}>
              {getFieldDecorator('provinceCityName', {
                initialValue: formData.provinceCityName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.idType`).d('证件类型')} {...formLayOut}>
              {getFieldDecorator('idTypeMeaning', {
                initialValue: formData.idTypeMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.idNumber`).d('证件号码')} {...formLayOut}>
              {getFieldDecorator('idNumber', {
                initialValue: formData.idNumber,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.subAccount`).d('子账户')} {...formLayOut}>
              {getFieldDecorator('loginName', {
                initialValue: formData.loginName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.registeredDate`).d('注册日期')}
              {...formLayOut}
            >
              {getFieldDecorator('registeredDate', {
                initialValue: dateRender(formData.registeredDate),
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem label={intl.get('hzero.common.remark').d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: formData.remark,
              })(<TextArea disabled />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
