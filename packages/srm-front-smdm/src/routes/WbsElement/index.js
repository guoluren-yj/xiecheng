/**
 * LedgerAccount  wbs
 * @date: 2019-11-13
 * @author: LC <chao.li03@hand-china.com>
 * @version: 0.1.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component, Fragment } from 'react';
import { Button, Table } from 'hzero-ui';
import { connect } from 'dva';
import { stringify } from 'querystring';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { Header, Content } from 'components/Page';
import notification from 'utils/notification';
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import CommonImport from 'hzero-front/lib/components/Import';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import { Button as PermissionButton } from 'components/Permission';

import FilterHeader from './FilterHeader';
import EditForm from './EditForm';
/**
 * LedgerAccount  wbs
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
    'SMDM.WBSELE.CREATE_FORM',
    'SMDM.WBSELE.SEARCH_FORM',
    'SMDM.WBSELE.TABLE_LIST',
    'SMDM.WBSELE.BTNS',
  ],
})
@connect(({ wbs, loading }) => ({
  wbs,
  loading: {
    search: loading.effects['wbs/searchPeriodHeader'],
    searchLine: loading.effects['wbs/searchPeriodLine'],
    saveIng: loading.effects['wbs/savePeriodHeader'] || loading.effects['wbs/updatePeriodHeader'],
    savePeriod: loading.effects['wbs/savePeriod'],
  },
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['smdm.wbs', 'smdm.common', 'hzero.common'] })
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
      type: 'wbs/init',
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleImport() {
    const option = {
      pathname: '/smdm/wbs-element-org/data-import/SMDM.WBS_IMPORT',
      search: stringify({
        action: 'hzero.common.viewtitle.batchImport', // 批量导入的多语言编码
        backPath: `/smdm/wbs-element-org/list`,
      }),
    };
    this.props.history.push(option);
  }

  /**
   * wbs查询
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
      type: 'wbs/searchPeriodHeader',
      payload: {
        tenantId,
        page: isEmpty(fields) ? {} : fields,
        ...fieldValues,
        customizeUnitCode: 'SMDM.WBSELE.SEARCH_FORM,SMDM.WBSELE.TABLE_LIST',
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
   * 添加 - wbs元素定义
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
        deleteFlag: 1,
      },
      isEdit: false,
    });
  }

  /**
   * 编辑 - wbs元素定义
   */
  @Bind()
  handleEditModal(initData) {
    const { dispatch, tenantId } = this.props;
    dispatch({
      type: 'wbs/detailWbs',
      payload: {
        tenantId,
        wbsId: initData.wbsId,
        customizeUnitCode: 'SMDM.WBSELE.CREATE_FORM',
      },
    }).then((res) => {
      if (res) {
        this.setState({
          modalVisible: true,
          initData: res,
          isEdit: true,
        });
      }
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
    if (params.wbsId) {
      dispatch({
        type: 'wbs/updatePeriodHeader',
        payload: {
          tenantId,
          saveData: { ...params, customizeUnitCode: 'SMDM.WBSELE.CREATE_FORM' } || {},
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.onCancel();
          this.handleSearchPeriodHeader();
        }
      });
    } else {
      dispatch({
        type: 'wbs/savePeriodHeader',
        payload: {
          tenantId,
          saveData: [{ ...params, customizeUnitCode: 'SMDM.WBSELE.CREATE_FORM' }],
        },
      }).then((res) => {
        if (res) {
          notification.success();
          this.onCancel();
          this.handleSearchPeriodHeader();
        }
      });
    }
  }

  /**
   * 变更编辑状态
   */
  // @Bind()
  // handleEnalbed(val, record) {
  //   //  const deleteFlag = val ? 0 : 1;
  //   //  const dataSource = { ...record, deleteFlag };
  //   const { dispatch, tenantId, wbs } = this.props;
  //   const { pagination = {} } = wbs.periodHeader;
  //   dispatch({
  //     type: 'wbs/updatePeriodHeader',
  //     payload: {
  //       tenantId,
  //       saveData: record || {},
  //     },
  //   }).then((res) => {
  //     if (res) {
  //       notification.success();
  //       this.handleSearchPeriodHeader(pagination);
  //     }
  //   });
  // }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const {
      wbs: { selectedRowKeys = [] },
    } = this.props;
    const filterValues = isUndefined(this.headerForm)
      ? {}
      : filterNullValueObject(this.headerForm.getFieldsValue());

    return selectedRowKeys && selectedRowKeys.length > 0
      ? {
          ...filterValues,
          wbsIds: selectedRowKeys,
          customizeUnitCode: 'SMDM.WBSELE.SEARCH_FORM,SMDM.WBSELE.TABLE_LIST',
        }
      : {
          ...filterValues,
          customizeUnitCode: 'SMDM.WBSELE.SEARCH_FORM,SMDM.WBSELE.TABLE_LIST',
        };
  }

  /**
   * 将勾选数据存在model里面
   */
  @Bind()
  onTableSelectedRowChange(selectedRowKeys) {
    const { dispatch } = this.props;
    dispatch({
      type: 'wbs/updateState',
      payload: {
        selectedRowKeys,
      },
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      wbs,
      loading,
      customizeFilterForm,
      customizeForm,
      customizeTable,
      customizeBtnGroup,
      tenantId,
    } = this.props;
    const { periodHeader = [], mdmSourcePlatformList = [], flag = [], selectedRowKeys = [] } = wbs;
    const { pagination, list } = periodHeader;
    const { modalVisible = false, isEdit = false, initData = {} } = this.state;
    const columns = [
      {
        title: intl.get(`smdm.common.model.wbs.code`).d('WBS编码'),
        dataIndex: 'wbsCode',
        width: 150,
      },
      {
        title: intl.get(`smdm.common.model.wbs.name`).d('WBS元素描述'),
        dataIndex: 'wbsName',
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
        dataIndex: 'deleteFlag',
        width: 100,
        align: 'left',
        render: (val) => enableRender(Number(val)),
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
      mdmSourcePlatformList,
      customizeFilterForm,
      flag,
    };
    const modalProps = {
      title: !isEdit
        ? intl.get('smdm.wbs.view.message.create').d('WBS元素创建')
        : intl.get('smdm.wbs.view.message.edit').d('WBS元素编辑'),
      modalVisible,
      onCancel: this.onCancel,
      onOk: this.handleSavePeriodHeader,
      isEdit,
      customizeForm,
      loading: loading.saveIng,
      initData,
    };
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onTableSelectedRowChange,
    };
    return (
      <Fragment>
        <Header title={intl.get('smdm.wbs.view.message.title').d('WBS元素定义')}>
          {customizeBtnGroup({ code: 'SMDM.WBSELE.BTNS' }, [
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
              businessObjectTemplateCode="SMDM.WBS_IMPORT"
              buttonProps={{
                permissionList: [
                  {
                    code: `srm.fin.wbs.element.ps.new.wbs.import`,
                    type: 'button',
                    meaning: '批量导入-新',
                  },
                ],
              }}
              buttonText={intl.get('hzero.common.viewtitle.batchImport.new').d('批量导入-新')}
            />,
            <PermissionButton
              data-name="import"
              type="c7n-pro"
              icon="archive"
              onClick={this.handleImport}
              permissionList={[
                {
                  code: `srm.fin.wbs.element.ps.wbs.import`,
                  type: 'button',
                  meaning: '批量导入',
                },
              ]}
            >
              {intl.get('hzero.common.viewtitle.batchImport').d('批量导入')}
            </PermissionButton>,
            <ExcelExportPro
              data-name="newExport"
              templateCode="SMDM.WBS_EXPORT"
              otherButtonProps={{
                icon: 'unarchive',
                permissionList: [
                  {
                    code: 'srm.fin.wbs.element.button.export',
                    type: 'button',
                  },
                ],
              }}
              buttonText={
                selectedRowKeys?.length
                  ? intl.get('hzero.common.button.newSelectedExport').d('(新)勾选导出')
                  : intl.get('hzero.common.export.new').d('导出-新')
              }
              requestUrl={`${SRM_MDM}/v1/${tenantId}/wbs/wbs-ele/export-modeler`}
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
              code: 'SMDM.WBSELE.TABLE_LIST',
            },
            <Table
              bordered
              loading={loading.search}
              rowKey="wbsId"
              columns={columns}
              dataSource={list}
              pagination={pagination}
              rowSelection={rowSelection}
              onChange={(page) => this.handleSearchPeriodHeader(page)}
            />
          )}
          {modalVisible && <EditForm {...modalProps} />}
        </Content>
      </Fragment>
    );
  }
}
