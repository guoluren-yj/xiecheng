import React, { Component, Fragment } from 'react';
import { Table, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { isEmpty, differenceBy } from 'lodash';
import { Bind } from 'lodash-decorators';
import { yesOrNoRender } from 'utils/renderer';

import intl from 'utils/intl';
import notification from 'utils/notification';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import styles from '../../index.less';

export default class ModalChildren extends Component {
  componentDidMount() {
    const {
      ladderQuoteDs,
      modal: { update },
    } = this.props;
    ladderQuoteDs.query();
    update({ onOk: this.handleSave });
  }

  /**
   * 新建
   */
  @Bind()
  handleCreate() {
    this.props.ladderQuoteDs.create({}, Infinity);
  }

  /**
   * 删除(阶梯价格只能从最后一行删除)
   */
  @Bind()
  async handleDelete() {
    const { ladderQuoteDs } = this.props;
    const selectedData = ladderQuoteDs.selected;
    const selectedRows = selectedData.map((s) => s.toData());

    const newAddRows = selectedData.filter((s) => s.status === 'add') || [];
    const existedRows = selectedData.filter((s) => ['sync', 'update'].includes(s.status)) || [];

    // 过滤出已保存数据
    const savedData = ladderQuoteDs.toData().filter((l) => l.lineId);
    // 最后一行数据的序号
    const lastRowLineNum =
      savedData[savedData.length - 1] && savedData[savedData.length - 1].lineNum;

    // 已勾选的已保存数据的Key
    const selectedRowKeys = selectedRows.filter((l) => l.lineId);
    // 未勾选的已保存数据
    const unSelectedRows = differenceBy(savedData, selectedRows, 'lineId');
    // 未勾选的最后一行序号
    const unSelectedRowLastLineNum = isEmpty(unSelectedRows)
      ? 0
      : unSelectedRows[unSelectedRows.length - 1].lineNum;

    if (
      isEmpty(selectedRowKeys) ||
      +lastRowLineNum - selectedRowKeys.length === +unSelectedRowLastLineNum
    ) {
      // 删除本地数据
      ladderQuoteDs.remove(newAddRows);
      // 删除线上数据
      const res = await ladderQuoteDs.delete(existedRows);
      if (res && !res.failed) {
        ladderQuoteDs.query();
      }
    } else {
      notification.warning({
        message: intl
          .get('spcm.common.view.message.title.deleteTheLastRow')
          .d('只能从最后一行已保存行开始删除！'),
      });
    }
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const flag = await this.props.ladderQuoteDs.validate();
    if (flag) {
      const res = await this.props.ladderQuoteDs.submit();
      if (res && !res.failed) {
        this.props.ladderQuoteDs.query();
      }
    } else {
      return false;
    }
  }

  render() {
    const {
      ladderQuoteDs,
      editable,
      priceEdit,
      ladderNetPriceEdit,
      currencyCode,
      doubleUnitEnabled,
    } = this.props;

    const columns = [
      {
        name: 'lineNum',
        width: 80,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantityStart',
        width: 150,
        editor: editable,
      },
      {
        name: 'quantityStart',
        width: 150,
        editor: editable && !doubleUnitEnabled,
      },
      doubleUnitEnabled && {
        name: 'secondaryQuantityEnd',
        width: 150,
        editor: editable,
      },
      {
        name: 'quantityEnd',
        width: 150,
        editor: editable && !doubleUnitEnabled,
      },
      doubleUnitEnabled && {
        name: 'secondaryPrice',
        width: 150,
        editor: editable && priceEdit && (
          <C7nPrecisionInputNumber
            currency="currencyCode"
            name="secondaryPrice"
            headerRecord={{ currencyCode }}
          />
        ),
      },
      {
        name: 'price',
        width: 150,
        editor: editable && priceEdit && !doubleUnitEnabled && (
          <C7nPrecisionInputNumber
            currency="currencyCode"
            name="price"
            headerRecord={{ currencyCode }}
          />
        ),
      },
      doubleUnitEnabled && {
        name: 'ladderSecondaryNetPrice',
        width: 150,
        editor: editable && ladderNetPriceEdit && (
          <C7nPrecisionInputNumber
            currency="currencyCode"
            name="ladderSecondaryNetPrice"
            headerRecord={{ currencyCode }}
          />
        ),
      },
      {
        name: 'ladderNetPrice',
        width: 150,
        editor: editable && ladderNetPriceEdit && !doubleUnitEnabled && (
          <C7nPrecisionInputNumber
            currency="currencyCode"
            name="ladderNetPrice"
            headerRecord={{ currencyCode }}
          />
        ),
      },
      {
        name: 'description',
        width: 150,
        editor: editable,
      },
      {
        name: 'stepAccumulationFlag',
        width: 100,
        editor: editable,
        renderer: ({ record }) => yesOrNoRender(record.get('stepAccumulationFlag')),
      },
    ];

    const HeaderButtons = observer((props) => {
      const selectedRows = props.dataSet.selected || [];
      const buttonCommonProps = {
        color: 'primary',
        funcType: 'flat',
      };
      return (
        <Fragment>
          <Button icon="playlist_add" {...buttonCommonProps} onClick={this.handleCreate}>
            {intl.get('hzero.common.btn.add').d('新增')}
          </Button>
          <Button icon="save" {...buttonCommonProps} onClick={this.handleSave}>
            {intl.get(`hzero.common.button.save`).d('保存')}
          </Button>
          <Button
            icon="delete_sweep"
            {...buttonCommonProps}
            disabled={isEmpty(selectedRows)}
            onClick={this.handleDelete}
          >
            {intl.get(`hzero.common.button.batchdelete`).d('批量删除')}
          </Button>
        </Fragment>
      );
    });
    return (
      <Fragment>
        {editable && (
          <div className={styles['btn-wrapper']}>
            <HeaderButtons dataSet={ladderQuoteDs} />
          </div>
        )}
        <Table style={{ maxHeight: 'calc(100vh - 235px)' }} dataSet={ladderQuoteDs} columns={columns} />
      </Fragment>
    );
  }
}
