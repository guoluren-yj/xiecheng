import React, { PureComponent } from 'react';
import { DataSet, Modal } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { saveFieldMapping } from '@/services/modelDataSourceService';
import { formDS, tableDS, fieldSourceFormDS, fieldSourceTableDS } from './stores/FieldMappingDS';
import styles from './index.less';
import FilterForm from './FilterForm';
import FieldSourceDrawer from './FieldSourceDrawer';
import List from './List';

interface FieldMappingProps {
  tabActiveKey?: string;
  dataObjectDetail?: any;
}

interface FieldMappingState {}

export default class FieldMapping extends PureComponent<FieldMappingProps, FieldMappingState> {
  formDs: DataSet = new DataSet(formDS());

  tableDs: DataSet = new DataSet(tableDS());

  drawerFormDs: DataSet = new DataSet(fieldSourceFormDS());

  drawerTableDs: DataSet = new DataSet(fieldSourceTableDS());

  componentDidMount() {
    this.tableDs.queryDataSet = this.formDs;
    this.handleQuery();
  }

  componentWillReceiveProps(nextprops) {
    if (nextprops.tabActiveKey !== this.props.tabActiveKey && nextprops.tabActiveKey === '3') {
      this.handleQuery();
    }
  }

  @Bind()
  handleFieldSourceDrawerVisible(record) {
    let isNew = true;
    if (!isEmpty(record)) {
      isNew = false;
    }
    const { dataObjectDetail } = this.props;
    if (isNew) {
      this.drawerFormDs.create({
        targetDataObjectName: dataObjectDetail?.dataObjectName,
        targetDataObjectId: dataObjectDetail?.dataObjectId,
        targetDataObjectCode: dataObjectDetail?.dataObjectCode,
      });
    } else {
      const { originDataObjectId, originDataObjectCode, originDataObjectName } = record || {};
      this.drawerFormDs.create({
        ...record,
        targetDataObjectName: dataObjectDetail?.dataObjectName,
        originDataObject: {
          dataObjectId: originDataObjectId,
          dataObjectCode: originDataObjectCode,
          dataObjectName: originDataObjectName,
        },
      });
    }
    Modal.open({
      title: '字段取值来源',
      drawer: true,
      closable: true,
      okFirst: true,
      className: styles.drawer,
      style: { width: '1000px' },
      children: (
        <FieldSourceDrawer isNew={isNew} formDs={this.drawerFormDs} tableDs={this.drawerTableDs} />
      ),
      onOk: () => this.handleSave(isNew),
      onClose: () => {
        this.resetDrawerDs();
      },
      onCancel: () => {
        this.resetDrawerDs();
      },
    });
  }

  @Bind()
  resetDrawerDs() {
    this.drawerFormDs.loadData([]);
    this.drawerTableDs.loadData([]);
  }

  @Bind()
  async handleSave(isNew) {
    const flag1 = await this.drawerFormDs.validate();
    if (!flag1) {
      return false;
    }
    const flag2 = await this.drawerTableDs.validate();
    if (!flag2) {
      return false;
    }
    if (!this.drawerFormDs.current) {
      return false;
    }
    const tenantId = window.dvaApp._store?.getState()?.hmde?.[window.location.pathname]?.tenantId;
    const formData = this.drawerFormDs.current.toData();
    const {
      dataRelationId,
      dataRelationCode,
      remark,
      enabledFlag,
      objectVersionNumber,
      targetDataObjectCode,
      originDataObject: { dataObjectCode },
    } = formData;
    const param: any = {
      dataRelationCode,
      remark,
      enabledFlag,
      targetDataObjectCode,
      originDataObjectCode: dataObjectCode,
      tenantId,
      objectVersionNumber,
      _status: isNew ? 'create' : 'update',
    };
    if (!isNew) {
      param.dataRelationId = dataRelationId;
    }
    const tableData = this.drawerTableDs.all;
    if (isEmpty(tableData)) {
      param.dataFieldRelationList = [];
    } else {
      param.dataFieldRelationList = tableData.map((item: any) => {
        const {
          dataFieldRelationId,
          dataRelationId: headerId,
          originDataFieldCode,
          originDataFieldId,
          targetDataFieldCode,
          targetDataFieldId,
          originValueType,
          originValue,
          objectVersionNumber: lineObjectVersionNumber,
        } = item.toData();
        const newItem: any = {
          targetDataFieldCode,
          targetDataFieldId,
          originValueType,
          dataFieldRelationId,
          tenantId,
          dataRelationId: headerId,
          _status: item.status || (dataFieldRelationId ? 'update' : 'create'),
        };
        if (newItem._status === 'sync') {
          newItem._status = null;
        }
        if (newItem._status === 'add') {
          newItem._status = 'create';
        }
        if (['update', 'delete'].includes(newItem._status)) {
          newItem.objectVersionNumber = lineObjectVersionNumber;
        }
        if (originValueType === 'DATA_OBJECT') {
          newItem.originDataFieldCode = originDataFieldCode;
          newItem.originDataFieldId = originDataFieldId;
        } else if (originValueType === 'CONTEXT') {
          newItem.originValue = originValue.value;
        } else {
          newItem.originValue = originValue;
        }
        return newItem;
      });
    }
    const res = await saveFieldMapping(param);
    if (getResponse(res)) {
      notification.success({} as any);
      this.handleQuery();
      this.resetDrawerDs();
      return true;
    }
    return false;
  }

  @Bind()
  handleQuery() {
    const { dataObjectDetail } = this.props;
    this.tableDs.setQueryParameter('dataObjectCode', dataObjectDetail?.dataObjectCode);
    this.tableDs.query();
  }

  render() {
    return (
      <div style={{ padding: '16px' }}>
        <FilterForm dataSet={this.formDs} onQuery={this.handleQuery} />
        <List
          dataSet={this.tableDs}
          handleFieldSourceDrawerVisible={this.handleFieldSourceDrawerVisible}
          onRefresh={this.handleQuery}
        />
      </div>
    );
  }
}
