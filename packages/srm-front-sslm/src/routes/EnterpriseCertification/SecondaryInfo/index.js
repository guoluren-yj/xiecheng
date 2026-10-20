/*
 * MainInfo - 企业次要信息
 * @Date: 2022-07-03 09:57:53
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { DataSet, notification, Button, Modal } from 'choerodon-ui/pro';
import { Spin } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, camelCase } from 'lodash';
import querystring from 'querystring';
import intl from 'utils/intl';

import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import PositionAnchor from '_components/PositionAnchor';
import { getResponse, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';

import { handleCompanyLogoUrl } from '@/routes/components/utils';
import {
  fetchUserDetail,
  queryCompanyBasic,
  queryBussiness,
  saveSecondaryInfo,
  fetchPublicData,
  checkChangeInvestigate,
} from '@/services/enterpriseCertificationService';
import { transformFields } from '@/routes/components/EnterpriseCertification/utils/utils.js';
import { linkList } from '../utils';

import {
  getBussinessDS,
  getContactDS,
  getAddressDS,
  getBankInfoDS,
  getInvoiceDS,
  getFinanceDS,
  getAttachmentDS,
  getOtherInfoDS,
  getInviteInfoDS,
} from './stores/indexDS';

import InviteInfo from './components/InviteInfo';
import ValidationSteps from '../components/ValidationSteps';
import {
  BUSSINESS,
  BANK_ACCOUNT,
  CONTANT,
  ADDRESS,
  INVOICE,
  FIN,
  ATTACHMENT,
  OTHERINFO,
  getCardList,
  getConfigKeyByconfigName,
} from './utils/utils';

import styles from '../index.less';

const language = getCurrentLanguage();
const { Link } = PositionAnchor;
const organizationId = getCurrentOrganizationId();
const isTenantLevel = organizationId !== 0;

/**
 * 次要信息
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SSLM.ENTERPRISE_CERTIFICATION.SECONDARY_OTHER_INFO',
    'SSLM.ENTERPRISE_CERTIFICATION.INVIT_INFO',
  ],
})
export default class SecondaryInfo extends Component {
  constructor(props) {
    super(props);
    // 是否是预览
    const isPreview = props.location?.pathname?.match('preview');
    const routerParam = querystring.parse(props?.location?.search.substr(1));
    const { changeReqId = '' } = routerParam;
    // domesticFlag true(境内和个人注册) false(境外注册)
    this.state = {
      isEdit: true,
      isPreview,
      changeReqId,
      configNameList: [], // 展示页签
      mainDataTab: [], // 主数据页签字段
      allInfo: {}, // 所有信息
      userInfo: {}, // 用户子账户
      publicData: {}, // 公共数据
      preLoading: false, // 前置接口
      saveLoading: false, // 保存接口
      otherLoading: false,
      inviteTabShowFlag: false, // 邀约信息展示
    };
    this.otherInfoDs = new DataSet({
      ...getOtherInfoDS({ changeReqId }),
    });
  }

  contactRef = React.createRef();

  addressRef = React.createRef();

  bussinessDs = new DataSet({
    ...getBussinessDS({ originConfig: true }),
  });

  contactDs = new DataSet({
    ...getContactDS({ originConfig: true }),
  });

  addressDs = new DataSet({
    ...getAddressDS({ originConfig: true }),
  });

  bankInfoDs = new DataSet({
    ...getBankInfoDS({ originConfig: true }),
  });

  financeDs = new DataSet({
    ...getFinanceDS({ originConfig: true }),
  });

  invoiceDs = new DataSet({
    ...getInvoiceDS(),
  });

  attachmentDs = new DataSet({
    ...getAttachmentDS({ originConfig: true }),
  });

  inviteInfoDs = new DataSet({
    ...getInviteInfoDS(),
  });

  componentDidMount() {
    // 查询所有数据
    this.handleQueryAllInfo();
  }

  // 查询所有数据
  @Bind()
  handleQueryAllInfo() {
    const { hostname } = window.location;
    const { changeReqId } = this.state;
    const payload = {
      changeReqId,
      dataSource: 4,
    };
    if (changeReqId) {
      this.setState({
        preLoading: true,
      });
      Promise.all([
        queryCompanyBasic(payload),
        // 业务信息
        queryBussiness(payload),
        fetchUserDetail(),
        fetchPublicData(hostname),
      ])
        .then(async res => {
          const [basicInfo, bussinessInfo, userInfo, publicData] = res;
          if (
            getResponse(basicInfo) &&
            getResponse(bussinessInfo) &&
            getResponse(userInfo) &&
            getResponse(publicData)
          ) {
            const { strategyCfBasic = {}, country = {}, logoUrl } = publicData;
            // 查询邀约信息
            this.handleQueryInviteInfo(strategyCfBasic);
            // 处理邀约信息页签展示
            this.handleInviteTabsShow(publicData);
            // 处理业务信息公司logo
            const companyLogoUrl = handleCompanyLogoUrl(logoUrl);
            this.setState({
              allInfo: { basicInfo, bussinessInfo },
              userInfo,
              defaultCountryInfo: country,
              publicData: {
                ...publicData,
                logoUrl: companyLogoUrl,
              },
            });
            // 查询二级域名配置 等该接口查询完成之后再loading为false
            await this.handleQueryTabConfig();
          }
        })
        .finally(() => {
          this.setState({
            preLoading: false,
          });
        });
    }
  }

  // 处理邀约信息页签展示
  @Bind()
  handleInviteTabsShow(publicData = {}) {
    const notBasicTabShowFlag = isTenantLevel;

    const { strategyCfBasic = {}, partnerFlag, existFlag, invitationCode } = publicData;
    const { allowSupplierInvite } = strategyCfBasic;

    const inviteTabShowFlag =
      notBasicTabShowFlag &&
      !(existFlag === 1 && partnerFlag === 1) &&
      !invitationCode &&
      !!allowSupplierInvite;

    this.setState({
      inviteTabShowFlag,
    });
  }

  // 查询邀约信息
  @Bind()
  handleQueryInviteInfo(params = {}) {
    const { changeReqId } = this.state;
    const { enterpriseCertificationRemote } = this.props;
    const { companyIds, companyNameList, companyNames, dimensionCode } = params;
    this.inviteInfoDs.setQueryParameter('changeReqId', changeReqId);
    this.inviteInfoDs.query().then((inviteInfo = {}) => {
      if (getResponse(inviteInfo)) {
        if (isEmpty(inviteInfo)) {
          const data = {
            companyIds,
            companyName: companyNames,
            companyList: companyNameList,
            dimensionCode,
            levelTypeFlag: dimensionCode === 'COMPANY' ? 0 : 1,
            autoPartnerFlag: 1, // 供应商认证给1
          };
          const remoteData = enterpriseCertificationRemote
            ? enterpriseCertificationRemote.process(
                'SSLM_ENTERPRISE_CERTIFICATION_INVITE_INFO_DATA',
                data
              )
            : data;
          this.inviteInfoDs.loadData([remoteData]);
        } else {
          const data = {
            ...inviteInfo,
            dimensionCode,
          };
          this.inviteInfoDs.loadData([data]);
        }
      }
    });
  }

  // 查询表格配置
  @Bind()
  async handleQueryTabConfig() {
    const { stepsObj: { registPolicyConfig } = {} } = this.props;
    this.handleCreateDataSet(registPolicyConfig);
  }

  // 新建ds
  @Bind()
  handleCreateDataSet(configList = []) {
    const mainDataTab = [];
    let configNameList = [];
    // let inviteTabShowFlag = false;
    if (!isEmpty(configList)) {
      (configList || []).forEach(item => {
        const { configName } = item;
        const dsConfig = this.getDataSetConfigByConfigName(configName);
        if (dsConfig) {
          const configInfo = this.handleTabsDataSet({
            getDS: dsConfig,
            ...item,
          });
          const { dataSet } = configInfo || {};
          this.createDataSet({ configName, dataSet });
          mainDataTab.push({
            configName,
            configInfo,
          });
        } else if (configName === OTHERINFO) {
          // 其他信息页签单独处理
          const { remark } = item;
          const showFlag = this.handleShowOtherInfoTab();
          if (showFlag) {
            mainDataTab.push({
              configName,
              configInfo: {
                remark,
                dataSet: this.otherInfoDs,
              },
            });
          }
        }
      });
      configNameList = mainDataTab.map(item => {
        const { configName } = item || {};
        return configName;
      });
    }
    this.setState({
      configNameList,
      mainDataTab,
      // inviteTabShowFlag,
    });
  }

  // 获取页签ds配置
  @Bind()
  getDataSetConfigByConfigName(configName = '') {
    switch (configName) {
      case BUSSINESS:
        return getBussinessDS;
      case CONTANT:
        return getContactDS;
      case ADDRESS:
        return getAddressDS;
      case BANK_ACCOUNT:
        return getBankInfoDS;
      case INVOICE:
        return getInvoiceDS;
      case FIN:
        return getFinanceDS;
      case ATTACHMENT:
        return getAttachmentDS;
      default:
        return null;
    }
  }

  // 创建ds
  @Bind()
  createDataSet(params = {}) {
    const { configName, dataSet } = params;
    switch (configName) {
      case BUSSINESS:
        this.bussinessDs = dataSet || this.bussinessDs;
        break;
      case CONTANT:
        this.contactDs = dataSet || this.contactDs;
        break;
      case ADDRESS:
        this.addressDs = dataSet || this.addressDs;
        break;
      case BANK_ACCOUNT:
        this.bankInfoDs = dataSet || this.bankInfoDs;
        break;
      case INVOICE:
        this.invoiceDs = dataSet || this.invoiceDs;
        break;
      case FIN:
        this.financeDs = dataSet || this.financeDs;
        break;
      case ATTACHMENT:
        this.attachmentDs = dataSet || this.attachmentDs;
        break;
      default:
        break;
    }
  }

  // 处理ds
  @Bind()
  handleTabsDataSet(params = {}) {
    const { strategyCfLineList, remark, atLeastFlag, configName = '', getDS = () => {} } = params;
    const { publicData: { domesticForeignRelation } = {} } = this.state;
    const { requiredList, enableList } = this.handleFields(strategyCfLineList);
    const dataSet = new DataSet({
      ...getDS({ requiredList, enableList, domesticForeignRelation }),
    });
    const info = {
      remark,
      atLeastFlag,
      enableFieldList: enableList,
      dataSet,
      configName,
    };
    return info;
  }

  // 处理其他信息页签展示
  @Bind()
  handleShowOtherInfoTab() {
    const { custConfig = {} } = this.props;
    const notBasicTabShowFlag = isTenantLevel;
    // 个性化表单隐藏
    const otherInfoCust = custConfig['SSLM.ENTERPRISE_CERTIFICATION.SECONDARY_OTHER_INFO'] || {};
    const { fields = [] } = otherInfoCust || {};
    const emptyFlag = isEmpty(fields);
    const showFlag = !emptyFlag && notBasicTabShowFlag;
    return showFlag;
  }

  // 处理字段
  @Bind()
  handleFields(lineList = []) {
    const requiredList = [];
    const enableList = [];
    (lineList || []).forEach(item => {
      // 只传启用的字段
      const { fieldCode, requiredFlag } = item;
      const formatFieldCode = camelCase(fieldCode);
      const transformField = transformFields.find(n => n.name === formatFieldCode) || {};
      const finalFieldCode = transformField.code || formatFieldCode;
      if (requiredFlag) {
        requiredList.push(finalFieldCode);
      }
      enableList.push(finalFieldCode);
    });
    return {
      requiredList,
      enableList,
    };
  }

  /**
   *
   * @param {*} nextFlag true 下一步
   * @param {*} submitFlag true 提交
   */
  @Bind()
  async handleSaveData(nextFlag = false) {
    const {
      changeReqId,
      publicData: { partnerFlag, existFlag } = {},
      inviteTabShowFlag,
    } = this.state;

    // 二级域名注册存在已认证的公司，但是没有合作伙伴可以编辑基本，业务信息
    // 公开域名已经生成co编码的全部禁用，有合作伙伴全部页签禁用
    const allDisabled = partnerFlag === 1 || (existFlag === 1 && !isTenantLevel);
    // 页签禁用时不校验
    if (allDisabled) {
      if (nextFlag) {
        this.handleGoToNext();
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('spfm.supplierRegister.view.message.noNeedSaveData')
            .d('暂无需要保存的数据！'),
        });
      }
    } else {
      // 校验
      const inviteInfoValidateFlag = inviteTabShowFlag
        ? await this.inviteInfoDs?.current?.validate()
        : true;
      // 数据
      const inviteInfoData = this.inviteInfoDs?.current?.toJSONData() || {};
      let validateFlag = true;
      // 校验策略配置页签
      const validateList = await this.handleDynamicValidate();
      (validateList || []).forEach(flag => {
        validateFlag = validateFlag && flag;
      });
      // 处理数据
      const allValidateFlag = validateFlag && inviteInfoValidateFlag;
      if (allValidateFlag) {
        const result = this.handleDynamicData();
        const { dynamicData } = result;
        const params = {
          ...dynamicData,
          firmEnteringParent: inviteTabShowFlag ? inviteInfoData : null,
          dataSource: 4,
          sourceKey: 1,
          changeReqId,
          checkFlag: nextFlag ? 1 : 0,
        };
        return this.handleNextCheck(params, nextFlag);
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('spfm.supplierRegister.view.message.maintainInfo')
            .d('有必填信息还未维护，请按照提示维护相关信息'),
        });
      }
    }
  }

  // 动态校验
  @Bind()
  handleDynamicValidate() {
    const { configNameList = [] } = this.state;
    let promiseList = [];
    if (!isEmpty(configNameList)) {
      promiseList = (configNameList || []).map(async item => {
        if (item === BUSSINESS) {
          if (this.bussinessDs.current) {
            // 校验公司logo
            const currentRecord = this.bussinessDs.current;
            const logoUrlField = this.bussinessDs.getField('logoUrl', currentRecord);
            const logoUrlValidateFlag = await logoUrlField.checkValidity(currentRecord);
            if (!logoUrlValidateFlag) {
              notification.error({
                placement: 'bottomRight',
                message: intl
                  .get('spfm.supplierRegister.view.title.companyLogoNotNull')
                  .d('请上传公司logo'),
              });
            }
            return Promise.resolve(this.bussinessDs.current.validate());
          }
          return Promise.resolve(true);
        } else if (item === BANK_ACCOUNT) {
          return Promise.resolve(this.bankInfoDs.validate());
        } else if (item === CONTANT) {
          return Promise.resolve(this.contactDs.validate());
        } else if (item === ADDRESS) {
          return Promise.resolve(this.addressDs.validate());
        } else if (item === INVOICE) {
          if (this.invoiceDs.current) {
            return Promise.resolve(this.invoiceDs.current.validate(true));
          }
          return Promise.resolve(true);
        } else if (item === FIN) {
          return Promise.resolve(this.financeDs.validate());
        } else if (item === ATTACHMENT) {
          return Promise.resolve(this.attachmentDs.validate());
        } else if (item === OTHERINFO) {
          return Promise.resolve(
            this.otherInfoDs.current ? this.otherInfoDs.current.validate(true) : true
          );
        } else {
          return Promise.resolve(true);
        }
      });
    }
    return Promise.all(promiseList);
  }

  // 获取动态表格数据
  @Bind()
  handleDynamicData() {
    const { configNameList = [] } = this.state;
    const data = {};
    const bankRes = true;
    const contactRes = true;
    (configNameList || []).forEach(item => {
      if (item === BUSSINESS) {
        let bussinessData = {};
        if (this.bussinessInfoRef) {
          bussinessData = this.bussinessInfoRef.handleBussinessData();
        }
        data.comBusinessReqDTO = bussinessData;
      } else if (item === BANK_ACCOUNT) {
        const bankData = this.bankInfoDs.toJSONData();
        data.comBankAccReqs = bankData;
      } else if (item === CONTANT) {
        const contactData = this.contactDs.toData();
        data.comContactsReqs = contactData;
      } else if (item === ADDRESS) {
        const addressData = this.addressDs.toJSONData();
        data.comAddressReqs = addressData;
      } else if (item === INVOICE) {
        const invoiceData = this.invoiceDs?.current?.toJSONData() || {};
        data.invoiceReq = invoiceData;
      } else if (item === FIN) {
        const financeData = this.handleFinanceData();
        data.financeReqs = financeData;
      } else if (item === ATTACHMENT) {
        const attachmentData = this.attachmentDs.toJSONData();
        data.comAttachmentReqs = attachmentData;
      } else if (item === OTHERINFO) {
        const otherInfoData = this.otherInfoDs?.current?.toJSONData() || {};
        data.supChangeOther = otherInfoData;
      }
    });
    const payload = {
      contactRes,
      bankRes,
      dynamicData: data,
    };
    return payload;
  }

  // 查询数据
  @Bind()
  handleQueryAll() {
    const { configNameList = [] } = this.state;
    this.handleQueryFixTab();
    (configNameList || []).forEach(item => {
      if (this.bussinessInfoRef && item === BUSSINESS) {
        this.bussinessInfoRef.handleQueryBussiness();
      } else if (item === BANK_ACCOUNT) {
        this.bankInfoDs.query();
      } else if (item === CONTANT) {
        if (this.contactRef && this.contactRef.current) {
          this.contactRef.current.handleQueryContact(true);
        }
      } else if (item === ADDRESS) {
        if (this.addressRef && this.addressRef.current) {
          this.addressRef.current.handleQueryAddress();
        }
      } else if (item === INVOICE) {
        this.invoiceDs.query();
      } else if (item === FIN) {
        this.financeDs.query();
      } else if (item === ATTACHMENT) {
        this.attachmentDs.query();
      } else if (item === OTHERINFO) {
        this.otherInfoDs.query();
      }
    });
  }

  // 查询固定页签
  @Bind()
  handleQueryFixTab(initFlag = false) {
    const { inviteTabShowFlag } = this.state;
    if (inviteTabShowFlag) {
      this.inviteInfoDs.query();
    }
    // 查询标准页签
    if (initFlag) {
      // 重置state
      this.setState(
        {
          configNameList: [], // 展示页签
          mainDataTab: [], // 主数据页签字段
          allInfo: {}, // 所有信息
          userInfo: {}, // 用户子账户
          publicData: {}, // 公共数据
        },
        () => {
          this.handleQueryAllInfo();
        }
      );
    }
  }

  /**
   * 处理财务信息
   * @param {*} financeData 数据
   * @returns
   */
  @Bind()
  handleFinanceData() {
    const financeData = this.financeDs.toJSONData();
    // 处理语言环境切换
    const newFinanceData = financeData.map(n => {
      const {
        totalAssets,
        totalLiabilities,
        currentAssets,
        currentLiabilities,
        revenue,
        netProfit,
      } = n;
      const obj = {
        totalAssets: language === 'en_US' ? totalAssets * 100 : totalAssets,
        totalLiabilities: language === 'en_US' ? totalLiabilities * 100 : totalLiabilities,
        currentAssets: language === 'en_US' ? currentAssets * 100 : currentAssets,
        currentLiabilities: language === 'en_US' ? currentLiabilities * 100 : currentLiabilities,
        revenue: language === 'en_US' ? revenue * 100 : revenue,
        netProfit: language === 'en_US' ? netProfit * 100 : netProfit,
      };
      return {
        ...n,
        ...obj,
      };
    });
    return newFinanceData;
  }

  /**
   * 处理下一步校验校验
   */
  @Bind()
  handleNextCheck(params = {}, nextFlag = false) {
    if (nextFlag) {
      // 先校验是否更换调查表
      const { comBusinessReqDTO = {}, changeReqId, firmEnteringParent } = params;
      const payload = {
        changeReqId,
        comBusinessReqDTO,
        firmEnteringParent,
      };
      this.setState({
        otherLoading: true,
      });
      return checkChangeInvestigate(payload)
        .then(res => {
          if (getResponse(res)) {
            const { changeFlag, addConfigNameFlag } = res;
            // changeFlag 调查表切换，true 需要提示; addConfigNameFlag true 平台页签增加刷新当前页签，false 下一步
            // 调查表一开始就没有，下一步不弹窗提示直接到下一个页面
            if (!changeFlag) {
              return this.saveData(params, nextFlag, false);
            } else {
              // addConfigNameFlag true 平台页签增加刷新当前页签，false 下一步
              Modal.confirm({
                title: intl.get('hzero.common.message.confirm.title').d('提示'),
                children: addConfigNameFlag
                  ? intl
                      .get('spfm.enterpriseCertification.view.title.platformTabAddTips')
                      .d(
                        '您修改了某些企业信息，采购方需要您填写的调查表内容有变更，现在需要为您切换或取消补充调查表。我们将会自动保存您在当前页面填写完成的信息，并刷新当前页面。刷新后对您需填写的内容要求可能会有变化，请根据最新的采购方要求更新您的企业信息。若无需更新，继续进行下一步即可。'
                      )
                  : intl
                      .get('spfm.enterpriseCertification.view.title.platformTabNotAddTips')
                      .d(
                        '您修改了部分企业信息，采购方需要您填写的调查表内容有变更，现在需要为您切换或取消补充调查表，请确认。'
                      ),
                onOk: () => {
                  return this.saveData(params, nextFlag, addConfigNameFlag);
                },
              });
            }
          }
        })
        .finally(() => {
          this.setState({
            otherLoading: false,
          });
        });
    } else {
      return this.saveData(params, nextFlag);
    }
  }

  /**
   * 保存
   * @param {*} params 保存数据
   * @param {*} nextFlag true 下一步
   * @param {*} investigateChange true 调查表更换
   */
  @Bind()
  saveData(params = {}, nextFlag = false, investigateChange = false) {
    const payload = {
      ...params,
      customizeUnitCode: [
        'SSLM.ENTERPRISE_CERTIFICATION.SECONDARY_OTHER_INFO',
        'SSLM.ENTERPRISE_CERTIFICATION.INVIT_INFO',
      ].join(),
    };
    this.setState({
      saveLoading: true,
    });
    return new Promise(resolve => {
      saveSecondaryInfo(payload)
        .then(res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            if (nextFlag) {
              if (investigateChange) {
                // 调查表更换初始化数据
                this.handleQueryFixTab(true);
              } else {
                this.handleGoToNext();
              }
            } else {
              // 查询
              this.handleQueryAll();
            }
          }
        })
        .finally(() => {
          this.setState({
            saveLoading: false,
          });
          resolve();
        });
    });
  }

  @Bind()
  handlePrevious() {
    const { history } = this.props;
    const { publicData: { domesticForeignRelation, changeReqId = '' } = {} } = this.state;
    history.push({
      pathname: `/sslm/enterprise-certification/main-info`,
      search: querystring.stringify({
        domesticForeignRelation,
        changeReqId,
      }),
    });
  }

  @Bind()
  handleNext() {
    // 保存
    this.handleSaveData(true);
  }

  @Bind()
  handleGoToNext() {
    const { history } = this.props;
    const { hostname } = window.location;
    const { publicData: { domesticForeignRelation = 1 } = {}, changeReqId } = this.state;
    // 跳转管理员申请
    const goToApplyFlag = !isTenantLevel;
    if (goToApplyFlag) {
      history.push({
        pathname: `/sslm/enterprise-certification/apply-manager`,
        search: querystring.stringify({
          changeReqId,
        }),
      });
    } else {
      // src-9399 二级域名注册跳转调查表时需要重新查webur接口，因为会在次要信息保存重新发布调查表。
      this.setState({
        preLoading: true,
      });
      fetchPublicData(hostname)
        .then(res => {
          if (getResponse(res)) {
            const {
              investgHeaderId: newInvestgHeaderId = '',
              investigateTemplateId: newInvestigateTemplateId = '',
            } = res;
            // 跳转调查表页面
            const goToInvestgFlag = !!newInvestgHeaderId && isTenantLevel;
            if (goToInvestgFlag) {
              history.push({
                pathname: `/sslm/enterprise-certification/investigation`,
                search: querystring.stringify({
                  changeReqId,
                  investgHeaderId: newInvestgHeaderId,
                  investigateTemplateId: newInvestigateTemplateId,
                  organizationId,
                }),
              });
            } else {
              // 跳转预览页
              history.push({
                pathname: `/sslm/enterprise-certification/preview`,
                search: querystring.stringify({
                  changeReqId,
                  domesticForeignRelation,
                  source: 'secondaryInfo',
                }),
              });
            }
          }
        })
        .finally(() => {
          this.setState({
            preLoading: false,
          });
        });
    }
  }

  @Bind()
  handleQueryLoading(flag = false) {
    this.setState({
      otherLoading: flag,
    });
  }

  render() {
    const {
      isEdit: editFlag,
      mainDataTab = [],
      changeReqId,
      allInfo,
      userInfo,
      defaultCountryInfo,
      configNameList = [],
      preLoading,
      saveLoading,
      isPreview,
      publicData: { strategyCfBasic = {}, partnerFlag, existFlag } = {},
      publicData,
      otherLoading,
      inviteTabShowFlag,
    } = this.state;
    const { location, stepsObj, remoteHiddenTips = false, customizeForm = () => {} } = this.props;
    const { strategyCfBasicId, dimensionCode } = strategyCfBasic;
    // 二级域名注册的已经生成co编码，业务信息禁用
    // 公开域名已经生成co编码的全部禁用或者有合作伙伴全部页签禁用
    const allDisabled = partnerFlag === 1 || (existFlag === 1 && !isTenantLevel);
    const isEdit = editFlag && !isPreview && !allDisabled;

    const loading = preLoading || saveLoading || otherLoading;

    // 平台级公网域名注册，展示所有页签
    const showAllTab = !strategyCfBasicId;

    const commonProps = {
      customizeForm,
      changeReqId,
      isEdit,
      allInfo,
      showAllTab,
      publicData,
      remoteHiddenTips,
      handleQueryLoading: this.handleQueryLoading,
    };

    const componentProps = {
      [BUSSINESS]: {
        onRef: ref => {
          this.bussinessInfoRef = ref;
        },
      },
      [CONTANT]: {
        userInfo,
        ref: this.contactRef,
      },
      [ADDRESS]: {
        defaultCountryInfo,
        ref: this.addressRef,
      },
      [BANK_ACCOUNT]: {
        defaultCountryInfo,
        isTenantLevel,
      },
      [INVOICE]: {
        userInfo,
      },
      [FIN]: {},
      [ATTACHMENT]: {},
      [OTHERINFO]: {
        customizeForm,
      },
    };

    const inviteInfoProps = {
      dataSet: this.inviteInfoDs,
      dimensionCode,
      ...commonProps,
    };

    const secondList = linkList({ configNameList }).filter(
      item => configNameList.includes(item.key) || item.show === 'always'
    );

    return (
      <React.Fragment>
        {!isPreview && (
          <Header
            title={intl
              .get('spfm.enterpriseCertification.view.title.enterpriseCertification')
              .d('企业认证')}
          >
            <Button
              icon="arrow_forward"
              color="primary"
              type="primary"
              onClick={this.handleNext}
              loading={loading}
              wait={200}
              waitType="debounce"
            >
              {intl.get('sslm.common.view.btn.nextStep').d('下一步')}
            </Button>
            <Button
              icon="arrow_back"
              funcType="flat"
              onClick={this.handlePrevious}
              loading={loading}
              wait={200}
              waitType="debounce"
            >
              {intl.get('sslm.common.view.btn.lastStep').d('上一步')}
            </Button>
            <Button
              icon="save"
              funcType="flat"
              onClick={() => this.handleSaveData()}
              loading={loading}
              wait={200}
              waitType="debounce"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Header>
        )}
        {!isPreview && (
          <ValidationSteps location={location} stepsObj={{ ...stepsObj, ...publicData }} />
        )}
        <Content className={styles['secondary-index-content']}>
          <div id="enterpriseCertificationAnchor">
            <Spin spinning={loading}>
              {getCardList({ renderTabList: mainDataTab }).map(p => {
                const { component: Com, configName, configInfo = {} } = p;
                const { dataSet } = configInfo;
                const configKey = getConfigKeyByconfigName(configName);
                const comProps = {
                  ...componentProps[configName],
                  ...commonProps,
                  [configKey]: configInfo,
                  dataSet,
                };
                return <Com {...comProps} />;
              })}
              {inviteTabShowFlag && <InviteInfo {...inviteInfoProps} />}
            </Spin>
          </div>
        </Content>
        <PositionAnchor
          getContainer={() => document.getElementById('enterpriseCertificationAnchor')}
        >
          {secondList.map(link => (
            <Link href={`#${link.key}`} title={link.title} />
          ))}
        </PositionAnchor>
      </React.Fragment>
    );
  }
}
