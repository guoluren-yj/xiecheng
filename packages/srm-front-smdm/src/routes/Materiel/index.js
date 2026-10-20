/**
 * materiel - 物料定义
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Button, Table, Modal, Tooltip } from 'hzero-ui';
import { Menu, Dropdown, Icon } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty, isFunction } from 'lodash';
// import qs from 'querystring';

import CommentImport from 'hzero-front-himp/lib/components/CommonImport';
import { Header, Content } from 'components/Page';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import formatterCollections from 'utils/intl/formatterCollections';
import { enableRender, dateTimeRender } from 'utils/renderer';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_MDM } from '_utils/config';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import CommonImport from 'hzero-front/lib/components/Import';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { Button as PermissionButton } from 'components/Permission';
// import { openTab } from 'utils/menuTab';
import { observer } from 'mobx-react-lite';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import DynamicButtons from '_components/DynamicButtons';

import { queryPermissions } from '@/services/purchaseCategoryService';
import FilterForm from './FilterForm';
import styles from './index.less';
/**
 * 物料定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} materiel - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch= e=>e] - redux dispatch方法
 * @return React.element
 */
@withCustomize({
  unitCode: [
    'SMDM_MATERIEL_LIST.MATERIEL_LIST',
    'SMDM_MATERIEL_EDIT.MATERIEL_DETAIL',
    'SMDM_MATERIEL_LIST.SEARCH',
    'SMDM_MATERIEL_LIST.BTNS',
  ],
})
@connect(({ materiel, loading }) => ({
  materiel,
  loading: loading.effects['materiel/fetchMaterialData'],
  organizationId: getCurrentOrganizationId(),
}))
@formatterCollections({
  code: [
    'smdm.materiel',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'smdm.common',
    'hzero.common',
  ],
})
@cuxRemote(
  {
    code: 'SMDM_MATRAIAL_LIST',
    name: 'remote',
  },
  {
    process: {
      handleImportParam: undefined,
      cuxHandeleQueryParams: undefined,
      cuxCloumns: undefined,
      cuxHeadBtns: undefined,
    },
  }
)
export default class Materiel extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    this.state = {
      tenantId: getCurrentOrganizationId(),
      importPermissions: {},
      btnLoading: false,
    };
  }

  componentDidMount() {
    const {
      dispatch,
      materiel: { pagination = {} },
      custLoading,
    } = this.props;
    this.queryFlagList();
    dispatch({
      type: 'materiel/updateState',
      payload: {
        materielDetail: {}, // 物料详情表单数据
        attributeData: [], // 自定义物品属性数据
        partnerData: {}, // 客户物品数据
        categoryData: [], // 自主品类
        affliatedData: {}, // 所属组织
        enclosureDataSource: [], // 附件
      },
    });
    this.getImportPermissions();
    if (!custLoading) {
      this.handleMaterialData(pagination);
    }
  }

  componentDidUpdate(prevProps) {
    const {
      custLoading,
      materiel: { pagination = {} },
    } = this.props;

    const custLoadingChange = prevProps.custLoading !== custLoading && !custLoading;
    if (custLoadingChange) {
      this.handleMaterialData(pagination);
    }
  }

  getImportPermissions = () => {
    const importCodeList = [
      'srm.bg.manager.mdm.materiel.ps.new.item.assign.cate.org.import',
      'srm.bg.manager.mdm.materiel.ps.new.item.import',
      'srm.bg.manager.mdm.materiel.ps.new.item.batch.invalid.import',
    ];

    queryPermissions(importCodeList).then((res) => {
      if (res && !res.failed) {
        const importPermissions = {};
        res.forEach((item) => {
          if (item.code === 'srm.bg.manager.mdm.materiel.ps.new.item.assign.cate.org.import') {
            importPermissions.list = item;
          } else if (item.code === 'srm.bg.manager.mdm.materiel.ps.new.item.import') {
            importPermissions.item = item;
          } else if (item.code === 'srm.bg.manager.mdm.materiel.ps.new.item.batch.invalid.import') {
            importPermissions.batchInvalid = item;
          }
        });
        this.setState({ importPermissions });
      }
    });
  };

  /**
   * 物料数据查询
   * @param {object} payload - 查询参数
   */
  @Bind()
  handleMaterialData(payload = {}, _, sorter) {
    this.setState({
      importVisible: false,
    });
    const { dispatch, organizationId, remote } = this.props;
    const { cuxHandeleQueryParams } = remote?.props?.process || {};
    const cuxParams =
      typeof cuxHandeleQueryParams === 'function' ? cuxHandeleQueryParams({ sorter }) : {};
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    dispatch({
      type: 'materiel/fetchMaterialData',
      payload: {
        organizationId,
        page: isEmpty(payload) ? {} : payload,
        ...filterValues,
        itemCodeMultiSelect: Array.from(new Set(filterValues?.itemCodeMultiSelect || []))?.join(
          ','
        ),
        lastUpdateDateFrom: filterValues.lastUpdateDateFrom
          ? filterValues.lastUpdateDateFrom.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        lastUpdateDateTo: filterValues.lastUpdateDateTo
          ? filterValues.lastUpdateDateTo.format(DEFAULT_DATETIME_FORMAT)
          : undefined,
        ...cuxParams,
        customizeUnitCode:
          'SMDM_MATERIEL_LIST.MATERIEL_LIST,SMDM_MATERIEL_EDIT.MATERIEL_DETAIL,SMDM_MATERIEL_LIST.SEARCH',
      },
    });
  }

  /**
   * 查询是否值集
   */
  @Bind()
  queryFlagList() {
    const { dispatch } = this.props;
    dispatch({ type: 'materiel/queryFlagList' });
  }

  /**
   *
   * @param {object} ref - FilterForm子组件对象
   */
  @Bind()
  handleBindRef(ref = {}) {
    // this.setState({ form: ref.props.form });
    this.filterForm = ref.props.form;
  }

  @Bind()
  setBtnLoading(flag) {
    this.setState({ btnLoading: flag });
  }

  /**
   * 物料数据编辑/新增
   * @param {string} itemId - 物料Id
   */
  @Bind()
  handleGoDetail(itemId = '') {
    if (itemId) {
      this.props.history.push(`/smdm/materiel/detail/${itemId}`);
    } else {
      this.props.history.push('/smdm/materiel/create');
    }
  }

  /**
   * 获取form数据
   */
  @Bind()
  handleGetFormValue() {
    const form = this.filterForm;
    const filterValues = isUndefined(form) ? {} : filterNullValueObject(form.getFieldsValue());
    return {
      ...filterValues,
      lastUpdateDateFrom: filterValues.lastUpdateDateFrom
        ? filterValues.lastUpdateDateFrom.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      lastUpdateDateTo: filterValues.lastUpdateDateTo
        ? filterValues.lastUpdateDateTo.format(DEFAULT_DATETIME_FORMAT)
        : undefined,
      customizeUnitCode: 'SMDM_MATERIEL_EDIT.MATERIEL_DETAIL,SMDM_MATERIEL_LIST.SEARCH',
    };
  }

  @Bind()
  redirectImportCreation(templateCode, type) {
    const { tenantId } = this.state;
    const { handleImportParam } = this.props?.remote?.props?.process ?? {};
    let retitle = '';
    switch (type) {
      case 'itemCodeImport':
        retitle = intl.get('smdm.materiel.view.option.itemCodeImport').d('物料头信息导入');
        break;
      case 'demandImport':
        retitle = intl.get('smdm.materiel.view.option.demandImport').d('需求执行人导入');
        break;
      case 'categoryOrigin':
        retitle = intl.get('smdm.materiel.view.option.categoryAndOrigin').d('品类和所属组织导入');
        break;
      case 'itemVoidImport':
        retitle = intl.get(`smdm.materiel.view.option.itemVoidImport`).d('物料作废');
        break;
      default:
        break;
    }
    this.importProps = {
      code: templateCode,
      sync: false,
      auto: false,
      prefixPatch: undefined,
      args: JSON.stringify({
        tenantId,
        templateCode,
        oldImportFlag: handleImportParam ? 1 : undefined,
      }),
      autoRefreshInterval: 5000,
      backPath: undefined,
      tenantId, // 租户的传
      action: retitle,
      key: `/smdm/purchase/category/import/${templateCode}`,
    };
    this.setState({
      importVisible: !this.state.importVisible,
    });
  }

  /**
   * 商品图片导入
   */
  @Bind()
  handleImgImport = () => {
    const path = '/smdm/materiel/img-import';
    this.props.history.push(path);
  };

  /**
   * render
   * @returns React.element
   */
  render() {
    const { btnLoading } = this.state;
    const {
      materiel: {
        materielData = {},
        pagination = {},
        flagList = [],
        yesOrNoList = [],
        dimensionQcList = [],
      },
      loading,
      organizationId,
      customizeFilterForm,
      customizeTable,
      customizeBtnGroup,
      remote,
    } = this.props;
    const { cuxCloumns } = remote?.props?.process || {};
    const { handleImportParam } = this.props?.remote?.props?.process ?? {};
    const { content = [] } = materielData;
    const filterProps = {
      flagList,
      yesOrNoList,
      dimensionQcList,
      customizeFilterForm,
      onSearch: this.handleMaterialData,
      onRef: this.handleBindRef,
    };
    const columns = [
      {
        title: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
        dataIndex: 'itemCode',
        width: 200,
        render: (text, record) => <a onClick={() => this.handleGoDetail(record.itemId)}>{text}</a>,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码'),
        dataIndex: 'originItemCode',
        width: 200,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
        dataIndex: 'itemName',
        render: (text) => (
          <Tooltip placement="topLeft" title={text}>
            {text}
          </Tooltip>
        ),
        width: 350,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.specifications').d('规格'),
        dataIndex: 'specifications',
        width: 100,
      },
      {
        title: intl.get('smdm.materiel.model.materiel.model').d('型号'),
        dataIndex: 'model',
        width: 100,
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.itemNumber`).d('云平台物料编码'),
        width: 150,
        dataIndex: 'itemNumber',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.commonName`).d('通用名'),
        width: 200,
        dataIndex: 'commonName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.categoryNameType`).d('平台分类'),
        width: 100,
        dataIndex: 'categoryName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位'),
        width: 150,
        dataIndex: 'uomName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lastUpdatedName`).d('最后更新人'),
        width: 100,
        dataIndex: 'lastUpdatedName',
      },
      {
        title: intl.get(`smdm.materiel.model.materiel.lastUpdateDate`).d('最后更新时间'),
        width: 150,
        dataIndex: 'lastUpdateDate',
        render: (val) => dateTimeRender(val),
      },
      {
        title: intl.get('smdm.materiel.model.common.externalSystemCode').d('外部来源系统编码'),
        width: 100,
        align: 'center',
        dataIndex: 'externalSystemCode',
      },
      {
        title: intl.get('smdm.materiel.model.materiel.dimensionQc').d('质量维度管理'),
        width: 100,
        align: 'center',
        dataIndex: 'dimensionQcMeaning',
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 75,
        align: 'center',
        dataIndex: 'enabledFlag',
        render: (val) => ['0', 0, '1', 1].includes(val) ? enableRender(Number(val)) : val,
      },
    ];
    const newColumns = typeof cuxCloumns === 'function' ? cuxCloumns({ columns, current: this }) : columns;
    const otherButtonProps = {
      type: 'c7n-pro',
      icon: 'unarchive',
    };
    const { tenantId, importPermissions } = this.state;

    const HeaderBtn = observer(() => {
      const { remote } = this.props;
      const { cuxHeadBtns } = remote?.props?.process || {};
      const headerButtons = [
        {
          name: 'create',
          noNest: true,
          btnProps: { onClick: () => this.handleGoDetail() },
          child: (
            <Button icon="plus" type="primary" onClick={() => this.handleGoDetail()}>
              {intl.get('hzero.common.button.create').d('新建')}
            </Button>
          ),
        },
        {
          name: 'newExport',
          btnComp: ExcelExportPro,
          btnType: 'c7n-pro',
          btnProps: {
            templateCode: 'SRM_SMDM_ITEM_LIST_EXPORT',
            otherButtonProps: {
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.materiel.ps.new.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText: intl.get('hzero.common.export.new').d('导出-新'),
            requestUrl: `${SRM_MDM}/v1/${organizationId}/items-materiel/export`,
            queryParams: this.handleGetFormValue(),
          },
        },
        {
          name: 'export',
          btnComp: ExcelExport,
          btnType: 'c7n-pro',
          btnProps: {
            exportAsync: true,
            otherButtonProps: {
              ...otherButtonProps,
              permissionList: [
                {
                  code: 'srm.bg.manager.mdm.materiel.ps.list.export',
                  type: 'button',
                },
              ],
            },
            buttonText: intl.get('hzero.common.button.export').d('导出'),
            requestUrl: `${SRM_MDM}/v1/${organizationId}/items-materiel/export`,
            queryParams: this.handleGetFormValue(),
          },
        },
        {
          name: 'lineImport',
          noNest: true,
          btnProps: {
            onClick: () =>
              this.redirectImportCreation('SMDM.ITEM_ASSIGN_CATE_ORG', 'categoryOrigin'),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.materiel.ps.item.assign.cate.org.import`,
                  type: 'button',
                  meaning: '品类和所属组织导入',
                },
              ]}
              onClick={() =>
                this.redirectImportCreation('SMDM.ITEM_ASSIGN_CATE_ORG', 'categoryOrigin')
              }
            >
              {handleImportParam
                ? intl.get('smdm.materiel.view.option.itemLineCreateImport').d('物料行新建导入')
                : intl.get('smdm.materiel.view.option.categoryAndOrigin').d('物料行信息导入')}
            </PermissionButton>
          ),
        },
        {
          name: 'headerImport',
          noNest: true,
          btnProps: {
            onClick: () => this.redirectImportCreation('SMDM.ITEM_IMPORT', 'itemCodeImport'),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.materiel.ps.item.import`,
                  type: 'button',
                  meaning: '物料头信息导入',
                },
              ]}
              onClick={() => this.redirectImportCreation('SMDM.ITEM_IMPORT', 'itemCodeImport')}
            >
              {handleImportParam
                ? intl.get('smdm.materiel.view.option.itemHeaderCreateImport').d('物料头新建导入')
                : intl.get('smdm.materiel.view.option.itemCodeImport').d('物料头信息导入')}
            </PermissionButton>
          ),
        },
        {
          name: 'itemVoidImport',
          noNest: true,
          btnProps: {
            onClick: () => this.redirectImportCreation('SMDM.ITEM_BATCH_INVALID', 'itemVoidImport'),
          },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.materiel.ps.item.batch.invalid.import`,
                  type: 'button',
                  meaning: '物料作废',
                },
              ]}
              onClick={() =>
                this.redirectImportCreation('SMDM.ITEM_BATCH_INVALID', 'itemVoidImport')
              }
            >
              {intl.get(`smdm.materiel.view.option.itemVoidImport`).d('物料作废')}
            </PermissionButton>
          ),
        },
        {
          name: 'imgImport',
          noNest: true,
          btnProps: { onClick: this.handleImgImport },
          child: (
            <PermissionButton
              type="c7n-pro"
              icon="archive"
              onClick={this.handleImgImport}
              permissionList={[
                {
                  code: `srm.bg.manager.mdm.materiel.button.imgImport`,
                  type: 'button',
                },
              ]}
            >
              {intl.get('smdm.materiel.view.option.imgImport').d('物料图片导入')}
            </PermissionButton>
          ),
        },
      ];

      if (
        !(
          importPermissions?.list?.controllerType === 'hidden' &&
          importPermissions?.item?.controllerType === 'hidden' &&
          importPermissions?.batchInvalid?.controllerType === 'hidden'
        )
      ) {
        headerButtons.push({
          name: 'newImport',
          noNest: true,
          child: (
            <Dropdown
              overlay={
                <Menu className={styles.menu}>
                  {importPermissions?.list &&
                    importPermissions?.list?.approve === false &&
                    importPermissions?.list?.controllerType === 'hidden' ? (
                      <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM.ITEM_ASSIGN_CATE_ORG"
                        args={{
                          tenantId,
                          templateCode: 'SMDM.ITEM_ASSIGN_CATE_ORG',
                        }}
                        buttonProps={{
                          disabled:
                            importPermissions?.list &&
                            importPermissions?.list?.approve === false &&
                            importPermissions?.list?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.materiel.ps.new.item.assign.cate.org.import`,
                          //     type: 'button',
                          //     meaning: '品类和所属组织导入',
                          //   },
                          // ],
                        }}
                        buttonText={
                          handleImportParam
                            ? intl
                              .get('smdm.materiel.view.option.itemLineUpdateImport')
                              .d('物料行更新导入')
                            : intl
                              .get('smdm.materiel.view.option.categoryAndOrigin')
                              .d('物料行信息导入')
                        }
                      />
                    </Menu.Item>
                  )}

                  {importPermissions?.item &&
                    importPermissions?.item?.approve === false &&
                    importPermissions?.item?.controllerType === 'hidden' ? (
                      <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM.ITEM_IMPORT"
                        args={{
                          tenantId,
                          templateCode: 'SMDM.ITEM_IMPORT',
                        }}
                        buttonProps={{
                          disabled:
                            importPermissions?.item &&
                            importPermissions?.item?.approve === false &&
                            importPermissions?.item?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.materiel.ps.new.item.import`,
                          //     type: 'button',
                          //     meaning: '物料头信息导入',
                          //   },
                          // ],
                        }}
                        buttonText={
                          handleImportParam
                            ? intl
                              .get('smdm.materiel.view.option.itemHeaderUpdateImport')
                              .d('物料头更新导入')
                            : intl
                              .get('smdm.materiel.view.option.itemCodeImport')
                              .d('物料头信息导入')
                        }
                      />
                    </Menu.Item>
                  )}
                  {importPermissions?.batchInvalid &&
                    importPermissions?.batchInvalid?.approve === false &&
                    importPermissions?.batchInvalid?.controllerType === 'hidden' ? (
                      <></>
                  ) : (
                    <Menu.Item>
                      <CommonImport
                        prefixPatch="/smdm"
                        businessObjectTemplateCode="SMDM.ITEM_BATCH_INVALID"
                        args={{
                          tenantId,
                          templateCode: 'SMDM.ITEM_BATCH_INVALID',
                        }}
                        buttonProps={{
                          disabled:
                            importPermissions?.batchInvalid &&
                            importPermissions?.batchInvalid?.approve === false &&
                            importPermissions?.batchInvalid?.controllerType !== 'hidden',
                          // permissionList: [
                          //   {
                          //     code: `srm.bg.manager.mdm.materiel.ps.new.item.batch.invalid.import`,
                          //     type: 'button',
                          //     meaning: '物料作废',
                          //   },
                          // ],
                        }}
                        buttonText={intl
                          .get(`smdm.materiel.view.option.itemVoidImport`)
                          .d('物料作废')}
                      />
                    </Menu.Item>
                  )}
                </Menu>
              }
            >
              <PermissionButton
                type="c7n-pro"
                icon="archive"
                className={styles['srm-common-new-button']}
              >
                {intl.get(`hzero.common.import.new`).d('导入-新')}
                <Icon type="expand_more" />
                <span className={styles['srm-common-export-button-tag']}>NEW</span>
              </PermissionButton>
            </Dropdown>
          ),
        });
      }
      const processBtns = isFunction(cuxHeadBtns)
        ? cuxHeadBtns(headerButtons, {
          btnLoading,
          setBtnLoading: this.setBtnLoading,
          onQueryList: this.handleMaterialData,
        })
        : headerButtons;
      return (
        <>
          {customizeBtnGroup(
            {
              code: 'SMDM_MATERIEL_LIST.BTNS',
              pro: true,
            },
            <DynamicButtons buttons={processBtns} />
          )}
        </>
      );
    });

    return (
      <React.Fragment>
        <Header title={intl.get(`smdm.materiel.view.message.title.list`).d('物料管理')}>
          <HeaderBtn />
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...filterProps} />
          </div>
          {customizeTable(
            {
              code: 'SMDM_MATERIEL_LIST.MATERIEL_LIST',
            },
            <Table
              bordered
              rowKey="itemId"
              loading={loading}
              dataSource={content}
              columns={newColumns}
              pagination={pagination}
              onChange={this.handleMaterialData}
            />
          )}
          {this.state.importVisible && (
            <Modal
              width={1200}
              destroyOnClose
              visible
              onCancel={() => {
                this.setState({ importVisible: false });
              }}
              afterClose={() => this.creation.current.handleFetchList()}
              footer={
                <Button onClick={this.handleMaterialData} type="primary">
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>
              }
            >
              <CommentImport {...this.importProps} />
            </Modal>
          )}
        </Content>
      </React.Fragment>
    );
  }
}
