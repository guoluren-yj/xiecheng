import React, { PureComponent } from 'react';
import { Modal, Collapse } from 'choerodon-ui';
import { DataSet, Form, Lov, TextField, Table, Select, SelectBox, Button } from 'choerodon-ui/pro';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { DataSetStatus } from 'choerodon-ui/pro/lib/data-set/enum';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';
import { keys, isEmpty, isArray } from 'lodash';

import { queryMapIdpValue } from 'services/api';
import { getResponse } from 'utils/utils';
import { fetchFieldMappingLine } from '@/services/modelDataSourceService';
import styles from './index.less';
import BatchEditDrawer from './BatchEditDrawer';

const { Panel } = Collapse;
const { Option } = Select;

interface FieldSourceDrawerProps {
  isNew: boolean;
  formDs: DataSet;
  tableDs: DataSet;
  handleFieldSourceDrawerVisible?: (visible?: boolean) => void;
}

interface FieldSourceDrawerState {
  drawerVisible: boolean;
  tipVisible: boolean;
  FieldSourceType: any;
}

@observer
export default class FieldSourceDrawer extends PureComponent<
  FieldSourceDrawerProps,
  FieldSourceDrawerState
> {
  constructor(props) {
    super(props);
    this.state = {
      drawerVisible: false,
      tipVisible: true,
      FieldSourceType: {},
    };
  }

  componentDidMount() {
    const { tableDs } = this.props;
    tableDs.addEventListener('update', this.handleTableDsUpdate);
    this.fetchFieldSourceType();
    this.fetchLineData();
  }

  @Bind()
  fetchFieldSourceType() {
    queryMapIdpValue({
      FieldSourceType: 'HMDE.DATA_REL.ORIGIN_VALUE_TYPE',
    }).then((res) => {
      if (res && isArray(res.FieldSourceType)) {
        const obj = {};
        res.FieldSourceType.forEach((item) => {
          obj[item.value] = item.meaning;
        });
        this.setState({ FieldSourceType: obj });
      }
    });
  }

  @Bind()
  fetchLineData() {
    const { formDs, tableDs } = this.props;
    if (formDs.current?.get('dataRelationId')) {
      tableDs.status = DataSetStatus.loading;
      fetchFieldMappingLine({
        dataRelationId: formDs.current?.get('dataRelationId'),
      })
        .then((res) => {
          const result = getResponse(res);
          if (result) {
            const lineData = result.map((item) => this.transformData(item));
            tableDs.loadData(lineData);
          }
        })
        .finally(() => {
          tableDs.status = DataSetStatus.ready;
        });
    }
  }

  @Bind()
  transformData(data) {
    const { FieldSourceType } = this.state;
    const { formDs } = this.props;
    const { dataObjectCode, dataObjectId } = formDs.current?.get('originDataObject');
    const targetDataObjectCode = formDs.current?.get('targetDataObjectCode');
    const targetDataObjectId = formDs.current?.get('targetDataObjectId');
    const {
      targetModelName,
      targetDisplayName,
      targetDataFieldCode,
      originValueType,
      originValue,
      originValueMeaning,
      originModelName,
      originDisplayName,
      originDataFieldCode,
    } = data || {};
    let newData = data;
    newData = {
      ...newData,
      originDataObjectCode: dataObjectCode,
      originDataObjectId: dataObjectId,
      targetDataObjectCode,
      targetDataObjectId,
      targetModel: targetModelName,
      targetDataField: {
        displayName: targetDisplayName,
        fieldCode: targetDataFieldCode,
      },
      originValueType,
      originValueTypeMeaning: FieldSourceType[originValueType],
    };
    if (originValueType === 'DATA_OBJECT') {
      newData.originModel = originModelName;
      newData.originDataField = {
        displayName: originDisplayName,
        fieldCode: originDataFieldCode,
      };
    } else if (originValueType === 'CONTEXT') {
      newData.originValue = {
        value: originValue,
        meaning: originValueMeaning,
      };
    } else {
      newData.originValue = originValue;
    }
    return newData;
  }

  @Bind()
  handleTableDsUpdate({ value, name, record }) {
    const { FieldSourceType } = this.state;
    if (name === 'originValueType') {
      record.set('originValueTypeMeaning', FieldSourceType[value]);
      record.set('originValueType', value);
      record.set('originModel', undefined);
      record.set('originDataField', undefined);
      record.set('originValue', undefined);
    } else if (name === 'targetDataField') {
      record.set('targetModel', value?.modelName);
      record.set('targetDataFieldId', value?.dataFieldId);
    } else if (name === 'originDataField') {
      record.set('originModel', value?.modelName);
      record.set('originDataFieldId', value?.dataFieldId);
    }
  }

  @Bind()
  handleBatchEdit() {
    this.handleDrawerVisible(true);
  }

  @Bind()
  handleDrawerVisible(visible: boolean = false) {
    this.setState({ drawerVisible: visible });
  }

  @Bind()
  checkRecordEditStatus(record) {
    return record && (record.status === 'add' || record.getState('editing'));
  }

  @Bind()
  handleCancle(record) {
    if (record.status === 'add') {
      this.props.tableDs.delete(record, false);
    } else {
      record.setState('editing', false);
    }
  }

  @Bind()
  handleEdit(record) {
    record.setState('editing', true);
  }

  @Bind()
  handleRemove(record) {
    Modal.confirm({
      title: '确认删除吗?',
      onOk: () => {
        // eslint-disable-next-line no-param-reassign
        record.status = 'delete';
        record.setState('editing', false);
        this.props.tableDs.delete(record, false);
      },
    });
  }

  @Bind()
  handleAdd() {
    const { formDs, tableDs } = this.props;
    const { encryptId, dataObjectId, dataObjectCode } = formDs.current?.get('originDataObject');
    const targetDataObjectId = formDs.current?.get('targetDataObjectId');
    tableDs.create({
      originDataObjectId: encryptId || dataObjectId,
      originDataObjectCode: dataObjectCode,
      targetDataObjectId,
      _status: 'create',
    });
  }

  @Bind()
  handleChangeOriginSource() {
    this.props.tableDs.loadData([]);
  }

  @Bind()
  handleBatchAdd(fields) {
    const { FieldSourceType } = this.state;
    const { formDs, tableDs } = this.props;
    const { dataObjectCode } = formDs.current?.get('originDataObject');
    const targetDataObjectCode = formDs.current?.get('targetDataObjectCode');
    fields.forEach((item) => {
      const {
        targetModelName,
        targetSourceFieldCode,
        targetDataFieldId,
        targetDisplayName,
        originModelName,
        originDisplayName,
        originSourceFieldCode,
        originDataFieldId,
      } = item;
      tableDs.create({
        ...item,
        originDataObjectCode: dataObjectCode,
        targetDataObjectCode,
        targetModel: targetModelName,
        targetSourceFieldCode,
        targetDataFieldId,
        targetDataField: {
          displayName: targetDisplayName,
          dataFieldId: targetDataFieldId,
        },
        originValueTypeMeaning: FieldSourceType.DATA_OBJECT,
        originValueType: 'DATA_OBJECT',
        originModel: originModelName,
        originSourceFieldCode,
        originDataFieldId,
        originDataField: {
          displayName: originDisplayName,
          dataFieldId: originDataFieldId,
        },
        _status: 'create',
        _readOnly: true,
      });
    });
  }

  @Bind()
  handleCloseTip() {
    this.setState({ tipVisible: false });
  }

  @Bind()
  renderSourceValue(record) {
    if (record.get('originValueType') === 'DATA_OBJECT' && record.get('originDataField')) {
      return (record.get('originDataField') || {}).displayName;
    } else if (record.get('originValueType') === 'CONTEXT' && record.get('originValue')) {
      return (record.get('originValue') || {}).meaning;
    } else if (record.get('originValueType') === 'CONSTANT' && record.get('originValue')) {
      return record.get('originValue');
    } else {
      return null;
    }
  }

  render() {
    const { drawerVisible, tipVisible, FieldSourceType } = this.state;
    const { isNew, formDs, tableDs } = this.props;
    return (
      <>
        <Collapse defaultActiveKey={['baseInfo', 'relationModal']} bordered={false}>
          <Panel header="字段基本信息" key="baseInfo">
            <Form
              labelLayout={LabelLayout.float}
              columns={2}
              dataSet={formDs}
              className={styles['detail-form']}
            >
              <TextField name="dataRelationCode" disabled={!isNew} />
              <TextField name="targetDataObjectName" disabled={!isNew} />
              <Lov
                name="originDataObject"
                placeholder="来源对象"
                disabled={!isNew}
                onChange={this.handleChangeOriginSource}
              />
              <TextField name="remark" />
              <SelectBox name="enabledFlag">
                <Option value={1}>是</Option>
                <Option value={0}>否</Option>
              </SelectBox>
            </Form>
          </Panel>
          <Panel header="编辑关联模型" key="relationModal">
            <Table
              className={styles.list}
              dataSet={tableDs}
              buttons={[
                <Button
                  icon="add"
                  onClick={this.handleAdd}
                  disabled={isEmpty(formDs.current?.get('originDataObject'))}
                >
                  新增
                </Button>,
                <Button
                  icon="border_color"
                  onClick={this.handleBatchEdit}
                  disabled={isEmpty(formDs.current?.get('originDataObject'))}
                >
                  批量定义
                </Button>,
              ]}
            >
              <Table.Column
                name="targetModel"
                renderer={({ record, value }) => {
                  if (!record || !this.checkRecordEditStatus(record) || record.get('_readOnly')) {
                    return value;
                  }
                  return <TextField record={record} name="targetModel" />;
                }}
              />
              <Table.Column
                name="targetDataField"
                renderer={({ record, value }) => {
                  if (!record) {
                    return null;
                  } else if (!this.checkRecordEditStatus(record) || record.get('_readOnly')) {
                    return value && value.displayName;
                  }
                  return <Lov record={record} name="targetDataField" />;
                }}
              />
              <Table.Column
                name="originValueTypeMeaning"
                renderer={({ value, record }) => {
                  if (!record || !this.checkRecordEditStatus(record) || record.get('_readOnly')) {
                    return value;
                  }
                  return (
                    <Select record={record} name="originValueType">
                      {keys(FieldSourceType).map((key) => (
                        <Select.Option value={key}>{FieldSourceType[key]}</Select.Option>
                      ))}
                    </Select>
                  );
                }}
              />
              <Table.Column
                name="originModel"
                renderer={({ record, value }) => {
                  if (!record || !this.checkRecordEditStatus(record) || record.get('_readOnly')) {
                    return value;
                  }
                  return (
                    <TextField
                      record={record}
                      name="originModel"
                      disabled={
                        !record.get('originValueType') ||
                        record.get('originValueType') !== 'DATA_OBJECT'
                      }
                    />
                  );
                }}
              />
              <Table.Column
                name="originDataField"
                renderer={({ record }) => {
                  if (!record) {
                    return null;
                  } else if (!this.checkRecordEditStatus(record) || record.get('_readOnly')) {
                    return this.renderSourceValue(record);
                  }
                  if (record.get('originValueType') === 'DATA_OBJECT') {
                    return <Lov record={record} name="originDataField" />;
                  } else if (record.get('originValueType') === 'CONTEXT') {
                    return <Lov record={record} name="originValue" />;
                  }
                  return <TextField record={record} name="originValue" />;
                }}
              />
              <Table.Column
                header="操作"
                renderer={({ record }) => {
                  if (!record) {
                    return null;
                  }
                  return (
                    <div>
                      {this.checkRecordEditStatus(record) && (
                        <a onClick={() => this.handleCancle(record)}>取消</a>
                      )}
                      {!['add', 'delete'].includes(record.status) && (
                        <>
                          {!record.getState('editing') && (
                            <a onClick={() => this.handleEdit(record)}>编辑</a>
                          )}
                          <a
                            style={{ marginLeft: '8px' }}
                            onClick={() => this.handleRemove(record)}
                          >
                            删除
                          </a>
                        </>
                      )}
                    </div>
                  );
                }}
              />
            </Table>
          </Panel>
        </Collapse>
        {drawerVisible && (
          <BatchEditDrawer
            tipVisible={tipVisible}
            drawerFormDs={formDs}
            drawerTableDs={tableDs}
            handleDrawerVisible={this.handleDrawerVisible}
            onCloseTip={this.handleCloseTip}
            onBatchAdd={this.handleBatchAdd}
          />
        )}
      </>
    );
  }
}
