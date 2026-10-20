import React, { Component } from 'react';
import { Row, Col, Input, Form, Cascader, Icon, Select } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { FORM_COL_3_LAYOUT, EDIT_FORM_ROW_LAYOUT, EDIT_FORM_ITEM_LAYOUT } from 'utils/constants';

import intl from 'utils/intl';
import styles from '../../index.less';

const { TextArea } = Input;
const promptCode = 'sfin.payableInvoice';

/**
 * 应付发票申请 - 集中开票明细 - 发票信息
 * @extends {Component} - Component
 * @reactProps {Object} headerInfo - 头信息对象
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SFIN.INVOICE_EC_UPDATE_DETAIL.BILL_INFO',
    'SFIN.INVOICE_EC_CREATE_DETAIL.BILL_INFO',
    'SFIN.INVOICE_SUMMARY_DETAIL.EC_BILL_INFO',
  ],
})
@Form.create({ fieldNameProp: null })
export default class CentralizedBillForm extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (onRef) onRef(this);
    this.state = {};
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(val, selectedOptions = []) {
    const { form, onLoadData, onSetMallRegion } = this.props;
    if (onLoadData) {
      // 判断是否选择的为最深层
      onLoadData(selectedOptions);
    }
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('/');
    form.setFieldsValue({
      regionIds: region,
    });
    onSetMallRegion(val);
  }

  /**
   * 返回地址数组
   * @param {Number} id 地址最底Id
   * @param {Array} cityList 省市数组
   */
  @Bind()
  fetchRegionIds(id, cityList = []) {
    if (!id) return;
    const stack = [];
    const deepSearch = (children) => {
      let found = false;
      children.forEach((item) => {
        if (!found) {
          if (item.regionId === id) {
            found = true;
          } else if (!found && item.children && item.children.length > 0) {
            found = deepSearch(item.children);
          }
          if (found) stack.push(item);
        }
      });
      return found;
    };
    deepSearch(cityList);
    return stack.reverse().map((item) => item.regionId);
  }

  @Bind()
  handleCascader() {
    const { cityData, onLoadData } = this.props;
    return (
      <Cascader
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder={null}
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={this.handleSelectRegion}
        loadData={(selectedOptions) => onLoadData(selectedOptions)}
      >
        <Icon type="down" />
      </Cascader>
    );
  }

  phoneBefore = (record, idd, preName, name) => {
    const { getFieldDecorator, setFields, getFieldValue } = record.$form;
    const { custConfig = {}, ecSource, eCCustomizeUnitCodes = {} } = this.props || {};
    const billCustomize = ecSource
      ? eCCustomizeUnitCodes[ecSource.toUpperCase()].BILL
      : 'SFIN.INVOICE_EC_UPDATE_DETAIL.BILL_INFO';
    const { fields = [] } = custConfig?.[billCustomize] || {};
    const obj = fields.find((v) => v.fieldCode === name) || {};
    return getFieldDecorator(preName, {
      initialValue: record[preName] || (idd[0] && idd[0].value) || '+86',
    })(
      <Select
        disabled={obj.editable === 0}
        onChange={(value) => {
          const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
          setFields({
            [name]: {
              value: getFieldValue(name),
              errors: !testReg.test(getFieldValue(name))
                ? [new Error(intl.get('hzero.common.validation.phone').d('手机号码格式不正确'))]
                : null,
            },
          });
        }}
      >
        {idd.map((item) => (
          <Select.Option value={item.value}>{item.meaning}</Select.Option>
        ))}
      </Select>
    );
  };

  render() {
    const {
      form,
      isEdit,
      isChooseLastFlag,
      cityList = [],
      headerInfo = {},
      idd = [],
      customizeForm,
      ecSource,
      eCCustomizeUnitCodes = {},
    } = this.props;
    const { regionId, newMallFlag, regionName } = headerInfo;
    const regionIds = newMallFlag ? regionName : this.fetchRegionIds(regionId, cityList);
    const { getFieldDecorator } = form;
    return (
      <React.Fragment>
        {customizeForm(
          {
            code: ecSource
              ? eCCustomizeUnitCodes[ecSource.toUpperCase()].BILL
              : 'SFIN.INVOICE_EC_UPDATE_DETAIL.BILL_INFO',
            form,
            dataSource: headerInfo,
          },
          <Form className={styles['ec-read-form']}>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.taxRegistrationAddress`).d('税务登记地址')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('taxRegistrationAddress', {
                    initialValue: headerInfo.taxRegistrationAddress,
                  })(<span>{headerInfo.taxRegistrationAddress}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.taxRegistrationNumber`).d('税号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('taxRegistrationNumber', {
                    initialValue: headerInfo.taxRegistrationNumber,
                  })(<span>{headerInfo.taxRegistrationNumber}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.payableInvoice.depositBank`).d('开户行')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('depositBank', {
                    initialValue: headerInfo.depositBank,
                  })(<span>{headerInfo.depositBank}</span>)}
                </Form.Item>
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl
                    .get(`${promptCode}.model.payableInvoice.bankAccountNum`)
                    .d('开户行账号')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('bankAccountNum', {
                    initialValue: headerInfo.bankAccountNum,
                  })(<span>{headerInfo.bankAccountNum}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <Form.Item
                  label={intl.get(`${promptCode}.model.taxRegistrationPhone`).d('税务登记电话')}
                  {...EDIT_FORM_ITEM_LAYOUT}
                >
                  {getFieldDecorator('taxRegistrationPhone', {
                    initialValue: headerInfo.taxRegistrationPhone,
                  })(<span>{headerInfo.taxRegistrationPhone}</span>)}
                </Form.Item>
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                {isEdit ? (
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.contactName`)
                      .d('收单联系人')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('contactName', {
                      initialValue: headerInfo.contactName,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.payableInvoice.contactName`)
                              .d('收单联系人'),
                          }),
                        },
                      ],
                    })(<Input />)}
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.contactName`)
                      .d('收单联系人')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('contactName', {
                      initialValue: headerInfo.contactName,
                    })(<span>{headerInfo.contactName}</span>)}
                  </Form.Item>
                )}
              </Col>
            </Row>
            <Row {...EDIT_FORM_ROW_LAYOUT} className="read-row">
              <Col {...FORM_COL_3_LAYOUT}>
                {isEdit ? (
                  <Form.Item
                    label={intl.get(`${promptCode}.model.payableInvoice.mobile`).d('收单联系电话')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {form.getFieldDecorator('mobile', {
                      initialValue: headerInfo.mobile,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.payableInvoice.mobile`)
                              .d('收单联系电话'),
                          }),
                        },
                        {
                          pattern:
                            form.getFieldValue('internationalTelCode') === '+86'
                              ? PHONE
                              : NOT_CHINA_PHONE,
                          message: intl
                            .get('hzero.common.validation.phone')
                            .d('手机号码格式不正确'),
                        },
                      ],
                    })(
                      <Input
                        addonBefore={this.phoneBefore(
                          { ...headerInfo, $form: form },
                          idd,
                          'internationalTelCode',
                          'mobile'
                        )}
                      />
                    )}
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl.get(`${promptCode}.model.payableInvoice.mobile`).d('收单联系电话')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('contactName', {
                      initialValue: headerInfo.mobile,
                    })(
                      <span>
                        {headerInfo.internationalTelCodeMeaning && headerInfo.mobile
                          ? `${headerInfo.internationalTelCodeMeaning} | ${headerInfo.mobile}`
                          : ''}
                      </span>
                    )}
                  </Form.Item>
                )}
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                {isEdit ? (
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.regionName`)
                      .d('收单方地址')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {form.getFieldDecorator('regionIds', {
                      initialValue: regionIds,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.payableInvoice.regionName`)
                              .d('收单方地址'),
                          }),
                        },
                        {
                          validator: (rule, value, callback) => {
                            if (!isChooseLastFlag && headerInfo.newMallFlag) {
                              callback(
                                new Error(
                                  intl
                                    .get(`${promptCode}.model.payableInvoice.detailRegionName`)
                                    .d('请选择详细地址区域')
                                )
                              );
                            } else {
                              callback();
                            }
                          },
                        },
                      ],
                    })(
                      headerInfo.newMallFlag ? (
                        <Input
                          style={{
                            verticalAlign: 'middle',
                            position: 'relative',
                            top: '-1px',
                          }}
                          readOnly
                          addonAfter={this.handleCascader()}
                        />
                      ) : (
                        <Cascader
                          allowClear
                          placeholder=""
                          style={{ width: '100%' }}
                          fieldNames={{ label: 'regionName', value: 'regionId' }}
                          options={cityList}
                          showSearch={{
                            filter(inputValue, path) {
                              return path.some(
                                (option) =>
                                  option.regionName
                                    .toLowerCase()
                                    .indexOf(inputValue.toLowerCase()) > -1
                              );
                            },
                          }}
                        />
                      )
                    )}
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl
                      .get(`${promptCode}.model.payableInvoice.regionName`)
                      .d('收单方地址')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('regionName', {
                      initialValue: headerInfo.regionName,
                    })(<span>{headerInfo.regionName}</span>)}
                  </Form.Item>
                )}
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                {isEdit ? (
                  <Form.Item
                    label={intl.get(`${promptCode}.model.payableInvoice.address`).d('详细地址')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {form.getFieldDecorator('address', {
                      initialValue: headerInfo.address,
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`${promptCode}.model.payableInvoice.address`)
                              .d('详细地址'),
                          }),
                        },
                      ],
                    })(<TextArea rows={2} />)}
                  </Form.Item>
                ) : (
                  <Form.Item
                    label={intl.get(`${promptCode}.model.payableInvoice.address`).d('详细地址')}
                    {...EDIT_FORM_ITEM_LAYOUT}
                  >
                    {getFieldDecorator('address', {
                      initialValue: headerInfo.address,
                    })(<span>{headerInfo.address}</span>)}
                  </Form.Item>
                )}
              </Col>
            </Row>
          </Form>
        )}
      </React.Fragment>
    );
  }
}
