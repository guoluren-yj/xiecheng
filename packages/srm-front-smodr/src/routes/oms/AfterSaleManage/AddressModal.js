import React from 'react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { Form, Input, Select, Checkbox, Cascader, Icon } from 'choerodon-ui';

import intl from 'utils/intl';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';

import {
  fetchCode,
  fetchCityInfoService,
  fetchCountry,
} from '@/services/oms/afterSaleOrderService';
import styles from './address.less';

const { Option } = Select;
const InputGroup = Input.Group;

@Form.create({ fieldNameProp: null })
export default class AddressModal extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    const { data = {} } = props;
    this.state = {
      data,
      idds: [],
      cityData: [],
      isChooseLastFlag: false, // 是否选择最深层级地址区域flag
      addressName: '',
    };
  }

  componentDidMount() {
    const { data } = this.state;
    const { form } = this.props;
    if (data?.streetId) {
      form.setFieldsValue({
        regionIdList: [data?.regionId, data?.cityId, data?.districtId, data?.streetId],
      });
    }
    fetchCode().then((res) => {
      this.setState({ idds: res });
    });
    fetchCountry().then((res) => {
      if (res) {
        fetchCityInfoService({ countryId: res?.[0]?.countryId }).then((resp) => {
          if (resp) {
            const newRes = resp.content.map((item) => {
              const { regionName, regionId } = item;
              return {
                ...item,
                label: regionName,
                value: regionId,
              };
            });
            this.setState({ cityData: newRes });
          }
        });
      }
    });
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(selectedOptions) {
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionCode } = lastOption;
    lastOption.loading = true;
    clearTimeout(this.loadCitiseTimer); // 清除定时器
    this.loadCitiseTimer = setTimeout(() => {
      fetchCityInfoService({ countryId, regionCode }).then((res) => {
        if (res) {
          const { cityData } = this.state;
          lastOption.loading = false;
          // 是否是最后一级地区
          if (!isEmpty(res?.content)) {
            const { content = [] } = res;
            const newContent = content.map((item) => ({
              ...item,
              label: item.regionName,
              value: item.regionId,
            }));
            lastOption.children = newContent;
            this.setState({
              isChooseLastFlag: false,
            });
          } else {
            this.setState({
              isChooseLastFlag: true,
            });
          }
          this.setState({
            cityData: [...cityData],
          });
        }
      });
    }, 10);
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value, selectedOptions = []) {
    const { form } = this.props;
    // 判断是否选择的为最深层
    this.handleQueryCity(selectedOptions);
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('');
    form.setFieldsValue({
      regionIdList: value,
    });
    this.setState({
      region,
      regionValue: value,
    });
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;
    const { idds = [], cityData, isChooseLastFlag, data } = this.state;
    const require = getFieldValue('mobilePhone') || getFieldValue('phone');
    const addressCascader = (
      <Cascader
        changeOnSelect
        showSearch={false}
        menuMode="single"
        style={{ width: '100%' }}
        defaultValue={[data?.regionId, data?.cityId, data?.districtId, data?.streetId]}
        options={cityData || []}
        onChange={this.handleSelectRegion}
        loadData={(selectedOptions) => this.handleQueryCity(selectedOptions)}
      >
        <Icon
          type="arrow_drop_down"
          style={{
            fontSize: '16px',
            color: '#000',
            cursor: 'pointer',
          }}
        />
      </Cascader>
    );
    return (
      <div className={styles['address-content']}>
        <Form>
          <Form.Item>
            {getFieldDecorator('contactName', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('smodr.afterSaleManage.model.contact').d('联系人'),
                  }),
                },
              ],
              initialValue: data?.contactName,
            })(<Input label={intl.get('smodr.afterSaleManage.model.contact').d('联系人')} />)}
          </Form.Item>
          <InputGroup compact style={{ display: 'flex' }}>
            <Form.Item>
              {getFieldDecorator('internationalTelCode', {
                initialValue: data?.internationalTelCode || '+86',
              })(
                <Select
                  allowClear={false}
                  label={intl.get('smodr.afterSaleManage.model.internationalTelCode').d('区号')}
                >
                  {idds.map((m) => (
                    <Option value={m.value} key={m.value} title={m.meaning}>
                      {m.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </Form.Item>
            <Form.Item
              style={{ width: 402 }}
              label={intl.get(`smodr.afterSaleManage.model.mobile`).d('手机')}
            >
              {getFieldDecorator('mobilePhone', {
                rules: [
                  {
                    pattern:
                      getFieldValue('internationalTelCode') === '+86' ? PHONE : NOT_CHINA_PHONE,
                    message: intl
                      .get(`smodr.afterSaleManage.model.validate.phoneNum`)
                      .d('手机号码格式不正确'),
                  },
                  {
                    required: !require,
                    message: intl
                      .get('smodr.afterSaleManage.model.validate.bothValidate')
                      .d('手机和电话必填一项'),
                  },
                ],
                initialValue: data?.mobilePhone,
              })(<Input label={intl.get(`smodr.afterSaleManage.model.mobile`).d('手机')} />)}
            </Form.Item>
          </InputGroup>
          <Form.Item>
            {getFieldDecorator('phone', {
              rules: [
                {
                  required: !require,
                  message: intl
                    .get('smodr.afterSaleManage.model.validate.bothValidate')
                    .d('手机和电话必填一项'),
                },
              ],
              initialValue: data?.phone,
            })(<Input label={intl.get('smodr.afterSaleManage.model.phone').d('电话号码')} />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('regionIdList', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get(`smodr.afterSaleManage.model.addressArea`).d('地址区域'),
                  }),
                },
                {
                  validator: (rule, value, callback) => {
                    if (
                      !isChooseLastFlag &&
                      getFieldValue('regionIdList')?.length !== 4 &&
                      !data?.fullAddress
                    ) {
                      callback(
                        new Error(
                          intl
                            .get(`small.ecAcquirerAddress.model.detailRegionName`)
                            .d('请选择详细地址区域')
                        )
                      );
                    } else {
                      callback();
                    }
                  },
                },
              ],
              // initialValue: data?.fullAddress,
            })(
              <div>
                <Input
                  label={intl.get('smodr.afterSaleManage.model.addressArea').d('地址区域')}
                  suffix={addressCascader}
                  value={this.state.region || data?.fullAddress}
                />
              </div>
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('address', {
              rules: [
                {
                  required: true,
                  message: intl.get('hzero.common.validation.notNull', {
                    name: intl.get('smodr.afterSaleManage.model.addressDetail').d('详细地址'),
                  }),
                },
              ],
              initialValue: data?.address,
            })(
              <Input label={intl.get('smodr.afterSaleManage.model.addressDetail').d('详细地址')} />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('postCode', { initialValue: data?.postCode })(
              <Input label={intl.get('smodr.afterSaleManage.model.postal').d('邮政编码')} />
            )}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('addressFlag', { initialValue: data?.addressFlag || false })(
              <Checkbox defaultChecked={data?.addressFlag || 0}>
                {intl.get('smodr.afterSaleManage.view.default').d('设为默认')}
              </Checkbox>
            )}
          </Form.Item>
        </Form>
      </div>
    );
  }
}
