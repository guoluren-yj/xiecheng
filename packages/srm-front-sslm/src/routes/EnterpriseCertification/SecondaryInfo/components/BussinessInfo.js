/**
 * BussinessInfo - 业务信息
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import { Alert } from 'choerodon-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { Content } from 'components/Page';

import FormField from '@/routes/components/FormField';
import { fetchIndustries } from '@/services/enterpriseInformService';
import { queryBussiness, fetchShield } from '@/services/enterpriseCertificationService';

import companyLogo from '@/assets/certification/company-logo.svg';
import styles from '../../index.less';
import UploadCard from '../../components/UploadCard';
import { businessTypeMap, serviceTypeMap } from '../../utils';

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
  constructor(props) {
    super(props);
    const { allInfo: { basicInfo = {} } = {}, changeReqId } = props;
    const { registeredCountryCode, domesticForeignRelation } = basicInfo;
    this.state = {
      globalFlag: false,
      chinaFlag: false,
      otherFlag: false,
      continentsFlag: false,
      industryCategoryMeaning: '',
      industryMeaning: '',
      serviceAreaMeaning: '',
      businessTypeMeaning: '',
      serviceTypeMeaning: '',
      interBusiness: 0,
      changeReqId,
      business: {},
      registeredCountryCode,
      domesticForeignRelation,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handleQueryBussiness();
    fetchShield().then(res => {
      if (getResponse(res)) {
        this.setState({
          interBusiness: res.interBusinessShield || 0,
        });
      }
    });
  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const nextState = { ...prevState };
  //   const { allInfo: { basicInfo = {} } = {}, changeReqId } = nextProps;
  //   const { registeredCountryCode, domesticForeignRelation } = basicInfo;
  //   if (!isEmpty(basicInfo) && registeredCountryCode !== prevState.registeredCountryCode) {
  //     nextState.registeredCountryCode = registeredCountryCode;
  //     nextState.domesticForeignRelation = domesticForeignRelation;
  //     nextState.changeReqId = changeReqId;
  //   }
  //   return nextState;
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   const { registeredCountryCode } = this.state;
  //   if (registeredCountryCode && registeredCountryCode !== prevState.registeredCountryCode) {
  //     this.handleQueryBussiness();
  //   }
  // }

  @Bind()
  handleQueryBussiness() {
    const { changeReqId, registeredCountryCode = '', domesticForeignRelation } = this.state;
    const { dataSet, handleQueryLoading } = this.props;
    // 查询
    const payload = {
      changeReqId,
      dataSource: 4,
    };
    if (changeReqId) {
      if (handleQueryLoading) {
        handleQueryLoading(true);
      }
      queryBussiness(payload)
        .then(res => {
          if (getResponse(res)) {
            const {
              industryCategoryReqList = [],
              serviceAreaReqList = [],
              industryReqList = [],
              saleFlag = 0,
              purchaseFlag = 0,
              manufacturerFlag = 0,
              traderFlag = 0,
              servicerFlag = 0,
              agentFlag = 0,
              integrationFlag = 0,
              contractorFlag = 0,
              dealerFlag = 0,
            } = res || {};
            const businessType = [];
            if (saleFlag === 1) businessType.push(SALE);
            if (purchaseFlag === 1) businessType.push(PURCHASE);
            const serviceType = [];
            if (manufacturerFlag === 1) serviceType.push(MANUFACTURER);
            if (traderFlag === 1) serviceType.push(TRADER);
            if (servicerFlag === 1) serviceType.push(SERVICER);
            if (agentFlag === 1) serviceType.push(AGENT);
            if (integrationFlag === 1) serviceType.push(INTEGRATION);
            if (contractorFlag === 1) serviceType.push(CONTRACTOR);
            if (dealerFlag === 1) serviceType.push(DEALER);
            // 处理只读下翻译值
            const industryListMeaning = industryReqList.map(i => i.industryName);
            const industryCategoryListMeaning = industryCategoryReqList.map(i => i.categoryName);
            const serviceAreaListMeaning = serviceAreaReqList.map(i => i.serviceAreaMeaning);
            const businessTypeList = businessType.map(i => {
              const object = businessTypeMap.find(n => n.value === i);
              return object.text;
            });
            const serviceTypeList = serviceType.map(i => {
              const object = serviceTypeMap.find(n => n.value === i);
              return object.text;
            });
            this.setState({
              industryMeaning: (industryListMeaning || []).join('、'),
              industryCategoryMeaning: (industryCategoryListMeaning || []).join('、'),
              serviceAreaMeaning: (serviceAreaListMeaning || []).join('、'),
              businessTypeMeaning: (businessTypeList || []).join('、'),
              serviceTypeMeaning: (serviceTypeList || []).join('、'),
            });
            // 个人注册，国家选中国查询查询境内值集，否则查询境外值集
            const flag =
              domesticForeignRelation === 2
                ? registeredCountryCode === 'CN'
                : !!domesticForeignRelation;
            const chinaFlag = flag ? 1 : 0;
            if (isEmpty(res)) {
              dataSet.loadData([]);
              dataSet.create({});
            } else {
              dataSet.loadData([
                {
                  ...res,
                  serviceType,
                  businessType,
                },
              ]);
            }
            dataSet.setState({
              domesticForeignRelation,
              chinaFlag,
            });
            // 查询行业值集，判断境内外是否切换 这个代码应该也可以删除，后端每次重新关联会清空数据
            // this.fetchIndustryList(industryReqList);
            // 处理送货服务范围
            const serviceAreaIdList = serviceAreaReqList.map(i => i.serviceAreaCode);
            this.handleAreaChange(serviceAreaIdList);
          }
        })
        .finally(() => {
          if (handleQueryLoading) {
            handleQueryLoading(false);
          }
        });
    }
  }

  /**
   * 处理保存数据
   */
  @Bind()
  handleBussinessData() {
    const { interBusiness, changeReqId, domesticForeignRelation } = this.state;
    const { dataSet } = this.props;
    const data = dataSet?.current?.toJSONData() || {};
    const {
      businessType = [],
      serviceType = [],
      industryReqList = [],
      industryCategoryReqList = [],
      serviceAreaReqList = [],
      ...others
    } = data || {};
    const respInterBusinessShield = data.interBusinessShield ? 1 : 0;
    const newInterBusinessShield =
      domesticForeignRelation === 2 ? respInterBusinessShield : interBusiness;

    const payload = {
      changeReqId,
      ...others,
      saleFlag: businessType.indexOf(SALE) !== -1 ? 1 : 0,
      purchaseFlag: businessType.indexOf(PURCHASE) !== -1 ? 1 : 0,
      manufacturerFlag: serviceType.indexOf(MANUFACTURER) !== -1 ? 1 : 0,
      traderFlag: serviceType.indexOf(TRADER) !== -1 ? 1 : 0,
      servicerFlag: serviceType.indexOf(SERVICER) !== -1 ? 1 : 0,
      dealerFlag: serviceType.indexOf(DEALER) !== -1 ? 1 : 0,
      industryReqs: industryReqList,
      industryCategoryReqs: industryCategoryReqList,
      logoUrl: data.logoUrl,
      website: data.website,
      interBusinessShield: newInterBusinessShield,
      description: data.description,
      objectVersionNumber: data.objectVersionNumber,
      serviceAreaReqs: serviceAreaReqList,
      agentFlag: serviceType.indexOf(AGENT) !== -1 ? 1 : 0,
      integrationFlag: serviceType.indexOf(INTEGRATION) !== -1 ? 1 : 0,
      contractorFlag: serviceType.indexOf(CONTRACTOR) !== -1 ? 1 : 0,
      isCreate: !data.changeReqId,
    };
    return payload;
  }

  /**
   * 查询行业值集
   * @param {*} industryReqList 已存库的行业数据
   */
  @Bind()
  fetchIndustryList(industryReqList = []) {
    // 境内，境外行业数据不同需分别查询
    const { dataSet } = this.props;
    const { registeredCountryCode = '', domesticForeignRelation } = this.state;
    // 个人注册，国家选中国查询查询境内值集，否则查询境外值集
    const falg =
      domesticForeignRelation === 2 ? registeredCountryCode === 'CN' : !!domesticForeignRelation;
    fetchIndustries(falg ? 1 : 0).then(industries => {
      if (getResponse(industries)) {
        // 判断 境内外信息是否改变，如果改变 清空 行业类型和主营品类。
        if (!isEmpty(industryReqList) && !isEmpty(industries)) {
          let isChange = true;
          for (const i of industries) {
            if (i.children) {
              for (const o of i.children) {
                if (industryReqList.findIndex(k => k.industryId === o.industryId) !== -1) {
                  isChange = false;
                  break;
                }
              }
            }
          }
          // 判断 境内外信息是否改变，如果改变 清空 行业类型和主营品类。
          if (isChange) {
            dataSet.current.set('industryReqList', undefined);
            dataSet.current.set('industryCategoryReqList', undefined);
          }
        }
      }
    });
  }

  /**
   * 上传成功
   */
  @Bind()
  onUploadSuccess(response) {
    const { dataSet } = this.props;
    dataSet.current.set('logoUrl', response);
  }

  @Bind()
  onUploadRemove() {
    const { dataSet } = this.props;
    dataSet.current.set('logoUrl', null);
  }

  @Bind()
  handleIndustryListChange() {
    const { dataSet } = this.props;
    const record = dataSet.current;
    record.set('industryCategoryReqList', []);
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
  @Bind()
  getPositionType(value) {
    switch (value) {
      case '0':
        return 'globalFlag';
      case '010':
      case '020':
      case '030':
      case '040':
      case '050':
      case '060':
      case '070':
        return 'continentsFlag';
      case '01':
        return 'chinaFlag';

      default:
        return 'otherFlag';
    }
  }

  // 渲染表单
  @Bind()
  renderForm(editFlag) {
    const { bussinessInfoConfig = {} } = this.props;
    const { enableFieldList = [] } = bussinessInfoConfig;
    const {
      industryMeaning,
      industryCategoryMeaning,
      serviceAreaMeaning,
      serviceTypeMeaning,
    } = this.state;
    // FormField 加label目的是因为多选的字段Output组件渲染会有边框和底色，ui要求展示纯文本，加label之后替换name属性
    return (
      <React.Fragment>
        <FormField
          isEdit={editFlag}
          name="serviceType"
          label={intl.get('spfm.enterprise.model.business.serviceType').d('经营性质')}
          renderer={() => {
            return serviceTypeMeaning;
          }}
          componentType="SELECT"
          hidden={!enableFieldList.includes('serviceType')}
        />
        <FormField
          isEdit={editFlag}
          name="industryReqList"
          label={intl.get('spfm.enterprise.model.business.industryList').d('行业类型')}
          onChange={this.handleIndustryListChange}
          componentType="LOV"
          hidden={!enableFieldList.includes('industryReqList')}
          renderer={() => {
            return industryMeaning;
          }}
        />
        <FormField
          isEdit={editFlag}
          name="industryCategoryReqList"
          componentType="LOV"
          label={intl.get('spfm.enterprise.model.business.industryCategoryList').d('主营品类')}
          hidden={!enableFieldList.includes('industryCategoryReqList')}
          renderer={() => {
            return industryCategoryMeaning;
          }}
        />
        <FormField
          isEdit={editFlag}
          name="serviceAreaReqList"
          label={intl.get('spfm.enterprise.model.business.serviceAreaList').d('送货服务范围')}
          selectAllButton={false}
          clearButton={false}
          onChange={this.handleAreaChange}
          onOption={({ record }) => {
            const value = record.get('value');
            const positionType = this.getPositionType(value);
            return {
              disabled: this.state[positionType],
            };
          }}
          componentType="SELECT"
          renderer={() => {
            return serviceAreaMeaning;
          }}
          hidden={!enableFieldList.includes('serviceAreaReqList')}
        />
        <FormField
          isEdit={editFlag}
          name="website"
          colSpan={2}
          newLine
          hidden={!enableFieldList.includes('website')}
        />
        <FormField
          isEdit={editFlag}
          name="description"
          colSpan={2}
          componentType="TextArea"
          hidden={!enableFieldList.includes('description')}
        />
      </React.Fragment>
    );
  }

  render() {
    const {
      dataSet,
      isEdit: oldEdit,
      bussinessDisabled,
      bussinessInfoConfig = {},
      publicData,
    } = this.props;
    const { remark, enableFieldList = [] } = bussinessInfoConfig;
    const isEdit = oldEdit && !bussinessDisabled;
    const { logoUrl: companyLogoUrl } = publicData || {};
    const newCompanyLogo = companyLogoUrl || companyLogo;
    return (
      <Content>
        <div className={styles['certification-title']} id="spfm_company_business">
          {intl.get('spfm.business.view.message.title').d('基础业务信息')}
          {isEdit && (
            <div className={styles['certification-title-tips']}>
              {intl
                .get('spfm.supplierRegister.view.message.businessInfo')
                .d(
                  '业务信息将会出现在您的主页上，丰富的内容有助于提高您的资质，便于更多企业快速阅览，促进交易。'
                )}
            </div>
          )}
        </div>
        <div
          style={{
            marginTop: -16,
          }}
        >
          {remark && <Alert showIcon type="info" message={remark} />}
        </div>
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
            {this.renderForm(isEdit)}
          </Form>
          <Form
            dataSet={dataSet}
            columns={2}
            labelLayout="float"
            className={styles['legal-basic-form-second']}
            labelWidth={50}
            style={{
              width: 400,
              display: enableFieldList.includes('logoUrl') ? 'block' : 'none',
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
                      src={newCompanyLogo}
                      alt={intl.get(`spfm.supplierRegister.view.title.companyLogo`).d('公司logo')}
                    />
                  </div>
                );
              }}
            />
          </Form>
        </div>
      </Content>
    );
  }
}
