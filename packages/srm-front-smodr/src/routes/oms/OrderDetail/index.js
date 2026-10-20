import React from 'react';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import qs from 'qs';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
// import UploadModal from '_components/Upload';
import { DataSet, Button, Table, Form, Attachment, Spin, TextArea, Modal } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { SMALL_ORDER } from '_utils/config';
import PositionAnchor from '_components/PositionAnchor';
import PrintProButton from 'srm-front-boot/lib/components/PrintProButton';
import { openApproveModal } from '_components/ApproveModal';
import { Button as PermissionButton } from 'components/Permission';
import { Header, Content } from 'components/Page';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  handlePrint,
  orderDetailSaveService,
  orderDetailSubmitService,
  orderDetailCancelService,
  orderBudgetValidateService,
} from '@/services/oms/orderDetailService';
import openCompareModal from '@/routes/components/CompareModal';
import DynamicButtons from '_components/DynamicButtons';
import notification from 'utils/notification';

import c7nModal from '@/utils/c7nModal';
import { productDs, freightDs, ds } from './ds';
import styles from './index.less';
import OtherForm from './otherForm';
import OperationRecord from './Record/operation';
import ViewDetail from './ViewDetail';
import EditDetail from './EditDetail';

const { Link } = PositionAnchor;
const organizationId = getCurrentOrganizationId();
const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const permissionText = 'srm.mall.tenant.order-management.order-entry.button';

const HeaderBtn = observer(({
  dataSet,
  customizeBtnGroup,
  handleSaveOrSubmit,
  handleCancel,
}) => {

  const headerBtns =[
    {
      name: 'submitBtn',
      btnType: 'c7n-pro',
      child: intl.get('hzero.common.button.commit').d('提交'),
      btnProps: {
        onClick: () => handleSaveOrSubmit('submit'),
        type: 'c7n-pro',
        icon: 'done',
        color: 'primary',
        loading: dataSet?.status === 'loading',
      },
    },
    {
      name: 'saveBtn',
      btnType: 'c7n-pro',
      child: intl.get('hzero.common.button.save').d('保存'),
      btnProps: {
        onClick: () => handleSaveOrSubmit('save'),
        type: 'c7n-pro',
        funcType: 'flat',
        icon: 'save',
        loading: dataSet?.status === 'loading',
      },
    },
    {
      name: 'cancelBtn',
      btnType: 'c7n-pro',
      child: intl.get('hzero.common.button.cance').d('取消'),
      btnProps: {
        onClick: () => handleCancel(),
        type: 'c7n-pro',
        funcType: 'flat',
        icon: 'cancel',
        loading: dataSet?.status === 'loading',
      },
    },
  ];
  return customizeBtnGroup(
    {
      code: 'SMODR.ORDER.DETAIL.EDIT.BTNS',
      pro: true,
    },
    <DynamicButtons buttons={headerBtns} />
  );
});

@withCustomize({
  unitCode: [
    'SMODR.ORDER.DETAIL.ORDER',
    'SMODR.ORDER.DETAIL.RECEIVE',
    'SMODR.ORDER.DETAIL.INVOICE',
    'SMODR.ORDER.DETAIL.UNIT',
    'SMODR.ORDER.DETAIL.SKU',
    'SMODR.ORDER.DETAIL.FREIGHT',
    'SMODR.ORDER.DETAIL.EDIT.ORDER',
    'SMODR.ORDER.DETAIL.EDIT.RECEIVE',
    'SMODR.ORDER.DETAIL.EDIT.INVOICE',
    'SMODR.ORDER.DETAIL.EDIT.UNIT',
    'SMODR.ORDER.DETAIL.EDIT.SKU',
    'SMODR.ORDER.DETAIL.EDIT.FREIGHT',
    'SMODR.ORDER.DETAIL.EDIT.BTNS',
    'SMODR.ORDER.DETAIL.EDIT.SKU.BATCH.FORM',
  ],
})
@formatterCollections({
  code: ['smodr.orderDetail', 'smodr.common', 'smodr.orderLine', 'smodr.frightLine', 'smodr.apply'],
})
@connect(({ orderDetail, orderLineManage }) => ({
  orderDetail,
  orderLineManage,
}))
export default class OrderDetail extends React.Component {
  constructor(props) {
    super(props);
    const { orderId = '', sourceFrom = 'order', backPath = '', editFlag, wflApproveFlag, taskId, processInstanceId } = qs.parse(props.history.location.search.substr(1));
    this.state = {
      orderId,
      sourceFrom,
      proColumns: this.initColumns,
      backPath,
      editFlag: Boolean(editFlag),
      isChangeFlag: 0, // 单据是否有变更记录
      wflApproveFlag,
      taskId,
      processInstanceId,
    };
    this.Ds = new DataSet(ds());
    this.productDs = new DataSet(productDs(this.Ds, this.state.editFlag));
  }

  initColumns = [
    {
      name: 'skuCode',
      width: 150,
    },
    {
      name: 'skuName',
    },
    {
      name: 'productCompareDTO',
      renderer: ({ value }) => (
        <a
          onClick={() => openCompareModal(value)}
        >
          {value
            ? intl.get('smodr.orderDetail.model.check').d('查看')
            : '-'}
        </a>
      ),
    },
    {
      name: 'entryCode',
    },
    {
      name: 'agreementNumber',
      hidden: true,
    },
    {
      name: 'skuTypeMeaning',
      hidden: true,
    },
    {
      name: 'productAttributeMeaning',
      hidden: true,
    },
    {
      name: 'catalogName',
      hidden: true,
    },
    {
      name: 'categoryName',
      hidden: true,
    },
    {
      name: 'itemCode',
      hidden: true,
    },
    {
      name: 'itemName',
      hidden: true,
    },
    {
      name: 'parentSkuCode',
      hidden: true,
      width: 150,
    },
    {
      name: 'parentSkuName',
      hidden: true,
      width: 150,
    },
    {
      name: 'customSpecificationList',
      hidden: true,
      renderer: ({ value }) =>
        value?.length > 0 ? (
          <Button color="primary" funcType="link" onClick={() => this.handleCheckSku(value)}>
            {intl.get('smodr.orderDetail.model.check').d('查看')}
          </Button>
        ) : (
          <span>-</span>
        ),
    },
    {
      name: 'originalQuantityMeaning',
      align: 'right',
      header: ({ dataSet }) => {
        const text = (dataSet?.current?.get('orderTypeCode') === 'MANUAL' || (dataSet?.current?.get('cecFromCode') === 'CATA' && dataSet?.current?.get('skuType') === 'CUSTOM')) && dataSet?.current?.get('dualFlag') === true
          ? intl.get('smodr.orderDetail.model.baseQuantity').d('基本数量')
          : intl.get('smodr.orderDetail.model.quantity').d('数量');
        return (
          <div>{text}</div>
        );
      },

    },
    {
      name: 'uom',
      header: ({ dataSet }) => {
        const text = (dataSet?.current?.get('orderTypeCode') === 'MANUAL' || (dataSet?.current?.get('cecFromCode') === 'CATA' && dataSet?.current?.get('skuType') === 'CUSTOM')) && dataSet?.current?.get('dualFlag') === true
          ? intl.get('smodr.orderDetail.model.baseUomName').d('基本单位')
          : intl.get('smodr.orderDetail.model.uomName').d('单位');
        return (
          <div>{text}</div>
        );
      },
    },

    {
      name: 'taxRateMeaning',
      align: 'right',
    },
    {
      name: 'currencyName',
    },
    {
      name: 'containFreight',
      width: 150,
      renderer: ({ value }) => (
        <span>
          {value === '1'
            ? intl.get('smodr.orderDetail.model.yep').d('是')
            : intl.get('smodr.orderDetail.model.no').d('否')}
        </span>
      ),
    },
    {
      name: 'eachFreight',
      align: 'right',
      width: 150,
    },
    {
      name: 'unitPriceMeaning',
      align: 'right',
      header: ({ dataSet }) => {
        const text = (dataSet?.current?.get('orderTypeCode') === 'MANUAL' || (dataSet?.current?.get('cecFromCode') === 'CATA' && dataSet?.current?.get('skuType') === 'CUSTOM')) && dataSet?.current?.get('dualFlag') === true
          ? intl.get('smodr.orderDetail.model.baseUnitPriceTaxNew').d('单价(含税)-基本单位')
          : intl.get('smodr.orderDetail.model.unitPriceTaxNew').d('单价(含税)');
        return (
          <div>{text}</div>
        );
      },
      width: 150,
    },
    {
      name: 'per',
      width: 100,
    },
    {
      name: 'unitNakedPriceMeaning',
      align: 'right',
      header: ({ dataSet }) => {
        const text = (dataSet?.current?.get('orderTypeCode') === 'MANUAL' || (dataSet?.current?.get('cecFromCode') === 'CATA' && dataSet?.current?.get('skuType') === 'CUSTOM')) && dataSet?.current?.get('dualFlag') === true
          ? intl.get('smodr.orderDetail.model.baseUnitPriceNoTaxNew').d('单价(不含税)-基本单位')
          : intl.get('smodr.orderDetail.model.unitPriceNoTaxNew').d('单价(不含税)');
        return (
          <div>{text}</div>
        );
      },
      width: 150,
    },
    {
      name: 'entryAmountMeaning',
      align: 'right',
    },
    {
      name: 'nakedPriceMeaning',
      align: 'right',
      hidden: true,
      width: 120,
    },
    {
      name: 'otherInfo',
      renderer: ({ record }) => {
        if (record.get('dimValueDTO')) {
          return (
            <Button color="primary" funcType="link" onClick={() => this.handleCheckInfo(record)}>
              {intl.get('smodr.orderDetail.model.check').d('查看')}
            </Button>
          );
        } else {
          return <span>-</span>;
        }
      },
    },
    {
      name: 'remark',
    },
  ]

  freightDs = new DataSet(freightDs());

  attDs = new DataSet({
    fields: [
      {
        name: 'attachment',
        type: 'attachment',
        label: intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件'),
      },
    ],
  });

  outAttDs = new DataSet({
    fields: [
      {
        name: 'attachment',
        type: 'attachment',
        label: intl.get('smodr.orderDetail.model.purchaseAttachment').d('采购方附件'),
      },
    ],
  });

  fetchOrder() {
    const { orderId } = this.state;
    this.fetchOrderDetail();
    this.freightDs.setQueryParameter('orderId', orderId);
    this.freightDs.query();
    this.fetchSkuData(orderId);
  }

  componentDidMount() {
    const { orderId } = this.state;
    if (orderId) {
      this.fetchOrder();
    } else {
      notification.warning({ message: intl.get('smodr.orderDetail.model.orderNonexistent').d('订单不存在') });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { dispatch } = this.props;
    const { orderId, editFlag, backPath } = qs.parse(nextProps.history.location.search.substr(1));
    const { orderId: oldorderId } = this.state;
    if (orderId && orderId !== oldorderId) {
      dispatch({
        type: 'orderLineManage/fetchExtensionHeader',
        payload: { orderId, customizeUnitCode: 'SMODR.ORDER.DETAIL.ORDER,SMODR.ORDER.DETAIL.EDIT.ORDER' },
      }).then((res) => {
        if (res) {
          const { receiverAddress = {}, acquiringInvoice = {} } = res;
          const data = {
            ...res,
            ...receiverAddress || {},
            ...acquiringInvoice || {},
            receiveFullAddress: receiverAddress?.fullAddress,
            receiveSpliceAddress: receiverAddress?.spliceAddress,
            acquirSpliceAddress: acquiringInvoice?.spliceAddress,
            remark: res.remark,
          };
          this.Ds.loadData([data]);
          this.attDs.loadData([{ attachment: res?.attachmentUuid }]);
          this.outAttDs.loadData([{ attachment: res?.outerAttachmentUuid }]);
        }
      });
      this.setState(
        {
          orderId,
          proColumns: this.initColumns,
        },
        () => {
          this.freightDs.setQueryParameter('orderId', this.state.orderId);
          this.freightDs.query();
          this.fetchSkuData(this.state.orderId);
        }
      );
    }
    this.productDs.selection =editFlag ? 'multiple' : false;
    this.setState({ backPath, editFlag: Boolean(editFlag) });
  }

  @Bind()
  fetchOrderDetail() {
    const { dispatch } = this.props;
    const { orderId } = this.state;
    this.Ds.status = 'loading';
    dispatch({
      type: 'orderLineManage/fetchExtensionHeader',
      payload: { orderId, customizeUnitCode: 'SMODR.ORDER.DETAIL.ORDER,SMODR.ORDER.DETAIL.EDIT.ORDER' },
    }).then((res) => {
      this.Ds.status = 'ready';
      if (res) {
        const { receiverAddress = {}, acquiringInvoice = {}, objectVersionNumber, remark } = res || {};
        const data = {
          ...res,
          ...receiverAddress,
          ...acquiringInvoice,
          receiveFullAddress: receiverAddress.fullAddress,
          receiveSpliceAddress: receiverAddress?.spliceAddress,
          acquirSpliceAddress: acquiringInvoice?.spliceAddress,
          remark,
          objectVersionNumber,
        };
        this.setState({ isChangeFlag: res.changeFlag });
        this.Ds.loadData([data]);
        this.attDs.loadData([{ attachment: res?.attachmentUuid }]);
        this.outAttDs.loadData([{ attachment: res?.outerAttachmentUuid }]);
      }
    });
  }

  @Bind()
  async fetchSkuData(orderId = '') {
    const { proColumns } = this.state;
    const append = [
      {
        name: 'originalPackageQuantityMeaning',
        align: 'right',
      },
      {
        name: 'customUom',
      },
      {
        name: 'packageUnitPriceMeaning',
        align: 'right',
        width: 150,
      },
      {
        name: 'packageUnitNakedPriceMeaning',
        align: 'right',
        width: 150,
      },
    ];
    this.productDs.setQueryParameter('orderId', orderId);
    const res = await this.productDs.query();
    if (res && res.content?.length > 0) {
      if ((res.content[0]?.orderTypeCode === 'MANUAL' || (res.content[0]?.cecFromCode === 'CATA' && res.content[0]?.skuType === 'CUSTOM')) && res.content[0]?.dualFlag) {
        this.setState({ proColumns: proColumns.concat(append) });
      }
    }
  }

  @Bind()
  fetchOrderLine(params = {}) {
    const {
      dispatch,
      orderDetail: { orderLinePagination = {} },
    } = this.props;
    const { orderId } = this.state;
    dispatch({
      type: 'orderDetail/fetchOrderLine',
      payload: { orderId, page: isEmpty(params) ? orderLinePagination : params },
    });
  }

  @Bind()
  fetchFeightLine(params = {}) {
    const {
      dispatch,
      orderDetail: { feightLinePagination = {} },
    } = this.props;
    const { orderId } = this.state;
    dispatch({
      type: 'orderDetail/fetchFeightLine',
      payload: { orderId, page: isEmpty(params) ? feightLinePagination : params },
    });
  }

  @Bind()
  async handlePrint(orderId = '') {
    const res = await handlePrint([orderId]);
    if (res) {
      const file = new Blob([res], { type: 'application/pdf' });
      const fileUrl = URL.createObjectURL(file);
      const printWindow = window.open(fileUrl);
      if (printWindow) {
        printWindow.print();
      }
    }
  }

  @Bind()
  handleCustomValue(item) {
    const { componentType, cpValue, cpValueName, inputMethod } = item;
    let value = '';
    switch (componentType) {
      case 'IMAGE':
        if (inputMethod === 'MANUAL') {
          value = (
            <Attachment
              readOnly
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="mall-front"
              value={cpValue || cpValueName}
            />
          );
        } else {
          value = <img style={{ width: 80 }} src={cpValue || cpValueName} alt="" />;
        }
        break;
      case 'UPLOAD':
        value = (
          <Attachment
            readOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="mall-front"
            value={cpValue || cpValueName}
          />
        );
        break;
      case 'LOV':
        value = cpValueName;
        break;
      case 'SELECT':
        value = cpValueName;
        break;
      default:
        value = cpValue;
        break;
    }
    return value;
  }

  @Bind()
  handleCheckSku(value = []) {
    const modal = c7nModal({
      title: intl.get('smodr.orderDetail.view.customInfo').d('定制品信息'),
      children: (
        <div>
          {value?.map((i) => (
            <div>
              <div style={{ color: 'rgba(0,0,0,0.65)', marginBottom: '4px' }}>
                {i?.componentName}
              </div>
              <div style={{ fontWeight: 600, marginBottom: 16 }}>{this.handleCustomValue(i)}</div>
            </div>
          ))}
        </div>
      ),
      style: { width: 380 },
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smodr.common.model.close').d('关闭')}
        </Button>
      ),
    });
  }

  @Bind()
  handleCheckInfo(record) {
    const dimValueDTO = record.get('dimValueDTO');
    const newlist = (
      dimValueDTO?.headerCustomizedList?.slice()?.filter((i) => i.mappingHeadFlag !== 1) || []
    ).concat(dimValueDTO?.lineCustomizedList?.slice() || []);
    const modal = c7nModal({
      title: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
      children: <OtherForm list={newlist} />,
      style: { width: 380 },
    });
  }

  @Bind()
  handleCheckHeader(record) {
    const dimValueDTO = record.get('dimValueDTO');
    const newlist = (dimValueDTO?.headerCustomizedList?.slice() || []).concat(
      dimValueDTO?.lineCustomizedList?.slice() || []
    );
    const modal = c7nModal({
      title: intl.get('smodr.orderDetail.model.otherInfo').d('其他信息'),
      footer: (
        <Button color="primary" onClick={() => modal?.close()}>
          {intl.get('smodr.orderLine.model.close').d('关闭')}
        </Button>
      ),
      children: <OtherForm list={newlist} />,
      style: { width: 380 },
    });
  }

  handleOperation = async () => {
    const { orderId } = this.state;
    const modal = c7nModal({
      title: intl.get('smodr.apply.view.updateOperaRecord').d('变更记录'),
      children: (
        (<OperationRecord orderId={orderId} />)
      ),
      style: { width: '742px' },
      footer: <Button color='primary' onClick={() => modal?.close()}>{intl.get('smodr.apply.view.close').d('关闭')}</Button>,
    });
  };

  // 预算校验
  async handleBudgetValidate(params, submit = e => e) {
    const budgetRes = getResponse(await orderBudgetValidateService(params));
    if(budgetRes) {
      const flag = budgetRes.some(n => n.warnFlag === '1');
      if(flag) {
        const ds = new DataSet({
          selection: false,
          data: budgetRes,
          paging: false,
        });
        const columns = [
          {
            name: 'lineNum',
            header: intl.get('smodr.common.model.lineNumber').d('行号'),
            width: 100,
            renderer: ({record}) => record.index + 1,
          },
          {
            name: 'errorMessage',
            header: intl.get('hzero.common.message.confirm.title').d('提示'),
          },
        ];
        Modal.confirm({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          children: (
            <>
              <p style={{marginBottom: 16}}>{intl.get('smodr.orderDetail.view.budgetConfirm').d('以下商品行预算超量或超预警线，请确认是否继续提交')}</p>
              <Table
                columns={columns}
                dataSet={ds}
                style={{ maxHeight: 'calc(100vh - 360px)' }}
              />
            </>
          ),
          onOk: () => submit()
        });
      }
      return flag;
    }
  }

  // 保存/提交
  @Bind
  async handleSaveOrSubmit(type) {
    const [dsFlag, productDsFlag] = await Promise.all([this.Ds.validate(), this.productDs.validate()]);
    if(dsFlag && productDsFlag) {
      this.Ds.status = 'loading';
      const baseInfo = this.Ds.current?.toData();
      const productData = this.productDs.toData();
      const freightData = this.freightDs.toData();
      const attachmentUuid = this.attDs.current?.get('attachment');
      const outerAttachmentUuid = this.outAttDs.current?.get('attachment');
      const params = {
        ...baseInfo,
        attachmentUuid,
        outerAttachmentUuid,
        orderEntryVOS: [...productData, ...freightData],
      };
      if(type === 'save') {
        const res = getResponse(await orderDetailSaveService(params));
        if(res) {
          notification.success();
          this.fetchOrder()
        };
      } else {
        const submit = async () => {
          const res = getResponse(await orderDetailSubmitService(params));
          if(res) {
            notification.success();
            this.props.history.push('/s2-mall/oms/order-line/list');
          }
        }
        const budgetWarnFlag = await this.handleBudgetValidate(params, submit);
        if(!budgetWarnFlag) submit();
      }
      this.Ds.status = 'ready';
    }
  }

  handleToEditDetail() {
    const { orderId } = this.state;
    const { history: { push, location } } = this.props;
    const { pathname, search } = location || {};
    push({
      pathname: '/s2-mall/oms/order-line/order-detail',
      search: qs.stringify({
        orderId,
        backPath: pathname + search,
        editFlag: true,
      }),
    });
  }

  // 取消
  @Bind
  async handleCancel() {
    const cancelDs = new DataSet({
      forceValidate: true,
      autoCreate: true,
      fields: [
        {
          name: 'cancelReason',
          label: intl.get('smodr.orderDetail.view.cancel.title').d('取消原因'),
          required: true,
        },
      ],
    });
    c7nModal({
      title: intl.get('smodr.orderDetail.view.cancel.title').d('取消原因'),
      style: { width: 380 },
      children: (
        <Form columns={1} dataSet={cancelDs} labelLayout="float">
          <TextArea name="cancelReason" rows={3} resize="vertical" />
        </Form>
      ),
      onOk: async () => {
        const flag = await cancelDs.validate();
        if(!flag) return false;
        const { backPath } = this.state;
        const { orderLineManage } = this.props;
        const { extensionHeaderData = {} } = orderLineManage;
        const cancelReason = cancelDs.current.get('cancelReason');
        const params = {
          orderCode: extensionHeaderData.orderCode,
          cancelReason,
        };
        const res = getResponse(await orderDetailCancelService(params));
        if(res) {
          this.props.history.push(backPath);
        } else {
          return false;
        }
      },
    });
  }

  render() {
    const { orderLineManage, customizeForm, customizeTable, customizeBtnGroup, history } = this.props;
    const { extensionHeaderData = {} } = orderLineManage;
    const {
      orderId,
      sourceFrom,
      backPath,
      isChangeFlag,
      editFlag,
      wflApproveFlag,
      taskId,
      processInstanceId,
    } = this.state;
    const freColumns = [
      {
        name: editFlag ? 'itemLov' : 'itemCode',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'itemName',
        width: 150,
        editor: editFlag,
      },
      {
        name: 'extraCostTypeMeaning',
      },
      {
        name: 'orderTypeMeaning',
      },
      {
        name: 'extraType',
      },
      {
        name: 'extraCostPricingMethodMeaning',
        width: 150,
      },
      {
        name: 'originalQuantityMeaning',
        align: 'right',
      },
      {
        name: 'uomName',
      },
      {
        name: 'taxRateMeaning',
        align: 'right',
      },
      {
        name: 'currencyName',
      },
      {
        name: 'unitPriceMeaning',
        align: 'right',
      },
      {
        name: 'entryAmountMeaning',
        align: 'right',
        width: 150,
      },
      {
        name: 'nakedPriceMeaning',
        align: 'right',
        width: 150,
      },
    ];
    const colorStyle = () => {
      const showOrderStatus = extensionHeaderData?.showOrderStatus;
      if (
        [
          'CANCELLING',
          'PREEMPTING',
          'APPROVING',
          'DELIVERYING',
          'PROPER_VATE_ING',
          'RECEIVING',
          'STATEMENTING',
        ].includes(showOrderStatus)
      ) {
        return 'yellow';
      } else if (['APPROVE_REJECT', 'EXCEPTION'].includes(showOrderStatus)) {
        return 'red';
      } else if (showOrderStatus === 'CANCELED') {
        return 'gray';
      } else {
        return 'green';
      }
    };
    const currentOffsetTop = null;
    const currentAnchorContainer = () =>
      document.querySelector('.page-content-wrap') || document.body;
    const currentArr = () => {
      return '#BASE_INFO';
    };
    const detailProps = {
      customizeForm,
      customizeTable,
      Ds: this.Ds,
      productDs: this.productDs,
      freightDs: this.freightDs,
      attDs: this.attDs,
      outAttDs: this.outAttDs,
      freColumns,
      proColumns: this.state.proColumns,
      handleCheckHeader: this.handleCheckHeader,
      extensionHeaderData,
      colorStyle,
      PRIVATE_BUCKET,
    }
    const title = editFlag ? intl.get('smodr.orderDetail.view.editTitle').d('编辑商城订单') : intl.get('smodr.orderDetail.view.title').d('商城订单详情');
    return (
      <>
        <Header title={title} backPath={backPath}>
          {editFlag ? (
            <HeaderBtn
              dataSet={this.Ds}
              customizeBtnGroup={customizeBtnGroup}
              handleCancel={this.handleCancel}
              handleSaveOrSubmit={this.handleSaveOrSubmit}
            />
          ) : (
            sourceFrom === 'order' && (
              <>
                {Boolean(+wflApproveFlag) && (
                  <Button
                    icon="authorize"
                    color="primary"
                    onClick={() => {
                      openApproveModal({
                        modalProps: {
                          closable: true,
                        },
                        taskId,
                        processInstanceId,
                        onSuccess: () => {
                          history.push(backPath);
                        },
                      });
                    }}
                  >
                    {intl.get('hzero.common.button.approval').d('审批')}
                  </Button>
                )}
                {/* 已预占或者审批拒绝下不为SRM审批的电商punchout订单才可以编辑 */}
                {('PREEMPT' === extensionHeaderData.showOrderStatus ||
                  ('APPROVE_REJECT' === extensionHeaderData.showOrderStatus &&
                    extensionHeaderData.approveType !== 'EXTERNAL_APPROVAL')) &&
                  extensionHeaderData.orderSourceFrom === 'EC_PUNCHOUT' && (
                    <Button
                      icon="mode_edit"
                      funcType="flat"
                      onClick={() => {
                        this.handleToEditDetail();
                      }}
                    >
                      {intl.get('hzero.common.button.edit').d('编辑')}
                    </Button>
                  )}
                {['PREEMPTING', 'APPROVED', 'APPROVE_REJECT', 'APPROVING', 'PREEMPT'].includes(
                  extensionHeaderData.showOrderStatus
                ) &&
                  extensionHeaderData.orderSourceFrom === 'EC_PUNCHOUT' && (
                    <Button icon="cancel" funcType="flat" onClick={() => this.handleCancel()}>
                      {intl.get('hzero.common.button.cance').d('取消')}
                    </Button>
                  )}
                {/* 老打印 */}
                <PermissionButton
                  type="c7n-pro"
                  icon="print"
                  onClick={() => this.handlePrint(orderId)}
                  funcType="flat"
                  permissionList={[
                    {
                      code: `${permissionText}.list.info.print`,
                      type: 'button',
                      meaning:
                        intl.get('smodr.orderDetail.view.title').d('商城订单详情') -
                        intl.get('smodr.orderDetail.view.permissionPrint').d('打印按钮'),
                    },
                  ]}
                >
                  {intl.get('smodr.orderLine.view.print').d('打印')}
                </PermissionButton>
                <PrintProButton
                  buttonText={intl.get('hzero.common.button.print').d('打印')}
                  buttonProps={{
                    className: styles['new-version-btn'],
                    icon: 'print',
                    type: 'c7n-pro',
                    funcType: 'flat',
                    permissionList: [
                      {
                        code: `srm.mall.tenant.order-management.order-entry.button.detail.new-print`,
                        type: 'button',
                        meaning: '商城订单详情-打印按钮（新）',
                      },
                    ],
                  }}
                  // requestUrl={isReceive ?
                  //   `${SMALL_ORDER}/v1/${organizationId}/orders/print-receive-order-token?orderIds=${orderId}`
                  //   : `${SMALL_ORDER}/v1/${organizationId}/orders/print-order-token?orderIds=${orderId}`}
                  requestUrl={`${SMALL_ORDER}/v1/${organizationId}/orders/print-order-token?orderIds=${orderId}`}
                  method="POST"
                />
                {isChangeFlag === 1 && (
                  <Button
                    icon="operation_service_request"
                    funcType="flat"
                    onClick={this.handleOperation}
                  >
                    {intl.get('smodr.apply.view.updateOperaRecord').d('变更记录')}
                  </Button>
                )}
              </>
            )
          )}
        </Header>
        <Content className={styles['order-detail-content']}>
          <Spin dataSet={this.Ds}>
            {editFlag ? <EditDetail {...detailProps} /> : <ViewDetail {...detailProps} />}
          </Spin>
        </Content>
        <PositionAnchor
          offsetTop={currentOffsetTop || 150}
          getContainer={currentAnchorContainer}
          getCurrentAnchor={currentArr}
        >
          <Link
            href="#BASE_INFO"
            title={intl.get('smodr.orderDetail.view.baseInfo').d('基本信息')}
          />
          <Link
            href="#ORG_INFO"
            title={intl.get('smodr.orderDetail.model.purOrgInfo').d('交易方&业务组织信息')}
          />
          <Link
            href="#PRO_INFO"
            title={intl.get('smodr.orderDetail.model.productInfo').d('商品信息')}
          />
          <Link
            href="#FRE_INFO"
            title={intl.get('smodr.orderDetail.model.additionInfo').d('附加费信息')}
          />
          {(extensionHeaderData?.attachmentUuid || extensionHeaderData?.outerAttachmentUuid) && (
            <Link
              href={extensionHeaderData?.attachmentUuid ? '#ACC_INFO' : '#ACC_INF_OUT'}
              title={intl.get('smodr.orderDetail.model.accessory').d('附件')}
            />
          )}
        </PositionAnchor>
        {/* <Anchor list={anchors} wrapperHeight={261} wrapperWidth={180} /> */}
      </>
    );
  }
}
