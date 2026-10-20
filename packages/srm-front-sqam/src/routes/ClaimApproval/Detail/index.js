import React, { Component, Fragment } from 'react';
import { Button, Spin, Collapse, Form, Icon, Input, Row, Col, Modal, Tabs } from 'hzero-ui';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { connect } from 'dva';
import { createPagination, filterNullValueObject, getEditTableData } from 'utils/utils';
import { Bind } from 'lodash-decorators';
// import { routerRedux } from 'dva/router';
import { math } from 'choerodon-ui/dataset';

import classNames from 'classnames';
import {
  DETAIL_DEFAULT_CLASSNAME, 
  EDIT_FORM_ROW_LAYOUT,
  FORM_COL_2_LAYOUT,
  DEFAULT_DATETIME_FORMAT,
} from 'utils/constants';
import remotes from 'hzero-front/lib/utils/remote';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import UploadModal from '_components/Upload';
import { queryFileListOrg } from 'services/api';
import queryString from 'querystring';
import uuid from 'uuid/v4';
import { isNumber, isUndefined, throttle } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import moment from 'moment';

import { fetchFlag } from '@/services/sqamCommonService';
import BasicInfoForm from './BasicInfoForm';
import ClaimInformation from './ClaimInformation';
import ClaimItem from './ClaimItem';
import ClaimItemFilter from './ClaimItemFilter';
import ComplaintHandle from './ComplaintHandle';
import Change from '../../components/ChangeFormItem';
import OperationRecord from '../../RecordComponents/OperationRecord';
import Record from '../../components/OperationRecord/OperationRecord';

import ApproveRecord from '../../RecordComponents/ApproveRecord';

import styles from './index.less';

const { TextArea } = Input;
const formItemLayout = {
  labelCol: { span: 6, style: { textAlign: 'left', marginRight: '-6px' } },
  wrapperCol: { span: 18, style: { textAlign: 'left' } },
}; 

@remotes({
  code: 'SQAM_CLAIM_APPROVAL_DETAIL',
})
@withCustomize({
  unitCode: [
    'SQAM.CLAIM_APPROVAL_DETAIL.BASIC_INFO',
    'SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_INFO',
    'SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM',
    'SQAM.CLAIM_APPROVAL_DETAIL.COLLAPSE',
    'SQAM.CLAIM_APPROVAL_DETAIL.STATEMENT',
    'SQAM.CLAIM_APPROVAL_DETAIL.CLIAM_ITEM_FILTER',
  ],
})
@formatterCollections({
  code: [
    'sqam.common',
    'entity.item',
    'hzero.common',
    'entity.roles',
    'entity.supplier',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.attachment',
  ],
})
@connect(({ claimApproval, sqamCommon, loading }) => ({
  sqamCommon,
  claimApproval,
  fetchHeaderLoading: loading.effects['claimApproval/fetchHeader'],
  fetchLinesLoading: loading.effects['claimApproval/fetchLines'],
  approvalLoading: loading.effects['claimApproval/approval'],
  refuseLoading: loading.effects['claimApproval/refuse'],
  fetchOperationRecordListLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  loading: loading.effects['sqam/approveHistory'],
}))
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  formFilter = null;

  constructor(props) {
    super(props);
    const {
      location: { search },
    } = props;
    const { formHeaderId, pubEedit } = queryString.parse(search.substr(1));
    this.state = {
      visible: false,
      lineDateSource: [],
      selectedRowKeys: [],
      // isCreate: !isUndefined(props.match.params.formHeaderId),
      collapseKeys: ['baseInfo', 'claimInfo', 'claimItem', 'stateDeal'],
      formHeaderId,
      headerData: {},
      pagination: {},
      fileNum: 0,
      activeKey: 'option',
      flag: false,
      aAndOVisible: false,
      pubEedit,
    };
    const Change_ = new Change('rowKey');
    this.changeList = Change_.changeList;
    this.setUpdate = Change_.setUpdate;
    this.isUpdata = Change_._isUpdate;
    this.ChangeFormItem = Change_.ChangeFormItem;
  }

  async componentDidMount() {
    const { onLoad, onFormLoaded } = this.props;
    const { formHeaderId, pubEedit } = this.state;
    if (formHeaderId) {
      const res = await this.fetchHeader();
      this.fetchLines();
      this.fetchFlag();
      if (onLoad && pubEedit) {
        onLoad({
          submit: this.workFlowSubmit,
        });
      }
      if (onFormLoaded && pubEedit && res) onFormLoaded(true);
    }
  }

  workFlowSubmit = param => {
    return new Promise(async (resolve, reject) => {
      if (param === 'Approved') {
        const { headerData, lineDateSource, formHeaderId } = this.state;
        const { form, dispatch } = this.props;
        const { validateFieldsAndScroll } = form;
        validateFieldsAndScroll(async (errs, values) => {
          if (!errs) {
            const lineData = getEditTableData(lineDateSource).map(item => ({
              ...item,
              formHeaderId,
            }));
            const result = await dispatch({
              type: 'claimApproval/saveClaim',
              payload: {
                ...headerData,
                ...values,
                feedbackDate: moment(values.feedbackDate || headerData.feedbackDate).format(
                  DEFAULT_DATETIME_FORMAT
                ),
                claimFormLineList: lineData,
              },
            });
            if (result) resolve();
            else reject();
          } else {
            reject();
          }
        });
      } else {
        return resolve();
      }
    });
  };

  // 索赔单头查询
  @Bind()
  async fetchHeader() {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    const response = dispatch({
      type: 'claimApproval/fetchHeader',
      payload: formHeaderId,
    }).then(res => {
      if (res) {
        const { purchaseAttachmentUuid } = res;
        queryFileListOrg({
          attachmentUUID: purchaseAttachmentUuid || uuid(),
          bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
          bucketDirectory: 'sqam-claim',
        }).then(res1 => {
          if (res1) {
            this.setState({
              fileNum: res1.length,
            });
          }
        });
        this.setState({
          headerData: res,
        });
      }
    });
    return response;
  }

  // 索赔单行查询
  @Bind()
  fetchLines(page = {}) {
    const { dispatch, remote } = this.props;
    const { formHeaderId } = this.state;
    let param = {};
    if (!isUndefined(this.formFilter)) {
      param = this.formFilter?.getFieldsValue() || {};
    } 
    const params = {
      page,
      formHeaderId,
      ...param,
    };
    const payload=remote.process("SQAM_CLAIM_APPROVAL_DETAIL_CLAIM_ITEM_QUERY_PARAMS",params,{_this:this});
    dispatch({
      type: 'claimApproval/fetchLines',
      payload,
    }).then(res => {
      if (res) {
        this.setState({
          pagination: createPagination(res),
          lineDateSource: res.content.map(item => {
            const { amountFieldFlag } = item;
            return {
              ...item,
              rowKey: uuid(),
              _status: 'update',
              disabledTax: amountFieldFlag === 0,
              disabledNoTax: amountFieldFlag === 1,
            };
          }),
        });
      }
    });
  }

  @Bind()
  fetchFlag() {
    const { formHeaderId } = this.state;
    fetchFlag(formHeaderId).then(res => {
      if (res) {
        this.setState({
          flag: true,
        });
      } else {
        this.setState({
          flag: false,
        });
      }
    });
  }

  // 审批通过
  @Bind()
  approval() {
    const { headerData, lineDateSource } = this.state;
    const { form, dispatch, location, history } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        const { formHeaderId } = queryString.parse(location.search.slice(1));
        const lineData = getEditTableData(lineDateSource).map(item => ({
          ...item,
          formHeaderId,
        }));
        dispatch({
          type: 'claimApproval/approval',
          payload: { ...headerData, ...values, claimFormLineDTOList: lineData },
        }).then(res => {
          if (res) {
            history.push({
              pathname: `/sqam/claimApproval/list`,
            });

            notification.success();
          }
        });
      }
    });
  }

  // 审批拒绝
  @Bind()
  refuse() {
    const { headerData } = this.state;
    const { form, dispatch, history } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((errs, values) => {
      if (!errs) {
        dispatch({
          type: 'claimApproval/refuse',
          payload: { ...headerData, ...values },
        }).then(res => {
          if (res) {
            history.push({
              pathname: `/sqam/claimApproval/list`,
            });

            notification.success();
          }
        });
      }
    });
  }

  /**
   * onCollapseChange - 折叠面板onChange
   * @param {Array<string>} collapseKeys - Panels key
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  // 操作记录弹窗显隐
  @Bind()
  operationRecord(visible) {
    this.setState({ visible });
  }

  // 操作记录弹窗显隐
  @Bind()
  approveAndOperationRecord(visible) {
    this.setState({ aAndOVisible: visible });
  }

  // 操作记录查询
  @Bind()
  fetchOperationRecord(page = {}, values) {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    const search = filterNullValueObject(values);
    dispatch({
      type: 'sqamCommon/fetchOperationRecord',
      payload: {
        page,
        ...search,
        formHeaderId,
      },
    });
  }

  // 操作记录查询
  @Bind()
  fetchApproveRecord(page = {}, values) {
    const { dispatch } = this.props;
    const { formHeaderId } = this.state;
    const searchValues = filterNullValueObject(values);
    dispatch({
      type: 'sqamCommon/approveHistory',
      payload: {
        page,
        ...searchValues,
        formHeaderId,
      },
    });
  }

  // 个性化影响
  @Bind()
  handleSetExpenseProcess(value) {
    const { headerData } = this.state;
    const {
      form: { setFields, setFieldsValue, registerField },
    } = this.props;
    if (registerField) registerField('expenseProcessType');
    this.setState({
      headerData: {
        ...headerData,
        expenseProcessTypeMeaning: value,
        expenseProcessType: value,
      },
    });
    if (value) {
      const val = {
        value,
        errors: null,
      };
      setFields({
        expenseProcessType: val,
        expenseProcessTypeMeaning: val,
      });
    } else {
      setFieldsValue({ expenseProcessTypeMeaning: null, expenseProcessType: null });
    }
  }

  @Bind()
  tabChange(key) {
    this.setState({
      activeKey: key,
    });
  }

  // 更改源数据dataSource
  @Bind()
  changeDataSource(record, changItem = {}) {
    const { lineDateSource, headerData } = this.state;
    let newTotalAmount = headerData.totalAmount;
    let otherSum = 0;
    lineDateSource.map(item => {
      otherSum = math.plus(item.taxIncludedLineAmount, otherSum);
      return item;
    });
    const otherAmount = math.minus(newTotalAmount, otherSum);
    const newDataSource = lineDateSource.map(item => {
      if (record.rowKey === item.rowKey) {
        return {
          ...item,
          ...changItem,
        };
      }
      return item;
    });
    if (isNumber(changItem.taxIncludedLineAmount)) {
      let newSum = 0;
      newDataSource.map(item => {
        newSum = math.plus(item.taxIncludedLineAmount, newSum);
        return item;
      });
      newTotalAmount = math.plus(otherAmount, newSum);
    }
    this.setState({
      headerData: {
        ...headerData,
        totalAmount: newTotalAmount,
      },
      lineDateSource: newDataSource,
    });
  }

  @Bind()
  whetherDisabled(obj, record) {
    const { lineDateSource } = this.state;
    this.setState({
      lineDateSource: lineDateSource.map(item => {
        if (record.formLineId === item.formLineId) {
          return {
            ...item,
            disabledTax: obj.disabledTax && obj.disabledTax,
            disabledNoTax: obj.disabledNoTax && obj.disabledNoTax,
          };
        } else {
          return item;
        }
      }),
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.formFilter = (ref.props || {}).form;
  }

  render() {
    const {
      visible,
      collapseKeys,
      lineDateSource,
      selectedRowKeys,
      headerData,
      pagination,
      activeKey,
      flag,
      aAndOVisible,
      pubEedit,
      formHeaderId,
    } = this.state;
    const {
      form,
      match,
      remote,
      sqamCommon,
      fetchHeaderLoading,
      fetchLinesLoading,
      approvalLoading,
      refuseLoading,
      fetchOperationRecordListLoading,
      loading,
      customizeFilterForm,
      custConfig,
      customizeTable,
      customizeForm,
      queryUnitConfig,
      history,
      customizeCollapse,
    } = this.props;
    const isLoading = fetchHeaderLoading || fetchLinesLoading || approvalLoading || refuseLoading;
    const {
      operationRecordList = [],
      operationRecordPagination = {},
      approveHistoryList = [],
    } = sqamCommon;
    const notPubType = match.path !== '/pub/sqam/claimApproval/detail';
    const basicInfoProps = {
      form,
      headerData,
      customizeForm,
    };
    const complaintHandleProps = {
      customizeForm,
      dataSource: headerData,
    };
    const claimInformationProps = {
      form,
      headerData,
      onSetExpenseProcess: this.handleSetExpenseProcess,
      customizeForm,
      history,
      editFlag: pubEedit,
    };
    const claimItemProps = {
      form,
      remote,
      pagination,
      selectedRowKeys,
      fetchLinesLoading,
      fetchLines: this.fetchLines,
      onSelectChange: this.onSelectChange,
      lineDateSource,
      headerData,
      ChangeFormItem: this.ChangeFormItem,
      changeDataSource: this.changeDataSource,
      whetherDisabled: this.whetherDisabled,
      customizeTable,
      queryUnitConfig,
      editFlag: pubEedit,
    };
    const claimItemFilterProps = {
      handleSearchLine: this.fetchLines,
      onRef: this.handleBindRef,
      customizeFilterForm,
      custConfig,
    };
    const uploadModalProps = {
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${
        headerData.purchaseAttachmentUuid ? this.state.fileNum : 0
      })`,
      btnProps: {
        icon: 'paper-clip',
        loading: isLoading,
      },
      viewOnly: true,
      showFilesNumber: false,
      attachmentUUID: headerData.purchaseAttachmentUuid,
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      uploadSuccess: this.fetchHeader,
      removeCallback: this.fetchHeader,
    };
    const OperationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      onCancel: () => this.approveAndOperationRecord(false),
      handleOperationRecordSearch: this.fetchOperationRecord,
      isExport: true,
      formHeaderId,
    };
    const RecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.fetchOperationRecord,
      hideModal: () => this.operationRecord(false),
      visible,
      formHeaderId,
      isExport: true,
    };
    const ApproveRecordProps = {
      dataSource: approveHistoryList,
      loading,
      handleOperationRecordSearch: this.fetchApproveRecord,
    };
    const modalProps = {
      visible: aAndOVisible,
      width: 1100,
      footer: null,
      onCancel: () => this.approveAndOperationRecord(false),
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      // title: intl.get(`hzero.common.button.operating`).d('操作记录'),
    };
    // 审批通过按钮显示逻辑
    const approvedFlag = remote.process(
      'SQAM_CLAIM_APPROVAL_DETAIL_HEADER_BTN_APPROVED_FLAG',
      true,
      { _this: this }
    );
    // 审批拒绝按钮显示逻辑
    const rejectFlag = remote.process('SQAM_CLAIM_APPROVAL_DETAIL_HEADER_BTN_REJECT_FLAG', true, {
      _this: this,
    });
    return (
      <Fragment>
        {notPubType && (
          <Header
            title={intl.get(`sqam.common.view.title.claimApproval`).d('索赔单审批')}
            backPath="/sqam/claimApproval/list"
          >
            {approvedFlag && (
              <Button
                icon="check"
                type="primary"
                onClick={throttle(this.approval, 1500, { trailing: false })}
                loading={isLoading}
              >
                {intl.get('hzero.common.view.message.title.approved').d('审批通过')}
              </Button>
            )}
            {rejectFlag && (
              <Button
                icon="close"
                onClick={throttle(this.refuse, 1500, { trailing: false })}
                loading={isLoading}
              >
                {intl.get('hzero.common.view.message.title.reject').d('审批拒绝')}
              </Button>
            )}
            <UploadModal {...uploadModalProps} />
            <Button
              icon="clock-circle-o"
              loading={isLoading}
              onClick={() =>
                flag ? this.approveAndOperationRecord(true) : this.operationRecord(true)
              }
            >
              {flag
                ? intl.get('hzero.common.button.approveAndOperating').d('审批/操作记录')
                : intl.get('hzero.common.button.operating').d('操作记录')}
            </Button>
            {remote.render('SQAM_CLAIM_APPROVAL_DETAIL_HEADER_BTNS', null, {
              _this: this,
            })}
          </Header>
        )}
        <Content className={classNames(styles['page-content'])}>
          {!notPubType && (
            <UploadModal
              {...uploadModalProps}
              btnProps={{ ...uploadModalProps.btnProps, style: { marginBottom: '10px' } }}
            />
          )}
          {notPubType && (
            <Form className={styles['header-wrapper']}>
              <Row {...EDIT_FORM_ROW_LAYOUT} className={classNames('last-form-item', 'half-row')}>
                <Col {...FORM_COL_2_LAYOUT}>
                  <Form.Item
                    label={
                      headerData?.statusCode === 'CANCELING'
                        ? intl.get(`sqam.common.view.button.cancelOpinion`).d('取消原因')
                        : intl.get(`sqam.common.view.button.title.approvalOpinion`).d('审批意见')
                    }
                    {...formItemLayout}
                  >
                    {form.getFieldDecorator('approvedRemark', {
                      rules: [
                        {
                          max: 160,
                          message: intl
                            .get(`hzero.common.validation.max`, {
                              max: 160,
                            })
                            .d(`长度不能超过${160}个字符`),
                        },
                        {
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`sqam.common.view.button.title.approvalOpinion`)
                              .d('审批意见'),
                          }),
                        },
                      ],
                      // initialValue:
                      //   headerData.approvedRemark ||
                      //   intl.get('sqam.common.view.button.opinion').d('索赔情况属实，同意发布'),
                    })(<TextArea className={styles['approved-remark']} rows={3} />)}
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          )}
          <Spin
            spinning={fetchHeaderLoading}
            wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}
          >
            {customizeCollapse({
              code:"SQAM.CLAIM_APPROVAL_DETAIL.COLLAPSE",
            },
            <Collapse
              forceRender
              defaultActiveKey={collapseKeys}
              className="form-collapse"
              onChange={this.onCollapseChange}
            >
              {(headerData.appealedFlag || !notPubType) && (
                <Collapse.Panel
                  showArrow={false}
                  forceRender
                  key="stateDeal"
                  header={
                    <Fragment>
                      <h3>{intl.get(`sqam.common.view.panel.complaintHandle`).d('申诉处理')}</h3>
                      <a>
                        {collapseKeys.includes('stateDeal')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('stateDeal') ? 'up' : 'down'} />
                    </Fragment>
                  }
                >
                  <ComplaintHandle {...complaintHandleProps} />
                </Collapse.Panel>
              )}
              <Collapse.Panel
                showArrow={false}
                forceRender
                key="baseInfo"
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.baseInfo`).d('基本信息')}</h3>
                    <a>
                      {collapseKeys.includes('baseInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('baseInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <BasicInfoForm {...basicInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
                key="claimInfo"
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.claimInfo`).d('索赔信息')}</h3>
                    <a>
                      {collapseKeys.includes('claimInfo')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('claimInfo') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClaimInformation {...claimInformationProps} />
              </Collapse.Panel>
              <Collapse.Panel
                className={styles['purchase-application']}
                showArrow={false}
                forceRender
                key="claimItem"
                header={
                  <Fragment>
                    <h3>{intl.get(`sqam.common.view.panel.claimItem`).d('索赔项目')}</h3>
                    <a>
                      {collapseKeys.includes('claimItem')
                        ? intl.get(`hzero.common.button.up`).d('收起')
                        : intl.get(`hzero.common.button.expand`).d('展开')}
                    </a>
                    <Icon type={collapseKeys.includes('claimItem') ? 'up' : 'down'} />
                  </Fragment>
                }
              >
                <ClaimItemFilter {...claimItemFilterProps} />
                <ClaimItem {...claimItemProps} />
              </Collapse.Panel>
            </Collapse>
          )}
          </Spin>
        </Content>
        <Modal {...modalProps} >
          <Tabs onChange={this.tabChange} activeKey={activeKey} animated={false}>
            <Tabs.TabPane
              tab={intl.get('hzero.common.button.operating').d('操作记录')}
              key="option"
            >
              <OperationRecord {...OperationRecordProps} />
            </Tabs.TabPane>
            <Tabs.TabPane
              tab={intl.get(`sqam.common.model.qualityRectification.approvalRecord`).d('审批记录')}
              key="approve"
            >
              <ApproveRecord {...ApproveRecordProps} />
            </Tabs.TabPane>
          </Tabs>
        </Modal> 
        <Record {...RecordProps} />
      </Fragment>
    );
  }
}
