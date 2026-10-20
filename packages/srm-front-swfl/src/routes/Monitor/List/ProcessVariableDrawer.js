import React from 'react';
import { Modal, Table } from 'hzero-ui';
import { isUndefined, isEmpty, isFunction } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Content } from 'components/Page';
import intl from 'utils/intl';
import { tableScrollWidth, filterNullValueObject } from 'utils/utils';
import ProcessVariableFilterForm from './ProcessVariableFilterForm';

export default class ProcessVariableDrawer extends React.PureComponent {
  form;

  @Bind()
  handleSearch(fields = {}) {
    const { onSearch, currentRecord, isSiteFlag } = this.props;
    const { processDefinitionKey, id } = currentRecord;
    let queryParams = { procDefKey: processDefinitionKey, procInstId: id };
    if (isSiteFlag && currentRecord.tenantId) {
      queryParams = { ...queryParams, tenantId: currentRecord.tenantId };
    }
    const filterValues = isUndefined(this.form)
      ? {}
      : filterNullValueObject(this.form.getFieldsValue());
    if (onSearch && isFunction(onSearch)) {
      onSearch({
        ...queryParams,
        ...filterValues,
        page: isEmpty(fields) ? {} : fields,
        oldTotalElements: fields.total ? fields.total : '',
      });
    }
  }

  @Bind()
  handleBindRef(ref = {}) {
    this.form = (ref.props || {}).form;
  }

  render() {
    const {
      visible,
      loading,
      onCancel,
      processVariableList = false,
      processVariableLoading = false,
      pagination = {},
      isSiteFlag,
      processStatus,
      variableTypes = [],
      sourceTypes = [],
    } = this.props;
    const columns = [
      {
        title: intl.get('hwfp.monitor.model.monitor.description').d('变量名称'),
        dataIndex: 'description',
        width: 150,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.variableName').d('变量编码'),
        dataIndex: 'variableName',
        width: 150,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.variableValue').d('变量值'),
        dataIndex: 'variableValue',
        width: 150,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.variableType').d('变量类型'),
        dataIndex: 'variableTypeMeaning',
        width: 100,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.componentType').d('组件类型'),
        dataIndex: 'componentTypeMeaning',
        width: 80,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.lovCode').d('来源值集'),
        dataIndex: 'lovCode',
        width: 120,
      },
      {
        title: intl.get('hwfp.monitor.model.monitor.variableSourceMeaning').d('来源'),
        dataIndex: 'variableSourceMeaning',
        width: 70,
      },
    ];
    const filterProps = {
      isSiteFlag,
      processStatus,
      variableTypes,
      sourceTypes,
      onSearch: this.handleSearch,
      onRef: this.handleBindRef,
    };
    return (
      <Modal
        destroyOnClose
        wrapClassName="ant-modal-sidebar-right"
        transitionName="move-right"
        title={intl.get('hwfp.monitor.view.message.title.query.variableName').d('查询流程变量')}
        width="80vw"
        style={{ maxWidth: '1200px' }}
        visible={visible}
        confirmLoading={loading}
        onCancel={onCancel}
        onOk={onCancel}
      >
        <Content>
          <div className="table-list-search">
            <ProcessVariableFilterForm {...filterProps} />
          </div>
          <Table
            bordered
            // rowKey="id"
            scroll={{ x: tableScrollWidth(columns, 200) }}
            columns={columns}
            loading={processVariableLoading}
            dataSource={processVariableList}
            pagination={pagination}
            onChange={this.handleSearch}
          />
        </Content>
      </Modal>
    );
  }
}
