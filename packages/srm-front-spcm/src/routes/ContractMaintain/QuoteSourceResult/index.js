/**
 * index.js - 协议拟制
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { Modal as c7nModal } from 'choerodon-ui/pro';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind, debounce } from 'lodash-decorators';
import { isUndefined, isEmpty, pickBy } from 'lodash';
import querystring from 'querystring';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import hocRemote from 'utils/remote';

import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import { Header, Content } from 'components/Page';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { queryCommonDoubleUomConfig } from '@/utils/util';
import { Button as PermissionButton } from 'components/Permission';
import { queryMapIdpValue } from 'services/api';
import { toSuspend, referenceWhitelist } from '@/services/newContractService';
import notification from 'utils/notification';
import ApplicationScope from '@/routes/components/ContractSubject/ApplicationOrganization';
import AsyncPagination from '@/routes/components/AsyncPagination';
import LadderOfferModal from './ladderOfferModal';
import Search from './Search';
import List from './List';

@connect(({ loading = {}, contractMaintain = {} }) => ({
  loadingLadderOffer: loading.effects['contractMaintain/fetchLadderOffer'],
  fetchSourceList: loading.effects['contractMaintain/fetchSourceList'],
  fetchEnumLoading: loading.effects['contractMaintain/fetchEnum'],
  loadingSourceCreate: loading.effects['contractMaintain/sourceCreate'],
  contractMaintain,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'entity.company',
    'entity.roles',
    'hzero.common',
    'entity.supplier',
    'entity.business',
    'spcm.contractMaintain',
    'ssrc.inquiryHall',
    'sodr.sourceFrom',
  ],
})
@hocRemote({
  code: 'SPCM_CONTRACT_MAINTAIN_QUOTESOURCE_RESULT',
  name: 'remote',
})
@withCustomize({
  unitCode: [
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE',
    'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.QS.FILTER',
  ],
})
export default class QuoteSourceResult extends Component {
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
      ladderOfferList: [],
      ladderOfferVisible: false,
      doubleUnitEnabled: 0,
      LadderLevelHeaderData: {
        itemCode: '',
        itemName: '',
        quotationLineId: '',
        supplierCompanyName: '',
        quotationLineStatus: '',
      },
      enumObj: {}, // 下拉框值集
      createLoading: false, // 字段处理
      suspendLoading: false,
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
    } = this.props;
    if (_back === -1) {
      // this.fetchList(quoteSourcePagination);
    } else {
      this.hangleDataInit();
      // this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    this.queryValueCode(); // 下拉框值集
  }

  componentDidUpdate(prevProps) {
    const { custLoading: oldCustLoading } = prevProps;
    const {
      custLoading,
      location: { state: { _back } = {} },
      contractMaintain: { quoteSourcePagination = {} },
    } = this.props;
    if (oldCustLoading !== custLoading) {
      if (_back === -1) {
        this.fetchList(quoteSourcePagination);
      } else {
        this.fetchList();
      }
    }
  }

  // 从协议拟制列表页进来 初始化数据
  @Bind()
  hangleDataInit() {
    if (this.filterForm) {
      this.filterForm.resetFields();
    }
    this.props.dispatch({
      type: 'contractMaintain/updateState',
      payload: {
        quoteSourceList: [],
        quoteSourcePagination: {},
        quoteSourcePaginationLoading: true,
      },
    });
  }

  /**
   * 批量查询值集
   */
  @Bind()
  async queryValueCode() {
    const opts = await getResponse(
      queryMapIdpValue({
        flag: 'HPFM.FLAG',
        resultStatusSet: 'SSRC.SOURCE_RESULT_STATUS',
        occupyStatusSet: 'SPCM.SOURCE_RESULT_OCCUPY_STATUS',
      })
    );
    this.setState({ enumObj: { ...opts } });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  async fetchList(page = {}, type) {
    const { dispatch } = this.props;
    let filterValues = {};

    if (!isUndefined(this.filterForm)) {
      const formValue = this.filterForm.getFieldsValue();
      const values = {
        ...formValue,
        resultStatusSet: formValue.resultStatusSet && formValue.resultStatusSet.join(','),
        createDateFrom: formValue.createDateFrom && formValue.createDateFrom.format(DATETIME_MIN),
        createDateTo: formValue.createDateTo && formValue.createDateTo.format(DATETIME_MAX),
        supplierCompanyId: formValue.supplierCompanyDeputyId
          ? formValue.supplierCompanyDeputyId
          : formValue.supplierCompanyDeputyId === undefined && formValue.supplierCompanyId
          ? -1
          : null, // 由于本地供应商没有supplierCompanyId，后端在处理时默认取-1为标识
        supplierCompanyDeputyId: null,
      };
      filterValues = filterNullValueObject(values);
    }
    if (type === 'search') {
      this.setState({ selectedRows: [], selectedRowKeys: [] });
    }
    const tenantId = getCurrentOrganizationId();
    await dispatch({
      type: 'contractMaintain/fetchSourceList',
      payload: {
        page,
        tenantId,
        ...filterValues,
        ...filterNullValueObject({
          asyncCountFlag: 'DEFAULT',
          oldTotalElements: page.total ? page.total : '',
        }),
        customizeUnitCode:
          'SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.SOURCE,SPCM.PURCHASE_CONTRACT_MAINTAIN.QUOTE.QS.FILTER',
      },
    });
    const response = await queryCommonDoubleUomConfig();
    this.setState({ doubleUnitEnabled: response });
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
   * 查询是否在【引用寻源结果列表个性化字段填充协议头字段】-白名单中，不在白名单则去掉扩展字段
   */
  handleSourceResultDTOs = async (selectedRows) => {
    this.setState({ createLoading: true });
    const res = getResponse(await referenceWhitelist());
    this.setState({ createLoading: false });
    // Y-在白名单，无需去掉扩展字段，N-不在白名单，需要去掉扩展字段。
    if (res === 'N') {
      // 过滤掉所有扩展字段
      return selectedRows.map((row) => pickBy(row, (val, key) => !key.includes('attribute')));
    } else if (res) {
      return selectedRows;
    }
    return false;
  };

  /**
   * 跳转到明细页
   * @param {String} pcHeaderId
   */
  @Bind()
  async quoteSourceCreate() {
    const { selectedRows } = this.state;
    const { dispatch, remote } = this.props;
    let filterValues = {};
    if (!isUndefined(this.filterForm)) {
      const formValue = this.filterForm.getFieldsValue();
      const values = {
        ...formValue,
        resultStatusSet: formValue.resultStatusSet && formValue.resultStatusSet.join(','),
        createDateFrom: formValue.createDateFrom && formValue.createDateFrom.format(DATETIME_MIN),
        createDateTo: formValue.createDateTo && formValue.createDateTo.format(DATETIME_MAX),
        supplierCompanyId: formValue.supplierCompanyDeputyId
          ? formValue.supplierCompanyDeputyId
          : formValue.supplierCompanyDeputyId === undefined && formValue.supplierCompanyId
          ? -1
          : null, // 由于本地供应商没有supplierCompanyId，后端在处理时默认取-1为标识
        supplierCompanyDeputyId: null,
      };
      filterValues = filterNullValueObject(values);
    }
    const res = await dispatch({
      type: 'contractMaintain/sourceCreate',
      payload: {
        query: filterValues,
        body: selectedRows,
      },
    });
    if (res) {
      let newRes = remote
        ? remote.process('SPCM_CONTRACT_MAINTAIN_QUOTESOURCE_RESULT_CREATE', selectedRows, {
            current: this,
            res,
          })
        : selectedRows;
      newRes = await this.handleSourceResultDTOs(newRes);
      if (!newRes) return false;
      dispatch(
        routerRedux.push({
          pathname: `/spcm/contract-maintain/detail`,
          search: querystring.stringify({ isQuoteSource: String(1) }),
        })
      );
      dispatch({
        type: 'contractMaintain/updateState',
        payload: {
          sourceResultDTOs: newRes,
          sourceRslQueryParams: filterValues,
        },
      });
    }
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
   * 阶梯报价可见
   */
  @Bind()
  ladderOfferVisible(record) {
    const {
      itemCode,
      itemName,
      supplierCompanyName,
      quotationLineId,
      quotationLineStatus,
    } = record;
    this.setState({
      ladderOfferVisible: true,
      LadderLevelHeaderData: {
        itemCode,
        itemName,
        quotationLineId,
        supplierCompanyName,
        quotationLineStatus,
      },
    });
  }

  /**
   * 查询阶梯报价
   */
  @Bind()
  fetchLadderOffer() {
    const { dispatch } = this.props;
    const {
      LadderLevelHeaderData: { quotationLineId = '' },
    } = this.state;
    dispatch({
      type: 'contractMaintain/fetchLadderOffer',
      payload: quotationLineId,
    }).then((res) => {
      if (res) {
        this.setState({ ladderOfferList: res.content });
      }
    });
  }

  /**
   * 阶梯报价可见
   */
  @Bind()
  hideLadderOfferVisible() {
    this.setState({ ladderOfferVisible: false });
  }

  /**
   * 是否整单转协议
   */
  @Bind()
  async handleAllTransfer(checked) {
    if (checked) {
      await this.fetchList();
      const {
        contractMaintain: { quoteSourceList = [] },
      } = this.props;
      this.setState({
        selectedRows: quoteSourceList,
      });
    } else {
      this.setState({ selectedRows: [] });
    }
  }

  // 查看适用范围
  @debounce(1500)
  viewApplicationOrgModal = (sourceAppScopeLineDTOs) => {
    const modalKey = c7nModal.key();
    c7nModal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.view.title.applicationScope`).d('适用范围'),
      children: <ApplicationScope sourceAppScopeLineDTOs={sourceAppScopeLineDTOs} />,
      footer: null,
      style: { width: '1000px' },
    });
  };

  // 暂挂按钮
  @Bind()
  handleHold() {
    const { selectedRows = [] } = this.state;
    const one = selectedRows.every((item) => item.contractPendingFlag === '1');
    const zero = selectedRows.every((item) => item.contractPendingFlag === '0');
    if (!one && !zero) {
      return notification.warning({
        message: intl
          .get('sodr.sourceFrom.view.message.checkMark')
          .d('勾选行暂挂标识不一致,请检查!'),
      });
    }
    this.setState({
      suspendLoading: true,
    });
    const resultList = selectedRows.map((n) => {
      return {
        ...n,
        suspendFlag: n.contractPendingFlag === '1' ? '0' : '1',
      };
    });
    toSuspend(resultList)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.fetchList({}, 'search');
        }
      })
      .finally(() => {
        this.setState({
          suspendLoading: false,
        });
      });
  }

  @Bind()
  getButtons() {
    const { contractMaintain, loadingSourceCreate, remote } = this.props;
    const { quoteSourceList = [] } = contractMaintain;
    const { selectedRows = [], createLoading, suspendLoading } = this.state;
    const buttons = [
      <Button
        disabled={!selectedRows.length}
        icon="check"
        type="primary"
        onClick={() => this.quoteSourceCreate()}
        loading={loadingSourceCreate || createLoading}
      >
        {intl.get(`spcm.common.button.create`).d('创建')}
      </Button>,
      !isEmpty(quoteSourceList) &&
      quoteSourceList.every((item) => item.contractPendingFlag === '1') ? (
        <PermissionButton
          key="cancelSuspend"
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.maintain.ps.cancel-suspend',
              type: 'button',
              meaning: '取消暂挂',
            },
          ]}
          loading={suspendLoading}
          disabled={selectedRows.length === 0}
          onClick={this.handleHold}
          icon="unlock"
        >
          {intl.get(`hzero.common.button.cancelHold`).d('取消暂挂')}
        </PermissionButton>
      ) : (
        <PermissionButton
          key="suspend"
          permissionList={[
            {
              code: 'srm.pc-admin.pc-purchaser.maintain.ps.suspend',
              type: 'button',
              meaning: '暂挂',
            },
          ]}
          loading={suspendLoading}
          disabled={selectedRows.length === 0}
          onClick={this.handleHold}
          icon="lock"
        >
          {intl.get(`hzero.common.button.hold`).d('暂挂')}
        </PermissionButton>
      ),
    ].filter(Boolean);
    const buttonList = remote
      ? remote.process(
          'SPCM_CONTRACT_MAINTAIN_QUOTESOURCE_RESULT_PROCESS_HEADER_BUTTONS',
          buttons,
          {
            current: this,
          }
        )
      : buttons;
    return buttonList;
  }

  render() {
    const {
      fetchSourceList,
      contractMaintain,
      loadingLadderOffer,
      customizeTable,
      customizeFilterForm,
      remote,
    } = this.props;
    const {
      quoteSourcePagination = {},
      quoteSourceList = [],
      enumMap = [],
      quoteSourcePaginationLoading,
    } = contractMaintain;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      ladderOfferVisible,
      pcHeaderId,
      ladderOfferList,
      LadderLevelHeaderData,
      doubleUnitEnabled,
      enumObj,
    } = this.state;
    const searchProps = {
      remote,
      enumMap,
      enumObj,
      customizeFilterForm,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: (type) => this.fetchList({}, type),
      onTransferAll: this.handleAllTransfer,
    };
    const listProps = {
      pcHeaderId,
      dataSource: quoteSourceList,
      pagination: false,
      selectedRows,
      selectedRowKeys,
      contractMaintain,
      customizeTable,
      doubleUnitEnabled,
      loading: fetchSourceList,
      onSearch: this.fetchList,
      onRowSelectChange: this.onRowSelectChange,
      redirectDetail: this.redirectDetail,
      operatingData: this.operatingData,
      showModal: this.ladderOfferVisible,
      viewApplicationOrgModal: this.viewApplicationOrgModal,
    };
    const ladderOfferProps = {
      location,
      LadderLevelHeaderData,
      ladderOfferList,
      loadingLadderOffer,
      doubleUnitEnabled,
      visible: ladderOfferVisible,
      hideModal: this.hideLadderOfferVisible,
      fetchLadderOffer: this.fetchLadderOffer,
      ladderOfferVisible: this.ladderOfferVisible,
    };
    return (
      <Fragment>
        <Header
          backPath="/spcm/contract-maintain/list"
          title={intl.get(`spcm.contractMaintain.view.message.title.quoteSource`).d('引用寻源结果')}
        >
          {this.getButtons()}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <AsyncPagination
            {...quoteSourcePagination}
            loading={quoteSourcePaginationLoading}
            onCustChange={(current, pageSize) =>
              this.fetchList({ ...quoteSourcePagination, current, pageSize })
            }
          />
        </Content>
        {ladderOfferVisible && <LadderOfferModal {...ladderOfferProps} />}
      </Fragment>
    );
  }
}
