/**
 * HeaderInfo - 详情头信息
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, TextField, Select, TextArea, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isEmpty, isArray, intersection } from 'lodash';
import { yesOrNoRender } from 'utils/renderer';
import { getAccessToken, getResponse } from 'utils/utils';
import { queryIdpValue } from 'hzero-front/lib/services/api';

import UploadCard from './components/UploadCard';
import styles from './index.less';

import { fetchIndustries, fetchIndustryCategories, fetchShield } from '@/services/businessService';
import { fetchEnterpriseInfo } from '@/services/enterpriseService';

import companyLogo from '@/assets/icon-company-logo.svg';

const { Option, OptGroup } = Select;

const PURCHASE = 'purchase';
const SALE = 'sale';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const AGENT = 'agent';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

export default class BussinessInfo extends Component {
  businessTypeMap = [
    { text: intl.get('spfm.enterprise.view.message.purchase').d('我要采购'), value: PURCHASE },
    { text: intl.get('spfm.enterprise.view.message.sale').d('我要销售'), value: SALE },
  ];

  serviceTypeMap = [
    {
      text: intl.get('spfm.enterprise.view.message.manufacturer').d('制造商'),
      value: MANUFACTURER,
    },
    { text: intl.get('spfm.enterprise.view.message.trader').d('贸易商'), value: TRADER },
    { text: intl.get('spfm.enterprise.view.message.servicer').d('服务商'), value: SERVICER },
    { text: intl.get('spfm.enterprise.view.message.agent').d('代理商'), value: AGENT },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.integration').d('集成商'),
      value: INTEGRATION,
    },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.contractor').d('承包商'),
      value: CONTRACTOR,
    },
    {
      text: intl.get('spfm.certificationApproval.model.detailForm.dealer').d('经销商'),
      value: DEALER,
    },
  ];

  constructor(props) {
    super(props);
    this.state = {
      uploadFinish: false,
      industryOptions: [],
      categoryOptions: [],
      servicesAreas: [],
      globalFlag: false,
      chinaFlag: false,
      otherFlag: false,
      continentsFlag: false,
      industryCategoryMeaning: '',
      industryMeaning: '',
      serviceAreaMeaning: '',
      serviceTypeMeaning: '',
      interBusiness: 0,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    // 查询业务信息
    this.handleQueryBussiness();
    // 查询送货服务范围
    queryIdpValue('SPFM.COMPANY.SERVICE_AREA').then((res) => {
      if (getResponse(res)) {
        this.setState({
          servicesAreas: res,
        });
      }
    });
    fetchShield().then((res) => {
      if (getResponse(res)) {
        this.setState({
          interBusiness: res.interBusinessShield || 0,
        });
      }
    });
  }

  @Bind()
  handleQueryBussiness() {
    const { companyId, dataSet, handleUpdateState } = this.props;
    if (companyId) {
      if(handleUpdateState){
        handleUpdateState({
          otherLoading: true,
        });
      }
      fetchEnterpriseInfo({ companyId }).then(async (res) => {
        if (getResponse(res)) {
          const { business = {}, basic = {} } = res;
          const {
            industryCategoryList = [],
            serviceAreaList = [],
            industryList = [],
            saleFlag = 0,
            purchaseFlag = 0,
            manufacturerFlag = 0,
            traderFlag = 0,
            servicerFlag = 0,
            dealerFlag = 0,
            agentFlag = 0,
            integrationFlag = 0,
            contractorFlag = 0,
          } = business || {};
          const { registeredCountryCode } = basic || {};
          const businessType = [];
          if (saleFlag === 1) businessType.push(SALE);
          if (purchaseFlag === 1) businessType.push(PURCHASE);
          const serviceType = [];
          if (manufacturerFlag === 1) serviceType.push(MANUFACTURER);
          if (traderFlag === 1) serviceType.push(TRADER);
          if (servicerFlag === 1) serviceType.push(SERVICER);
          if (dealerFlag === 1) serviceType.push(DEALER);
          if (agentFlag === 1) serviceType.push(AGENT);
          if (integrationFlag === 1) serviceType.push(INTEGRATION);
          if (contractorFlag === 1) serviceType.push(CONTRACTOR);
          // 处理只读下翻译值
          const industryListMeaning = industryList.map((i) => i.industryName);
          const industryCategoryListMeaning = industryCategoryList.map((i) => i.categoryName);
          const serviceAreaListMeaning = serviceAreaList.map((i) => i.serviceAreaMeaning);

          const serviceTypeList = serviceType.map((i) => {
            const object = this.serviceTypeMap.find((n) => n.value === i);
            return object.text;
          });

          this.setState({
            industryMeaning: (industryListMeaning || []).join('、'),
            industryCategoryMeaning: (industryCategoryListMeaning || []).join('、'),
            serviceAreaMeaning: (serviceAreaListMeaning || []).join('、'),
            serviceTypeMeaning: (serviceTypeList || []).join('、'),
          });
          this.props.handSaveData(res);
          if (isEmpty(business)) {
            dataSet.loadData([]);
            dataSet.create({});
          } else {
            dataSet.loadData([
              {
                ...business,
                serviceType,
                businessType,
                industryList: industryList.map((i) => i.industryId),
                industryCategoryList: industryCategoryList.map((i) => i.categoryId),
                serviceAreaList: serviceAreaList.map((i) => i.serviceAreaCode),
              },
            ]);
          }
          // 查询行业值集，判断境内外是否切换
          await this.fetchIndustryList(industryList, registeredCountryCode);
          // 处理送货服务范围
          const serviceAreaIdList = serviceAreaList.map((i) => i.serviceAreaCode);
          this.handleAreaChange(serviceAreaIdList);
        }
      }).finally(() => {
        if(handleUpdateState){
          handleUpdateState({
            otherLoading: false,
          });
        }
      });
    }
  }

  /**
   * 处理保存数据
   */
  @Bind()
  handleBussinessData() {
    const { interBusiness } = this.state;
    const { dataSet, personalFlag } = this.props;
    const data = dataSet?.current?.toJSONData() || {};
    const {
      businessType = [],
      serviceType = [],
      industryList = [],
      industryCategoryList = [],
      serviceAreaList = [],
    } = data || {};
    const respInterBusinessShield = data.interBusinessShield ? 1 : 0;
    const newInterBusinessShield = personalFlag ? respInterBusinessShield : interBusiness;

    const payload = {
      ...data,
      saleFlag: businessType.indexOf(SALE) !== -1 ? 1 : 0,
      purchaseFlag: businessType.indexOf(PURCHASE) !== -1 ? 1 : 0,
      manufacturerFlag: serviceType.indexOf(MANUFACTURER) !== -1 ? 1 : 0,
      traderFlag: serviceType.indexOf(TRADER) !== -1 ? 1 : 0,
      servicerFlag: serviceType.indexOf(SERVICER) !== -1 ? 1 : 0,
      dealerFlag: serviceType.indexOf(DEALER) !== -1 ? 1 : 0,
      industryList: industryList.map((id) => ({ industryId: id })),
      industryCategoryList: industryCategoryList.map((id) => ({ categoryId: id })),
      logoUrl: data.logoUrl,
      website: data.website,
      interBusinessShield: newInterBusinessShield,
      description: data.description,
      objectVersionNumber: data.objectVersionNumber,
      serviceAreaList: serviceAreaList.map((id) => ({ serviceAreaCode: id })),
      agentFlag: serviceType.indexOf(AGENT) !== -1 ? 1 : 0,
      integrationFlag: serviceType.indexOf(INTEGRATION) !== -1 ? 1 : 0,
      contractorFlag: serviceType.indexOf(CONTRACTOR) !== -1 ? 1 : 0,
      isCreate: !data.companyId,
    };
    return payload;
  }

  // 下拉框分组
  @Bind()
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
    return options || [];
  }

  @Bind()
  smoothingArray(industryCategories = []) {
    if (!isEmpty(industryCategories)) {
      const list = industryCategories.map((o) => o.children);
      const arr = []; // 打平后的数组
      for (let j = 0; j < list.length; j++) {
        if (list[j]) {
          for (let i = 0; i < list[j].length; i++) {
            arr.push(list[j][i].categoryId);
          }
        }
      }
      return arr;
    }
  }

  /**
   * 查询行业值集
   * @param {*} industryList 已存库的行业数据
   */
  @Bind()
  fetchIndustryList(industryList = [], registeredCountryCode) {
    // 境内，境外行业数据不同需分别查询
    const { domesticFlag = true, dataSet, personalFlag } = this.props;
    // 个人注册，国家选中国查询查询境内值集，否则查询境外值集
    const falg = personalFlag ? registeredCountryCode === 'CN' : domesticFlag;
    return fetchIndustries(falg ? 1 : 0).then(async (industries) => {
      if (getResponse(industries)) {
        // 多选下拉框分组
        const industryOptions = this.buildGroupSelectOption(
          industries,
          'industryId',
          'industryName'
        );
        this.setState({
          industryOptions,
        });
        // 判断 境内外信息是否改变，如果改变 清空 行业类型和主营品类。
        if (!isEmpty(industryList) && !isEmpty(industries)) {
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
          if (isChange) {
            dataSet.current.set('industryList', undefined);
            dataSet.current.set('industryCategoryList', undefined);
          } else {
            // 通过行业类型查询下边的品类
            const idList = industryList.map((item) => item.industryId);
            await this.fetchIndustryCategories(idList);
          }
        }
      }
    });
  }

  // 查询主营品类
  @Bind()
  fetchIndustryCategories(list) {
    const { dataSet } = this.props;
    if (!isEmpty(list)) {
      const recordData = dataSet.current && dataSet.current.toData();
      return fetchIndustryCategories(list).then((res) => {
        if (getResponse(res)) {
          // 打平主营品类
          const industryAllCategoryList = this.smoothingArray(res);
          if (industryAllCategoryList) {
            const { industryCategoryList = [] } = recordData;
            const newIndustryCategoryList = intersection(
              industryCategoryList,
              industryAllCategoryList
            );
            dataSet.current.set('industryCategoryList', newIndustryCategoryList);
            // 多选下拉框分组
            const categoryOptions = this.buildGroupSelectOption(
              res,
              'industryCategoryId',
              'industryName',
              'categoryId',
              'categoryName'
            );
            this.setState({
              categoryOptions,
            });
          }
        }
      });
    }
  }

  /**
   * 上传成功
   */
  @Bind()
  onUploadSuccess(response) {
    const { dataSet } = this.props;
    if(dataSet && dataSet.current){
      dataSet.current.set('logoUrl', response);
    }
  }

  @Bind()
  onUploadRemove() {
    const { dataSet } = this.props;
    if(dataSet && dataSet.current){
      dataSet.current.set('logoUrl', undefined);
    }
  }

  @Bind()
  handleIndustryListChange(value) {
    const { dataSet } = this.props;
    const record = dataSet.current;
    if (isEmpty(value)) {
      record.set('industryCategoryList', []);
    } else {
      this.fetchIndustryCategories(value);
    }
  }

  @Bind()
  beforeUpload() {
    this.setState({
      uploadFinish: true,
    });
  }

  // 处理送货服务范围禁用
  @Bind()
  handleAreaChange(value = []) {
    if (!isEmpty(value)) {
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
   * 根据送货地区,判断地区的类型
   * @param {*} value 送货地区的value
   * @returns 送货去地区的类型
   * globalFlag:全球
   * continentsFlag:大洲
   * chinaFlag:中国
   * otherFlag:中国地区
   */
  getPositionType(value) {
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
  }

  render() {
    const { dataSet, isEdit, readOnly } = this.props;
    const {
      servicesAreas,
      industryOptions,
      categoryOptions,
      industryMeaning,
      industryCategoryMeaning,
      serviceAreaMeaning,
      serviceTypeMeaning,
    } = this.state;

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }

    return (
      <React.Fragment>
        <div className={styles['legal-basic-form']}>
          <Form
            dataSet={dataSet}
            columns={2}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
            style={{
              width: '45%',
              maxWidth: 1172,
            }}
          >
            {readOnly && (
              <Output
                name="interBusinessShield"
                renderer={({ value }) => {
                  return yesOrNoRender(value);
                }}
              />
            )}
            {isEdit ? (
              <Select name="serviceType" />
            ) : (
              <Output
                label={intl.get('spfm.enterprise.model.business.serviceType').d('经营性质')}
                value={serviceTypeMeaning}
              />
            )}
            {isEdit ? (
              <Select
                name="industryList"
                onChange={this.handleIndustryListChange}
                searchable
                reverse={false}
                selectAllButton={false}
              >
                {industryOptions}
              </Select>
            ) : (
              <Output
                label={intl.get('spfm.enterprise.model.business.industryList').d('行业类型')}
                value={industryMeaning}
              />
            )}
            {isEdit ? (
              <Select
                name="industryCategoryList"
                searchable
                reverse={false}
                selectAllButton={false}
              >
                {categoryOptions}
              </Select>
            ) : (
              <Output
                label={intl
                  .get('spfm.enterprise.model.business.industryCategoryList')
                  .d('主营品类')}
                value={industryCategoryMeaning}
              />
            )}
            {isEdit ? (
              <Select name="serviceAreaList" clearButton={false} onChange={this.handleAreaChange}>
                {servicesAreas.map((item) => {
                  const positionType = this.getPositionType(item.value);
                  return (
                    <Option key={item.value} value={item.value} disabled={this.state[positionType]}>
                      {item.meaning}
                    </Option>
                  );
                })}
              </Select>
            ) : (
              <Output
                label={intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围')}
                value={serviceAreaMeaning}
              />
            )}
            {isEdit ? (
              <TextField name="website" colSpan={2} newLine />
            ) : (
              <Output name="website" colSpan={2} newLine />
            )}
            {isEdit ? (
              <TextArea name="description" colSpan={2} />
            ) : (
              <Output name="description" colSpan={2} />
            )}
          </Form>
          <Form
            dataSet={dataSet}
            columns={2}
            labelLayout="float"
            className={styles['legal-basic-form-second']}
            labelWidth={50}
            style={{
              width: 400,
            }}
          >
            <Output
              renderer={({ record = {} }) => {
                const logoUrl = isEmpty(record) ? undefined : record.get('logoUrl');
                const logoFilename = isEmpty(record) ? undefined : record.get('logoFilename');
                return (
                  <UploadCard
                    fileName={logoFilename}
                    fileUrl={logoUrl}
                    onUploadSuccess={this.onUploadSuccess}
                    onUploadRemove={this.onUploadRemove}
                    accept="image/jpeg,image/jpg,image/png"
                    label={intl
                      .get('spfm.supplierRegister.view.title.uploadcompanyLogo')
                      .d('上传公司logo')}
                    viewOnly={!isEdit}
                  />
                );
              }}
            />
            <Output
              hidden={!isEdit}
              renderer={() => {
                return (
                  <div className={styles['company-logo']}>
                    <div>{intl.get('spfm.supplierRegister.view.title.example').d('示例')}：</div>
                    <img
                      src={companyLogo}
                      alt={intl.get(`spfm.supplierRegister.view.title.companyLogo`).d('公司logo')}
                    />
                  </div>
                );
              }}
            />
          </Form>
        </div>
      </React.Fragment>
    );
  }
}
