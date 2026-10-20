/**
 * LegalInfo - 登记信息
 * @date: 2020-07-02
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import { Form, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import { yesOrNoRender } from 'utils/renderer';
import { getResponse } from 'utils/utils';

import FormField from '@/routes/components/FormField';
// 境内示例
import registerBusinessLicense from '@/assets/certification/business-license.png';
// 个人
import portraitFace from '@/assets/certification/personal-face.png';
import nationalEmblem from '@/assets/certification/personal-national.png';
import { updateLicenceUrl } from '@/services/enterpriseInformService';
import UploadCard from '../components/UploadCard';
import FileCardByUuid from '../components/FileCardByUuid';

import styles from '../index.less';

export default class LegalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // companyTypeVaisable: false,
      countryCode: '',
    };
  }

  // 上传成功
  @Bind()
  onUploadSuccess(response) {
    const { dataSet } = this.props;
    if (dataSet.current) {
      dataSet.current.set({
        licenceUrl: response,
      });
    }
    this.handleLicenceUrl(response);
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onUploadRemove() {
    const { dataSet } = this.props;
    if (dataSet.current) {
      dataSet.current.set({
        licenceUrl: null,
      });
    }
    this.handleLicenceUrl();
  }

  @Bind()
  handleLicenceUrl(licenceUrl = null) {
    const { changeReqId, dataSet } = this.props;
    updateLicenceUrl({
      changeReqId,
      dataSource: 4,
      licenceUrl,
      isPlatformFlag: true,
    }).then(res => {
      if (getResponse(res)) {
        const { objectVersionNumber } = res;
        if (dataSet.current) {
          dataSet.current.set({
            objectVersionNumber,
          });
        }
      }
    });
  }

  // 渲染境内表单
  @Bind()
  renderDomesticForm(editFlag) {
    const { dataSet, remote, enableList = [] } = this.props;
    const { countryCode } = this.state;
    const currentRecord = dataSet?.current;
    const chinaFlag = countryCode === 'CN' || currentRecord?.get('registeredCountryCode') === 'CN';
    const companyTypeVaisable = currentRecord?.get('institutionalType') === 'ICBC';
    // 企业本地字段显隐
    const localInfoFlag = remote
      ? remote.process(
          'SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_DOMESTIC_LOCAL_INFO_FLAG',
          true,
          { dataSet }
        )
      : true;
    // 认证地区显隐
    const remoteDomesticFlag = remote
      ? remote.process('SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_DOMESTIC_FLAG', true, {
          dataSet,
        })
      : true;
    // 【经营范围】tips显隐
    const remoteScopeFlag = remote
      ? remote.process('SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_DOMESTIC_SCOPE_FLAG', true, {
          dataSet,
        })
      : true;
    return (
      <React.Fragment>
        <FormField
          isEdit={editFlag}
          name="domesticForeignRelation"
          componentType="SELECT"
          hidden={remoteDomesticFlag}
        />
        <FormField isEdit={editFlag} name="certificationType" componentType="SELECT" />
        <FormField
          isEdit={editFlag}
          name="certificationRegionId"
          componentType="LOV"
          hidden={dataSet?.current?.get('certificationType') === '2'}
        />
        <FormField isEdit={editFlag} name="companyName" componentType="IntlField" />
        <FormField isEdit={editFlag} name="unifiedSocialCode" />
        {/* <FormField isEdit={editFlag} name="organizingInstitutionCode" /> */}
        <FormField isEdit={editFlag} name="dunsCode" />
        <FormField
          isEdit={editFlag}
          name="institutionalType"
          onChange={value => {
            this.setState({
              // 选择工商，企业类型展示
              // eslint-disable-next-line react/no-unused-state
              companyTypeVaisable: value === 'ICBC',
            });
          }}
          componentType="SELECT"
        />
        <FormField
          isEdit={editFlag}
          name="companyType"
          componentType="SELECT"
          hidden={!companyTypeVaisable}
        />
        <FormField isEdit={editFlag} name="taxpayerType" componentType="SELECT" />
        <FormField
          isEdit={editFlag}
          name="registeredCountryObj"
          clearButton={false}
          onChange={countryObj => {
            const { countryCode: newCountryCode } = countryObj || {};
            if (currentRecord) {
              currentRecord.set({
                regionPathName: undefined,
                registeredRegionId: undefined,
              });
            }
            // 触发render
            this.setState({
              countryCode: newCountryCode,
            });
          }}
          componentType="LOV"
        />
        <FormField
          isEdit={editFlag}
          name="regionPathName"
          hidden={!chinaFlag}
          record={currentRecord}
          regionAlias="registeredRegionId"
          countryAlias="registeredCountryId"
          componentType="RegionCascade"
        />
        <FormField
          isEdit={editFlag}
          name="addressDetail"
          newLine
          colSpan={2}
          componentType="IntlField"
        />
        <FormField isEdit={editFlag} name="legalRepName" componentType="IntlField" />
        <FormField isEdit={editFlag} name="registeredCapital" componentType="NumberField" />
        <FormField isEdit={editFlag} name="currencyObj" componentType="LOV" />
        <FormField isEdit={editFlag} name="buildDate" componentType="DatePicker" />
        <FormField isEdit={editFlag} name="licenceEndDate" componentType="DatePicker" />
        <FormField
          isEdit={editFlag}
          name="longTermFlag"
          componentType="CheckBox"
          renderer={({ value }) => {
            return yesOrNoRender(value);
          }}
        />
        <FormField
          isEdit={editFlag}
          name="businessScope"
          newLine
          colSpan={2}
          componentType="TextArea"
          help={
            editFlag && remoteScopeFlag
              ? intl
                  .get('spfm.enterprise.view.message.businessScopeTips')
                  .d(
                    '营业执照上无经营范围、未能识别的，请填写并与国家企业信用信息公示系统上的内容保持一致。'
                  )
              : ''
          }
        />
        {localInfoFlag && (
          <>
            <FormField
              isEdit={editFlag}
              name="localName"
              hidden={!enableList.includes('localName')}
            />
            <FormField
              isEdit={editFlag}
              name="localAddress"
              hidden={!enableList.includes('localAddress')}
            />
          </>
        )}
      </React.Fragment>
    );
  }

  // 渲染境外表单
  @Bind()
  renderAbroadForm(editFlag) {
    const { remote, dataSet, enableList = [] } = this.props;
    const { countryCode } = this.state;
    const currentRecord = dataSet?.current;
    const chinaFlag = countryCode === 'CN' || currentRecord?.get('registeredCountryCode') === 'CN';
    // 1-境内， 0-境外，2-个人 domesticFlag true 境内和个人
    // 企业本地字段显隐
    const localInfoFlag = remote
      ? remote.process(
          'SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_OVERSEAS_LOCAL_INFO_FLAG',
          true,
          { dataSet }
        )
      : true;
    // 认证地区显隐
    const remoteDomesticFlag = remote
      ? remote.process(
          'SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_OVERSEAS_DOMESTIC_FLAG',
          false,
          { dataSet }
        )
      : false;
    // 隐藏【经营范围】tips
    const remoteScopeFlag = remote
      ? remote.process('SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_OVERSEAS_SCOPE_FLAG', true, {
          dataSet,
        })
      : true;
    return (
      <React.Fragment>
        <FormField
          isEdit={editFlag}
          name="domesticForeignRelation"
          componentType="SELECT"
          hidden={remoteDomesticFlag}
        />
        <FormField isEdit={editFlag} name="companyName" componentType="IntlField" />
        <FormField isEdit={editFlag} name="dunsCode" />
        <FormField isEdit={editFlag} name="businessRegistrationNumber" />
        <FormField
          isEdit={editFlag}
          name="registeredCountryObj"
          clearButton={false}
          onChange={countryObj => {
            const { countryCode: newCountryCode } = countryObj || {};
            if (currentRecord) {
              currentRecord.set({
                regionPathName: undefined,
                registeredRegionId: undefined,
              });
            }
            // 触发render
            this.setState({
              countryCode: newCountryCode,
            });
          }}
          componentType="LOV"
        />
        <FormField
          isEdit={editFlag}
          name="regionPathName"
          hidden={!chinaFlag}
          record={currentRecord}
          regionAlias="registeredRegionId"
          countryAlias="registeredCountryId"
          componentType="RegionCascade"
        />
        <FormField
          isEdit={editFlag}
          name="addressDetail"
          newLine
          colSpan={2}
          componentType="IntlField"
        />
        <FormField
          isEdit={editFlag}
          name="legalRepName"
          componentType="IntlField"
          hidden={!enableList.includes('legalRepName')}
        />
        <FormField
          isEdit={editFlag}
          name="registeredCapital"
          componentType="NumberField"
          hidden={!enableList.includes('registeredCapital')}
        />
        <FormField
          isEdit={editFlag}
          name="currencyObj"
          componentType="LOV"
          hidden={!enableList.includes('currencyObj')}
        />
        <FormField isEdit={editFlag} name="buildDate" componentType="DatePicker" />
        <FormField
          isEdit={editFlag}
          name="businessScope"
          newLine
          colSpan={2}
          componentType="TextArea"
          hidden={!enableList.includes('businessScope')}
          help={
            editFlag && remoteScopeFlag
              ? intl
                  .get('spfm.enterprise.view.message.businessScopeTips')
                  .d(
                    '营业执照上无经营范围、未能识别的，请填写并与国家企业信用信息公示系统上的内容保持一致。'
                  )
              : ''
          }
        />
        {localInfoFlag && (
          <>
            <FormField
              isEdit={editFlag}
              name="localName"
              hidden={!enableList.includes('localName')}
            />
            <FormField
              isEdit={editFlag}
              name="localAddress"
              hidden={!enableList.includes('localAddress')}
            />
          </>
        )}
      </React.Fragment>
    );
  }

  // 渲染个人注册字段
  @Bind()
  renderPersonalField(editFlag) {
    const { dataSet, remote } = this.props;
    const { countryCode } = this.state;
    const currentRecord = dataSet.current;
    const { idType, registeredCountryCode } =
      currentRecord?.get(['idType', 'registeredCountryCode']) || {};
    const chinaFlag = countryCode === 'CN' || registeredCountryCode === 'CN';
    const idCardVisable = idType === 'I';
    // 认证地区显隐
    const remoteDomesticFlag = remote
      ? remote.process(
          'SSLM_ENTERPRISE_CERTIFICATION_MAIN_LEGAL_INFO_PERSONAL_DOMESTIC_FLAG',
          false,
          { dataSet }
        )
      : false;
    return (
      <React.Fragment>
        <FormField
          isEdit={editFlag}
          name="domesticForeignRelation"
          componentType="SELECT"
          hidden={remoteDomesticFlag}
        />
        <FormField isEdit={editFlag} name="companyName" componentType="IntlField" />
        <FormField
          isEdit={editFlag}
          name="registeredCountryObj"
          componentType="LOV"
          clearButton={false}
          onChange={countryObj => {
            const { countryCode: newCountryCode } = countryObj || {};
            // 清空对象
            const clearObj = {
              regionPathName: undefined,
              registeredRegionId: undefined,
            };
            let personalObj = {};
            if (newCountryCode === 'CN') {
              personalObj = {
                idType: 'I',
                passport: undefined,
              };
            }
            if (currentRecord) {
              currentRecord.set({
                ...clearObj,
                ...personalObj,
              });
            }
            this.setState({
              // eslint-disable-next-line react/no-unused-state
              idNumVisable: currentRecord?.get('idType') === 'I',
              countryCode: newCountryCode,
            });
          }}
        />
        <FormField
          isEdit={editFlag}
          name="regionPathName"
          componentType="RegionCascade"
          hidden={!chinaFlag}
          record={currentRecord}
          regionAlias="registeredRegionId"
          countryAlias="registeredCountryId"
        />
        <FormField
          isEdit={editFlag}
          name="idType"
          componentType="SELECT"
          onChange={value => {
            if (value === 'I') {
              if (currentRecord) {
                currentRecord.set({
                  passport: undefined,
                });
              }
            } else if (currentRecord) {
              currentRecord.set({
                idNum: undefined,
              });
            }
            this.setState({
              // eslint-disable-next-line react/no-unused-state
              idNumVisable: value === 'I',
            });
          }}
        />
        <FormField isEdit={editFlag} name="idNum" hidden={!idCardVisable} />
        <FormField isEdit={editFlag} name="passport" hidden={idCardVisable} restrict="A-Z,0-9" />
        <FormField isEdit={editFlag} name="buildDate" componentType="DatePicker" />
        <FormField isEdit={editFlag} name="licenceEndDate" newLine componentType="DatePicker" />
        <FormField isEdit={editFlag} name="longTermFlag" componentType="CheckBox" />
        <FormField isEdit={editFlag} name="phone" componentType="TEL" />
        <FormField isEdit={editFlag} name="email" />
        <FormField
          isEdit={editFlag}
          name="addressDetail"
          newLine
          colSpan={2}
          componentType="IntlField"
        />
      </React.Fragment>
    );
  }

  render() {
    const { dataSet, personalFlag, domesticFlag, isEdit = false, enableList = [] } = this.props;
    // 境外附件显示
    const uploadCardVisable = personalFlag ? false : !domesticFlag;
    // 境内
    const domesticVisable = personalFlag ? false : domesticFlag;
    // 营业执照隐藏
    const licenceUrlHidden = !!dataSet.getState('licenceUrlHidden');

    return (
      <React.Fragment>
        <div className={styles['legal-basic-form']}>
          <Form
            dataSet={dataSet}
            columns={2}
            labelLayout={isEdit ? 'float' : 'vertical'}
            className={classnames(styles['addon-before-style'], {
              'c7n-pro-vertical-form-display': !isEdit,
            })}
            style={{
              width: '45%',
              maxWidth: 1172,
            }}
          >
            {personalFlag
              ? this.renderPersonalField(isEdit)
              : domesticFlag
              ? this.renderDomesticForm(isEdit)
              : this.renderAbroadForm(isEdit)}
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
            {/* 境内附件 */}
            <Output
              hidden={!domesticVisable || licenceUrlHidden}
              renderer={({ record = {} }) => {
                const licenceUrl = isEmpty(record) ? undefined : record.get('licenceUrl');
                const licenceFilename = isEmpty(record) ? undefined : record.get('licenceFilename');
                return (
                  <UploadCard
                    fileName={licenceFilename}
                    fileUrl={licenceUrl}
                    enableImageWatermark={1}
                    onUploadSuccess={this.onUploadSuccess}
                    onUploadRemove={this.onUploadRemove}
                    accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
                    label={intl
                      .get('spfm.enterprise.view.message.businessLicense')
                      .d('上传营业执照')}
                    viewOnly={!isEdit}
                    requiredFlag
                  />
                );
              }}
            />
            {/* 境外附件 */}
            <Output
              hidden={!(uploadCardVisable && enableList.includes('licenceUrl')) || licenceUrlHidden}
              renderer={({ record = {} }) => {
                const licenceUrl = isEmpty(record) ? undefined : record.get('licenceUrl');
                const licenceFilename = isEmpty(record) ? undefined : record.get('licenceFilename');
                return (
                  <UploadCard
                    fileName={licenceFilename}
                    fileUrl={licenceUrl}
                    enableImageWatermark={1}
                    onUploadSuccess={this.onUploadSuccess}
                    onUploadRemove={this.onUploadRemove}
                    accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
                    label={intl
                      .get('spfm.supplierRegister.view.title.uploadEnterpriseCertificate')
                      .d('上传企业注册证书')}
                    viewOnly={!isEdit}
                  />
                );
              }}
            />
            <Output
              hidden={!(isEdit && domesticVisable) || licenceUrlHidden}
              renderer={() => {
                return (
                  <div className={styles['register-business-license']}>
                    <div>{intl.get('spfm.supplierRegister.view.title.example').d('示例')}：</div>
                    <img
                      src={registerBusinessLicense}
                      alt={intl
                        .get(`spfm.supplierRegister.view.option.businessLicense`)
                        .d('营业执照')}
                    />
                  </div>
                );
              }}
            />
            {/* 个人身份证 */}
            <Output
              hidden={!personalFlag}
              newLine={!(personalFlag && isEdit)}
              renderer={({ record = {} }) => {
                const { idBackUuid, idType } = isEmpty(record)
                  ? {}
                  : record.get(['idBackUuid', 'idType']);
                return (
                  <FileCardByUuid
                    record={record}
                    label={intl
                      .get('spfm.supplierRegister.view.title.portraitFace')
                      .d('身份证人像面')}
                    uuid={idBackUuid}
                    viewOnly={!isEdit}
                    fieldName="idBackUuid"
                    requiredFlag={idType === 'I'}
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output
              hidden={!(personalFlag && isEdit)}
              renderer={() => {
                return (
                  <div className={styles['register-business-license']}>
                    <div>{intl.get('spfm.supplierRegister.view.title.example').d('示例')}：</div>
                    <img
                      src={portraitFace}
                      alt={intl
                        .get('spfm.supplierRegister.view.title.portraitFace')
                        .d('身份证人像面')}
                    />
                  </div>
                );
              }}
            />
            <Output
              hidden={!personalFlag}
              newLine={!(personalFlag && isEdit)}
              renderer={({ record = {} }) => {
                const { idFrontUuid, idType } = isEmpty(record)
                  ? {}
                  : record.get(['idFrontUuid', 'idType']);
                return (
                  <FileCardByUuid
                    record={record}
                    label={intl
                      .get('spfm.supplierRegister.view.title.nationalEmblem')
                      .d('身份证身份证国徽面')}
                    uuid={idFrontUuid}
                    viewOnly={!isEdit}
                    fieldName="idFrontUuid"
                    requiredFlag={idType === 'I'}
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output
              hidden={!(personalFlag && isEdit)}
              renderer={() => {
                return (
                  <div className={styles['register-business-license']}>
                    <div>{intl.get('spfm.supplierRegister.view.title.example').d('示例')}：</div>
                    <img
                      src={nationalEmblem}
                      alt={intl
                        .get('spfm.supplierRegister.view.title.nationalEmblem')
                        .d('身份证身份证国徽面')}
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
