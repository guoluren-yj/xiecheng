/**
 * LedgerAccount  成本中心
 * @date: 2019-11-13
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { openTab } from 'utils/menuTab';
import qs from 'querystring';
import CommonImport from 'hzero-front/lib/components/Import';
import { Button as PermissionButton } from 'components/Permission';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import FilterHeader from './FilterHeader';
import EditForm from './EditForm';
/**
 * LedgerAccount  成本中心
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {!Object} periodOrg - 数据源
 * @reactProps {!boolean} loading - 数据加载是否完成
 * @reactProps {!boolean} saveLoading - 保存操作是否完成
 * @reactProps {!String} tenantId - 租户ID
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SMDM.COSTCENTER.LIST',
    'SMDM.COSTCENTER.EDIT',
    'SMDM.COSTCENTER.FILTER',
    'SMDM.COSTCENTER.BTNS',
  ],
})
@connect(({ costCenter, loading }) => ({
  costCenter,
  loading: {
    search: loading.effects['costCenter/searchPeriodHeader'],
    searchLine: loading.effects['costCenter/searchPeriodLine'],
    saveIng:
      loading.effects['costCenter/savePeriodHeader'] ||
      loading.effects['costCenter/searchPeriodHeader'],
    savePeriod: loading.effects['costCenter/savePeriod'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smdm.costCenter', 'smdm.common', 'hzero.common'] })
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
      type: 'costCenter/init',
    });
  }

  /**
   * 成本中心查询
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
      type: 'costCenter/searchPeriodHeader',
      payload: {
        customizeUnitCode: 'SMDM.COSTCENTER.EDIT,SMDM.COSTCENTER.LIST,SMDM.COSTCENTER.FILTER',
        tenantId,
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
      type: 'costCenter/savePeriodHeader',
      payload: {
        tenantId,
        saveData: [params],
        customizeUnitCode: 'SMDM.COSTCENTER.EDIT',
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
   * 批量导入
   */
  @Bind()
  handleBatchImport() {
    openTab({
      key: `/smdm/cost-center-org/data-import/SMDM.COST_CENTER_IMPORT`,
      title: 'hzero.common.viewtitle.batchImport', // 批量导入
      search: qs.stringify({
        action: 'hzero.common.viewtitle.batchImport', // 批量导入
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
      customizeUnitCode: 'SMDM.COSTCENTER.LIST,SMDM.COSTCENTER.FILTER',
    };
  }

  //
  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      costCenter,
      loading,
      customizeTable,
      customizeForm,
      customizeFilterForm,
      customizeBtnGroup,
      tenantId,
    } = this.props;
    const { periodHeader, yesOrNoList = [] } = costCenter;
    const { pagination, list } = periodHeader;
    const { modalVisible = false, isEdit = false, initData = {} } = this.state;
    const columns = [
      {
        title: intl.get(`smdm.common.model.costCenter.code`).d('成本中心编码'),
        dataIndex: 'costCode',
        width: 150,
      },
      {
        title: intl.get(`smdm.common.model.costCenter.name`).d('成本中心名称'),
        dataIndex: 'costName',
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
    // const listHeader = {
    //   form,
    //   loading: loading.search,
    //   pagination: periodHeader.pagination,
    //   dataSource: periodHeader.list,
    //   onCleanLine: this.handleCleanHeader,
    //   onChangeFlag: this.handleChangeEditable,
    //   onCreateRule: this.handleCreateRule,
    //   onSearch: this.handleSearchPeriodHeader,
    //   handleEnalbed: this.handleEnalbed,
    // };
    const modalProps = {
      title: !isEdit
        ? intl.get('smdm.costCenter.view.message.create').d('成本中心创建')
        : intl.get('smdm.costCenter.view.message.edit').d('成本中心编辑'),
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
        <Header title={intl.get('smdm.costCenter.view.message.title').d('成本中心定义')}>
          {customizeBtnGroup({ code: 'SMDM.COSTCENTER.BTNS' }, [
            <Button
              data-name="create"
              icon="plus"
              onClick={this.handleAddPeriodHeader}
              type="primary"
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>,
            <CommonImport
              data-name="newImport"
              prefixPatch="/smdm"
              buttonProps={{
                permissionList: [
                  {
                    code: `srm.fin.cost.center.ps.new.cost-center.import`,
                    type: 'button',
                    meaning: '导入-新',
                  },
                ],
              }}
              businessObjectTemplateCode="SMDM.COST_CENTER_IMPORT"
              buttonText={intl.get(`hzero.common.import.new`).d('导入-新')}
            />,
            <PermissionButton
              data-name="import"
              type="c7n-pro"
              icon="archive"
              onClick={this.handleBatchImport}
              permissionList={[
                {
                  code: `srm.fin.cost.center.ps.cost-center.import`,
                  type: 'button',
                  meaning: '导入',
                },
              ]}
            >
              {intl.get(`hzero.common.import`).d('导入')}
            </PermissionButton>,
            <ExcelExportPro
              data-name="newExport"
              templateCode="SMDM.COST_CENTER_EXPORT"
              otherButtonProps={{
                icon: 'unarchive',
                permissionList: [
                  {
                    code: 'srm.fin.cost.center.button.export',
                    type: 'button',
                  },
                ],
              }}
              buttonText={intl.get('hzero.common.export.new').d('导出-新')}
              requestUrl={`${SRM_MDM}/v1/${tenantId}/cost-centers/cost-center/export-modeler`}
              queryParams={this.handleGetFormValue()}
              method="POST"
              allBody
            />,
          ])}
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterHeader {...filterHeader} />
          </div>
          {customizeTable(
            {
              code: 'SMDM.COSTCENTER.LIST',
            },
            <Table
              bordered
              loading={loading.search}
              rowKey="costId"
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
