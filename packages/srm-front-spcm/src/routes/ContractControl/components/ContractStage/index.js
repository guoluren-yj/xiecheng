import React, { Component, Fragment } from 'react';
import { Button, Table, Select, Lov } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import moment from 'moment';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { getCustByFieldCode } from '@/utils/util';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import BatchStageMaintain from '@/routes/components/BatchStageMaintain';
import { getMasterDefaults } from '@/services/contractMaintainService';
import { fetchExchangeRate } from '@/services/contractCommonService';

import intl from 'utils/intl';

import styles from '../index.less';

const tenantId = getCurrentOrganizationId();

const { Option } = Select;
@withRouter
export default class ContractStage extends Component {
  @Bind()
  handleGetCode() {
    const {
      location: { search },
      unitCodeList,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (routerParams.hasChanged === 'true') {
      return unitCodeList?.STAGE || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE';
    } else {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE.READONLY';
    }
  }

  /**
   * 新建
   * @overide 海亮
   */
  @Bind()
  async handleCreate() {
    const keycode = this.handleGetCode();
    const { remote, pcSubjectDs } = this.props;
    const { fields = [] } = this.props.custConfig[keycode] || {};
    const flag = fields.find(
      (field) => field.fieldCode === 'typeIdLov' && field.defaultValueMeaning
    );
    // 个性化没给付款方式配置默认值时调用接口取默认值。
    let others = {};
    if (!flag) {
      if (!this.masterDefault) {
        this.masterDefault = await getMasterDefaults();
      }
      if (getResponse(this.masterDefault)) {
        const { typeId, typeCode, typeName } = this.masterDefault || {};
        others = { typeId, typeCode, typeName };
      } else {
        this.masterDefault = null;
      }
    }
    if (remote) {
      Object.assign(
        others,
        remote.process('SPCM_CONTRACT_CONTROL_DETAIL_CREATE', {}, { pcSubjectDs, current: this })
      );
    }
    const { currencyCode, purchaseCurrencyCode } =
      pcSubjectDs?.get(0)?.get(['currencyCode', 'purchaseCurrencyCode', 'exchangeRate']) || {}; // 优先默认用标的第一行标的的原币币种作为默认值
    const currencyProps = {
      supplierCurrencyCode: currencyCode,
      purchaseCurrencyCode,
    };
    await this.handleCurrencyCode(currencyProps);
    this.props.pcStageDs.create({ ...currencyProps, ...others }, 0);
  }

  /**
   * 从个性化中取原/本币种
   * @param {object} currencyProps
   */
  @Bind()
  async handleCurrencyCode(currencyProps) {
    // 协议阶段和协议标的币种处理
    /* 协议来源=手工新建/采购申请 标的&阶段行【原币币种】优先取页面个性化【原币币种】默认值，
    如果无默认值配置，则走当前代码逻辑（供应商公司缺省币种作为默认值） */
    const {
      custConfig,
      headerInfo: { supplierCurrencyCode = 'CNY', purchaseCurrencyCode = 'CNY' },
      unitCodeList,
    } = this.props;
    const code = unitCodeList?.STAGE;
    if (
      this.pcStageCurrency &&
      this.pcStageCurrency.supplierCurrencyCode === currencyProps.supplierCurrencyCode &&
      this.pcStageCurrency.purchaseCurrencyCode === currencyProps.purchaseCurrencyCode
    ) {
      // 做个缓存处理，避免每次从个性化单元中取。
      Object.assign(currencyProps, this.pcStageCurrency);
      return;
    }
    const sCurrencyCode =
      currencyProps.supplierCurrencyCode ||
      getCustByFieldCode(custConfig, code, 'supplierCurrencyCodeLov').defaultValueMeaning; // 原
    const pCurrencyCode =
      currencyProps.purchaseCurrencyCode ||
      getCustByFieldCode(custConfig, code, 'purchaseCurrencyCodeLov').defaultValueMeaning; // 本
    const pcStageCurrency = {
      supplierCurrencyCode: sCurrencyCode || supplierCurrencyCode,
      purchaseCurrencyCode: pCurrencyCode || purchaseCurrencyCode,
    };
    Object.assign(currencyProps, pcStageCurrency);
    await this.handleChangeTaxRate(currencyProps);
  }

  /**
   * 根据币种获取汇率
   * @param {object} currencyProps
   */
  @Bind()
  async handleChangeTaxRate(currencyProps, record) {
    const fromCurrencyCode = currencyProps.supplierCurrencyCode;
    const toCurrencyCode = currencyProps.purchaseCurrencyCode;
    if (fromCurrencyCode === toCurrencyCode) {
      Object.assign(currencyProps, { exchangeRate: 1 });
      if (record) {
        record.set({ exchangeRate: 1 });
      }
    } else if (fromCurrencyCode && toCurrencyCode) {
      // defaultRates多个缓存防止每次都请求接口。
      const res = await fetchExchangeRate({
        tenantId,
        fromCurrencyCode,
        toCurrencyCode,
        rateDate: moment(new Date()).format(DEFAULT_DATE_FORMAT),
      });
      let exchangeRate = null;
      let disableChangeRate = false;
      if (getResponse(res) && res.length === 1) {
        exchangeRate = res[0].rate;
        disableChangeRate = res[0].rateMethodCode === 'FR';
      }
      Object.assign(currencyProps, { exchangeRate, disableChangeRate });
      if (record) {
        record.set({ exchangeRate, disableChangeRate });
      }
    }
    this.pcStageCurrency = currencyProps;
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const {
      pcStageDs,
      onFetchTableList,
      pcStageDataSource = [],
      onChangeState,
      unitCodeList,
    } = this.props;
    const selectedRows = pcStageDs.selected;
    const existedAcceptRows = selectedRows.find((s) => [1, '1', 'true'].includes(s.acceptFlag)); // 存在已验收的阶段行（不可删除）
    if (!isEmpty(existedAcceptRows)) {
      notification.warning({
        message: intl
          .get('spcm.common.view.message.title.existedAcceptRows')
          .d('(当前勾选存在)已验收的阶段行,不可删除'),
      });
    } else {
      const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
      const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
      const existedRowPcStageIds =
        (existedRows.length && existedRows.map((v) => v.data.pcStageId)) || [];
      const newStageDataSource =
        (pcStageDataSource.length &&
          pcStageDataSource.filter((v) => !existedRowPcStageIds.includes(v.pcStageId))) ||
        [];
      // 删除本地数据
      pcStageDs.remove(newAddRows);
      // 删除父组件对应的协议阶段行数据
      onChangeState({
        pcStageDataSource: newStageDataSource,
      });
      // 删除线上数据
      const res = await pcStageDs.delete(existedRows);
      if (res && !res.failed) {
        onFetchTableList(pcStageDs, unitCodeList?.STAGE || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.STAGE');
      }
    }
  }

  @Bind()
  handleChangeStage(stageObj, record) {
    record.set({
      stageCode: stageObj?.stageCode,
      prepaymentStage: stageObj?.prepaymentStage,
      stageName: stageObj?.stageName,
    });
  }

  // 改变本币或原币时,修改汇率 这个方法写的不利于复用改用 handleChangeTaxRate
  // @Bind()
  // handleChangeCurrencyCode(type, lovRecord, record) {
  //   const isCurrencyCode = type === 'supplierCurrencyCode';
  //   const compareCurrencyCode =
  //     (isCurrencyCode && record.get('purchaseCurrencyCode')) || record.get('supplierCurrencyCode');
  //   if (lovRecord) {
  //     const { currencyCode = null } = lovRecord;
  //     if (compareCurrencyCode === currencyCode) {
  //       record.set({ exchangeRate: 1 });
  //     } else {
  //       fetchExchangeRate({
  //         tenantId,
  //         fromCurrencyCode: isCurrencyCode ? currencyCode : compareCurrencyCode,
  //         toCurrencyCode: isCurrencyCode ? compareCurrencyCode : currencyCode,
  //         rateDate: moment(new Date()).format(DEFAULT_DATE_FORMAT),
  //       }).then((res) => {
  //         let exchangeRate = null;
  //         let disableChangeRate = false;
  //         if (res && res?.length === 1) {
  //           exchangeRate = res[0]?.rate;
  //           disableChangeRate = res[0]?.rateMethodCode === 'FR';
  //         }
  //         record.set({ exchangeRate, disableChangeRate });
  //       });
  //     }
  //   }
  // }

  renderColumns() {
    const { editable, stageList, headerInfo = {}, remote } = this.props;
    const { contractPendingMethod, contractCalculateMethod } = headerInfo;
    // 协议阶段新建方式为手工新建
    const stageEditFlag = contractPendingMethod === '1';
    let columns = [
      {
        name: 'stageNo',
        width: 80,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'stageCode',
        width: 150,
        editor: (record) =>
          editable && ![1, '1', 'true'].includes(record.acceptFlag) && stageEditFlag,
      },
      {
        name: 'stageName',
        width: 150,
        editor: (record) =>
          editable &&
          ![1, '1', 'true'].includes(record.acceptFlag) &&
          (stageEditFlag ? (
            true
          ) : (
            <Select onChange={(val) => !val && this.handleChangeStage({}, record)}>
              {stageList.map((s) => (
                <Option
                  key={s.stageCode}
                  value={s.stageName}
                  onClick={() => this.handleChangeStage(s, record)}
                >
                  {s.stageName}
                </Option>
              ))}
            </Select>
          )),
      },
      {
        name: 'prepaymentStage',
        width: 120,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'milestoneTime',
        width: 175,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'payRatio',
        width: 175,
        editor: (record) =>
          editable &&
          ![1, '1', 'true'].includes(record.acceptFlag) &&
          contractCalculateMethod !== '0',
      },
      {
        name: 'supplierCurrencyCodeLov',
        width: 150,
        editor: (record) =>
          editable &&
          ![1, '1', 'true'].includes(record.acceptFlag) && (
            <Lov
              onChange={(lovRecord) =>
                this.handleChangeTaxRate(
                  {
                    supplierCurrencyCode: lovRecord?.currencyCode,
                    purchaseCurrencyCode: record.get('purchaseCurrencyCode'),
                  },
                  record
                )
              }
            />
          ),
      },
      {
        name: 'purchaseCurrencyCodeLov',
        width: 150,
        editor: (record) =>
          editable &&
          ![1, '1', 'true'].includes(record.acceptFlag) && (
            <Lov
              onChange={(lovRecord) =>
                this.handleChangeTaxRate(
                  {
                    purchaseCurrencyCode: lovRecord?.currencyCode,
                    supplierCurrencyCode: record.get('supplierCurrencyCode'),
                  },
                  record
                )
              }
            />
          ),
      },
      {
        name: 'exchangeRate',
        width: 160,
        editor: (record) =>
          editable &&
          ![1, '1', 'true'].includes(record.acceptFlag) &&
          record.get('purchaseCurrencyCode') !== record.get('supplierCurrencyCode'),
      },
      {
        name: 'costQuantity',
        width: 150,
        editor: (record) =>
          editable &&
          contractCalculateMethod !== '1' &&
          ![1, '1', 'true'].includes(record.acceptFlag) && (
            <C7nPrecisionInputNumber
              name="costQuantity"
              record={record}
              financial="supplierCurrencyCode"
              // disabled={contractCalculateMethod === '1'}
            />
          ),
      },
      {
        name: 'purchaseCostQuantity',
        width: 150,
      },
      {
        name: 'costQuantityChinese',
        width: 150,
      },
      {
        name: 'purchaseCostQuantityChinese',
        width: 150,
      },
      {
        name: 'termIdLov',
        width: 150,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'typeIdLov',
        width: 150,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'remindCycle',
        width: 100,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'remark',
        width: 175,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
    ];
    columns = remote
      ? remote.process('SPCM_CONTRACT_CONTROL_DETAIL_STAGE_COLUMNS', columns, {
          current: this,
        })
      : columns;
    return columns;
  }

  render() {
    const { editable, pcStageDs, customizeTable, remote, headerInfo } = this.props;

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected || [];
      let buttons = [
        <Button color="primary" onClick={this.handleCreate}>
          {intl.get(`hzero.common.button.create`).d('新建')}
        </Button>,
        <Button disabled={isEmpty(selectedRows)} onClick={this.handleDelete}>
          {intl.get(`hzero.common.button.delete`).d('删除')}
        </Button>,
        <BatchStageMaintain headerInfo={headerInfo} dataSet={props.dataSet} />,
      ];

      buttons = remote
        ? remote.process('SPCM_CONTRACT_CONTROL_DETAIL_STAGE_BUTTONS', buttons, {
            current: this,
            props,
          })
        : buttons;

      return <Fragment>{buttons}</Fragment>;
    });
    return (
      <Fragment>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={pcStageDs} />
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
          },
          <Table dataSet={pcStageDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
