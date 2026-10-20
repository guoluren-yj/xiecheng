/**
 * ReviewDetail - 供货能力评审
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { connect } from 'dva';
import { isEmpty, concat } from 'lodash';
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import qs from 'querystring';
import { Form, Row, Col, Input, Tabs, Spin, Modal, Tag } from 'hzero-ui';

import intl from 'utils/intl';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import notification from 'utils/notification';
import { PRIVATE_BUCKET } from '_utils/config';
import { Header, Content } from 'components/Page';
import remote from 'hzero-front/lib/utils/remote';
import { dateRender } from 'utils/renderer';
import { getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import { getDynamicTable } from '@/routes/components/DynamicTable';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import HeaderBtns from './HeaderBtns';
import ReviewTable from '../Tables/ReviewTable';
import EnclosureTable from '../Tables/EnclosureTable';
import SupplierClassificationTable from '../Tables/SupplierClassificationTable';

const FormItem = Form.Item;
const { TextArea } = Input;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const customizeUnitCode =
  'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_TABLE,SSLM.SUPPLIER_ABILITY_REVIEW.DETAIL.HEADER';

/**
 * 供货能力评审
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplyAbility - 数据源
 * @reactProps {Boolean} loading - 数据加载是否完成
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
    saving:
      loading.effects['supplyAbility/saveAll'] || loading.effects['supplyAbility/enabledFlag'],
    submitLoading:
      loading.effects['supplyAbility/handleValidate'] ||
      loading.effects['supplyAbility/submitLines'],
    organizationId: getCurrentOrganizationId(),
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'smdm.supplyAbility',
    'sslm.supplyAbility',
    'sslm.common',
    'sslm.supplierReview',
    'sslm.supplierDetail',
  ],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FORM',
    'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_TABLE',
    'SSLM.SUPPLIER_ABILITY_REVIEW.DETAIL.HEADER',
    'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FILTER',
    'SSLM.SUPPLIER_ABILITY_REVIEW.DETAIL_TAB',
    'SSLM.SUPPLIER_ABILITY_REVIEW.HEADER_BTNS',
  ],
})
@remote(
  {
    code: 'SSLM.SUPPLY_ABILITY_REVIEW',
    name: 'reviewRemote',
  },
  {
    events: {
      cuxHandleSubmit() {}, // 二开提交审批按钮逻辑
    },
  }
)
export default class ReviewDetail extends PureComponent {
  constructor(props) {
    super(props);
    const isPub = props.match.path.includes('/pub/');
    const routerParam = qs.parse(props.location.search.substr(1));
    const { abilityLineIds, sourceType } = routerParam;
    this.state = {
      sourceType,
      reviewSelectedRows: [], // 推荐物料/品类选中行
      isPub,
      abilityLineIds,
      headerInfo: {}, // 详细表单信息
      categoryMaterialData: {}, // 物料/品类表
      enclosureData: [], // 附件表
      supplierClassificationData: {},
      tableList: [], // 用于配置表
      cuxLoading: false, // 二开按钮loading
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
    // 查询配置表
    queryRelTableConfig('sslm_supply_ability_review').then(res => {
      this.setState({
        tableList: res,
      });
    });
  }

  /**
   * 查询数据
   * @param {Number} supplyAbilityId - 供货能力清单Id
   */
  @Bind()
  loadData(supplyAbilityId, queryParam = {}, firstOpenPage = false) {
    const { dispatch, organizationId, reviewRemote } = this.props;
    const { page, isPub, abilityLineIds } = this.state;
    const standardParam = {};
    // 埋点增加查询参数
    const remoteParam = reviewRemote
      ? reviewRemote.process('SSLM.SUPPLY_ABILITY_REVIEW_DETAIL.PARAMS', standardParam, {})
      : standardParam;
    const { itemCategoryParam = {} } = remoteParam || {};
    // 处理推荐物料行查询条件
    dispatch({
      type: `supplyAbility/queryDetail`,
      payload: {
        organizationId,
        supplyAbilityId,
        page,
        bodyData: {
          ...itemCategoryParam,
          ...queryParam,
          abilityLineIds: isPub ? abilityLineIds : undefined,
        },
        customizeUnitCode,
        abilityLineCode:
          'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_TABLE,SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FILTER',
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
    });
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
      reviewRemote,
    } = this.props;
    const { isPub, abilityLineIds } = this.state;
    const { bodyData = {}, ...others } = param;
    const standardParam = {};
    // 埋点增加查询参数
    const remoteParam = reviewRemote
      ? reviewRemote.process(
          'SSLM.SUPPLY_ABILITY_REVIEW_DETAIL.ITEM_CATEGORY.PARAMS',
          standardParam,
          {}
        )
      : standardParam;
    dispatch({
      type: 'supplyAbility/queryCategoryMaterial',
      payload: {
        ...others,
        bodyData: {
          ...remoteParam,
          ...bodyData,
          abilityLineIds: isPub ? abilityLineIds : undefined,
        },
        organizationId,
        supplyAbilityId,
        abilityLineCode:
          'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_TABLE,SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FILTER',
      },
    }).then(res => {
      if (res) {
        this.setState({ categoryMaterialData: res });
      }
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
   * 表格分页
   * @param {Number} [params.page = 0] - 数据页码
   * @param {Number} [params.size = 10] - 分页大小
   */
  @Bind()
  reviewTableChange(pagination, queryParam = {}) {
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
   * 保存数据到前端页面
   * @param {Array<object>} dataList 更新的数据
   * @param {string} dataName 该保存的数据字符串
   * @param {boolean} isPaging 该表格是否支持分页
   */
  @Bind()
  addTableData(dataList, dataName, isPaging) {
    if (isPaging) {
      this.setState({
        [dataName]: {
          ...this.state[dataName],
          content: dataList,
          totalElements: this.state[dataName].totalElements
            ? this.state[dataName].totalElements + 1
            : 1,
        },
      });
    } else {
      this.setState({
        [dataName]: dataList,
      });
    }
  }

  /**
   * 删除数据以及表格中的数据
   * @param {Function} localRows 本地更新的函数
   * @param {array} idList id列表
   * @param {string} functionName 删除函数的名字
   * @param {string} dataName 该保存的数据字符串
   * @param {boolean} isPaging 该表格是否支持分页
   */
  @Bind()
  deleteTableData(localRows, idList, functionName, dataName, isPaging) {
    // itemLineIdList
    const { dispatch, organizationId } = this.props;
    if (!isEmpty(idList)) {
      dispatch({
        type: `supplyAbility/${functionName}`,
        payload: {
          idList,
          organizationId,
        },
      }).then(res => {
        if (res) {
          notification.success();
        }
      });
    }
    const urls = localRows.filter(item => item.attachmentUrl);
    if (!isEmpty(urls)) {
      dispatch({
        type: 'supplyAbility/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'smdm-supplyAbility',
          urls,
        },
      });
    }
    if (isPaging) {
      this.setState({
        [dataName]: {
          ...this.state[dataName],
          content: localRows,
          totalElements: this.state[dataName].totalElements - 1,
        },
      });
    } else {
      this.setState({
        [dataName]: localRows,
      });
    }
  }

  /**
   * 校验模型表数据
   */
  @Bind()
  checkModelTableData() {
    const { tableList } = this.state;
    let checkModelTableFlag = true;
    let modelDatas = [];
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        const tableData = this[n.tableCode].checkData();
        if (checkModelTableFlag) {
          checkModelTableFlag = tableData;
        }
        if (tableData) {
          modelDatas = concat(modelDatas, tableData);
        }
      }
    });
    if (!checkModelTableFlag) {
      return false;
    } else {
      return modelDatas;
    }
  }

  /**
   * 保存所有数据
   */
  @Bind()
  handleSave() {
    const {
      form,
      dispatch,
      organizationId,
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    const { headerInfo } = this.state;
    form.validateFields((err, formData) => {
      if (!err) {
        // 校验模型表
        const modelDatas = this.checkModelTableData();
        if (!modelDatas) {
          return;
        }
        dispatch({
          type: 'supplyAbility/saveAll',
          payload: {
            ...headerInfo,
            organizationId,
            ...formData,
            optional: false,
            customizeUnitCode,
            modelDatas,
          },
        }).then(res => {
          if (res) {
            this.loadData(supplyAbilityId);
            this.fetchModelTableData(supplyAbilityId);
            notification.success();
          }
        });
      }
    });
  }

  @Bind()
  setLoading(flag) {
    this.setState({ cuxLoading: flag });
  }

  @Bind()
  submitCallback(payload, supplyAbilityId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplyAbility/submitLines',
      payload,
    }).then(r => {
      if (r) {
        this.clearRows();
        this.setState({ reviewSelectedRows: [] });
        this.loadData(supplyAbilityId);
        this.fetchModelTableData(supplyAbilityId);
        notification.success();
      }
    });
  }

  @Bind()
  handleRefresh(supplyAbilityId) {
    this.clearRows();
    this.setState({ reviewSelectedRows: [] });
    this.loadData(supplyAbilityId);
    this.fetchModelTableData(supplyAbilityId);
  }

  /**
   * 提交
   */
  @Bind()
  handleSubmit() {
    const {
      form,
      organizationId,
      reviewRemote,
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    const { reviewSelectedRows = [], headerInfo = {} } = this.state;
    form.validateFields((err, formData) => {
      if (!err) {
        const supplyAbilityLines = reviewSelectedRows.filter(item => item.abilityLineId);
        // 校验模型表
        const modelDatas = this.checkModelTableData();
        if (!modelDatas) {
          return;
        }
        const payload = {
          ...headerInfo,
          supplyAbilityLines,
          organizationId,
          ...formData,
          supplyAbilityId,
          customizeUnitCode,
          modelDatas,
        };
        const eventProps = {
          form,
          payload,
          supplyAbilityId,
          setLoading: this.setLoading,
          onSubmit: this.submitCallback,
          onRefresh: this.handleRefresh,
        };
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
          onOk: async () => {
            if (reviewRemote && reviewRemote.event) {
              // 默认返回true,当返回false时走二开逻辑不走标准逻辑
              const res = await reviewRemote.event.fireEvent('cuxHandleSubmit', eventProps);
              if (!res) {
                return;
              }
            }
            this.submitCallback(payload, supplyAbilityId);
          },
        });
      }
    });
  }

  /**
   * 查询模型表数据
   */
  @Bind()
  fetchModelTableData(reqId) {
    const { tableList } = this.state;
    tableList.forEach(n => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable({}, reqId);
      }
    });
  }

  /**
   * 保存推荐物料/品类
   */
  @Bind()
  handleReviewSave(savaData = {}, closeFun = e => e) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    const { headerInfo } = this.state;
    const supplyAbilityLines = [{ ...savaData }];
    dispatch({
      type: 'supplyAbility/saveAll',
      payload: {
        ...headerInfo,
        supplyAbilityLines,
        organizationId,
        optional: false,
        customizeUnitCode,
      },
    }).then(res => {
      if (res) {
        this.loadData(supplyAbilityId);
        closeFun();
        notification.success();
      }
    });
  }

  /**
   * 附件弹窗关闭之后查询推荐物料/品类
   * @param {Number} supplyAbilityId - 供货能力清单Id
   */
  @Bind()
  handleloadData() {
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    if (supplyAbilityId) {
      this.loadData(supplyAbilityId);
    }
  }

  /**
   * 推荐物料选中行改变
   */
  @Bind()
  handleReviewSelectChange(reviewSelectedRows) {
    this.setState({ reviewSelectedRows });
  }

  /**
   * 保存Uuid
   */
  @Bind()
  saveUuid(attachmentUUID, abilityLineId) {
    const { categoryMaterialData = {} } = this.state;
    const { content = [] } = categoryMaterialData;
    const newCategoryMaterialData = content.map(item => {
      if (item.abilityLineId === abilityLineId) {
        return { ...item, attachmentUuid: attachmentUUID };
      } else {
        return item;
      }
    });
    this.setState({
      categoryMaterialData: { ...categoryMaterialData, content: newCategoryMaterialData },
    });
  }

  /**
   * 基本信息
   */
  @Bind()
  baseForm() {
    const { form, customizeForm = () => {} } = this.props;
    const { isPub, headerInfo = {} } = this.state;
    const { getFieldDecorator } = form;
    getFieldDecorator('supplierTenantId', { initialValue: headerInfo.supplierTenantId });
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_ABILITY_REVIEW.DETAIL.HEADER',
        form,
        dataSource: headerInfo,
        readOnly: isPub,
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
              label={intl.get(`sslm.common.view.creator.name`).d('创建人')}
            >
              {getFieldDecorator('createUserName', {
                initialValue: headerInfo.createUserName,
              })(<span>{headerInfo.createUserName}</span>)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get(`hzero.common.date.creation`).d('创建日期')}
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
              })(<TextArea disabled={isPub} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      loading,
      saving,
      submitLoading,
      user: { currentUser = {} },
      customizeForm,
      customizeTable,
      customizeFilterForm,
      customizeTabPane,
      tabsPrimaryColor,
      linkColor,
      customizeBtnGroup,
    } = this.props;
    const {
      sourceType,
      reviewSelectedRows,
      isPub,
      categoryMaterialData = {},
      supplierClassificationData = {},
      enclosureData = [],
      tableList,
      headerInfo,
      cuxLoading,
    } = this.state;
    const { supplierCompanyId, companyId, supplyAbilityId } = headerInfo;
    // 推荐物料
    const reviewTableProps = {
      isEdit: true,
      viewOnly: true,
      isReview: true,
      isPub,
      dataSource: categoryMaterialData,
      optional: false,
      onTableChange: this.reviewTableChange,
      onAdd: this.addTableData,
      onUpload: this.saveUuid,
      onSelectChange: this.handleReviewSelectChange,
      onClearRows: ref => {
        this.clearRows = ref;
      },
      handleReviewSave: this.handleReviewSave,
      handleAttrChange: this.handleloadData,
      queryCategoryMaterialData: this.queryCategoryMaterialData,
      customizeForm,
      customizeTable,
      customizeFilterForm,
      customizeCode: 'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_TABLE',
      filterCode: 'SSLM.SUPPLIER_ABILITY_REVIEW.ITEM_FILTER',
      linkColor,
      attCustomizeCode: 'SSLM.SUPPLIER_ABILITY_REVIEW.LINE_ATTACHMENT',
    };
    // 供应商分类
    const supplierClassificationTableProps = {
      dataSource: supplierClassificationData,
      onTableChange: this.tableChange,
    };
    const enclosureTableProps = {
      currentUser,
      isOperate: false,
      dataSource: enclosureData,
    };
    // 模型
    const modelTableProps = {
      tableList,
      relationId: supplyAbilityId,
      parentRef: this,
      readyQuery: !isEmpty(headerInfo),
      queryParams: {
        companyId,
        supplierCompanyId,
      },
    };
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const allLoading = loading || submitLoading || cuxLoading || saving;
    return (
      <React.Fragment>
        <Spin spinning={allLoading || false}>
          <Header
            title={intl
              .get(`sslm.supplyAbility.view.message.title.detail.edit`)
              .d('供货能力清单编辑')}
            backPath={isPub ? '' : '/sslm/supplier-ablility-review/list'}
          >
            <HeaderBtns
              isPub={isPub}
              loading={allLoading}
              headerInfo={headerInfo}
              sourceType={sourceType}
              onSave={this.handleSave}
              onSubmit={this.handleSubmit}
              customizeBtnGroup={customizeBtnGroup}
              onSupplierDetail={handleSupplierDetail}
              reviewSelectedRows={reviewSelectedRows}
            />
          </Header>
          <Content>
            <div style={{ padding: '0 16px' }}>{this.baseForm()}</div>
            {customizeTabPane(
              {
                code: 'SSLM.SUPPLIER_ABILITY_REVIEW.DETAIL_TAB',
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
      </React.Fragment>
    );
  }
}
