import React, { Component } from 'react';
import { Tag } from 'hzero-ui';
import { map } from 'lodash';
import intl from 'utils/intl';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import style from './Header.less';

const promptCode = 'ssrc.supplierBid';

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultNode: {}, // 默认父节点
      defaultChildNode: {}, // 默认子节点
    };
  }

  /**
   *  初始化树结构，默认展开树，子节点
   */
  componentDidMount() {
    const { expand, expandChildren, expandParentList, expandDefaultList } = this.props;
    if (expand) {
      this.setState({
        defaultNode: { [expand]: [expand] },
        defaultChildNode: { [expandChildren]: [expandChildren] },
      });
      // 初始化form表单数据
      this.setFormFields(expandDefaultList, expandParentList);
    }
  }

  /**
   * 设置form 字段属性值
   */
  @Bind()
  setFormFields(child, parent) {
    const { form } = this.props;
    form.setFieldsValue({
      currentQuotationPrice: child.currentQuotationPrice, // 单价
      currentQuotationQuantity: child.currentQuotationQuantity, // 可供数量
      currentDeliveryCycle: child.currentDeliveryCycle, // 供货周期
      currentPromisedDate: child.currentPromisedDate && moment(child.currentPromisedDate), // 承诺交付日期
      taxRate: child.taxRate, // 修改税率
      taxId: child.taxId, // 修改税率Id
      taxAmount: child.taxAmount, // 税额
      netPrice: child.netPrice, // 不含税单价
      netAmount: child.netAmount, // 不含税总金额
      totalAmount: child.totalAmount, // 总金额
      currentQuotationRemark: child.currentQuotationRemark, // 备注
      sectionAmount: parent.sectionAmount, // 标段/包总金额
      abandonedFlag: parent.abandonedFlag, // 放弃标识
      currentAttachmentUuid: parent.currentAttachmentUuid, // 标段/包投标文件
    });
  }

  /**
   * render-投标状态
   */
  /**
   *  quotationLineStatusTablcColor - 列表行状态颜色变化
   *  NEW-新建，SUBMITTED-已报价， ABANDONED-放弃, TAKENBACK-收回，BARGAINED-已还价
   */
  @Bind()
  quotationLineStatusTableColor(item) {
    let color = '';
    let backGround = '';
    switch (item.quotationLineStatus) {
      case 'NEW':
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
      case 'SUBMITTED':
        color = '#0687FF';
        backGround = '#DAEDFE';
        break;
      case 'ABANDONED':
        color = '#A3A3A3';
        backGround = '#E5E5E5';
        break;
      case 'TAKEN_BACK':
        color = '#A3A3A3';
        backGround = '#E5E5E5';
        break;
      case 'BARGAINED':
        color = '#FF913C';
        backGround = '#FFC800';
        break;
      default:
        color = '#5867dd';
        backGround = '#5867dd';
    }
    return (
      <Tag
        style={{
          width: '52px',
          textAlign: 'center',
          backgroundColor: backGround,
          color,

          border: 0,
        }}
      >
        {item.quotationLineStatusMeaning}
      </Tag>
    );
  }

  // 处理树形结构逻辑
  @Bind()
  handleClickTree = (item) => {
    const { dispatch } = this.props;
    const { defaultNode } = this.state;
    // 展开或收起子类元素,取反逻辑
    if (item.children) {
      // 设置当前state父节点默认值isParentIdSame，ES6 [X] 默认声明变量
      const [isParentIdSame] = defaultNode[item.bidLineItemId] || [];
      if (isParentIdSame) {
        // 判断当前父节点与state中的父节点是否相同
        if (item.bidLineItemId === isParentIdSame) {
          this.setState({
            defaultNode: {
              ...defaultNode,
              [item.bidLineItemId]: ![item.bidLineItemId],
            },
          });
        }
      } else {
        // 父节点不匹配时，展开新的父子节点，并记录父节点
        this.setState({
          defaultNode: {
            ...defaultNode,
            [item.bidLineItemId]: [item.bidLineItemId],
          },
        });
      }
    } else {
      // 同一父节点下，操作子节点,重新查询子节点接口
      dispatch({
        type: 'supplierBid/queryBiddingQuotationLine',
        payload: {
          quotationLineId: item.quotationLineId,
        },
      });
      // 查询父节点
      dispatch({
        type: 'supplierBid/queryBiddingQuotationParentLine',
        payload: {
          quotationLineId: item.quotationLineParentId,
        },
      }).then((res) => {
        if (res) {
          // 设置form表单元素
          this.setFormFields(item, res);
        }
      });
      // 是否需要设置form表单元素
      this.setState({
        defaultChildNode: {
          [item.bidLineItemId]: [item.bidLineItemId],
        },
      });
    }
  };

  itemDetail(item) {
    const { defaultChildNode } = this.state;
    return (
      <div
        onClick={() => this.handleClickTree(item)}
        className={defaultChildNode[item.bidLineItemId] ? style.leftHover : style.leftDefault}
        style={{
          background: defaultChildNode[item.bidLineItemId]
            ? '#F8F8F8'
            : item.children
            ? '#FFFFFF'
            : '#F8F8F8',
          borderBottom: item.children ? '1px solid gainsboro' : null,
        }}
      >
        <div className={style.translation} style={{ marginLeft: item.children ? null : '32px' }}>
          <div className={style.listTop}>
            <div className={style.rfxLineItemNumLeft}>
              {item.parentSectionNum
                ? `${intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号')}:${
                    item.parentSectionNum
                  }.${item.bidLineItemNum}`
                : `${intl.get(`${promptCode}.model.supplierBid.section`).d('标段')}:${
                    item.bidLineItemNum
                  }`}
            </div>
            <div className={style.tagRight}>{this.quotationLineStatusTableColor(item)}</div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className={style.listBottom}>
            <div className={style.itemCodeStyle}>
              {/* 标段编号*标段名称 */}
              {item.itemCode ? `${item.itemCode}-` : item.sectionNum ? `${item.sectionNum}-` : null}
              {item.itemName ? item.itemName : item.sectionName ? item.sectionName : null}
            </div>
          </div>
          <div className={style.listBottom}>
            <div className={style.carLeft}>
              <span>
                {item.freightIncludedFlag === 1 ? (
                  <img src={require('@/assets/freight.svg')} alt="" />
                ) : null}
              </span>
              <span style={{ marginLeft: '5px' }}>
                {item.sectionAmount ? (
                  <img src={require('@/assets/money.svg')} alt="" />
                ) : item.totalAmount ? (
                  <img src={require('@/assets/money.svg')} alt="" />
                ) : null}
              </span>
              <span style={{ color: '#FF913C', marginLeft: '5px' }}>
                {item.sectionAmount
                  ? `${item.sectionAmount.toFixed(2)}`
                  : item.totalAmount
                  ? `${item.totalAmount.toFixed(2)}`
                  : null}
              </span>
            </div>
            <div className={style.taxRateRight}>
              {item.taxRate
                ? `${intl.get(`${promptCode}.model.supplierBid.taxRate`).d('税率')}:${
                    item.taxRate
                  }%`
                : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  @Bind()
  treeItemCroup(itemGroup) {
    const { defaultNode = {} } = this.state;
    const itemGroupItem = [];
    // 把所有节点放在一个数组里面
    itemGroupItem.push(
      <div>
        {/* 第一个层级 */}
        <div key={itemGroup.bidLineItemId}>{this.itemDetail(itemGroup)}</div>
        {/* 调用tree方法 */}

        {defaultNode[itemGroup.bidLineItemId] ? this.tree(itemGroup.children) : null}
      </div>
    );
    return itemGroupItem;
  }

  tree(children) {
    let treeItem;
    // 如果有子元素
    if (children) {
      // 子元素是数组的形式，把所有的子元素循环出来
      treeItem = children.map((item) => {
        return (
          <div>
            <div>{this.itemDetail(item)}</div>
          </div>
        );
      });
    }
    return treeItem;
  }

  render() {
    const { treeList } = this.props;
    return (
      <div>
        {map(treeList, (item) => {
          return this.treeItemCroup(item);
        })}
      </div>
    );
  }
}

export default Tree;
