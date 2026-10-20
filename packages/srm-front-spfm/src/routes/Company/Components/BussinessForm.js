/**
 * 企业信息 - 业务信息
 * @date: 2018-7-15
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Button, Select, Col, Checkbox } from 'hzero-ui';
import { connect } from 'dva';
import { isUndefined, isArray, intersection } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import { STRICT_URL } from 'utils/regExp';
import { PRIVATE_BUCKET } from '_utils/config';

import Upload from 'components/Upload/UploadButton';

const { Item: FormItem } = Form;
const { Option, OptGroup } = Select;

const PURCHASE = 'purchase';
const SALE = 'sale';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const bucketDirectory = 'spfm-comp';
const AGENT = 'agent';
const DEALER = 'dealer';

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 18 },
};

const submitFormLayout = {
  wrapperCol: { span: 18, offset: 6 },
};

const NAME_SPACE = 'enterpriseBusiness';

@connect((modal) => ({
  business: modal[NAME_SPACE],
  updating: modal.loading.effects[`${NAME_SPACE}/updateBusiness`],
  saving: modal.loading.effects[`${NAME_SPACE}/createBusiness`],
}))
@Form.create({ fieldNameProp: null })
export default class BusinessForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      interBusiness: 0, // 是否启用企业屏蔽
    };
  }

  componentDidMount() {
    const { dispatch, onRef, companyId } = this.props;
    if (onRef) onRef(this);
    if (companyId) {
      dispatch({
        type: `${NAME_SPACE}/init`,
        payload: companyId,
      });
    }
    this.fetchShieldSetting();
  }

  @Bind()
  fetchShieldSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: `${NAME_SPACE}/fetchShieldSetting`,
    }).then((res) => {
      if (res) {
        this.setState({ interBusiness: res.enabledFlag || 0 });
      }
    });
  }

  /**
   * srm组织信息查询主营平类 industryCategoryList
   * @param {*} list industryList 行业类型
   */
  @Bind()
  fetchCategories(list) {
    if (list) {
      const { dispatch } = this.props;
      dispatch({
        type: `${NAME_SPACE}/fetchIndustryCategories`,
        payload: list,
      });
    }
  }

  @Bind()
  fetchIndustryCategories(list) {
    if (list) {
      const { dispatch, form } = this.props;
      dispatch({
        type: `${NAME_SPACE}/fetchIndustryCategories`,
        payload: list,
      }).then((industryAllCategoryList) => {
        if (industryAllCategoryList) {
          const industryCategoryList = form.getFieldValue('industryCategoryList');
          const newIndustryCategoryList = intersection(
            industryCategoryList,
            industryAllCategoryList
          );
          form.setFieldsValue({ industryCategoryList: newIndustryCategoryList });
        }
      });
    }
  }

  @Bind()
  handleIndustryChange(list) {
    if (list.length > 0) {
      this.fetchIndustryCategories(list);
    } else {
      const { dispatch, form } = this.props;
      dispatch({
        type: `${NAME_SPACE}/updateState`,
        payload: {
          industryCategories: [],
        },
      });
      form.setFieldsValue({ industryCategoryList: [] });
    }
  }

  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        logoUrl: file.response,
      });
    }
  }

  @Bind()
  onRemoveSuccess() {
    const { form } = this.props;
    form.setFieldsValue({
      logoUrl: null,
    });
  }

  @Bind()
  saveAndNext() {
    const { data, companyId, form, dispatch, callback } = this.props;
    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const businessTypeList = fieldsValue.businessType || [];
      const serviceTypeList = fieldsValue.serviceType || [];
      // const industryCategoryList = fieldsValue.industryCategoryList || [];
      const serviceAreaList = fieldsValue.serviceAreaList || [];

      const payload = {
        companyId,
        ...data,
        saleFlag: businessTypeList.indexOf(SALE) !== -1 ? 1 : 0,
        purchaseFlag: businessTypeList.indexOf(PURCHASE) !== -1 ? 1 : 0,
        manufacturerFlag: serviceTypeList.indexOf(MANUFACTURER) !== -1 ? 1 : 0,
        traderFlag: serviceTypeList.indexOf(TRADER) !== -1 ? 1 : 0,
        servicerFlag: serviceTypeList.indexOf(SERVICER) !== -1 ? 1 : 0,
        agentFlag: serviceTypeList.indexOf(AGENT) !== -1 ? 1 : 0,
        dealerFlag: serviceTypeList.indexOf(DEALER) !== -1 ? 1 : 0,
        industryList: fieldsValue.industryList.map((id) => ({ industryId: id })),
        industryCategoryList: fieldsValue.industryCategoryList.map((id) => ({ categoryId: id })),
        logoUrl: fieldsValue.logoUrl,
        website: fieldsValue.website,
        description: fieldsValue.description,
        objectVersionNumber: fieldsValue.objectVersionNumber,
        interBusinessShield: fieldsValue.interBusinessShield ? 1 : 0,
        serviceAreaList: serviceAreaList.map((id) => ({ serviceAreaCode: id })),
      };

      dispatch({
        type: data.companyId ? `${NAME_SPACE}/updateBusiness` : `${NAME_SPACE}/createBusiness`,
        payload,
      }).then((res) => {
        if (res) {
          dispatch({
            type: 'enterpriseEdit/queryCompanyBusiness',
            payload: companyId,
          }).then((res1) => {
            if (res1.industryList) {
              this.fetchCategories(res.industryList.map((item) => item.industryId));
            }
            form.setFieldsValue({
              objectVersionNumber: res1.objectVersionNumber,
            });
          });
          if (callback) {
            callback(res);
          }
        }
      });
    });
  }

  buildGroupSelectOption(
    list = [],
    groupKey = 'id',
    groupLabel = 'name',
    keyName = groupKey,
    labelName = groupLabel
  ) {
    const options =
      isArray(list) &&
      list.map((item) => {
        const { children = [] } = item;
        return (
          <OptGroup key={item[groupKey]} label={item[groupLabel]}>
            {children &&
              children.map((child) => {
                return (
                  <Option key={child[keyName]} value={child[keyName]}>
                    {child[labelName]}
                  </Option>
                );
              })}
          </OptGroup>
        );
      });
    return options;
  }

  // buildIndustryCategories(industryCategories) {
  //   const map = this.buildCategoriesMap(industryCategories);
  //   const createElement = function(category) {
  //     if (category.children && category.children.length > 0) {
  //       return React.createElement(
  //         OptGroup,
  //         { key: category.label, label: category.label },
  //         category.children.map(child => createElement(child))
  //       );
  //     } else {
  //       return React.createElement(
  //         Option,
  //         { key: category.categoryId, value: category.categoryId },
  //         category.categoryName
  //       );
  //     }
  //   };
  //   return Object.keys(map).map(key => createElement(map[key]));
  // }

  // buildCategoriesMap(categories) {

  //   const pathList = {};
  //   const allCategories = [];

  //   const buildFlatCat = function(cats) {
  //     cats.forEach(c => {
  //       allCategories.push(c);
  //       if (c.children) {
  //         buildFlatCat(c.children);
  //       }
  //     });
  //   };
  //   buildFlatCat(categories);

  //   allCategories.forEach(cat => {
  //     if (!cat.children) {
  //       if (cat.levelPath.indexOf('.') === -1) {
  //         pathList[cat.levelPath] = cat;
  //       } else {
  //         const pth = cat.levelPath.slice(0, cat.levelPath.length - 1);
  //         if (!pathList[pth]) {
  //           pathList[pth] = {
  //             label: pth
  //               .split('.')
  //               .map(code => {
  //                 const cts = allCategories.filter(c => c.categoryCode === code);
  //                 return cts && cts.length === 1 ? cts[0].categoryName : null;
  //               })
  //               .join(' > '),
  //             children: [],
  //           };
  //         }
  //         pathList[pth].children.push(cat);
  //       }
  //     }
  //   });
  //   return pathList;
  // }

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  @Bind()
  handleValueToMeaning(v, arr) {
    if (!v) return '';
    if (!(arr instanceof Array)) return '';
    const meanings = arr.filter((item) => v.includes(item.value)).map((item) => item.label);
    return meanings.toString();
  }

  render() {
    const businessType = [
      { label: intl.get('spfm.enterprise.view.message.purchase').d('我要采购'), value: PURCHASE },
      { label: intl.get('spfm.enterprise.view.message.sale').d('我要销售'), value: SALE },
    ];

    const serviceType = [
      {
        label: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
        value: MANUFACTURER,
      },
      { label: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: TRADER },
      { label: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: SERVICER },
      { label: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: AGENT },
      { label: intl.get('spfm.enterprise.view.message.dealer').d('经销商'), value: DEALER },
    ];

    const {
      form: { getFieldDecorator },
      data = {},
      handleAreaChange = () => {},
      globalFlag = false,
      wholeCountryFlag = false,
      otherFlag = false,
      business: {
        industries = [],
        servicesAreas = [],
        industryCategories = [],
        // industryAllCategoryList = [],
      },
      updating,
      saving,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
      statusNotPendingReject = false,
    } = this.props;

    const {
      industryCategoryList = [],
      industryList = [],
      serviceAreaList = [],
      saleFlag = 0,
      purchaseFlag = 0,
      manufacturerFlag = 0,
      traderFlag = 0,
      servicerFlag = 0,
      agentFlag = 0,
      dealerFlag = 0,
      logoUrl,
      logoFilename,
      interBusinessShield,
    } = data;

    const { interBusiness = 0 } = this.state;
    const businessTypeValue = [];
    const serviceTypeValue = [];
    if (saleFlag === 1) businessTypeValue.push(SALE);
    if (purchaseFlag === 1) businessTypeValue.push(PURCHASE);

    if (manufacturerFlag === 1) serviceTypeValue.push(MANUFACTURER);
    if (traderFlag === 1) serviceTypeValue.push(TRADER);
    if (servicerFlag === 1) serviceTypeValue.push(SERVICER);
    if (agentFlag === 1) serviceTypeValue.push(AGENT);
    if (dealerFlag === 1) serviceTypeValue.push(DEALER);

    // const selectOptions = this.buildIndustryCategories(industryCategories);

    const selectOptions = this.buildGroupSelectOption(
      industryCategories,
      'industryId',
      'industryName',
      'categoryId',
      'categoryName'
    );
    const industryOptions = this.buildGroupSelectOption(industries, 'industryId', 'industryName');

    const fileList = [];
    if (logoUrl) {
      const url = getAttachmentUrl(
        logoUrl,
        PRIVATE_BUCKET,
        getCurrentOrganizationId(),
        bucketDirectory
      );
      fileList.push({
        uid: logoFilename,
        name: logoFilename,
        thumbUrl: url,
        url: logoUrl,
      });
    }

    // const newIndustryCategoryList = intersection(
    //   industryCategoryList.map(i => i.categoryId),
    //   // industryCategoryList,
    //   industryAllCategoryList
    // );
    return (
      <Form style={{ marginTop: 8, width: '720px' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '720px', marginLeft: '102.5px' }}>
            <FormItem
              {...formItemLayout}
              label={intl.get('spfm.enterprise.model.business.businessType').d('主要身份')}
            >
              {statusNotPendingReject
                ? this.handleValueToMeaning(businessTypeValue, businessType)
                : getFieldDecorator('businessType', {
                    initialValue: businessTypeValue,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.requireSelect', {
                          name: intl
                            .get('spfm.enterprise.model.business.businessType')
                            .d('主要身份'),
                        }),
                      },
                    ],
                  })(<Checkbox.Group options={businessType} />)}
            </FormItem>
          </div>
          <div style={{ width: '720px' }}>
            <FormItem {...formItemLayout}>
              {statusNotPendingReject
                ? (!isUndefined(interBusinessShield) ? interBusinessShield : interBusiness)
                  ? intl
                      .get(`spfm.enterprise.model.message.interBusinessShield`)
                      .d('不允许其他企业找到我')
                  : intl
                      .get(`spfm.enterprise.model.message.noInterBusinessShield`)
                      .d('允许其他企业找到我')
                : getFieldDecorator(`interBusinessShield`, {
                    initialValue: !isUndefined(interBusinessShield)
                      ? interBusinessShield
                      : interBusiness,
                  })(
                    <Checkbox checkedValue={1} unCheckedValue={0}>
                      {intl
                        .get(`spfm.enterprise.model.message.interBusinessShield`)
                        .d('不允许其他企业找到我')}
                    </Checkbox>
                  )}
            </FormItem>
          </div>
        </div>
        <Col
          span={24}
          style={{ fontSize: '12px', color: '#999', marginTop: '-14px', marginLeft: '410px' }}
        >
          {statusNotPendingReject
            ? ''
            : intl
                .get('hptl.portalAssign.model.portalAssign.interMessage')
                .d('开启后，通过该二级域名注册的供应商默认无法被其他企业发现。')}
        </Col>
        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.model.business.serviceType').d('经营性质')}
        >
          {statusNotPendingReject
            ? this.handleValueToMeaning(serviceTypeValue, serviceType)
            : getFieldDecorator('serviceType', {
                initialValue: serviceTypeValue,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl.get('spfm.enterprise.model.business.serviceType').d('经营性质'),
                    }),
                  },
                ],
              })(<Checkbox.Group options={serviceType} />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.model.business.industryList').d('行业类型')}
        >
          {statusNotPendingReject
            ? industryList.map((i) => i.industryName)
            : getFieldDecorator('industryList', {
                initialValue: industryList.map((i) => i.industryId),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
                    }),
                  },
                ],
              })(
                <Select
                  mode="multiple"
                  optionFilterProp="children"
                  onChange={this.handleIndustryChange}
                >
                  {/* {industries.map(item => {
                return (
                  <Option key={item.industryId} value={item.industryId}>
                    {item.industryName}
                  </Option>
                );
              })} */}
                  {industryOptions}
                </Select>
              )}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类')}
        >
          {statusNotPendingReject
            ? industryCategoryList.map((i) => i.categoryName)
            : getFieldDecorator('industryCategoryList', {
                initialValue: industryCategoryList.map((i) => i.categoryId),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl
                        .get('spfm.enterprise.model.business.industryCategoryList')
                        .d('主营品类'),
                    }),
                  },
                ],
              })(<Select mode="multiple">{selectOptions}</Select>)}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围')}
        >
          {statusNotPendingReject
            ? serviceAreaList.map((i) => i.serviceAreaMeaning)
            : getFieldDecorator('serviceAreaList', {
                initialValue: serviceAreaList.map((i) => i.serviceAreaCode),
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.requireSelect', {
                      name: intl
                        .get('spfm.enterprise.model.business.serviceAreaList')
                        .d('送货服务范围'),
                    }),
                  },
                ],
              })(
                <Select mode="multiple" onChange={handleAreaChange}>
                  {servicesAreas.map((item) => {
                    return (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          item.value === '0'
                            ? globalFlag
                            : item.value === '01'
                            ? wholeCountryFlag
                            : otherFlag
                        }
                      >
                        {item.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
        </FormItem>

        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.model.business.website').d('公司官网')}
        >
          {statusNotPendingReject
            ? data.website
            : getFieldDecorator('website', {
                initialValue: data.website,
                rules: [
                  {
                    pattern: STRICT_URL,
                    message: intl
                      .get('spfm.enterprise.view.message.website.url')
                      .d('请输入以“http/https”开头的正确网址'),
                  },
                ],
              })(<Input />)}
        </FormItem>
        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.view.message.logo').d('公司 Logo')}
          extra={
            statusNotPendingReject
              ? ''
              : intl
                  .get('spfm.enterprise.view.message.upload.support')
                  .d('上传格式：*.jpg;*.png;*.jpeg;')
          }
        >
          <Upload
            fileList={fileList}
            fileType="image/jpeg;image/png"
            single
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="spfm-comp"
            onUploadSuccess={this.onUploadSuccess}
            onRemoveSuccess={this.onRemoveSuccess}
            text={intl.get('hzero.common.button.upload').d('上传')}
            viewOnly={statusNotPendingReject}
          />
        </FormItem>
        {getFieldDecorator('logoUrl', {
          initialValue: data.logoUrl,
        })(<div />)}
        {getFieldDecorator('objectVersionNumber', {
          initialValue: data.objectVersionNumber,
        })(<div />)}
        <FormItem
          {...formItemLayout}
          label={intl.get('spfm.enterprise.model.business.description').d('公司简介')}
        >
          {statusNotPendingReject
            ? data.description
            : getFieldDecorator('description', {
                initialValue: data.description,
              })(<Input.TextArea rows={6} />)}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 40, textAlign: 'right' }}>
          {previousCallback && (
            <Button type="primary" ghost onClick={this.handlePrevious} style={{ marginRight: 16 }}>
              {backBtnText}
            </Button>
          )}
          {statusNotPendingReject ? (
            ''
          ) : (
            <Button type="primary" onClick={this.saveAndNext} loading={updating || saving}>
              {buttonText}
            </Button>
          )}
        </FormItem>
      </Form>
    );
  }
}
