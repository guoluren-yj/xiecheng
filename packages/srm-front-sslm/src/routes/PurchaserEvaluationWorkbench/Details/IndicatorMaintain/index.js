/*
 * IndicatorMaintain - 指标维护
 * @date: 2020/10/27 15:12:06
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, DataSet, Button, notification, Modal } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import { isEmpty, uniqBy } from 'lodash';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import { deleteIndicator } from '@/services/purchaserEvaluationWorkbenchServices';
import { addedDS, notAddedDS } from './stores';

@observer
export default class index extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }
  }

  addedDS = new DataSet({
    ...addedDS(),
    queryParameter: {
      evalHeaderId: this.props.evalHeaderId,
    },
  });

  componentDidMount() {
    const { modal } = this.props;
    modal.update({
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
      okText: intl.get(`hzero.common.button.save`).d('保存'),
      onOk: () => {
        return this.handleSave();
      },
    });
  }

  /**
   * 已添加
   */
  @Bind()
  getAddedColumns() {
    const columns = [
      {
        name: 'indicatorCode',
      },
      {
        name: 'indicatorName',
      },
      {
        name: 'scoreTypeMeaning',
        width: 120,
      },
      {
        name: 'evalWeight',
        editor: true,
        width: 80,
      },
      {
        name: 'evalStandard',
        editor: true,
      },
    ];
    return columns;
  }

  /**
   * 未添加
   */
  @Bind()
  getNotAddedColumns() {
    const columns = [
      {
        name: 'indicatorCode',
      },
      {
        name: 'indicatorName',
      },
      {
        name: 'scoreTypeMeaning',
        width: 120,
      },
      {
        name: 'evalWeight',
        width: 80,
        align: 'right',
      },
      {
        name: 'evalStandard',
      },
    ];
    return columns;
  }

  /**
   * 处理保存
   */
  @Bind()
  async handleSave() {
    let modalCloseFlag = false;
    const validateFlag = await this.addedDS.validate();
    if (this.addedDS.dirty) {
      if (validateFlag) {
        const res = getResponse(await this.addedDS.submit());
        if (res && res.success) {
          modalCloseFlag = true;
        }
        return modalCloseFlag;
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
        });
        return modalCloseFlag;
      }
    } else {
      if (validateFlag) {
        notification.warning({
          placement: 'bottomRight',
          message: intl
            .get('sslm.supplierDocManage.view.saveWaring.noDataSave')
            .d('暂无需要保存的数据！'),
        });
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
        });
      }
      return modalCloseFlag;
    }
  }

  /**
   * 处理添加
   */
  @Bind()
  async handleAdd(ds) {
    const selectedRecords = ds
      .toJSONData()
      ?.map(item => ({ ...item, standardIndicatorId: item.indicatorId }));
    if (selectedRecords.length) {
      // 获取表格已存在的数据
      const existRows = this.addedDS.toData();
      const updateRows = uniqBy([...existRows, ...selectedRecords], 'standardIndicatorId');
      this.addedDS.loadData(updateRows);
      return true;
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('hzero.common.notification.warning').d('请先勾选一条数据'),
      });
      return false;
    }
  }

  /**
   *添加指标弹窗
   */
  // eslint-disable-next-line no-shadow
  @Bind()
  addIndicatorModal() {
    const indicatorDs = new DataSet({
      ...notAddedDS(),
      queryParameter: {
        enabledFlag: 1,
      },
    });
    // 已添加指标
    const addedIds = this.addedDS.map(item => item.data.indicatorId);
    // 取消勾选数据（已选中指标，过滤掉未添加的指标）
    const removeList = indicatorDs.selected.filter(
      item => !addedIds.includes(item.data.indicatorId)
    );
    if (!isEmpty(removeList)) {
      indicatorDs.batchUnSelect(removeList);
    }
    Modal.open({
      key: Modal.key(),
      title: intl.get('sslm.purchaserEvaluationDetail.view.button.addIndicator').d('添加指标'),
      style: { width: 900 },
      closable: true,
      destroyOnClose: true,
      onOk: () => this.handleAdd(indicatorDs),
      children: (
        <Table
          mode="tree"
          dataSet={indicatorDs}
          columns={this.getNotAddedColumns()}
          queryFieldsLimit={2}
        />
      ),
    });
  }

  // 删除指标（处理树形数据，父级未展示时，删除父级，子级未查询出来问题）
  @Bind()
  handleDelete() {
    const { evalHeaderId } = this.props;
    const modifyFlag = this.addedDS.dirty;
    const children = modifyFlag
      ? intl.get('sslm.common.view.message.continueDelete').d('有数据未保存，是否继续删除？')
      : intl.get('sslm.common.view.message.sureDeleteSelectedRows').d('确认删除选中行？');
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children,
      onOk: () => {
        const selectedRows = (this.addedDS?.selected || []).map(record => record.toData());
        return deleteIndicator({
          evalHeaderId,
          selectedRows,
        }).then(response => {
          const res = getResponse(response);
          if (res) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.addedDS.query(this.addedDS.currentPage, {}, false);
          }
        });
      },
    });
  }

  render() {
    const { custLoading, customizeTable } = this.props;
    const buttons = [
      <Button
        icon="playlist_add"
        name="add"
        onClick={() => {
          this.addIndicatorModal();
        }}
      >
        {intl.get('hzero.common.button.addIndicator').d('添加指标')}
      </Button>,
      <Button
        name="delete"
        icon="delete_sweep"
        onClick={this.handleDelete}
        disabled={isEmpty(this.addedDS.selected)}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>,
    ];
    return customizeTable(
      {
        code: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR_LIST',
        buttonCode: 'SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR_BTN',
      },
      <SearchBarTable
        searchCode="SSLM.PURCHASER_ASSESS_DETAIL.ASSESSMENT_INFO_INDICATOR"
        mode="tree"
        buttons={buttons}
        defaultRowExpanded
        border={false}
        custLoading={custLoading}
        dataSet={this.addedDS}
        columns={this.getAddedColumns()}
        queryFieldsLimit={2}
        searchBarConfig={{
          expand: false,
          autoQuery: false,
          closeFilterSelector: true,
        }}
        autoHeight={{ type: 'maxHeight', diff: 0 }}
      />
    );
  }
}
