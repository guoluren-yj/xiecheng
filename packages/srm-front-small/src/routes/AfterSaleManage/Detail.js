import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Card, Row, Table } from 'hzero-ui';
// import { Table } from 'choerodon-ui';
import { Modal, DataSet, Form, TextArea, TextField, DateTimePicker } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse } from 'utils/utils';

import noProduct from '@/assets/no-product-img.png';

import { fetchSaleDetail, updateSaleStatus, submitWayBill } from './api';
import './custom.less';

const LabelContent = ({ label, content }) => (
  <Row className="small-detail-row">
    <div className="small-detail-label">{label}:</div>
    <div className="small-detail-content">{content}</div>
  </Row>
);

@formatterCollections({
  code: ['small.common', 'small.afterSaleManage'],
})
export default class AfterSaleManage extends Component {
  state = {
    loading: false,
    optionsLoading: false,
    rejectLoading: false,
    submitLoading: false,
    productInfo: [],
    saleInfo: {},
  };

  columns = [
    {
      title: intl.get('small.afterSaleManage.model.afterSaleNum').d('售后申请单号'),
      dataIndex: 'afterSaleNum',
      width: 150,
    },
    {
      title: intl.get('small.afterSaleManage.model.mallPoNum').d('商城订单号'),
      dataIndex: 'poNum',
      width: 150,
    },
    {
      title: intl.get('small.afterSaleManage.model.productImagePath').d('商品主图'),
      dataIndex: 'productImagePath',
      width: 90,
      align: 'center',
      render: (text) => <img style={{ width: 50, height: 50 }} alt="" src={text || noProduct} />,
    },
    {
      title: intl.get('small.afterSaleManage.model.productNum').d('商品编码'),
      dataIndex: 'productNum',
      width: 120,
    },
    {
      title: intl.get('small.afterSaleManage.model.productName').d('商品名称'),
      dataIndex: 'productName',
    },
    {
      title: intl.get('small.afterSaleManage.model.afsTypeName').d('售后类型'),
      dataIndex: 'afsTypeName',
      width: 90,
    },
    {
      title: intl.get('small.afterSaleManage.model.applyQuantity').d('售后数量'),
      dataIndex: 'applyQuantity',
      width: 90,
    },
    {
      title: intl.get('small.afterSaleManage.model.manageStatusName').d('售后状态'),
      dataIndex: 'manageStatusName',
      width: 140,
    },
    {
      title: intl.get('small.afterSaleManage.model.customField').d('说明'),
      dataIndex: 'customField',
      width: 200,
    },
  ];

  rejectFormDs = new DataSet({
    fields: [
      {
        name: 'message',
        type: 'string',
        required: true,
        maxLength: 100,
      },
    ],
  });

  wayBillDs = new DataSet({
    fields: [
      {
        name: 'logisticsCompanyName',
        type: 'string',
        label: intl.get('small.afterSaleManage.model.logisticsCompanyName').d('快递公司'),
        required: true,
      },
      {
        name: 'logisticsNum',
        type: 'string',
        label: intl.get('small.afterSaleManage.model.logisticsNum').d('快递单号'),
        required: true,
      },
      {
        name: 'deliverTime',
        type: 'dateTime',
        label: intl.get('small.afterSaleManage.model.deliverTime').d('发货时间'),
        required: true,
      },
    ],
  });

  @Bind()
  renderOptions(_, record) {
    const { afterSaleWaybillList: billList, afsType } = this.state.saleInfo;
    const optionsMap = {
      APPROVING: [
        {
          text: intl.get('small.afterSaleManage.model.pass').d('审核通过'),
          event: () => this.handleUpdateStatus('WAIT_SENT'),
        },
        {
          text: intl.get('small.afterSaleManage.model.nopass').d('审核驳回'),
          event: () =>
            this.handleOpenReject(
              'REJECT',
              intl.get('small.afterSaleManage.model.nopassResult').d('驳回原因')
            ),
        },
      ],
      WAIT_PROCESS: [
        {
          text: intl.get('small.afterSaleManage.model.receivePro').d('接收商品'),
          event: () => this.handleUpdateStatus('WAIT_CONFIRM'),
        },
        {
          text: intl.get('small.afterSaleManage.model.noreceivePro').d('拒收商品'),
          event: () =>
            this.handleOpenReject(
              'PRODUCT_REJECT',
              intl.get('small.afterSaleManage.model.noreceiveResult').d('拒收原因')
            ),
        },
      ],
      WAIT_CONFIRM: [
        {
          text:
            billList?.length > 0 && billList.filter((bill) => bill.logisticsType === 1)?.length > 0
              ? intl.get('small.afterSaleManage.model.checknewFill').d('查看换货返件运单')
              : intl.get('small.afterSaleManage.model.newFill').d('填写换货返件运单'),
          event: this.handleOpenWayBill,
          filter: afsType === '2',
        },
      ],
    };
    return (
      <span className="action-link">
        {(optionsMap[record.manageAfterSaleStatus] || []).map((item) => {
          const { filter = true } = item;
          return filter ? <a onClick={item.event}>{item.text}</a> : '';
        })}
      </span>
    );
  }

  componentDidMount() {
    this.fetchData();
  }

  @Bind()
  async fetchData() {
    const { params: { afsId } = {} } = this.props.match;
    this.setState({ loading: true });
    const res = await fetchSaleDetail(afsId);
    this.setState({ loading: false });
    const result = getResponse(res);
    if (result) {
      const {
        afterSaleItemList: items,
        remark,
        reason,
        srmPoNum,
        afsTypeName,
        afterSaleNum,
        manageStatusName,
        manageAfterSaleStatus,
        poNum,
      } = result;
      const products = (items || []).map((m) => ({
        ...m,
        remark,
        reason,
        srmPoNum,
        afterSaleNum,
        afsTypeName,
        manageStatusName,
        manageAfterSaleStatus,
        poNum,
      }));
      const { imageList, problemDesc } = products[0] || {};
      this.setColumns(manageAfterSaleStatus);
      this.setState({
        productInfo: products,
        saleInfo: { ...result, imageList, problemDesc },
      });
    }
  }

  @Bind()
  async handleUpdateStatus(status) {
    const { afsTypeName } = this.state.productInfo[0] || {};
    const { params: { afsId } = {} } = this.props.match;
    const params = { afterSaleStatus: status, afsTypeName };
    this.setState({ optionsLoading: true });
    const res = await updateSaleStatus(afsId, params);
    const result = getResponse(res);
    if (result) {
      this.setState({ optionsLoading: false });
      notification.success();
      this.fetchData();
    }
  }

  @Bind()
  setColumns(status) {
    const prevColumns = this.columns;
    const defaultCol = {
      title: intl.get('small.afterSaleManage.model.explain').d('说明'),
      dataIndex: 'field',
      width: 200,
      align: 'center',
    };
    const endColMap = {
      APPROVING: {
        title: intl.get('small.afterSaleManage.model.action').d('操作'),
        dataIndex: 'option',
        render: this.renderOptions,
      }, // 待审核
      WAIT_SENT: {}, // 待发出商品
      WAIT_PROCESS: {
        fixed: 'right',
        title: intl.get('small.afterSaleManage.model.action').d('操作'),
        dataIndex: 'option',
        render: this.renderOptions,
      }, // 待商家处理
      WAIT_CONFIRM: {
        fixed: 'right',
        title: intl.get('small.afterSaleManage.model.action').d('操作'),
        dataIndex: 'option',
        render: this.renderOptions,
      }, // 待确认完成
      CANCELED: {
        title: intl.get('small.afterSaleManage.model.cancelResult').d('取消原因'),
        dataIndex: 'cancelReason',
      }, // 已取消
      REJECT: {
        title: intl.get('small.afterSaleManage.model.nopassResult').d('驳回原因'),
        dataIndex: 'remark',
      }, // 申请被驳回
      PRODUCT_REJECT: {
        title: intl.get('small.afterSaleManage.model.noreceiveResult').d('拒收原因'),
        dataIndex: 'remark',
      }, // 商品被拒收
      FINISH: {}, // 售后完成
    };
    this.columns[prevColumns.length - 1] = {
      ...defaultCol,
      ...(endColMap[status] || {}),
    };
  }

  @Bind()
  renderImgList(imgList) {
    const imgJsxList = (imgList || []).map((imag) => (
      <img style={{ width: 50, height: 50, border: '1px solid #eee' }} alt="" src={imag?.fileUrl} />
    ));
    return imgJsxList.length > 0 ? imgJsxList : intl.get('hzero.common.currency.none').d('无');
  }

  @Bind()
  renderContactInfo({ name, tel, address }) {
    return (
      <div className="small-contact-info">
        <p className="contact-name">
          <span className="small-contact-info-label">
            {intl.get('small.afterSaleManage.model.contact').d('联系人')}:
          </span>
          <span className="small-contact-info-content" title={name}>
            {name}
          </span>
        </p>
        <p className="contact-tel">
          <span className="small-contact-info-label">
            {intl.get('small.afterSaleManage.model.tel').d('手机')}:
          </span>
          <span className="small-contact-info-content">{tel}</span>
        </p>
        <p className="contach-address">
          <span className="small-contact-info-label">
            {intl.get('small.afterSaleManage.model.address').d('地址')}:
          </span>
          <span className="small-contact-info-content" title={address}>
            {address}
          </span>
        </p>
      </div>
    );
  }

  @Bind()
  renderWayBill(list = []) {
    const [info] = list;
    return info
      ? `${intl.get('small.afterSaleManage.model.logisCom').d('物流公司')}：${
          info.logisticsCompanyName
        }；${intl.get('small.afterSaleManage.model.logisNum').d('物流单号')}：${
          info.logisticsNum
        }；${intl.get('small.afterSaleManage.model.deliverTime').d('发货时间')}：${
          info.deliverTime
        }`
      : '';
  }

  @Bind()
  handleOpenReject(status, text) {
    const { rejectLoading } = this.state;
    const placeholder =
      status === 'REJECT'
        ? intl
            .get('small.afterSaleManage.model.nopassTips')
            .d('填写驳回原因，更好解决售后事务（100字以内）')
        : intl
            .get('small.afterSaleManage.model.noreceiveTips')
            .d('填写拒收原因，更好解决售后事务（100字以内）');
    Modal.open({
      destroyOnClose: true,
      title: text,
      mask: true,
      closable: true,
      width: 400,
      onOk: () => this.handleReject(status),
      okProps: { loading: rejectLoading },
      afterClose: () => {
        this.rejectFormDs.reset();
      },
      children: (
        <Form dataSet={this.rejectFormDs}>
          <TextArea label={text} name="message" resize="both" placeholder={placeholder} />
        </Form>
      ),
    });
  }

  @Bind()
  handleOpenWayBill() {
    const { submitLoading, saleInfo } = this.state;
    const { afterSaleWaybillList = [] } = saleInfo;
    const billInfo = (afterSaleWaybillList || []).filter((n) => n.logisticsType === 1); // 1商家 0客户
    const disabled = billInfo.length > 0;
    this.wayBillDs.create(disabled ? billInfo[0] : {});
    const footerProps = disabled ? { footer: null } : {};
    Modal.open({
      destroyOnClose: true,
      title: disabled
        ? intl.get('small.afterSaleManage.model.checknewFill').d('查看换货返件运单')
        : intl.get('small.afterSaleManage.model.newFill').d('填写换货返件运单'),
      mask: true,
      closable: true,
      width: 400,
      okText: intl.get('small.afterSaleManage.model.refer').d('提交'),
      onOk: this.handleSubmitWayBill,
      okProps: { loading: submitLoading },
      ...footerProps,
      afterClose: () => {
        this.wayBillDs.reset();
      },
      children: (
        <Form dataSet={this.wayBillDs}>
          <TextField disabled={disabled} name="logisticsCompanyName" />
          <TextField disabled={disabled} name="logisticsNum" />
          <DateTimePicker disabled={disabled} name="deliverTime" />
        </Form>
      ),
    });
  }

  @Bind()
  async handleReject(status) {
    const { afsTypeName } = this.state.productInfo[0] || {};
    const { params: { afsId } = {} } = this.props.match;
    const flag = await this.rejectFormDs.validate();
    if (flag) {
      const params = this.rejectFormDs.toData()[0] || {};
      this.setState({ rejectLoading: true });
      const res = await updateSaleStatus(afsId, {
        ...params,
        afterSaleStatus: status,
        afsTypeName,
      });
      const result = getResponse(res);
      this.setState({ rejectLoading: false });
      if (result) {
        notification.success();
        this.fetchData();
      }
    }
  }

  @Bind()
  async handleSubmitWayBill() {
    const { params: { afsId } = {} } = this.props.match;
    const flag = await this.wayBillDs.validate();
    if (flag) {
      const params = this.wayBillDs.toData()[0] || {};
      this.setState({ submitLoading: true });
      const res = await submitWayBill({ ...params, afterSaleId: afsId, logisticsType: 1 });
      const result = getResponse(res);
      this.setState({ submitLoading: false });
      if (result) {
        notification.success();
        this.fetchData();
        return true;
      }
      return false;
    }
    return false;
  }

  render() {
    const { loading, optionsLoading, productInfo, saleInfo } = this.state;
    const { afterSaleWaybillList: billList, manageAfterSaleStatus: status, afsType } = saleInfo;
    return (
      <React.Fragment>
        <Header
          title={intl.get('small.afterSaleManage.view.detail.title').d('售后申请单详情')}
          backPath="/small/after-sale-manage/list"
        />
        <Content>
          <Card
            loading={loading}
            title={intl.get('small.afterSaleManage.view.detail.requestTitle').d('申请单信息')}
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
          >
            <Table
              bordered
              loading={optionsLoading}
              dataSource={productInfo}
              columns={this.columns}
              pagination={false}
            />
            {!(billList && billList.length > 0) && status === 'WAIT_CONFIRM' && afsType === '2' && (
              <p style={{ color: 'red', margin: '16px 0 0 0' }}>
                {intl
                  .get('small.afterSaleManage.view.detail.tips')
                  .d('提示：您还未填写换货返件运单，如有运单请及时填写！')}
              </p>
            )}
          </Card>
          <Card
            loading={loading}
            title={intl.get('small.afterSaleManage.view.detail.requestExplain').d('申请单说明')}
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
          >
            <LabelContent
              label={intl.get('small.afterSaleManage.view.detail.mallOrderNum').d('商城订单号')}
              content={saleInfo.poNum}
            />
            <LabelContent
              label={intl.get('small.afterSaleManage.view.detail.contactInfo').d('联系信息')}
              content={this.renderContactInfo({
                name: saleInfo.customerContactName,
                tel: saleInfo.customerMobilePhone,
                address: saleInfo.pickWareFullAddress,
              })}
            />
            <LabelContent
              label={intl.get('small.afterSaleManage.view.detail.fanjian').d('返件方式')}
              content={saleInfo.pickWareTypeName}
            />
            <LabelContent
              label={intl.get('small.afterSaleManage.view.detail.problem').d('问题描述')}
              content={saleInfo.problemDesc}
            />
            <LabelContent
              label={intl.get('small.afterSaleManage.view.detail.shouhou').d('售后图片')}
              content={this.renderImgList(saleInfo.imageList || [])}
            />
            <LabelContent
              label={intl.get('small.afterSaleManage.view.detail.yundan').d('运单信息')}
              content={this.renderWayBill((billList || []).filter((n) => n.logisticsType === 0))}
            />
          </Card>
        </Content>
      </React.Fragment>
    );
  }
}
