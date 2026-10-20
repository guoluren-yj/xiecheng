/**
 * 发起邀请 Modal
 * @date: 2018-8-4
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { Form, Input, Row, Col, Button, Modal, Checkbox, Select } from 'hzero-ui';
import { isEmpty, isUndefined, isArray, pickBy, values, concat } from 'lodash';
import { Bind } from 'lodash-decorators';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import intl from 'utils/intl';
import { getUserOrganizationId, getCurrentUserId } from 'utils/utils';
import notification from 'utils/notification';

import LovMulti from './components/LovMultiple';
import C7nLovMultiple from './components/C7nLovMultiple';
import InvestigatePreview from './components/InvestigatePreview';
// import MultiSelectModal from './components/MultiSelectModal';
import NewLov from '@/routes/components/Lov'; // lov父级不可选

import styles from './index.less';
import Inviter from './components/Inviter';
import PrivacyPolicy from './components/PrivacyPolicy';

const FormItem = Form.Item;
const { TextArea } = Input;
const { confirm } = Modal;
const { Option } = Select;

const currentUserId = getCurrentUserId();

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
  unitCode: ['SPFM.SUPPLIER_SEARCH.INVITATION_INFO', 'SPFM.PURCHASER_SEARCH.INVITATION_INFO'],
  manualQuery: true,
})
export default class Invitation extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      userOrganizationId: getUserOrganizationId(),
      custLoading: true,
      selectedRows: props.purchaseSelectedRows || [],
      selectedRowsBak: props.purchaseSelectedRows || [],
      selectedCategoryRows: props.selectedCategoryRows || [],
      selectedClassifyRows: props.selectedClassifyRows || [], // 供应商分类
      selectedPurchaseClassifyRows: [], // 采购方分类
      selectCompanyList: props.selectCompanyList || props.defaultCompanyList || [], // 公司集合
      platformPolicyVisible: false,
      policyText: {},
      verificationPlatFormText: [],
    };

    const { queryUnitConfig, isSupplier, inviteTenantId } = props;
    if (queryUnitConfig) {
      if (isSupplier) {
        queryUnitConfig();
      } else {
        queryUnitConfig({ customizeTenantId: inviteTenantId });
      }
    }
  }

  componentDidMount(){
    const {
      form,
      searchSupplierRemote,
      inviteCompanyId,
      inviteCompanyName,
    } = this.props;
    if (searchSupplierRemote && searchSupplierRemote.event) {
      const eventProps = {
        form,
        inviteCompanyId,
        inviteCompanyName,
      };
      searchSupplierRemote.event.fireEvent('cuxHandleInviteInit', eventProps);
    }
  }

  categoryForm;

  @Bind()
  changeSelectRows(selectedRows) {
    this.setState({ selectedRows });
  }

  @Bind()
  onSaveCompany(selectedRows) {
    this.setState({ selectCompanyList: selectedRows });
  }

  /**
   *确定发送邀请
   *
   * @memberof Invitation
   */
  @Bind()
  handleInvitation() {
    const { form, invite, inviteCompanyId, inviteTenantId, platformPolicyText = [], privacyPolicyText = [] } = this.props;
    form.validateFields((err, filesValue) => {
      const {
        flag,
        levelTypeCom,
        levelTypeFlag,
        companyIds,
        categoryId,
        categoryName,
        ...other
      } = filesValue;
      const newCompanyIds =
        isArray(companyIds) || isUndefined(companyIds) ? companyIds : [companyIds];
      if (!err) {
        // 获取只有静态文本的对象
        const policyObj = pickBy(filesValue, (value, key) => key.includes('policy'));
        // 判断静态文本是否都已阅读
        const valueArray = values(policyObj);
        const isArrayFlag = !!isArray(valueArray);
        let checkedFlag = false;
        if (isArrayFlag) {
          const filterArray = valueArray.filter((n) => !n) || [];
          checkedFlag = isEmpty(filterArray);
        }
        if (checkedFlag) {
          confirm({
            title: intl.get(`hzero.common.message.confirm.invite`).d('是否确认邀请'),
            onOk() {
              invite({
                ...other,
                inviteCompanyId,
                inviteTenantId,
                levelTypeFlag: levelTypeFlag === 1 ? 0 : 1,
                companyIds: newCompanyIds,
                consentFormProcessor: currentUserId,
              });
            },
            onCancel() {},
          });
        } else {
          const allPolicyText = concat(platformPolicyText, privacyPolicyText);
          this.setState({verificationPlatFormText: allPolicyText.filter(n => !form.getFieldValue(`policy${n.textId}`))}, ()=>{
            this.onHandlePolicyModal(this.state.verificationPlatFormText[0]);
          });
        }
      }
    });
  }

  /**
   * 判断调查表类型和模板是否必填
   */
  @Bind()
  handleCheckChange() {
    const { form } = this.props;
    if (form.getFieldValue('flag') === 1) {
      form.resetFields(['investigateType', 'investigateTemplateId', 'remark']);
    }
  }

  /**
   * 改变调查类型
   */
  @Bind()
  handleSelectChange() {
    const { form } = this.props;
    form.resetFields('investigateTemplateId');
  }

  @Bind()
  handleLevelCheckChange(type) {
    if (type === 'com') {
      this.props.form.setFieldsValue({
        levelTypeCom: 1,
        levelTypeOrg: 0,
      });
    } else {
      this.props.form.setFieldsValue({
        levelTypeCom: 0,
        levelTypeOrg: 1,
      });
    }
  }

  /**
   * 保存多选数据
   * @param {Array} record 弹窗中选择的多条采购负责人数据
   */
  @Bind()
  onSaveRecord(selectedCategoryRows) {
    const { form, dispatch, itemCategorySingleFlag } = this.props;
    // const { selectedCategoryRows = [], selectedCategoryRowKeys = [] } = this.state;
    const newSelectedCategoryRows =
      itemCategorySingleFlag === 1 ? [selectedCategoryRows] : selectedCategoryRows;

    const value = newSelectedCategoryRows.map((o) => o.categoryName);
    const rowKeys = newSelectedCategoryRows.map((o) => o.categoryId);
    form.registerField('categoryIds');
    form.setFieldsValue({ categoryIds: rowKeys, categoryName: value });
    if (newSelectedCategoryRows.length !== 0) {
      dispatch({
        type: 'companySearchSupplier/fetchGetPurchaser',
        payload: newSelectedCategoryRows.map((item) => ({ categoryId: item.categoryId })),
      }).then((res) => {
        if (res && isArray(res)) {
          // 带出多条采购员
          let newRes = [];
          if (itemCategorySingleFlag === 1) {
            // newRes = isEmpty(res) ? [] : [res[0]];
            if (isEmpty(res)) {
              newRes = this.state.selectedRowsBak;
            } else {
              newRes = [res[0]];
            }
          } else if (isEmpty(res)) {
            newRes = this.state.selectedRowsBak;
          } else {
            newRes = res;
          }
          const purchaseAgentName = newRes.map((item) => item.purchaseAgentName).join();
          const purchaseAgentId = newRes.map((item) => item.purchaseAgentId).join();
          form.setFieldsValue({
            purchaseAgentName,
            purchaseAgentId,
          });
          this.setState({
            selectedRows: isEmpty(res) ? this.state.selectedRowsBak : res,
          });
        }
      });
    }
    this.setState({
      categoryName: value,
      selectedCategoryRows: newSelectedCategoryRows,
    });
    // 清空准入品类，清空采购员
    if (isEmpty(newSelectedCategoryRows)) {
      // form.setFieldsValue({
      //   purchaseAgentName: undefined,
      //   purchaseAgentId: undefined,
      // });
      const { selectedRowsBak } = this.state;
      const purchaseAgentName = selectedRowsBak.map((item) => item.purchaseAgentName).join();
      const purchaseAgentId = selectedRowsBak.map((item) => item.purchaseAgentId).join();
      form.setFieldsValue({
        purchaseAgentName,
        purchaseAgentId,
      });
    }
  }

  // 清空多选数据
  // @Bind()
  // emitEmpty() {
  //   const {
  //     form: { setFieldsValue },
  //   } = this.props;
  //   setFieldsValue({
  //     executedBys: undefined,
  //     categoryName: undefined,
  //     purchaseAgentName: undefined,
  //     purchaseAgentId: undefined,
  //   });
  //   this.setState({
  //     categoryName: undefined,
  //   });
  // }

  /**
   * 校验供应商分类
   */
  @Bind()
  async checkClassify(selectedClassifyRows) {
    const { dispatch, isSupplier, inviteTenantId } = this.props;
    const supplierCategoryIdList = selectedClassifyRows.map((o) => o.supplierCategoryId);
    const type = isSupplier
      ? 'companySearchSupplier/checkClassify'
      : 'companySearchPurchaser/checkClassify';
    const validateFlag = await dispatch({
      type,
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

  @Bind()
  handlePurchaseClassifyRows(selectedPurchaseClassifyRows) {
    this.setState({ selectedPurchaseClassifyRows });
  }

  // srm-3500 个性化改造 -xiongjg24199
  renderSupplierForm() {
    const {
      userOrganizationId,
      selectedRows = [],
      selectedCategoryRows,
      selectedClassifyRows,
      selectCompanyList,
    } = this.state;
    const {
      form,
      hideModal,
      organizationId,
      saving,
      inviteData={},
      customizeForm = () => {},
      defaultCompanyId = '',
      inviterData,
      onQueryInviterData,
      defaultCompanyName = '',
      itemCategorySingleFlag,
      purchaseAgentSingleFlag,
      supplierCategorySingleFlag,
      custLoading,
      inviteCompanyId,
      inviteCompanyName,
      roleTypeSet = [],
      investigateTypeList = [],
      inviteRegisterInfo = {}, // 邀约注册数据
      lifeCycleList = [],
      searchSupplierRemote,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const isCheck = getFieldValue('flag') !== 0;
    const formLayOut = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    const { categoryName } = this.state;
    if (custLoading !== this.state.custLoading) {
      this.forceUpdate();
    }
    this.setState({ custLoading });
    const itemCategoryFlag = itemCategorySingleFlag === 1;
    const purchaseFlag = purchaseAgentSingleFlag === 1;
    const supplierCategoryFlag = supplierCategorySingleFlag === 1;
    let companyIdList =
      getFieldValue('levelTypeFlag') && defaultCompanyName ? [defaultCompanyId] : !isEmpty(selectCompanyList) ? selectCompanyList.map(e => e.companyId) : null;
    let newCompanyName = defaultCompanyName;
    if (!isEmpty(inviteRegisterInfo)) {
      companyIdList = [inviteRegisterInfo.companyId];
      // 集团集只取一个公司的名称
      const newSelectCompany = isEmpty((selectCompanyList || [])[0])
        ? ''
        : (selectCompanyList || [])[0].companyName;
      newCompanyName = getFieldValue('levelTypeFlag') ? newSelectCompany : '';
    }
    const levelTypeFlagValue = !isEmpty(inviteRegisterInfo)
      ? {
          initialValue: inviteRegisterInfo.levelTypeFlag ? 0 : 1,
        }
      : {};
    const investigateTypeValue = getFieldValue('investigateType');
    const companyIdsValue = getFieldValue("companyIds");
    return (
      <React.Fragment loading={custLoading}>
        {customizeForm(
          {
            code: 'SPFM.SUPPLIER_SEARCH.INVITATION_INFO', // 必传，和unitCode一一对应
            form: this.props.form, // 无论个性化单元是否只读，均必传
            gutter: 0,
            isCreate: true,
            dataSource: inviteData, // 必传，从后端接口获取到的数据
          },
          <Form layout="horizontal">
            <Row style={{ marginBottom: 10 }}>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.levelTypeOrg`).d('集团级')}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  style={{ textAlign: 'left' }}
                >
                  {getFieldDecorator('levelTypeFlag', {
                    ...levelTypeFlagValue,
                  })(
                    <Checkbox
                      defaultChecked
                      checkedValue={1}
                      unCheckedValue={0}
                      onChange={() => {
                        form.resetFields('companyIds');
                      }}
                    >
                      {intl
                        .get(`spfm.companySearch.view.message.groupLevelNotice`)
                        .d(
                          '若勾选，则在供应商同意邀约后，将和您的集团下所有的公司都建立合作伙伴关系'
                        )}
                    </Checkbox>
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.privateFlag`).d('私有化')}
                  labelCol={{ span: 4 }}
                  wrapperCol={{ span: 20 }}
                  style={{ textAlign: 'left' }}
                >
                  {getFieldDecorator('privateFlag')(
                    <Checkbox defaultChecked={false} checkedValue={1} unCheckedValue={0}>
                      {intl
                        .get(`spfm.companySearch.view.message.privateFlagNotice`)
                        .d('若勾选，则在同意邀约后，供应商将无法被其他企业发现')}
                    </Checkbox>
                  )}
                </FormItem>
              </Col>
              <Col>
                <FormItem>
                  {getFieldDecorator('groupLevelSupplierFlag', {
                    initialValue: 0,
                  })}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ marginBottom: 10 }}>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.inviter`).d('邀请方')}
                  {...formLayOut}
                  style={{ textAlign: 'left' }}
                >
                  {getFieldDecorator('companyIds', {
                    initialValue: companyIdList,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfm.companySearch.view.message.inviter`).d('邀请方'),
                        }),
                      },
                    ],
                  })(
                    getFieldValue('levelTypeFlag') ? (
                      <Lov
                        code="SPFM.USER_AUTHORITY_COMPANY"
                        textValue={newCompanyName}
                        queryParams={{
                          organizationId: userOrganizationId,
                          // 集团集邀约，传一个标识给后端适配器
                          levelTypeFlag: 1,
                        }}
                      />
                    ) : (
                      <Inviter
                        onQueryInviterData={onQueryInviterData}
                        queryParams={{ organizationId: userOrganizationId }}
                        inviterData={inviterData}
                        selectedRows={selectCompanyList}
                        changeSelectRows={this.onSaveCompany}
                      />
                    )
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.supplierRole`).d('供应商角色')}
                  {...formLayOut}
                >
                  {getFieldDecorator('roleType', {
                    initialValue: (roleTypeSet[0] || {}).value,
                  })(
                    <Select defaultValue="SALES">
                      {roleTypeSet.map((item) => {
                        return (
                          <Select.Option key={item.value} value={item.value}>
                            {item.meaning}
                          </Select.Option>
                        );
                      })}
                    </Select>
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get(`spfm.companySearch.view.message.sendInvestigation`)
                    .d('发送调查表')}
                  {...formLayOut}
                >
                  {getFieldDecorator('flag', {
                    // rules: [{ required: true, message: '发送调查表不能为空' }],
                    initialValue: !isEmpty(inviteRegisterInfo) ? inviteRegisterInfo.flag : 1,
                  })(
                    <Checkbox
                      onChange={this.handleCheckChange}
                      checkedValue={1}
                      unCheckedValue={0}
                    />
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.investigateType`).d('调查类型')}
                  {...formLayOut}
                >
                  {getFieldDecorator('investigateType', {
                    initialValue: !isEmpty(inviteRegisterInfo)
                      ? inviteRegisterInfo.investigateType
                      : undefined,
                    rules: isCheck
                      ? [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.companySearch.view.message.investigateType`)
                                .d('调查类型'),
                            }),
                          },
                        ]
                      : [],
                  })(
                    <Select allowClear disabled={!isCheck} onChange={this.handleSelectChange}>
                      {investigateTypeList.map((item) => {
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
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get(`spfm.companySearch.view.message.investigateTemplate`)
                    .d('调查表模板')}
                  {...formLayOut}
                >
                  {getFieldDecorator('investigateTemplateId', {
                    initialValue: !isEmpty(inviteRegisterInfo)
                      ? inviteRegisterInfo.investigateTemplateId
                      : undefined,
                    rules: isCheck
                      ? [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.companySearch.view.message.investigateTemplateId`)
                                .d('调查表模板'),
                            }),
                          },
                        ]
                      : [],
                  })(
                    <Lov
                      disabled={!isCheck || isEmpty(investigateTypeValue)}
                      code="SSLM.INVESTIGATE_TEMPLATE_ID"
                      queryParams={{
                        organizationId,
                        enabledFlag: 1,
                        investigateType: investigateTypeValue,
                        assignMenuScope: "srm.partner.my-partner.search-supplier",
                        companyIds: isArray(companyIdsValue)?companyIdsValue.join():companyIdsValue,
                      }}
                      textValue={
                        !isEmpty(inviteRegisterInfo) ? inviteRegisterInfo.templateName : ''
                      }
                    />
                  )}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.disposeInvite.view.message.remark`).d('调查说明')}
                  {...formLayOut}
                >
                  {getFieldDecorator('remark')(<Input disabled={!isCheck} />)}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.categoryCode')
                    .d('准入品类')}
                  {...formLayOut}
                >
                  {!itemCategoryFlag
                    ? getFieldDecorator('categoryId', {
                        initialValue: !isEmpty(selectedCategoryRows)
                          ? selectedCategoryRows.map((item) => item.categoryId).join()
                          : '',
                      })(
                        <C7nLovMultiple
                          textField="categoryName"
                          code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                          textValue={categoryName}
                          queryParams={{hzeroUIFlag: 1, tenantId: userOrganizationId, businessObjectCode: "SRM_C_SRM_SPFM_PARTNER_INVITE" }}
                          selectedRows={selectedCategoryRows}
                          changeSelectRows={this.onSaveRecord}
                          tableDsProps={{
                            selection: 'multiple',
                            record: {
                              dynamicProps: {
                                selectable: record => record.get('isCheck') !== false,
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
                          onBeforeSelect={record => {
                            const { selectable } = record || {};
                            return selectable;
                          }}
                        />
                      )
                    : getFieldDecorator('categoryId', {
                        initialValue: !isEmpty(selectedCategoryRows)
                          ? (selectedCategoryRows[0] || {}).categoryId
                          : '',
                      })(
                        <Lov
                          textField="categoryName"
                          code="SMDM.CATEGORY.LEVEL_CONTROL_TREE"
                          queryParams={{hzeroUIFlag: 1, tenantId: userOrganizationId, businessObjectCode: "SRM_C_SRM_SPFM_PARTNER_INVITE" }}
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
                                selectable: record => record.get('isCheck') !== false,
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
                          onBeforeSelect={record => {
                            const { selectable } = record || {};
                            return selectable;
                          }}
                        />
                      )}
                  {getFieldDecorator('categoryName', {
                    initialValue: !isEmpty(selectedCategoryRows)
                      ? !itemCategoryFlag
                        ? selectedCategoryRows.map((item) => item.categoryName).join()
                        : (selectedCategoryRows[0] || {}).categoryName
                      : '',
                  })}
                  {getFieldDecorator('categoryIds', {
                    initialValue: !isEmpty(selectedCategoryRows)
                      ? !itemCategoryFlag
                        ? selectedCategoryRows.map((o) => o.categoryId)
                        : [selectedCategoryRows].map((o) => o.categoryId)
                      : undefined,
                  })}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get('spfm.invitationRegister.model.invitation.purchaseAgentId')
                    .d('采购员')}
                  {...formLayOut}
                >
                  {!purchaseFlag
                    ? getFieldDecorator('purchaseAgentId', {
                        initialValue: !isEmpty(selectedRows)
                          ? selectedRows.map((item) => item.purchaseAgentId).join()
                          : '',
                      })(
                        <LovMulti
                          textField="purchaseAgentName"
                          code="SPFM.PURCHASE_AGENT_NOUSER"
                          queryParams={{ tenantId: userOrganizationId }}
                          selectedRows={selectedRows}
                          changeSelectRows={this.changeSelectRows}
                        />
                      )
                    : getFieldDecorator('purchaseAgentId', {
                        initialValue: !isEmpty(selectedRows)
                          ? (selectedRows[0] || {}).purchaseAgentId
                          : '',
                      })(
                        <Lov
                          textField="purchaseAgentName"
                          code="SPFM.PURCHASE_AGENT_NOUSER"
                          queryParams={{ tenantId: userOrganizationId }}
                        />
                      )}
                  {getFieldDecorator('purchaseAgentName', {
                    initialValue: !isEmpty(selectedRows)
                      ? !purchaseFlag
                        ? selectedRows.map((item) => item.purchaseAgentName).join()
                        : (selectedRows[0] || {}).purchaseAgentName
                      : '',
                  })}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.inviteRemark`).d('邀请说明')}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('inviteRemark', {
                    initialValue: !isEmpty(inviteRegisterInfo)
                      ? inviteRegisterInfo.inviteRemark
                      : undefined,
                    // rules: [{ required: true, message: '邀请说明不能为空' }],
                  })(<TextArea style={{ height: '95px', resize: 'none' }} />)}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                    .d('供应商分类')}
                  {...formLayOut}
                >
                  {!supplierCategoryFlag
                    ? getFieldDecorator('multiSupplierCategoryId', {
                        initialValue: !isEmpty(selectedClassifyRows)
                          ? selectedClassifyRows.map((item) => item.categoryId).join()
                          : '',
                      })(
                        <LovMulti
                          textField="supplierCategoryDescription"
                          code="SSLM.SUPPLIER_CATEGORY_TREE"
                          selectedRows={selectedClassifyRows}
                          checkData={this.checkClassify}
                          changeSelectRows={this.handleClassifyRows}
                          queryParams={{ tenantId: organizationId }}
                          getCheckboxProps={(record) => ({ disabled: record.hasChild })}
                        />
                      )
                    : getFieldDecorator('multiSupplierCategoryId', {
                        initialValue: !isEmpty(selectedClassifyRows)
                          ? (selectedClassifyRows[0] || {}).categoryId
                          : '',
                      })(
                        <NewLov
                          parentNodeDisable
                          textField="supplierCategoryDescription"
                          code="SSLM.SUPPLIER_CATEGORY_TREE"
                          checkData={this.checkClassify}
                          queryParams={{ tenantId: organizationId }}
                        />
                      )}
                  {getFieldDecorator('supplierCategoryDescription', {
                    initialValue: !isEmpty(selectedClassifyRows)
                      ? !supplierCategoryFlag
                        ? selectedClassifyRows
                            .map((item) => item.supplierCategoryDescription)
                            .join()
                        : (selectedClassifyRows[0] || {}).supplierCategoryDescription
                      : '',
                  })}
                </FormItem>
              </Col>
              <Col md={12} span={12}>
                <FormItem
                  label={intl
                    .get(`spfm.invitationRegister.model.invitation.lifeCycle`)
                    .d('生命周期')}
                  {...formLayOut}
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
          </Form>
        )}
        <Form>
          <Row>
            <Col offset={4}>
              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  onClick={this.handleInvitation}
                >
                  {intl.get(`spfm.companySearch.view.option.confirmInvitation`).d('确认邀请')}
                </Button>
                <Button className={styles.button} onClick={hideModal}>
                  {intl.get(`hzero.common.button.cancel`).d('取消')}
                </Button>
                {getFieldValue('investigateTemplateId') && (
                  <Button className={styles.button} onClick={this.handleShowModal}>
                    {intl.get(`spfm.companySearch.view.message.templatePreview`).d('预览模板')}
                  </Button>
                )}
                {searchSupplierRemote && searchSupplierRemote.render("SSLM_COMPANY_SEARCH_SUPPLIER_INVITATION_MODAL_BTNS", null, {
                  form: this.props.form,
                  inviteCompanyId,
                  inviteCompanyName,
                })}
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }

  /**
   * 查询项目采购负责人lov
   */
  // @Bind()
  // handleFecthRef(ref = {}) {
  //   this.form = (ref.props || {}).form;
  // }

  // srm-3500 个性化改造 -xiongjg24199
  renderPurchaserForm() {
    // const lovClassNames = ['lov-input'];
    // lovClassNames.push('lov-suffix');
    // const suffix = (
    //   <React.Fragment>
    //     <Icon key="clear" className="lov-clear" type="close-circle" onClick={this.handleClear} />
    //     {this.searchButton()}
    //   </React.Fragment>
    // );
    const { userOrganizationId, selectedPurchaseClassifyRows } = this.state;
    const {
      form,
      hideModal,
      saving,
      supplierCategoryFlag = {},
      inviteTenantId,
      custLoading,
      customizeForm = () => {},
      platformPolicyText = [],
      privacyPolicyText = [],
    } = this.props;
    const { getFieldDecorator } = form;
    const { settingValue } = supplierCategoryFlag;
    const formLayOut = {
      labelCol: { span: 8 },
      wrapperCol: { span: 16 },
    };
    if (custLoading !== this.state.custLoading) {
      this.forceUpdate();
    }
    this.setState({ custLoading });

    const policyProps = {
      form,
      platformPolicyText,
      privacyPolicyText,
      onHandlePolicyModal: this.onHandlePolicyModal,
    };
    return (
      <React.Fragment loading={custLoading}>
        {customizeForm(
          {
            code: 'SPFM.PURCHASER_SEARCH.INVITATION_INFO', // 必传，和unitCode一一对应
            form: this.props.form, // 无论个性化单元是否只读，均必传
            gutter: 0,
            isCreate: true,
            // dataSource: {}, // 必传，从后端接口获取到的数据
          },
          <Form layout="horizontal">
            <Row style={{ marginBottom: 10 }}>
              <Col>
                <FormItem>
                  {getFieldDecorator('levelTypeCom', {
                    initialValue: 0,
                  })}
                </FormItem>
              </Col>
              <Col md={14} span={12}>
                <FormItem
                  label={intl
                    .get(`spfm.companySearch.view.message.groupLevelSupplierFlag`)
                    .d('集团级供应商')}
                  {...formLayOut}
                  style={{ textAlign: 'left' }}
                >
                  {getFieldDecorator('groupLevelSupplierFlag', {
                    initialValue: 0,
                  })(
                    <Checkbox checkedValue={1} unCheckedValue={0}>
                      {intl
                        .get(`spfm.companySearch.view.message.groupLevelMsg`)
                        .d('若勾选，则您的公司将给采购方集团下所有公司发送邀约')}
                    </Checkbox>
                  )}
                </FormItem>
              </Col>
            </Row>
            <Row style={{ marginBottom: 10 }}>
              <Col md={14} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.inviter`).d('邀请方')}
                  {...formLayOut}
                  style={{ textAlign: 'left' }}
                >
                  {getFieldDecorator('companyId', {
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`spfm.companySearch.view.message.inviter`).d('邀请方'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="SPFM.USER_AUTHORITY_COMPANY"
                      queryParams={{ organizationId: userOrganizationId }}
                    />
                  )}
                </FormItem>
              </Col>
            </Row>
            {Number(settingValue) ? (
              <Row style={{ marginBottom: 10 }}>
                <Col md={14} span={12}>
                  <FormItem
                    label={intl
                      .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                      .d('供应商分类')}
                    {...formLayOut}
                    style={{ textAlign: 'left' }}
                  >
                    {getFieldDecorator('multiSupplierCategoryId', {
                      rules: [
                        {
                          required: true,
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`spfm.invitationRegister.model.invitation.supplierCategoryCode`)
                              .d('供应商分类'),
                          }),
                        },
                      ],
                    })(
                      <LovMulti
                        textField="supplierCategoryDescription"
                        code="SSLM.SUPPLIER_CATEGORY_TREE"
                        selectedRows={selectedPurchaseClassifyRows}
                        checkData={this.checkClassify}
                        changeSelectRows={this.handlePurchaseClassifyRows}
                        queryParams={{ queryTenantId: inviteTenantId }}
                        getCheckboxProps={(record) => ({ disabled: record.hasChild })}
                      />
                      // <React.Fragment>
                      //   <Tooltip
                      //     title={isArray(supplierCategoryCode) ? supplierCategoryCode.join() : ''}
                      //   >
                      //     <Input
                      //       readOnly
                      //       suffix={suffix}
                      //       onChange={(e) => this.saveRecordRows(e.target.value)}
                      //       className={lovClassNames.join(' ')}
                      //       value={isArray(supplierCategoryCode) ? supplierCategoryCode.join() : ''}
                      //     />
                      //   </Tooltip>
                      // </React.Fragment>
                    )}
                  </FormItem>
                </Col>
              </Row>
            ) : null}
            <Row style={{ marginBottom: 10 }}>
              <Col md={14} span={12}>
                <FormItem
                  label={intl.get(`spfm.companySearch.view.message.inviteRemark`).d('邀请说明')}
                  labelCol={{ span: 8 }}
                  wrapperCol={{ span: 16 }}
                >
                  {getFieldDecorator('inviteRemark', {
                    // rules: [{ required: true, message: '邀请说明不能为空' }],
                  })(<TextArea style={{ height: '95px', resize: 'none' }} />)}
                </FormItem>
              </Col>
            </Row>
          </Form>
        )}
        <Form>
          <Row style={{ marginLeft: 10 }}>
            <Col offset={5}>
              <PrivacyPolicy {...policyProps} />
            </Col>
          </Row>
          <Row style={{ marginLeft: 10 }}>
            <Col offset={5}>
              <FormItem>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving}
                  onClick={this.handleInvitation}
                >
                  {intl.get(`spfm.companySearch.view.option.confirmInvitation`).d('确认邀请')}
                </Button>
                <Button className={styles.button} onClick={hideModal}>
                  {intl.get(`hzero.common.button.cancel`).d('取消')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
      </React.Fragment>
    );
  }

  // 静态文本弹框
  @Bind()
  onHandlePolicyModal(n) {
    this.setState({
      platformPolicyVisible: true,
      policyText: n,
    });
  }

  // 静态文本弹框回调
  @Bind()
  modalCallback(n, value) {
    const { form } = this.props;
    const { verificationPlatFormText } = this.state;
    form.setFieldsValue({ [`policy${n.textId}`]: value });
    this.handlePlatformPolicyModal(false);
    if(verificationPlatFormText.length > 1 && value) {
      const dataList = verificationPlatFormText.filter(v => v.textId !== n.textId);
      this.setState({verificationPlatFormText: dataList}, ()=>{
        this.onHandlePolicyModal(dataList[0]);
      });
    }
  }

  // 平台预定义静态文本
  @Bind()
  handlePlatformPolicyModal(flag) {
    this.setState({
      platformPolicyVisible: flag,
    });
  }

  render() {
    const {
      isSupplier,
      inviteCompanyName,
      organizationId,
      form: { getFieldValue },
      // supplierCategoryDate,
    } = this.props;
    const { policyText } = this.state;
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
        <Header
          title={intl.get(`spfm.companySearch.view.title.invitingInformation`).d('邀请信息')}
        />
        <Content>
          <div className={styles.content}>
            <div className={styles.title}>
              {isSupplier ? (
                <span>
                  {intl.get(`spfm.companySearch.view.message.sendInvitation`).d('您正在向')}【
                  <span className={styles.company}>{inviteCompanyName}</span>】
                  {intl
                    .get(`spfm.companySearch.view.message.sendInvitationOne`)
                    .d('发出合作邀约，邀请它成为你的【供应商】')}
                </span>
              ) : (
                <span>
                  {intl.get(`spfm.companySearch.view.message.sendInvitation`).d('您正在向')}【
                  <span className={styles.company}>{inviteCompanyName}</span>】
                  {intl
                    .get(`spfm.companySearch.view.message.sendInvitationTwo`)
                    .d('发出合作邀约，邀请它成为您的【客户】')}
                </span>
              )}
            </div>
            <div className={styles.form}>
              {isSupplier ? this.renderSupplierForm() : this.renderPurchaserForm()}
            </div>
          </div>
        </Content>
        <InvestigatePreview {...previewProps} />
        {/* <MultiSelectModal {...purAgentModel} Key="new" /> */}
        {this.state.platformPolicyVisible && (
          <Modal
            title={policyText.title}
            visible={this.state.platformPolicyVisible}
            onCancel={() => this.handlePlatformPolicyModal(false)}
            footer={null}
            width={1200}
          >
            <Fragment>
              <div dangerouslySetInnerHTML={{ __html: policyText.text || '' }} />
              <div
                style={{
                  textAlign: 'right',
                  padding: '12px 24px',
                  margin: '0 -24px',
                  borderTop: 'solid 1px #e0e0e0',
                }}
              >
                <Button
                  style={{ marginRight: 8 }}
                  onClick={() => this.modalCallback(policyText, 0)}
                >
                  {intl.get(`hzero.common.button.notAgree`).d('不同意')}
                </Button>
                <Button type="primary" onClick={() => this.modalCallback(policyText, 1)}>
                  {intl.get(`hzero.common.button.agree`).d('同意')}
                </Button>
              </div>
            </Fragment>
          </Modal>
        )}
      </React.Fragment>
    );
  }
}

