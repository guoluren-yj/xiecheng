import React, { Fragment } from 'react';
import { Table, Modal, Alert } from 'hzero-ui';
import { Button } from 'components/Permission';
import { isFunction, map, omit, isEmpty, isNil } from 'lodash';
import queryString from 'querystring';
// import Upload from 'components/Upload';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import intl from 'utils/intl';
import { openTab } from 'utils/menuTab';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';
import { yesOrNoRender } from 'utils/renderer';

import UploadModal from '@/routes/components/UploadModal';
import { getWidthFromWord } from '../utils';
import { getComponentProps } from '../ComposeForm/utils';

/**
 * 获取计算得来的属性(且耗时多)
 * @param {Object} props
 */
function getNoEditableComputeTableProps(props) {
  const { fields, context } = props;
  // let index = 0;
  let columnsWidth = 0;
  const columns = map(fields, field => {
    // const required = field.requiredFlag !== 0;
    const columnWidth = getWidthFromWord({
      word: field.fieldDescription,
      minWidth: 80,
      fontWidth: 14,
      defaultWidth: 100,
      paddingWidth: 36,
    });
    columnsWidth += columnWidth;
    const column = {
      dataIndex: ['ValueList', 'Lov', 'Cascader'].includes(field.componentType)
        ? `${field.fieldCode}Meaning`
        : field.fieldCode,
      title: field.fieldDescription,
      width: columnWidth,
    };
    if (field.componentType === 'Checkbox' || field.componentType === 'Switch') {
      column.render = item => {
        return !isNil(item) ? yesOrNoRender(+item) : '';
      };
    } else if (field.componentType === 'Upload') {
      const uploadProps = getComponentProps({
        field,
        componentType: 'Upload',
        context,
      });
      column.render = (item, record) => {
        if (uploadProps.isAttachmentUrl) {
          return (
            <UploadModal
              {...uploadProps}
              attachment={item || []}
              isViewOnly
              attachmentTotal={record.fileCount}
            />
          );
        } else {
          return item && <Upload {...uploadProps} viewOnly attachmentUUID={item} filePreview />;
        }
      };
    }
    return column;
  });
  return {
    scroll: { x: columnsWidth + 160 }, // 160 = checkbox宽度 + 操作列宽度
    columns,
  };
}

function getNoComputeTableProps(props) {
  const { rowKey = 'id', dataSource = [], pagination = {} } = props;
  return {
    rowKey,
    dataSource,
    pagination,
  };
}
const omitProps = [
  'addable',
  'removable',
  'saveable',
  'editable',
  'fields',
  'onRef',
  'onGetValidateDataSourceHook',
  'fieldLabelWidth',
  'onRowEdit',
  'onAdd',
  'onRemove',
  'onSave',
  'onRowSelectionChange',
  'configName',
  'onTableChange',
];

export default class BaseComposeTable extends React.PureComponent {
  state = {
    prevState: {},
    computeTableProps: {},
  };

  static getDerivedStateFromProps(nextProps, prevState) {
    const nextState = {
      prevState: prevState.prevState,
      computeTableProps: prevState.computeTableProps,
    };
    const {
      fields,
      editable,
      addable,
      removable,
      saveable,
      getComputeTableProps = getNoEditableComputeTableProps,
    } = nextProps;
    const {
      fields: prevFields,
      editable: prevEditable,
      addable: prevAddable,
      removable: prevRemovable,
      saveable: prevSaveable,
    } = prevState.prevState;
    if (
      fields !== prevFields ||
      addable !== prevAddable ||
      editable !== prevEditable ||
      removable !== prevRemovable ||
      saveable !== prevSaveable
    ) {
      nextState.computeTableProps = getComputeTableProps(nextProps);
      nextState.prevState.fields = fields;
      nextState.prevState.editable = editable;
      nextState.prevState.addable = addable;
      nextState.prevState.removable = removable;
      nextState.prevState.saveable = saveable;
    }
    nextState.noComputeTableProps = getNoComputeTableProps(nextProps);
    return nextState;
  }

  constructor(props) {
    super(props);
    this.handleBtnAddClick = this.handleBtnAddClick.bind(this);
    this.handleBtnRemoveClick = this.handleBtnRemoveClick.bind(this);
    this.handleBtnSaveClick = this.handleBtnSaveClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleBatchImport = this.handleBatchImport.bind(this);
  }

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
  }

  handleBtnAddClick() {
    const { onAdd } = this.props;
    if (isFunction(onAdd)) {
      onAdd();
    }
  }

  handleBtnSaveClick() {
    const { onSave } = this.props;
    if (isFunction(onSave)) {
      onSave();
    }
  }

  handleBtnRemoveClick() {
    const { onRemove, configName } = this.props;
    if (isFunction(onRemove)) {
      onRemove(configName);
    }
  }

  handleChange(page, configName) {
    const { dataSource = [], onTableChange = e => e } = this.props;
    const isEdit = dataSource.find(n => n.isCreate);
    if (isEdit) {
      Modal.confirm({
        title: intl
          .get('sslm.common.view.message.continueConfirm')
          .d('有数据未保存，翻页会导致数据丢失，是否继续？'),
        onOk: () => onTableChange(page, configName),
      });
    } else {
      onTableChange(page, configName);
    }
  }

  /**
   * 批量导入
   */
  handleBatchImport() {
    const { investgHeaderId, organizationId, isPub } = this.props;
    openTab({
      key: `${
        isPub ? '/pub' : ''
      }/sslm/investigation-write/comment-import/SSLM.INVESTG_EQUIPMENT_IMPORT`,
      title: intl.get('hzero.common.title.batchImport').d('批量导入'),
      search: queryString.stringify({
        action: intl.get('hzero.common.title.batchImport').d('批量导入'),
        args: JSON.stringify({ investgHeaderId, tenantId: organizationId }),
      }),
    });
  }

  render() {
    const { computeTableProps = {}, noComputeTableProps = {} } = this.state;
    const {
      removable,
      addable,
      editable,
      saveable,
      isImport = false,
      onRowSelectionChange,
      selectedRowKeys = [],
      rowKey,
      configName,
      templateData = {},
      investgHeaderId,
      organizationId,
      onTableChange = e => e,
      referenceRangeMessage,
      _status,
      loading,
      investgRemote,
      allowDeleteAllLineFlag = true,
    } = this.props;
    const { remark = '' } = templateData;
    const otherProps = omit(this.props, omitProps);
    let newRowSelection = null;
    const buttons = [];
    if (rowKey === 'investgEquipmentId') {
      if (isImport) {
        buttons.push(
          <Button
            type="c7n-pro"
            onClick={this.handleBatchImport}
            permissionList={[
              {
                code: `srm.partner.investigation-po.investigatation-write.ps.import.old`,
                type: 'button',
                meaning: '调查表填写设备信息-批量导入',
              },
            ]}
          >
            {intl.get('hzero.common.title.batchImport').d('批量导入')}
          </Button>
        );
        buttons.push(
          <CommonImport
            businessObjectTemplateCode="SSLM.INVESTG_EQUIPMENT_IMPORT"
            prefixPatch={SRM_SSLM}
            refreshButton
            tenantId={organizationId}
            buttonText={intl.get('hzero.common.button.newBatchImport').d('(新)批量导入')}
            buttonProps={{
              icon: '',
              permissionList: [
                {
                  code: 'srm.partner.investigation-po.investigatation-write.ps.import.model',
                  type: 'button',
                  meaning: '调查表填写设备信息-批量导入',
                },
              ],
            }}
            args={{ investgHeaderId, tenantId: organizationId }}
            successCallBack={() => {
              onTableChange({}, configName);
            }}
          />
        );
      }
    }
    if (saveable) {
      buttons.push(
        <Button key="save" type="c7n-pro" loading={loading} onClick={this.handleBtnSaveClick}>
          {intl.get('hzero.common.button.save').d('保存')}
        </Button>
      );
    }
    if (removable) {
      // 附件信息Tab
      if (rowKey === 'investgAttachmentId') {
        buttons.push(
          <Button
            key="remove"
            type="c7n-pro"
            loading={loading}
            onClick={this.handleBtnRemoveClick}
            disabled={selectedRowKeys.length === 0}
            permissionList={[
              {
                code: 'srm.partner.investigation-po.investigatation-write.ps.attachment.delete',
                type: 'button',
                meaning: '调查表填写附件删除',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        );
      } else if (rowKey === 'investgProserviceId') {
        // 产品及服务Tab
        buttons.push(
          <Button
            key="remove"
            type="c7n-pro"
            loading={loading}
            onClick={this.handleBtnRemoveClick}
            disabled={selectedRowKeys.length === 0}
            permissionList={[
              {
                code: 'srm.partner.investigation-po.investigatation-write.ps.productservice.delete',
                type: 'button',
                meaning: '调查表填写产品及服务删除',
              },
            ]}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        );
      } else {
        buttons.push(
          <Button
            key="remove"
            type="c7n-pro"
            loading={loading}
            onClick={this.handleBtnRemoveClick}
            disabled={selectedRowKeys.length === 0}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        );
      }
      newRowSelection = {
        selectedRowKeys,
        onChange: onRowSelectionChange,
        getCheckboxProps: record => {
          const needDisabled =
            ['sslmInvestgContact', 'sslmInvestgAddress', 'sslmInvestgBankAccount'].includes(
              configName
            ) && !allowDeleteAllLineFlag;
          const { mainDataFlag } = record || {};
          return {
            disabled:
              (needDisabled ? !!mainDataFlag : false) || Boolean(record.extSourceAccountFlag),
          };
        },
      };
    }
    if (addable) {
      if (rowKey === 'investgAttachmentId') {
        buttons.push(
          <Button
            key="add"
            type="c7n-pro"
            color="primary"
            loading={loading}
            onClick={this.handleBtnAddClick}
            permissionList={[
              {
                code: 'srm.partner.investigation-po.investigatation-write.ps.attachment.add',
                type: 'button',
                meaning: '调查表填写附件新增',
              },
            ]}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
      } else if (rowKey === 'investgProserviceId') {
        // 产品及服务Tab
        buttons.push(
          <Button
            key="add"
            type="c7n-pro"
            color="primary"
            loading={loading}
            onClick={this.handleBtnAddClick}
            permissionList={[
              {
                code: 'srm.partner.investigation-po.investigatation-write.ps.productservice.create',
                type: 'button',
                meaning: '调查表填写产品及服务新增',
              },
            ]}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
      } else {
        buttons.push(
          <Button
            key="add"
            type="c7n-pro"
            color="primary"
            loading={loading}
            onClick={this.handleBtnAddClick}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
      }
    }
    if (Object.keys(computeTableProps).includes('columns')) {
      computeTableProps.columns = computeTableProps.columns.map(item => {
        const items = item;
        if (item.dataIndex === 'attachment') {
          items.width = 130;
          items.render = (_, record) => (
            <UploadModal
              isViewOnly
              record={record}
              fieldCode={item.dataIndex}
              attachmentTotal={record.fileCount}
            />
          );
        }
        return items;
      });
    }
    const rowSelection = investgRemote
      ? investgRemote.process('SSLM_OLD_INVESTIGATION_TABLE_ROW_SELECTION', newRowSelection, {
          _this: this,
        })
      : newRowSelection;

    return (
      <Fragment key="base-compose-table">
        {buttons.length > 0 && (
          <div key="base-compose-table-options" style={{ marginBottom: 16, textAlign: 'right' }}>
            {buttons}
          </div>
        )}
        {remark && <Alert showIcon message={remark} type="info" style={{ marginBottom: 8 }} />}
        {!isEmpty(referenceRangeMessage) && !editable && (
          <Alert
            showIcon
            type={_status === 'approval' ? 'error' : 'info'}
            style={{ marginBottom: 16 }}
            message={
              <Fragment>
                {referenceRangeMessage.map(n => (
                  <div>{n}</div>
                ))}
              </Fragment>
            }
          />
        )}
        <Table
          bordered
          key="base-compose-table-table"
          {...otherProps}
          {...noComputeTableProps}
          {...computeTableProps}
          rowSelection={rowSelection}
          onChange={page => this.handleChange(page, configName)}
        />
      </Fragment>
    );
  }
}
