/**
 * 标段侧弹窗
 * @date: 2021-03-01
 * @author: Goku<xu.pan01@going-link.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2021, Hand
 */

import React, { PureComponent } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';
import { isArray } from 'lodash';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

import intl from 'utils/intl';

import { isText } from '@/utils/utils';
import { queryEnableDoubleUnit } from '@/services/commonService';
import { MaterialLineDS } from './SectionLineDS';

const promptCode = 'ssrc.projectSetup';

export default class SectionDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      materialLineDSMap: {},
      doubleUnitFlag: false, // 判断是否开启双单位
    };
  }

  componentDidMount() {
    this.queryDoubleUnit();
  }

  // 查询双单位是否开启
  queryDoubleUnit = async () => {
    const res = await queryEnableDoubleUnit({
      businessModule: 'RFX',
    });
    if (isText(res)) {
      this.setState({
        doubleUnitFlag: !!Number(res),
      });
    }
  };

  getColumns() {
    const fields = [
      {
        name: 'sectionCode',
        width: 150,
      },
      {
        name: 'sectionName',
        width: 200,
      },
      {
        name: 'sectionRemark',
        width: 200,
      },
    ];
    return fields;
  }

  @Bind()
  handleExpand(expanded, record) {
    const { materialLineDSMap } = this.state;
    const projectLineSectionId = record.get('projectLineSectionId');
    if (!materialLineDSMap[projectLineSectionId]) {
      // 先判断当前行下, `materialLineDS` 是否存在
      materialLineDSMap[projectLineSectionId] = new DataSet(MaterialLineDS());
      this.setState(
        {
          materialLineDSMap: {
            ...this.state.materialLineDSMap,
            [projectLineSectionId]: materialLineDSMap[projectLineSectionId],
          },
        },
        () => {
          const { projectLineItemList } = record.toData();
          if (isArray(projectLineItemList) && projectLineItemList.length > 3) {
            projectLineItemList.splice(3);
            projectLineItemList.push({});
          }
          materialLineDSMap[projectLineSectionId].loadData(projectLineItemList);
        }
      );
    }
  }

  // 渲染 行/列合并
  renderCell(record, dataSet, name) {
    // combineField-合并列/otherField-其他列
    const data = dataSet.toData();
    const { index } = record;
    if (data.length > 3 && index === data.length - 1) {
      if (index === data.length - 1) {
        return {
          colSpan: name === 'itemCode' ? 5 : 1,
          hidden: name !== 'itemCode',
        };
      }
    }
    return {
      colSpan: 1,
      hidden: false,
    };
  }

  /**
   * 展开/收起
   * @param {!Object} record - 父行记录
   * @param {!Object} r - 子行记录
   */
  @Bind()
  handleChangeExpand(record, r) {
    const { materialLineDSMap } = this.state;
    const { projectLineSectionId, projectLineItemList } = record.toData();
    const expand = r.get('expand');
    r.set('expand', !expand);
    if (expand) {
      // 收起
      projectLineItemList.splice(3);
    } // 展开
    projectLineItemList.push(r);
    materialLineDSMap[projectLineSectionId].loadData(projectLineItemList);
  }

  @Bind()
  renderExpandedRow({ record }) {
    const { doubleUnitFlag } = this.state;
    const columns = [
      {
        name: 'itemCode',
        width: 120,
        onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'itemCode'),
        renderer: ({ record: r, dataSet, value }) => {
          const data = dataSet.toData();
          const { index } = r;
          if (data.length > 3 && index === data.length - 1) {
            const expand = r.get('expand');
            return (
              <a
                style={{
                  display: 'flex',
                  alignItems: 'center',
                }}
                onClick={() => this.handleChangeExpand(record, r)}
              >
                {expand
                  ? intl.get('hzero.common.button.up').d('收起')
                  : intl.get(`${promptCode}.view.message.button.more`).d('更多')}
                <Icon type={expand ? 'expand_less' : 'expand_more'} />
              </a>
            );
          }
          return value;
        },
      },
      {
        name: 'itemName',
        width: 150,
        onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'itemName'),
      },
      {
        name: 'itemCategoryName',
        width: 150,
        onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'itemCategoryName'),
      },
      {
        name: 'secondaryQuantity',
        width: 150,
        onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'secondaryQuantity'),
      },
      {
        name: 'secondaryUomName',
        width: 150,
        onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'secondaryUomName'),
      },
      doubleUnitFlag
        ? {
            name: 'requiredQuantity',
            width: 150,
            onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'requiredQuantity'),
          }
        : null,
      doubleUnitFlag
        ? {
            name: 'uomName',
            width: 150,
            onCell: ({ record: r, dataSet: ds }) => this.renderCell(r, ds, 'uomName'),
          }
        : null,
    ].filter(Boolean);
    return (
      <Table
        dataSet={this.state.materialLineDSMap[record.get('projectLineSectionId')]}
        columns={columns}
      />
    );
  }

  // icon渲染
  @Bind()
  renderExpandIcon({ prefixCls, expanded, expandable, record, onExpand }) {
    const projectLineItemList = record.get('projectLineItemList');
    if (projectLineItemList?.length > 0) {
      const iconPrefixCls = `${prefixCls}-expand-icon`;
      const classString = classNames(iconPrefixCls, {
        [`${iconPrefixCls}-expanded`]: expanded,
      });
      return (
        <Icon
          type="baseline-arrow_right"
          className={classString}
          onClick={onExpand}
          tabIndex={expandable ? 0 : -1}
        />
      );
    } else {
      // 子结点渲染
      return <span style={{ paddingLeft: '0.18rem' }} />;
    }
  }

  render() {
    const { sectionLineDS } = this.props;
    return (
      <Table
        dataSet={sectionLineDS}
        columns={this.getColumns()}
        queryFieldsLimit={2}
        expandedRowRenderer={this.renderExpandedRow}
        expandIcon={this.renderExpandIcon}
        onExpand={this.handleExpand}
        expandIconColumnIndex={2}
        pagination={{
          pageSizeOptions: ['5', '10', '20', '50', '100'],
        }}
      />
    );
  }
}
