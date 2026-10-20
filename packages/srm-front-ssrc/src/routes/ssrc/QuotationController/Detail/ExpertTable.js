// 评分明细表table

import React, { PureComponent } from 'react';
import { Table, Button, Select } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { phoneRender } from '@/utils/renderer';
import { getResponse } from 'utils/utils';

@WithCustomizeC7N({
  unitCode: [
    'SSRC.QUOTATION_CONTROLLER.EXPERT_SCORE', // 询价要求-专家评分
  ],
})
export default class ExpertTable extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {};
  }

  @Bind()
  teamOptionsFilter(option, record) {
    const expertCategory = record.get('expertCategory');
    const expertSource = record.get('expertSource');
    return (
      expertCategory === option.get('value') ||
      expertCategory === 'BUSINESS_TECHNOLOGY' ||
      expertSource === 'SUB_ACCOUNT' ||
      !expertCategory
    );
  }

  componentDidMount() {}

  // table columns
  getColumns() {
    const { header } = this.props;

    const columns = [
      {
        name: 'expertLov',
        width: 120,
        editor: true,
      },
      {
        name: 'expertName',
        width: 150,
      },
      {
        editor: true,
        name: 'evaluateLeaderFlag',
        width: 150,
      },
      header.bidRuleType !== 'NONE'
        ? {
            editor: (record) => {
              return (
                <Select
                  name="team"
                  optionsFilter={(option) => this.teamOptionsFilter(option, record)}
                />
              );
            },
            name: 'team',
            width: 150,
          }
        : null,
      {
        name: 'expertTypeMeaning',
        width: 150,
      },
      {
        name: 'phone',
        width: 200,
        renderer: ({ record }) => {
          return phoneRender(record.get('internationalTelCodeMeaning'), record.get('phone'));
        },
      },
      {
        name: 'email',
        width: 150,
      },
    ].filter(Boolean);

    return columns;
  }

  @Bind()
  async onDeleteLine() {
    const { ds = {} } = this.props;
    const selecteds = ds.selected || [];
    if (isEmpty(selecteds)) {
      return;
    }
    const remoteDelete = selecteds.filter((item) => (item.data || {}).evaluateExpertId);
    const localDelete = selecteds.filter((item) => !(item.data || {}).evaluateExpertId);
    if (!isEmpty(remoteDelete)) {
      const allLine = ds.toData();
      const resetLine = allLine.filter(
        (item) =>
          !remoteDelete
            .map((items) => items.data.evaluateExpertId)
            .includes(item.evaluateExpertId) && item.evaluateExpertId
      );
      const createLine = allLine.filter((item) => !item.evaluateExpertId);
      try {
        await ds.delete(remoteDelete);
        ds.loadData(resetLine);
        createLine.reverse().forEach((item) => {
          ds.create(item, 0);
        });
      } catch (e) {
        throw e;
      }
    } else {
      ds.remove(localDelete);
    }
  }

  render() {
    const { ds = {}, refresh, customizeTable } = this.props;

    return (
      <React.Fragment>
        {customizeTable(
          { code: 'SSRC.QUOTATION_CONTROLLER.EXPERT_SCORE' },
          <Table
            bordered
            buttons={[
              'add',
              [
                <Button icon="delete" onClick={() => this.onDeleteLine()}>
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.delete`).d('删除')}
                </Button>,
              ],
              [
                <Button
                  icon="save"
                  onClick={() => {
                    ds.submit().then((res) => {
                      if (getResponse(res)) {
                        refresh();
                      }
                    });
                  }}
                  key="save"
                  wait={1000}
                  waitType="debounce"
                >
                  {intl.get(`ssrc.inquiryHall.model.inquiryHall.save`).d('保存')}
                </Button>,
              ],
            ]}
            dataSet={ds}
            columns={this.getColumns()}
          />
        )}
      </React.Fragment>
    );
  }
}
