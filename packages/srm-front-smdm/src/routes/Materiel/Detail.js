/**
 * materiel - 物料定义详情
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Button,
  Row,
  Col,
  Input,
  Tabs,
  InputNumber,
  Spin,
  Modal,
  Upload,
  Icon,
  Select,
  Checkbox,
  Collapse,
  Tooltip,
} from 'hzero-ui';
import { isEmpty, isString, isArray, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';

import uuid from 'uuid/v4';
import remote from 'hzero-front/lib/utils/remote';
import { Header, Content } from 'components/Page';
import {
  EDIT_FORM_ITEM_LAYOUT,
  FORM_COL_3_LAYOUT,
  FORM_COL_2_LAYOUT,
  EDIT_FORM_ROW_LAYOUT,
  DETAIL_DEFAULT_CLASSNAME,
} from 'utils/constants';

import Lov from 'components/Lov';
import Switch from 'components/Switch';
import TLEditor from 'components/TLEditor';
import { Button as PermissionButton } from 'components/Permission';
import {
  getCurrentOrganizationId,
  getAccessToken,
  filterNullValueObject,
  createPagination,
  getResponse,
} from 'utils/utils';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '_utils/config';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import SrmUpload from 'srm-front-boot/lib/components/Upload/index';
import { queryOperation, fetchUomControl } from '@/services/materielService';
import { fetchDoExecute, getCategoryTemplate } from '@/services/materielApplicationService';
import AttributeTable from './Tables/AttributeTable';
import PartnerTable from './Tables/PartnerTable';
import CategoryTable from './Tables/CategoryTable';
import AffiliatedOrgTable from './Tables/AffiliatedOrgTable';
import EnclosureTable from './Tables/EnclosureTable';
import ItemOrgUomTable from './Tables/ItemOrgUomTable';
import ComponentTable from './Tables/ComponentTable';
import { TreeInput } from './TreeInput';
import DemandExecutorModal from './Tables/demandExecutorModal';
import OperationModel from './OperationModel';
import DrawInfo from '../DrawInfo';
import UomConversion from './components/UomConversion';

import styles from './index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Dragger } = Upload;
const categoryCache = new Map();
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
    code: 'SMDM_ITEM_DETAIL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      handleHeadBtn: undefined,
      handleEnclosureOperate: undefined,
      handleSaveCheck: undefined,
      disableCompentPrecision: undefined,
    },
  }
)
@WithCustomize({
  unitCode: [
    'SMDM_MATERIEL_EDIT.MATERIEL_DETAIL',
    'SMDM_MATERIEL_EDIT.DETAIL_ATTRIBUTE',
    'SMDM_MATERIEL_ORG.LIST',
    'SMDM_MATERIEL_ATTRIBUTETABLE.LIST',
    'SMDM_MATERIEL_ATTRIBUTETABLE.EDIT',
    'SMDM_MATERIEL_COMPONENTTABLE.LIST',
    'SMDM_MATERIEL_COMPONENTTABLE.EDITFORM',
    'SMDM_MATERIEL_EDIT.BASIC',
    'SMDM_MATERIEL_EDIT.EXPLAINTITLE',
    'SMDM_MATERIEL_EDIT.COMMODITY',
    'SMDM_MATERIEL_EDIT.TABS',
    'SMDM_MATERIEL_ORG.EDITFORM',
    'SMDM_MATERIEL_ATTACHMENT.LIST',
    'SMDM_MATERIEL_ATTACHMENT.EDIT_FROM',
    'SMDM_MATERIEL_CATEGORY.LIST',
    'SMDM_MATERIEL_EDIT.UOM_LIST',
    'SMDM_MATERIEL_EDIT.UOM_FORM',
  ],
})
@connect(({ materiel, user, loading }) => ({
  materiel,
  user,
  loading:
    loading.effects['materiel/queryDetail'] ||
    loading.effects['materiel/queryAttribute'] ||
    loading.effects['materiel/queryPartner'] ||
    loading.effects['materiel/queryCategory'] ||
    loading.effects['materiel/queryAffliated'] ||
    loading.effects['materiel/queryItemOrgUom'] ||
    loading.effects['materiel/queryComponent'],
  saving: loading.effects['materiel/saveAll'],
  deleteLoading:
    loading.effects['materiel/deleteAttributeTableData'] ||
    loading.effects['materiel/deletePartnerTableData'] ||
    loading.effects['materiel/deleteCategoryTableData'] ||
    loading.effects['materiel/deleteAffiatedTableData'] ||
    loading.effects['materiel/deleteEnclosureTableData'] ||
    loading.effects['materiel/deleteComponentTableData'],
  demanding: loading.effects['materiel/fetchExecutorData'],
  enabling: loading.effects['materiel/enabledFlag'],
  organizationId: getCurrentOrganizationId(),
  queryTreeDataing: loading.effects['materiel/queryTreeData'],
  queryTaxationDataing: loading.effects['materiel/queryTaxationData'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'smdm.materiel',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'entity.roles',
    'smdm.paymentTerms',
    'smdm.materialApplication',
    'sprm.common',
    'smdm.rateOrg',
  ],
})
export default class Materiel extends PureComponent {
  /**
   * state初始化
   * @param {object} props - 组件Props
   */
  constructor(props) {
    super(props);
    const { params } = props.match;
    this.state = {
      visabled: true,
      uploadVisible: false,
      isEdit: !!params.itemId,
      fileList: [],
      collapseKeys: ['base', 'attribute', 'explainTitle', 'commodity'],
      itemNameTipFlag: false,
      operationModelVisible: false,
      operationModelDataLoading: true,
      operationData: [],
      pagination: {},
      doubleControlFlag: 0,
      // tipModalVisible: false,
      tabsActiveKey: 'categoryTable',
      categoryAutoRelateFlag: false,
      mainCategoryId: undefined,
      diffDeleteFlag: undefined,
      drawInfoVisible: false,
    };
    this.TreeInputData = {};
  }

  componentDidMount() {
    const {
      match: {
        params: { itemId },
      },
    } = this.props;
    this.loadData(itemId);
    this.queryDoubleControl();
    this.queryIdpValue();
    this.fetchCategoryAutoRelate();
    categoryCache.clear();
  }

  queryDoubleControl = () => {
    fetchUomControl().then((res) => {
      const result = getResponse(res);
      if (result) {
        const doubleKey = Object.values(res).some((subItem) => subItem === 1);
        this.setState({
          doubleControlFlag: doubleKey ? 1 : 0,
        });
      }
    });
  };

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'materiel/updateState',
      payload: {
        ExecutorData: [], // 需求执行人列表
        ExtorPagination: {}, // 需求执行人分页参数
        materielDetail: {}, // 物料详情表单数据
        attributeData: [], // 自定义物品属性数据
        partnerData: {}, // 客户物品数据
        categoryData: [], // 自主品类分配物品
        affliatedData: {}, // 所属组织数据
        enclosureDataSource: [], // 附件
        itemOrgUomData: {}, // 物料关联关系
        componentData: {}, // 组件列表数据
      },
    });
  }

  // 查询 品类属性是否自动同步物料属性
  @Bind()
  fetchCategoryAutoRelate() {
    fetchDoExecute([{ fullPathCode: 'SITE.SMDM.ITEM_CATEGORY_ATTRIBUTE_AUTO_RELATE' }]).then(
      (res) => {
        if (getResponse(res)) {
          if (res[0] === '1') {
            this.setState({
              categoryAutoRelateFlag: true,
            });
          }
        }
      }
    );
  }

  // 查询品类模版
  @Bind()
  fetchCategoryTemplate(categoryId) {
    const {
      dispatch,
      materiel: { attributeData = [] },
    } = this.props;
    const { mainCategoryId } = this.state;
    const { categoryAutoRelateFlag } = this.state;
    if (categoryAutoRelateFlag) {
      if (mainCategoryId) {
        categoryCache.set(mainCategoryId, attributeData);
        this.setState({
          mainCategoryId: categoryId,
        });
      }

      if (categoryCache.has(categoryId)) {
        dispatch({
          type: 'materiel/updateState',
          payload: {
            attributeData: categoryCache.get(categoryId),
          },
        });
      } else {
        this.setState({
          diffDeleteFlag: 1,
        });
        getCategoryTemplate(categoryId).then((res) => {
          if (getResponse(res)) {
            if (res?.templateId) {
              const newItemAttribute = res.categoryAttrTemplateProperties.map((ele) => {
                const {
                  sort,
                  scale,
                  maintenanceMethod,
                  attributeCode,
                  templateId,
                  attributeName,
                  categoryAttrTemplatePropertyAssigns,
                } = ele;
                return {
                  sort,
                  scale,
                  maintenanceMethod,
                  itemAttributeId: uuid(),
                  attributeNameCode: attributeCode,
                  templateId,
                  attributeName,
                  isLocal: true,
                  attributeValueCode: null,
                  templateJson: JSON.stringify({
                    ...ele,
                    attributeValueArr: isArray(categoryAttrTemplatePropertyAssigns)
                      ? categoryAttrTemplatePropertyAssigns.map((data) => data.valueName)
                      : [],
                  }),
                };
              });
              // 根据【排序】字段由低到高向下排列。排序相同的字段根据原逻辑创建时间最早的排在上面
              newItemAttribute.sort((a, b) => a.sort - b.sort);
              dispatch({
                type: 'materiel/updateState',
                payload: {
                  attributeData: newItemAttribute,
                },
              });
            }
          }
        });
      }
    }
  }

  @Bind()
  setTreeInputData(data) {
    this.TreeInputData = data;
  }

  /**
   * 查询物料明细信息
   * @param {string} itemId - 物料Id
   */
  @Bind()
  loadData(itemId = '') {
    // const { tabsActiveKey } = this.state;
    const { form } = this.props;
    const { handleCuxTableQuery } = remote?.props?.process || {};
    if (itemId) {
      this.queryData('queryDetail', itemId).then(() => {
        form.resetFields();
        // 海亮股份二開
        if (window?.fetchOrderPricingVariableTableData) {
          // eslint-disable-next-line no-unused-expressions
          window?.fetchOrderPricingVariableTableData();
        }
        // 默认查询自主品类分配物料/所属组织
        this.queryData('queryCategory', itemId);
        this.queryData('queryAffliated', itemId);
        this.queryData('queryAttribute', itemId).then(() => {
          const {
            materiel: { categoryData = [] },
          } = this.props;
          const mainCategoryData = categoryData.find((ele) => ele.defaultFlag) || {};
          this.setState({
            mainCategoryId: mainCategoryData?.categoryId,
          });
        });
        if (isFunction(handleCuxTableQuery)) {
          handleCuxTableQuery({ form, itemId });
        }
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
          'SMDM_MATERIEL_EDIT.MATERIEL_DETAIL,SMDM_MATERIEL_EDIT.DETAIL_ATTRIBUTE,SMDM_MATERIEL_EDIT.EXPLAINTITLE,SMDM_MATERIEL_EDIT.COMMODITY';
        break;
      case 'queryAffliated':
        customizeUnitCode = 'SMDM_MATERIEL_ORG.LIST';
        break;
      case 'queryAttribute':
        customizeUnitCode = 'SMDM_MATERIEL_ATTRIBUTETABLE.LIST';
        break;
      case 'queryComponent':
        customizeUnitCode =
          'SMDM_MATERIEL_COMPONENTTABLE.LIST,SMDM_MATERIEL_COMPONENTTABLE.EDITFORM';
        break;
      case 'queryEnclosure':
        customizeUnitCode = 'SMDM_MATERIEL_ATTACHMENT.LIST,SMDM_MATERIEL_ATTACHMENT.EDIT_FROM';
        break;
      case 'queryCategory':
        customizeUnitCode = 'SMDM_MATERIEL_CATEGORY.LIST';
        break;
      case 'queryItemOrgUom':
        customizeUnitCode = 'SMDM_MATERIEL_EDIT.UOM_LIST';
        break;
      default:
        break;
    }
    return dispatch({
      type: `materiel/${functionName}`,
      payload: {
        organizationId,
        itemId,
        page,
        customizeUnitCode,
      },
    });
  }

  /**
   * 查询物料属性ABC值集
   */
  @Bind()
  queryIdpValue() {
    const { dispatch } = this.props;
    dispatch({ type: 'materiel/queryIdpValue' });
  }

  /**
   * 查询需求执行人
   */

  @Bind()
  onExecutorChange(demandExecutor, demandExecutorBys, lovType) {
    const { form } = this.props;
    const { setFieldsValue } = form;
    if (lovType === 'orderExecutor') {
      setFieldsValue({
        orderExecutor: demandExecutor,
        orderExecutorBys: demandExecutorBys,
      });
    } else if (lovType === 'sourceExecutor') {
      setFieldsValue({
        sourceExecutor: demandExecutor,
        sourceExecutorBys: demandExecutorBys,
      });
    } else {
      setFieldsValue({
        demandExecutor,
        demandExecutorBys,
      });
    }
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
    };
    const {
      match: {
        params: { itemId },
      },
    } = this.props;
    const { tabsActiveKey } = this.state;
    if (tabsActiveKey !== mapObj[functionName]) {
      this.setState({
        tabsActiveKey: mapObj[functionName],
      });
    }
    return this.queryData(functionName, itemId, pagination);
  }

  /**
   * 保存数据到前端页面
   * @param {Array<object>} dataList 更新的数据
   * @param {string} dataName 该保存的数据字符串
   * @param {boolean} isPaging 该表格是否支持分页
   */
  @Bind()
  addTableData(dataList, dataName, isPaging, pageSet = false) {
    const { dispatch, materiel = {} } = this.props;
    if (isPaging) {
      dispatch({
        type: 'materiel/updateState',
        payload: {
          [dataName]: {
            ...materiel[dataName],
            content: dataList,
            totalElements: materiel[dataName].totalElements
              ? pageSet
                ? materiel[dataName].totalElements
                : materiel[dataName].totalElements + 1
              : 1,
          },
        },
      });
    } else {
      dispatch({
        type: 'materiel/updateState',
        payload: {
          [dataName]: dataList,
        },
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
  deleteTableData(localRows, idList, functionName, dataName, isPaging, pageSet = false) {
    // itemLineIdList
    const { dispatch, organizationId, materiel = {} } = this.props;
    if (!isEmpty(idList)) {
      dispatch({
        type: `materiel/${functionName}`,
        payload: {
          idList,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          this.clearRows();
          notification.success();
        }
      });
    }
    const urls = localRows.map((item) => item.attachmentUrl);
    if (!isEmpty(filterNullValueObject(urls))) {
      dispatch({
        type: 'materiel/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'smdm-materiel',
          urls,
        },
      });
    }
    if (isPaging) {
      dispatch({
        type: 'materiel/updateState',
        payload: {
          [dataName]: {
            ...materiel[dataName],
            content: localRows,
            totalElements: materiel[dataName].totalElements
              ? pageSet
                ? 0
                : materiel[dataName].totalElements - 1
              : 1,
          },
        },
      });
    } else {
      dispatch({
        type: 'materiel/updateState',
        payload: {
          [dataName]: localRows,
        },
      });
    }
  }

  /**
   * 检验字段唯一性
   * @param {object} form - 表单对象
   * @param {string} key  - 校验唯一性的字段名
   * @param {string} value - 字段值
   */
  @Bind()
  checkValid(form, key, value = '') {
    const {
      dispatch,
      organizationId,
      match: {
        params: { itemId },
      },
    } = this.props;
    const newValue = isString(value) ? value.replace(/^\s+|\s+$/g, '') : value;
    if (newValue) {
      dispatch({
        type: 'materiel/checkValid',
        payload: { organizationId, itemId, key, value },
      }).then((res) => {
        if (!res) {
          form.resetFields('itemCode');
        }
      });
    }
  }

  /**
   * 方法含义？
   * @param {string} key - 校验唯一性的字段名
   * @param {string} value - 字段值
   * @param {string} key1 - 校验唯一性的字段名
   * @param {string} value1 - 字段值
   */
  @Bind()
  checkPartnerValid(form, key, value, key1, value1) {
    if (value && value1) {
      const {
        dispatch,
        organizationId,
        match: {
          params: { itemId },
        },
      } = this.props;
      dispatch({
        type: 'materiel/checkValid',
        payload: { organizationId, itemId, key, value, key1, value1 },
      }).then((res) => {
        if (!res) {
          form.resetFields();
        }
      });
    }
  }

  /**
   * 修改物料编码校验位置，在保存之前校验
   */
  @Bind
  @Throttle(500)
  async validateSave() {
    // 一道新能源二开：校验定价属性表格
    if (typeof window.validatePriceAttrMsgDs === 'function') {
      const flag = await window.validatePriceAttrMsgDs();
      if (!flag) {
        // 构造报错信息：【编码-名称】
        const itemStr = `【${this.props?.form?.getFieldValue(
          'itemCode'
        )} - ${this.props?.form?.getFieldValue('itemName')}】`;
        // 構造出錯的屬性
        const tableDs = window.getPriceAttrMsgDs();
        const attrArr = window.getPriceAttrMsgError().map((item = [], ind) => {
          if (item.length === 0) return '';
          return tableDs.get(ind).get('priceAttributeCodeMeaning');
        });
        const unRepeatedArr = Array.from(new Set(attrArr));
        const attrUnRepeatedArr = unRepeatedArr.filter((i) => !!i);
        notification.error({
          message: intl.get('smdm.materiel.view.notification.priceMsgValidError', {
            itemStr,
            attrUnRepeatedArr,
          }),
        });
        return false;
      }
    }
    const {
      form,
      match: {
        params: { itemId },
      },
      dispatch,
      organizationId,
    } = this.props;
    if (!itemId) {
      const value = form.getFieldValue('itemCode');
      const newValue = isString(value) ? value.replace(/^\s+|\s+$/g, '') : value;
      if (newValue) {
        dispatch({
          type: 'materiel/checkValid',
          payload: { organizationId, itemId, key: 'itemCode', value },
        }).then((res) => {
          if (!res) {
            form.resetFields('itemCode');
          } else {
            this.handleSave();
          }
        });
      } else {
        this.handleSave();
      }
    } else {
      this.handleSave();
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
      history,
      organizationId,
      match: { params: { itemId } } = {},
      materiel: {
        materielDetail,
        attributeData = [],
        enclosureDataSource = [],
        // itemOrgRelAttributeVO = {},
        partnerData: { content: partnerContent = [] } = {},
        categoryData = [],
        affliatedData: { content: affliatedContent = [] } = {},
        itemOrgUomData: { content: itemOrgUomContent = [] } = {},
        componentData: { content: componentContent = [] } = {},
        orderPricingVariableTable = null,
      },
      remote,
    } = this.props;
    const { handleSaveCheck } = remote?.props?.process || {};
    const { isEdit, diffDeleteFlag } = this.state;
    form.validateFields((err, formData) => {
      if (!err) {
        const itemAttributes = attributeData.map((item) => {
          if (item.isLocal) {
            const { itemAttributeId, isLocal, ...other } = item;
            return { ...other, itemId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemPartnerRels = partnerContent.map((item) => {
          if (item.isLocal) {
            const { partnerRelationId, isLocal, ...other } = item;
            return { ...other, itemId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemCategoryAssigns = categoryData.map((item) => {
          if (item.isLocal) {
            const { categoryAssignId, $form, _status, isLocal, ...other } = item;
            return { ...other, itemId, tenantId: organizationId };
          } else {
            const { $form, _status, ...otherItem } = item;
            return { ...otherItem };
          }
        });
        const itemOrgUoms = itemOrgUomContent.map((item) => {
          if (item.isLocal) {
            const { itemOrgUomId, isLocal, ...other } = item;
            return { ...other, itemId, tenantId: organizationId };
          } else {
            return item;
          }
        });

        let itemOrgRels = [];
        if (materielDetail.itemAllOrgFlag !== 1) {
          itemOrgRels = affliatedContent.map((item) => {
            if (item.isLocal) {
              const { orgRelationId, isLocal, ...other } = item;
              return { ...other, itemId, tenantId: organizationId };
            } else {
              return item;
            }
          });
        }
        const itemAttachments = enclosureDataSource.map((item) => {
          if (item.isLocal) {
            const { attachmentId, isLocal, ...other } = item;
            return { ...other, itemId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemComponents = componentContent.map((item) => {
          if (item.isLocal) {
            const { componentId, $form, isLocal, ...other } = item;
            return { ...other, itemId, tenantId: organizationId };
          } else {
            const { $form, _status, ...otherItem } = item;
            return otherItem;
          }
        });
        // if (formData.doubleChanged && itemId && doubleControlFlag) {
        //   this.setState({ tipModalVisible: true });
        // } else {

        const saveItem = (CuxSaveData) => {
          dispatch({
            type: 'materiel/saveAll',
            payload: {
              ...materielDetail,
              organizationId,
              itemAttributes,
              itemPartnerRels,
              itemCategoryAssigns,
              itemOrgRels,
              itemAttachments,
              itemComponents,
              itemOrgRelAttributeVO:
                materielDetail.itemAllOrgFlag === 1
                  ? {
                      ...affliatedContent[0],
                      dimensionQc: String(affliatedContent[0]?.dimensionQc),
                    }
                  : null,
              reservedScriptField1:
                orderPricingVariableTable ||
                (typeof window.getPriceAttrMsgData === 'function'
                  ? JSON.stringify(window.getPriceAttrMsgData())
                  : null), // 订单计价公式变量属性表格数据（海亮股份二开勿动)[230605: 一道新能源二开]
              itemOrgUoms,
              ...formData,
              ...this.TreeInputData,
              ...(CuxSaveData || {}),
              diffDeleteFlag,
              customizeUnitCode:
                'SMDM_MATERIEL_EDIT.MATERIEL_DETAIL,SMDM_MATERIEL_EDIT.DETAIL_ATTRIBUTE,SMDM_MATERIEL_ATTRIBUTETABLE.EDIT,SMDM_MATERIEL_COMPONENTTABLE.LIST,SMDM_MATERIEL_EDIT.EXPLAINTITLE,SMDM_MATERIEL_EDIT.COMMODITY,SMDM_MATERIEL_ATTACHMENT.LIST,SMDM_MATERIEL_ORG.LIST,SMDM_MATERIEL_ATTRIBUTETABLE.LIST,SMDM_MATERIEL_EDIT.UOM_LIST',
            },
          }).then((res) => {
            if (res) {
              const { itemId: id } = res;
              if (!isEdit) {
                history.push(`/smdm/materiel/detail/${id}`);
              } else {
                this.loadData(id);
              }
              if (typeof window.getPriceAttrMsgDs === 'function') {
                window.getPriceAttrMsgDs().query();
              }
              notification.success();
            }
          });
        };

        if (isFunction(handleSaveCheck)) {
          handleSaveCheck({ ...materielDetail, ...formData }, saveItem);
        } else {
          saveItem();
        }

        // }
      }
    });
  }

  /**
   * 启用作废
   * @param {boolean} flag - <>
   */
  @Bind()
  @Throttle(500)
  haldeEnabledFlag(flag) {
    const {
      dispatch,
      match: {
        params: { itemId },
      },
      organizationId,
      materiel: {
        materielDetail: { objectVersionNumber },
      },
    } = this.props;
    let interfaceName;
    if (flag) {
      interfaceName = 'enable';
    } else {
      interfaceName = 'disable';
    }
    dispatch({
      type: 'materiel/enabledFlag',
      payload: { itemId, interfaceName, organizationId, objectVersionNumber },
    }).then((res) => {
      if (res) {
        this.loadData(itemId);
        notification.success();
      }
    });
  }

  /**
   * 打开上传附件模态框
   */
  @Bind()
  showUploadModal() {
    this.setState({ uploadVisible: true });
  }

  /**
   * 关闭上传附件模态框
   */
  @Bind()
  handleCancel() {
    this.setState({ uploadVisible: false });
  }

  /**
   * 确定-附件上传Modal
   */
  @Bind()
  handleUploadOk() {
    const {
      dispatch,
      organizationId,
      user: {
        currentUser: { id, loginName, realName },
      },
      materiel: { enclosureDataSource = [] },
      match: {
        params: { itemId },
      },
    } = this.props;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map((file) => {
          return {
            attachmentId: uuid(),
            attachmentDesc: file.name,
            attachmentSize: file.size,
            attachmentUrl: file.response,
            uploadUserId: id,
            loginName,
            realName,
            // uploadDate: moment(file.lastModified).format(DEFAULT_DATETIME_FORMAT),
            remark: '',
            tenantId: organizationId,
            itemId,
            isLocal: true,
          };
        })
      : [];
    dispatch({
      type: 'materiel/updateState',
      payload: {
        enclosureDataSource: [...enclosureDataSource, ...fileData],
      },
    });
    this.setState({ uploadVisible: false, fileList: [] });
  }

  /**
   * 将上传列表放到state
   * @param {*} file - <>
   */
  @Bind()
  setFileList(file) {
    const { fileList = [] } = this.state;
    this.setState({
      fileList: [...fileList, file],
    });
  }

  /**
   * 上传前的校验
   * @param {*} file - <>
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 10 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: fileSize / (1024 * 1024),
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  /**
   * 方法含义？
   * @param {*} file - <>
   */
  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: 'smdm-materiel',
      fileName: file.name,
    };
  }

  /**
   * 上传change触发事件
   * @param {*} info - <>
   */
  @Bind()
  onDraggerUploadChange(info) {
    const { status, response } = info.file;
    if (status === 'done') {
      if (isString(response)) {
        notification.success();
        this.setFileList(info.file);
      } else {
        notification.error();
      }
    } else if (status === 'error') {
      notification.error(response);
    }
  }

  /**
   * 删除文件回调函数
   * @param {*} file - <>
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch, organizationId } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'materiel/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'smdm-materiel',
          urls: [file.response],
        },
      }).then((res) => {
        if (res) {
          notification.success();
        }
      });
      this.setState({
        fileList: fileList.filter((o) => o.uid !== file.uid),
      });
    }
  }

  /**
   * InputNumber精度控制
   * @param {String} aumontStr 金额字符串
   * @param {*} precision 精度
   * @returns
   */
  parseAumont = (aumontStr, precision) => {
    const arr = typeof aumontStr === 'string' ? aumontStr.split('.') : [];
    if (
      arr.length === 2 &&
      !isNaN(precision) &&
      precision !== null &&
      arr[1].length > Number(precision)
    ) {
      return `${arr[0]}.${arr[1].substr(0, Number(precision))}`;
    }
    return aumontStr;
  };

  /**
   * 基本信息表单渲染
   */
  renderBaseForm() {
    const {
      dispatch,
      form,
      demanding = false,
      organizationId,
      customizeForm = () => {},
      materiel: { materielDetail = {}, ExecutorData = [], ExtorPagination = {} },
      user: {
        currentUser: { id },
      },
      match,
    } = this.props;
    const {
      params: { itemId },
    } = match;
    const { getFieldDecorator, validateFields } = form;
    const { isEdit, itemNameTipFlag, doubleControlFlag } = this.state;
    const demandProp = {
      text: form.getFieldValue('demandExecutor'),
      demandValue: form.getFieldValue('demandExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'demandExecutor',
    };
    const orderExecutorProps = {
      text: form.getFieldValue('orderExecutor'),
      orderExecutorValue: form.getFieldValue('orderExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'orderExecutor',
    };
    const sourceExecutorProps = {
      text: form.getFieldValue('sourceExecutor'),
      orderExecutorValue: form.getFieldValue('sourceExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'sourceExecutor',
    };
    getFieldDecorator('demandExecutorBys', { initialValue: materielDetail.demandExecutorBys });
    getFieldDecorator('orderExecutorBys', { initialValue: materielDetail.orderExecutorBys });
    getFieldDecorator('sourceExecutorBys', { initialValue: materielDetail.sourceExecutorBys });
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_EDIT.MATERIEL_DETAIL', // 必传，和unitCode一一对应
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
              {getFieldDecorator('itemCode', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
                    }),
                  },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
                initialValue: materielDetail.itemCode,
              })(
                <Input
                  inputChinese={false}
                  disabled={isEdit}
                  // onBlur={() => {
                  //   this.checkValid(form, 'itemCode', getFieldValue('itemCode'));
                  // }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.originItemCode').d('原始物料编码')}
            >
              {getFieldDecorator('originItemCode', {
                initialValue: materielDetail.originItemCode,
              })(<span>{materielDetail.originItemCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.itemName').d('物料名称')}
            >
              <Tooltip
                placement="topLeft"
                title={form.getFieldValue('itemName')}
                visible={itemNameTipFlag && form.getFieldValue('itemName')}
              />
              {getFieldDecorator('itemName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
                    }),
                  },
                  {
                    max: 600,
                    message: intl.get('hzero.common.validation.max', {
                      max: 600,
                    }),
                  },
                ],
                initialValue: materielDetail.itemName,
              })(
                <TLEditor
                  onMouseOver={() => this.setState({ itemNameTipFlag: true })}
                  onMouseOut={() => this.setState({ itemNameTipFlag: false })}
                  onFocus={() => this.setState({ itemNameTipFlag: true })}
                  onBlur={() => this.setState({ itemNameTipFlag: false })}
                  disabled={isEdit}
                  inputSize={{ zh: 700, en: 700 }}
                  label={intl.get('smdm.materiel.model.materiel.itemName').d('物料名称')}
                  field="itemName"
                  token={materielDetail._token}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.itemNumber`).d('云平台物料编码')}
            >
              {getFieldDecorator('itemNumber', {
                initialValue: materielDetail.itemNumber,
              })(<Input disabled inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.commonName`).d('通用名')}
            >
              {getFieldDecorator('commonName', {
                initialValue: materielDetail.commonName,
                rules: [
                  {
                    max: 700,
                    message: intl.get('hzero.common.validation.max', {
                      max: 700,
                    }),
                  },
                ],
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.categoryNameType`).d('平台分类')}
            >
              {getFieldDecorator('industryCategoryId', {
                initialValue: materielDetail.industryCategoryId,
              })(<Lov code="HPFM.INDUSTRY_CATEGORY" textValue={materielDetail.categoryName} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.sourceCode`).d('数据来源')}
            >
              {getFieldDecorator('sourceCode', {
                // rules: [{ required: true, message: '数据来源不能为空!' }],
                initialValue: materielDetail.sourceCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位')}
            >
              {getFieldDecorator('primaryUomName', {
                initialValue: materielDetail.primaryUomName,
              })}
              {getFieldDecorator('primaryUomCode', {
                initialValue: materielDetail.primaryUomCode,
              })}
              {getFieldDecorator('primaryUomId', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`smdm.materiel.model.materiel.primaryUomName`)
                        .d('基本计量单位'),
                    }),
                  },
                ],
                initialValue: materielDetail.primaryUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.primaryUomName}
                  queryParams={{ enabledFlag: 1 }}
                  onChange={(_, record) => {
                    form.setFieldsValue({
                      primaryUomName: record.uomCodeAndName,
                      primaryUomCode: record.uomCode,
                    });
                  }}
                  disabled={itemId && materielDetail?.primaryUomId && doubleControlFlag}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.doubleUomName`).d('双单位')}
            >
              {getFieldDecorator('doubleUomCode', {
                initialValue: materielDetail.doubleUomCode,
              })}
              {getFieldDecorator('doubleUomName', {
                initialValue: materielDetail.doubleUomName,
              })}
              {getFieldDecorator('biUomId', {
                initialValue: materielDetail.biUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.doubleUomName}
                  onChange={(_, record) => {
                    form.setFieldsValue({
                      doubleUomName: record.uomCodeAndName,
                      doubleUomCode: record.uomCode,
                    });
                  }}
                  queryParams={{ enabledFlag: 1 }}
                />
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
              {getFieldDecorator('newUomConversionRate', {
                initialValue: materielDetail.primaryUomScale && materielDetail.secondaryUomScale,
                // rules: [
                //   {
                //     required:
                //       itemId &&
                //       (materielDetail?.primaryUomScale || materielDetail?.secondaryUomScale) &&
                //       doubleControlFlag,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`smdm.materiel.model.materiel.unitUomConversionRate`)
                //         .d('基本单位与辅助单位转换率'),
                //     }),
                //   },
                // ],
              })(
                <UomConversion
                  materielDetail={materielDetail}
                  onChange={() => {
                    validateFields(['newUomConversionRate'], { force: true });
                  }}
                  doubleControl={itemId && doubleControlFlag}
                  disabled={
                    itemId &&
                    (materielDetail?.primaryUomScale || materielDetail?.secondaryUomScale) &&
                    doubleControlFlag
                  }
                  form={form}
                />
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
              {getFieldDecorator('uomConversionRate', {
                initialValue: materielDetail.uomConversionRate,
                // rules: [
                //   {
                //     required: itemId && materielDetail?.uomConversionRate && doubleControlFlag,
                //     message: intl.get('hzero.common.validation.notNull', {
                //       name: intl
                //         .get(`smdm.materiel.model.materiel.unitUomConversionRate`)
                //         .d('基本单位与辅助单位转换率'),
                //     }),
                //   },
                // ],
              })(
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={(value) => `1:${value}`}
                  parser={(value) => this.parseAumont(value?.replace('1:', ''), 8)}
                  max={99999999.99999999}
                  min={0.00000001}
                  disabled={itemId && materielDetail?.uomConversionRate && doubleControlFlag}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.secondaryUomName`).d('辅助计量单位')}
            >
              {getFieldDecorator('secondaryUomId', {
                initialValue: materielDetail.secondaryUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.secondaryUomName}
                  queryParams={{ enabledFlag: 1 }}
                  disabled={itemId && materielDetail?.secondaryUomId && doubleControlFlag}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.packingUomName`).d('包装单位')}
            >
              {getFieldDecorator('packingUomId', {
                initialValue: materielDetail.packingUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.packingUomName}
                  queryParams={{ enabledFlag: 1 }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.taxDescription`).d('默认税种/税率')}
            >
              {getFieldDecorator('taxId', {
                initialValue: materielDetail.taxId,
              })(
                // taxRate
                // 展示效果将税码与税率拼接：税码-税值
                <Lov
                  code="SMDM.TAX"
                  textValue={
                    materielDetail.taxDescription &&
                    `${materielDetail.taxDescription} - ${materielDetail.taxRate}`
                  }
                  queryParams={{ enabledFlag: 1 }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.grossWeight`).d('毛重')}
            >
              {getFieldDecorator('grossWeight', {
                initialValue: materielDetail.grossWeight,
              })(<InputNumber style={{ width: '100%' }} precision={10} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.netWeight`).d('净重')}
            >
              {getFieldDecorator('netWeight', {
                initialValue: materielDetail.netWeight,
              })(<InputNumber style={{ width: '100%' }} precision={10} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.weightUomName`).d('重量单位')}
            >
              {getFieldDecorator('weightUomId', {
                initialValue: materielDetail.weightUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.weightUomName}
                  queryParams={{ enabledFlag: 1 }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.volume`).d('体积')}
            >
              {getFieldDecorator('volume', {
                initialValue: materielDetail.volume,
              })(<InputNumber style={{ width: '100%' }} precision={2} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.volumeUomName`).d('体积单位')}
            >
              {getFieldDecorator('volumeUomId', {
                initialValue: materielDetail.volumeUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.volumeUomName}
                  queryParams={{ enabledFlag: 1 }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.purchaseAgent`).d('采购员')}
            >
              {getFieldDecorator('purchaseAgentId', {
                initialValue: materielDetail.purchaseAgentId,
              })(
                <Lov
                  code="SPFM.USER_AUTH.PURCHASE_AGENT"
                  textValue={materielDetail.purchaseAgentName}
                  queryParams={{ tenantId: organizationId, userId: id }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.minPackQuantity`).d('最小包装数量')}
            >
              {getFieldDecorator('packMinQuantity', {
                initialValue: materielDetail.packMinQuantity,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.chartCode`).d('图号')}
            >
              {getFieldDecorator('chartCode', {
                initialValue: materielDetail.chartCode,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.drawingVersion`).d('图纸版本')}
            >
              {getFieldDecorator('drawingVersion', {
                initialValue: materielDetail.drawingVersion,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.safetyStockQuantity`).d('安全库存数')}
            >
              {getFieldDecorator('safetyStockQuantity', {
                initialValue: materielDetail.safetyStockQuantity,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.exemptInspectionFlag`).d('是否免检')}
            >
              {getFieldDecorator('exemptInspectionFlag', {
                initialValue: materielDetail.exemptInspectionFlag
                  ? materielDetail.exemptInspectionFlag
                  : 0,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.batchManagementFlag`).d('是否批次管理')}
            >
              {getFieldDecorator('batchManagementFlag', {
                initialValue: materielDetail.batchManagementFlag
                  ? materielDetail.batchManagementFlag
                  : 0,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.nonProduceInvManageFlag`)
                .d('是否开启非生库存管理')}
            >
              {getFieldDecorator('nonProduceInvManageFlag', {
                initialValue: materielDetail.nonProduceInvManageFlag
                  ? materielDetail.nonProduceInvManageFlag
                  : 0,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.nonProduceInvBatch`).d('非生库存批次')}
            >
              {getFieldDecorator('nonProduceInvBatch', {
                initialValue: materielDetail?.nonProduceInvBatch,
              })(
                <Lov
                  code="STCK.STOCK_STRATEGY_RELEASED"
                  queryParams={{ tenantId: organizationId }}
                  textValue={materielDetail.nonProduceInvBatchName}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.plannedPrice`).d('计划价格')}
            >
              {getFieldDecorator('plannedPrice', {
                initialValue: materielDetail.plannedPrice,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.externalItemGroup`).d('外部物料组')}
            >
              {getFieldDecorator('externalItemGroup', {
                initialValue: materielDetail.externalItemGroup,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.externalItemDesc`).d('外部物料组描述')}
            >
              {getFieldDecorator('externalItemGroupDescription', {
                initialValue: materielDetail.externalItemGroupDescription,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.totalShelfLife`).d('总货架寿命(天)')}
            >
              {getFieldDecorator('totalShelfLife', {
                initialValue: materielDetail.totalShelfLife,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.procurementId`).d('采购单位')}
            >
              {getFieldDecorator('orderUomId', {
                initialValue: materielDetail.orderUomId,
              })(
                <Lov
                  code="SMDM.ITEM.UOM.ORG"
                  textValue={materielDetail.orderUomName}
                  queryParams={{ enabledFlag: 1 }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.minDeliveryRate`).d('交货不足限度(%)')}
            >
              {getFieldDecorator('minDeliveryRate', {
                initialValue: materielDetail.minDeliveryRate,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.maxDeliveryRate`).d('过量交货限度(%)')}
            >
              {getFieldDecorator('maxDeliveryRate', {
                initialValue: materielDetail.maxDeliveryRate,
              })(<InputNumber style={{ width: '100%' }} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.demandExecutor`).d('需求执行人')}
            >
              {getFieldDecorator('demandExecutor', {
                initialValue: materielDetail.demandExecutor,
              })(<DemandExecutorModal {...demandProp} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.orderExecutor`).d('订单执行人')}
            >
              {getFieldDecorator('orderExecutor', {
                initialValue: materielDetail.orderExecutor,
              })(<DemandExecutorModal {...orderExecutorProps} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.sourceExecutor`).d('寻源执行人')}
            >
              {getFieldDecorator('sourceExecutor', {
                initialValue: materielDetail.sourceExecutor,
              })(<DemandExecutorModal {...sourceExecutorProps} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.firstReminderList`)
                .d('第一封催询单(天数)')}
            >
              {getFieldDecorator('firstReminderList', {
                initialValue: materielDetail.firstReminderList,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.secondReminderList`)
                .d('第二封催询单(天数)')}
            >
              {getFieldDecorator('secondReminderList', {
                initialValue: materielDetail.secondReminderList,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={0} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get(`smdm.materiel.model.materiel.thirdReminderList`)
                .d('第三封催询单(天数)')}
            >
              {getFieldDecorator('thirdReminderList', {
                initialValue: materielDetail.thirdReminderList,
              })(<InputNumber style={{ width: '100%' }} precision={0} min={0} />)}
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
                  showRemoveIcon
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
              label={intl.get(`smdm.materiel.model.materiel.ifVMI`).d('是否VMI')}
            >
              {getFieldDecorator('vmiFlag', {
                initialValue: materielDetail.vmiFlag,
              })(
                !itemId ? (
                  <Checkbox checkedValue={1} unCheckedValue={0} />
                ) : (
                  <span>
                    {materielDetail.vmiFlag
                      ? intl.get('hzero.common.status.yes').d('是')
                      : intl.get('hzero.common.status.no').d('否')}
                  </span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.ifSupplyControlFlag`).d('是否货源管控')}
            >
              {getFieldDecorator('supplyControlFlag', {
                initialValue: materielDetail.supplyControlFlag,
              })(
                !itemId ? (
                  <Checkbox checkedValue={1} unCheckedValue={0} />
                ) : (
                  <span>
                    {materielDetail.supplyControlFlag
                      ? intl.get('hzero.common.status.yes').d('是')
                      : intl.get('hzero.common.status.no').d('否')}
                  </span>
                )
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
                  showRemoveIcon
                  filePreview
                  bucketName={PUBLIC_BUCKET}
                  bucketDirectory="smdm-materiel"
                  listType="picture-card"
                />
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
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.purchaseOrderRemark`).d('采购订单文本')}
            >
              {getFieldDecorator('purchaseOrderRemark', {
                initialValue: materielDetail.purchaseOrderRemark,
              })(<TextArea />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 物料属性表单渲染
   */
  renderAttributeForm() {
    const {
      customizeForm,
      form,
      form: { getFieldDecorator, setFieldsValue },
      materiel: { materielDetail = {}, ABCList = [] },
    } = this.props;
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_EDIT.DETAIL_ATTRIBUTE', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
        isCreate: true,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.brand`).d('品牌')}
            >
              {getFieldDecorator('brand', {
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
                initialValue: materielDetail.brand,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.origin`).d('产地')}
            >
              {getFieldDecorator('origin', {
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
                initialValue: materielDetail.origin,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.importFlag`).d('是否进口')}
            >
              {getFieldDecorator('importFlag', {
                initialValue: materielDetail.importFlag ? materielDetail.importFlag : 0,
              })(<Switch />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.specifications`).d('规格')}
            >
              {getFieldDecorator('specifications', {
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', {
                      max: 480,
                    }),
                  },
                ],
                initialValue: materielDetail.specifications,
              })(
                <TLEditor
                  inputSize={{ zh: 480, en: 480 }}
                  label={intl.get(`smdm.materiel.model.materiel.specifications`).d('规格')}
                  field="specifications"
                  token={materielDetail._token}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.model`).d('型号')}
            >
              {getFieldDecorator('model', {
                rules: [
                  {
                    max: 480,
                    message: intl.get('hzero.common.validation.max', {
                      max: 480,
                    }),
                  },
                ],
                initialValue: materielDetail.model,
              })(
                <TLEditor
                  inputSize={{ zh: 480, en: 480 }}
                  label={intl.get(`smdm.materiel.model.materiel.model`).d('型号')}
                  field="model"
                  token={materielDetail._token}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.agentCompanyName`).d('代理商')}
            >
              {getFieldDecorator('agentCompanyName', {
                initialValue: materielDetail.agentCompanyName,
              })}
              {getFieldDecorator('agentCompanyId', {
                initialValue: materielDetail.agentCompanyId,
              })(
                <Lov
                  // isInput
                  code="SPFM.USER_AUTH.SUPPLIER"
                  textValue={materielDetail.agentCompanyName}
                  onChange={(_, record) => {
                    setFieldsValue({
                      agentCompanyId: record?.supplierCompanyId,
                      agentCompanyName: record?.supplierCompanyName,
                    });
                  }}
                  lovOptions={{
                    valueField: 'supplierCompanyId',
                    displayField: 'supplierCompanyName',
                  }}
                />
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
              {getFieldDecorator('manufacturerCompanyName', {
                initialValue: materielDetail.manufacturerCompanyName,
              })}
              {getFieldDecorator('manufacturerCompanyId', {
                initialValue: materielDetail.manufacturerCompanyId,
              })(
                <Lov
                  // isInput
                  code="SPFM.USER_AUTH.SUPPLIER"
                  textValue={materielDetail.manufacturerCompanyName}
                  onChange={(_, record) => {
                    setFieldsValue({
                      manufacturerCompanyId: record?.supplierCompanyId,
                      manufacturerCompanyName: record?.supplierCompanyName,
                    });
                  }}
                  lovOptions={{
                    valueField: 'supplierCompanyId',
                    displayField: 'supplierCompanyName',
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.itemAbc`).d('物料ABC属性')}
            >
              {getFieldDecorator('itemAbc', {
                initialValue: materielDetail.itemAbc,
              })(
                <Select allowClear>
                  {ABCList.map((m) => {
                    return (
                      <Select.Option key={m.value} value={m.value}>
                        {m.meaning}
                      </Select.Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  /**
   * 物料说明表单渲染
   */
  renderExplainForm() {
    const {
      form,
      materiel: { materielDetail = {} },
      customizeForm,
    } = this.props;
    const { getFieldDecorator = (E) => E } = form;
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_EDIT.EXPLAINTITLE', // 必传，和unitCode一一对应
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
              {getFieldDecorator('eanCode', {
                rules: [
                  {
                    max: 20,
                    message: intl.get('hzero.common.validation.max', {
                      max: 20,
                    }),
                  },
                ],
                initialValue: materielDetail.eanCode,
              })(<Input trim typeCase="upper" inputChinese={false} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.itemManageMethod`).d('物料管理方式')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('itemManageMethod', {
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
                initialValue: materielDetail.itemManageMethod,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.quotaManageType`).d('物料配额管理类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('quotaManageType', {
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
                initialValue: materielDetail.quotaManageType,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.lotNumberingRule`).d('批号规则')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('lotNumberingRule', {
                rules: [
                  {
                    max: 50,
                    message: intl.get('hzero.common.validation.max', {
                      max: 50,
                    }),
                  },
                ],
                initialValue: materielDetail.lotNumberingRule,
              })(<Input />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.usedItemCode`).d('旧物料号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('usedItemCode', {
                initialValue: materielDetail.usedItemCode,
              })(<Input disabled={(materielDetail.sourceCode || 'SRM') !== 'SRM'} />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.productHierarchies`).d('产品层次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('productHierarchies', {
                initialValue: materielDetail.productHierarchies,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`smdm.materiel.model.materiel.explainTitle`).d('物料说明')}>
              {getFieldDecorator('remark', {
                initialValue: materielDetail.remark,
              })(<TextArea />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  getTreeInput(taxItemId = null, fn) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `materiel/queryTreeData`,
      payload: {
        organizationId,
        taxItemId,
      },
    }).then(fn);
  }

  @Bind()
  getTaxationData(page = {}, taxItemId = null, fn) {
    const { dispatch, organizationId } = this.props;
    dispatch({
      type: `materiel/queryTaxationData`,
      payload: {
        page,
        organizationId,
        taxItemId,
      },
    }).then(fn);
  }

  /**
   * 税收商品信息
   */
  renderCommodityForm() {
    const {
      form,
      materiel: {
        TaxFreeType = [], // 免税类型值级
        FerentialMark = [], // 优惠政策值级
        materielDetail = {},
      },
      queryTreeDataing = false,
      queryTaxationDataing = false,
      customizeForm,
    } = this.props;
    const { getFieldDecorator } = form;
    const TreeInputProps = {
      queryTreeDataing,
      getTreeInput: this.getTreeInput,
      queryTaxationDataing,
      getTaxationData: this.getTaxationData,
      form,
    };
    return customizeForm(
      {
        code: 'SMDM_MATERIEL_EDIT.COMMODITY', // 必传，和unitCode一一对应
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
              {getFieldDecorator('taxFreeType', {
                initialValue: materielDetail.taxFreeType,
              })(
                <Select allowClear>
                  {TaxFreeType.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.discountFlag`).d('是否使用优惠政策')}
            >
              {getFieldDecorator('preferentialMarkFlag', {
                initialValue: materielDetail.preferentialMarkFlag,
              })(<Switch />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get('smdm.materiel.model.materiel.discountType').d('优惠政策类型')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('preferentialMark', {
                initialValue: materielDetail.preferentialMark,
              })(
                <Select allowClear>
                  {FerentialMark.map((item) => (
                    <Select.Option key={item.value} value={item.value}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
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
              {getFieldDecorator('taxItemCode')(
                <TreeInput
                  setTreeInputData={this.setTreeInputData}
                  initialValue={materielDetail.taxItemCode}
                  TreeInputProps={TreeInputProps}
                />
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.commodityName').d('税收商品名称')}
            >
              {getFieldDecorator('taxItemName', {
                initialValue: materielDetail.taxItemName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.commoditySimple').d('税收商品简称')}
            >
              {getFieldDecorator('taxItemSimpleName', {
                initialValue: materielDetail.taxItemSimpleName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  fetchDataCategories(params) {
    const { dispatch, form, remote } = this.props;
    const { itemCategoryQueryParams } = remote?.props?.process || {};
    const cuxParmas = isFunction(itemCategoryQueryParams) ? itemCategoryQueryParams(form) : {};
    console.log(cuxParmas, itemCategoryQueryParams, form, form.getFieldValue('userAuthorityFlag'));

    return dispatch({
      type: `materiel/fetchDataCategories`,
      payload: { ...params, ...cuxParmas, customizeUnitCode: 'SMDM_MATERIEL_CATEGORY.LIST' },
    });
  }

  /**
   * 送货单明细折叠
   */
  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  handleStateUpdate(key, value) {
    if (key && value) {
      const { dispatch } = this.props;
      dispatch({
        type: 'materiel/updateState',
        payload: {
          [key]: value,
        },
      });
    }
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

  @Bind()
  handleDrawInfoModel() {
    this.setState({ drawInfoVisible: true });
  }

  @Bind()
  getButtons() {
    const {
      loading = false,
      saving = false,
      enabling = false,
      remote,
      deleteLoading = false,
      match: {
        params: { itemId },
      },
      materiel: {
        materielDetail: { enabledFlag },
      },
    } = this.props;
    const { handleHeadBtn } = remote?.props?.process ?? {};
    const buttons = [
      <Button
        icon="save"
        type="primary"
        loading={saving || loading || deleteLoading}
        onClick={this.validateSave}
      >
        {intl.get('hzero.common.button.save').d('保存')}
      </Button>,
      itemId &&
        ([0, '0'].includes(enabledFlag) ? (
          <PermissionButton
            type="c7n-pro"
            icon="check-circle"
            loading={enabling || loading || deleteLoading}
            onClick={() => {
              this.haldeEnabledFlag(true);
            }}
            permissionList={[
              {
                code: 'srm.bg.manager.mdm.materiel.button.enable',
                type: 'button',
                meaning: '启用',
              },
            ]}
          >
            {intl.get('smdm.materiel.view.option.Enable').d('启用')}
          </PermissionButton>
        ) : (
          <>
            <PermissionButton
              type="c7n-pro"
              icon="cancel"
              loading={enabling || loading || deleteLoading}
              onClick={() => {
                this.haldeEnabledFlag(false);
              }}
              permissionList={[
                {
                  code: 'srm.bg.manager.mdm.materiel.button.disable',
                  type: 'button',
                  meaning: '作废',
                },
              ]}
            >
              {intl.get('smdm.materiel.view.option.blankOut').d('作废')}
            </PermissionButton>
          </>
        )),
      itemId && (
        <Button
          icon="exception"
          // type="primary"
          loading={loading}
          onClick={this.handleOperationModel}
        >
          {intl
            .get('smdm.materialApplication.model.materialApplication.operationRecords')
            .d('操作记录')}
        </Button>
      ),
      itemId && (
        <PermissionButton
          icon="profile"
          // type="primary"
          loading={loading}
          onClick={this.handleDrawInfoModel}
          permissionList={[
            {
              code: `srm.bg.manager.mdm.materiel.button.drawinfo`,
              type: 'button',
              meaning: '图纸信息',
            },
          ]}
        >
          {intl.get('smdm.materialApplication.model.materialApplication.drawInfo').d('图纸信息')}
        </PermissionButton>
      ),
    ];

    if (handleHeadBtn && typeof handleHeadBtn === 'function') {
      return handleHeadBtn({ buttons, current: this });
    }

    return buttons;
  }

  @Bind()
  getTabPanes() {
    const {
      organizationId = false,
      demanding = false,
      dispatch,
      match: {
        params: { itemId },
      },
      user: { currentUser = {} },
      materiel: {
        materielDetail: { queryAllFlag, itemAllOrgFlag, primaryUomName, primaryUomId },
        attributeData = [],
        partnerData = {},
        categoryData = [],
        affliatedData = {},
        enclosureDataSource = [],
        itemOrgUomData = {},
        allowExcessTypeList = [],
        ExecutorData = [],
        ExtorPagination = {},
        dimensionQcList = [],
        componentData = {},
      },
      customizeTable,
      customizeForm,
      remote,
      // form: { setFieldsValue },
    } = this.props;
    const { id } = currentUser;
    const { isEdit, visabled, doubleControlFlag } = this.state;
    const defaultProps = {
      categoryTableEditAble: true,
      affiliatedOrgTableEditAble: true,
    };
    /**
     * 注意！！！使用该埋点的时候返回的数据一定要带上defaultProps, 例如 return { ...defaultProps, categoryTableEditAble: false  };
     * 未来可能还会在 defaultProps添加其他二开参数。
     */
    const { categoryTableEditAble, affiliatedOrgTableEditAble } = remote
      ? remote.process('SMDM_ITEM_DETAIL.GET_RENDERPROPS', defaultProps, { current: this })
      : defaultProps;
    const attributeTableProps = {
      dataSource: attributeData,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onTableChange: this.handleTableChange,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      itemId,
      customizeTable,
      customizeForm,
    };
    const partnerTableProps = {
      isEdit,
      itemId,
      dataSource: partnerData,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onValid: this.checkPartnerValid,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
    };
    const categoryTableProps = {
      isEdit,
      itemId,
      customizeTable,
      editAble: categoryTableEditAble,
      dataSource: categoryData,
      remote: this.props.remote,
      onTableChange: this.handleTableChange,
      fetchCategoryTemplate: this.fetchCategoryTemplate,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onValid: this.checkValid,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      fetchDataCategories: this.fetchDataCategories,
      handleStateUpdate: this.handleStateUpdate,
    };
    const AffiliatedOrgTableProps = {
      // text:form.getFieldValue("demandExecutor"),
      // demandValue:form.getFieldValue("demandExecutorBys"),
      dispatch,
      editAble: affiliatedOrgTableEditAble,
      ExecutorData,
      ExtorPagination,
      // onChange:this.onExecutorChange,
      demanding,
      dimensionQcList,
      customizeTable,
      allowExcessTypeList,
      isEdit,
      queryAllFlag,
      itemAllOrgFlag: itemAllOrgFlag || 0,
      dataSource: affliatedData,
      organizationId,
      itemId,
      id,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onValid: this.checkValid,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      customizeForm,
    };
    const ItemOrgUomTableProps = {
      isEdit,
      primaryUomName,
      primaryUomId,
      dataSource: itemOrgUomData,
      organizationId,
      itemId,
      doubleControlFlag,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      customizeTable,
      customizeForm,
    };
    const enclosureTableProps = {
      dataSource: enclosureDataSource,
      currentUser,
      customizeTable,
      customizeForm,
      itemId,
      remote: this.props.remote,
      onUpload: this.showUploadModal,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
    };
    const componentTableProps = {
      dataSource: componentData,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onTableChange: this.handleTableChange,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      itemId,
      customizeTable,
      customizeForm,
      remote: this.props.remote,
    };
    const tabPanes = [
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.categoryTable`).d('自主品类分配物料')}
        key="categoryTable"
      >
        <CategoryTable {...categoryTableProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.affiliatedOrgTable`).d('所属组织')}
        key="affiliatedOrgTable"
      >
        <AffiliatedOrgTable {...AffiliatedOrgTableProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.attributeTable`).d('自定义物品属性')}
        key="attributeTable"
      >
        <AttributeTable {...attributeTableProps} />
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.partnerTable`).d('客户物料')}
        key="partnerTable"
        forceRender={!visabled}
      >
        {visabled && <PartnerTable {...partnerTableProps} />}
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.itemOrgUomTable`).d('单位转换关系')}
        key="itemOrgUomTable"
        forceRender={!visabled}
      >
        {visabled && <ItemOrgUomTable {...ItemOrgUomTableProps} />}
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.enclosure`).d('附件信息')}
        key="enclosure"
        forceRender={!visabled}
      >
        {visabled && <EnclosureTable {...enclosureTableProps} />}
      </Tabs.TabPane>,
      <Tabs.TabPane
        tab={intl.get(`smdm.materiel.view.message.tab.componentTable`).d('组件清单')}
        key="componentTable"
        forceRender={!visabled}
      >
        {visabled && <ComponentTable {...componentTableProps} />}
      </Tabs.TabPane>,
    ];
    if (!remote) return tabPanes;
    return remote.process('SMDM_ITEM_DETAIL_CUX_TABS', tabPanes, {
      current: this,
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      loading = false,
      organizationId = false,
      match: {
        params: { itemId },
      },
      customizeCollapse,
      customizeTabPane,
      // form: { setFieldsValue },
    } = this.props;
    const { uploadVisible, isEdit, collapseKeys, tabsActiveKey, drawInfoVisible } = this.state;
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const draggerUploadProps = {
      name: 'file',
      multiple: true,
      // accept: 'image/*',
      data: this.uploadData,
      headers,
      action: `${HZERO_FILE}/v1/${organizationId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
    };
    return (
      <React.Fragment>
        <Spin spinning={isEdit ? loading : null}>
          <Header
            title={
              isEdit
                ? intl.get(`smdm.materiel.view.message.title.detail.edit`).d('编辑物料')
                : intl.get(`smdm.materiel.view.message.title.detail.create`).d('新建物料')
            }
            backPath="/smdm/materiel/list"
          >
            {this.getButtons()}
          </Header>
          <Content
            wrapperClassName={`${DETAIL_DEFAULT_CLASSNAME} ${styles['overflow-detail-content']}`}
          >
            {customizeCollapse(
              {
                code: 'SMDM_MATERIEL_EDIT.BASIC',
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
            {/* <div className={styles['form-info']}>
              <Divider orientation="left" style={{fontSize: "16px"}}>
                {intl.get(`smdm.materiel.view.message.base`).d('基本信息')}
              </Divider>
              {this.renderBaseForm()}
            </div>
            <div className={styles['form-info']}>
              <Divider orientation="left" style={{fontSize: "16px"}}>
                {intl.get(`smdm.materiel.view.message.attribute`).d('物料属性')}
              </Divider>
              {this.renderAttributeForm()}
            </div>
            <div className={styles['form-info']}>
              <Divider orientation="left" style={{fontSize: "16px"}}>
                {intl.get(`smdm.materiel.view.message.explain`).d('物料说明')}
              </Divider>
              {this.renderExplainForm()}
            </div> */}
            {customizeTabPane(
              {
                code: 'SMDM_MATERIEL_EDIT.TABS',
              },
              <Tabs
                defaultActiveKey={tabsActiveKey}
                animated={false}
                onChange={(key) => {
                  this.setState({ tabsActiveKey: key });
                }}
              >
                {this.getTabPanes()}
              </Tabs>
            )}
          </Content>
        </Spin>
        <Modal
          title={intl.get(`hzero.common.upload.text`).d('上传附件')}
          visible={uploadVisible}
          onOk={this.handleUploadOk}
          onCancel={this.handleCancel}
          destroyOnClose
          width={520}
        >
          <Dragger {...draggerUploadProps}>
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text">
              {intl
                .get(`hzero.common.upload.content`)
                .d('单击或拖动附件(10Mb以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>
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
        {/* {tipModalVisible && (
          <Modal
            title={intl.get(`smdm.currencyOrg.model.TipTitle`).d('温馨提示')}
            destroyOnClose
            visible={tipModalVisible}
            onOk={() => {
              this.setState({ tipModalVisible: false }, () => {
                setFieldsValue({ doubleChanged: false });
                this.handleSave();
              });
            }}
            onCancel={() => {
              this.setState({ tipModalVisible: false });
            }}
          >
            <div>
              {intl
                .get(`smdm.materiel.model.doubelChange.tip`)
                .d(
                  '开启双单位时，变更基本单位、辅助单位或转换率会导致单据间数据异常，请确认是否继续变更。'
                )}
            </div>
          </Modal>
        )} */}
        {drawInfoVisible && (
          <Modal
            title={intl
              .get('smdm.materialApplication.model.materialApplication.drawInfo')
              .d('图纸信息')}
            destroyOnClose
            visible={drawInfoVisible}
            onOk={() => {
              this.setState({ drawInfoVisible: false });
            }}
            onCancel={() => {
              this.setState({ drawInfoVisible: false });
            }}
            footer={null}
          >
            <DrawInfo href={`/smdm/draw-info?itemIds=${itemId}&isBatch=0`} />
          </Modal>
        )}
      </React.Fragment>
    );
  }
}
