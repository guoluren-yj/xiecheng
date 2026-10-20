import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import moment from 'moment';
import classNames from 'classnames';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';

// import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { getDateFormat } from 'utils/utils';
import { dateRender, enableRender } from 'utils/renderer';

import common from '@/routes/ssrc/common.less';

const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Option } = Select;
const promptCode = 'ssrc.expert.model.expert';

/**
 * 专家库信息维护表单
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
    const { form, formData, crownCodeList, customizeForm } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SSRC.EXPERT_INFO_DETAIL.DETAIL_BASEFORM',
        form,
        dataSource: formData,
      },
      <Form
        layout="horizontal"
        className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
      >
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
                initialValue: formData.birthday && moment(formData.birthday, getDateFormat()),
              })(
                <DatePicker
                  disabled
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateFormat()}
                />
              )}
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
            <FormItem label={intl.get(`${promptCode}.mobilephone`).d('移动电话')} {...formLayOut}>
              {getFieldDecorator('mobilephone', {
                initialValue: formData.mobilephone,
              })(
                <Input
                  disabled
                  addonBefore={getFieldDecorator('internationalTelCode', {
                    initialValue:
                      formData.internationalTelCode ||
                      (crownCodeList[0] && crownCodeList[0].value) ||
                      '+86',
                  })(
                    <Select disabled>
                      {crownCodeList.map((item) => (
                        <Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Option>
                      ))}
                    </Select>
                  )}
                />
              )}
            </FormItem>
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
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.score`).d('专家得分')} {...formLayOut}>
              {getFieldDecorator('score', {
                initialValue: formData.score,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.subAccount`).d('子账户')} {...formLayOut}>
              {getFieldDecorator('userId', {
                initialValue: formData.userId,
              })(<Lov disabled textValue={formData.loginName} />)}
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
          <Col span={8}>
            <FormItem label={intl.get('hzero.common.status').d('状态')} {...formLayOut}>
              {enableRender(formData.enabledFlag || 0)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item label={intl.get(`${promptCode}.itemCategoryName`).d('品类')} {...formLayOut}>
              {getFieldDecorator('itemCategories', {
                initialValue: formData.itemCategories,
              })(
                <LovMulti
                  disabled
                  code="SSRC.CATEGORY_MIN_LEVEL_PTH"
                  translateData={formData?.itemCategoryMap || {}}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
      </Form>
    );
  }
}
