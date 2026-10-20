/**
 * LedgerAccount  总账科目
 * @date: 2019-11-13
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Table } from 'hzero-ui';
import { connect } from 'dva';

import { Button as PermissionButton } from 'components/Permission';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { openTab } from 'utils/menuTab';
import qs from 'querystring';
import CommonImport from 'hzero-front/lib/components/Import';

import { enableRender } from 'utils/renderer';
import FilterHeader from './FilterHeader';
import EditForm from './EditForm';
/**
 * LedgerAccount  总账科目
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} ledgerAccount - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 保存操作是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: ['LEDGERACCOUNT.EDIT', 'LEDGERACCOUNT.FILTER', 'LEDGERACCOUNT.LIST'],
})
@connect(({ ledgerAccount, loading }) => ({
  ledgerAccount,
  loading: {
    search: loading.effects['ledgerAccount/searchPeriodHeader'],
    searchLine: loading.effects['ledgerAccount/searchPeriodLine'],
    saveIng: loading.effects['ledgerAccount/savePeriodHeader'],
    savePeriod: loading.effects['ledgerAccount/savePeriod'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smdm.ledgerAccount', 'smdm.common', 'hzero.common'] })
export default class PeriodOrg extends Component {
  headerForm;

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      isEdit: false,
      initData: {},
    };
  }

  componentDidMount() {
    const { custLoading } = this.props;
    this.init();
    if (!custLoading) {
      this.handleSearchPeriodHeader();
    }
  }

  componentDidUpdate(prevProps) {
    const { custLoading } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleSearchPeriodHeader();
    }
  }

  /**
   * 初始化值集
   */
  @Bind()
  init() {
    const { dispatch } = this.props;
    dispatch({
      type: 'ledgerAccount/init',
    });
  }

  /**
   * 会计期查询
   * @param {Object} fields - 查询参数
   * @param {?Object} fields.page - 分页查询参数
   * @param {String} [fields.periodSetName] - 会计期名称
   * @param {String} [fields.periodSetCode] - 会计期名称
   */
  @Bind()
  handleSearchPeriodHeader(fields = {}) {
    const { dispatch, tenantId } = this.props;
    const fieldValues = isUndefined(this.headerForm)
      ? {}
      : filterNullValueObject(this.headerForm.getFieldsValue());
    dispatch({
      type: 'ledgerAccount/searchPeriodHeader',
      payload: {
        tenantId,
        customizeUnitCode: 'LEDGERACCOUNT.FILTER,LEDGERACCOUNT.LIST',
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
      },
    });
  }

  /**
   * 获取FilterForm中form对象
   * @param {object} ref - FilterForm组件
   */
  @Bind()
  handleBindHeaderRef(ref = {}) {
    this.headerForm = (ref.props || {}).form;
  }

  /**
   * 添加 - 会计期定义
   */
  @Bind()
  handleAddPeriodHeader() {
    const { tenantId } = this.props;
    this.setState({
      modalVisible: true,
      initData: {
        enabledFlag: 1,
        tenantId,
        sourceCode: 'SRM',
      },
      isEdit: false,
    });
  }

  /**
   * 添加 - 会计期定义
   */
  @Bind()
  handleEditModal(initData) {
    this.setState({
      modalVisible: true,
      initData,
      isEdit: true,
    });
  }

  @Bind()
  onCancel() {
    this.setState({
      modalVisible: false,
    });
  }

  /**
   * 保存：新增行保存、编辑行保存
   * 处于编辑状态的行才可进行保存
   */
  @Bind()
  handleSavePeriodHeader(params) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'ledgerAccount/savePeriodHeader',
      payload: {
        tenantId,
        customizeUnitCode: 'LEDGERACCOUNT.EDIT,LEDGERACCOUNT.LIST',
        saveData: [{ ...params }],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.onCancel();
        this.handleSearchPeriodHeader();
      }
    });
  }

  /**
   * 变更编辑状态
   */
  @Bind()
  handleEnalbed(val, record) {
    const enabledFlag = val ? 0 : 1;
    const dataSource = { ...record, enabledFlag };
    const { dispatch, tenantId, ledgerAccount } = this.props;
    const { pagination = {} } = ledgerAccount.periodHeader;
    dispatch({
      type: 'ledgerAccount/savePeriodHeader',
      payload: {
        tenantId,
        saveData: [dataSource] || [],
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleSearchPeriodHeader(pagination);
      }
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: `/smdm/ledger-account-org/data-import/SMDM.ACCOUNT_SUBJECT_IMPORT`,
      title: 'hzero.common.viewtitle.batchImport', // 批量导入的多语言编码
      search: qs.stringify({
        action: 'hzero.common.viewtitle.batchImport', // 批量导入的多语言编码
      }),
    });
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const filterValues = isUndefined(this.headerForm)
      ? {}
      : filterNullValueObject(this.headerForm.getFieldsValue());
    return {
      ...filterValues,
      customizeUnitCode: 'LEDGERACCOUNT.FILTER,LEDGERACCOUNT.LIST',
    };
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      ledgerAccount,
      loading,
      customizeForm,
      customizeFilterForm,
      customizeTable,
      tenantId,
    } = this.props;
    const { periodHeader, yesOrNoList = [] } = ledgerAccount;
    const { pagination, list } = periodHeader;
    const { modalVisible = false, isEdit = false, initData = {} } = this.state;
    const columns = [
      {
        title: intl.get(`smdm.common.model.project.code`).d('科目编码'),
        dataIndex: 'accountSubjectNum',
        width: 150,
      },
      {
        title: intl.get(`smdm.common.model.project.name`).d('科目名称'),
        dataIndex: 'accountSubjectName',
        width: 250,
      },
      {
        title: intl.get(`smdm.common.model.project.companyNum`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 250,
      },
      {
        title: intl.get(`smdm.common.model.wbs.companyName`).d('公司名称'),
        dataIndex: 'companyName',
        width: 250,
      },
      {
        title: intl.get(`smdm.common.model.project.ouId`).d('业务实体'),
        dataIndex: 'ouName',
        width: 250,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        dataIndex: 'enabledFlag',
        width: 100,
        align: 'left',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
      {
        title: intl.get('smdm.common.model.project.sourceFromSystem').d('来源系统'),
        dataIndex: 'sourceCode',
        width: 100,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 90,
        align: 'left',
        render: (_, record) => (
          <a style={{ cursor: 'pointer' }} onClick={() => this.handleEditModal(record)}>
            {intl.get('hzero.common.button.edit').d('编辑')}
          </a>
        ),
      },
    ];

    const filterHeader = {
      onSearch: this.handleSearchPeriodHeader,
      onRef: this.handleBindHeaderRef,
      customizeFilterForm,
      yesOrNoList,
    };

    const modalProps = {
      title: !isEdit
        ? intl.get('smdm.ledgerAccount.view.message.create').d('总账科目创建')
        : intl.get('smdm.ledgerAccount.view.message.edit').d('总账科目编辑'),
      modalVisible,
      onCancel: this.onCancel,
      onOk: this.handleSavePeriodHeader,
      isEdit,
      loading: loading.saveIng,
      initData,
      customizeForm,
    };

    return (
      <Fragment>
        <Header title={intl.get('smdm.ledgerAccount.view.message.title').d('总账科目定义')}>
          <Button icon="plus" onClick={this.handleAddPeriodHeader} type="primary">
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          {/* <Button icon="save" onClick={this.handleSavePeriodHeader} loading={loading.save}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button> */}
          <CommonImport
            prefixPatch="/smdm"
            businessObjectTemplateCode="SMDM.ACCOUNT_SUBJECT_IMPORT"
            buttonText={intl.get(`hzero.common.import.new`).d('导入-新')}
            buttonProps={{
              permissionList: [
                {
                  code: `srm.fin.ledger.account.ps.new.import`,
                  type: 'button',
                  meaning: '导入-新',
                },
              ],
            }}
          />
          <PermissionButton
            type="c7n-pro"
            icon="archive"
            onClick={this.handleBatchImport}
            permissionList={[
              {
                code: `srm.fin.ledger.account.ps.import`,
                type: 'button',
                meaning: '导入',
              },
            ]}
          >
            {intl.get(`hzero.common.import`).d('导入')}
          </PermissionButton>
          <ExcelExportPro
            templateCode="SMDM.ACCOUNT_SUBJECT_EXPORT"
            otherButtonProps={{
              icon: 'unarchive',
              permissionList: [
                {
                  code: 'srm.fin.ledger.account.button.export',
                  type: 'button',
                },
              ],
            }}
            buttonText={intl.get('hzero.common.export.new').d('导出-新')}
            requestUrl={`${SRM_MDM}/v1/${tenantId}/account-subject/export-modeler`}
            queryParams={this.handleGetFormValue()}
            method="POST"
            allBody
          />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterHeader {...filterHeader} />
          </div>
          {customizeTable(
            {
              code: 'LEDGERACCOUNT.LIST',
            },
            <Table
              bordered
              loading={loading.search}
              rowKey="accountSubjectId"
              columns={columns}
              dataSource={list}
              pagination={pagination}
              onChange={(page) => this.handleSearchPeriodHeader(page)}
            />
          )}
          {modalVisible && <EditForm {...modalProps} />}
        </Content>
      </Fragment>
    );
  }
}
