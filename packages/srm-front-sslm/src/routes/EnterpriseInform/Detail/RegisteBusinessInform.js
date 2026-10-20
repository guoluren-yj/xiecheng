/**
 * RegisteBusinessInform - 注册业务信息
 * @date: 2019-10-31
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import React, { Component } from 'react';
import { Row, Col, Input, Select, Form, Spin } from 'hzero-ui';
import { isArray, intersection, isEmpty } from 'lodash';

import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { PRIVATE_BUCKET } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from '@/routes/index.less';
import Checkbox from 'components/Checkbox';
import Upload from 'components/Upload/UploadButton';

const FormItem = Form.Item;
const { Option, OptGroup } = Select;
const { TextArea } = Input;

const PURCHASE = 'purchase';
const SALE = 'sale';
const BUSINESSAGENT = 'agent';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const bucketDirectory = 'spfm-comp';
const AGENT = 'agent';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

// const businessType = [
//   { label: intl.get('sslm.enterpriseInform.view.message.purchase').d('我要采购'), value: PURCHASE },
//   { label: intl.get('sslm.enterpriseInform.view.message.sale').d('我要销售'), value: SALE },
// ];

// const serviceType = [
//   { label: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'), value: MANUFACTURER },
//   { label: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: TRADER },
//   { label: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: SERVICER },
//   { label: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: AGENT },
// ];

/**
 * 根据送货地区,判断地区的类型
 * @param {*} value 送货地区的value
 * @returns 送货去地区的类型
 * globalFlag:全球
 * continentsFlag:大洲
 * chinaFlag:中国
 * otherFlag:中国地区
 */
const getPositionType = value => {
  switch (value) {
    case '0':
      return 'globalFlag';
    case '010':
      return 'continentsFlag';
    case '020':
      return 'continentsFlag';
    case '030':
      return 'continentsFlag';
    case '040':
      return 'continentsFlag';
    case '050':
      return 'continentsFlag';
    case '060':
      return 'continentsFlag';
    case '070':
      return 'continentsFlag';

    case '01':
      return 'chinaFlag';

    default:
      return 'otherFlag';
  }
};

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryCompanyBusinessReq`],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['sslm.enterpriseInform', 'spfm.enterprise', 'hptl.portalAssign'] })
export default class RegisteBusinessInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      companyBussiness: {},
      globalFlag: false,
      chinaFlag: false,
      otherFlag: false,
      continentsFlag: false,
      newLogoUrlConfig: null,
    };
  }

  // 查询行业类型
  @Bind()
  queryIndustries() {
    const { dispatch, domesticForeignRelation, countryCode } = this.props;
    const domesticFlag =
      domesticForeignRelation !== 2 ? domesticForeignRelation : countryCode === 'CN' ? 1 : 0;
    dispatch({
      type: `enterpriseInform/bussinessInit`,
      payload: domesticFlag,
    });
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.queryIndustries();
    this.handlequeryCompanyBusiness();
  }

  getSnapshotBeforeUpdate(nextProps) {
    const { domesticForeignRelation } = nextProps;
    const { domesticForeignRelation: curDomesticForeignRelation } = this.props;
    return domesticForeignRelation !== curDomesticForeignRelation;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot) {
      this.queryIndustries();
    }
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const {
      form: { validateFieldsAndScroll },
      supplierFlag,
    } = this.props;
    const { companyBussiness } = this.state;
    const { saleFlag, purchaseFlag } = companyBussiness || {};
    let comBusinessReqDTO = null;
    validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        comBusinessReqDTO = null; // 校验不通过置为null
        notification.warning({
          message: intl
            .get(`sslm.enterpriseInform.view.message.warn.bussWarn`)
            .d('注册业务信息填写有误'),
        });
      } else {
        // 取个性化字段的值
        const cusFiled = fieldsValue;
        const businessTypeList = fieldsValue.businessType || [];
        let newSaleFlag = saleFlag;
        let newPurchaseFlag = purchaseFlag;
        if (!supplierFlag) {
          newSaleFlag = businessTypeList.indexOf(SALE) !== -1 ? 1 : 0;
          newPurchaseFlag = businessTypeList.indexOf(PURCHASE) !== -1 ? 1 : 0;
        }
        const serviceTypeList = fieldsValue.serviceType || [];
        // const industryCategoryList = fieldsValue.industryCategoryList || [];
        const serviceAreaList = fieldsValue.serviceAreaReqList || [];
        comBusinessReqDTO = {
          ...companyBussiness,
          ...cusFiled,
          saleFlag: newSaleFlag,
          purchaseFlag: newPurchaseFlag,
          manufacturerFlag: serviceTypeList.indexOf(MANUFACTURER) !== -1 ? 1 : 0,
          traderFlag: serviceTypeList.indexOf(TRADER) !== -1 ? 1 : 0,
          servicerFlag: serviceTypeList.indexOf(SERVICER) !== -1 ? 1 : 0,
          agentFlag: serviceTypeList.indexOf(AGENT) !== -1 ? 1 : 0,
          dealerFlag: serviceTypeList.indexOf(DEALER) !== -1 ? 1 : 0,

          industryReqList: fieldsValue.industryReqList.map(id => ({ industryId: id })),
          industryCategoryReqList: fieldsValue.industryCategoryReqList.map(id => ({
            industryCategoryId: id,
          })),
          logoUrl: fieldsValue.logoUrl,
          website: fieldsValue.website,
          description: fieldsValue.description,
          serviceAreaReqList: serviceAreaList.map(id => ({ serviceAreaCode: id })),
          integrationFlag: serviceTypeList.indexOf(INTEGRATION) !== -1 ? 1 : 0,
          contractorFlag: serviceTypeList.indexOf(CONTRACTOR) !== -1 ? 1 : 0,
        };
      }
    });

    return comBusinessReqDTO;
  }

  @Bind()
  handleAreaChange(value = []) {
    if (value.length !== 0) {
      //  全球
      if (value.includes('0') === true) {
        this.setState({
          globalFlag: false,
          chinaFlag: true,
          otherFlag: true,
          continentsFlag: true,
        });
      } else if (value.includes('01') === true) {
        this.setState({
          globalFlag: true,
          chinaFlag: false,
          otherFlag: true,
          continentsFlag: true,
        });
      } else {
        const continents = ['010', '020', '030', '040', '050', '060', '070'];
        let isContinent = false;
        for (const val of value) {
          if (continents.includes(val)) {
            isContinent = true;
            break;
          }
        }
        if (isContinent) {
          this.setState({
            globalFlag: true,
            chinaFlag: true,
            otherFlag: true,
            continentsFlag: false,
          });
        } else {
          this.setState({
            globalFlag: true,
            chinaFlag: true,
            otherFlag: false,
            continentsFlag: true,
          });
        }
      }
    } else {
      this.setState({
        globalFlag: false,
        chinaFlag: false,
        otherFlag: false,
        continentsFlag: false,
      });
    }
  }

  /**
   * 查询注册信息
   */
  @Bind()
  handlequeryCompanyBusiness() {
    const {
      dispatch,
      changeReqId,
      source = '',
      customizeUnitCode,
      companyId,
      supplierCompanyId,
      supplierFlag = 1,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryCompanyBusinessReq',
      payload: {
        changeReqId,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode,
        companyId,
        supplierCompanyId,
        supplierFlag,
        customizeTenantId,
      },
    }).then(res => {
      if (res) {
        if (res.industryReqList && !isEmpty(res.industryReqList)) {
          this.fetchIndustryCategories(res.industryReqList.map(item => item.industryId));
        }
        if (isArray(res.serviceAreaReqList)) {
          this.handleAreaChange(res.serviceAreaReqList.map(i => i.serviceAreaCode));
        }
        this.setState({ companyBussiness: res });
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
        type: `enterpriseInform/fetchIndustryCategories`,
        payload: list,
      });
    }
  }

  @Bind()
  fetchIndustryCategories(list) {
    if (list) {
      const { dispatch, form } = this.props;
      dispatch({
        type: `enterpriseInform/fetchIndustryCategories`,
        payload: list,
      }).then(industryAllCategoryList => {
        if (industryAllCategoryList) {
          const industryCategoryReqList = form.getFieldValue('industryCategoryReqList');
          const newIndustryCategoryList = intersection(
            industryCategoryReqList,
            industryAllCategoryList
          );
          form.setFieldsValue({ industryCategoryReqList: newIndustryCategoryList });
        }
      });
    }
  }

  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        logoUrl: file.response,
      });
      this.setState({
        newLogoUrlConfig: { url: file.response, name: file.name },
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
  handleIndustryChange(list) {
    if (list.length > 0) {
      this.fetchIndustryCategories(list);
    } else {
      const { dispatch, form } = this.props;
      dispatch({
        type: `enterpriseInform/updateState`,
        payload: {
          industryCategories: [],
        },
      });
      form.setFieldsValue({ industryCategoryReqList: [] });
    }
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
      list.map(item => {
        const { children = [] } = item;
        if (item[groupLabel]) {
          return (
            <OptGroup key={item[groupKey]} label={item[groupLabel]}>
              {children &&
                children.map(child => {
                  return (
                    <Option key={child[keyName]} value={child[keyName]}>
                      {child[labelName]}
                    </Option>
                  );
                })}
            </OptGroup>
          );
        } else {
          return null;
        }
      });
    return options;
  }

  render() {
    const {
      form: { getFieldDecorator },
      enterpriseInform: { industries = [], industryCategories = [] },
      code = {},
      changFlag,
      queryLoading,
      isEdit = false,
      form,
      pubEdit,
      customizeForm,
      customizeUnitCode,
      supplierFlag,
      source = '',
      domesticForeignRelation,
      savePermissionFlag = true,
      customizeConfig = {},
      changeLevel = '',
    } = this.props;
    const { companyBussiness, newLogoUrlConfig } = this.state;
    const { logoUrl, logoUrlname } = companyBussiness;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    // 字段禁用逻辑
    const fieldDisable =
      changFlag || isEdit || (supplierFlag && source === 'enterprise') || !savePermissionFlag;

    const {
      industryReqList = [],
      industryCategoryReqList = [],
      serviceAreaReqList = [],
      saleFlag = 0,
      purchaseFlag = 0,
      manufacturerFlag = 0,
      traderFlag = 0,
      servicerFlag = 0,
      agentFlag = 0,
      dealerFlag = 0,
      integrationFlag = 0,
      contractorFlag = 0,
    } = companyBussiness;
    const businessTypeValue = [];
    const serviceTypeValue = [];
    if (saleFlag === 1) businessTypeValue.push(SALE);
    if (purchaseFlag === 1) businessTypeValue.push(PURCHASE);

    if (manufacturerFlag === 1) serviceTypeValue.push(MANUFACTURER);
    if (traderFlag === 1) serviceTypeValue.push(TRADER);
    if (servicerFlag === 1) serviceTypeValue.push(SERVICER);
    if (agentFlag === 1) serviceTypeValue.push(BUSINESSAGENT);
    if (integrationFlag === 1) serviceTypeValue.push(INTEGRATION);
    if (contractorFlag === 1) serviceTypeValue.push(CONTRACTOR);
    if (dealerFlag === 1) serviceTypeValue.push(DEALER);

    const selectOptions =
      this.buildGroupSelectOption(
        industryCategories,
        'industryCategoryId',
        'industryName',
        'categoryId',
        'categoryName'
      ) || [];

    const industryOptions = this.buildGroupSelectOption(industries, 'industryId', 'industryName');

    const fileList = [];
    const newLogoUrl = newLogoUrlConfig ? newLogoUrlConfig.url : logoUrl;
    const newLogoFilename = newLogoUrlConfig ? newLogoUrlConfig.name : logoUrlname;
    if (newLogoUrl) {
      const url = getAttachmentUrl(
        newLogoUrl,
        PRIVATE_BUCKET,
        getCurrentOrganizationId(),
        bucketDirectory
      );
      fileList.push({
        uid: newLogoFilename || '',
        name: newLogoFilename,
        thumbUrl: url,
        url: newLogoUrl,
      });
    }

    const customizeUploadDisabled = (
      (customizeConfig['SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.BUSINESS_INFO'] || {})?.fields || []
    ).find(({ fieldCode }) => fieldCode === 'logoUrl');

    // 平台级企业信息变更非个人
    const isPlatformNotPersonalFlag = supplierFlag === 0 && domesticForeignRelation !== 2;
    return (
      <Spin spinning={queryLoading}>
        {customizeForm(
          {
            code: customizeUnitCode,
            form,
            dataSource: companyBussiness,
            readOnly: pubEdit ? false : fieldDisable,
          },
          <Form className="ued-edit-form form-wrap">
            <Row gutter={48} className="writable-row">
              {!supplierFlag && (
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl
                      .get('sslm.enterpriseInform.view.model.business.businessType')
                      .d('主要身份')}
                  >
                    {getFieldDecorator('businessType', {
                      initialValue: businessTypeValue,
                      rules: [
                        {
                          required: !fieldDisable,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get('sslm.enterpriseInform.view.model.business.businessType')
                              .d('主要身份'),
                          }),
                        },
                      ],
                    })(
                      <Select mode="multiple" disabled={fieldDisable}>
                        {code.businessType &&
                          code.businessType.map(item => {
                            return (
                              <Option key={item.value} value={item.value}>
                                {item.meaning}
                              </Option>
                            );
                          })}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )}
              <Col span={12} className={styles['business-nature']}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.serviceType')
                    .d('经营性质')}
                >
                  {getFieldDecorator('serviceType', {
                    initialValue: serviceTypeValue,
                    rules: [
                      {
                        required: isPlatformNotPersonalFlag && !fieldDisable, // 平台级企业信息变更非个人才必填
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.business.serviceType')
                            .d('经营性质'),
                        }),
                      },
                    ],
                  })(
                    <Select mode="multiple" disabled={fieldDisable}>
                      {code.serviceType &&
                        code.serviceType.map(item => {
                          return (
                            <Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Option>
                          );
                        })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            {!supplierFlag && domesticForeignRelation !== 2 && (
              <Row gutter={48} className="half-row">
                <Col span={8}>
                  <FormItem
                    label={intl
                      .get('spfm.enterprise.model.message.interBusinessShield')
                      .d('不允许其他企业找到我')}
                    extra={
                      source === 'enterprise'
                        ? intl
                            .get('hptl.portalAssign.model.portalAssign.interBusinessShieldInfo')
                            .d(
                              '若勾选，其他用户将无法在【发现供应商】和【发现采购方】查询到当前企业'
                            )
                        : intl
                            .get('hptl.portalAssign.model.portalAssign.interMessage')
                            .d('开启后，通过该二级域名注册的供应商默认无法被其他企业发现。')
                    }
                  >
                    {getFieldDecorator('interBusinessShield', {
                      initialValue: companyBussiness.interBusinessShield || 0,
                    })(<Checkbox disabled={fieldDisable} />)}
                  </FormItem>
                </Col>
              </Row>
            )}
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.industryReqList')
                    .d('行业类型')}
                >
                  {getFieldDecorator('industryReqList', {
                    initialValue: industryReqList.map(i => i.industryId),
                    rules: [
                      {
                        required: isPlatformNotPersonalFlag && !fieldDisable, // 平台级企业信息变更非个人才必填
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.business.industryReqList')
                            .d('行业类型'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      mode="multiple"
                      optionFilterProp="children"
                      onChange={this.handleIndustryChange}
                      disabled={fieldDisable}
                    >
                      {industryOptions}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.industryList')
                    .d('主营品类')}
                >
                  {getFieldDecorator('industryCategoryReqList', {
                    initialValue: industryCategoryReqList.map(i => i.industryCategoryId),
                    rules: [
                      {
                        required: isPlatformNotPersonalFlag && !fieldDisable, // 平台级企业信息变更非个人才必填
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.business.industryList')
                            .d('主营品类'),
                        }),
                      },
                    ],
                  })(
                    <Select mode="multiple" optionFilterProp="children" disabled={fieldDisable}>
                      {selectOptions}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
                    .d('送货服务范围')}
                >
                  {getFieldDecorator('serviceAreaReqList', {
                    initialValue:
                      serviceAreaReqList && serviceAreaReqList.map(i => i.serviceAreaCode),
                    rules: [
                      {
                        required: isPlatformNotPersonalFlag && !fieldDisable, // 平台级企业信息变更非个人才必填
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.enterpriseInform.view.model.business.serviceAreaReqList')
                            .d('送货服务范围'),
                        }),
                      },
                    ],
                  })(
                    <Select
                      mode="multiple"
                      disabled={fieldDisable}
                      onChange={this.handleAreaChange}
                    >
                      {code.servicesAreas &&
                        code.servicesAreas.map(item => {
                          const positionType = getPositionType(item.value);
                          return (
                            <Option
                              key={item.value}
                              value={item.value}
                              disabled={this.state[positionType]}
                            >
                              {item.meaning}
                            </Option>
                          );
                        })}
                    </Select>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.website')
                    .d('公司官网')}
                >
                  {getFieldDecorator('website', {
                    initialValue: companyBussiness.website,
                  })(<Input disabled={fieldDisable} />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.logoUrl')
                    .d('公司 Logo')}
                  extra={intl
                    .get('sslm.enterpriseInform.view.message.upload.support')
                    .d('上传格式：*.jpg;*.png;*.jpeg;')}
                >
                  <Upload
                    fileType="image/jpeg;image/png"
                    // viewOnly
                    disabled={
                      changeLevel !== 'PLATFORM' &&
                      customizeUploadDisabled &&
                      customizeUploadDisabled.editable !== -1
                        ? !customizeUploadDisabled.editable
                        : fieldDisable
                    }
                    viewOnly={
                      changeLevel !== 'PLATFORM' &&
                      customizeUploadDisabled &&
                      customizeUploadDisabled.editable !== -1
                        ? !customizeUploadDisabled.editable
                        : fieldDisable
                    }
                    single
                    showUploadList={{ showRemoveIcon: false }}
                    bucketName={PRIVATE_BUCKET}
                    bucketDirectory="spfm-comp"
                    fileList={fileList}
                    onUploadSuccess={this.onUploadSuccess}
                    onRemoveSuccess={this.onRemoveSuccess}
                    text={intl
                      .get('sslm.enterpriseInform.view.model.business.logoUrl')
                      .d('公司 Logo')}
                  />
                  {getFieldDecorator('logoUrl', {
                    initialValue: companyBussiness.logoUrl,
                  })(<div />)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="half-row">
              <Col span={12}>
                <FormItem
                  label={intl
                    .get('sslm.enterpriseInform.view.model.business.description')
                    .d('公司简介')}
                >
                  {getFieldDecorator('description', {
                    initialValue: companyBussiness.description,
                  })(<TextArea rows={2} disabled={fieldDisable} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
      </Spin>
    );
  }
}
