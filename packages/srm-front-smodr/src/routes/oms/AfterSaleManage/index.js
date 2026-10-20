/* eslint-disable no-unused-expressions */
import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import {
  DataSet,
  Modal,
  TextArea,
  Form as FormPro,
  TextField,
  DateTimePicker,
  Lov as LovPro,
  Button,
  Select,
} from 'choerodon-ui/pro';
import { Form, Icon, Tag } from 'choerodon-ui';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import cacheComponent from 'components/CacheComponent';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getUserOrganizationId, getCurrentOrganizationId } from 'utils/utils';
import c7nModal from '@/utils/c7nModal';
import { fetchSupAddress, createAddress } from '@/services/oms/afterSaleOrderService';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { useRenderTag } from '@/hooks/useRenderTag';

import { tableDs, historyDs } from './ListDs';
import AfsDetail from './AfsDetail';
// import AddressModal from './AddressModal';
import NewAddressModal from './AddressModal/index';
import AddressSelect from './AddressSelect';
import styles from './index.less';
import openRecords from './TimeRecord';
import { updateSaleStatus, submitWayBill, updateAcceptStatus } from './api';

const organizationId = getCurrentOrganizationId();
const tenantId = getUserOrganizationId();

// const colorStyle = (record) => {
//   const afterSaleStatus = record.get('afterSaleStatus');
//   if (['FINISH'].includes(afterSaleStatus)) {
//     return {
//       color: '#47B881',
//       backgroundColor: 'rgba(71,184,129,0.10)',
//       padding: '2px 4px',
//       fontWeight: 600,
//       borderRadius: '2px',
//       display: 'inline',
//     }; // 绿
//   } else if (['APPROVING', 'WAIT_PROCESS', 'WAIT_SENT', 'WAIT_CONFIRM'].includes(afterSaleStatus)) {
//     return {
//       color: '#F88D10',
//       backgroundColor: 'rgba(252,160,0,0.10)',
//       padding: '2px 4px',
//       fontWeight: 600,
//       borderRadius: '2px',
//       display: 'inline',
//     }; // 黄
//   } else if (['CANCELED'].includes(afterSaleStatus)) {
//     return {
//       color: 'rgba(0,0,0,0.65)',
//       backgroundColor: 'rgba(0,0,0,0.06)',
//       padding: '2px 4px',
//       fontWeight: 600,
//       borderRadius: '2px',
//       display: 'inline',
//     }; // 灰
//   } else {
//     return {
//       color: '#F56349',
//       backgroundColor: 'rgba(245,99,73,0.10)',
//       padding: '2px 4px',
//       fontWeight: 600,
//       borderRadius: '2px',
//       display: 'inline',
//     }; // 红
//   }
// };
@withCustomize({
  unitCode: ['SMODR.AFTERSALE_NEW.QUERY'],
})
@formatterCollections({
  code: ['smodr.common', 'smodr.afterSaleManage', 'smodr.deliveryOrder'],
})
@connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
  } = themeConfigVO;
  if (enableThemeConfig) {
    return {
      primaryColor: colorCode,
    };
  }
  return {};
})
@Form.create({ fieldNameProp: null })
@cacheComponent({ cacheKey: '/smodr/after-sale-manage/list' })
export default class AfterSaleManage extends Component {
  state = {
    currentCompany: {}, // 当前公司
    rejectLoading: false,
    returnAddress: [],
    supAddId: undefined,
    // value: [],
    // rejectReason: '',
  };

  _modal;

  form;

  detailModal;

  tableDs = new DataSet(tableDs());

  historyDs = new DataSet(historyDs());

  rejectFormDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'remark',
        type: 'string',
        required: true,
        maxLength: 100,
        // label: intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因'),
        // label: intl.get('smodr.afterSaleManage.model.noreceivePro').d('拒收商品'),
      },
    ],
  });

  selectAddDs = new DataSet({
    autoCreate: false,
    fields: [
      {
        name: 'supplierAddressId',
        label: intl.get('smodr.afterSaleManage.model.returnAdd').d('退货地址'),
        required: true,
      },
    ],
  });

  companyDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'companyLov',
        type: 'object',
        label: intl.get('smodr.afterSaleManage.model.CompanyLov').d('公司'),
        lovCode: 'HPFM.COMPANY',
        lovPara: { tenantId },
        textField: 'companyName',
        required: true,
        ignore: 'always',
      },
      {
        name: 'companyName',
        bind: 'companyLov.companyName',
      },
      {
        name: 'companyId',
        bind: 'companyLov.companyId',
      },
    ],
  });

  checkwayBillDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: 'logisticsCompanyLov',
        type: 'object',
        label: intl.get('smodr.afterSaleManage.model.logisticsCompanyName').d('快递公司'),
        lovCode: 'SINV.ASN_SHIPPER_NAME',
        lovPara: { tenantId: organizationId },
        textField: 'meaning',
        required: true,
        ignore: 'always',
      },
      {
        name: 'logisticsCompanyCode',
        bind: 'logisticsCompanyLov.value',
      },
      {
        name: 'logisticsCompanyName',
        bind: 'logisticsCompanyLov.meaning',
      },
      {
        name: 'logisticsNum',
        type: 'string',
        label: intl.get('smodr.afterSaleManage.model.logisticsNum').d('快递单号'),
        required: true,
      },
      {
        name: 'deliverTime',
        type: 'dateTime',
        label: intl.get('smodr.afterSaleManage.model.deliverTime').d('发货时间'),
        required: true,
      },
    ],
  });

  colorList = [
    { colorType: 'success', matchList: ['FINISH'] },
    { colorType: 'invalid', matchList: ['CANCELED'] },
    { colorType: 'warning', matchList: ['APPROVING', 'WAIT_PROCESS', 'WAIT_SENT', 'WAIT_CONFIRM'] },
    { colorType: 'failed', matchList: [] },
  ]

  columns = [
    {
      name: 'afterSaleStatusMeaning',
      width: 140,
      renderer: ({ record, value }) => {
        const { color, initStyle } = useRenderTag(this.colorList, record?.get('afterSaleStatus'));
        return (
          <Tag color={color} style={initStyle}>
            {value}
          </Tag>
        );
      },
    },
    {
      name: 'options',
      width: 220,
      renderer: this.renderOptions,
    },
    {
      name: 'afterSaleCode',
      width: 150,
      renderer: ({ record, value }) => (
        <a onClick={() => this.handleViewDetail(record)}>
          {value}
        </a>
      ),
    },
    {
      name: 'orderCode',
      width: 200,
    },
    {
      name: 'srmOrderCode',
      width: 180,
    },
    {
      name: 'skuCode',
      width: 140,
    },
    {
      name: 'skuName',
      minWidth: 200,
    },
    {
      name: 'quantity',
      width: 80,
    },
    {
      name: 'afterSaleTypeMeaning',
      width: 90,
    },
    {
      name: 'applyTime',
      width: 160,
    },
    {
      name: 'ownerName',
      width: 100,
    },
    {
      name: 'purchaseCompanyName',
      renderer: ({ text, record }) => (
        <span>
          {record?.get('agreementType') === 'SALE' ? record?.get('proxySupplierCompanyName') : text}
        </span>
      ),
    },
    {
      name: 'supplierCompanyName',
    },
  ];

  // 审批通过
  @Bind()
  async handleUpdateStatus(record, status, flg) {
    const { modal, supAddId } = this.state;
    const afterSaleId = record?.get('afterSaleId');
    const flag = await this.selectAddDs.validate();
    const params =
      flg === 'pick'
        ? { supplierApproveStatus: status, afterSaleId }
        : flg === 'modal'
          ? {
            supplierApproveStatus: status,
            afterSaleId,
            supplierAddressId: supAddId,
          }
          : {
            supplierApproveStatus: status,
            afterSaleId,
            supplierAddressId: this.selectAddDs?.current?.get('supplierAddressId'),
          };
    if (flag && this.selectAddDs.toData()?.[0]?.supplierAddressId !== '1') {
      const res = await updateSaleStatus(params);
      const result = getResponse(res);
      if (result) {
        notification.success();
        modal?.close();
        this.tableDs.query();
      }
    } else return false;
  }

  // @Bind()
  // handleQueryChange(val) {
  //   if (val) {
  //     let newVal = [];
  //     val.forEach((f) => {
  //       const splitVal = f.split(/[,\s+]/).filter((v) => !!v);
  //       newVal = newVal.concat(splitVal);
  //     });
  //     this.setState({ value: newVal }, () => {
  //       if (newVal.length === 1) {
  //         this.tableDs.setQueryParameter('afterSaleCode', newVal[0]);
  //         this.tableDs.setQueryParameter('afterSaleCodeList', null);
  //       } else {
  //         this.tableDs.setQueryParameter('afterSaleCode', null);
  //         this.tableDs.setQueryParameter('afterSaleCodeList', newVal.join(','));
  //       }
  //     });
  //   } else {
  //     this.setState({ value: null });
  //     this.tableDs.setQueryParameter('afterSaleCode', null);
  //     this.tableDs.setQueryParameter('afterSaleCodeList', null);
  //   }
  //   this.tableDs.query();
  // }

  @Bind()
  getSupAddId(supAddId) {
    if (supAddId) {
      this.selectAddDs.create({ supplierAddressId: supAddId }, 0);
    }
    this.setState({ supAddId });
  }

  // 审批拒绝
  @Bind()
  async handleReject(record, status) {
    const afterSaleId = record.get('afterSaleId');
    let flag = false;
    flag = await this.rejectFormDs.validate();
    if (flag) {
      const params = this.rejectFormDs.toData()?.[0] || {};
      this.setState({ rejectLoading: true });
      const res = await updateSaleStatus({
        ...params,
        supplierApproveStatus: status,
        afterSaleId,
      });
      const result = getResponse(res);
      this.setState({ rejectLoading: false });
      if (result) {
        notification.success();
        this.tableDs.query();
        this.state?.modal?.close();
      }
    } else return false;
  }

  @Bind()
  handleRefSel(ref = {}) {
    this.selectModal = ref;
  }

  @Bind()
  handleOpenModal(record) {
    const pickWareType = record.get('pickWareType');
    const { defaultAddress = [] } = this.state;
    if (pickWareType === 'PICK_UP') {
      this.handleUpdateStatus(record, 1, 'pick');
    } else {
      if (defaultAddress?.[0]) {
        this.selectAddDs.create(defaultAddress?.[0]);
      }
      this.confirmModal = c7nModal({
        title: intl.get('smodr.afterSaleManage.model.approveSuccess').d('审批通过'),
        onOk: () => this.handleUpdateStatus(record, 1, 'modal'),
        style: { width: 380 },
        children: (
          <AddressSelect
            changeModal={() => this.handleChangeModal(record)}
            handleGetValue={this.getSupAddId}
            supplierCompanyId={record.get('supplierCompanyId')}
          />
        ),
      });
    }
  }

  @Bind()
  handleChangeModal(record) {
    this.confirmModal.update({
      title: intl.get('smodr.afterSaleManage.view.addAddress').d('新建地址'),
      onOk: () => this.addAddress(record),
      onCancel: () => {
        this.confirmModal.update({
          title: intl.get('smodr.afterSaleManage.model.approveSuccess').d('审批通过'),
          onOk: () => this.handleUpdateStatus(record, 1, 'modal'),
          onCancel: () => true,
          okText: intl.get('smodr.afterSaleManage.model.confirm').d('确定'),
          children: (
            <AddressSelect
              supplierCompanyId={record.get('supplierCompanyId')}
              changeModal={() => this.handleChangeModal(record)}
              handleGetValue={this.getSupAddId}
            />
          ),
        });
        return false;
      },
      afterClose: () => this.confirmModal?.close(),
      style: { width: 380 },
      okText: intl.get('hzero.common.button.save').d('保存'),
      // 确认退货地址弹窗 和 新增地址弹窗 公用的一个弹窗， 需重置
      okProps: { disabled: false },
      footer: (okBtn, cancelBtn) => (<>{okBtn}{cancelBtn}</>),
      children: <NewAddressModal onRef={this.handleRef} />,
    });
  }

  @Bind()
  async addAddress(record, addModal) {
    let value = {};
    const flag = await this.form?.formDs?.validate();
    value = this.form?.formDs?.toData()[0];
    if (flag) {
      const { regionIdList = [] } = value;
      const addressValue = {
        // supplierCompanyId: companyId,
        supplierTenantId: tenantId,
        regionId: regionIdList[0],
        cityId: regionIdList[1],
        districtId: regionIdList[2],
        streetId: regionIdList[3],
        ...value,
      };
      createAddress(addressValue).then(async (res) => {
        if (res && !res.failed) {
          notification.success();
          addModal?.close();
          const result = await fetchSupAddress(record.get('supplierCompanyId'));
          this.setState({ returnAddress: result, defaultAddress: [res] }, () => {
            this.confirmModal?.update({
              title: intl.get('smodr.afterSaleManage.model.approveSuccess').d('审批通过'),
              onOk: () => this.handleUpdateStatus(record, 1, 'modal'),
              onCancel: () => true,
              style: { width: 380 },
              okText: intl.get('smodr.afterSaleManage.model.confirm').d('确定'),
              children: (
                <AddressSelect
                  supplierCompanyId={record.get('supplierCompanyId')}
                  defaultAddress={[res]}
                  returnAddress={result}
                  changeModal={() => this.handleChangeModal(record)}
                  handleGetValue={this.getSupAddId}
                />
              ),
            });
          });
          const { modal } = this.state;
          if (modal) {
            modal.update({
              footer: () => (
                <div>
                  <Button
                    onClick={() => this.handleOK(record, modal)}
                    style={{ backgroundColor: 'rgb(71, 184, 129)', color: '#fff', border: 'none' }}
                  >
                    {intl.get('smodr.afterSaleManage.model.passnew').d('通过')}
                  </Button>
                  <Button
                    onClick={() => this.handelReject(record, modal)}
                    style={{ backgroundColor: '#F56349', color: '#fff', border: 'none' }}
                  >
                    {intl.get('smodr.afterSaleManage.model.nopassnew').d('驳回')}
                  </Button>
                </div>
              ),
            });
          }
        } else {
          notification.warning({ message: res?.message });
        }
        return true;
      });
    } else return false;
    return false;
  }

  @Bind()
  async handleRejectAccept(record) {
    const afterSaleId = record.get('afterSaleId');
    let flag = false;
    flag = await this.rejectFormDs.validate();
    if (flag) {
      const params = this.rejectFormDs.toData()[0] || {};
      this.setState({ rejectLoading: true });
      const res = await updateAcceptStatus({
        ...params,
        supplierProcessStatus: 2,
        afterSaleId,
      });
      const result = getResponse(res);
      this.setState({ rejectLoading: false });
      if (result) {
        notification.success();
        this.tableDs.query();
        this.state?.modal?.close();
      }
    }
  }

  @Bind()
  handleOpenReject(record, status, text) {
    const { rejectLoading } = this.state;
    const placeholder =
      status === 2
        ? intl
          .get('smodr.afterSaleManage.model.nopassTips')
          .d('填写驳回原因，更好解决售后事务（100字以内）')
        : intl
          .get('smodr.afterSaleManage.model.noreceiveTips')
          .d('填写拒收原因，更好解决售后事务（100字以内）');
    const label = status === 2
      ? intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因')
      : intl.get('smodr.afterSaleManage.model.noReceiveResult').d('拒收原因');
    this.rejectFormDs.getField('remark').set('label', label);
    Modal.open({
      destroyOnClose: true,
      title: text,
      mask: true,
      closable: true,
      movable: false,
      drawer: true,
      style: { width: 380 },
      onOk:
        status === 2
          ? () => this.handleReject(record, status)
          : () => this.handleRejectAccept(record, status),
      okProps: { loading: rejectLoading },
      afterClose: () => {
        this.rejectFormDs.reset();
      },
      children: (
        <FormPro dataSet={this.rejectFormDs} labelLayout="float">
          <TextArea name="remark" resize="both" placeholder={placeholder} />
        </FormPro>
      ),
    });
  }

  @Bind()
  async handleUpdateAcceptStatus(record, status) {
    const afterSaleId = record.get('afterSaleId');
    const afterSaleStatus = record.get('afterSaleStatus');
    if (afterSaleStatus === 'WAIT_SENT') {
      Modal.confirm({
        title: intl
          .get('smodr.afterSaleManage.model.acceptTip')
          .d('客户尚未发出商品是否确认接收？'),
        onOk: async () => {
          const params = { supplierProcessStatus: status, afterSaleId };
          const res = await updateAcceptStatus(params);
          const result = getResponse(res);
          if (result) {
            notification.success();
            this.tableDs.query();
            this.state?.modal?.close();
          }
        },
      });
    } else {
      const params = { supplierProcessStatus: status, afterSaleId };
      const res = await updateAcceptStatus(params);
      const result = getResponse(res);
      if (result) {
        notification.success();
        this.tableDs.query();
        this.state?.modal?.close();
      }
    }
  }

  @Bind()
  async handleSubmitWayBill(record, wayBillDs) {
    const afterSaleId = record.get('afterSaleId');
    const flag = await wayBillDs.validate();
    if (flag) {
      const params = wayBillDs.toData()[0] || {};
      this.setState({ submitLoading: true });
      const res = await submitWayBill({ ...params, afterSaleId });
      const result = getResponse(res);
      this.setState({ submitLoading: false });
      if (result) {
        notification.success();
        this.tableDs.query();
        this.state?.modal?.close();
        return true;
      }
      return false;
    }
    return false;
  }

  @Bind()
  handleOpenWayBill(record) {
    const { submitLoading } = this.state;
    const afterSaleWaybillList = record.get('afterSaleWaybillList');
    const wayBillDs = new DataSet({
      autoCreate: true,
      fields: [
        {
          name: 'logisticsCompanyLov',
          type: 'object',
          label: intl.get('smodr.afterSaleManage.model.logisticsCompanyName').d('快递公司'),
          lovCode: 'SINV.ASN_SHIPPER_NAME',
          lovPara: { tenantId: organizationId },
          required: true,
          ignore: 'always',
        },
        {
          name: 'logisticsNum',
          type: 'string',
          label: intl.get('smodr.afterSaleManage.model.logisticsNum').d('快递单号'),
          required: true,
        },
        {
          name: 'deliverTime',
          type: 'dateTime',
          label: intl.get('smodr.afterSaleManage.model.deliverTime').d('发货时间'),
          required: record.get('cecFromCode') !== 'CATA',
        },
        {
          name: 'logisticsCompanyCode',
          bind: 'logisticsCompanyLov.value',
        },
        {
          name: 'logisticsCompanyName',
          bind: 'logisticsCompanyLov.meaning',
        },
      ],
    });
    return (
      !(
        afterSaleWaybillList?.length > 0 &&
        afterSaleWaybillList.filter((bill) => bill.logisticsType === 'RENEW')?.length > 0
      ) &&
      Modal.open({
        destroyOnClose: true,
        title: intl.get('smodr.afterSaleManage.model.referBill').d('提交运单'),
        mask: true,
        movable: false,
        closable: true,
        drawer: true,
        width: 400,
        okText: intl.get('smodr.afterSaleManage.model.refer').d('提交'),
        onOk: () => this.handleSubmitWayBill(record, wayBillDs),
        okProps: { loading: submitLoading },
        afterClose: () => {
          wayBillDs.reset();
        },
        children: (
          <FormPro dataSet={wayBillDs} labelLayout="float">
            <LovPro name="logisticsCompanyLov" />
            <TextField name="logisticsNum" />
            {record.get('cecFromCode') !== 'CATA' && <DateTimePicker name="deliverTime" />}
          </FormPro>
        ),
      })
    );
  }

  @Bind()
  renderActions({ record }) {
    switch (record.get('afterSaleStatus')) {
      case 'APPROVING': {
        return (
          <>
            <Button color="primary" funcType="link" onClick={() => this.handleOpenModal(record)}>
              {intl.get('smodr.afterSaleManage.model.passnew').d('通过')}
            </Button>
            <Button
              color="primary"
              funcType="link"
              onClick={() =>
                this.handleOpenReject(
                  record,
                  2,
                  intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因')
                )
              }
            >
              {intl.get('smodr.afterSaleManage.model.nopassnew').d('驳回')}
            </Button>
          </>
        );
      }
      case 'WAIT_PROCESS': {
        return (
          <>
            <Button
              color="primary"
              funcType="link"
              onClick={() => this.handleUpdateAcceptStatus(record, 1)}
            >
              {intl.get('smodr.afterSaleManage.model.receivePro').d('接收商品')}
            </Button>
            <Button
              color="primary"
              funcType="link"
              onClick={() =>
                this.handleOpenReject(
                  record,
                  1,
                  intl.get('smodr.afterSaleManage.model.noreceiveResult').d('拒收原因')
                )
              }
            >
              {intl.get('smodr.afterSaleManage.model.noreceivePro').d('拒收商品')}
            </Button>
          </>
        );
      }
      case 'WAIT_SENT': {
        return (
          <>
            <Button
              color="primary"
              funcType="link"
              onClick={() => this.handleUpdateAcceptStatus(record, 1)}
            >
              {intl.get('smodr.afterSaleManage.model.receivePro').d('接收商品')}
            </Button>
            <Button
              color="primary"
              funcType="link"
              onClick={() =>
                this.handleOpenReject(
                  record,
                  1,
                  intl.get('smodr.afterSaleManage.model.noreceiveResult').d('拒收原因')
                )
              }
            >
              {intl.get('smodr.afterSaleManage.model.noreceivePro').d('拒收商品')}
            </Button>
          </>
        );
      }
      case 'WAIT_CONFIRM': {
        return record.get('afterSaleType') !== 'RETURN' &&
          record.get('afterSaleWaybillList').filter((bill) => bill.logisticsType === 'RENEW')
            ?.length <= 0
          ? (
            <Button color="primary" funcType="link" onClick={() => this.handleOpenWayBill(record)}>
              {intl.get('smodr.afterSaleManage.model.newFillLast').d('填写返件运单')}
            </Button>
          ) : (
            <></>
          );
      }
      default: {
        return <></>;
      }
    }
  }

  @Bind()
  renderOptions({ record }) {
    return (
      <span className="action-link">
        <Button color="primary" funcType="link" onClick={() => this.showHistory(record)}>
          {intl.get('smodr.afterSaleManage.view.history').d('操作记录')}
        </Button>
        {this.renderActions({ record })}
      </span>
    );
  }

  // 获取退货地址
  @Bind()
  async fetchSupAddress(supplierCompanyId) {
    const res = await fetchSupAddress(supplierCompanyId);
    const defaultAddress = res.filter((item) => !!item.addressFlag) || [];
    this.setState({ returnAddress: res, defaultAddress });
  }

  componentDidMount() {
    // this.initData();
    this.fetchList();
    if (this.state?.modal) {
      Modal.destroyAll();
    }
  }

  // @Bind()
  // async initData() {
  //   const { companyId } = this.companyDs?.toData()?.[0];
  //   const res = await fetchCurrentCompany();
  //   const result = getResponse(res);
  //   const { content = [] } = result;
  //   if (content.length === 0) {
  //     return;
  //   }
  //   if (result && !companyId) {
  //     const currentCompany = content && content.length ? content[0] : {};
  //     this.companyDs.create(currentCompany, 0);
  //     this.setState({ currentCompany }, () => this.fetchList());
  //   } else {
  //     () => this.fetchList();
  //   }
  // }

  hColumns = [
    {
      name: 'userName',
      width: 80,
    },
    {
      name: 'operationTime',
      width: 160,
    },
    {
      name: 'description',
      width: 200,
    },
    {
      name: 'sourceSystemMeaning',
      minWidth: 160,
    },
  ];

  @Bind()
  showHistory(record) {
    openRecords(record.get('afterSaleId'));
  }

  @Bind()
  handleAddRecord() {
    this.props.history.push(`/s2-mall/oms/after-sale-manage/create`);
  }

  @Bind()
  comformReject(record) {
    this.handleReject(record, 2);
  }

  @Bind()
  handelReject(record, modal) {
    modal.update({
      footer: () => (
        <div style={{ display: 'flex', height: '32px', alignItems: 'center' }}>
          <FormPro dataSet={this.rejectFormDs} labelLayout="float">
            <TextField
              style={{ width: '98%', marginRight: '16px' }}
              name="remark"
              placeholder={intl.get('smodr.afterSaleManage.model.nopassResult').d('驳回原因')}
            />
          </FormPro>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button onClick={() => this.comformReject(record)} color="primary">
              {intl.get('smodr.afterSaleManage.model.confirm').d('确认')}
            </Button>
            <Button onClick={() => this.handleCancel(record, modal)}>
              {intl.get('smodr.afterSaleManage.model.cancel').d('取消')}
            </Button>
          </div>
        </div>
      ),
    });
  }

  @Bind()
  handleCancel(record, modal) {
    modal.update({
      footer: () => (
        <div>
          <Button
            onClick={() => this.handleOK(record, modal)}
            style={{ backgroundColor: 'rgb(71, 184, 129)', color: '#fff', border: 'none' }}
          >
            {intl.get('smodr.afterSaleManage.model.passnew').d('通过')}
          </Button>
          <Button
            onClick={() => this.handelReject(record, modal)}
            style={{ backgroundColor: '#F56349', color: '#fff', border: 'none' }}
          >
            {intl.get('smodr.afterSaleManage.model.nopassnew').d('驳回')}
          </Button>
        </div>
      ),
    });
  }

  @Bind()
  handleRef(ref = {}) {
    this.form = ref || {};
  }

  @Bind()
  handleModalRef(ref = {}) {
    this.detailModal = ref;
  }

  @Bind()
  handleChange(value, record) {
    if (value === '1') {
      const addModal = c7nModal({
        title: intl.get('smodr.afterSaleManage.view.addAddress').d('新建地址'),
        onOk: () => this.addAddress(record, addModal),
        afterClose: () => this.confirmModal?.close(),
        style: { width: 380 },
        okText: intl.get('hzero.common.button.save').d('保存'),
        children: <NewAddressModal onRef={this.handleRef} />,
      });
      // this.state.modal.update({
      //   footer: <></>,
      // });
    }
  }

  @Bind()
  handleOK(record, modal) {
    const { primaryColor } = this.props;
    const pickWareType = record?.get('pickWareType');
    const { returnAddress = [] } = this.state;
    if (pickWareType === 'PICK_UP') {
      this.handleUpdateStatus(record, 1, 'pick');
    } else {
      modal.update({
        footer: () => (
          <div style={{ display: 'flex', height: '32px', alignItems: 'center' }}>
            <FormPro dataSet={this.selectAddDs} labelLayout="float">
              <Select
                size="large"
                style={{ width: '98%', marginRight: '16px', height: '32px' }}
                name="supplierAddressId"
                dropdownMenuStyle={{ maxWidth: '1000px' }}
                onChange={(value) => this.handleChange(value, record)}
                placeholder={intl.get('smodr.afterSaleManage.model.returnAdd').d('退货地址')}
                optionRenderer={({ value, text }) => {
                  if (value === '1') {
                    return (
                      <div style={{ color: primaryColor }}>
                        <span>{intl.get('smodr.afterSaleManage.model.newAdd').d('新建地址')}</span>
                      </div>
                    );
                  } else {
                    return <div>{text}</div>;
                  }
                }}
              >
                <Select.Option key="1" value="1">
                  {intl.get('smodr.afterSaleManage.model.newAdd').d('新建地址')}
                </Select.Option>
                {returnAddress.map((item) => (
                  <Select.Option key={item?.supplierAddressId} value={item?.supplierAddressId}>
                    {item?.returnAddress}
                  </Select.Option>
                ))}
              </Select>
            </FormPro>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button onClick={() => this.handleUpdateStatus(record, 1)} color="primary">
                {intl.get('smodr.afterSaleManage.model.confirm').d('确认')}
              </Button>
              <Button onClick={() => this.handleCancel(record, modal)}>
                {intl.get('smodr.afterSaleManage.model.cancel').d('取消')}
              </Button>
            </div>
          </div>
        ),
      });
    }
  }

  @Bind()
  async handleViewDetail(record) {
    const recordData = record.toData();
    const res = await fetchSupAddress(record.get('supplierCompanyId'));
    const defaultAddress = res.filter((item) => !!item.addressFlag) || [];
    this.setState({ returnAddress: res });
    // this.setState({ recordData }, () => {
    // const { defaultAddress = [] } = this.state;
    if (defaultAddress?.[0]) {
      this.selectAddDs.create(defaultAddress?.[0]);
    }
    const modal = Modal.open({
      title: intl.get('smodr.afterSaleManage.model.afterSaleDetailTitle').d('售后申请单详情'),
      key: '1',
      movable: false,
      closable: true,
      maskClosable: true,
      destroyOnClose: true,
      drawer: true,
      style: { width: 1090 },
      // mask: false,
      bodyStyle: { padding: 0 },
      children: <AfsDetail afsLine={record.toData()} />,
      afterClose: () => this.selectAddDs.reset(),
      footer: () => {
        if (!['APPROVING', 'WAIT_PROCESS', 'WAIT_CONFIRM'].includes(recordData?.afterSaleStatus)) {
          return (
            <Button
              onClick={() => {
                modal.close();
              }}
              color="primary"
            >
              {intl.get('smodr.afterSaleManage.model.guanbi').d('关闭')}
            </Button>
          );
        }
        if (recordData?.afterSaleStatus === 'APPROVING') {
          return (
            <div>
              <Button
                onClick={() => this.handleOK(record, modal)}
                style={{ backgroundColor: 'rgb(71, 184, 129)', color: '#fff', border: 'none' }}
              >
                {intl.get('smodr.afterSaleManage.model.passnew').d('通过')}
              </Button>
              <Button
                onClick={() => this.handelReject(record, modal)}
                style={{ backgroundColor: '#F56349', color: '#fff', border: 'none' }}
              >
                {intl.get('smodr.afterSaleManage.model.nopassnew').d('驳回')}
              </Button>
            </div>
          );
        }
        if (
          recordData?.afterSaleStatus === 'WAIT_PROCESS' ||
          recordData?.afterSaleStatus === 'WAIT_SENT'
        ) {
          return (
            <div>
              <Button onClick={() => this.handleUpdateAcceptStatus(record, 1)} color="primary">
                {intl.get('smodr.afterSaleManage.model.receivePro').d('接收商品')}
              </Button>
              <Button
                onClick={() =>
                  this.handleOpenReject(
                    record,
                    1,
                    intl.get('smodr.afterSaleManage.model.noreceiveResult').d('拒收原因')
                  )
                }
              >
                {intl.get('smodr.afterSaleManage.model.noreceivePro').d('拒收商品')}
              </Button>
            </div>
          );
        }
        if (recordData?.afterSaleStatus === 'WAIT_CONFIRM') {
          return record.get('afterSaleType') !== 'RETURN' &&
            record.get('afterSaleWaybillList').filter((bill) => bill.logisticsType === 'RENEW')
              ?.length <= 0
            ? (
              <Button onClick={() => this.handleOpenWayBill(record)}>
                {intl.get('smodr.afterSaleManage.model.newFillLast').d('填写返件运单')}
              </Button>
            ) : (
              <Button onClick={() => modal.close()} color="primary">
                {intl.get('smodr.afterSaleManage.model.guanbi').d('关闭')}
              </Button>
            );
        }
      },
    });
    this.setState({ modal });
    // });
  }

  /**
   * 切换公司
   * @param {*} lovRecord
   */
  // @Bind()
  // changeCurrentCompany(lovRecord = {}) {
  //   const {
  //     currentCompany: { companyId: prevCompanyId },
  //   } = this.state;
  //   if (prevCompanyId && lovRecord?.companyId && prevCompanyId !== lovRecord?.companyId) {
  //     this.setState(
  //       {
  //         currentCompany: { companyId: lovRecord?.companyId, companyName: lovRecord?.companyName },
  //       },
  //       this.fetchList
  //     );
  //   }
  // }

  @Bind()
  handleToAddress() {
    const {
      currentCompany: { companyId },
    } = this.state;
    this.props.history.push(
      `/s2-mall/oms/after-sale-manage/address-manage?supplierCompanyId=${companyId}`
    );
  }

  @Bind()
  fetchList(params = {}) {
    // const {
    //   currentCompany: { companyId },
    // } = this.state;
    // if (this.state?.currentCompany?.companyId) {
    //   this.fetchSupAddress(companyId);
    //   this.tableDs.setQueryParameter('supplierCompanyId', companyId);
    //   this.tableDs.setQueryParameter('filterParams', { ...params });
    //   this.tableDs.query();
    // }
    this.tableDs.setQueryParameter('filterParams', { ...params });
    this.tableDs.query();
  }

  // @Bind()
  // fetchList(params = {}) {
  //   const {
  //     currentCompany: { companyId },
  //     value,
  //   } = this.state;
  //   if (this.state?.currentCompany?.companyId) {
  //     this.fetchSupAddress(companyId);
  //     this.tableDs.setQueryParameter('supplierCompanyId', companyId);
  //     this.tableDs.setQueryParameter('filterParams', { ...params });
  //     if (value) {
  //       if (value.length === 1) {
  //         this.tableDs.setQueryParameter('afterSaleCode', value[0]);
  //         this.tableDs.setQueryParameter('afterSaleCodeList', null);
  //       } else {
  //         this.tableDs.setQueryParameter('afterSaleCode', null);
  //         this.tableDs.setQueryParameter('afterSaleCodeList', value.join(','));
  //       }
  //     } else {
  //       this.tableDs.setQueryParameter('afterSaleCode', null);
  //       this.tableDs.setQueryParameter('afterSaleCodeList', null);
  //     }
  //     this.tableDs.query();
  //   }
  // }

  render() {
    const { customizeTable } = this.props;
    // const { value } = this.state;
    // const resetQueryDs = () => {
    //   this.tableDs.reset();
    //   this.tableDs.setQueryParameter('afterSaleCode', null);
    //   this.tableDs.setQueryParameter('afterSaleCodeList', null);
    //   this.setState({ value: undefined });
    // };
    return (
      <React.Fragment>
        <div className={styles['after-sale-contain']}>
          <Header title={intl.get('smodr.afterSaleManage.view.titleSup').d('售后管理(供)')}>
            <Button onClick={this.handleToAddress} funcType="flat">
              <Icon type="settings" />
              <span>{intl.get('smodr.afterSaleManage.view.tuihuo').d('退货地址管理')}</span>
            </Button>
            {/* <div className="current-company">
              <span
                className="company-title"
                style={{ display: 'inline-block', top: '1px', position: 'relative' }}
              >
                {intl.get('smodr.common.view.currentCom').d('所在公司')}
              </span>
              <LovPro
                dataSet={this.companyDs}
                name="companyLov"
                clearButton
                onChange={(lovRecord) => this.changeCurrentCompany(lovRecord)}
              />
            </div> */}
          </Header>
        </div>

        <Content>
          <div style={{ height: 'calc(100vh - 200px)' }}>
            {customizeTable(
              {
                code: 'SMODR.AFTERSALE_NEW.QUERY',
              },
              <SearchBarTable
                // cacheState
                style={{ maxHeight: `calc(100% - 22px)` }}
                searchCode="SMODR.AFTERSALE_NEW.SELECT"
                customizedCode="SMODR.AFTER_SALE_MANAGE.LIST.SELECT"
                dataSet={this.tableDs}
                columns={this.columns}
                searchBarConfig={{
                  onQuery: (params) => this.fetchList(params),
                }}
              />
            )}
          </div>
        </Content>
      </React.Fragment>
    );
  }
}
