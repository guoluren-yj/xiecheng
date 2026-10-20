/**
 * RegistInform - 登记信息
 * @date: 2019-10-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import {
  Row,
  Col,
  Input,
  Select,
  Form,
  InputNumber,
  DatePicker,
  Spin,
  Cascader,
  Icon,
  // Tooltip,
} from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, round, last, isNil } from 'lodash';
import moment from 'moment';
import { connect } from 'dva';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import TLEditor from 'components/TLEditor';
import Checkbox from 'components/Checkbox';
import Upload from 'srm-front-boot/lib/components/Upload/UploadButton';
import UploadMdal from 'srm-front-boot/lib/components/Upload/index';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { EMAIL, NOT_CHINA_PHONE, PHONE } from 'utils/regExp';
import { getCurrentOrganizationId, getAttachmentUrl, getCurrentLanguage } from 'utils/utils';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import '@/routes/index.less';
import GlobalPhone from '@/routes/components/GlobalPhone';
import styles from './registlnform.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const language = getCurrentLanguage();

@connect(({ enterpriseInform, loading }) => ({
  enterpriseInform,
  queryLoading: loading.effects[`enterpriseInform/queryCompanyBasicReq`],
  updateLicenceLoading: loading.effects[`enterpriseInform/updateLicenceUrl`],
}))
@Form.create({ fieldNameProp: null })
export default class RegistInform extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTermFlag: undefined,
      companyBasic: {},
      cityData: [],
      registeredCountryCode: null,
      newLicenceConfig: null,
      objectVersionNumber: null,
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) onRef(this);
    this.handlequeryCompanyBasic();
  }

  /**
   * 校验数据
   */
  @Bind()
  checkData() {
    const {
      form: { validateFieldsAndScroll },
    } = this.props;
    const { companyBasic, objectVersionNumber } = this.state;
    let comBasicReq = null;
    const newObjectVersionNumber = objectVersionNumber || companyBasic.objectVersionNumber;
    validateFieldsAndScroll((err, fieldsValue) => {
      if (err) {
        comBasicReq = null; // 校验不通过置空
        notification.warning({
          message: intl
            .get(`sslm.enterpriseInform.view.message.warn.regisWarn`)
            .d('登记信息填写有误'),
        });
      } else {
        const { registeredCapital } = fieldsValue;
        comBasicReq = {
          ...companyBasic,
          ...fieldsValue,
          registeredCapital:
            language === 'en_US' ? round(registeredCapital * 100, 6) : registeredCapital,
          objectVersionNumber: newObjectVersionNumber,
        };
        if (isEmpty(comBasicReq.dunsCode)) {
          comBasicReq.dunsCode = null;
        }
        if (isEmpty(comBasicReq.organizingInstitutionCode)) {
          comBasicReq.organizingInstitutionCode = null;
        }
        if (comBasicReq.buildDate) {
          comBasicReq.buildDate = moment(comBasicReq.buildDate).format(DEFAULT_DATE_FORMAT);
        }
        if (comBasicReq.licenceEndDate) {
          comBasicReq.licenceEndDate = moment(comBasicReq.licenceEndDate).format(
            DEFAULT_DATE_FORMAT
          );
        }
        if (comBasicReq.domesticForeignRelation === 0) {
          // 境外不展示数据原样返回
          // comBasicReq.unifiedSocialCode = null;
          // comBasicReq.taxpayerType = null;
        }
      }
    });

    return comBasicReq;
  }

  @Bind()
  onUploadSuccess(file) {
    const { form } = this.props;
    if (file) {
      form.setFieldsValue({
        licenceUrl: file.response,
      });
      this.handleLicenceUrl(file);
    }
  }

  @Bind()
  onRemoveSuccess() {
    const { form } = this.props;
    form.setFieldsValue({
      licenceUrl: null,
    });
    this.handleLicenceUrl();
  }

  @Bind()
  handleLicenceUrl(file = null) {
    const { dispatch, changeReqId, source = '', supplierFlag } = this.props;
    let newObjectVersionNumber = null;
    const licenceUrl = file ? file.response : null;
    const licenceFilename = file ? file.name : null;
    // 企业信息变更-平台级变更
    const isPlatformFlag = supplierFlag === 0;
    dispatch({
      type: 'enterpriseInform/updateLicenceUrl',
      payload: {
        changeReqId,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        licenceUrl,
        isPlatformFlag,
      },
    })
      .then(res => {
        if (res) {
          const { objectVersionNumber } = res;
          newObjectVersionNumber = objectVersionNumber;
        }
      })
      .finally(() => {
        this.setState({
          objectVersionNumber: newObjectVersionNumber,
          newLicenceConfig: { licenceUrl, licenceFilename },
        });
      });
  }

  /**
   * 查询注册信息
   */
  @Bind()
  handlequeryCompanyBasic() {
    const {
      dispatch,
      changeReqId,
      source = '',
      queryUnitCode = [],
      companyId,
      supplierCompanyId,
      supplierFlag = 1,
      customizeTenantId = null,
    } = this.props;
    dispatch({
      type: 'enterpriseInform/queryCompanyBasicReq',
      payload: {
        changeReqId,
        dataSource: source === 'enterprise' ? 1 : 2, // 1企业信息变更 2供应商信息变更
        customizeUnitCode: queryUnitCode.join(','),
        companyId,
        supplierCompanyId,
        supplierFlag,
        customizeTenantId,
      },
    }).then(res => {
      if (res) {
        const { registeredCountryCode, quickIndex } = res;
        const chinaFlag = !!(registeredCountryCode === 'CN' || quickIndex === 'CN');
        this.setState({
          companyBasic: res,
          registeredCountryCode: chinaFlag ? 'CN' : registeredCountryCode,
          objectVersionNumber: null, // 查询重置版本号
        });
        // 登记信息查询完毕，再查默认值
        dispatch({
          type: 'enterpriseInform/getDefaultBankCountryInfo',
          payload: {
            ...res,
            source,
          },
        });
      }
    });
  }

  @Bind()
  handleLongTermFlagChange(event) {
    const { form } = this.props;
    if (event.target.checked === 1) {
      form.setFieldsValue({
        licenceEndDate: null,
      });
    }
    this.setState({
      currentTermFlag: event.target.checked,
    });
  }

  /**
   *  查询地址列表
   */
  @Bind()
  fetchProvinceCity(value) {
    this.setState(
      {
        cityData: [],
      },
      () => {
        const { dispatch } = this.props;
        dispatch({
          type: 'enterpriseInform/queryDefaultCity',
          payload: { countryId: value },
        }).then(res => {
          this.setState({
            cityData: res,
          });
        });
      }
    );
  }

  /**
   * 选择地区拼接
   */
  @Bind()
  handleSelectRegion(value = [], selectedOptions = []) {
    const {
      form: { setFieldsValue },
    } = this.props;
    const regionList = selectedOptions.map(region => {
      const { regionName } = region;
      return regionName;
    });
    const region = regionList.join('|');
    const lastRecord = last(selectedOptions);
    const { isLeaf } = lastRecord || {};
    setFieldsValue({
      registeredRegionId: value[value.length - 1],
      regionPathName: region,
      isLeaf,
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
      type: 'enterpriseInform/queryCitys',
      payload: { countryId, regionId },
    }).then(res => {
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

  @Bind()
  handleCascader(record, config, inputDisabled) {
    const customizeDisabled =
      config.find(({ fieldCode }) => fieldCode === 'regionPathName')?.editable || -1;
    const { cityData = [] } = this.state;
    const {
      form: { getFieldValue },
    } = this.props;
    const registeredCountryId = getFieldValue('registeredCountryId');
    return (
      <Cascader
        className={styles['registlnform-cascader']}
        onClick={() => this.fetchProvinceCity(registeredCountryId)}
        changeOnSelect
        showSearch={false}
        style={{ width: '100%' }}
        placeholder=""
        fieldNames={{ label: 'regionName', value: 'regionId' }}
        options={cityData || []}
        onChange={(value, selectedOptions) =>
          this.handleSelectRegion(value, selectedOptions, record)
        }
        loadData={selectedOptions => this.handleQueryCity(selectedOptions)}
        disabled={customizeDisabled === -1 ? inputDisabled : !customizeDisabled}
      >
        <Icon className={styles.registIcon} type="down" />
      </Cascader>
    );
  }

  @Bind()
  handleCountryChange(_, lovValue) {
    const { form } = this.props;
    const { countryCode, quickIndex } = lovValue;
    const chinaFlag = !!(countryCode === 'CN' || quickIndex === 'CN');
    this.setState({
      registeredCountryCode: chinaFlag ? 'CN' : countryCode,
    });
    form.setFieldsValue({
      regionPathName: null,
      registeredRegionId: null,
    });
  }

  render() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue, getFieldsValue },
      queryLoading,
      changFlag,
      code = {},
      isEdit = false,
      pubEdit,
      customizeForm,
      customizeUnitCode,
      supplierFlag,
      source = '',
      personalUnitCode = '',
      savePermissionFlag = true,
      changeLevel = '',
      customizeConfig = {},
      updateLicenceLoading,
      remoteProps = {}, // 埋点设置的必填标识
    } = this.props;
    const allLoading = queryLoading || updateLicenceLoading || false;
    const isPlatformFlag = supplierFlag === 0;
    // 字段禁用逻辑
    const fieldDisable =
      changFlag || isEdit || (supplierFlag && source === 'enterprise') || !savePermissionFlag;

    const { remoteRequired = true } = remoteProps;
    // 标准的禁用标识加上埋点的标识
    const fieldRequired = !fieldDisable && remoteRequired;

    const { currentTermFlag, companyBasic, registeredCountryCode, newLicenceConfig } = this.state;
    const {
      companyType = [],
      taxpayerType = [],
      institutionalType = [],
      domesticForeignRelationList = [],
    } = code;
    const { licenceFilename, licenceUrl, _token, domesticForeignRelation } = companyBasic;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const bucketDirectory = 'spfm-comp';

    const fileList = [];
    const newLicenseUrl = newLicenceConfig ? newLicenceConfig.licenceUrl : licenceUrl;
    const newLicenseFilename = newLicenceConfig
      ? newLicenceConfig.licenceFilename
      : licenceFilename;
    if (newLicenseUrl && newLicenseFilename) {
      const url = getAttachmentUrl(
        newLicenseUrl,
        PRIVATE_BUCKET,
        getCurrentOrganizationId(),
        bucketDirectory
      );
      fileList.push({
        uid: newLicenseFilename, // uid 为空时报错
        name: newLicenseFilename,
        thumbUrl: url,
        url: newLicenseUrl,
      });
    }
    const registerDom = getFieldDecorator('registeredCountryId', {
      initialValue: companyBasic.registeredCountryId,
      rules: [
        {
          required: !fieldDisable,
          message: intl.get('hzero.common.validation.notNull', {
            name: intl
              .get('spfm.enterprise.view.message.registeredCountryRegion')
              .d('注册国家/地区'),
          }),
        },
      ],
    })(
      <Lov
        disabled={fieldDisable}
        code="HPFM.COUNTRY"
        textField={companyBasic.registeredCountryName}
        textValue={companyBasic.registeredCountryName}
        onChange={this.handleCountryChange}
      />
    );
    const regionNameDisabled = fieldDisable || !getFieldValue(`registeredCountryId`);
    const regionNameRequired =
      fieldRequired && getFieldValue(`registeredCountryId`) && registeredCountryCode === 'CN';
    const inputProps = {
      style: {
        verticalAlign: 'middle',
        position: 'relative',
        top: '-1px',
      },
      readOnly: true,
      disabled: regionNameDisabled,
    };

    const config =
      domesticForeignRelation !== 2
        ? (customizeConfig['SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS'] || {})
            ?.fields || []
        : (customizeConfig['SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_PERSONAL'] || {})
            ?.fields || [];
    inputProps.addonAfter = this.handleCascader(companyBasic, config, inputProps.disabled);
    const regionPathNameDom = getFieldDecorator(`regionPathName`, {
      initialValue: companyBasic.regionPathName,
      rules: [
        {
          required: regionNameRequired,
          validator: (_, value, cb) => {
            if (!value && registeredCountryCode === 'CN') {
              cb(
                intl.get('hzero.common.validation.notNull', {
                  name: intl
                    .get('sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas')
                    .d('省/市/区'),
                })
              );
            } else if (!regionNameDisabled) {
              // 非禁用状态下校验
              const { isLeaf, registeredRegionId } = getFieldsValue();
              if (registeredCountryCode === 'CN') {
                if (registeredRegionId && !isLeaf) {
                  cb(intl.get('sslm.common.view.message.lastRegion').d('须选择填写至最末级地区'));
                } else {
                  cb();
                }
              }
              cb();
            } else {
              cb();
            }
          },
        },
      ],
    })(<Input {...inputProps} />);
    getFieldDecorator('registeredRegionId', {
      initialValue: companyBasic.registeredRegionId,
    });
    getFieldDecorator('isLeaf', {
      initialValue: true,
    });

    // （境外）平台级企业信息变更和不协同供应商信息变更隐藏字段
    const hiddenFieldFlag =
      ((source === 'supplier' && !isEdit) || supplierFlag === 0) && domesticForeignRelation === 0;
    // 平台级企业信息变更和不协同供应商信息变更显示字段
    const showFieldFlag = (source === 'supplier' && !isEdit) || supplierFlag === 0;
    const customizeUploadDisabled = (
      (customizeConfig['SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.REGISTRATION_OVERSEAS'] || {})
        ?.fields || []
    ).find(({ fieldCode }) => fieldCode === 'licenceUrl');

    return (
      <Spin spinning={allLoading}>
        {isNil(domesticForeignRelation)
          ? null
          : domesticForeignRelation !== 2
          ? customizeForm(
              {
                code: customizeUnitCode,
                form,
                dataSource: companyBasic,
                readOnly: pubEdit ? false : fieldDisable,
              },
              <Form className="ued-edit-form form-wrap">
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
                    >
                      {getFieldDecorator('certificationType', {
                        initialValue: companyBasic.certificationType,
                      })(<div>{companyBasic.certificationTypeMeaning}</div>)}
                    </FormItem>
                  </Col>
                  {!companyBasic.certificationRegionId && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.address')
                          .d('认证地区')}
                      >
                        {getFieldDecorator('domesticForeignRelation', {
                          initialValue: domesticForeignRelation,
                        })(
                          <Select disabled style={{ width: '100%' }}>
                            {domesticForeignRelationList.map(n => (
                              <Option value={Number(n.value)} key={n.value}>
                                {n.meaning}
                              </Option>
                            ))}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  )}
                  {Boolean(companyBasic.certificationRegionId) && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.common.modal.field.certificationRegion')
                          .d('认证地区')}
                      >
                        {getFieldDecorator('certificationRegionId', {
                          initialValue: companyBasic.certificationRegionId,
                        })(
                          <Lov
                            disabled
                            code="HPFM.COUNTRY"
                            textValue={companyBasic.certificationRegionIdMeaning}
                          />
                        )}
                      </FormItem>
                    </Col>
                  )}
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.companyName')
                        .d('企业名称')}
                    >
                      {getFieldDecorator('companyName', {
                        initialValue: companyBasic.companyName,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.view.model.companyInfo.companyName')
                                .d('企业名称'),
                            }),
                          },
                          {
                            max: 500,
                            message: intl.get('hzero.common.validation.max', { max: 500 }),
                          },
                        ],
                      })(
                        <TLEditor
                          label={intl
                            .get('sslm.enterpriseInform.view.model.companyInfo.companyName')
                            .d('企业名称')}
                          field="companyName"
                          token={_token}
                          disabled={fieldDisable}
                          dbc2sbc={false}
                          inputSize={{ zh: 500, en: 500 }}
                        />
                      )}
                    </FormItem>
                  </Col>
                  {showFieldFlag && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.shortName')
                          .d('企业简称')}
                      >
                        {getFieldDecorator('shortName', {
                          initialValue: companyBasic.shortName,
                        })(
                          <TLEditor
                            label="企业简称"
                            field="shortName"
                            token={_token}
                            disabled={fieldDisable}
                            dbc2sbc={false}
                          />
                        )}
                      </FormItem>
                    </Col>
                  )}
                </Row>
                <Row gutter={48} className="writable-row">
                  {domesticForeignRelation === 1 && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.socialCode')
                          .d('统一社会信用代码')}
                      >
                        {getFieldDecorator('unifiedSocialCode', {
                          initialValue: companyBasic.unifiedSocialCode,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  )}
                  {domesticForeignRelation === 0 && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.model.companyInfo.registrationNumber')
                          .d('企业注册登记号/税号')}
                      >
                        {getFieldDecorator('businessRegistrationNumber', {
                          initialValue: companyBasic.businessRegistrationNumber,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  )}
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.dunsCode')
                        .d('邓白氏编码')}
                    >
                      {getFieldDecorator('dunsCode', {
                        initialValue: companyBasic.dunsCode,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
                        .d('法定代表人/负责人')}
                    >
                      {getFieldDecorator('legalRepName', {
                        initialValue: companyBasic.legalRepName,
                        rules: [
                          {
                            required: fieldRequired,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
                                .d('法定代表人/负责人'),
                            }),
                          },
                        ],
                      })(
                        <TLEditor
                          label={intl
                            .get('sslm.enterpriseInform.view.model.companyInfo.legalRepName')
                            .d('法定代表人/负责人')}
                          field="legalRepName"
                          token={_token}
                          disabled={fieldDisable}
                          dbc2sbc={false}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                {domesticForeignRelation === 1 && (
                  <Row gutter={48} className="writable-row">
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.organizingCode')
                          .d('组织机构代码')}
                      >
                        {getFieldDecorator('organizingInstitutionCode', {
                          initialValue: companyBasic.organizingInstitutionCode,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.institutionalType')
                          .d('机构类型')}
                      >
                        {getFieldDecorator('institutionalType', {
                          initialValue: companyBasic.institutionalType,
                          rules: [
                            {
                              required: fieldRequired && domesticForeignRelation !== 0,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(
                                    'sslm.enterpriseInform.view.model.companyInfo.institutionalType'
                                  )
                                  .d('机构类型'),
                              }),
                            },
                          ],
                        })(
                          <Select
                            style={{ width: '100%' }}
                            disabled={fieldDisable}
                            onChange={() => {
                              form.setFieldsValue({ companyType: undefined });
                            }}
                          >
                            {institutionalType.map(item => {
                              return (
                                <Option key={item.value} value={item.value}>
                                  {item.meaning}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.companyType')
                          .d('企业类型')}
                      >
                        {getFieldDecorator('companyType', {
                          initialValue: companyBasic.companyType,
                          rules: [
                            {
                              required:
                                fieldRequired &&
                                isPlatformFlag &&
                                domesticForeignRelation !== 0 &&
                                getFieldValue(`institutionalType`) === 'ICBC',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('sslm.enterpriseInform.view.model.companyInfo.companyType')
                                  .d('企业类型'),
                              }),
                            },
                          ],
                        })(
                          <Select
                            style={{ width: '100%' }}
                            disabled={fieldDisable || getFieldValue(`institutionalType`) !== 'ICBC'}
                          >
                            {companyType.map(item => {
                              return (
                                <Option key={item.value} value={item.value}>
                                  {item.meaning}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                )}
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('spfm.enterprise.view.message.registeredCountryRegion')
                        .d('注册国家/地区')}
                    >
                      {registerDom}
                    </FormItem>
                  </Col>
                  {registeredCountryCode === 'CN' && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get(
                            'sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas'
                          )
                          .d('省/市/区')}
                      >
                        {/* <Tooltip title={getFieldValue('regionPathName')}>{regionPathNameDom}</Tooltip> */}
                        {regionPathNameDom}
                      </FormItem>
                    </Col>
                  )}
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.registeredAddress')
                        .d('注册地址')}
                    >
                      {getFieldDecorator('addressDetail', {
                        initialValue: companyBasic.addressDetail,
                        rules: [
                          {
                            required: !fieldDisable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(
                                  'sslm.enterpriseInform.view.model.companyInfo.registeredAddress'
                                )
                                .d('注册地址'),
                            }),
                          },
                        ],
                      })(
                        <TLEditor
                          label={intl
                            .get('sslm.enterpriseInform.view.model.companyInfo.registeredAddress')
                            .d('注册地址')}
                          field="addressDetail"
                          token={_token}
                          disabled={fieldDisable}
                          dbc2sbc={false}
                          inputSize={{ zh: 500, en: 500 }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.regCapital')
                        .d('注册资本(万)')}
                    >
                      {getFieldDecorator('registeredCapital', {
                        initialValue:
                          language === 'en_US'
                            ? companyBasic.registeredCapital
                              ? round(companyBasic.registeredCapital / 100, 8)
                              : companyBasic.registeredCapital
                            : companyBasic.registeredCapital,
                        rules: [
                          {
                            required: fieldRequired,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.view.model.companyInfo.regCapital')
                                .d('注册资本(万)'),
                            }),
                          },
                        ],
                      })(<InputNumber min={0} allowThousandth disabled={fieldDisable} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.currencyCode')
                        .d('注册资本币种')}
                    >
                      {getFieldDecorator('currencyCode', {
                        initialValue: companyBasic.currencyCode || 'CNY',
                        rules: [
                          {
                            required: fieldRequired,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.view.model.companyInfo.currencyCode')
                                .d('注册资本币种'),
                            }),
                          },
                        ],
                      })(
                        <Lov
                          code="SPFM.CURRENCY"
                          textValue={
                            companyBasic.currencyName ||
                            intl.get('hzero.common.currency.cny').d('人民币')
                          }
                          onChange={(_, record) => {
                            form.setFieldsValue({ currencyName: record.currencyName });
                          }}
                          lovOptions={{ displayField: 'currencyName', valueField: 'currencyCode' }}
                          disabled={fieldDisable}
                        />
                      )}
                      {getFieldDecorator('currencyName', {
                        initialValue:
                          companyBasic.currencyName ||
                          intl.get('hzero.common.currency.cny').d('人民币'),
                      })}
                    </FormItem>
                  </Col>
                  {domesticForeignRelation === 1 && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.model.companyInfo.taxpayerType')
                          .d('纳税人标识')}
                      >
                        {getFieldDecorator('taxpayerType', {
                          initialValue: companyBasic.taxpayerType,
                          rules: [
                            {
                              required: fieldRequired,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('sslm.enterpriseInform.view.model.companyInfo.taxpayerType')
                                  .d('纳税人标识'),
                              }),
                            },
                          ],
                        })(
                          <Select disabled={fieldDisable}>
                            {taxpayerType.map(item => {
                              return (
                                <Option key={item.value} value={item.value}>
                                  {item.meaning}
                                </Option>
                              );
                            })}
                          </Select>
                        )}
                      </FormItem>
                    </Col>
                  )}
                </Row>
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.buildDate')
                        .d('成立日期')}
                    >
                      {getFieldDecorator('buildDate', {
                        initialValue: companyBasic.buildDate
                          ? moment(companyBasic.buildDate)
                          : null,
                        rules: [
                          {
                            required: !fieldDisable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.view.model.companyInfo.buildDate')
                                .d('成立日期'),
                            }),
                          },
                        ],
                      })(<DatePicker placeholder="" disabled={fieldDisable} />)}
                    </FormItem>
                  </Col>
                  {!hiddenFieldFlag && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.view.registInform.businessTerm')
                          .d('营业期限')}
                      >
                        {getFieldDecorator('licenceEndDate', {
                          initialValue: companyBasic.licenceEndDate
                            ? moment(companyBasic.licenceEndDate)
                            : null,
                          rules: [
                            {
                              required:
                                (isUndefined(currentTermFlag)
                                  ? !companyBasic.longTermFlag && domesticForeignRelation !== 0
                                  : !currentTermFlag) && fieldRequired,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('sslm.enterpriseInform.view.registInform.businessTerm')
                                  .d('营业期限'),
                              }),
                            },
                          ],
                        })(
                          <DatePicker
                            disabled={
                              fieldDisable ||
                              (isUndefined(currentTermFlag)
                                ? companyBasic.longTermFlag
                                : currentTermFlag)
                            }
                            disabledDate={currentDate =>
                              form.getFieldValue('buildDate') &&
                              moment(form.getFieldValue('buildDate')).isAfter(currentDate, 'day')
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                  )}
                  {!hiddenFieldFlag && (
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        {getFieldDecorator('longTermFlag', {
                          initialValue: companyBasic.longTermFlag,
                        })(
                          <Checkbox
                            onChange={this.handleLongTermFlagChange}
                            disabled={fieldDisable}
                          >
                            {intl.get('sslm.enterpriseInform.view.message.longTerm').d('长期')}
                          </Checkbox>
                        )}
                      </FormItem>
                    </Col>
                  )}
                </Row>
                <Row gutter={48} className="half-row">
                  <Col span={12}>
                    <FormItem
                      label={intl
                        .get('sslm.enterpriseInform.view.registInform.businessScope')
                        .d('经营范围')}
                    >
                      {getFieldDecorator('businessScope', {
                        initialValue: companyBasic.businessScope,
                      })(<TextArea rows={2} disabled={fieldDisable} />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={48} className="half-row">
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label={
                        domesticForeignRelation === 1
                          ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
                          : intl
                              .get('spfm.enterprise.view.message.registrationCertificate')
                              .d('企业登记证件')
                      }
                      extra={intl
                        .get('hzero.common.upload.support', { type: '*.jpg;*.png;*.jpeg;*.pdf' })
                        .d('上传格式：*.jpg;*.png;*.jpeg;*.pdf')}
                    >
                      {getFieldDecorator('licenceUrl', {
                        initialValue: companyBasic.licenceUrl,
                        rules: [
                          {
                            required:
                              fieldRequired &&
                              (changeLevel === 'PLATFORM' && domesticForeignRelation !== 0),
                            message: intl
                              .get('spfm.enterprise.view.message.upload.businessLicense')
                              .d('请上传营业执照'),
                          },
                        ],
                      })(<div />)}
                      <Upload
                        // accept=".jepg,.jpg,.png,.pdf"
                        fileType="image/jpeg;image/jpg;image/png;application/pdf"
                        single
                        disabled={
                          changeLevel !== 'PLATFORM' &&
                          customizeUploadDisabled &&
                          customizeUploadDisabled.editable !== -1
                            ? !customizeUploadDisabled.editable
                            : fieldDisable
                        }
                        viewOnly={
                          changeLevel !== 'PLATFORM' &&
                          customizeUploadDisabled &&
                          customizeUploadDisabled.editable !== -1
                            ? !customizeUploadDisabled.editable
                            : fieldDisable
                        }
                        showUploadList={{ showRemoveIcon: false }}
                        bucketName={PRIVATE_BUCKET}
                        bucketDirectory="spfm-comp"
                        fileList={fileList}
                        filePreview
                        enableImageWatermark={1}
                        storageType="URL"
                        onUploadSuccess={this.onUploadSuccess}
                        onRemoveSuccess={this.onRemoveSuccess}
                        text={
                          domesticForeignRelation === 1
                            ? intl.get('spfm.enterprise.view.message.businessLicense').d('营业执照')
                            : intl
                                .get('spfm.enterprise.view.message.registrationCertificate')
                                .d('企业登记证件')
                        }
                      />
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )
          : customizeForm(
              {
                code: personalUnitCode,
                form,
                dataSource: companyBasic,
              },
              <Form className="ued-edit-form form-wrap">
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.view.model.companyInfo.address')
                        .d('认证地区')}
                    >
                      {getFieldDecorator('domesticForeignRelation', {
                        initialValue: domesticForeignRelation,
                      })(
                        <Select disabled style={{ width: '100%' }}>
                          {domesticForeignRelationList.map(n => (
                            <Option value={Number(n.value)} key={n.value}>
                              {n.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('sslm.common.modal.field.certificationType').d('认证类型')}
                    >
                      {getFieldDecorator('certificationType', {
                        initialValue: companyBasic.certificationType,
                      })(<div>{companyBasic.certificationTypeMeaning}</div>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('sslm.enterpriseInform.model.personal.name').d('姓名')}
                    >
                      {getFieldDecorator('companyName', {
                        initialValue: companyBasic.companyName,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl.get('sslm.enterpriseInform.model.personal.name').d('姓名'),
                            }),
                          },
                        ],
                      })(<Input disabled={fieldDisable} />)}
                    </FormItem>
                  </Col>
                </Row>
                {!supplierFlag && source === 'enterprise' && (
                  <Row gutter={48} className="writable-row">
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.model.personal.certificateType')
                          .d('证件类型')}
                      >
                        {getFieldDecorator('idTypeMeaning', {
                          initialValue: companyBasic.idTypeMeaning,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={
                          companyBasic.idType === 'I'
                            ? intl.get('sslm.enterpriseInform.model.personal.idNum').d('身份证号')
                            : intl
                                .get('sslm.enterpriseInform.model.personal.passport')
                                .d('护照号/通行证号')
                        }
                      >
                        {getFieldDecorator('idNum', {
                          initialValue:
                            companyBasic.idType === 'I'
                              ? companyBasic.idNum
                              : companyBasic.passport,
                        })(<Input disabled />)}
                      </FormItem>
                    </Col>
                  </Row>
                )}
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('spfm.enterprise.modal.personal.countryRegion')
                        .d('国家/地区')}
                    >
                      {getFieldDecorator('registeredCountryId', {
                        initialValue: companyBasic.registeredCountryId,
                      })(
                        <Lov
                          disabled
                          code="HPFM.COUNTRY"
                          textValue={companyBasic.registeredCountryName}
                        />
                      )}
                    </FormItem>
                  </Col>
                  {registeredCountryCode === 'CN' && (
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get(
                            'sslm.enterpriseInform.view.model.companyInfo.ProvincialAndUrbanAreas'
                          )
                          .d('省/市/区')}
                      >
                        {regionPathNameDom}
                      </FormItem>
                    </Col>
                  )}
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.model.personal.addressDetail')
                        .d('联系地址')}
                    >
                      {getFieldDecorator('addressDetail', {
                        initialValue: companyBasic.addressDetail,
                        rules: [
                          {
                            required: !fieldDisable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.model.personal.addressDetail')
                                .d('联系地址'),
                            }),
                          },
                        ],
                      })(
                        <TLEditor
                          label={intl
                            .get('sslm.enterpriseInform.model.personal.addressDetail')
                            .d('联系地址')}
                          field="addressDetail"
                          token={_token}
                          disabled={fieldDisable}
                          dbc2sbc={false}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={48} className="writable-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.enterpriseInform.model.personal.mobilePhone')
                        .d('手机号')}
                    >
                      {getFieldDecorator('phone', {
                        initialValue: companyBasic.phone,
                        rules: [
                          {
                            required: !fieldDisable,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.enterpriseInform.model.personal.mobilePhone')
                                .d('手机号'),
                            }),
                          },
                          {
                            pattern:
                              form.getFieldValue('internationalTelCode') === '+86'
                                ? PHONE
                                : NOT_CHINA_PHONE,
                            message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                          },
                        ],
                      })(
                        <GlobalPhone
                          form={form}
                          disabled={fieldDisable}
                          phoneField="phone"
                          telCodeField="internationalTelCode"
                          initialValue={companyBasic.internationalTelCode}
                        />
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('sslm.enterpriseInform.model.personal.email').d('邮箱')}
                    >
                      {getFieldDecorator('email', {
                        initialValue: companyBasic.email,
                        rules: [
                          {
                            pattern: EMAIL,
                            message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                          },
                        ],
                      })(<Input inputChinese={false} disabled={fieldDisable} />)}
                    </FormItem>
                  </Col>
                </Row>
                {!supplierFlag && source === 'enterprise' && (
                  <Row gutter={48} className="writable-row">
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.model.personal.validFrom')
                          .d('证件有效期从')}
                      >
                        {getFieldDecorator('buildDate', {
                          initialValue: companyBasic.buildDate
                            ? moment(companyBasic.buildDate)
                            : null,
                          rules: [
                            {
                              required: !fieldDisable,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('sslm.enterpriseInform.model.personal.validFrom')
                                  .d('证件有效期从'),
                              }),
                            },
                          ],
                        })(
                          <DatePicker
                            placeholder=""
                            disabledDate={currentDate =>
                              getFieldValue('licenceEndDate') &&
                              moment(getFieldValue('licenceEndDate')).isBefore(currentDate, 'day')
                            }
                            disabled={fieldDisable}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.enterpriseInform.model.personal.validTo')
                          .d('证件有效期至')}
                      >
                        {getFieldDecorator('licenceEndDate', {
                          initialValue: companyBasic.licenceEndDate
                            ? moment(companyBasic.licenceEndDate)
                            : null,
                          rules: [
                            {
                              required:
                                (isUndefined(currentTermFlag)
                                  ? !companyBasic.longTermFlag
                                  : !currentTermFlag) && !fieldDisable,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('sslm.enterpriseInform.model.personal.validTo')
                                  .d('证件有效期至'),
                              }),
                            },
                          ],
                        })(
                          <DatePicker
                            placeholder=""
                            disabledDate={currentDate =>
                              getFieldValue('buildDate') &&
                              moment(getFieldValue('buildDate')).isAfter(currentDate, 'day')
                            }
                            disabled={
                              fieldDisable ||
                              (isUndefined(currentTermFlag)
                                ? companyBasic.longTermFlag
                                : currentTermFlag)
                            }
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem {...formItemLayout}>
                        {getFieldDecorator('longTermFlag', {
                          initialValue: companyBasic.longTermFlag,
                        })(
                          <Checkbox
                            onChange={this.handleLongTermFlagChange}
                            disabled={fieldDisable}
                          >
                            {intl.get('sslm.enterpriseInform.view.message.longTerm').d('长期')}
                          </Checkbox>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                )}
                {!supplierFlag && source === 'enterprise' && (
                  <Row gutter={48} className="writable-row">
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('spfm.enterprise.message.personal.idCardPositive')
                          .d('身份证国徽面')}
                      >
                        {getFieldDecorator('idFrontUuid', {
                          initialValue: companyBasic.idFrontUuid,
                          rules: [
                            {
                              required:
                                !(changFlag || !savePermissionFlag) && companyBasic.idType === 'I',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('spfm.enterprise.message.personal.idCardPositive')
                                  .d('身份证国徽面'),
                              }),
                            },
                          ],
                        })(
                          <UploadMdal
                            attachmentUUID={companyBasic.idFrontUuid}
                            filePreview
                            bucketName={PRIVATE_BUCKET}
                            bucketDirectory="spfm-comp"
                            viewOnly={changFlag || !savePermissionFlag}
                            single
                            fileType="image/jpeg;image/jpg;image/png;image/bmp"
                            afterOpenUploadModal={uuid => {
                              form.setFieldsValue({ idFrontUuid: uuid });
                            }}
                          />
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('spfm.enterprise.message.personal.idCardReverse')
                          .d('身份证人像面')}
                      >
                        {getFieldDecorator('idBackUuid', {
                          initialValue: companyBasic.idBackUuid,
                          rules: [
                            {
                              required:
                                !(changFlag || !savePermissionFlag) && companyBasic.idType === 'I',
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get('spfm.enterprise.message.personal.idCardReverse')
                                  .d('身份证人像面'),
                              }),
                            },
                          ],
                        })(
                          <UploadMdal
                            attachmentUUID={companyBasic.idBackUuid}
                            afterOpenUploadModal={uuid => {
                              form.setFieldsValue({ idBackUuid: uuid });
                            }}
                            filePreview
                            bucketName={PRIVATE_BUCKET}
                            bucketDirectory="spfm-comp"
                            viewOnly={changFlag || !savePermissionFlag}
                            single
                            fileType="image/jpeg;image/jpg;image/png;image/bmp"
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                )}
              </Form>
            )}
      </Spin>
    );
  }
}
