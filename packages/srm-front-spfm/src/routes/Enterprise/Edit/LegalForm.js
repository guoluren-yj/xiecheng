/**
 * 企业信息 - 工商注册登记
 * @date: 2018-7-15
 * @author: niujiaqing <njq.niu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Cascader, Icon, Button } from 'hzero-ui';
import {
  DataSet,
  Form,
  Lov,
  Row,
  Col,
  Select,
  CheckBox,
  TextArea,
  TextField,
  IntlField,
  DatePicker,
  NumberField,
} from 'choerodon-ui/pro';
import moment from 'moment';
import { isUndefined, isEmpty, round } from 'lodash';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import Upload from 'srm-front-boot/lib/components/Upload/UploadButton';

import intl from 'utils/intl';
import {
  getAccessToken,
  getCurrentOrganizationId,
  isTenantRoleLevel,
  getAttachmentUrl,
  getCurrentLanguage,
} from 'utils/utils';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import styles from './index.less';

const { FormVirtualGroup } = Form;
const NAME_SPACE = 'enterpriseLegal';
const language = getCurrentLanguage();

@connect((modal) => ({
  legal: modal[NAME_SPACE],
  queryLoading: modal.loading.effects[`${NAME_SPACE}/init`],
  saveLegalLoading: modal.loading.effects[`${NAME_SPACE}/saveLegalInfo`],
  saveOrgLegalLoading: modal.loading.effects[`${NAME_SPACE}/saveOrgLegalInfo`],
  organizationId: getCurrentOrganizationId(),
}))
export default class LegalForm extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      init: false,
      currentCountry: null,
      regionValue: '',
      cityData: [],
      currentTermFlag: undefined,
      uploadInit: true,
      ifDomesticForeignRelation: 1,
      uploadRequired: false,
      companyTypeVaisable: false,
    };
  }

  optionDs = new DataSet({
    data: [
      { text: intl.get('spfm.supplierManage.view.message.innerOrg').d('境内机构'), value: 1 },
      { text: intl.get('spfm.supplierManage.view.message.outerOrg').d('境外机构'), value: 0 },
    ],
    selection: 'single',
  });

  legalDS = new DataSet({
    autoQuery: false,
    fields: [
      {
        name: 'domesticForeignRelation',
        type: 'number',
        label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
        textField: 'text',
        valueField: 'value',
        defaultValue: 0,
        options: this.optionDs,
      },
      {
        name: 'certificationType',
        disabled: true,
        defaultValue: '1',
        lookupCode: 'SSLM_CERTIFICATION_TYPE',
        label: intl.get('sslm.common.modal.field.certificationType').d('认证类型'),
      },
      {
        name: 'certificationRegionId',
        type: 'object',
        lovCode: 'HPFM.COUNTRY',
        label: intl.get('sslm.common.modal.field.certificationRegion').d('认证地区'),
        dynamicProps: {
          required: ({ record }) => record.get('certificationType') === '1',
        },
        transformRequest: (value) => (value ? value.countryId : null),
        transformResponse: (value, data) =>
          value
            ? {
                countryId: data.certificationRegionId,
                countryName: data.certificationRegionIdMeaning,
              }
            : null,
      },
      {
        name: 'unifiedSocialCode',
        type: 'string',
        dynamicProps: ({ record }) => {
          if (record.get('domesticForeignRelation') === 1) {
            return {
              required: true,
              pattern: /^(?![A-Z]{18}$)[0-9A-Z]{18}$/,
              // validator: this.unifiedSocialCodeValidator,
            };
          } else {
            return {};
          }
        },
        label: intl.get('spfm.enterprise.model.legal.unifiedSocialCode').d('统一社会信用代码号'),
      },
      {
        name: 'companyName',
        maxLength: 500,
        type: 'intl',
        required: true,
        // validator: this.companyNameValidator,
        label: intl.get('spfm.enterprise.model.legal.companyName').d('企业名称'),
      },
      // {
      //   name: 'companyEnglishName',
      //   type: 'string',
      //   label: intl.get('spfm.enterprise.model.legal.companyEnglishName').d('英文名称'),
      // },
      // {
      //   name: 'organizingInstitutionCode',
      //   type: 'string',
      //   dynamicProps: {
      //     pattern: ({ record }) =>
      //       record.get('domesticForeignRelation') === 0 ? /^.{1,30}$/ : /^[A-Z0-9]{8}-[A-Z0-9]$/,
      //   },
      //   label: intl.get('spfm.enterprise.model.legal.organizingInstitutionCode').d('组织机构代码'),
      // },
      {
        name: 'dunsCode',
        type: 'string',
        dynamicProps: {
          required: ({ record }) =>
            record.get('domesticForeignRelation') === 0 &&
            !(record.get('dunsCode') || record.get('businessRegistrationNumber')),
        },
        pattern: /^[0-9]{9}$/,
        label: intl.get('spfm.enterprise.model.legal.dunsCode').d('邓白氏编码'),
      },
      {
        name: 'businessRegistrationNumber',
        type: 'string',
        dynamicProps: {
          required: ({ record }) =>
            record.get('domesticForeignRelation') === 0 &&
            !(record.get('dunsCode') || record.get('businessRegistrationNumber')),
        },
        label: intl
          .get('spfm.enterprise.model.legal.businessRegistrationNumber')
          .d('商业注册登记号/税号'),
      },
      {
        name: 'companyType',
        type: 'string',
        lookupCode: 'HPFM.COMPANY_TYPE',
        dynamicProps: ({ record }) => {
          return {
            required:
              record.get('domesticForeignRelation') === 1 &&
              record.get('institutionalType') === 'ICBC',
          };
        },
        label: intl.get('spfm.enterprise.model.legal.companyType').d('企业类型'),
      },
      {
        name: 'institutionalType',
        type: 'string',
        lookupCode: 'SPFM.INSTITUTION_TYPE',
        dynamicProps: ({ record }) => {
          return {
            required: record.get('domesticForeignRelation') === 1,
          };
        },
        label: intl.get('spfm.enterprise.model.legal.institutionalType').d('机构类型'),
      },
      {
        name: 'taxpayerType',
        type: 'string',
        lookupCode: 'HPFM.TAXPAYER_TYPE',
        dynamicProps: ({ record }) => {
          return {
            required: record.get('domesticForeignRelation') === 1,
          };
        },
        label: intl.get('spfm.enterprise.model.legal.taxpayerType').d('纳税人标识'),
      },
      {
        name: 'registeredCountryObj',
        type: 'object',
        lovCode: 'HPFM.COUNTRY',
        ignore: 'always',
        required: true,
        label: intl.get('spfm.enterprise.view.message.registeredCountryRegion').d('注册国家/地区'),
      },
      {
        name: 'registeredCountryId',
        bind: 'registeredCountryObj.countryId',
        required: true,
      },
      {
        name: 'registeredCountryName',
        bind: 'registeredCountryObj.countryName',
      },
      {
        name: 'registeredCountryCode',
        bind: 'registeredCountryObj.countryCode',
      },
      {
        name: 'regionPathName',
        type: 'string',
        readOnly: true,
        dynamicProps: ({ record }) => {
          return {
            required: record.get('registeredCountryCode') === 'CN',
          };
        },
        label: intl.get('spfm.enterprise.model.legal.provincialAndUrbanAreas').d('省/市/区'),
      },
      {
        name: 'registeredRegionId',
        type: 'string',
        dynamicProps: ({ record }) => {
          return {
            required: record.get('registeredCountryCode') === 'CN',
          };
        },
      },
      {
        name: 'addressDetail',
        type: 'intl',
        required: true,
        label: intl.get('spfm.enterprise.model.legal.registeredAddress').d('注册地址'),
      },
      {
        name: 'legalRepName',
        type: 'intl',
        required: true,
        label: intl.get('spfm.enterprise.model.legal.legalRepName').d('法定代表人'),
      },
      {
        name: 'registeredCapital',
        type: 'number',
        required: true,
        step: language === 'en_US' ? 0.00000001 : 0.000001,
        min: 0,
        label: intl.get('spfm.enterprise.model.legal.registeredCapitalW').d('注册资本(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? (value ? round(value / 100, 8) : value) : value;
        },
      },
      {
        name: 'currencyObj',
        type: 'object',
        lovCode: 'SPFM.CURRENCY',
        textField: 'currencyName',
        ignore: 'always',
        required: true,
        label: intl.get('spfm.enterprise.view.message.currencyCode').d('注册资本币种'),
      },
      {
        name: 'currencyCode',
        bind: 'currencyObj.currencyCode',
        type: 'string',
        defaultValue: 'CNY',
        required: true,
      },
      {
        name: 'currencyName',
        bind: 'currencyObj.currencyName',
        type: 'string',
        defaultValue: intl.get('hzero.common.currency.cny').d('人民币'),
        required: true,
      },
      {
        name: 'buildDate',
        type: 'date',
        required: true,
        transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
        transformResponse: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
        max: moment().format(DEFAULT_DATE_FORMAT),
        label: intl.get('spfm.enterprise.view.message.buildDate').d('成立日期'),
      },
      {
        name: 'licenceEndDate',
        min: 'buildDate',
        type: 'date',
        required: true,
        dynamicProps: ({ record }) => {
          return {
            required: record.get('domesticForeignRelation') === 1 && !record.get('longTermFlag'),
          };
        },
        transformRequest: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
        transformResponse: (val) => val && moment(val).format(DEFAULT_DATE_FORMAT),
        label: intl.get('spfm.enterprise.view.message.licenceEndDate').d('营业期限'),
      },
      {
        name: 'longTermFlag',
        type: 'boolean',
        trueValue: 1,
        falseValue: 0,
        defaultValue: 0,
        label: intl.get('spfm.enterprise.view.message.longTerm').d('长期'),
      },
      {
        name: 'businessScope',
        type: 'string',
        label: intl.get('spfm.enterprise.view.message.businessScope').d('经营范围'),
      },
      {
        name: 'licenceUrl',
        type: 'string',
        dynamicProps: ({ record }) => {
          return {
            required: record.get('domesticForeignRelation') === 1,
          };
        },
        // label: intl.get('spfm.certificationApproval.model.detailForm.licenceUrl').d('营业执照扫描件'),
      },
      {
        name: 'objectVersionNumber',
      },
      {
        name: 'localName',
        label: intl.get('sslm.common.model.field.localName').d('企业本土名称'),
      },
      {
        name: 'localAddress',
        label: intl.get('sslm.common.model.field.localAddress').d('企业本土地址'),
      },
    ],
    events: {
      update: ({ record, name, value }) => {
        if (name === 'domesticForeignRelation') {
          this.setState({
            ifDomesticForeignRelation: value,
          });
        }
        if (name === 'registeredCountryObj') {
          this.setState({
            currentCountry: value,
          });
          if (value) {
            this.fetchProvinceCity(value.countryId);
          }
        }
        if (name === 'longTermFlag') {
          if (value) {
            record.set('licenceEndDate', null);
          }
          this.setState({
            currentTermFlag: !!value,
          });
        }
        if (name === 'institutionalType') {
          record.set('companyType', null);
          this.setState({
            companyTypeVaisable: value === 'ICBC',
          });
        }
        if (name === 'certificationRegionId') {
          if (value) {
            record.set({
              domesticForeignRelation: value.countryCode === 'CN' ? 1 : 0,
            });
          } else {
            record.set({
              domesticForeignRelation: null,
            });
          }
        }
      },
    },
  });

  componentDidMount() {
    const { dispatch, onRef, isTenant, organizationId, companyId } = this.props;
    if (onRef) onRef(this);
    const payload = {};
    if (isTenant) {
      payload.organizationId = organizationId;
    }
    if (companyId && companyId !== 'undefined') {
      dispatch({
        type: `${NAME_SPACE}/init`,
        payload,
      }).then(() => {
        const { data = {} } = this.props;
        // 登记信息由境外却切换到境内时，长期标识没有值默认给0
        const newData = {
          ...data,
          longTermFlag: data.longTermFlag ? data.longTermFlag : 0,
        };
        this.legalDS.loadData([newData]);
        this.setState({
          ifDomesticForeignRelation: data.domesticForeignRelation,
          init: true,
        });
        this.fetchProvinceCity(data.registeredCountryId);
      });
    } else {
      this.legalDS.loadData([]);
      this.legalDS.create({ domesticForeignRelation: 1 });
      this.setState({
        ifDomesticForeignRelation: 1,
        init: true,
      });
    }
  }

  @Bind()
  async saveAndNext() {
    const { data = {}, dispatch, callback, isTenant } = this.props;
    const { regionValue } = this.state;
    const record = this.legalDS.current;
    const flag = await record.validate();
    if (flag) {
      let payload = {
        ...data,
        ...record.toData(),
      };
      const { currencyObj, registeredCountryObj, registeredCapital, ...other } = payload;
      payload = {
        ...other,
        businessRegistrationNumber:
          payload.domesticForeignRelation === 1 ? null : payload.businessRegistrationNumber,
        registeredCapital:
          language === 'en_US' ? round(registeredCapital * 100, 6) : registeredCapital,
      };
      if (payload.domesticForeignRelation === 0) {
        const {
          unifiedSocialCode,
          companyType,
          taxpayerType,
          licenceEndDate,
          longTermFlag,
          institutionalType,
          ...otherFieldValues
        } = payload;
        payload = otherFieldValues;
      }
      if (!isUndefined(payload.registeredRegionId)) {
        if (regionValue.length > 0) {
          payload.registeredRegionId = regionValue[regionValue.length - 1];
        } else {
          payload.registeredRegionId = data.registeredRegionId;
        }
      }
      if (isEmpty(payload.dunsCode)) {
        payload.dunsCode = null;
      }
      if (isEmpty(payload.organizingInstitutionCode)) {
        payload.organizingInstitutionCode = null;
      }
      if (isTenant) {
        payload.organizationId = getCurrentOrganizationId();
      }
      dispatch({
        type: `${NAME_SPACE}/${isTenant ? 'saveOrgLegalInfo' : 'saveLegalInfo'}`,
        payload,
      }).then((res) => {
        if (res) {
          record.set({
            objectVersionNumber: res.objectVersionNumber,
          });
          if (callback) {
            callback(res);
          }
        }
      });
    } else if (record.get('domesticForeignRelation') === 1 && !record.get('licenceUrl')) {
      this.setState({
        uploadRequired: true,
      });
      notification.warning({
        message: intl
          .get('spfm.enterprise.view.message.upload.businessLicense')
          .d('请上传营业执照'),
      });
    }
  }

  // func是用户传入需要防抖的函数
  @Bind()
  debounce(func, wait = 500) {
    // 缓存一个定时器id
    let timer = 0;
    return function time(...args) {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, wait);
    };
  }

  @Bind()
  unifiedSocialCodeValidator(value) {
    const { data = {}, dispatch } = this.props;
    const pattern = /^(?![A-Z]{18}$)[0-9A-Z]{18}$/;
    if (pattern.test(value)) {
      if (value) {
        dispatch({
          type: `${NAME_SPACE}/validateUnifiedSocialCode`,
          payload: {
            companyId: data.companyId,
            unifiedSocialCode: value,
          },
        }).then((res) => {
          if (isUndefined(res)) {
            return false;
          } else {
            return true;
          }
        });
      } else {
        return true;
      }
    } else {
      return intl
        .get('spfm.enterprise.model.legal.unifiedSocialCodeNewRule')
        .d('由18位大写字母和数字混合组成,且不能是纯字母');
    }
  }

  @Bind()
  companyNameValidator(value) {
    const { data = {}, dispatch } = this.props;
    if (value) {
      dispatch({
        type: `${NAME_SPACE}/validateCompanyName`,
        payload: {
          companyId: data.companyId,
          companyName: value,
        },
      }).then((res) => {
        if (isUndefined(res)) {
          return false;
        } else {
          return true;
        }
      });
    } else {
      return true;
    }
  }

  fetchProvinceCity(value) {
    const { dispatch } = this.props;
    dispatch({
      type: `${NAME_SPACE}/queryDefaultCity`,
      payload: { countryId: value },
    }).then((res) => {
      this.setState({
        cityData: res,
        init: true,
      });
    });
  }

  /**
   * 地区级联下拉框动态加载数据
   */
  @Bind()
  handleQueryCity(selectedOptions) {
    const { dispatch } = this.props;
    const lastOption = selectedOptions[selectedOptions.length - 1] || [];
    const { countryId, regionId } = lastOption;
    lastOption.loading = true;
    dispatch({
      type: `${NAME_SPACE}/queryCity`,
      payload: { countryId, regionId },
    }).then((res) => {
      if (res) {
        const { cityData } = this.state;
        lastOption.loading = false;
        // 是否是最后一级地区
        if (!isEmpty(res)) {
          lastOption.children = res;
        }
        this.setState({
          cityData: [...cityData],
        });
      }
    });
  }

  // fetchRegionIds(id, cityList = []) {
  //   if (!id) return;
  //   const stack = [];
  //   const deepSearch = children => {
  //     let found = false;
  //     children.forEach(item => {
  //       if (!found) {
  //         if (item.regionId === id) {
  //           found = true;
  //         } else if (!found && item.children && item.children.length > 0) {
  //           found = deepSearch(item.children);
  //         }
  //         if (found) stack.push(item);
  //       }
  //     });
  //     return found;
  //   };
  //   deepSearch(cityList);
  //   return stack.reverse().map(item => item.regionId);
  // }

  @Bind()
  onUploadSuccess(file) {
    const { dispatch } = this.props;
    const TenantRoleLevel = isTenantRoleLevel();
    if (file) {
      this.legalDS.current.set('licenceUrl', file.response);
      this.setState({
        uploadRequired: false,
      });
      if (TenantRoleLevel) {
        // -经过沟通租户级暂时不做ocr处理
        return false;
      } else {
        dispatch({
          type: `${NAME_SPACE}/fetchCompanyInfoFromOcr`,
          payload: {
            url: file.response,
          },
        });
      }
    }
  }

  @Bind()
  onRemoveSuccess() {
    this.legalDS.current.set('licenceUrl', null);
    if (this.legalDS.current.get('domesticForeignRelation')) {
      this.setState({
        uploadInit: false,
        uploadRequired: true,
      });
    } else {
      this.setState({
        uploadInit: false,
        uploadRequired: false,
      });
    }
  }

  // uploadButton;

  // @Bind()
  // uploadRef(upload) {
  //   this.uploadButton = upload;
  // }

  @Bind()
  isChinaCountry(countryCode) {
    const { currentCountry } = this.state;
    if (currentCountry === null) {
      return countryCode === 'CN';
    } else {
      return currentCountry.countryCode === 'CN';
    }
  }

  /**
   * radio切换的时候校验一次组织机构代码
   */
  @Bind()
  verification({ target }) {
    const { value } = target;
    this.setState(() => {
      this.setState({
        ifDomesticForeignRelation: value,
      });
    });
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value, selectedOptions = []) {
    const record = this.legalDS.current;
    const regionList = selectedOptions.map((region) => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    record.set('regionPathName', region);
    record.set('registeredRegionId', value);
    this.setState({
      regionValue: value,
    });
  }

  @Bind()
  handleCascader() {
    const { cityData = [] } = this.state;
    return (
      <Cascader
        changeOnSelect
        popupClassName={styles['Caseader-input']}
        showSearch={false}
        style={{ width: '100%' }}
        placeholder={intl.get('hzero.common.validation.requireSelect', {
          name: intl.get('spfm.enterprise.model.legal.registeredRegionId').d('注册地址'),
        })}
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={this.handleSelectRegion}
        loadData={(selectedOptions) => this.handleQueryCity(selectedOptions)}
        getPopupContainer={() => document.getElementById('caseInput')}
      >
        <Icon type="down" />
      </Cascader>
    );
  }

  render() {
    const {
      data = {},
      // saving = false,
      saveLegalLoading = false,
      saveOrgLegalLoading = false,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      // queryLoading = false,
    } = this.props;
    const {
      currentTermFlag,
      uploadInit,
      ifDomesticForeignRelation,
      uploadRequired,
      companyTypeVaisable,
    } = this.state;
    const { longTermFlag = 0, licenceFilename, licenceUrl } = data;
    const statusControl = data.processStatus === 'SUBMIT';
    const processStatus = data.processStatus === 'COMPLETE'; // 已认证状态组织机构代码不允许修改
    const bucketDirectory = 'spfm-comp';
    const fileList = [];
    if (licenceUrl && uploadInit) {
      const url = getAttachmentUrl(
        licenceUrl,
        PRIVATE_BUCKET,
        getCurrentOrganizationId(),
        bucketDirectory
      );
      fileList.push({
        uid: licenceFilename,
        name: licenceFilename,
        thumbUrl: url,
        url: licenceUrl,
      });
    }
    // const companyName = data.companyName || comName;

    // const { getFieldDecorator, getFieldValue } = form;

    // const regionIds = this.fetchRegionIds(data.registeredRegionId, cityList);

    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const record = this.legalDS.current;
    return (
      <div>
        <Form record={record} labelLayout="float">
          {/* <Row>
            <SelectBox name="domesticForeignRelation" disabled={statusControl} />
          </Row> */}
          <Row>
            <Select name="certificationType" disabled={statusControl} style={{ width: '400px' }} />
          </Row>
          <Row>
            <Lov name="certificationRegionId" disabled={statusControl} style={{ width: '400px' }} />
          </Row>
          {ifDomesticForeignRelation === 1 && (
            <FormVirtualGroup className="virtual-group">
              <Row>
                <TextField
                  name="unifiedSocialCode"
                  style={{ width: '400px' }}
                  disabled={statusControl || processStatus}
                />
              </Row>
            </FormVirtualGroup>
          )}
          <Row>
            <IntlField name="companyName" style={{ width: '400px' }} />
          </Row>
          {/* <Row>
            <TextField
              name="companyEnglishName"
              style={{ width: '400px' }}
              disabled={statusControl}
            />
          </Row> */}
          {ifDomesticForeignRelation === 0 && (
            <div
              style={{
                fontSize: '12px',
                color: '#999',
              }}
            >
              {intl.get('spfm.enterprise.model.legal.interMessage').d('以下两项编码至少填一项')}
            </div>
          )}
          {/* {ifDomesticForeignRelation === 1 && (
            <Row>
              <TextField
                name="organizingInstitutionCode"
                style={{ width: '400px' }}
                disabled={statusControl}
              />
            </Row>
          )} */}
          <Row>
            <TextField name="dunsCode" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          {ifDomesticForeignRelation === 0 && (
            <Row>
              <TextField
                name="businessRegistrationNumber"
                style={{ width: '400px' }}
                disabled={statusControl}
              />
            </Row>
          )}
          {ifDomesticForeignRelation === 1 && (
            <Row>
              <Select
                name="institutionalType"
                style={{ width: '400px' }}
                disabled={statusControl}
              />
            </Row>
          )}
          {ifDomesticForeignRelation === 1 && companyTypeVaisable && (
            <Row>
              <Select name="companyType" style={{ width: '400px' }} disabled={statusControl} />
            </Row>
          )}
          {ifDomesticForeignRelation === 1 && (
            <Row>
              <Select name="taxpayerType" style={{ width: '400px' }} disabled={statusControl} />
            </Row>
          )}
          <Row>
            <Lov
              name="registeredCountryObj"
              style={{ width: '400px' }}
              clearButton={false}
              disabled={statusControl}
            />
          </Row>
          {this.isChinaCountry(data.registeredCountryCode) && (
            <Row id="caseInput" style={{ width: '400px' }}>
              <TextField
                name="regionPathName"
                addonAfter={this.handleCascader()}
                disabled={statusControl}
              />
            </Row>
          )}
          <Row>
            <IntlField name="addressDetail" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          <Row>
            <IntlField name="legalRepName" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          <Row>
            <NumberField
              name="registeredCapital"
              style={{ width: '400px' }}
              disabled={statusControl}
            />
          </Row>
          <Row>
            <Lov name="currencyObj" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          <Row>
            <DatePicker name="buildDate" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          {ifDomesticForeignRelation === 1 && (
            <Row style={{ width: '400px' }}>
              <Col span={20}>
                <DatePicker
                  name="licenceEndDate"
                  style={{ width: '300px' }}
                  disabled={isUndefined(currentTermFlag) ? longTermFlag : currentTermFlag}
                />
              </Col>
              <Col span={4} style={{ lineHeight: '36px' }}>
                <CheckBox name="longTermFlag" disabled={statusControl} />
              </Col>
            </Row>
          )}
          <Row>
            <TextArea
              name="businessScope"
              style={{ width: '400px' }}
              rows={6}
              disabled={statusControl}
            />
          </Row>
          <Row style={{ width: '400px' }}>
            <Upload
              disabled={statusControl}
              // onRef={this.uploadRef}
              fileType="image/jpeg;image/jpg;image/png;application/pdf"
              // accept=".jepg,.jpg,.png,.pdf"
              viewOnly={statusControl}
              uploadData={() => ({ enableImageWatermark: 1 })}
              showRemoveIcon
              single
              filePreview
              storageType="URL"
              enableImageWatermark={1}
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="spfm-comp"
              fileList={fileList}
              onUploadSuccess={this.onUploadSuccess}
              onRemoveSuccess={this.onRemoveSuccess}
              text={
                record && record.get('domesticForeignRelation') === 1 ? (
                  <span>
                    <span style={{ color: 'red' }}>*</span>
                    {intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')}
                  </span>
                ) : (
                  intl.get('spfm.enterprise.view.message.registrationCertificate').d('企业登记证件')
                )
              }
            />
            {uploadRequired && (
              <div className={styles['upload-require-message']}>
                {record &&
                  record.get('domesticForeignRelation') === 1 &&
                  intl
                    .get('spfm.enterprise.view.message.upload.businessLicense')
                    .d('请上传营业执照')}
              </div>
            )}
          </Row>
          <Row>
            <TextField name="localName" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          <Row>
            <TextField name="localAddress" style={{ width: '400px' }} disabled={statusControl} />
          </Row>
          <Row style={{ marginTop: 40, textAlign: 'right' }}>
            <Col span={8}>
              {!statusControl ? (
                <Button
                  type="primary"
                  onClick={this.debounce(this.saveAndNext, 500)}
                  loading={saveLegalLoading || saveOrgLegalLoading}
                >
                  {buttonText}
                </Button>
              ) : (
                ''
              )}
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}
