/**
 * index.js - 我收到的协议
 * @date: 2019-05-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import querystring from 'querystring';
import { Button } from 'hzero-ui';
import { isUndefined, isArray } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Bind, Debounce } from 'lodash-decorators';
// import withCustomize from 'srm-front-cuz';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PermissionButton } from 'components/Permission';
import hocRemote from 'utils/remote';

import { downloadFile } from 'services/api';
import { DATETIME_MIN } from 'utils/constants';
import { SRM_SPCM } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';

import AsyncPagination from '@/routes/components/AsyncPagination';
import OperationRecordDrawer from '../components/OperationRecordDrawer';
import TextComparisonModal from '../components/TextComparisonModal';
import Search from './Search';
import List from './List';

const viewMessagePrompt = 'spcm.supplierContractView.view.message';

@connect(({ loading = {}, supplierContractView = {} }) => ({
  batchSubmitDeliveryLoading: loading.effects['supplierContractView/batchSubmitDelivery'],
  queryOperationRecordLoading: loading.effects['supplierContractView/queryOperationRecord'],
  batchDeleteDeliveryLoading: loading.effects['supplierContractView/batchDeleteDelivery'],
  batchCreateDeliveryLoading: loading.effects['supplierContractView/batchCreateDelivery'],
  queryListLoading: loading.effects['supplierContractView/queryList'],
  updateStateLoading: loading.effects['supplierContractView/updateState'],
  updateLoading: loading.effects['supplierContractView/update'],
  getLineAttachmentUuidLoading: loading.effects['supplierContractView/getLineAttachmentUuid'],
  fetchOperationRecordListLoading: loading.effects['supplierContractView/fetchOperationRecordList'],
  supplierContractView,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'spcm.supplierContractView',
    'spcm.purchaseContractView',
    'spcm.purchaseContractType',
    'entity.company',
    'entity.roles',
    'entity.customer',
    'entity.business',
    'entity.organization',
    'entity.attachment',
  ],
})
@withCustomize({
  unitCode: [
    'SPCM.SUPPLIER_CONTRACT_VIEW.LIST',
    'SPCM.SUPPLIER_CONTRACT_VIEW.LIST.FILTER',
    'SPCM.SUPPLIER_CONTRACT_VIEW.BTN_GROUP',
  ],
})
@hocRemote({
  code: 'SPCM_SUP_CONTRACT_VIEW_LIST',
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class SupplierContractView extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcHeaderId } = querystring.parse(search.substr(1));
    this.state = {
      pcHeaderId,
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      textComparisonVisible: false,
      notDownloadAuthority: true,
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      supplierContractView: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
    // 58集团二开逻辑， 别删
    // eslint-disable-next-line func-names
    window.addEventListener('message', (e) => {
      if (e.data?.refreshList) {
        this.fetchList();
      }
    });
  }

  // 组件更新完成后调用，此时可以获取数据
  componentDidUpdate(prevProps, prevState, pcHeaderId) {
    if (pcHeaderId) {
      this.fetchList();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', () => {});
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues) {
    const dealTime = {};
    // const takeTime = {};
    const timeArray = [
      'confirmedDateFrom',
      'confirmedDateTo',
      'creationDateFrom',
      'creationDateTo',
    ];
    // const takeArray = ['confirmedDateFrom', 'confirmedDateTo'];
    timeArray.forEach((item) => {
      dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    });
    // takeArray.forEach((item) => {
    //   dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    // });
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
      type: 'supplierContractView/queryList',
      payload: {
        page,
        // pcHeaderId,
        tenantId,
        ...handleFormValues,
        ...filterNullValueObject({
          asyncCountFlag: 'DEFAULT',
          oldTotalElements: page.total ? page.total : '',
        }),
        customizeUnitCode:
          'SPCM.SUPPLIER_CONTRACT_VIEW.LIST,SPCM.SUPPLIER_CONTRACT_VIEW.LIST.FILTER',
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
      type: 'supplierContractView/init',
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
        pathname: `/spcm/supplier-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : querystring.stringify({}),
      })
    );
  }

  /**
   * 跳转到固定地方
   * @param {String} pcHeaderId
   */
  @Bind()
  lookUp() {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const pcHeaderId = selectedRows.map((item) => item.pcHeaderId);
    dispatch(
      routerRedux.push({
        pathname: `/spcm/supplier-contract-view/detail`,
        search: pcHeaderId ? querystring.stringify({ pcHeaderId }) : null,
        hash: `#spcm-contract-approval-detail-contract-online-edit`,
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
    const { dispatch } = this.props;
    // 查询此条单据是否有下载文本按钮权
    this.setState(
      {
        selectedRows,
        selectedRowKeys,
      },
      () => {
        if (selectedRowKeys.length === 1) {
          const pcHeaderId = selectedRowKeys[0];
          dispatch({
            type: 'supplierContractView/queryButtonAuthority',
            payload: {
              pcHeaderId,
            },
          }).then((res) => {
            if (Array.isArray(res)) {
              this.setState({
                notDownloadAuthority: !!res.includes('CONTRACT_QUERY_DOWNLOAD'),
              });
            }
          });
        }
      }
    );
  }

  @Bind()
  @Debounce(500)
  handleModalVisible(modalVisible, flag, otherParams = {}) {
    this.setState({ [modalVisible]: !!flag, ...otherParams });
  }

  /**
   * 下载
   * @param {object} record - 流程对象
   */
  @Bind()
  downloadLogFile() {
    const { selectedRows } = this.state;
    const organizationId = getCurrentOrganizationId();
    const contractFileUrl = selectedRows.map((item) => item.contractFileUrl);
    const api = `${HZERO_FILE}/v1/${organizationId}
    /files/download?bucketName=${PRIVATE_BUCKET}&url=${contractFileUrl}`;
    downloadFile({
      requestUrl: api,
      queryParams: [
        { name: 'bucketName', value: PRIVATE_BUCKET },
        { name: 'url', value: selectedRows[0].contractFileUrl },
      ],
    }).then((res) => {
      if (res) {
        this.setState({ selectedRows: [] });
        // this.fetchList();
      }
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

  @Bind()
  getButtons() {
    const { supplierContractView, customizeBtnGroup, remote } = this.props;
    const { listQuery } = supplierContractView;
    const { tenantId, selectedRows = [], selectedRowKeys = [], notDownloadAuthority } = this.state;
    const pcHeaderIds = selectedRowKeys.join(',');
    const newExportQuery = selectedRows.length > 0 ? { pcHeaderIds: selectedRowKeys } : listQuery;
    const newListQuery = selectedRows.length > 0 ? { pcHeaderIds } : listQuery;
    const contractFileUrl = selectedRows.some((item) => item.contractFileUrl === null);
    const pcKindCodeFlag = selectedRows.some((item) =>
      ['ATTACHMENT_FRAMEWORK', 'ATTACHMENT'].includes(item.pcKindCode)
    );
    const pcKindCodeNormalFlag =
      selectedRows.filter((item) => item.pcKindCode === 'NORMAL').length === 1;
    const baseExportBtnProps = {
      icon: 'unarchive',
      permissionList: [
        {
          code: 'srm.pc-admin.pc-supplier.view.ps.export.new',
          type: 'button',
          meaning: '新版导出',
        },
      ],
    };
    let headerButtons = [
      <ExcelExportPro
        data-name="newExport"
        method="POST"
        allBody
        type="primary"
        buttonText={
          selectedRows.length > 0
            ? intl.get(`hzero.common.checkedExport`).d('勾选导出')
            : intl.get(`spcm.common.button.newExport`).d('新版导出')
        }
        otherButtonProps={baseExportBtnProps}
        requestUrl={`${SRM_SPCM}/v1/${tenantId}/purchase-contract/supplier-view/excel-export`}
        queryParams={newExportQuery}
        templateCode="SRM_C_SRM_SPCM_PC_HEADER_RECIVE_EXPORT"
      />,
      <ExcelExport
        data-name="export"
        type="primary"
        buttonText={intl.get(`hzero.common.button.export`).d('导出')}
        otherButtonProps={{
          type: 'c7n-pro',
          icon: 'unarchive',
        }}
        requestUrl={`${SRM_SPCM}/v1/${tenantId}/purchase-contract/supplier-view/excel-export`}
        queryParams={newListQuery}
      />,
      <Button
        data-name="look"
        onClick={this.lookUp}
        icon="look-over"
        disabled={
          (isArray(selectedRows) && selectedRows.length !== 1) ||
          pcKindCodeFlag ||
          !pcKindCodeNormalFlag
        }
      >
        {intl.get('spcm.purchaseContractView.model.look').d('查阅')}
      </Button>,
      <PermissionButton
        data-name="download"
        permissionList={[
          {
            code: 'srm.pc-admin.pc-supplier.view.ps.download',
            type: 'button',
            meaning: '下载文本',
          },
        ]}
        icon="download"
        disabled={
          (isArray(selectedRows) && selectedRows.length !== 1) ||
          contractFileUrl ||
          pcKindCodeFlag ||
          notDownloadAuthority
        }
        onClick={this.downloadLogFile}
      >
        {intl.get('spcm.purchaseContractView.model.download').d('下载文本')}
      </PermissionButton>,
    ];
    headerButtons = remote
      ? remote.process('SPCM_SUP_CONTRACT_VIEW_LIST_HEADERBUTTONS', headerButtons, {
          current: this,
        })
      : headerButtons;
    return customizeBtnGroup(
      {
        code: 'SPCM.SUPPLIER_CONTRACT_VIEW.BTN_GROUP',
      },
      headerButtons
    );
  }

  render() {
    const {
      queryListLoading,
      supplierContractView,
      customizeFilterForm,
      customizeTable,
      remote,
    } = this.props;
    const {
      pagination = {},
      dataSource = [],
      enumMap = [],
      paginationLoading,
    } = supplierContractView;
    const {
      selectedRows = [],
      selectedRowKeys = [],
      pcHeaderId,
      operationRecordVisible,
      textComparisonVisible,
    } = this.state;
    const searchProps = {
      enumMap,
      customizeFilterForm,
      remote,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const rowSelectionList = {
      selectedRowKeys,
    };
    const listProps = {
      remote,
      pagination: false,
      selectedRows,
      selectedRowKeys,
      customizeTable,
      onSearch: this.fetchList,
      loading: queryListLoading,
      rowSelection: rowSelectionList,
      redirectDetail: this.redirectDetail,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: dataSource.map((o) => ({ ...o, key: o.pcHeaderId })),
      onControlTextComparison: this.handleControlComparison,
    };

    const operationRecordProps = {
      pcHeaderId,
      visible: operationRecordVisible,
      role: 'supplier',
      onHandleCancel: () => this.handleModalVisible('operationRecordVisible', false),
    };

    const textComparisonProps = {
      pcHeaderId,
      visible: textComparisonVisible,
      onCancel: this.handleControlComparison,
      isSupplier: true,
    };

    return (
      <Fragment>
        <Header title={intl.get(`${viewMessagePrompt}.supplierContractView`).d('我收到的协议')}>
          {this.getButtons()}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
          <AsyncPagination
            {...pagination}
            loading={paginationLoading}
            onCustChange={(current, pageSize) =>
              this.fetchList({ ...pagination, current, pageSize })
            }
          />
        </Content>
        <OperationRecordDrawer {...operationRecordProps} />
        {textComparisonVisible && <TextComparisonModal {...textComparisonProps} />}
      </Fragment>
    );
  }
}
