/*
 * InvestigationWriteDetail - 调查表填写明细
 * @date: 2018/08/08 14:07:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment, useMemo, createRef } from 'react';
import { connect } from 'dva';
import { Form, Spin, Input, Modal, Row, Col, Dropdown, Menu, Icon } from 'hzero-ui';
import PropTypes from 'prop-types';
import { isFunction, values, isEmpty, pickBy, isArray, concat } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Modal as C7nModal, Icon as C7nIcon } from 'choerodon-ui/pro';

import { Button } from 'components/Permission';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import querystring from 'querystring';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import remotes from 'utils/remote';
import notification from 'utils/notification';
import { Content, Header } from 'components/Page';
import { isTenantRoleLevel, getResponse, getCurrentUserId } from 'utils/utils';
import { downloadFile } from 'hzero-front/lib/services/api';

import ResultAlert from '@/routes/components/AiApprove/ResultAlert';
import { getDefaultBankCountryInfo } from '@/services/enterpriseInformService';
import { aiApprove, fetchApproveStatus, queryAiConfig } from '@/services/commonService';
import { ReactComponent as IntelligentReviewIcon } from '@/assets/common/intelligentReview.svg';
import Investigation from '../Component/Investigation';
import '@/routes/index.less';

const isTenantLevel = isTenantRoleLevel();
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const currentUserId = getCurrentUserId();

/**
 * 调查表填写页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} invitationList - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */

const { TextArea } = Input;

@Form.create({ fieldNameProp: null })
@connect(({ loading, investigationWrite }) => ({
  operateLoading:
    loading.effects['investigationWrite/fetchReceivedInvestigationDetail'] ||
    loading.effects['investigationWrite/handlePrint'] ||
    loading.effects['investigationWrite/handleExcelPrint'],
  investigationWrite,
}))
@formatterCollections({
  code: ['sslm.investCorrelat', 'sslm.common', 'spfm.disposeInvite', 'spfm.invitationList'],
})
@withCustomize({
  unitCode: ['SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO'],
  manualQuery: true,
})
class InvestigationWriteDetail extends Component {
  constructor(props) {
    super(props);
    const isPub = props.location.pathname.match('/pub/');
    const routerParam = querystring.parse(props.location.search.substr(1));
    const { state: { historyBack } = {} } = props.location;
    const newHistoryBack = historyBack || `/sslm/investigation-write/list`;
    const { pubEdit = 0 } = routerParam;
    this.state = {
      isPub,
      historyBack: newHistoryBack,
      investgHeaderId: routerParam.investgHeaderId,
      investigateTemplateId: routerParam.investigateTemplateId,
      organizationId: routerParam.organizationId || -1,
      partnerRemark: props.investigationWrite.detail.partnerRemark,
      saveLoading: false,
      submitting: false,
      queryInvestgLoading: false,
      showStaticText: false, // 是否显示静态文本
      defaultBankInfo: {},
      platformPolicyText: [],
      verificationPlatFormText: [],
      pubEditFlag: !!Number(pubEdit), // 判断工作流是否可编辑
      processStatus: null,
      headerInfo: {}, // 调查表头信息
      extraRemoteParams: {}, // 埋点额外参数
      reviewIsClick: false,
      aiApproveStatus: null,
      showAiApproveFlag: false, // 是否开启AI审核
    };
    const { queryUnitConfig } = props;
    if (queryUnitConfig) {
      queryUnitConfig({ customizeTenantId: routerParam.organizationId || -1 });
    }
  }

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  timerRef = createRef(null); // 定时器

  timerTime = createRef(0); // 记录轮询次数

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = { ...prevState };
    const routerParam = querystring.parse(nextProps.location.search.substr(1));
    const { investigateTemplateId, investgHeaderId, organizationId } = routerParam;
    if (investgHeaderId !== prevState.investgHeaderId) {
      nextState.investgHeaderId = investgHeaderId;
      nextState.investigateTemplateId = investigateTemplateId;
      nextState.organizationId = organizationId;
    }
    return nextState;
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    const { location } = this.props;
    const routerParam = querystring.parse(location.search.substr(1));
    const { investgHeaderId } = routerParam;
    return investgHeaderId !== prevState.investgHeaderId;
  }

  componentDidUpdate(...rest) {
    const { reviewIsClick } = this.state;
    const { reviewIsClick: prevReviewIsClick } = rest[1];
    const snapshot = rest[2];
    if (snapshot) {
      const { investgHeaderId } = this.state;
      if (investgHeaderId) {
        this.handleSearch({ investgHeaderId });
      }
    }
    if (reviewIsClick !== prevReviewIsClick) {
      this.timerRef.current = setInterval(() => this.getAiApproveResult(), 5000);
    }
  }

  componentDidMount() {
    const { remote } = this.props;
    const { investgHeaderId, investigateTemplateId } = this.state;
    this.props.dispatch({
      type: 'investigationWrite/init',
    });
    if (investgHeaderId) {
      this.handleSearch({ investgHeaderId });
      this.handleAiConfig();
    }
    if (!isTenantLevel) {
      // 处理平台级消息中心跳转过来
      notification.warning({
        message: intl.get('sslm.common.view.message.logInAgain').d('请重新登录！'),
      });
    }
    if (!investgHeaderId || !investigateTemplateId) {
      // 参数不正确
      notification.error({
        message: intl
          .get('sslm.investCorrelat.view.message.paramMissing')
          .d(
            '参数不正确，调查表Id（investgHeaderId）不能为空，调查表模板Id（investigateTemplateId）不能为空。请检查配置或联系您的项目经理/运维经理处理。'
          ),
      });
    }
    // 工作流审批通过回调
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }
    if (remote && remote.event) {
      remote.event.fireEvent('cuxInit', { _this: this });
    }
  }

  componentWillUnmount() {
    this.setState({
      headerInfo: {},
    });
    this.clearTimerRef();
  }

  // 业务规则是否开启AI审批
  @Bind()
  handleAiConfig() {
    const { investgHeaderId } = this.state;
    queryAiConfig({
      documentId: investgHeaderId,
      documentType: 'SUPPLIER_INVESTG',
    }).then(response => {
      const res = getResponse(response);
      if (res) {
        this.setState({ showAiApproveFlag: true });
      }
    });
  }

  // 工作流审批回调
  @Bind()
  async workflowSubmit(approveResult) {
    const { pubEditFlag } = this.state;
    return new Promise(async (resolve, reject) => {
      if (approveResult === 'Approved' && pubEditFlag) {
        const res = await this.onHandleSave();
        if (res) {
          resolve(res);
        } else {
          reject(new Error(res)); // 异常
        }
      } else {
        resolve();
      }
    });
  }

  /**
   * 查询调查表填写列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleSearch(fields) {
    const { dispatch, history } = this.props;
    const { organizationId } = this.state;
    dispatch({
      type: 'investigationWrite/fetchReceivedInvestigationDetail',
      payload: {
        ...fields,
        customizeUnitCode: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
        customizeTenantId: organizationId,
      },
    }).then(res => {
      if (res) {
        if (isEmpty(res)) {
          notification.error({
            message: intl
              .get('sslm.investCorrelat.view.message.jurisdiction')
              .d('当前租户无查询权限'),
          });
          history.push(`/sslm/investigation-write/list`);
        } else {
          const {
            partnerRemark,
            tenantId,
            companyId,
            triggerByCode,
            domesticForeignRelation,
            partnerCompanyName,
            processStatus,
          } = res;
          // 只有邀约调查表才需显示静态文本
          if (triggerByCode === 'INVITE') {
            this.setState({
              showStaticText: true,
            });
            this.handlePrivacyPolicy(tenantId, companyId);
            // 查询单个隐私协议
            this.handlePlatformPolicyText();
          }
          let defaultBankInfo = {
            domesticForeignRelation,
            partnerCompanyName,
          };
          if (domesticForeignRelation === 1) {
            // 查询默认国家-中国
            getDefaultBankCountryInfo()
              .then(resp => {
                if (getResponse(resp)) {
                  defaultBankInfo = {
                    ...resp,
                    domesticForeignRelation,
                    partnerCompanyName,
                  };
                }
              })
              .finally(() => {
                this.setState({ defaultBankInfo });
              });
          }
          this.setState({
            processStatus,
            partnerRemark,
            headerInfo: res,
            aiApproveStatus: res.aiApproveStatus,
          });
        }
      }
    });
  }

  /**
   *  查询采购方是否启用合作条款
   */
  @Bind()
  handlePrivacyPolicy(tenantId, companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationWrite/fetchPrivacyPolicy',
      payload: {
        tenantId,
      },
    }).then(res => {
      if (res && res.settingValue === '1') {
        this.handlePrivacyStaticTexts(tenantId, companyId);
      }
    });
  }

  /**
   *  查询平台政策文档
   */
  @Bind()
  handlePlatformPolicyText() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationWrite/fetchPlatformPolicyText',
      payload: {
        partnerTenantId: 0,
        companyId: 0,
        textCode: 'SRM.SHARE.PERSONAL.INFORMATION',
      },
    }).then(res => {
      if (res) {
        this.setState({
          platformPolicyText: [res],
        });
      }
    });
  }

  /**
   *  查询静态文本
   */
  @Bind()
  handlePrivacyStaticTexts(tenantId, companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationWrite/fetchPrivacyPolicyText',
      payload: {
        companyId,
        partnerTenantId: tenantId,
        textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
      },
    });
  }

  // 静态文本弹框回调
  @Bind()
  modalCallback(n, value, platformPolicyflag) {
    const { form, dispatch } = this.props;
    const { verificationPlatFormText, headerInfo = {} } = this.state;
    const { triggerById } = headerInfo;
    if (platformPolicyflag && value) {
      // 保存操作人信息
      dispatch({
        type: 'investigationWrite/saveOperatorInfo',
        payload: [
          {
            consentFormProcessor: currentUserId,
            inviteId: triggerById,
          },
        ],
      }).then(res => {
        if (res) {
          this._modal.close();
          form.setFieldsValue({ [`policy${n.textId}`]: value });
        }
      });
    } else {
      this._modal.close();
      form.setFieldsValue({ [`policy${n.textId}`]: value });
    }
    if (verificationPlatFormText.length > 1 && value) {
      const dataList = verificationPlatFormText.filter(v => v.textId !== n.textId);
      this.setState({ verificationPlatFormText: dataList }, () => {
        this.onHandlePolicyModal(dataList[0]);
      });
    }
  }

  // 静态文本弹框
  @Bind()
  onHandlePolicyModal(n, platformPolicyflag = 0) {
    this._modal = C7nModal.open({
      key: C7nModal.key(),
      title: n.title,
      autoCenter: true,
      closable: true,
      footer: null,
      style: { width: 1200 },
      bodyStyle: { paddingBottom: 0 },
      children: (
        <Fragment>
          <div dangerouslySetInnerHTML={{ __html: n.text || '' }} />
          <div
            style={{
              textAlign: 'right',
              padding: '12px 24px',
              margin: '0 -24px',
              borderTop: 'solid 1px #e0e0e0',
            }}
          >
            <Button style={{ marginRight: 8 }} onClick={() => this.modalCallback(n, 0)}>
              {intl.get(`hzero.common.button.notAgree`).d('不同意')}
            </Button>
            <Button type="primary" onClick={() => this.modalCallback(n, 1, platformPolicyflag)}>
              {intl.get(`hzero.common.button.agree`).d('同意')}
            </Button>
          </div>
        </Fragment>
      ),
    });
  }

  @Bind()
  changeTextArea(e) {
    this.setState({
      partnerRemark: e.target.value,
    });
  }

  /**
   * 获取Investigation的保存方法
   */
  getSaveValidateData = getSaveValidate => {
    this.saveData = getSaveValidate;
  };

  /**
   * 获取Investigation的提交方法
   */
  onSubmitHook = submit => {
    this.onSubmitInvestigation = submit;
  };

  @Bind()
  handleToList() {
    const { historyBack } = this.state;
    this.props.history.push(historyBack);
  }

  /**
   * 提交按钮
   */
  onSubmit = () => {
    const { saveLoading, form } = this.props;
    const { partnerRemark, headerInfo: detail = {} } = this.state;
    const that = this;

    form.validateFields((err, fieldsValues) => {
      if (!err) {
        Modal.confirm({
          title: intl.get(`sslm.investCorrelat.view.message.tipContent`).d('确定提交吗？'),
          onOk() {
            if (isFunction(that.onSubmitInvestigation)) {
              if (detail.partnerRemark !== partnerRemark) {
                that.onSubmitInvestigation(that.handleToList, {
                  ...detail,
                  ...fieldsValues,
                  partnerRemark,
                });
              } else {
                that.onSubmitInvestigation(that.handleToList, { ...detail, ...fieldsValues });
              }
            }
          },
          confirmLoading: saveLoading,
        });
      }
    });
  };

  /**
   * 提交判断
   */
  @Bind()
  handleSubmit() {
    const {
      form,
      investigationWrite: { privacyPolicyText = [] },
    } = this.props;
    const { showStaticText, platformPolicyText } = this.state;
    if (showStaticText) {
      // 获取只有静态文本的对象
      const policyObj = pickBy(form.getFieldsValue(), (value, key) => key.includes('policy'));
      // 判断静态文本是否都已阅读
      const valueArray = values(policyObj);
      const isArrayFlag = !!isArray(valueArray);
      let checkedFlag = false;
      if (isArrayFlag) {
        const filterArray = valueArray.filter(n => !n) || [];
        checkedFlag = isEmpty(filterArray);
      }
      if (checkedFlag) {
        this.onSubmit();
      } else {
        const allPolicyText = concat(platformPolicyText, privacyPolicyText);
        this.setState(
          {
            verificationPlatFormText: allPolicyText.filter(
              n => !form.getFieldValue(`policy${n.textId}`)
            ),
          },
          () => {
            this.onHandlePolicyModal(this.state.verificationPlatFormText[0]);
          }
        );
      }
    } else {
      this.onSubmit();
    }
  }

  /**
   * 保存按钮方法
   */
  onHandleSave = async () => {
    const { form } = this.props;
    const { partnerRemark, headerInfo: detail = {} } = this.state;

    if (detail.partnerRemark !== partnerRemark) {
      return new Promise(resolve => {
        form.validateFields(async (err, fieldsValues) => {
          if (!err) {
            if (isFunction(this.saveData)) {
              const res = await this.saveData({ ...detail, ...fieldsValues, partnerRemark });
              resolve(res);
            }
          } else {
            resolve(false);
          }
        });
      });
    } else if (isFunction(this.saveData)) {
      const res = await this.saveData();
      return res;
    } else {
      return null;
    }
  };

  handleChangeLoading = boolean => {
    this.setState({ saveLoading: boolean });
  };

  @Bind()
  handleChangeSubmitLoading(flag) {
    this.setState({ submitting: flag });
  }

  /**
   * 保存完之后查询的loading
   */
  @Bind()
  handleChangeQueryInvestgLoading(boolean) {
    this.setState({ queryInvestgLoading: boolean });
  }

  /**
   * 打印功能
   * @author  姚格格
   * @date    2020-04-20 16:15
   */
  @Bind()
  handlePrint({ key }) {
    const { dispatch } = this.props;
    const { investgHeaderId, headerInfo: detail = {} } = this.state;
    switch (key) {
      case 'PDF':
        dispatch({
          type: 'investigationWrite/handlePrint',
          payload: {
            investgHeaderId,
            tenantId: detail.tenantId,
          },
        }).then(res => {
          if (res) {
            if (res.type.indexOf('application/json') > -1) {
              notification.warning({
                description: intl
                  .get(`sslm.common.view.printwarning.noTemplate`)
                  .d('未设置打印模板，不可打印'),
              });
              return;
            }
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            const printWindow = window.open(fileURL);
            if (printWindow) {
              printWindow.print();
            }
          }
        });
        break;
      case 'EXCEL':
        dispatch({
          type: 'investigationWrite/handleExcelPrint',
          payload: {
            investgHeaderId,
            tenantId: detail.tenantId,
          },
        }).then(res => {
          if (res) {
            downloadFile({ requestUrl: res });
          }
        });
        break;
      default:
        break;
    }
  }

  // 清除轮循计时器
  @Bind()
  clearTimerRef() {
    if (this.timerRef.current) {
      clearInterval(this.timerRef.current);
    }
  }

  // 轮询【智能审核】结果
  @Bind()
  async getAiApproveResult() {
    const { investgHeaderId } = this.state;
    const res = getResponse(
      await fetchApproveStatus({ documentType: 'SUPPLIER_INVESTG', documentId: investgHeaderId })
    );
    if (res) {
      this.setState({ aiApproveStatus: res.status });
      this.timerTime.current++;
      if (this.timerTime.current > 4 || res.status !== 'APPROVING') {
        this.timerTime.current = 0;
        this.clearTimerRef();
        this.setState({ reviewIsClick: false });
      }
    } else {
      this.clearTimerRef();
    }
  }

  // 智能审核
  @Bind()
  handleIntelligentReview() {
    const { form } = this.props;
    const { investgHeaderId, partnerRemark, headerInfo: detail = {} } = this.state;
    form.validateFields(async (err, fieldsValues) => {
      if (!err) {
        if (isFunction(this.saveData)) {
          const res = await this.saveData({ ...detail, ...fieldsValues, partnerRemark });
          if (res) {
            aiApprove({
              documentType: 'SUPPLIER_INVESTG',
              documentId: investgHeaderId,
            }).then(async response => {
              const resp = getResponse(response);
              if (resp) {
                this.handleSearch({ investgHeaderId });
                this.setState({ reviewIsClick: true });
              }
            });
          }
        }
      }
    });
  }

  @Bind()
  renderForm() {
    const {
      form,
      form: { getFieldDecorator, getFieldValue },
      investigationWrite: { privacyPolicyText = [] },
      operateLoading,
      customizeForm,
      custLoading,
      remote,
    } = this.props;
    const {
      isPub,
      extraRemoteParams,
      showStaticText,
      investigateTemplateId,
      investgHeaderId,
      organizationId,
      partnerRemark,
      submitting,
      defaultBankInfo,
      platformPolicyText,
      pubEditFlag,
      processStatus,
      headerInfo: detail = {},
    } = this.state;
    const remoteParams = {
      ...extraRemoteParams,
    };
    // 增加状态控制，待供应商填写和审批拒绝时，调查表可编辑
    const investigationEdit =
      (!isPub && ['RELEASE', 'REJECT'].includes(processStatus)) || pubEditFlag;
    return (
      <Spin spinning={operateLoading || submitting || false}>
        {customizeForm(
          {
            code: 'SSLM.INVESTIGATION_WRITE_DETAIL.BASICINFO',
            form,
            dataSource: detail,
          },
          <Form
            custLoading={custLoading}
            className="ued-edit-form form-wrap"
            style={{ padding: '0 16px' }}
          >
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.code`).d('调查表编号')}
                >
                  {getFieldDecorator('investgNumber', {
                    initialValue: detail.investgNumber,
                  })(<span>{detail.investgNumber}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.level`).d('调查表管控维度')}
                >
                  {getFieldDecorator('investigateLevel', {
                    initialValue: detail.investigateLevel,
                  })(<span>{detail.investigateLevelMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.customer.code`).d('客户编码')}
                >
                  {getFieldDecorator('companyNum', {
                    initialValue: detail.companyNum,
                  })(<span>{detail.companyNum}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.customer.name`).d('客户名称')}
                >
                  {getFieldDecorator('companyName', {
                    initialValue: detail.companyName,
                  })(<span>{detail.companyName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.model.investigate.status`).d('调查表状态')}
                >
                  {getFieldDecorator('processStatus', {
                    initialValue: detail.processStatus,
                  })(<span>{detail.processStatusMeaning}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.investCorrelat.view.message.releaseDate`).d('发布时间')}
                >
                  {getFieldDecorator('releaseDate', {
                    initialValue: detail.releaseDate,
                  })(<span>{dateTimeRender(detail.releaseDate)}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
                >
                  {getFieldDecorator('createUserName', {
                    initialValue: detail.createUserRealName || detail.createUserName,
                  })(<span>{detail.createUserRealName || detail.createUserName}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.code`).d('供应商编码')}
                >
                  {getFieldDecorator('partnerCompanyNum', {
                    initialValue: detail.partnerCompanyNum,
                  })(<span>{detail.partnerCompanyNum}</span>)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.common.view.supplier.name`).d('供应商名称')}
                >
                  {getFieldDecorator('partnerCompanyName', {
                    initialValue: detail.partnerCompanyName,
                  })(<span>{detail.partnerCompanyName}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.investCorrelat.view.message.remark`).d('调查说明')}
                >
                  {getFieldDecorator('remark', {
                    initialValue: detail.remark,
                  })(<span>{detail.remark}</span>)}
                </FormItem>
              </Col>
            </Row>
            <Row gutter={48} className="writable-row">
              <Col span={8}>
                <FormItem
                  {...formItemLayout}
                  label={intl.get(`sslm.investCorrelat.view.message.partnerRemark`).d('反馈备注')}
                >
                  {getFieldDecorator('partnerRemark', {
                    initialValue: detail.partnerRemark,
                  })(<TextArea value={partnerRemark} rows={2} onChange={this.changeTextArea} />)}
                </FormItem>
              </Col>
            </Row>
            {detail.processStatus === 'REJECT' && (
              <Row gutter={48} className="writable-row">
                <Col span={8}>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get(`sslm.investCorrelat.view.message.rejectRemark`).d('拒绝原因')}
                  >
                    {getFieldDecorator('rejectRemark', {
                      initialValue: detail.rejectRemark,
                    })(<span>{detail.rejectRemark}</span>)}
                  </FormItem>
                </Col>
              </Row>
            )}
          </Form>
        )}
        {showStaticText && (
          <div style={{ marginBottom: 16, paddingLeft: 16 }}>
            <span style={{ fontWeight: 'bold', color: 'red' }}>
              {intl.get(`spfm.invitationList.view.message.readAndAgreed`).d('请阅读并同意')}
            </span>
            {platformPolicyText.map(n => {
              return form.getFieldDecorator(`policy${n.textId}`)(
                <span style={{ marginLeft: 8 }}>
                  <a onClick={() => this.onHandlePolicyModal(n, 1)}>{`《${n.title}》`}</a>
                  {!!form.getFieldValue(`policy${n.textId}`) && (
                    <C7nIcon
                      style={{ fontSize: 16, color: '#47B881', marginTop: -1 }}
                      type="check_circle"
                    />
                  )}
                </span>
              );
            })}
            {privacyPolicyText.map(n => {
              return getFieldDecorator(`policy${n.textId}`)(
                <span style={{ marginLeft: 8 }}>
                  <a onClick={() => this.onHandlePolicyModal(n)}>{`《${n.title}》`}</a>
                  {!!getFieldValue(`policy${n.textId}`) && (
                    <C7nIcon
                      style={{ fontSize: 16, color: '#47B881', marginTop: -1 }}
                      type="check_circle"
                    />
                  )}
                </span>
              );
            })}
          </div>
        )}
        <Investigation
          isEdit={investigationEdit}
          isSave
          isImport // 填写页面
          isPub={isPub}
          investgRemote={remote}
          remoteParams={remoteParams}
          configIgnore={detail.configIgnore}
          investigateTemplateId={investigateTemplateId}
          investgHeaderId={investgHeaderId}
          organizationId={organizationId}
          onSaveValidateDataHook={this.getSaveValidateData}
          onSubmitHook={this.onSubmitHook}
          onChangeSaveLoading={this.handleChangeLoading}
          onChangeSubmitLoading={this.handleChangeSubmitLoading}
          onRefresh={() => this.handleSearch({ investgHeaderId })}
          onChangeQueryInvestgLoading={this.handleChangeQueryInvestgLoading}
          defaultBankInfo={defaultBankInfo}
          _status="write"
          saveType="NO_CHECK"
          allowDeleteAllLineFlag={showStaticText} // 允许删除所有表格行
          // headerInfo={this.state.headerInfo}
        />
      </Spin>
    );
  }

  render() {
    const {
      saveLoading,
      submitting,
      queryInvestgLoading,
      historyBack,
      investgHeaderId,
      investigateTemplateId,
      isPub,
      headerInfo,
      pubEditFlag,
      processStatus,
      aiApproveStatus,
      showAiApproveFlag,
    } = this.state;
    const {
      operateLoading,
      investigationWrite: { printType = [] },
    } = this.props;
    const allLoading = submitting || saveLoading || queryInvestgLoading || operateLoading;
    const printMenu = (
      <Menu onClick={this.handlePrint}>
        {printType.map(n => (
          <Menu.Item key={n.value}>{n.meaning}</Menu.Item>
        ))}
      </Menu>
    );
    const { aiApproveDTOList } = headerInfo;

    return isTenantLevel && investgHeaderId && investigateTemplateId ? (
      <React.Fragment>
        <Header
          title={intl.get(`sslm.investCorrelat.view.message.title.investWrite`).d('调查表填写')}
          backPath={historyBack}
        >
          <Button
            icon="check"
            type="primary"
            onClick={this.handleSubmit}
            loading={allLoading}
            hidden={!['RELEASE', 'REJECT'].includes(processStatus)}
          >
            {intl.get('hzero.common.button.submit').d('提交')}
          </Button>
          <Button
            icon="save"
            onClick={this.onHandleSave}
            loading={allLoading}
            hidden={(isPub && !pubEditFlag) || !['RELEASE', 'REJECT'].includes(processStatus)}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Dropdown overlay={printMenu} placement="bottomLeft">
            <Button icon="printer" loading={allLoading}>
              {intl.get('hzero.common.button.print').d('打印')}
              {!allLoading && <Icon type="down" />}
            </Button>
          </Dropdown>
          {showAiApproveFlag && (
            <Button
              loading={allLoading}
              data-name="intelligentReview"
              onClick={this.handleIntelligentReview}
              disabled={aiApproveStatus === 'APPROVING'}
            >
              <span style={{ display: !allLoading ? 'flex' : 'initial', alignItems: 'center' }}>
                {!allLoading && <IntelligentReviewIcon style={{ marginRight: '4px' }} />}
                {intl.get('sslm.common.button.intelligentReview').d('智能预审')}
              </span>
            </Button>
          )}
        </Header>
        {showAiApproveFlag && (
          <ResultAlert params={aiApproveDTOList} aiApproveStatus={aiApproveStatus} />
        )}
        <Content>{this.renderForm()}</Content>
      </React.Fragment>
    ) : (
      <Spin />
    );
  }
}

const Index = props => {
  const { tenantNum } = querystring.parse(props.location.search.substr(1));
  const Detail = useMemo(
    () =>
      remotes(
        {
          code: 'SSLM_INVESTIGATION_WRITE_DETAIL',
          name: 'remote',
          tenantNum,
        },
        {
          events: {
            cuxInit: () => {},
          },
        }
      )(InvestigationWriteDetail),
    [tenantNum]
  );
  return <Detail {...props} />;
};

export default Index;
