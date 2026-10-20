/*
 * eventDimension - 事件数据分配弹窗
 * @date: 2018/08/10 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { DataSet, notification, Button, Table, Row, Col, Modal, Lov } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { batchDelete } from '@/services/supplierEventService';

import { EventDimensionDS } from './stores';
import { getDataItemDS } from './stores/EventDimensionDS';

export default class EventDimensionTable extends Component {
  eventDimensionDS = new DataSet({
    ...EventDimensionDS(),
    queryParameter: {
      exportCfId: this.props.exportCfId,
    },
    events: {
      select: ({ dataSet }) => {
        if (dataSet) {
          this.setState({
            selectedRows: dataSet.selected,
          });
        }
      },
      unSelect: ({ dataSet }) => {
        if (dataSet) {
          this.setState({
            selectedRows: dataSet.selected,
          });
        }
      },
      selectAll: ({ dataSet }) => {
        if (dataSet) {
          this.setState({
            selectedRows: dataSet.selected,
          });
        }
      },
      unSelectAll: ({ dataSet }) => {
        if (dataSet) {
          this.setState({
            selectedRows: dataSet.selected,
          });
        }
      },
    },
  });

  dataItemDs = new DataSet(getDataItemDS());

  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      selectedRows: [],
    };
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'cfName',
        editor: record => record && !record.get('exportCfAssignId'),
      },
      {
        name: 'code',
      },
    ];
    return columns;
  }

  /**
   * 删除保存的数据
   */
  @Bind()
  deleteSaveData(list = []) {
    const ids = list.map(r => r.exportCfAssignId);
    batchDelete(ids).then(r => {
      const res = getResponse(r);
      if (res) {
        this.setState({
          selectedRows: [],
        });
        notification.success({
          placement: 'bottomRight',
          message: intl.get('hzero.common.notification.success').d('操作成功'),
        });
        this.eventDimensionDS.unSelectAll();
        this.eventDimensionDS.clearCachedSelected();
        this.eventDimensionDS.query();
      }
    });
  }

  /**
   * 删除新建和保存的数据
   */
  @Bind()
  deleteCreateAndSaveData(createRecords = [], deleteRecords = []) {
    const list = deleteRecords.map(r => r.toData());
    if (createRecords.length && deleteRecords.length) {
      this.eventDimensionDS.remove(createRecords);
      this.deleteSaveData(list);
    } else if (createRecords.length) {
      this.eventDimensionDS.remove(createRecords);
      this.setState({
        selectedRows: [],
      });
      notification.success({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.success').d('操作成功'),
      });
      this.eventDimensionDS.unSelectAll();
      this.eventDimensionDS.clearCachedSelected();
      this.eventDimensionDS.query();
    } else if (deleteRecords.length) {
      this.deleteSaveData(list);
    }
  }

  /**
   * 删除按钮处理逻辑
   */
  @Bind()
  async handleDelete() {
    const selectedRecords = this.eventDimensionDS.selected;
    if (selectedRecords.length) {
      const createdRecordFlag = this.eventDimensionDS.some(record => {
        if (!record.get('exportCfAssignId')) {
          return true;
        } else {
          return false;
        }
      });
      const createRecords = this.eventDimensionDS.filter(record => !record.get('exportCfAssignId'));
      const deleteRecords = selectedRecords.filter(record => record.get('exportCfAssignId'));
      if (createdRecordFlag) {
        if (
          (await Modal.confirm(
            intl
              .get('sslm.supplierEventConfig.view.message.nowDataNotSave')
              .d('当前数据未保存，继续此操作将造成数据丢失，是否继续？')
          )) !== 'cancel'
        ) {
          this.deleteCreateAndSaveData(createRecords, deleteRecords);
        }
      } else {
        const list = deleteRecords.map(r => r.toData());
        this.deleteSaveData(list);
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
    }
  }

  /**
   * 处理保存
   */
  @Bind()
  handleSave() {
    if (this.eventDimensionDS.dirty) {
      this.eventDimensionDS.submit().then(res => {
        if (res === false) {
          notification.warning({
            placement: 'bottomRight',
            message: intl
              .get('sslm.supplierEventConfig.view.message.maintainInfo')
              .d('请维护相关信息！'),
          });
        } else if (res && res.success) {
          this.eventDimensionDS.query();
        } else if (res) {
          notification.warning({
            placement: 'bottomRight',
            message: res.message,
          });
        }
      });
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.supplierEventConfig.view.message.noNeedSaveData')
          .d('暂无需要保存的数据！'),
      });
    }
    return false;
  }

  @Bind()
  handleCreateData() {
    const { dataSet } = this.props;
    const headerRecord = dataSet.current.toData();
    const currentData = this.dataItemDs.current.toData();
    if (!isEmpty(currentData)) {
      const { dataItemLov = [] } = currentData;
      dataItemLov.forEach(item => {
        const { value, meaning, code } = item;
        this.eventDimensionDS.create(
          {
            exportCfId: headerRecord.exportCfId,
            cfName: value,
            cfNameMeaning: meaning,
            code,
          },
          0
        );
      });
    }
    this.dataItemDs.current.set('dataItemLov', undefined);
  }

  render() {
    const { selectedRows } = this.state;

    return (
      <React.Fragment>
        <Row justify="end" type="flex" style={{ marginBottom: 10 }}>
          <Col span={3} style={{ marginRight: 8 }}>
            <Button onClick={this.handleDelete} disabled={isEmpty(selectedRows)}>
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </Col>
          <Col span={3}>
            <Lov
              color="primary"
              mode="button"
              name="dataItemLov"
              icon=""
              clearButton={false}
              dataSet={this.dataItemDs}
              modalProps={{
                afterClose: this.handleCreateData,
              }}
            >
              {intl.get('hzero.common.button.create').d('新建')}
            </Lov>
          </Col>
        </Row>
        <Table dataSet={this.eventDimensionDS} columns={this.getColumns()} />
      </React.Fragment>
    );
  }
}
