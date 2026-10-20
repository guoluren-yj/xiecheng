import React, { PureComponent } from 'react';
import { CheckBox, DataSet, Table, Button, Modal } from 'choerodon-ui/pro';
import { ColumnLock, ColumnAlign, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';

import notification from 'utils/notification';
import { getResponse } from 'utils/utils';

import { saveFieldMapping, batchRemoveFieldMapping } from '@/services/modelDataSourceService';
import styles from './index.less';

interface ListProps {
  dataSet: DataSet;
  handleFieldSourceDrawerVisible: (visible?: boolean, data?: any) => void;
  onRefresh: () => void;
}

@observer
export default class FieldMapping extends PureComponent<ListProps> {
  @Bind()
  handleAdd() {
    const { handleFieldSourceDrawerVisible } = this.props;
    handleFieldSourceDrawerVisible();
  }

  @Bind()
  async handleChangeEnabledFlag(record, value) {
    const {
      dataRelationId,
      targetDataObjectCode,
      dataRelationCode,
      originDataObjectCode,
      objectVersionNumber,
    } = record.toData();
    const res = await saveFieldMapping({
      dataRelationId,
      dataRelationCode,
      targetDataObjectCode,
      originDataObjectCode,
      enabledFlag: value,
      objectVersionNumber,
      tenantId: window.dvaApp._store?.getState()?.hmde?.[window.location.pathname]?.tenantId,
      _status: 'update',
    });
    if (getResponse(res)) {
      notification.success({} as any);
    }
  }

  @Bind()
  handleEdit(record) {
    const { handleFieldSourceDrawerVisible } = this.props;
    handleFieldSourceDrawerVisible(record.toData());
  }

  @Bind()
  async handleRemove(data) {
    const { onRefresh } = this.props;
    if (!isEmpty(data)) {
      Modal.confirm({
        title: '确定删除选择的数据吗?',
        onOk: async () => {
          const res = await batchRemoveFieldMapping(data.map((item) => item.toData()));
          if (getResponse(res)) {
            notification.success({} as any);
            onRefresh();
          }
        },
      });
    }
  }

  render() {
    const { dataSet } = this.props;

    return (
      <Table
        className={styles.list}
        dataSet={dataSet}
        queryBar={TableQueryBarType.none}
        buttons={[
          <Button icon="playlist_add" onClick={this.handleAdd}>
            新增
          </Button>,
          <Button
            icon="delete"
            disabled={isEmpty(dataSet.selected)}
            onClick={() => this.handleRemove(dataSet.selected)}
          >
            删除
          </Button>,
        ]}
      >
        <Table.Column name="dataRelationCode" width={200} />
        <Table.Column name="originDataObjectName" width={200} />
        <Table.Column name="remark" />
        <Table.Column
          name="enabledFlag"
          align={ColumnAlign.center}
          width={90}
          editor={(record) => (
            <CheckBox onChange={(value) => this.handleChangeEnabledFlag(record, value)} />
          )}
        />
        <Table.Column
          header="操作"
          width={120}
          lock={ColumnLock.right}
          renderer={({ record }) => {
            return (
              <div>
                <a style={{ marginRight: '8px' }} onClick={() => this.handleEdit(record)}>
                  编辑
                </a>
                <a onClick={() => this.handleRemove([record])}>删除</a>
              </div>
            );
          }}
        />
      </Table>
    );
  }
}
