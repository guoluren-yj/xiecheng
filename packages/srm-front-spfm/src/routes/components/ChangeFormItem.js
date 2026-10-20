/**
 * ChangeFormItem.js - 变更检测组件
 * @date: 2019-09-10
 * @author: yangou <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import React from 'react';
import { Form, Modal } from 'hzero-ui';
import moment from 'moment';
import { DATETIME_MIN } from 'utils/constants';
import intl from 'utils/intl';

function isNilStr(value) {
  return value === null || value === undefined ? '' : value;
}

/**
 * 比较不同类型数据
 */
const prefixClsSwitch = {
  'ant-calendar': (oldValue, newValue) => {
    return [moment(oldValue).format(DATETIME_MIN), moment(newValue).format(DATETIME_MIN)];
  },
  'ant-input-number': (oldValue, newValue) => {
    return [
      isNaN(parseFloat(oldValue)) ? null : parseFloat(oldValue),
      isNaN(parseFloat(newValue)) ? null : parseFloat(newValue),
    ];
  },
  'ant-input': (oldValue, newValue) => {
    return [String(oldValue), String(newValue.target.value)];
  },
  'ant-select': (oldValue, newValue) => {
    return [isNilStr(oldValue), isNilStr(newValue)];
  },
  default: (oldValue, newValue) => {
    return [oldValue, isNilStr(newValue)];
  },
};

/**
 * 接收一个rowKey作为构造
 */
export default function(rowKey) {
  /**
   * 记录更改记录
   */
  this._updateState = {};

  /**
   * 设置更改记录
   */
  this.setUpdate = (field, value) => {
    switch (field) {
      case '_increase':
        this._updateState[value] = true;
        break;
      case '_delete':
        delete this._updateState[value];
        break;
      case 'deleteLine':
        Object.keys(this._updateState).forEach(key => {
          if (value.includes(key.split('**')[0])) {
            delete this._updateState[key];
          }
        });
        break;
      case 'reset':
        this._updateState = {};
        break;
      default:
        break;
    }
  };

  /**
   * 判断是否更改
   */
  this._isUpdate = () => {
    return Object.keys(this._updateState).length > 0;
  };

  /**
   * 返回更改检测组件
   */
  this.ChangeFormItem = ({ children, record }) => {
    const { props } = children;
    const { onChange, prefixCls } = props;
    props.onChange = e => {
      onChange(e);
      const { name } = props['data-__meta'];
      const keyName = `${record[rowKey] || 'headerInfo'}**${name}`;
      const [oldValue, newValue] = prefixClsSwitch[prefixCls || 'default'](
        isNilStr(record[name]),
        e
      );
      if (oldValue === newValue) {
        this.setUpdate('_delete', keyName);
      } else {
        this.setUpdate('_increase', keyName);
      }
    };
    return <Form.Item>{children}</Form.Item>;
  };

  /**
   * 返回更改列表
   */
  this.changeList = list => {
    const updateArr = Array.from(
      new Set(Object.keys(this._updateState).map(key => key.split('**')[0]))
    );
    return list
      .filter(item => updateArr.includes(String(item[rowKey])))
      .map(item => ({
        ...item,
        [rowKey]: item._status === 'update' ? item[rowKey] : undefined,
      }));
  };

  /**
   * 判断是否保存
   */
  this.isSave = (fn, cancel) => {
    return () => {
      if (this._isUpdate()) {
        Modal.confirm({
          title: intl
            .get(`hzero.common.validation.nowDataNotSave`)
            .d(`当前数据有未保存。继续操作将造成数据丢失，是否继续？`),
          onOk: fn,
          onCancel: () => {
            if (cancel) {
              cancel();
            }
          },
        });
      } else {
        fn();
      }
    };
  };
}
