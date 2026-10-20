import React, { Component, useState, useCallback, useEffect, useMemo } from 'react';
import { Button, Icon, Modal } from 'choerodon-ui/pro';
import { Checkbox, Popover } from 'choerodon-ui';
import moment from 'moment';

import intl from 'utils/intl';

import '../index.less';

export const useMount = (callback) => {
  useEffect(() => {
    callback(); // 需要初始化请求（加载）的方法或接口
  }, []);
};

export const useCreate = (callback, param) => {
  useMemo(() => {
    callback();
  }, [param]);
};

export const useSetState = (initial) => {
  const [state, set] = useState(initial);
  // 当set 发生改变 获取最近值，解构。
  const setState = useCallback(
    (newState) => {
      set((prevState) => ({ ...prevState, ...newState }));
    },
    [set]
  );
  return { state, setState };
};

/**
 * 批量操作数据组件
 * @param {[]} CompositeComposite 自义定渲染
 * 方法：compositeChange， 参数类型：arr，参数：勾选的数据
 * 提供参数给父组件 data：数据 ，title：标题名 ， btnTitle：按钮名
 * componentType: 组件类型(提交：submit， 删除：delete， 打印：print。可自定义类型)
 * data 数据格式 [{name: 字段名1, children:[{渲染内容(VNODE)}]}]
 */
export default class CompositeComposite extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedList: [],
    };
  }

  checkBoxAllChange = () => {
    const { data = [], multipurposeId = null, receiptsCod = null } = this.props; // 提供参数给父组件 data：数据 ，title：标题 ， btnTitle：按钮
    const code = receiptsCod?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    const text = `display${code}Num`;
    const treeList = [];
    let list = [];
    list = data.map((n) => {
      return {
        checked: true,
        className: '',
        defaultChecked: false,
        value: n[multipurposeId],
        type: 'checkbox',
        prefixCls: 'c7n-checkbox',
        [text]: n[text] || '',
      };
    });
    treeList.push(...list);
    // setCheckedList([...treeList]);
    this.setState({
      checkedList: treeList,
    });
  };

  checkBoxAllChangeClear = () => {
    this.setState({
      checkedList: [],
    });
  };

  checkBoxChange = (e, data) => {
    const { receiptsCod = null } = this.props; // receiptsCod： 节点编码
    const { checkedList = [] } = this.state;
    const dataValue = e.target;
    const code = receiptsCod?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    const text = `display${code}Num`;
    if (checkedList.length === 0) {
      // setCheckedList([...checkedList, dataValue]);
      this.setState({
        checkedList: [...checkedList, { ...dataValue, [text]: data[text] }],
      });
    } else {
      checkedList.forEach((item) => {
        if (dataValue.value !== item.value) {
          this.setState({
            checkedList: [...checkedList, { ...dataValue, [text]: data[text] }],
          });
        } else {
          const findList = checkedList.findIndex((n) => n.value === dataValue.value);
          checkedList.splice(findList, 1);
          this.setState({
            checkedList,
          });
        }
      });
    }
  };

  firstToUpper = (ele = {}, str = null) => {
    const code = str?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    const text = `display${code}Num`;
    return ele[text];
  };

  reverseChange = () => {
    const { data = [], multipurposeId = null } = this.props; // 提供参数给父组件 data：数据 ，title：标题 ， btnTitle：按钮
    const { checkedList = [] } = this.state;
    const treeList = [];
    const revList = [];
    const list = data.map((n) => {
      return {
        checked: true,
        className: '',
        defaultChecked: false,
        value: n[multipurposeId],
        type: 'checkbox',
        prefixCls: 'c7n-checkbox',
      };
    });
    treeList.push(...list);
    treeList.forEach((item) => {
      if (checkedList.findIndex((m) => m.value === item.value) === -1) {
        revList.push(item);
      }
    });
    if (checkedList.length !== 0) {
      this.setState({
        checkedList: revList,
      });
    }
  };

  // 提供参数给父组件 data：数据 ，title：标题 ， btnTitle：按钮 nodeTitle: 节点名称
  // compositeChange: 提供方法供父组件使用勾选数据 compositeChange 参数类型：arr，参数：勾选的数据, componentType: 组件类型(提交：submit， 删除：delete， 打印：print。可自定义类型)
  compositeCheckboxChange = () => {
    const {
      receiptsCod = null,
      componentType = null,
      errMsg = '',
      nodeTitle = '',
      compositeChange = (e) => e,
    } = this.props;
    const { checkedList = [] } = this.state;
    if (componentType !== 'delete') {
      compositeChange(checkedList, componentType);
      return;
    }
    const code = receiptsCod?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
    const text = `display${code}Num`;
    const tips = checkedList?.map((i) => `${nodeTitle}${i[text]}`).join(',');
    Modal.confirm({
      contentStyle: { width: '550px' },
      title: intl.get('slod.deliveryWorkbench.view.message.help').d('提示'),
      children: (
        <div>
          <span>
            {intl.get('slod.deliveryWorkbench.view.message.deliveryDelete').d(`确认删除`)}
          </span>
          {tips || errMsg}
          {'?'}
        </div>
      ),
      okText: intl.get('hzero.common.button.sure').d('确定'),
      cancelText: intl.get('hzero.common.button.cancel').d('取消'),
      onOk: () => compositeChange(checkedList, componentType),
    });
  };

  render() {
    const {
      data = [],
      title = null,
      btnTitle = null,
      receiptsCod = null,
      multipurposeId = null,
      componentType = null,
    } = this.props; // 提供参数给父组件 data：数据 ，title：标题 ， btnTitle：按钮
    const { checkedList = [] } = this.state;
    const seleTre = data.map((item) => {
      return (
        <p style={{ marginBottom: 12 }}>
          <Checkbox
            className="checkbox"
            value={item[multipurposeId]}
            checked={checkedList.findIndex((m) => m.value === item[multipurposeId]) !== -1}
            onChange={(e) => this.checkBoxChange(e, item)}
          >
            {this.firstToUpper(item, receiptsCod)}
          </Checkbox>
        </p>
      );
    });
    const content = (
      <div>
        <div>{seleTre}</div>
        <div
          style={{
            float: 'left',
            marginLeft: '-10%',
            marginBottom: 8,
            width: '120%',
            height: 1,
            backgroundColor: '#EBEBEB',
          }}
        />
        <div>
          <Button
            onClick={() => this.compositeCheckboxChange()}
            disabled={checkedList.length === 0}
            style={{
              backgroundColor: componentType === 'delete' ? 'none' : '#29BECE',
              color: componentType === 'delete' ? 'red' : '#FFFFFF',
              border: componentType === 'delete' ? 'red' : 'none',
              borderWidth: componentType === 'delete' ? '1px' : 'none',
              borderStyle: componentType === 'delete' ? 'solid' : 'none',
              width: '48px', // 样式定制，UI要求
              height: '24px', // 样式定制，UI要求
              padding: '0 2px', // 样式定制，UI要求
              marginTop: '4px',
            }}
          >
            {btnTitle}
          </Button>
        </div>
      </div>
    );
    const titles = (
      <div>
        <div style={{ float: 'left', color: '#36C2CF' }}>
          <span>
            <a onClick={() => this.checkBoxAllChange()}>
              {intl.get('sinv.receiptWorkbench.view.title.detail.checkAll').d('全选')}
            </a>
          </span>
        </div>
        <div style={{ float: 'left', marginLeft: 8, color: '#36C2CF' }}>
          <span>
            <a onClick={() => this.reverseChange()}>
              {intl.get('sinv.receiptWorkbench.view.title.detail.checkOpposite').d('反选')}
            </a>
          </span>
        </div>
        <div style={{ float: 'left', marginLeft: 8, color: '#36C2CF' }}>
          <span>
            <a onClick={() => this.checkBoxAllChangeClear()}>
              {intl.get('sinv.receiptWorkbench.view.title.detail.checkClear').d('清空')}
            </a>
          </span>
        </div>
      </div>
    );
    return (
      <Popover
        onVisibleChange={() => this.checkBoxAllChangeClear()}
        placement="leftTop"
        title={titles}
        content={content}
        trigger="hover"
      >
        <Button style={{ border: 'none', fontWeight: 'normal', marginLeft: -15 }}>
          {title}
          <Icon
            style={{ lineHeight: '100%', marginLeft: '10px', marginRight: '-20px' }}
            type="navigate_next"
          />
        </Button>
      </Popover>
    );
  }
}

export function dateRangeTransform(dateRange = null) {
  const transToArr = () => {
    switch (dateRange) {
      case 'IN_ONE_MONTH':
        return [moment().subtract(1, 'month'), null];
      case 'IN_TO_MONTH':
        return [moment().subtract(2, 'month'), null];
      case 'IN_THREE_MONTH':
        return [moment().subtract(3, 'month'), null];
      case 'HALF_THE_YEAR':
        return [moment().subtract(6, 'month'), null];
      case 'IN_ONE_YEAR':
        return [moment().subtract(12, 'month'), null];
      case 'ALL':
        return [];
      default:
        return [moment().subtract(3, 'month'), null];
    }
  };
  return transToArr();
}

export const numText = (receiptsCod) => {
  const code = receiptsCod?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
  return `display${code}Num`;
};
