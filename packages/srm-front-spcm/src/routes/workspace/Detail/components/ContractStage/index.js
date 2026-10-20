import React, { Component, Fragment } from 'react';
import { Button, Table, Select, Lov } from 'choerodon-ui/pro';
import { Badge, Popover, Alert } from 'choerodon-ui';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import moment from 'moment';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { yesOrNoRender } from 'utils/renderer';
import { renderCompareColumns, extTextRender, renderStatus } from '@/utils/renderer';
import { getCustByFieldCode } from '@/utils/util';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { getMasterDefaults } from '@/services/contractMaintainService';
import {
  fetchExchangeRate,
  autoAdjust,
  getStageCalculateMethod,
} from '@/services/contractCommonService';
import intl from 'utils/intl';
import { editSection } from '../../common/enum';

import styles from '../index.less';

const tenantId = getCurrentOrganizationId();

const { Option } = Select;
@withRouter
export default class ContractStage extends Component {
  state = {
    isNewStage: true,
  };

  componentDidMount() {
    this.getStageCalculateMethod();
  }

  @Bind()
  async getStageCalculateMethod() {
    const res = await getStageCalculateMethod();
    if (getResponse(res)) {
      this.setState({
        isNewStage: res?.content?.length === 0,
      });
    }
  }

  @Bind()
  handleGetCode() {
    const {
      match: { path },
      location: { search },
      custCode,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (custCode) {
      return custCode;
    }
    if (
      path.includes('/spcm/contract-workspace/update') ||
      routerParams.hasChanged === 'true' ||
      path.includes('/spcm/contract-workspace/intelligent/')
    ) {
      return 'SPCM.WORKSPACE_DETAIL.STAGE';
    } else {
      return 'SPCM.WORKSPACE_DETAIL.STAGE.READONLY';
    }
  }

  /**
   * 新建
   */
  @Bind()
  async handleCreate() {
    const { pcSubjectDs, custConfig, remoteWorkDetail } = this.props;
    const keycode = this.handleGetCode();
    const { fields = [] } = custConfig[keycode] || {};
    const flag = fields.find(
      (field) => field.fieldCode === 'typeIdLov' && field.defaultValueMeaning
    );
    let others = {};
    // 个性化没给付款方式配置默认值时调用接口取默认值。
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

    const { currencyCode, purchaseCurrencyCode } =
      pcSubjectDs?.get(0)?.get(['currencyCode', 'purchaseCurrencyCode', 'exchangeRate']) || {}; // 优先默认用标的第一行标的的原币币种作为默认值
    const currencyProps = {
      supplierCurrencyCode: currencyCode,
      purchaseCurrencyCode,
    };
    await this.handleCurrencyCode(currencyProps);
    if (remoteWorkDetail) {
      remoteWorkDetail.event.fireEvent('handleCuxContractStageCreateAfter', {
        current: this,
        currencyProps,
        others,
      });
    }
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
    } = this.props;
    const code = editSection?.STAGE;
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
    const { pcStageDs, pcStageDataSource = [], onChangeState } = this.props;
    const selectedRows = pcStageDs?.selected || [];
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
      const res = await pcStageDs.delete(existedRows, {
        title: intl.get(`hzero.common.message.confirm.title`).d('提示'),
        children: intl
          .get('hzero.c7nProUI.DataSet.delete_selected_row_confirm')
          .d('确认删除选中行？'),
      });
      if (res && !res.failed) {
        // onFetchTableList(pcStageDs, 'SPCM.WORKSPACE_DETAIL.STAGE');
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
    const {
      editable,
      stageList,
      currentMode = null,
      headerInfo = {},
      differeFlag,
      intelligent,
    } = this.props;
    const showDiff = currentMode === 'current' || currentMode === 'history';
    const { contractPendingMethod, contractCalculateMethod } = headerInfo;
    // 协议阶段新建方式为手工新建
    const stageEditFlag = contractPendingMethod === '1';
    const columns = [
      differeFlag && {
        name: 'objectFlagMeaning',
        width: 120,
        renderer: ({ record, value }) => renderStatus(record.get('objectFlag'), value, 'change'),
      },
      {
        name: 'stageNo',
        width: 80,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'stageCode',
        width: 150,
        renderer: ({ record = {} }) => (
          <div>
            {showDiff && record.get('objectFlag') === 'CREATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.newLine').d('新增行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'DELETE' ? (
              <Popover
                content={intl.get('hzero.common.button.deleteLine').d('删除行')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {showDiff && record.get('objectFlag') === 'UPDATE' ? (
              <Popover
                content={intl.get('ssrc.inquiryHall.model.inquiryHall.infoChange').d('信息更改')}
                placement="bottom"
              >
                <span>
                  {currentMode === 'history' ? (
                    <Badge status="error" />
                  ) : (
                    <Badge status="success" />
                  )}
                </span>
              </Popover>
            ) : (
              ''
            )}
            {record.get('stageCode') || '-'}
          </div>
        ),
        editor: (record) =>
          editable && ![1, '1', 'true'].includes(record.acceptFlag) && stageEditFlag,
      },
      {
        name: 'stageName',
        width: 150,
        formType: stageEditFlag ? 'TextField' : 'Select',
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
        renderer: ({ value, record }) => {
          const { remoteWorkDetail } = this.props;
          const dom = yesOrNoRender(value);
          return remoteWorkDetail
            ? remoteWorkDetail.process('SPCM_WORKSPACE_DETAIL_CONTRACT_STAGE_RENDER', dom, {
                editable,
                value,
                record,
                intelligent,
              })
            : dom;
        },
        formType: 'CheckBox',
      },
      {
        name: 'milestoneTime',
        width: 175,
        formType: 'DatePicker',
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'payRatio',
        width: 175,
        formType: 'NumberField',
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
        compareValue: 'supplierCurrencyCode',
        formType: 'Lov',
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
        compareValue: 'purchaseCurrencyCode',
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
        formType: 'NumberField',
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
        compareValue: 'termName',
        formType: 'Lov',
      },
      {
        name: 'typeIdLov',
        width: 150,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
        compareValue: 'typeName',
        formType: 'Lov',
        aiIconFieldCode: 'typeId',
      },
      {
        name: 'remindCycle',
        width: 120,
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
      {
        name: 'remark',
        width: 175,
        formType: 'TextField',
        editor: (record) => editable && ![1, '1', 'true'].includes(record.acceptFlag),
      },
    ].filter(Boolean);
    return renderCompareColumns(columns, { currentMode, differeFlag, intelligent });
  }

  /**
   * 一键调整阶段行 原/本币币种
   */
  @Bind()
  async handleAdjustment() {
    const { headerInfo: { pcHeaderId } = {}, pcStageDs, onChangeState } = this.props;
    const res = await autoAdjust({ pcHeaderId });
    if (getResponse(res) && onChangeState) {
      onChangeState({ showAlterFlag: false });
      pcStageDs.query();
    }
  }

  render() {
    const {
      editable,
      pcStageDs,
      customizeTable,
      currentMode,
      customizeBtnGroup,
      differeFlag,
      showAlterFlag,
      headerInfo,
    } = this.props;
    const { contractPendingMethod, pcHeaderId } = headerInfo || {};
    const { isNewStage } = this.state;
    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet?.selected || [];
      const buttonCommonProps = {
        color: 'primary',
        funcType: 'flat',
      };
      return (
        <Fragment>
          {customizeBtnGroup(
            {
              code: 'SPCM.WORKSPACE_DETAIL.STAGE.BTN_GROUP',
            },
            [
              <Button
                name="create"
                key="create"
                icon="playlist_add"
                onClick={this.handleCreate}
                {...buttonCommonProps}
              >
                {intl.get('hzero.common.btn.add').d('新增')}
              </Button>,
              <Button
                name="delete"
                key="delete"
                icon="delete_sweep"
                disabled={isEmpty(selectedRows)}
                onClick={this.handleDelete}
                {...buttonCommonProps}
              >
                {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
              </Button>,
              // 手工新建，且不在老阶段配置表中的允许显示导入按钮
              contractPendingMethod === '1' && isNewStage && (
                <CommonImport
                  name="batchImport"
                  key="batchImport"
                  businessObjectTemplateCode="SPCM.PC_STAGE_IMPORT"
                  prefixPatch="/spcm"
                  args={{ pcHeaderId }}
                  color="primary"
                  funcType="flat"
                  buttonText={intl.get('hzero.common.button.Import').d('导入')}
                  buttonProps={{
                    icon: 'archive',
                    type: 'c7n-pro',
                    color: 'primary',
                    funcType: 'flat',
                  }}
                  successCallBack={() => {
                    notification.success();
                    pcStageDs.query();
                  }}
                />
              ),
            ]
          )}
        </Fragment>
      );
    });
    return (
      <Fragment>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={pcStageDs} />
          </div>
        )}
        {showAlterFlag && editable && (
          <Alert
            closable
            showIcon
            type="error"
            // type="info"
            message={
              <>
                {intl
                  .get('spcm.workspace.view.alert.one.adjustment')
                  .d('阶段行与标的行本币/原币币种不一致，您可以选择')}
                <a style={{ margin: '0 8px' }} onClick={this.handleAdjustment}>
                  {intl.get('spcm.workspace.button.adjustment').d('一键调整')}
                </a>
                {intl
                  .get('spcm.workspace.view.alert.two.adjustment')
                  .d('点击后，阶段本币、原币、汇率将与标的第一行数据一致')}
              </>
            }
          />
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
            extTextRenderIntercept:
              currentMode || differeFlag
                ? (...extParam) => extTextRender(extParam, { currentMode, differeFlag })
                : null,
          },
          <Table style={{ maxHeight: 430 }} dataSet={pcStageDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
