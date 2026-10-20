/**
 * ProcessAppoint - 流程指定
 * @date: 2019-07-29
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { connect } from 'dva';
import { isEmpty, omit, isString } from 'lodash';
import { Bind } from 'lodash-decorators';
import React, { Component, Fragment } from 'react';
import { Button, Form, Input, Modal, Select, Dropdown, Menu } from 'hzero-ui';
import { Icon, Upload } from 'choerodon-ui';
import { Modal as C7nModal, Button as C7nButton } from 'choerodon-ui/pro';
import ExcelExportPro from 'srm-front-boot/lib/components/ExcelExportPro';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { HZERO_FILE } from 'hzero-front/lib/utils/config';
import { PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config';
import { Button as ButtonPermission } from 'components/Permission';

import uuidv4 from 'uuid/v4';
import intl from 'utils/intl';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import notification from 'utils/notification';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  getResponse,
  filterNullValueObject,
  getEditTableData,
  getCurrentOrganizationId,
  addItemToPagination,
  getCurrentTenant,
} from 'utils/utils';
import { isJSON } from '@/utils/util';
import { importDataJson, exportDataToJson } from '@/services/processAppointServices';
import ImportRecord from '@/components/ImportRecord';
import AutoRestHeight from '@/components/AutoRestHeight';
import FilterForm from './FilterForm';
import RuleConfigDrawer from './RuleConfigDrawer';
import VariableConfigDrawer from './VariableConfigDrawer';
import ExpressionEngineRule from '../../components/ExpressionEngineRule/index.tsx';

import styles from './index.less';

const FormItem = Form.Item;
const { Option } = Select;
const modalKey = C7nModal.key();
// const modelPrompt = 'swfl.processAppoint';
const sceneCode = 'SRM.WP.SETUP.PROCESS-ASSIGN'; // 场景编码

@connect(({ processAppoint, loading }) => ({
  processAppoint,
  queryProcessLoading: loading.effects['processAppoint/queryProcessConfig'],
  saveProcessLoading: loading.effects['processAppoint/saveProcessConfig'],
  deleteProcessLoading: loading.effects['processAppoint/deleteProcessConfig'],
  tenantId: getCurrentOrganizationId(),
}))
@formatterCollections({ code: ['swfl.processAppoint', 'hwfp.common', 'srm.common'] })
export default class ProcessAppoint extends Component {
  state = {
    selectedRows: [],
    selectedRowKeys: [],
    variableConfigVisible: false,
    ruleConfigVisible: false,
    procAssignConfId: undefined,
  };

  form;

  tableRef;

  componentDidMount() {
    this.handleProcessConfig();
    this.getStartupRuleType();
  }

  @Bind()
  getStartupRuleType() {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/getStartupRuleType',
      payload: { code: 'HWFP.STARTUP_RULE_TYPE' },
    });
  }

  /**
   * 绑定form
   */
  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  @Bind()
  handleBindTableRef(ref = {}) {
    this.tableRef = ref;
  }

  @Bind()
  handleExpandForm() {
    if (this.tableRef) {
      this.tableRef.handler();
    }
  }

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectedChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  /**
   * 变量配置Drawer的显示/隐藏
   */
  @Bind()
  handleVariableConfigDrawer(procAssignConfId) {
    const { variableConfigVisible } = this.state;
    this.setState({
      variableConfigVisible: !variableConfigVisible,
      procAssignConfId,
    });
  }

  /**
   * 规则配置Drawer的显示/隐藏
   */
  @Bind()
  handleRuleConfigDrawer(procAssignConfId) {
    const { ruleConfigVisible } = this.state;
    this.setState({
      ruleConfigVisible: !ruleConfigVisible,
      procAssignConfId,
    });
  }

  /**
   * 规则配置Drawer的显示/隐藏
   */
  @Bind()
  handleExpressionEngineRuleDrawer(record = {}) {
    const createButtonHook = ({ defaultRuleConfigs }) => {
      return (
        defaultRuleConfigs &&
        defaultRuleConfigs.length > 0 &&
        defaultRuleConfigs.every((i) => !i.required)
      );
    };
    const saveRuleHook = async ({ defaultRet, defaultRuleDs, saveDefaultRule }) => {
      let flag = true;
      if (isEmpty(defaultRet)) {
        flag = await saveDefaultRule(defaultRuleDs, false);
      }
      return flag;
    };
    const defaultRetDsHook = (config, { sceneExecuteConfig }) => {
      // eslint-disable-next-line no-param-reassign
      config.fields = config.fields.map((i) => {
        const required =
          (sceneExecuteConfig.find((j) => j.name === i.name) || {}).required || false;
        return { ...i, required };
      });
      return config;
    };
    const returnRuleDsHook = (config) => {
      // eslint-disable-next-line no-param-reassign
      config.fields = config.fields.map((i) => ({ ...i, required: true }));
      return config;
    };
    const afterSaveRuleHook = (refreshFunc) => {
      if (refreshFunc) {
        refreshFunc();
      }
    };
    C7nModal.open({
      key: modalKey,
      title: intl
        .get('swfl.processAppoint.view.title.modal.expressionEngineRule')
        .d('流程启动规则配置'),
      drawer: true,
      style: { width: '60%' },
      footer: null,
      destroyOnClose: true,
      resizable: true,
      closable: true,
      children: (
        <ExpressionEngineRule
          code={this.getEngineCode(record)}
          showTitle={false}
          sceneCode={sceneCode}
          leftValueLovQueryPara={{
            documentId: record.documentId,
            isIncludePredefineFlag: 'N',
            categoryId: record.processCategoryId,
          }}
          dataSource={record}
          createButtonHook={createButtonHook}
          saveRuleHook={saveRuleHook}
          afterSaveRuleHook={afterSaveRuleHook}
          returnRuleDsHook={returnRuleDsHook}
          defaultRetDsHook={defaultRetDsHook}
          encryptBody
        />
      ),
    });
  }

  /**
   * 流程分类编码lov改变时的回调
   */
  @Bind()
  handleClassifyChange(record, lovRecord) {
    record.$form.setFieldsValue({
      categoryDescription: lovRecord.description,
      categoryCode: lovRecord.categoryCode,
    });
  }

  /**
   * 流程单据编码lov改变时的回调
   */
  @Bind()
  handleSecurityChange(record, lovRecord) {
    record.$form.setFieldsValue({
      documentDescription: lovRecord.description,
      documentCode: lovRecord.documentCode,
    });
  }

  /**
   * 查询流程指定
   */
  @Bind()
  handleProcessConfig(page = {}) {
    const { dispatch } = this.props;
    const formValue = filterNullValueObject(this.form.getFieldsValue());
    dispatch({
      type: 'processAppoint/queryProcessConfig',
      payload: {
        page,
        ...formValue,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
        });
      }
    });
  }

  /**
   * 新建
   */
  @Bind()
  handleAdd() {
    const {
      dispatch,
      processAppoint: { processAppointList, processAppointPagination },
    } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        processAppointList: [
          { _status: 'create', procAssignConfId: uuidv4() },
          ...processAppointList,
        ],
        processAppointPagination: addItemToPagination(
          processAppointList.length,
          processAppointPagination
        ),
      },
    });
  }

  /**
   * 保存
   */
  @Bind()
  handleSave() {
    const {
      dispatch,
      processAppoint: { processAppointList },
    } = this.props;
    const tableValues = getEditTableData(processAppointList, ['procAssignConfId', '_status']);
    if (!isEmpty(tableValues)) {
      dispatch({
        type: 'processAppoint/saveProcessConfig',
        payload: tableValues,
      }).then((res) => {
        if (res) {
          notification.success();
          this.handleProcessConfig();
        }
      });
    }
  }

  /**
   * 删除已有数据(调接口删除)
   */
  @Bind()
  handleRowsDelete(existRows) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/deleteProcessConfig',
      payload: existRows,
    }).then((res) => {
      if (res) {
        this.setState({
          selectedRowKeys: [],
        });
        notification.success();
        this.handleProcessConfig();
      }
    });
  }

  /**
   * 删除新建数据(前端数据更新)
   */
  @Bind()
  handleUpdateState(newList) {
    const { dispatch } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        processAppointList: newList,
      },
    });
    this.setState({
      selectedRowKeys: [],
    });
    notification.success();
  }

  /**
   * 确认删除框
   */
  @Bind()
  handleDeleteConfirm(onOk) {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
      onOk,
    });
  }

  @Bind()
  getEngineCode(record = {}) {
    const { tenantNum } = getCurrentTenant();
    return `${tenantNum}:${sceneCode}:${record.categoryCode}:${record.documentCode}`;
  }

  /**
   * 删除
   */
  @Bind()
  handleDelete() {
    const {
      dispatch,
      processAppoint: { processAppointList },
    } = this.props;
    const { selectedRows } = this.state;
    // 获取selectedRows中的新建行
    const newRows = selectedRows.filter((item) => item._status === 'create');
    // 获取新建行的procAssignConfId
    const newRowsKeys = newRows.map((item) => item.procAssignConfId);
    // 获取selectedRows中的现有行
    const existRows = selectedRows.filter((item) => item._status !== 'create');
    // 对selectedRows中数据进行处理
    const deleteExistRows = existRows.map((row) => {
      return {
        ...row,
        engineCode: this.getEngineCode(row),
      };
    });
    // 在processAppointList中排除selectedRows中的新建行
    const newList = processAppointList.filter(
      (item) => !newRowsKeys.includes(item.procAssignConfId)
    );

    if (isEmpty(newRows)) {
      this.handleDeleteConfirm(() => this.handleRowsDelete(deleteExistRows));
    } else if (isEmpty(deleteExistRows)) {
      this.handleDeleteConfirm(() => this.handleUpdateState(newList));
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.remove').d('确定删除选中数据?'),
        onOk: () => {
          dispatch({
            type: 'processAppoint/deleteProcessConfig',
            payload: deleteExistRows,
          }).then((res) => {
            if (res) {
              this.handleUpdateState(newList);
              this.handleProcessConfig();
            }
          });
        },
      });
    }
  }

  @Bind()
  renderStartupRuleType(val, startupRuleTypes = []) {
    const type = startupRuleTypes.find((startupRuleType) => startupRuleType.value === val) || {};
    return type.meaning;
  }

  @Bind()
  changeRecordToEditing(record = {}) {
    const {
      dispatch,
      processAppoint: { processAppointList },
    } = this.props;
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        processAppointList: processAppointList.map((li) => {
          if (li.procAssignConfId === record.procAssignConfId) {
            return {
              ...li,
              _status: 'update',
            };
          } else {
            return li;
          }
        }),
      },
    });
  }

  @Bind()
  cancelRecordEditing(record = {}) {
    const {
      dispatch,
      processAppoint: { processAppointList },
    } = this.props;
    let list = [];
    if (record._status === 'create') {
      list = processAppointList.filter((li) => li.procAssignConfId !== record.procAssignConfId);
    } else {
      list = processAppointList.map((li) => {
        if (li.procAssignConfId === record.procAssignConfId) {
          return omit(li, '_status');
        } else {
          return li;
        }
      });
    }
    dispatch({
      type: 'processAppoint/updateState',
      payload: {
        processAppointList: list,
      },
    });
  }

  /**
   * 获取导出参数
   */
  @Bind()
  getExportQueryParams() {
    const { selectedRowKeys } = this.state;
    const { tenantId } = this.props;
    const formValue = filterNullValueObject(this.form.getFieldsValue());
    const params = {
      tenantId,
      procAssignConfIds: selectedRowKeys,
      fileName: intl.get('swfl.processAppoint.model.export.defaultName').d('流程指定数据导出'),
      ...formValue,
    };
    return filterNullValueObject(params);
  }

  // 导入JSON文件
  handleImport = (file) => {
    const formData = new FormData();
    formData.append('file', file, file.name);
    importDataJson(formData).then((response) => {
      if (isEmpty(response)) {
        notification.success();
        this.handleProcessConfig();
      } else if (isJSON(response)) {
        const { message } = JSON.parse(response);
        notification.error({ description: message });
      }
    });
    return false;
  };

  // 查看导入记录
  handleOpenHistoryDrawer = () => {
    C7nModal.open({
      title: intl.get('hzero.common.view.import.record').d('查看导入记录'),
      drawer: true,
      style: { width: '1000px' },
      bodyStyle: { padding: 0 },
      children: <ImportRecord />,
      footer: (_, cancelBtn) => cancelBtn,
      cancelText: intl.get('hzero.common.button.close').d('关闭'),
      cancelProps: {
        color: 'primary',
      },
    });
  };

  // 导出JSON文件
  handleJSONExport = async () => {
    const { selectedRowKeys } = this.state;
    const formValue = filterNullValueObject(this.form.getFieldsValue());
    const params = {
      ids: selectedRowKeys,
      ...formValue,
    };
    const exportResult = await exportDataToJson(params);
    if (exportResult && isString(exportResult)) {
      if (isJSON(exportResult)) {
        const { failed, message } = JSON.parse(exportResult);
        if (failed) {
          notification.error({ description: message });
        }
      } else {
        const downLoadResult = await downloadFileByAxios({
          requestUrl: `${HZERO_FILE}/v1/${getCurrentOrganizationId()}/files/download`,
          queryParams: [
            { name: 'url', value: encodeURIComponent(exportResult) },
            { name: 'bucketName', value: `${PRIVATE_BUCKET}` },
          ],
          method: 'GET',
        });
        if (getResponse(downLoadResult)) {
          return true;
        }
      }
    } else {
      notification.error({});
    }
    return false;
  };

  render() {
    const {
      queryProcessLoading,
      saveProcessLoading,
      deleteProcessLoading,
      processAppoint: { processAppointList, processAppointPagination, startupRuleTypes },
      tenantId,
    } = this.props;
    const {
      selectedRowKeys,
      variableConfigVisible,
      ruleConfigVisible,
      procAssignConfId,
    } = this.state;
    const filterFormProps = {
      onRef: this.handleBindRef,
      onSearch: this.handleProcessConfig,
      onExpandForm: this.handleExpandForm,
    };
    const columns = [
      {
        title: intl.get('swfl.processAppoint.model.processClassify.code').d('流程分类编码'),
        dataIndex: 'categoryCode',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryId', {
                initialValue: record.categoryId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.processClassify.code')
                        .d('流程分类编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  textField="categoryCode"
                  queryParams={{ tenantId }}
                  code="HWFP.PROCESS_CATEGORY"
                  onChange={(_, lovRecord) => this.handleClassifyChange(record, lovRecord)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.processClassify.describe').d('流程分类描述'),
        dataIndex: 'categoryDescription',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('categoryDescription', {
                initialValue: record.categoryDescription,
              })(<Input disabled dbc2sbc={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.processSecurity.code').d('流程单据编码'),
        dataIndex: 'documentCode',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('documentId', {
                initialValue: record.documentId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.processSecurity.code')
                        .d('流程单据编码'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="HWFP.PROCESS_DOCUMENT"
                  textField="documentCode"
                  queryParams={{ categoryId: record.$form.getFieldValue('categoryId'), tenantId }}
                  disabled={!record.$form.getFieldValue('categoryId')}
                  onChange={(_, lovRecord) => this.handleSecurityChange(record, lovRecord)}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('swfl.processAppoint.model.processSecurity.describe').d('流程单据描述'),
        dataIndex: 'documentDescription',
        width: 200,
        render: (val, record) =>
          ['create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('documentDescription', {
                initialValue: record.documentDescription,
              })(<Input disabled dbc2sbc={false} />)}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl
          .get('swfl.processAppoint.model.processSecurity.startupRuleType')
          .d('启动规则类型'),
        dataIndex: 'startupRuleType',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('startupRuleType', {
                initialValue: record._status === 'create' ? 'ENGINE' : record.startupRuleType,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl
                        .get('swfl.processAppoint.model.processSecurity.startupRuleType')
                        .d('启动规则类型'),
                    }),
                  },
                ],
              })(
                <Select style={{ width: '100%' }} disabled={record._status === 'create'}>
                  {startupRuleTypes.map((type) => (
                    <Option key={type.value} value={type.value}>
                      {type.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          ) : (
            this.renderStartupRuleType(val, startupRuleTypes)
          ),
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 200,
        dataIndex: 'procAssignConfId',
        render: (val, record) => {
          if (['create', 'update'].includes(record._status)) {
            return (
              <a style={{ marginRight: 8 }} onClick={() => this.cancelRecordEditing(record)}>
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            );
          } else if (record.startupRuleType === 'ENGINE') {
            return (
              <Fragment>
                <a
                  style={{ marginRight: 8 }}
                  onClick={() => this.handleExpressionEngineRuleDrawer(record)}
                >
                  {intl
                    .get('swfl.processAppoint.view.title.modal.expressionEngineRule')
                    .d('流程启动规则配置')}
                </a>
                {record.editFlag && (
                  <a onClick={() => this.changeRecordToEditing(record)}>
                    {intl.get('hzero.common.button.edit').d('编辑')}
                  </a>
                )}
              </Fragment>
            );
          } else {
            return (
              <Fragment>
                <a style={{ marginRight: 8 }} onClick={() => this.handleVariableConfigDrawer(val)}>
                  {intl.get('swfl.processAppoint.model.button.variableConfig').d('变量配置')}
                </a>
                <a style={{ marginRight: 8 }} onClick={() => this.handleRuleConfigDrawer(val)}>
                  {intl.get('swfl.processAppoint.model.button.ruleConfig').d('规则配置')}
                </a>
                {record.editFlag && (
                  <a onClick={() => this.changeRecordToEditing(record)}>
                    {intl.get('hzero.common.button.editor').d('编辑')}
                  </a>
                )}
              </Fragment>
            );
          }
        },
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: this.handleSelectedChange,
    };
    const variableConfigDrawerProps = {
      procAssignConfId,
      visible: variableConfigVisible,
      onClose: this.handleVariableConfigDrawer,
    };
    const ruleConfigDrawerProps = {
      procAssignConfId,
      visible: ruleConfigVisible,
      onClose: this.handleRuleConfigDrawer,
    };

    const importMenu = (
      <Menu>
        <Menu.Item key="json" className={styles['export-basic-btn']}>
          <Upload accept=".json" beforeUpload={this.handleImport} showUploadList={false}>
            <span style={{ display: 'inline-block', padding: '0 15px', fontWeight: 600 }}>
              {intl.get('hzero.common.button.import.json').d('导入JSON文件')}
            </span>
          </Upload>
        </Menu.Item>
        <Menu.Item key="record" className={styles['export-basic-btn']}>
          <C7nButton onClick={this.handleOpenHistoryDrawer} funcType="flat">
            {intl.get('hzero.common.view.import.record').d('查看导入记录')}
          </C7nButton>
        </Menu.Item>
      </Menu>
    );

    const exportMenu = (
      <Menu>
        <Menu.Item key="excel" className={styles['export-basic-btn']}>
          <ExcelExportPro
            formData={{ fillerType: 'multi-sheet' }}
            formProps={{ fillerType: { disabled: true } }}
            requestUrl={`/hwfp/v1/${tenantId}/process-assign/export`}
            queryParams={this.getExportQueryParams}
            buttonText={intl.get('hzero.common.button.export.excel').d('导出excel文件')}
            otherButtonProps={{
              icon: '',
              style: {
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                letterSpacing: 'normal',
                margin: 0,
              },
            }}
          />
        </Menu.Item>
        <Menu.Item key="json" className={styles['export-basic-btn']}>
          <C7nButton onClick={this.handleJSONExport} funcType="flat">
            {intl.get('hzero.common.button.export.json').d('导出JSON文件')}
          </C7nButton>
        </Menu.Item>
      </Menu>
    );

    return (
      <Fragment>
        <Header
          title={intl.get('swfl.processAppoint.view.message.title.processAppoint').d('流程指定')}
        >
          <Button icon="plus" type="primary" onClick={this.handleAdd}>
            {intl.get('hzero.common.button.create').d('新建')}
          </Button>
          <Button icon="save" loading={saveProcessLoading} onClick={this.handleSave}>
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
          <Button
            icon="delete"
            onClick={this.handleDelete}
            loading={deleteProcessLoading}
            disabled={isEmpty(selectedRowKeys)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Dropdown overlay={importMenu}>
            <ButtonPermission
              type="c7n-pro"
              className={styles['export-btn']}
              permissionList={[
                {
                  code: `srm.wp.setup.process-assign.api.assigin-import`,
                  type: 'button',
                  meaning: intl.get('hzero.common.import').d('导入'),
                },
              ]}
            >
              <Icon type="archive" className={styles['export-btn-icon']} />
              {intl.get('hzero.common.import').d('导入')}
            </ButtonPermission>
            {/* <C7nButton className={styles['export-btn']} tooltip="none">
              <Icon type="archive" className={styles['export-btn-icon']} />
              {intl.get('hzero.common.import').d('导入')}
            </C7nButton> */}
          </Dropdown>
          <Dropdown overlay={exportMenu}>
            <C7nButton className={styles['export-btn']} tooltip="none">
              <Icon type="unarchive" className={styles['export-btn-icon']} />
              {intl.get('hzero.common.button.export').d('导出')}
              <span className={styles['export-btn-tag']}>NEW</span>
            </C7nButton>
          </Dropdown>
        </Header>
        <div className={styles.content}>
          <FilterForm {...filterFormProps} />
          <div className={styles.list}>
            <AutoRestHeight
              topSelector=".ant-spin-container"
              type="hzero-ui"
              onRef={this.handleBindTableRef}
            >
              <EditTable
                bordered
                rowKey="procAssignConfId"
                columns={columns}
                rowSelection={rowSelection}
                loading={queryProcessLoading}
                dataSource={processAppointList}
                onChange={this.handleProcessConfig}
                pagination={processAppointPagination}
              />
            </AutoRestHeight>
          </div>
        </div>
        {variableConfigVisible && <VariableConfigDrawer {...variableConfigDrawerProps} />}
        {ruleConfigVisible && <RuleConfigDrawer {...ruleConfigDrawerProps} />}
      </Fragment>
    );
  }
}
