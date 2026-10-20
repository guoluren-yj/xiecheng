/**
 * 企业信息 - 业务信息
 * @date: 2018-7-15
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { DataSet, Form, Row, Col, Select, TextArea, TextField, CheckBox } from 'choerodon-ui/pro';
import { Button } from 'hzero-ui';
import { connect } from 'dva';
import { isArray, isNumber, intersection } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getCurrentOrganizationId, getAttachmentUrl } from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import Upload from 'components/Upload/UploadButton';
// import Checkbox from 'components/Checkbox';
import style from './bussiness.less';

const { Option, OptGroup } = Select;

const PURCHASE = 'purchase';
const SALE = 'sale';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const bucketDirectory = 'spfm-comp';
const AGENT = 'agent';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

const NAME_SPACE = 'enterpriseBusiness';

/**
 * 根据送货地区,判断地区的类型
 * @param {*} value 送货地区的value
 * @returns 送货去地区的类型
 * globalFlag:全球
 * continentsFlag:大洲
 * chinaFlag:中国
 * otherFlag:中国地区
 */
const getPositionType = (value) => {
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

@connect((modal) => ({
  business: modal[NAME_SPACE],
  updating: modal.loading.effects[`${NAME_SPACE}/updateBusiness`],
  saving: modal.loading.effects[`${NAME_SPACE}/createBusiness`],
}))
export default class BusinessForm extends PureComponent {
  state = {
    interBusiness: 0, // 是否启用企业屏蔽
    enabledFlag: 0,
    init: false,
  };

  businessTypeDs = new DataSet({
    data: [
      { text: intl.get('spfm.enterprise.view.message.purchase').d('我要采购'), value: PURCHASE },
      { text: intl.get('spfm.enterprise.view.message.sale').d('我要销售'), value: SALE },
    ],
  });

  // serviceTypeDs = new DataSet({
  //   data: [
  //     {
  //       text: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
  //       value: MANUFACTURER,
  //     },
  //     { text: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: TRADER },
  //     { text: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: SERVICER },
  //     { text: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: AGENT },
  //   ],
  // });

  bussinessDS = new DataSet({
    autoQuery: false,
    fields: [
      {
        name: 'businessType',
        type: 'string',
        required: true,
        multiple: true,
        textField: 'text',
        label: intl.get('spfm.enterprise.model.business.businessType').d('主要身份'),
        options: this.businessTypeDs,
      },
      {
        name: 'interBusinessShield',
        type: 'boolean',
        defaultValue: this.state.interBusiness,
        trueValue: 1,
        falseValue: 0,
        label: intl
          .get(`spfm.enterprise.model.message.interBusinessShield`)
          .d('不允许其他企业找到我'),
      },
      {
        name: 'serviceType',
        type: 'string',
        multiple: true,
        required: true,
        // textField: 'text',
        label: intl.get('spfm.enterprise.model.business.serviceType').d('经营性质'),
        // options: this.serviceTypeDs,
        lookupCode: 'SPFM.BUSINESS.NATURE',
      },
      {
        name: 'industryList',
        multiple: true,
        required: true,
        label: intl.get('spfm.enterprise.model.business.industryList').d('行业类型'),
      },
      {
        name: 'industryCategoryList',
        multiple: true,
        required: true,
        label: intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类'),
      },
      {
        name: 'serviceAreaList',
        multiple: true,
        required: true,
        label: intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围'),
      },
      {
        name: 'website',
        type: 'string',
        // pattern: STRICT_URL,
        label: intl.get('spfm.enterprise.model.business.website').d('公司官网'),
      },
      {
        name: 'logoUrl',
      },
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'description',
        type: 'string',
        label: intl.get('spfm.enterprise.model.business.description').d('公司简介'),
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'industryList') {
          if (value.length > 0) {
            this.fetchIndustryCategories(value);
          } else {
            const { dispatch } = this.props;
            dispatch({
              type: `${NAME_SPACE}/updateState`,
              payload: {
                industryCategories: [],
              },
            });
            record.set('industryCategoryList', []);
          }
        }
        if (name === 'serviceAreaList') {
          this.props.handleAreaChange(value || []);
        }
      },
    },
  });

  componentDidMount() {
    const { dispatch, onRef, companyId, domesticForeignRelation } = this.props;

    if (onRef) onRef(this);
    if (companyId && companyId !== 'undefined') {
      dispatch({
        type: `${NAME_SPACE}/init`,
        payload: domesticForeignRelation,
      }).then(() => {
        const {
          data: { industryList },
          business: { industries },
        } = this.props;
        // 判断 境内外信息是否改变，如果改变 清空 行业类型和主营品类。
        if (industryList && industries.length > 0) {
          let isChange = true;
          for (const i of industries) {
            if (i.children) {
              for (const o of i.children) {
                if (industryList.findIndex((k) => k.industryId === o.industryId) !== -1) {
                  isChange = false;
                  break;
                }
              }
            }
          }
          // 判断 境内外信息是否改变，如果改变 清空 行业类型和主营品类。
          if (isChange && this.bussinessDS.current) {
            this.bussinessDS.current.set('industryList', undefined);
            this.bussinessDS.current.set('industryCategoryList', undefined);
          }
        }
      });
    }
  }

  @Bind()
  businessLoadData(data) {
    const {
      industryCategoryList = [],
      serviceAreaList = [],
      industryList = [],
      saleFlag = 0,
      purchaseFlag = 0,
      manufacturerFlag = 0,
      traderFlag = 0,
      servicerFlag = 0,
      agentFlag = 0,
      integrationFlag = 0,
      contractorFlag = 0,
      dealerFlag = 0
    } = data;
    const { init } = this.state;
    const businessType = [];
    const serviceType = [];
    if (saleFlag === 1) businessType.push(SALE);
    if (purchaseFlag === 1) businessType.push(PURCHASE);

    if (manufacturerFlag === 1) serviceType.push(MANUFACTURER);
    if (traderFlag === 1) serviceType.push(TRADER);
    if (servicerFlag === 1) serviceType.push(SERVICER);
    if (agentFlag === 1) serviceType.push(AGENT);
    if (integrationFlag === 1) serviceType.push(INTEGRATION);
    if (contractorFlag === 1) serviceType.push(CONTRACTOR);
    if (dealerFlag === 1) serviceType.push(DEALER)
    this.bussinessDS.loadData([]);
    this.bussinessDS.create({
      ...data,
      serviceType,
      businessType,
      industryList: industryList.map((i) => i.industryId),
      industryCategoryList: industryCategoryList.map((i) => i.categoryId),
      serviceAreaList: serviceAreaList.map((i) => i.serviceAreaCode),
    });

    this.setState({
      init: !init,
    });
    this.fetchShieldSetting(data.interBusinessShield);
  }

  /**
   * srm组织信息查询主营平类 industryCategoryList
   * @param {*} list industryList 行业类型
   */
  @Bind()
  fetchShieldSetting(flag) {
    const { dispatch } = this.props;
    dispatch({
      type: `${NAME_SPACE}/fetchShieldSetting`,
    }).then((res) => {
      if (res) {
        if (!isNumber(flag) && this.bussinessDS.current) {
          this.bussinessDS.current.set('interBusinessShield', res.interBusinessShield || 0);
        }

        this.setState({
          interBusiness: res.interBusinessShield || 0,
          enabledFlag: res.enabledFlag || 0,
        });
      }
    });
  }

  @Bind()
  fetchIndustryCategories(list) {
    if (list) {
      const { dispatch } = this.props;
      const record = this.bussinessDS.current;
      dispatch({
        type: `${NAME_SPACE}/fetchIndustryCategories`,
        payload: list,
      }).then((industryAllCategoryList) => {
        if (industryAllCategoryList) {
          const industryCategoryList = record && record.get('industryCategoryList');
          const newIndustryCategoryList = intersection(
            industryCategoryList,
            industryAllCategoryList
          );
          record.set('industryCategoryList', newIndustryCategoryList);
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
    const record = this.bussinessDS.current;
    if (file && record) {
      record.set('logoUrl', file.response);
    }
  }

  @Bind()
  onRemoveSuccess() {
    const record = this.bussinessDS.current;
    if (record) {
      record.set('logoUrl', null);
    }
  }

  @Bind()
  async saveAndNext() {
    const { data, companyId, dispatch, callback } = this.props;
    const record = this.bussinessDS.current;
    const flag = await record.validate();
    if (flag && record) {
      const fieldsValue = record.toData();

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
        dealerFlag: serviceTypeList.indexOf(DEALER) !== -1 ? 1 : 0,
        industryList: fieldsValue.industryList.map((id) => ({ industryId: id })),
        industryCategoryList: fieldsValue.industryCategoryList.map((id) => ({ categoryId: id })),
        logoUrl: fieldsValue.logoUrl,
        website: fieldsValue.website,
        interBusinessShield: fieldsValue.interBusinessShield ? 1 : 0,
        description: fieldsValue.description,
        objectVersionNumber: fieldsValue.objectVersionNumber,
        serviceAreaList: serviceAreaList.map((id) => ({ serviceAreaCode: id })),
        agentFlag: serviceTypeList.indexOf(AGENT) !== -1 ? 1 : 0,
        integrationFlag: serviceTypeList.indexOf(INTEGRATION) !== -1 ? 1 : 0,
        contractorFlag: serviceTypeList.indexOf(CONTRACTOR) !== -1 ? 1 : 0,
      };

      dispatch({
        type: data.companyId ? `${NAME_SPACE}/updateBusiness` : `${NAME_SPACE}/createBusiness`,
        payload,
      }).then((res) => {
        if (res) {
          record.set('objectVersionNumber', res.objectVersionNumber);
          if (callback) {
            callback(res);
          }
        }
      });
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

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  render() {
    const {
      data = {},
      business: {
        industries = [],
        servicesAreas = [],
        industryCategories = [],
        // industryAllCategoryList = [],
      },
      // globalFlag = false,
      // chinaFlag = false,
      // otherFlag = false,
      // continentsFlag = false,
      updating,
      saving,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
    } = this.props;

    const {
      saleFlag = 0,
      purchaseFlag = 0,
      manufacturerFlag = 0,
      traderFlag = 0,
      servicerFlag = 0,
      agentFlag = 0,
      dealerFlag = 0,
      logoUrl,
      logoFilename,
      integrationFlag = 0,
      contractorFlag = 0,
    } = data;

    const businessTypeValue = [];
    const serviceTypeValue = [];
    if (saleFlag === 1) businessTypeValue.push(SALE);
    if (purchaseFlag === 1) businessTypeValue.push(PURCHASE);

    if (manufacturerFlag === 1) serviceTypeValue.push(MANUFACTURER);
    if (traderFlag === 1) serviceTypeValue.push(TRADER);
    if (servicerFlag === 1) serviceTypeValue.push(SERVICER);
    if (agentFlag === 1) serviceTypeValue.push(AGENT);
    if (integrationFlag === 1) serviceTypeValue.push(INTEGRATION);
    if (contractorFlag === 1) serviceTypeValue.push(CONTRACTOR);
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

    const record = this.bussinessDS.current;

    return (
      <div>
        <Form record={record} labelLayout="float">
          <Row>
            <Select
              name="businessType"
              style={{ width: '400px' }}
              popupCls={style['none-select-from']}
            />
          </Row>
          <div
            style={{
              fontSize: '12px',
              color: '#999',
            }}
          >
            {intl
              .get('spfm.business.model.business.interMessage')
              .d('如果您是供应商，为方便您与采购方的协作，请仅维护主要身份为「我要销售」')}
          </div>
          <Row>
            <Col span={24}>
              <CheckBox name="interBusinessShield" />
            </Col>
            <Col span={24} style={{ fontSize: '12px', color: '#999', marginTop: '6px' }}>
              {intl
                .get('hptl.portalAssign.model.portalAssign.interBusinessShieldInfo')
                .d('若勾选，其他用户将无法在【发现供应商】和【发现采购方】查询到当前企业')}
            </Col>
          </Row>
          <Row>
            <Select
              name="serviceType"
              style={{ width: '400px' }}
              popupCls={style['none-select-from']}
            />
          </Row>
          <Row>
            <Select
              name="industryList"
              style={{ width: '400px' }}
              popupCls={style['none-select-from']}
              searchable
            >
              {industryOptions}
            </Select>
          </Row>
          <Row>
            <Select
              name="industryCategoryList"
              style={{ width: '400px' }}
              popupCls={style['none-select-from']}
              searchable
            >
              {selectOptions}
            </Select>
          </Row>
          <Row>
            <Select
              name="serviceAreaList"
              style={{ width: '400px' }}
              clearButton={false}
              popupCls={style['none-select-from']}
            >
              {servicesAreas.map((item) => {
                const positionType = getPositionType(item.value);
                return (
                  <Option
                    key={item.value}
                    value={item.value}
                    disabled={
                      this.props[positionType]
                      // item.value === '0' ? globalFlag : item.value === '01' ? chinaFlag : otherFlag
                    }
                  >
                    {item.meaning}
                  </Option>
                );
              })}
            </Select>
          </Row>
          <Row>
            <TextField name="website" style={{ width: '400px' }} />
          </Row>
          <Row style={{ width: '400px' }}>
            <Upload
              fileList={fileList}
              fileType="image/jpeg;image/png"
              single
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
              onUploadSuccess={this.onUploadSuccess}
              onRemoveSuccess={this.onRemoveSuccess}
              text={intl.get('spfm.enterprise.view.message.logo').d('公司 Logo')}
            />
          </Row>
          <Row>
            <TextArea name="description" style={{ width: '400px' }} rows={6} />
          </Row>
          <Row style={{ marginTop: 40, textAlign: 'right' }}>
            <Col span={8}>
              {previousCallback && (
                <Button
                  type="primary"
                  ghost
                  onClick={this.handlePrevious}
                  style={{ marginRight: 16 }}
                >
                  {backBtnText}
                </Button>
              )}
              <Button type="primary" onClick={this.saveAndNext} loading={updating || saving}>
                {buttonText}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
