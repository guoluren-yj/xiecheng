import React, { Component, Fragment } from 'react';
import { Button, Table } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';
import querystring from 'querystring';
import { Bind } from 'lodash-decorators';
import { observer } from 'mobx-react-lite';
import { isEmpty } from 'lodash';
import CommonImport from 'hzero-front/lib/components/Import';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
// import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';

import intl from 'utils/intl';

import styles from '../index.less';

// @WithCustomizeC7N({
//   unitCode: [
//     'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE',
//     'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY',
//   ],
// })
@withRouter
export default class ContractRebate extends Component {
  @Bind()
  handleGetCode() {
    const {
      location: { search },
      unitCodeList,
    } = this.props;
    const routerParams = querystring.parse(search.substr(1));
    if (routerParams.hasChanged === 'true') {
      // 处理个性化缓存机制，不给默认值
      return unitCodeList ? unitCodeList.REBATE : 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE';
    } else {
      return 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE.READONLY';
    }
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.props.rebateDs.create({}, 0);
  }

  /**
   * 删除
   */
  @Bind()
  async handleDelete() {
    const { rebateDs, onFetchTableList, unitCodeList } = this.props;
    const selectedRows = rebateDs.selected;
    const newAddRows = selectedRows.filter((s) => s.status === 'add') || [];
    const existedRows = selectedRows.filter((s) => ['sync', 'update'].includes(s.status)) || [];
    // 删除本地数据
    rebateDs.remove(newAddRows);
    // 删除线上数据
    const res = await rebateDs.delete(existedRows);
    if (res && !res.failed) {
      onFetchTableList(rebateDs, unitCodeList?.REBATE || 'SPCM.PURCHASE_CONTRACT_MAINTAIN.REBATE');
    }
  }

  renderColumns() {
    const { editable, headerFormDs } = this.props;
    const columns = [
      {
        name: 'lineNum',
        width: 80,
      },
      {
        name: 'saleRangeFrom',
        width: 150,
        editor: (record) =>
          editable && (
            <C7nPrecisionInputNumber
              currency="supplierCurrencyCode"
              name="saleRangeFrom"
              record={record}
              headerRecord={headerFormDs.current}
            />
          ),
      },
      {
        name: 'saleRangeTo',
        width: 150,
        editor: (record) =>
          editable && (
            <C7nPrecisionInputNumber
              currency="supplierCurrencyCode"
              name="saleRangeFrom"
              record={record}
              headerRecord={headerFormDs.current}
            />
          ),
      },
      {
        name: 'annualReturnRate',
        width: 175,
        editor: editable,
      },
      {
        name: 'rebateAmount',
        width: 170,
        editor: (record) =>
          editable && (
            <C7nPrecisionInputNumber
              currency="supplierCurrencyCode"
              name="rebateAmount"
              record={record}
              headerRecord={headerFormDs.current}
            />
          ),
      },
      {
        name: 'validityDateFrom',
        width: 150,
        editor: editable,
      },
      {
        name: 'validityDateTo',
        width: 150,
        editor: editable,
      },
      {
        name: 'affiliatedCompany',
        width: 100,
      },
      {
        name: 'remark',
        width: 200,
        editor: editable,
      },
    ];
    return columns;
  }

  render() {
    const { editable, rebateDs, customizeTable, headerFormDs } = this.props;

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected || [];

      return (
        <Fragment>
          <Button color="primary" onClick={this.handleCreate}>
            {intl.get(`hzero.common.button.create`).d('新建')}
          </Button>
          <Button disabled={isEmpty(selectedRows)} onClick={this.handleDelete}>
            {intl.get(`hzero.common.button.delete`).d('删除')}
          </Button>
          <CommonImport
            data-name="newImport"
            businessObjectTemplateCode="SRM_C_SRM_SPCM_PC_REBATE_INFORMATION_IMPORT"
            buttonText={intl.get('hzero.common.button.Import').d('导入')}
            args={{
              pcHeaderId: headerFormDs?.current?.get('pcHeaderId'),
            }}
            prefixPatch="/spcm"
            successCallBack={() => {
              rebateDs.query();
            }}
          />
        </Fragment>
      );
    });
    return (
      <Fragment>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={rebateDs} />
          </div>
        )}
        {customizeTable(
          {
            code: this.handleGetCode(),
          },
          <Table dataSet={rebateDs} columns={this.renderColumns()} />
        )}
      </Fragment>
    );
  }
}
