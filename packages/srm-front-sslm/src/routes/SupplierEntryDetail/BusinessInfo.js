import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { isEmpty } from 'lodash';
import { Form, TextField, Select, Output, TextArea, Spin, Lov } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { fetchIndustries } from '@/services/supplierEntryService';

import companyLogo from '@/assets/certification/company-logo.svg';
import UploadCard from './components/UploadCard';

import styles from './index.less';
import '@/routes/index.less';

const PURCHASE = 'purchase';
const SALE = 'sale';
const MANUFACTURER = 'manufacturer';
const TRADER = 'trader';
const SERVICER = 'servicer';
const AGENT = 'agent';
const INTEGRATION = 'integration';
const CONTRACTOR = 'contractor';
const DEALER = 'dealer';

const BusinessInfo = forwardRef((props, ref) => {
  const {
    dataSet,
    isEdit,
    logoCode,
    personalFlag,
    domesticFlag,
    customizeForm,
    custLoading,
    companyBaseInfo,
    disabledObj,
    customizeUnitCode,
  } = props;

  const { allDisabled, companyLogoUrl } = disabledObj;
  const disabled = allDisabled; // 表单禁用
  const formEditFlag = isEdit && !disabled; // 附件可编辑

  const newCompanyLogo = companyLogoUrl || companyLogo;

  const businessTypeMap = [
    {
      text: intl.get('sslm.supplierEntryDetail.view.message.purchase').d('我要采购'),
      value: PURCHASE,
    },
    { text: intl.get('sslm.supplierEntryDetail.view.message.sale').d('我要销售'), value: SALE },
  ];

  const serviceTypeMap = [
    {
      text: intl.get('sslm.supplierEntryDetail.view.message.manufacturer').d('制造商'),
      value: MANUFACTURER,
    },
    { text: intl.get('sslm.supplierEntryDetail.view.message.trader').d('贸易商'), value: TRADER },
    {
      text: intl.get('sslm.supplierEntryDetail.view.message.servicer').d('服务商'),
      value: SERVICER,
    },
    { text: intl.get('sslm.supplierEntryDetail.view.message.agent').d('代理商'), value: AGENT },
    {
      text: intl.get('sslm.supplierEntryDetail.model.detailForm.integration').d('集成商'),
      value: INTEGRATION,
    },
    {
      text: intl.get('sslm.supplierEntryDetail.model.detailForm.contractor').d('承包商'),
      value: CONTRACTOR,
    },
    {
      text: intl.get('sslm.supplierEntryDetail.model.detailForm.dealer').d('经销商'),
      value: DEALER,
    },
  ];

  const [state, setState] = useState({
    uploadFinish: false,
    categoryOptions: [],
    globalFlag: false,
    chinaFlag: false,
    otherFlag: false,
    continentsFlag: false,
    businessTypeMeaning: '',
    serviceTypeMeaning: '',
  });

  /**
   * 查询行业值集
   * @param {*} industryReqList 已存库的行业数据
   */
  const fetchIndustryList = (industryReqList = [], registeredCountryCode) => {
    // 境内，境外行业数据不同需分别查询
    // 个人注册，国家选中国查询查询境内值集，否则查询境外值集
    const falg = personalFlag ? registeredCountryCode === 'CN' : domesticFlag;
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
            dataSet.current.set('industryReqList', null);
            dataSet.current.set('industryCategoryReqList', null);
          }
        }
      }
    });
  };

  // 处理送货服务范围禁用
  const handleAreaChange = (value = []) => {
    if (!isEmpty(value)) {
      if (value.includes('0') === true) {
        setState({
          ...state,
          globalFlag: false,
          chinaFlag: true,
          otherFlag: true,
          continentsFlag: true,
        });
      } else if (value.includes('01') === true) {
        setState({
          ...state,
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
          setState({
            ...state,
            globalFlag: true,
            chinaFlag: true,
            otherFlag: true,
            continentsFlag: false,
          });
        } else {
          setState({
            ...state,
            globalFlag: true,
            chinaFlag: true,
            otherFlag: false,
            continentsFlag: true,
          });
        }
      }
    } else {
      setState({
        ...state,
        globalFlag: false,
        chinaFlag: false,
        otherFlag: false,
        continentsFlag: false,
      });
    }
  };

  // 查询业务信息
  const handleQueryBussiness = () => {
    return dataSet.query().then(res => {
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
          dealerFlag = 0,
          integrationFlag = 0,
          contractorFlag = 0,
          registeredCountryCode,
        } = res;
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
        const businessTypeList = businessType.map(i => {
          const object = businessTypeMap.find(n => n.value === i);
          return object.text;
        });

        const serviceTypeList = serviceType.map(i => {
          const object = serviceTypeMap.find(n => n.value === i);
          return object.text;
        });
        setState({
          ...state,
          businessTypeMeaning: (businessTypeList || []).join('、'),
          serviceTypeMeaning: (serviceTypeList || []).join('、'),
        });
        // 判断境内，境外标识
        const flag = personalFlag ? registeredCountryCode === 'CN' : domesticFlag;
        const domesticForeignFlag = flag ? 1 : 0;
        if (isEmpty(res)) {
          dataSet.loadData([]);
          dataSet.create({
            domesticForeignFlag,
          });
        } else {
          dataSet.loadData([
            {
              ...res,
              serviceType,
              businessType,
              industryReqList,
              industryCategoryReqList,
              serviceAreaReqList: serviceAreaReqList.map(i => i.serviceAreaCode),
              domesticForeignFlag,
            },
          ]);
        }
        // 查询行业值集，判断境内外是否切换
        fetchIndustryList(industryReqList, registeredCountryCode);
        // 处理送货服务范围
        const serviceAreaIdList = serviceAreaReqList.map(i => i.serviceAreaCode);
        handleAreaChange(serviceAreaIdList);
      }
    });
  };

  const handleIndustryListChange = () => {
    const record = dataSet.current;
    record.set('industryCategoryReqList', []);
  };

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

  /**
   * 上传成功
   */
  const onUploadSuccess = response => {
    dataSet.current.set('logoUrl', response);
  };

  const onUploadRemove = () => {
    dataSet.current.set('logoUrl', null);
  };

  useImperativeHandle(ref, () => ({
    handleQueryBussiness,
  }));

  useEffect(() => {
    // 解决只读页面进来接口并发请求
    if (!isEmpty(companyBaseInfo)) {
      handleQueryBussiness();
    }
  }, [dataSet, isEmpty(companyBaseInfo)]);

  return (
    <Spin dataSet={dataSet}>
      <div className={styles['legal-basic-form']}>
        {customizeForm(
          {
            // 预览界面不用个性化
            code: customizeUnitCode,
            enableCreate: false,
            labelLayout: isEdit ? 'float' : 'vertical',
            readOnly: !formEditFlag,
            enableReLoad: false,
          },
          <Form
            dataSet={dataSet}
            disabled={disabled}
            columns={2}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={isEdit ? '' : 'c7n-pro-vertical-form-display'}
            style={{
              width: '50%',
              maxWidth: 1172,
            }}
            custLoading={custLoading}
          >
            {isEdit ? <Select name="serviceType" /> : <Output name="serviceType" />}
            {isEdit ? (
              <Lov name="industryReqList" onChange={handleIndustryListChange} />
            ) : (
              <Output name="industryReqList" />
            )}
            {isEdit ? (
              <Lov name="industryCategoryReqList" />
            ) : (
              <Output name="industryCategoryReqList" />
            )}
            {isEdit ? (
              <Select
                name="serviceAreaReqList"
                selectAllButton={false}
                clearButton={false}
                onChange={handleAreaChange}
                onOption={({ record }) => {
                  const value = record.get('value');
                  const positionType = getPositionType(value);
                  return {
                    disabled: state[positionType],
                  };
                }}
              />
            ) : (
              <Output name="serviceAreaReqList" />
            )}
            {isEdit ? (
              <TextField name="website" colSpan={2} newLine />
            ) : (
              <Output name="website" colSpan={2} newLine />
            )}
            {isEdit ? (
              <TextArea name="description" resize="both" colSpan={2} />
            ) : (
              <Output name="description" colSpan={2} />
            )}
          </Form>
        )}
        {customizeForm(
          {
            code: logoCode,
          },
          <Form
            dataSet={dataSet}
            columns={2}
            labelLayout={formEditFlag ? 'float' : 'vertical'}
            className={styles['legal-basic-form-second']}
            labelWidth={50}
            style={{
              width: 400,
            }}
          >
            <Output
              name="logoUrl"
              renderer={({ record = {} }) => {
                const logoUrl = isEmpty(record) ? null : record.get('logoUrl');
                const logoFilename = isEmpty(record) ? null : record.get('logoFilename');
                return (
                  <UploadCard
                    fileName={logoFilename}
                    fileUrl={logoUrl}
                    onUploadSuccess={onUploadSuccess}
                    onUploadRemove={onUploadRemove}
                    accept="image/jpeg,image/jpg,image/png"
                    label={intl
                      .get('sslm.supplierEntryDetail.view.title.uploadCompanyLogo')
                      .d('上传公司logo')}
                    viewOnly={!formEditFlag}
                  />
                );
              }}
            />
            <Output
              name="logoExample"
              hidden={!formEditFlag}
              renderer={() => {
                return (
                  <div className={styles['company-logo']}>
                    <div>{intl.get('sslm.supplierEntryDetail.view.title.example').d('示例')}：</div>
                    <img
                      src={newCompanyLogo}
                      alt={intl
                        .get(`sslm.supplierEntryDetail.view.title.companyLogo`)
                        .d('公司logo')}
                    />
                  </div>
                );
              }}
            />
          </Form>
        )}
      </div>
    </Spin>
  );
});

export default BusinessInfo;
