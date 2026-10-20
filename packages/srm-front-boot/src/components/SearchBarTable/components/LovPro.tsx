import React, { PureComponent } from 'react';
import type { DataSet } from 'choerodon-ui/pro';
import type { Record } from 'choerodon-ui/dataset';
import { ShowValidation } from 'choerodon-ui/pro/lib/form/enum';
import { Select, TextField } from 'choerodon-ui/pro';
import { Icon, Divider } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { Bind } from 'lodash-decorators';
import { groupBy, values } from 'lodash';

import intl from '../../../utils/intl';
import {
  stylePrefix,
  LOV_CONDITION_GROUP_INDEX,
  checkComparsionWithNull,
} from '../util';

interface ILovPro {
  formDs: DataSet;
  queryFields?: { field: string; label: string }[];
}

function groupRecordsByField(records): Record[][] {
  if (!records.length) {
    return [];
  }
  return values(groupBy(records, item => item.getState(LOV_CONDITION_GROUP_INDEX)));
}

@observer
export default class LovPro extends PureComponent<ILovPro, any> {

  @Bind()
  handleChange(recordGroup, value) {
    recordGroup.forEach(record => record.set('queryField', value));
  }

  @Bind()
  handleAddCondition(record: Record, groupLength: number) {
    const { formDs } = this.props;
    const targetIndex = groupLength + 1;
    const queryField = record.get('queryField');
    formDs
      .create({ queryField }, targetIndex)
      .setState(LOV_CONDITION_GROUP_INDEX, record.getState(LOV_CONDITION_GROUP_INDEX));
  }

  @Bind()
  handleRemoveCondition(record: Record, index: number) {
    const { formDs } = this.props;
    formDs.remove(record, true);
    if (!formDs.records.length) {
      formDs.create({});
    }
  }

  @Bind()
  handleAddField() {
    const { formDs } = this.props;
    const recordGroups = groupRecordsByField(formDs.records);
    const lastGroup = recordGroups[recordGroups.length - 1];
    const lastGroupIndex = lastGroup && lastGroup[0] && lastGroup[0].getState(LOV_CONDITION_GROUP_INDEX);
    formDs
      .create({}, formDs.records.length)
      .setState(LOV_CONDITION_GROUP_INDEX, lastGroupIndex ? lastGroupIndex + 1 : 1);
  }

  @Bind()
  filterQueryFieldOptions(option) {
    const { formDs } = this.props;
    if (option && formDs.records.length > 0) {
      return formDs.every((r) => r.get('queryField') !== option.get('value'));
    }
    return true;
  }

  @Bind()
  filterComparisonOptions(option) {
    return ['=', '<>', 'NOTNULL', 'ISNULL'].includes(option.get('value'));
  }

  render() {
    const { formDs, queryFields } = this.props;
    const recordGroups = groupRecordsByField(formDs.records);
    return (
      <div className={`${stylePrefix}-lov-pro`}>
        {recordGroups.map((recordGroup, groupIndex) =>
          recordGroup.map((record, recordIndex) => (
            <>
              {groupIndex > 0 && recordIndex === 0 && (
                <Divider dashed className={`${stylePrefix}-lov-pro-item-divide`}>
                  {intl.get('srm.filterBar.view.message.and').d('且')}
                </Divider>
              )}
              <div className={`${stylePrefix}-lov-pro-item`}>
                <span
                  className={`${stylePrefix}-lov-pro-icon`}
                  style={{
                    marginRight: '8px',
                    visibility: recordIndex === 0 ? 'visible' : 'hidden',
                  }}
                  onClick={() => this.handleAddCondition(record, recordGroup.length)}
                >
                  <Icon type='add' />
                </span>
                <Select
                  record={record}
                  name='queryField'
                  onChange={(value) => this.handleChange(recordGroup, value)}
                  showValidation={ShowValidation.tooltip}
                  placeholder={intl.get('srm.filterBar.view.placeholder.searchField').d('筛选字段')}
                  style={{
                    width: '140px',
                    visibility: recordIndex === 0 ? 'visible' : 'hidden',
                  }}
                  optionsFilter={this.filterQueryFieldOptions}
                />
                <span style={{ position: 'relative', display: 'inline-block', width: '16px' }}>
                  {recordIndex > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        display: 'inline-block',
                        height: '49px',
                        top: '-51px',
                        width: '8px',
                        borderRight: '1px solid rgba(201,205,212,1)',
                      }}
                    />
                  )}
                  {recordGroup.length > 1 && (
                    <span
                      style={{
                        position: 'absolute',
                        display: 'inline-block',
                        width: recordIndex === 0 ? '16px' : '8px',
                        borderTop: '1px solid rgba(201,205,212,1)',
                        top: '-3px',
                        left: recordIndex === 0 ? 0 : '8px',
                      }}
                    />
                  )}
                </span>
                <Select
                  record={record}
                  name='comparison'
                  showValidation={ShowValidation.tooltip}
                  placeholder={intl.get('srm.filterBar.view.placeholder.comparison').d('关系')}
                  style={{ width: '100px', marginRight: '16px' }}
                  optionsFilter={this.filterComparisonOptions}
                />
                {!record || !checkComparsionWithNull(record.get('comparison')) ? (
                  <TextField
                    record={record}
                    name='value'
                    showValidation={ShowValidation.tooltip}
                    placeholder={intl.get('srm.filterBar.view.placeholder.value').d('值')}
                    style={{ width: '186px' }}
                  />
                ) : (
                  <span style={{ display: 'inline-block', width: '186px' }} />
                )}
                <span
                  style={{ marginLeft: '8px' }}
                  className={`${stylePrefix}-lov-pro-icon`}
                  onClick={() => this.handleRemoveCondition(record, recordIndex)}
                >
                  <Icon type='close' />
                </span>
              </div>
            </>
        )))}
        {queryFields && queryFields.length > recordGroups.length ? (
          <div className={`${stylePrefix}-lov-pro-footer`} onClick={this.handleAddField}>
            <Icon type='add' />
            {intl.get('srm.filterBar.view.button.addSearchField').d('新增筛选字段')}
          </div>
        ) : <div className={`${stylePrefix}-lov-pro-footer-empty`} />}
      </div>
    );
  }
}