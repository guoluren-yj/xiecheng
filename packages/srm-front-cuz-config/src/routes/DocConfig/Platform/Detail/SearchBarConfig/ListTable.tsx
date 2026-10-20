import React, { Component } from 'react';
import { DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty, values, isArray } from 'lodash';
import { ColumnProps } from 'choerodon-ui/pro/lib/table/Column';
import { FieldType } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'hzero-front/lib/utils/intl';

import styles from './index.less';
import FieldEditor from './FieldEditor';
import SortSelector from './SortSelector';
import { SEARCHBAR_RANGE_COMPONENT } from '@/utils/constConfig';

interface ListTableProps {
  originFields: any[];
  currentFilter: any;
  unitInfo: any;
}

export default class ListTable extends Component<ListTableProps> {
  tableDs: DataSet;
  
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
      enabledFlag: false, // 启用标识
      fieldList: [], // 已加的字段列表
      optionalFieldList: [], // 可选的字段列表
      widgetTypeObj: {}, // 字段组件类型map
      selectorHidden: true,
      multiCondition: [],
    };
    this.tableDs = new DataSet({
      paging: false,
      selection: false,
      fields: [
        {
          label: intl.get('hpfm.searchBar.model.searchBar.fieldName').d('字段名称'),
          name: 'fieldName',
        },
        {
          label: intl.get('hpfm.searchBar.model.searchBar.widgetType').d('组件类型'),
          name: 'widget.fieldWidget',
          lookupCode: 'HPFM.CUST.FIELD_COMPONENT',
        },
        {
          label: intl.get('hpfm.searchBar.model.searchBar.defaultValue').d('默认值'),
          name: 'defaultValue',
        },
        {
          label: intl.get('hpfm.searchBar.model.searchBar.fixed').d('冻结'),
          name: 'fixedFlag',
          type: FieldType.boolean,
          transformRequest(value) {
            return value ? 1 : 0;
          },
          transformResponse(value) {
            return value === undefined ? undefined : !!value;
          },
        }
      ]
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!isEmpty(nextProps.currentFilter)) {
      const {
        filterCode,
        enabledFlag,
        filterFields = [],
        allFields = [],
      } = nextProps.currentFilter;
      const {
        filterCode: oldFilterCode,
        filterFields: oldFilterFields = [],
      } = this.props.currentFilter;
      if (
        oldFilterCode !== filterCode ||
        oldFilterFields.length !== filterFields.length
      ) {
        const { fieldList, fixedFieldList, mergeFieldList, normalFieldList } = this.transformFieldList(filterFields);
        this.tableDs.loadData(fieldList);
        this.setState({
          fieldList,
          fixedFieldList,
          mergeFieldList,
          normalFieldList,
          enabledFlag: enabledFlag === 1,
          selectedRows: [],
          optionalFieldList: isEmpty(allFields)
            ? []
            : allFields.filter((item) => item.showFlag !== 0),
        });
      }
    }
  }

  transformFieldList(originFieldList: any[] = []) {
    let fieldList: any[] = [];
    const fixedFieldList: any[] = []; // 冻结字段
    const mergeFieldList: any[] = []; // 聚合字段
    const normalFieldList: any[] = []; // 普通字段
    if (!isEmpty(originFieldList)) {
      originFieldList.sort((before, after) => before.num - after.num);
      fieldList = originFieldList;
      originFieldList.forEach((item) => {
        if (item.showFlag === 0) {
          return;
        }
        if (item.fixedFlag === 1) {
          fixedFieldList.push(item);
        } else if (item.mergeFlag === 1) {
          mergeFieldList.push(item);
        } else {
          normalFieldList.push(item);
        }
      });
      fieldList = fixedFieldList.concat(normalFieldList).concat(mergeFieldList);
    }
    return { fieldList, fixedFieldList, mergeFieldList, normalFieldList };
  }

  @Bind()
  handleEdit(record) {
    const { originFields } = this.props; 
    Modal.open({
      title: intl.get('hpfm.searchBar.view.message.viewField').d('查看字段'),
      drawer: true,
      style: { width: '500px' },
      children: (
        <FieldEditor record={record} originFields={originFields} />
      ),
      footer: okBtn => okBtn,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }

  @Bind()
  renderFieldName({ record }) {
    const { fieldAlias, fieldName } = record.get(['fieldAlias', 'fieldName']);
    return (
      <div className={styles['search-bar-table-list-item']}>
        <div
          style={{ fontWeight: 600, lineHeight: '18px' }}
          onClick={() => this.handleEdit(record)}
        >
          {fieldName}
        </div>
        <div style={{ color: '#a5a5a5', lineHeight: '18px' }}>{fieldAlias}</div>
      </div>
    );
  }

  @Bind()
  generateLovDefaultValue(records, displayField) {
    if (!isArray(records) || isEmpty(records)) {
      return null;
    }
    return records.map((item) => item[displayField]).join(',');
  }

  @Bind()
  renderDefaultValue({ record }) {
    const { fieldAlias, defaultValue, lovValueRecords, proDefaultFlag } =
      record.get(["fieldAlias", "defaultValue", "lovValueRecords", "proDefaultFlag"]);
    if (proDefaultFlag === 1) {
      return defaultValue;
    }
    if (!defaultValue) {
      return null;
    }
    const { originFields = [] } = this.props;
    if (isEmpty(originFields)) {
      return null;
    }
    const targetField = originFields.find((item) => item.fieldAlias === fieldAlias) || {};
    const { widget, displayField } = targetField;
    const { lovInfo, fieldWidget, multipleFlag, lovEnhanceFlag } = widget || {};
    const { displayField: originDisplayField } = lovInfo || {};
    if (fieldWidget === 'LOV') {
      if (lovEnhanceFlag === 1) {
        return undefined;
      }
      if (lovValueRecords) {
        return this.generateLovDefaultValue(lovValueRecords, displayField || originDisplayField);
      }
    } else if (fieldWidget === 'SELECT' && !isEmpty(lovValueRecords)) {
      const meanings = values(lovValueRecords);
      if (meanings.length < defaultValue.split(',').length) {
        return meanings.join(',').concat('...');
      } else {
        return meanings.join(',');
      }
    } else if (
      SEARCHBAR_RANGE_COMPONENT.includes(fieldWidget) &&
      defaultValue &&
      multipleFlag === 1
    ) {
      return defaultValue.split(',').join('~');
    }
    return defaultValue;
  }

  render() {
    const { unitInfo = {} } = this.props;
    const { sortedEnabled } = unitInfo;
    const columns = [
      {
        name: 'fieldName',
        renderer: this.renderFieldName,
      },
      {
        name: 'widget.fieldWidget',
        width: 100,
      },
      {
        name: 'defaultValue',
        width: 200,
        renderer: this.renderDefaultValue,
      },
      {
        name: 'fixedFlag',
        width: 80,
        renderer: ({ value }) => (value ? <Icon type="check" /> : null),
      },
    ] as ColumnProps[];
    return (
      <>
        <div className={styles['table-header']}>
          {sortedEnabled === 1 && <SortSelector {...this.props} />}
        </div>
        <Table
          dataSet={this.tableDs}
          rowHeight={36}
          columns={columns}
        />
      </>
    );
  }
}
