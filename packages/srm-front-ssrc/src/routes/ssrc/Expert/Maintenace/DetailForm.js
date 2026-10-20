import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import moment from 'moment';
import classNames from 'classnames';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';

// import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import Switch from 'components/Switch';
import { IDENTITY_CARD, PASSPORT } from 'utils/regExp';
import { getDateFormat } from 'utils/utils';
import { dateRender } from 'utils/renderer';

import common from '@/routes/ssrc/common.less';

import RegionInput from '../Components/RegionInput';

const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Option } = Select;
const promptCode = 'ssrc.expert';

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

  @Bind()
  handleChangeIdType() {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ idNumber: '' });
  }

  @Bind()
  handleCountryChange(_, lovValue) {
    const { form } = this.props;
    const { countryCode, quickIndex } = lovValue;
    const chinaFlag = !!(countryCode === 'CN' || quickIndex === 'CN');
    form.setFieldsValue({
      provinceCityName: null,
      provinceId: null,
      cityId: null,
      countryCode: chinaFlag ? 'CN' : countryCode,
    });
  }

  render() {
    const {
      form,
      formData,
      idTypeList,
      expertLevelList,
      expertTypeList,
      expertCategoryList,
      crownCodeList,
      customizeForm,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    // 省市参数
    const inputProps = {
      readOnly: true,
      disabled: !getFieldValue('countryId') || getFieldValue('countryCode') !== 'CN',
      formData,
      form,
    };
    return customizeForm(
      {
        code: 'SSRC.EXPERT_DATABASE_MANAGEMENT_DETAIL_ADM.CREATE_BASEFORM',
        form,
        dataSource: formData,
      },
      <Form
        layout="horizontal"
        className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}
      >
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.expert`).d('姓名')}
              {...formLayOut}
            >
              {getFieldDecorator('expertName', {
                initialValue: formData.expertName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.gender`).d('性别')}
              {...formLayOut}
            >
              {getFieldDecorator('genderMeaning', {
                initialValue: formData.genderMeaning,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.birthday`).d('出生日期')}
              {...formLayOut}
            >
              {getFieldDecorator('birthday', {
                initialValue: formData.birthday && moment(formData.birthday, getDateFormat()),
              })(<DatePicker style={{ width: '100%' }} placeholder="" format={getDateFormat()} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.expertLevel`).d('专家级别')}
              {...formLayOut}
            >
              {getFieldDecorator('expertLevel', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.expertLevel`).d('专家级别'),
                    }),
                  },
                ],
                initialValue: formData.expertLevel,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {expertLevelList.map((item) => (
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
              label={intl.get(`${promptCode}.model.expert.expertType`).d('专家类型')}
              {...formLayOut}
            >
              {getFieldDecorator('expertType', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.expertType`).d('专家类型'),
                    }),
                  },
                ],
                initialValue: formData.expertType,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {expertTypeList.map((item) => (
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
              label={intl.get(`${promptCode}.model.expert.expertCategory`).d('专家类别')}
              {...formLayOut}
            >
              {getFieldDecorator('expertCategory', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.expertCategory`).d('专家类别'),
                    }),
                  },
                ],
                initialValue: formData.expertCategory,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {expertCategoryList.map((item) => (
                    <Option value={item.value} key={item.value}>
                      {item.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.telephone`).d('固定电话')}
              {...formLayOut}
            >
              {getFieldDecorator('telephone', {
                rules: [
                  {
                    max: 30,
                    message: intl.get('hzero.common.validation.max', {
                      max: 30,
                    }),
                  },
                ],
                initialValue: formData.telephone,
              })(<Input inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.mobilephone`).d('移动电话')}
              {...formLayOut}
            >
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
            <FormItem label={intl.get(`${promptCode}.model.expert.mail`).d('邮箱')} {...formLayOut}>
              {getFieldDecorator('mail', {
                initialValue: formData.mail,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.country`).d('国家')}
              {...formLayOut}
            >
              {getFieldDecorator('countryId', {
                initialValue: formData.countryId,
              })(
                <Lov
                  code="HPFM.COUNTRY"
                  textField={formData.countryName}
                  textValue={formData.countryName}
                  onChange={this.handleCountryChange}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.provinceAndCity`).d('省/市')}
              {...formLayOut}
            >
              {getFieldDecorator(`provinceCityName`, {
                initialValue: formData.provinceCityName,
                rules: [
                  {
                    required: getFieldValue('countryCode') === 'CN' && getFieldValue('provinceId'),
                    validator: (_, value, cb) => {
                      const provinceId = getFieldValue('provinceId');
                      const cityId = getFieldValue('cityId');

                      if (getFieldValue('countryCode') === 'CN' && provinceId && !cityId) {
                        cb(
                          intl
                            .get(`${promptCode}.view.message.lastRegion`)
                            .d('当为“中国”时，“市”级信息必填')
                        );
                      } else {
                        cb();
                      }
                    },
                  },
                ],
              })(<RegionInput {...inputProps} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.idType`).d('证件类型')}
              {...formLayOut}
            >
              {getFieldDecorator('idType', {
                initialValue: formData.idType,
              })(
                <Select allowClear style={{ width: '100%' }} onChange={this.handleChangeIdType}>
                  {idTypeList.map((item) => (
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
              label={intl.get(`${promptCode}.model.expert.idNumber`).d('证件号码')}
              {...formLayOut}
            >
              {getFieldDecorator('idNumber', {
                rules: [
                  getFieldValue('idType') === 'P'
                    ? {
                        pattern: PASSPORT,
                        message: intl
                          .get('hzero.common.validation.passport')
                          .d('护照号码格式不正确'),
                      }
                    : {
                        pattern: IDENTITY_CARD,
                        message: intl
                          .get('hzero.common.validation.identityCard')
                          .d('身份证号码格式不正确'),
                      },
                ],
                initialValue: formData.idNumber,
              })(<Input disabled={!getFieldValue('idType')} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.score`).d('专家得分')}
              {...formLayOut}
            >
              {getFieldDecorator('score', {
                initialValue: formData.score,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.subAccount`).d('子账户')}
              {...formLayOut}
            >
              {getFieldDecorator('userId', {
                initialValue: formData.userId,
              })(<Lov disabled textValue={formData.loginName} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.registeredDate`).d('注册日期')}
              {...formLayOut}
            >
              {getFieldDecorator('registeredDate', {
                initialValue: dateRender(formData.registeredDate),
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.enabledFlag`).d('启用')}
              {...formLayOut}
            >
              {getFieldDecorator('enabledFlag', {
                initialValue: formData.enabledFlag || 0,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48}>
          <Col span={8}>
            <Form.Item
              label={intl.get(`${promptCode}.model.expert.itemCategoryName`).d('品类')}
              {...formLayOut}
            >
              {getFieldDecorator('itemCategories', {
                initialValue: formData.itemCategories,
              })(
                <LovMulti
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
