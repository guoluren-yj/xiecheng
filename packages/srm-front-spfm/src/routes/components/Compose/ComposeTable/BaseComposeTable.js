import React, { Fragment } from 'react';
import { Table, Alert } from 'hzero-ui';
import { isFunction, map, omit, isEmpty } from 'lodash';
import { Button } from 'components/Permission';
// import Upload from 'components/Upload';
import Upload from 'srm-front-boot/lib/components/Upload/index';
import intl from 'utils/intl';
import CommonImport from 'components/Import';
import { SRM_SSLM } from '_utils/config';
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
  const columns = map(fields, (field) => {
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
      column.render = (item) => {
        return +item === 1
          ? intl.get('hzero.common.status.yes').d('是')
          : intl.get('hzero.common.status.no').d('否');
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
              record={record}
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
  const { rowKey = 'id', dataSource = [] } = props;
  return {
    rowKey,
    dataSource,
  };
}
const omitProps = [
  'addable',
  'removable',
  'editable',
  'fields',
  'onRef',
  'onGetValidateDataSourceHook',
  'fieldLabelWidth',
  'onRowEdit',
  'onAdd',
  'onRemove',
  'onRowSelectionChange',
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
      getComputeTableProps = getNoEditableComputeTableProps,
    } = nextProps;
    const {
      fields: prevFields,
      editable: prevEditable,
      addable: prevAddable,
      removable: prevRemovable,
    } = prevState.prevState;
    if (
      fields !== prevFields ||
      addable !== prevAddable ||
      editable !== prevEditable ||
      removable !== prevRemovable
    ) {
      nextState.computeTableProps = getComputeTableProps(nextProps);
      nextState.prevState.fields = fields;
      nextState.prevState.editable = editable;
      nextState.prevState.addable = addable;
      nextState.prevState.removable = removable;
    }
    nextState.noComputeTableProps = getNoComputeTableProps(nextProps);
    return nextState;
  }

  constructor(props) {
    super(props);
    this.handleBtnAddClick = this.handleBtnAddClick.bind(this);
    this.handleBtnRemoveClick = this.handleBtnRemoveClick.bind(this);
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

  handleBtnRemoveClick() {
    const { onRemove } = this.props;
    if (isFunction(onRemove)) {
      onRemove();
    }
  }

  render() {
    const { computeTableProps = {}, noComputeTableProps = {} } = this.state;
    const {
      remote,
      removable,
      addable,
      editable,
      importable,
      onRowSelectionChange,
      selectedRowKeys = [],
      templateData = {},
      referenceRangeMessage,
      rowKey,
      investgHeaderId,
      onTableChange,
      organizationId,
      configName,
      loading = false,
      purchaserTenantNum,
    } = this.props;
    const { remark = '' } = templateData;
    const otherProps = omit(this.props, omitProps);
    let rowSelection = null;
    const buttons = [];
    if (rowKey === 'investgEquipmentId') {
      if (importable) {
        buttons.push(
          <CommonImport
            businessObjectTemplateCode="SSLM.INVESTG_EQUIPMENT_IMPORT"
            prefixPatch={SRM_SSLM}
            tenantId={organizationId}
            refreshButton
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
              onTableChange(configName);
            }}
          />
        );
      }
    }
    if (removable) {
      // 附件信息Tab
      if (rowKey === 'investgAttachmentId') {
        buttons.push(
          <Button
            key="remove"
            onClick={this.handleBtnRemoveClick}
            disabled={selectedRowKeys.length === 0}
            loading={loading}
            permissionList={[
              {
                code: 'srm.partner.my-partner.invitation-list.api.ps.investg-attachment-delete',
                type: 'button',
                meaning: '调查表填写附件删除',
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
            onClick={this.handleBtnRemoveClick}
            disabled={selectedRowKeys.length === 0}
            loading={loading}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
        );
      }
      rowSelection = {
        selectedRowKeys,
        onChange: onRowSelectionChange,
      };
    }
    if (addable) {
      if (rowKey === 'investgAttachmentId') {
        buttons.push(
          <Button
            key="add"
            type="primary"
            onClick={this.handleBtnAddClick}
            loading={loading}
            permissionList={[
              {
                code: 'srm.partner.my-partner.invitation-list.api.ps.investg-attachment-add',
                type: 'button',
                meaning: '调查表填写附件新增',
              },
            ]}
          >
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
      } else {
        buttons.push(
          <Button key="add" type="primary" onClick={this.handleBtnAddClick} loading={loading}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        );
      }
    }
    if (Object.keys(computeTableProps).includes('columns')) {
      computeTableProps.columns = computeTableProps.columns.map((item) => {
        const items = item;
        if (item.dataIndex === 'attachment') {
          items.render = (_, record) => (
            <UploadModal
              record={record}
              fieldCode={item.dataIndex}
              isViewOnly
              attachmentTotal={record.fileCount}
            />
          );
        }
        return items;
      });
    }
    return (
      <Fragment key="base-compose-table">
        {remote?remote.render(`SPFM_INVITATION_INVESTIGATION_TABLE_EXTRA_${purchaserTenantNum}`, null, {_this: this}):null}
        {buttons.length > 0 && (
          <div key="base-compose-table-options" className="table-list-operator">
            {buttons}
          </div>
        )}
        {remark && <Alert showIcon message={remark} type="info" style={{ marginBottom: 8 }} />}
        {!isEmpty(referenceRangeMessage) && !editable && (
          <Alert
            showIcon
            type="error"
            style={{ marginBottom: 16 }}
            message={
              <Fragment>
                {referenceRangeMessage.map((n) => (
                  <div>{n}</div>
                ))}
              </Fragment>
            }
          />
        )}
        <Table
          bordered
          pagination={false}
          key="base-compose-table-table"
          {...otherProps}
          {...noComputeTableProps}
          {...computeTableProps}
          rowSelection={rowSelection}
        />
      </Fragment>
    );
  }
}
