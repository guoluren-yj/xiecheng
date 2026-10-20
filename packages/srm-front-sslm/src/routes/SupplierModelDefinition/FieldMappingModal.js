/*
 * FieldMappingModal - 字段映射
 * @date: 2018/08/10 14:42:49
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Bind, Debounce } from 'lodash-decorators';
import { DataSet, notification, Table, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';

import { FieldMappingDS } from './stores';
import FieldPropertyModal from './FieldPropertyModal';

export default class FieldMappingModal extends Component {
  fieldMappingDS = new DataSet({
    ...FieldMappingDS(),
  });

  constructor(props) {
    super(props);
    props.onRef(this);
  }

  componentDidMount() {
    const { currentRecord } = this.props;
    this.fieldMappingDS.setQueryParameter('modelSettingId', currentRecord.get('modelSettingId'));
    this.fieldMappingDS.query();
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        name: 'sourceName',
        editor: true,
      },
      {
        name: 'modelFieldName',
      },
      {
        name: 'fieldProps',
        renderer: ({ record }) => {
          if (record.get('modelSettingLineId')) {
            return (
              <a onClick={() => this.openFieldMappingModal(record)}>
                {intl.get(`sslm.supplierModelDefine.model.define.maintain`).d('维护')}
              </a>
            );
          } else {
            return (
              <a style={{ color: 'gray' }}>
                {intl.get(`sslm.supplierModelDefine.model.define.maintain`).d('维护')}
              </a>
            );
          }
        },
      },
      {
        name: 'targetName',
        editor: true,
      },
    ];
    return columns;
  }

  /**
   * 字段属性
   */
  @Debounce(200)
  @Bind()
  openFieldMappingModal(record) {
    const dataProps = {
      currentRecord: record,
      modelSettingId: record.get('modelSettingId'),
      onRef: (ref) => {
        this.fieldPropsModal = ref;
      },
    };

    Modal.open({
      title: intl.get(`sslm.supplierModelDefine.model.define.fieldProperties`).d('字段属性'),
      drawer: true,
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      closable: true,
      style: { width: 650 },
      children: <FieldPropertyModal {...dataProps} />,
      onOk: () => {
        return this.fieldPropsModal.handleSave();
      },
      onCancel: () => {
        this.fieldPropsModal.handleCancel();
      },
    });
  }

  /**
   * 处理保存
   */
  @Bind()
  async handleSave() {
    if (this.fieldMappingDS.dirty) {
      const validateFlag = await this.fieldMappingDS.validate();
      if (validateFlag) {
        this.fieldMappingDS.submit().then((res) => {
          if (res === false) {
            notification.warning({
              placement: 'bottomRight',
              message: intl
                .get('sslm.supplierModelDefine.view.message.requiredMessage')
                .d('必填字段未填写！'),
            });
          } else if (res && res.success) {
            notification.success({
              placement: 'bottomRight',
              message: intl.get('hzero.common.notification.success').d('操作成功'),
            });
            this.fieldMappingDS.query();
          } else {
            notification.warning({
              placement: 'bottomRight',
              message: res.message,
            });
          }
        });
      } else {
        notification.warning({
          placement: 'bottomRight',
          message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
        });
      }
    } else {
      notification.warning({
        placement: 'bottomRight',
        message: intl.get('sslm.common.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
    }
    return false;
  }

  render() {
    return (
      <React.Fragment>
        <Table dataSet={this.fieldMappingDS} columns={this.getColumns()} />
      </React.Fragment>
    );
  }
}
