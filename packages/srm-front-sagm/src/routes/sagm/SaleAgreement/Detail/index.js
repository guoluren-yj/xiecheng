import React, { Component, Fragment } from 'react';
import { Spin, Popconfirm } from 'choerodon-ui';
import { DataSet, Button, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isNumber } from 'lodash';
import qs from 'qs';
// import { observer } from 'mobx-react-lite';
// import uuidv4 from 'uuid/v4';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';

import { showRecordModal } from '@/utils/c7nModal';
import {
  saveAgreement,
  effectAgreement,
  expireAgreement,
  fetchAgreementDetail,
  deleteAgreement,
  fetchMaxPriority,
} from './api';
import Anchor from '@/components/Anchor';
import BaseInfo from './BaseInfo';
import Strategy from './Strategy2';
import SaleLine from './SaleLine';
import Permisson from './Authority';
import OrderLimit from './OrderLimit';
import ReceiveSaleLine from '../../SagmWorkbench/Detail/ReceiveSaleLine';
import ReceiveLimit from '../../SagmWorkbench/Detail/ReceiveLimit';
import FormPro from '../../SagmWorkbench/Comps/FormPro';
import {
  baseInfoDs,
  strategyDs,
  saleLineDs,
  invoiceDs,
  saleLineQueryDs,
  orderLimitDs,
} from './storeDs';
import { getReceiveLimitDs } from '../../SagmWorkbench/Stores/receiveDs';
import { saveSalePriceStrategy } from '../../SagmWorkbench/api';

import style from './index.less';

@formatterCollections({
  code: ['sagm.common', 'sagm.saleAgreement', 'sagm.priceStrategy', 'sagm.productAuthority'],
})
export default class AgreementDetail extends Component {
  constructor(props) {
    super(props);

    this.organizationId = getCurrentOrganizationId();

    const {
      match: { params },
      location: { search, state },
    } = props;

    const { backPath } = state || {};

    this.backPath = backPath;

    const { agreementHeaderId } = qs.parse(search.substr(1));

    this.baseInfoDs = new DataSet(baseInfoDs());
    this.baseInfoDs.create({});

    this.strategyDs = new DataSet(strategyDs());

    this.saleLineDs = new DataSet(saleLineDs());
    this.saleLineQueryDs = new DataSet(saleLineQueryDs());

    this.orderLimitDs = new DataSet(orderLimitDs(agreementHeaderId));
    this.receiveLimitDs = new DataSet(getReceiveLimitDs());

    this.invoiceDs = new DataSet(invoiceDs());

    this.lovFieldsParaSet(agreementHeaderId);

    this.strategyDs.setQueryParameter('agreementHeaderId', agreementHeaderId);

    this.saleLineDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
    this.invoiceDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
    this.orderLimitDs.setQueryParameter('agreementHeaderId', agreementHeaderId);

    this.state = {
      agreementHeaderId,
      status: params.status,
      detailData: {},
      loading: false,
      saveLoading: false,
      effectLoading: false,
      expireLoading: false,
      // isTitleB, // 判断标题是否显示为维护

      maxPriority: 0,
      prioritys: [], // 价格策略初始优先级，作为拖拽的锚

      agreementHeaderType: null,
      receiveSalineFresh: 0, // 用来使得子组件刷新的
    };
  }

  lovFieldsParaSet = (agreementHeaderId) => {
    const fields = ['strategyLov'];
    fields.forEach((field) => {
      const skuField = this.saleLineQueryDs.getField(field);
      skuField.setLovPara('agreementHeaderId', agreementHeaderId);
    });
  };

  componentDidMount() {
    const { agreementHeaderId } = this.state;
    if (agreementHeaderId) {
      this.initData();
    }
  }

  fetchSaleLine = (currentPage) => {
    const { agreementHeaderType, receiveSalineFresh } = this.state;
    if (agreementHeaderType) {
      if (agreementHeaderType === 'RECEIVE') {
        this.setState({ receiveSalineFresh: receiveSalineFresh + 1 });
      } else {
        this.saleLineDs.query(currentPage ? this.saleLineDs.currentPage : 1);
      }
    }
  };

  @Bind
  initData() {
    this.fetchInfo();
    // this.fetchSaleLine();
    this.invoiceDs.query();
    this.orderLimitDs.query();
    this.receiveLimitDs.query();
    this.fetchMaxPriority();
    this.fetchSalePriceStrategy();
  }

  @Bind()
  fetchDataByStrategyUpdate() {
    this.fetchMaxPriority();
    this.fetchSalePriceStrategy(this.strategyDs.currentPage);
    this.fetchSaleLine(true);
  }

  // 查询明细
  @Bind
  async fetchInfo() {
    const { agreementHeaderId } = this.state;
    this.invoiceDs.getField('membelLabelLov').setLovPara('agreementHeaderId', agreementHeaderId);
    this.setState({ loading: true });
    const result = getResponse(
      await fetchAgreementDetail({
        agreementHeaderId,
        customizeUnitCode: 'SAGM.SALE_AGREEMENT.DETAIL.BASE_INFO',
      })
    );
    this.setState({ loading: false });
    if (result) {
      const { content } = result;
      const detailData = content[0] || {};
      this.baseInfoDs.create(detailData);
      this.setState({ detailData, agreementHeaderType: detailData.agreementHeaderType }, () => {
        this.fetchSaleLine();
      });
    }
  }

  @Bind
  async fetchSalePriceStrategy(page) {
    const res = getResponse(await this.strategyDs.query(page));
    if (res) {
      this.handleUpdatePrioritys(res.content || []);
    }
  }

  // 查询最大优先级
  @Bind
  async fetchMaxPriority() {
    const { agreementHeaderId } = this.state;
    const maxPriority = getResponse(await fetchMaxPriority({ agreementHeaderId }));
    if (isNumber(maxPriority)) {
      this.setState({ maxPriority });
    }
  }

  // 传入一组数据更新优先级数据源
  @Bind
  handleUpdatePrioritys(data = []) {
    const prioritys = data.map((m, index) => ({
      index,
      priority: m.priority,
    }));
    this.setState({ prioritys });
  }

  // 保存/提交
  @Bind
  async handleSave(statusCode) {
    // const { detailData } = this.state;
    const flag = await this.baseInfoDs.current.validate();
    const detailData = this.baseInfoDs.current.toData();
    const isMember = detailData.agreementHeaderType === 'MEMBER';
    const isReceive = detailData.agreementHeaderType === 'RECEIVE';

    const invoiceFlag = isMember ? await this.invoiceDs.validate() : true;
    const orderFlag = isMember ? await this.orderLimitDs.validate() : true;
    const receiveFlag = isReceive ? await this.receiveLimitDs.validate() : true;

    if (flag && invoiceFlag && orderFlag && receiveFlag) {
      const values = this.baseInfoDs.current.toJSONData();
      const saleInvoicingRulesList = this.invoiceDs.toJSONData();
      const salePointsLimits = this.orderLimitDs.toJSONData();
      const params = {
        ...detailData,
        ...values,
        statusCode,
        saleInvoicingRulesList,
        salePointsLimits,
      };
      if (isReceive) {
        params.saleAgreementReceiveLimits = this.receiveLimitDs.toJSONData();
      } else {
        const salePriceStrategyLines = this.strategyDs.map((record) => record.toData());
        params.salePriceStrategyLines = salePriceStrategyLines;
      }
      // const delKeys = ['purchaseAgreementLov', 'originalSupplierCompanyLov', 'proxyCompanyLov'];

      // delKeys.forEach((key) => delete params[key]);

      this.setState({ saveLoading: true });
      const result = getResponse(await saveAgreement(params));
      this.setState({ saveLoading: false });
      if (result) {
        const { agreementHeaderId } = result;
        notification.success();
        this.props.history.push(
          `/s2-mall/sagm/sale-agreement/detail/edit?agreementHeaderId=${agreementHeaderId}`
        );
        this.setState(
          {
            agreementHeaderId,
          },
          () => {
            this.strategyDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
            this.saleLineDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
            this.invoiceDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
            this.orderLimitDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
            this.receiveLimitDs.setQueryParameter('agreementHeaderId', agreementHeaderId);
            this.lovFieldsParaSet(agreementHeaderId);
            this.initData();
          }
        );
      }
    }
  }

  // 删除
  @Bind
  async handleDelete() {
    const { detailData } = this.state;
    this.setState({ deleteLoading: true });
    const result = getResponse(await deleteAgreement(detailData));
    this.setState({ deleteLoading: false });
    if (result) {
      notification.success();
      this.props.history.push('/s2-mall/sagm/sale-agreement/list');
    }
  }

  // 生效
  async handleEffect() {
    // const { detailData } = this.state;
    let detailData = {};
    const flag = await this.baseInfoDs.current.validate(true);
    if (!flag) return false;
    detailData = this.baseInfoDs.current.toData();
    const salePointsLimits = this.orderLimitDs.toJSONData();
    detailData.salePointsLimits = salePointsLimits;
    this.setState({ effectLoading: true });
    const result = getResponse(await effectAgreement(detailData));
    this.setState({ effectLoading: false });
    if (result) {
      notification.success();
      const record = { ...detailData, ...result };
      this.setState({
        detailData: record,
        // isTitleB: result.statusCode === 'NEW',
      });
      this.baseInfoDs.loadData([record]);

      this.fetchSaleLine();
      this.orderLimitDs.query();

      this.fetchSalePriceStrategy(this.strategyDs.currentPage);
    }
  }

  // 失效
  async handleExpire() {
    const { detailData } = this.state;
    this.setState({ expireLoading: true });
    const result = getResponse(await expireAgreement(detailData));
    this.setState({ expireLoading: false });
    if (result) {
      notification.success();
      const record = { ...detailData, ...result };
      this.setState({
        detailData: record,
        // isTitleB: result.statusCode === 'NEW',
      });
      this.baseInfoDs.loadData([record]);
      this.fetchSaleLine();
      this.fetchSalePriceStrategy(this.strategyDs.currentPage);
    }
  }

  // 操作记录
  @Bind
  handleOpenHistory() {
    const { agreementHeaderId } = this.state;
    showRecordModal({
      width: 700,
      params: { agreementHeaderId },
      url: `/sagm/v1/${this.organizationId}/sale-agreement-records`,
    });
  }

  // 创建价格策略行
  @Bind
  async handleCreateStrategy(item) {
    const { maxPriority, agreementHeaderId } = this.state;
    const isNew = this.strategyDs.some((f) => f.status === 'add');
    // 如果存在新增的就取当前页最大优先级
    const prioritys = this.strategyDs.records.map((m) => m.get('priority'));
    const priority = isNew ? Math.max(...prioritys) : isNumber(maxPriority) ? maxPriority : 0;
    const filterItem = item
      .filter((m) => !this.strategyDs.some((s) => s.get('strategyCode') === m.strategyCode))
      .map((m, index) => {
        const addRecord = {
          ...m,
          // priceStrategyLineId: uuidv4(),
          agreementHeaderId,
          priority: priority + index + 1,
        };
        if (!agreementHeaderId) {
          this.strategyDs.create(addRecord, 0);
        }
        return addRecord;
      });
    if (filterItem.length > 0) {
      if (agreementHeaderId) {
        this.strategyDs.status = 'submitting';
        const savePriceStragies = this.strategyDs.toJSONData().concat(filterItem);
        const res = getResponse(await saveSalePriceStrategy(savePriceStragies));
        this.strategyDs.status = 'ready';
        if (res) {
          this.handleUpdatePrioritys(this.strategyDs.toData());
          this.strategyDs.query();
          notification.success();
          return true;
        }
        return false;
      } else {
        this.handleUpdatePrioritys(this.strategyDs.toData());
      }
    }
    if (filterItem.length !== item.length) {
      notification.warning({
        message: intl.get('sagm.saleAgreement.model.repeatStrategy').d('重复价格策略无法添加'),
      });
    }
  }

  // 获取当前title
  getTitle = () => {
    const { agreementHeaderId } = this.state;
    const titles = [
      intl.get('sagm.saleAgreement.view.createSaleAgreement').d('新建销售协议'),
      intl.get('sagm.saleAgreement.view.saleAgreementDetail').d('销售协议明细'),
    ];
    // const titleMap = {
    //   a: [
    //     intl.get('sagm.saleAgreement.view.saleAgreement.ec.created').d('电商销售协议创建'),
    //     intl.get('sagm.saleAgreement.view.saleAgreement.cata.created').d('目录化销售协议创建'),
    //   ],
    //   b: [
    //     intl.get('sagm.saleAgreement.view.saleAgreement.ec.matain').d('电商销售协议维护'),
    //     intl.get('sagm.saleAgreement.view.saleAgreement.cata.matain').d('目录化销售协议维护'),
    //   ],
    //   c: [
    //     intl.get('sagm.saleAgreement.view.saleAgreement.ec.detail').d('电商销售协议明细'),
    //     intl.get('sagm.saleAgreement.view.saleAgreement.cata.detail').d('目录化销售协议明细'),
    //   ],
    // };

    // const sourceFromInd = type === 'ec' ? 0 : 1;
    // const key = agreementHeaderId ? (isTitleB ? 'b' : 'c') : 'a';
    return titles[agreementHeaderId ? 1 : 0];
  };

  // 获取权限按钮
  getButtons = () => {
    const {
      agreementHeaderId,
      loading,
      saveLoading,
      effectLoading,
      expireLoading,
      deleteLoading,
      detailData: { statusCode },
    } = this.state;
    const btnLoading = loading || deleteLoading || saveLoading || effectLoading || expireLoading;

    const disabled = !['NEW', 'EXPIRED'].includes(statusCode); // 可以发布的状态为待发布、已失效

    return [
      {
        name: intl.get('sagm.common.button.publish').d('发布'),
        primary: agreementHeaderId,
        disabled: !agreementHeaderId,
        loading: btnLoading,
        hidden: disabled,
        icon: 'finished',
        event: () => this.handleEffect(),
      },
      {
        name: intl.get('sagm.common.button.cancel.publish').d('取消发布'),
        primary: agreementHeaderId,
        disabled: !agreementHeaderId,
        loading: btnLoading,
        hidden: !['TO_BE_EFFECTIVE', 'EFFECTED'].includes(statusCode),
        icon: 'cancel',
        event: () => this.handleExpire(),
        confirmProps: {
          placement: 'bottomRight',
          title: intl.get('sagm.common.view.message.isCancelPublish').d('确认取消发布？'),
        },
      },
      {
        name: intl.get('hzero.common.button.save').d('保存'),
        primary: !agreementHeaderId,
        icon: 'save',
        hidden: agreementHeaderId && disabled,
        event: () => this.handleSave('NEW'),
        loading: btnLoading,
      },
      {
        name: intl.get('hzero.common.button.delete').d('删除'),
        hidden: disabled,
        event: this.handleDelete,
        loading: deleteLoading || loading,
        icon: 'delete',
      },
      {
        name: intl.get('hzero.common.button.operating').d('操作记录'),
        hidden: !agreementHeaderId,
        event: this.handleOpenHistory,
        icon: 'assignment',
      },
    ];
  };

  handleChangeType = (value) => {
    this.setState({ agreementHeaderType: value });
  };

  // 获取区域Content
  getContents = () => {
    const {
      status,
      prioritys,
      loading,
      saveLoading,
      detailData,
      agreementHeaderId,
      agreementHeaderType,
      receiveSalineFresh,
    } = this.state;

    const { agreementHeaderNum, statusCode } = detailData;

    const disabled = ['TO_BE_EFFECTIVE', 'EFFECTED'].includes(statusCode);

    const baseProps = {
      status,
      disabled,
      agreementHeaderId,
      formDs: this.baseInfoDs,
      onChangeType: this.handleChangeType,
    };

    const viewSkuBackPath = `/s2-mall/sagm/sale-agreement/detail/${status}?agreementHeaderId=${agreementHeaderId}`;

    const strategyProps = {
      prioritys,
      disabled,
      viewSkuBackPath,
      agreementHeaderId,
      tableDs: this.strategyDs,
      onRefresh: this.fetchSalePriceStrategy,
      onCreateStrategy: this.handleCreateStrategy,
      onUpdateData: this.fetchDataByStrategyUpdate,
    };

    const saleLineProps = {
      viewSkuBackPath,
      agreementHeaderId,
      agreementHeaderType,
      tableDs: this.saleLineDs,
      path: this.props.match.path,
    };

    if (agreementHeaderId) {
      this.strategyDs.paging = true;
      this.saleLineDs.paging = true;
      this.orderLimitDs.paging = true;
      this.invoiceDs.paging = true;
      this.saleLineDs.queryDataSet = this.saleLineQueryDs;
    }

    const permissonProps = {
      viewSkuBackPath,
      agreementHeaderId,
      agreementHeaderNum,
      agreementHeaderType,
      channel: agreementHeaderType === 'MEMBER' ? 'PERSONAL' : 'ENTERPRISE',
      controlRange: agreementHeaderType === 'MEMBER' ? 'MEMBER' : 'SALE',
      agreementType: 'SALE_AGREEMENT',
      readOnly: status !== 'edit',
    };

    const orderLimitProps = {
      agreementHeaderId,
      disabled,
      tableDs: this.orderLimitDs,
    };
    return [
      {
        anchorKey: 'sagm_base-info',
        title: intl.get('sagm.common.view.baseInfo').d('基本信息'),
        component: (
          <Spin spinning={loading || saveLoading}>
            <BaseInfo {...baseProps} />
          </Spin>
        ),
      },
      {
        anchorKey: 'sagm_strategys',
        title: intl.get('sagm.common.view.priceStragegy').d('价格策略'),
        component: <Strategy {...strategyProps} />,
        show: agreementHeaderType && agreementHeaderType !== 'RECEIVE',
      },
      {
        anchorKey: 'sagm_lines',
        title: intl.get('sagm.saleAgreement.view.saleLine').d('销售协议行'),
        component: <SaleLine {...saleLineProps} />,
        show: agreementHeaderType !== 'RECEIVE',
      },
      {
        anchorKey: 'sagm_receive_lines',
        title: intl.get('sagm.saleAgreement.view.saleLine').d('销售协议行'),
        show: agreementHeaderType === 'RECEIVE',
        component: (
          <ReceiveSaleLine
            readOnly={disabled}
            path={this.props.match.path}
            agreementHeaderId={agreementHeaderId}
            refresh={receiveSalineFresh}
            onDeleteCallback={() => this.receiveLimitDs.query()}
          />
        ),
      },
      {
        anchorKey: 'sagm_authority',
        title: intl.get('sagm.common.view.buyPermisson').d('采买权限'),
        component: <Permisson {...permissonProps} />,
      },
      {
        anchorKey: 'sagm_payment',
        title: intl.get('sagm.common.view.paymentRule').d('支付规则'),
        show: agreementHeaderType && agreementHeaderType !== 'RECEIVE',
        component: (
          <FormPro
            dataSet={this.baseInfoDs}
            columns={3}
            style={{ width: '75%' }}
            fields={[
              {
                name: agreementHeaderType === 'MEMBER' ? 'paymentType' : 'paymentMethod',
                _type: 'Select',
                disabled,
              },
              {
                name: 'pointsTypeId',
                _type: 'Select',
                disabled,
                noCache: true,
                show: ({ record }) => {
                  if (agreementHeaderType !== 'MEMBER') return false;
                  return record.get('paymentType') && record.get('paymentType') !== 'CASH_PAYMENT';
                },
              },
            ]}
          />
        ),
      },
      {
        anchorKey: 'sagm_receive_limit',
        title: intl.get('sagm.common.view.title.reveiveLimit').d('领用限制'),
        show: agreementHeaderType === 'RECEIVE',
        comp: ReceiveLimit,
        component: (
          <ReceiveLimit
            agreementHeaderId={agreementHeaderId}
            dataSet={this.receiveLimitDs}
            readOnly={disabled}
          />
        ),
      },
      {
        anchorKey: 'sagm_invoice',
        show: agreementHeaderType === 'MEMBER',
        title: intl.get('sagm.common.view.invoiceRule').d('开票规则'),
        component: (
          <Table
            buttons={[
              <Button
                icon="playlist_add"
                disabled={disabled}
                onClick={() => this.invoiceDs.create({}, 0)}
              >
                {intl.get('sagm.common.button.create').d('新建')}
              </Button>,
            ]}
            dataSet={this.invoiceDs}
            columns={[
              { name: 'membelLabelLov', editor: !disabled },
              { name: 'invoiceEntityLov', editor: !disabled },
              { name: 'inventoryLov', editor: !disabled },
              { name: 'purchaseLov', editor: !disabled },
              {
                name: 'action',
                width: 120,
                renderer: ({ record }) => (
                  <a
                    disabled={disabled}
                    onClick={() => {
                      if (record.get('invoicingRuleId')) {
                        this.invoiceDs.delete(record, false);
                      } else {
                        this.invoiceDs.remove(record);
                      }
                    }}
                  >
                    {intl.get('sagm.common.model.delete').d('删除')}
                  </a>
                ),
              },
            ]}
          />
        ),
      },
      {
        anchorKey: 'sagm_expense',
        title: intl.get('sagm.common.view.orderLimit').d('下单限额'),
        show: agreementHeaderType === 'MEMBER',
        component: <OrderLimit {...orderLimitProps} />,
      },
    ].filter((f) => f.show || !('show' in f));
  };

  render() {
    const buttons = this.getButtons();

    const contents = this.getContents();

    const backPath = this.backPath || '/s2-mall/sagm/sale-agreement/list';

    return (
      <Fragment>
        <Header backPath={backPath} title={this.getTitle()}>
          {buttons
            .filter((btn) => !btn.hidden)
            .map((btn) => {
              const { render, primary, icon, event, disabled, loading, confirmProps } = btn;
              const buttonProps = {
                icon,
                disabled,
                loading,
                style: { marginLeft: 8 },
                color: primary ? 'primary' : '',
                funcType: primary ? 'raised' : 'flat',
              };
              return render ? (
                render()
              ) : confirmProps ? (
                <Popconfirm {...confirmProps} onConfirm={event}>
                  <Button {...buttonProps}>{btn.name}</Button>
                </Popconfirm>
              ) : (
                <Button {...buttonProps} onClick={event}>
                  {btn.name}
                </Button>
              );
            })}
        </Header>
        <div id="sagm-container" className={style['sagm-detail-container']}>
          {contents.map((m) => (
            <Content key={m.anchorKey} className="anchor-content">
              <div id={m.anchorKey} className="content-title">
                {m.title}
              </div>
              {m.component}
            </Content>
          ))}
        </div>
        <Anchor list={contents} />
      </Fragment>
    );
  }
}
