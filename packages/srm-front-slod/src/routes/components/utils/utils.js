import React, { useState, useMemo, useCallback } from 'react';
import { Button, Icon, Tooltip } from 'choerodon-ui/pro';
import { Checkbox, Popover } from 'choerodon-ui';
import { isNil } from 'lodash';

import intl from 'utils/intl';
import moment from 'moment';

export function TooltipButton({ tipTitle, buttonText, btnProps = {} }) {
  return (
    <Tooltip title={tipTitle}>
      <Button {...btnProps}>{buttonText}</Button>
    </Tooltip>
  );
}

/**
 * 批量操作数据组件
 * @param {[]} CompositeComposite 自义定渲染
 * 方法：compositeChange， 参数类型：arr，参数：勾选的数据
 * 提供参数给父组件 data：数据 ，title：标题名 ， btnTitle：按钮名
 * componentType: 组件类型(提交：submit， 删除：delete， 打印：print。可自定义类型)
 * data 数据格式 [{name: 字段名1, children:[{渲染内容(VNODE)}]}]
 */
export default function CompositeComposite(props) {
  const {
    data = [],
    title = null,
    btnTitle = null,
    receiptsCod = null,
    multipurposeId = null,
    componentType = null,
    compositeChange = (e) => e,
  } = props; // 提供参数给父组件 data：数据 ，title：标题 ， btnTitle：按钮
  // const listRef = React.useRef([]);
  const [checkedList, setCheckedList] = useState([]);
  const checkBoxAllChange = () => {
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
      };
    });
    treeList.push(...list);
    setCheckedList([...treeList]);
  };

  const checkBoxAllChangeClear = () => {
    setCheckedList([]);
  };

  const checkBoxChange = (e) => {
    const dataValue = e.target;
    if (checkedList.length === 0) {
      // setCheckedList([...checkedList, dataValue]);
      setCheckedList((prev) => {
        console.log(prev, 'prev');
        prev.push(dataValue);
        const arrCopy = prev.slice();
        console.log(arrCopy, 'arrCopy');
        return arrCopy;
      });
    } else {
      console.log(checkedList, 'checkedList');
      checkedList.forEach((item) => {
        if (dataValue.value !== item.value) {
          setCheckedList([...checkedList, dataValue]);
        } else {
          const findList = checkedList.findIndex((n) => n.value === dataValue.value);
          checkedList.splice(findList, 1);
          setCheckedList([...checkedList]);
        }
      });
    }
  };

  const firstToUpper = useCallback(
    (ele = {}, str = null) => {
      const code = str?.toLowerCase()?.replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
      const text = `display${code}Num`;
      return ele[text];
    },
    [receiptsCod]
  );

  // useEffect(() => {
  //   console.log(checkedList, '9999999999');
  //   setA('ccccccc');
  // }, [checkedList.length]);

  const reverseChange = useCallback(
    (checkList) => {
      console.log(checkList);
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
        if (checkList.findIndex((m) => m.value === item.value) === -1) {
          revList.push(item);
        }
      });
      if (checkList.length !== 0) {
        setCheckedList([...revList]);
      }
    },
    [checkedList.length]
  );

  const compositeCheckboxChange = () => {
    compositeChange(checkedList, componentType); // 提供方法供父组件使用勾选数据 compositeChange 参数类型：arr，参数：勾选的数据, componentType: 组件类型(提交：submit， 删除：delete， 打印：print。可自定义类型)
  };

  const seleTre = useMemo(
    () =>
      data.map((item) => {
        return (
          <p style={{ marginBottom: 4 }}>
            <Checkbox
              className="checkbox"
              value={item[multipurposeId]}
              checked={checkedList.findIndex((m) => m.value === item[multipurposeId]) !== -1}
              onChange={(e) => checkBoxChange(e)}
            >
              {firstToUpper(item, receiptsCod)}
            </Checkbox>
          </p>
        );
      }),
    [data, checkedList]
  );
  const content = useMemo(
    () => (
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
            onClick={() => compositeCheckboxChange()}
            disabled={checkedList.length === 0}
            style={{
              backgroundColor: componentType === 'delete' ? 'none' : '#29BECE',
              color: componentType === 'delete' ? 'red' : '#FFFFFF',
              border: componentType === 'delete' ? 'red' : 'none',
              borderWidth: componentType === 'delete' ? '1px' : 'none',
              borderStyle: componentType === 'delete' ? 'solid' : 'none',
            }}
          >
            {btnTitle}
          </Button>
        </div>
      </div>
    ),
    [seleTre]
  );
  const titles = useMemo(
    () => (
      <div>
        <div style={{ float: 'left', color: '#36C2CF' }}>
          <span>
            <a onClick={() => checkBoxAllChange()}>
              {intl.get('sinv.receiptWorkbench.view.title.detail.checkAll').d('全选')}
            </a>
          </span>
        </div>
        <div style={{ float: 'left', marginLeft: 8, color: '#36C2CF' }}>
          <span>
            <a onClick={() => reverseChange(checkedList)}>
              {intl.get('sinv.receiptWorkbench.view.title.detail.checkOpposite').d('反选')}
            </a>
          </span>
        </div>
        <div style={{ float: 'left', marginLeft: 8, color: '#36C2CF' }}>
          <span>
            <a onClick={() => checkBoxAllChangeClear()}>
              {intl.get('sinv.receiptWorkbench.view.title.detail.checkClear').d('清空')}
            </a>
          </span>
        </div>
      </div>
    ),
    []
  );
  return (
    <Popover
      onVisibleChange={() => checkBoxAllChangeClear()}
      placement="leftTop"
      title={titles}
      content={content}
      trigger="hover"
    >
      <Button style={{ border: 'none', fontWeight: 'normal', marginLeft: -15 }}>
        {title}
        <Icon style={{ lineHeight: '100%' }} type="navigate_next" />
      </Button>
    </Popover>
  );
}

/**
 * handleFieldsRender
 * @params val 当前展示 data 后端返回对象，fieldName 当前字段名
 * @remark 处理变更数据的展示提及文字提示（此方法在双单位方法中也有使用）
 * */
export function handleFieldsRender(
  val = null,
  data = {},
  fieldName = '',
  changingFlag = 0,
  editFlag = false,
  feedbackFlag
) {
  const _data1 = Object.keys(data);
  const _data2 = _data1?.some((item) => item === fieldName);
  // if (fieldName === 'unitPackageQuantity') {
  // console.log(_data1, '_data1');
  // console.log(_data2, '_data2');
  //   // console.log(Number(changingFlag) === 1, 'changingFlag');
  // }
  if (feedbackFlag) {
    return <span style={{ color: 'red' }}>{val || '-'}</span>;
  }
  if (_data2 && Number(changingFlag) === 1 && !editFlag) {
    const dataFlag = isNaN(data[fieldName]) && !isNaN(Date.parse(data[fieldName]));
    const fieldData = dataFlag
      ? moment(data[fieldName]).format('YYYY-MM-DD') || '-'
      : !isNil(data[fieldName])
      ? String(data[fieldName])
      : '-';
    const _fields = (
      <>
        <span>
          <span style={{ fontWeight: 600 }}>
            {`${intl
              .get('slod.deliveryWorkbench.model.common.beforeChange')
              .d('变更前：')}${fieldData}`}
          </span>
        </span>
      </>
    );
    return (
      <Tooltip title={_fields}>
        <span style={{ cursor: 'pointer', color: 'red' }}>{val || '-'}</span>
      </Tooltip>
    );
  } else {
    return val;
  }
}

export function handleFieldsFormRender(val = null, data = {}, fieldName = '', editFlag = false) {
  const _data1 = Object.keys(data);
  const _data2 = _data1?.some((item) => item === fieldName);
  if (_data2 && !editFlag) {
    const dataFlag = isNaN(data[fieldName]) && !isNaN(Date.parse(data[fieldName]));
    const fieldData = dataFlag
      ? // ? moment(data[fieldName]).format('YYYY-MM-DD hh:mm:ss') || '-'
        data[fieldName] || '-'
      : !isNil(data[fieldName])
      ? String(data[fieldName])
      : '-';
    const _fields = (
      <>
        <span>
          <span style={{ fontWeight: 600 }}>
            {`${intl
              .get('slod.deliveryWorkbench.model.common.beforeChange')
              .d('变更前：')}${fieldData}`}
          </span>
        </span>
      </>
    );
    return (
      <Tooltip title={_fields}>
        <span style={{ cursor: 'pointer', color: 'red' }}>{val || '-'}</span>
      </Tooltip>
    );
  } else {
    return val;
  }
}
