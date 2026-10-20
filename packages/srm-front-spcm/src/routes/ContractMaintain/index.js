/**
 * index.js - 协议拟制
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'hzero-ui';
import { Icon } from 'choerodon-ui';
import { connect } from 'dva';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { routerRedux } from 'dva/router';
import { Bind, bind } from 'lodash-decorators';
import { isUndefined, isEmpty, throttle, compose } from 'lodash';
import querystring from 'querystring';
import { Button as PermissionButton } from 'components/Permission';
import { openTab } from 'utils/menuTab';
import CommonImport from 'hzero-front/lib/components/Import';
import hocRemote from 'utils/remote';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { DATETIME_MIN } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import { preSubmitValidBudget } from '@/utils/util';
import formatterCollections from 'utils/intl/formatterCollections';

import { queryNewOrOldLink } from '@/services/newContractService';
import { deleteHeader } from '@/services/contractMaintainService';
import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';
import Search from './Search';
import List from './List';
import CopyModal from './CopyContract/Modal';

const viewMessagePrompt = 'spcm.contractMaintain.view.message.title';

class ContractMaintain extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      selectedRowKeys: [],
      operationRecordVisible: false,
      copyModalVisible: false, // 复制弹框
      _linkFlag: false, // 判断是新链路还是老链路
    };
  }

  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractMaintain: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    this.fetchSetting();
  }

  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  /**
   * 判断是新链路还是老链路
   */
  @Bind()
  queryNewOrOldLink() {
    queryNewOrOldLink().then((res) => {
      if (res) {
        this.setState({
          _linkFlag: true,
        }); // 新链路
      } else {
        this.setState({
          _linkFlag: false,
        }); // 老链路
      }
    });
  }

  @Bind()
  fetchSetting() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/setting',
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    return {
      ...filterValues,
      ...dealTime,
    };
  }

  /**
   * 批量删除
   * @param {*} selectedRows
   */
  @Bind()
  handleDelete(selectedRows) {
    Modal.confirm({
      title: intl.get(`spcm.common.view.message.title.deleteContract`).d('确认要删除当前协议么？'),
      onOk: async () => {
        const res = getResponse(await deleteHeader(selectedRows));
        if (res) {
          this.fetchList();
          notification.success();
        }
      },
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch } = this.props;
    const formValue = this.filterForm.getFieldsValue();
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject({
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        });
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows: [], selectedRowKeys: [] });
    dispatch({
      type: 'contractMaintain/queryList',
      payload: {
        page,
        ...handleFormValues,
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_MAINTAIN.LIST,SPCM.PURCHASE_CONTRACT_MAINTAIN.QUERY',
      },
    });
    this.queryNewOrOldLink();
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/init',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  redirectDetail(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
      })
    );
  }

  /**
   * 操作记录
   * @param {String} pcHeaderId
   */
  @Bind()
  operatingData(pcHeaderId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
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
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 提交
   */
  @Bind()
  submit() {
    const { dispatch, remote } = this.props;
    const { selectedRows = [] } = this.state;
    const _this = this;
    Modal.confirm({
      title: intl.get(`${viewMessagePrompt}.confirmSubmit`).d('是否提交协议'),
      onOk: throttle(
        async () => {
          if (remote?.event) {
            const res = await remote.event.fireEvent('handleCuxPreBatchSubmit', {
              current: this,
              selectedRows,
            });
            if (!res) {
              return;
            }
          }
          const validateBudgetFlag = await preSubmitValidBudget(selectedRows, 'hzero');
          if (!validateBudgetFlag) {
            return true;
          }
          return dispatch({
            type: 'contractMaintain/submit',
            payload: {
              pcHeaderList: selectedRows,
              customizeUnitCode:
                'SPCM.PURCHASE_CONTRACT_MAINTAIN.DETAIL,SPCM.PURCHASE_CONTRACT_MAINTAIN.SUBJECT,SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE,SPCM.PURCHASE_CONTRACT_MAINTAIN.PARTNER',
            },
          }).then((res) => {
            if (res) {
              notification.success();
              _this.fetchList();
            }
          });
        },
        1000,
        {
          leading: true,
          trailing: false,
        }
      ),
    });
  }

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  @bind()
  toPurchaseContract() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/purchase-contract`,
      })
    );
  }

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  goToSourceCreate() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/contract-maintain/quoteSource`,
      })
    );
  }

  @Bind()
  JumpToPurchaseOrder() {
    this.props.history.push('/spcm/contract-maintain/quote-purchase-order');
  }

  // 显示弹框
  @Bind()
  toggleCopyModal(visible) {
    this.setState({
      copyModalVisible: visible,
    });
    if (visible) {
      this.queryCopyList();
      this.getCopyBatchCode();
    }
  }

  // 查询复制协议弹框-值集
  @Bind()
  getCopyBatchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractMaintain/getCopyBatchCode',
    });
  }

  // 查询复制协议弹框-数据
  @Bind()
  queryCopyList(page = {}, searchValues = {}) {
    const { dispatch } = this.props;
    const values = filterNullValueObject(searchValues);
    const tenantId = getCurrentOrganizationId();
    dispatch({
      type: 'contractMaintain/queryCopyList',
      payload: {
        page,
        tenantId,
        IgnoreDisabledDataFlag: 1,
        ...values,
      },
    });
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

  /**
   * 协议批量导入
   */
  @Bind()
  handleImport() {
    openTab({
      key: '/spcm/contract-subject/data-import/SPCM.PC_CONTRACT_IMPORT',
      path: '/spcm/contract-subject/data-import/SPCM.PC_CONTRACT_IMPORT',
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: querystring.stringify({
        sync: true,
        action: 'hzero.common.title.batchImport',
        backPath: `/spcm/contract-maintain/list`,
        args: JSON.stringify({ workbenchFlag: '0' }),
      }),
    });
  }

  // 远东电缆
  renderCopyModal(copyModalProps) {
    return <CopyModal {...copyModalProps} />;
  }

  // 玛格家居
  renderHeaderButtons() {
    const {
      contractMaintain,
      submitting,
      customizeBtnGroup,
      queryingHeader = false,
      remote,
    } = this.props;
    const { setting = {} } = contractMaintain;
    const {
      dsHcFlag, // 手工创建
      dsPrFlag, // 采购申请
      dsFrFlag, // 寻源结果
      dsPoFlag, // 采购订单
    } = setting;
    const { selectedRows = [], pcHeaderId } = this.state;

    const buttons = [
      dsHcFlag === 1 && (
        <Button
          icon="plus"
          data-name="create"
          type={dsHcFlag === 1 && 'primary'}
          onClick={() => this.redirectDetail()}
        >
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>
      ),
      dsPoFlag === 1 && (
        <Button icon="plus" data-name="quotePurchaseOrder" onClick={this.JumpToPurchaseOrder}>
          {intl.get(`spcm.common.button.quotePurchaseOrder`).d('引用采购订单')}
        </Button>
      ),
      dsPrFlag === 1 && (
        <Button
          icon="plus"
          data-name="refPurchaseDemand"
          type={dsHcFlag === 0 && dsPrFlag === 1 && 'primary'}
          onClick={this.toPurchaseContract}
        >
          {intl.get(`sodr.workspace.view.tabPane.purchaseRequest`).d('引用采购申请')}
        </Button>
      ),
      dsFrFlag === 1 && (
        <Button
          icon="plus"
          data-name="quoteCreateOrder"
          type={dsHcFlag === 0 && dsPrFlag === 0 && dsFrFlag === 1 && 'primary'}
          onClick={() => this.goToSourceCreate()}
        >
          {intl.get(`spcm.contractMaintain.view.button.quoteCreateOrder`).d('引用寻源结果')}
        </Button>
      ),
      <PermissionButton
        data-name="submit"
        key="submit"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.maintain.ps.submit.button',
            type: 'button',
            meaning: '提交',
          },
        ]}
        type={dsHcFlag === 0 && dsPrFlag === 0 && dsFrFlag === 0 && 'primary'}
        icon="check"
        loading={submitting}
        onClick={this.submit}
        disabled={isEmpty(selectedRows)}
      >
        {intl.get(`hzero.common.button.submit`).d('提交')}
      </PermissionButton>,
      <PermissionButton
        data-name="copyHistoryContract"
        key="copyHistoryContract"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.maintain.ps.contract-copy',
            type: 'button',
            meaning: '复制历史单据',
          },
        ]}
        onClick={() => this.toggleCopyModal(true)}
      >
        {intl.get('spcm.common.button.copyHistoryContract').d('复制历史单据')}
      </PermissionButton>,
      <CommonImport
        data-name="newBatchImport"
        businessObjectTemplateCode="SPCM.PC_CONTRACT_IMPORT"
        buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
        args={{
          pcHeaderId,
          workbenchFlag: '0',
        }}
        prefixPatch="/spcm"
        buttonProps={{
          permissionList: [
            {
              code: 'srm.pc-admin.pc-purchaser.maintain.ps.batch.import.new',
              type: 'button',
              meaning: '新版批量导入',
            },
          ],
        }}
        successCallBack={() => {
          notification.success();
          this.fetchList();
        }}
      />,
      <PermissionButton
        data-name="batchImport"
        key="batchImport"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.maintain.ps.ps.batch.import',
            type: 'button',
            meaning: '批量导入',
          },
        ]}
        onClick={this.handleImport}
      >
        <Icon type="archive" style={{ marginRight: '8px', fontSize: '14px', fontWeight: '400' }} />
        {intl.get('hzero.common.title.batchImport').d('批量导入')}
      </PermissionButton>,
      <PermissionButton
        data-name="delete"
        icon="delete"
        permissionList={[
          {
            type: 'button',
            code: 'srm.pc-admin.pc-purchaser.maintain.button.batch.delete',
            meaning: '批量删除',
          },
        ]}
        disabled={isEmpty(selectedRows)}
        loading={queryingHeader}
        onClick={() => this.handleDelete(selectedRows)}
      >
        {intl.get(`hzero.common.button.delete`).d('删除')}
      </PermissionButton>,
    ].filter(Boolean);

    const buttonList = remote
      ? remote.process('SPCM_CONTRACT_MAINTAIN_LIST_PROCESS_HEADER_BUTTONS', buttons, {
          current: this,
        })
      : buttons;

    return (
      <Header title={intl.get(`${viewMessagePrompt}.purchaseCreation`).d('协议拟制')}>
        {customizeBtnGroup(
          {
            code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.BTN_GROUP',
          },
          buttonList
        )}
      </Header>
    );
  }

  render() {
    const {
      queryListLoading,
      contractMaintain,
      queryCopyListLoading,
      getBatchCodeLoading,
      customizeFilterForm,
      customizeTable,
      remote,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [] } = contractMaintain;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      operationRecordVisible,
      pcHeaderId,
      copyModalVisible = false,
      textComparisonVisible,
    } = this.state;

    const searchProps = {
      enumMap,
      customizeFilterForm,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      pcHeaderId,
      dataSource,
      pagination,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      customizeTable,
      remote,
      loading: queryListLoading,
      onSearch: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
      redirectDetail: this.redirectDetail,
      operatingData: this.operatingData,
      handleModalVisibleList: this.handleModalVisible,
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const copyModalProps = {
      copyModalVisible,
      queryCopyListLoading,
      getBatchCodeLoading,
      toggleModal: this.toggleCopyModal,
      onQueryCopyList: this.queryCopyList,
      listPageRemote: remote,
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    return (
      <Fragment>
        {this.renderHeaderButtons()}
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {this.renderCopyModal(copyModalProps)}
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}

const hocFunc = (com) =>
  compose(
    connect(({ loading = {}, contractMaintain = {} }) => ({
      queryListLoading: loading.effects['contractMaintain/queryList'],
      fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
      submitting: loading.effects['contractMaintain/submit'],
      queryCopyListLoading: loading.effects['contractMaintain/queryCopyList'],
      getBatchCodeLoading: loading.effects['contractMaintain/getCopyBatchCode'],
      contractMaintain,
    })),
    formatterCollections({
      code: [
        'spcm.contractMaintain',
        'spcm.common',
        'entity.company',
        'entity.organization',
        'entity.business',
        'spcm.purchaseContractType',
        'entity.roles',
        'spcm.purchaseContractType',
        'sodr.workspace',
      ],
    }),
    withCustomize({
      unitCode: [
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.LIST',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUERY',
        'SPCM.PURCHASE_CONTRACT_MAINTAIN.BTN_GROUP',
      ],
    }),
    hocRemote(
      {
        code: 'SPCM_CONTRACT_MAINTAIN_LIST',
        name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
      },
      {
        events: {
          // 协议提交之前预校验
          handleCuxPreBatchSubmit() {},
        },
      }
    )
  )(com);

export { ContractMaintain, hocFunc };
export default hocFunc(ContractMaintain);
