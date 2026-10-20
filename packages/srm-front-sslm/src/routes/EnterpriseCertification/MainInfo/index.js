/*
 * MainInfo - 企业主要信息
 * @Date: 2022-07-02 09:57:53
 * @author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React, { Fragment, Component } from 'react';
import { DataSet, notification, Button, Modal } from 'choerodon-ui/pro';
import { Spin, Alert } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, round, camelCase } from 'lodash';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import querystring from 'querystring';
// import { routerRedux } from 'dva/router';

import { getResponse, getCurrentLanguage, getCurrentOrganizationId } from 'utils/utils';

import {
  saveBasicInfo,
  fetchPublicData,
  checkChangeInvestigate,
} from '@/services/enterpriseCertificationService';
import { transformFields } from '@/routes/components/EnterpriseCertification/utils/utils.js';
import EnterpriseTags from '@/routes/components/MemberSupplier/EnterpriseTags';
import { getLegalDS } from './stores/legalDS';

import LegalInfo from './LegalInfo';
import ValidationSteps from '../components/ValidationSteps';

import styles from '../index.less';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();
const isTenantLevel = organizationId !== 0;
const isChinese = language === 'zh_CN'; // 中文语言环境

/**
 * 主要信息
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
export default class MainInfo extends Component {
  constructor(props) {
    super(props);
    // 是否是预览
    const isPreview = props.location?.pathname?.match('preview');
    const routerParam = querystring.parse(props.location?.search?.substr(1));
    const { domesticForeignRelation, changeReqId } = routerParam;
    let domesticFlag = domesticForeignRelation;
    // domesticFlag true(境内和个人注册) false(境外注册)
    domesticFlag = Number(domesticFlag);
    // 个人注册
    const personalFlag = domesticFlag === 2;
    this.state = {
      // isEdit: true,
      pageLoading: false,
      orcLoading: false,
      domesticFlag: !!domesticFlag,
      personalFlag,
      changeReqId,
      isPreview,
      domesticForeignRelation,
      registerConfig: {}, // 存储登记信息在注册策略中的配置
      otherLoading: false,
    };
  }

  legalDS = new DataSet({
    ...getLegalDS(),
  });

  componentDidMount() {
    this.handleQueryTabConfig();
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

  // 处理登记信息ds
  @Bind()
  handleCreateDataSet(requiredList) {
    this.legalDS = new DataSet({
      ...getLegalDS({ requiredList }),
    });
    this.handleQueryLegalInfo();
  }

  // 查询表格配置
  @Bind()
  async handleQueryTabConfig() {
    const { domesticForeignRelation } = this.state;
    const { stepsObj: { registPolicyConfig } = {} } = this.props;
    const registerConfigName =
      Number(domesticForeignRelation) === 1
        ? 'spfm_company_basic_in'
        : Number(domesticForeignRelation) === 0
        ? 'spfm_company_basic_out'
        : null;
    const config = registPolicyConfig.find(n => n.configName === registerConfigName) || {};
    const { strategyCfLineList } = config;
    const { requiredList, enableList } = this.handleFields(strategyCfLineList);
    this.handleCreateDataSet(requiredList || []);
    this.setState({ registerConfig: config || {}, enableList });
  }

  // 处理查询
  @Bind()
  handleQueryLegalInfo() {
    const { changeReqId } = this.state;
    this.setState({
      pageLoading: true,
    });
    this.legalDS.setQueryParameter('changeReqId', changeReqId);
    this.legalDS.query().finally(() => {
      this.setState({
        pageLoading: false,
      });
    });
  }

  @Bind()
  async handlePrevious() {
    const { history, enterpriseCertificationRemote } = this.props;
    if (enterpriseCertificationRemote) {
      const eventProps = {
        history,
      };
      const cuxResult = await enterpriseCertificationRemote.event.fireEvent(
        'cuxMainInfoPrevious',
        eventProps
      );
      if (!cuxResult) {
        return;
      }
    }
    history.push({
      pathname: `/sslm/enterprise-certification/affiliated-result`,
    });
  }

  // 下一步额外校验
  @Bind()
  handleNextCheck(payload, nextFlag) {
    const { changeReqId } = this.state;
    if (nextFlag) {
      // 先校验是否更换调查表
      const params = {
        changeReqId,
        comBusinessReqDTO: payload,
      };
      this.setState({
        otherLoading: true,
      });
      return checkChangeInvestigate(params)
        .then(res => {
          if (getResponse(res)) {
            const { changeFlag, addConfigNameFlag } = res;
            // changeFlag 调查表切换，true 需要提示; addConfigNameFlag true 平台页签增加刷新当前页签，false 下一步
            // 调查表一开始就没有，下一步不弹窗提示直接到下一个页面
            if (!changeFlag) {
              return this.saveData(payload, nextFlag);
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
                  return this.saveData(payload, nextFlag);
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
      return this.saveData(payload, nextFlag);
    }
  }

  @Bind()
  handleGoToNext() {
    const { history, stepsObj: { secondaryTabConfig, domesticForeignRelation } = {} } = this.props;
    const { hostname } = window.location;
    const { changeReqId } = this.state;
    // 跳转管理员申请
    const goToApplyFlag = !isTenantLevel;
    if (!isEmpty(secondaryTabConfig)) {
      history.push({
        pathname: `/sslm/enterprise-certification/secondary-info`,
        search: querystring.stringify({
          changeReqId,
        }),
      });
    } else if (goToApplyFlag) {
      history.push({
        pathname: `/sslm/enterprise-certification/apply-manager`,
        search: querystring.stringify({
          changeReqId,
        }),
      });
    } else {
      this.setState({
        otherLoading: true,
      });
      fetchPublicData(hostname)
        .then(res => {
          if (getResponse(res)) {
            const { investgHeaderId, investigateTemplateId } = res;
            // 跳转调查表页面
            const goToInvestgFlag = !!investgHeaderId && isTenantLevel;
            if (goToInvestgFlag) {
              // 跳转调查表页面
              history.push({
                pathname: `/sslm/enterprise-certification/investigation`,
                search: querystring.stringify({
                  changeReqId,
                  organizationId,
                  investgHeaderId,
                  investigateTemplateId,
                }),
              });
            } else {
              // 跳转预览页
              history.push({
                pathname: `/sslm/enterprise-certification/preview`,
                search: querystring.stringify({
                  changeReqId,
                  domesticForeignRelation,
                  source: 'main-info',
                }),
              });
            }
          }
        })
        .finally(() => {
          this.setState({
            otherLoading: false,
          });
        });
    }
  }

  // 保存数据
  @Bind()
  saveData(payload, nextFlag) {
    const { changeReqId } = this.state;
    return new Promise(resolve => {
      saveBasicInfo({
        ...payload,
        changeReqId,
        dataSource: 4,
        sourceKey: 1,
        checkFlag: nextFlag ? 1 : 0,
      })
        .then(res => {
          if (getResponse(res)) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            if (nextFlag) {
              this.handleGoToNext();
            } else {
              this.handleQueryLegalInfo();
            }
          }
        })
        .finally(() => {
          this.setState({
            pageLoading: false,
          });
          resolve();
        });
    });
  }

  @Bind()
  async handleSaveAndNext(nextFlag = false) {
    const { stepsObj = {} } = this.props;
    const { existFlag, partnerFlag } = stepsObj;
    // 二级域名注册存在已认证的公司，但是没有合作伙伴可以编辑基本，业务信息
    const disabled = isTenantLevel ? partnerFlag === 1 : partnerFlag === 1 || existFlag === 1; // 页签只读不校验必填
    if (disabled) {
      // 下一步
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
    } else if (this.legalDS.dirty) {
      const currentRecord = this.legalDS.current;
      const licenceUrlField = this.legalDS.getField('licenceUrl', currentRecord);
      const licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);

      // 校验个人注册身份证附件
      const idFrontField = this.legalDS.getField('idFrontUuid', currentRecord);
      const idFrontValidateFlag = await idFrontField.checkValidity(currentRecord);
      const idBackField = this.legalDS.getField('idBackUuid', currentRecord);
      const idBackValidateFlag = await idBackField.checkValidity(currentRecord);

      const validateFlag = await this.legalDS?.current?.validate();
      if (validateFlag) {
        this.setState({
          pageLoading: true,
        });
        const data = this.legalDS?.current?.toJSONData() || {};
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
          dataSource: 4,
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
            // longTermFlag,
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
        return this.handleNextCheck(payload, nextFlag);
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
      this.handleGoToNext();
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('spfm.supplierRegister.view.message.noNeedSaveData')
          .d('暂无需要保存的数据！'),
      });
    }
  }

  render() {
    const {
      pageLoading,
      orcLoading,
      domesticFlag,
      personalFlag,
      isPreview,
      enableList,
      changeReqId,
      registerConfig,
      otherLoading,
    } = this.state;
    const {
      location,
      stepsObj = {},
      remoteHiddenTips = false,
      enterpriseCertificationRemote,
    } = this.props;
    const { existFlag, partnerFlag } = stepsObj;
    const { remark } = registerConfig;

    const sourceKey = 'ENTERPRISE_CERTIFICATION';
    const loading = pageLoading || orcLoading || otherLoading;
    // 二级域名注册存在已认证的公司，但是没有合作伙伴可以编辑基本，业务信息，营业执照隐藏不校验必填
    const disabled = isTenantLevel ? partnerFlag === 1 : partnerFlag === 1 || existFlag === 1;
    const legalInfoData = this.legalDS.current && this.legalDS.current.toData();
    // src-31313 登记信息可编辑的时候，如果企业之前认证的营业执照没有则允许上传营业执照
    if (!isEmpty(legalInfoData)) {
      const { havePlatformLicence = 1 } = legalInfoData;
      this.legalDS.setState({
        licenceUrlHidden:
          isTenantLevel && partnerFlag !== 1 && existFlag === 1 && !!havePlatformLicence,
      });
    }
    const isEdit = !isPreview && !disabled;

    const legalProps = {
      isEdit,
      enableList,
      domesticFlag,
      personalFlag,
      changeReqId,
      dataSet: this.legalDS,
      remote: enterpriseCertificationRemote,
      handleQueryLegalInfo: this.handleQueryLegalInfo,
    };

    return (
      <Fragment>
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
              onClick={() => this.handleSaveAndNext(true)}
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
            >
              {intl.get('sslm.common.view.btn.lastStep').d('上一步')}
            </Button>
            <Button
              icon="save"
              funcType="flat"
              onClick={() => this.handleSaveAndNext()}
              loading={loading}
              wait={200}
              waitType="debounce"
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          </Header>
        )}
        {!isPreview && <ValidationSteps location={location} stepsObj={stepsObj} />}
        <Content className={styles['main-index-content']}>
          <Spin spinning={loading}>
            {!isEmpty(legalInfoData?.zhimaLabels) && isChinese && (
              <div className={styles['enterprise-tags-wrap']}>
                <div className={styles['enterprise-tags-content']}>
                  <div className={styles['enterprise-name']}>{legalInfoData?.companyName}</div>
                  <EnterpriseTags
                    showHelp
                    key={sourceKey}
                    tagList={legalInfoData?.zhimaLabels}
                    parentId="sslmEnterpriseCertification"
                    tagClassName="sslm-enterprise-certification"
                  />
                </div>
              </div>
            )}
            <div id="regInfo">
              <div className={styles['certification-title']}>
                {intl.get('spfm.enterprise.view.message.page.regInfo').d('登记信息')}
                {isEdit && !remoteHiddenTips && (
                  <div className={styles['certification-title-tips']}>
                    {intl
                      .get('spfm.enterpriseCertification.view.message.regInfoTips')
                      .d(
                        '请正确填写或更新有效的企业基本信息，以便您的合作伙伴参考使用，或发展潜在的合作关系。'
                      )}
                  </div>
                )}
              </div>
              <div style={{ marginTop: -16 }}>
                {remark && <Alert showIcon type="info" message={remark} />}
              </div>
              <LegalInfo {...legalProps} />
            </div>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
