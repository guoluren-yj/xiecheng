/*
 * InvestigationOrg - 调查表模板定义-租户级
 * @date: 2018/08/07 15:12:06
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'dva';
import { isUndefined } from 'lodash';
import { Button, Modal } from 'hzero-ui';
import { Modal as C7nModal } from 'choerodon-ui/pro';
import PropTypes from 'prop-types';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { Content, Header } from 'components/Page';
import notification from 'utils/notification';
import {
  getCurrentOrganizationId,
  filterNullValueObject,
  getEditTableData,
  getResponse,
} from 'utils/utils';
import { DATETIME_MIN } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import AssignCompany from '@/routes/components/AssignCompany';
import { saveApplicableFunction } from '@/services/orgInvestigateTemplateService';
import OrgAddForm from './OrgAddForm';
import FilterForm from './FilterForm';
import ListTable from './ListTable';

/**
 * 调查表模板定义
 * @extends {Component} - React.Component
 * @reactProps {Object} [location={}] - 当前路由信息
 * @reactProps {Object} [match={}] - react-router match路由信息
 * @reactProps {Object} [history={}]
 * @reactProps {Object} investigationTemDefineOrg - 数据源
 * @reactProps {Object} loading - 数据加载是否完成
 * @reactProps {Object} form - 表单对象
 * @reactProps {Function} [dispatch= e => e] - redux dispatch方法
 * @return React.element
 */
const rowKey = 'investigateTemplateId';
@connect(({ loading, investigationTemDefineOrg }) => ({
  investigationTemDefineOrg,
  allLoading:
    loading.effects['investigationTemDefineOrg/queryInvestigateList'] ||
    loading.effects['investigationTemDefineOrg/changeInvestigate'] ||
    loading.effects['investigationTemDefineOrg/handleEffect'] ||
    loading.effects['investigationTemDefineOrg/addInvestigate'] ||
    loading.effects['investigationTemDefineOrg/handleTemplateCopy'],
}))
@withRouter
@formatterCollections({
  code: ['sslm.common', 'sslm.investDefOrg', 'spfm.rulesDefinition', 'sslm.investTempConfig'],
})
@withCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_TEMPLATE_LIST.TABLE',
    'SSLM.INVESTIGATION_TEMPLATE_LIST.FORM',
    'SSLM.INVESTIGATION_TEMPLATE_LIST.SEARCH',
  ],
})
export default class InvestigationOrg extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orgAddModalVisible: false,
      orgEditModalVisible: false,
      orgChangeFlag: 0,
      currentRow: {}, // 当前行
    };
  }

  orgForm;

  static propTypes = {
    dispatch: PropTypes.func,
  };

  static defaultProps = {
    dispatch: e => e,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'investigationTemDefineOrg/init',
      payload: {
        investigateTypes: 'SSLM.INVESTIGATE_TYPE',
        enabledList: 'HPFM.FLAG',
        tenantId: getCurrentOrganizationId(),
      },
    });
  }

  getSnapshotBeforeUpdate() {
    const {
      investigationTemDefineOrg: { pagination = {} },
    } = this.props;
    if (!this.custFlag && !this.props.custLoading) {
      this.handleSearch(pagination);
      this.custFlag = true;
    }
  }

  /**
   * 隐藏新增弹窗
   */
  @Bind()
  hideAddModal() {
    this.setState({
      orgAddModalVisible: false,
      orgEditModalVisible: false,
      currentRow: {},
      orgChangeFlag: 0,
    });
  }

  /**
   * 添加调查表
   */
  @Bind()
  handleAdd(fieldsValue) {
    const {
      dispatch,
      investigationTemDefineOrg: { pagination },
    } = this.props;
    const addItem = { ...fieldsValue, tenantId: getCurrentOrganizationId(), releaseFlag: 0 };
    dispatch({
      type: 'investigationTemDefineOrg/addInvestigate',
      payload: {
        data: addItem,
        customizeUnitCode: 'SSLM.INVESTIGATION_TEMPLATE_LIST.FORM',
      },
    }).then(data => {
      if (data) {
        this.hideAddModal();
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 编辑调查表
   */
  @Bind()
  handleEdit(fieldsValue) {
    const {
      dispatch,
      investigationTemDefineOrg: { pagination },
    } = this.props;
    const editItem = { ...fieldsValue, tenantId: getCurrentOrganizationId() };
    dispatch({
      type: 'investigationTemDefineOrg/updateBasicInfo',
      payload: {
        data: editItem,
        customizeUnitCode: 'SSLM.INVESTIGATION_TEMPLATE_LIST.FORM',
      },
    }).then(data => {
      if (data) {
        this.hideAddModal();
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 查询调查表模板列表
   * @param {obj} page 查询字段
   */
  @Bind()
  handleSearch(page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    const { startDate, endDate, realName, ...rest } = filterValues;
    dispatch({
      type: 'investigationTemDefineOrg/queryInvestigateList',
      payload: {
        page,
        ...rest,
        startDate: startDate ? startDate.format(DATETIME_MIN) : undefined,
        endDate: endDate ? endDate.format(DATETIME_MIN) : undefined,
        customizeUnitCode:
          'SSLM.INVESTIGATION_TEMPLATE_LIST.SEARCH,SSLM.INVESTIGATION_TEMPLATE_LIST.TABLE',
      },
    });
  }

  /**
   * 新建一条调查模板
   * 改变列表状态树和新建的Map
   */
  @Bind()
  handleCreateQuestionnaire() {
    this.setState({ orgAddModalVisible: true });
  }

  /**
   * 分配到公司
   */
  @Bind()
  handleAllocateToCompany(record = {}) {
    const {
      investigationTemDefineOrg: { pagination = {} },
    } = this.props;
    C7nModal.open({
      drawer: true,
      closable: false,
      destroyOnClose: true,
      style: { width: 742 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      title: intl.get(`sslm.investTempConfig.view.button.allocateCompany`).d('分配公司'),
      children: (
        <AssignCompany
          record={record}
          onRef={node => {
            this.allocateCompanyRef = node;
          }}
        />
      ),
      onOk: () => {
        const { investigateTemplateId } = record;
        const assignMenuScope =
          this.allocateCompanyRef &&
          this.allocateCompanyRef.current &&
          this.allocateCompanyRef.current.get('assignMenuScope');
        const payload = {
          investigateTemplateId,
          assignMenuScope: assignMenuScope && assignMenuScope.join(),
        };
        return new Promise((resolve, reject) => {
          saveApplicableFunction(payload).then(response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              this.handleSearch(pagination);
              resolve();
            } else {
              reject();
            }
          });
        });
      },
    });
  }

  @Bind()
  handleEditQuestionnaire(record = {}) {
    this.setState({
      currentRow: record,
      orgEditModalVisible: true,
      orgChangeFlag: 1,
    });
  }

  // 复制
  @Bind()
  handleTemplateCopy(record = {}) {
    const {
      dispatch,
      investigationTemDefineOrg: { pagination },
    } = this.props;
    const { investigateTemplateId } = record;
    dispatch({
      type: 'investigationTemDefineOrg/handleTemplateCopy',
      payload: {
        investigateTemplateId,
      },
    }).then(data => {
      if (data) {
        // 查询
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 生效选中行
   */
  @Bind()
  handleEffect(investigateTemplateId) {
    const {
      dispatch,
      investigationTemDefineOrg: { pagination },
    } = this.props;
    dispatch({
      type: 'investigationTemDefineOrg/handleEffect',
      payload: {
        investigateTemplateId,
        customizeUnitCode: 'SSLM.INVESTIGATION_TEMPLATE_LIST.TABLE',
      },
    }).then(data => {
      if (data) {
        notification.success();
        this.handleSearch({ page: pagination });
      }
    });
  }

  /**
   * 跳转到调查表明细页
   * @param {Number} investigateTemplateId
   */
  @Bind()
  onHandleToTemplateDetail(investigateTemplateId) {
    const { history, dispatch } = this.props;
    dispatch({
      type: 'investigationTemDefineOrg/queryUpdateTemplateId',
      payload: { investigateTemplateId },
    }).then(res => {
      if (res) {
        history.push(`/sslm/investigation-template-define/detail/${investigateTemplateId}/${res}`);
      }
    });
  }

  /**
   * 保存修改的数据
   */
  @Bind()
  handleSave() {
    const {
      investigationTemDefineOrg: { investigateList, pagination },
      dispatch,
    } = this.props;
    const addList = getEditTableData(investigateList);
    if (Array.isArray(addList) && addList.length === 0) {
      return;
    }
    dispatch({
      type: 'investigationTemDefineOrg/changeInvestigate',
      payload: {
        addList,
        customizeUnitCode: 'SSLM.INVESTIGATION_TEMPLATE_LIST.TABLE',
      },
    }).then(data => {
      if (data) {
        this.handleSearch(pagination);
        notification.success();
      }
    });
  }

  /**
   * 选中行改变回调
   * @param {Array} newSelectedRowKeys
   * @param {Object} newSelectedRows
   */
  @Bind()
  handleRowSelectChange(newSelectedRowKeys, newSelectedRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationTemDefineOrg/updateState',
      payload: { selectedRowKeys: newSelectedRowKeys, selectedRows: newSelectedRows },
    });
  }

  /**
   * 数据查询
   * @param {Object} pagination 查询参数
   */
  @Bind()
  handleStandardTableChange(page) {
    const {
      investigationTemDefineOrg: { investigateList = {} },
    } = this.props;
    if (investigateList.some(item => item.isEdit || item.isNew)) {
      Modal.confirm({
        title: intl.get(`sslm.investDefOrg.view.message.title.pageChange`).d('确定离开此页面吗？'),
        content: intl.get(`sslm.investDefOrg.view.message.content.pageChange`).d('有未保存的修改'),
        onOk() {
          this.handleSearch(page);
        },
        onCancel() {},
      });
    } else {
      this.handleSearch(page);
    }
  }

  /**
   * 列改变时修改状态树的数据
   * @param {String} dataIndex
   * @param {String} value
   * @param {Object} record
   */
  @Bind()
  onHandleChangeColumn(dataIndex, value, record) {
    const {
      investigationTemDefineOrg: { investigateList },
      dispatch,
    } = this.props;
    const newInvestigateList = investigateList.map(item => {
      if (item[rowKey] === record[rowKey]) {
        return {
          ...record,
          [dataIndex]: value,
          isEdit: true,
        };
      }
      return item;
    });
    dispatch({
      type: 'investigationTemDefineOrg/updateState',
      payload: {
        investigateList: newInvestigateList,
      },
    });
  }

  /**
   * 跳转到引用模板复制页面
   * @param {*} investigateType
   * @param {*} industryId
   * @param {*} investigateTemplateId
   */
  @Bind()
  onHandleReferenceTemplate(investigateType, industryId, industryMeaning, investigateTemplateId) {
    const search = querystring.stringify({
      investigateType,
      industryId,
      investigateTemplateId,
      industryMeaning,
      tab: 'org',
    });
    const path = {
      pathname: `/sslm/investigation-template-define/reference-template`,
      search,
    };
    this.props.history.push(path);
  }

  render() {
    const {
      allLoading,
      investigationTemDefineOrg: {
        investigateList,
        pagination,
        selectedRowKeys,
        investigateTypes,
        enabledList,
      },
      customizeTable,
      customizeForm,
      customizeFilterForm,
    } = this.props;
    const { orgAddModalVisible, orgEditModalVisible, currentRow, orgChangeFlag } = this.state;
    const filterProps = {
      enabledList,
      investigateTypes,
      customizeFilterForm,
      onFilterChange: this.handleSearch,
      onRef: node => {
        this.filterForm = node.props.form;
      },
    };
    const listProps = {
      pagination,
      investigateTypes,
      effecting: allLoading,
      dataSource: investigateList,
      customizeTable,
      rowSelection: {
        selectedRowKeys, // 选中的keys
        onChange: this.handleRowSelectChange, // 选定项改变传入index
        onCleanSelectedKeys: () => this.handleRowSelectChange([], []),
        getCheckboxProps: record => ({
          disabled: record.disabled,
        }),
      },
      onSearchPaging: this.handleStandardTableChange,
      onHandleChangeColumn: this.onHandleChangeColumn,
      onHandleToTemplateDetail: this.onHandleToTemplateDetail,
      onHandleReferenceTemplate: this.onHandleReferenceTemplate,
      onHandleLatest: this.handleEffect,
      onHandleAllocateToCompany: this.handleAllocateToCompany,
      onHandleEditQuestionnaire: this.handleEditQuestionnaire,
      handleSearch: this.handleSearch,
      handleTemplateCopy: this.handleTemplateCopy,
    };
    return (
      <React.Fragment>
        <Header title={intl.get(`sslm.investDefOrg.view.message.title`).d('调查表模板定义')}>
          <Button
            icon="plus"
            type="primary"
            onClick={this.handleCreateQuestionnaire}
            loading={allLoading}
          >
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" onClick={this.handleSave} loading={allLoading}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterProps} />
          <ListTable {...listProps} />
        </Content>
        <OrgAddForm
          anchor="right"
          title={
            orgChangeFlag === 1
              ? intl.get(`sslm.investDefOrg.view.message.editTitle`).d('租户级调查表模板维护')
              : intl.get(`sslm.investDefOrg.view.message.addTitle`).d('租户级调查表模板创建')
          }
          onRef={ref => {
            this.orgForm = ref;
          }}
          onHandleAdd={this.handleAdd}
          onHandleEdit={this.handleEdit}
          confirmLoading={allLoading}
          visible={orgAddModalVisible || orgEditModalVisible}
          onCancel={this.hideAddModal}
          investigateTypes={investigateTypes}
          orgChangeFlag={orgChangeFlag}
          currentRow={currentRow}
          customizeForm={customizeForm}
        />
      </React.Fragment>
    );
  }
}
