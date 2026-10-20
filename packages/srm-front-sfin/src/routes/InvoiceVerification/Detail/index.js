/*
 * index - 发票查验明细页面
 * @date: 2019-07-24
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { connect } from 'dva';
import React, { PureComponent, Fragment } from 'react';
import { Button, Spin, Form, Row, Col } from 'hzero-ui';

// import { isEmpty, omit, merge } from 'lodash';
import { isEmpty } from 'lodash';
import classnames from 'classnames';
import { Bind, Throttle } from 'lodash-decorators';
import querystring from 'querystring';

import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import { DETAIL_DEFAULT_CLASSNAME, FORM_COL_3_LAYOUT } from 'utils/constants';
import { dateTimeRender } from 'utils/renderer';

import styles from './index.less';
import ListOfGoods from './ListOfGoods';
import ElectronicInvoice from './ElectronicInvoice';
import DisplayFormItem from '../../components/DisplayFormItem';

const commonPrompt = 'sfin.invoiceInspection.model';

/**
 * Detail - 发票查验明细页面
 * @extends {Component} - React.Component
 * @reactProps {Object} [loading={}] - 当前路由信息
 * @reactProps {Object} [FethchData={}] - 数据源
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ loading, invoiceVerification }) => ({
  FethchData: loading.effects['invoiceVerification/verCheckDetailQuery'],
  printLoading: loading.effects['invoiceVerification/print'],
  invoiceVerification,
}))
@formatterCollections({
  code: [
    'sprm.invoiceVerification',
    'sprm.common',
    'sfin.inputInvoice',
    'entity.organization',
    'entity.attachment',
    'entity.company',
    'entity.business',
    'entity.item',
    'sfin.invoiceBill',
    'hocr.commonOcr',
    'ssrc.bidHall',
  ],
})
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    const {
      history: {
        location: { search },
      },
    } = this.props;
    const { taxInvoiceCheckId, checkInfoId } = querystring.parse(search.substr(1));
    // const prHeaderId = search.substr(1).match(/\d/g)[0];
    this.state = {
      data: {},
      checkInfoId,
      taxInvoiceCheckId,
      listFlag: false,
      organizationId: getCurrentOrganizationId(),
    };
  }

  /**
   * componentDidMount 生命周期函数
   * render后请求页面数据
   */
  componentDidMount() {
    this.fetchEnum();
  }

  /**
   * 查询详情的数据
   */
  @Bind()
  fetchEnum() {
    const { dispatch } = this.props;
    const { checkInfoId, organizationId } = this.state;
    const checkInfoIdS = checkInfoId || 2;
    return dispatch({
      type: 'invoiceVerification/verCheckDetailQuery',
      payload: {
        checkInfoId: checkInfoIdS,
        organizationId,
      },
    }).then((res) => {
      if (res) {
        this.setState({
          data: res,
        });
      }
    });
  }

  /**
   * 获取url过来的值
   */
  @Bind()
  gitLocationSearch() {
    const {
      history: {
        location: { search },
      },
    } = this.props;
    return querystring.parse(search.substr(1));
  }

  @Bind()
  handleModalVisible(modalVisible, flag) {
    this.setState({ [modalVisible]: !!flag });
  }

  /**
   * 打印功能
   */
  @Bind()
  handlePrint() {
    const { taxInvoiceCheckId } = this.state;
    const { dispatch } = this.props;
    dispatch({
      type: 'invoiceVerification/print',
      taxInvoiceCheckId,
    }).then((res) => {
      if (!res) return;
      const reader = new FileReader();
      reader.onload = () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([res], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          const printWindow = window.open(fileURL);
          if (printWindow?.print) {
            printWindow.print();
          }
        }
      };
      reader.readAsText(res);
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
    const cArr = `${str}`.match(reg);
    return `${str}`.length + (cArr == null ? 0 : cArr.length);
  }

  /**
   *  数据显示业务逻辑处理函数
   *  @param {Array} data Table的dataSoure
   *  @param {Boolean} isNotDetailPage 是ElectronicInvoice还是ListOfGoods页面使用
   */
  @Bind()
  PrintDataList(data = {}, isNotDetailPage = true) {
    let maxHeight = 808;
    if (!isEmpty(data)) {
      const { metaDataObj } = data || {};
      const { data: metaData } = metaDataObj || {};
      const { invoiceList = [] } = metaData || {};
      // 每行文字的高度
      const TEXT_HIGHT = 17;
      if (isNotDetailPage) {
        // 显示行最大高度
        maxHeight = 316;
      }

      // 一行能够显示的字符总数
      // const BASE_TEXT = '*软饮料*可口可乐 330ml*6罐/组 6连';
      const BASE_TEXT = 33;
      const BASE_LEN = this.getStrLength(BASE_TEXT);
      // 每个li内部的padding高度
      const PADDING = 16;
      // 存储超过最大长度的数据下标
      const IndexArr = [];

      const EachLineHightLists = invoiceList.map((item) => {
        // 获取每个item内的数据字符串
        const str = item.commodityName;
        const lineCounter = Math.ceil(this.getStrLength(str) / BASE_LEN);
        return lineCounter * TEXT_HIGHT + PADDING;
      });

      EachLineHightLists.reduce((total, currentVal, index) => {
        let currentHight = total + currentVal;
        if (currentHight >= maxHeight) {
          IndexArr.push(index);
          currentHight = currentVal;
        }
        return currentHight;
      }, 0);

      // 添加最后一个数据的下标
      IndexArr.push(invoiceList.length - 1);

      let footInfoFormProps = {};
      const dataList = [];
      const DomList = [];

      let counter = 0;
      IndexArr.map((item, index) => {
        dataList[index] = invoiceList.slice(counter, IndexArr[index]);
        counter = IndexArr[index];
        return item;
      });

      if (!isNotDetailPage) {
        let subTotalPrice = 0;
        dataList.map((list) => {
          subTotalPrice = list.reduce((total, currentValue) => {
            return total + (currentValue.amount ? +currentValue.amount : 0);
          }, 0);

          footInfoFormProps = {
            dataList: list,
            FormData: data.metaDataObj,
            sum: subTotalPrice,
          };

          if (dataList.length > 0) {
            DomList.push(<ListOfGoods {...footInfoFormProps} />);
          }
          return list;
        });
        return DomList;
      } else {
        if (dataList.length > 1) {
          this.setState({
            listFlag: true,
          });
        }
        return dataList[0];
      }
    }
  }

  render() {
    const { data, listFlag } = this.state;
    const { invoiceNum } = this.gitLocationSearch();
    const { FethchData, printLoading } = this.props;
    const FormData = data.metaDataObj || {};

    this.PrintDataList(data, true);

    const headerInfoFormProps = {
      FormData,
      isMoreThenEight: listFlag,
    };

    const { checkCount, checkTime } = data;
    return (
      <Fragment>
        <Header
          title={intl.get(`${commonPrompt}.invoiceDetail`).d('发票查验明细')}
          backPath="/sfin/invoice-verification/list"
        >
          <Button
            onClick={() => Throttle(this.handlePrint(), 2000)}
            icon="printer"
            type="primary"
            loading={printLoading}
          >
            {intl.get(`hzero.common.button.print`).d('打印')}
          </Button>
        </Header>
        <Content>
          <Spin
            spinning={FethchData}
            wrapperClassName={classnames(
              styles['invoice-verification-detail'],
              DETAIL_DEFAULT_CLASSNAME
            )}
          >
            <div className={styles['header-row']}>
              <Row>
                <Col {...FORM_COL_3_LAYOUT}>
                  <DisplayFormItem
                    label={intl.get(`${commonPrompt}.numberOfInspections`).d('查验次数')}
                    value={checkCount}
                  />
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <DisplayFormItem
                    label={intl.get(`${commonPrompt}.inspectionTime`).d('查验时间')}
                    value={dateTimeRender(checkTime)}
                  />
                </Col>
                <Col {...FORM_COL_3_LAYOUT}>
                  <DisplayFormItem
                    label={intl.get(`${commonPrompt}.SRMInvoiceNumber`).d('SRM发票号')}
                    value={invoiceNum}
                  />
                </Col>
              </Row>
              {/* <Row className={styles['special-msg']}>
                特别提示：本平台仅提供所查询发票票面信息的查验结果、发票信息合规校对、入账重复性校验。
              </Row> */}
            </div>

            <ElectronicInvoice {...headerInfoFormProps} />
            {listFlag && this.PrintDataList(data, false)}
            <Row className={styles['special-msg']}>
              {intl
                .get(`sfin.invoiceBill.verify.specificNote`)
                .d(
                  '特别提示：本平台仅提供所查询发票票面信息的查验结果、发票信息合规校对、入账重复性校验。'
                )}
            </Row>
          </Spin>
        </Content>
      </Fragment>
    );
  }
}
