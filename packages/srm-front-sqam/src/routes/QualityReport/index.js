/**
 * index.js - 质量报表
 * @date: 2020-01-14
 * @author: LC<chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
// import { Button } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { connect } from 'dva';
import { DATETIME_MIN, DATETIME_MAX } from 'utils/constants';

import { SRM_SQAM } from '_utils/config';
import ExcelExport from 'components/ExcelExport';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import Search from './Search';
import List from './List';
import InspectionLotModal from './InspectionLotModal';

const modelPrompt = 'sqam.qualityReport.model';
@connect(({ loading = {}, qualityReport = {} }) => ({
  queryListLoading: loading.effects['qualityReport/queryList'],
  updateStateLoading: loading.effects['qualityReport/updateState'],
  updateLoading: loading.effects['qualityReport/update'],
  intiLoading: loading.effects['qualityReport/init'],
  queryInspectionLotLoading: loading.effects['qualityReport/queryInspectionLotList'],
  qualityReport,
}))
@formatterCollections({
  code: [
    'spcm.common',
    'sqam.qualityReport',
    'spcm.purchaseContractView',
    'entity.company',
    'entity.supplier',
    'entity.organization',
    'entity.roles',
    'entity,item',
  ],
})
export default class PurchaseContractView extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      tenantId: getCurrentOrganizationId(),
      organizationId: getCurrentOrganizationId(),
      selectedRowKeys: [],
      inspectionLotvisible: false,
      record: {}, // 查询检验批次明细的行
      handleFormValues: {}, // 查询条件
    };
  }

  // 进入页面渲染
  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      qualityReport: { pagination = {} },
    } = this.props;
    this.fetchLov();
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
  }

  /**
   * 初始化值集
   */
  @Bind()
  fetchLov() {
    const { dispatch } = this.props;
    dispatch({
      type: 'qualityReport/fetchLov',
    });
  }

  /**
   * 处理表单中的查询条件
   * @param {Object} filterValues
   * @param {String} radioTab
   */
  handleFormQuery(filterValues = {}) {
    const { beginDate, finishDate } = filterValues;
    // const dealTime = {};
    // const takeTime = {};
    // const timeArray = ['beginDate', 'finishDate'];
    // timeArray.forEach(item => {
    //   dealTime[item] = filterValues[item] ? filterValues[item].format(DATETIME_MIN) : undefined;
    // });
    return {
      ...filterValues,
      beginDate: beginDate ? beginDate.format(DATETIME_MIN) : undefined,
      finishDate: finishDate ? finishDate.format(DATETIME_MAX) : undefined,
    };
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, selectedRows = []) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const handleFormValues = this.handleFormQuery(filterValues);
    this.setState({ selectedRows, handleFormValues });
    dispatch({
      type: 'qualityReport/queryList',
      payload: {
        page,
        ...handleFormValues,
      },
    });
  }

  // 查询来料检验明细
  @Bind()
  fetchInspectionLotList(page = {}) {
    const { record = {}, handleFormValues = {} } = this.state;
    const { dispatch } = this.props;
    const { beginDate, finishDate } = handleFormValues;
    const { companyId, categoryId, ouId, supplierCompanyId, invOrganizationId } = record;
    dispatch({
      type: 'qualityReport/queryInspectionLotList',
      payload: {
        page,
        ouId,
        beginDate,
        finishDate,
        companyId,
        categoryId,
        supplierCompanyId,
        invOrganizationId,
      },
    });
  }

  // 来料检验弹窗控制
  @Bind()
  handleVisible(inspectionLotvisible, record = {}) {
    this.setState({ inspectionLotvisible, record }, () => {
      if (inspectionLotvisible) {
        this.fetchInspectionLotList();
      }
    });
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

  render() {
    const { tenantId, selectedRows = [], selectedRowKeys = [], inspectionLotvisible } = this.state;
    const { form, qualityReport, queryListLoading, queryInspectionLotLoading } = this.props;
    const {
      pagination = {},
      dataSource = [],
      enumMap = [],
      listQuery,
      inspectionLotList = [],
      inspectionLotPaginaition,
    } = qualityReport;
    const { compromise = [], goods = [] } = enumMap;
    const baseExportBtnProps = {
      icon: 'export',
    };
    const searchProps = {
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const rowSelectionList = {
      selectedRowKeys,
    };
    const listProps = {
      compromise,
      goods,
      rowSelection: rowSelectionList,
      form,
      pagination,
      selectedRows,
      selectedRowKeys,
      qualityReport,
      onSearch: this.fetchList,
      loading: queryListLoading,
      onRowSelectChange: this.onRowSelectChange,
      handleModalVisibleList: this.handleModalVisible,
      dataSource: dataSource.map((o) => ({ ...o, key: o.pcHeaderId })),
      handleVisible: this.handleVisible,
    };
    const inspectionLotModalProps = {
      loading: queryInspectionLotLoading,
      dataSource: inspectionLotList,
      visible: inspectionLotvisible,
      pagination: inspectionLotPaginaition,
      handleVisible: this.handleVisible,
      fetchInspectionLotList: this.fetchInspectionLotList,
    };

    const pcHeaderIds = selectedRowKeys.join(',');
    const queryParams = selectedRows.length > 0 ? { pcHeaderIds } : listQuery;
    return (
      <Fragment>
        <Header title={intl.get(`${modelPrompt}.qualityInspectionReport`).d('质量检验报表')}>
          <ExcelExport
            buttonText={intl.get(`hzero.common.button.export`).d('导出')}
            otherButtonProps={baseExportBtnProps}
            requestUrl={`${SRM_SQAM}/v1/${tenantId}/incoming-inspections/qualityReport/export`}
            queryParams={queryParams}
            method="POST"
            allBody
          />
          {/* <Button */}
          {/*  // onClick={this.lookUp} */}
          {/*  icon="look-over" */}
          {/*  disabled={isArray(selectedRows) && selectedRows.length < 1} */}
          {/* > */}
          {/*  {intl.get(`${modelPrompt}.choseExport`).d('勾选导出')} */}
          {/* </Button> */}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {inspectionLotvisible && <InspectionLotModal {...inspectionLotModalProps} />}
      </Fragment>
    );
  }
}
