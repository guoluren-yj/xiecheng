import React, { Component } from 'react';
import intl from 'utils/intl';
import { Alert } from 'choerodon-ui';
import { Form, TextField, Select, Lov, Icon } from 'choerodon-ui/pro';
import styles from '../index.less';

export default class searchForm extends Component {
  constructor() {
    super();
    this.state = {
      unOrder: null,
    };
  }

  componentDidMount() {
    const { executionStrategyCode, listDs, ds } = this.props;
    const selectedRows = listDs ? listDs.selected?.map(ele => ele.toData()) : [];
    // 个性化字段
    const attributeFields = Object.keys(ds.fields.toJSON() || {}).filter(ele =>
      ele.includes('attribute')
    );

    // 个性化对象
    const attributeObj = {};

    attributeFields.forEach(field => {
      if (
        selectedRows.every(
          ele => JSON.stringify(ele[field]) === JSON.stringify(selectedRows[0][field])
        )
      ) {
        attributeObj[field] = listDs.selected[0].get(field);
      }
    });

    ds.current.init({
      ...attributeObj,
    });

    this.setState({
      unOrder: executionStrategyCode,
    });
  }

  render() {
    const {
      ds,
      setting,
      customizeForm,
      isOldUser,
      pageForm,
      isShowNewBid,
      oldAssignLovSetting,
    } = this.props;
    const { unOrder } = this.state;
    const filterLookList = [];
    if (!isShowNewBid) {
      filterLookList.push('SOURCE_BID_NEW');
    }
    // 不限类型、不转单、框架协议
    if (oldAssignLovSetting) {
      filterLookList.push('CONTRACT_FRAMEWORK', 'ALL', 'NO_ACCESS');
    }
    return (
      <div>
        {pageForm === 'allPage' && (
          <Alert
            className={styles['batch-all-edit-alert']}
            border={false}
            message={
              <div className={styles['batch-all-edit-alert-message']}>
                <Icon type="help" />
                {intl
                  .get('sprm.common.modal.prompt-reassign')
                  .d(
                    '重新分配采购员/需求执行人，或修改执行策略：当存在有效状态下游执行单据时，执行策略/执行规则可能无法修改。'
                  )}
              </div>
            }
            closable
          />
        )}
        {customizeForm(
          {
            code: 'SPRM.PURCHASE_EXECUTION.NOTASSIGN.MODAL', // 必传，和unitCode一一对应
            dataSet: ds,
          },
          <Form labelLayout="float" columns={1} dataSet={ds} useColon={false}>
            <Lov name="currentPurchaseAgent" />
            <Lov name="executedBys" />
            {setting === '1' && (
              <Select
                name="executionStrategyCode"
                onChange={record => {
                  this.setState({
                    unOrder: record,
                  });
                }}
                optionsFilter={record =>
                  isOldUser
                    ? !['PROJECT_INFO', 'SOURCE_AND_ORDER', 'BEFORE_SOURCE_AFTER_ORDER'].includes(
                        record.data.value
                      )
                    : record.data.value
                }
              />
            )}
            {setting === '1' && !isOldUser && unOrder !== 'ORDER' && (
              <Select
                name="secondLevelStrategyCode"
                optionsFilter={record => {
                  return !filterLookList.includes(record.data.value);
                }}
              />
            )}
            {setting === '1' && !isOldUser && unOrder !== 'SOURCE' && (
              <Select
                name="orderSecondLevelStrategyCode"
                optionsFilter={record => {
                  return oldAssignLovSetting ? record.data.value === 'PO' : true;
                }}
              />
            )}
            <TextField name="assignedRemark" />
          </Form>
        )}
      </div>
    );
  }
}
