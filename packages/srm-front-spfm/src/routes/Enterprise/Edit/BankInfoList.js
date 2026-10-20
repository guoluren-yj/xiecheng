/*
 * BankInfoList - 企业注册-银行信息编辑
 * @date: 2018/08/07 15:11:33
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { withRouter } from 'react-router-dom';
import React, { Component } from 'react';
import { connect } from 'dva';
import { Button } from 'hzero-ui';
import { Table, DataSet, Lov } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import intl from 'utils/intl';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

import bankInfoDS from '../store/bankInfoDS';

@connect((modal) => ({
  saving: modal.loading.effects['enterpriseBank/saveBankAccount'],
  loading: modal.loading.effects['enterpriseBank/queryBankAccount'],
  bank: modal.enterpriseBank,
}))
@withRouter
// @formatterCollections({ code: 'spfm.bank' })
export default class BankInfoList extends Component {
  componentDidMount() {
    this.refresh();
  }

  bankInfoDS = new DataSet({
    ...bankInfoDS(),
    autoQuery: false,
    transport: {
      submit: ({ dataSet, data }) => {
        if (!dataSet.destroyed.length) {
          this.handleSave(data);
        }
      },
      destroy: ({ data }) => {
        this.remove(data);
      },
    },
  });

  /**
   *数据刷新
   *
   * @memberof BankInfoList
   */
  @Bind()
  refresh() {
    const { dispatch, companyId } = this.props;
    if (companyId && companyId !== 'undefined') {
      dispatch({
        type: 'enterpriseBank/queryBankAccount',
        payload: { companyId, desensitize: false },
      }).then(() => {
        const {
          bank: { bankList },
        } = this.props;
        this.bankInfoDS.loadData(bankList);
      });
    }
  }

  @Bind()
  async handleSave(data, callback) {
    const { dispatch, companyId } = this.props;
    const flag = await this.bankInfoDS.validate();
    if (flag) {
      if (data.length > 0) {
        const checkResult = this.checkBankMasterInfo();
        if(checkResult){
          dispatch({
            type: 'enterpriseBank/saveBankAccount',
            payload: { companyId, companyBankAccountList: data, desensitize: false },
          }).then((res) => {
            if (res) {
              this.refresh();
              if (callback) {
                callback();
              }
            }
          });
        }
        }
    }
  }

  // 校验启用的银行主账号
  @Bind()
  checkBankMasterInfo() {
    const companyBankList = this.bankInfoDS.toData();
    // 所有行主账号
    const isOnlyMasterFlag = companyBankList.filter((b) => b.masterFlag).length;
    // 启用行
    const enableData = companyBankList.filter((item) => item.enabledFlag);
    // 启用行主账号
    const enableDataMaster = enableData.filter((b) => b.masterFlag).length;
    if(!isEmpty(enableData)){
      if(isOnlyMasterFlag !== 1 && enableDataMaster !==1){
        notification.warning({
          message: intl
            .get(`spfm.bank.view.message.warn.onlyMasterFlag`)
            .d('必须有且仅有一条银行主账户信息'),
        });
        return false;
      }
    }
    return true;
  }

  /**
   * 删除
   */
  @Bind()
  remove(deleteRows) {
    const { dispatch, companyId } = this.props;
    if (deleteRows.length > 0) {
      dispatch({
        type: 'enterpriseBank/deleteBankAccount',
        payload: {
          deleteRows,
          companyId,
        },
      }).then((response) => {
        if (response) {
          this.refresh();
          notification.success();
        }
      });
    } else {
      this.refresh();
      notification.success();
    }
  }

  @Bind()
  async saveAndNext() {
    const { callback, domesticForeignRelation } = this.props;
    const flag = await this.bankInfoDS.validate();
    const companyBankList = this.bankInfoDS.toData();
    if (flag) {
      if (this.bankInfoDS.created.length || this.bankInfoDS.updated.length) {
        const data = this.bankInfoDS.toJSONData();
        this.handleSave(data, callback);
      } else if (companyBankList.length > 0) {
        const checkResult = this.checkBankMasterInfo();
        if(checkResult && callback){
          callback();
        }
      } else if (companyBankList.length === 0 && domesticForeignRelation === '1') {
        // notification.error({
        //   message: intl.get(`spfm.bank.view.message.mustEnterOne`).d('请至少输入一条银行信息'),
        // });
        if (callback) {
          callback();
        }
      } else if (companyBankList.length === 0 && domesticForeignRelation === '0') {
        if (callback) {
          callback();
        }
      }
    }
  }

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  /**
   * 是否为主账号checkBox change
   * @param {*} e
   * @param {*} record
   */
  @Bind()
  handleChangeCheckbox(e, record) {
    const {
      dispatch,
      bank: { bankList },
    } = this.props;
    const checkboxValue = e.target.value === 1 ? 0 : 1;
    const newBankList = bankList.map((item) =>
      item.companyBankAccountId === record.companyBankAccountId
        ? { ...item, masterFlag: checkboxValue }
        : item
    );
    dispatch({
      type: 'enterpriseBank/updateState',
      payload: {
        bankList: newBankList,
      },
    });
  }

  /**
   * 校验唯一性
   */
  // onBlur={(evt) => this.handleUniqueness(evt, record)}
  // @Bind()
  // handleUniqueness(evt, { $form }) {
  //   const { bank: { bankList } } = this.props;
  //   const fIndex = findIndex(bankList, { bankAccountNum: evt.target.value});
  //   if(fIndex >= 0) $form.validateFields(['bankAccountNum']);
  // }

  render() {
    const {
      showButton = true,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      loading,
      saving,
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
    } = this.props;

    const columns = [
      {
        name: 'bankCountryObj',
        width: 200,
        editor: (record) => {
          return (
            (record.status === 'add' || record.getState('editing')) && (
              <Lov name="bankCountryObj" searchMatcher="condition" />
            )
          );
        },
      },
      {
        name: 'bankCode',
        width: 200,
      },
      {
        name: 'bankName',
        width: 300,
      },
      {
        name: 'bankFirmObj',
        width: 300,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'bankBranchName',
        width: 200,
      },
      {
        name: 'bankAccountName',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'bankAccountNum',
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        width: 200,
      },
      {
        name: 'intlBankAccountNum',
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        width: 200,
      },
      {
        name: 'accountNature',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'accountPurpose',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'currencyLov',
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: "bankIdentifyCodeType",
        width: 120,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: "bankIdentifyCode",
        width: 200,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      // {
      //   name: 'paymentTypeLov',
      //   width: 200,
      //   editor: (record) => {
      //     return record.status === 'add' || record.getState('editing');
      //   },
      // },
      {
        name: 'enabledFlag',
        width: 80,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'masterFlag',
        width: 120,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'remark',
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        width: 200,
      },
      {
        name: 'option',
        width: 180,
        renderer: ({ record }) => {
          if (record.status === 'add') {
            return (
              <a
                onClick={() => {
                  this.bankInfoDS.remove(record);
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            );
          } else if (record.getState('editing')) {
            return (
              <a
                onClick={() => {
                  record.reset();
                  record.setState('editing', false);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a
                onClick={() => {
                  record.setState('editing', true);
                  record.set('option', 'edit');
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];

    return (
      <div>
        <Table
          rowHeight={40}
          loading={loading}
          buttons={['add', 'save', 'delete']}
          dataSet={this.bankInfoDS}
          columns={columns}
          pagination={false}
        />
        <div style={{ clear: 'both', marginTop: 40, textAlign: 'right' }}>
          {previousCallback && (
            <Button type="primary" ghost onClick={this.handlePrevious} style={{ marginRight: 16 }}>
              {backBtnText}
            </Button>
          )}
          {showButton && (
            <Button
              type="primary"
              onClick={this.saveAndNext}
              style={{ margin: '24px 0' }}
              loading={saving}
            >
              {console.log(saving)}
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
