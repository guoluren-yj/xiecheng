import React, { Fragment, Component, createElement } from 'react';

import { Popover, Checkbox, Icon } from 'choerodon-ui';
import { Button, Modal, Tooltip } from 'choerodon-ui/pro';
import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import ApproveRecordSimple from 'srm-front-boot/lib/components/ApproveRecordSimple';
import intl from 'utils/intl';
import './index.less';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

// const CheckboxGroup = Checkbox.Group;
/**
 * 普通多行渲染
 * @param {{multiLineFields = [] record, dataSet}} param0 多行表的一些属性，{multiLineFields = [] record, dataSet }
 * @param {[]} custObjList 自义定渲染
 * 格式 [{name: 字段名1, content: 渲染内容(VNODE)}]
 */
export function mutiLineRender({ multiLineFields = [], record, dataSet }, custObjList) {
  const newMultiLineFields = multiLineFields.map((LineField) => {
    const label = `${dataSet.getField(LineField.get('name')).get('label')}:`;
    let mean = {};
    const currentCustObj =
      custObjList &&
      custObjList.length > 0 &&
      custObjList.filter((item) => item.name === LineField.get('name'));
    if (currentCustObj && currentCustObj.length > 0) {
      if (currentCustObj[0].content) {
        mean = {
          label,
          content: currentCustObj[0].content,
        };
      } else {
        mean = null;
      }
    } else {
      mean = {
        label,
        content: (
          <Popover className="popoverContent" content={record.get(LineField.get('name'))}>
            {record.get(LineField.get('name'))}
          </Popover>
        ),
      };
    }
    return mean;
  });

  const renderMultiLineFields = newMultiLineFields.filter(Boolean);

  const renderContent = (contentItems, overFlag) => {
    return overFlag ? (
      <div className="over-content">
        {contentItems &&
          contentItems.length &&
          contentItems.map((item) => (
            <div className="moreContent">
              <span className="multiLineLabel">{item.label}</span>
              {item.content}
            </div>
          ))}
      </div>
    ) : (
      <Fragment>
        {contentItems &&
          contentItems.length &&
          contentItems.map((item) => (
            <div>
              <span className="multiLineLabel">{item.label}</span>
              {item.content}
            </div>
          ))}
      </Fragment>
    );
  };

  if (renderMultiLineFields && renderMultiLineFields.length < 4) {
    return renderContent(renderMultiLineFields);
  } else if (renderMultiLineFields.length > 3) {
    const otherItem = renderMultiLineFields.slice(2);
    return (
      <Fragment>
        {renderContent(renderMultiLineFields.slice(0, 2))}
        <Popover placement="right" content={renderContent(otherItem, true)}>
          <span className="ellipsis">. . .</span>
        </Popover>
      </Fragment>
    );
  }
}

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
    const { data } = this.props;
    const treeList = [];
    let list = [];
    data.forEach((item) => {
      list = item.children.map((n) => {
        return {
          checked: true,
          className: '',
          defaultChecked: false,
          value: n.rcvTrxHeaderId,
          type: 'checkbox',
          prefixCls: 'c7n-checkbox',
        };
      });
      treeList.push(...list);
      this.setState({
        checkedList: treeList,
      });
    });
  };

  checkBoxAllChangeClear = () => {
    this.setState({ checkedList: [] });
  };

  checkBoxChange = (e) => {
    const { checkedList } = this.state;
    const data = e.target;
    if (checkedList.length === 0) {
      this.setState({
        checkedList: [...checkedList, data],
      });
    } else {
      checkedList.forEach((item) => {
        if (data.value !== item.value) {
          this.setState({
            checkedList: [...checkedList, data],
          });
        } else {
          const findList = checkedList.findIndex((n) => n.value === data.value);
          checkedList.splice(findList, 1);
          this.setState({
            checkedList,
          });
        }
      });
    }
  };

  reverseChange = () => {
    const { data } = this.props;
    const { checkedList } = this.state;
    const treeList = [];
    let list = [];
    const revList = [];
    data.forEach((item) => {
      list = item.children.map((n) => {
        return {
          checked: true,
          className: '',
          defaultChecked: false,
          value: n.rcvTrxHeaderId,
          type: 'checkbox',
          prefixCls: 'c7n-checkbox',
        };
      });
      treeList.push(...list);
    });
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

  compositeCheckboxChange = () => {
    const { compositeChange = (e) => e, componentType } = this.props;
    const { checkedList = [] } = this.state;
    compositeChange(checkedList, componentType); // 提供方法供父组件使用勾选数据 compositeChange 参数类型：arr，参数：勾选的数据, componentType: 组件类型(提交：submit， 删除：delete， 打印：print。可自定义类型)
  };

  render() {
    const { data, title, btnTitle } = this.props; // 提供参数给父组件 data：数据 ，title：标题 ， btnTitle：按钮
    const { checkedList } = this.state;
    const seleTre = data.map((item) => {
      const children = item.children.map((n) => {
        return (
          <p style={{ marginBottom: 4 }}>
            <Checkbox
              className="checkbox"
              value={n.rcvTrxHeaderId}
              checked={checkedList.findIndex((m) => m.value === n.rcvTrxHeaderId) !== -1}
              onChange={(e) => this.checkBoxChange(e)}
            >
              {n.trxNum}
            </Checkbox>
          </p>
        );
      });
      return (
        <div>
          <p>
            <div className="sublist">{item.nodeConfigName}</div>
            {children}
          </p>
        </div>
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
            color="primary"
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
      <Fragment>
        <Popover
          onVisibleChange={() => this.checkBoxAllChangeClear()}
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
      </Fragment>
    );
  }
}

export function btnNumber(arr) {
  const showBtns = [];
  const foldBtns = [];
  arr
    .filter((item) => item)
    .filter(Boolean)
    .forEach((btn, index) => {
      const { name, group, btnComp, btnProps = {} } = btn;
      const { funcType, color } = btnProps;
      const newFuncType = funcType || (index === 0 ? 'raised' : 'flat');
      const newColor = color || (index === 0 ? 'primary ' : 'default');
      const pushArr = index <= 5 ? showBtns : foldBtns;
      if (!group && !btnComp) {
        pushArr.push({
          ...btn,
          btnType: 'c7n-pro',
          btnProps: { ...btnProps, funcType: newFuncType, color: newColor, key: name },
        });
      } else {
        pushArr.push(btn);
      }
    });
  return foldBtns.length
    ? [
        ...showBtns,
        {
          name: 'more',
          group: true,
          children: foldBtns,
          child: createElement(Icon, { type: 'more_horiz' }),
        },
      ]
    : showBtns;
}

// 封装通用c7nModal
export function c7nModal(modalProps = {}) {
  return Modal.open({
    movable: false,
    closable: true,
    mask: true,
    maskClosable: false,
    destroyOnClose: true,
    drawer: true,
    ...modalProps,
  });
}

export function getCustomizeCode(tab) {
  const customizeList = [];
  for (let i = 0; i < 11; i++) {
    const index = String.fromCharCode(65 + i);
    switch (tab) {
      case 'one':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.WAIT.${index}`,
          `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.WAIT_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`
        );
        break;

      case 'two':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.COURSE.${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.${index}`,
          `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.COURSE_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${index}`
        );
        break;

      case 'three':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.END.DAN.${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.END.HAN.${index}`,
          `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.END_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${index}`
        );
        break;

      case 'four':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.RETURN.${index}`,
          `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.RETURN_SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${index}`
        );
        break;

      case 'five':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.${index}`,
          `SINV.SUPPLIER_RECEIPT_WORKBENCH_THING.SEARCH`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${index}`
        );
        break;
      default:
        break;
    }
  }
  return customizeList;
}

export function getCustomizeBtnCode(tab) {
  const customizeList = [];
  for (let i = 0; i < 11; i++) {
    const index = String.fromCharCode(65 + i);
    switch (tab) {
      case 'one':
        customizeList.push(`SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`);
        break;
      case 'two':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${index}`
        );
        break;
      case 'three':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${index}`
        );
        break;
      case 'four':
        customizeList.push(`SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${index}`);
        break;
      case 'five':
        customizeList.push(
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${index}`,
          `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${index}`
        );
        break;
      default:
        customizeList.push(`SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`);
        break;
    }
  }
  return customizeList;
}

export function getCustomizeBtnCodes() {
  const customizeList = [];
  for (let i = 0; i < 11; i++) {
    const index = String.fromCharCode(65 + i);
    customizeList.push(
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${index}`,
      `SINV.RECEIPT_WORKBENCH_THING.WAIT.K`,
      `SINV.RECEIPT_WORKBENCH_THING.COURSE.K`,
      `SINV.RECEIPT_WORKBENCH_THING.COURSE.ASN.K`,
      `SINV.RECEIPT_WORKBENCH_THING.END.DAN.K`,
      `SINV.RECEIPT_WORKBENCH_THING.END.HAN.K`,
      `SINV.RECEIPT_WORKBENCH_THING.RETURN.K`,
      `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.COURSE.K`,
      `SINV.RECEIPT_WORKBENCH_THING.CONFIRM.ASN.K`
    );
  }
  return customizeList;
}

// 封装通用删除框
export function confirm({ title, contentStyle, content, onOk, ...otherProps }) {
  return Modal.confirm({
    otherProps,
    contentStyle: contentStyle || { width: '550px' },
    children: <span style={{ fontSize: '12px' }}>{content}</span>,
    title: title || intl.get('hzero.common.message.confirm.title').d('提示'),
    okText: intl.get('hzero.common.button.sure').d('确定'),
    cancelText: intl.get('hzero.common.button.cancel').d('取消'),
    autoCenter: true,
    onOk,
  });
}

export const isSupplier = organizationId !== tenantId; // true供应商 false采购方

export const nodeType = (tabCutPages, viewTypes, courseAsLines, node) => {
  const unitCodeMap = {
    one: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.WAIT_${node}`,
    twod: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE_${node}`, // 按单
    twoh: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.COURSE.ASN_${node}`, // 按行
    threed: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.DAN_${node}`, // 按单
    threeh: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.END.HAN_${node}`, // 按行
    four: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.RETURN_${node}`,
    fived: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM_${node}`, // 按单
    fiveh: `SINV.RECEIPT_WORKBENCH_THING.BUTTON.CONFIRM.ASN.${node}`, // 按行
  };

  if (['one', 'four'].includes(tabCutPages)) {
    return unitCodeMap[tabCutPages];
  } else if (['two'].includes(tabCutPages)) {
    if (!courseAsLines) {
      return unitCodeMap.twod;
    } else {
      return unitCodeMap.twoh;
    }
  } else if (['three'].includes(tabCutPages)) {
    if (viewTypes === 'wide') {
      return unitCodeMap.threed;
    } else {
      return unitCodeMap.threeh;
    }
  } else if (['five'].includes(tabCutPages)) {
    if (!courseAsLines) {
      return unitCodeMap.fived;
    } else {
      return unitCodeMap.fiveh;
    }
  }
  // setUpdataChange(!updataed);
};

// 审批进度
export const progressView = ({ record, dataSet }) => {
  const simpleApprovalHistoryList = dataSet?.getState('simpleApprovalHistoryList') || {};
  return <ApproveRecordSimple data={simpleApprovalHistoryList[record?.get('businessKey')]} />;
};

export function TooltipButton({ tipTitle, buttonText, btnProps = {} }) {
  return (
    <Tooltip title={tipTitle}>
      <Button {...btnProps}>{buttonText}</Button>
    </Tooltip>
  );
}
