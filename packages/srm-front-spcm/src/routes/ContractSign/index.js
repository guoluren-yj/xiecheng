/* eslint-disable no-redeclare */
/**
 * index.js - 协议签署
 * @date: 2019-05-22
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { parse, stringify } from 'querystring';
import { Button, Form } from 'hzero-ui';
import { isUndefined, isArray, isEmpty } from 'lodash';
import { connect } from 'dva';
import intl from 'utils/intl';
import { DATETIME_MIN } from 'utils/constants';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Header, Content } from 'components/Page';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import notification from 'utils/notification';
import hocRemote from 'utils/remote';

import { batchCheckOrderSignContract } from '@/utils/commonCheck';
import { batchCheckContractConfirm } from '@/services/contractSignService';

import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';
import RejectModal from './Detail/RejectModal';
import Search from './Search';
import List from './List';
import LocalizedModal from './LocalizedModal';

const viewMessagePrompt = 'spcm.contractSign.view.message';

@Form.create({ fieldNameProp: null })
@connect(({ loading = {}, contractSign = {} }) => ({
  queryListLoading: loading.effects['contractSign/queryList'],
  updateStateLoading: loading.effects['contractSign/updateState'],
  fetchOperationRecordListLoading: loading.effects['contractSign/fetchOperationRecordList'],
  rejectLoading: loading.effects['contractSign/rejectContract'],
  confirmLoading:
    loading.effects['contractSign/sureContract'] || loading.effects['contractSign/confirmContract'],
  contractSign,
}))
@formatterCollections({
  code: [
    'spcm.contractSign',
    'spcm.common',
    'entity.company',
    'entity.roles',
    'entity.business',
    'entity.organization',
  ],
})
@withCustomize({
  unitCode: [
    'SPCM.CONTRACT.SIGN.LIST',
    'SPCM.CONTRACT.SIGN.LIST.FILTER',
    'SPCM.CONTRACT.SIGN.BTN_GROUP',
  ],
})
@hocRemote(
  {
    code: 'SPCM_CONTRACT_SIGN_VIEW_LIST',
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      // 页面加载完成后触发 埋点处理
      handlePageDidMount() {},
      // 协议拒绝
      handleCuxVisible() {},
      // 协议确认
      confirmCuxContract() {},
      // 拒绝协议确认
      handleCuxReject() {
        return true;
      },
    },
  }
)
export default class ContractSign extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = parse(search.substr(1));
    this.state = {
      headerInfo: {}, // 头form数据源
      pcHeaderId,
      visible: false,
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordVisible: false,
      tenantId: getCurrentOrganizationId(),
      rejectModalVisible: false, // 审批拒绝弹窗
      pcSureCodeFlag: true,
      pcPublishCodeFlag: true,
      hasTwoCateElectricSign: false,
      hasSignStageIsAfter: false, // 签署阶段是否含协议确认后
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      contractSign: { pagination = {} },
      remote,
    } = this.props;
    // const { visible } = this.state;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      // visible: false;
      this.fetchList(); // 查询数据
      if (remote?.event) {
        remote.event.fireEvent('handlePageDidMount', { current: this });
      }
    }
    this.fetchEnum(); // 查询值集
    document.getElementById('root').scrollIntoView(false);
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  @Bind()
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['approvedDateFrom', 'approvedDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, selectedRows = []) {
    const { tenantId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows });
    dispatch({
      type: 'contractSign/queryList',
      payload: {
        page,
        // pcHeaderId,
        tenantId,
        ...handleFormValues,
        customizeUnitCode: 'SPCM.CONTRACT.SIGN.LIST, SPCM.CONTRACT.SIGN.LIST.FILTER',
      },
    });
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractSign/fetchEnum',
    });
  }

  /**
   * 审批拒绝
   */
  @Bind()
  showModal = () => {
    this.setState({
      visible: true,
    });
  };

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId, supplierCompanyId, electricSignFlag) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-sign/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, supplierCompanyId, electricSignFlag }) : null,
      })
    );
  }

  /**
   * 跳转到固定地方
   * @param {String} pcHeaderId
   */
  @Bind()
  jump() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const pcHeaderId = selectedRows.map((item) => item.pcHeaderId);
    const supplierCompanyId = selectedRows.map((item) => item.supplierCompanyId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-sign/detail`,
        search: pcHeaderId ? stringify({ pcHeaderId, supplierCompanyId }) : null,
        hash: `#spcm-contract-sign-detail-contract-online-edit`,
      })
    );
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    const pcSureCodeFlag = selectedRows.some((item) => item.pcStatusCode === 'TERMINATION_CONFIRM');
    const pcPublishCodeFlag = selectedRows.some((item) => item.pcStatusCode === 'PUBLISHED');
    const hasElectricSign = selectedRows.some((item) => item.electricSignFlag === 1);
    const hasNotElectricSign = selectedRows.some((item) => item.electricSignFlag === 0);
    const hasSignStageIsAfterItem = selectedRows.some(
      (item) => item.contractValidation === 'CONTRACT_VALIDATION_AFTER'
    );

    const hasTermination = selectedRows.some((item) => item.pcStatusCode === 'TERMINATION');
    if (hasElectricSign && hasNotElectricSign) {
      notification.info({
        message: intl
          .get(`spcm.contractSign.view.message.hasTwoTypeElectric`)
          .d('温馨提示：批量拒绝协议不支持同时勾选电签类和非电签类协议的情况!'),
      });
    }

    this.setState({
      selectedRows,
      selectedRowKeys,
      pcSureCodeFlag,
      pcPublishCodeFlag,
      hasTermination,
      hasTwoCateElectricSign: hasElectricSign && hasNotElectricSign,
      hasSignStageIsAfter: hasElectricSign && hasSignStageIsAfterItem,
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  // 校验订单签署的合同
  @Bind()
  checkOrderSignContract() {
    const { selectedRows } = this.state;
    const res = batchCheckOrderSignContract(selectedRows);
    return res;
  }

  /**
   * 确认协议
   */
  @Bind()
  async confirmContract() {
    const { selectedRows = [], pcSureCodeFlag, hasSignStageIsAfter } = this.state;

    const notAllowedFlag = this.checkOrderSignContract();
    if (notAllowedFlag) {
      return;
    }
    // 校验能否确认
    const payload = {
      pcHeaderList: selectedRows.map((item) => ({ pcHeaderId: item.pcHeaderId })),
    };
    const checkResult = await batchCheckContractConfirm(payload);
    if (getResponse(checkResult)) {
      const { checkResultFlag } = checkResult;
      if (!checkResultFlag) {
        notification.error({
          description: intl
            .get('spcm.common.view.message.supplierEditTips')
            .d('您已修改过协议文本，请点击确认拒绝协议按钮，采购方将对调整后的合同文本重新审核'),
        });
        return;
      }
    } else {
      return;
    }

    const flag = selectedRows.some((ele) => {
      return ele.electricSignFlag === 1;
    });
    const { contractSign, dispatch, remote } = this.props;
    const { pagination = {}, dataSource = [] } = contractSign;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const pcHeaderList = dataSource.filter((item) => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    if (remote?.event) {
      const res = await remote.event.fireEvent('confirmCuxContract', {
        current: this,
      });
      if (!res) {
        return;
      }
    }
    // 确认
    if (pcSureCodeFlag) {
      // 确认协议
      dispatch({
        type: 'contractSign/sureContract',
        payload: {
          approvedRemark: null,
          pcHeaderList,
        },
      }).then((res) => {
        if (res) {
          this.fetchList(pagination);
          this.setState({ selectedRows: [] });
          notification.success();
        }
      });
    } else if (
      (selectedRowKeys.length > 0 && !flag) ||
      (selectedRowKeys.length === 1 &&
        hasSignStageIsAfter &&
        selectedRowKeys[0].pcStatusCode === 'PUBLISHED')
    ) {
      dispatch({
        type: 'contractSign/confirmContract',
        payload: {
          approvedRemark: null,
          pcHeaderList,
        },
      }).then((res) => {
        if (res) {
          this.fetchList(pagination);
          this.setState({ selectedRows: [] });
          notification.success();
        }
      });
    } else if (selectedRowKeys.length > 0 && flag) {
      notification.warning({
        message: intl
          .get(`hzero.common.message.confirm.selected.atLeasta`)
          .d('所选单据包含电子签章协议，请进入明细界面进行电子签章签署'),
      });
    } else {
      notification.warning({
        message: intl.get(`hzero.common.message.confirm.selected.atLeast`).d('请至少选择一行数据'),
      });
    }
  }

  /**
   * handleVisible - 拒绝协议
   */
  @Bind()
  async handleVisible(field, flag) {
    const { selectedRows = [], pcSureCodeFlag } = this.state;
    const { contractSign, dispatch, remote } = this.props;

    const notAllowedFlag = this.checkOrderSignContract();
    if (notAllowedFlag) {
      return;
    }

    const { pagination = {}, dataSource = [] } = contractSign;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const pcHeaderList = dataSource.filter((item) => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxVisible', {
        current: this,
      });
      if (!res) {
        return;
      }
    }
    // 确认
    if (pcSureCodeFlag) {
      // const hasElectricSign = selectedRows.some((item) => item.electricSignFlag === 1);
      // const pcHeaderStatus = hasElectricSign ? 'EFFECTED' : 'CONFIRMED';
      // 确认协议
      dispatch({
        type: 'contractSign/sureRejectContract',
        payload: {
          approvedRemark: null,
          pcHeaderList,
          // pcHeaderStatus,
        },
      }).then((res) => {
        if (res) {
          this.fetchList(pagination);
          this.setState({ selectedRows: [] });
          notification.success();
        }
      });
    } else {
      this.setState({ [field]: !!flag });
    }
  }

  /**
   * 拒绝协议
   * @param {*} values
   */
  @Bind()
  async handleReject(values) {
    const { selectedRows = [] } = this.state;
    const { contractSign, dispatch, remote } = this.props;
    const { dataSource = [], pagination = {} } = contractSign;
    const selectedRowKeys = selectedRows.map((item) => item.pcHeaderId);
    const pcHeaderList = dataSource.filter((item) => selectedRowKeys.indexOf(item.pcHeaderId) >= 0);
    const afterRejectCallback = () => {
      this.setState({ selectedRows: [] });
      notification.success();
      this.handleModalVisible();
      this.fetchList(pagination);
    };
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxReject', {
        pcHeaderList,
        processRemark: values,
        afterRejectCallback,
        that: this,
      });
      if (!res) {
        return;
      }
    }
    if (selectedRowKeys.length > 0) {
      dispatch({
        type: 'contractSign/rejectContract',
        payload: { processRemark: values, pcHeaderList },
      }).then((res) => {
        if (res) {
          afterRejectCallback();
        }
      });
    }
  }

  /**
   * 控制文本对比modal显隐
   * @param {*} pcHeaderId
   */
  @Bind()
  handleControlComparison(params) {
    const { textComparisonVisible } = this.state;
    this.setState({ textComparisonVisible: !textComparisonVisible, ...params });
  }

  render() {
    const {
      visible,
      selectedRows = [],
      selectedRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
      rejectModalVisible = false, // 审批拒绝弹窗
      pcSureCodeFlag,
      pcPublishCodeFlag,
      hasTwoCateElectricSign,
      hasTermination,
      textComparisonVisible,
      cuxRejectLoading,
    } = this.state;
    const {
      form,
      contractSign,
      queryListLoading,
      rejectLoading = false,
      customizeFilterForm,
      customizeTable,
      confirmLoading,
      customizeBtnGroup,
      remote,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = {} } = contractSign;
    const pcKindCodeFlag = selectedRows.some((item) =>
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(item.pcKindCode)
    );
    const pcKindCodeNormalFlag =
      selectedRows.filter((item) => item.pcKindCode === 'NORMAL').length === 1;
    const searchProps = {
      enumMap,
      customizeFilterForm,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      remote,
      form,
      pcHeaderId,
      dataSource,
      pagination,
      selectedRows,
      contractSign,
      selectedRowKeys,
      customizeTable,
      loading: queryListLoading,
      onSearch: this.fetchList,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      role: 'supplier',
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const rejectModalProps = {
      rejectLoading: rejectLoading || cuxRejectLoading,
      visible: rejectModalVisible,
      onOk: this.handleReject,
      onCancel: () => this.handleModalVisible('rejectModalVisible', false),
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
      isSupplier: true,
    };
    const remoteParams = {
      current: this,
    };
    const cuxHeaderBtns = remote
      ? remote.process('SPCM_CONTRACT_SIGN_VIEW_LIST_HEADER_BTN', [], remoteParams)
      : [];
    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.title.contractSign`).d('协议签署')}>
          {customizeBtnGroup(
            {
              code: 'SPCM.CONTRACT.SIGN.BTN_GROUP',
            },
            [
              <Button
                data-name="confirmTheAgreement"
                type="primary"
                onClick={this.confirmContract}
                icon="check"
                loading={confirmLoading}
                // loading={approving}
                disabled={
                  (isArray(selectedRows) && isEmpty(selectedRows)) ||
                  (pcSureCodeFlag && pcPublishCodeFlag)
                }
              >
                {intl.get(`${viewMessagePrompt}.confirmTheAgreement`).d('确认协议')}
              </Button>,
              <Button
                data-name="previewTheAgreement"
                onClick={this.jump}
                icon="check"
                disabled={
                  (isArray(selectedRows) && selectedRows.length !== 1) ||
                  pcKindCodeFlag ||
                  !pcKindCodeNormalFlag
                }
              >
                {intl.get(`${viewMessagePrompt}.previewTheAgreement`).d('预览协议')}
              </Button>,
              <Button
                data-name="refusedToDeal"
                onClick={() => this.handleVisible('rejectModalVisible', true)}
                icon="close"
                // loading={rejecting}
                disabled={
                  (isArray(selectedRows) && isEmpty(selectedRows)) ||
                  hasTwoCateElectricSign ||
                  hasTermination ||
                  (pcSureCodeFlag && pcPublishCodeFlag)
                }
              >
                {intl.get(`${viewMessagePrompt}.refusedToDeal`).d('拒绝协议')}
              </Button>,
              ...(isArray(cuxHeaderBtns) ? cuxHeaderBtns : []),
            ]
          )}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <LocalizedModal visible={visible} />
        </Content>
        <RejectModal {...rejectModalProps} />
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}
