/**
 * index.js - 协议类型管理
 * @date: 2019-05-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button } from 'hzero-ui';
import { parse, stringify } from 'querystring';
import { isUndefined, isEmpty, compose } from 'lodash';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import uuidV4 from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import ExcelExportPro from 'components/ExcelExportPro';
import CommonImport from 'components/Import';
import hocRemote from 'utils/remote';
import { SRM_SPCM } from '_utils/config';

import formatterCollections from 'utils/intl/formatterCollections';
import { Header, Content } from 'components/Page';
import {
  filterNullValueObject,
  createPagination,
  addItemToPagination,
  delItemToPagination,
  getEditTableData,
  getCurrentOrganizationId,
} from 'utils/utils';
import intl from 'utils/intl';
import notification from 'utils/notification';

import Search from './Search';
import List from './List';
import CompanyModal from './CompanyModal';

// const viewMessagePrompt = 'spcm.purchaseContactType.view.message';
const mldelMessagePropt = 'spcm.common.model.common';
const exportRequestUrlPro = `${SRM_SPCM}/v1/${getCurrentOrganizationId()}/purchase-contract-type/type-excel-details`;

class PurchaseContactType extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const { pcTypeId } = parse(search.substr(1));
    this.state = {
      pcTypeId,
      pcConfigId: null,
      companyVisible: false,
      // selectedRows: [],
      // selectedRowKeys: [],
    };
  }

  componentDidMount() {
    const {
      location: { state: { _back } = {} },
      purchaseContractType: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      // _back=-1 在详情页
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  componentDidUpdate(prevProps, prevState, pcTypeId) {
    if (pcTypeId) {
      this.fetchList();
    }
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleCompany(record) {
    this.setState(
      {
        companyVisible: true,
        pcConfigId: record.pcTypeId,
      },
      () => this.fetchCompany(record.pcTypeId)
    );
  }

  /**
   fetchCompany - 查询公司(子账号权限下的公司)
   */
  @Bind()
  fetchCompany(pcTypeId, page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'purchaseContractType/fetchCompany',
      payload: {
        pcConfigId: pcTypeId,
        page,
        ...filterValues,
      },
    }).then(res => {
      if (res) {
        this.setState({
          companyDataSource: res.content,
          companyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 关闭公司模态框
   */
  @Bind()
  hideCompanyModal() {
    this.setState({
      companyVisible: false,
    });
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */

  @Bind()
  fetchList(page = {}) {
    const { pcTypeId } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    // this.setState({ selectedRows: [] });
    dispatch({
      type: 'purchaseContractType/queryList',
      payload: {
        page,
        pcTypeId,
        ...filterValues,
        customizeUnitCode: 'SPCM.CONTRACT.TYPE.LIST,SPCM.CONTRACT.TYPE.FILTER',
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
      type: 'purchaseContractType/init',
    });
  }

  /**
   * 跳转到明细页
   * @param {String} pcTypeId
   */
  @Bind()
  redirectDetail(pcTypeId) {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-type/detail`,
        search: pcTypeId ? stringify({ pcTypeId }) : stringify({}),
      })
    );
  }

  /**
   * 新建列表
   */
  @Bind()
  project() {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/spcm/purchase-contract-type/detail`,
      })
    );
  }

  @Bind()
  handleAddCopyRow(record) {
    const {
      dispatch,
      purchaseContractType: { dataSource = [], pagination = {} },
    } = this.props;
    const { pcTypeCode, pcTypeName, enabledFlag, pcTypeId, ...otherRecord } = record;
    dispatch({
      type: 'purchaseContractType/updateState',
      payload: {
        dataSource: [
          {
            ...otherRecord,
            sourcePcTypeId: pcTypeId,
            pcTypeId: uuidV4(),
            _status: 'create',
          },
          ...dataSource,
        ],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  @Bind()
  handleDeleteCopyRow(record) {
    const {
      dispatch,
      purchaseContractType: { dataSource = [], pagination = {} },
    } = this.props;
    dispatch({
      type: 'purchaseContractType/updateState',
      payload: {
        dataSource: dataSource.filter(d => d.pcTypeId !== record.pcTypeId),
        pagination: delItemToPagination(dataSource.length, pagination),
      },
    });
  }

  @Bind()
  handleSaveCopyData() {
    const {
      dispatch,
      purchaseContractType: { dataSource = [], pagination = {} },
    } = this.props;
    const copyData = getEditTableData(dataSource, ['pcTypeId']);
    if (!isEmpty(copyData)) {
      dispatch({
        type: 'purchaseContractType/copyContractType',
        payload: copyData,
      }).then(res => {
        if (res) {
          notification.success();
          this.fetchList(pagination);
        }
      });
    }
  }

  render() {
    const {
      queryListLoading,
      queryCompanyLoading,
      saveCopyDataLoading,
      purchaseContractType,
      customizeBtnGroup,
      customizeFilterForm,
      remote,
    } = this.props;
    const { companyVisible, companyDataSource, companyPagination, pcConfigId } = this.state;
    const { pagination = {}, dataSource = [], enumMap = {} } = purchaseContractType;
    const searchProps = {
      customizeFilterForm,
      enumMap,
      onRef: node => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const listProps = {
      remote,
      enumMap,
      dataSource,
      pagination,
      purchaseContractType,
      onSearch: this.fetchList,
      onChange: this.fetchList,
      loading: queryListLoading,
      redirectDetail: this.redirectDetail,
      onHandleRecord: this.handleRecordChange,
      handleCompany: this.handleCompany,
      onAddCopyRow: this.handleAddCopyRow,
      onDeleteCopyRow: this.handleDeleteCopyRow,
    };
    const companyProps = {
      dataSource: companyDataSource,
      pagination: companyPagination,
      loading: queryCompanyLoading,
      visible: companyVisible,
      onSearch: this.fetchCompany,
      handleCompany: this.fetchCompany,
      fetchCompany: this.fetchCompany,
      hideModal: this.hideCompanyModal,
      pcConfigId,
      onRef: node => {
        this.companyForm = node.props.form;
      },
    };
    const isCopyList = dataSource.filter(d => d._status);
    const queryParams = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    return (
      <Fragment>
        <Header title={intl.get(`${mldelMessagePropt}.pcType`).d('协议类型')}>
          {customizeBtnGroup(
            {
              code: 'SPCM.CONTRACT.TYPE.BTN_GROUP',
            },
            [
              <Button data-name="create" icon="plus" type="primary" onClick={this.project}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>,
              !isEmpty(isCopyList) && (
                <Button data-name="save" icon="save" loading={saveCopyDataLoading} onClick={this.handleSaveCopyData}>
                  {intl.get(`hzero.common.button.save`).d('保存')}
                </Button>
              ),
              <ExcelExportPro
                data-name="export"
                method='POST'
                allBody
                templateCode="SRM_C_SRM_SPCM_PC_TYPE_EXPORT"
                requestUrl={exportRequestUrlPro}
                queryParams={queryParams}
                otherButtonProps={{
                  permissionList: [
                    {
                      code: 'srm.pc-admin.pc-config.type.button.export',
                      type: 'button',
                      meaning: '导出',
                    },
                  ],
                }}
              />,
              <CommonImport
                data-name="batchImport"
                businessObjectTemplateCode="SRM_C_SRM_SPCM_PC_TYPE_IMPORT"
                prefixPatch="/spcm"
                args={{ fromExport: true }}
                buttonProps={{
                  permissionList: [
                    {
                      code: 'srm.pc-admin.pc-config.type.button.import',
                      type: 'button',
                      meaning: '导入',
                    },
                  ],
                }}
                successCallBack={() => {
                  notification.success();
                  this.fetchList();
                }}
              />,
            ]
          )}
        </Header>
        <Content>
          <Search {...searchProps} />
          <List {...listProps} />
        </Content>
        {companyVisible && <CompanyModal {...companyProps} />}
      </Fragment>
    );
  }
}

const hocFunc = com =>
  compose(
    connect(({ loading = {}, purchaseContractType = {} }) => ({
      queryListLoading: loading.effects['purchaseContractType/queryList'],
      fetchEnumLoading: loading.effects['purchaseContractType/fetchEnum'],
      updateStateLoading: loading.effects['purchaseContractType/updateState'],
      submitting: loading.effects['purchaseContractType/update'],
      queryCompanyLoading: loading.effects['purchaseContractType/fetchCompany'],
      saveCopyDataLoading: loading.effects['purchaseContractType/copyContractType'],
      purchaseContractType,
    })),

    formatterCollections({
      code: [
        'spcm.purchaseContactType',
        'spcm.common',
        'entity.company',
        'entity.item',
        'spcm.purchaseContractType',
        'entity.roles',
      ],
    }),
    withCustomize({
      unitCode: ['SPCM.CONTRACT.TYPE.FILTER', 'SPCM.CONTRACT.TYPE.BTN_GROUP'],
    }),
    hocRemote({
      code: 'SPCM_PURCHASE_CONTACE_TYPE_INDEX',
      name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
    })
  )(com);

export { PurchaseContactType, hocFunc };
export default hocFunc(PurchaseContactType);
