import React, { Component } from 'react';
import intl from 'utils/intl';
import { Table, Form, Icon, Output, TextField, IntlField } from 'choerodon-ui/pro';
import styles from './index.less';

export default class CardFields extends Component {
  deleteField = (record) => {
    const { dataSet, onChange } = this.props;
    if (!dataSet) return;
    dataSet.remove([record], true);
    if (typeof onChange === 'function') onChange();
  };

  defaultColumns = [
    {
      name: 'render',
      tooltip: 'none',
      renderer: ({ record }) => {
        const { readOnly, onChange } = this.props;
        return (
          <div className={styles['card-field-cell-wrap']}>
            {!readOnly && (
              <div className={styles['edit-button-form-drag-container']}>
                <Icon type="baseline-drag_indicator" className={styles['edit-button-form-drag']} />
              </div>
            )}
            <Form labelLayout="float" record={record} className={styles['card-field-cell']}>
              {readOnly ? <Output name="fieldCode" /> : <TextField name="fieldCode" />}
              {readOnly ? (
                <Output name="fieldName" />
              ) : (
                <IntlField
                  name="fieldName"
                  onEnterDown={() => {
                    if (typeof onChange === 'function') onChange();
                  }}
                  onBlur={() => {
                    if (typeof onChange === 'function') onChange();
                  }}
                  onInput={() => {
                    if (typeof onChange === 'function') onChange();
                  }}
                />
              )}
            </Form>
            {!readOnly && (
              <div className={styles['del-icon-container']}>
                <Icon
                  type="delete"
                  className={styles['del-icon']}
                  style={{ fontSize: '14px' }}
                  onClick={() => this.deleteField(record)}
                />
              </div>
            )}
          </div>
        );
      },
    },
  ];

  render() {
    const { dataSet, readOnly, onChange } = this.props;
    return (
      <div>
        <div className={styles['field-title-tag']}>
          {intl.get('smbl.purchaseRobotConfig.view.field.feildTitle').d('字段')}
        </div>
        <Table
          dataSet={dataSet}
          className={styles['card-field-table']}
          columns={this.defaultColumns}
          showHeader={false}
          fullColumnWidth
          border={false}
          rowBoxPlacement="none"
          rowHeight="auto"
          queryBar="none"
          pagination={false}
          rowDraggable={!readOnly}
          onDragEnd={() => {
            if (typeof onChange === 'function') onChange();
          }}
        />
      </div>
    );
  }
}
