/**
 * DefinitionDetail - 供货能力定义
 * @date: 2018-9-25
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import qs from 'querystring';
import { DataSet, Modal as C7nModal } from 'choerodon-ui/pro';
import { Form, Button, Row, Col, Input, Tabs, Spin, Modal, Upload, Icon, Tag } from 'hzero-ui';
import { Button as PermissionButton } from 'components/Permission';
import { isEmpty, isString, concat, isNil } from 'lodash';
import { Bind } from 'lodash-decorators';
import uuid from 'uuid/v4';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';

import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import {
  getCurrentOrganizationId,
  getUserOrganizationId,
  getAccessToken,
  filterNullValueObject,
  createPagination,
  addItemsToPagination,
  delItemsToPagination,
} from 'utils/utils';
import remote from 'utils/remote';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getDynamicTable } from '@/routes/components/DynamicTable';
import { handleSupplierDetail } from '@/routes/components/utils/utils';
import { queryRelTableConfig } from '@/routes/components/DynamicTable/utils/service';
import ExpandTable from './ExpandTable';

import { getExpanCompany } from './stores/getExpandDS';
import CategoryMaterialTable from '../Tables/CategoryMaterialTable';
import SupplierClassificationTable from '../Tables/SupplierClassificationTable';
import EnclosureTable from '../Tables/EnclosureTable';
import '../index.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Dragger } = Upload;
const { confirm } = Modal;

const customizeUnitCode =
  'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_LINE,SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL.HEADER';

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

/**
 * 供货能力定义
 * @extends {Component} - PureComponent
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} supplyAbility - 数据源
 * @reactProps {boolean} loading - 数据加载是否完成
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
      loading.effects['supplyAbility/querySupplierClassification'] ||
      loading.effects['supplyAbility/querySupplierInfo'] ||
      loading.effects['supplyAbility/queryCategoryMaterial'],
    saving:
      loading.effects['supplyAbility/saveAll'] ||
      loading.effects['supplyAbility/enabledFlag'] ||
      loading.effects['supplyAbility/saveBatchLine'],
    organizationId: getCurrentOrganizationId(),
    userOrganizationId: getUserOrganizationId(),
    ...themeConfig,
  };
})
@Form.create({ fieldNameProp: null })
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common', 'sslm.supplierReview', 'sslm.supplierDetail'],
})
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_LINE',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FORM',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL.HEADER',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_BTNS',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL_BTN',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL_TAB',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FILTER',
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_BATCH_FORM',
  ],
  usePostMap: {
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_LINE': ['attributeLongtext10'],
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FORM': ['attributeLongtext10'],
    'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_BATCH_FORM': ['attributeLongtext10'],
  },
})
@remote(
  {
    code: 'SSLM.SUPPLY_ABILITY_DEFINITION',
    name: 'definitionRemote',
  },
  {
    events: {
      cuxItemChange() {}, // 物料改变二开逻辑
    },
  }
)
export default class DefinitionDetail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = props;
    this.state = {
      uploadVisible: false,
      isEdit: !!supplyAbilityId,
      fileList: [],
      headerInfo: {}, // 详细表单信息
      categoryMaterialData: [], // 物料/品类表
      enclosureData: [], // 附件表
      supplierClassificationData: [],
      categoryMaterialPagination: {},
      tableList: [], // 用于配置表
      remoteBtnLoading: false, // 埋点按钮的loading
      categorySelectedRows: [], // 推荐物料/品类勾选行
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const { companyId, supplierCompanyId } = qs.parse(this.props.location.search.substr(1));
    const { companyId: prevCompanyId, supplierCompanyId: prevSupplierCompanyId } = qs.parse(
      prevProps.location.search.substr(1)
    );
    const {
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    const {
      match: {
        params: { supplyAbilityId: prevSupplyAbilityId },
      },
    } = prevProps;
    if (companyId !== prevCompanyId || supplierCompanyId !== prevSupplierCompanyId) {
      return { companyId, supplierCompanyId };
    }
    if (supplyAbilityId !== prevSupplyAbilityId) {
      return { supplyAbilityId };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && (snapshot.companyId || snapshot.supplierCompanyId)) {
      this.querySupplierInfo(snapshot);
    }
    if (snapshot && snapshot.supplyAbilityId) {
      this.loadData();
    }
  }

  componentDidMount() {
    const {
      match: {
        params: { supplyAbilityId },
      },
      definitionRemote,
    } = this.props;
    if (supplyAbilityId) {
      // 第一次加载页面不查行信息，不然个性化配了行查询条件默认值不生效，行第一次查询放在行form渲染完成查询
      this.loadData({ firstOpenPage: true });
    }
    const routerParams = qs.parse(this.props.location.search.substr(1));
    const { companyId, supplierCompanyId } = routerParams;
    if (companyId || supplierCompanyId) {
      this.querySupplierInfo({ companyId, supplierCompanyId });
    }
    if (definitionRemote) {
      definitionRemote.event.fireEvent('SUPPLY_ABILITY_DEFINITION_CUX_ATTRIBUTEDATA', {
        _this: this,
        supplyAbilityId,
        companyId,
        supplierCompanyId,
      });
    }
    // 查询配置表
    queryRelTableConfig('sslm_supply_ability_definition').then((res) => {
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
  loadData({ page = {}, queryParam = {}, clearType = 'all', firstOpenPage = false } = {}) {
    const {
      dispatch,
      organizationId,
      match: {
        params: { supplyAbilityId },
      },
      form,
    } = this.props;
    dispatch({
      type: `supplyAbility/queryDetail`,
      payload: {
        page,
        organizationId,
        supplyAbilityId,
        bodyData: queryParam,
        customizeUnitCode,
        abilityLineCode:
          'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_LINE,SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FILTER',
      },
    }).then((allData) => {
      const { headerInfo = {}, categoryMaterialData = {}, enclosureData = [] } = allData;
      const { content = [] } = categoryMaterialData;
      let categoryMaterialInfo = {};
      if (!firstOpenPage) {
        const categoryMaterialPagination = createPagination(categoryMaterialData);
        const newCategoryMaterialData = this.handleDataSourceAndSelectedRows({
          dataSource: content,
          clearType,
        });
        categoryMaterialInfo = {
          categoryMaterialData: newCategoryMaterialData,
          categoryMaterialPagination,
        };
      }
      this.setState(
        {
          headerInfo,
          enclosureData,
          ...categoryMaterialInfo,
        },
        () => {
          if (form) {
            // 重置表单值，解决调用validate后，值不干净问题
            form.resetFields();
          }
        }
      );

      if (!isEmpty(headerInfo)) {
        const { supplierCompanyId, supplierTenantId } = headerInfo;
        this.querySupplierClassification({}, supplierCompanyId, supplierTenantId);
        this.handleAbilityDimension(supplierCompanyId);
      }
    });
  }

  /**
   * 查询工作台带出的供应商信息
   */
  @Bind()
  async querySupplierInfo(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplyAbility/querySupplierInfo',
      payload,
    }).then((res) => {
      if (res) {
        const newHeaderInfo = {
          supplierCompanyName: res.supplierCompanyName,
          supplierCompanyId: res.partnerCompanyId,
          supplierCompanyNum: res.supplierCompanyNum,
          supplierTenantId: res.partnerTenantId,
          dimensionCode: res.dimensionCode,
          supplyListDimensionCode: res.supplyListDimensionCode,
          companyId: res.supplyListDimensionCode === 'GROUP' ? undefined : res.companyId,
          companyName: res.supplyListDimensionCode === 'GROUP' ? undefined : res.companyName,
        };
        this.querySupplierClassification({}, res.companyId, res.supplierTenantId);
        this.setState({ headerInfo: newHeaderInfo });
      }
    });
  }

  /**
   * 处理数据员个更新行勾选
   */
  @Bind()
  handleDataSourceAndSelectedRows({ dataSource = [], clearType = 'all' } = {}) {
    let newDataSource = dataSource;
    if (this.categoryRef) {
      let newSelectedRows = this.categoryRef.state.selectedRows || [];
      if (clearType === 'create') {
        // 清空新建
        newSelectedRows = newSelectedRows.filter((item) => !item.isLocal);
      }
      if (clearType === 'all') {
        newSelectedRows = [];
      }
      const selectedCategoryLineKeys = newSelectedRows.map((item) => item.abilityLineId);
      // 新查询的数据标记已经勾选的数据标识给个性化二开按钮使用
      newDataSource = dataSource.map((item) => {
        if (selectedCategoryLineKeys.includes(item.abilityLineId)) {
          return { ...item, selected: true };
        } else {
          return { ...item };
        }
      });
      // 更新行勾选值
      this.categoryRef.handleUpdateSelectedRows(newSelectedRows);
    }
    return newDataSource;
  }

  /**
   * 附件弹窗关闭之后查询推荐物料/品类
   */
  @Bind()
  handleAttrChange() {
    this.loadData({ clearType: 'create' });
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
    }).then((res) => {
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
    const { categoryMaterialData = [] } = this.state;
    const editFlag = categoryMaterialData.filter((n) => n.isLocal || n.isUpdate);

    if (!isEmpty(editFlag)) {
      confirm({
        title: intl
          .get('hzero.common.validation.nowDataNotSave')
          .d('当前数据有未保存。继续操作将造成数据丢失，是否继续？'),
        okText: intl.get('hzero.common.button.continue').d('继续'),
        onOk: () => {
          const newPagination = {
            ...pagination,
            pageSize: 10,
            pageSizeOptions: ['10', '20', '50', '100'],
          };
          this.loadData({ page: newPagination, queryParam, clearType: 'create' });
        },
      });
    } else {
      this.loadData({ page: pagination, queryParam, clearType: 'noClear' });
    }
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
  addTableData(dataList, dataName, isPaging, addList = []) {
    const { categoryMaterialData, categoryMaterialPagination } = this.state;
    if (isPaging) {
      if (dataName === 'categoryMaterialData') {
        this.setState({
          [dataName]: [...dataList],
          categoryMaterialPagination: addItemsToPagination(
            addList.length,
            categoryMaterialData.length,
            categoryMaterialPagination
          ),
        });
      } else {
        this.setState({
          [dataName]: {
            ...this.state[dataName],
            content: dataList,
          },
        });
      }
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
  deleteTableData(
    localRows,
    idList,
    functionName,
    dataName,
    isPaging,
    deleteList,
    deleteAttachments = []
  ) {
    // itemLineIdList
    const { dispatch, organizationId } = this.props;
    const { categoryMaterialData, categoryMaterialPagination } = this.state;

    if (!isEmpty(idList)) {
      dispatch({
        type: `supplyAbility/${functionName}`,
        payload: {
          idList,
          organizationId,
        },
      }).then((res) => {
        if (res) {
          this.loadData();
          notification.success();
        }
      });
    } else if (isPaging) {
      if (dataName === 'categoryMaterialData') {
        if (this.categoryRef) {
          this.categoryRef.handleUpdateSelectedRows([]);
        }
        this.setState({
          [dataName]: [...localRows],
          categoryMaterialPagination: delItemsToPagination(
            deleteList.length,
            categoryMaterialData.length,
            categoryMaterialPagination
          ),
        });
      } else {
        this.setState({
          [dataName]: {
            ...this.state[dataName],
            content: localRows,
          },
        });
      }
    } else {
      this.setState({
        [dataName]: localRows,
      });
    }
    const urls = deleteAttachments.map((item) => item.attachmentUrl);
    if (!isEmpty(filterNullValueObject(urls))) {
      dispatch({
        type: 'supplyAbility/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-supplyAbility',
          urls,
        },
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
    tableList.forEach((n) => {
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

  // 获取需保存的数据
  @Bind()
  getSaveParams() {
    const {
      form,
      organizationId,
      match: {
        params: { supplyAbilityId },
      },
    } = this.props;
    const {
      headerInfo,
      categoryMaterialData: categoryMaterialContent = [],
      enclosureData = [],
    } = this.state;
    let payload = {};
    form.validateFields((err, formData) => {
      if (!err) {
        const { supplierNameLov, ...formValues } = formData;
        const supplyAbilityLines = categoryMaterialContent
          .map((item) => {
            if (item.isLocal) {
              const { abilityLineId, ...other } = item;
              return { ...other, supplyAbilityId, tenantId: organizationId };
            } else {
              return item;
            }
          })
          .filter((item) => item.isUpdate || item.isLocal); // 获取变更数据
        const supplyAbilityAttLns = enclosureData.map((item) => {
          if (item.isLocal) {
            const { attachmentLineId, isLocal, ...other } = item;
            return { ...other, supplyAbilityId, tenantId: organizationId };
          } else {
            return item;
          }
        });
        // 校验模型表
        const modelDatas = this.checkModelTableData();
        if (!modelDatas) {
          return;
        }
        formValues.modelDatas = [...modelDatas];
        payload = {
          ...headerInfo,
          supplyAbilityLines,
          supplyAbilityAttLns,
          organizationId,
          ...formValues,
          optional: true,
          customizeUnitCode,
        };
      }
    });
    return payload;
  }

  /**
   * 保存所有数据
   */
  @Bind()
  handleSave() {
    const { dispatch, history } = this.props;
    const { isEdit } = this.state;
    const saveParams = this.getSaveParams();
    if (!isEmpty(saveParams)) {
      const { supplyAbilityAttLns } = saveParams;
      if (supplyAbilityAttLns.length > 0) {
        let flag = true;
        for (let index = 0; index < supplyAbilityAttLns.length; index++) {
          const { attachmentType, effectiveDate, expiryDate } = supplyAbilityAttLns[index];
          if (isNil(attachmentType) || isNil(effectiveDate) || isNil(expiryDate)) {
            flag = false;
            break;
          }
        }
        if (flag) {
          dispatch({
            type: 'supplyAbility/saveAll',
            payload: saveParams,
          }).then((res) => {
            if (res) {
              const { supplyAbilityId: id } = res;
              this.fetchModelTableData(id);
              if (!isEdit) {
                history.push(`/sslm/supplier-ablility-definition/detail/${id}`);
              } else {
                this.loadData();
              }
              notification.success();
            }
          });
        } else {
          Modal.info({
            content: intl
              .get(`sslm.supplyAbility.view.message.plMainFields`)
              .d('请单击编辑维护以下必填字段, [文件类型] / [文件生效期] / [文件失效期]'),
          });
        }
      } else {
        dispatch({
          type: 'supplyAbility/saveAll',
          payload: saveParams,
        }).then((res) => {
          if (res) {
            const { supplyAbilityId: id } = res;
            this.fetchModelTableData(id);
            if (!isEdit) {
              history.push(`/sslm/supplier-ablility-definition/detail/${id}`);
            } else {
              this.loadData();
            }
            notification.success();
          }
        });
      }
    }
  }

  /**
   * 查询模型表数据
   */
  @Bind()
  fetchModelTableData(reqId) {
    const { tableList } = this.state;
    tableList.forEach((n) => {
      if (this[n.tableCode]) {
        this[n.tableCode].queryDynamicTable({}, reqId);
      }
    });
  }

  /**
   * 物料/品类行批量编辑保存
   */
  @Bind()
  handleSaveBatchLine(lineData = {}) {
    const { form, dispatch } = this.props;
    const { headerInfo } = this.state;
    form.validateFields((err, formData) => {
      if (!err) {
        const { supplierNameLov, ...formValues } = formData;
        const headerData = {
          ...headerInfo,
          ...formValues,
          optional: true,
          customizeUnitCode,
        };
        const payload = {
          ...headerData,
          ...lineData,
        };
        dispatch({
          type: 'supplyAbility/saveBatchLine',
          payload,
        }).then((res) => {
          if (res) {
            this.loadData();
            notification.success();
          }
        });
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
    this.setState({
      uploadVisible: false,
      fileList: [],
    });
  }

  /**
   * 上传modal确定按钮
   */
  @Bind()
  handleUploadOk() {
    const {
      user: {
        currentUser: { id, loginName, realName },
      },
      organizationId,
      itemId,
    } = this.props;
    const { fileList = [], enclosureData = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map((file) => {
          return {
            loginName,
            realName,
            itemId,
            attachmentLineId: uuid(),
            attachmentDesc: file.name,
            attachmentSize: file.size,
            attachmentUrl: file.response,
            uploadUserId: id,
            remark: '',
            tenantId: organizationId,
            isLocal: true,
          };
        })
      : [];
    this.setState({
      uploadVisible: false,
      fileList: [],
      enclosureData: [...enclosureData, ...fileData],
    });
  }

  /**
   * 将上传列表放到state
   * @param {object} file
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
   * @param {Object} file - 上传的文件
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 50 * 1024 * 1024 } = this.props;
    if (file.size > fileSize) {
      file.status = 'error'; // eslint-disable-line
      const res = {
        message: intl
          .get(`hzero.common.upload.error.size`, {
            fileSize: `${fileSize / (1024 * 1024)}`,
          })
          .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
      };
      file.response = res; // eslint-disable-line
      return false;
    }
    return true;
  }

  @Bind()
  uploadData(file) {
    return {
      bucketName: PRIVATE_BUCKET,
      directory: 'sslm-supplyAbility',
      fileName: file.name,
    };
  }

  /**
   * 上传change触发事件
   * @param {Object} info - 上传的文件
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
   * @param {Object} file - 上传的文件
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch, organizationId } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'supplyAbility/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: 'sslm-supplyAbility',
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
   * 校验数据唯一性
   * @param {Number} supplierCompanyId 供应商Id
   * @param {Number} companyId 公司Id
   */
  @Bind()
  checkValid(supplierCompanyId, companyId) {
    if (supplierCompanyId && companyId) {
      const { dispatch, organizationId, form } = this.props;
      dispatch({
        type: 'supplyAbility/checkValid',
        payload: { supplierCompanyId, companyId, organizationId },
      }).then((res) => {
        if (!res) {
          form.setFieldsValue({ companyId: undefined });
        }
      });
    }
  }

  // 拓展回调
  @Bind()
  async handleExpand(categorySelectedRows) {
    const { dispatch } = this.props;
    const { headerInfo } = this.state;
    const dataSet = new DataSet(getExpanCompany(headerInfo));
    const columns = [
      {
        name: 'companyNum',
        width: 200,
      },
      {
        name: 'companyName',
      },
    ];
    const localList = categorySelectedRows.map((n) => n.isLocal).filter(Boolean);
    if (isEmpty(localList)) {
      C7nModal.open({
        drawer: true,
        closable: true,
        key: C7nModal.key(),
        style: { width: 650 },
        okText: intl.get('sslm.supplyAbility.view.btn.expand').d('拓展'),
        title: intl.get('sslm.supplyAbility.view.title.expandMsg').d('物料品类拓展至其他公司'),
        children: <ExpandTable columns={columns} dataSet={dataSet} />,
        onOk: async () => {
          const companySelectedRows = dataSet.toJSONData();
          if (isEmpty(companySelectedRows)) {
            notification.warning({
              message: intl
                .get('sslm.supplyAbility.view.message.atLeastOne')
                .d('请至少勾选一行公司！'),
            });
            return false;
          } else {
            await dispatch({
              type: 'supplyAbility/expandCategory',
              payload: {
                ...headerInfo,
                companyIds: companySelectedRows.map((n) => n.companyId),
                supplyAbilityExpandLines: categorySelectedRows,
              },
            }).then((res) => {
              if (res) {
                if (this.categoryRef) {
                  this.categoryRef.handleUpdateSelectedRows([]);
                }
                notification.success();
                if (res[0] && res[0].supplyAbilityExpandId) {
                  // 跳转拓展申请单页面
                  this.props.history.push(
                    `/sslm/supplier-ablility-definition/expand-detail/${res[0].supplyAbilityExpandId}`
                  );
                }
              }
            });
          }
        },
      });
    } else {
      notification.warning({
        message: intl
          .get('sslm.supplyAbility.view.expand.checkError')
          .d('勾选行内存在未保存的供货能力，请保存后再进行拓展'),
      });
    }
  }

  // 查询配置中心供货能力清单管控维度
  @Bind()
  handleAbilityDimension(supplierCompanyId) {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplyAbility/queryAbilityDimension',
      payload: {
        supplierCompanyId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          isCompanyDimension: res === 'COMPANY',
        });
      }
    });
  }

  /**
   * 基本信息
   */
  @Bind()
  baseForm() {
    const {
      form,
      // user: { currentUser: { id } },
      userOrganizationId,
      customizeForm = () => {},
    } = this.props;
    const { getFieldDecorator, setFieldsValue, getFieldValue } = form;
    const { isEdit, headerInfo } = this.state;
    getFieldDecorator('supplierCompanyId', { initialValue: headerInfo.supplierCompanyId });
    getFieldDecorator('supplierTenantId', { initialValue: headerInfo.supplierTenantId });
    getFieldDecorator('supplyListDimensionCode', { initialValue: 'GROUP' });
    return customizeForm(
      {
        code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL.HEADER',
        form,
        dataSource: headerInfo,
      },
      <Form className="ued-edit-form detail-form-wrap">
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.name').d('供应商名称')}
            >
              {getFieldDecorator('supplierNameLov', {
                rules: [
                  {
                    required: !isEdit,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
                    }),
                  },
                ],
                initialValue: headerInfo.supplierCompanyName,
              })(
                isEdit ? (
                  <span>{headerInfo.supplierCompanyName}</span>
                ) : (
                  <Lov
                    code="SSLM.USER_AUTH.SUPPLIER"
                    // queryParams={{ userId: id, tenantId: organizationId }}
                    disabled={isEdit}
                    textField="supplierCompanyName"
                    textValue={headerInfo.supplierCompanyName}
                    lovOptions={{
                      valueField: 'uniqueKey',
                    }}
                    onChange={(text, record) => {
                      setFieldsValue({
                        supplierCompanyId: record.supplierCompanyId,
                        supplierCompanyNum: record.supplierCompanyCode,
                        supplierTenantId: record.supplierTenantId,
                        supplyListDimensionCode: record.supplyListDimensionCode,
                      });
                      this.checkValid(record.supplierCompanyId, getFieldValue('companyId'));
                      this.querySupplierClassification(
                        {},
                        record.companyId,
                        record.supplierTenantId
                      );
                    }}
                  />
                )
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.supplier.code').d('供应商编码')}
            >
              {getFieldDecorator('supplierCompanyNum', {
                initialValue: headerInfo.supplierCompanyNum,
              })(isEdit ? <span>{headerInfo.supplierCompanyNum}</span> : <Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              {...formItemLayout}
              label={intl.get('sslm.common.view.company.name').d('公司')}
            >
              {getFieldDecorator('companyId', {
                rules: [
                  {
                    required: getFieldValue('supplyListDimensionCode') === 'COMPANY',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.view.company.name').d('公司'),
                    }),
                  },
                ],
                initialValue: headerInfo.companyId,
              })(
                getFieldValue('supplyListDimensionCode') === 'COMPANY' ? (
                  <Lov
                    code="SPFM.USER_AUTHORITY_COMPANY"
                    disabled={isEdit || getFieldValue('supplyListDimensionCode') === 'GROUP'}
                    textValue={headerInfo.companyName}
                    queryParams={{
                      organizationId: userOrganizationId,
                      supplierCompanyId: getFieldValue('supplierCompanyId'),
                    }}
                    onChange={(text) => {
                      this.checkValid(getFieldValue('supplierCompanyId'), text);
                    }}
                  />
                ) : (
                  <span>{headerInfo.companyName}</span>
                )
              )}
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
              })(<TextArea style={{ resize: 'none' }} />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  // 更新state
  @Bind()
  updateState(state = {}) {
    this.setState((prevState) => ({
      ...prevState,
      ...state,
    }));
  }

  /**
   * 推荐物料/品类
   * callback 回调函数
   */
  @Bind()
  queryCategoryMaterialData(param = {}, callback) {
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
        supplyAbilityId,
        organizationId,
        customizeUnitCode,
        abilityLineCode:
          'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_LINE,SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FILTER',
      },
    }).then((res) => {
      if (res) {
        const { content = [] } = res;
        if (callback) {
          callback(content);
          return;
        }
        const categoryMaterialPagination = createPagination(res);
        const newCategoryMaterialData = this.handleDataSourceAndSelectedRows({
          dataSource: content,
          clearType: 'create',
        });
        this.setState({
          categoryMaterialData: newCategoryMaterialData,
          categoryMaterialPagination,
        });
      }
    });
  }

  @Bind()
  setLoading(flag) {
    this.setState({ remoteBtnLoading: flag });
  }

  // 改变勾选行
  @Bind()
  changeCategorySelectedRows(rows) {
    this.setState({
      categorySelectedRows: rows,
    });
  }

  render() {
    const {
      loading,
      saving,
      form,
      dispatch,
      organizationId,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      customizeFilterForm,
      customizeTabPane,
      user: { currentUser = {} },
      tabsPrimaryColor,
      definitionRemote,
    } = this.props;
    const {
      uploadVisible,
      isEdit,
      categoryMaterialData,
      enclosureData,
      isCompanyDimension,
      supplierClassificationData,
      categoryMaterialPagination,
      tableList,
      headerInfo,
      remoteBtnLoading,
      categorySelectedRows,
    } = this.state;
    const { supplierCompanyId, companyId, supplyAbilityId } = headerInfo;
    // 推荐物料
    const categoryMaterialTableProps = {
      isEdit,
      basicForm: form,
      customizeTable,
      customizeForm,
      customizeBtnGroup,
      customizeFilterForm,
      isCompanyDimension,
      dataSource: categoryMaterialData,
      pagination: categoryMaterialPagination,
      optional: true,
      remote: definitionRemote,
      filterCode: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.ITEM_FILTER',
      updateState: this.updateState,
      onTableChange: this.categoryMaterialTableChange,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
      onRef: (ref) => {
        this.categoryRef = ref;
      },
      handleAttrChange: this.handleAttrChange,
      onExpand: this.handleExpand,
      queryCategoryMaterialData: this.queryCategoryMaterialData,
      handleSaveBatchLine: this.handleSaveBatchLine,
      changeSelectedRows: this.changeCategorySelectedRows,
    };
    // 供应商分类
    const supplierClassificationTableProps = {
      dataSource: supplierClassificationData,
      onTableChange: this.tableChange,
    };
    const enclosureTableProps = {
      dataSource: enclosureData,
      currentUser,
      onUpload: this.showUploadModal,
      onAdd: this.addTableData,
      onDeleteRows: this.deleteTableData,
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

    // 头按钮埋点props
    const headerBtnProps = {
      dispatch,
      headerInfo,
      loading,
      _this: this,
      categorySelectedRows,
      setLoading: this.setLoading,
      getSaveParams: this.getSaveParams,
    };

    const allLoading = saving || loading || remoteBtnLoading;
    return (
      <React.Fragment>
        <Spin spinning={allLoading || false}>
          <Header
            title={
              isEdit
                ? intl.get(`sslm.supplyAbility.view.message.title.detailEdit`).d('供货能力清单编辑')
                : intl
                    .get(`sslm.supplyAbility.view.message.title.detailCreate`)
                    .d('供货能力清单创建')
            }
            backPath="/sslm/supplier-ablility-definition/list"
          >
            {customizeBtnGroup(
              {
                code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL_BTN',
              },
              [
                <Button
                  icon="save"
                  data-name="save"
                  type="primary"
                  loading={allLoading}
                  onClick={this.handleSave}
                >
                  {intl.get('hzero.common.button.save').d('保存')}
                </Button>,
                <PermissionButton
                  icon="profile"
                  loading={allLoading}
                  data-name="supplierInfo"
                  onClick={() => handleSupplierDetail(headerInfo)}
                  style={{ display: isEdit ? 'block' : 'none' }}
                  permissionList={[
                    {
                      code: 'srm.partner.suplier-ability.supply-ability-define.ps.supplier.info',
                      type: 'button',
                      meaning: '供应商360信息',
                    },
                  ]}
                >
                  {intl.get('sslm.supplierReview.view.button.supplierInfo').d('查看供应商360信息')}
                </PermissionButton>,
              ]
            )}
            {definitionRemote.render &&
              definitionRemote.render(
                'SSLM.SUPPLY_ABILITY_DEFINITION.HEADER_BTN',
                null,
                headerBtnProps
              )}
          </Header>
          <Content>
            <div className="form-info">{this.baseForm()}</div>
            {customizeTabPane(
              {
                code: 'SSLM.SUPPLIER_ABLILITY_DEFINITION.DETAIL_TAB',
              },
              <Tabs animated={false}>
                <Tabs.TabPane
                  tab={intl
                    .get(`sslm.supplyAbility.view.message.categoryMaterialTable`)
                    .d('推荐物料/品类')}
                  key="categoryMaterialTable"
                >
                  <CategoryMaterialTable {...categoryMaterialTableProps} />
                </Tabs.TabPane>
                <Tabs.TabPane
                  tab={intl
                    .get(`sslm.supplyAbility.view.message.supplierClassTable`)
                    .d('供应商分类')}
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
                .get(`sslm.supplyAbility.view.message.uploadMessage`)
                .d('单击或拖动附件(50MB以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get(`hzero.common.upload.hint`).d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>
      </React.Fragment>
    );
  }
}
