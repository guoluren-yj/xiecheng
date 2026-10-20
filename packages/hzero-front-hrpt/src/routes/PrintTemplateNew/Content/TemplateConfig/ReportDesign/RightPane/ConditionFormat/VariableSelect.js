import React, { useMemo, useState } from 'react';
import { observer } from 'mobx-react';
import { pick } from 'lodash';
import { DataSet, TextField, Tabs, Output, Modal, Tree } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import intl from "hzero-front/lib/utils/intl";
import notification from 'hzero-front/lib/utils/notification';

import { getFieldSvg } from '../../utils/constant';
import styles from './index.less';

function VariableSelect({ dataSet, name, placeholder, templateFields }) {

  const templateFieldTreeDs = useMemo(() => {
    return new DataSet({
      primaryKey: 'id',
      parentField: 'parentId',
      idField: 'id',
      data: templateFields,
      selection: 'single',
      record: {
        dynamicProps: {
          selectable: (record) => {
            return !record || record.get('type') != 'node';
          },
        }
      }
    });
  }, [templateFields]);

  const nodeRenderer = ({ record }) => {
    const { name, parentName, type, color, dataType } = record.get([
      'id',
      'code',
      'name',
      'parentId',
      'parentCode',
      'parentName',
      'type',
      'color',
      'dataType',
    ]);
    if (type !== 'field') {
      return (
        <div className={styles['field-tree-node']}>
          <span>{getFieldSvg('header', color)}</span>
          <span className={styles['field-tree-node-content']}>{name}</span>
        </div>
      );
    } else {
      return (
        <div className={styles['field-tree-node']}>
          <span>{getFieldSvg(dataType, color)}</span>
          <span className={styles['field-tree-node-content']} title={name}>
            {parentName}.{name}
          </span>
        </div>
      );
    }
  };

  const handleSubmit = () => {
    if (!templateFieldTreeDs.selected || !templateFieldTreeDs.selected.length) {
      notification.warning({
        message: intl.get('hrpt.reportDesign.view.message.shouldSelectField').d('请选择字段')
      });
      return false;
    }
    const field = templateFieldTreeDs.selected[0];
    if (dataSet.current) {
      dataSet.current.set(name, pick(field.toData(), ['code', 'name', 'parentCode', 'parentName']));
    }
    return true;
  };

  const handleClose = () => {
    templateFieldTreeDs.selected.forEach(record => {
      record.isSelected = false;
    });
  };

  const handleOpenModal = () => {
    if (dataSet.current) {
      const currentValue = dataSet.current.get(name);
      if (currentValue && currentValue.id) {
        const target = templateFieldTreeDs.find(record => record.get('id') === currentValue.id);
        if (target) {
          target.isSelected = true;
        }
      }
    }
    Modal.open({
      title: intl.get('hrpt.reportDesign.view.title.selectParamValue').d('选择参数值'),
      className: styles['template-field-modal'],
      closable: true,
      children: (
        <Tabs tabPosition='left' flex>
          <Tabs.TabPane tab={intl.get('hrpt.reportDesign.model.waterMask.content.templateField').d('模板字段')}>
            <Tree
              dataSet={templateFieldTreeDs}
              renderer={nodeRenderer}
              showLine={{
                showLeafIcon: false
              }}
              defaultExpandAll
            />
          </Tabs.TabPane>
        </Tabs>
      ),
      onOk: handleSubmit,
      onClose: handleClose,
    });
  };

  const renderOptions = ({ value }) => {
    return (
      <TextField
        clearButton
        required
        readOnly
        className={styles['variable-select-input']}
        value={value ? `${value.parentName}.${value.name}` : undefined}
        placeholder={placeholder}
        suffix={<Icon type='search' onClick={handleOpenModal} />}
      />
    );
  };

  return (
    <Output
      dataSet={dataSet}
      name={name}
      required={false}
      renderer={renderOptions}
      style={{ border: 'none', padding: 0 }}
    />
  );
}

export default observer(VariableSelect);