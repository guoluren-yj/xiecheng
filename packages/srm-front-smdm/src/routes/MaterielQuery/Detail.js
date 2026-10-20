/*
 * @Description: 物料查询
 * @Date: 2020-05-08 17:26:41
 * @Author: HJ <jinhuang02@hand-china.com>
 * @Copyright: Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Form, Row, Col, Tabs, Spin, Collapse, Button, Modal, Icon, Tooltip } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '_utils/config';

import { Header, Content } from 'components/Page';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';

import { getCurrentOrganizationId, getAccessToken, createPagination } from 'utils/utils';
import intl from 'utils/intl';
import { isNil, isFunction } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import formatterCollections from 'utils/intl/formatterCollections';

import SrmUpload from 'srm-front-boot/lib/components/Upload/index';
import notification from 'utils/notification';
import { queryOperation } from '@/services/materielService';
import AttributeTable from './Tables/AttributeTable';
import PartnerTable from './Tables/PartnerTable';
import CategoryTable from './Tables/CategoryTable';
import AffiliatedOrgTable from './Tables/AffiliatedOrgTable';
import EnclosureTable from './Tables/EnclosureTable';
import ItemOrgUomTable from './Tables/ItemOrgUomTable';
import VersionTable from './Tables/VersionTable';
import ComponentTable from './Tables/ComponentTable';
import DrawInfoTable from './Tables/DrawInfoTable';
import OperationModel from '../Materiel/OperationModel';

import styles from './index.less';

const FormItem = Form.Item;

/**
 * 物料定义详情
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
@remote(
  {
    code: 'SMDM_ITEM_QUERY_DETAIL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      disableCompentPrecision: undefined,
    },
    events: {
      handleCuxWorkflowSubmit() {},
    },
  }
)
@WithCustomize({
  unitCode: [
    'SMDM_MATERIELQUERY_DETAIL.BASEINFO',
    'SMDM_MATERIELQUERY_DETAIL.ATTRIBUTE',
    'SMDM_MATERIELQUERY_COMPONENT.LIST',
    'SMDM_MATERIELQUERY_DETAIL.BASIC',
    'SMDM_MATERIELQUERY_DETAIL.TABS',
    'SMDM_MATERIELQUERY_ORG.LIST',
    'SMDM_MATERIELQUERY_DETAIL.COMMODITY',
    'SMDM_MATERIELQUERY_DETAIL.EXPLAINTITLE',
    'SMDM_MATERIELQUERY_ATTRIBUTETABLE.LIST',
    'SMDM_MATERIELQUERY_ATTACHMENT.LIST',
    'SMDM_MATERIELQUERY_CATEGORY.LIST',
    'SMDM_MATERIELQUERY_DETAIL.DRAWING_INFO',
    'SMDM_MATERIELQUERY_DETAIL.UOM_LIST',
  ],
})
@connect(({ materielQuery, user, loading }) => ({
  materielQuery,
  user,
  loading:
    loading.effects['materielQuery/queryDetail'] ||
    loading.effects['materielQuery/queryAttribute'] ||
    loading.effects['materielQuery/queryPartner'] ||
    loading.effects['materielQuery/queryCategory'] ||
    loading.effects['materielQuery/queryAffliated'] ||
    loading.effects['materielQuery/queryItemOrgUom'] ||
    loading.effects['materielQuery/queryComponent'],
  fetchVersionListLoading: loading.effects['materielQuery/fetchVersionList'],
  organizationId: getCurrentOrganizationId(),
  queryTreeDataing: loading.effects['materielQuery/queryTreeData'],
  queryTaxationDataing: loading.effects['materielQuery/queryTaxationData'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'smdm.materiel',
    'smdm.materielApplication',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'entity.roles',
    'smdm.materialApplication',
    'sprm.common',
    'smdm.rateOrg',
  ],
})
export default class Materiel extends PureComponent {
  state = {
    visabled: true,
    versionViewVisible: false,
    operationModelVisible: false,
    operationModelDataLoading: true,
    operationData: [],
    pagination: {},
    collapseKeys: ['base', 'attribute', 'explainTitle', 'commodity'],
    tabsActiveKey: 'categoryTable',
  };

  componentDidMount() {
    const {
      match: {
        params: { itemId },
      },
    } = this.props;
    this.loadData(itemId);
    this.queryIdpValue();
    const { onLoad } = this.props;
    if (isFunction(onLoad)) {
      onLoad({
        submit: this.workflowSubmit,
      });
    }
  }

  componentDidUpdate(prevProps) {
    const {
      match: {
        params: { itemId },
      },
    } = this.props;
    const {
      match: {
        params: { itemId: prevItemId },
      },
    } = prevProps;
    if (itemId !== prevItemId) {
      this.loadData(itemId);
    }
  }

  @Bind()
  workflowSubmit(approveResult) {
    const { remote } = this.props;
    return new Promise((resolve, reject) => {
      if (remote?.event) {
        remote.event.fireEvent('handleCuxWorkflowSubmit', {
          approveResult,
          resolve,
          reject,
          current: this,
        });
      }
    });
  }

  /**
   * 查询物料明细信息
   * @param {string} itemId - 物料Id
   */
  @Bind()
  loadData(itemId = '') {
    // const { tabsActiveKey } = this.state;
    if (itemId) {
      this.queryData('queryDetail', itemId).then(() => {
        // 默认查询自主品类分配物料/所属组织
        this.queryData('queryCategory', itemId);
        this.queryData('queryAffliated', itemId);
        this.setState(
          {
            visabled: false,
          },
          () => {
            setTimeout(() => {
              this.setState({
                visabled: true,
              });
            }, 50);
          }
        );
        // if (!flag) {
        //   switch (tabsActiveKey) {
        //     case 'attributeTable':
        //       this.queryData('queryAttribute', itemId);
        //       break;
        //     case 'partnerTable':
        //       this.queryData('queryPartner', itemId); // todo
        //       break;
        //     case 'categoryTable':
        //       // this.queryData('queryCategory', itemId);
        //       break;
        //     case 'affiliatedOrgTable':
        //       // this.queryData('queryAffliated', itemId);
        //       break;
        //     case 'itemOrgUomTable':
        //       this.queryData('queryItemOrgUom', itemId);
        //       break;
        //     case 'enclosure':
        //       this.queryData('queryEnclosure', itemId);
        //       break;
        //     case 'componentTable':
        //       this.queryData('queryComponent', itemId);
        //       break;
        //     default:
        //       // this.queryData('queryAttribute', itemId);
        //       break;
        //   }
        // }
      });
    }
  }

  /**
   * 查询表单数据
   * @param {*} functionName 函数名
   * @param {*} itemId 物料Id
   * @param {*} page 分页参数
   */
  @Bind()
  queryData(functionName = '', itemId = '', page = {}) {
    const { dispatch, organizationId } = this.props;
    let customizeUnitCode;
    switch (functionName) {
      case 'queryDetail':
        customizeUnitCode =
          'SMDM_MATERIELQUERY_DETAIL.BASEINFO,SMDM_MATERIELQUERY_DETAIL.ATTRIBUTE,SMDM_MATERIELQUERY_DETAIL.COMMODITY,SMDM_MATERIELQUERY_DETAIL.EXPLAINTITLE';
        break;
      case 'queryAffliated':
        customizeUnitCode = 'SMDM_MATERIELQUERY_ORG.LIST';
        break;
      case 'queryAttribute':
        customizeUnitCode = 'SMDM_MATERIELQUERY_ATTRIBUTETABLE.LIST';
        break;
      case 'queryComponent':
        customizeUnitCode = 'SMDM_MATERIELQUERY_COMPONENT.LIST';
        break;
      case 'queryEnclosure':
        customizeUnitCode = 'SMDM_MATERIELQUERY_ATTACHMENT.LIST';
        break;
      case 'queryCategory':
        customizeUnitCode = 'SMDM_MATERIELQUERY_CATEGORY.LIST';
        break;
      case 'queryDrawInfo':
        customizeUnitCode = 'SMDM_MATERIELQUERY_DETAIL.DRAWING_INFO';
        break;
      case 'queryItemOrgUom':
        customizeUnitCode = 'SMDM_MATERIELQUERY_DETAIL.UOM_LIST';
        break;
      default:
        break;
    }
    return dispatch({
      type: `materielQuery/${functionName}`,
      payload: {
        organizationId,
        itemId,
        page,
        customizeUnitCode,
      },
    });
  }

  @Bind()
  handleFetchVersionList() {
    const {
      dispatch,
      organizationId,
      match: {
        params: { itemId },
      },
    } = this.props;
    dispatch({
      type: `materielQuery/fetchVersionList`,
      payload: {
        organizationId,
        itemId,
      },
    });
  }

  /**
   * 查询物料属性ABC值集
   */
  @Bind()
  queryIdpValue() {
    const { dispatch } = this.props;
    dispatch({ type: 'materielQuery/queryIdpValue' });
  }

  /**
   * 分页查询
   * @param {object} pagination 分页参数
   * @param {string} functionName 刷新的函数名
   */
  @Bind()
  handleTableChange(pagination, functionName) {
    const mapObj = {
      queryAttribute: 'attributeTable',
      queryPartner: 'partnerTable',
      queryCategory: 'categoryTable',
      queryAffliated: 'affiliatedOrgTable',
      queryItemOrgUom: 'itemOrgUomTable',
      queryEnclosure: 'enclosure',
      queryComponent: 'componentTable',
      queryDrawInfo: 'drawInfo',
    };
    const {
      match: {
        params: { itemId },
      },
    } = this.props;
    this.queryData(functionName, itemId, pagination);
    const { tabsActiveKey } = this.state;
    if (tabsActiveKey !== mapObj[functionName]) {
      this.setState({
        tabsActiveKey: mapObj[functionName],
      });
    }
    return this.queryData(functionName, itemId, pagination);
  }

  @Bind()
  toNonExponential(num) {
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/);
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]));
  }

  /**
   * 基本信息表单渲染
   */
  @Bind()
  renderBaseForm() {
    const { materielQuery = {}, customizeForm, form, remote } = this.props;
    const { getFieldDecorator } = form;
    const { materielDetail = {} } = materielQuery;
    const {
      itemName,
      itemCode,
      originItemCode,
      itemNumber,
      commonName,
      categoryName,
      sourceCode,
      primaryUomName,
      doubleUomName,
      uomConversionRate,
      primaryUomScale,
      secondaryUomScale,
      secondaryUomName,
      packingUomName,
      taxDescription,
      taxRate,
      grossWeight,
      netWeight,
      weightUomName,
      volume,
      volumeUomName,
      purchaseAgentName,
      packMinQuantity,
      chartCode,
      drawingVersion,
      safetyStockQuantity,
      exemptInspectionFlag,
      batchManagementFlag,
      plannedPrice,
      externalItemGroup,
      externalItemGroupDescription,
      orderUomName,
      totalShelfLife,
      minDeliveryRate,
      maxDeliveryRate,
      demandExecutor,
      orderExecutor,
      sourceExecutor,
      firstReminderList,
      secondReminderList,
      thirdReminderList,
      purchaseOrderRemark,
      supplyControlFlag,
      vmiFlag,
      nonProduceInvManageFlag,
    } = materielDetail;
    return customizeForm(
      {
        code: 'SMDM_MATERIELQUERY_DETAIL.BASEINFO', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码')}
            >
              {getFieldDecorator('itemCode')(<span>{itemCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码')}
            >
              {getFieldDecorator('originItemCode')(<span>{originItemCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.itemName').d('物料名称')}
            >
              {getFieldDecorator('itemName')(
                <Tooltip title={itemName} arrowPointAtCenter>
                  <span>{itemName || ''}</span>
                </Tooltip>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.itemNumber`).d('云平台物料编码')}
            >
              {getFieldDecorator('itemNumber')(<span>{itemNumber || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.commonName`).d('通用名')}
            >
              {getFieldDecorator('commonName')(<span>{commonName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.categoryNameType`).d('平台分类')}
            >
              {getFieldDecorator('categoryName')(<span>{categoryName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.sourceCode`).d('数据来源')}
            >
              {getFieldDecorator('sourceCode')(<span>{sourceCode || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位')}
            >
              {getFieldDecorator('primaryUomName')(<span>{primaryUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.doubleUomName`).d('双单位')}
            >
              {getFieldDecorator('doubleUomName')(<span>{doubleUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.unitUomConversionRate`)
                .d('基本单位与辅助单位转换率')}
            >
              {getFieldDecorator('newUomConversionRate')(
                <span>{primaryUomScale ? `${primaryUomScale}:${secondaryUomScale}` : ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.unitUomConversionRate`)
                .d('基本单位与辅助单位转换率')}
            >
              {getFieldDecorator('uomConversionRate')(
                <span>
                  {uomConversionRate ? `1:${this.toNonExponential(uomConversionRate)}` : ''}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.secondaryUomName`).d('辅助计量单位')}
            >
              {getFieldDecorator('secondaryUomName')(<span>{secondaryUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.packingUomName`).d('包装单位')}
            >
              {getFieldDecorator('packingUomName')(<span>{packingUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.taxDescription`).d('默认税种/税率')}
            >
              {getFieldDecorator('taxDescription')(
                <span>{taxDescription && `${taxDescription} - ${taxRate}`}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.grossWeight`).d('毛重')}
            >
              {getFieldDecorator('grossWeight')(
                <span>{isNil(grossWeight) ? '' : grossWeight}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.netWeight`).d('净重')}
            >
              {getFieldDecorator('netWeight')(<span>{isNil(netWeight) ? '' : netWeight}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.weightUomName`).d('重量单位')}
            >
              {getFieldDecorator('weightUomName')(<span>{weightUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.volume`).d('体积')}
            >
              {getFieldDecorator('volume')(<span>{isNil(volume) ? '' : volume}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.volumeUomName`).d('体积单位')}
            >
              {getFieldDecorator('volumeUomName')(<span>{volumeUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.purchaseAgent`).d('采购员')}
            >
              {getFieldDecorator('purchaseAgentName')(<span>{purchaseAgentName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.minPackQuantity`).d('最小包装数量')}
            >
              {getFieldDecorator('packMinQuantity')(
                <span>{isNil(packMinQuantity) ? '' : packMinQuantity}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.chartCode`).d('图号')}
            >
              {getFieldDecorator('chartCode')(<span>{chartCode || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.drawingVersion`).d('图纸版本')}
            >
              {getFieldDecorator('drawingVersion')(<span>{drawingVersion || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.safetyStockQuantity`).d('安全库存数')}
            >
              {getFieldDecorator('safetyStockQuantity')(<span>{safetyStockQuantity || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.exemptInspectionFlag`).d('是否免检')}
            >
              {getFieldDecorator('exemptInspectionFlag')(
                <span>
                  {exemptInspectionFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.batchManagementFlag`).d('是否批次管理')}
            >
              {getFieldDecorator('batchManagementFlag')(
                <span>
                  {batchManagementFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.nonProduceInvManageFlag`)
                .d('是否开启非生库存管理')}
            >
              {getFieldDecorator('nonProduceInvManageFlag')(
                <span>
                  {nonProduceInvManageFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.nonProduceInvBatch`).d('非生库存批次')}
            >
              {getFieldDecorator('nonProduceInvBatch')(
                <span>{materielDetail?.nonProduceInvBatchName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.plannedPrice`).d('计划价格')}
            >
              {getFieldDecorator('plannedPrice')(<span>{plannedPrice || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.externalItemGroup`).d('外部物料组')}
            >
              {getFieldDecorator('externalItemGroup')(<span>{externalItemGroup || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.externalItemDesc`).d('外部物料组描述')}
            >
              {getFieldDecorator('externalItemGroupDescription')(
                <span>{externalItemGroupDescription || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.totalShelfLife`).d('总货架寿命(天)')}
            >
              {getFieldDecorator('totalShelfLife')(
                <span>{isNil(totalShelfLife) ? '' : totalShelfLife}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.procurementId`).d('采购单位')}
            >
              {getFieldDecorator('orderUomName')(<span>{orderUomName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.minDeliveryRate`).d('交货不足限度(%)')}
            >
              {getFieldDecorator('minDeliveryRate')(
                <span>{isNil(minDeliveryRate) ? '' : minDeliveryRate}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.maxDeliveryRate`).d('过量交货限度(%)')}
            >
              {getFieldDecorator('maxDeliveryRate')(
                <span>{isNil(maxDeliveryRate) ? '' : maxDeliveryRate}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.demandExecutor`).d('需求执行人')}
            >
              {getFieldDecorator('demandExecutor')(<span>{demandExecutor || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.orderExecutor`).d('订单执行人')}
            >
              {getFieldDecorator('orderExecutor')(<span>{orderExecutor || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.sourceExecutor`).d('寻源执行人')}
            >
              {getFieldDecorator('sourceExecutor')(<span>{sourceExecutor || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.firstReminderList`)
                .d('第一封催询单(天数)')}
            >
              {getFieldDecorator('firstReminderList')(
                <span>{isNil(firstReminderList) ? '' : firstReminderList}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.secondReminderList`)
                .d('第二封催询单(天数)')}
            >
              {getFieldDecorator('secondReminderList')(
                <span>{isNil(secondReminderList) ? '' : secondReminderList}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.thirdReminderList`)
                .d('第三封催询单(天数)')}
            >
              {getFieldDecorator('thirdReminderList')(
                <span>{isNil(thirdReminderList) ? '' : thirdReminderList}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.checkAttachmentUuid`).d('检测指导')}
            >
              {getFieldDecorator('checkAttachmentUuid', {
                initialValue: materielDetail.checkAttachmentUuid,
              })(
                <SrmUpload
                  attachmentUUID={materielDetail.checkAttachmentUuid}
                  viewOnly
                  // showRemoveIcon
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="smdm-materiel"
                  listType="picture-card"
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.imagAttachmentUuid`).d('物料图片')}
            >
              {getFieldDecorator('imagAttachmentUuid', {
                initialValue: materielDetail.imagAttachmentUuid,
              })(
                <SrmUpload
                  attachmentUUID={materielDetail.imagAttachmentUuid}
                  viewOnly
                  // showRemoveIcon
                  filePreview
                  bucketName={PUBLIC_BUCKET}
                  bucketDirectory="smdm-materiel"
                  listType="picture-card"
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.ifVMI`).d('是否VMI')}
            >
              {getFieldDecorator('vmiFlag', {
                initialValue: materielDetail.vmiFlag,
              })(
                <span>
                  {vmiFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.ifSupplyControlFlag`).d('是否货源管控')}
            >
              {getFieldDecorator('supplyControlFlag')(
                <span>
                  {supplyControlFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.customMadeFlag`).d('是否定制')}
            >
              {getFieldDecorator('customMadeFlag', {
                initialValue: materielDetail.customMadeFlag ? materielDetail.customMadeFlag : 0,
              })(
                <span>
                  {materielDetail.customMadeFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.purchaseOrderRemark`).d('采购订单文本')}
            >
              {getFieldDecorator('purchaseOrderRemark')(<span>{purchaseOrderRemark || ''}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {remote
            ? remote.process('SMDM_MATERIELQUERY_DETAIL.BASEINFO', null, {
                form,
                dataSource: materielDetail,
                current: this,
              })
            : null}
        </Row>
      </Form>
    );
  }

  /**
   * 物料属性表单渲染
   */
  renderAttributeForm() {
    const {
      materielQuery: { materielDetail = {} },
      form,
      customizeForm,
      remote,
    } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SMDM_MATERIELQUERY_DETAIL.ATTRIBUTE', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.brand`).d('品牌')}
            >
              {getFieldDecorator('brand')(<span>{materielDetail.brand || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.origin`).d('产地')}
            >
              {getFieldDecorator('origin')(<span>{materielDetail.origin || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.importFlag`).d('是否进口')}
            >
              {getFieldDecorator('importFlag')(
                <span>
                  {materielDetail.importFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.specifications`).d('规格')}
            >
              {getFieldDecorator('specifications')(
                <span>{materielDetail.specifications || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.model`).d('型号')}
            >
              {getFieldDecorator('model')(<span>{materielDetail.model || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.agentCompanyName`).d('代理商')}
            >
              {getFieldDecorator('agentCompanyName')(
                <span>{materielDetail.agentCompanyName || ''}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.manufacturerCompanyName`).d('制造商')}
            >
              {getFieldDecorator('manufacturerCompanyName')(
                <span>{materielDetail.manufacturerCompanyName || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.itemAbc`).d('物料ABC属性')}
            >
              {getFieldDecorator('itemAbc')(<span>{materielDetail.itemAbc || ''}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {remote
            ? remote.process('SMDM_MATERIELQUERY_DETAIL.ATTRIBUTE', null, {
                form,
                dataSource: materielDetail,
                current: this,
              })
            : null}
        </Row>
      </Form>
    );
  }

  /**
   * 物料说明表单渲染
   */
  renderExplainForm() {
    const {
      materielQuery: { materielDetail = {} },
      form,
      customizeForm,
      remote,
    } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SMDM_MATERIELQUERY_DETAIL.EXPLAINTITLE', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.eanCode`).d('商品流通码')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('eanCode')(<span>{materielDetail.eanCode || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.itemManageMethod`).d('物料管理方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemManageMethod')(
                <span>{materielDetail.itemManageMethod || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.quotaManageType`).d('物料配额管理类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotaManageType')(
                <span>{materielDetail.quotaManageType || ''}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.lotNumberingRule`).d('批号规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('lotNumberingRule')(
                <span>{materielDetail.lotNumberingRule || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.usedItemCode`).d('旧物料号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('usedItemCode')(<span>{materielDetail.usedItemCode || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.productHierarchies`).d('产品层次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('productHierarchies')(
                <span>{materielDetail.productHierarchies || ''}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem label={intl.get(`smdm.materiel.model.materiel.explainTitle`).d('物料说明')}>
              {getFieldDecorator('remark')(<span>{materielDetail.remark || ''}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {remote
            ? remote.process('SMDM_MATERIELQUERY_DETAIL.EXPLAINTITLE', null, {
                form,
                dataSource: materielDetail,
                current: this,
              })
            : null}
        </Row>
      </Form>
    );
  }

  /**
   * 税收商品信息
   */
  renderCommodityForm() {
    const {
      materielQuery: { materielDetail = {} },
      form,
      customizeForm,
      remote,
    } = this.props;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SMDM_MATERIELQUERY_DETAIL.COMMODITY', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('smdm.materiel.model.materiel.dutyFreeType').d('免税类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('taxFreeType')(
                <span>{materielDetail.taxFreeTypeMeaning || ''}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.discountFlag`).d('是否使用优惠政策')}
            >
              {getFieldDecorator('preferentialMarkFlag')(
                <span>
                  {materielDetail.preferentialMarkFlag
                    ? intl.get('hzero.common.status.yes').d('是')
                    : intl.get('hzero.common.status.no').d('否')}
                </span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('smdm.materiel.model.materiel.discountType').d('优惠政策类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('preferentialMark')(
                <span>{materielDetail.preferentialMarkMeaning || ''}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.commodityCode').d('税收商品编码')}
            >
              {getFieldDecorator('taxItemCode')(<span>{materielDetail.taxItemCode || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.commodityName').d('税收商品名称')}
            >
              {getFieldDecorator('taxItemName')(<span>{materielDetail.taxItemName || ''}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.commoditySimple').d('税收商品简称')}
            >
              {getFieldDecorator('taxItemSimpleName')(
                <span>{materielDetail.taxItemSimpleName || ''}</span>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          {remote
            ? remote.process('SMDM_MATERIELQUERY_DETAIL.COMMODITY', null, {
                form,
                dataSource: materielDetail,
                current: this,
              })
            : null}
        </Row>
      </Form>
    );
  }

  @Bind()
  handleVersionView() {
    this.setState({ versionViewVisible: true });
  }

  /**
   * 明细折叠
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  getBackPath() {
    const { remote } = this.props;
    const path = '/smdm/materiel-query';
    return remote
      ? remote.process('SMDM_ITEM_QUERY_DETAIL_BACKPATH', path, {
          current: this,
        })
      : path;
  }

  @Bind()
  handleOperationModel(page = {}) {
    const {
      match: {
        params: { itemId },
        // organizationId,
      },
    } = this.props;
    this.setState({ operationModelVisible: true });
    queryOperation({ itemId, organizationId: getCurrentOrganizationId(), page }).then((res) => {
      this.setState({ operationModelDataLoading: false });
      if (res && !res.failed) {
        this.setState({ operationData: res.content, pagination: createPagination(res) });
      } else {
        notification.error();
        this.setState({ operationData: [] });
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading = false,
      fetchVersionListLoading = false,
      organizationId = false,
      match: {
        params: { itemId },
      },
      user: { currentUser = {} },
      materielQuery: {
        materielDetail: { itemAllOrgFlag, primaryUomName, primaryUomId, versionNumber = 0 },
        attributeData = [],
        partnerData = {},
        categoryData = [],
        affliatedData = {},
        enclosureDataSource = [],
        itemOrgUomData = {},
        allowExcessTypeList = [],
        versionList = [],
        componentData = {},
        drawInfoData = [],
      },
      customizeTable,
      customizeCollapse,
      customizeTabPane,
    } = this.props;
    const attributeTableProps = {
      onTableChange: this.handleTableChange,
      dataSource: attributeData,
      customizeTable,
      itemId,
    };
    const partnerTableProps = {
      onTableChange: this.handleTableChange,
      dataSource: partnerData,
      itemId,
    };
    const categoryTableProps = {
      onTableChange: this.handleTableChange,
      customizeTable,
      dataSource: categoryData,
      itemId,
    };
    const AffiliatedOrgTableProps = {
      onTableChange: this.handleTableChange,
      allowExcessTypeList,
      customizeTable,
      itemAllOrgFlag: itemAllOrgFlag || 0,
      dataSource: affliatedData,
      organizationId,
      itemId,
    };
    const ItemOrgUomTableProps = {
      onTableChange: this.handleTableChange,
      primaryUomName,
      primaryUomId,
      dataSource: itemOrgUomData,
      organizationId,
      itemId,
      customizeTable,
    };
    const enclosureTableProps = {
      onTableChange: this.handleTableChange,
      dataSource: enclosureDataSource,
      customizeTable,
      currentUser,
      itemId,
    };
    const componentTableProps = {
      onTableChange: this.handleTableChange,
      dataSource: componentData,
      customizeTable,
      itemId,
      remote: this.props.remote,
    };
    const drawInfoTableProps = {
      onTableChange: this.handleTableChange,
      dataSource: drawInfoData,
      customizeTable,
      itemId,
      remote: this.props.remote,
    };
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const { versionViewVisible = false, collapseKeys = [], tabsActiveKey, visabled } = this.state;

    return (
      <React.Fragment>
        <Spin spinning={loading || false}>
          <Header
            title={intl.get(`smdm.materiel.view.message.title.detail.materielSearch`).d('物料查询')}
            backPath={this.getBackPath()}
          >
            {versionNumber >= 0 && (
              <Button type="primary" icon="eye" onClick={this.handleVersionView}>
                {intl
                  .get('smdm.materiel.view.message.title.detail.historyVersionView')
                  .d('历史版本查看')}
              </Button>
            )}
            {itemId ? (
              <Button
                // type="primary"
                loading={loading}
                onClick={this.handleOperationModel}
              >
                {intl
                  .get('smdm.materialApplication.model.materialApplication.operationRecords')
                  .d('操作记录')}
              </Button>
            ) : null}
          </Header>
          <Content
            wrapperClassName={`${DETAIL_DEFAULT_CLASSNAME} ${styles['overflow-detail-content']}`}
          >
            {customizeCollapse(
              {
                code: 'SMDM_MATERIELQUERY_DETAIL.BASIC',
              },
              <Collapse
                className="form-collapse"
                defaultActiveKey={collapseKeys}
                onChange={this.onCollapseChange}
              >
                <Collapse.Panel
                  // bordered={false}
                  // className={DETAIL_CARD_CLASSNAME}
                  // title={<h3>{intl.get(`smdm.materiel.view.message.base`).d('基本信息')}</h3>}
                  showArrow={false}
                  header={
                    <>
                      <h3>{intl.get(`smdm.materiel.view.message.base`).d('基本信息')}</h3>
                      <a>
                        {collapseKeys.some((item) => item === 'base')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon type={collapseKeys.some((item) => item === 'base') ? 'up' : 'down'} />
                    </>
                  }
                  key="base"
                >
                  {this.renderBaseForm()}
                </Collapse.Panel>
                <Collapse.Panel
                  showArrow={false}
                  header={
                    <>
                      <h3>{intl.get(`smdm.materiel.view.message.attribute`).d('物料属性')}</h3>
                      <a>
                        {collapseKeys.some((item) => item === 'attribute')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.some((item) => item === 'attribute') ? 'up' : 'down'}
                      />
                    </>
                  }
                  key="attribute"
                >
                  {this.renderAttributeForm()}
                </Collapse.Panel>
                <Collapse.Panel
                  showArrow={false}
                  header={
                    <>
                      <h3>{intl.get(`smdm.materiel.view.message.explainTitle`).d('物料说明')}</h3>
                      <a>
                        {collapseKeys.some((item) => item === 'explainTitle')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.some((item) => item === 'explainTitle') ? 'up' : 'down'}
                      />
                    </>
                  }
                  key="explainTitle"
                >
                  {this.renderExplainForm()}
                </Collapse.Panel>
                <Collapse.Panel
                  showArrow={false}
                  header={
                    <>
                      <h3>{intl.get(`smdm.materiel.view.message.commodity`).d('税收商品信息')}</h3>
                      <a>
                        {collapseKeys.some((item) => item === 'commodity')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.some((item) => item === 'commodity') ? 'up' : 'down'}
                      />
                    </>
                  }
                  key="commodity"
                >
                  {this.renderCommodityForm()}
                </Collapse.Panel>
              </Collapse>
            )}
            {customizeTabPane(
              {
                code: 'SMDM_MATERIELQUERY_DETAIL.TABS',
              },
              <Tabs
                defaultActiveKey={tabsActiveKey}
                animated={false}
                onChange={(key) => {
                  this.setState({ tabsActiveKey: key });
                }}
              >
                <Tabs.TabPane
                  tab={intl
                    .get(`smdm.materiel.view.message.tab.categoryTable`)
                    .d('自主品类分配物料')}
                  key="categoryTable"
                >
                  <CategoryTable {...categoryTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.affiliatedOrgTable`).d('所属组织')}
                  key="affiliatedOrgTable"
                >
                  <AffiliatedOrgTable {...AffiliatedOrgTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl
                    .get(`smdm.materiel.view.message.tab.attributeTable`)
                    .d('自定义物品属性')}
                  key="attributeTable"
                  forceRender={!visabled}
                >
                  {visabled && <AttributeTable {...attributeTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.partnerTable`).d('客户物料')}
                  key="partnerTable"
                  forceRender={!visabled}
                >
                  {visabled && <PartnerTable {...partnerTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.itemOrgUomTable`).d('单位转换关系')}
                  key="itemOrgUomTable"
                  forceRender={!visabled}
                >
                  {visabled && <ItemOrgUomTable {...ItemOrgUomTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.enclosure`).d('附件信息')}
                  key="enclosure"
                  forceRender={!visabled}
                >
                  {visabled && <EnclosureTable {...enclosureTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.componentTable`).d('组件清单')}
                  key="componentTable"
                  forceRender={!visabled}
                >
                  {visabled && <ComponentTable {...componentTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.drawingInfo`).d('图纸信息')}
                  key="drawInfo"
                  forceRender={!visabled}
                >
                  {visabled && <DrawInfoTable {...drawInfoTableProps} />}
                </Tabs.TabPane>
              </Tabs>
            )}
            {versionViewVisible && (
              <Modal
                visible={versionViewVisible}
                width={680}
                title={intl
                  .get('smdm.materiel.view.message.title.detail.historyVersionView')
                  .d('历史版本查看')}
                onCancel={() => this.setState({ versionViewVisible: false })}
                footer={false}
              >
                <VersionTable
                  handleFetchList={this.handleFetchVersionList}
                  dataSource={versionList}
                  loading={fetchVersionListLoading}
                  onCancel={() => this.setState({ versionViewVisible: false })}
                />
              </Modal>
            )}
          </Content>
        </Spin>
        {this.state.operationModelVisible ? (
          <OperationModel
            visible={this.state.operationModelVisible}
            onClose={() => this.setState({ operationModelVisible: false })}
            onlyOperation
            operationData={this.state.operationData}
            dataLoading={this.state.operationModelDataLoading}
            pagination={this.state.pagination}
            handleOperationModel={this.handleOperationModel}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
