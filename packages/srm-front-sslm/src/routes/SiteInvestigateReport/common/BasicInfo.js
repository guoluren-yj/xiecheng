/**
 * BasicInfo - 基本信息
 * @date: 2020-05-08
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import moment from 'moment';
import React, { Component } from 'react';
import { Form, Row, Col, Input, Select, Spin, DatePicker } from 'hzero-ui';
import { isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import Lov from 'components/Lov';
import Checkbox from 'components/Checkbox';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId } from 'utils/utils';
import { NOT_CHINA_PHONE, PHONE, EMAIL } from 'utils/regExp';
import formatterCollections from 'utils/intl/formatterCollections';

import GlobalPhone from '@/routes/components/GlobalPhone';
import { formatInternationalTel } from '@/routes/components/utils';

const tenantId = getCurrentOrganizationId();

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@formatterCollections({
  code: ['sslm.siteInvestigateReport'],
})
@Form.create({ fieldNameProp: null })
export default class BasicInfo extends Component {
  componentDidMount() {
    const { form, onRef = () => {} } = this.props;
    onRef(form);
  }

  // 下拉框改变触发
  @Bind()
  handleSelectChange(field, scoreInfoData, val) {
    const { handleCheckedSupplierEvalFlag = e => e } = this.props;
    if (field === 'evalScope') {
      handleCheckedSupplierEvalFlag(scoreInfoData?.state.dataSource || [], val);
    }
  }

  /**
   * 需要供应商反馈信息勾选框勾选联动逻辑
   */
  handleCheckBoxChange = (fields, event, scoreInfoData) => {
    const {
      target: { checked },
    } = event;
    const {
      form: { setFieldsValue, getFieldValue },
      setFieldToState = e => e,
      basicInfo,
      basicInfo: { evalNum },
      handleClearSupplierEvalFlag = e => e,
    } = this.props;
    const evalScope = getFieldValue('evalScope');
    const evalType = getFieldValue('evalType');
    switch (fields) {
      case 'needFeedbackFlag': {
        setFieldToState({ needFeedbackFlag: checked });
        setFieldsValue({ callSuppliersFlag: checked });
        if (evalNum && evalType === 'ONLINE') {
          if (checked && evalScope) {
            this.handleSelectChange('evalScope', scoreInfoData, evalScope || basicInfo.evalScope);
          } else {
            handleClearSupplierEvalFlag(scoreInfoData?.state.dataSource || []);
            setFieldsValue({ evalScope: null });
          }
        }
        break;
      }
      case 'callSuppliersFlag': {
        setFieldToState({ callSuppliersFlag: checked });
        setFieldsValue({ autoPushVendorFlag: checked });
        break;
      }
      default:
        break;
    }
  };

  /**
   * 校验手机号
   * @param {*} rule
   * @param {*} value
   * @param {*} callback
   */
  @Bind()
  mobilephoneValidator(internationalTelCode, value, callback) {
    if (value) {
      const testReg = internationalTelCode === '+86' ? PHONE : NOT_CHINA_PHONE;
      if (!testReg.test(value)) {
        callback(intl.get('hzero.common.validation.phone').d('手机格式不正确'));
      } else {
        callback();
      }
    } else {
      callback();
    }
  }

  render() {
    const {
      form,
      isAmktClient,
      form: { getFieldDecorator = e => e, getFieldValue = e => e, setFieldsValue = e => e } = {},
      customizeCode = '',
      customizeForm,
      custLoading,
      basicInfo = {},
      gradeMethod = [],
      supplierType = [],
      investigationType = [],
      evalScopeList = [],
      queryBasicLoading = false,
      isView = false,
      isPub = false,
      entrance = '',
      evalHeaderId = undefined,
      siteInvestigateReportRemote,
      handleChangeEvalTpl = () => {},
      handleChangeEvalType = () => {},
      scoreInfoData,
    } = this.props;
    const { evalStatus, externalFlag } = basicInfo;
    const isEdit =
      (evalStatus === 'NEW' ||
        evalStatus === undefined ||
        evalStatus === 'FEEDBACK' ||
        evalStatus === 'FEEDBACK_APPROVALED' ||
        evalStatus === 'NEW_APPROVALED') &&
      !isView &&
      !isPub;
    const callSuppliersEditFlag =
      entrance === 'manage' &&
      [undefined, 'NEW', 'APPROVED', 'FEEDBACK', 'FEEDBACK_APPROVALED', 'NEW_APPROVALED'].includes(
        evalStatus
      ) &&
      !isView &&
      !isPub;
    const readOnly =
      entrance === 'manage'
        ? evalStatus !== 'NEW' &&
          evalStatus !== 'REJECTED' &&
          evalStatus !== 'FEEDBACK' &&
          evalStatus !== 'FEEDBACK_APPROVALED' &&
          evalStatus !== 'NEW_APPROVALED' &&
          evalHeaderId !== undefined
        : entrance !== 'filling';
    const evalEditFlag =
      entrance === 'manage'
        ? !evalHeaderId ||
          (!!externalFlag && (evalStatus === 'NEW' || evalStatus === 'NEW_APPROVALED'))
        : false;

    getFieldDecorator('supplierTenantId', {
      initialValue: basicInfo.supplierTenantId,
    });
    getFieldDecorator('supplierCompanyId', {
      initialValue: basicInfo.supplierCompanyId,
    });
    getFieldDecorator('supplierSource', {
      initialValue: basicInfo.supplierSource,
    });
    getFieldDecorator('supplierId', {
      initialValue: basicInfo.supplierId,
    });
    getFieldDecorator('supplierName', {
      initialValue: basicInfo.supplierName,
    });
    // 平台供应商或本地供应商id
    const commonSupplierId = getFieldValue('supplierCompanyId') || getFieldValue('supplierId');

    const needFeedbackDisabled =
      isEdit && evalStatus !== 'FEEDBACK' && evalStatus !== 'FEEDBACK_APPROVALED';

    // 头columns埋点参数
    const basicRowRenderProps = {
      form,
      basicInfo,
      that: this,
    };
    // 如果有埋点，表格增加卖点返回字段
    const rowColumns = siteInvestigateReportRemote ? (
      siteInvestigateReportRemote.process(
        'SSLM_SITE_INVESTIGATE_REPORT_HEADER_ROW_PROCESS',
        <></>,
        basicRowRenderProps
      )
    ) : (
      <></>
    );

    const formDom = (
      <Form
        custLoading={custLoading}
        className="ued-edit-form form-wrap"
        style={{ padding: '0 16px' }}
      >
        {rowColumns}
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.code').d('考察报告编码')}
            >
              {getFieldDecorator('evalNum', {
                initialValue: basicInfo.evalNum,
              })(<span>{basicInfo.evalNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.describe').d('考察报告描述')}
            >
              {isEdit
                ? getFieldDecorator('evalDescription', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.describe')
                            .d('考察报告描述'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalDescription,
                  })(<Input />)
                : getFieldDecorator('evalDescription', {
                    initialValue: basicInfo.evalDescription,
                  })(<span>{basicInfo.evalDescription}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('evalStatus', {
                initialValue: basicInfo.evalStatus,
              })(<span>{basicInfo.evalStatusMeaning}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.creationDate').d('创建时间')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: basicInfo.creationDate,
              })(<span>{dateTimeRender(basicInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.createdBy').d('创建人')}
            >
              {getFieldDecorator('realName', {
                initialValue: basicInfo.realName,
              })(<span>{basicInfo.realName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.createDepartment')
                .d('创建人部门')}
            >
              {isEdit
                ? getFieldDecorator('unitId', {
                    initialValue: basicInfo.unitId,
                  })(
                    <Lov
                      code="SPRM.USER_DEPARTMENT"
                      disabled={!evalHeaderId}
                      queryParams={{ tenantId }}
                      textValue={basicInfo.unitName}
                    />
                  )
                : getFieldDecorator('unitId', {
                    initialValue: basicInfo.unitId,
                  })(<span>{basicInfo.unitName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.company').d('公司')}
            >
              {isEdit && (getFieldValue('evalType') !== 'ONLINE' || basicInfo.evalType !== 'ONLINE')
                ? getFieldDecorator('companyId', {
                    initialValue: basicInfo.companyId,
                  })(
                    <Lov
                      code="SPCM.USER_AUTH.COMPANY"
                      queryParams={{ tenantId }}
                      textValue={basicInfo.companyName}
                      onChange={() => {
                        // 应用商店过来的自带供应商，变更公司不清空，后端校验是否合作
                        if (!isAmktClient) {
                          setFieldsValue({
                            ouId: null,
                            invOrganizationId: null,
                            inventoryId: null,
                            evalTplId: null,
                            supplierCompanyId: null,
                            supplierId: null,
                            supplierContactor: null,
                            supplierContactMail: null,
                            supplierRegisteredAddress: null,
                            supplierLov: null,
                            supplierContactPhone: null,
                            supplierSource: null,
                            supplierName: null,
                          });
                        }
                      }}
                    />
                  )
                : getFieldDecorator('companyId', {
                    initialValue: basicInfo.companyId,
                  })(<span>{basicInfo.companyName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.businessEntity')
                .d('业务实体')}
            >
              {isEdit
                ? getFieldDecorator('ouId', {
                    initialValue: basicInfo.ouId,
                  })(
                    <Lov
                      code="HPFM.OU"
                      disabled={!getFieldValue('companyId')}
                      textValue={basicInfo.ouName}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={() => {
                        setFieldsValue({
                          invOrganizationId: null,
                          inventoryId: null,
                        });
                      }}
                    />
                  )
                : getFieldDecorator('ouId', {
                    initialValue: basicInfo.ouId,
                  })(<span>{basicInfo.ouName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.inventoryOrg').d('库存组织')}
            >
              {isEdit
                ? getFieldDecorator('invOrganizationId', {
                    initialValue: basicInfo.invOrganizationId,
                  })(
                    <Lov
                      code="HPFM.INV_ORG"
                      disabled={!getFieldValue('ouId')}
                      textValue={basicInfo.organizationName}
                      queryParams={{
                        tenantId,
                        ouId: getFieldValue('ouId'),
                      }}
                      onChange={() => {
                        setFieldsValue({
                          inventoryId: null,
                        });
                      }}
                    />
                  )
                : getFieldDecorator('invOrganizationId', {
                    initialValue: basicInfo.invOrganizationId,
                  })(<span>{basicInfo.organizationName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.warehouse').d('库房')}
            >
              {isEdit
                ? getFieldDecorator('inventoryId', {
                    initialValue: basicInfo.inventoryId,
                  })(
                    <Lov
                      code="SODR.INVENTORY"
                      textValue={basicInfo.inventoryName}
                      disabled={!getFieldValue('invOrganizationId')}
                      queryParams={{
                        tenantId,
                        organizationId: getFieldValue('invOrganizationId'),
                      }}
                    />
                  )
                : getFieldDecorator('inventoryId', {
                    initialValue: basicInfo.inventoryId,
                  })(<span>{basicInfo.inventoryName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.scoreWay').d('评分方式')}
            >
              {evalEditFlag
                ? getFieldDecorator('evalType', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.scoreWay')
                            .d('评分方式'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalType,
                  })(
                    <Select
                      allowClear
                      onChange={value => {
                        setFieldsValue({ evalTplId: null, weightedFlag: null });
                        // 切换评分方式
                        handleChangeEvalType(value);
                        handleChangeEvalTpl(false);
                      }}
                    >
                      {gradeMethod.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                : getFieldDecorator('evalType', {
                    initialValue: basicInfo.evalType,
                  })(<span>{basicInfo.evalTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.inspectionTemplate')
                .d('考察模板')}
            >
              {evalEditFlag
                ? getFieldDecorator('evalTplId', {
                    rules: [
                      {
                        required: getFieldValue('evalType') === 'ONLINE',
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.inspectionTemplate')
                            .d('考察模板'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalTplId,
                  })(
                    <Lov
                      code="SSLM.SITE_EVAL_TPL"
                      disabled={getFieldValue('evalType') !== 'ONLINE'}
                      textValue={basicInfo.evalTplName}
                      lovOptions={{
                        displayField: 'evalTplName',
                        valueField: 'evalTplId',
                      }}
                      queryParams={{
                        tenantId,
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={(_, lovRecord) => {
                        setFieldsValue({
                          weightedFlag: lovRecord.weightedFlag ? 1 : 0,
                        });
                        handleChangeEvalTpl(false);
                      }}
                    />
                  )
                : getFieldDecorator('evalTplId', {
                    initialValue: basicInfo.evalTplId,
                  })(<span>{basicInfo.evalTplName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.weightCalculation')
                .d('权重式计算')}
            >
              {isEdit
                ? getFieldDecorator('weightedFlag', {
                    initialValue: basicInfo.weightedFlag || 0,
                  })(<Checkbox disabled />)
                : getFieldDecorator('weightedFlag', {
                    initialValue: basicInfo.weightedFlag,
                  })(yesOrNoRender(basicInfo.weightedFlag))}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.surveyTimeFrom')
                .d('考察时间从')}
            >
              {isEdit
                ? getFieldDecorator('evalDateFrom', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.surveyTimeFrom')
                            .d('考察时间从'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalDateFrom && moment(basicInfo.evalDateFrom),
                  })(
                    <DatePicker
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('evalDateTo') &&
                        moment(getFieldValue('evalDateTo')).isBefore(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )
                : getFieldDecorator('evalDateFrom', {
                    initialValue: basicInfo.evalDateFrom,
                  })(<span>{dateRender(basicInfo.evalDateFrom)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.surveyTimeTo')
                .d('考察时间至')}
            >
              {isEdit
                ? getFieldDecorator('evalDateTo', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.surveyTimeTo')
                            .d('考察时间至'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalDateTo && moment(basicInfo.evalDateTo),
                  })(
                    <DatePicker
                      placeholder=""
                      disabledDate={currentDate =>
                        getFieldValue('evalDateFrom') &&
                        moment(getFieldValue('evalDateFrom')).isAfter(currentDate, 'day')
                      }
                      style={{ width: '100%' }}
                    />
                  )
                : getFieldDecorator('evalDateTo', {
                    initialValue: basicInfo.evalDateTo,
                  })(<span>{dateRender(basicInfo.evalDateTo)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.siteInvestigateReport.modal.mange.supplier').d('供应商')}
            >
              {isEdit && evalStatus !== 'FEEDBACK' && evalStatus !== 'FEEDBACK_APPROVALED'
                ? getFieldDecorator('supplierLov', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.supplier')
                            .d('供应商'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.supplierCompanyId || basicInfo.supplierId,
                  })(
                    <Lov
                      code="SSLM.SITE_SUPPLIER"
                      disabled={isAmktClient}
                      textValue={basicInfo.supplierName}
                      lovOptions={{
                        displayField: 'displaySupplierName',
                        valueField: 'unionKey',
                      }}
                      queryParams={{
                        tenantId,
                        evalTplId: getFieldValue('evalTplId'),
                        companyId: getFieldValue('companyId'),
                      }}
                      onChange={(_, lovRecord) => {
                        const { countryName = '', addressDetail = '', dataType } = lovRecord;
                        const supplierRegisteredAddress =
                          countryName && addressDetail
                            ? `${countryName}${addressDetail}`
                            : countryName || addressDetail;
                        setFieldsValue({
                          supplierTenantId: lovRecord.supplierTenantId,
                          supplierContactor: lovRecord.name,
                          supplierContactMail: lovRecord.mail,
                          supplierRegisteredAddress,
                          supplierContactPhone: lovRecord.mobilephone,
                          internationalTelCode: lovRecord.internationalTelCode,
                          supplierSource: dataType,
                          supplierId: dataType === 'plate' ? null : lovRecord.dataId,
                          supplierCompanyId: dataType === 'plate' ? lovRecord.dataId : null,
                          supplierName:
                            dataType === 'plate'
                              ? lovRecord.supplierCompanyName
                              : lovRecord.supplierName,
                        });
                      }}
                    />
                  )
                : getFieldDecorator('supplierLov', {
                    initialValue: basicInfo.supplierCompanyId || basicInfo.supplierId,
                  })(<span>{basicInfo.supplierName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.supplierContact')
                .d('供应商联系人')}
            >
              {isEdit
                ? getFieldDecorator('supplierContactor', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.supplierContact')
                            .d('供应商联系人'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.supplierContactor,
                  })(<Input disabled={!commonSupplierId} />)
                : getFieldDecorator('supplierContactor', {
                    initialValue: basicInfo.supplierContactor,
                  })(<span>{basicInfo.supplierContactor}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.supplierContactMail')
                .d('供应商联系邮箱')}
            >
              {getFieldDecorator('supplierContactMail', {
                initialValue: basicInfo.supplierContactMail,
                rules: [
                  {
                    pattern: EMAIL,
                    message: intl.get('hzero.common.validation.email').d('邮箱格式不正确'),
                  },
                ],
              })(
                isEdit ? (
                  <Input disabled={!commonSupplierId} />
                ) : (
                  <span>{basicInfo.supplierContactMail}</span>
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.supplierContactPhone')
                .d('供应商联系电话')}
            >
              {getFieldDecorator('supplierContactPhone', {
                initialValue: basicInfo.supplierContactPhone,
                rules: [
                  {
                    validator: (_, value, cb) =>
                      this.mobilephoneValidator(
                        form.getFieldValue('internationalTelCode') ||
                          basicInfo.internationalTelCode,
                        value,
                        cb
                      ),
                  },
                ],
              })(
                isEdit ? (
                  <GlobalPhone
                    form={form}
                    disabled={!commonSupplierId}
                    initialValue={basicInfo.internationalTelCode}
                    phoneField="supplierContactPhone"
                    telCodeField="internationalTelCode"
                    phoneValue={getFieldValue('supplierContactPhone')}
                  />
                ) : (
                  formatInternationalTel(
                    basicInfo.internationalTelMeaning,
                    basicInfo.supplierContactPhone
                  )
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.needSupplierFeedback')
                .d('需要供应商反馈信息')}
            >
              {getFieldDecorator('needFeedbackFlag', {
                initialValue: basicInfo.needFeedbackFlag || 0,
              })(
                // isEdit && evalStatus !== 'FEEDBACK' && evalStatus !== 'FEEDBACK_APPROVALED' ? (
                <Checkbox
                  onChange={e => this.handleCheckBoxChange('needFeedbackFlag', e, scoreInfoData)}
                  disabled={getFieldValue('supplierSource') === 'local' || !needFeedbackDisabled}
                />
                // ) : (
                //   yesOrNoRender(basicInfo.needFeedbackFlag)
                // )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.releasedToSupplier')
                .d('最终考察结果发布至供应商')}
            >
              {getFieldDecorator('callSuppliersFlag', {
                initialValue: basicInfo.callSuppliersFlag || 0,
              })(
                callSuppliersEditFlag ? (
                  <Checkbox
                    onChange={e => this.handleCheckBoxChange('callSuppliersFlag', e)}
                    disabled={getFieldValue('supplierSource') === 'local'}
                  />
                ) : (
                  yesOrNoRender(basicInfo.callSuppliersFlag)
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.supplierType')
                .d('供应商类型')}
            >
              {isEdit
                ? getFieldDecorator('supplierType', {
                    initialValue: basicInfo.supplierType,
                  })(
                    <Select allowClear>
                      {supplierType.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                : getFieldDecorator('supplierType', {
                    initialValue: basicInfo.supplierType,
                  })(<span>{basicInfo.supplierTypeMeaning}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.investigationType')
                .d('考察类型')}
            >
              {isEdit
                ? getFieldDecorator('investigationType', {
                    initialValue: basicInfo.investigationType,
                  })(
                    <Select allowClear>
                      {investigationType.map(item => (
                        <Select.Option value={item.value} key={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )
                : getFieldDecorator('investigationType', {
                    initialValue: basicInfo.investigationType,
                  })(<span>{basicInfo.investigationTypeMeaning}</span>)}
            </FormItem>
          </Col>
          {getFieldValue('evalType') === 'ONLINE' && (
            <Col span={8}>
              <FormItem
                {...formItemLayout}
                label={intl
                  .get('sslm.siteInvestigateReport.modal.mange.evalScope')
                  .d('供应商自评范围')}
              >
                {isEdit && evalStatus !== 'FEEDBACK' && evalStatus !== 'FEEDBACK_APPROVALED'
                  ? getFieldDecorator('evalScope', {
                      initialValue: basicInfo.evalScope,
                    })(
                      <Select
                        onChange={(val, option) => {
                          return (
                            basicInfo.evalNum &&
                            this.handleSelectChange('evalScope', scoreInfoData, val, option)
                          );
                        }}
                        allowClear
                        disabled={!getFieldValue('needFeedbackFlag')}
                      >
                        {evalScopeList.map(item => (
                          <Select.Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Select.Option>
                        ))}
                      </Select>
                    )
                  : getFieldDecorator('evalScope', {
                      initialValue: basicInfo.evalScope,
                    })(<span>{basicInfo.evalScopeMeaning}</span>)}
              </FormItem>
            </Col>
          )}
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.autoPushVendorFlag')
                .d('是否自动发布结果')}
            >
              {getFieldDecorator('autoPushVendorFlag', {
                initialValue: basicInfo.autoPushVendorFlag || 0,
              })(
                callSuppliersEditFlag ? (
                  <Checkbox disabled={!getFieldValue('callSuppliersFlag')} />
                ) : (
                  yesOrNoRender(basicInfo.autoPushVendorFlag || 0)
                )
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.supplierProfile')
                .d('供应商概况')}
            >
              {isEdit
                ? getFieldDecorator('supplierOverview', {
                    initialValue: basicInfo.supplierOverview,
                  })(<TextArea style={{ resize: 'none' }} />)
                : getFieldDecorator('supplierOverview', {
                    initialValue: basicInfo.supplierOverview,
                  })(<span>{basicInfo.supplierOverview}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.supplierRegistAddress')
                .d('供应商注册地址')}
            >
              {isEdit
                ? getFieldDecorator('supplierRegisteredAddress', {
                    initialValue: basicInfo.supplierRegisteredAddress,
                  })(<TextArea style={{ resize: 'none' }} disabled />)
                : getFieldDecorator('supplierRegisteredAddress', {
                    initialValue: basicInfo.supplierRegisteredAddress,
                  })(<span>{basicInfo.supplierRegisteredAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.actualSurveyAddress')
                .d('实际考察地址')}
            >
              {isEdit
                ? getFieldDecorator('evalAddress', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.actualSurveyAddress')
                            .d('实际考察地址'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalAddress,
                  })(<TextArea style={{ resize: 'none' }} />)
                : getFieldDecorator('evalAddress', {
                    initialValue: basicInfo.evalAddress,
                  })(<span>{basicInfo.evalAddress}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl
                .get('sslm.siteInvestigateReport.modal.mange.inspectionInstruct')
                .d('考察说明')}
            >
              {isEdit
                ? getFieldDecorator('evalRemark', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl
                            .get('sslm.siteInvestigateReport.modal.mange.inspectionInstruct')
                            .d('考察说明'),
                        }),
                      },
                    ],
                    initialValue: basicInfo.evalRemark,
                  })(<TextArea style={{ resize: 'none' }} />)
                : getFieldDecorator('evalRemark', {
                    initialValue: basicInfo.evalRemark,
                  })(<span>{basicInfo.evalRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem
              label={intl.get('sslm.siteInvestigateReport.modal.mange.backRemark').d('反馈说明')}
            >
              {getFieldDecorator('backRemark', {
                initialValue: basicInfo.backRemark,
              })(<span>{basicInfo.backRemark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
    return (
      <Spin spinning={queryBasicLoading || false}>
        {isFunction(customizeForm)
          ? customizeForm(
              {
                code: customizeCode, // 必传，和unitCode一一对应
                form: this.props.form, // 无论个性化单元是否只读，均必传
                dataSource: basicInfo, // 必传，从后端接口获取到的数据
                readOnly, // 现场考察报告管理页面可编辑
                isCreate: evalStatus === undefined,
              },
              formDom
            )
          : formDom}
      </Spin>
    );
  }
}
