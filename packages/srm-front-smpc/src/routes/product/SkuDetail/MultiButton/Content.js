import React from 'react';
import { Button, CheckBox, Spin } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import OverflowTip from './OverflowTip';

import styles from './index.less';

const ContentList = observer(({ dataSet, valueField, textField }) => {
  return (
    dataSet && (
      <>
        {dataSet.records.map((record) => (
          <div
            key={record.get(valueField)}
            className="multi-content-row"
            onClick={() => {
              if (record.isSelected) {
                dataSet.unSelect(record);
              } else {
                dataSet.select(record);
              }
            }}
          >
            <CheckBox checked={record.isSelected} />
            <OverflowTip className="multi-text">{record.get(textField)}</OverflowTip>
          </div>
        ))}
      </>
    )
  );
});

const OkBtn = observer(({ dataSet, ...props }) => {
  const disabled = props.disabled || (dataSet && dataSet.selected.length < 1);
  return (
    <Button color="primary" {...props} disabled={disabled}>
      {intl.get('hzero.common.button.ok').d('确定')}
    </Button>
  );
});

export default function MultiContent(props) {
  const {
    onOk = (e) => e,
    options,
    valueField = 'value',
    textField = 'meaning',
    okProps = {},
  } = props;

  return (
    <div className={styles['multi-wrapper']}>
      <Spin dataSet={options}>
        <div className="multi-operator">
          <a
            onClick={() => {
              if (options) options.selectAll();
            }}
          >
            {intl.get('hzero.common.button.selectAll').d('全选')}
          </a>
          <a
            onClick={() => {
              if (options) options.unSelectAll();
            }}
          >
            {intl.get('smpc.product.button.none').d('无')}
          </a>
        </div>
        <div className="multi-content">
          {options && options.length ? (
            <ContentList dataSet={options} valueField={valueField} textField={textField} />
          ) : (
            <div className="multi-content-data-none">
              {intl.get('smpc.product.model.noData').d('暂无数据')}
            </div>
          )}
        </div>
        <div className="multi-footer">
          <OkBtn {...okProps} dataSet={options} onClick={onOk} style={{ height: 28 }} />
          {/* <Button onClick={onCancel}>{intl.get('hzero.common.button.cancel').d('取消')}</Button> */}
        </div>
      </Spin>
    </div>
  );
}
