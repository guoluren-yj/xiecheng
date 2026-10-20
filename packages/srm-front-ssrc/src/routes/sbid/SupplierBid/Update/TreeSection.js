import React, { Component } from 'react';
import { Tag } from 'hzero-ui';
import intl from 'utils/intl';
import { map } from 'lodash';
import moment from 'moment';
import { Bind } from 'lodash-decorators';

import style from './Header.less';

const promptCode = 'ssrc.supplierBid';

class NormalSection extends Component {
  constructor(props) {
    super(props);
    this.state = {
      defaultNode: {}, // 默认节点
    };
  }

  /**
   *  初始化树结构，默认展开树，子节点
   */
  componentDidMount() {
    const { expand, expandDefaultList } = this.props;
    this.setState({
      defaultNode: { [expand]: [expand] },
    });
    // 初始化form表单数据
    this.setFormFields(expandDefaultList);
  }

  /**
   * 设置form 字段属性值
   */
  @Bind()
  setFormFields(item) {
    const { form } = this.props;
    form.setFieldsValue({
      currentQuotationPrice: item.currentQuotationPrice, // 单价
      currentQuotationQuantity: item.currentQuotationQuantity, // 可供数量
      currentDeliveryCycle: item.currentDeliveryCycle, // 供货周期
      currentPromisedDate: item.currentPromisedDate && moment(item.currentPromisedDate), // 承诺交付日期
      taxRate: item.taxRate, // 修改税率
      taxId: item.taxId, // 修改税率Id
      taxAmount: item.taxAmount, // 税额
      netPrice: item.netPrice, // 不含税单价
      netAmount: item.netAmount, // 不含税总金额
      totalAmount: item.totalAmount, // 总金额
      currentQuotationRemark: item.currentQuotationRemark, // 备注
      // sectionAmount: item.sectionAmount, // 标段/包总金额
      // abandonedFlag: item.abandonedFlag, // 放弃标识
      // currentAttachmentUuid: item.currentAttachmentUuid, // 标段/包投标文件
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

  @Bind()
  handleClickTree = (item) => {
    const { dispatch } = this.props;
    this.setState({
      defaultNode: {
        [item.quotationLineId]: [item.quotationLineId],
      },
    });
    // 设置form表单元素
    this.setFormFields(item);
    dispatch({
      type: 'supplierBid/queryBiddingQuotationLine',
      payload: {
        quotationLineId: item.quotationLineId,
      },
    });
  };

  @Bind()
  renderTableInfo(item) {
    const { defaultNode } = this.state;
    return (
      <div
        className={
          defaultNode[item.quotationLineId] ? style.leftNormalListActive : style.leftNormalList
        }
        onClick={() => this.handleClickTree(item)}
      >
        <div className={style.translation}>
          <div className={style.listTop}>
            <div className={style.rfxLineItemNumLeft}>
              {intl.get(`${promptCode}.model.supplierBid.lineNo.`).d('行号')}:{item.bidLineItemNum}
            </div>
            <div className={style.tagRight}>{this.quotationLineStatusTableColor(item)}</div>
            <div style={{ clear: 'both' }} />
          </div>
          <div className={style.listBottom}>
            <div className={style.itemCodeStyle}>
              {/* 标段编号*标段名称 */}
              {item.itemCode ? `${item.itemCode}-` : null}
              {item.itemName ? item.itemName : null}
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
                {item.totalAmount ? <img src={require('@/assets/money.svg')} alt="" /> : null}
              </span>
              <span style={{ color: '#FF913C', marginLeft: '5px' }}>
                {item.totalAmount ? `${item.totalAmount.toFixed(2)}` : null}
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

  render() {
    const { normalData } = this.props;
    return (
      <div>
        {map(normalData, (item) => {
          return this.renderTableInfo(item);
        })}
      </div>
    );
  }
}

export default NormalSection;
