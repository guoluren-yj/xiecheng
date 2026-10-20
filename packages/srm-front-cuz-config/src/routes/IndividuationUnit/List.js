import React, { Component } from 'react';
import { Table, Menu, Dropdown, Icon } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import isEmpty from 'lodash/isEmpty';
import intl from 'utils/intl';
import SetRelatedModal from "./SetRelatedModal";
import styles from './style/index.less';

const defaultRowKey = 'id';
export default class List extends Component {

  opRecord = null;

  state = {
    setRelatedMapVisible: false,
  };

  @Bind()
  edit(record){
    if(record.unitCode.indexOf("***") > -1){
      this.opRecord = record;
      this.setState({
        setRelatedMapVisible: true,
      });
    }else {
      this.props.handleEdit(record[defaultRowKey], record.unitGroupId, record.unitType);
    }
  }

  @Bind()
  editFilter(record) {
    this.props.handleEditFilter(record);
  }

  @Bind()
  closeModal(finishRewrite, unitGroupId){
    this.opRecord = null;
    if(finishRewrite){
      this.props.handleFetchList(this.props.isGroupModel ? {unitGroupId}: undefined);
    }
    this.setState({setRelatedMapVisible: false});
  }

  @Bind()
  renderUnitName(unitName, record) {
    const { unitCode } = record;
    const menu = (
      <Menu>
        <Menu.Item key="edit" onClick={()=>this.edit(record)}>
          <Icon type="edit" />
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Menu.Item>
        {/* {record.unitType === 'SEARCHBAR' && (
          <Menu.Item key="filter" onClick={()=>this.editFilter(record)}>
            <Icon type="filter" />
            {intl.get('hhpfm.individuationUnit.button.editFilter').d('编辑筛选器')}
          </Menu.Item>
        )} */}
      </Menu>
    );
    return (
      <div className={styles['unit-table-extra']}>
        <div className={styles['unit-operator']}>
          <Dropdown overlay={menu} trigger={['click']}>
            <a>.&nbsp;.&nbsp;.</a>
          </Dropdown>
        </div>
        <div style={{ fontWeight: 600, color: '#666' }}>{unitName}</div>
        <div style={{ color: '#a5a5a5' }}>{unitCode}</div>
      </div>
    );
  }

  @Bind()
  getColumns() {
    const { unitTypeOptions = [] } = this.props;
    const unitTypeMap = {};
    if (!isEmpty(unitTypeOptions)) {
      unitTypeOptions.forEach((item) => {
        unitTypeMap[item.value] = item.meaning;
      });
    }
    return [
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.unitName').d('单元名称'),
        dataIndex: 'unitName',
        render: this.renderUnitName,
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.unitType').d('单元类型'),
        dataIndex: 'unitType',
        render: (text) => unitTypeMap[text],
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.menuName').d('所属功能'),
        dataIndex: 'menuName',
      },
      {
        title: intl.get('hpfm.individuationUnit.model.individuationUnit.modelName').d('关联主模型'),
        dataIndex: 'modelName',
      },
    ];
  }

  @Bind()
  handleChange(pagination) {
    const { handleFetchList, filterFromValues } = this.props;
    handleFetchList({
      page: pagination,
      ...filterFromValues,
    });
  }

  render() {
    const { loading, dataSource = [], pagination = {} } = this.props;
    return (
      <>
        <Table
          bordered
          rowKey={defaultRowKey}
          columns={this.getColumns()}
          dataSource={dataSource}
          pagination={pagination}
          loading={loading}
          onChange={this.handleChange}
        />
        {this.state.setRelatedMapVisible && (
          <SetRelatedModal
            record={this.opRecord}
            onClose={this.closeModal}
            visible={this.state.setRelatedMapVisible}
          />
        )}
      </>
    );
  }
}
