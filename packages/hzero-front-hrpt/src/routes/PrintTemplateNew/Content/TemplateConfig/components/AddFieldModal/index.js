import React, { Component } from 'react';
import classnames from 'classnames';
import { Table, Form, DataSet, TextField, Button } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { isNil } from 'lodash';

import notification from 'utils/notification';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import { HZERO_RPT } from 'utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { fetchCanAddFields, addDatasetFields } from '@/services/dataSetService';

import styles from './index.less';

@observer
export default class AddFieldModal extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.formDs = new DataSet({
      fields: [
        {
          label: intl.get('hrpt.reportDesign.view.title.fieldName').d('字段名称'),
          name: 'fieldName',
        },
        {
          label: intl.get('hrpt.reportDesign.view.title.fieldCode').d('字段编码'),
          name: 'businessObjectFieldCode',
        },
      ],
    });
    this.tableDs = new DataSet({
      primaryKey: 'id',
      parentField: 'parentId',
      paging: false,
      idField: 'id',
      fields: [
        {
          label: intl.get('hrpt.reportDesign.view.title.fieldName').d('字段名称'),
          name: 'fieldName',
        },
        {
          label: intl.get('hrpt.reportDesign.view.title.fieldCode').d('字段编码'),
          name: 'businessObjectFieldCode',
        },
        {
          label: intl.get('hrpt.reportDesign.view.title.businessType').d('业务类型'),
          name: 'businessType',
          lookupCode: 'HRPT.FIELD_BUSINESST_YPE',
          type: 'string',
        },
      ],
      events: {
        load: ({ dataSet }) => {
          runInAction(() => {
            dataSet.forEach((record) => {
              if (record.get('type') === 'object') {
                // eslint-disable-next-line no-param-reassign
                record.selectable = false;
              }
            });
          });
        },
      },
      transport: {
        read: ({ data }) => {
          return {
            url: isTenantRoleLevel()
              ? `${HZERO_RPT}/v1/${getCurrentOrganizationId()}/print-dataset-fields/can-be-add-fields`
              : `${HZERO_RPT}/v1/print-dataset-fields/can-be-add-fields`,
            method: 'GET',
            params: data,
          };
        },
      },
    });
    this.columns = [
      { name: 'fieldName' },
      { name: 'businessObjectFieldCode' },
      { name: 'businessType', editor: true },
    ];
    this.state = {
      currentObjId: undefined,
      tableData: [],
    };
  }

  componentDidMount() {
    const { objectList } = this.props;
    if (objectList && objectList.length > 0) {
      const defaultObjId = objectList[0].id;
      this.setState({
        currentObjId: defaultObjId,
      });
      this.queryCanAddFields(defaultObjId);
    }
  }

  queryCanAddFields = (objectUuid) => {
    this.tableDs.unSelectAll();
    this.tableDs.setQueryParameter('objectUuid', objectUuid);
    this.tableDs.setQueryParameter('tenantId', getCurrentOrganizationId());
    this.tableDs.query().then((result) => {
      this.setState({ tableData: result || [] });
    });
  };

  handleReset = () => {
    this.formDs.loadData([]);
    this.tableDs.loadData(this.state.tableData);
  };

  handleSearch = () => {
    this.tableDs.unSelectAll();
    if (this.formDs.current) {
      const { tableData } = this.state;
      const {
        fieldName: searchFieldName,
        businessObjectFieldCode: searchFieldCode,
      } = this.formDs.current.get(['fieldName', 'businessObjectFieldCode']);
      if (isNil(searchFieldName) && isNil(searchFieldCode)) {
        this.tableDs.loadData(tableData);
      } else if (tableData && tableData.length > 0) {
        const filterData = tableData.filter((item) => {
          let flag = true;
          if (!isNil(searchFieldName)) {
            flag = !!item.fieldName && item.fieldName.includes(searchFieldName);
          }
          if (flag && !isNil(searchFieldCode)) {
            flag =
              !!item.businessObjectFieldCode &&
              item.businessObjectFieldCode.toLowerCase().includes(searchFieldCode.toLowerCase());
          }
          return flag;
        });
        this.tableDs.loadData(filterData);
      }
    }
  };

  submit = async () => {
    const { currentObjId } = this.state;
    const { templateId, handleRefresh } = this.props;
    if (!this.tableDs.selected || this.tableDs.selected.length === 0) {
      notification.warning({
        message: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据'),
      });
      return false;
    }
    let flag = false;
    const selectedField = this.tableDs.selected.map((i) => i.toData());
    const res = await addDatasetFields({
      currentTemplateId: templateId,
      objectUuid: currentObjId,
      datasetFields: selectedField,
    });
    if (getResponse(res)) {
      notification.success();
      flag = true;
      handleRefresh(res);
    }
    return flag;
  };

  handleLoadData = ({ record, dataSet }) => {
    const { children } = record;
    return new Promise((resolve) => {
      if (!children) {
        this.tableDs.status = DataSetStatus.loading;
        fetchCanAddFields({
          objectUuid: record.get('id'),
          tenantId: getCurrentOrganizationId(),
        })
          .then((res) => {
            if (getResponse(res)) {
              if (res && res.length > 0) {
                const childrenList = res.map((item) => {
                  const { objectUuid, businessObjectFieldCode } = item;
                  return {
                    ...item,
                    id: businessObjectFieldCode,
                    parentId: objectUuid,
                    fieldCode: businessObjectFieldCode,
                  };
                });
                dataSet.appendData(childrenList, record);
              }
            }
            resolve();
          })
          .catch(() => {
            resolve();
          })
          .finally(() => {
            this.tableDs.status = DataSetStatus.ready;
          });
      } else {
        resolve();
      }
    });
  };

  handleChangeObj = (objectId) => {
    this.setState({
      currentObjId: objectId,
      tableData: [],
    });
    this.formDs.loadData([]);
    this.queryCanAddFields(objectId);
  };

  render() {
    const { objectList = [] } = this.props;
    const { currentObjId } = this.state;
    return (
      <div className={styles['field-select-modal-content']}>
        <div className={styles['left-panel']}>
          {objectList.map((obj) => (
            <div
              onClick={() => this.handleChangeObj(obj.id)}
              className={classnames(styles['left-list-item'], {
                [styles['left-list-item-active']]: obj.id === currentObjId,
              })}
            >
              {obj.name}
            </div>
          ))}
        </div>
        <div className={styles['right-panel']}>
          <div style={{ display: 'flex', marginBottom: '10px', alignItems: 'flex-start' }}>
            <Form
              dataSet={this.formDs}
              columns={2}
              labelLayout="float"
              style={{ flex: 'auto' }}
              onKeyDown={(e) => {
                if (e.keyCode === 13) {
                  this.handleSearch();
                }
              }}
            >
              <TextField name="fieldName" />
              <TextField name="businessObjectFieldCode" />
            </Form>
            <div
              style={{
                marginLeft: '16px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Button onClick={this.handleReset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button dataSet={null} color="primary" onClick={this.handleSearch}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Table dataSet={this.tableDs} columns={this.columns} virtual={false} virtualCell={false} virtualSpin={false} style={{ height: 'calc(450px - 64px)' }} />
        </div>
      </div>
    );
  }
}
