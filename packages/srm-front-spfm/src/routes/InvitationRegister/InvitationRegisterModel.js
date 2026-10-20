/* eslint-disable no-unused-vars */
/* eslint-disable import/no-named-as-default-member */
/* eslint-disable import/no-named-as-default */
/**
 * InvitationRegisterModel 邀请供应商注册弹框
 * @date: 2018-8-1
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Form, Input, Select, Modal, Checkbox, Row, Col, Button } from 'hzero-ui';
import Lov from 'components/Lov';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isEmpty, isFunction, join, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getUserOrganizationId } from 'utils/utils';
import RadioGroupBox from '_components/RadioGroup';
import remote from 'utils/remote';

import NewLov from '@/routes/components/Lov'; // lov父级不可选
import styles from './InvitationRegisterModel.less';
import LovMultiple from '../Invitation/components/LovMultiple';
import C7nLovMultiple from '../Invitation/components/C7nLovMultiple';
import Invitation from '../Invitation/Invitation';


const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['spfm.invitationRegister', 'spfm.common', 'entity.company', 'spfm.disposeInvite'],
})
@withCustomize({
  unitCode: ['SPFM.SUPPLIER_SEARCH.INVITE_REGISTER'],
})
@remote({
  code: 'SPFM_INVITATION_REGISTER', //
  name: 'inviteRegisterRemote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class InvitationRegisterModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      registerData: {}, // 邀请注册弹框数据源
      userOrganizationId: getUserOrganizationId(),
      defaultCompanyId: null,
      defaultCompanyName: '',
      purchaseSelectedRows: [], // 采购员多选selectedRows集合
      purchaseSelectedRowsBak: [],
      selectedClassifyRows: [],
      invitationProps: {
        inviteVisible: false,
      },
      companySelectedRow: {}, // 已选择的公司
      selectedCategoryRows: [], // 准入品类集合
      investigateSelectedRow: {}, // 已选择调查表模板
      inviteRegisterInfo: {}, // 邀约数据
      cuxSupplierNameProps: {}, // 二开供应商企业字段属性
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    // eslint-disable-next-line react/no-unused-state
    this.setState({ roleTypeSetD: 'SALES' });
    // 处理埋点
    this.handleRemote();
  }

  // 处理埋点
  @Bind()
  handleRemote() {
    const { inviteRegisterRemote } = this.props;
    if (inviteRegisterRemote) {
      const fieldProps = inviteRegisterRemote.process(
        'SPFM_INVITATION_REGISTER.FIELD_PROPS',
        {
          cuxSupplierNameProps: {}, // 供应商企业字段属性
        },
        {}
      );
      const { cuxSupplierNameProps = {} } = fieldProps || {};
      this.setState({
        cuxSupplierNameProps,
      });
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const {
      form: { setFieldsValue, getFieldValue },
    } = this.props;
    const autosendInvestigateFlag = getFieldValue('autosendInvestigateFlag');
    const value = isNil(autosendInvestigateFlag) ? 0 : Number(autosendInvestigateFlag);
    // 个性化处理完毕时重新赋值
    if (prevProps.custLoading && !this.props.custLoading) {
      setFieldsValue({
        autosendInvestigateFlag: value,
      });
    }
    // 关闭打开模态框时，根据个性化配的值重新赋值
    if (!prevState.visible && this.state.visible) {
      setFieldsValue({
        autosendInvestigateFlag: value,
      });
    }
  }

  @Bind()
  showModal() {
    const { purchaseSelectedRows = [] } = this.props;
    this.setState({
      visible: true,
      purchaseSelectedRows,
      purchaseSelectedRowsBak: purchaseSelectedRows,
    });
  }

  @Bind()
  showDefault(deafult) {
    const defaultCompany={};
    if(deafult.companyId){
      defaultCompany.defaultCompanyId= deafult.companyId;
      defaultCompany.defaultCompanyName= deafult.companyName;
    }
    this.setState({
      registerData: deafult,
      ...defaultCompany,
      itemCategorySingleFlag: Number(deafult.itemCategorySingleFlag || 0), // srm-106903 多选lov变单选标识拆分控制 1-单选
      purchaseAgentSingleFlag: Number(deafult.purchaseAgentSingleFlag || 0),
      supplierCategorySingleFlag: Number(deafult.supplierCategorySingleFlag || 0),
    });
  }

  @Bind()
  clearDefault() {
    this.setState({
      defaultCompanyId: null,
      defaultCompanyName: '',
    });
  }

  /**
   * 关闭 模态框
   * @memberof InvitationRegisterModel
   */
  @Bind()
  closeInviteRegisterModal() {
    this.setState({
      visible: false,
      purchaseSelectedRows: [],
      selectedCategoryRows: [], // 清空品类
      selectedClassifyRows: [],
      companySelectedRow: {}, // 已选择的公司
      investigateSelectedRow: {}, // 已选择调查表模板
      inviteRegisterInfo: {}, // 邀约数据
      invitationProps: {
        inviteVisible: false,
      },
    });
    this.props.form.resetFields();
  }

  // 获取自动发动合作邀约的状态
  @Bind()
  onChangePartner(e) {
    const { form } = this.props;
    if (e === 0) {
      form.setFieldsValue({
        investigateType: null,
        inviteInvestigateRemark: null,
        investigateTemplateId: null,
        levelTypeFlag: 1,
        autosendInvestigateFlag: 0,
      });
    }

    // 切换清空供应商分类、准入品类
    form.setFieldsValue({
      multiSupplierCategoryId: null,
      supplierCategoryDescription: null,
      categoryId: null,
      categoryName: null,
      categoryIds: null,
    });
    this.setState({
      selectedClassifyRows: [],
      selectedCategoryRows: [],
    });
  }

  // 获取发送调查表的状态
  @Bind()
  onChange(e) {
    const { form } = this.props;
    if (e === 0) {
      form.setFieldsValue({
        investigateType: null,
        inviteInvestigateRemark: null,
        investigateTemplateId: null,
      });
    }
  }

  // 发送供应商注册邀请
  @Bind()
  sendInviteRegister() {
    const { form, organizationId, inviteRegister, dispatch, inviteRegisterRemote } = this.props;
    const { purchaseSelectedRows, purchaseAgentSingleFlag, investigateSelectedRow } = this.state;
    const singleFlag = purchaseAgentSingleFlag === 1;
    if (isFunction(inviteRegister)) {
      form.validateFields((err, fieldsValue) => {
        if (isEmpty(err)) {
          // 判断调查表是选择，为否且下拉款有值时
          const {
            purchaseAgentName,
            categoryId,
            categoryName,
            levelTypeFlag,
            ...others
          } = fieldsValue;
          // levelTypeFlag 0 - 集团集，1- 公司集，传递数据时需处理
          const newLevelTypeFlag = levelTypeFlag ? 0 : 1;
          const params = {
            body: {
              tenantId: organizationId,
              ...others,
              rePurchaseAgentName: !singleFlag
                ? !isEmpty(purchaseSelectedRows)
                  ? purchaseSelectedRows.map((item) => item.purchaseAgentName).join()
                  : ''
                : purchaseAgentName || '',
              levelTypeFlag: newLevelTypeFlag,
            },
            organizationId,
          };
          const remoteParams= inviteRegisterRemote
          ?inviteRegisterRemote.process("SPFM_INVITATION_REGISTER_INVITE_REGISTER_PARAMS", params)
          :params;
          inviteRegister(remoteParams).then((res) => {
            if (!isEmpty(res)) {
              const { processStatus } = res;
              if (processStatus === 'COMPLETE') {
                // 弹窗提示
                Modal.confirm({
                  title: intl
                    .get('spfm.invitationRegister.view.invitation.cooperateInvitation')
                    .d('该供应商已在平台完成认证，无需重复邀请，是否向该供应商发送合作邀约？'),
                  onOk: () => {
                    // 校验黑名单
                    dispatch({
                      type: 'companySearchSupplier/checkBlacklist',
                      payload: res.companyId,
                    }).then((resp) => {
                      if (resp) {
                        const {
                          categoryIds,
                          multiSupplierCategoryId,
                          purchaseAgentId,
                        } = fieldsValue;
                        const { templateName } = investigateSelectedRow;
                        const data = {
                          ...res,
                          categoryIds, // 准入品类id
                          multiSupplierCategoryId, // 供应商分类id
                          purchaseAgentId,
                          templateName,
                        };
                        this.handleInviteBtnClick(data);
                      }
                    });
                  },
                  okText: intl
                    .get('spfm.invitationRegister.view.invitation.inviteCooperation')
                    .d('邀请合作'),
                  cancelText: intl.get('hzero.common.button.cancel').d('取消'),
                });
              } else {
                notification.success({
                  message: intl
                    .get('spfm.invitationRegister.model.invitationRegister.success')
                    .d('邀请成功'),
                });
                this.closeInviteRegisterModal();
              }
            }
          });
        }
      });
    }
  }

  /**
   * 打开 供应商邀请模态框
   * @param {Object} data - 邀约数据
   * @param {!Number} company.companyId - 公司id
   * @param {!Number} company.tenantId - 公司对应的租户id
   * @param {String} company.companyName - 公司名称
   * @memberof CompanySearch
   */
  @Bind()
  handleInviteBtnClick(data = {}) {
    const {
      invitationProps,
      defaultCompanyId,
      defaultCompanyName,
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
    } = this.state;
    const {
      supplierName,
      partnerCompanyId,
      partnerTenantId,
      roleType,
      autosendInvestigateFlag,
      investigateType,
      investigateTemplateId,
      inviteRegisterRemark,
      categoryIds, // 准入品类id
      multiSupplierCategoryId, // 供应商分类id
      purchaseAgentId,
      levelTypeFlag,
      companyId,
      templateName,
    } = data;
    const inviteRegisterInfo = {
      levelTypeFlag,
      companyId,
      roleType,
      flag: autosendInvestigateFlag,
      investigateType,
      investigateTemplateId,
      inviteRemark: inviteRegisterRemark,
      categoryIds, // 准入品类id
      multiSupplierCategoryId, // 供应商分类id
      purchaseAgentId,
      templateName,
    };
    // 需要打开 邀请模态框
    this.setState(
      {
        invitationProps: {
          ...invitationProps,
          inviteCompanyName: supplierName,
          inviteCompanyId: partnerCompanyId,
          inviteTenantId: partnerTenantId,
          inviteVisible: true,
          defaultCompanyId,
          defaultCompanyName,
          itemCategorySingleFlag, // srm-106903 多选lov变单选标识
          purchaseAgentSingleFlag,
          supplierCategorySingleFlag,
        },
        inviteRegisterInfo,
      },
      () => {
        // 关闭邀请注册弹窗
        this.setState({
          visible: false,
        });
      }
    );
    // 清空邀约注册数据
  }

  /**
   * 关闭 供应商/采购商 邀请模态框
   * @memberof CompanySearch
   */
  @Bind()
  hideModal() {
    const { invitationProps } = this.state;
    this.setState({
      invitationProps: {
        ...invitationProps,
        inviteVisible: false,
      },
    });
  }

  @Bind()
  handleSelectChange(value) {
    const { queryInvestigateTemplates, organizationId, form } = this.props;
    form.setFieldsValue({ investigateTemplateId: undefined });
    queryInvestigateTemplates({
      organizationId,
      ...value,
    });
  }

  /**
   * 保存多选数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  onSaveRecord(selectedCategoryRows) {
    const { form, dispatch } = this.props;
    const { itemCategorySingleFlag } = this.state;
    const singleFlag = itemCategorySingleFlag === 1;
    const newSelectedCategoryRows = singleFlag ? [selectedCategoryRows] : selectedCategoryRows;
    const value = newSelectedCategoryRows.map((o) => o.categoryName);
    const rowKeys = newSelectedCategoryRows.map((o) => o.categoryId);
    form.registerField('categoryIds');
    form.setFieldsValue({ categoryId: rowKeys, categoryIds: rowKeys, categoryName: value });
    if (newSelectedCategoryRows.length !== 0) {
      dispatch({
        type: 'companySearchSupplier/fetchGetPurchaser',
        payload: newSelectedCategoryRows.map((item) => ({ categoryId: item.categoryId })),
      }).then((res) => {
        if (res) {
          // 只带出一个采购员时，带出采购员联系方式
          let newRes = [];
          if (res.length === 1 || singleFlag) {
            // const res0 = res[0] || {};
            // const { purchaseAgentName, purchaseAgentId, contactInfo } = res0;
            if (isEmpty(res)) {
              newRes = this.state.purchaseSelectedRowsBak;
            } else {
              newRes = [res[0]];
            }
            const purchaseAgentName = newRes.map((item) => item.purchaseAgentName).join();
            const purchaseAgentId = newRes.map((item) => item.purchaseAgentId).join();
            const contactInfo = newRes.map((item) => item.contactInfo).join();
            form.setFieldsValue({
              purchaseAgentName,
              purchaseAgentId,
              purchaseAgentPhone: contactInfo,
            });
          } else {
            if (isEmpty(res)) {
              newRes = this.state.purchaseSelectedRowsBak;
            } else {
              newRes = res;
            }
            form.setFieldsValue({
              // purchaseAgentName: join(res.map((n) => n.purchaseAgentName)),
              // purchaseAgentId: join(res.map((n) => n.purchaseAgentId)),
              purchaseAgentName: join(newRes.map((n) => n.purchaseAgentName)),
              purchaseAgentId: join(newRes.map((n) => n.purchaseAgentId)),
              purchaseAgentPhone: null,
            });
          }
          this.setState({
            purchaseSelectedRows: isEmpty(res) ? this.state.purchaseSelectedRowsBak : res,
          });
        }
      });
    }
    this.setState({
      selectedCategoryRows: newSelectedCategoryRows,
    });
    // 清空准入品类，清空采购员
    if (isEmpty(newSelectedCategoryRows)) {
      // form.setFieldsValue({
      //   purchaseAgentName: undefined,
      //   purchaseAgentId: undefined,
      // });
      const { purchaseSelectedRowsBak } = this.state;
      const purchaseAgentName = purchaseSelectedRowsBak
        .map((item) => item.purchaseAgentName)
        .join();
      const purchaseAgentId = purchaseSelectedRowsBak.map((item) => item.purchaseAgentId).join();
      form.setFieldsValue({
        purchaseAgentName,
        purchaseAgentId,
      });
    }
  }

  @Bind()
  changeSelectRows(purchaseSelectedRows) {
    this.setState({ purchaseSelectedRows });
    const onlyOnePurchase = !isEmpty(purchaseSelectedRows) && purchaseSelectedRows.length === 1;
    const purchaseAgentPhoneInfo = onlyOnePurchase ? purchaseSelectedRows[0] : {};
    const { phone, internationalTelCode } = purchaseAgentPhoneInfo;
    const phoneInfo = phone
      ? {
          purchaseAgentPhone: phone,
          internationalTelCode,
        }
      : {};
    const { form } = this.props;
    const value = join(purchaseSelectedRows.map((o) => o.purchaseAgentName));
    const rowKeys = join(purchaseSelectedRows.map((o) => o.purchaseAgentId));
    form.setFieldsValue({
      purchaseAgentId: rowKeys,
      purchaseAgentName: value,
      ...phoneInfo,
    });
  }

  /**
   * 校验供应商分类
   */
  @Bind()
  async checkClassify(selectedClassifyRows) {
    const { dispatch, isSupplier, inviteTenantId } = this.props;
    const supplierCategoryIdList = selectedClassifyRows.map((o) => o.supplierCategoryId);
    const validateFlag = await dispatch({
      type: 'companySearchSupplier/checkClassify',
      payload: {
        supplierCategoryIdList,
        purchaserTenantId: isSupplier ? '' : inviteTenantId,
      },
    });
    return validateFlag;
  }

  @Bind()
  handleClassifyRows(selectedClassifyRows) {
    this.setState({ selectedClassifyRows });
  }

  renderForm() {
    const {
      form: { getFieldDecorator, getFieldsValue, getFieldValue },
      idd = [],
      organizationId,
      confirmLoading = false,
      investigateType,
      customizeForm,
      form,
      custLoading,
      roleTypeSet,
      lifeCycleList,
      searchSupplierRemote,
      purchaseSelectedRows: propsPurchaseRows = [],
    } = this.props;
    const {
      visible,
      registerData,
      userOrganizationId,
      purchaseSelectedRows,
      defaultCompanyName,
      defaultCompanyId,
      selectedCategoryRows = [],
      selectedClassifyRows = [],
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
      cuxSupplierNameProps = {},
    } = this.state;
    // src-20050 一条采购员带出对应的采购员联系方式
    const onlyOnePurchase = !isEmpty(propsPurchaseRows) && propsPurchaseRows.length === 1;
    const purchaseInfo = onlyOnePurchase ? propsPurchaseRows[0] : {};

    const itemCategoryFlag = itemCategorySingleFlag === 1;
    const purchaseFlag = purchaseAgentSingleFlag === 1;
    const supplierCategoryFlag = supplierCategorySingleFlag === 1;
    const formItemLayout = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };

    const { extra: supplierNameExtra } = cuxSupplierNameProps || {};
    return (
      <Modal
        title={intl
          .get('spfm.invitationRegister.view.invitation.invitationRegister')
          .d('邀请供应商注册')}
        visible={visible}
        width={1100}
        loading={custLoading}
        onCancel={this.closeInviteRegisterModal}
        confirmLoading={confirmLoading}
        destroyOnClose
        footer={[
          <Button key="callBack" loading={confirmLoading} onClick={this.closeInviteRegisterModal}>
            {intl.get('spfm.invitationRegister.view.invitation.callBack').d('返回')}
          </Button>,
          <Button type='primary' key="sendInvitation" loading={confirmLoading} onClick={this.sendInviteRegister}>
            {intl.get('spfm.invitationRegister.view.invitation.sendInvitation').d('发送邀请')}
          </Button>,
          searchSupplierRemote && searchSupplierRemote.render("SSLM_COMPANY_SEARCH_SUPPLIER_INVITATION_REGISTER_MODAL_BTNS", null, {
            form,
          }),
        ]}
      >
        {customizeForm(
          {
            code: 'SPFM.SUPPLIER_SEARCH.INVITE_REGISTER', // 必传，和unitCode一一对应
            form, // 无论个性化单元是否只读，均必传
            isCreate: true,
            dataSource: registerData, // 必传，从后端接口获取到的数据
          },
          <Form layout="horizontal" className={styles.formContent}>
            <Row>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get('spfm.invitationRegister.model.invitation.companyId').d('邀请方')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('companyId', {
                    initialValue: defaultCompanyId,
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('spfm.invitationRegister.view.invitation.companyId')
                          .d('请选择邀请方!'),
                      },
                    ],
                  })(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      textValue={defaultCompanyName}
                      queryParams={{ organizationId: userOrganizationId }}
                      onChange={(_, selectedRow) => {
                        this.setState({ companySelectedRow: selectedRow });
                      }}
                    />
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.supplierName')
                    .d('供应商企业')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                  extra={!isNil(supplierNameExtra) ? supplierNameExtra : intl
                    .get('spfm.invitationRegister.view.invitation.supplierNameTips')
                    .d('请完整填写正确有效的企业名称，以校验企业是否已在系统中注册。')}
                >
                  {getFieldDecorator('supplierName', {
                    rules: [
                      {
                        required: true,
                        message: intl
                          .get('spfm.invitationRegister.view.invitation.supplierName')
                          .d('请输入供应商企业!'),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              {!!getFieldsValue().autosendPartnerInviteFlag && (
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.supplierRole')
                      .d('供应商角色')}
                    {...formItemLayout}
                    style={{ width: '100%', marginTop: 5 }}
                  >
                    {getFieldDecorator('roleType', {
                      initialValue: (roleTypeSet[0] || {}).value,
                    })(
                      <Select>
                        {(roleTypeSet || []).map((n) => (
                          <Option key={n.value} value={n.value}>
                            {n.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              )}
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.supplierErpCode')
                    .d('供应商ERP编码')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('supplierErpCode', {})(<Input />)}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.supplierAgentPhone')
                    .d('供应商联系方式')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('salesPersonPhone', {
                    rules: [
                      {
                        pattern:
                          (form.getFieldValue('salesInternationalTelCode') || '+86') === '+86'
                            ? PHONE
                            : NOT_CHINA_PHONE,
                        message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                      },
                    ],
                  })(
                    <Input
                      addonBefore={getFieldDecorator('salesInternationalTelCode', {
                        initialValue: '+86',
                      })(
                        <Select
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
            <Row>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.supplierMail')
                    .d('供应商邮箱')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('supplierMail', {
                    rules: [
                      {
                        type: 'email',
                        message: intl
                          .get('spfm.invitationRegister.view.invitation.supplierMail')
                          .d('邮箱格式不正确!'),
                      },
                      {
                        required: true,
                        message: intl
                          .get('spfm.invitationRegister.view.invitation.noSupplierMail')
                          .d('请输入邮箱!'),
                      },
                    ],
                  })(<Input />)}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.inviteRemark')
                    .d('邀请说明')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('inviteRegisterRemark', { rules: [{ required: false }] })(
                    <TextArea autosize={{ minRows: 3, maxRows: 8 }} />
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get('spfm.invitationRegister.model.invitation.remark').d('调查说明')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('inviteInvestigateRemark')(
                    <TextArea autosize={{ minRows: 3, maxRows: 8 }} disabled={!getFieldsValue().autosendInvestigateFlag} />
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.autoSendInviteFlag')
                    .d('发送邀约')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                  extra={intl
                    .get('spfm.invitationRegister.view.invitation.remarkOne')
                    .d(
                      '若选择是，则供应商完成注册后将自动收到您发送的合作邀约，否则您需要手动邀约'
                    )}
                >
                  {getFieldDecorator('autosendPartnerInviteFlag', {
                    rules: [{ required: true }],
                    initialValue: 1,
                  })(
                    <RadioGroupBox
                      name="autosendPartnerInviteFlag"
                      onChange={this.onChangePartner}
                      optionValueToNum
                      lovCode="HPFM.FLAG"
                    />
                  )}
                </FormItem>
              </Col>
              {!!getFieldsValue().autosendPartnerInviteFlag && (
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.levelTypeFlag')
                      .d('集团级')}
                    {...formItemLayout}
                    style={{ width: '100%' }}
                  >
                    {getFieldDecorator(`levelTypeFlag`, {
                      initialValue: 0,
                    })(
                      <Checkbox checkedValue={1} unCheckedValue={0}>
                        {intl
                          .get(`spfm.companySearch.view.option.GroupLevel`)
                          .d(
                            '若勾选，则供应商同意邀约后，将和您的集团下所有的公司都建立合作伙伴关系'
                          )}
                      </Checkbox>
                    )}
                  </FormItem>
                </Col>
              )}
              {!!getFieldsValue().autosendPartnerInviteFlag && (
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.privateFlag')
                      .d('私有化')}
                    {...formItemLayout}
                    style={{ width: '100%' }}
                  >
                    {getFieldDecorator(`privateFlag`, {
                      initialValue: 0,
                    })(
                      <Checkbox checkedValue={1} unCheckedValue={0}>
                        {intl
                          .get(`spfm.companySearch.view.option.privateFlag`)
                          .d('若勾选，则在同意邀约后，供应商将无法被其他企业发现')}
                      </Checkbox>
                    )}
                  </FormItem>
                </Col>
              )}
            </Row>
            <Row>
              {!!getFieldsValue().autosendPartnerInviteFlag && (
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.sendInvestigation')
                      .d('发送调查表')}
                    {...formItemLayout}
                    style={{ width: '100%' }}
                    extra={intl
                      .get('spfm.invitationRegister.view.invitation.remarkTwo')
                      .d(
                        '若选择是，则供应商完成注册后收到的邀约内将带有您发送的调查表，供应商需填写并提交您审批；否则您需在建立合作关系后手动发送调查表。'
                      )}
                  >
                    {getFieldDecorator('autosendInvestigateFlag', {
                      rules: [{ required: true }],
                      initialValue: 0,
                    })(
                      <RadioGroupBox
                        name="autosendInvestigateFlag"
                        onChange={this.onChange}
                        optionValueToNum
                        lovCode="HPFM.FLAG"
                        disabled={!getFieldsValue().autosendPartnerInviteFlag}
                      />
                    )}
                  </FormItem>
                </Col>
              )}
              {!!getFieldsValue().autosendPartnerInviteFlag &&
                !getFieldsValue().autosendInvestigateFlag && (
                  <Col md={12} span={12}>
                    <FormItem
                      label={intl
                        .get('spfm.invitationRegister.model.invitation.autoPartnerFlag')
                        .d('自动建立合作伙伴关系')}
                      {...formItemLayout}
                      style={{ width: '100%' }}
                      extra={intl
                        .get('spfm.invitationRegister.view.invitation.autoPartnerRemark')
                        .d(
                          '若选择是，则供应商完成注册认证后将自动建立合作伙伴关系，无需手动处理邀约'
                        )}
                    >
                      {getFieldDecorator('autobuildPartnerFlag', {
                        initialValue: 0,
                      })(
                        <RadioGroupBox
                          name="autobuildPartnerFlag"
                          optionValueToNum
                          lovCode="HPFM.FLAG"
                        />
                      )}
                    </FormItem>
                  </Col>
                )}
            </Row>
            <Row>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.investigateType')
                    .d('调查类型')}
                  {...formItemLayout}
                  style={{ width: '100%', marginTop: 5 }}
                >
                  {getFieldDecorator('investigateType', {
                    rules: getFieldsValue().autosendInvestigateFlag
                      ? [
                          {
                            required: true,
                            message: intl
                              .get('spfm.invitationRegister.view.invitation.investigateType')
                              .d('请选择调查类型！'),
                          },
                        ]
                        : [],
                    })(
                      <Select
                        allowClear
                        onChange={this.handleSelectChange}
                        disabled={!getFieldsValue().autosendInvestigateFlag}
                      >
                        {(investigateType || []).map((n) =>
                          (n || {}).value ? (
                            <Option
                              key={n.value}
                              value={n.value}
                              disabled={!getFieldsValue().autosendInvestigateFlag}
                            >
                              {n.meaning}
                            </Option>
                          ) : undefined
                        )}
                      </Select>
                    )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.TemplateId')
                    .d('调查表模板')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {getFieldDecorator('investigateTemplateId', {
                    rules: getFieldsValue().autosendInvestigateFlag
                      ? [
                          {
                            required: true,
                            message: intl
                              .get('spfm.invitationRegister.view.invitation.TemplateId')
                              .d('请选择调查模板'),
                          },
                        ]
                        : [],
                    })(
                      <Lov
                        code="SSLM.INVESTIGATE_TEMPLATE_ID"
                        queryParams={{
                            organizationId,
                            enabledFlag: 1,
                            investigateType: getFieldsValue().investigateType,
                            companyId: getFieldValue("companyId"),
                            assignMenuScope: "srm.partner.my-partner.search-supplier",
                          }}
                        disabled={!getFieldsValue().investigateType}
                        onChange={(_, selectedRow) => {
                            this.setState({ investigateSelectedRow: selectedRow });
                          }}
                      />
                      )}
                </FormItem>
              </Col>
            </Row>
            <Row>
              {!!getFieldsValue().autosendPartnerInviteFlag && (
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                      .d('供应商分类')}
                    {...formItemLayout}
                    style={{ width: '100%' }}
                  >
                    {!supplierCategoryFlag
                      ? getFieldDecorator('multiSupplierCategoryId')(
                        <LovMultiple
                          textField="supplierCategoryDescription"
                          code="SSLM.SUPPLIER_CATEGORY_TREE"
                          selectedRows={selectedClassifyRows}
                          queryParams={{ tenantId: organizationId }}
                          checkData={this.checkClassify}
                          changeSelectRows={this.handleClassifyRows}
                          getCheckboxProps={(record) => ({ disabled: !!+record.hasChild })}
                        />
                        )
                      : getFieldDecorator('multiSupplierCategoryId')(
                        <NewLov
                          parentNodeDisable
                          textField="supplierCategoryDescription"
                          code="SSLM.SUPPLIER_CATEGORY_TREE"
                          queryParams={{ tenantId: organizationId }}
                          checkData={this.checkClassify}
                          onChange={(_, selectedRow) => {
                              this.setState({ selectedClassifyRows: [selectedRow] });
                            }}
                        />
                        )}
                  </FormItem>
                </Col>
              )}
              {!!getFieldsValue().autosendPartnerInviteFlag && (
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get('spfm.invitationRegister.model.invitation.categoryCode')
                      .d('准入品类')}
                    {...formItemLayout}
                    style={{ width: '100%' }}
                  >
                    {!itemCategoryFlag
                      ? getFieldDecorator('categoryId')(
                        <C7nLovMultiple
                          textField="categoryName"
                          code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                          queryParams={{
                              hzeroUIFlag: 1,
                              tenantId: userOrganizationId,
                              businessObjectCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE',
                            }}
                          selectedRows={selectedCategoryRows}
                          changeSelectRows={this.onSaveRecord}
                          tableDsProps={{
                              selection: 'multiple',
                              record: {
                                dynamicProps: {
                                  selectable: (record) => record.get('isCheck') !== false,
                                },
                              },
                            }}
                          tableProps={{
                              treeAsync: true,
                              alwaysShowRowBox: true,
                              virtual: true,
                              virtualCell: true,
                              onRow: ({ record }) => {
                                const nodeProps = {};
                                if (record.get('hasChild') === '0') {
                                  nodeProps.isLeaf = true;
                                }
                                return nodeProps;
                              },
                            }}
                          onBeforeSelect={(record) => {
                              const { selectable } = record || {};
                              return selectable;
                            }}
                        />
                        )
                      : getFieldDecorator('categoryId')(
                        <Lov
                          textField="categoryName"
                          code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                          queryParams={{
                              hzeroUIFlag: 1,
                              tenantId: userOrganizationId,
                              businessObjectCode: 'SRM_C_SRM_SPFM_PARTNER_INVITE',
                            }}
                          onChange={(_, lovRecord) => {
                              form.registerField('categoryIds');
                              form.setFieldsValue({
                                categoryIds: isEmpty(lovRecord) ? [] : [lovRecord.categoryId],
                              });
                            }}
                          onOk={this.onSaveRecord}
                          tableDsProps={{
                              record: {
                                dynamicProps: {
                                  selectable: (record) => record.get('isCheck') !== false,
                                },
                              },
                            }}
                          tableProps={{
                              treeAsync: true,
                              alwaysShowRowBox: true,
                              virtual: true,
                              virtualCell: true,
                              onRow: ({ record }) => {
                                const nodeProps = {};
                                if (record.get('hasChild') === '0') {
                                  nodeProps.isLeaf = true;
                                }
                                return nodeProps;
                              },
                            }}
                          onBeforeSelect={(record) => {
                              const { selectable } = record || {};
                              return selectable;
                            }}
                        />
                        )}
                  </FormItem>
                </Col>
              )}
            </Row>
            <Row>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.purchaseAgentId')
                    .d('采购员')}
                  {...formItemLayout}
                  style={{ width: '100%' }}
                >
                  {!purchaseFlag
                    ? getFieldDecorator('purchaseAgentId', {
                      initialValue: !isEmpty(purchaseSelectedRows)
                        ? purchaseSelectedRows.map((item) => item.purchaseAgentId).join()
                        : '',
                    })(
                      <LovMultiple
                        code="SPFM.PURCHASE_AGENT_NOUSER"
                        textField="purchaseAgentName"
                        queryParams={{ tenantId: userOrganizationId }}
                        selectedRows={purchaseSelectedRows}
                        changeSelectRows={this.changeSelectRows}
                      />
                    )
                    : getFieldDecorator('purchaseAgentId', {
                      initialValue: !isEmpty(purchaseSelectedRows)
                        ? (purchaseSelectedRows[0] || {}).purchaseAgentId
                        : '',
                    })(
                      <Lov
                        code="SPFM.PURCHASE_AGENT_NOUSER"
                        textField="purchaseAgentName"
                        queryParams={{ tenantId: userOrganizationId }}
                        onChange={(_, selectedRow = {}) => {
                          this.setState({ purchaseSelectedRows: [selectedRow] });
                          if (!isEmpty(selectedRow)) {
                            const { internationalTelCode, phone } = selectedRow || {};
                            // 采购员手机号没值不需要带出
                            const phoneInfo = phone
                              ? {
                                internationalTelCode,
                                purchaseAgentPhone: phone,
                              }
                              : {};
                            form.setFieldsValue(phoneInfo);
                          }
                        }}
                      />
                    )}
                  {getFieldDecorator('purchaseAgentName', {
                    initialValue: !isEmpty(purchaseSelectedRows)
                      ? !purchaseFlag
                        ? purchaseSelectedRows.map((item) => item.purchaseAgentName).join()
                        : (purchaseSelectedRows[0] || {}).purchaseAgentName
                      : '',
                  })}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.purchaseAgentPhone')
                    .d('采购员联系方式')}
                  {...formItemLayout}
                  // style={{ width: '100%' }}
                >
                  {getFieldDecorator('purchaseAgentPhone', {
                    initialValue: purchaseInfo.phone,
                    rules: [
                      {
                        pattern:
                          (form.getFieldValue('internationalTelCode') || '+86') === '+86'
                            ? PHONE
                            : NOT_CHINA_PHONE,
                        message: intl.get('hzero.common.validation.phone').d('手机格式不正确'),
                      },
                    ],
                  })(
                    <Input
                      addonBefore={getFieldDecorator('internationalTelCode', {
                        initialValue: purchaseInfo.internationalTelCode || '+86',
                      })(
                        <Select
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
            {!!getFieldsValue().autosendPartnerInviteFlag && (
              <Row>
                <Col md={12} span={12}>
                  <FormItem
                    label={intl
                      .get(`spfm.invitationRegister.model.invitation.lifeCycle`)
                      .d('生命周期')}
                    {...formItemLayout}
                  >
                    {getFieldDecorator('toCycleStageId')(
                      <Select allowClear>
                        {lifeCycleList.map((item) => (
                          <Option value={item.value} key={item.value}>
                            {item.meaning}
                          </Option>
                        ))}
                      </Select>
                    )}
                  </FormItem>
                </Col>
              </Row>
            )}
          </Form>
        )}
      </Modal>
    );
  }

  render() {
    const {
      invitationProps,
      inviteRegisterInfo = {},
      companySelectedRow = {},
      purchaseSelectedRows, // 采购员集合
      selectedClassifyRows, // 供应商分类集合
      selectedCategoryRows, // 准入品类集合
    } = this.state;
    const selectCompanyList = isEmpty(companySelectedRow) ? [] : [companySelectedRow];
    const {
      dispatch,
      roleTypeSet,
      organizationId,
      categoryCodeList,
      loadingFetchcategoryCodeList,
      invitationCommonProps,
      lifeCycleList,
    } = this.props;

    return (
      <React.Fragment>
        {this.renderForm()}
        <Modal
          width={1100}
          destroyOnClose
          visible={invitationProps.inviteVisible}
          onCancel={this.hideModal}
          footer={null}
        >
          <Invitation
            {...invitationProps}
            dispatch={dispatch}
            loadingFetchcategoryCodeList={loadingFetchcategoryCodeList}
            categoryCodeList={categoryCodeList}
            hideModal={this.hideModal}
            organizationId={organizationId}
            roleTypeSet={roleTypeSet || []}
            isSupplier
            {...invitationCommonProps}
            inviteRegisterInfo={inviteRegisterInfo}
            purchaseSelectedRows={purchaseSelectedRows}
            selectedClassifyRows={selectedClassifyRows}
            selectedCategoryRows={selectedCategoryRows}
            selectCompanyList={selectCompanyList}
            lifeCycleList={lifeCycleList}
          />
        </Modal>
      </React.Fragment>
    );
  }
}
