import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Select, DatePicker } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isNumber } from 'lodash';
import moment from 'moment';
import classNames from 'classnames';

// import { getDateFormat, getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import { EMAIL, PHONE, IDENTITY_CARD, PASSPORT, NOT_CHINA_PHONE } from 'utils/regExp';
import { getDateFormat } from 'utils/utils';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';

import HPopover from '@/routes/ssrc/components/HPopover';
import common from '@/routes/ssrc/common.less';

import { TAIWAN_PASSAGE } from '@/utils/SsrcRegx';
import RegionInput from '../Components/RegionInput';
import { getCustomizeUnitCode } from '../utils/utils';

const FormItem = Form.Item;
const formLayOut = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const { Option } = Select;
const { TextArea } = Input;
const promptCode = 'ssrc.expert';

/**
 * 专家库详情表单
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Object} form - 表单对象
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
export default class FilterForm extends PureComponent {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {
      mobilePhonePopVisible: false, // 移动电话气泡显示
      mobilephone: '', // 手机号前端存
    };
  }

  @Bind()
  handleChangeIdType(formObj) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue(formObj);
  }

  /**
   * 设置移动电话气泡的显隐
   */
  @Bind()
  handleVisibleChange(visible) {
    this.setState({
      mobilePhonePopVisible: visible,
    });
  }

  /**
   * 区号改变 需要 重置手机号的校验状态
   */
  @Bind()
  reValidationPhone(value) {
    const { form } = this.props;
    const prevInternationalTelCode = form.getFieldValue('internationalTelCode');
    if (value === '+86' || prevInternationalTelCode === '+86') {
      // 只要 +86 出现在 中间态 就需要重新手动校验 phone
      const curPhone = form.getFieldValue('mobilephone');
      let errors = null;
      if (curPhone) {
        const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
        if (!testReg.test(curPhone)) {
          errors = [new Error(intl.get('hzero.common.validation.phone').d('手机格式不正确'))];
        }
        form.setFields({
          mobilephone: {
            value: curPhone,
            errors,
          },
        });
      }
    }
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

  getIdNumberRules = () => {
    const { form } = this.props;
    const { getFieldValue } = form;
    const currentIdType = getFieldValue ? getFieldValue('idType') : null;
    let reg = null;

    if (currentIdType === 'P') {
      reg = {
        pattern: PASSPORT,
        message: intl.get('hzero.common.validation.passport').d('护照号码格式不正确'),
      };
    } else if (currentIdType === 'T') {
      reg = {
        pattern: TAIWAN_PASSAGE,
        message: intl.get(`${promptCode}.model.expert.idNumber`).d('证件号码'),
      };
    } else {
      reg = {
        pattern: IDENTITY_CARD,
        message: intl.get('hzero.common.validation.identityCard').d('身份证号码格式不正确'),
      };
    }

    return [reg];
  };

  render() {
    const {
      form,
      isEdit = true,
      formData,
      idTypeList,
      expertLevelList,
      expertTypeList,
      expertCategoryList,
      genderList,
      crownCodeList,
      customizeForm,
      expertRemote,
      path,
      location,
    } = this.props;
    const { getFieldDecorator, getFieldValue, setFieldsValue } = form;
    const { mobilePhonePopVisible } = this.state;
    // 省市参数
    const inputProps = {
      readOnly: true,
      disabled: !isEdit || !getFieldValue('countryId') || getFieldValue('countryCode') !== 'CN',
      formData,
      form,
    };
    const userIdDisFlag =
      getFieldValue('expertType') === 'EXTERNAL' || !getFieldValue('expertType') || !isEdit;
    const expertTypeDisFlag = !isEdit;
    return customizeForm(
      {
        code: isEdit
          ? getCustomizeUnitCode('regisBaseFormUpdate')
          : 'SSRC.EXPERT_DATABASE_MANAGEMENT_LIST.DETAIL_BASEFORM',
        form,
        dataSource: formData,
      },
      <Form className={classNames(common['fixed-form-row'], 'ued-detail-wrapper')}>
        <Row gutter={48}>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.expertReqNum`).d('申请单号')}
              {...formLayOut}
            >
              {getFieldDecorator('expertReqNum', {
                initialValue: formData.expertReqNum,
              })(<Input disabled />)}
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
                    required: true && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.expertLevel`).d('专家级别'),
                    }),
                  },
                ],
                initialValue: formData.expertLevel,
              })(
                <Select allowClear disabled={!isEdit} style={{ width: '100%' }}>
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
                    required: true && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.expertType`).d('专家类型'),
                    }),
                  },
                ],
                initialValue: formData.expertType,
              })(
                <Select
                  allowClear
                  disabled={
                    expertRemote
                      ? expertRemote.process(
                          'SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_DETAIL_FORM_EXPERT_TYPE_DISFLAG',
                          expertTypeDisFlag,
                          {
                            path,
                            search: location?.search,
                            formData,
                          }
                        )
                      : expertTypeDisFlag
                  }
                  style={{ width: '100%' }}
                  onChange={() => {
                    this.handleChangeIdType({
                      userId: undefined,
                      expertName: '',
                      gender: null,
                      internationalTelCode: (crownCodeList[0] && crownCodeList[0].value) || '+86',
                      mobilephone: null,
                      mail: null,
                      birthday: null,
                    });
                    if (expertRemote && expertRemote.event) {
                      // 和查询并列的二开的一些操作
                      expertRemote.event.fireEvent('handleAfterChangeIdType', {
                        handleChangeIdType: this.handleChangeIdType,
                      });
                    }
                  }}
                >
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
                    required: true && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.expertCategory`).d('专家类别'),
                    }),
                  },
                ],
                initialValue: formData.expertCategory,
              })(
                <Select allowClear disabled={!isEdit} style={{ width: '100%' }}>
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
              label={intl.get(`${promptCode}.model.expert.subAccount`).d('子账户')}
              {...formLayOut}
            >
              {getFieldDecorator('userId', {
                rules: [
                  {
                    required: getFieldValue('expertType') === 'INTERNAL' && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.subAccount`).d('子账户'),
                    }),
                  },
                ],
                initialValue: formData.userId,
              })(
                <Lov
                  disabled={
                    expertRemote
                      ? expertRemote.process(
                          'SSRC_EXPERT_REQUISITION_UPDATE_PROCESS_DETAIL_FORM_USERID_DISFLAG',
                          userIdDisFlag,
                          {
                            path,
                            search: location?.search,
                            formData,
                          }
                        )
                      : userIdDisFlag
                  }
                  code="SSRC.SUB_ACCOUNT"
                  textValue={formData.loginName}
                  onChange={(val, lovRecord) => {
                    if (getFieldValue('expertType') === 'INTERNAL') {
                      setFieldsValue({
                        expertName: lovRecord.realName,
                        gender: isNumber(lovRecord.gender) ? `${lovRecord.gender}` : null,
                        internationalTelCode: lovRecord.internationalTelCode,
                        mobilephone: lovRecord.phone,
                        mail: lovRecord.email,
                        birthday: lovRecord.birthday && moment(lovRecord.birthday, getDateFormat()),
                      });
                      this.setState({
                        mobilephone: lovRecord.phone,
                      });
                    }
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.model.expert.name`).d('姓名')} {...formLayOut}>
              {getFieldDecorator('expertName', {
                rules: [
                  {
                    required: getFieldValue('expertType') === 'EXTERNAL' && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.name`).d('姓名'),
                    }),
                  },
                  {
                    max: 85,
                    message: intl.get('hzero.common.validation.max', {
                      max: 85,
                    }),
                  },
                ],
                initialValue: formData.expertName,
              })(
                <Input
                  disabled={
                    getFieldValue('expertType') === 'INTERNAL' ||
                    !getFieldValue('expertType') ||
                    !isEdit
                  }
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`hzero.common.gender`).d('性别')} {...formLayOut}>
              {getFieldDecorator('gender', {
                initialValue:
                  formData.gender || formData.gender === 0 ? `${formData.gender}` : null,
              })(
                <Select
                  allowClear
                  disabled={
                    getFieldValue('expertType') === 'INTERNAL' ||
                    !getFieldValue('expertType') ||
                    !isEdit
                  }
                  style={{ width: '100%' }}
                >
                  {genderList.map((item) => (
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
              })(<Input disabled={!isEdit} inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.mobilephone`).d('移动电话')}
              {...formLayOut}
            >
              {getFieldDecorator('mobilephone', {
                rules: [
                  {
                    required: isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.mobilephone`).d('移动电话'),
                    }),
                  },
                  {
                    pattern:
                      (getFieldValue('internationalTelCode') || '+86') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                  },
                ],
                initialValue: formData.mobilephone,
              })(
                <HPopover
                  content={getFieldValue('mobilephone') || formData.mobilephone}
                  visible={mobilePhonePopVisible}
                  trigger="hover"
                  onVisibleChange={this.handleVisibleChange}
                >
                  <Input
                    disabled={
                      (getFieldValue('expertType') === 'INTERNAL' && this.state.mobilephone) ||
                      !getFieldValue('expertType') ||
                      !isEdit
                    }
                    addonBefore={getFieldDecorator('internationalTelCode', {
                      initialValue:
                        formData.internationalTelCode ||
                        (crownCodeList[0] && crownCodeList[0].value) ||
                        '+86',
                    })(
                      <Select
                        disabled={
                          (getFieldValue('expertType') === 'INTERNAL' && this.state.mobilephone) ||
                          !getFieldValue('expertType') ||
                          !isEdit
                        }
                        onChange={this.reValidationPhone}
                      >
                        {crownCodeList.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                    onChange={(val) => {
                      setFieldsValue({ mobilephone: val?.target?.value });
                    }}
                    value={getFieldValue('mobilephone')}
                  />
                </HPopover>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem label={intl.get(`${promptCode}.model.expert.mail`).d('邮箱')} {...formLayOut}>
              {getFieldDecorator('mail', {
                rules: [
                  {
                    required: getFieldValue('expertType') === 'EXTERNAL' && isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${promptCode}.model.expert.mail`).d('邮箱'),
                    }),
                  },
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
                initialValue: formData.mail,
              })(
                <Input
                  disabled={
                    getFieldValue('expertType') === 'INTERNAL' ||
                    !getFieldValue('expertType') ||
                    !isEdit
                  }
                />
              )}
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
                  disabled={!isEdit}
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
                <Select
                  allowClear
                  disabled={!isEdit}
                  style={{ width: '100%' }}
                  onChange={() => this.handleChangeIdType({ idNumber: '' })}
                >
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
                rules: this.getIdNumberRules(),
                initialValue: formData.idNumber,
              })(<Input disabled={!getFieldValue('idType') || !isEdit} />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get(`${promptCode}.model.expert.birthday`).d('出生日期')}
              {...formLayOut}
            >
              {getFieldDecorator('birthday', {
                initialValue: formData.birthday && moment(formData.birthday, getDateFormat()),
              })(
                <DatePicker
                  disabled={
                    getFieldValue('expertType') === 'INTERNAL' ||
                    !getFieldValue('expertType') ||
                    !isEdit
                  }
                  style={{ width: '100%' }}
                  placeholder=""
                  format={getDateFormat()}
                  disabledDate={(currentDate) => moment().isBefore(currentDate, 'day')}
                />
              )}
            </FormItem>
          </Col>
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
                  disabled={!isEdit}
                />
              )}
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: formData.remark,
              })(
                <TextArea
                  style={{ marginLeft: '-4px' }}
                  disabled={!isEdit}
                  onChange={(val) => {
                    setFieldsValue({ remark: val?.target?.value });
                  }}
                />
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }
}
