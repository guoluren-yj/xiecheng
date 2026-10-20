/**
 * index.js - 我发起的协议
 * @date: 2019-05-23
 * @author: pengna<na.peng@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import { DATETIME_MIN } from 'utils/constants';

// import { SRM_SPCM } from '_utils/config';
// import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { routerRedux } from 'dva/router';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';

import Search from './Search';
import List from './List';

@connect(({ loading = {}, contractStatement = {} }) => ({
  queryListLoading: loading.effects['contractStatement/queryList'],
  updateStateLoading: loading.effects['contractStatement/updateState'],
  updateLoading: loading.effects['contractStatement/update'],
  intiLoading: loading.effects['contractStatement/init'],
  getLineAttachmentUuidLoading: loading.effects['contractStatement/getLineAttachmentUuid'],
  fetchOperationRecordListLoading: loading.effects['contractStatement/fetchOperationRecordList'],
  contractStatement,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'spcm.purchaseContractView',
    'spcm.purchaseContractType',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
    'entity.business',
    'hzero.common',
  ],
})
export default class PurchaseContractView extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      isSureFileContract: false,
      pcHeaderId,
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractStatement: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
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
  handleFormQuery(filterValues) {
    const dealTime = {};
    // const takeTime = {};
    const timeArray = ['creationDateFrom', 'creationDateTo'];
    const takeArray = ['confirmedDateFrom', 'confirmedDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    takeArray.forEach((item) => {
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
  fetchList(page = {}) {
    const { tenantId, pcHeaderId } = this.state;
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
    // this.setState({ selectedRows });
    if (filterValues.pcTypeId) {
      dispatch({
        type: 'contractStatement/queryList',
        payload: {
          page,
          pcHeaderId,
          tenantId,
          ...handleFormValues,
        },
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractStatement/init',
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
        pathname: `/spcm/contract-statement/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
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

  @Bind()
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
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
      selectedRows = [],
      selectedRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
      textComparisonVisible,
    } = this.state;
    const { form, contractStatement, queryListLoading } = this.props;
    const { pagination = {}, dataSource = [], enumMap = [] } = contractStatement;
    // const { pagination = {}, dataSource = [], enumMap = [], listQuery } = contractStatement;
    // const baseExportBtnProps = {
    //   icon: 'export',
    // };
    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const rowSelectionList = {
      selectedRowKeys,
    };
    const listProps = {
      rowSelection: rowSelectionList,
      form,
      pagination,
      selectedRows,
      selectedRowKeys,
      contractStatement,
      onSearch: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: dataSource.map((o) => ({ ...o, key: o.pcHeaderId })),
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };
    // const pcHeaderIds = selectedRowKeys.join(',');
    // const queryParams = selectedRows.length > 0 ? { pcHeaderIds } : listQuery;
    selectedRows.forEach((v) => {
      if (
        (v.pcStatusCode === 'EFFECTED' && v.electricSignFlag === 1) ||
        (v.pcStatusCode === 'CONFIRMED' && v.electricSignFlag === 0)
      ) {
        this.state.isSureFileContract = true;
      } else {
        this.state.isSureFileContract = false;
      }
    });
    if (selectedRows.length === 0) {
      this.state.isSureFileContract = false;
    }

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
    };

    return (
      <Fragment>
        <Header title={intl.get(`spcm.common.contractStatement`).d('协议报表')}>
          {/* <ExcelExport
            buttonText={intl.get(`hzero.common.button.export`).d('导出')}
            otherButtonProps={baseExportBtnProps}
            requestUrl={`${SRM_SPCM}/v1/${tenantId}/purchase-contract/purchase-view/excel-export`}
            queryParams={queryParams}
          /> */}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}
