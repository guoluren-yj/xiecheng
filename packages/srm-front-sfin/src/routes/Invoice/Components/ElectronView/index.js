/* eslint-disable jsx-a11y/iframe-has-title */
/**
 * InvoiceView.js - SRM 发票轮播
 * @date: 2019-09-20
 * @author: yangou <ou.yang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import React, { Component, createRef, Fragment, useRef, useState, useEffect } from 'react';
import { connect } from 'dva';

import { Carousel, Spin, Icon } from 'hzero-ui';
import classnames from 'classnames';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import queryString from 'querystring';

import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';

import styles from './index.less';

@connect(({ loading, invoice }) => ({
  fetchInvoiceViewLoading: loading.effects['invoice/fetchInvoiceView'],
  invoice,
}))
@formatterCollections({
  code: ['sfin.invoiceBill'],
})
export default class PDF extends Component {
  constructor(props) {
    super(props);
    // const {
    //   location: { search },
    // } = this.props;
    // const { invoiceHeaderId = 36 } = queryString.parse(search.substr(1));
    this.state = {
      viewData: [],
    };
    this.myRef = createRef();
    this.active = 0;
  }

  @Bind()
  setheight() {
    const node = this.myRef.current || {};
    const height = `${(node.clientHeight || node.offsetHeight || 800) - 22}px`;
    this.setState({
      height,
    });
  }

  componentDidMount() {
    this.setheight();
    window.onresize = this.setheight;
    this.fetchInvoiceView();
  }

  /**
   * 查询预览发票数据
   */
  @Bind()
  fetchInvoiceView() {
    const {
      dispatch,
      location: { search },
    } = this.props;
    const payload = queryString.parse(search.substr(1));
    dispatch({
      type: 'invoice/fetchInvoiceView',
      payload,
    }).then((res) => {
      if (res) {
        this.setState({
          viewData: res || [],
        });
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

  slickGoTo(value, e) {
    const { viewData } = this.state;
    e.stopPropagation();
    let val = value + this.active;
    if (val < 0) {
      val = viewData.length - 1;
    }
    if (val > viewData.length - 1) {
      val = 0;
    }
    this.carousel.innerSlider.slickGoTo(val);
  }

  render() {
    const { fetchInvoiceViewLoading = true } = this.props;
    const { viewData } = this.state;
    const settings = {
      dots: true,
      infinite: true,
      speed: 300,
      slidesToShow: 1,
      slidesToScroll: 1,
      lazyLoad: true,
      beforeChange: (_, next) => {
        this.active = next < 0 ? 0 : next;
      },
      customPaging: (i) => (
        <div className={styles.pic}>
          {i === 0 && (
            <div className={styles.left} onClick={(e) => this.slickGoTo(-1, e)}>
              <Icon type="left" />
            </div>
          )}
          <div className={classnames(styles.lider, i === this.active && styles.active)} />
          {i === viewData.length - 1 && (
            <div className={styles.right} onClick={(e) => this.slickGoTo(1, e)}>
              <Icon type="right" />
            </div>
          )}
        </div>
      ),
      appendDots: (dots) => {
        return (
          <div
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              height: '40px',
              margin: '0px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ul style={{ margin: '0px', display: 'flex', alignItems: 'center' }}> {dots} </ul>
          </div>
        );
      },
    };
    const { height } = this.state;
    return (
      <Fragment>
        <Header
          title={intl.get('sfin.invoiceBill.view.title.electricInvoiceRolls').d('电子发票轮播')}
          backPath={this.historyBack()}
        />
        <div className={styles.content}>
          <div ref={this.myRef} className={styles.content}>
            <Spin spinning={fetchInvoiceViewLoading}>
              <Carousel
                ref={(carousel) => {
                  this.carousel = carousel;
                }}
                {...settings}
              >
                {viewData.map((data) => (
                  <PDFs height={height} src={data} />
                ))}
              </Carousel>
            </Spin>
          </div>
        </div>
      </Fragment>
    );
  }
}

const PDFs = ({ height, src }) => {
  const iframeNode = useRef(null);
  const [sp, setsp] = useState(true);
  useEffect(() => {
    iframeNode.current.onload = () => setsp(false);
    setTimeout(() => {
      setsp(false);
    }, 5000);
  }, []);
  return (
    <Spin spinning={sp}>
      <div style={{ height, overflow: 'scroll' }}>
        <img
          alt={intl.get('sfin.invoiceBill.view.invoicePreviews').d('发票预览')}
          ref={iframeNode}
          width="100%"
          src={src}
        />
      </div>
    </Spin>
  );
};
