/**
 * PurchaseFinance - 供应商账户
 * @date: 2019-01-09
 * @author: YKK <kaikai.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button, Form } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import notification from 'utils/notification';
import { getEditTableData } from 'utils/utils';
import EditTable from 'components/EditTable';
import Lov from 'components/Lov';

const FormItem = Form.Item;

const customizeUnitCode = 'SPFM.PARTNER_LIST_IMPORT_SAP.SUPPLIER_ACCOUNT';

@connect(({ importErp, loading }) => ({
  importErp,
  loading: loading.effects['importErp/querySupplierAccount'],
  saving: loading.effects['importErp/saveSupplierAccount'],
}))
@formatterCollections({ code: 'spfm.importErp' })
export default class SupplierAccount extends Component {
  constructor(props) {
    super(props);
    this.state = { newSupplierSyncId: null };
  }

  componentDidMount() {
    const {
      importErp: { supplierAccountPagination = {} },
    } = this.props;
    this.handleSearch(supplierAccountPagination);
  }

  componentWillUnmount() {
    this.closeSearch();
  }

  /**
   * 供应商账户查询
   * @param {object} page - 查询参数
   */
  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      modalRecord: { supplierSyncId },
    } = this.props;
    const { newSupplierSyncId } = this.state;
    dispatch({
      type: 'importErp/querySupplierAccount',
      payload: {
        page,
        supplierSyncId: newSupplierSyncId || supplierSyncId,
        customizeUnitCode,
      },
    });
  }

  @Bind()
  closeSearch() {
    const { dispatch } = this.props;
    dispatch({
      type: 'importErp/updateState',
      payload: {
        supplierAccountPagination: {},
        supplierAccountList: [], // 缓存的数据要清空
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      importErp: { supplierAccountList = [], supplierAccountPagination = {} },
    } = this.props;
    const supplierSyncAccount = getEditTableData(supplierAccountList, ['supplierSyncAccountId']);
    if (isEmpty(supplierSyncAccount)) return;

    dispatch({
      type: 'importErp/saveSupplierAccount',
      payload: { supplierSyncAccount, customizeUnitCode },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ newSupplierSyncId: res });
        this.handleSearch(supplierAccountPagination);
      }
    });
  }

  /**
   * 编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleEditRow(record) {
    const {
      dispatch,
      importErp: { supplierAccountList = [] },
    } = this.props;
    const newSupplierAccountList = supplierAccountList.map((item) =>
      item.supplierSyncAccountId === record.supplierSyncAccountId
        ? { ...item, _status: 'update' }
        : item
    );
    dispatch({
      type: 'importErp/updateState',
      payload: { supplierAccountList: newSupplierAccountList },
    });
  }

  /**
   * 取消编辑行
   * @param {Object} record 行数据
   */
  @Bind()
  handleCancelRow(record) {
    const {
      dispatch,
      importErp: { supplierAccountList = [] },
    } = this.props;
    const newSupplierAccountList = supplierAccountList.map((item) => {
      if (item.supplierSyncAccountId === record.supplierSyncAccountId) {
        const { _status, ...other } = item;
        return other;
      } else {
        return item;
      }
    });
    dispatch({
      type: 'importErp/updateState',
      payload: { supplierAccountList: newSupplierAccountList },
    });
  }

  /**
   * render查询表单
   */
  render() {
    const {
      loading,
      saving,
      importErp: { supplierAccountList = [], supplierAccountPagination = {} },
      modalRecord: { syncStatus },
      customizeTable,
      custLoading,
    } = this.props;
    const isSave = supplierAccountList.filter((o) => o._status === 'update');
    const columns = [
      {
        title: intl.get(`spfm.importErp.model.importErp.bankCode`).d('银行代码'),
        dataIndex: 'bankCode',
        width: 100,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.bankName`).d('银行名称'),
        dataIndex: 'bankName',
        width: 200,
      },
      {
        title: intl.get('spfm.importErp.model.importErp.bankAccountName').d('联行行号'),
        dataIndex: 'bankFirm',
        width: 180,
      },
      {
        title: intl.get('spfm.importErp.model.importErp.depositBank').d('开户行名称'),
        dataIndex: 'depositBank',
        width: 180,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.accountkName`).d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 180,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.bankAccountNum`).d('银行账户'),
        dataIndex: 'bankAccountNum',
        width: 200,
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.countryId`).d('国家'),
        dataIndex: 'countryId',
        width: 100,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`countryId`, {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`spfm.importErp.model.address.countryId`).d('国家'),
                    }),
                  },
                ],
                initialValue: record.countryId,
              })(
                <Lov
                  code="HPFM.COUNTRY"
                  textValue={record.countryName}
                  queryParams={{ enabledFlag: 1 }}
                />
              )}
            </FormItem>
          ) : (
            record.countryName
          ),
      },
      {
        title: intl.get(`spfm.importErp.model.importErp.enabledFlag`).d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        render: enableRender,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'edit',
        width: 100,
        render: (_, record) => (
          <span className="action-link">
            {record._status === 'update' ? (
              <a
                onClick={() => {
                  this.handleCancelRow(record);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            ) : (
              <a
                disabled={syncStatus === 'PENDING'}
                onClick={() => {
                  this.handleEditRow(record);
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </span>
        ),
      },
    ];
    return (
      <React.Fragment>
        <div
          style={{
            marginTop: -8,
            paddingBottom: 16,
            marginBottom: 16,
            fontSize: 16,
            color: '#333',
            fontWeight: 500,
            borderBottom: 'solid 1px #e5e5e5',
          }}
        >
          {intl.get(`spfm.importErp.model.importErp.supplierAccount`).d('供应商账户')}
        </div>
        <div style={{ textAlign: 'right', paddingBottom: 16 }}>
          <Button
            type="primary"
            disabled={isEmpty(isSave)}
            loading={saving}
            onClick={this.handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </div>
        {customizeTable(
          {
            code: 'SPFM.PARTNER_LIST_IMPORT_SAP.SUPPLIER_ACCOUNT',
          },
          <EditTable
            loading={loading}
            dataSource={supplierAccountList}
            pagination={supplierAccountPagination}
            rowKey="supplierSyncAccountId"
            onChange={this.handleSearch}
            custLoading={custLoading}
            columns={columns}
            bordered
          />
        )}
      </React.Fragment>
    );
  }
}
