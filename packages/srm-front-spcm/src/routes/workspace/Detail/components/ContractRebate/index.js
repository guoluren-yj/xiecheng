import React, { Component, Fragment } from 'react';
import { Table, Modal } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import { connect } from 'dva';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty, isUndefined, difference } from 'lodash';
import { Badge, Popover } from 'choerodon-ui';
import {
  filterNullValueObject,
  createPagination,
  addItemsToPagination,
  delItemsToPagination,
  getEditTableData,
} from 'utils/utils';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import CommonImport from 'hzero-front/lib/components/Import';
import { renderCompareColumns, extTextRender, renderStatus } from '@/utils/renderer';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import intl from 'utils/intl';
import { showAffiliatedCompany } from '../../../Component/Modal/AffiliatedCompany';
import styles from '../index.less';
import styles2 from '../../index.less';

@connect(({ loading = {} }) => ({
  queryCompanyLoading: loading.effects['contractCommon/fetchCompany'],
  addCompanyLoading: loading.effects['contractCommon/fetchAddCompany'],
}))
@withRouter
export default class ContractRebate extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
    this.state = {
      companyVisible: false, // 公司modal
      companyDataSource: [], // 公司数据
      companyPagination: {}, // 公司分页
      clearCompanyRowsKeys: [], // 公司清除列表key
      clearCompanyRows: [], // 公司清除列
      companyAddDataSource: [], // 新建公司数据
      companyAddPagination: {}, // 新建公司分页
      sureAddCompanyRowsKeys: [], // 新建公司列表key
      sureAddCompanyRows: [], // 新建公司列
      rebateInformationId: null,
    };
  }

  @Bind()
  handleGetCode() {
    const {
      match: { path },
      location: { search },
      custCode,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (custCode) {
      return custCode;
    }
    if (
      path.includes('/spcm/contract-workspace/update') ||
      routerParams.hasChanged === 'true' ||
      path.includes('/spcm/contract-workspace/intelligent/')
    ) {
      return 'SPCM.WORKSPACE_DETAIL.REBATE';
    } else {
      return 'SPCM.WORKSPACE_DETAIL.REBATE.READONLY';
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.props.rebateDs.create({}, 0);
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const { rebateDs } = this.props;
    const selectedRows = rebateDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    rebateDs.remove(newAddRows);
    // 删除线上数据
    const res = await rebateDs.delete(existedRows, {
      title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
      children: intl
        .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
        .d('确认删除选中行？'),
    });
    if (res && !res.failed) {
      // onFetchTableList(rebateDs, 'SPCM.WORKSPACE_DETAIL.REBATE');
    }
  }

  @Bind()
  getClassName(field, record) {
    const { currentMode } = this.props;
    let className = '';
    if (currentMode && record?.get(`${field}Flag`)) {
      if (currentMode === 'current') {
        className = styles2.changeAfter;
      } else if (currentMode === 'history') {
        className = styles2.changeBefore;
      }
    }

    return className;
  }

  renderColumns() {
    const { editable, headerFormDs, currentMode, differeFlag } = this.props;
    const showDiff = currentMode === 'current' || currentMode === 'history';
    const columns = [
      differeFlag && {
        name: 'objectFlagMeaning',
        width: 120,
        renderer: ({ record, value }) => renderStatus(record.get('objectFlag'), value, 'change'),
      },
      {
        name: 'lineNum',
        width: 80,
        renderer: ({ record = {} }) => (
          <div>
            {showDiff && record.get('objectFlag') === 'CREATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'DELETE' ? (
              <Popover
                content={intl.get('hzero.common.button.deleteLine').d('删除行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'UPDATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {record.get('lineNum')}
          </div>
        ),
      },
      {
        name: 'saleRangeFrom',
        width: 150,
        editor: (record) =>
          editable && (
            <C7nPrecisionInputNumber
              currency="supplierCurrencyCode"
              name="saleRangeFrom"
              record={record}
              headerRecord={headerFormDs.current}
            />
          ),
      },
      {
        name: 'saleRangeTo',
        width: 150,
        editor: (record) =>
          editable && (
            <C7nPrecisionInputNumber
              currency="supplierCurrencyCode"
              name="saleRangeFrom"
              record={record}
              headerRecord={headerFormDs.current}
            />
          ),
      },
      {
        name: 'annualReturnRate',
        width: 175,
        editor: editable,
      },
      {
        name: 'rebateAmount',
        width: 170,
        editor: (record) =>
          editable && (
            <C7nPrecisionInputNumber
              currency="supplierCurrencyCode"
              name="rebateAmount"
              record={record}
              headerRecord={headerFormDs.current}
            />
          ),
      },
      {
        name: 'validityDateFrom',
        width: 150,
        editor: editable,
      },
      {
        name: 'validityDateTo',
        width: 150,
        editor: editable,
      },
      {
        name: 'affiliatedCompany',
        width: 100,
        renderer: ({ record }) => (
          <a
            disabled={!record.get('lineNum')}
            onClick={() =>
              showAffiliatedCompany({
                editable,
                rebateInformationId: record.get('rebateInformationId'),
              })
            }
          >
            {intl.get('spcm.common.model.common.definitionList').d('定义列表')}
          </a>
        ),
      },
      {
        name: 'supplierIds',
        width: 200,
        editor: editable,
      },
      {
        name: 'remark',
        width: 200,
        editor: editable,
      },
    ].filter(Boolean);
    return renderCompareColumns(columns, { currentMode, differeFlag });
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleOpenCompanyModal(rebateInformationId) {
    this.setState(
      {
        companyVisible: true,
        rebateInformationId,
      },
      () => this.fetchCompany()
    );
  }

  /**
   * 关闭公司模态框
   */
  @Bind()
  hideCompanyModal() {
    this.setState({
      companyVisible: false,
      sureAddCompanyRowsKeys: [],
    });
  }

  /**
    fetchCompany - 查询公司(子账号权限下的公司)
    */
  @Bind()
  fetchCompany(page = {}) {
    const { dispatch } = this.props;
    const { rebateInformationId } = this.state;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'contractCommon/fetchCompany',
      payload: {
        rebateInformationId,
        page,
        ...filterValues,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyDataSource: res.content.map((n) => ({ ...n, _status: 'update' })), // 公司列表数据
          companyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * fetchAddCompany - 查询需要新增的公司
   */
  @Bind()
  fetchAddCompany(page = {}) {
    const { companyDataSource = [] } = this.state;
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    const companyIds = companyDataSource.map((c) => c.companyId).join(',');
    dispatch({
      type: 'contractCommon/fetchAddCompany',
      payload: {
        ...filterValues,
        companyIds,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyAddDataSource: res.content,
          companyAddPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 删除新建未保存的公司
   */
  @Bind()
  handleClearCompany() {
    const {
      clearCompanyRows,
      companyDataSource,
      companyPagination,
      sureAddCompanyRowsKeys,
    } = this.state;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContactType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = clearCompanyRows.map((item) => item.companyId);
        const filtered = companyDataSource.filter(
          (item) => !selectedRowKeys.includes(item.companyId)
        );
        // 获取删除后未保存数据的key
        const differenceKeys = difference(sureAddCompanyRowsKeys, selectedRowKeys);
        // 需要处理什么时候不能删除
        this.setState({
          sureAddCompanyRowsKeys: differenceKeys,
          clearCompanyRowsKeys: [],
          companyDataSource: filtered,
          companyPagination: delItemsToPagination(
            selectedRowKeys.length,
            companyDataSource.length,
            companyPagination
          ),
        });
      },
    });
    // 进行清除
  }

  /**
   * 确认添加新建未保存的公司
   */
  @Bind()
  handleSureAddCompany() {
    const { companyDataSource, companyPagination, sureAddCompanyRows } = this.state;
    if (sureAddCompanyRows.length > 0) {
      const sureAddCompany =
        sureAddCompanyRows.map((n) => ({ ...n, _status: 'create', enabledFlag: 1 })) || []; // 协议类型确认添加公司
      this.setState({
        companyDataSource: [...companyDataSource, ...sureAddCompany],
        companyPagination: addItemsToPagination(
          sureAddCompany.length,
          companyDataSource.length,
          companyPagination
        ),
        sureAddCompanyRows: [],
      });
    }
  }

  /**
   * 确认保存新建的公司
   */
  @Bind()
  handleSureSaveCompany() {
    const { dispatch, rebateDs } = this.props;
    const { companyDataSource, rebateInformationId } = this.state;
    const companyData = getEditTableData(companyDataSource, ['_status']);
    dispatch({
      type: 'contractCommon/saveCompany',
      payload: { companyDataSource: companyData, rebateInformationId },
    }).then((res) => {
      if (res) {
        this.setState(
          {
            companyVisible: false,
            sureAddCompanyRowsKeys: [],
          },
          notification.success(),
          rebateDs.query()
        );
      }
    });
  }

  /**
   * 公司列表清除勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleClearCompanyRows(selectedRowKeys, selectedRows) {
    this.setState({
      clearCompanyRowsKeys: selectedRowKeys,
      clearCompanyRows: selectedRows,
    });
  }

  /**
   * 公司列表新增勾选回调
   * @param {*}
   * @param {Array} selectedRowKeys - 选中的列表项
   */
  @Bind()
  handleAddCompanyRows(selectedRowKeys, selectedRows) {
    this.setState({
      sureAddCompanyRowsKeys: selectedRowKeys,
      sureAddCompanyRows: selectedRows,
    });
  }

  render() {
    const {
      editable,
      rebateDs,
      queryCompanyLoading,
      addCompanyLoading,
      customizeTable,
      currentMode,
      differeFlag,
      headerFormDs,
      customizeBtnGroup,
    } = this.props;
    const {
      companyVisible,
      companyDataSource,
      companyPagination,
      clearCompanyRowsKeys = [],
      companyAddDataSource = [], // 新建公司数据
      companyAddPagination = {}, // 新建公司分页
      sureAddCompanyRowsKeys = [], // 新建公司列表key
      // addCompanyVisible,
    } = this.state;

    const rowClearCompany = {
      selectedRowKeys: clearCompanyRowsKeys,
      onChange: this.handleClearCompanyRows,
      getCheckboxProps: (record) => ({
        disabled: record._status === 'update' && record.companyId, // Column configuration not to be checked
      }),
    };
    const rowAddCompany = {
      selectedRowKeys: sureAddCompanyRowsKeys,
      onChange: this.handleAddCompanyRows,
    };

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected || [];
      const buttonCommonProps = {
        color: 'primary',
        funcType: 'flat',
      };
      return (
        <Fragment>
          {customizeBtnGroup(
            {
              code: 'SPCM.WORKSPACE_DETAIL.REBATE.BTN_GROUP',
              pro: true,
            },
            <DynamicButtons
              buttons={[
                {
                  name: 'create',
                  btnType: 'c7n-pro',
                  btnProps: {
                    ...buttonCommonProps,
                    icon: 'playlist_add',
                    color: 'primary',
                    onClick: this.handleCreate,
                  },
                  child: intl.get('hzero.common.btn.add').d('新增'),
                },
                {
                  name: 'delete',
                  btnType: 'c7n-pro',
                  btnProps: {
                    ...buttonCommonProps,
                    icon: 'delete_sweep',
                    disabled: isEmpty(selectedRows),
                    onClick: this.handleDelete,
                  },
                  child: intl.get(`hzero.common.button.batchdelete`).d('批量删除'),
                },
                {
                  name: 'newImport',
                  btnComp: CommonImport,
                  btnProps: {
                    businessObjectTemplateCode: 'SRM_C_SRM_SPCM_PC_REBATE_INFORMATION_IMPORT',
                    prefixPatch: '/spcm',
                    buttonText: intl.get('hzero.common.button.Import').d('导入'),
                    args: {
                      pcHeaderId: headerFormDs?.current?.get('pcHeaderId'),
                      workbenchFlag: '1',
                    },
                    buttonProps: buttonCommonProps,
                    successCallBack: () => {
                      rebateDs.query();
                    },
                  },
                },
              ]}
            />
          )}
        </Fragment>
      );
    });
    const companyProps = {
      maintainEditable: !!editable,
      dataSource: companyDataSource,
      pagination: companyPagination,
      companyAddDataSource, // 新建公司数据
      companyAddPagination, // 新建公司分页
      visible: companyVisible,
      hideModal: this.hideCompanyModal,
      loading: queryCompanyLoading,
      addCompanyLoading,
      onSearch: this.fetchCompany,
      fetchAddCompany: this.fetchAddCompany,
      handleCompany: this.fetchCompany,
      handleClearCompany: this.handleClearCompany,
      handleSureAddCompany: this.handleSureAddCompany,
      handleSureSaveCompany: this.handleSureSaveCompany,
      clearCompanyRowsKeys,
      rowSelection: rowClearCompany,
      rowAddCompany,
      onRef: (node) => {
        this.companyForm = node.props.form;
      },
      onAddRef: (node) => {
        this.companyAddForm = node.props.form;
      },
    };
    return (
      <Fragment>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={rebateDs} />
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
            extTextRenderIntercept: currentMode || differeFlag
              ? (...extParam) => extTextRender(extParam, { currentMode, differeFlag })
              : null,
          },
          <Table style={{ maxHeight: 430 }} dataSet={rebateDs} columns={this.renderColumns()} />
        )}
        {/* {companyVisible && <CompanyModal {...companyProps} />} */}
      </Fragment>
    );
  }
}
