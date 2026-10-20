/**
 * index.js - 协议模板管理
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import React, { Component, Fragment } from 'react';
import { Button, Modal } from 'hzero-ui';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { isUndefined, omit } from 'lodash';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  addItemToPagination,
  getEditTableData,
  delItemsToPagination,
  createPagination,
  getResponse,
} from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import hocRemote from 'utils/remote';

import Search from './Search';
import List from './List';
import CompanyModal from './CompanyModal';
import './index.less';

const modelPrompt = 'spcm.common.model.common';
@connect(({ loading = {}, contractTemplate = {} }) => ({
  queryListLoading: loading.effects['contractTemplate/queryList'],
  updateStateLoading: loading.effects['contractTemplate/updateState'],
  submitting: loading.effects['contractTemplate/update'],
  queryCompanyLoading: loading.effects['contractTemplate/fetchCompany'],
  submitApproveLoading: loading.effects['contractTemplate/submitTemplate'],
  unlockTemplateLoading: loading.effects['contractTemplate/unlockTemplate'],
  contractTemplate,
}))
@formatterCollections({
  code: [
    'spcm.contractTemplate',
    'spcm.purchaseContactType',
    'spcm.common',
    'entity.company',
    'entity.item',
    'entity.lang',
  ],
})
@withCustomize({
  unitCode: ['SPCM.CONTRACT.TEMPLATE.LIST'],
})
@hocRemote({
  code: 'SPCM_CONTRACT_TEMPLATE_LIST',
  name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
})
export default class ContractTemplate extends Component {
  constructor(props) {
    const isPub = props.location.pathname.includes('/pub'); // 判断是否为pub页面
    // const isPub = true;
    super(props);
    const {
      match: { params },
    } = this.props;
    const { pcTemplateId } = params;
    this.state = {
      pcTemplateId,
      pcTempId: null,
      pcTypeId: null,
      pcTempEditable: true, // 行是否可以编辑
      dataSource: [],
      selectedRows: [],
      selectedRowKeys: [],
      pagination: [],
      tenantId: getCurrentOrganizationId(),
      companyDataSource: [], // 公司数据
      companyPagination: {}, // 公司分页
      isPub,
    };
  }

  componentDidMount() {
    const {
      // TODO
      // _back:判断进入详情
      // 分页
      location: { state: { _back } = {} },
      contractTemplate: { pagination = {} },
    } = this.props;
    if (_back === -1) {
      this.fetchList(pagination);
    } else {
      this.fetchList(); // 查询数据
    }
    this.fetchEnum(); // 查询值集
  }

  componentDidUpdate(prevProps, prevState, pcTemplateId) {
    if (pcTemplateId) {
      this.fetchList();
    }
  }

  /**
   * fetchList - 查询数据
   * @param {object} params - 查询条件
   */
  @Bind()
  fetchList(page = {}, selectedRows = [], selectedRowKeys = []) {
    const { pcTemplateId, tenantId } = this.state;
    const { dispatch } = this.props;
    const { templateStatus, ...filterValues } = isUndefined(this.filterForm)
      ? {}
      : filterNullValueObject(this.filterForm.getFieldsValue());
    this.setState({ selectedRows, selectedRowKeys });
    dispatch({
      type: 'contractTemplate/queryList',
      payload: {
        page,
        pcTemplateId,
        tenantId,
        ...filterValues,
        templateStatus, // 工作流默认为审批中状态
        customizeUnitCode: 'SPCM.CONTRACT.TEMPLATE.LIST',
      },
    }).then(() => {
      this.resetDataForm();
    });
  }

  /**
   * onReset - 重置列表事件
   */
  @Bind()
  resetDataForm() {
    const { contractTemplate } = this.props;
    const { dataSource = [] } = contractTemplate;
    dataSource.forEach((item) => {
      if (['PENDING', 'BEEN_UPDATED', 'REJECTED'].includes(item.templateStatus)) {
        const { registerField, setFieldsValue } = item.$form;
        registerField(['editable']);
        setFieldsValue({ editable: false });
      }
      item.$form.resetFields();
    });
  }

  /**
   * save - 保存明细数据
   * 保存明细头数据和行明细相关字段
   */
  @Bind()
  save() {
    const { dispatch, contractTemplate } = this.props;
    const { dataSource = [], pagination } = contractTemplate;
    const newDataSource = dataSource.filter(
      (item) => item.edited || item.$form.getFieldValue('editable')
    );
    let lines = getEditTableData(newDataSource, [
      'pcTemplateId',
      '_status',
      'editable',
      'customizeEditType',
    ]);
    lines = lines.map((item) => {
      return {
        ...item,
        templateType: item.templateType?.join(','),
      };
    });
    if (newDataSource.length === 0 || (Array.isArray(lines) && lines.length !== 0)) {
      const headerData = {
        lines,
      };
      dispatch({
        type: 'contractTemplate/update',
        payload: { headerData },
      }).then((res) => {
        if (getResponse(res)) {
          notification.success();
          this.fetchList(pagination);
        }
      });
    }
  }

  /**
   * 查询值集
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/init',
    });
  }

  /**
   * 设置选中行
   * @param {Array} selectedRowKeys
   * @param {Array} selectedRows
   */
  @Bind()
  onRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 新建列表
   * @param {String} pcTemplateId
   */
  @Bind()
  newProject() {
    const {
      dispatch,
      contractTemplate: { dataSource, pagination },
    } = this.props;
    const newDataSource = {
      enabledFlag: 1,
      edited: true,
      pcTemplateId: uuid(),
      _status: 'create',
      customizeEditType: 'create',
      templateFileUrl: 'NULL_TEMPLATE',
    };
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  @Bind()
  handleRecordChange(record) {
    const { dispatch, contractTemplate } = this.props;
    const { dataSource } = contractTemplate;
    const newDataSource = dataSource.map((item) => {
      if (item.pcTemplateId === record.pcTemplateId) {
        return {
          ...item,
          edited: true,
        };
      }
      return item;
    });
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        dataSource: newDataSource,
      },
    });
  }

  /**
   * delete - 删除列表
   */
  @Bind()
  delete() {
    const sourceField = `dataSource`;
    const paginationField = `pagination`;
    const selectedField = `selectedRows`;
    const rowKey = `pcTemplateId`;
    const { [selectedField]: selectedRows = [] } = this.state;
    const { contractTemplate, dispatch } = this.props;
    const { [sourceField]: dataSource = [], [paginationField]: pagination = {} } = contractTemplate;
    Modal.confirm({
      title: intl.get(`spcm.purchaseContactType.view.message.removePurchaseLines`).d('是否清除'),
      onOk: () => {
        const selectedRowKeys = selectedRows.map((item) => item[rowKey]);
        const newDataSource = dataSource.filter((item) => !selectedRowKeys.includes(item[rowKey]));
        dispatch({
          type: 'contractTemplate/updateState',
          payload: {
            [sourceField]: newDataSource,
            [paginationField]: delItemsToPagination(
              selectedRows.length,
              newDataSource.length, // 当前数据长度
              // newDataSource.length, // 新增数据长度
              pagination // 原始分页对象
            ),
          },
        });
        this.setState({ [selectedField]: [], [paginationField]: [] });
      },
    });
  }

  /**
   * handleCompany - 处理公司查看/新增
   */
  @Bind()
  handleCompany(pcTypeId, pcTemplateId, pcTempEditable) {
    this.setState(
      {
        companyVisible: true,
        pcTempId: pcTemplateId,
        pcTypeId,
        pcTempEditable,
      },
      () => this.fetchCompany(pcTypeId, pcTemplateId)
    );
  }

  /**
   fetchCompany - 查询公司(子账号权限下的公司)
   */
  @Bind()
  fetchCompany(record, pcTemplateId, page = {}) {
    const { dispatch } = this.props;
    const filterValues = isUndefined(this.companyForm)
      ? {}
      : filterNullValueObject(this.companyForm.getFieldsValue());
    dispatch({
      type: 'contractTemplate/fetchCompany',
      payload: {
        ...filterValues,
        pcConfigId: record,
        pcTemplateId,
        page,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          companyDataSource: res.content.map((n) => ({ ...n, _status: 'update' })) || [],
          companyPagination: createPagination(res),
        });
      }
    });
  }

  /**
   * 关闭公司模态框
   */
  @Bind()
  hideCompanyModal() {
    this.setState({
      companyVisible: false,
    });
  }

  /**
   * 确认保存新建的公司
   */
  @Bind()
  saveCompany() {
    const { companyDataSource, pcTempId, pcTempEditable } = this.state;
    if (!pcTempEditable) {
      this.setState({
        companyVisible: false,
      });
      return;
    }

    const { dispatch } = this.props;
    const companyData = getEditTableData(companyDataSource, ['companyId', '_status']);
    dispatch({
      type: 'contractTemplate/saveCompany',
      payload: { pcTemplateId: pcTempId, companyDataSource: companyData },
    }).then((res) => {
      if (res) {
        notification.success();
        this.setState({
          companyVisible: false,
        });
      }
    });
  }

  @Bind()
  handleJumpTemplate(pcTemplateId, templateStatus, editable) {
    const { dispatch } = this.props;
    const { isPub } = this.state;
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        templateStatus,
        templateEditable: editable,
      },
    });
    this.props.history.push(
      isPub
        ? `/pub/spcm/contract-template/config/${pcTemplateId}`
        : `/spcm/contract-template/config/${pcTemplateId}`
    );
  }

  /**
   * 跳转到历史版本
   * @param {*} pcTemplateId
   * @param {*} templateStatus
   * @param {*} editable
   */
  @Bind()
  handleJumpVersion(pcTemplateId) {
    const { isPub } = this.state;
    this.props.history.push(
      isPub
        ? `/pub/spcm/contract-template/version/${pcTemplateId}`
        : `/spcm/contract-template/version/${pcTemplateId}`
    );
  }

  @Bind()
  handleSubmit(lines, pagination) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/submitTemplate',
      payload: { lines },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList(pagination);
      }
    });
  }

  @Bind()
  handleUnLock(lines, pagination) {
    const { dispatch } = this.props;
    dispatch({
      type: 'contractTemplate/unlockTemplate',
      payload: { lines },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList(pagination);
      }
    });
  }

  /**
   * 获取清稿文件
   * @param {*} record
   */
  @Bind()
  onClearRevisions(record) {
    const {
      contractTemplate: { pagination },
      dispatch,
    } = this.props;
    dispatch({
      type: 'contractTemplate/clearRevisions',
      payload: { pcTemplateId: record?.pcTemplateId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList(pagination);
      }
    });
  }

  /**
   * 退回至新建
   * @param {*} record
   */
  @Bind()
  onBackToNew(record) {
    const {
      contractTemplate: { pagination },
      dispatch,
    } = this.props;
    dispatch({
      type: 'contractTemplate/backToNew',
      payload: { pcTemplateId: record?.pcTemplateId },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchList(pagination);
      }
    });
  }

  @Bind()
  handleCancelNewLine(record) {
    const {
      contractTemplate: { dataSource, pagination },
      dispatch,
    } = this.props;
    const newDataSource = dataSource?.filter((item) => item.pcTemplateId !== record.pcTemplateId);
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        dataSource: [...newDataSource],
        pagination: delItemsToPagination(1, newDataSource.length, pagination),
      },
    });
  }

  /**
   * onCopy 获取个性化中非标准字段
   */
  @Bind()
  getCustFields() {
    const { custConfig = {} } = this.props;
    const { fields = [] } = custConfig['SPCM.CONTRACT.TEMPLATE.LIST'] || {};
    return fields.filter((field) => !field.isStandardField).map((item) => item.fieldCode);
  }

  /**
   * onCopy 复制
   */
  @Bind()
  onCopy(record) {
    const {
      dispatch,
      contractTemplate: { dataSource, pagination },
    } = this.props;
    const custFields = this.getCustFields();
    // 过滤掉非标准字段
    const filterRecord = omit(record, custFields);
    const {
      // companyId,
      // companyName,
      // dataFlag,
      // endDateActive,
      pcTemplateId,
      // pcTypeId,
      // pcTypeName,
      // recordFlag,
      // startDateActive,
      // templateApprovalMethod,
      // templateCode,
      // templateFileUrl,
      // templateName,
      // templateType,
      // templateTypeMeaning,
      // tenantId,
    } = record;
    const newDataSource = {
      ...filterRecord,
      // ...record,
      enabledFlag: 1,
      edited: true,
      pcTemplateId: uuid(),
      originalPcTemplateId: pcTemplateId,
      _status: 'create',
      customizeEditType: 'create',
      isCopy: true,
      templateStatus: null,
      templateStatusMeaning: null,
    };
    dispatch({
      type: 'contractTemplate/updateState',
      payload: {
        dataSource: [newDataSource, ...dataSource],
        pagination: addItemToPagination(dataSource.length, pagination),
      },
    });
  }

  render() {
    const {
      form,
      queryListLoading,
      contractTemplate,
      submitting,
      updateStateLoading,
      queryCompanyLoading,
      submitApproveLoading,
      unlockTemplateLoading,
      customizeTable,
      remote,
      onLoad,
    } = this.props;
    const { pagination = {}, dataSource = [], enumMap = {} } = contractTemplate;
    const {
      selectedRows = [],
      companyVisible,
      companyDataSource,
      companyPagination,
      pcTypeId,
      pcTempId,
      isPub,
      pcTempEditable,
    } = this.state;
    const searchProps = {
      enumMap,
      onRef: (node) => {
        this.filterForm = node.props.form;
      },
      onFetchList: this.fetchList,
    };
    const companyProps = {
      dataSource: companyDataSource,
      pagination: companyPagination,
      loading: queryCompanyLoading,
      visible: companyVisible,
      onSearch: this.fetchCompany,
      handleCompany: this.fetchCompany,
      fetchCompany: this.fetchCompany,
      saveCompany: this.saveCompany,
      hideModal: this.hideCompanyModal,
      pcTypeId, // 类型id
      pcTempId, // 模板id
      pcTempEditable,
      onRef: (node) => {
        this.companyForm = node.props.form;
      },
    };
    const listProps = {
      form,
      isPub,
      remote,
      dataSource,
      pagination,
      selectedRows,
      companyProps,
      contractTemplate,
      enumMap,
      customizeTable,
      onLoad,
      onSearch: this.fetchList,
      onSubmit: this.handleSubmit,
      onUnLock: this.handleUnLock,
      onClearRevisions: this.onClearRevisions,
      onBackToNew: this.onBackToNew,
      loading: queryListLoading || submitApproveLoading || unlockTemplateLoading,
      newProject: this.newProject,
      onCancelNewLine: this.handleCancelNewLine,
      redirectDetail: this.redirectDetail,
      onHandleRecord: this.handleRecordChange,
      onRowSelectChange: this.onRowSelectChange,
      handleCompany: this.handleCompany,
      onJumpTemplate: this.handleJumpTemplate,
      onJumpVersion: this.handleJumpVersion,
      onCopy: this.onCopy,
    };
    return (
      <Fragment>
        <Header title={intl.get(`${modelPrompt}.pcTemplateId`).d('协议模板')}>
          {!isPub && (
            <Fragment>
              <Button icon="plus" type="primary" onClick={() => this.newProject()}>
                {intl.get(`hzero.common.button.create`).d('新建')}
              </Button>
              <Button
                icon="save"
                loading={submitting}
                onClick={this.save}
                disabled={queryListLoading || updateStateLoading}
              >
                {intl.get(`hzero.common.button.save`).d('保存')}
              </Button>
              {/* <Button
                icon="delete"
                onClick={this.delete}
                disabled={isArray(selectedRowKeys) && isEmpty(selectedRowKeys)}
              >
                {intl.get(`hzero.common.button.clean`).d('清除')}
              </Button> */}
            </Fragment>
          )}
        </Header>
        <Content>
          {!isPub && <Search {...searchProps} />}
          <List {...listProps} />
        </Content>
        {companyVisible && <CompanyModal {...companyProps} />}
      </Fragment>
    );
  }
}
