/**
 * List - 采购申请创建列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Form, Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateTimeRender, dateRender } from 'utils/renderer';
import urgentImg from '@/assets/icon-expedited.svg';

import styles from './index.less';

const commonPrompt = 'sprm.common.model.common';

@Form.create({ fieldNameProp: null })
/**
 * List - 采购申请创建列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 300,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onClick: e => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  /**
   * asnNumColumnRender - 送货单编码单元格render方法
   * @param {!object} record - 行数据
   * @param {any} text - 单元格文本数据
   */
  @Bind()
  prNumColumnRender(text, record) {
    const { redirectDetail } = this.props;
    redirectDetail(record.prHeaderId);
  }

  render() {
    const {
      loading,
      onChange,
      pagination,
      dataSource,
      onRowSelectChange = e => e,
      selectedRows = [],
      onHide,
      customizeTable,
    } = this.props;
    const tableProps = {
      dataSource,
      columns: [
        {
          title: intl.get(`hzero.common.status`).d('状态'),
          dataIndex: 'prStatusMeaning',
          width: 100,
        },
        {
          title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
          dataIndex: 'displayPrNum',
          width: 180,
          sorter: true,
          render: (val, record) => (
            <div className={styles['row-agent-column']}>
              <a onClick={() => this.prNumColumnRender(val, record)}>{val}</a>
              {record.urgentFlag === 1 ? (
                <Tooltip title={intl.get(`${commonPrompt}.urgent`).d('申请加急')}>
                  <img src={urgentImg} alt="img" />
                </Tooltip>
              ) : null}
            </div>
          ),
        },
        {
          title: intl.get(`${commonPrompt}.title`).d('标题'),
          width: 150,
          dataIndex: 'title',
        },
        {
          title: intl.get(`entity.company.tag`).d('公司'),
          dataIndex: 'companyName',
          sorter: true,
          width: 180,
        },
        {
          title: intl.get(`entity.business.tag`).d('业务实体'),
          dataIndex: 'ouName',
          sorter: true,
          width: 180,
        },
        {
          title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
          dataIndex: 'purchaseOrgName',
          sorter: true,
          width: 180,
        },
        {
          title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
          dataIndex: 'purchaseAgentName',
          sorter: true,
          width: 150,
        },
        {
          title: intl.get(`entity.roles.creator`).d('创建人'),
          dataIndex: 'createByName',
          width: 150,
        },
        {
          title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
          dataIndex: 'creationDate',
          width: 150,
          sorter: true,
          render: dateTimeRender,
        },
        {
          title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
          dataIndex: 'unitName',
          width: 120,
          sorter: true,
        },
        {
          title: intl.get(`${commonPrompt}.prSourcePlatform`).d('单据来源'),
          dataIndex: 'prSourcePlatformMeaning',
          width: 120,
        },
        {
          title: intl.get(`${commonPrompt}.prRequestedName`).d('申请人'),
          dataIndex: 'prRequestedName',
          render: (val, record) => (
            <span>{record.prRequestedNum ? `${record.prRequestedNum}-${val}` : val}</span>
          ),
          width: 120,
          sorter: true,
        },
        {
          title: intl.get(`${commonPrompt}.requestDate`).d('申请日期'),
          dataIndex: 'requestDate',
          width: 150,
          sorter: true,
          render: dateRender,
        },
        {
          title: intl.get(`${commonPrompt}.applyExplain`).d('申请说明'),
          dataIndex: 'remark',
          onCell: this.onCell,
          width: 250,
          render: text => <Tooltip title={text}>{text}</Tooltip>,
        },

        {
          title: intl.get(`hzero.common.button.operating`).d('操作记录'),
          width: 100,
          dataIndex: 'operatorRecord',
          render: (_, record) => (
            <a onClick={() => onHide(record)}>
              {intl.get(`hzero.common.button.operating`).d('操作记录')}
            </a>
          ),
        },
      ],
      rowKey: 'prHeaderId',
      bordered: true,
      loading,
      onChange,
      pagination,
      rowSelection: {
        selectedRowKeys: selectedRows?.map(n => n.prHeaderId),
        onChange: onRowSelectChange,
      },
    };
    tableProps.scroll = {
      x: sum(tableProps.columns?.map(n => n.width)) + 300,
    }; //  y: 'calc(100vh - 320px)',todo页面增加固定头
    return customizeTable(
      { code: 'SPRM.PURCHASE_REQUISITION_CREATION.LIST.GRID' },
      <Table {...tableProps} />
    );
  }
}
