/**
 * 发起邀请 Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Form, Input, Row, Col, Radio, Icon, DatePicker, Select } from 'hzero-ui';
// eslint-disable-next-line no-unused-vars
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getCurrentOrganizationId } from 'utils/utils';
import LovMulti from 'srm-front-cuz/lib/components/Customize/LovMulti/index';
import Checkbox from 'components/Checkbox';
import moment from 'moment';

import InvestigatePreview from '../components/InvestigatePreview';
import styles from '../index.less';

const tenantId = getCurrentOrganizationId();

const FormItem = Form.Item;
const { TextArea } = Input;
// eslint-disable-next-line prefer-destructuring
const Search = Input.Search;
const RadioGroup = Radio.Group;
// const { Option } = Select;
/**
 * 合作伙伴邀请模态框
 * @extends {Component} - PureComponent
 * @reactProps {String} isSupplier 是供应商 True
 * @reactProps {String} hideModal 关闭模态框的函数
 * @reactProps {String} inviteCompanyName 被邀请的公司Id
 * @reactProps {String} inviteCompanyId 被邀请的公司Id
 * @reactProps {String} inviteTenantId 被邀请的公司租户id
 * @reactProps {Function} invite 确认邀请函数
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: ['SPFM.SUPPLIER_SEARCH.INVITATION_INFO', 'SPFM.PARTNER_INVITE.REGISTER_INFORMATION'],
})
// eslint-disable-next-line no-unused-vars
export default class Invitation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      organizationId,
      form: { getFieldValue },
      invitingInfo,
      idd = [],
      form,
      dataSource = {},
      customizeForm,
    } = this.props;
    const {
      inviteCompanyName,
      companyName,
      supplierName,
      supplierErpCode,
      supplierMail,
      inviteRegisterRemark,
      autosendPartnerInviteFlag,
      autosendInvestigateFlag,
      autobuildPartnerFlag,
      investigateTypeMeaning,
      templateName,
      multiSupplierCategoryDesc,
      categoryName,
      purchaseAgentId,
      purchaseAgentPhone,
      purchaseAgentName,
      internationalTelCode,
      creationDate,
      toCycleStageDescription,
      toCycleStageId,
      salesPersonPhone,
      salesInternationalTelCode,
    } = dataSource;
    const { roleTypeMeaning, levelTypeFlag, mergerInvitationFlag, privateFlag } = invitingInfo;
    const { getFieldDecorator } = form;
    const formLayOut = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const previewTitle = intl.get(`spfm.companySearch.view.message.templateDetail`).d('模板明细');
    const previewProps = {
      previewTitle,
      organizationId,
      investigateTemplateId: getFieldValue('investigateTemplateId'),
      onRef: (ref) => {
        this.handleShowModal = ref;
      },
    };
    return (
      <React.Fragment>
        <div className={styles.content}>
          <div className={styles.form}>
            {customizeForm(
              {
                code: 'SPFM.PARTNER_INVITE.REGISTER_INFORMATION', // 必传，和unitCode一一对应
                form, // 无论个性化单元是否只读，均必传
                dataSource, // 必传，从后端接口获取到的数据
              },
              <Form layout="horizontal">
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.invitationRegistration`)
                        .d('邀请注册公司')}
                      {...formLayOut}
                      style={{ textAlign: 'left' }}
                    >
                      {getFieldDecorator('companyName', {
                        initialValue: companyName,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.companySearch.view.message.invitationRegistration`)
                                .d('邀请注册公司'),
                            }),
                          },
                        ],
                      })(<Search placeholder={companyName} style={{ width: 300 }} disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.InvitePartnerCompanies`)
                        .d('邀约合作公司')}
                      {...formLayOut}
                      style={{ textAlign: 'left' }}
                    >
                      {getFieldDecorator('inviteCompanyName', {
                        initialValue: inviteCompanyName,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.companySearch.view.message.InvitePartnerCompanies`)
                                .d('邀约合作公司'),
                            }),
                          },
                        ],
                      })(
                        <Search placeholder={inviteCompanyName} style={{ width: 300 }} disabled />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.supplierName`)
                        .d('供应商企业')}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {getFieldDecorator('supplierName', {
                        initialValue: supplierName,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.companySearch.view.message.supplierName`)
                                .d('供应商企业'),
                            }),
                          },
                        ],
                      })(<Input style={{ width: 300 }} defaultValue={supplierName} disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.supplierErpCode`)
                        .d('供应商ERP编码')}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {getFieldDecorator('supplierErpCode', {
                        initialValue: supplierErpCode,
                      })(<Input style={{ width: 300 }} defaultValue={supplierErpCode} disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.supplierMail`)
                        .d('供应商邮箱')}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {getFieldDecorator('supplierMail', {
                        initialValue: supplierMail,
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.companySearch.view.message.supplierMail`)
                                .d('供应商邮箱'),
                            }),
                          },
                        ],
                      })(<Input style={{ width: 300 }} defaultValue={supplierMail} disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.supplierAgentPhone`)
                        .d('供应商联系方式')}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 12 }}
                    >
                      {getFieldDecorator('salesPersonPhone', {
                        initialValue: salesPersonPhone,
                      })(
                        <Input
                          style={{ width: '300px' }}
                          defaultValue={salesPersonPhone}
                          disabled
                          addonBefore={getFieldDecorator('salesInternationalTelCode', {
                            initialValue: salesInternationalTelCode || '+86',
                          })(
                            <Select
                              disabled
                              onChange={() => {
                                form.setFieldsValue({ salesPersonPhone: null });
                              }}
                            >
                              {idd.map((item) => {
                                return (
                                  <Select.Option key={item.value} value={item.value}>
                                    {item.meaning}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          )}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.inviteRegisterRemark`)
                        .d('邀请说明')}
                      labelCol={{ span: 4 }}
                      wrapperCol={{ span: 15 }}
                    >
                      {getFieldDecorator('inviteRegisterRemark', {
                        initialValue: inviteRegisterRemark,
                      })(
                        <TextArea
                          style={{ height: '95px', resize: 'none' }}
                          defaultValue={inviteRegisterRemark}
                          readOnly
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.autosendPartnerInviteFlag`)
                        .d('发送邀约')}
                      extra={intl
                        .get('spfm.invitationRegister.view.invitation.remarkOne')
                        .d(
                          '若选择是，则供应商完成注册后将自动收到您发送的合作邀约，否则您需要手动邀约'
                        )}
                      {...formLayOut}
                    >
                      {getFieldDecorator('autosendPartnerInviteFlag', {
                        initialValue: autosendPartnerInviteFlag,
                      })(
                        <RadioGroup name="radio" defaultValue={autosendPartnerInviteFlag}>
                          <Radio value={1} disabled={!autosendPartnerInviteFlag}>
                            {intl.get('spfm.invitationRegister.model.invitation.yes').d('是')}
                          </Radio>
                          <Radio value={0} disabled={autosendPartnerInviteFlag}>
                            {intl.get('spfm.invitationRegister.model.invitation.no').d('否')}
                          </Radio>
                        </RadioGroup>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.companySearch.view.message.autosendInvestigateFlag`)
                        .d('发送调查表')}
                      extra={intl
                        .get('spfm.invitationRegister.view.invitation.remarkTwo')
                        .d(
                          '若选择是，则供应商完成注册并同意邀约后将自动收到您发送的调查表，供应商需填写并提交您审批；否则您需手动发送调查表'
                        )}
                      {...formLayOut}
                    >
                      {getFieldDecorator('autosendInvestigateFlag', {
                        initialValue: autosendInvestigateFlag,
                      })(
                        <RadioGroup name="radiogroup" defaultValue={autosendInvestigateFlag}>
                          <Radio value={1} disabled={!autosendInvestigateFlag}>
                            {intl.get('spfm.invitationRegister.model.invitation.yes').d('是')}
                          </Radio>
                          <Radio value={0} disabled={autosendInvestigateFlag}>
                            {intl.get('spfm.invitationRegister.model.invitation.no').d('否')}
                          </Radio>
                        </RadioGroup>
                      )}
                    </FormItem>
                  </Col>
                </Row>
                {autosendPartnerInviteFlag === 1 && autosendInvestigateFlag === 0 && (
                  <Row style={{ marginBottom: 10 }}>
                    <Col md={24} span={24}>
                      <FormItem
                        label={intl
                          .get('spfm.invitationRegister.model.invitation.autoPartnerFlag')
                          .d('自动建立合作伙伴关系')}
                        extra={intl
                          .get('spfm.invitationRegister.view.invitation.autoPartnerRemark')
                          .d(
                            '若选择是，则供应商完成注册认证后将自动建立合作伙伴关系，无需手动处理邀约'
                          )}
                        {...formLayOut}
                        style={{ width: '100%' }}
                      >
                        {getFieldDecorator('autobuildPartnerFlag', {
                          initialValue: autobuildPartnerFlag,
                        })(
                          <RadioGroup
                            name="autobuildPartnerFlag"
                            defaultValue={autobuildPartnerFlag}
                          >
                            <Radio value={1} disabled={!autobuildPartnerFlag}>
                              {intl.get('hzero.common.status.yes').d('是')}
                            </Radio>
                            <Radio value={0} disabled={autobuildPartnerFlag}>
                              {intl.get('hzero.common.status.no').d('否')}
                            </Radio>
                          </RadioGroup>
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                )}
                {autosendPartnerInviteFlag === 1 && autosendInvestigateFlag === 1 ? (
                  <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                    <Col md={24} span={24}>
                      <FormItem
                        label={intl
                          .get(`spfm.companySearch.view.message. investigateTypeMeaning`)
                          .d('调查类型')}
                        {...formLayOut}
                      >
                        {getFieldDecorator(' investigateTypeMeaning', {
                          initialValue: investigateTypeMeaning,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`spfm.companySearch.view.message.investigateTypeMeaning`)
                                  .d('调查类型'),
                              }),
                            },
                          ],
                        })(
                          <Input
                            defaultValue={investigateTypeMeaning}
                            suffix={<Icon type="down" />}
                            readOnly
                            disabled
                          />
                        )}
                      </FormItem>
                    </Col>
                  </Row>
                ) : null}
                {autosendPartnerInviteFlag === 1 && autosendInvestigateFlag === 1 ? (
                  <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                    <Col md={24} span={24}>
                      <FormItem
                        label={intl
                          .get(`spfm.companySearch.view.message.templateName`)
                          .d('调查表模板')}
                        {...formLayOut}
                      >
                        {getFieldDecorator('templateName', {
                          initialValue: templateName,
                          rules: [
                            {
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl
                                  .get(`spfm.companySearch.view.message.templateName`)
                                  .d('调查表模板'),
                              }),
                            },
                          ],
                        })(<Search defaultValue={templateName} disabled readOnly />)}
                      </FormItem>
                    </Col>
                  </Row>
                ) : null}
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                        .d('供应商分类')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('multiSupplierCategoryDesc', {
                        initialValue: multiSupplierCategoryDesc,
                      })(<Search style={{ width: 300 }} disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.categoryName')
                        .d('准入品类')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('categoryName', {
                        initialValue: categoryName,
                      })(<Search style={{ width: 300 }} defaultValue={categoryName} disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.purchaseAgent')
                        .d('采购员')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('purchaseAgent', {
                        initialValue: purchaseAgentId,
                      })(
                        <LovMulti
                          delimma=","
                          disabled
                          translateData={purchaseAgentName}
                          code="SPFM.PURCHASE_AGENT_NOUSER"
                          queryParams={{ tenantId }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.purchaseAgentPhone')
                        .d('采购员联系方式')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('purchaseAgentPhone', {
                        initialValue: purchaseAgentPhone,
                      })(
                        <Input
                          style={{ width: '300px' }}
                          defaultValue={purchaseAgentPhone}
                          disabled
                          addonBefore={getFieldDecorator('internationalTelCode', {
                            initialValue: internationalTelCode || '+86',
                          })(
                            <Select
                              disabled
                              onChange={() => {
                                form.setFieldsValue({ purchaseAgentPhone: null });
                              }}
                            >
                              {idd.map((item) => {
                                return (
                                  <Select.Option key={item.value} value={item.value}>
                                    {item.meaning}
                                  </Select.Option>
                                );
                              })}
                            </Select>
                          )}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.supplierRoleType')
                        .d('供应商角色')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('roleType', {
                        initialValue: roleTypeMeaning,
                      })(<Input disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.creationDate')
                        .d('邀请时间')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('creationDate', {
                        initialValue: creationDate ? moment(creationDate) : null,
                      })(
                        <DatePicker
                          disabled
                          format={DEFAULT_DATE_FORMAT}
                          placeholder=""
                          style={{ width: 300 }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.levelTypeFlagGroup')
                        .d('集团级')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('levelTypeFlagGroup', {
                        initialValue: levelTypeFlag ? 0 : 1,
                      })(<Checkbox disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.privateFlag')
                        .d('私有化')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('privateFlag', {
                        initialValue: privateFlag,
                      })(<Checkbox disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invite.mergerInvitationFlag')
                        .d('合并邀约')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('mergerInvitationFlag', {
                        initialValue: mergerInvitationFlag ? 1 : 0,
                      })(<Checkbox disabled />)}
                    </FormItem>
                  </Col>
                </Row>
                <Row style={{ marginBottom: 10 }} className={styles['one-col']}>
                  <Col md={24} span={24}>
                    <FormItem
                      label={intl
                        .get(`spfm.invitationRegister.model.invitation.lifeCycle`)
                        .d('生命周期')}
                      {...formLayOut}
                    >
                      {getFieldDecorator('toCycleStageId', {
                        initialValue: toCycleStageId,
                      })(<span>{toCycleStageDescription}</span>)}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </div>
        </div>
        <InvestigatePreview {...previewProps} />
      </React.Fragment>
    );
  }
}
