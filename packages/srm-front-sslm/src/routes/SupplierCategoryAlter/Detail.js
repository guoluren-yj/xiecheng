import React, { Component } from 'react';
import {
  Button,
  Form,
  Table,
  Col,
  Row,
  Icon,
  Input,
  InputNumber,
  Modal,
  Divider,
  Tabs,
  Select,
  DatePicker,
  Spin,
  Upload,
  Badge,
  Tag,
} from 'hzero-ui';
import { connect } from 'dva';
import qs from 'querystring';
import { isEmpty, isString, every, map, isNil } from 'lodash';
import moment from 'moment';
import uuid from 'uuid/v4';
import { enableRender, dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { HZERO_FILE } from 'utils/config';
import { PRIVATE_BUCKET } from '_utils/config';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import notification from 'utils/notification';
import {
  createPagination,
  getCurrentOrganizationId,
  getAccessToken,
  delItemToPagination,
  getEditTableData,
  addItemsToPagination,
  getResponse,
} from 'utils/utils';
import CusLov from '@/routes/components/Lov'; // lov父级品类不可选
import LovMultiple from '@/routes/components/LovMultiple';
import { isReview, reviewFile, downLoadFile, defaultMaxFileSize } from '@/routes/components/utils';

import { checkSupplierCtgAlter } from '@/services/supplierCategoryAlterService';
import { fetchRemoteFileSizeLimit } from '@/services/commonService';

import styles from './index.less';

const { TextArea } = Input;
const { Item: FormItem } = Form;
const { Option } = Select;
const { TabPane } = Tabs;
const { Dragger } = Upload;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};
const bucketDirectory = 'sslm-category';

const customizeUnitCode = [
  'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.HEADER',
  'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.CATEGORY_TABLE',
  'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.ATTACHMENT_TABLE',
];

@connect(({ supplierCategoryAlter, user = {}, loading }) => {
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
    supplierCategoryAlter,
    user,
    tenantId: getCurrentOrganizationId(),
    formLoading:
      loading.effects['supplierCategoryAlter/querySupplierCategoryAlterDetail'] ||
      loading.effects['supplierCategoryAlter/querySupplierInfo'],
    operationLoading:
      loading.effects['supplierCategoryAlter/saveSupplierCategoryAlter'] ||
      loading.effects['supplierCategoryAlter/submitSupplierCategoryAlter'] ||
      loading.effects['supplierCategoryAlter/deleteSupplierCategoryAlter'] ||
      loading.effects['supplierCategoryAlter/querySupplierCategoryAlterDetail'] ||
      loading.effects['supplierCategoryAlter/querySupplierInfo'],
    categoryLoading: loading.effects['supplierCategoryAlter/queryCurrentSupplierCtg'],
    ...themeConfig,
  };
})
@formatterCollections({
  code: ['sslm.supplierCategoryAlter', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.HEADER',
    'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.CATEGORY_TABLE',
    'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.ATTACHMENT_TABLE',
    'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.HEADER_BTNGROUP',
  ],
})
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    const isNew = match.path.indexOf('create') !== -1;
    const categoryAlterId = isNew ? undefined : match.params.categoryAlterId;
    const isDisabled = this.props.location.pathname.includes('/pub/'); // 判断是否为pub页面
    this.state = {
      isNew,
      categoryAlterId, // 分类变更申请 id
      selectedAttachmentLines: [], // 附件表格选中行
      uploadVisible: false, // 上传附件窗口显示状态
      fileList: [], // 上传文件列表
      supplierCompanyId: null, // 供应商 id
      supplierTenantId: null, // 供应商租户 id
      isDisabled, // 是否为pub页面
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const thisParams = qs.parse(this.props.location.search.substr(1));
    const prevParams = qs.parse(prevProps.location.search.substr(1));
    const { companyId, supplierCompanyId } = thisParams;
    const { companyId: prevCompanyId, supplierCompanyId: prevSupplierCompanyId } = prevParams;
    if (companyId !== prevCompanyId || supplierCompanyId !== prevSupplierCompanyId) {
      return { companyId, supplierCompanyId };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && (snapshot.companyId || snapshot.supplierCompanyId)) {
      this.querySupplierInfo(snapshot);
    }
  }

  componentDidMount() {
    const { dispatch } = this.props;
    const { categoryAlterId } = this.state;
    const routerParams = qs.parse(this.props.location.search.substr(1));
    const { companyId, supplierCompanyId } = routerParams;
    dispatch({
      type: 'supplierCategoryAlter/init',
    });
    if (categoryAlterId) {
      this.queryDetail(categoryAlterId);
    }
    if (companyId || supplierCompanyId) {
      this.querySupplierInfo({ companyId, supplierCompanyId });
    }
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        supplierCategoryAlterDetail: {},
        currentSupplierCtg: {},
        categoryAlterAttachmentLine: [],
        currentSupplierCtgPage: {},
      },
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      supplierCategoryAlter: {
        operationType: nextOperationType,
        supplierTenantId,
        supplierCompanyId,
      } = {},
    } = nextProps.supplierCategoryAlter.supplierCategoryAlterDetail;
    if (nextOperationType !== prevState.operationType) {
      let updateObj = {}; // 启禁用状态控制变更对象
      let categoryAlterQueryParams = {}; // 变更分类查询条件对象
      let targetCategoryQueryParams = {}; // 目标分类查询条件对象
      switch (nextOperationType) {
        case 'ADD': // 新增分类
          updateObj = {
            currentCategoryIdEnable: false,
            targetCategoryIdEnable: true,
          };
          targetCategoryQueryParams = {
            supplierTenantId,
            supplierCompanyId,
            isCategoryEnabledFlag: 1,
            isAssignFlag: 0,
          };
          break;
        case 'ENABLE': // 启用分类
          updateObj = {
            currentCategoryIdEnable: true,
            targetCategoryIdEnable: false,
          };
          categoryAlterQueryParams = {
            supplierTenantId,
            supplierCompanyId,
            isAssignFlag: 1,
            isEnabledFlag: 0,
          };
          break;
        case 'DISABLE': // 禁用分类
          updateObj = {
            currentCategoryIdEnable: true,
            targetCategoryIdEnable: false,
          };
          categoryAlterQueryParams = {
            supplierTenantId,
            supplierCompanyId,
            isAssignFlag: 1,
            isEnabledFlag: 1,
          };
          break;
        default:
          break;
      }
      return {
        ...updateObj,
        targetCategoryQueryParams,
        categoryAlterQueryParams,
        operationType: nextOperationType,
        supplierTenantId,
        supplierCompanyId,
      };
    }
    return null;
  }

  /**
   * 查询工作台带出的供应商信息
   */
  @Bind()
  querySupplierInfo(params) {
    const { dispatch } = this.props;
    const { isNew } = this.state;
    dispatch({
      type: 'supplierCategoryAlter/querySupplierInfo',
      payload: params,
    }).then(res => {
      if (res) {
        dispatch({
          type: 'supplierCategoryAlter/updateState',
          payload: {
            supplierCategoryAlterDetail: {
              supplierCategoryAlter: {
                supplierZhOrEnCompanyNum: res.supplierZhOrEnCompanyNum,
                supplierCompanyName: res.supplierZhOrEnCompanyNum,
                supplierCompanyNum: res.supplierCompanyNum,
              },
            },
          },
        });
        this.setState({
          supplierCompanyId: res.partnerCompanyId,
          supplierTenantId: res.partnerTenantId,
        });
        // 查询供应商分类
        dispatch({
          type: 'supplierCategoryAlter/queryCurrentSupplierCtg',
          payload: {
            isNew,
            supplierCompanyId: res.partnerCompanyId,
            supplierTenantId: res.partnerTenantId,
            isAssignFlag: 1,
            customizeUnitCode: customizeUnitCode[1],
          },
        });
      }
    });
  }

  /**
   * 根据 id 查询供应商分类变更申请表单详情
   * @param {Number} categoryAlterId - 查询供应商分类变更申请表单 id
   */
  @Bind()
  queryDetail(categoryAlterId, page = {}) {
    const { dispatch } = this.props;
    const { categoryAlterId: detailId } = this.state;
    dispatch({
      type: 'supplierCategoryAlter/querySupplierCategoryAlterDetail',
      payload: {
        categoryAlterId: categoryAlterId || detailId,
        page,
        customizeUnitCode: [
          ...customizeUnitCode,
          'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.CATEGORY_TABLE',
        ],
      },
    });
  }

  // 监测数据是否变化
  @Bind()
  checkLineDataChange() {
    const {
      supplierCategoryAlter: { currentSupplierCtg = {} },
    } = this.props;
    const payloadData = getEditTableData(
      currentSupplierCtg.content,
      ['categoryAlterLineId', '_status'],
      { force: true }
    );
    const isEdit =
      currentSupplierCtg.content &&
      currentSupplierCtg.content.find(n => n._status === 'create' || n._status === 'update');
    if (isEdit) {
      if (!isEmpty(payloadData)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  /**
   * 新增或更新供应商分类变更申请
   */
  @Bind()
  saveSupplierCategoryAlter() {
    const {
      form,
      dispatch,
      tenantId,
      history,
      location,
      supplierCategoryAlter: {
        categoryAlterAttachmentLine = [],
        supplierCategoryAlterDetail = {},
        currentSupplierCtg = {},
      },
    } = this.props;
    const { supplierCompanyId, supplierTenantId, categoryAlterId, isNew } = this.state;
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const lineDataFlag = this.checkLineDataChange();
      if (lineDataFlag) {
        const filterKey = isNew ? ['categoryAlterLineId', '_status'] : [];
        const lineData = getEditTableData(currentSupplierCtg.content, filterKey, {
          force: true,
        }).map(item => {
          const { categoryAlterLineId, _status, ...others } = item;
          const result = {
            ...others,
            categoryAlterId,
            tenantId: getCurrentOrganizationId(),
          };
          if (_status === 'update') {
            result.categoryAlterLineId = categoryAlterLineId;
          }
          return result;
        });
        const { supplierNameLov, ...formValues } = fieldsValue;
        const body = {
          supplierCategoryAlter: {
            ...supplierCategoryAlterDetail.supplierCategoryAlter,
            ...formValues,
            tenantId,
            supplierCompanyId,
            supplierTenantId,
          },
          categoryAlterAttachmentLine: categoryAlterAttachmentLine.map(item => {
            const { isCreate, attachmentLineId, ...otherProperty } = item;
            return isCreate ? otherProperty : { ...otherProperty, attachmentLineId };
          }),
          supplierCategoryAlterLinePage: { content: lineData },
          customizeUnitCode,
        };
        dispatch({
          type: 'supplierCategoryAlter/saveSupplierCategoryAlter',
          payload: { body },
        }).then(res => {
          if (res) {
            const { supplierCategoryAlter: { categoryAlterId: newCategoryAlterId } = {} } = res;
            notification.success();
            if (location.pathname.match('create')) {
              history.push(`/sslm/supplier-category-alter/detail/${newCategoryAlterId}`);
            } else {
              this.queryDetail(newCategoryAlterId);
            }
          }
        });
      }
    });
  }

  /**
   * 提交供应商分类变更申请
   */
  @Bind()
  async submitSupplierCategoryAlter() {
    const {
      form,
      tenantId,
      dispatch,
      history,
      match,
      supplierCategoryAlter: {
        categoryAlterAttachmentLine = [],
        supplierCategoryAlterDetail = {},
        currentSupplierCtg = {},
      },
    } = this.props;
    const { supplierCompanyId, supplierTenantId, categoryAlterId } = this.state;
    const basePath =
      match.path.indexOf('/detail') === -1
        ? match.path.substring(0, match.path.indexOf('/create'))
        : match.path.substring(0, match.path.indexOf('/detail'));
    form.validateFields(async (err, fieldsValue) => {
      if (err) return;

      const lineDataFlag = this.checkLineDataChange();
      if (lineDataFlag) {
        const lineData = getEditTableData(
          currentSupplierCtg.content,
          ['categoryAlterLineId', '_status'],
          { force: true }
        ).map(item => {
          return {
            ...item,
            categoryAlterId,
            tenantId: getCurrentOrganizationId(),
          };
        });
        const { supplierNameLov, ...formValues } = fieldsValue;
        const body = {
          supplierCategoryAlter: {
            ...supplierCategoryAlterDetail.supplierCategoryAlter,
            ...formValues,
            creationDate: null,
            tenantId,
            supplierCompanyId,
            supplierTenantId,
          },
          categoryAlterAttachmentLine: categoryAlterAttachmentLine.map(item => {
            const { isCreate, attachmentLineId, ...otherProperty } = item;
            return isCreate ? otherProperty : { ...otherProperty, attachmentLineId };
          }),
          supplierCategoryAlterLinePage: categoryAlterId ? { content: lineData } : undefined,
          customizeUnitCode,
        };

        const isChecked = getResponse(await checkSupplierCtgAlter({ body }));

        Modal.confirm({
          title:
            isChecked === false
              ? intl
                  .get('sslm.supplierCategoryAlter.view.title.categoryAlterCheckTip')
                  .d('存在要启用的分类已在供应商分类定义被禁用，是否确认变更？')
              : intl.get('hzero.common.message.confirm.submit').d('是否确认提交?'),
          onOk: () => {
            dispatch({
              type: 'supplierCategoryAlter/submitSupplierCategoryAlter',
              payload: { body },
            }).then(res => {
              if (res) {
                notification.success();
                history.push(`${basePath}/list`);
              }
            });
          },
        });
      }
    });
  }

  @Bind()
  deleteSupplierCategoryAlter() {
    const { dispatch, history, match } = this.props;
    const { categoryAlterId } = this.state;
    const basePath =
      match.path.indexOf('/detail') === -1
        ? match.path.substring(0, match.path.indexOf('/create'))
        : match.path.substring(0, match.path.indexOf('/detail'));
    dispatch({
      type: 'supplierCategoryAlter/deleteSupplierCategoryAlter',
      payload: { categoryAlterId },
    }).then(res => {
      if (res) {
        notification.success();
        history.push(`${basePath}/list`);
      }
    });
  }

  /**
   * 供应商选择回调 Lov
   * @param {Object} record
   */
  @Bind()
  companyLovOnChange(value, record) {
    // lov的onChange会在失焦时触发(导致value是个event,record是undefined)，这里增加判断过滤这种情况
    if (!isNil(value) && typeof value !== 'string') {
      return;
    }
    const { form, dispatch } = this.props;
    const { isNew } = this.state;
    const {
      supplierCompanyCode,
      supplierCompanyName,
      supplierCompanyId,
      supplierTenantId,
    } = record;
    form.setFieldsValue({
      supplierCompanyId: value,
      supplierCompanyNum: supplierCompanyCode,
      operationType: undefined,
      currentCategoryId: undefined,
      currentEvaluationLevel: undefined,
      currentEvaluationScore: undefined,
      targetCategoryId: undefined,
      targetEvaluationLevel: undefined,
      targetEvaluationScore: undefined,
      supplierCompanyName,
    });
    this.setState(
      {
        supplierCompanyId,
        supplierTenantId,
      },
      () => {
        dispatch({
          type: 'supplierCategoryAlter/queryCurrentSupplierCtg',
          payload: {
            isNew,
            supplierCompanyId,
            supplierTenantId,
            isAssignFlag: 1,
            customizeUnitCode: [
              'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.CATEGORY_TABLE',
              'SSLM.SUPPLIER_LIFE_CYCLE.SUP_CAT_LIST',
            ].join(','),
          },
        });
      }
    );
  }

  /**
   * 查询当前供应商分类
   * @param {Object} page - 分页查询参数
   */
  @Bind()
  queryCurrentSupplierCtg(page = {}) {
    const { dispatch } = this.props;
    const { supplierCompanyId, supplierTenantId, isNew } = this.state;
    dispatch({
      type: 'supplierCategoryAlter/queryCurrentSupplierCtg',
      payload: {
        page,
        supplierCompanyId,
        supplierTenantId,
        isAssignFlag: 1,
        customizeUnitCode: customizeUnitCode[1],
        isNew,
      },
    });
  }

  /**
   * 查询操作记录列表
   * @param {Object} pagination - 分页参数
   */
  @Bind()
  queryProcessRecord(pagination) {
    const { dispatch } = this.props;
    const { categoryAlterId } = this.state;
    dispatch({
      type: 'supplierCategoryAlter/queryProcessRecord',
      payload: {
        page: pagination ? pagination.current : 0,
        size: pagination ? pagination.pageSize : 10,
        categoryAlterId,
      },
    });
  }

  /**
   * 供应商 Lov 清除回调
   */
  @Bind()
  companyLovOnClear() {
    const { form, dispatch } = this.props;
    form.setFieldsValue({
      supplierCompanyNum: null,
    });
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        currentSupplierCtg: {},
      },
    });
  }

  /**
   * 变更分类 Lov 清除回调
   */
  @Bind()
  currentCategoryNameOnClear() {
    const { dispatch, form } = this.props;
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        categoryInfo: {},
      },
    });
    form.setFieldsValue({
      currentEvaluationLevel: undefined,
      currentEvaluationScore: undefined,
    });
  }

  /**
   * 清除
   */
  @Bind()
  handleClean(record) {
    const {
      dispatch,
      supplierCategoryAlter: { currentSupplierCtg = {}, currentSupplierCtgPage = {} },
    } = this.props;
    const newCurrentSupplierCtg = currentSupplierCtg.content.filter(
      n => n.categoryAlterLineId !== record.categoryAlterLineId
    );
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        currentSupplierCtg: { content: newCurrentSupplierCtg },
        currentSupplierCtgPage: delItemToPagination(
          (currentSupplierCtg.content || []).length,
          currentSupplierCtgPage
        ),
      },
    });
  }

  /**
   * 编辑/取消
   */
  @Bind()
  handleEdit(flag, record) {
    const {
      dispatch,
      supplierCategoryAlter: { currentSupplierCtg = {} },
    } = this.props;
    const newPlatformContactList = currentSupplierCtg.content.map(item => {
      if (item.categoryAlterLineId === record.categoryAlterLineId) {
        return { ...item, _status: flag ? 'update' : '' };
      } else {
        return item;
      }
    });
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        currentSupplierCtg: { content: newPlatformContactList },
      },
    });
  }

  /**
   * 处理多选新建
   */
  @Bind()
  handleMultipleAdd(newSelectedRows) {
    const {
      dispatch,
      supplierCategoryAlter: { currentSupplierCtg = {}, currentSupplierCtgPage = {} },
    } = this.props;
    const data = (newSelectedRows || []).map(n => {
      const { categoryId, ...rest } = n;
      return {
        _status: 'create',
        operationType: 'ADD',
        enabledFlag: 1,
        categoryAlterLineId: uuid(),
        supplierCategoryId: categoryId,
        ...rest,
      };
    });

    const oldLineList = currentSupplierCtg.content ? currentSupplierCtg.content : [];
    const dataSource = [...data, ...oldLineList];
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        currentSupplierCtg: { content: dataSource },
        currentSupplierCtgPage: addItemsToPagination(
          data.length,
          oldLineList.length,
          currentSupplierCtgPage
        ),
      },
    });
  }

  // 操作记录表格
  processRecordTable() {
    const {
      categoryLoading,
      supplierCategoryAlter: { processRecordList = {} },
    } = this.props; // 当前供应商分类加载状态
    const columns = [
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prRecordTable.loginName').d('操作人'),
        align: 'left',
        width: 150,
        dataIndex: 'loginName',
        render: (value, record) => record.realName || value,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prRecordTable.processDate').d('操作日期'),
        width: 150,
        dataIndex: 'processDate',
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.processTable.proStatusMeans').d('动作'),
        width: 80,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prRecordTable.processRemark').d('说明'),
        dataIndex: 'processRemark',
      },
    ];
    return (
      <Table
        bordered
        rowKey="recordId"
        columns={columns}
        loading={categoryLoading}
        dataSource={processRecordList.content}
        pagination={createPagination(processRecordList)}
        onChange={this.queryProcessRecord}
      />
    );
  }

  // 当前供应商分类表格
  categoryTable() {
    const {
      categoryLoading,
      supplierCategoryAlter: {
        currentSupplierCtg = {},
        currentSupplierCtgPage = {},
        categoryAlterOpsTypeList = [],
        evaluationLevel = [],
        supplierCategoryAlterDetail = {},
      },
      match,
      customizeTable,
    } = this.props; // 当前供应商分类加载状态
    const editable = match.path.indexOf('supplier-category-alter-list') === -1;
    const { supplierTenantId, supplierCompanyId, categoryAlterId, isDisabled } = this.state;
    const {
      supplierCategoryAlter: {
        processStatus, // 状态
      } = {},
    } = supplierCategoryAlterDetail;
    const isProcess = processStatus !== 'APPROVED' && processStatus !== 'SUBMIT';

    const columns = [
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.categoryTable.categoryCode')
          .d('供应商分类代码'),
        width: 180,
        dataIndex: 'categoryCode',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryCode', {
                initialValue: record.categoryCode,
              })}
              {record.$form.getFieldDecorator('evaluationLevelFlag', {
                initialValue: record.evaluationLevelFlag,
              })}
              {record.$form.getFieldDecorator('evaluationScoreFlag', {
                initialValue: record.evaluationScoreFlag,
              })}
              {record.$form.getFieldDecorator('supplierCategoryId', {
                initialValue: record.supplierCategoryId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get(`sslm.supplierCategoryAlter.model.categoryTable.categoryCode`)
                        .d('供应商分类代码'),
                    }),
                  },
                ],
              })(
                <CusLov
                  code="SSLM.SUPPLIER_CATEGORY_TREE"
                  lovOptions={{ displayField: 'categoryCode' }}
                  textValue={record.categoryCode}
                  style={{ width: '100%' }}
                  queryParams={{
                    supplierTenantId,
                    supplierCompanyId,
                    enabledFlag: 1,
                  }}
                  parentNodeDisable
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue(lovRecord);
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.categoryTabl.categoryDescri')
          .d('供应商分类描述'),
        width: 200,
        dataIndex: 'categoryDescription',
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`categoryDescription`, {
                initialValue: val,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.evaluateLevel').d('评级'),
        width: 100,
        dataIndex: 'evaluationLevel',
        render: (val, record) =>
          !(isProcess && editable) ? (
            record.evaluationLevelMeaning
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('evaluationLevel', {
                initialValue: record.evaluationLevel,
                rules: [
                  {
                    // 若使用record.evaluationLevelFlag || record.$form.getFieldValue('evaluationLevelFlag')形式，保存时获取不到evaluationLevelFlag的值
                    required:
                      editable &&
                      (record._status === 'update'
                        ? record.evaluationLevelFlag
                        : record.$form.getFieldValue('evaluationLevelFlag')),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierCategoryAlter.model.categoryTable.evaluateLevel')
                        .d('评级'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: '100%' }} disabled={!(isProcess && editable)}>
                  {evaluationLevel.map(m => {
                    return (
                      <Option key={m.value} value={m.value}>
                        {m.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          ) : (
            record.evaluationLevelMeaning
          ),
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.evaluateScore').d('评分'),
        width: 110,
        dataIndex: 'evaluationScore',
        render: (val, record) =>
          !(isProcess && editable) ? (
            val
          ) : ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('evaluationScore', {
                initialValue: record.evaluationScore,
                rules: [
                  {
                    // 若使用record.evaluationScoreFlag || record.$form.getFieldValue('evaluationScoreFlag')形式，保存时获取不到evaluationScoreFlag的值
                    required:
                      editable &&
                      (record._status === 'update'
                        ? record.evaluationScoreFlag
                        : record.$form.getFieldValue('evaluationScoreFlag')),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierCategoryAlter.model.categoryTable.evaluateScore')
                        .d('评分'),
                    }),
                  },
                ],
              })(<InputNumber style={{ width: '100%' }} disabled={!(isProcess && editable)} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.operateType').d('操作类型'),
        dataIndex: 'operationType',
        width: 120,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('operationType', {
                initialValue: record.operationType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('sslm.supplierCategoryAlter.model.categoryTable.operateType')
                        .d('操作类型'),
                    }),
                  },
                ],
              })(
                <Select
                  allowClear
                  style={{ width: '100%' }}
                  onChange={value => {
                    record.$form.setFieldsValue({ enabledFlag: value === 'DISABLE' ? 0 : 1 });
                  }}
                  // disabled={!(editable && isProcess)}
                >
                  {categoryAlterOpsTypeList.map(m => {
                    return (
                      <Option key={m.value} value={m.value}>
                        {m.meaning}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          ) : (
            record.operationTypeMeaning
          ),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`enabledFlag`, {
                initialValue: record.enabledFlag,
              })(
                <Badge
                  status={record.$form.getFieldValue('enabledFlag') === 1 ? 'success' : 'error'}
                  text={
                    record.$form.getFieldValue('enabledFlag') === 1
                      ? intl.get('hzero.common.status.enable').d('启用')
                      : intl.get('hzero.common.status.disable').d('禁用')
                  }
                />
              )}
            </FormItem>
          ) : (
            enableRender(record.enabledFlag)
          ),
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.alterReason').d('变更理由'),
        dataIndex: 'alterReason',
        width: 180,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator(`alterReason`, {
                initialValue: record.alterReason,
              })(<Input />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];
    if (!isDisabled) {
      columns.push({
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        width: 90,
        render: (_, record) => (
          <FormItem>
            {record._status === 'create' && (
              <a onClick={() => this.handleClean(record)}>
                {intl.get('hzero.common.button.clean').d('清除')}
              </a>
            )}
            {record._status === 'update' && (
              <a onClick={() => this.handleEdit(false, record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            )}
            {record._status !== 'create' && record._status !== 'update' && (
              <a onClick={() => this.handleEdit(true, record)}>
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            )}
          </FormItem>
        ),
      });
    }
    return (
      <React.Fragment>
        <div className="table-list-search" style={{ textAlign: 'right' }}>
          <LovMultiple
            code="SSLM.SUPPLIER_CATEGORY_TREE"
            queryParams={{
              supplierTenantId,
              supplierCompanyId,
              enabledFlag: 1,
            }}
            isButton
            type="primary"
            style={{ display: isDisabled ? 'none' : 'inline' }}
            buttonText={intl.get(`hzero.common.button.create`).d('新建')}
            changeSelectRows={this.handleMultipleAdd}
            parentNodeDisable
          />
        </div>
        {customizeTable(
          {
            code: customizeUnitCode[1],
            clearCache: (a, b, cb) => {
              if (a !== b) cb(a);
            },
            useNewValid: true,
          },
          <EditTable
            bordered
            rowKey="categoryAlterLineId"
            columns={columns}
            loading={categoryLoading}
            dataSource={currentSupplierCtg.content || []}
            pagination={currentSupplierCtgPage}
            onChange={page =>
              categoryAlterId
                ? this.queryDetail(categoryAlterId, page)
                : this.queryCurrentSupplierCtg(page)
            }
          />
        )}
      </React.Fragment>
    );
  }

  @Bind()
  attachmentTableRowOnChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedAttachmentLines: selectedRows,
    });
  }

  // 附件列表
  attachmentTable() {
    const {
      match,
      supplierCategoryAlter: { categoryAlterAttachmentLine = [], supplierCategoryAlterDetail = {} },
      customizeTable,
    } = this.props;
    const editable = match.path.indexOf('supplier-category-alter-list') === -1;
    const { selectedAttachmentLines } = this.state;
    const rowSelection = {
      selectedRowKeys: selectedAttachmentLines.map(n => n.attachmentLineId),
      selectedRows: selectedAttachmentLines,
      onChange: this.attachmentTableRowOnChange,
    };
    const { supplierCategoryAlter: { processStatus } = {} } = supplierCategoryAlterDetail;
    const isProcess = processStatus !== 'APPROVED' && processStatus !== 'SUBMIT';
    const columns = [
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.attachTable.attachmentDesc')
          .d('附件名称'),
        dataIndex: 'attachmentDesc',
        render: (val, record) => {
          return isReview(record.attachmentDesc) && record.attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(record.attachmentDesc, record.attachmentUrl)}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.attachTable.attachmentSize')
          .d('附件大小（MB）'),
        width: 150,
        dataIndex: 'attachmentSize',
        render: text => {
          if (text) {
            const size = `${text / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.attachTable.uploadUserId').d('上传人'),
        width: 150,
        dataIndex: 'uploadUserId',
        render: (_, record) => record.realName || record.loginName,
      },
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.attachmentTable.uploadDate')
          .d('上传时间'),
        width: 100,
        dataIndex: 'uploadDate',
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        align: 'left',
        width: 80,
        dataIndex: 'option',
        render: (val, record) => {
          const { tenantId, attachmentUrl } = record;
          return (
            <span className="action-link">
              {record.attachmentUrl && (
                <a
                  href={downLoadFile({ tenantId, attachmentUrl })}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {intl.get('hzero.common.button.download').d('下载')}
                </a>
              )}
            </span>
          );
        },
      },
    ];
    return (
      <React.Fragment>
        {editable && isProcess && (
          <div className="table-list-search" style={{ textAlign: 'right' }}>
            <Button
              onClick={this.deleteAttachment}
              disabled={this.state.selectedAttachmentLines.length === 0}
              style={{ marginRight: 8 }}
            >
              {intl.get('sslm.supplierCategoryAlter.view.button.deleteAttachment').d('删除附件')}
            </Button>
            <Button type="primary" onClick={this.showUploadModal}>
              {intl.get('sslm.supplierCategoryAlter.view.button.addAttachment').d('新建附件')}
            </Button>
          </div>
        )}
        {customizeTable(
          {
            code: customizeUnitCode[2],
          },
          <Table
            bordered
            rowKey="attachmentLineId"
            columns={columns}
            rowSelection={!(editable && isProcess) ? null : rowSelection}
            dataSource={categoryAlterAttachmentLine}
          />
        )}
      </React.Fragment>
    );
  }

  // 附件上传逻辑
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
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: { processRecordList: {} },
    });
    this.setState({
      uploadVisible: false,
      processRecordVisible: false,
      fileList: [],
    });
  }

  @Bind()
  uploadOnOk() {
    const {
      dispatch,
      user: {
        currentUser: { id, loginName, realName },
      },
      supplierCategoryAlter: { categoryAlterAttachmentLine = [] },
      tenantId,
    } = this.props;
    const { categoryAlterId } = this.state;
    const { fileList = [] } = this.state;
    const fileData = !isEmpty(fileList)
      ? fileList.map(file => {
          return {
            attachmentLineId: uuid(),
            attachmentDesc: file.name,
            attachmentSize: file.size,
            attachmentUrl: file.response,
            uploadUserId: id,
            loginName,
            realName,
            remark: '',
            tenantId,
            categoryAlterId,
            isCreate: true,
          };
        })
      : [];
    dispatch({
      type: 'supplierCategoryAlter/updateState',
      payload: {
        categoryAlterAttachmentLine: [...categoryAlterAttachmentLine, ...fileData],
      },
    });
    this.setState({ uploadVisible: false, fileList: [] });
  }

  /**
   * 将上传列表放到state
   * @param {*} file
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
   * @param {*} file
   */
  @Bind()
  beforeUpload(file) {
    const { fileSize = 500 * 1024 * 1024 } = this.props;
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
  async beforeUploadFiles(files) {
    const { fileSize: defaultFileSize = defaultMaxFileSize } = this.props;
    const remoteFileSize = await fetchRemoteFileSizeLimit(PRIVATE_BUCKET, bucketDirectory);
    const fileSize = remoteFileSize || defaultFileSize;
    const fileSizeValidate = every(
      map(files, file => {
        if (fileSize && file.size > fileSize) {
          file.status = 'error'; // eslint-disable-line
          notification.error({
            message: intl.get('hzero.common.upload.status.error').d('上传失败'),
            description: intl
              .get('hzero.common.upload.error.size', {
                fileSize: fileSize / (1024 * 1024),
              })
              .d(`上传文件大小不能超过: ${fileSize / (1024 * 1024)} MB`),
          });
          return false;
        }
        return true;
      })
    );
    return fileSizeValidate;
  }

  @Bind()
  uploadData(file) {
    return {
      directory: bucketDirectory,
      bucketName: PRIVATE_BUCKET,
      fileName: file.name,
    };
  }

  /**
   * 上传change触发事件
   * @param {*} info
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
   * @param {*} file
   */
  @Bind()
  onDraggerUploadRemove(file) {
    const { fileList } = this.state;
    const { dispatch, tenantId: organizationId } = this.props;
    if (isString(file.response)) {
      dispatch({
        type: 'supplierCategoryAlter/onDraggerUploadRemove',
        payload: {
          organizationId,
          bucketName: PRIVATE_BUCKET,
          directory: bucketDirectory,
          urls: [file.response],
        },
      }).then(res => {
        if (res) {
          this.setState({
            fileList: fileList.filter(o => o.uid !== file.uid),
          });
          notification.success();
        }
      });
    }
  }

  /**
   * 删除状态树中的数据
   * @param {*} localRows 删除的数据
   */
  @Bind()
  deleteAttachment() {
    const {
      dispatch,
      tenantId: organizationId,
      supplierCategoryAlter: { categoryAlterAttachmentLine = [] },
    } = this.props;
    const { categoryAlterId } = this.state;
    const { selectedAttachmentLines } = this.state;
    const remoteDeleteList = selectedAttachmentLines.filter(n => !n.isCreate);
    const localDeleteList = selectedAttachmentLines.filter(n => n.isCreate === true);
    let newList = [];
    if (!isEmpty(selectedAttachmentLines)) {
      newList = categoryAlterAttachmentLine.filter(item => {
        return localDeleteList.findIndex(e => e.attachmentLineId === item.attachmentLineId) === -1;
      });

      if (!isEmpty(remoteDeleteList)) {
        dispatch({
          type: 'supplierCategoryAlter/deleteAttachment',
          payload: {
            attachmentLineIds: remoteDeleteList.map(n => n.attachmentLineId),
            organizationId,
            categoryAlterId,
          },
        }).then(res => {
          if (res) {
            newList = newList.filter(item => {
              return (
                remoteDeleteList.findIndex(e => e.attachmentLineId === item.attachmentLineId) === -1
              );
            });
            dispatch({
              type: 'supplierCategoryAlter/updateState',
              payload: {
                categoryAlterAttachmentLine: newList,
              },
            });
            notification.success();
            this.setState({
              selectedAttachmentLines: [],
            });
          }
        });
      } else {
        dispatch({
          type: 'supplierCategoryAlter/updateState',
          payload: {
            categoryAlterAttachmentLine: newList,
          },
        });
        this.setState({
          selectedAttachmentLines: [],
        });
      }
    }
  }

  render() {
    const {
      form,
      form: { getFieldDecorator },
      user: { currentUser = {} },
      tenantId,
      supplierCategoryAlter: {
        // categoryAlterStatusList = [],
        // categoryAlterOpsTypeList = [],
        // evaluationLevel = [],
        supplierCategoryAlterDetail = {},
        categoryAlterAttachmentLine = [],
      },
      formLoading, // 请求详情信息加载状态
      operationLoading, // 保存时的请求状态
      match,
      customizeForm,
      custLoading,
      customizeBtnGroup,
      tabsPrimaryColor,
    } = this.props;
    const editable = match.path.indexOf('supplier-category-alter-list') === -1;
    const {
      categoryAlterId,
      uploadVisible, // 上传组件模态框显示状态
      processRecordVisible, // 操作记录模态框显示状态
      isDisabled,
    } = this.state;
    const {
      supplierCategoryAlter,
      supplierCategoryAlter: {
        categoryAlterNumber, // 申请单号
        // categoryAlterName, // 变更分类名
        processStatus, // 状态
        processStatusMeaning, // 状态
        loginName, // 创建人登录名
        realName, // 创建人名
        supplierZhOrEnCompanyNum, // 供应商名称
        supplierCompanyNum, // 供应商编码
        creationDate, // 创建日期
        alterReason, // 变更理由
        remark, // 备注
      } = {},
    } = supplierCategoryAlterDetail;
    const isEdit = !editable || !!categoryAlterId;
    const isProcess = processStatus !== 'APPROVED' && processStatus !== 'SUBMIT';

    // 附件
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
      action: `${HZERO_FILE}/v1/${tenantId}/files/multipart`,
      beforeUpload: this.beforeUpload,
      onChange: this.onDraggerUploadChange,
      onRemove: this.onDraggerUploadRemove,
      beforeUploadFiles: this.beforeUploadFiles,
    };
    const basePath =
      match.path.indexOf('/detail') === -1
        ? match.path.substring(0, match.path.indexOf('/create'))
        : match.path.substring(0, match.path.indexOf('/detail'));
    getFieldDecorator('supplierCompanyName', { initialValue: supplierZhOrEnCompanyNum });
    return (
      <React.Fragment>
        <Header
          title={
            categoryAlterId
              ? intl
                  .get('sslm.supplierCategoryAlter.view.title.supplierappli.edit')
                  .d('供应商分类变更申请维护')
              : intl
                  .get('sslm.supplierCategoryAlter.view.title.supplierappli.create')
                  .d('供应商分类变更申请创建')
          }
          backPath={isDisabled ? '' : `${basePath}/list`}
        >
          {customizeBtnGroup({ code: 'SSLM.SUPPLIER_CATEGORY_ALTER_DETAIL.HEADER_BTNGROUP' }, [
            <Button
              data-name="save"
              type="primary"
              icon="save"
              loading={operationLoading}
              onClick={this.saveSupplierCategoryAlter}
              style={{ display: isDisabled ? 'none' : 'block' }}
            >
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>,
            <Button
              data-name="submit"
              icon="check"
              loading={operationLoading}
              disabled={!categoryAlterId}
              style={{ display: isDisabled ? 'none' : 'block' }}
              onClick={() => {
                this.submitSupplierCategoryAlter();
              }}
            >
              {intl.get('hzero.common.button.submit').d('提交')}
            </Button>,
            <Button
              data-name="delete"
              icon="delete"
              loading={operationLoading}
              style={{ display: isDisabled ? 'none' : 'block' }}
              onClick={() => {
                Modal.confirm({
                  title: intl.get('hzero.common.message.confirm.delete').d('是否确认删除?'),
                  onOk: () => {
                    this.deleteSupplierCategoryAlter();
                  },
                });
              }}
              disabled={!categoryAlterId || process === 'NEW'}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>,
          ])}
        </Header>
        <Content>
          <Spin spinning={formLoading || false}>
            <div className={styles.header}>
              <div className={styles['second-title']}>
                <span className={styles['vertical-line']} />
                {intl.get('sslm.supplierCategoryAlter.view.title.dividerBasic').d('基本信息')}
              </div>
              <Divider style={{ marginTop: 16, marginBottom: 16 }} />
            </div>
            {customizeForm(
              {
                code: customizeUnitCode[0],
                form,
                dataSource: supplierCategoryAlter,
              },
              <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
                <Row gutter={48} className="read-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierCategoryAlter.model.supply.categoryAlterNumber')
                        .d('申请单号')}
                    >
                      {getFieldDecorator('categoryAlterNumber', {
                        initialValue: categoryAlterNumber,
                      })(<span>{categoryAlterNumber}</span>)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem {...formItemLayout} label={intl.get('hzero.common.status').d('状态')}>
                      {getFieldDecorator('processStatusMeaning', {
                        initialValue: processStatusMeaning,
                      })(
                        <span>
                          {processStatusMeaning || intl.get('hzero.common.button.create').d('新建')}
                        </span>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('sslm.common.view.creator.name').d('创建人')}
                    >
                      {getFieldDecorator('loginName', {
                        initialValue: realName || loginName,
                      })(<span>{realName || loginName}</span>)}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={48} className="read-row">
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierCategoryAlter.model.supply.supplyCompanyName')
                        .d('供应商名称')}
                    >
                      {getFieldDecorator('supplierNameLov', {
                        initialValue: supplierZhOrEnCompanyNum,
                        rules: [
                          {
                            required: true && !isEdit,
                            message: intl.get('hzero.common.validation.notNull', {
                              name: intl
                                .get('sslm.supplierCategoryAlter.model.supply.supplyCompanyName')
                                .d('供应商名称'),
                            }),
                          },
                        ],
                      })(
                        isEdit ? (
                          <span>{supplierZhOrEnCompanyNum}</span>
                        ) : (
                          <Lov
                            code="SSLM.USER_AUTH.SUPPLIER"
                            textValue={supplierZhOrEnCompanyNum}
                            queryParams={{
                              userId: currentUser.id,
                              tenantId,
                            }}
                            onChange={this.companyLovOnChange}
                            onClear={this.companyLovOnClear}
                            disabled={isEdit}
                            lovOptions={{
                              valueField: 'uniqueKey',
                            }}
                          />
                        )
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierCategoryAlter.model.supply.supplierCompanyCode')
                        .d('供应商编码')}
                    >
                      {getFieldDecorator('supplierCompanyNum', {
                        initialValue: supplierCompanyNum,
                      })(
                        isEdit ? (
                          <span>{supplierCompanyNum}</span>
                        ) : (
                          <Input style={{ width: '100%' }} readOnly />
                        )
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      {...formItemLayout}
                      label={intl.get('hzero.common.date.creation').d('创建日期')}
                    >
                      {getFieldDecorator('creationDate', {
                        initialValue: moment(creationDate),
                      })(
                        isEdit ? (
                          <span>{dateRender(creationDate)}</span>
                        ) : (
                          <DatePicker
                            style={{ width: '100%' }}
                            placeholder={null}
                            format={DEFAULT_DATE_FORMAT}
                            disabled
                          />
                        )
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={48} className="read-row">
                  <Col span={12}>
                    <FormItem
                      {...formItemLayout}
                      label={intl
                        .get('sslm.supplierCategoryAlter.model.supCateAlter.alterReason')
                        .d('变更理由')}
                    >
                      {getFieldDecorator('alterReason', {
                        initialValue: alterReason,
                      })(
                        <TextArea
                          rows={2}
                          disabled={!(editable && isProcess) || isDisabled}
                          style={{ resize: 'none' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
                <Row gutter={48} className="read-row">
                  <Col span={12}>
                    <FormItem {...formItemLayout} label={intl.get('hzero.common.remark').d('备注')}>
                      {getFieldDecorator('remark', {
                        initialValue: remark,
                      })(
                        <TextArea
                          rows={2}
                          disabled={!(editable && isProcess) || isDisabled}
                          style={{ resize: 'none' }}
                        />
                      )}
                    </FormItem>
                  </Col>
                </Row>
              </Form>
            )}
          </Spin>
          <Tabs defaultActiveKey="1" animated={false}>
            <TabPane
              tab={intl
                .get('sslm.supplierCategoryAlter.view.title.tabCurrentCtg')
                .d('当前供应商分类')}
              key="1"
            >
              {this.categoryTable()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  {intl.get('sslm.supplierCategoryAlter.view.title.tabAttachment').d('附件信息')}
                  <Tag
                    color={tabsPrimaryColor || '#108ee9'}
                    style={{
                      height: 'auto',
                      lineHeight: '15px',
                      marginLeft: '4px',
                    }}
                  >
                    {categoryAlterAttachmentLine && Array.isArray(categoryAlterAttachmentLine)
                      ? categoryAlterAttachmentLine.length
                      : 0}
                  </Tag>
                </span>
              }
              key="2"
            >
              {this.attachmentTable()}
            </TabPane>
          </Tabs>
        </Content>
        <Modal
          title={intl.get('hzero.common.upload.text').d('上传附件')}
          visible={uploadVisible}
          onOk={this.uploadOnOk}
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
                .get('sslm.common.upload.content')
                .d('单击或拖动附件(500MB以下)到此区域进行上传')}
            </p>
            <p className="ant-upload-hint">
              {intl.get('hzero.common.upload.hint').d('支持单个或批量上传')}
            </p>
          </Dragger>
        </Modal>
        <Modal
          destroyOnClose
          title={intl.get('sslm.supplierCategoryAlter.view.button.actionHistory').d('操作记录')}
          visible={processRecordVisible}
          onCancel={this.handleCancel}
          footer={null}
          width={800}
        >
          {this.processRecordTable()}
        </Modal>
      </React.Fragment>
    );
  }
}
