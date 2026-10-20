/*
 * SimplifiedRegister - 简化供应商注册-编辑页
 * @date: 2020/11/09 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Button,
  notification,
  Modal,
  ModalProvider,
  useModal,
  Form,
  TextArea,
} from 'choerodon-ui/pro';
import { Steps, Card, Spin, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, isBoolean, round } from 'lodash';
import intl from 'utils/intl';
import querystring from 'querystring';
import { routerRedux } from 'dva/router';

import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import {
  getResponse,
  getCurrentLanguage,
} from 'utils/utils';
import cacheComponent from 'components/CacheComponent';
import PositionAnchor from '_components/PositionAnchor';

import { getLegalDS } from './stores/legalDS';
import { bussinessDS } from './stores/bussinessDS';
import { contactDS } from './stores/contactDS';
import { addressDS, bankInfoDS, invoiceDS, financeDS, attachmentDS } from './stores/otherDS';

import LegalInfo from './LegalInfo';
import SecondaryInfo from './SecondaryInfo';
import { getErrorMsg, openChangeCompanyModal } from './utils';

import { saveLegalInfo } from '@/services/legalService';

import { submitApproval } from '@/services/attachmentService';
import {
  fetchPortal,
  fetchUserDetail,
  fetchSettings,
} from '@/services/simplifiedRegisterService';
import { checkBankAccount, checkBankAccountCommon } from '@/services/enterpriseService';

import { saveSecondDaryInfo } from '@/services/secondaryInfoServices';

import styles from './index.less';

const { Link } = PositionAnchor;
const { Step } = Steps;
const language = getCurrentLanguage();

/**
 * 简化供应商注册
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
@formatterCollections({
  code: [
    'spfm.supplierRegister',
    'spfm.enterprise',
    'hpfm.enterprise',
    'spfm.approval',
    'spfm.business',
    'hptl.portalAssign',
    'spfm.certificationApproval',
    'spfm.supplierManage',
    'spfm.contactPerson',
    'spfm.address',
    'spfm.bank',
    'spfm.finance',
    'spfm.attachment',
    'spfm.common',
    'entity.attachment',
    'sslm.common',
  ],
})
@cacheComponent({ cacheKey: '/spfm/simplified-register/main-info' })
export default class EditPage extends Component {
  constructor(props) {
    super(props);
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { domesticFlag: domestic, ocrFlag: ocr } = routerParam;
    // domesticFlag true(境内和个人注册) false(境外注册)
    const domesticFlag = Number(domestic);
    // 个人注册
    const personalFlag = domesticFlag === 2;
    // 平台征信配置是否开启OCR识别
    const ocrFlag = Number(ocr);
    this.state = {
      isEdit: true,
      currentStep: 0,
      pageLoading: false,
      otherLoading: false,
      domesticFlag: !!domesticFlag,
      personalFlag,
      ocrFlag,
      // manualFlag: !!Number(manualFlag),
      companyId: '',
      mustCompanyTabs: [],
      userInfo: {},
      defaultBankInfo: {},
      appealFlag: null,
      processStatus: null,
      showAppealBtn: false, // 是否显示申诉按钮
      textSearchFlag: true, // 开启模糊匹配企业
    };
  }

  formDs = new DataSet({
    autoCreate: true,
    autoQuery: false,
    fields: [
      {
        name: 'appealReason',
        type: 'string',
        label: intl.get('spfm.supplierRegister.model.view.appealReasonB').d('申诉原因'),
        required: true,
      },
    ],
  });

  componentDidMount() {
    const { domesticFlag, personalFlag } = this.state;
    // 查询门户管理配置
    const { hostname } = window.location;
    fetchPortal({ domainName: hostname }).then((resp) => {
      if (getResponse(resp)) {
        let invoiceRequired = false;
        if (resp && !isEmpty(resp.content)) {
          const config = resp.content[0];
          const { mustCompanyTabs } = config || {};
          // 处理配置开票信息必填
          const companyTabList = (mustCompanyTabs || '').split(',') || [];
          const invoiceFlag = companyTabList.includes('INVOICE');
          invoiceRequired = invoiceFlag && domesticFlag !== 2;
          if (mustCompanyTabs) {
            this.setState({
              mustCompanyTabs: companyTabList,
            });
          }
        }
        if (this.invoiceDS) {
          [
            'depositBank',
            'bankAccountNum',
            'taxRegistrationAddress',
            'taxRegistrationPhone',
            'receiveMail',
            'internationalTelCode',
            'receivePhone',
          ].forEach((n) => {
            (this.invoiceDS.getField(n) || {}).set('required', invoiceRequired);
          });
        }
      }
    });
    // 查询用户信息，处理带值
    fetchUserDetail().then((user) => {
      if (getResponse(user)) {
        this.setState({
          userInfo: user,
        });
      }
    });
    // 查询平台征信配置，取配置5
    this.platformCreditConfig();
    this.bussinessDS.setState('personalFlag', personalFlag);
  }

  // 查询平台征信配置
  @Bind()
  platformCreditConfig() {
    fetchSettings().then((response) => {
      const res = getResponse(response);
      if (res) {
        this.setState({
          textSearchFlag: res['000108'] === '1',
        });
      }
    });
  }

  legalDS = new DataSet({
    ...getLegalDS(),
  });

  bussinessDS = new DataSet({
    ...bussinessDS(),
  });

  contactDS = new DataSet({
    ...contactDS(),
  });

  addressDS = new DataSet({
    ...addressDS(),
  });

  bankInfoDS = new DataSet({
    ...bankInfoDS(),
  });

  financeDS = new DataSet({
    ...financeDS(),
  });

  invoiceDS = new DataSet({
    ...invoiceDS(),
  });

  attachmentDS = new DataSet({
    ...attachmentDS(),
  });

  @Bind()
  handleUpdateState(state = {}) {
    this.setState({
      ...state,
    });
  }

  @Bind()
  handlePrevious() {
    this.handleStepChange(false);
  }

  // 处理阶段切换渲染 nextFlag true下一步 false 上一步
  @Bind()
  handleStepChange(nextFlag = true) {
    const { currentStep } = this.state;
    const nextStep = nextFlag ? currentStep + 1 : currentStep - 1;
    this.setState({
      currentStep: nextStep,
    });
  }

  // 保存主要信息报错提示
  @Bind()
  handleSaveMainInfoErrorInfo(resp) {
    if (resp) {
      // 是否需要前端弹窗提示报错
      const errorFieldName = getErrorMsg(resp.code);
      if (errorFieldName) {
        // 弹窗提示
        this.openErrorMsgModal(errorFieldName);
      } else {
        // 其他报错正常抛出
        getResponse(resp);
      }
    }
  }

  // 弹窗提示报错信息
  @Bind()
  openErrorMsgModal(fieldName = '') {
    const params = {
      fieldName,
      callBack: () => {
        if (this.legalInfoForm) {
          this.legalInfoForm.handleQueryLegalInfo();
        }
      },
    };
    openChangeCompanyModal(params);
  }

  @Bind()
  async handleSaveLegalInfo(nextFlag) {
    if (this.legalDS.dirty) {
      const currentRecord = this.legalDS.current;
      const licenceUrlField = this.legalDS.getField('licenceUrl', currentRecord);
      const licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);

      // 校验个人注册身份证附件
      const idFrontField = this.legalDS.getField('idFrontUuid', currentRecord);
      const idFrontValidateFlag = await idFrontField.checkValidity(currentRecord);
      const idBackField = this.legalDS.getField('idBackUuid', currentRecord);
      const idBackValidateFlag = await idBackField.checkValidity(currentRecord);

      const validateFlag = await this.legalDS.current.validate();
      if (validateFlag) {
        this.setState({
          pageLoading: true,
        });
        const data = this.legalDS.current.toJSONData();
        let payload = {};
        const { currencyObj, registeredCountryObj, registeredCapital, ...other } = data;
        payload = {
          ...other,
          businessRegistrationNumber:
            data.domesticForeignRelation === '0' ? data.businessRegistrationNumber : null,
          registeredCapital:
            language === 'en_US'
              ? registeredCapital
                ? round(registeredCapital * 100, 6)
                : registeredCapital
              : registeredCapital,
        };
        if (payload.domesticForeignRelation === '0') {
          const {
            unifiedSocialCode,
            companyType,
            taxpayerType,
            licenceEndDate,
            longTermFlag,
            institutionalType,
            idType,
            idNum,
            passport,
            email,
            internationalTelCode,
            phone,
            idFrontUuid,
            idBackUuid,
            ...otherFieldValues
          } = payload;
          payload = otherFieldValues;
        }
        if (payload.domesticForeignRelation === '1') {
          const {
            businessRegistrationNumber,
            idType,
            idNum,
            passport,
            email,
            internationalTelCode,
            phone,
            idFrontUuid,
            idBackUuid,
            ...otherFieldValues
          } = payload;
          payload = otherFieldValues;
        }
        if (payload.domesticForeignRelation === '2') {
          const {
            unifiedSocialCode,
            companyType,
            taxpayerType,
            institutionalType,
            organizingInstitutionCode,
            dunsCode,
            businessRegistrationNumber,
            licenceUrl,
            ...otherFieldValues
          } = payload;
          payload = otherFieldValues;
        }
        if (isEmpty(payload.dunsCode)) {
          payload.dunsCode = null;
        }
        if (isEmpty(payload.organizingInstitutionCode)) {
          payload.organizingInstitutionCode = null;
        }
        saveLegalInfo(payload)
          .then((res) => {
            // 处理报错 接口报错会进 handleSaveMainInfoErrorInfo方法
            const result = getResponse(res, this.handleSaveMainInfoErrorInfo);
            if (result) {
              const { companyId } = res;
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              this.setState(
                {
                  pageLoading: false,
                  companyId,
                },
                // 新认证供应商时，companyId更新之后再做后续操作
                () => {
                  if (this.legalInfoForm) {
                    this.legalInfoForm.handleQueryLegalInfo();
                  }
                  if (nextFlag) {
                    // 下一步
                    this.handleStepChange(true);
                  }
                }
              );
            }
          })
          .finally(() => {
            this.handleUpdateState({
              pageLoading: false,
            });
          });
      } else if (!licenceUrlValidateFlag) {
        notification.error({
          placement: 'bottomRight',
          message: intl
            .get('spfm.enterprise.view.message.upload.businessLicense')
            .d('请上传营业执照'),
        });
      } else if (!idFrontValidateFlag || !idBackValidateFlag) {
        notification.error({
          placement: 'bottomRight',
          message: intl
            .get('spfm.enterprise.view.message.upload.identityDocument')
            .d('请上传身份证件'),
        });
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('spfm.supplierRegister.view.message.maintainInfo')
            .d('请维护相关信息！'),
        });
      }
    } else if (nextFlag) {
      // 下一步
      this.handleStepChange(true);
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('spfm.supplierRegister.view.message.noNeedSaveData')
          .d('暂无需要保存的数据！'),
      });
    }
  }

  @Bind()
  handleSecondaryDataDirty() {
    const secondaryInfoData =
      (this.secondaryInfo && this.secondaryInfo.handleSaveSecondaryData()) || {};
    const { bussinessData = {} } = secondaryInfoData;
    // 校验数据合法
    const bussinessUpdateFlag = this.bussinessDS.dirty && !isEmpty(bussinessData);
    const contactUpdateFlag = this.contactDS.dirty;
    const addressUpdateFlag = this.addressDS.dirty;
    const bankUpdateFlag = this.bankInfoDS.dirty;
    const invoiceUpdateFlag = this.invoiceDS.dirty;
    const financeUpdateFlag = this.financeDS.dirty;
    const attachmentUpdateFlag = this.attachmentDS.dirty;

    return (
      bussinessUpdateFlag ||
      contactUpdateFlag ||
      addressUpdateFlag ||
      bankUpdateFlag ||
      invoiceUpdateFlag ||
      financeUpdateFlag ||
      attachmentUpdateFlag
    );
  }

  @Bind()
  async handleSaveSecondaryInfo(nextFlag = false) {
    const { companyId } = this.state;
    if (this.secondaryInfo) {
      const { hostname: domainName } = window.location;

      const secondaryInfoData = (await this.secondaryInfo.handleSaveSecondaryData()) || {};
      const { bussinessData = {} } = secondaryInfoData;
      // 校验数据合法
      const dirtyFlag = this.handleSecondaryDataDirty();
      if (dirtyFlag) {
        const bussinessValidateFlag = this.bussinessDS.current
          ? await this.bussinessDS.current.validate()
          : true;
        const contactValidateFlag = await this.contactDS.validate();
        const addressValidateFlag = await this.addressDS.validate();
        const bankValidateFlag = await this.bankInfoDS.validate();
        const invoiceValidateFlag = this.invoiceDS.current
          ? await this.invoiceDS.current.validate()
          : true;
        const financeValidateFlag = await this.financeDS.validate();
        const attachmentValidateFlag = await this.attachmentDS.validate();
        if (
          bussinessValidateFlag &&
          contactValidateFlag &&
          addressValidateFlag &&
          bankValidateFlag &&
          invoiceValidateFlag &&
          financeValidateFlag &&
          attachmentValidateFlag
        ) {
          const contactData = this.contactDS.toData();
          const addressData = this.addressDS.toJSONData();
          const bankData = this.bankInfoDS.toJSONData();
          const financeData = this.financeDS.toJSONData();
          const attachmentData = this.attachmentDS.toData();
          const invoiceData = this.invoiceDS.current ? this.invoiceDS.current.toJSONData() : {};

          // 处理语言环境切换
          const newFinanceData = financeData.map((n) => {
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
              currentLiabilities:
                language === 'en_US' ? currentLiabilities * 100 : currentLiabilities,
              revenue: language === 'en_US' ? revenue * 100 : revenue,
              netProfit: language === 'en_US' ? netProfit * 100 : netProfit,
            };
            return {
              ...n,
              ...obj,
            };
          });
          // 校验启用的默认联系人只能有一个
            const enabledData = contactData.filter((e) => e.enabledFlag);
            if(!isEmpty(enabledData)){
              // 启用行的默认标识
              const enabledDataDefaultFlag = enabledData.filter(e => e.defaultFlag).length !== 1;
              // 所有行的默认标识
              const allDataDefaultFlag = contactData.filter(e => e.defaultFlag).length !== 1;
              if(enabledDataDefaultFlag || allDataDefaultFlag){
                notification.warning({
                  placement: 'bottomRight',
                  message: intl
                    .get('spfm.contactPerson.model.contactPerson.onlyDefault')
                    .d('公司默认联系人必须有且仅有一个,请及时修改'),
                });
                return;
              }
            }
          // 校验启用的银行账号只能有一个主账号
          if (bankData.length > 0) {
            // 所有行主数据标识
            const allDataMasterFlag = bankData.filter((b) => b.masterFlag).length !==1;
            const enabledData = bankData.filter((item) => item.enabledFlag);
            // 启用行主数据标识
            const enabledDataMasterFlag = enabledData.filter((b) => b.masterFlag).length !==1;
            if (!isEmpty(enabledData)) {
              if (allDataMasterFlag || enabledDataMasterFlag) {
                notification.warning({
                  placement: 'bottomRight',
                  message: intl
                    .get(`spfm.bank.view.message.warn.onlyMasterFlag`)
                    .d('必须有且仅有一条银行主账户信息'),
                });
                return;
              }
            }
          }
          this.handleUpdateState({
            pageLoading: true,
          });
          saveSecondDaryInfo({
            companyId,
            domainName,
            onlySaveFlag: !nextFlag,
            companyBusinessVO: bussinessData,
            companyContactList: contactData,
            companyAddressList: addressData,
            companyBankAccountList: bankData,
            companyFinanceList: newFinanceData,
            companyAttachmentList: attachmentData,
            companyInvoice: { ...invoiceData, companyId },
          }).then((res) => {
            const resulet = getResponse(res);
            if (resulet) {
              // 查询业务
              this.secondaryInfo.handleQuerySecondaryData();
              // 查询联系人信息
              this.contactDS.query();
              // 查询地址信息
              this.addressDS.query();
              // 查询银行信息
              this.bankInfoDS.query();
              // 查询开票信息
              this.secondaryInfo.handleQuerySecondaryData(false);
              // 查询财务信息
              this.financeDS.query();
              // 查询附件信息
              this.attachmentDS.query();
              notification.success({
                placement: 'bottomRight',
                message: intl.get('hzero.common.notification.success').d('操作成功'),
              });
              if (nextFlag) {
                // 下一步
                this.handleStepChange(true);
              }
            }
          });

          this.handleUpdateState({
            pageLoading: false,
          });
        } else {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('spfm.supplierRegister.view.message.maintainInfo')
              .d('有必填信息还未维护，请按照提示维护相关信息'),
          });
        }
      } else if (nextFlag) {
        // 下一步
        this.handleStepChange(true);
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('spfm.supplierRegister.view.message.noNeedSaveData')
            .d('暂无需要保存的数据！'),
        });
      }
    }
  }

  @Bind()
  handleSave(nextFlag = false) {
    const { currentStep } = this.state;
    // 分条件保存
    if (currentStep === 0) {
      // 保存主要信息
      this.handleSaveLegalInfo(nextFlag);
    } else if (currentStep === 1) {
      // 保存次要信息
      this.handleSaveSecondaryInfo(nextFlag);
    }
  }

  @Bind()
  handleNext(nextFlag = false) {
    const { isEdit } = this.state;
    // if (nextFlag === false) {
    //   this.handleSave(nextFlag);
    // } else
    if (isEdit) {
      this.handleSave(nextFlag);
    } else {
      this.handleStepChange(true);
    }
  }

  @Bind()
  async handleCheckSubmit(param = null) {
    const { companyId } = this.state;
    const bankData = this.bankInfoDS.toJSONData();
    // 校验银行信息账户名称
    if (bankData.length > 0) {
      this.handleUpdateState({
        pageLoading: true,
      });
      let bankDataFlag = true;
      const bankCheckResult = await checkBankAccountCommon({ companyId });
      if (getResponse(bankCheckResult)) {
        const { bankDataFlag: curBankDataFlag = true } = bankCheckResult;
        bankDataFlag = curBankDataFlag;
      }
      await checkBankAccount({ companyId })
        .then((res) => {
          if (isBoolean(res)) {
            if (!res || !bankDataFlag) {
              const bankDataMsg = !bankDataFlag
                ? intl
                    .get('spfm.enterprise.view.message.bankDuplicateToolTips')
                    .d('存在银行账户重复的数据，请检查数据，确认是否继续提交！')
                : '';
              const bankNameMsg = !res
                ? intl
                    .get('spfm.enterprise.view.message.bankToolTips')
                    .d('银行账户名称与公司名称不一致，请确认是否继续提交！')
                : '';
              Modal.confirm({
                title: (
                  <Fragment>
                    <div>{bankDataMsg}</div>
                    <div>{bankNameMsg}</div>
                  </Fragment>
                ),
                onOk: () => {
                  this.handleSubmit(param);
                },
              });
            } else {
              this.handleSubmit(param);
            }
            this.handleUpdateState({
              pageLoading: false,
            });
          } else {
            getResponse(res);
          }
        })
        .finally(() => {
          this.handleUpdateState({
            pageLoading: false,
          });
        });
    } else {
      this.handleSubmit(param);
    }
  }

  @Bind()
  handleSubmit(param = null) {
    const { companyId } = this.state;
    const { dispatch } = this.props;
    const { hostname } = window.location;
    this.handleUpdateState({
      pageLoading: true,
    });
    submitApproval({
      companyId,
      domainName: hostname,
      bodyParams: { appealReason: param, isAppeal: param ? 1 : 0 },
    })
      .then((res) => {
        if (res && res.failed) {
          // 报错了显示出申诉按钮
          if (res.code === 'authentication.failed.notknown.firm') {
            this.setState({ showAppealBtn: true });
          }
          throw res;
        } else if (getResponse(res)) {
          this.handleUpdateState({
            pageLoading: false,
          });
          dispatch(
            routerRedux.push({
              pathname: `/spfm/simplified-register/result`,
              search: querystring.stringify({
                companyId,
              }),
            })
          );
        }
      })
      .catch((e) => {
        notification.error({ description: e.message });
      })
      .finally(() => {
        this.handleUpdateState({
          pageLoading: false,
        });
      });
  }

  @Bind()
  handSaveData(data) {
    this.setState({
      appealFlag: data.basic && data.basic.appealFlag,
      processStatus: data.action && data.action.processStatus,
    });
  }

  render() {
    const {
      isEdit,
      currentStep,
      pageLoading,
      otherLoading,
      domesticFlag,
      companyId,
      personalFlag,
      mustCompanyTabs,
      userInfo,
      defaultBankInfo,
      appealFlag,
      processStatus,
      showAppealBtn,
      ocrFlag,
      textSearchFlag,
    } = this.state;
    const submitVisable = currentStep === 2 && isEdit;
    const nextVisable = currentStep !== 2;
    const previousVisable = currentStep !== 0;
    const saveVisable = currentStep !== 2 && isEdit;

    const previousProps =
      !submitVisable && currentStep === 2
        ? {
            type: 'primary',
            color: 'primary',
            funcType: 'raised',
          }
        : {};

    const loading = pageLoading || otherLoading;

    const legalProps = {
      ocrFlag,
      domesticFlag,
      personalFlag,
      dataSet: this.legalDS,
      textSearchFlag,
      handleUpdateState: this.handleUpdateState,
    };
    const secondaryProps = {
      bussinessDS: this.bussinessDS,
      contactDS: this.contactDS,
      addressDS: this.addressDS,
      bankInfoDS: this.bankInfoDS,
      invoiceDS: this.invoiceDS,
      financeDS: this.financeDS,
      attachmentDS: this.attachmentDS,
      legalDS: this.legalDS,
      companyId,
      domesticFlag,
      personalFlag,
      mustCompanyTabs,
      userInfo,
      defaultBankInfo,
      nextVisable,
      handSaveData: this.handSaveData,
      handleUpdateState: this.handleUpdateState,
    };
    const legalInfo = (
      <Content>
        <Card id="regInfo" className={styles['simplified-card-title']} bordered={false}>
          <div>{intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息')}</div>
          <span style={{ display: nextVisable ? 'block' : 'none' }}>
            {domesticFlag
              ? intl
                  .get('spfm.supplierRegister.view.message.domesticInfo')
                  .d(
                    '在国家工商行政管理总局登记过的企业，可上传营业执照并通过OCR识别快速录入信息。'
                  )
              : intl
                  .get('spfm.supplierRegister.view.message.foreignInfo')
                  .d(
                    '境外认证的企业需要手工录入信息，商业注册登记号、组织机构代码、邓白氏编码至少填写一项。'
                  )}
          </span>
          <LegalInfo
            onRef={(ref) => {
              this.legalInfoForm = ref;
            }}
            {...legalProps}
            readOnly={currentStep === 2}
          />
        </Card>
      </Content>
    );
    const secondaryInfo = (
      <SecondaryInfo
        isEdit={currentStep === 2 ? false : isEdit}
        onRef={(ref) => {
          this.secondaryInfo = ref;
        }}
        {...secondaryProps}
      />
    );
    const linkList = [
      !nextVisable && {
        key: 'regInfo',
        title: intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息'),
      },
      {
        key: 'businessInfo',
        title: intl.get('spfm.business.view.message.title').d('基础业务信息'),
      },
      {
        key: 'contactInfo',
        title: intl.get('spfm.supplierRegister.view.title.contactInfo').d('联系人'),
      },
      {
        key: 'addressInfo',
        title: intl.get(`spfm.enterprise.view.message.page.addressInfo`).d('地址信息'),
      },
      {
        key: 'bankInfo',
        title: intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息'),
      },
      {
        key: 'invoiceInfo',
        title: intl.get('spfm.enterprise.view.message.page.invoiceInfo').d('开票信息'),
      },
      {
        key: 'financeInfo',
        title: intl.get('spfm.enterprise.view.message.page.financeInfo').d('财务信息'),
      },
      {
        key: 'attachmentInfo',
        title: intl.get(`spfm.supplierRegister.view.title.attachmentInfo`).d('附件信息'),
      },
    ].filter(Boolean);
    const openModal = (modal, title, width) => {
      modal.open({
        drawer: true,
        title,
        className: styles.createModal,
        bodyStyle: {
          padding: 0,
        },
        children: (
          <ModalProvider>
            <Form dataSet={this.formDs} labelLayout="float" columns={1}>
              <Alert
                banner
                showIcon
                closable
                type="info"
                iconType="help"
                className={styles.supEntryAlert}
                message={intl
                  .get('spfm.supplierRegister.view.alert.createWarning')
                  .d(
                    '如您对审批拒绝的原因有疑义可提出申诉，提交后将转至人工审批，需等待0-1个工作日。'
                  )}
              />
              <div style={{ padding: '0px 20px' }}>
                <TextArea
                  label={intl.get('spfm.supplierRegister.model.view.appealReason').d('申诉原因')}
                  name="appealReason"
                  cols="50"
                  rows="4"
                  resize="both"
                  clearButton
                  maxLength={100}
                />
              </div>
            </Form>
          </ModalProvider>
        ),
        okFirst: true,
        okText: intl.get('spfm.supplierRegister.button.submit').d('提交'),
        onOk: async () => {
          const res = await this.formDs.validate();
          if (res) {
            const data = this.formDs.toData();
            this.handleCheckSubmit(data[0].appealReason);
            return true;
          } else {
            return false;
          }
        },
        style: { width },
      });
    };
    const InnerModal = () => {
      const modal = useModal();
      const handleClick = React.useCallback(
        () =>
          openModal(
            modal,
            intl.get('spfm.supplierRegister.model.view.appealReasonB').d('申诉原因'),
            380
          ),
        []
      );
      return (
        <Button
          funcType="flat"
          icon="question_answer"
          type="primary"
          loading={loading}
          onClick={handleClick}
          style={{
            display:
              currentStep === 2 &&
              ((appealFlag === 1 && processStatus !== 'APPEAL') ||
                processStatus === 'REJECT' ||
                showAppealBtn)
                ? 'inline-block'
                : 'none',
          }}
        >
          {intl.get('spfm.supplierRegister.button.appeal').d('申诉')}
        </Button>
      );
    };
    return (
      <React.Fragment>
        <Header
          title={intl.get(`spfm.supplierRegister.view.title.supplierIdentify`).d('供应商认证')}
          backPath={isEdit ? '/spfm/simplified-register/list' : ''}
        >
          <Button
            icon="arrow_forward"
            type="primary"
            color="primary"
            loading={loading}
            onClick={() => this.handleNext(true)}
            style={{ display: nextVisable ? 'inline-block' : 'none' }}
          >
            {intl.get('hzero.common.button.next').d('下一步')}
          </Button>
          <Button
            icon="check"
            type="primary"
            color="primary"
            loading={loading}
            onClick={() => this.handleCheckSubmit()}
            style={{ display: submitVisable ? 'inline-block' : 'none' }}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <ModalProvider>
            <InnerModal />
          </ModalProvider>
          <Button
            funcType="flat"
            icon="arrow_back"
            loading={loading}
            onClick={() => this.handlePrevious()}
            {...previousProps}
            style={{ display: previousVisable ? 'inline-block' : 'none' }}
          >
            {intl.get('hzero.common.button.previous').d('上一步')}
          </Button>
          <Button
            icon="save"
            funcType="flat"
            loading={loading}
            style={{ display: saveVisable ? 'inline-block' : 'none' }}
            onClick={() => this.handleNext(false)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content className={styles['simplified-index-content']}>
          <Spin spinning={loading} wrapperClassName={styles['simplified-card-content']}>
            <Content>
              <Card bordered={false}>
                <Steps
                  current={currentStep}
                  size="small"
                  className={styles['simplified-header-steps']}
                >
                  <Step
                    title={intl.get(`spfm.supplierRegister.view.title.mainInfo`).d('主要信息')}
                  />
                  <Step
                    title={intl
                      .get(`spfm.supplierRegister.view.title.secondaryMainInfo`)
                      .d('次要信息')}
                  />
                  <Step title={intl.get(`spfm.supplierRegister.view.title.preview`).d('预览')} />
                </Steps>
              </Card>
            </Content>
            {currentStep === 0 && legalInfo}
            {currentStep === 1 && secondaryInfo}
            {currentStep === 2 && (
              <React.Fragment>
                {legalInfo}
                {secondaryInfo}
              </React.Fragment>
            )}
            {currentStep !== 0 && (
              <PositionAnchor>
                {linkList.map((link) => (
                  <Link href={`#${link.key}`} title={link.title} />
                ))}
              </PositionAnchor>
            )}
          </Spin>
        </Content>
      </React.Fragment>
    );
  }
}
