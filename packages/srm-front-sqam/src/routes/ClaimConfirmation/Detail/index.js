/**
 * 索赔单确认-明细页
 * @date: 2019-11-4
 * @author: ZJC <junchao.zhou@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */ 
 
import React, { Fragment, PureComponent } from 'react';
import { Button, Spin, Collapse, Form, Col, Icon, Row, Input, Select, Modal } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { routerRedux } from 'dva/router';
import { isUndefined, isEmpty, isNil, throttle } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';

import classNames from 'classnames';
import notification from 'utils/notification';
import UploadModal from '_components/Upload/index';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import Upload from 'srm-front-boot/lib/components/Upload';
import { Header, Content } from 'components/Page';
import { queryFileListOrg } from 'services/api';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import {
  DETAIL_DEFAULT_CLASSNAME,
  FORM_COL_2_LAYOUT,
  FORM_COL_3_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
} from 'utils/constants';
import remote from 'hzero-front/lib/utils/remote';
 
import {
  getCurrentOrganizationId,
  getCurrentUser,
  filterNullValueObject,
  getEditTableData,
} from 'utils/utils';
import styles from './index.less';
import BaseInfo from './BaseInfo';
import ClaimInfo from './ClaimInfo';
import StateDeal from './StateDeal';
import StateDealFilter from './StateDealFilter';
import AppealModel from './AppealModel';
import ComplaintHandle from './ComplaintHandle';
import OperationRecord from '../../components/OperationRecord/OperationRecord';

const { TextArea } = Input;

const prefix = `sqam.common`;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

@withCustomize({
  unitCode: [
    'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
    'SQAM.CLAIM_CONFIRMATION_DETAIL.REASON',
    'SQAM.CLAIM_CONFIRMATION_DETAIL.STATEMENT',
    'SQAM.CLAIM_CONFIRMATION_DETAIL.BASIC_INFO',
    'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
    'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM_FILTER',
    'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
  ],
})
@connect(({ claimOrder, sqamCommon, loading }) => ({
  claimOrder,
  sqamCommon,
  AgreeClaimLoading: loading.effects['claimOrder/AgreeClaim'],
  HeadLoading: loading.effects['claimOrder/ConfirmFetchDetailDataHead'],
  ListLoading: loading.effects['claimOrder/ConfirmFetchDetailDataList'],
  fetchOperationRecordListLoading: loading.effects['sqamCommon/fetchOperationRecord'],
  initiateLoading: loading.effects['claimOrder/InitiateClaimStatement'],
  tenantId: getCurrentOrganizationId(),
  supplierTenantId: getCurrentUser().organizationId,
}))
@remote({
  code: 'SQAM_CLAIM_CONFIRMATION_DETAIL_CUX',
  name: 'remote',
},{
  events: {
    // 同意索赔前的埋点
    handleCuxAgreeBefore() {},
  },
})
@formatterCollections({
  code: [
    'sqam.common',
    'hzero.common',
    'entity.company',
    'entity.business',
    'entity.organization',
    'entity.supplier',
    'entity.item',
    'entity.attachment',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends PureComponent {
  formFilter = null;

  constructor(props) {
    super(props);
    this.state = {
      collapseKeys: ['baseInfo', 'claimInfo', 'claimItem', 'C'],
      readOnly: true,
      AppealModelVisible: false,
      operationRecordVisible: false,
      supplierConfirmUuid: null,
      fileNum: 0,
      selectedRowKeys: [],
      isSaved: false,
    };
  }

  componentDidMount() {
    this.handleSearchHead();
    this.handleSearchLine();
    this.queryValueCode();
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimOrder/updateState',
      payload: {
        DetailListDataSource: [],
        DetailHeadDataSource: {},
        DetailListPagination: {},
        formHeaderId: null,
      },
    });
  }

  /**
   * 数据行选择操作
   */
  @Bind()
  handleSelectRow(selectedRowKeys) {
    this.setState({ selectedRowKeys });
  }

  /**
   * 查询
   */
  @Bind()
  handleSearchHead() {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      // 头查询
      dispatch({
        type: 'claimOrder/ConfirmFetchDetailDataHead',
        payload: {
          tenantId,
          formHeaderId: id,
          customizeUnitCode: [
            'SQAM.CLAIM_CONFIRMATION_DETAIL.BASIC_INFO',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
            // 'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.REASON',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.STATEMENT',
          ].join(),
        },
      }).then((res) => {
        if (res) {
          const { purchaseAttachmentUuid } = res;
          queryFileListOrg({
            attachmentUUID: purchaseAttachmentUuid || uuid(),
            bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
            bucketDirectory: 'sqam-claim',
          }).then((res1) => {
            if (res1) {
              this.setState({
                fileNum: res1.length,
              });
            }
          });
        }
      });
    }
  }

  /**
   * 批量查询值集
   */
  @Bind()
  queryValueCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'claimOrder/queryValueCode',
      payload: {
        appealContentSelects: 'SQAM.APPEALED_CONTENT', // 申诉内容
        payMentType: 'SQAM.PAYMENT_TYPE', // 费用处理方式
      },
    });
    dispatch({
      type: 'sqamCommon/init',
    });
  }

  /**
   *  查询行
   */
  @Bind()
  handleSearchLine() {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    if (!isUndefined(id)) {
      let param = {};
      if (!isUndefined(this.formFilter)) {
        param = this.formFilter?.getFieldsValue() || {};
      }
      // 行查询
      dispatch({
        type: 'claimOrder/ConfirmFetchDetailDataList',
        payload: {
          formHeaderId: id,
          tenantId,
          customizeUnitCode: [
            'SQAM.CLAIM_CONFIRMATION_DETAIL.BASIC_INFO',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
            'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM_FILTER',
          ].join(),
          ...param,
        },
      });
    }
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

  @Bind()
  handleOperation(url, customizeUnitCode, callback, type) {
    const {
      dispatch,
      tenantId,
      form: { validateFields },
      claimOrder: {
        DetailHeadDataSource,
        // DetailListDataSource,
      },
    } = this.props;
    const { _token, objectVersionNumber, formHeaderId } = DetailHeadDataSource;
    const { supplierConfirmUuid } = this.state;
    validateFields(async(err, value) => {
      if (!err) {
        const newValue = {
          ...value,
          formHeaderId,
          _token,
          objectVersionNumber,
          supplierConfirmUuid,
        };
        const extraParam = type === 'save' ? DetailHeadDataSource : {};
        const claimFormLineDTOList = await this.getNewTableData();
        if(claimFormLineDTOList){
          dispatch({
            type: url,
            payload: {
              tenantId,
              body: {
                ...extraParam,
                ...newValue,
                claimFormLineDTOList,
              },
              customizeUnitCode,
            },
          }).then((res) => {
            // this.goBack(res);

            if (type === 'agreeClaim') {
              callback(res);
            } else {
              // eslint-disable-next-line no-lonely-if
              if (res) {
                notification.success();
                callback();
              }
            }
          });
        }
      }
    });
  }

  // 保存
  @Bind()
  handleSave() {
    const customizeUnitCode = [
      'SQAM.CLAIM_CONFIRMATION_DETAIL.BASIC_INFO',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.STATEMENT',
    ].join();
    const fetchData = () => {
      this.handleSearchHead();
      this.handleSearchLine();
    };
    this.handleOperation('claimOrder/SaveClaim', customizeUnitCode, fetchData, 'save');
  }

  @Bind()
  async handleAgreeClaim() {
    const { remote: remoteProps } = this.props;
    if (remoteProps?.event) {
      const resp = await remoteProps.event.fireEvent('handleCuxAgreeBefore', {_this: this});
      if (!resp) {
        return;
      }
    }
    const customizeUnitCode = [
      'SQAM.CLAIM_CONFIRMATION_DETAIL.BASIC_INFO',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
      'SQAM.CLAIM_CONFIRMATION_DETAIL.STATEMENT',
    ].join(); 
    this.handleOperation('claimOrder/AgreeClaim', customizeUnitCode, this.goBack, 'agreeClaim');
  }

  @Bind()
  goBack(res) {
    const { dispatch } = this.props;
    if (res && isEmpty(res)) {
      notification.success();
      dispatch(
        routerRedux.push({
          pathname: `/sqam/claimConfirmation/list`,
        })
      );
    }
  }

  /**
   * 打开处理申诉
   */

  @Bind()
  async handleOpenAppeal() {
    const { remote: remoteProps, claimOrder = {} } = this.props;
    if (remoteProps) {
      const beforeRes = await remoteProps.event.fireEvent('beforeOpenAppealModal', {
        claimOrder,
      });
      if (beforeRes === false) return false;
    }
    this.setState({
      AppealModelVisible: true,
    });
  }

  // 获取列表数据
  @Bind()
  async getNewTableData() {
    const {
      claimOrder: { DetailListDataSource = [] },
    } = this.props;
    let newList = [];
    // eslint-disable-next-line no-unused-vars
    let lineValidateFlag = true;
    newList = getEditTableData(DetailListDataSource, ['rowKey', '_status', 'formLineId'], {
      force: true,
    }); 

     // 个性化附件必填校验getEditTableData不支持，需改造
     if (!isEmpty(DetailListDataSource)) {
      lineValidateFlag = await Promise.all(
        DetailListDataSource.map(i =>
          (() =>
            new Promise((resolve, reject) => {
              if (i.$form && i._status) {
                i.$form.validateFieldsAndScroll(
                  { scroll: { allowHorizontalScroll: true }, force: true },
                  (err, recordData) => {
                    if (!err) {
                      const { $form, ...otherProps } = i;
                      resolve({ ...otherProps, ...recordData });
                    } else {
                      reject(err);
                    }
                  }
                );
              }
            }))()
        )
      ).catch(() => {
        // console.log(err);
      });
    }

    if(lineValidateFlag){
      return newList;
    }
  }

  // 发起申诉
  @Bind()
  async InitiateClaimStatement(value) {
    const {
      dispatch,
      tenantId,
      claimOrder: {
        DetailHeadDataSource: {
          _token,
          objectVersionNumber,
          formHeaderId,
          purchaseAttachmentUuid,
          supplierAttachmentUuid,
        },
      },
    } = this.props;
    const newValue = {
      _token,
      objectVersionNumber,
      formHeaderId,
      purchaseAttachmentUuid,
      supplierAttachmentUuid,
      ...value,
    };
    const claimFormLineDTOList = await this.getNewTableData();
    if(claimFormLineDTOList){
      dispatch({
        type: 'claimOrder/InitiateClaimStatement',
        payload: {
          tenantId,
          body: { ...newValue, claimFormLineDTOList },
          customizeUnitCode:
            'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM,SQAM.CLAIM_CONFIRMATION_DETAIL.REASON',
        },
      }).then((res) => {
        this.goBack(res);
      });
    }
  }

  /**
   * 关闭处理申诉
   */

  @Bind()
  handleCloseAppeal() {
    this.setState({
      AppealModelVisible: false,
    });
  }

  /**
   * 获得申诉model内数据
   */
  @Bind()
  getAppealModelData(value) {
    // 发起申诉
    this.InitiateClaimStatement(value);
  }

  /**
   * 简单的判断两个对象值是否相同
   * 忽略obj1.a = undefined,obj2.a = null 的情况(这种情况默认相同)
   * @param {*} obj1
   * @param {*} obj2
   * @returns Boolean
   */

  @Bind()
  isEqualBoth(obj1, obj2) {
    let isSame = true;
    for (const [key, value] of Object.entries(obj1)) {
      const otherValue = obj2[key];
      if (!(isNil(value) && isNil(otherValue)) && value !== otherValue) {
        // 是否两个字段的值不同，忽略字段值为undefined或者null的情况
        isSame = false;
        return false;
      }
    }
    return isSame;
  }

  /**
   * 处理列表列表数据分页变化
   */
  @Bind()
  handleListPageChange(page = {}) {
    const {
      claimOrder: { DetailListDataSource = [] },
    } = this.props;

    // const oldDatas = DetailListDataSource.map(elem => {
    //   // eslint-disable-next-line no-param-reassign

    //   return filterNullValueObject({ ...elem, $form: null });
    // });
    const newList = getEditTableData(DetailListDataSource, ['rowKey', '_status', 'formLineId'], {
      force: true,
    });
    let isEdit = false;

    if (newList.length) {
      DetailListDataSource.forEach((oldRecord, index) => {
        const newData = newList[index];
        const oldData = {};
        Object.entries(oldRecord).forEach(([key, value]) => {
          if (key !== '$form') {
            oldData[key] = value;
          }
        });
        if (!this.isEqualBoth(oldData, newData)) {
          isEdit = true;
          return true;
        }
      });
      if (isEdit) {
        // 表格数据发生变化
        Modal.confirm({
          title: intl
            .get('sqam.common.view.message.turn.saveList')
            .d('有数据未保存，翻页会导致数据丢失，是否继续?'),
          onOk: () => {
            this.handleListPage(page);
          },
          onCancel() {},
        });
      } else {
        this.handleListPage(page);
      }
    }
  }

  @Bind()
  handleListPage(page = {}) {
    const { dispatch, match, tenantId } = this.props;
    const { id } = match.params;
    // 行查询
    dispatch({
      type: 'claimOrder/ConfirmFetchDetailDataList',
      payload: {
        formHeaderId: id,
        tenantId,
        page,
        customizeUnitCode: [
          'SQAM.CLAIM_CONFIRMATION_DETAIL.BASIC_INFO',
          'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
          'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_ITEM',
          'SQAM.CLAIM_CONFIRMATION_DETAIL.CLAIM_INFO',
        ].join(),
      },
    });
  }

  // 操作记录
  @Bind()
  operationRecord(visible) {
    if (visible) {
      this.fetchOperationRecord();
    }
    this.setState({
      operationRecordVisible: visible,
    });
  }

  // 操作记录
  @Bind()
  fetchOperationRecord(page = {}, values) {
    const { dispatch, match = {} } = this.props;
    const { id } = match.params;
    const search = filterNullValueObject(values);
    if (id) {
      dispatch({
        type: 'sqamCommon/fetchOperationRecord',
        payload: {
          page,
          ...search,
          formHeaderId: id,
        },
      });
    }
  }

  // 计算申诉次数
  @Bind()
  getApplyTimes(appealedSum = 0, appealedCount = 0) {
    return [false, null, undefined, '', 0, NaN].includes(appealedCount)
      ? appealedSum
      : `${appealedSum}/${appealedCount}`;
  }

  @Bind()
  afterOpenUploadModal(uuid1) {
    this.setState({
      supplierConfirmUuid: uuid1,
    });
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.formFilter = (ref.props || {}).form;
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      collapseKeys,
      readOnly,
      AppealModelVisible,
      // tenantId,
      operationRecordVisible,
      selectedRowKeys = [],
    } = this.state;
    const {
      form = {},
      AgreeClaimLoading,
      HeadLoading,
      ListLoading,
      claimOrder = {},
      dispatch,
      sqamCommon = {},
      initiateLoading,
      fetchOperationRecordListLoading,
      customizeForm,
      tenantId,
      customizeFilterForm,
      customizeTable,
      history,
      custConfig,
      remote: remoteProps,
    } = this.props;
    const isLoading = AgreeClaimLoading || HeadLoading || ListLoading || initiateLoading;
    const {
      DetailListDataSource = [],
      DetailHeadDataSource = {},
      DetailListPagination,
      code = {},
      formHeaderId,
    } = claimOrder;
    const { appealedFlag = 0 } = DetailHeadDataSource;
    const { operationRecordList = [], operationRecordPagination = {} } = sqamCommon;
    const { appealContentSelects = [], payMentType = [] } = code;
    const { getFieldDecorator } = form;
    const baseInfoProps = {
      form,
      readOnly,
      dataSource: DetailHeadDataSource,
      customizeForm,
      remote:remoteProps,
    };
    const claimInfoProps = {
      readOnly,
      form,
      dataSource: DetailHeadDataSource,
      customizeForm,
      history,
      remoteProps,
    };
    const stateDealProps = {
      dataSource: DetailListDataSource,
      pagination: DetailListPagination,
      ListLoading,
      onChange: this.handleListPageChange,
      selectedRowKeys,
      onSelectRow: this.handleSelectRow,
      DetailHeadDataSource,
      customizeTable,
    };
    const stateDealFilterProps = {
      selectedRowKeys,
      formHeaderId,
      tenantId,
      handleSearchLine: this.handleSearchLine,
      onRef: this.handleBindRef,
      customizeFilterForm,
    };
    const AppealModelProps = {
      // form,
      customizeForm,
      AppealModelVisible,
      tenantId,
      dispatch,
      formHeaderId,
      appealContentSelects,
      dataSource: DetailHeadDataSource,
      onClose: this.handleCloseAppeal,
      onOk: this.getAppealModelData,
      handleSearchHead: this.handleSearchHead,
      handleSearchLine: this.handleSearchLine,
      applyTimes: this.getApplyTimes(
        DetailHeadDataSource.appealedSum,
        DetailHeadDataSource.appealedCount
      ),
    };
    const uploadProps = {
      bucketName: window.$$env.PRIVATE_BUCKET || 'private-bucket',
      bucketDirectory: 'sqam-claim',
      btnText: `${intl.get(`entity.attachment.view`).d('附件查看')}(${
        DetailHeadDataSource.purchaseAttachmentUuid ? this.state.fileNum : 0
      })`,
      attachmentUUID: DetailHeadDataSource.purchaseAttachmentUuid,
      viewOnly: true,
      showFilesNumber: false,
      btnProps: {
        icon: 'paper-clip',
      },
    };

    const OperationRecordProps = {
      pagination: operationRecordPagination,
      dataSource: operationRecordList,
      loading: fetchOperationRecordListLoading,
      handleOperationRecordSearch: this.fetchOperationRecord,
      hideModal: () => this.operationRecord(false),
      visible: operationRecordVisible,
    };

    const complaintHandleProps = {
      form,
      dataSource: DetailHeadDataSource,
      applyTimes: this.getApplyTimes(
        DetailHeadDataSource.appealedSum,
        DetailHeadDataSource.appealedCount
      ),
      customizeForm,
    };
    const agreeClaimFlag = remoteProps.process("SQAM_CLAIM_CONFIRMATION_DETAIL_CUX_HEADER_BTN_AGREE_CLAIM_FLAG", true,{_this:this});
    return (
      <React.Fragment>
        <Header
          title={intl.get(`sqam.common.model.claimConfirm`).d('索赔单确认')}
          backPath="/sqam/claimConfirmation/list"
        >
          {agreeClaimFlag && (
            <Button
            icon="check"
            onClick={throttle(this.handleAgreeClaim, 1500, { trailing: false })}
            type="primary"
            loading={isLoading}
          >
            {intl.get('sqam.common.button.agreeClaim').d('同意索赔')}
          </Button>
          )}
          <Button
            icon="notification"
            onClick={throttle(this.handleOpenAppeal, 1500, { trailing: false })}
            loading={isLoading}
          >
            {intl.get('sqam.common.button.statement').d('申诉')}
          </Button>
          <UploadModal {...uploadProps} />
          <Button
            icon="clock-circle-o"
            onClick={throttle(() => this.operationRecord(true, formHeaderId), 1500, {
              trailing: false,
            })}
            loading={isLoading}
          >
            {intl.get('hzero.common.button.operating').d('操作记录')}
          </Button>
          <Button
            icon="save"
            onClick={throttle(() => this.handleSave(), 1500, { trailing: false })}
            loading={isLoading}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          {remoteProps.process("SQAM_CLAIM_CONFIRMATION_DETAIL_CUX_HEADER_BTNS",null,{_this:this})}
        </Header>
        <Content className={classNames(styles['page-content'])}>
          <Spin
            spinning={HeadLoading && ListLoading}
            wrapperClassName={classNames(DETAIL_DEFAULT_CLASSNAME)}
          >
            <div className="form-collapse" style={{ paddingLeft: '16px' }}>
              {customizeForm(
                {
                  code: 'SQAM.CLAIM_CONFIRMATION_DETAIL.SUPPLIER_FEEDBACK',
                  form, 
                  dataSource:DetailHeadDataSource,
                },
                <Form className={styles['header-wrapper']}>
                  <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        label={intl.get(`sqam.common.model.supplierConfirm`).d('供应商确认附件')}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('supplierConfirmUuid')(
                          <Upload
                            filePreview
                            bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                            bucketDirectory="sqam-claim"
                            attachmentUUID={DetailHeadDataSource.supplierConfirmUuid}
                            tenantId={getCurrentOrganizationId()}
                            afterOpenUploadModal={this.afterOpenUploadModal}
                          />
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
                    <Col {...FORM_COL_3_LAYOUT}>
                      <Form.Item
                        label={intl.get(`sqam.common.model.expenseProcessType`).d('费用处理方式')}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('expenseProcessType', {
                          initialValue: DetailHeadDataSource.expenseProcessType,
                        })(
                          <Select allowClear>
                            {payMentType.map((item) => (
                              <Select.Option key={item.value}>{item.meaning}</Select.Option>
                            ))}
                          </Select>
                        )}
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row
                    {...EDIT_FORM_ROW_LAYOUT}
                    className={classNames('last-form-item', 'half-row')}
                  >
                    <Col {...FORM_COL_2_LAYOUT}>
                      <Form.Item
                        label={intl.get(`sqam.common.model.feedbackOpinion`).d('反馈意见')}
                        {...formItemLayout}
                      >
                        {getFieldDecorator('feedbackOpinion', {
                          initialValue: DetailHeadDataSource.feedbackOpinion,
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
                              required: true,
                              message: intl.get('hzero.common.validation.notNull', {
                                name: intl.get(`sqam.common.model.feedbackOpinion`).d('反馈意见'),
                              }),
                            },
                          ],
                        })(<TextArea rows={2} style={{ overflow: 'hidden' }} />)}
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              )}
            </div>

            <Collapse
              forceRender
              className="form-collapse"
              defaultActiveKey={collapseKeys}
              onChange={this.onCollapseChange}
            >
              {Number(appealedFlag) === 1 && (
                <Collapse.Panel
                  showArrow={false}
                  forceRender
                  header={
                    <Fragment>
                      <h3>{intl.get(`${prefix}.view.panel.complaintHandle`).d('申诉处理')}</h3>
                      <a>
                        {collapseKeys.includes('C')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.includes('C') ? 'up' : 'down'} />
                    </Fragment>
                  }
                  key="C"
                >
                  <ComplaintHandle {...complaintHandleProps} />
                </Collapse.Panel>
              )}
              <Collapse.Panel
                showArrow={false}
                forceRender
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
                key="baseInfo"
              >
                <BaseInfo {...baseInfoProps} />
              </Collapse.Panel>
              <Collapse.Panel
                showArrow={false}
                forceRender
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
                key="claimInfo"
              >
                {!isLoading && Object.keys(custConfig).length > 0 && (
                  <ClaimInfo {...claimInfoProps} />
                )}
              </Collapse.Panel>

              <Collapse.Panel
                showArrow={false}
                forceRender
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
                key="claimItem"
              >
                <StateDealFilter {...stateDealFilterProps} />
                <StateDeal {...stateDealProps} />
              </Collapse.Panel>
            </Collapse>
          </Spin>
          {operationRecordVisible && <OperationRecord {...OperationRecordProps} />}
          <AppealModel {...AppealModelProps} />
        </Content>
      </React.Fragment>
    );
  }
}
