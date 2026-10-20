/**
 * dataManagementService.js - 资料管理
 * @date: 2019-4-3
 * @author: gzq <zhiqiang.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import { isNumber, sum, isArray } from 'lodash';
import { Table, Button } from 'hzero-ui';
import { connect } from 'dva';
import uuidv4 from 'uuid/v4';
import moment from 'moment';
import intl from 'utils/intl';
import { filterNullValueObject } from 'utils/utils';
import { DEFAULT_DATE_FORMAT, DEBOUNCE_TIME, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import { PUBLIC_BUCKET } from '_utils/config';
import notification from 'utils/notification';
import { yesOrNoRender, dateRender, dateTimeRender } from 'utils/renderer';
import OperatorRecordModal from './OperatorModel';
import FilterForm from './FilterForm';
import Drawer from './Drawer';

const promptCode = 'spfm.dataManagement';

@connect(({ loading = {}, dataManagement = {} }) => ({
  fetchListLoading: loading.effects['dataManagement/fetchList'],
  fetchOperationRecordListLoading: loading.effects['dataManagement/fetchOperationRecordList'],
  savaLoading: loading.effects['dataManagement/saveList'],
  enumMap: dataManagement.enumMap || {},
  dataManagement,
}))
@formatterCollections({
  code: [
    'spfm.dataManagement',
    'hzero.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'entity.roles',
    'hzero.common',
    'sqam.incomingInspectionQuery',
    'himp.commentImport',
  ],
})
export default class extends React.Component {
  form;

  state = {
    operationRecordModalVisible: false,
    operationRecordList: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    this.fetchList();
    dispatch({ type: 'dataManagement/fetchEnum' });
    dispatch({ type: 'dataManagement/getGroup' }).then((res) => {
      this.setState({ groupMsg: res });
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'dataManagement/updateState',
      payload: { list: [], pagination: {} },
    });
  }

  // FilterForm绑定到这里
  @Bind()
  bindForm(form) {
    this.form = form;
  }

  /**
   * fetchlist
   */
  @Bind()
  fetchList(page = {}) {
    const { dispatch, pagination } = this.props;
    const formValues = this.form ? this.form.getFieldsValue() : {};
    const creationDateFrom = formValues.creationDateFrom
      ? formValues.creationDateFrom.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const creationDateTo = formValues.creationDateTo
      ? formValues.creationDateTo.format(DEFAULT_DATETIME_FORMAT)
      : null;
    const expireDateFrom = formValues.expireDateFrom
      ? formValues.expireDateFrom.format(DEFAULT_DATE_FORMAT)
      : null;
    const expireDateTo = formValues.expireDateTo
      ? formValues.expireDateTo.format(DEFAULT_DATE_FORMAT)
      : null;
    const searchCondition = filterNullValueObject({
      ...formValues,
      creationDateFrom,
      creationDateTo,
      expireDateFrom,
      expireDateTo,
    });
    dispatch({
      type: 'dataManagement/fetchList',
      payload: { page: { ...pagination, ...page }, ...searchCondition },
    });
  }

  /**
   * 搜索
   */
  @Bind()
  handleSearch() {
    this.fetchList({ current: 1, pageSize: 10 });
  }

  @Bind()
  async handleModalVisible(k, v, attachmentId) {
    if (v) {
      await this.setState({ attachmentId });
      if (k === 'operationRecordModalVisible') {
        this.handleOperationRecordSearch();
      }
    } else {
      this.setState({ attachmentId: -1 });
    }
    this.setState({ [k]: v });
  }

  /**
   * 查询操作记录列表
   * @param {Object} fields 查询字段
   */
  @Bind()
  handleOperationRecordSearch(page = {}) {
    const { dispatch } = this.props;
    const { attachmentId } = this.state;
    dispatch({
      type: 'dataManagement/fetchOperationRecordList',
      payload: {
        attachmentId,
        page,
      },
    }).then((result) => {
      if (result) {
        this.setState({
          operationRecordList: result,
        });
      }
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  handleDrawerCancel() {
    this.setState({ drawerVisible: false, targetItem: {} });
  }

  /**
   * 发送保存
   *
   * @param {object} values
   */
  @Bind()
  @Debounce(DEBOUNCE_TIME)
  handleDrawerOk(values) {
    const { attPurchaseIds, attSupplierCategoryIds, stageIds, expireDate } = values;
    const { dispatch } = this.props;
    dispatch({
      type: 'dataManagement/saveList',
      payload: {
        ...values,
        attSupplierCategoryIds: isArray(attSupplierCategoryIds)
          ? attSupplierCategoryIds
          : attSupplierCategoryIds && attSupplierCategoryIds.split(','),
        attPurchaseIds: isArray(attPurchaseIds)
          ? attPurchaseIds
          : attPurchaseIds && attPurchaseIds.split(','),
        stageIds: isArray(stageIds) ? stageIds : stageIds && stageIds.split(','),
        expireDate: expireDate ? expireDate.format(DEFAULT_DATE_FORMAT) : null,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({ drawerVisible: false, targetItem: {} });
        this.handleSearch();
      }
    });
  }

  /**
   * 新增，跳转到明细页面
   */
  @Bind()
  handleAddData() {
    this.setState({
      drawerVisible: true,
      targetItem: { attachmentUuid: uuidv4(), foreverFlag: 0 },
    });
  }

  /**
   * 数据列表，行编辑
   *@param {obejct} record - 操作对象
   */
  @Bind()
  handleEditContent(record) {
    const {
      attSupplierCategoryIds,
      attSupplierCategoryNames,
      attPurchaseIds,
      attPurchaseNames,
      stageIds,
      stageDescriptions,
    } = record;
    let attSupplierCategoryArr = [];
    let attPurchaseArr = [];
    let stageArr = [];
    if (isArray(attSupplierCategoryIds)) {
      attSupplierCategoryArr = attSupplierCategoryIds.map((e, index) => {
        return {
          categoryId: e,
          categoryDescription:
            attSupplierCategoryNames && attSupplierCategoryNames.split(';')[index],
        };
      });
    }
    if (isArray(attPurchaseIds)) {
      attPurchaseArr = attPurchaseIds.map((e, index) => {
        return {
          unitId: e,
          unitName: attPurchaseNames && attPurchaseNames.split(';')[index],
        };
      });
    }
    if (isArray(stageIds)) {
      stageArr = stageIds.map((e, index) => {
        return {
          stageId: e,
          stageDescription: stageDescriptions && stageDescriptions.split(';')[index],
        };
      });
    }
    this.setState({
      drawerVisible: true,
      targetItem: {
        _status: 'update',
        attSupplierCategoryArr,
        attPurchaseArr,
        stageArr,
        ...record,
      },
    });
  }

  /**
   * 数据列表，行新建
   *@param {obejct} record - 操作对象
   */
  @Bind()
  handleCreateContent(record) {
    const { attachmentId, dataClassCode, dataClassName, expireDate, foreverFlag } = record;
    this.setState({
      drawerVisible: true,
      targetItem: {
        foreverFlag,
        parentForeverFlag: foreverFlag,
        attachmentUuid: uuidv4(),
        parentExpireDate: expireDate,
        parentAttachmentId: attachmentId,
        parentDataClassCode: dataClassCode,
        parentDataClassName: dataClassName,
      },
    });
  }

  render() {
    const {
      dispatch,
      dataManagement = {},
      fetchListLoading = false,
      enumMap = {},
      fetchOperationRecordListLoading = false,
      savaLoading = false,
    } = this.props;
    const { targetEnum = [], categoryStatus = [] } = enumMap;
    const {
      operationRecordModalVisible = false,
      operationRecordList = [],
      drawerVisible = false,
      targetItem = {},
      groupMsg = {},
    } = this.state;
    const { list = [], pagination = {} } = dataManagement;

    const columns = [
      {
        title: intl.get(`${promptCode}.view.message.model.dataClassCode`).d('资料分类编码'),
        dataIndex: 'dataClassCode',
        key: 'dataClassCode',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.dataClassName`).d('分类名称'),
        dataIndex: 'dataClassName',
        key: 'dataClassName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.dataManagementTitle`).d('标题'),
        dataIndex: 'title',
        key: 'title',
        width: 150,
      },
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'dataStatusMeaning',
        key: 'dataStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.attachmentTarget`).d('展出对象'),
        dataIndex: 'attachmentTargetMeaning',
        key: 'attachmentTargetMeaning',
        width: 150,
      },
      {
        title: intl
          .get(`${promptCode}.view.message.model.attSupplierCategoryIds`)
          .d('可见供应商分类'),
        dataIndex: 'attSupplierCategoryNames',
        key: 'attSupplierCategoryNames',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.stageIds`).d('可见供应商生命周期'),
        dataIndex: 'stageDescriptions',
        key: 'stageDescriptions',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.attPurchaseIds`).d('可见组织'),
        dataIndex: 'attPurchaseNames',
        key: 'attPurchaseNames',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.categoryCode`).d('类别'),
        dataIndex: 'categoryCodeMeaning',
        key: 'categoryCodeMeaning',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.foreverFlag`).d('是否长期'),
        dataIndex: 'foreverFlag',
        key: 'foreverFlag',
        render: yesOrNoRender,
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.expireDate`).d('到期日'),
        dataIndex: 'expireDate',
        key: 'expireDate',
        width: 150,
        render: dateRender,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        key: 'companyName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.view.message.model.webUrl`).d('企业域名'),
        dataIndex: 'webUrl',
        key: 'webUrl',
      },
      {
        title: intl.get(`hzero.common.entity.creator`).d('创建人'),
        dataIndex: 'realName',
        key: 'realName',
        width: 150,
      },
      {
        title: intl.get(`himp.commentImport.model.commentImport.creationDate`).d('创建日期'),
        dataIndex: 'creationDate',
        key: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.button.operating`).d('操作记录'),
        dataIndex: 'attachmentId',
        key: 'attachmentId',
        width: 100,
        render: (attachmentId) => (
          <a
            onClick={() =>
              this.handleModalVisible('operationRecordModalVisible', true, attachmentId)
            }
          >
            {intl.get(`hzero.common.button.operating`).d('操作记录')}
          </a>
        ),
      },
      {
        title: intl.get(`${promptCode}.view.message.model.file`).d('文件'),
        dataIndex: 'attachmentUuid',
        key: 'attachmentUuid',
        width: 120,
        render: (attachmentUuid, rowData) =>
          rowData.categoryCode === 'DATA' && (
            <Upload
              attachmentUUID={attachmentUuid}
              viewOnly
              filesNumber={rowData.attachmentCount}
              filePreview
              bucketName={PUBLIC_BUCKET}
              bucketDirectory="spfm-comp"
              btnText={`${intl.get(`hzero.common.upload.modal.title`).d('附件')}`}
            />
          ),
      },
      {
        title: intl.get(`hzero.common.action`).d('操作'),
        dataIndex: 'option',
        fixed: 'right',
        width: 120,
        render: (_, record) => (
          <span className="action-link">
            {record.categoryCode === 'DATA_CATEGORY' && (
              <a onClick={() => this.handleCreateContent(record)} style={{ marginRight: '4px' }}>
                {intl.get('hzero.common.button.create').d('新建')}
              </a>
            )}
            <a onClick={() => this.handleEditContent(record)}>
              {intl.get(`hzero.common.button.edit`).d('编辑')}
            </a>
          </span>
        ),
      },
    ];
    const fiterProps = {
      bindForm: this.bindForm,
      handleSearch: this.handleSearch,
      enumMap,
    };
    const scrollX = sum(columns.map((item) => (isNumber(item.width) ? item.width : 0))) + 150;
    const tableProps = {
      rowKey: 'attachmentId',
      columns,
      dataSource: list,
      bordered: true,
      loading: fetchListLoading,
      scroll: { x: scrollX },
      pagination,
      onChange: this.fetchList,
    };
    const drawerProps = {
      groupMsg,
      dispatch,
      targetEnum,
      targetItem,
      categoryStatus,
      destroyOnClose: true,
      visible: drawerVisible,
      anchor: 'right',
      loading: savaLoading,
      title: intl.get(`${promptCode}.view.message.drawer.title`).d('维护资料'),
      onCancel: this.handleDrawerCancel,
      onOk: this.handleDrawerOk,
    };
    const operationRecordProps = {
      dataSource: operationRecordList,
      visible: operationRecordModalVisible,
      loading: fetchOperationRecordListLoading,
      fetchOperationRecord: this.handleOperationRecordSearch,
      onCancel: () => this.handleModalVisible('operationRecordModalVisible', false),
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`${promptCode}.view.message.title.dataManagement`).d('资料管理')}>
          <Button type="primary" icon="plus" onClick={this.handleAddData}>
            {intl.get(`${promptCode}.view.message.model.addData`).d('新增资料')}
          </Button>
        </Header>
        <Content>
          <div className="table-list-search">
            <FilterForm {...fiterProps} />
          </div>
          <Table {...tableProps} />
          <OperatorRecordModal {...operationRecordProps} />
          {drawerVisible && <Drawer {...drawerProps} />}
        </Content>
      </React.Fragment>
    );
  }
}
