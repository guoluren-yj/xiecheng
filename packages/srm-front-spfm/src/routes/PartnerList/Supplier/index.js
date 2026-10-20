/**
 * index.js - 我的合作伙伴-我的供应商
 * @date: 2018-10-18
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import moment from 'moment';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty, cloneDeep } from 'lodash';
import React, { PureComponent, Fragment } from 'react';
import { Form, Row, Table, Modal, Tabs, Popover } from 'hzero-ui';
import querystring from 'querystring';

import intl from 'utils/intl';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import CommonImport from 'components/Import';
import { DEFAULT_DATE_FORMAT, DATETIME_MIN, DATETIME_MAX } from 'utils/constants';
import cacheComponent from 'components/CacheComponent';
import { getCurrentOrganizationId, filterNullValueObject, getEditTableData } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import formatterCollections from 'utils/intl/formatterCollections';
import { deleteCache } from 'hzero-front/lib/components/CacheComponent';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Button as PerButton } from 'components/Permission';

import Customer from '../Customer';
import PlatformFilterForm from './PlatformFilterForm';
import PlatformListTable from './PlatformListTable';
import ErpFilterForm from './ErpFilterForm';
import ErpListTable from './ErpListTable';
import styles from '../index.less';

const { TabPane } = Tabs;

@withCustomize({
  unitCode: [
    'SPFM.PARTNER_LIST_SUPPLIER.SUPPLIEROFPLATFORM',
    'SPFM.PARTNER_LIST_SUPPLIER.FINAL_FILTER',
    'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER',
    'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER_SITE',
    'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER.FILTER',
    'SPFM.PARTNER_LIST_SUPPLIER.BANK_ACCT',
    'SPFM.PARTNER_LIST_SUPPLIER.CONTACTS',
    'SPFM.PARTNER_LIST_SUPPLIER.ADDRESS',
    'SPFM.PARTNER_LIST_SUPPLIER.SUPPLIEROFPLATFORM.BTN_GROUP',
    'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER.BTN_GROUP',
    'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_TAB',
    'SPFM.PARTNER_LIST_SUPPLIER.PURCHASE_HEADER',
    'SPFM.PARTNER_LIST_SUPPLIER.PURCHASE_LINE',
  ],
})
@Form.create({ fieldNameProp: null })
@connect(({ loading, supplier }) => ({
  supplier,
  erpList: supplier.erpList || {},
  platformList: supplier.platformList || {},
  platformLoading: loading.effects['supplier/queryPlatformSupplier'],
  erpLoading: loading.effects['supplier/queryErpSupplier'],
  saveLoading: loading.effects['supplier/handleSave'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'spfm.supplier',
    'entity.company',
    'spfm.common',
    'spfm.companySearch',
    'spfm.certificationApproval',
    'spfm.invitationRegister',
    'spfm.bank',
    'spfm.importErp',
    'sslm.supplierInform',
    'sslm.common',
  ],
})
@cacheComponent({ cacheKey: 'hpfm.ErpSupplier' })
export default class ErpSupplier extends PureComponent {
  constructor(props) {
    super(props);
    const params = querystring.parse(props.location.search.substr(1));
    const { activeKey } = params;
    this.erpFilter = {};
    this.platformFilter = {};
    this.rowKey = 'supplierId';
    this.queryPageSize = 10;
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      defaultActiveKey: activeKey || 'platform',
    };
  }

  componentDidMount() {
    const {
      supplier: { erpPagination = {} },
    } = this.props;
    this.handleErpSearch(erpPagination);
    this.handleEnable();
  }

  /**
   * 查询 ERP 供应商列表
   * @param {Object} params
   */
  @Bind()
  handleErpSearch(page = {}, clearFlag = true) {
    const { dispatch, tenantId } = this.props;
    const values = (this.erpFilter.props && this.erpFilter.props.form.getFieldsValue()) || {};
    const { erpCreationDate } = values;
    dispatch({
      type: 'supplier/queryErpSupplier',
      payload: {
        page,
        tenantId,
        ...values,
        erpCreationDate: erpCreationDate ? moment(erpCreationDate).format(DEFAULT_DATE_FORMAT) : '',
        customizeUnitCode:
          'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER,SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER.FILTER',
      },
    }).then((res) => {
      if (!isEmpty(res) && clearFlag) {
        this.setState(
          {
            selectedRowKeys: [],
            selectedRows: [],
          },
          () => {
            dispatch({
              type: 'supplier/updateState',
              payload: { editContent: [] },
            });
          }
        );
      }
    });
  }

  // 本地供应商导出参数
  @Bind()
  handleErpParams() {
    const values =
      (this.erpFilter &&
        this.erpFilter.props &&
        filterNullValueObject(this.erpFilter.props.form.getFieldsValue())) ||
      {};
    const { erpCreationDate } = values;
    const newErpCreationDate = erpCreationDate
      ? moment(erpCreationDate).format(DEFAULT_DATE_FORMAT)
      : undefined;
    return {
      ...values,
      erpCreationDate: newErpCreationDate,
    };
  }

  // 平台供应商导出参数
  @Bind()
  handlePlatformParams() {
    const values =
      (this.platformFilter &&
        this.platformFilter.props &&
        filterNullValueObject(this.platformFilter.props.form.getFieldsValue())) ||
      {};
    const { approveFromDate, approveToDate } = values;
    const newApproveFromDate = approveFromDate
      ? moment(approveFromDate).format(DATETIME_MIN)
      : undefined;
    const newApproveToDate = approveToDate ? moment(approveToDate).format(DATETIME_MAX) : undefined;
    return {
      ...values,
      approveFromDate: newApproveFromDate,
      approveToDate: newApproveToDate,
    };
  }

  /**
   * 查询平台供应商列表
   * @param {Object} params
   */
  @Bind()
  handlePlatformSearch(page = {}) {
    const { dispatch, tenantId } = this.props;
    const values =
      (this.platformFilter.props && this.platformFilter.props.form.getFieldsValue()) || {};
    const approveFromDate =
      values.approveFromDate && moment(values.approveFromDate).format(DATETIME_MIN);
    const approveToDate = values.approveToDate && moment(values.approveToDate).format(DATETIME_MAX);
     // 异步分页改造参数
     const pageFilterParams = {
      asyncCountFlag: 'DEFAULT',
      oldTotalElements: page.total ? page.total : undefined,
    };
    dispatch({
      type: 'supplier/queryPlatformSupplier',
      payload: {
        tenantId,
        page,
        ...values,
        approveFromDate,
        approveToDate,
        customizeUnitCode:
          'SPFM.PARTNER_LIST_SUPPLIER.SUPPLIEROFPLATFORM,SPFM.PARTNER_LIST_SUPPLIER.FINAL_FILTER',
        ...pageFilterParams,
      },
    });
  }

  /**
   * 过滤，生成可提交数据
   * @param {Array} data 编辑或新增的数组列表
   * @param {Object} values 修改过的表单项
   */
  @Bind()
  filterData(data, values = {}) {
    const formValues = Object.keys(values) || [];
    const newData = cloneDeep(data);

    formValues.forEach((key) => {
      const idx = key.match(/[#]/g) && key.match(/[#]/).index;
      if (idx || idx === 0) {
        const editKey = key.substr(idx + 1); // 去掉 # 的 key
        const findIndex = newData.findIndex((item) => {
          return `${item[this.rowKey]}` === key.substr(0, idx);
        });
        if (findIndex !== -1) {
          const findLine = newData[findIndex];
          findLine[editKey] = values[key];
          newData.splice(findIndex, 1, findLine);
        }
      }
    });

    return newData.map((item) => (item.isCreate ? { ...item, [this.rowKey]: null } : item));
  }

  /**
   * 校验成功按名称匹配关联供应商
   */
  @Bind()
  handleLink() {
    const {
      dispatch,
      supplier: { editContent = [], erpPagination = {} },
      form,
      tenantId,
    } = this.props;
    form.validateFields((err, values) => {
      if (!err) {
        // 过滤出已关联的
        const linkList = this.filterData(editContent, values).filter((item) => !!item.linkId);
        if(!isEmpty(linkList)){
          notification.error({
            message: intl
              .get('spfm.supplier.view.message.existAssociation')
              .d('勾选的本地供应商中包含已关联数据，无法重新匹配关联'),
          });
          return;
        }
        const list = this.filterData(editContent, values).filter((item) => !item.linkId); // 过滤未关联供应商
        dispatch({
          type: 'supplier/linkErpSupplier',
          payload: {
            tenantId,
            list,
          },
        }).then((res) => {
          if (res) {
            if (res.failedCounts === 0) {
              notification.success();
              this.handleErpSearch(erpPagination);
            } else {
              const { failedCounts, failedErpList: content } = res;
              const columns = [
                {
                  title: intl.get('spfm.supplier.model.supplier.erp.supplierNum').d('供应商编码'),
                  width: 80,
                  align: 'left',
                  dataIndex: 'supplierNum',
                },
                {
                  title: intl.get('spfm.supplier.model.supplier.erp.supplierName').d('供应商名称'),
                  width: 80,
                  align: 'left',
                  dataIndex: 'supplierName',
                },
                {
                  title: intl.get('spfm.supplier.model.supplier.erp.errorMessage').d('错误信息'),
                  width: 150,
                  align: 'left',
                  dataIndex: 'errorMessage',
                  render: (val) => <Popover content={val}>{val}</Popover>,
                },
              ];
              Modal.warning({
                width: 900,
                title: intl
                  .get('spfm.supplier.view.message.title', { failedCounts })
                  .d(`匹配失败 ${failedCounts} 条`),
                content: (
                  <Table dataSource={content} columns={columns} size="small" pagination={false} />
                ),
                onOk: () => {
                  this.handleErpSearch(erpPagination);
                },
              });
            }
          }
        });
      }
    });
  }

  /**
   * 取消关联供应商
   */
  @Bind()
  handleUnlink() {
    const {
      dispatch,
      supplier: { editContent = [], erpPagination = {} },
      tenantId,
    } = this.props;
    // 过滤未关联的
    const unlinkList = editContent.filter((item) => !item.linkId); // 过滤已关联供应商
    if(!isEmpty(unlinkList)){
      notification.error({
        message: intl
          .get('spfm.supplier.view.message.existUnassociated')
          .d('勾选的本地供应商中包含未关联数据，无法取消关联'),
      });
      return;
    }
    const list = editContent.filter((item) => !!item.linkId); // 过滤已关联供应商
    dispatch({
      type: 'supplier/unlinkErpSupplier',
      payload: {
        tenantId,
        list,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleErpSearch(erpPagination);
      }
    });
  }

  /**
   * 启用禁用平台供应商
   * @param {Object} record
   */
  @Bind()
  toggleEnable(record) {
    const {
      dispatch,
      tenantId,
      supplier: { platformPagination = {} },
    } = this.props;
    const action = {
      type: `supplier/${record.enabledFlag ? 'disablePartner' : 'enablePartner'}`,
      payload: {
        ...record,
        tenantId,
        enabledFlag: !record.enabledFlag,
      },
    };

    dispatch(action).then((response) => {
      if (response) {
        this.handlePlatformSearch(platformPagination);
      }
    });
  }

  /**
   * 跳转界面到导入Erp
   */
  @Bind()
  handleJumpPage() {
    const { history } = this.props;
    history.push(`/spfm/partner-list/import-erp`);
    deleteCache('/spfm/partner-list/import-erp1');
    deleteCache('/spfm/partner-list/import-erp2');
  }

  /**
   * 斯瑞德风险扫描内嵌页
   */
  @Bind()
  handleEmbedPage(record) {
    const { dispatch } = this.props;
    const load = intl.get('spfm.common.view.riskMonitoring.loading').d('正在加载');
    const prompt = `<p style="text-align: center">${load}...</p>`;
    const riskEmbedPage = window.open();
    if (riskEmbedPage) {
      // 防止窗口被拦截
      riskEmbedPage.document.body.innerHTML = prompt;
      dispatch({
        type: 'supplier/riskEmbedPage',
        payload: {
          enterpriseName: record.supplierCompanyName,
          supplierCompanyId: record.supplierCompanyId,
        },
      }).then((res) => {
        if (res) {
          if (!res.failed) {
            riskEmbedPage.location = res.monitorUrl;
          } else {
            const errPrompt = `<p style="text-align: center">${res.message}</p>`;
            riskEmbedPage.document.body.innerHTML = errPrompt;
          }
        }
      });
    }
  }

  @Bind()
  handleImport(key) {
    openTab({
      key: `/spfm/partner-list/supplier/import-component/${key}`,
      title: intl.get('hzero.common.button.import').d('导入'),
      search: querystring.stringify({
        action: intl.get('hzero.common.button.import').d('导入'),
      }),
    });
  }

  /**
   * 配置中心“我的合作伙伴”是否启用加入监控、风险扫描
   */
  @Bind()
  handleEnable() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplier/queryConfigEnable',
    });
  }

  // /**
  //  * 切换 Tab 标签页回调
  //  * @param {String} key - Tab 页 key
  //  */
  // @Bind()
  // handleTabChange(key) {
  //   console.log(key);
  //   const { history } = this.props;
  //   if (key === 'supplier') {
  //     history.push('/spfm/partner-list/supplier');
  //   } else {
  //     history.push('/spfm/partner-list/customer');
  //   }
  // }

  @Bind()
  handleSave() {
    const { erpList: { content = [] } = {}, dispatch } = this.props;
    const tableValues = getEditTableData(content, ['_status']);
    if (Array.isArray(tableValues) && tableValues.length !== 0) {
      dispatch({
        type: 'supplier/handleSave',
        payload: {
          tableValues,
          customizeUnitCode: 'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER',
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleErpSearch();
        }
      });
    }
  }

  render() {
    const {
      form,
      erpLoading,
      platformLoading,
      saveLoading,
      tenantId,
      dispatch,
      erpList,
      platformList,
      history,
      supplier: { erpPagination, platformPagination, addMonitor, riskScan, erpList: erpListNew },
      customizeTable = () => {},
      customizeForm,
      customizeFilterForm,
      custLoading,
      customizeBtnGroup,
      customizeTabPane = () => {},
    } = this.props;
    const { selectedRowKeys = [], defaultActiveKey = '', selectedRows: stateSelectedRows } = this.state;
    const rowSelection = {
      selectedRowKeys,
      selectedRows: stateSelectedRows,
      onChange: (keys, selectedRows) => {
        const newList = erpListNew;
        const newListContent = erpListNew.content.map((item) => {
          const selected = keys.includes(item.supplierId);
          if (selected) {
            return {
              ...item,
              selected: true,
            };
          }
          return {
            ...item,
            selected: false,
          };
        });
        newList.content = newListContent;
        this.setState({
          selectedRowKeys: keys,
          selectedRows,
        });
        dispatch({
          type: 'supplier/updateState',
          payload: {
            editContent: selectedRows.map((item) => ({
              ...item,
              isEdit: true,
            })),
            erpList: newList,
          },
        });
      },
    };
    const erpListProps = {
      loading: erpLoading,
      pagination: erpPagination,
      form,
      tenantId,
      rowSelection,
      rowKey: this.rowKey,
      dataSource: erpList.content,
      customizeTable,
      customizeForm,
      handleTableChange: this.handleErpSearch,
      custLoading,
    };

    const platformListProps = {
      tenantId,
      addMonitor,
      riskScan,
      rowKey: 'partnerId',
      loading: platformLoading,
      pagination: platformPagination,
      dataSource: platformList.content,
      toggleEnable: this.toggleEnable,
      handleTableChange: this.handlePlatformSearch,
      handleEmbedPage: this.handleEmbedPage,
      dispatch,
      customizeTable,
      handlePlatformSearch: this.handlePlatformSearch,
    };

    const erpFilterProps = {
      onSearch: this.handleErpSearch,
      customizeFilterForm,
    };

    const platformFilterProps = {
      onSearch: this.handlePlatformSearch,
      customizeFilterForm,
      tenantId,
    };

    // ERP 供应商
    const erpComponent = (
      <React.Fragment>
        <div className="table-list-search">
          <ErpFilterForm
            onRef={(ref) => {
              this.erpFilter = ref;
            }}
            {...erpFilterProps}
          />
        </div>
        <Row className={styles.btnGroup} style={{ marginBottom: 16, textAlign: 'right' }}>
          {customizeBtnGroup(
            {
              code: 'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_SUPPLIER.BTN_GROUP',
            },
            [
              <PerButton
                data-name="import"
                onClick={() => this.handleImport('SSLM.BATCH_IMPORT_ERP')}
                style={{ marginRight: 8 }}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.my-partner.ps.erp.excl.import.old',
                    type: 'button',
                    meaning: '本地供应商-导入ERP',
                  },
                ]}
              >
                {intl.get('hzero.common.button.import').d('导入')}
              </PerButton>,
              <ExcelExport
                data-name="export"
                exportAsync
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/external-suppliers/export`}
                queryParams={() => this.handleErpParams()}
                otherButtonProps={{
                  icon: '',
                  style: { marginRight: 8 },
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.external.export.old',
                      type: 'button',
                      meaning: '本地供应商-导出',
                    },
                  ],
                }}
              />,
              <CommonImport
                data-name="commonImport"
                businessObjectTemplateCode="SSLM.BATCH_IMPORT_ERP"
                prefixPatch={SRM_SSLM}
                refreshButton
                buttonText={intl.get('hzero.common.button.import.new').d('(新)导入')}
                buttonProps={{
                  icon: '',
                  style: { marginRight: 8 },
                  type: 'h0',
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.erp.excl.import.model',
                      type: 'button',
                      meaning: '本地供应商-导入',
                    },
                  ],
                }}
                successCallBack={() => {
                  this.handleErpSearch();
                }}
              />,
              <ExcelExportPro
                data-name="exportPro"
                exportAsync
                buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                templateCode="SRM_C_SRM_SSLM_EXTERNAL_SUPPLIER_EXPORT" // 导出模板编码
                requestUrl={`${SRM_SSLM}/v1/${tenantId}/external-suppliers/export_new`}
                queryParams={() => this.handleErpParams()}
                otherButtonProps={{
                  icon: '',
                  style: { marginRight: 8 },
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.external.export.new',
                      type: 'button',
                      meaning: '本地供应商-导出',
                    },
                  ],
                }}
              />,
              <PerButton
                data-name="save"
                loading={saveLoading}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.my-partner.ps.button.external-supplier-save`,
                    type: 'button',
                    meaning: '内部供应商-保存',
                  },
                ]}
                onClick={this.handleSave}
                style={{ marginRight: 8 }}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </PerButton>,
              <PerButton
                data-name="link"
                onClick={this.handleLink}
                style={{ marginRight: 8 }}
                disabled={isEmpty(selectedRowKeys)}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.my-partner.ps.external.match`,
                    type: 'button',
                    meaning: '内部供应商-匹配关联',
                  },
                ]}
              >
                {intl.get('spfm.supplier.view.button.link').d('匹配关联')}
              </PerButton>,
              <PerButton
                data-name="unlink"
                onClick={this.handleUnlink}
                disabled={isEmpty(selectedRowKeys)}
                permissionList={[
                  {
                    code: `srm.partner.my-partner.my-partner.ps.external.mismatch`,
                    type: 'button',
                    meaning: '内部供应商-取消关联',
                  },
                ]}
              >
                {intl.get('spfm.supplier.view.button.unlink').d('取消关联')}
              </PerButton>,
            ]
          )}
        </Row>
        <ErpListTable {...erpListProps} />
      </React.Fragment>
    );

    // 平台供应商
    const platformComponent = (
      <React.Fragment>
        <div className="table-list-search">
          <PlatformFilterForm
            onRef={(ref) => {
              this.platformFilter = ref;
            }}
            {...platformFilterProps}
          />
        </div>
        <Row className={styles.btnGroup} style={{ marginBottom: 16, textAlign: 'right' }}>
          {customizeBtnGroup(
            {
              code: 'SPFM.PARTNER_LIST_SUPPLIER.SUPPLIEROFPLATFORM.BTN_GROUP',
            },
            [
              <PerButton
                data-name="import"
                onClick={() => this.handleImport('SPFM.BATCH_PARTNER')}
                style={{ marginRight: 8 }}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.my-partner.ps.partner.import.old',
                    type: 'button',
                    meaning: '平台供应商-导入ERP',
                  },
                ]}
              >
                {intl.get('hzero.common.button.import').d('导入')}
              </PerButton>,
              <ExcelExport
                data-name="export"
                exportAsync
                requestUrl={`${SRM_PLATFORM}/v1/${tenantId}/partners/suppliers/export`}
                queryParams={() => this.handlePlatformParams()}
                otherButtonProps={{
                  icon: '',
                  style: { marginRight: 8 },
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.partner.export.old',
                      type: 'button',
                      meaning: '平台供应商-导出',
                    },
                  ],
                }}
              />,
              <CommonImport
                data-name="commonImport"
                buttonText={intl.get('hzero.common.button.import.new').d('(新)导入')}
                businessObjectTemplateCode="SPFM.BATCH_PARTNER"
                prefixPatch={SRM_PLATFORM}
                refreshButton
                buttonProps={{
                  icon: '',
                  style: { marginRight: 8 },
                  type: 'h0',
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.partner.import.model',
                      type: 'button',
                      meaning: '平台供应商-导入',
                    },
                  ],
                }}
                successCallBack={() => {
                  this.handlePlatformSearch();
                }}
              />,
              <ExcelExportPro
                data-name="exportPro"
                buttonText={intl.get('hzero.common.export.new').d('(新)导出')}
                exportAsync
                templateCode="SRM_C_SRM_SPFM_PARTNER_SUPPLIER_EXPORT" // 导出模板编码
                requestUrl={`${SRM_PLATFORM}/v1/${tenantId}/partners/suppliers/export`}
                queryParams={() => this.handlePlatformParams()}
                otherButtonProps={{
                  icon: '',
                  type: 'h0',
                  style: { marginRight: 8 },
                  permissionList: [
                    {
                      code: 'srm.partner.my-partner.my-partner.ps.partner.export.new',
                      type: 'button',
                      meaning: '平台供应商-导出',
                    },
                  ],
                }}
              />,
              <PerButton
                data-name="findSupplier"
                onClick={() => history.push('/spfm/company-search/supplier')}
                style={{ marginRight: 8 }}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.my-partner.ps.partner.search-supplier',
                    type: 'button',
                    meaning: '平台供应商-发现供应商',
                  },
                ]}
              >
                {intl.get('spfm.supplier.view.button.findSupplier').d('发现供应商')}
              </PerButton>,
              <PerButton
                data-name="importErp"
                type="primary"
                onClick={this.handleJumpPage}
                permissionList={[
                  {
                    code: 'srm.partner.my-partner.my-partner.ps.button.erp.import',
                    type: 'button',
                    meaning: '平台供应商-导入ERP',
                  },
                ]}
              >
                {intl.get('spfm.supplier.view.button.importErp').d('导入ERP')}
              </PerButton>,
            ]
          )}
        </Row>
        <PlatformListTable {...platformListProps} />
      </React.Fragment>
    );

    const { match, location } = this.props;
    const urlSplitArr = location.pathname.substr(match.url.length + 1).split('/');
    return (
      <Fragment>
        <Header title={intl.get('spfm.supplier.view.router.title').d('我的合作伙伴')} />
        <Content style={{ paddingTop: 0 }}>
          <Tabs
            defaultActiveKey={`${urlSplitArr[0] || 'supplier'}`}
            animated={false}
            className={styles['partner-tabs']}
            // onChange={this.handleTabChange}
          >
            <TabPane
              key="supplier"
              tab={intl.get('spfm.supplier.view.router.supplier').d('我的供应商')}
              // className={styles['partner-content']}
            >
              {customizeTabPane(
                {
                  code: 'SPFM.PARTNER_LIST_SUPPLIER.INTERNAL_TAB',
                },
                <Tabs
                  defaultActiveKey={defaultActiveKey}
                  animated={false}
                  tabPosition="left"
                  className={styles['supplier-wrap']}
                >
                  <TabPane
                    tab={intl.get('spfm.supplier.view.router.supplier.platform').d('平台供应商')}
                    key="platform"
                  >
                    {platformComponent}
                  </TabPane>
                  <TabPane
                    tab={intl.get('spfm.supplier.view.router.supplier.internal').d('本地供应商')}
                    key="erp"
                  >
                    {erpComponent}
                  </TabPane>
                </Tabs>
              )}
            </TabPane>
            <TabPane
              key="customer"
              tab={intl.get('spfm.supplier.view.router.customer').d('我的客户')}
              className={styles['customer-content']}
            >
              <Customer />
            </TabPane>
          </Tabs>
        </Content>
      </Fragment>
    );
  }
}
