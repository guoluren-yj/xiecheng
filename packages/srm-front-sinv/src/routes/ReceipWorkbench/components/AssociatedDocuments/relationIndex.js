/* eslint-disable react/jsx-max-props-per-line */
/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { DataSet, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import cx from 'classnames';
import cuxRemote from 'hzero-front/lib/utils/remote';

import { queryDeliveryWorkbench } from '@/services/receiptManageConfigService';
import { tableDS } from './relationIndexDS';
import styles from './index.less';
import { useDoubleUomConfig, renderStatusCode } from '@/routes/components/utils/index';

@useDoubleUomConfig()
@cuxRemote(
  {
    code: 'SINV_PRDETAIL_REMOTE_RELATION', // 对应二开模块暴露的Expose的编码， 命名规范：模块编码+功能编码
    name: 'remote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    process: {
      renderColumnsAndDsTQLY: undefined, // 需要暴露的DS的TQLY属性
    },
  }
)
@formatterCollections({
  code: [
    'sinv.receiptWorkbench',
    'hzero.common',
    'entity.company',
    'sinv.common',
    'sinv.purchaseReception',
  ],
})
export default class Index extends Component {
  constructor(props) {
    super(props);
    const { Ref = (e) => e } = props;
    // this指向List
    Ref(this);

    this.state = {
      type: 'ORDER',
      workFlag: false,
    };
  }

  tableDs = new DataSet(tableDS());

  /** ************************************************ 默认事件 *********************************************************** */

  componentDidMount() {
    // this.queryWorkbench()
    const { dataGather, remote } = this.props;
    const { renderColumnsAndDsTQLY } = remote?.props?.process || {};
    const {
      data: { rcvTrxLineId },
    } = dataGather;
    const { type } = this.state;
    queryDeliveryWorkbench().then((res) => {
      this.tableDs = new DataSet(tableDS(res, this.props.doubleUnitEnabled));
      if (typeof renderColumnsAndDsTQLY === 'function') {
        const { dsFile = {} } = renderColumnsAndDsTQLY();
        const { name, custLabel } = dsFile;
        this.tableDs.addField(name, {
          label: custLabel,
        });
      }
      this.setState({
        workFlag: res,
      });
      this.tableDs.setQueryParameter('params', {
        rcvTrxLineId,
        type,
      });
      this.tableDs.query();
    });
  }

  /** ************************************************ 事件方法 *********************************************************** */

  /*
   *modal-tab切换时查询对应的tab数据
   */
  changeFetchExp = (tabKey) => {
    const { dataGather } = this.props;
    this.setState({
      type: tabKey,
    });
    const {
      data: { rcvTrxLineId },
    } = dataGather;
    const { type } = this.state;
    this.tableDs.setQueryParameter('params', {
      rcvTrxLineId,
      type: tabKey || type,
    });
    this.tableDs.query();
  };

  /**
   * 状态颜色渲染
   */
  colorRender = (_value, record) => {
    const value =
      record.get('displayStatusCode') || record.get('asnStatus') || record.get('pcStatusCode');
    if (['TAKE_FINISH'].includes(value)) {
      // 绿色：已完成
      return (
        <div>
          <Tag
            color="rgba(71,184,129,0.10)"
            style={{ color: '#47B881', height: '70px', lineHeight: '18px' }}
          >
            <span>
              {record.get('displayStatusMeaning') ||
                record.get('asnStatusMeaning') ||
                record.get('pcStatusCodeMeaning')}
            </span>
          </Tag>
        </div>
      );
    } else if (['TAKE_DOING'].includes(value)) {
      // 橙色
      return (
        <div>
          <Tag color="#fef4e2" style={{ color: '#fca400' }}>
            <span>
              {record.get('displayStatusMeaning') ||
                record.get('asnStatusMeaning') ||
                record.get('pcStatusCodeMeaning')}
            </span>
          </Tag>
        </div>
      );
    } else if (['NOT_START', 'ALL_TAKE_FINISH'].includes(value)) {
      //  蓝色
      return (
        <div>
          <Tag color="rgba(48,149,242,0.10)" style={{ color: '#3095F2' }}>
            <span>
              {record.get('displayStatusMeaning') ||
                record.get('asnStatusMeaning') ||
                record.get('pcStatusCodeMeaning')}
            </span>
          </Tag>
        </div>
      );
    } else {
      // 红色
      return (
        <div>
          <Tag color="#ffeeeb" style={{ color: '#f56649' }}>
            <span>
              {record.get('displayStatusMeaning') ||
                record.get('asnStatusMeaning') ||
                record.get('pcStatusCodeMeaning')}
            </span>
          </Tag>
        </div>
      );
    }
  };

  /** ************************************************ 列表字段 *********************************************************** */

  getColumns = () => {
    const { type } = this.state;
    const { doubleUnitEnabled, remote } = this.props;
    const { renderColumnsAndDsTQLY } = remote?.props?.process || {};
    const columns = {
      order: [
        {
          name: 'displayStatusCode',
          // name: 'displayStatusMeaning',
          width: 130,
          renderer: ({ record }) => record && renderStatusCode(record, 'displayStatusCode'),
        },
        {
          name: 'displayPoNum',
          width: 170,
          renderer: ({ record }) => {
            return (
              <span>
                {record.get('displayPoNum')}-{record.get('displayPoLineNum')}
              </span>
            );
          },
        },
        {
          name: 'poTypeName',
          width: 170,
        },
        {
          name: 'returnedFlag',
          width: 170,
          renderer: ({ value }) => yesOrNoRender(+value),
        },
        {
          name: 'displayLineLocationNum',
          width: 170,
        },
        {
          name: 'agentName',
          width: 170,
        },
        doubleUnitEnabled && {
          name: 'secondaryPoQuantity',
          width: 170,
        },
        {
          name: 'poQuantity',
          width: 170,
        },
      ],
      asn: [
        {
          name: 'asnStatus',
          width: 130,
          renderer: ({ record }) => record && renderStatusCode(record, 'asnStatus'),
        },
        {
          name: 'asnNum',
          width: 170,
          renderer: ({ record }) => {
            return (
              <span>
                {record.get('asnNum')}-{record.get('asnLineNum')}
              </span>
            );
          },
        },
        {
          name: 'asnTypeCodeMeaning',
          width: 170,
        },
        {
          name: 'ecPoSubNum',
          width: 170,
          // 天齐锂业
          hidden:
            typeof renderColumnsAndDsTQLY === 'function'
              ? renderColumnsAndDsTQLY()?.columnsFlag || false
              : true,
        },
        {
          name: 'shipQuantity',
          width: 170,
        },
        {
          name: 'asnQuantity',
          width: 170,
        },
        {
          name: 'matchStatusMeaning',
          width: 170,
        },
      ],
      pc: [
        {
          name: 'pcStatusCode',
          width: 130,
          renderer: ({ record }) => record && renderStatusCode(record, 'pcStatusCode'),
        },
        {
          name: 'pcNum',
          width: 170,
        },
        {
          name: 'pcTypeName',
          width: 170,
        },
        {
          name: 'displayPcLineNum',
          width: 170,
        },
        doubleUnitEnabled && {
          name: 'secondaryPcQuantity',
          width: 170,
        },
        {
          name: 'pcQuantity',
          width: 170,
        },
        {
          name: 'stageCode',
          width: 170,
        },
        {
          name: 'stageName',
          width: 170,
        },
      ],
    };
    if (type === 'ORDER') {
      return columns.order;
    } else if (type === 'ASN') {
      return columns.asn;
    } else {
      return columns.pc;
    }
  };

  /** ************************************************ 渲染 *********************************************************** */
  render() {
    const { type, workFlag } = this.state;
    const listProps = {
      dataSet: this.tableDs,
      columns: this.getColumns(),
    };
    return (
      <div className={styles['modal-up']}>
        <div className={styles['modal-up-left']}>
          <a
            onClick={() => this.changeFetchExp('ORDER')}
            className={cx(styles.aLine, {
              [styles.aLineChecked]: type === 'ORDER',
            })}
          >
            {intl.get('sinv.receiptWorkbench.model.receipt.order').d('订单')}
          </a>
          <a
            onClick={() => this.changeFetchExp('ASN')}
            className={cx(styles.aLine, {
              [styles.aLineChecked]: type === 'ASN',
            })}
          >
            {workFlag
              ? intl.get('sinv.receiptWorkbench.model.receipt.slod').d('发货单')
              : intl.get('sinv.receiptWorkbench.model.receipt.asn').d('送货单')}
          </a>
          <a
            onClick={() => this.changeFetchExp('PC')}
            className={cx(styles.aLine, {
              [styles.aLineChecked]: type === 'PC',
            })}
          >
            {intl.get('sinv.receiptWorkbench.model.receipt.pc').d('协议')}
          </a>
        </div>
        <div className={styles['modal-up-right']}>
          <Table {...listProps} style={{ maxHeight: `calc(100vh - 200px)` }} />
        </div>
      </div>
    );
  }
}
