/* exslint-disable */
/*
 * @Description:
 * @Date: 2020-07-23 10:35:55
 * @author: zhangyongxuan <yongxuan.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import React, { Component, Fragment } from 'react';
import { Bind } from 'lodash-decorators';
import { Spin } from 'choerodon-ui';
import { DataSet, Table } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SPRM } from '_utils/config';

import { detailDS, queryFields } from '../DS/detailDS';
import { operationDS, approvalDS } from '../../pubDS/operationDS';

// import { getBudgetItem } from '@/services/budgetingService';

const organizationId = getCurrentOrganizationId();
@formatterCollections({ code: ['sbud.budgeting'] })
class index extends Component {
  tableDs = new DataSet(detailDS());

  operationDs = new DataSet(
    operationDS({ url: `${SRM_SPRM}/v1/${organizationId}/budget-action`, pk: 'budgetId' })
  );

  approvalDs = new DataSet(approvalDS());

  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      listColumns: [
        {
          name: 'creationDate',
        },
        {
          name: 'documentTypeMeaning',
        },
        {
          name: 'documentNum',
        },
        {
          name: 'amount',
        },
        {
          name: 'realName',
        },
        {
          name: 'quantity',
        },
        {
          name: 'appliedAmount',
        },
      ],
    };
  }

  componentDidMount() {
    const { listColumns } = this.state;
    this.getBudgetItem({ listColumns, seq: 4, ds: this.tableDs });
  }

  /**
   * 设置动态列
   * @param {列} listColumns
   * @param {*插入列的位置} seq
   */
  @Bind()
  async getBudgetItem({ listColumns, seq, ds }) {
    const arr1 = listColumns.slice(0, seq);
    const arr2 = listColumns.slice(seq, listColumns.length);
    const arr3 = [];

    try {
      const queryFromDs = new DataSet();
      queryFields().forEach((item) => {
        const { name, ...others } = item;
        queryFromDs.addField(name, others);
      });
      Object.assign(ds, { queryDataSet: queryFromDs });
      this.setState(
        {
          listColumns: [...arr1, ...arr3, ...arr2],
        },
        () => {
          this.setState({
            loading: false,
          });
          this.tableDs.query();
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    const { listColumns } = this.state;
    const Headers = observer(() => {
      // const isDisabled = props.dataSet.selected.length === 0;
      return (
        <Header
          title={intl.get('sbud.budgeting.view.title.budgetingDetail').d('预算占用明细')}
          backPath="/sbud/budeget-approval/list"
        />
      );
    });
    return (
      <Fragment>
        <Spin spinning={this.state.loading}>
          <Headers dataSet={this.tableDs} />
          <Content>
            <Table
              dataSet={this.tableDs}
              columns={listColumns}
              selectionMode="none"
              queryFieldsLimit={3}
            />
          </Content>
        </Spin>
      </Fragment>
    );
  }
}

export default index;
