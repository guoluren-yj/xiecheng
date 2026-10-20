/**
 * index.js - 电子发票
 * @date: 2019-9-19
 * @author: zhutian <tian.zhu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { connect } from 'dva';
import queryString from 'querystring';
import React, { Component, Fragment } from 'react';
import { Form, Button, Spin, Carousel, Icon } from 'hzero-ui';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import { Bind, Throttle } from 'lodash-decorators';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import { routerRedux } from 'dva/router';

import styles from './index.less';
import ListOfGoods from './ListOfGoods';
import Invoice from './Invoice';

const buttonPrompt = 'sfin.common.view.button';
const titlePrompt = 'sfin.common.view.title';

@Form.create({ fieldNameProp: null })
@connect(({ loading, invoice }) => ({
  fetchPreviewLoading: loading.effects['invoice/fetchPreviewData'],
  fetchInvoiceLoading: loading.effects['invoice/fetchInvoiceData'],
  confirmeInvoiceLoading: loading.effects['invoice/confirmeInvoice'],
  printDetailListLoading: loading.effects['invoice/printDetailList'],
  printInvoiceLoading: loading.effects['invoice/printInvoice'],
  invoice,
}))
@formatterCollections({
  code: [
    'sprm.invoice',
    'sprm.common',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'sfin.invoiceBill',
    'sfin.invoiceCheck',
    'hocr.commonOcr',
    'ssrc.bidHall',
    'sfin.common',
    'sfin.invoiceInspection',
    'hzero.c7nUI',
    'hitf.common',
    'srm.oauth',
  ],
})
export default class InvoiceView extends Component {
  constructor(props) {
    super(props);
    const {
      location: { search },
    } = this.props;
    const {
      invoiceHeaderId,
      taxInvoiceLineId,
      invoiceTypeCode,
      isPreview,
      type,
    } = queryString.parse(search.substr(1));
    this.state = {
      invoiceHeaderId,
      taxInvoiceLineId,
      invoiceTypeCode,
      isPreview,
      type,
      listFlag: false,
      allData: [], // 所有发票数据
      singleInvoiceData: {}, // 当前单张发票数据
    };
    this.carousel = React.createRef();
  }

  componentDidMount() {
    const { isPreview } = this.state;
    if (isPreview) {
      this.fetchPreviewData();
    } else {
      this.fetchInvoiceData();
    }
  }

  componentDidUpdate() {
    const nav = document.querySelectorAll('.anticon-menu-fold');
    const content = document.querySelectorAll('.ant-tabs-tabpane-active .page-content');
    const isCollapsed = nav.length === 0;
    const hasContent = content.length > 0;
    if (!hasContent) return;
    const slickDots = document.querySelectorAll('.slick-dots');
    if (slickDots.length === 0) return;
    slickDots[0].style.left = `${(isCollapsed ? 80 : 220) + 16}px`;
    slickDots[0].style.width = `${content[0].scrollWidth}px`;
  }

  /**
   * 查询预览发票数据
   */
  @Bind()
  fetchPreviewData() {
    const { dispatch } = this.props;
    const { invoiceHeaderId, invoiceTypeCode } = this.state;
    dispatch({
      type: 'invoice/fetchPreviewData',
      payload: {
        invoiceHeaderId,
        invoiceTypeCode,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          allData: res,
          singleInvoiceData: res[0],
        });
        const dataList = this.handleInvoiceData(res[0]);
        if (dataList && dataList.length > 1) {
          this.setState({
            listFlag: true,
          });
        }
      }
    });
  }

  /**
   * 查询真实发票数据
   */
  @Bind()
  fetchInvoiceData() {
    const { dispatch } = this.props;
    const { invoiceHeaderId = null, taxInvoiceLineId = null } = this.state;
    dispatch({
      type: 'invoice/fetchInvoiceData',
      payload: {
        invoiceHeaderId,
        taxInvoiceLineId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          allData: res,
          singleInvoiceData: res[0],
          invoicePrintStatus: res[0].invoicePrintStatus, // 发票打印状态
          listPrintStatus: res[0].listPrintStatus, // 销货清单打印状态
        });
        const dataList = this.handleInvoiceData(res[0]);
        if (dataList && dataList.length > 1) {
          this.setState({
            listFlag: true,
          });
        }
      }
    });
  }

  /**
   *  预览页确认开票
   */
  @Bind()
  @Throttle(1000)
  handleConfirme() {
    const { dispatch } = this.props;
    const { invoiceHeaderId, invoiceTypeCode } = this.state;
    dispatch({
      type: 'invoice/confirmeInvoice',
      payload: {
        invoiceHeaderId,
        invoiceTypeCode,
      },
    }).then((res) => {
      if (res) {
        notification.success();
        this.handleCancel();
      }
    });
  }

  /**
   *  处理字符串长度
   *  @param {String} str 字符串
   *  @return {Number} 字符串长度
   */
  @Bind()
  getStrLength(str) {
    // eslint-disable-next-line no-control-regex
    const reg = /[^\x00-\xff]/gi;
    if (str) {
      const cArr = str.match(reg);
      return str.length + (cArr == null ? 0 : cArr.length);
    } else {
      return 0;
    }
  }

  @Bind()
  handleInvoiceData(singleInvoiceData = {}, maxHeight = 201) {
    if (!isEmpty(singleInvoiceData)) {
      const { invoiceLines = [] } = singleInvoiceData;
      // 每行文字的高度
      const TEXT_HIGHT = 18;
      // 每个li内部的padding高度
      const PADDING = 16;

      // 规定一行能够显示的字符总数
      // const BASE_TEXT = '*软饮料*可口可乐 330ml*6罐/组 6连';
      const BASE_TEXT = 33;
      // 一行的字符总数 中文*2
      const BASE_LEN = this.getStrLength(BASE_TEXT);
      // 存储超过最大长度的数据下标
      const IndexArr = [];

      // 每条数据所占高度的集合
      const EachLineHightLists = invoiceLines.map((item) => {
        // 获取每个item内的数据字符串
        const str = item.itemName;
        const lineCounter = Math.ceil(this.getStrLength(str) / BASE_LEN); // 向上取整，虽不足一行单超出也算一行
        return lineCounter * TEXT_HIGHT + PADDING;
      });

      EachLineHightLists.reduce((total, currentVal, currentIndex) => {
        let currentHight = total + currentVal;
        if (currentHight >= maxHeight) {
          IndexArr.push(currentIndex);
          currentHight = currentVal;
        }
        return currentHight;
      }, 0);

      // 添加最后一个数据
      IndexArr.push(invoiceLines.length);

      const dataList = []; // 分页
      let counter = 0;
      IndexArr.map((item, index) => {
        dataList[index] = invoiceLines.slice(counter, item);
        counter = item;
        return dataList;
      });
      return dataList;
    }
  }

  /**
   *  显示清单数据
   *  @param {Object} singleInvoiceData 单张发票数据
   */
  @Bind()
  showDataList(singleInvoiceData = {}) {
    const dataList = this.handleInvoiceData(singleInvoiceData, 820);
    let netAmountSum = 0;
    let taxAmountSum = 0;
    let footInfoFormProps = {};
    const DomList = [];
    dataList.map((list, index) => {
      netAmountSum = list.reduce((total, currentValue) => {
        return math.plus(total, currentValue.netAmount);
      }, 0);
      taxAmountSum = list.reduce((total, currentValue) => {
        return math.plus(total, currentValue.taxAmount);
      }, 0);
      footInfoFormProps = {
        dataSource: list,
        formData: singleInvoiceData,
        netAmountSum,
        taxAmountSum,
        currentPage: index,
        totalPage: dataList.length,
      };
      DomList.push(<ListOfGoods {...footInfoFormProps} />);
      return true;
    });
    return DomList;
  }

  /**
   *  发票切换
   *  @param {String} current 当前页
   */
  @Bind()
  invoiceOnChange(current) {
    const { allData = [] } = this.state;
    this.setState(
      {
        singleInvoiceData: allData[current],
        listFlag: false,
        invoicePrintStatus: allData[current] ? allData[current].invoicePrintStatus : '', // 发票打印状态
        listPrintStatus: allData[current] ? allData[current].listPrintStatus : '', // 销货清单打印状态
      },
      () => {
        const dataList = this.handleInvoiceData(allData[current]);
        if (dataList && dataList.length > 1) {
          this.setState({
            listFlag: true,
          });
        }
      }
    );
  }

  /**
   *  打印
   */
  @Bind()
  @Throttle(1000)
  handlePrint(type) {
    const { dispatch } = this.props;
    const { singleInvoiceData } = this.state;
    dispatch({
      type: type === 'detailList' ? 'invoice/printDetailList' : 'invoice/printInvoice',
      payload: {
        taxInvoiceLineId: singleInvoiceData.taxInvoiceLineId,
      },
    }).then((res) => {
      if (res) {
        this.handleCancel();
      }
    });
  }

  @Bind()
  historyBack() {
    const {
      location: { search },
    } = this.props;
    const { type, invoiceHeaderId } = queryString.parse(search.substr(1));
    let pathname = '';
    switch (type) {
      case 'create':
        pathname = `/sfin/invoice-create/detail/${invoiceHeaderId}`;
        break;
      case 'update':
        pathname = `/sfin/invoice-update/detail/${invoiceHeaderId}`;
        break;
      case 'supplier':
        pathname = `/sfin/invoice-supplier/detail/supplier/${invoiceHeaderId}`;
        break;
      case 'input':
        pathname = '/sfin/input-invoice/list';
        break;
      case 'output':
        pathname = '/sfin/output-invoice/list';
        break;
      case 'invoiceSupplier':
        pathname = `/sfin/invoice-supplier/detail/${invoiceHeaderId}`;
        break;
      default:
        pathname = '';
    }
    return pathname;
  }

  @Bind()
  handleCancel() {
    const { dispatch } = this.props;
    const pathname = this.historyBack();
    dispatch(
      routerRedux.push({
        pathname,
      })
    );
  }

  render() {
    const {
      confirmeInvoiceLoading = false,
      fetchInvoiceLoading = false,
      fetchPreviewLoading = false,
      printDetailListLoading = false,
      printInvoiceLoading = false,
    } = this.props;
    const { listFlag, isPreview, allData, invoicePrintStatus, listPrintStatus, type } = this.state;
    const invoiceInfoFormProps = {
      isPreview,
      hasGoodsList: listFlag,
    };

    const settings = {
      dots: true,
      infinite: false,
      speed: 500,
      appendDots: (dots) => (
        <ul>
          <li onClick={() => this.carousel.current.prev()} style={{ marginRight: '15px' }}>
            <Icon type="left" style={{ fontSize: '20px' }} />
          </li>
          {dots}
          <li onClick={() => this.carousel.current.next()} style={{ marginLeft: '15px' }}>
            <Icon type="right" style={{ fontSize: '20px' }} />
          </li>
        </ul>
      ),
    };

    return (
      <Fragment>
        <Header title={intl.get(`${titlePrompt}.invoice`).d('发票')} backPath={this.historyBack()}>
          {isPreview ? (
            <Fragment>
              <Button
                onClick={this.handleConfirme}
                type="primary"
                loading={confirmeInvoiceLoading}
                icon="check"
              >
                {intl.get(`hzero.common.button.ok`).d('确定')}
              </Button>
              <Button onClick={this.handleCancel} icon="rollback">
                {intl.get(`hzero.common.button.cancel`).d('取消')}
              </Button>
            </Fragment>
          ) : type !== 'input' ? (
            <Fragment>
              <Button
                onClick={() => this.handlePrint('invoice')}
                icon="printer"
                type="primary"
                disabled={
                  !allData || invoicePrintStatus === 'PRINTING' || invoicePrintStatus === 'SUCCESS'
                }
                loading={printInvoiceLoading}
              >
                {intl.get(`${buttonPrompt}.printInvoice`).d('打印发票')}
              </Button>
              <Button
                onClick={() => this.handlePrint('detailList')}
                icon="printer"
                disabled={
                  !listFlag || listPrintStatus === 'SUCCESS' || listPrintStatus === 'PRINTING'
                }
                loading={printDetailListLoading}
              >
                {intl.get(`${buttonPrompt}.printDetailList`).d('打印销货清单')}
              </Button>
            </Fragment>
          ) : null}
        </Header>

        <Content>
          <Spin
            spinning={
              fetchPreviewLoading ||
              fetchInvoiceLoading ||
              printDetailListLoading ||
              printInvoiceLoading
            }
            wrapperClassName={classnames(
              styles['invoice-verification-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            <Carousel
              ref={this.carousel}
              afterChange={(current) => this.invoiceOnChange(current)}
              {...settings}
            >
              {allData.map((item) => (
                <div>
                  <Invoice {...invoiceInfoFormProps} FormData={item} />
                  {listFlag && this.showDataList(item)}
                </div>
              ))}
            </Carousel>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
