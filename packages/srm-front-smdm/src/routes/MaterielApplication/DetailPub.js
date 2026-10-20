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
  Collapse,
  Checkbox,
} from 'hzero-ui';
import { isEmpty, isString, isArray, isFunction } from 'lodash';
import { Bind, Throttle } from 'lodash-decorators';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '_utils/config';
import { Attachment, Modal as C7NModal, DataSet } from 'choerodon-ui/pro';
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
import {
  getCurrentOrganizationId,
  getAccessToken,
  filterNullValueObject,
  createPagination,
  getResponse,
} from 'utils/utils';
import { HZERO_FILE } from 'utils/config';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import WithCustomize from 'srm-front-cuz/lib/h0Customize';
import SrmUpload from 'srm-front-boot/lib/components/Upload/index';
import { Button as PermissionButton } from 'components/Permission';
import { queryReqOperation, queryReqApprove, fetchUomControl } from '@/services/materielService';
import { fetchDoExecute, getCategoryTemplate } from '@/services/materielApplicationService';
import { queryBatchApprovaFlag } from '_utils/utils';
import { dateTimeRender } from 'hzero-front/lib/utils/renderer'; // 日期时间格式化
import { openApproveModal } from 'srm-front-boot/lib/components/ApproveModal';
import { revokeWorkFlowByKey } from '@/services/materialCertificationPoolService';
import { getBatchOperationFlag } from '../MaterialCertificationPool/util';
import AttributeTable from './Tables/AttributeTable';
import PartnerTable from './Tables/PartnerTable';
import CategoryTable from './Tables/CategoryTable';
import AffiliatedOrgTable from './Tables/AffiliatedOrgTable';
import EnclosureTable from './Tables/EnclosureTable';
import ItemOrgUomTable from './Tables/ItemOrgUomTable';
import ComponentTable from './Tables/ComponentTable';
import { TreeInput } from './TreeInput';
import DemandExecutorModal from './Tables/demandExecutorModal';
import OperationModel from '../Materiel/OperationModel';
import UomConversion from './components/UomConversion';
import { changeInfoDs } from './changeInfoDs';
import ChangeInfo from './changeInfo';

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
    code: 'SMDM_ITEM_APPLICATION_DETAIL', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      handleSaveCheck: undefined,
      disableCompentPrecision: undefined,
    },
  }
)
@WithCustomize({
  unitCode: [
    'SMDM_MATERIELAPPLICATION_EDIT.TABS',
    'SMDM_MATERIELAPPLICATION_EDIT.BASIC',
    'SMDM_MATERIELAPPLICATION_EDIT.BASE',
    'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE',
    'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.EDITFORM',
    'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.TABLE',
    'SMDM_MATERIELAPPLICATION_ORG.EDITFORM',
    'SMDM_MATERIELAPPLICATION_EDIT.COMMODITY',
    'SMDM_MATERIELAPPLICATION_EDIT.EXPLAINTITLE',
    'SMDM_MATERIELAPPLICATION_ORG.TABLE',
    'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.TABLE',
    'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.EDITFORM',
    'SMDM_MATERIELAPPLICATION_CATEGORY.LIST',
    'SMDM_MATERIELAPPLICATION_ATTACHMENT.LIST',
    'SMDM_MATERIELAPPLICATION_ATTACHMENT.EDIT_FROM',
    'SMDM_MATERIELAPPLICATION_EDIT.CATEGORY_BTNS',
    'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE_BTNS',
    'SMDM_MATERIELAPPLICATION_EDIT.UOM_LIST_NEW',
    'SMDM_MATERIELAPPLICATION_EDIT.UOM_FORM_NEW',
  ],
})
@connect(({ materielApplicationPub, user, loading }) => ({
  materielApplicationPub,
  user,
  loading:
    loading.effects['materielApplicationPub/queryDetail'] ||
    loading.effects['materielApplicationPub/queryAttribute'] ||
    loading.effects['materielApplicationPub/queryPartner'] ||
    loading.effects['materielApplicationPub/queryCategory'] ||
    loading.effects['materielApplicationPub/queryAffliated'] ||
    loading.effects['materielApplicationPub/queryItemOrgUom'],
  deleteLoading:
    loading.effects['materielApplicationPub/deleteAttributeTableData'] ||
    loading.effects['materielApplicationPub/deletePartnerTableData'] ||
    loading.effects['materielApplicationPub/deleteCategoryTableData'] ||
    loading.effects['materielApplicationPub/deleteAffiatedTableData'] ||
    loading.effects['materielApplicationPub/deleteEnclosureTableData'] ||
    loading.effects['materielApplicationPub/deleteComponentTableData'],
  saving: loading.effects['materielApplicationPub/saveAll'],
  demanding: loading.effects['materielApplicationPub/fetchExecutorData'],
  enabling: loading.effects['materielApplicationPub/enabledFlag'],
  handleDeleteLoading: loading.effects['materielApplicationPub/fetchDelete'],
  fetchSubmitLoading: loading.effects['materielApplicationPub/fetchSubmit'],
  organizationId: getCurrentOrganizationId(),
  queryTreeDataing: loading.effects['materielApplicationPub/queryTreeData'],
  queryTaxationDataing: loading.effects['materielApplicationPub/queryTaxationData'],
}))
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: [
    'smdm.materiel',
    'smdm.currencyOrg',
    'smdm.materielApplication',
    'entity.attachment',
    'entity.customer',
    'entity.item',
    'entity.roles',
    'smdm.paymentTerms',
    'smdm.materialApplication',
    'sprm.common',
    'hwfp.common',
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
      isEdit: !!params.itemReqHeaderId,
      fileList: [],
      collapseKeys: ['base', 'attribute', 'explainTitle', 'commondity', 'approveEditInfo'],
      editAble: false,
      isChangeType: false,
      isChangeData: false,
      operationModelVisible: false,
      operationModelDataLoading: true,
      operationData: [],
      approveData: [],
      pagination: {},
      categoryAutoRelateFlag: false,
      mainCategoryId: undefined,
      diffDeleteFlag: undefined,
      doubleControlFlag: 0,
      tipModalVisible: false,
      attamentForceRender: 0,
    };
    this.itemReqHeaderId = params.itemReqHeaderId;
    this.TreeInputData = {};
    this.changeDs = new DataSet(changeInfoDs());
  }

  componentDidMount() {
    const {
      match: {
        params: { itemReqHeaderId },
      },
      onLoad,
      remote,
      onFormLoaded,
    } = this.props;
    const { isEdit } = this.state;
    if (!isEdit) {
      this.setState({
        editAble: true,
      });
    }
    this.loadData(itemReqHeaderId);
    this.queryIdpValue();
    this.queryDoubleControl();
    this.fetchTaxFreeType();
    this.fetchpreFerentialMark();
    this.fetchCategoryAutoRelate();
    categoryCache.clear();
    const { handleWorkFlowCheck } = remote?.props?.process || {};
    if (onLoad) {
      onLoad({
        submit: handleWorkFlowCheck ? this.handleApproveSubmit : undefined,
      });
      if (onFormLoaded) {
        onFormLoaded(true);
      }
    }
  }

  @Bind()
  handleApproveSubmit(result) {
    const { remote } = this.props;
    const { handleWorkFlowCheck } = remote?.props?.process || {};
    return new Promise(async (resolve, reject) => {
      const validateFlag = await this.changeDs?.validate();
      if (validateFlag) {
        const [changedData] = this.changeDs.toJSONData() || [];
        const approveFlag = await handleWorkFlowCheck({
          result,
          formData: changedData,
          customizeUnitCode: [
            'SMDM_MATERIELAPPLICATION_EDIT.APPROVE_EDIT',
            'SMDM_MATERIELAPPLICATION_EDIT.BASIC',
            'SMDM_MATERIELAPPLICATION_EDIT.BASE',
            'SMDM_MATERIELAPPLICATION_EDIT.EXPLAINTITLE',
            'SMDM_MATERIELAPPLICATION_EDIT.COMMODITY',
            'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE',
            'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.EDITFORM',
            'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.TABLE',
            'SMDM_MATERIELAPPLICATION_ORG.EDITFORM',
            'SMDM_MATERIELAPPLICATION_ORG.TABLE',
            'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.TABLE',
            'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.EDITFORM',
            'SMDM_MATERIELAPPLICATION_CATEGORY.LIST',
            'SMDM_MATERIELAPPLICATION_ATTACHMENT.LIST',
            'SMDM_MATERIELAPPLICATION_ATTACHMENT.EDIT_FROM',
            'SMDM_MATERIELAPPLICATION_EDIT.UOM_LIST_NEW',
          ].join(','),
        });
        if (approveFlag) {
          resolve();
        } else {
          reject();
        }
      } else {
        reject();
      }
    });
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
    const { dispatch, match } = this.props;
    if (!match?.path?.includes('/pub')) {
      dispatch({
        type: 'materielApplicationPub/updateState',
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
      materielApplicationPub: { attributeData = [] },
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
          type: 'materielApplicationPub/updateState',
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
                  itemAttributeReqId: uuid(),
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
                type: 'materielApplicationPub/updateState',
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
  handleChangeData() {
    this.setState({
      isChangeData: true,
    });
  }

  /**
   * 获取免税类型值级
   */
  @Bind()
  fetchTaxFreeType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'materielApplicationPub/fetchTaxFreeType',
    });
  }

  /**
   * 获取优惠政策类型值级
   */
  @Bind()
  fetchpreFerentialMark() {
    const { dispatch } = this.props;
    dispatch({
      type: 'materielApplicationPub/fetchpreFerentialMark',
    });
  }

  @Bind()
  setTreeInputData(data) {
    this.TreeInputData = data;
  }

  @Bind()
  fetchDataCategories(params) {
    const { dispatch, form, remote } = this.props;
    const { itemCategoryQueryParams } = remote?.props?.process || {};
    const cuxParmas = isFunction(itemCategoryQueryParams) ? itemCategoryQueryParams(form) : {};
    console.log(cuxParmas, itemCategoryQueryParams, form, form.getFieldValue('userAuthorityFlag'));

    return dispatch({
      type: `materielApplicationPub/fetchDataCategories`,
      payload: { ...params, ...cuxParmas },
    });
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
  handleStateUpdate(key, value) {
    if (key && value) {
      const { dispatch } = this.props;
      dispatch({
        type: 'materielApplicationPub/updateState',
        payload: {
          [key]: value,
        },
      });
    }
  }

  /**
   * 查询物料明细信息
   * @param {string} itemReqHeaderId - 物料Id
   */
  @Bind()
  loadData(itemReqHeaderId = '') {
    const { form } = this.props;
    if (itemReqHeaderId) {
      // 海亮股份二開
      if (window?.fetchMaterielApplicationOrderPricingVariableTableData) {
        // eslint-disable-next-line no-unused-expressions
        window?.fetchMaterielApplicationOrderPricingVariableTableData();
      }
      if (typeof window.getPriceAttrMsgDs === 'function') {
        window.getPriceAttrMsgDs().setQueryParameter('itemReqHeaderId', itemReqHeaderId);
        window.getPriceAttrMsgDs().query();
      }
      // this.queryData('queryDetail', itemReqHeaderId);
      // this.queryData('queryAttribute', itemReqHeaderId);
      // this.queryData('queryPartner', itemReqHeaderId); // todo
      // this.queryData('queryCategory', itemReqHeaderId);
      // this.queryData('queryAffliated', itemReqHeaderId);
      // this.queryData('queryEnclosure', itemReqHeaderId);
      // this.queryData('queryItemOrgUom', itemReqHeaderId);
      // this.queryData('queryComponent', itemReqHeaderId);
      // this.setState({ doubleControlFlag: false });
      this.queryData('queryDetail', itemReqHeaderId).then(() => {
        form.resetFields();
        this.setState({ doubleControlFlag: false });
        // 海亮股份二開
        if (window?.fetchOrderPricingVariableTableData) {
          // eslint-disable-next-line no-unused-expressions
          window?.fetchOrderPricingVariableTableData();
        }
        // 默认查询自主品类分配物料/所属组织
        this.queryData('queryCategory', itemReqHeaderId);
        this.queryData('queryAffliated', itemReqHeaderId);
        this.queryData('queryAttribute', itemReqHeaderId).then(() => {
          const {
            materielApplicationPub: { categoryData = [] },
          } = this.props;
          const mainCategoryData = categoryData.find((ele) => ele.defaultFlag) || {};
          this.setState({
            mainCategoryId: mainCategoryData?.categoryId,
          });
        });
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
   * @param {*} itemReqHeaderId 物料Id
   * @param {*} page 分页参数
   */
  @Bind()
  queryData(functionName = '', itemReqHeaderId = '', page = {}) {
    const { dispatch, organizationId } = this.props;
    if (functionName === 'queryDetail') {
      return dispatch({
        type: `materielApplicationPub/${functionName}`,
        payload: {
          organizationId,
          itemReqHeaderId,
          page,
          customizeUnitCode:
            'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE,SMDM_MATERIELAPPLICATION_EDIT.BASE,SMDM_MATERIELAPPLICATION_EDIT.EXPLAINTITLE,SMDM_MATERIELAPPLICATION_EDIT.COMMODITY',
        },
      }).then(async () => {
        const {
          materielApplicationPub: { materielDetail = {} },
          match,
          form,
        } = this.props;
        form.resetFields();
        const { reqStatus, reqType, workflowBusinessKey } = materielDetail;
        const { path = '' } = match;
        const { isEdit } = this.state;
        const isPathPub = path.indexOf('/pub') === 0;
        if (this.changeDs) {
          this.changeDs.loadData([materielDetail]);
        }
        if (workflowBusinessKey) {
          // 获取审批按钮显示状态
          const approvaFlags = await queryBatchApprovaFlag([workflowBusinessKey]);
          // 获取撤销审批按钮状态
          const operationFlags = await getBatchOperationFlag([workflowBusinessKey]);
          this.setState({ approvaFlags, operationFlags });
        }
        this.setState({
          isChangeData: false,
          isChangeType: reqType === 'CHANGE',
          editAble: ((reqStatus === 'REJECTED' || reqStatus === 'NEW') && !isPathPub) || !isEdit,
          attamentForceRender: 1,
        }, () => {
          setTimeout(() => {
            this.setState({ attamentForceRender: 0 })
          }, 500);
        });
      });
    } else {
      return dispatch({
        type: `materielApplicationPub/${functionName}`,
        payload: {
          organizationId,
          itemReqHeaderId,
          page,
        },
      });
    }
  }

  /**
   * 查询物料属性ABC值集
   */
  @Bind()
  queryIdpValue() {
    const { dispatch } = this.props;
    dispatch({ type: 'materielApplicationPub/queryIdpValue' });
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
    const {
      match: {
        params: { itemReqHeaderId },
      },
    } = this.props;
    this.queryData(functionName, itemReqHeaderId, pagination);
  }

  /**
   * 保存数据到前端页面
   * @param {Array<object>} dataList 更新的数据
   * @param {string} dataName 该保存的数据字符串
   * @param {boolean} isPaging 该表格是否支持分页
   */
  @Bind()
  addTableData(dataList, dataName, isPaging, pageSet = false) {
    this.handleChangeData();
    const { dispatch, materielApplicationPub = {} } = this.props;
    if (isPaging) {
      dispatch({
        type: 'materielApplicationPub/updateState',
        payload: {
          [dataName]: {
            ...materielApplicationPub[dataName],
            content: dataList,
            totalElements: materielApplicationPub[dataName].totalElements
              ? pageSet
                ? materielApplicationPub[dataName].totalElements
                : materielApplicationPub[dataName].totalElements + 1
              : 1,
          },
        },
      });
    } else {
      dispatch({
        type: 'materielApplicationPub/updateState',
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
    this.handleChangeData();
    const { dispatch, organizationId, materielApplicationPub = {} } = this.props;
    if (!isEmpty(idList)) {
      dispatch({
        type: `materielApplicationPub/${functionName}`,
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
        type: 'materielApplicationPub/onDraggerUploadRemove',
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
        type: 'materielApplicationPub/updateState',
        payload: {
          [dataName]: {
            ...materielApplicationPub[dataName],
            content: localRows,
            totalElements: materielApplicationPub[dataName].totalElements
              ? pageSet
                ? 0
                : materielApplicationPub[dataName].totalElements - 1
              : 1,
          },
        },
      });
    } else {
      dispatch({
        type: 'materielApplicationPub/updateState',
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
        params: { itemReqHeaderId },
      },
    } = this.props;
    const newValue = isString(value) ? value?.replace(/^\s+|\s+$/g, '') : value;
    if (newValue) {
      dispatch({
        type: 'materielApplicationPub/checkValid',
        payload: { organizationId, itemReqHeaderId, key, value },
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
          params: { itemReqHeaderId },
        },
      } = this.props;
      dispatch({
        type: 'materielApplicationPub/checkValid',
        payload: { organizationId, itemReqHeaderId, key, value, key1, value1 },
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
  validateSave() {
    this.handleSave();
    // }
  }

  /**
   * 保存所有数据
   */
  @Bind()
  @Throttle(500)
  async handleSave() {
    const {
      form,
      dispatch,
      history,
      organizationId,
      match: {
        params: { itemReqHeaderId },
      },
      materielApplicationPub: {
        materielDetail,
        attributeData = [],
        enclosureDataSource = [],
        partnerData: { content: partnerContent = [] },
        categoryData = [],
        affliatedData: { content: affliatedContent = [] },
        itemOrgUomData: { content: itemOrgUomContent = [] },
        componentData: { content: componentContent = [] },
        orderPricingVariableTable = null,
      },
      remote,
    } = this.props;
    const { handleSaveCheck } = remote?.props?.process || {};
    const { isEdit, diffDeleteFlag, doubleControlFlag } = this.state;
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
    form.validateFields((err, formData) => {
      if (!err) {
        const itemAttributeReqList = attributeData.map((item) => {
          if (item.isLocal) {
            const { itemAttributeReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemPartnerRelReqList = partnerContent.map((item) => {
          if (item.isLocal) {
            const { partnerRelationReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemCategoryAssignReqList = categoryData.map((item) => {
          if (item.isLocal) {
            const { categoryAssignReqId, $form, _status, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            const { $form, _status, ...otherItem } = item;
            return { ...otherItem };
          }
        });

        const itemOrgUomReqList = itemOrgUomContent.map((item) => {
          if (item.isLocal) {
            const { itemOrgUomReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });

        let itemOrgRelReqList = [];
        if (materielDetail.itemAllOrgFlag !== 1) {
          itemOrgRelReqList = affliatedContent.map((item) => {
            if (item.isLocal) {
              const { orgRelationReqId, isLocal, ...other } = item;
              return { ...other, itemReqHeaderId, tenantId: organizationId };
            } else {
              return item;
            }
          });
        }
        const itemAttachmentReqList = enclosureDataSource.map((item) => {
          if (item.isLocal) {
            const { attachmentReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });

        const itemComponentReqList = componentContent.map((item) => {
          if (item.isLocal) {
            const { componentReqId, $form, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            const { $form, _status, ...otherItem } = item;
            return otherItem;
          }
        });
        if (formData.doubleChanged && itemReqHeaderId && doubleControlFlag) {
          this.setState({ tipModalVisible: true });
        } else {
          const saveItem = () => {
            const normalData = {
              ...materielDetail,
              organizationId,
              itemAttributeReqList,
              itemPartnerRelReqList,
              itemCategoryAssignReqList,
              itemOrgRelReqList,
              itemAttachmentReqList,
              itemOrgRelAttributeVO:
                materielDetail.itemAllOrgFlag === 1
                  ? {
                    ...affliatedContent[0],
                    dimensionQc: String(affliatedContent[0]?.dimensionQc),
                  }
                  : null,
              itemOrgUomReqList,
              itemComponentReqList,
              ...formData,
              diffDeleteFlag,
              reservedScriptField1:
                orderPricingVariableTable ||
                (typeof window.getPriceAttrMsgData === 'function'
                  ? JSON.stringify(window.getPriceAttrMsgData())
                  : null),
              customizeUnitCode: [
                'SMDM_MATERIELAPPLICATION_EDIT.BASIC',
                'SMDM_MATERIELAPPLICATION_EDIT.BASE',
                'SMDM_MATERIELAPPLICATION_EDIT.EXPLAINTITLE',
                'SMDM_MATERIELAPPLICATION_EDIT.COMMODITY',
                'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE',
                'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.EDITFORM',
                'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.TABLE',
                'SMDM_MATERIELAPPLICATION_ORG.EDITFORM',
                'SMDM_MATERIELAPPLICATION_ORG.TABLE',
                'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.TABLE',
                'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.EDITFORM',
                'SMDM_MATERIELAPPLICATION_CATEGORY.LIST',
                'SMDM_MATERIELAPPLICATION_ATTACHMENT.LIST',
                'SMDM_MATERIELAPPLICATION_ATTACHMENT.EDIT_FROM',
                'SMDM_MATERIELAPPLICATION_EDIT.UOM_LIST_NEW',
              ].join(','),
              ...this.TreeInputData,
            };
            const processData = remote
              ? remote.process('SMDM_ITEM_APPLICATION_DETAIL.SUBMIT_DATA', normalData, {})
              : normalData;
            dispatch({
              type: 'materielApplicationPub/saveAll',
              payload: processData,
            }).then((res) => {
              if (res) {
                const { itemReqHeaderId: id } = res;
                if (!isEdit) {
                  history.push(`/smdm/materiel-application/detail/${id}`);
                } else {
                  this.loadData(id);
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
        }
      }
    });
  }

  /**
   * 提交数据
   */
  @Bind()
  @Throttle(500)
  async handleSubmit() {
    const {
      form,
      dispatch,
      organizationId,
      match: {
        params: { itemReqHeaderId },
      },
      materielApplicationPub: {
        materielDetail,
        attributeData = [],
        enclosureDataSource = [],
        partnerData: { content: partnerContent = [] },
        categoryData = [],
        affliatedData: { content: affliatedContent = [] },
        itemOrgUomData: { content: itemOrgUomContent = [] },
        componentData: { content: componentContent = [] },
        orderPricingVariableTable = null,
      },
      history,
      remote,
    } = this.props;
    const { handleSaveCheck } = remote?.props?.process || {};
    const { doubleControlFlag } = this.state;
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

    form.validateFields((err, formData) => {
      if (!err) {
        const itemAttributeReqList = attributeData.map((item) => {
          if (item.isLocal) {
            const { itemAttributeReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemPartnerRelReqList = partnerContent.map((item) => {
          if (item.isLocal) {
            const { partnerRelationReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        const itemCategoryAssignReqList = categoryData.map((item) => {
          if (item.isLocal) {
            const { categoryAssignReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });

        const itemOrgUomReqList = itemOrgUomContent.map((item) => {
          if (item.isLocal) {
            const { itemOrgUomReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });

        let itemOrgRelReqList = [];
        if (materielDetail.itemAllOrgFlag !== 1) {
          itemOrgRelReqList = affliatedContent.map((item) => {
            if (item.isLocal) {
              const { orgRelationReqId, isLocal, ...other } = item;
              return { ...other, itemReqHeaderId, tenantId: organizationId };
            } else {
              return item;
            }
          });
        }
        const itemAttachmentReqList = enclosureDataSource.map((item) => {
          if (item.isLocal) {
            const { attachmentReqId, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            return item;
          }
        });

        const itemComponentReqList = componentContent.map((item) => {
          if (item.isLocal) {
            const { componentReqId, $form, isLocal, ...other } = item;
            return { ...other, itemReqHeaderId, tenantId: organizationId };
          } else {
            const { $form, _status, ...otherItem } = item;
            return otherItem;
          }
        });
        if (formData.doubleChanged && itemReqHeaderId && doubleControlFlag) {
          this.setState({ tipModalVisible: true });
        } else {
          const saveItem = () => {
            const normalData = {
              ...materielDetail,
              organizationId,
              itemAttributeReqList,
              itemPartnerRelReqList,
              itemCategoryAssignReqList,
              itemOrgRelReqList,
              itemAttachmentReqList,
              itemOrgRelAttributeVO:
                materielDetail.itemAllOrgFlag === 1
                  ? {
                    ...affliatedContent[0],
                    dimensionQc: String(affliatedContent[0]?.dimensionQc),
                  }
                  : null,
              itemOrgUomReqList,
              itemComponentReqList,

              ...formData,
              reservedScriptField1:
                orderPricingVariableTable ||
                (typeof window.getPriceAttrMsgData === 'function'
                  ? JSON.stringify(window.getPriceAttrMsgData())
                  : null),
              customizeUnitCode: [
                'SMDM_MATERIELAPPLICATION_EDIT.BASIC',
                'SMDM_MATERIELAPPLICATION_EDIT.BASE',
                'SMDM_MATERIELAPPLICATION_EDIT.EXPLAINTITLE',
                'SMDM_MATERIELAPPLICATION_EDIT.COMMODITY',
                'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE',
                'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.EDITFORM',
                'SMDM_MATERIELAPPLICATION_ATTRIBUTETABL.TABLE',
                'SMDM_MATERIELAPPLICATION_ORG.EDITFORM',
                'SMDM_MATERIELAPPLICATION_ORG.TABLE',
                'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.TABLE',
                'SMDM_MATERIELAPPLICATION_COMPONENTTABLE.EDITFORM',
                'SMDM_MATERIELAPPLICATION_CATEGORY.LIST',
                'SMDM_MATERIELAPPLICATION_ATTACHMENT.LIST',
                'SMDM_MATERIELAPPLICATION_ATTACHMENT.EDIT_FROM',
                'SMDM_MATERIELAPPLICATION_EDIT.UOM_LIST_NEW',
              ].join(','),
              ...this.TreeInputData,
            };
            const processData = remote
              ? remote.process('SMDM_ITEM_APPLICATION_DETAIL.SUBMIT_DATA', normalData, {})
              : normalData;
            dispatch({
              type: 'materielApplicationPub/fetchSubmit',
              payload: processData,
            }).then((res) => {
              if (res) {
                // const { itemReqHeaderId: id } = res;
                // this.loadData(id);
                history.push('/smdm/materiel-application/list');
                notification.success();
              }
            });
          };

          if (isFunction(handleSaveCheck)) {
            handleSaveCheck({ ...materielDetail, ...formData }, saveItem);
          } else {
            saveItem();
          }
        }
      }
    });
  }

  /**
   * handleDelete
   */
  @Bind()
  @Throttle(500)
  handleDelete() {
    const { dispatch, materielApplicationPub = {}, history } = this.props;
    const { materielDetail = {} } = materielApplicationPub;
    const { itemReqHeaderId } = materielDetail;
    dispatch({
      type: 'materielApplicationPub/fetchDelete',
      payload: { itemReqHeaderId },
    }).then((res) => {
      if (res) {
        notification.success();
        history.push('/smdm/materiel-application/list');
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
      materielApplicationPub: { enclosureDataSource = [] },
      match: {
        params: { itemReqHeaderId },
      },
    } = this.props;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map((file) => {
        return {
          itemOrgUomReqId: uuid(),
          attachmentDesc: file.name,
          attachmentSize: file.size,
          attachmentUrl: file.response,
          uploadUserId: id,
          loginName,
          realName,
          // uploadDate: moment(file.lastModified).format(DEFAULT_DATETIME_FORMAT),
          remark: '',
          tenantId: organizationId,
          itemReqHeaderId,
          isLocal: true,
        };
      })
      : [];
    dispatch({
      type: 'materielApplicationPub/updateState',
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
        type: 'materielApplicationPub/onDraggerUploadRemove',
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
   * 基本信息表单渲染
   */
  renderBaseForm() {
    const {
      dispatch,
      form,
      demanding = false,
      organizationId,
      customizeForm = () => { },
      materielApplicationPub: { materielDetail = {}, ExecutorData = [], ExtorPagination = {} },
      user: {
        currentUser: { id },
      },
      match,
    } = this.props;
    const {
      params: { itemReqHeaderId },
    } = match;
    const { isEdit, editAble, attamentForceRender = 0 } = this.state;
    const { getFieldDecorator, registerField, setFieldsValue, validateFields } = form;
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
      sourceExecutorValue: form.getFieldValue('sourceExecutorBys'),
      dispatch,
      ExecutorData,
      ExtorPagination,
      onChange: this.onExecutorChange,
      demanding,
      lovType: 'sourceExecutor',
    };
    getFieldDecorator('demandExecutorBys', { initialValue: materielDetail.demandExecutorBys });
    getFieldDecorator('orderExecutorBys', { initialValue: materielDetail.orderExecutorBys });
    return customizeForm(
      {
        code: 'SMDM_MATERIELAPPLICATION_EDIT.BASE', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        readOnly: !editAble,
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
        isCreate: true,
      },
      <Form>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="writable-row">
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl
                .get('smdm.materielApplication.model.materiel.itemReqHeaderNum')
                .d('物料申请单号')}
            >
              {getFieldDecorator('itemReqHeaderNum', {
                initialValue: materielDetail.itemReqHeaderNum,
              })(<span>{materielDetail.itemReqHeaderNum}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem {...EDIT_FORM_ITEM_LAYOUT} label={intl.get('hzero.common.status').d('状态')}>
              {getFieldDecorator('reqStatusMeaning', {
                initialValue: materielDetail.reqStatusMeaning,
              })(<span>{materielDetail.reqStatusMeaning}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materielApplication.model.materiel.createdName`).d('创建人')}
            >
              {getFieldDecorator('createdName', { initialValue: materielDetail.createdName })(
                <span>{materielDetail.createdName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materielApplication.model.materiel.creationDate`).d('创建时间')}
            >
              {getFieldDecorator('creationDate', { initialValue: materielDetail.creationDate })(
                <span>{dateTimeRender(materielDetail.creationDate)}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.version`).d('版本')}
            >
              {getFieldDecorator('versionNumber', { initialValue: materielDetail.versionNumber })(
                <span>{materielDetail.versionNumber}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码')}
            >
              {getFieldDecorator('itemCode', {
                rules: [
                  // {
                  //   required: true,
                  //   message: intl.get('hzero.common.validation.notNull', {
                  //     name: intl.get('smdm.materiel.model.materiel.itemCode').d('物料编码'),
                  //   }),
                  // },
                  {
                    max: 120,
                    message: intl.get('hzero.common.validation.max', {
                      max: 120,
                    }),
                  },
                ],
                initialValue: materielDetail.itemCode,
              })(
                editAble ? (
                  <Input
                    inputChinese={false}
                    disabled={isEdit}
                  // onBlur={() => {
                  //   this.checkValid(form, 'itemCode', getFieldValue('itemCode'));
                  // }}
                  />
                ) : (
                  <span>{materielDetail.itemCode}</span>
                )
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
              {getFieldDecorator('itemName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('smdm.materiel.model.materiel.itemName').d('物料名称'),
                    }),
                  },
                  {
                    max: 360,
                    message: intl.get('hzero.common.validation.max', {
                      max: 360,
                    }),
                  },
                ],
                initialValue: materielDetail.itemName,
              })(
                editAble ? (
                  <TLEditor
                    // disabled={isEdit}
                    inputSize={{ zh: 360, en: 360 }}
                    label={intl.get('smdm.materiel.model.materiel.itemName').d('物料名称')}
                    field="itemName"
                    token={materielDetail._token}
                  />
                ) : (
                  <span>{materielDetail.itemName}</span>
                )
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
              })(
                editAble ? (
                  <Input disabled inputChinese={false} />
                ) : (
                  <span>{materielDetail.itemNumber}</span>
                )
              )}
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
                    max: 100,
                    message: intl.get('hzero.common.validation.max', {
                      max: 100,
                    }),
                  },
                ],
              })(
                editAble ? <Input disabled={!editAble} /> : <span>{materielDetail.commonName}</span>
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.categoryNameType`).d('平台分类')}
            >
              {getFieldDecorator('industryCategoryId', {
                initialValue: materielDetail.industryCategoryId,
              })(
                editAble ? (
                  <Lov code="HPFM.INDUSTRY_CATEGORY" textValue={materielDetail.categoryName} />
                ) : (
                  <span>{materielDetail.categoryName}</span>
                )
              )}
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
              })(<span>{materielDetail.sourceCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.primaryUomName`).d('基本计量单位')}
            >
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
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.primaryUomName}
                    queryParams={{ enabledFlag: 1 }}
                    onChange={() => {
                      registerField('doubleChanged');
                      setFieldsValue({ doubleChanged: true });
                    }}
                  />
                ) : (
                  <span>{materielDetail.primaryUomName}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.doubleUomName`).d('双单位')}
            >
              {getFieldDecorator('biUomId', {
                initialValue: materielDetail.biUomId,
              })(
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.doubleUomName}
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>{materielDetail.doubleUomName}</span>
                )
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
              })(
                editAble ? (
                  <UomConversion
                    materielDetail={materielDetail}
                    onChange={() => {
                      registerField('doubleChanged');
                      setFieldsValue({ doubleChanged: true });
                      validateFields(['newUomConversionRate'], { force: true });
                    }}
                  />
                ) : (
                  <span>
                    {materielDetail.primaryUomScale
                      ? `${materielDetail.primaryUomScale}:${materielDetail.secondaryUomScale}`
                      : ''}
                  </span>
                )
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
              })(
                editAble ? (
                  <InputNumber
                    style={{ width: '100%' }}
                    formatter={(value) => `1:${value}`}
                    parser={(value) =>
                      this.parseAumont(isString(value) ? value?.replace('1:', '') : value, 8)
                    }
                    max={99999999.99999999}
                    min={0.00000001}
                    onChange={() => {
                      registerField('doubleChanged');
                      setFieldsValue({ doubleChanged: true });
                    }}
                  />
                ) : (
                  <span>
                    {materielDetail.uomConversionRate && `1:${materielDetail.uomConversionRate}`}
                  </span>
                )
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
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.secondaryUomName}
                    queryParams={{ enabledFlag: 1 }}
                    onChange={() => {
                      registerField('doubleChanged');
                      setFieldsValue({ doubleChanged: true });
                    }}
                  />
                ) : (
                  <span>{materielDetail.secondaryUomName}</span>
                )
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
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.packingUomName}
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>{materielDetail.packingUomName}</span>
                )
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
                editAble ? (
                  <Lov
                    code="SMDM.TAX"
                    textValue={
                      materielDetail.taxDescription &&
                      `${materielDetail.taxDescription} - ${materielDetail.taxRate}`
                    }
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>
                    {materielDetail.taxDescription &&
                      `${materielDetail.taxDescription} - ${materielDetail.taxRate}`}
                  </span>
                )
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
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={10} min={0} />
                ) : (
                  <span>{materielDetail.grossWeight}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.netWeight`).d('净重')}
            >
              {getFieldDecorator('netWeight', {
                initialValue: materielDetail.netWeight,
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={10} min={0} />
                ) : (
                  <span>{materielDetail.netWeight}</span>
                )
              )}
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
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.weightUomName}
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>{materielDetail.weightUomName}</span>
                )
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
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={2} min={0} />
                ) : (
                  <span>{materielDetail.volume}</span>
                )
              )}
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
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.volumeUomName}
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>{materielDetail.volumeUomName}</span>
                )
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
                editAble ? (
                  <Lov
                    code="SPFM.USER_AUTH.PURCHASE_AGENT"
                    textValue={materielDetail.purchaseAgentName}
                    queryParams={{ tenantId: organizationId, userId: id }}
                  />
                ) : (
                  <span>{materielDetail.purchaseAgentName}</span>
                )
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
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={0} min={0} />
                ) : (
                  <span>{materielDetail.packMinQuantity}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.chartCode`).d('图号')}
            >
              {getFieldDecorator('chartCode', {
                initialValue: materielDetail.chartCode,
              })(editAble ? <Input /> : <span>{materielDetail.chartCode}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.drawingVersion`).d('图纸版本')}
            >
              {getFieldDecorator('drawingVersion', {
                initialValue: materielDetail.drawingVersion,
              })(editAble ? <Input /> : <span>{materielDetail.drawingVersion}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.safetyStockQuantity`).d('安全库存数')}
            >
              {getFieldDecorator('safetyStockQuantity', {
                initialValue: materielDetail.safetyStockQuantity,
              })(editAble ? <Input /> : <span>{materielDetail.safetyStockQuantity}</span>)}
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
              })(
                editAble ? (
                  <Switch />
                ) : (
                  <span>
                    {' '}
                    {materielDetail.exemptInspectionFlag
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
              label={intl.get(`smdm.materiel.model.materiel.batchManagementFlag`).d('是否批次管理')}
            >
              {getFieldDecorator('batchManagementFlag', {
                initialValue: materielDetail.batchManagementFlag
                  ? materielDetail.batchManagementFlag
                  : 0,
              })(
                editAble ? (
                  <Switch />
                ) : (
                  <span>
                    {materielDetail.batchManagementFlag
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
              label={intl
                .get(`smdm.materiel.model.materiel.nonProduceInvManageFlag`)
                .d('是否开启非生库存管理')}
            >
              {getFieldDecorator('nonProduceInvManageFlag', {
                initialValue: materielDetail.nonProduceInvManageFlag
                  ? materielDetail.nonProduceInvManageFlag
                  : 0,
              })(
                editAble ? (
                  <Switch />
                ) : (
                  <span>
                    {materielDetail.nonProduceInvManageFlag
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
              label={intl.get(`smdm.materiel.model.materiel.nonProduceInvBatch`).d('非生库存批次')}
            >
              {getFieldDecorator('nonProduceInvBatch', {
                initialValue: materielDetail?.nonProduceInvBatch,
              })(
                editAble ? (
                  <Lov
                    code="STCK.STOCK_STRATEGY_RELEASED"
                    queryParams={{ tenantId: organizationId }}
                    textValue={materielDetail.nonProduceInvBatchName}
                  />
                ) : (
                  <span>{materielDetail.nonProduceInvBatchName}</span>
                )
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
              })(editAble ? <Input /> : <span>{materielDetail.plannedPrice}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.externalItemGroup`).d('外部物料组')}
            >
              {getFieldDecorator('externalItemGroup', {
                initialValue: materielDetail.externalItemGroup,
              })(editAble ? <Input /> : <span>{materielDetail.externalItemGroup}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.externalItemDesc`).d('外部物料组描述')}
            >
              {getFieldDecorator('externalItemGroupDescription', {
                initialValue: materielDetail.externalItemGroupDescription,
              })(editAble ? <Input /> : <span>{materielDetail.externalItemGroupDescription}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.totalShelfLife`).d('总货架寿命(天)')}
            >
              {getFieldDecorator('totalShelfLife', {
                initialValue: materielDetail.totalShelfLife,
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={0} min={0} />
                ) : (
                  <span>{materielDetail.totalShelfLife}</span>
                )
              )}
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
                editAble ? (
                  <Lov
                    code="SMDM.ITEM.UOM.ORG"
                    textValue={materielDetail.orderUomName}
                    queryParams={{ enabledFlag: 1 }}
                  />
                ) : (
                  <span>{materielDetail.orderUomName}</span>
                )
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
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} min={0} />
                ) : (
                  <span>{materielDetail.minDeliveryRate}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.maxDeliveryRate`).d('过量交货限度(%)')}
            >
              {getFieldDecorator('maxDeliveryRate', {
                initialValue: materielDetail.maxDeliveryRate,
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} min={0} />
                ) : (
                  <span>{materielDetail.maxDeliveryRate}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.demandExecutor`).d('需求执行人')}
            >
              {getFieldDecorator('demandExecutor', {
                initialValue: materielDetail.demandExecutor,
              })(
                editAble ? (
                  <DemandExecutorModal {...demandProp} />
                ) : (
                  <span>{materielDetail.demandExecutor}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.orderExecutor`).d('订单执行人')}
            >
              {getFieldDecorator('orderExecutor', {
                initialValue: materielDetail.orderExecutor,
              })(
                editAble ? (
                  <DemandExecutorModal {...orderExecutorProps} />
                ) : (
                  <span>{materielDetail.orderExecutor}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.sourceExecutor`).d('寻源执行人')}
            >
              {getFieldDecorator('sourceExecutor', {
                initialValue: materielDetail.sourceExecutor,
              })(
                editAble ? (
                  <DemandExecutorModal {...sourceExecutorProps} />
                ) : (
                  <span>{materielDetail.sourceExecutor}</span>
                )
              )}
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
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={0} min={0} />
                ) : (
                  <span>{materielDetail.firstReminderList}</span>
                )
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
              {getFieldDecorator('secondReminderList', {
                initialValue: materielDetail.secondReminderList,
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={0} min={0} />
                ) : (
                  <span>{materielDetail.secondReminderList}</span>
                )
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
              {getFieldDecorator('thirdReminderList', {
                initialValue: materielDetail.thirdReminderList,
              })(
                editAble ? (
                  <InputNumber style={{ width: '100%' }} precision={0} min={0} />
                ) : (
                  <span>{materielDetail.thirdReminderList}</span>
                )
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
                  showRemoveIcon
                  filePreview
                  bucketName={PRIVATE_BUCKET}
                  bucketDirectory="smdm-materiel"
                  listType="picture-card"
                  viewOnly={!editAble}
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
                editAble || !itemReqHeaderId ? (
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
                editAble || !itemReqHeaderId ? (
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
                editAble ? (
                  <Switch />
                ) : (
                  <span>
                    {materielDetail.customMadeFlag
                      ? intl.get('hzero.common.status.yes').d('是')
                      : intl.get('hzero.common.status.no').d('否')}
                  </span>
                )
              )}
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
              })(
                editAble ? (
                  <TextArea disabled={!editAble} />
                ) : (
                  <span>{materielDetail.purchaseOrderRemark}</span>
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
                attamentForceRender === 0 ? (
                  <Attachment
                    attachmentUUID={materielDetail.imagAttachmentUuid}
                    viewMode="popup"
                    readOnly={!editAble}
                    bucketName={PUBLIC_BUCKET}
                    bucketDirectory="smdm-materiel"
                    listType="text"
                  />
                ) : <span />
              )}
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
      form: { getFieldDecorator },
      materielApplicationPub: { materielDetail = {}, ABCList = [] },
    } = this.props;
    const { editAble } = this.state;
    return customizeForm(
      {
        code: 'SMDM_MATERIELAPPLICATION_EDIT.ATTRIBUTE', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        readOnly: !editAble,
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
              })(editAble ? <Input /> : <span> {materielDetail.brand} </span>)}
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
              })(editAble ? <Input /> : <span>{materielDetail.origin}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.importFlag`).d('是否进口')}
            >
              {getFieldDecorator('importFlag', {
                initialValue: materielDetail.importFlag ? materielDetail.importFlag : 0,
              })(
                editAble ? (
                  <Switch />
                ) : (
                  <span>
                    {materielDetail.importFlag
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
              })(editAble ? <Input /> : <span>{materielDetail.specifications}</span>)}
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
              })(editAble ? <Input /> : <span>{materielDetail.model}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.agentCompanyName`).d('代理商')}
            >
              {getFieldDecorator('agentCompanyName', {
                initialValue: materielDetail.agentCompanyName,
              })(
                editAble ? (
                  <Lov isInput code="SPFM.USER_AUTH.SUPPLIER" />
                ) : (
                  <span> {materielDetail.agentCompanyName} </span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get(`smdm.materiel.model.materiel.manufacturerCompanyName`).d('制造商')}
            >
              {getFieldDecorator('manufacturerCompanyName', {
                initialValue: materielDetail.manufacturerCompanyName,
              })(
                editAble ? (
                  <Lov isInput code="SPFM.USER_AUTH.SUPPLIER" />
                ) : (
                  <span>{materielDetail.manufacturerCompanyName}</span>
                )
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
                editAble ? (
                  <Select allowClear>
                    {ABCList.map((m) => {
                      return (
                        <Select.Option key={m.value} value={m.value}>
                          {m.meaning}
                        </Select.Option>
                      );
                    })}
                  </Select>
                ) : (
                  <span>{materielDetail.itemAbc}</span>
                )
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
      materielApplicationPub: { materielDetail = {} },
      customizeForm,
    } = this.props;
    const { editAble } = this.state;
    const { getFieldDecorator } = form;
    return customizeForm(
      {
        code: 'SMDM_MATERIELAPPLICATION_EDIT.EXPLAINTITLE', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        readOnly: !editAble,
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
        isCreate: true,
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
              })(
                editAble ? (
                  <Input trim typeCase="upper" inputChinese={false} />
                ) : (
                  <span>{materielDetail.eanCode}</span>
                )
              )}
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
              })(editAble ? <Input /> : <span>{materielDetail.itemManageMethod}</span>)}
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
              })(editAble ? <Input /> : <span>{materielDetail.quotaManageType}</span>)}
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
              })(editAble ? <Input /> : <span> {materielDetail.lotNumberingRule}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.usedItemCode`).d('旧物料号')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('usedItemCode', {
                initialValue: materielDetail.usedItemCode,
              })(
                editAble ? (
                  <Input disabled={(materielDetail.sourceCode || 'SRM') !== 'SRM'} />
                ) : (
                  <span>{materielDetail.usedItemCode}</span>
                )
              )}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              label={intl.get(`smdm.materiel.model.materiel.productHierarchies`).d('产品层次')}
              {...EDIT_FORM_ITEM_LAYOUT}
            >
              {getFieldDecorator('productHierarchies', {
                initialValue: materielDetail.productHierarchies,
              })(editAble ? <Input disabled /> : <span>{materielDetail.productHierarchies}</span>)}
            </FormItem>
          </Col>
        </Row>
        <Row {...EDIT_FORM_ROW_LAYOUT} className="half-row">
          <Col {...FORM_COL_2_LAYOUT}>
            <FormItem label={intl.get(`smdm.materiel.model.materiel.explainTitle`).d('物料说明')}>
              {getFieldDecorator('remark', {
                initialValue: materielDetail.remark,
              })(editAble ? <TextArea /> : <span>{materielDetail.remark}</span>)}
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
      type: `materielApplicationPub/queryTreeData`,
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
      type: `materielApplicationPub/queryTaxationData`,
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
      customizeForm,
      materielApplicationPub: {
        TaxFreeType = [], // 免税类型值级
        FerentialMark = [], // 优惠政策值级
        materielDetail = {},
      },
      queryTreeDataing = false,
      queryTaxationDataing = false,
    } = this.props;
    const { editAble } = this.state;
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
        code: 'SMDM_MATERIELAPPLICATION_EDIT.COMMODITY', // 必传，和unitCode一一对应
        form, // 无论个性化单元是否只读，均必传
        readOnly: !editAble,
        dataSource: materielDetail, // 必传，从后端接口获取到的数据
        isCreate: true,
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
                editAble ? (
                  <Select allowClear>
                    {TaxFreeType.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{materielDetail.taxFreeTypeMeaning}</span>
                )
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
              })(
                editAble ? (
                  <Switch />
                ) : (
                  <span>
                    {materielDetail.preferentialMarkFlag
                      ? intl.get('hzero.common.status.yes').d('是')
                      : intl.get('hzero.common.status.no').d('否')}
                  </span>
                )
              )}
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
                editAble ? (
                  <Select allowClear>
                    {FerentialMark.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                ) : (
                  <span>{materielDetail.preferentialMarkMeaning}</span>
                )
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
              })(editAble ? <Input disabled /> : <span>{materielDetail.taxItemName}</span>)}
            </FormItem>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <FormItem
              {...EDIT_FORM_ITEM_LAYOUT}
              label={intl.get('smdm.materiel.model.materiel.commoditySimple').d('税收商品简称')}
            >
              {getFieldDecorator('taxItemSimpleName', {
                initialValue: materielDetail.taxItemSimpleName,
              })(editAble ? <Input disabled /> : <span>{materielDetail.taxItemSimpleName}</span>)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  @Bind()
  handleOperationModel(page = {}) {
    const {
      match: {
        params: { itemReqHeaderId },
      },
    } = this.props;
    this.setState({ operationModelVisible: true });

    Promise.all([
      queryReqOperation({ itemReqHeaderId, organizationId: getCurrentOrganizationId(), page }),
      queryReqApprove({ itemReqHeaderId, organizationId: getCurrentOrganizationId() }),
    ]).then((res) => {
      this.setState({ operationModelDataLoading: false });
      if (res) {
        this.setState({
          operationData: res?.[0]?.content ?? [],
          pagination: createPagination(res?.[0]),
          approveData: res?.[1] ?? [],
        });
      } else {
        notification.error();
      }
    });
  }

  /**
   * render
   * @returns React.element
   */
  @Bind()
  @Throttle(1000)
  handleRevoke() {
    return new Promise(async (resolve) => {
      const {
        history,
        materielApplicationPub: {
          materielDetail: { workflowBusinessKey },
        },
      } = this.props;
      C7NModal.confirm({
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.common.view.revokeApproval.tip')
          .d('是否确认撤销审批？撤销后您仍可再次提交发起审批（仅工作流审批发起人可撤销审批）'),
        onOk: async () => {
          const res = await revokeWorkFlowByKey({ businessKey: workflowBusinessKey });
          if (isString(res)) {
            notification.error({
              message: intl.get('hzero.common.status.mistake').d('错误'),
              description: res,
            });
          } else if (res && !res?.failed) {
            resolve(true);
            notification.success();
            history.push(`/smdm/materiel-application/list`);
          }
          resolve(false);
        },
        afterClose: () => {
          resolve(false);
        },
      });
    });
  }

  @Bind()
  @Throttle(1000)
  handleApprove() {
    return new Promise(async (resolve) => {
      const { approvaFlags } = this.state;
      const {
        history,
        materielApplicationPub: {
          materielDetail: { workflowBusinessKey },
        },
      } = this.props;
      openApproveModal({
        modalProps: {
          title: intl.get('hzero.common.button.approval').d('审批'),
          closable: true,
        },
        taskId: approvaFlags[workflowBusinessKey]?.taskId,
        processInstanceId: approvaFlags[workflowBusinessKey]?.processInstanceId,
        onSuccess: () => {
          history.push(`/smdm/materiel-application/list`);
        },
      });
      resolve(true);
    });
  }

  /**
   * render
   * @returns React.element
   */
  render() {
    const {
      remote,
      loading = false,
      saving = false,
      handleDeleteLoading = false,
      fetchSubmitLoading = false,
      organizationId = false,
      demanding = false,
      deleteLoading = false,
      dispatch,
      match = {},
      user: { currentUser = {} },
      materielApplicationPub: {
        materielDetail: {
          itemAllOrgFlag,
          queryAllFlag,
          primaryUomName,
          primaryUomId,
          reqStatus,
          workflowBusinessKey,
        },
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
      customizeCollapse,
      customizeTabPane,
      customizeBtnGroup,
      form: { setFieldsValue },
    } = this.props;
    const {
      params: { itemReqHeaderId },
      path = '',
    } = match;
    const isPathPub = path.indexOf('/pub') === 0;
    const { id } = currentUser;
    const {
      uploadVisible,
      isEdit,
      editAble,
      collapseKeys,
      visabled,
      // isChangeType,
      tipModalVisible,
      approvaFlags = {},
      operationFlags = {},
    } = this.state;
    const attributeTableProps = {
      dataSource: attributeData,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      customizeTable,
      customizeForm,
      editAble,
      customizeBtnGroup,
    };
    const partnerTableProps = {
      isEdit,
      dataSource: partnerData,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onValid: this.checkPartnerValid,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      itemReqHeaderId,
      editAble,
    };
    const categoryTableProps = {
      isEdit,
      remote,
      itemReqHeaderId,
      dataSource: categoryData,
      onTableChange: this.handleTableChange,
      fetchCategoryTemplate: this.fetchCategoryTemplate,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onValid: this.checkValid,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      customizeTable,
      customizeBtnGroup,
      editAble,
      handleChangeData: this.handleChangeData,
      fetchDataCategories: this.fetchDataCategories,
      handleStateUpdate: this.handleStateUpdate,
    };
    const AffiliatedOrgTableProps = {
      // text:form.getFieldValue("demandExecutor"),
      // demandValue:form.getFieldValue("demandExecutorBys"),
      dispatch,
      ExecutorData,
      ExtorPagination,
      // onChange:this.onExecutorChange,
      demanding,
      dimensionQcList,
      allowExcessTypeList,
      isEdit,
      queryAllFlag,
      itemAllOrgFlag: itemAllOrgFlag || 0,
      dataSource: affliatedData,
      organizationId,
      itemReqHeaderId,
      id,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onValid: this.checkValid,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      editAble,
      customizeTable,
      customizeForm,
    };
    const ItemOrgUomTableProps = {
      isEdit,
      primaryUomName,
      primaryUomId,
      dataSource: itemOrgUomData,
      organizationId,
      itemReqHeaderId,
      onTableChange: this.handleTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      editAble,
      customizeForm,
      customizeTable,
    };
    const enclosureTableProps = {
      dataSource: enclosureDataSource,
      currentUser,
      customizeForm,
      customizeTable,
      itemReqHeaderId,
      onTableChange: this.handleTableChange,
      onUpload: this.showUploadModal,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      editAble,
      remote: this.props.remote,
    };
    const componentTableProps = {
      itemReqHeaderId,
      dataSource: componentData,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onTableChange: this.handleTableChange,
      onClearRows: (ref) => {
        this.clearRows = ref;
      },
      customizeTable,
      customizeForm,
      editAble,
      remote: this.props.remote,
    };
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
            title={intl
              .get(`smdm.materielApplication.view.message.title.detail.edit`)
              .d('物料申请单明细')}
            backPath={!isPathPub && '/smdm/materiel-application/list'}
          >
            {editAble && (
              <>
                <Button
                  icon="save"
                  type="primary"
                  loading={
                    saving || loading || deleteLoading || handleDeleteLoading || fetchSubmitLoading
                  }
                  onClick={this.handleSave}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>
                <Button
                  icon="check"
                  loading={
                    fetchSubmitLoading || loading || deleteLoading || handleDeleteLoading || saving
                  }
                  onClick={this.handleSubmit}
                >
                  {intl.get('hzero.common.button.submit').d('提交')}
                </Button>
                <PermissionButton
                  icon="delete"
                  loading={
                    handleDeleteLoading || saving || loading || deleteLoading || fetchSubmitLoading
                  }
                  onClick={this.handleDelete}
                  disabled={!itemReqHeaderId || ['APPROVED', 'SUBMITED'].includes(reqStatus)}
                  permissionList={[
                    {
                      code: `srm.bg.manager.mdm.item.req.button.delete`,
                      type: 'button',
                    },
                  ]}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </PermissionButton>
              </>
            )}
            {approvaFlags[workflowBusinessKey] && !isPathPub && (
              <PermissionButton
                type="c7n-pro"
                onClick={() => this.handleApprove()}
                funcType="raised"
                wait={500}
                icon="authorize"
                loading={this.state?.loading}
              >
                {intl.get('hzero.common.button.approval').d('审批')}
              </PermissionButton>
            )}
            {operationFlags[workflowBusinessKey]?.REVOKE && !isPathPub && (
              <PermissionButton
                type="c7n-pro"
                onClick={() => this.handleRevoke()}
                funcType="raised"
                icon="reply"
                wait={500}
              >
                {intl.get('hzero.common.button.revokeApproval').d('撤销审批')}
              </PermissionButton>
            )}
            {itemReqHeaderId ? (
              <Button loading={loading} onClick={this.handleOperationModel}>
                {intl
                  .get('smdm.materialApplication.model.materialApplication.operationRecords')
                  .d('操作记录')}
              </Button>
            ) : null}
          </Header>
          <Content
            wrapperClassName={`${DETAIL_DEFAULT_CLASSNAME} ${!isPathPub ? styles['overflow-detail-content'] : ''
              }`}
          >
            {customizeCollapse(
              {
                code: 'SMDM_MATERIELAPPLICATION_EDIT.BASIC',
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
                  hidden={!isPathPub}
                  header={
                    <>
                      <h3>{intl.get(`smdm.materiel.view.message.changeInfo`).d('变更信息')}</h3>
                      <a>
                        {collapseKeys.some((item) => item === 'approveEditInfo')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={
                          collapseKeys.some((item) => item === 'approveEditInfo') ? 'up' : 'down'
                        }
                      />
                    </>
                  }
                  key="approveEditInfo"
                >
                  <ChangeInfo changeDs={this.changeDs} />
                </Collapse.Panel>
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
                        {collapseKeys.some((item) => item === 'commondity')
                          ? intl.get(`hzero.common.button.up`).d('收起')
                          : intl.get(`hzero.common.button.expand`).d('展开')}
                      </a>
                      <Icon
                        type={collapseKeys.some((item) => item === 'commondity') ? 'up' : 'down'}
                      />
                    </>
                  }
                  key="commondity"
                >
                  {this.renderCommodityForm()}
                </Collapse.Panel>
              </Collapse>
            )}
            {customizeTabPane(
              {
                code: 'SMDM_MATERIELAPPLICATION_EDIT.TABS',
              },
              <Tabs defaultActiveKey="attributeTable" animated={false}>
                <Tabs.TabPane
                  tab={intl
                    .get(`smdm.materiel.view.message.tab.attributeTable`)
                    .d('自定义物品属性')}
                  key="attributeTable"
                >
                  <AttributeTable {...attributeTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.partnerTable`).d('客户物料')}
                  key="partnerTable"
                  forceRender={!visabled}
                >
                  {visabled && <PartnerTable {...partnerTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl
                    .get(`smdm.materiel.view.message.tab.categoryTable`)
                    .d('自主品类分配物料')}
                  key="categoryTable"
                  forceRender={!visabled}
                >
                  {visabled && <CategoryTable {...categoryTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.affiliatedOrgTable`).d('所属组织')}
                  key="affiliatedOrgTable"
                >
                  {visabled && <AffiliatedOrgTable {...AffiliatedOrgTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.itemOrgUomTable`).d('单位转换关系')}
                  key="itemOrgUomTable"
                >
                  {visabled && <ItemOrgUomTable {...ItemOrgUomTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.enclosure`).d('附件信息')}
                  key="enclosure"
                >
                  {visabled && <EnclosureTable {...enclosureTableProps} />}
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl.get(`smdm.materiel.view.message.tab.componentTable`).d('组件清单')}
                  key="componentTable"
                >
                  {visabled && <ComponentTable {...componentTableProps} />}
                </Tabs.TabPane>
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
            onlyOperation={false}
            operationData={this.state.operationData}
            approveData={this.state.approveData}
            dataLoading={this.state.operationModelDataLoading}
            isReq
            pagination={this.state.pagination}
            handleOperationModel={this.handleOperationModel}
          />
        ) : null}

        {tipModalVisible && (
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
        )}
      </React.Fragment>
    );
  }
}
