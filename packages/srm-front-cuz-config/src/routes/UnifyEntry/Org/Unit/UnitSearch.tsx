/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { Tag } from 'choerodon-ui';
import { Form, DataSet, TextField, Icon, Table, Button, Tooltip, OverflowTip } from 'choerodon-ui/pro';
import { HZERO_PLATFORM } from 'hzero-front/lib/utils/config';
import intl from 'hzero-front/lib/utils/intl';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils';
import { SelectionMode } from 'choerodon-ui/pro/lib/table/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { unitTypeColorMap } from '../../../../utils/constConfig.js';

import "../../../common.less";
import styles from './style.less';

export default class UnitSearch extends Component<{
  unitTypeObj: any;
  // eslint-disable-next-line no-unused-vars
  openUnitDetail: (_: {unitCode: string, unitId: string | number, groupCode: string, menuCode: string}) => void;
}, {

}> {

  searchDs = new DataSet({
    autoCreate: true,
    fields: [
      {
        name: "unitCode",
        type: FieldType.string,
      },
    ],
  });

  tableDs = new DataSet({
    autoQuery: true,
    pageSize: 20,
    transport: {
      read: ({data, params}) => {
        return {
          url: `${HZERO_PLATFORM}/v1/${getCurrentOrganizationId()}/customize/unit/list`,
          method: "GET",
          params: {
            ...params,
            menuLevel: "organization",
            // 这里的unitCode也可以传单元名称
            unitCode: data.unitCode,
          },
        };
      },
    },
  });

  columns: ColumnProps[] = [
    {
      header: intl.get("hpfm.customize.common.unitInfo").d("单元信息"),
      name: "unitInfo",
      minWidth: 200,
      renderer: ({record}) => {
        return (
          <div className='unit-column-field-code'>
            <div className='field-name'>
              {record!.get("unitName")}
            </div>
            <div className="field-code">
              {record!.get("unitCode")}
            </div>
          </div>
        );
      },
    },
    {
      header: intl.get("hpfm.customize.common.unitType").d("单元类型"),
      name: "unitType",
      width: 100,
      renderer: ({value}) => {
        return (
          <Tag
            color={unitTypeColorMap[value]}
            style={{
              height: "16px", lineHeight: "16px", fontSize: "10px",
              padding: "0 4px", border: "none",
              maxWidth: '100%', overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <OverflowTip title={unitTypeColorMap[value]}>
                {this.props.unitTypeObj[value]}
            </OverflowTip>
          </Tag>
        );
      },
    },
    {
      header: intl.get("hpfm.customize.common.menuName").d("所属功能"),
      name: "menuName",
      minWidth: 150,
    },
    {
      header: intl.get("hpfm.customize.common.combineName").d("关联模型"),
      name: "combineName",
      minWidth: 120,
    },
    {
      header: intl.get("hzero.common.title.operator").d("操作"),
      name: "_op",
      width: 80,
      renderer: ({record}) => {
        const disabled = record!.get("tplUsedFlag");
        return (
          <Tooltip title={disabled ? intl.get("hpfm.customize.common.tip.unitUsedByTpl").d("该单元已用于“单据样式定制”功能，请至“单据样式定制”进行配置") : ""}>
            <Button
              color={ButtonColor.primary}
              disabled={disabled}
              funcType={FuncType.link}
              onClick={() => this.props.openUnitDetail({...record!.toJSONData(), __use__: []})}
            >
              {intl.get("hzero.common.button.edit")}
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  onSearch = () => {
    const str = this.searchDs.current!.get("unitCode");
    this.tableDs.setQueryParameter("unitCode", str);
    this.tableDs.query();
  }

  render() {

    return (
      <div className={styles["unit-config-all-search"]}>
        <Form dataSet={this.searchDs} labelLayout={LabelLayout.none} className="search-form" columns={3}>
          <TextField
            name="unitCode"
            onBlur={this.onSearch}
            prefix={<Icon type="search" />}
            placeholder={intl.get("hpfm.customize.common.searchUnit").d("请输入单元编码、单元名称查询")}
          />
        </Form>
        <Table
          dataSet={this.tableDs}
          columns={this.columns}
          rowHeight="auto"
          selectionMode={SelectionMode.none}
          style={{maxHeight: "calc(100vh - 276px)"}}
          customizedCode="HPFM.CUSTOMIZE.UNIT_SEARCH"
        />
      </div>
    );
  }
}
