/*
 * ContractMaintainDetail - 协议维护详情
 * @date: 2019-05-14
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
// import { connect } from 'dva';
import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import { Bind } from 'lodash-decorators';
import { Button } from 'hzero-ui';
import { noop } from 'lodash';
import { connect } from 'dva';
import hocRemote from 'utils/remote';
import { filterNullValueObject, createPagination } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN } from 'utils/constants';
import { queryCommonDoubleUomConfig } from '@/utils/util';
import _ from 'lodash';
import moment from 'moment';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { queryNewOrOldLink } from '@/services/newContractService';
import intl from 'utils/intl';
import List from './List';

import Search from './Search';

/**
 * CreateByPurchase - 引用申请创建协议
 * @extends {Component} - React.Component中
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@connect(({ purchaseApplicationContract = {}, loading }) => ({
  purchaseApplicationContract,
  querying: loading.effects['purchaseApplicationContract/queryList'],
  creating: loading.effects['purchaseApplicationContract/verified'],
}))
@formatterCollections({
  code: ['spcm.common', 'hzero.common', 'sodr.workspace'],
})
@withCustomize({
  unitCode: [
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PD.FILTER',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.BTN_GROUP',
  ],
})
@hocRemote(
  {
    code: 'SPCM_PURCHASE_CONTRACT',
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      // 采购申请创建前序校验埋点
      async handleVerified(eventProps) {
        const { mergeVerify = noop } = eventProps;
        const res = await mergeVerify();
        return !!res;
      },
      // 采购申请创建协议自定义处理方式
      handlePurCreate() {},
    },
  }
)
export default class CreateByPurchase extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedPurchaseContracts: [],
      doubleUnitEnabled: 0,
      _linkFlag: false, // 新链路标识
      createLoading: false,
    };
  }

  // 从协议拟制列表页进来 初始化数据
  @Bind()
  hangleDataInit() {
    if (this.filterForm) {
      this.filterForm.resetFields();
    }
    this.props.dispatch({
      type: 'purchaseApplicationContract/updateState',
      payload: {
        dataSource: [],
        pagination: createPagination({}),
      },
    });
  }

  async componentDidMount() {
    const {
      location: { state: { _back } = {} },
      purchaseApplicationContract: { pagination = {} },
      dispatch,
    } = this.props;
    const _linkFlag = await queryNewOrOldLink();
    this.setState({
      _linkFlag,
    });
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.hangleDataInit();
      this.fetchList();
    }
    dispatch({
      type: 'purchaseApplicationContract/fetchEnum',
    });
  }

  @Bind()
  async create() {
    const { selectedPurchaseContracts = [] } = this.state;
    const { dispatch, remote } = this.props;
    const mergeVerify = async () => {
      if (selectedPurchaseContracts.length > 1) {
        const result = await dispatch({
          type: 'purchaseApplicationContract/verified',
          payload: { selectedPurchaseContracts },
        });
        return result;
      }
      return true;
    };
    this.setState({ createLoading: true });
    // 采购申请创建前序校验埋点
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleVerified', {
        currentState: this.state,
        eventProps: this.props,
        mergeVerify,
      });
      if (!res) {
        this.setState({ createLoading: false });
        return;
      }
    }
    // 合并头信息
    const headerInfo = [
      'supplierTenantId',
      'supplierCompanyId',
      'supplierCompanyName',
      'supplierId',
      'supplierName',
      'ouId',
      'ouName',
      'purchaseOrgId',
      'purchaseOrgName',
      'purchaseAgentId',
      'purchaseAgentName',
      'companyOrgName',
      'companyOrgId',
      'costAnchDepId',
      'costAnchDepDesc',
      'overseasProcurement',
      'companyId',
      'companyName',
      'attributeVarchar10',
      'attributeVarchar11',
      'agentId',
      'agentName',
      'executionStrategyCode',
      'secondLevelStrategyCode',
      'orderSecondLevelStrategyCode',
      'exchangeRate',
    ].reduce((obj, filedNames) => {
      const [filedName, targetFiledName] = [].concat(filedNames);
      const _headerInfo = obj;
      // 当前字段在选择项中不同值集合
      const diffValues = new Set(
        selectedPurchaseContracts.map((purchaseContract) => {
          if (purchaseContract[filedName]) {
            return purchaseContract[filedName];
          } else {
            return null;
          }
        })
      );
      diffValues.delete(null);
      if (diffValues.size === 1) {
        [_headerInfo[targetFiledName || filedName]] = diffValues;
      }
      return _headerInfo;
    }, {});
    headerInfo.pcSourceCodeMeaning = intl
      .get(`spcm.common.sourceCode.purchaseRequisition`)
      .d('采购申请');
    headerInfo.pcSourceCode = 'PURCHASE_NEED';
    headerInfo.prCurrencyCode = selectedPurchaseContracts[0]?.currencyCode;
    // 合并协议标行
    const contractSubjects = _.cloneDeep(selectedPurchaseContracts).map((_subject) => {
      const subject = _subject;
      // delete subject.prLineId;
      delete subject.$form;
      subject.neededDate =
        subject.neededDate && moment(subject.neededDate).format(DEFAULT_DATE_FORMAT);
      subject.deliverDate = subject.neededDate;
      subject.address = subject.location;
      subject.sourceCode = subject.prNum;
      subject.sourceLineNum = subject.lineNum;
      subject.prLineNum = subject.lineNum;
      subject.occupiedQuantity = 0;
      // subject.quantity = subject.availableQuantity;
      // subject.secondaryQuantity = subject.secondaryAvailableQuantity;
      subject.specifications = subject.itemSpecs;
      subject.model = subject.itemModel;
      subject.uomCodeAndName = subject.uomName;
      subject.purchaseAgentName = subject.agentName;
      subject.purchaseAgentId = subject.agentId;

      // 项目任务字段
      subject.projectTaskId = subject.projectTaskId;
      subject.projectTaskName = subject.projectTaskName;
      subject.projectTaskEditFlag = subject.projectTaskId ? 0 : 1;
      // subject.projectNum = null; // 默认不带出项目编码==>海能达需要带出来
      return subject;
    });
    let contractMaintain = { headerInfo, pcSubjectDataSource: contractSubjects };

    const itemKey = `spcm.contractMaintain.${Math.random()}`;
    contractMaintain = remote
      ? remote.process('SPCM_PURCHASE_CONTRACT_CREATE', contractMaintain, {
          current: this,
        })
      : contractMaintain;
    // 采购申请创建协议自定义处理方式
    if (remote?.event) {
      const res = await remote.event.fireEvent('handlePurCreate', {
        currentState: this.state,
        contractMaintain,
        eventProps: this.props,
      });
      if (!res) {
        this.setState({ createLoading: false });
        return;
      }
    }
    window.sessionStorage.setItem(itemKey, JSON.stringify(contractMaintain));
    this.setState({ createLoading: false });

    this.props.history.push({
      pathname: '/spcm/contract-maintain/detail',
      search: `?from=purchaseContract&itemKey=${itemKey}`,
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, sort) {
    const { dispatch } = this.props;
    // const { supplierCompanyId, supplierId } = this.state;
    const formValue = this.filterForm.getFieldsValue();
    let filterValues = !this.filterForm
      ? {}
      : {
          ...formValue,
          supplierCompanyId: formValue.supplierCompanyDeputyId,
          supplierCompanyDeputyId: null,
        };
    // 处理时间字段
    filterValues = [
      'createdDateStart',
      'createdDateEnd',
      'neededDateStart',
      'neededDateEnd',
    ].reduce((_filterFormValue, timeFiled) => {
      const filterFormValue = _filterFormValue;
      filterFormValue[timeFiled] =
        filterFormValue[timeFiled] && filterFormValue[timeFiled].format(DATETIME_MIN);
      return filterValues;
    }, filterValues);
    filterValues = filterNullValueObject({
      ...filterValues,
      // supplierCompanyId,
      // supplierId
    });
    // this.setState({ selectedPurchaseContracts: [] });
    const erpControlFlag = 1;
    const assignFlag = 1; // 是否为已分配的单据（请参考故事号srm-43525）
    // 异步分页改造参数
    const pageFilterParams = {
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: page?.total ? page.total : '',
    };
    dispatch({
      type: 'purchaseApplicationContract/queryList',
      payload: {
        page,
        ...filterValues,
        sort,
        erpControlFlag,
        assignFlag,
        ...pageFilterParams,
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.DEMAND,SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PD.FILTER',
      },
    });
    queryCommonDoubleUomConfig().then((res) => this.setState({ doubleUnitEnabled: res }));
  }

  /** 选择行
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    const { selectedPurchaseContracts } = this.state;
    const { purchaseApplicationContract } = this.props;
    const { dataSource = [] } = purchaseApplicationContract;
    const currentIds = dataSource.map((item) => item.prLineId);
    const oldSelectedPurchaseContracts = selectedPurchaseContracts.filter((item) => {
      return !currentIds.includes(item.prLineId);
    });
    this.setState({
      selectedRowKeys,
      selectedPurchaseContracts: [...oldSelectedPurchaseContracts, ...selectedRows],
    });
  }

  // 获取 Search 中 供应商 字段中选中的其他参数
  @Bind()
  handleGetLovValues(supplierCompanyId, supplierId) {
    this.setState({
      supplierCompanyId,
      supplierId,
    });
  }

  @Bind()
  getButtons() {
    const { creating, customizeBtnGroup, remote } = this.props;
    const { selectedPurchaseContracts = [], createLoading } = this.state;
    const buttons = [
      <Button
        data-name="create"
        disabled={!selectedPurchaseContracts.length}
        icon="check"
        type="primary"
        loading={creating || createLoading}
        onClick={this.create}
      >
        {intl.get(`hzero.common.create`).d('创建')}
      </Button>,
    ];
    const buttonList = remote
      ? remote.process('SPCM_PURCHASE_CONTRACT_PROCESS_HEADER_BUTTONS', buttons, {
          current: this,
        })
      : buttons;
    return customizeBtnGroup(
      {
        code: 'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.PURCHASE.BTN_GROUP',
      },
      buttonList
    );
  }

  render() {
    const {
      purchaseApplicationContract = {},
      querying,
      customizeTable,
      customizeFilterForm,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [] } = purchaseApplicationContract;
    const { selectedRowKeys = [], doubleUnitEnabled, _linkFlag } = this.state;

    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      customizeFilterForm,
      onSearch: this.fetchList,
      onGetLovValues: this.handleGetLovValues,
    };

    const listProps = {
      dataSource,
      pagination,
      customizeTable,
      selectedRowKeys,
      // selectedPurchaseContracts,
      loading: querying,
      doubleUnitEnabled,
      _linkFlag,
      onSearch: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
    };

    return (
      <Fragment>
        <Header
          title={intl.get(`sodr.workspace.view.tabPane.purchaseRequest`).d('引用采购申请')}
          backPath="/spcm/contract-maintain/list"
        >
          {this.getButtons()}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
      </Fragment>
    );
  }
}
