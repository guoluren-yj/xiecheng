/**
 * Table - 修改服务配置-接口列表表格
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { isEmpty, isUndefined } from 'lodash';
import uuid from 'uuid/v4';
import { Bind } from 'lodash-decorators';
import { Table, Upload, Menu, Dropdown, Icon } from 'hzero-ui';
import { Modal, Row, Col, Form, TextField, DataSet, Lov } from 'choerodon-ui/pro';
import { connect } from 'dva';
import notification from 'hzero-front/lib/utils/notification';
import intl from 'hzero-front/lib/utils/intl';
import { tableScrollWidth } from 'hzero-front/lib/utils/utils';
import { TagRender } from 'hzero-front/lib/utils/renderer';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import {
  INTERFACE_STATUS_TAGS,
  SERVICE_TYPE_TAGS,
  SERVICE_CATEGORY_CONSTANT,
} from '@/constants/constants';
import { MODELER_EXE_API } from '@/constants/CodeConstants';
import { packetMappingExport, packetMappingImport } from '@/services/servicesService';
import { copyFormDS } from '@/stores/Services/detailDS';
import getLang from '@/langs/serviceLang';
import InterfaceDrawer from '../Interface';
import DocumentDrawer from '../Document';
import MaintenanceConfigDrawer from '../MaintenanceConfig';
import Search from './Search';
import InternalInterfaceModal from './InternalInterfaceModal';

const interfaceModalKey = Modal.key();

@connect(({ services }) => ({ services }))
export default class InterfaceList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      documentDrawerVisible: false,
      selectedApiRows: [],
    };
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (onRef) {
      onRef(this);
    }
  }

  defaultTableRowKey = 'interfaceId';

  @Bind()
  handleApiSelect({ record }) {
    const temp = record.toData();
    const { selectedApiRows } = this.state;
    this.setState({
      selectedApiRows: [...selectedApiRows, { ...temp }],
    });
  }

  @Bind()
  handleApiUnselect({ record }) {
    const { selectedApiRows } = this.state;
    this.setState({
      selectedApiRows: selectedApiRows.filter((temp) => temp.id !== record.get('id')),
    });
  }

  @Bind()
  handleApiSelectAll({ dataSet }) {
    this.setState({ selectedApiRows: dataSet.toData() });
  }

  @Bind()
  handleApiUnSelectAll() {
    this.setState({ selectedApiRows: [] });
  }

  /**
   * 先设置当前接口信息然后打开接口编辑弹窗
   * @param {*} [interfaceListActionRow={}]
   */
  @Bind()
  openInterfaceDrawer(interfaceListActionRow = {}) {
    const {
      match,
      type,
      tenantId,
      interfaceServerId,
      onFetchDetail,
      currentInterfaceType,
      fetchMappingClass = () => {},
      testMappingClass = () => {},
      fetchMappingClassLoading,
      testMappingClassLoading,
      operatorList,
      assertionSubjects,
      serverCode,
      namespace,
    } = this.props;
    const interfaceDrawerProps = {
      match,
      type,
      tenantId,
      serverCode,
      namespace,
      currentInterfaceType,
      interfaceListActionRow,
      interfaceServerId,
      onFetchMappingClass: fetchMappingClass,
      onTestMappingClass: testMappingClass,
      fetchMappingClassLoading,
      testMappingClassLoading,
      operatorList,
      assertionSubjects,
      onFetchDetail,
      title: intl.get('hitf.services.view.title.detailInterfaces').d('接口配置'),
    };
    Modal.open({
      title: intl.get('hitf.services.view.title.detailInterfaces').d('接口配置'),
      drawer: true,
      closable: true,
      key: interfaceModalKey,
      style: { width: 1000 },
      children: <InterfaceDrawer {...interfaceDrawerProps} />,
    });
  }

  /**
   * 打开接口文档弹窗
   * @param {object} record 接口表格行数据
   */
  @Bind()
  openDocumentDrawer(record) {
    const { dispatch } = this.props;
    dispatch({
      type: 'services/queryDetail',
      payload: record.interfaceId,
    });
    dispatch({
      type: 'services/queryDocument',
      payload: record.interfaceId,
    }).then((res) => {
      if (res) {
        dispatch({
          type: 'services/queryParams',
          payload: res.documentId,
        });
        this.setState({ documentDrawerVisible: true });
      }
    });
  }

  /**
   * 关闭接口文档弹窗
   */
  @Bind()
  closeDocumentDrawer() {
    this.setState({
      documentDrawerVisible: false,
    });
  }

  handleSaveInterface(item, cb) {
    const { onChangeState, dataSource } = this.props;
    let newDataSource = [];
    if (item.interfaceId) {
      newDataSource = dataSource.map((_item) => {
        if (_item.interfaceId === item.interfaceId) {
          return {
            ..._item,
            ...item,
          };
        }
        return _item;
      });
    } else {
      newDataSource = [{ ...item, interfaceId: uuid(), isNew: true }, ...dataSource];
    }
    onChangeState('interfaceListDataSource', newDataSource);
    // this.setState({
    //   dataSource: newDataSource,
    // });
    cb();
  }

  @Bind()
  handleDeleteService() {
    const {
      selectedRowKeys,
      dataSource,
      onRowSelectionChange,
      deleteLines,
      onChangeState,
    } = this.props;
    if (selectedRowKeys.length > 0) {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl.get('hitf.services.view.message.title.deleteContent').d('确定删除吗？'),
        onOk() {
          const ids = [];
          const newDataSource = [];
          dataSource.forEach((item) => {
            if (!item.isNew && selectedRowKeys.indexOf(item.interfaceId) >= 0) {
              ids.push(item);
            }
            if (selectedRowKeys.indexOf(item.interfaceId) < 0) {
              newDataSource.push(item);
            }
          });
          if (ids.length > 0) {
            deleteLines(ids).then((res) => {
              if (res) {
                onRowSelectionChange([], []);
                notification.success();
                onChangeState('interfaceListDataSource', newDataSource);
              }
            });
          } else {
            onRowSelectionChange([], []);
            notification.success();
            onChangeState('interfaceListDataSource', newDataSource);
          }
        },
      });
    }
  }

  @Bind()
  openMaintenanceConfigDrawer(record) {
    const { interfaceId } = record;
    const drawerProps = {
      interfaceId,
    };
    Modal.open({
      title: getLang('MAINTAIN_CONFIG'),
      drawer: true,
      okText: getLang('SAVE'),
      children: <MaintenanceConfigDrawer {...drawerProps} />,
    });
  }

  /**
   * 打开新建内部接口弹窗
   */
  @Bind()
  openInnerFaceModal() {
    const { interfaceServerId, tenantId, saveBatchInterfaces = () => {} } = this.props;
    const modalProps = {
      tenantId,
      interfaceServerId,
      onSave: saveBatchInterfaces,
    };
    Modal.open({
      title: getLang('INTERNAL_INTERFACE'),
      style: { width: 1000 },
      children: <InternalInterfaceModal {...modalProps} />,
    });
  }

  /**
   * 数据源：批量创建接口
   */
  @Bind()
  handleBachCreateDSInterface() {
    const { selectedApiRows } = this.state;
    const { saveBatchInterfaces = () => {} } = this.props;
    if (isEmpty(selectedApiRows)) {
      notification.error({
        message: getLang('AT_LEAST'),
      });
      return false;
    }
    saveBatchInterfaces(selectedApiRows, () => {});
    this.setState({ selectedApiRows: [] });
  }

  openCopyModal(record) {
    const { interfaceId, interfaceCode } = record;
    this.copyFormDS = new DataSet(copyFormDS());
    this.copyFormDS.create({
      interfaceId,
      interfaceCode,
    });
    Modal.open({
      title: intl.get('hitf.services.view.button.copy').d('克隆'),
      children: (
        <Form dataSet={this.copyFormDS}>
          <TextField name="interfaceCode" />
        </Form>
      ),
      onOk: this.handleCopyInterface,
    });
  }

  /**
   * 复制接口
   */
  @Bind()
  async handleCopyInterface() {
    const validate = await this.copyFormDS.validate();
    if (!validate) {
      notification.error({
        message: intl.get('hitf.services.view.message.validate').d('请先完善必输内容'),
      });
      return false;
    }
    const res = await this.copyFormDS.submit();
    if (!isUndefined(res)) {
      this.props.onFetchDetail();
    }
    return true;
  }

  // 导出映射配置
  @Bind()
  handleMappingExport(record, level) {
    packetMappingExport({
      interfaceId: record.interfaceId,
      level,
    }).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      }
    });
  }

  // 导入映射配置
  @Bind()
  handleMappingImport(record, file) {
    packetMappingImport({
      file,
      interfaceId: record.interfaceId,
    }).then((res) => {
      if (res && res.failed) {
        notification.error({
          message: res.message,
        });
      }
      if (!res || (res && !res.failed)) {
        notification.success();
      }
    });
  }

  handleCell(_this, length, needUpdate = false) {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: length,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        lineHeight: '20px',
      },
      onClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
        if (needUpdate) {
          _this.forceUpdate();
        }
      },
    };
  }

  render() {
    const {
      serviceTypes,
      interfaceStatus,
      pagination,
      selectedRowKeys = [],
      onChange = (e) => e,
      onRowSelectionChange = (e) => e,
      processing = {},
      dataSource,
      authenticationData = {},
      namespace,
      serverCode,
      isNew,
      currentInterfaceType,
      saveBatchInterfacesLoading,
      tenantId,
      onFetchDetail = () => {},
      match: { path },
      isHistory,
      interfaceServerId,
      showModelerField,
      type,
    } = this.props;
    const { documentDrawerVisible } = this.state;
    // const organizationRoleLevel = isTenantRoleLevel();
    const { COMPOSITE, DS } = SERVICE_CATEGORY_CONSTANT;
    const documentDrawerProps = {
      namespace,
      serverCode,
      authenticationData,
      tenantId,
      currentInterfaceType,
      hiddenRequestMethodOption: currentInterfaceType !== DS,
      visible: documentDrawerVisible,
      onCancel: this.closeDocumentDrawer,
      type,
    };
    const tableColumns = [
      {
        title: intl.get('hitf.services.model.services.interfaceCode').d('接口编码'),
        dataIndex: 'interfaceCode',
        width: 160,
      },
      {
        title: intl.get('hitf.services.model.services.interfaceName').d('接口名称'),
        dataIndex: 'interfaceName',
        width: 180,
      },
      {
        title: intl.get('hitf.services.model.services.interfaceUrl').d('接口地址'),
        dataIndex: 'interfaceUrl',
        width: 180,
        onCell: () => this.handleCell(this, 200, true),
      },
      {
        title: intl.get('hitf.services.model.services.publishType').d('发布类型'),
        align: 'center',
        dataIndex: 'publishTypeMeaning',
        render: (text, record) => {
          return TagRender(record.publishType, SERVICE_TYPE_TAGS, text);
        },
        width: 120,
      },
      {
        title: intl.get('hitf.services.model.services.publishUrl').d('发布地址'),
        dataIndex: 'publishUrl',
        onCell: () => this.handleCell(this, 200, true),
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        align: 'center',
        render: (text, record) => {
          return TagRender(record.status, INTERFACE_STATUS_TAGS, text);
        },
        dataIndex: 'statusMeaning',
        width: 100,
      },
      {
        title: intl.get('hitf.services.view.message.current.version').d('当前版本'),
        dataIndex: 'formatVersion',
        width: 100,
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 280,
        fixed: 'right',
        render: (text, record) => {
          const menu = (
            <Menu>
              {currentInterfaceType !== COMPOSITE && (
                <Menu.Item key="maintenanceConfig">
                  <a disabled={isHistory} onClick={() => this.openMaintenanceConfigDrawer(record)}>
                    {intl.get('hitf.services.view.button.operationalConfig').d('运维配置')}
                  </a>
                </Menu.Item>
              )}
              <Menu.SubMenu
                title={intl.get('hitf.services.view.button.mappingExport').d('导出映射')}
              >
                <Menu.Item>
                  <a onClick={() => this.handleMappingExport(record, 'REQUEST')}>
                    {intl.get('hitf.services.view.button.mappingExportReq').d('导出请求映射')}
                  </a>
                </Menu.Item>
                <Menu.Item>
                  <a onClick={() => this.handleMappingExport(record, 'RESPONSE')}>
                    {intl.get('hitf.services.view.button.mappingExportResp').d('导出响应映射')}
                  </a>
                </Menu.Item>
                <Menu.Item>
                  <a onClick={() => this.handleMappingExport(record)}>
                    {intl.get('hitf.services.view.button.mappingExportAll').d('导出所有映射')}
                  </a>
                </Menu.Item>
              </Menu.SubMenu>
              <Menu.Item key="mappingImport">
                <Upload
                  name="file"
                  accept="application/json"
                  showUploadList={false}
                  customRequest={({ file }) => this.handleMappingImport(record, file)}
                >
                  {intl.get('hitf.services.view.button.mappingImport').d('导入映射')}
                </Upload>
              </Menu.Item>
            </Menu>
          );
          return (
            <span className="action-link">
              {
                <span title={intl.get('hzero.common.edit').d('编辑')} key="edit" placement="top">
                  <a
                    className="edit"
                    disabled={isHistory}
                    onClick={() => this.openInterfaceDrawer(record)}
                  >
                    {intl.get('hzero.common.edit').d('编辑')}
                  </a>
                </span>
              }
              {currentInterfaceType !== COMPOSITE && (
                <span
                  title={intl.get('hitf.services.view.button.copy').d('克隆')}
                  key="copy"
                  placement="top"
                >
                  <a
                    className="copy"
                    disabled={isHistory}
                    onClick={() => this.openCopyModal(record)}
                  >
                    {intl.get('hitf.services.view.button.copy').d('克隆')}
                  </a>
                </span>
              )}
              {
                <span
                  title={intl.get('hitf.services.view.button.document').d('编辑接口文档')}
                  key="editDocument"
                  placement="top"
                >
                  <a
                    className="edit"
                    disabled={isHistory}
                    onClick={() => this.openDocumentDrawer(record)}
                  >
                    {intl.get('hitf.services.view.button.document').d('编辑接口文档')}
                  </a>
                </span>
              }
              {currentInterfaceType === COMPOSITE && (
                <span
                  title={intl.get('hitf.services.view.button.operationalConfig').d('运维配置')}
                  key="maintenanceConfig"
                  placement="top"
                >
                  <a
                    className="edit"
                    disabled={isHistory}
                    onClick={() => this.openMaintenanceConfigDrawer(record)}
                  >
                    {intl.get('hitf.services.view.button.operationalConfig').d('运维配置')}
                  </a>
                </span>
              )}
              <Dropdown overlay={menu}>
                <a className="action-link-operation">
                  {intl.get('hzero.common.button.action').d('操作')}
                  <Icon type="down" />
                </a>
              </Dropdown>
            </span>
          );
        },
      },
    ];
    const tableProps = {
      dataSource,
      pagination,
      onChange,
      bordered: true,
      rowKey: this.defaultTableRowKey,
      loading: processing.fetchInterfaceList,
      columns: tableColumns,
      scroll: { x: tableScrollWidth(tableColumns) },
      rowSelection: {
        selectedRowKeys,
        onChange: onRowSelectionChange,
      },
    };

    const searchProps = {
      serviceTypes,
      interfaceStatus,
      onSearch: onFetchDetail,
      onRef: (ref) => {
        this.searchForm = ref;
      },
    };

    const lovBtnDS = new DataSet({
      fields: [
        {
          name: 'api',
          type: 'object',
          multiple: true,
          lovCode: MODELER_EXE_API,
          lovQueryUrl: (_code, config) => {
            const { originData = {} } = config;
            const { queryUrl } = originData;
            const temp = queryUrl.replace('{interfaceServerId}', interfaceServerId);
            return temp;
          },
          optionsProps: {
            events: {
              select: this.handleApiSelect,
              unSelect: this.handleApiUnselect,
              selectAll: this.handleApiSelectAll,
              unSelectAll: this.handleApiUnSelectAll,
            },
          },
        },
      ],
    });

    return (
      <>
        <Row>
          <Col span={20}>{!isNew && <Search {...searchProps} />}</Col>
          <Col span={4}>
            {!isNew && currentInterfaceType !== COMPOSITE && (
              <div style={{ textAlign: 'right' }}>
                <ButtonPermission
                  icon="delete"
                  permissionList={[
                    {
                      code: `${path}.button.deleteLine`,
                      type: 'button',
                      meaning: '服务注册-接口配置删除',
                    },
                  ]}
                  type="c7n-pro"
                  disabled={isEmpty(selectedRowKeys) || isHistory}
                  onClick={this.handleDeleteService}
                  style={{ marginRight: 8 }}
                  loading={processing.deleteLinesLoading}
                >
                  {intl.get('hzero.common.button.delete').d('删除')}
                </ButtonPermission>
                {!showModelerField && (
                  <ButtonPermission
                    icon="add"
                    permissionList={[
                      {
                        code: `${path}.button.createLine`,
                        type: 'button',
                        meaning: '服务注册-接口配置新建',
                      },
                    ]}
                    type="c7n-pro"
                    color="primary"
                    onClick={
                      currentInterfaceType === 'INTERNAL'
                        ? this.openInnerFaceModal
                        : () => this.openInterfaceDrawer({})
                    }
                    disabled={isNew || isHistory}
                  >
                    {intl.get('hzero.common.create').d('新建')}
                  </ButtonPermission>
                )}
                {showModelerField && !isHistory && (
                  <Lov
                    noCache
                    name="api"
                    mode="button"
                    icon="add"
                    color="primary"
                    loading={saveBatchInterfacesLoading}
                    clearButton={false}
                    dataSet={lovBtnDS}
                    modalProps={{
                      onOk: this.handleBachCreateDSInterface,
                    }}
                  >
                    {intl.get('hzero.common.create').d('新建')}
                  </Lov>
                )}
              </div>
            )}
          </Col>
        </Row>
        <Table {...tableProps} />
        <DocumentDrawer {...documentDrawerProps} />
      </>
    );
  }
}
