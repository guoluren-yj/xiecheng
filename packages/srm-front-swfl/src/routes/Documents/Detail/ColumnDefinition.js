import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import { Modal, Form, Table, Card, Popconfirm, Button } from 'hzero-ui';
import { isUndefined } from 'lodash';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId, isTenantRoleLevel } from 'utils/utils';
import { DETAIL_CARD_TABLE_CLASSNAME } from 'utils/constants';
import { operatorRender } from 'utils/renderer';
import notification from 'utils/notification';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import ColumnConditionDrawer from './ColumnConditionDrawer';
import ColumnApprovalDrawer from './ColumnApprovalDrawer';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
@connect(({ documents, loading }) => ({
  documents,
  isSiteFlag: !isTenantRoleLevel(),
  currentOrganizationId: getCurrentOrganizationId(),
  savingLoading: loading.effects['documents/handleSaveApprovalGroupField'],
}))
@formatterCollections({ code: ['hwfp.documents', 'hwfp.common'] })
export default class ColumnDefinition extends Component {
  state = {
    columnConditionDrawerVisible: false,
    columnApprovalDrawerVisible: false,
    columnARecord: {},
    columnCRecord: {},
    conditionFieldList: [],
    approvalGroupFieldList: [],
    currentApprovalCode: 1,
  };

  /**
   * 组件属性定义
   */
  static propTypes = {
    anchor: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
    title: PropTypes.string,
    visible: PropTypes.bool,
    onHandleOk: PropTypes.func,
    onCancel: PropTypes.func,
  };

  /**
   * 组件属性默认值设置
   */
  static defaultProps = {
    anchor: 'right',
    title: '',
    visible: false,
    onHandleOk: (e) => e,
    onCancel: (e) => e,
  };

  @Bind()
  getApprovalColumns(type) {
    const { isSiteFlag } = this.props;
    if (isSiteFlag) {
      return [
        {
          title: intl.get('hwfp.common.model.common.fieldCode').d('字段编码'),
          dataIndex: 'fieldCode',
          width: 300,
          render: (val, record, index) => (
            <span>
              {type === 'conditionField' ? <span>{val}</span> : <span>#{index + 1}</span>}
            </span>
          ),
        },
        {
          title: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
          width: 300,
          dataIndex: 'fieldName',
        },
        {
          title: intl.get('hwfp.common.model.categories.variableType').d('字段类型'),
          minWidth: 300,
          dataIndex: 'fieldComponentTypeMeaning',
        },
        {
          title: intl.get('hwfp.documents.model.documents.lovCode').d('来源值集'),
          width: 300,
          dataIndex: 'lovCode',
        },
      ];
    }
    const outputColumn =
      type === 'conditionField'
        ? []
        : [
            {
              title: intl.get('hwfp.common.model.common.outputType').d('输出类型'),
              width: 200,
              dataIndex: 'outputTypeMeaning',
            },
          ];
    return [
      {
        title: intl.get('hwfp.common.model.common.fieldCode').d('字段编码'),
        dataIndex: 'fieldCode',
        width: 180,
        render: (val, record, index) => (
          <span>{type === 'conditionField' ? <span>{val}</span> : <span>#{index + 1}</span>}</span>
        ),
      },
      {
        title: intl.get('hwfp.common.model.common.variableName').d('字段名称'),
        width: 200,
        dataIndex: 'fieldName',
      },
      ...outputColumn,
      {
        title: intl.get('hwfp.common.model.categories.variableType').d('字段类型'),
        width: 200,
        dataIndex: 'fieldComponentTypeMeaning',
      },
      {
        title: intl.get('hwfp.documents.model.documents.lovCode').d('来源值集'),
        minWidth: 220,
        dataIndex: 'lovCode',
      },
      {
        title: intl.get('hzero.common.button.action').d('操作'),
        dataIndex: 'option',
        fixed: 'right',
        width: 130,
        render: (val, record, index) => {
          const { editFlag } = record;
          const operators = [
            {
              key: 'edit',
              ele: (
                <a
                  onClick={() => {
                    if (type === 'conditionField') {
                      this.handleConditionEdit(record);
                    } else {
                      this.handleApprovalEdit(index, record);
                    }
                  }}
                  // disabled={!editFlag}
                >
                  {intl.get('hzero.common.button.edit').d('编辑')}
                </a>
              ),
              len: 2,
              title: intl.get('hzero.common.button.edit').d('编辑'),
            },
            {
              key: 'delete',
              ele: (
                <Popconfirm
                  placement="topRight"
                  title={intl.get('hzero.common.message.confirm.delete').d('是否删除此条记录？')}
                  onConfirm={() => this.handleDelete(record)}
                >
                  <a disabled={!editFlag}>{intl.get('hzero.common.button.delete').d('删除')}</a>
                </Popconfirm>
              ),
              len: 2,
              title: intl.get('hzero.common.button.delete').d('删除'),
            },
          ];
          return operatorRender(operators, record);
        },
      },
    ];
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch() {
    this.fetchApprovalFieldList();
    this.fetchConditionFieldList();
  }

  @Bind()
  fetchApprovalFieldList() {
    const {
      dispatch,
      itemData: { id },
      isSiteFlag,
      headerTenantId,
    } = this.props;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchApprovalGroupFieldList',
        payload: isSiteFlag
          ? {
              defId: id,
              columnType: 'OUTPUT',
              tenantId: headerTenantId,
            }
          : {
              defId: id,
              columnType: 'OUTPUT',
            },
      }).then((res) => {
        if (res) {
          this.setState({
            approvalGroupFieldList: res || [],
          });
        }
      });
    }
  }

  @Bind()
  fetchConditionFieldList() {
    const {
      dispatch,
      itemData: { id },
      isSiteFlag,
      headerTenantId,
    } = this.props;
    if (!isUndefined(id)) {
      dispatch({
        type: 'documents/fetchApprovalGroupFieldList',
        payload: isSiteFlag
          ? {
              defId: id,
              columnType: 'INPUT',
              tenantId: headerTenantId,
            }
          : {
              defId: id,
              columnType: 'INPUT',
            },
      }).then((res) => {
        if (res) {
          this.setState({
            conditionFieldList: res || [],
          });
        }
      });
    }
  }

  @Bind()
  handleApprovalEdit(index, record) {
    this.setState({
      columnApprovalDrawerVisible: true,
      columnARecord: record,
      currentApprovalCode: index + 1,
    });
  }

  @Bind()
  handleApprovalAdd() {
    this.setState({
      columnApprovalDrawerVisible: true,
      columnARecord: {},
      currentApprovalCode: this.state.approvalGroupFieldList.length + 1,
    });
  }

  @Bind()
  handleCancelApprovalDrawer() {
    this.setState({
      columnApprovalDrawerVisible: false,
      columnARecord: {},
    });
  }

  @Bind()
  handleConditionEdit(record) {
    this.setState({
      columnConditionDrawerVisible: true,
      columnCRecord: record,
    });
  }

  @Bind()
  handleConditionAdd() {
    this.setState({
      columnConditionDrawerVisible: true,
      columnCRecord: {},
    });
  }

  @Bind()
  handleCancelConditionDrawer() {
    this.setState({
      columnConditionDrawerVisible: false,
      columnCRecord: {},
    });
  }

  @Bind()
  handleSave(values) {
    const {
      dispatch,
      itemData: { id },
      currentOrganizationId,
    } = this.props;
    dispatch({
      type: 'documents/handleSaveApprovalGroupField',
      payload: {
        recordData: { ...values, defId: id, tenantId: currentOrganizationId },
      },
    }).then((res) => {
      if (res) {
        this.fetchApprovalFieldList();
        this.fetchConditionFieldList();
        notification.success();
        this.handleCancelApprovalDrawer();
        this.handleCancelConditionDrawer();
      }
    });
  }

  @Bind()
  handleDelete(values) {
    const {
      dispatch,
      itemData: { id },
    } = this.props;
    dispatch({
      type: 'documents/deleteApprovalGroupField',
      payload: {
        recordData: {
          ...values,
          defId: id,
        },
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.fetchConditionFieldList();
        this.fetchApprovalFieldList();
      }
    });
  }

  render() {
    const {
      dispatch,
      anchor,
      visible,
      title,
      itemData,
      headerTenantId,
      enumMap,
      onCancel,
      customizeField,
      loading = false,
      paramsLoading = false,
      id: documentId,
      currentOrganizationId,
      isSiteFlag,
      savingLoading,
    } = this.props;
    const {
      columnConditionDrawerVisible,
      columnApprovalDrawerVisible,
      columnARecord,
      columnCRecord,
      conditionFieldList,
      approvalGroupFieldList,
      currentApprovalCode,
    } = this.state;
    const columnConditionDrawerProps = {
      documentId,
      currentOrganizationId,
      dispatch,
      enumMap,
      customizeField,
      headerTenantId,
      loading: savingLoading,
      anchor: 'right',
      visible: columnConditionDrawerVisible,
      itemData: columnCRecord,
      onHandleOk: this.handleSave,
      onCancel: this.handleCancelConditionDrawer,
    };
    const columnApprovalDrawerProps = {
      documentId,
      currentOrganizationId,
      dispatch,
      enumMap,
      customizeField,
      headerTenantId,
      loading: savingLoading,
      anchor: 'right',
      visible: columnApprovalDrawerVisible,
      itemData: columnARecord,
      approvalListNum: currentApprovalCode,
      onHandleOk: this.handleSave,
      onCancel: this.handleCancelApprovalDrawer,
    };
    const thisTitle = `${itemData.defName || ''}-${title}`;
    return (
      <Modal
        okButtonProps={{ loading }}
        title={thisTitle}
        width="60vw"
        zIndex={850}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
        visible={visible}
        footer={
          <div style={{ float: 'left' }}>
            <Button onClick={() => onCancel()}>
              {intl.get('hwfp.common.model.apply.cancel').d('取消')}
            </Button>
          </div>
        }
        onCancel={onCancel}
        destroyOnClose
      >
        <Card
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          title={<h3>{intl.get('hwfp.documents.card.title.conditionField').d('条件字段定义')}</h3>}
        >
          {!isSiteFlag && (
            <div
              style={{ width: '100%', height: 28, position: 'relative' }}
              className={styles['button-margin-bottom']}
            >
              <Button
                style={{ position: 'absolute', right: 0 }}
                onClick={() => this.handleConditionAdd()}
              >
                {intl.get('hwfp.documents.view.button.add').d('新增')}
              </Button>
            </div>
          )}
          <Table
            bordered
            loading={paramsLoading}
            rowKey="parameterId"
            dataSource={conditionFieldList}
            columns={this.getApprovalColumns('conditionField')}
            pagination={false}
          />
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_TABLE_CLASSNAME}
          title={
            <h3>{intl.get('hwfp.documents.card.title.approvalGroupField').d('审批组字段定义')}</h3>
          }
        >
          {!isSiteFlag && (
            <div
              style={{ width: '100%', height: 28, position: 'relative' }}
              className={styles['button-margin-bottom']}
            >
              <Button
                style={{ position: 'absolute', right: 0 }}
                onClick={() => this.handleApprovalAdd()}
              >
                {intl.get('hwfp.documents.view.button.add').d('新增')}
              </Button>
            </div>
          )}
          <Table
            bordered
            loading={paramsLoading}
            rowKey="parameterId"
            dataSource={approvalGroupFieldList}
            columns={this.getApprovalColumns('approvalGroupField')}
            pagination={false}
          />
        </Card>
        {columnConditionDrawerVisible && <ColumnConditionDrawer {...columnConditionDrawerProps} />}
        {columnApprovalDrawerVisible && <ColumnApprovalDrawer {...columnApprovalDrawerProps} />}
      </Modal>
    );
  }
}
