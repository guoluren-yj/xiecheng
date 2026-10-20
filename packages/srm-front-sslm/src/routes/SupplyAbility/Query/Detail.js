/**
 * ReviewDetail - 供货能力评审
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Button, Row, Col, Tabs, Spin, Modal, Tag } from 'hzero-ui';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PermissionButton } from 'components/Permission';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import ReviewTable from '../Tables/ReviewTable';
import SupplierClassificationTable from '../Tables/SupplierClassificationTable';
import EnclosureTable from '../Tables/EnclosureTable';
import OperationTable from '../Tables/OperationTable';

import '../index.less';

const FormItem = Form.Item;

const customizeUnitCode =
  'SSLM.SUPPLIER_ABILITY_QUERY.DETAIL.HEADER,SSLM.SUPPLIER_ABILITY_QUERY.ITEM_TABLE';

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 供货能力评审
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplyAbility - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
 * @reactProps {boolean} operationLoading - 操作记录table加载是否完成
 * @reactProps {boolean} saving - 数据保存是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {String} organizationId - 租户Id
 * @reactProps {Function} [dispatch=function(e) {return e;}] - redux dispatch方法
 * @return React.element
 */
@connect(({ supplyAbility, user = {}, loading }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    supplyAbility,
    user,
    loading:
      loading.effects['supplyAbility/queryDetail'] ||
      loading.effects['supplyAbility/queryCategoryMaterial'],
    operationLoading: loading.effects['supplyAbility/queryOperation'],
    saving:
      loading.effects['supplyAbility/saveAll'] || loading.effects['supplyAbility/enabledFlag'],
    organizationId: getCurrentOrganizationId(),
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common', 'sslm.supplierReview', 'sslm.supplierDetail'],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FORM',
    'SSLM.SUPPLIER_ABILITY_QUERY.DETAIL.HEADER',
    'SSLM.SUPPLIER_ABILITY_QUERY.ITEM_TABLE',
    'SSLM.SUPPLIER_ABILITY_QUERY.ITEM_FILTER',
    'SSLM.SUPPLIER_ABILITY_QUERY.DETAIL_TAB',
  ],
})
export default class ReviewDetail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      headerInfo: {}, // 详细表单信息
      categoryMaterialData: {}, // 物料/品类表
      enclosureData: [], // 附件表
      supplierClassificationData: {},
      tableList: [], // 用于配置表
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    if (supplyAbilityId) {
      // 第一次加载页面不查行信息，不然个性化配了行查询条件默认值不生效，行第一次查询放在行form渲染完成查询
      this.loadData(supplyAbilityId, {}, true);
      // this.queryReviewMaterial(supplyAbilityId);
    }
  }

  /**
   * 查询数据
   * @param {Number} supplyAbilityId - 供货能力清单Id
   */
  @Bind()
  loadData(supplyAbilityId, queryParam = {}, firstOpenPage = false) {
    const { dispatch, organizationId } = this.props;
    const { page } = this.state;
    // 处理推荐物料行查询条件
    dispatch({
      type: `supplyAbility/queryDetail`,
      payload: {
        organizationId,
        supplyAbilityId,
        page,
        customizeUnitCode,
        bodyData: queryParam,
        abilityLineCode:
          'SSLM.SUPPLIER_ABILITY_QUERY.ITEM_TABLE,SSLM.SUPPLIER_ABILITY_QUERY.ITEM_FILTER',
      },
    }).then(allData => {
      const { headerInfo = {}, categoryMaterialData = {}, enclosureData = [] } = allData;
      let categoryMaterialInfo = {};
      if (!firstOpenPage) {
        categoryMaterialInfo = {
          categoryMaterialData,
        };
      }
      this.setState({
        headerInfo,
        enclosureData,
        ...categoryMaterialInfo,
      });
      if (!isEmpty(headerInfo)) {
        const { supplierCompanyId, supplierTenantId } = headerInfo;
        this.querySupplierClassification({}, supplierCompanyId, supplierTenantId);
      }
      // 查询配置表
      queryRelTableConfig('sslm_supply_ability_select').then(res => {
        this.setState({
          tableList: res,
        });
      });
    });
  }

  /**
   * 查询操作记录
   * @param {Number} supplyAbilityId 供货能力清单Id
   */
  @Bind()
  queryOperation(supplyAbilityId, pagination = {}) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'supplyAbility/queryOperation',
      payload: {
        organizationId,
        supplyAbilityId,
        page: pagination,
      },
    });
  }

  /**
   * 查询供应商分类数据
   * @param {Number} supplierCompanyId 供应商公司ID
   * @param {Number} supplierTenantId 供应商公司租户ID
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  querySupplierClassification(pagination = {}, supplierCompanyId, supplierTenantId) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: 'supplyAbility/querySupplierClassification',
      payload: { supplierCompanyId, supplierTenantId, organizationId, page: pagination },
    }).then(res => {
      this.setState({ supplierClassificationData: res });
    });
  }

  /**
   * 物料/品类表分页
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  categoryMaterialTableChange(pagination, queryParam = {}) {
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    this.setState({ page: pagination }, () => {
      this.loadData(supplyAbilityId, queryParam);
    });
  }

  /**
   * 供应商分类分页
   * @function tableChange
   * @param {Number} [pagination.page = 0] - 数据页码
   * @param {Number} [pagination.size = 10] - 分页大小
   */
  @Bind()
  tableChange(pagination) {
    const { headerInfo = {} } = this.state;
    const { supplierCompanyId, supplierTenantId } = headerInfo;
    this.querySupplierClassification(pagination, supplierCompanyId, supplierTenantId);
  }

  /**
   * 操作记录分页函数
   * @param {Number} [pagination.page = 0] - 数据页码
   * @param {Number} [pagination.size = 10] - 分页大小
   */
  @Bind()
  operationTableChange(pagination) {
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    this.queryOperation(supplyAbilityId, pagination);
  }

  /**
   * 打开或者关闭操作记录modal
   * @param {*} visible true - 打开 / false - 关闭
   */
  @Bind()
  showOperationModal(visible) {
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    if (visible) {
      this.queryOperation(supplyAbilityId);
    }
    this.setState({ visible });
  }

  /**
   * 下载文件
   * @param {Object} file 文件对象
   */
  @Bind()
  onDraggerUploadPreview(file) {
    const url = file.response;
    window.open(url, '_blank');
  }

  /**
   * 基本信息
   */
  @Bind()
  baseForm() {
    const { form, customizeForm = () => {} } = this.props;
    const { headerInfo = {} } = this.state;
    const { getFieldDecorator } = form;
    getFieldDecorator('supplierTenantId', { initialValue: headerInfo.supplierTenantId });
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_ABILITY_QUERY.DETAIL.HEADER',
        form,
        dataSource: headerInfo,
        readOnly: true,
      },
      <Form className="ued-edit-form detail-form-wrap">
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: headerInfo.supplierCompanyNum,
              })(<span>{headerInfo.supplierCompanyNum}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
            >
              {getFieldDecorator('supplierCompanyName', {
                initialValue: headerInfo.supplierCompanyName,
              })(<span>{headerInfo.supplierCompanyName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.common.view.company.name`).d('公司')}
            >
              {getFieldDecorator('companyName', {
                initialValue: headerInfo.companyName,
              })(<span>{headerInfo.companyName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
            >
              {getFieldDecorator('createUserName', {
                initialValue: headerInfo.createUserName,
              })(<span>{headerInfo.createUserName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`sslm.common.view.created.date`).d('创建日期')}
            >
              {getFieldDecorator('creationDate', {
                initialValue: headerInfo.creationDate,
              })(<span>{dateRender(headerInfo.creationDate)}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
                .d('最后更新人')}
            >
              {getFieldDecorator('lastUpdateUserName', {
                initialValue: headerInfo.lastUpdateUserName,
              })(<span>{headerInfo.lastUpdateUserName}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="read-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`)
                .d('最后更新日期')}
            >
              {getFieldDecorator('lastUpdateDate', {
                initialValue: headerInfo.lastUpdateDate,
              })(<span>{dateRender(headerInfo.lastUpdateDate)}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={12}>
            <FormItem label={intl.get(`hzero.common.remark`).d('备注')}>
              {getFieldDecorator('remark', {
                initialValue: headerInfo.remark,
              })(<span>{headerInfo.remark}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 推荐物料/品类
   */
  @Bind()
  queryCategoryMaterialData(param = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    dispatch({
      type: 'supplyAbility/queryCategoryMaterial',
      payload: {
        ...param,
        organizationId,
        supplyAbilityId,
        abilityLineCode:
          'SSLM.SUPPLIER_ABILITY_QUERY.ITEM_TABLE,SSLM.SUPPLIER_ABILITY_QUERY.ITEM_FILTER',
      },
    }).then(res => {
      if (res) {
        this.setState({ categoryMaterialData: res });
      }
    });
  }

  render() {
    const {
      loading,
      operationLoading,
      user: { currentUser = {} },
      supplyAbility: { operationData = {} },
      customizeForm,
      customizeTable,
      customizeFilterForm,
      customizeTabPane,
      tabsPrimaryColor,
      linkColor,
    } = this.props;
    const {
      visible,
      categoryMaterialData = {},
      supplierClassificationData = {},
      enclosureData = [],
      tableList,
      headerInfo,
    } = this.state;
    const { supplierCompanyId, companyId, supplyAbilityId } = headerInfo;
    // 推荐物料
    const reviewTableProps = {
      viewOnly: false,
      dataSource: categoryMaterialData,
      onTableChange: this.categoryMaterialTableChange,
      queryCategoryMaterialData: this.queryCategoryMaterialData,
      customizeForm,
      customizeTable,
      customizeFilterForm,
      customizeCode: 'SSLM.SUPPLIER_ABILITY_QUERY.ITEM_TABLE',
      filterCode: 'SSLM.SUPPLIER_ABILITY_QUERY.ITEM_FILTER',
      linkColor,
      attCustomizeCode: 'SSLM.SUPPLIER_ABILITY_QUERY.LINE_ATTACHMENT',
    };
    // 供应商分类
    const supplierClassificationTableProps = {
      dataSource: supplierClassificationData,
      onTableChange: this.tableChange,
    };
    const enclosureTableProps = {
      isOperate: false,
      isEdit: false,
      dataSource: enclosureData,
      currentUser,
    };
    const operationTableProps = {
      loading: operationLoading,
      dataSource: operationData,
      onTableChange: this.operationTableChange,
    };
    // 模型
    const modelTableProps = {
      tableList,
      relationId: supplyAbilityId,
      readOnly: true,
      parentRef: this,
      readyQuery: !isEmpty(headerInfo),
      queryParams: {
        companyId,
        supplierCompanyId,
      },
    };

    return (
      <React.Fragment>
        <Spin spinning={loading || false}>
          <Header
            title={intl.get(`sslm.supplyAbility.view.message.title.details`).d('供货能力清单明细')}
            backPath="/sslm/supplier-ablility-query/list"
          >
            <Button
              icon="clock-circle-o"
              type="primary"
              onClick={() => {
                this.showOperationModal(true);
              }}
            >
              {intl.get(`sslm.supplyAbility.view.message.operationRecord`).d('操作记录')}
            </Button>
            <PermissionButton
              icon="profile"
              onClick={() => handleSupplierDetail(headerInfo || {})}
              permissionList={[
                {
                  code: 'srm.partner.suplier-ability.supply-ability-query.ps.supplier.info',
                  type: 'button',
                  meaning: '查看供应商360信息',
                },
              ]}
            >
              {intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息')}
            </PermissionButton>
          </Header>
          <Content>
            <div className="form-info">{this.baseForm()}</div>
            {customizeTabPane(
              {
                code: 'SSLM.SUPPLIER_ABILITY_QUERY.DETAIL_TAB',
              },
              <Tabs animated={false}>
                <Tabs.TabPane
                  tab={intl
                    .get(`sslm.supplyAbility.view.message.categoryMaterialTable`)
                    .d('推荐物料/品类')}
                  key="reviewTable"
                >
                  <ReviewTable {...reviewTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get('sslm.common.view.supplier.class').d('供应商分类')}
                  key="supplierClassificationTable"
                >
                  <SupplierClassificationTable tableProps={supplierClassificationTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={
                    <span>
                      {intl.get('hzero.common.upload.modal.title').d('附件')}
                      <Tag
                        color={tabsPrimaryColor || '#108ee9'}
                        style={{
                          height: 'auto',
                          lineHeight: '15px',
                          marginLeft: '4px',
                        }}
                      >
                        {enclosureData && Array.isArray(enclosureData) ? enclosureData.length : 0}
                      </Tag>
                    </span>
                  }
                  key="enclosureTable"
                >
                  <EnclosureTable {...enclosureTableProps} />
                </Tabs.TabPane>
                {getDynamicTable(modelTableProps)}
              </Tabs>
            )}
          </Content>
        </Spin>
        <Modal
          visible={visible}
          title={intl.get(`sslm.supplyAbility.view.message.operationRecord`).d('操作记录')}
          width={700}
          footer={null}
          onCancel={() => this.showOperationModal(false)}
        >
          <OperationTable {...operationTableProps} />
        </Modal>
      </React.Fragment>
    );
  }
}
