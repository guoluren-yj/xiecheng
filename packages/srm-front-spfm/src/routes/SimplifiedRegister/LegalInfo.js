/**
 * HeaderInfo - 详情头信息
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Component } from 'react';
import {
  Form,
  TextField,
  NumberField,
  Select,
  DatePicker,
  Lov,
  IntlField,
  CheckBox,
  TextArea,
  Output,
  Icon,
  Modal,
  Button,
  notification,
} from 'choerodon-ui/pro';
import { Cascader } from 'choerodon-ui';
import intl from 'utils/intl';
import { Bind, Debounce } from 'lodash-decorators';
import { isEmpty, last, isArray } from 'lodash';
import classnames from 'classnames';
import { getResponse } from 'utils/utils';
import { queryLovData } from 'services/api';
import { yesOrNoRender } from 'utils/renderer';
import { HZERO_PLATFORM } from 'utils/config';

import { loadCityData, queryCompanyBasic } from '@/services/legalService';
import {
  fetchCompanyFromOcr,
  updateLicenceUrl,
  fetchUserDetail,
} from '@/services/simplifiedRegisterService';
import registerBusinessLicense from '@/assets/icon-register-business-license.png';
import portraitFace from '@/assets/icon-register-personal-face.png';
import nationalEmblem from '@/assets/icon-register-personal-national.png';
import UploadModal from './components/UploadModal';
import UploadCard from './components/UploadCard';
import FileCardByUuid from './components/FileCardByUuid';

import { formatInternationalTel, getErrorMsg, openChangeCompanyModal } from './utils';
import styles from './index.less';

import TextSearch from './components/TextSearch';

export default class LegalInfo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      uploadFinish: false,
      cityData: [],
      isEdit: true,
      domesticFlag: props.domesticFlag,
      companyTypeVaisable: false,
      idNumVisable: true,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    // 查询用户信息，处理带值 先临时解决返回主要信息不查询页面问题
    this.handleQueryLegalInfo();
  }

  @Bind()
  handleCreateData(data = {}, flag = true) {
    const { dataSet } = this.props;
    let newData = data;
    // 个人注册国家是中国默认展示身份证
    const {
      domesticForeignRelation,
      registeredCountryCode,
      idType,
      internationalTelCode,
    } = newData;
    if (domesticForeignRelation === '2') {
      if (registeredCountryCode === 'CN' && !idType) {
        newData = {
          ...newData,
          idType: 'I',
          passport: undefined,
        };
      }
      if (!internationalTelCode) {
        newData = {
          ...newData,
          internationalTelCode: '+86',
        };
      }
    }
    if (flag) {
      dataSet.loadData([]);
      dataSet.create(newData);
    } else {
      dataSet.loadData([newData]);
    }
    this.handleSetStatus(newData);
  }

  // 处理状态
  @Bind()
  handleSetStatus(data = {}) {
    const { handleUpdateState = () => {} } = this.props;
    const { institutionalType, processStatus, companyId, idType = 'I' } = data;
    const isEdit = !(
      processStatus === 'SUBMIT' ||
      processStatus === 'COMPLETE' ||
      processStatus === 'APPROVING' ||
      processStatus === 'WFL_REJECT'
    );
    this.setState({
      isEdit,
      companyTypeVaisable: institutionalType === 'ICBC',
      idNumVisable: idType === 'I',
    });
    handleUpdateState({
      companyId,
      isEdit,
    });
  }

  // 处理查询
  @Bind()
  handleQueryLegalInfo(flag = true) {
    const { handleUpdateState = () => {}, personalFlag } = this.props;
    const { domesticFlag } = this.state;

    handleUpdateState({
      pageLoading: true,
    });
    queryCompanyBasic()
      .then((res) => {
        if (getResponse(res)) {
          // 境内个人需默认带值中国
          let defaultCountryCode = null;
          let defaultCountryId = null;
          let defaultCountryName = null;
          queryLovData(`${HZERO_PLATFORM}/v1/lovs/sql/data`, {
            lovCode: 'HPFM.COUNTRY',
            page: 0,
            size: 10,
            condition: 'CN',
          })
            .then((lovData) => {
              if (getResponse(lovData)) {
                if (lovData && isArray(lovData.content)) {
                  const firstData = lovData.content[0];
                  const { countryCode, countryId, countryName } = firstData || {};
                  defaultCountryCode = countryCode;
                  defaultCountryId = countryId;
                  defaultCountryName = countryName;
                  handleUpdateState({
                    defaultBankInfo: {
                      countryCode,
                      countryId,
                      countryName,
                    },
                  });
                }
              }
            })
            .finally(() => {
              if (isEmpty(res)) {
                const data = {
                  domesticForeignRelation: personalFlag ? '2' : domesticFlag ? '1' : '0',
                  uploadFlag: flag,
                };
                // 新注册带出注册时的企业信息
                fetchUserDetail()
                  .then((userInfo) => {
                    if (getResponse(userInfo)) {
                      const { companyName, internationalTelCode, phone, email } = userInfo || {};
                      // 境内个人需默认带值中国
                      this.handleCreateData({
                        ...data,
                        companyName,
                        internationalTelCode,
                        phone,
                        email,
                        registeredCountryId: domesticFlag ? defaultCountryId : undefined,
                        registeredCountryName: domesticFlag ? defaultCountryName : undefined,
                        registeredCountryCode: domesticFlag ? defaultCountryCode : undefined,
                      });
                    }
                  })
                  .catch(() => {
                    this.handleCreateData(data);
                  });
              } else {
                const { registeredCountryId, registeredCountryCode, registeredCountryName } = res;
                const countryObj = domesticFlag
                  ? {
                      registeredCountryId: registeredCountryId || defaultCountryId,
                      registeredCountryName: registeredCountryName || defaultCountryName,
                      registeredCountryCode: registeredCountryCode || defaultCountryCode,
                    }
                  : {
                      registeredCountryId,
                      registeredCountryName,
                      registeredCountryCode,
                    };
                const newData = {
                  ...res,
                  longTermFlag: res.longTermFlag ? res.longTermFlag : 0,
                  domesticForeignRelation: personalFlag ? '2' : domesticFlag ? '1' : '0',
                  uploadFlag: flag,
                  ...countryObj,
                };
                this.handleCreateData(newData, false);
              }
              handleUpdateState({
                pageLoading: false,
              });
            });
        }
      })
      .finally(() => {
        handleUpdateState({
          pageLoading: false,
        });
      });
  }

  @Bind()
  handleFileName(url) {
    if (!url) {
      return '';
    }
    const temp = url.split('/');
    if (!isEmpty(temp)) {
      const fileFullName = temp[temp.length - 1];
      const index = fileFullName.indexOf('@');
      if (index !== -1) {
        const fileName = fileFullName.substring(index + 1);
        return fileName;
      } else {
        return '';
      }
    } else {
      return '';
    }
  }

  /**
   * 境内上传弹窗
   */
  @Debounce(200)
  @Bind()
  openUploadModal() {
    const { dataSet, ocrFlag } = this.props;
    const dataProps = {
      ocrFlag,
      dataSet,
      handleOnOK: this.handleOnOK,
    };
    this.uploadModal = Modal.open({
      title: intl.get(`spfm.enterprise.view.message.businessLicense`).d('上传营业执照'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      closable: true,
      style: { width: 560 },
      movable: false,
      border: false,
      className: styles['register-attachment-modal'],
      children: <UploadModal {...dataProps} />,
      footer: (okBtn, cancelBtn) => {
        return (
          <div>
            {cancelBtn}
            <Button
              onClick={() => {
                this.uploadModal.close();
              }}
            >
              {intl.get('hzero.common.button.ok').d('确定')}
            </Button>
            <Button type="primary" color="primary" onClick={this.handleOnOK} hidden={!ocrFlag}>
              {intl.get('spfm.supplierRegister.button.automatic').d('自动识别')}
            </Button>
          </div>
        );
      },
    });
  }

  // 处理自动识别名称重复
  @Bind()
  handleCompanyNameRepeat(resp) {
    if (resp) {
      // 是否需要前端弹窗提示报错
      const errorFieldName = getErrorMsg(resp.code);
      if (errorFieldName) {
        // 弹窗提示
        this.openModal(errorFieldName);
        return true;
      } else {
        // 其他报错正常抛出
        getResponse(resp);
      }
    }
  }

   // 弹窗提示报错信息
   @Bind()
   openModal(fieldName = '') {
     const params = {
       fieldName,
       callBack: () => {
        // 随便调用一个接口，触发退出登录
        this.handleQueryLegalInfo(false);
       },
     };
     openChangeCompanyModal(params);
   }

  @Bind()
  handleAppointError(res) {
    let resultObj = {
      checkFlag: false,
      result: res,
    };
    if(res && res.failed === true){
      resultObj = {
        result: false,
        checkFlag: this.handleCompanyNameRepeat(res),
      };
    }
    return resultObj;
  }

  /**
   * 处理自动识别
   * @param {Object} info - 上传的文件
   */
  @Bind()
  async handleOnOK() {
    const { dataSet } = this.props;
    // ocr识别
    const currentRecord = dataSet.current;
    const licenceUrlField = dataSet.getField('licenceUrl', currentRecord);
    const licenceUrlValidateFlag = await licenceUrlField.checkValidity(currentRecord);
    if (!licenceUrlValidateFlag) {
      notification.error({
        placement: 'bottomRight',
        message: intl
          .get('spfm.enterprise.view.message.upload.businessLicense')
          .d('请上传营业执照'),
      });
    } else {
      this.handleModalUpdate(true);
      const url = currentRecord.get('licenceUrl');
      fetchCompanyFromOcr({ url })
        .then((res) => {
          // 处理特定报错
          const resultObj = this.handleAppointError(res);
          const { result, checkFlag } = resultObj;
          if (result) {
            // 重新查询
            this.handleQueryLegalInfo(true);
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.uploadModal.close();
          } else if(checkFlag) {
            // 后端识别报错，前端保留图片
            currentRecord.set({
              uploadFlag: true,
            });
          } else {
            currentRecord.set({
              uploadFlag: false,
            });
          }
        })
        .finally(() => {
          this.handleModalUpdate(false);
        });
    }
  }

  // 处理modal更新
  @Bind()
  handleModalUpdate(flag = false) {
    this.uploadModal.update({
      cancelProps: {
        loading: flag,
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {cancelBtn}
          <Button
            loading={flag}
            onClick={() => {
              this.uploadModal.close();
            }}
          >
            {intl.get('hzero.common.button.ok').d('确定')}
          </Button>
          <Button type="primary" color="primary" onClick={this.handleOnOK} loading={flag}>
            {intl.get('spfm.supplierRegister.button.automatic').d('自动识别')}
          </Button>
        </div>
      ),
    });
  }

  // 上传成功
  @Bind()
  onUploadSuccess(response) {
    const { dataSet } = this.props;
    dataSet.current.set({
      licenceUrl: response,
      uploadFlag: true,
    });
    this.handleUpdateLicenceUrl();
  }

  /**
   * 删除文件回调函数
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onUploadRemove() {
    const { dataSet } = this.props;
    dataSet.current.set({
      licenceUrl: undefined,
      uploadFlag: true,
    });
    this.handleUpdateLicenceUrl();
  }

  @Bind()
  handleCascader(record) {
    const { cityData = [] } = this.state;
    return (
      <Cascader
        onClick={() => this.fetchProvinceCity(record)}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        options={cityData}
        onChange={(value, selectedOptions) =>
          this.handleSelectRegion(value, selectedOptions, record)
        }
        loadData={(selectedOptions) => this.handleQueryCity(selectedOptions)}
      >
        <Icon type="expand_more" className="regist-icon" />
      </Cascader>
    );
  }

  // 初始化查询地区第一级
  @Bind()
  fetchProvinceCity(record) {
    this.setState({
      cityData: [],
    });
    const countryId = record.get('registeredCountryId');
    loadCityData({ countryId }).then((response) => {
      const res = getResponse(response);
      if (res) {
        const newCityData = res.map((n) => {
          const { regionId, regionName } = n;
          return { ...n, label: regionName, value: regionId, isLeaf: false };
        });
        this.setState({
          cityData: newCityData,
        });
      }
    });
  }

  @Bind()
  handleSelectRegion(value = [], selectedOptions = [], record = {}) {
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    const regionId = last(value);
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    record.set('isLeaf', isLeaf);
    record.set('registeredRegionId', regionId);
    record.set('regionPathName', region);
  }

  // 地区级联下拉框动态加载数据
  @Bind()
  handleQueryCity(selectedOptions) {
    const { cityData } = this.state;
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionId } = lastOption;
    lastOption.loading = true;
    loadCityData({ countryId, regionId }).then((response) => {
      const res = getResponse(response);
      if (res) {
        lastOption.loading = false;
        // 是否是最后一级地区
        if (!isEmpty(res)) {
          const newCityData = res.map((n) => {
            const { regionId: newRegionId, regionName } = n;
            const isLeaf = !!Number(n.isLeaf);
            return { ...n, label: regionName, value: newRegionId, isLeaf };
          });
          lastOption.children = newCityData;
        }
        this.setState({
          cityData: [...cityData],
        });
      }
    });
  }

  // 渲染个人注册字段
  @Bind()
  renderPersonalField(editFlag) {
    const { idNumVisable } = this.state;
    const { personalFlag, dataSet } = this.props;

    const currentRecord = dataSet.current;
    const idCardVisable = personalFlag && idNumVisable;
    const passportVisable = personalFlag && !idCardVisable;
    return editFlag ? (
      <React.Fragment>
        <Select
          name="idType"
          hidden={!personalFlag}
          onChange={(value) => {
            if (value === 'I') {
              currentRecord.set({
                passport: undefined,
              });
            } else {
              currentRecord.set({
                idNum: undefined,
              });
            }
            this.setState({
              idNumVisable: value === 'I',
            });
          }}
        />
        <TextField name="idNum" hidden={!idCardVisable} />
        <TextField name="passport" hidden={!passportVisable} restrict="A-Z,0-9" />
        <DatePicker name="buildDate" disabled={!editFlag} hidden={!personalFlag} />
        <DatePicker name="licenceEndDate" hidden={!personalFlag} newLine={personalFlag} />
        <CheckBox name="longTermFlag" hidden={!personalFlag} disabled={!editFlag} />
        <TextField
          addonBefore={<Select name="internationalTelCode" clearButton={false} />}
          name="phone"
          hidden={!personalFlag}
        />
        <TextField name="email" hidden={!personalFlag} />
      </React.Fragment>
    ) : (
      <React.Fragment>
        <Output name="idType" hidden={!personalFlag} />
        <Output name="idNum" hidden={!idCardVisable} />
        <Output name="passport" hidden={!passportVisable} />
        <Output name="buildDate" hidden={!personalFlag} />
        <Output name="licenceEndDate" hidden={!personalFlag} newLine={personalFlag} />
        <Output
          name="longTermFlag"
          hidden={!personalFlag}
          renderer={({ value }) => yesOrNoRender(value)}
        />
        <Output
          name="phone"
          hidden={!personalFlag}
          renderer={({ record = {}, value }) => {
            const { data: { internationalTelMeaning } = {} } = record;
            return formatInternationalTel(internationalTelMeaning, value);
          }}
        />
        <Output name="email" hidden={!personalFlag} />
      </React.Fragment>
    );
  }

  @Bind()
  handleUpdateLicenceUrl() {
    const { dataSet } = this.props;
    const data = dataSet.current.toJSONData();
    const { companyBasicId, companyId, objectVersionNumber, licenceUrl } = data;
    // if (companyId) {
    const payload = {
      companyBasicId,
      companyId,
      objectVersionNumber,
      licenceUrl: licenceUrl || null,
    };
    updateLicenceUrl(payload).then((res) => {
      if (getResponse(res)) {
        const { objectVersionNumber: newObjectVersionNumber } = res;
        if (newObjectVersionNumber) {
          dataSet.current.set({
            objectVersionNumber: newObjectVersionNumber,
          });
        }
      }
    });
    // }
  }

  render() {
    const { dataSet, readOnly = false, personalFlag, textSearchFlag } = this.props;
    const { isEdit, domesticFlag, companyTypeVaisable } = this.state;
    const currentRecord = dataSet ? dataSet.current : null;
    const editFlag = !readOnly && isEdit;
    // 境外附件显示
    const uploadCardVisable = personalFlag ? false : !domesticFlag;
    // 境内
    const domesticVisable = personalFlag ? false : domesticFlag;

    // 境外和个人注册字段隐藏
    const fieldHidden = !domesticFlag || personalFlag;

    const chinaFlag = currentRecord ? currentRecord.get('registeredCountryCode') === 'CN' : false;

    return (
      <React.Fragment>
        <div className={styles['legal-basic-form']}>
          <Form
            dataSet={dataSet}
            columns={2}
            labelLayout={editFlag ? 'float' : 'vertical'}
            className={classnames(styles['addon-before-style'], {
              'c7n-pro-vertical-form-display': !editFlag,
            })}
            style={{
              width: '45%',
              maxWidth: 1172,
            }}
          >
            {editFlag ? (
              <React.Fragment>
                {domesticVisable ? (
                  <TextSearch
                    dataSet={dataSet}
                    name="companyName"
                    disabled={!editFlag}
                    textSearchFlag={textSearchFlag}
                  />
                ) : (
                  <IntlField name="companyName" disabled={!editFlag} />
                )}
                <TextField name="unifiedSocialCode" hidden={fieldHidden} disabled={!editFlag} />
                <TextField name="dunsCode" disabled={!editFlag} hidden={personalFlag} />
                <TextField
                  name="businessRegistrationNumber"
                  hidden={domesticFlag || personalFlag}
                  disabled={!editFlag}
                />
                <Select
                  name="institutionalType"
                  disabled={!editFlag}
                  hidden={fieldHidden}
                  onChange={(value) => {
                    this.setState({
                      // 选择工商，企业类型展示
                      companyTypeVaisable: value === 'ICBC',
                    });
                  }}
                />
                <Select
                  name="companyType"
                  hidden={fieldHidden || !companyTypeVaisable}
                  disabled={!editFlag}
                />
                <Select name="taxpayerType" hidden={fieldHidden} disabled={!editFlag} />
                <Lov
                  name="registeredCountryObj"
                  disabled={!editFlag}
                  clearButton={false}
                  onChange={(countryObj) => {
                    const { countryCode: newCountryCode } = countryObj || {};
                    if(currentRecord){
                      currentRecord.set({
                        regionPathName: undefined,
                        registeredRegionId: undefined,
                      });
                    }
                    if (newCountryCode === 'CN') {
                      if(currentRecord){
                        currentRecord.set({
                          idType: 'I',
                          passport: undefined,
                        });
                      }
                      this.setState({
                        idNumVisable: true,
                      });
                    } else {
                      const currentIdType =currentRecord&& currentRecord.get('idType');
                      this.setState({
                        idNumVisable: currentIdType === 'I',
                      });
                    }
                  }}
                />
                <TextField
                  name="regionPathName"
                  addonAfter={this.handleCascader(currentRecord)}
                  hidden={!chinaFlag}
                />
                {this.renderPersonalField(editFlag)}
                <IntlField name="addressDetail" newLine colSpan={2} disabled={!editFlag} />
                <IntlField name="legalRepName" disabled={!editFlag} hidden={personalFlag} />
                <NumberField name="registeredCapital" disabled={!editFlag} hidden={personalFlag} />
                <Lov name="currencyObj" disabled={!editFlag} hidden={personalFlag} />
                <DatePicker name="buildDate" disabled={!editFlag} hidden={personalFlag} />
                <DatePicker name="licenceEndDate" hidden={fieldHidden} />
                <CheckBox name="longTermFlag" hidden={fieldHidden} disabled={!editFlag} />
                <TextArea
                  name="businessScope"
                  newLine
                  colSpan={2}
                  disabled={!editFlag}
                  hidden={personalFlag}
                />
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Output name="companyName" />
                <Output name="unifiedSocialCode" hidden={fieldHidden} />
                <Output name="dunsCode" hidden={personalFlag} />
                <Output name="businessRegistrationNumber" hidden={domesticFlag || personalFlag} />
                <Output name="institutionalType" hidden={fieldHidden} />
                <Output name="companyType" hidden={fieldHidden || !companyTypeVaisable} />
                <Output name="taxpayerType" hidden={fieldHidden} />
                <Output name="registeredCountryObj" />
                <Output name="regionPathName" hidden={!chinaFlag} />
                {this.renderPersonalField(editFlag)}
                <Output name="addressDetail" newLine colSpan={2} />
                <Output name="legalRepName" hidden={personalFlag} />
                <Output name="registeredCapital" hidden={personalFlag} />
                <Output name="currencyObj" hidden={personalFlag} />
                <Output name="buildDate" hidden={personalFlag} />
                <Output name="licenceEndDate" hidden={fieldHidden} />
                <Output
                  name="longTermFlag"
                  hidden={fieldHidden}
                  renderer={({ value }) => {
                    return yesOrNoRender(value);
                  }}
                />
                <Output name="businessScope" newLine colSpan={2} hidden={personalFlag} />
              </React.Fragment>
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
            {/* 境内附件 */}
            <Output
              hidden={!domesticVisable}
              renderer={({ record = {} }) => {
                const licenceUrl = isEmpty(record) ? undefined : record.get('licenceUrl');
                const licenceFilename = isEmpty(record) ? undefined : record.get('licenceFilename');
                return !licenceUrl ? (
                  <div>
                    <div
                      className={styles['domestic-attachment-card']}
                      onClick={() => {
                        this.openUploadModal();
                      }}
                    >
                      <Icon type="add" style={{ color: 'rgba(0,0,0,0.25)', fontSize: 28 }} />
                      <div className={styles['domestic-attachment-label']}>
                        {intl.get('spfm.enterprise.view.message.businessLicense').d('上传营业执照')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <UploadCard
                    fileName={licenceFilename}
                    fileUrl={licenceUrl}
                    onUploadRemove={this.onUploadRemove}
                    accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
                    label={intl
                      .get('spfm.enterprise.view.message.businessLicense')
                      .d('上传营业执照')}
                    viewOnly={!editFlag}
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            {/* 境外附件 */}
            <Output
              hidden={!uploadCardVisable}
              renderer={({ record = {} }) => {
                const licenceUrl = isEmpty(record) ? undefined : record.get('licenceUrl');
                const licenceFilename = isEmpty(record) ? undefined : record.get('licenceFilename');
                return (
                  <UploadCard
                    fileName={licenceFilename}
                    fileUrl={licenceUrl}
                    onUploadSuccess={this.onUploadSuccess}
                    onUploadRemove={this.onUploadRemove}
                    accept="image/jpeg,image/jpg,image/png,image/bmp,application/pdf"
                    label={intl
                      .get('spfm.supplierRegister.view.title.uploadEnterpriseCertificate')
                      .d('上传企业注册证书')}
                    viewOnly={!editFlag}
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output
              hidden={!(editFlag && domesticFlag && !personalFlag)}
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
              newLine={!(personalFlag && editFlag)}
              renderer={({ record = {} }) => {
                const idBackUuid = isEmpty(record) ? undefined : record.get('idBackUuid');
                return (
                  <FileCardByUuid
                    record={record}
                    label={intl
                      .get('spfm.supplierRegister.view.title.portraitFace')
                      .d('身份证人像面')}
                    uuid={idBackUuid}
                    viewOnly={!editFlag}
                    fieldName="idBackUuid"
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output
              hidden={!(personalFlag && editFlag)}
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
              newLine={!(personalFlag && editFlag)}
              renderer={({ record = {} }) => {
                const idFrontUuid = isEmpty(record) ? undefined : record.get('idFrontUuid');
                return (
                  <FileCardByUuid
                    record={record}
                    label={intl
                      .get('spfm.supplierRegister.view.title.nationalEmblem')
                      .d('身份证身份证国徽面')}
                    uuid={idFrontUuid}
                    viewOnly={!editFlag}
                    fieldName="idFrontUuid"
                    enableImageWatermark={1}
                  />
                );
              }}
            />
            <Output
              hidden={!(personalFlag && editFlag)}
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
