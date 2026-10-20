import React, { PureComponent } from 'react';
import { Tag } from 'choerodon-ui';
import { DataSet, Table, CheckBox } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import notification from "hzero-front/lib/utils/notification";
import { axios } from "srm-front-boot/lib/utils/c7nUiConfig";
import intl from 'utils/intl';

import type { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { getResponse } from 'hzero-front/lib/utils/utils';
import { SelectionMode, TableMode, TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';

function assignListData(collections = []) {
  return collections.map((n: any) => {
    const m = n;
    m.key = n.id;
    if (isEmpty(m.subMenus)) {
      m.subMenus = null;
    } else {
      m.subMenus = assignListData(m.subMenus);
      const checkedCount = m.subMenus.filter((o) => o.checkedFlag === 'Y').length;
      const indeterminateCount = m.subMenus.filter((o) => o.checkedFlag === 'P').length;
      m.checkedFlag =
        // eslint-disable-next-line no-nested-ternary
        checkedCount === m.subMenus.length
          ? 'Y'
          : // eslint-disable-next-line no-nested-ternary
          checkedCount === 0
          ? indeterminateCount === 0
            ? null
            : 'P'
          : 'P';
    }
    return m;
  });
}
export default class Permissions extends PureComponent<{queryUrl: string; checkUrl: string; recyleUrl: string; editFlag?: boolean;}> {

  static defaultProps = {
    editFlag: false,
  }

  permissionTypeMap = {
    api: intl.get('hiam.roleManagement.view.message.api').d('API'),
    button: intl.get('hiam.roleManagement.view.message.button').d('按钮'),
    table: intl.get('hiam.roleManagement.view.message.table').d('表格列'),
    formItem: intl.get('hiam.roleManagement.view.message.formItem').d('表单项'),
    formField: intl.get('hiam.roleManagement.view.message.formField').d('表单域'),
  };

  dataSet = new DataSet({
    childrenField: "subMenus",
    fields: [
      {
        name: "name",
        label: intl.get(`hiam.roleManagement.model.roleManagement.permissionName`).d('权限名称'),
      },
      {
        name: 'permissionType',
        label: intl.get(`hiam.roleManagement.model.roleManagement.permission.Type`).d('权限类型'),
      },
    ],
    queryFields: [
      {
        name: "name",
        label: intl.get(`hiam.roleManagement.model.roleManagement.permissionName`).d('权限名称'),
      },
    ],
    transport: {
      read: () => {
        return {
          url: this.props.queryUrl,
          method: "GET",
          transformResponse: (res) => {
            try {
              const jsonData = JSON.parse(res);
              if(getResponse(jsonData)){
                return assignListData(jsonData);
              }
              return []
            } catch(e) {
              return [];
            }
          }
        };
      },
    },
  });

  componentDidMount(){
    this.dataSet.query();
  }

  columns = [
    { name: "name", width: 300, },
    {
      name: "permissionType",
      width: 320,
      renderer: ({ value, record }) => {
        const text = ((value || "").split(',') || []).map((item) => (this.permissionTypeMap[item] ? this.permissionTypeMap[item] : '')) || [];
        return (
          record.get("type") === 'ps' && (
            <Tag color={value === 'api' ? 'green' : 'orange'}>{text.join()}</Tag>
          )
        );
      },
    },
    this.props.editFlag && {
      name: "_operator",
      header: intl.get('hzero.common.button.action').d('操作'),
      renderer: ({record}) => {
        const checkedFlag = record.get("checkedFlag");
        const checkboxProps = {
          indeterminate: checkedFlag === 'P',
          checked: checkedFlag === 'Y',
          onChange: () => this.onCheckboxChange(record.toJSONData()),
        };
        return (
          <CheckBox {...checkboxProps} />
        )
      },
    },
  ].filter(Boolean) as ColumnProps[]


  onCheckboxChange(record: any) {
    const {
      recyleUrl,
      checkUrl,
    } = this.props;

    const setIdList: any[] = [];
    const getSubSetIdList = (collections = [] as any[]) => {
      collections.forEach((n) => {
        if (n.type === 'ps') {
          setIdList.push(n.id);
        }
        if (!isEmpty(n.subMenus)) {
          getSubSetIdList(n.subMenus);
        }
      });
    };

    if (record.type === 'ps') {
      setIdList.push(record.id);
    }

    if (!isEmpty(record.subMenus)) {
      getSubSetIdList(record.subMenus);
    }
    if (record.checkedFlag !== 'Y') {
      axios.put(
        checkUrl,
        setIdList
      ).then((res) => {
        if(getResponse(res) || !res){
          notification.success({});
          this.dataSet.query()
        }
      });
    } else {
      axios.put(
        recyleUrl,
        setIdList
      ).then((res) => {
        if(getResponse(res) || !res){
          notification.success({});
          this.dataSet.query()
        }
      });
    }
  }

  render() {
    return (
      <Table
        mode={TableMode.tree}
        selectionMode={SelectionMode.none}
        dataSet={this.dataSet}
        columns={this.columns}
        style={{maxHeight: "calc(100vh - 240px)"}}
        queryBar={TableQueryBarType.normal}
      />
    );
  }
}
