import React, { PureComponent } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
// import { Bind } from 'lodash-decorators';
import { groupBy } from 'lodash';
import { TopSection, SecondSection } from '_components/Section';

// import intl from 'utils/intl';
// import { getResponse } from 'utils/utils';
// import notification from 'utils/notification';
import { TableDS } from './DS';

import styles from './index.less';

export default class ApplicationScope extends PureComponent {
  constructor(props) {
    super(props);
    if (props.onRef) {
      props.onRef(this);
    }

    this.state = {};
  }

  componentDidMount() {}

  getColumns = (isCompany) => {
    return [
      { name: 'dataCode' },
      { name: 'dataName' },
      !isCompany && { name: 'ouCode' },
      !isCompany && { name: 'ouName' },
      !isCompany && { name: 'companyNum' },
      !isCompany && { name: 'companyName' },
    ];
  };

  render() {
    const { sourceAppScopeLineDTOs } = this.props;
    const sourceAppScopeLineData = groupBy(sourceAppScopeLineDTOs, 'dimensionCode');
    return (
      <TopSection className={styles.batchFile}>
        {Object.keys(sourceAppScopeLineData).map((item) => {
          if (!['companyId', 'invOrganizationId'].includes(item)) {
            return null;
          }
          const list = sourceAppScopeLineData[item];
          const isCompany = item === 'companyId';
          const tableDs = new DataSet(TableDS(list, isCompany));
          return (
            <SecondSection title={list[0]?.dimensionName} key={item}>
              <Table
                dataSet={tableDs}
                columns={this.getColumns(isCompany)}
                pagination={{
                  onChange: (page, pageSize) => {
                    tableDs.currentPage = page;
                    tableDs.loadData(list.slice((page - 1) * pageSize, page * pageSize));
                  },
                }}
              />
            </SecondSection>
          );
        })}
      </TopSection>
    );
  }
}
