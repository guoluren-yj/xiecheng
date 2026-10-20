/* eslint-disable no-unused-expressions */
/*
 * 配置中心 - 采购协议
 * @date: 2019-05-13
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { connect } from 'dva';
import { Row, Col, Form, Select, Modal } from 'hzero-ui';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { withRouter } from 'dva/router';

import Checkbox from 'components/Checkbox';

import SubMessage from '../../components/SubMessage';
import styles from './index.less';
import SupplierOnlineConfirm from './SupplierOnlineConfirm';
import AgreementMergeRuleModal from './AgreementMergeRuleModal';
import PreparationDataSourceModal from './PreparationDataSourceModal';
import AgreementApprovalModal from './agreementApprovalModal';
@Form.create({ fieldNameProp: null })
@withRouter
@connect(({ loading, configServer }) => ({
  saveOrderConfigListLoading: loading.effects['configServer/saveOrderConfigList'],
  loadingFetchNotPermitList: loading.effects['configServer/fetchNotPermitList'],
  loadingFetchPermitList: loading.effects['configServer/fetchPermitList'],
  loadingHandleAssign: loading.effects['configServer/handleAssign'],
  loadingHandleCancelAssign: loading.effects['configServer/handleCancelAssign'],
  loadingInviteCompany: loading.effects['configServer/inviteCompany'],
  configServer,
}))
export default class PurchaseContract extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      disabled010607: !props.settings['010605'] || false,
      supplierOnlineConfirmVisible: false,
      agreementMergeRuleVisible: false,
      preparationDataSourceVisible: false,
      agreementApprovalVisible: false,
    };
  }

  searchForm;

  /**
   * 查询未分配的供应商列表
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearchNotPermitList(page = {}) {
    const { dispatch } = this.props;
    const fieldsValue = this.searchForm ? this.searchForm.getFieldsValue() : {};
    return dispatch({
      type: 'configServer/fetchNotPermitList',
      payload: {
        page,
        ...fieldsValue,
      },
    });
  }

  /**
   * 查询已分配的供应商列表
   * @param {Object} [page={}]
   */
  @Bind()
  handleSearchPermitList(page = {}) {
    const { dispatch } = this.props;
    const fieldsValue = this.searchForm ? this.searchForm.getFieldsValue() : {};
    return dispatch({
      type: 'configServer/fetchPermitList',
      payload: {
        page,
        ...fieldsValue,
      },
    });
  }

  handleSingleRule() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('splitOrderRulesVisible', true);
    }
  }

  @Bind()
  handleChange010605(e) {
    const {
      dispatch,
      form: { setFieldsValue },
    } = this.props;
    const that = this;
    if (e.target.value) {
      setFieldsValue({ '010607': 0 });
      this.setState({ disabled010607: true });
    } else {
      dispatch({
        type: 'configServer/fetchOpenResult',
        applicationCode: 'AP_SIGN',
      }).then((res) => {
        if (!res) {
          Modal.confirm({
            content: intl
              .get(`spfm.configServer.view.purchaseContract.message.goToOpen`)
              .d('您尚未开通电子签章服务，是否前往开通？'),
            onOk: () => {
              that.props.history.push(`/spfm/amkt-appstore`);
              that.setState({ disabled010607: false });
              setFieldsValue({ '010607': 0, '010605': 0 });
            },
            onCancel: () => {
              that.setState({ disabled010607: true });
              setFieldsValue({ '010607': 0, '010605': 0 });
            },
          });
        } else {
          this.handleInviteCompany();
        }
      });
    }
  }

  /**
   * 邀请公司
   */
  @Bind()
  handleInviteCompany() {
    const {
      dispatch,
      loadingInviteCompany,
      form: { setFieldsValue },
    } = this.props;
    const that = this;
    Modal.confirm({
      content: intl
        .get(`spfm.configServer.view.contract.message.inviteCompany`)
        .d('是否向合作伙伴发出电子签章开通邀请？'),
      okButtonProps: {
        loading: loadingInviteCompany,
      },
      onOk: () => {
        return new Promise((resolve) => {
          dispatch({
            type: 'configServer/inviteCompany',
          }).then((res) => {
            if (res.toString() === '[object Object]') {
              setFieldsValue({ '010607': 0 });
              that.setState({ disabled010607: false });
              resolve();
            }
          });
        });
      },
      onCancel: () => {
        that.setState({ disabled010607: false });
      },
    });
  }

  /**
   * 允许供应商在线确认
   * @param {Array} selectedRow
   * @returns Promise
   */
  @Bind()
  handleAssign(selectedRow) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'configServer/handleAssign',
      payload: selectedRow,
    });
  }

  /**
   * 取消供应商在线确认
   * @param {Array} selectedRow
   * @returns Promise
   */
  @Bind()
  handleCancelAssign(selectedRow) {
    const { dispatch } = this.props;
    return dispatch({
      type: 'configServer/handleCancelAssign',
      payload: selectedRow,
    });
  }

  /**
   * 签署顺序按条件渲染
   */
  @Bind()
  renderSignOrder() {
    const {
      enumMap: { signOrder = [] },
    } = this.props;
    return signOrder.map((item) => (
      <Select.Option key={item.value} value={item.value}>
        {item.meaning}
      </Select.Option>
    ));
  }

  /**
   * 签署阶段渲染
   */
  @Bind()
  renderSignStage() {
    const {
      enumMap: { signStage = [] },
    } = this.props;
    const newSignOrder = [...signStage];
    return newSignOrder.map((item) => (
      <Select.Option key={item.value} value={item.value}>
        {item.meaning}
      </Select.Option>
    ));
  }

  /**
   * Modal显隐
   *  (采购协议并单规则Modal | 协议拟制数据来源Modal)
   */
  @Bind()
  modalChange(param) {
    this.setState(param);
  }

  render() {
    const {
      disabled010607,
      supplierOnlineConfirmVisible,
      agreementMergeRuleVisible,
      preparationDataSourceVisible,
      agreementApprovalVisible,
    } = this.state;
    const {
      settings,
      loadingHandleAssign,
      loadingHandleCancelAssign,
      loadingFetchNotPermitList,
      loadingFetchPermitList,
      enumMap = {},
      form: { getFieldDecorator, getFieldValue },
      configHideArr = [],
    } = this.props;
    const { mergeRules = [], signStage = [] } = enumMap;
    const SupplierOnlineConfirmProps = {
      loadingFetchNotPermitList,
      loadingFetchPermitList,
      loadingHandleAssign,
      loadingHandleCancelAssign,
      onAssign: this.handleAssign,
      onCancelAssign: this.handleCancelAssign,
      onSearchPermitList: this.handleSearchPermitList,
      onSearchNotPermitList: this.handleSearchNotPermitList,
      onRef: (node) => {
        this.searchForm = node.props.form;
      },
      visible: supplierOnlineConfirmVisible,
      onCancel: () => this.setState({ supplierOnlineConfirmVisible: false }),
    };
    const agreementMergeRuleModalProps = {
      visible: agreementMergeRuleVisible,
      handleModal: (bool) => this.modalChange({ agreementMergeRuleVisible: bool }),
    };
    const preparationDataSourceModalProps = {
      visible: preparationDataSourceVisible,
      handleModal: (bool) => this.modalChange({ preparationDataSourceVisible: bool }),
    };
    const agreementApprovalModalProps = {
      visible: agreementApprovalVisible,
      handleModal: (bool) => this.modalChange({ agreementApprovalVisible: bool }),
    };
    const configList = [
      {
        key: 1,
        href: 'purAgreementDataSource',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.agreementDataSource`)
          .d('采购协议数据来源'),
        component: (
          <Row>
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.agreementDataSource`)
                .d('采购协议数据来源')}
            </Col>
            {!configHideArr.includes('purAgreementDataSource-1') && (
              <>
                <Col span={24} className={classnames('sub-item-fields', styles['flex-form-item'])}>
                  <span>
                    {intl
                      .get(`spfm.configServer.view.purchaseContract.protocolPreparationDateSource`)
                      .d('协议拟制数据来源')}
                  </span>
                  <a
                    className="operate-item-link"
                    onClick={() => this.modalChange({ preparationDataSourceVisible: true })}
                  >
                    {intl
                      .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                      .d('进入定义列表')}
                  </a>
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.purchaseContract.subMessage.agreementDataSource`)
                    .d('配置协议拟制功能中，创建时能够引用的数据来源。')}
                />
              </>
            )}
            {!configHideArr.includes('purAgreementDataSource-2') && (
              <>
                <Col span={24} className={styles['version-rule']}>
                  <Form
                    layout="inline"
                    className={classnames(styles['form-item'], 'sub-item-fields')}
                  >
                    <Form.Item
                      label={`${intl
                        .get(`spfm.configServer.view.purchaseContract.010609lable`)
                        .d('采购协议并单规则定义')}：`}
                    >
                      {getFieldDecorator('010609', {
                        initialValue: settings['010609'],
                      })(
                        <Select showSearch style={{ width: '150px' }} allowClear>
                          {mergeRules.map((item) => (
                            <Select.Option key={item.value} value={item.value}>
                              {item.meaning}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </Form.Item>
                  </Form>
                  {getFieldValue('010609') === 'CUSTOMIZE' && (
                    <a onClick={() => this.modalChange({ agreementMergeRuleVisible: true })}>
                      {intl
                        .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.purchaseContract.message.010609subMsg`)
                    .d(
                      '引用其他单据创建采购协议时，会根据所配置的规则判断是否可以合并生成同一份采购协议。'
                    )}
                />
              </>
            )}
          </Row>
        ),
      },
      // {
      //   key: 2,
      //   href: 'pur010601label',
      //   title: intl
      //     .get(`spfm.configServer.view.purchaseContract.message.010601label`)
      //     .d('采购协议审批'),
      //   component: (
      //     <Row className="sub-item">
      //       <Col span={24}>
      //         {intl
      //           .get(`spfm.configServer.view.purchaseContract.message.010601label`)
      //           .d('采购协议审批')}
      //       </Col>
      //       {!configHideArr.includes('pur010601label-1') && (
      //         <>
      //           <Col
      //             span={24}
      //             className={classnames('sub-item-fields', styles['flex-form-item'])}
      //             style={{ marginTop: '-10px', lineHeight: '39px' }}
      //           >
      //             {getFieldDecorator('010601', {
      //               initialValue: settings['010601'],
      //             })(
      //               <Checkbox>
      //                 {intl
      //                   .get(`spfm.configServer.view.purchaseContract.message.010601`)
      //                   .d('启用SRM采购协议审批')}
      //               </Checkbox>
      //             )}
      //             {getFieldValue('010601') === 1 && (
      //               <a onClick={() => this.modalChange({ agreementApprovalVisible: true })}>
      //                 {intl
      //                   .get(`spfm.configServer.view.common.message.enterDefinitionList`)
      //                   .d('进入定义列表')}
      //               </a>
      //             )}
      //           </Col>
      //           <SubMessage
      //             content={intl
      //               .get(`spfm.configServer.view.purchaseContract.message.010601subMsg`)
      //               .d(
      //                 '勾选启用，则采购协议需在SRM进行审批，工作流审批需配合工作流定义使用，外部系统审批需配合外部系统使用.'
      //               )}
      //           />
      //         </>
      //       )}
      //       {(getFieldValue('010602') === 'FUNCTIONAL' ||
      //         getFieldValue('010602') === 'WORKFLOW' ||
      //         getFieldValue('010602') === 'EXTERNAL_APPROVAL') &&
      //         getFieldValue('010601') === 1 &&
      //         !configHideArr.includes('pur010601label-2') && (
      //           <Col span={24} className={styles['version-rule']}>
      //             <Form
      //               layout="inline"
      //               className={classnames(styles['form-item'], 'sub-item-fields')}
      //             >
      //               <Form.Item
      //                 label={intl
      //                   .get(`spfm.configServer.view.purchaseContract.010608`)
      //                   .d('审批顺序')}
      //               >
      //                 {getFieldDecorator('010608', {
      //                   initialValue: settings['010608'],
      //                   rules: [
      //                     {
      //                       required: true,
      //                       message: intl.get('hzero.common.validation.notNull', {
      //                         name: intl
      //                           .get(`spfm.configServer.view.purchaseContract.010608`)
      //                           .d('审批顺序'),
      //                       }),
      //                     },
      //                   ],
      //                 })(
      //                   <Select
      //                     showSearch
      //                     allowClear
      //                     style={{ width: '150px' }}
      //                     onChange={this.ApprovalOrderChange}
      //                   >
      //                     {pcApprovalOrder.map((item) => (
      //                       <Select.Option key={item.value} value={item.value}>
      //                         {item.meaning}
      //                       </Select.Option>
      //                     ))}
      //                   </Select>
      //                 )}
      //               </Form.Item>
      //             </Form>
      //           </Col>
      //         )}
      //     </Row>
      //   ),
      // },
      {
        key: 4,
        href: 'purSignature',
        title: intl.get(`spfm.configServer.view.purchaseContract.message.Signature`).d('电子签章'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl.get(`spfm.configServer.view.purchaseContract.message.Signature`).d('电子签章')}
            </Col>
            {!configHideArr.includes('purSignature-1') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('010605', {
                    initialValue: settings['010605'],
                  })(
                    <Checkbox onChange={this.handleChange010605}>
                      {intl
                        .get(`spfm.configServer.view.purchaseContract.message.010605`)
                        .d('启用电子签章')}
                    </Checkbox>
                  )}
                  {getFieldValue('010605') === 1 && (
                    <Form.Item
                      label={intl
                        .get(`spfm.configServer.view.purchaseContract.message.010606`)
                        .d('签署顺序')}
                      className={classnames('sub-item-fields', styles['flex-form-item'])}
                      style={{ lineHeight: '39px', paddingLeft: '0px' }}
                    >
                      {getFieldDecorator('010606', {
                        // initialValue: settings['010606'] || 'PURCHASE_FIRST',
                        initialValue:
                          !!settings['010606'] && settings['010606'] !== 'null'
                            ? settings['010606']
                            : '',
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.purchaseContract.message.010606`)
                                .d('签署顺序'),
                            }),
                          },
                        ],
                      })(
                        <Select showSearch style={{ width: '150px' }} allowClear>
                          {this.renderSignOrder()}
                        </Select>
                      )}
                    </Form.Item>
                  )}
                  {getFieldValue('010605') === 1 && (
                    <Form.Item
                      label={intl
                        .get(`spfm.configServer.view.purchaseContract.message.010617`)
                        .d('签署阶段')}
                      className={classnames('sub-item-fields', styles['flex-form-item'])}
                      style={{ lineHeight: '39px', paddingLeft: '0px' }}
                    >
                      {getFieldDecorator('010617', {
                        initialValue:
                          !!settings['010617'] && settings['010617'] !== 'null'
                            ? settings['010617']
                            : (signStage.length && signStage[0].value) || '',
                        rules: [
                          {
                            required: true,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get(`spfm.configServer.view.purchaseContract.message.010617`)
                                .d('签署阶段'),
                            }),
                          },
                        ],
                      })(
                        <Select showSearch style={{ width: '150px' }} allowClear>
                          {this.renderSignStage()}
                        </Select>
                      )}
                    </Form.Item>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.purchaseContract.message.010606subMsg`)
                    .d('勾选启用，可对协议进行电子签章线上签署。')}
                />
              </>
            )}
            {!configHideArr.includes('purSignature-2') && (
              <>
                <Col span={24} className="sub-item-fields">
                  {getFieldDecorator('010607', {
                    initialValue: settings['010607'],
                  })(
                    <Checkbox disabled={disabled010607}>
                      {intl
                        .get(`spfm.configServer.view.purchaseContract.message.010607`)
                        .d('允许供应商线上确认')}
                    </Checkbox>
                  )}
                  {getFieldValue('010607') === 1 && (
                    <a
                      onClick={() => this.setState({ supplierOnlineConfirmVisible: true })}
                      style={{ marginLeft: '8px' }}
                    >
                      {intl
                        .get(`spfm.configServer.view.order.message.010202href`)
                        .d('进入定义列表')}
                    </a>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.purchaseContract.message.010607subMsg`)
                    .d('勾选启用，则供应商可对协议进行无签署确认。')}
                />
              </>
            )}
            {/* {!openResult ? (
              <Fragment>
              </Fragment>
            ) : (
              <Col span={24} className="sub-item-fields">
                {intl
                  .get(`spfm.configServer.view.purchaseContract.message.gotoOpenElectronicSignature`)
                  .d('您尚未开通电子签章服务，是否前往开通？')}
                <a onClick={e => e} style={{ marginLeft: '8px' }}>
                  {intl.get(`spfm.configServer.view.purchaseContract.message.goNow`).d(`立即前往>>`)}
                </a>
              </Col>
            )} */}
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purChaseContract">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.purchaseContract.message.title`).d('采购协议')}:
          </span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
        </Col>
        {supplierOnlineConfirmVisible && <SupplierOnlineConfirm {...SupplierOnlineConfirmProps} />}
        {agreementMergeRuleVisible && <AgreementMergeRuleModal {...agreementMergeRuleModalProps} />}
        {preparationDataSourceVisible && (
          <PreparationDataSourceModal {...preparationDataSourceModalProps} />
        )}
        {agreementApprovalVisible && <AgreementApprovalModal {...agreementApprovalModalProps} />}
      </Row>
    );
  }
}
