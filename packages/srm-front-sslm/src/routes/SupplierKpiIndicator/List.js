/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @date: 2018-7-4
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Icon } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import intl from 'utils/intl';
import { enableRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { Button as PerButton } from 'components/Permission';
import { Button } from 'choerodon-ui/pro';

/**
 * List - 供应商绩效标准指标定义 - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {function} [ref= (e => e)] - react ref属性
 * @reactProps {boolean} [loading=false] - 表格处理状态
 * @reactProps {function} [onChange= (e => e)] - 表格onChange事件
 * @reactProps {object} [pagination={}] - 分页数据
 * @reactProps {Array<Object>} [dataSource=[]] - 表格数据源
 * @reactProps {object} [rowSelection={}] - 表格选择框配置
 * @return React.element
 */
@formatterCollections({
  code: ['spfm.supplierKpiIndicator', 'sslm.common'],
})
export default class List extends PureComponent {
  constructor(props) {
    super(props);
    // 方法注册
    ['onCell', 'operiationRender', 'formulaConfigurationRender'].forEach(method => {
      this[method] = this[method].bind(this);
    });
  }

  defaultTableRowKey = 'indicatorId';

  /**
   * onCell - 设置表格单元格属性函数
   */
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 180,
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
   * operiationRender - 操作记录render方法
   * @param {String} text - 显示字段
   * @param {object} record - 当前行数据
   */
  operiationRender(text, record) {
    const {
      openIndicatorDetail = e => e,
      addChildIndicator = e => e,
      openIndicationAssign = e => e,
      handleUpdateScoringTemp = e => e,
      handleDelete = e => e,
      enable = e => e,
      actionRowKey,
    } = this.props;
    return (
      <span className="action-link">
        {record.enabledFlag === 1 && (
          <Button funcType="link" onClick={() => addChildIndicator(record)}>
            {intl.get('spfm.supplierKpiIndicator.view.button.addChildIndicator').d('新增下级指标')}
          </Button>
        )}
        <Button funcType="link" onClick={() => openIndicatorDetail(record)}>
          {intl.get('hzero.common.button.edit').d('编辑')}
        </Button>
        <Button funcType="link" onClick={() => enable(record)}>
          {actionRowKey === record.indicatorId ? (
            <Icon type="loading" />
          ) : record.enabledFlag === 1 ? (
            intl.get('hzero.common.status.disable').d('禁用')
          ) : (
            intl.get('hzero.common.status.enable').d('启用')
          )}
        </Button>
        {record.scoreType !== 'SYSTEM' && record.enabledFlag === 1 && (
          <PerButton
            style={{ marginLeft: '8px' }}
            type="c7n-pro"
            funcType="link"
            onClick={() => openIndicationAssign(record)}
            permissionList={[
              {
                code: 'srm.partner.evaluation-template.supplier-kpi-indicator.button.detail',
                type: 'button',
                meaning: '标准指标定义-细项权限',
              },
            ]}
          >
            {intl.get(`spfm.supplierKpiIndicator.view.title.indicationAssign`).d('细项权限')}
          </PerButton>
        )}
        {record.enabledFlag === 1 && (
          <Button funcType="link" onClick={() => handleUpdateScoringTemp(record)}>
            {intl
              .get('spfm.supplierKpiIndicator.view.button.updateToScoringTemplate')
              .d('更新至评分模板')}
          </Button>
        )}
        <Button funcType="link" onClick={() => handleDelete(record)}>
          {intl.get('hzero.common.button.delete').d('删除')}
        </Button>
      </span>
    );
  }

  /**
   * formulaConfigurationRender - 公式配置抽屉render方法
   * @param {String} text - 显示字段
   * @param {object} record - 当前行数据
   */
  formulaConfigurationRender(text, record) {
    const { formulaConfig = e => e, optionsConfig = e => e } = this.props;
    return (
      (record.isNoChildren || record.isNoEnableChildren) &&
      record.enabledFlag === 1 &&
      ((record.scoreType === 'SYSTEM' && (
        <Button funcType="link" onClick={() => formulaConfig(record)}>
          {intl.get('spfm.supplierKpiIndicator.view.button.formulaConfig').d('公式配置')}
        </Button>
      )) ||
        (record.scoreType === 'MANUAL' && record.indicatorType === 'OPT' && (
          <Button funcType="link" onClick={() => optionsConfig(record)}>
            {intl.get('spfm.supplierKpiIndicator.view.button.optionsConfig').d('选项配置')}
          </Button>
        )))
    );
  }

  render() {
    const {
      loading,
      onChange,
      pagination,
      dataSource,
      expandedRowKeys = [],
      onExpand = e => e,
      custLoading,
      customizeTable,
      rowSelection,
    } = this.props;
    const tableProps = {
      dataSource,
      custLoading,
      columns: [
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorCode').d('指标编码'),
          dataIndex: 'indicatorCode',
          width: 240,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.indicatorName').d('指标名称'),
          dataIndex: 'indicatorName',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreType').d('评分方式'),
          dataIndex: 'scoreTypeMeaning',
          width: 120,
          onCell: this.onCell,
        },
        {
          title: intl.get(`sslm.common.model.supplierKpiIndicator.indicatorType`).d('指标类型'),
          dataIndex: 'indicatorTypeMeaning',
          width: 100,
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.suKpiIn.evalStandard`).d('评分标准'),
          dataIndex: 'evalStandard',
          width: 180,
          onCell: this.onCell,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.score').d('分值'),
          width: 200,
          dataIndex: 'score',
          children: [
            {
              title: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreFrom').d('分值从'),
              width: 100,
              dataIndex: 'scoreFrom',
            },
            {
              title: intl.get('spfm.supplierKpiIndicator.model.supplier.scoreTo').d('分值至'),
              width: 100,
              dataIndex: 'scoreTo',
            },
          ],
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.defaultScore').d('缺省分值'),
          dataIndex: 'defaultScore',
          width: 100,
        },
        {
          title: intl.get(`spfm.supplierKpiIndicator.model.supplier.indiScore`).d('指标分值'),
          dataIndex: 'indicatorScore',
          width: 100,
        },
        {
          title: intl
            .get(`spfm.supplierKpiIndicator.model.supplier.isStandard`)
            .d('勾选式/否决项缺省值'),
          dataIndex: 'isStandard',
          width: 160,
          render: (_val, record) => record.isStandardMeaning,
        },
        {
          title: intl
            .get('spfm.supplierKpiIndicator.model.supplier.indicatorOpt')
            .d('选择项缺省值'),
          dataIndex: 'indicatorOptIdMeaning',
          width: 120,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.suKpiIn.sourceFrom').d('数据来源'),
          dataIndex: 'sourceCodeMeaning',
          width: 100,
        },
        {
          title: intl.get('hzero.common.status').d('状态'),
          dataIndex: 'enabledFlag',
          width: 100,
          render: enableRender,
        },
        {
          title: intl.get('spfm.supplierKpiIndicator.model.supplier.orderSeq').d('排序'),
          dataIndex: 'orderSeq',
          width: 100,
        },
        {
          title: intl.get('hzero.common.table.column.option').d('操作'),
          dataIndex: 'option',
          render: this.operiationRender,
          width: 350,
        },
        {
          title: intl
            .get('spfm.supplierKpiIndicator.view.title.formulaConfiguration')
            .d('公式配置'),
          width: 100,
          dataIndex: 'formulaConfiguration',
          render: this.formulaConfigurationRender,
        },
      ],
      rowKey: this.defaultTableRowKey,
      bordered: true,
      loading,
      onChange,
      pagination,
      expandedRowKeys,
      onExpand,
      rowSelection,
    };
    tableProps.scroll = {
      x: sum(tableProps.columns.map(n => (isNumber(n.width) ? n.width : 150))) + 150,
      y: 'calc(100vh - 309px)',
    };
    return customizeTable(
      {
        code: 'SSLM.KPI.INDICATOR.LIST.TABLE',
      },
      <Table {...tableProps} />
    );
  }
}
