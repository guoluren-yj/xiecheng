/**
 * @description 物料属性页面
 */

import React, { Component, Fragment } from 'react';
import { Table as C7NTable, DataSet } from 'choerodon-ui/pro';
// import { Content } from 'components/Page';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import querystring from 'querystring';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { itemCustomDs } from './../PurchaseDetail/componentDs';
import { customAttribute } from '@/services/purchaseRequisitionCreationService';

@formatterCollections({
  code: ['sprm.common'],
})
export default class ItemCustom extends Component {
  constructor(props) {
    super(props);
    const {
      href = '',
      // location: { search },
    } = this.props;
    const search = href.substr(href.indexOf('?'), href.length);
    const { prLineId, itemId, c7nFlag } = querystring.parse(search.substr(1));
    this.state = {
      prLineId,
      itemId,
      c7nFlag,
      data: [],
    };
  }

  itemCustomLineDs = new DataSet(itemCustomDs());

  componentDidMount() {
    this.setState({ loading: true });
    this.itemCustomLineDs.status = 'loading';
    const { prLineId, itemId, c7nFlag } = this.state;
    customAttribute({ itemId, prLineId, customMadeFlag: 0 })
      .then((result = []) => {
        const res = getResponse(result);
        if (res && !res.failed) {
          if (c7nFlag) {
            this.itemCustomLineDs.status = 'ready';
            this.itemCustomLineDs.loadData(isEmpty(res) ? [] : res);
          } else {
            const currentData = isEmpty(res) ? [] : res;
            this.setState({
              loading: false,
              data: currentData,
            });
          }
        }
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  }

  render() {
    const { loading, data, c7nFlag = false } = this.state;
    const cols = [
      {
        name: 'attributeName',
      },
      {
        name: 'attributeValue',
      },
    ];

    const columns = [
      {
        title: intl.get(`sprm.common.model.common.componentName`).d('属性名称'),
        dataIndex: 'attributeName',
        width: 120,
      },
      {
        title: intl.get(`sprm.common.model.common.cpValue`).d('属性值'),
        dataIndex: 'attributeValue',
      },
    ];
    return (
      <Fragment>
        {c7nFlag ? (
          <C7NTable dataSet={this.itemCustomLineDs} columns={cols} pagination={false} />
        ) : (
          <Table columns={columns} loading={loading} dataSource={data} pagination={false} />
        )}
      </Fragment>
    );
  }
}
