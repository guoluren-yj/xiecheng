/**
 * 地区定义
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-10-31
 * @copyright HAND ® 2019
 */

import React from 'react';
// import { connect } from 'dva';
import { DataSet, Table, Form, Output } from 'choerodon-ui/pro';
import { Tag, Radio } from 'choerodon-ui';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import classNames from 'classnames';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { treeTb, tbDs, headDs } from './store';
import { getIsOldTenant } from '@/services/regionalMappingService';
import style from './index.less';

const TABENUM = {
  lazyTree: 'lazy-tree',
  lineData: 'line-data',
};

// @connect(mapStateToProps, mapDispatchToProps)
@formatterCollections({
  code: ['hpfm.region', 'smdm.regionalMapping', 'smdm.calendar', 'hpfm.country', 'smdm.country'],
})
export default class regional extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOldTenant: true,
      tabKey: TABENUM.lazyTree,
    };
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.treeTbDs = new DataSet(treeTb({ countryId: id }));
    this.listDs = new DataSet(tbDs({ countryId: id }));
    this.headerDs = new DataSet(headDs({ countryId: id }));
  }

  componentDidMount() {
    getIsOldTenant().then((res) => {
      if (getResponse(res)) {
        if (!isEmpty(res)) {
          this.setState({ isOldTenant: true });
        } else {
          this.setState({ isOldTenant: false });
        }
      }
    });
  }

  render() {
    const { isOldTenant, tabKey } = this.state; // isOldTenant
    const extraColumns = !isOldTenant
      ? [
          {
            title: intl.get('hpfm.region.model.region.standardRegionCode').d('国标代码'),
            name: 'standardRegionCode',
            width: 150,
          },
        ]
      : [];
    const treeCols = [
      {
        name: 'status',
        width: 200,
        renderer: ({ record }) => {
          if (record.get('esRegionCode')) {
            return (
              <Tag color="green" style={{ border: 'none' }}>
                {intl.get('smdm.regionalMapping.status.yes').d('已映射')}
              </Tag>
            );
          } else {
            return (
              <Tag color="yellow" style={{ border: 'none' }}>
                {intl.get('smdm.regionalMapping.status.no').d('未映射')}
              </Tag>
            );
          }
        },
      },
      { name: 'regionCode' },
      ...extraColumns,
      { name: 'regionName' },
      { name: 'esRegionCode' },
      { name: 'esRegionName' },
    ];

    return (
      <>
        <Header
          title={intl.get('smdm.regionalMapping.view.message.read').d('查看区域映射')}
          backPath="/smdm/regional-mapping/list"
        />
        <div className={style.smdm_reginal_mapping}>
          <div className="card-content">
            <h3 className="content-title">
              {intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
            </h3>
            <Form
              dataSet={this.headerDs}
              useColon={false}
              showLines={6}
              columns={3}
              labelLayout="vertical"
              labelAlign="left"
              className="c7n-pro-vertical-form-display"
              useWidthPercent
            >
              <Output name="countryCode" />
              <Output name="countryName" />
              <Output name="countryMapperCode" />
              <Output name="countryMapperName" />
            </Form>
          </div>
          <div className={classNames('card-content', 'card-content-read')}>
            <h3 className="content-title">
              {intl.get('smdm.country.model.common.countryMapper').d('区域映射')}
              <Radio.Group
                value={tabKey}
                onChange={(e) => {
                  this.setState({ tabKey: e.target.value });
                }}
                className="reginal-map-radio"
              >
                <Radio.Button value={TABENUM.lazyTree}>
                  {intl.get('smdm.regionalMapping.view.title.lazyTree').d('树形结构')}
                </Radio.Button>
                <Radio.Button value={TABENUM.lineData}>
                  {intl.get('smdm.regionalMapping.view.title.lienData').d('分页结构')}
                </Radio.Button>
              </Radio.Group>
            </h3>
            <div>
              <Table
                dataSet={this.treeTbDs}
                columns={treeCols}
                mode="tree"
                treeAsync
                hidden={tabKey === TABENUM.lineData}
                style={{ maxHeight: '420px' }}
                defaultRowExpanded
                className="tree-table-reginal-map"
                customizedCode="smdm_reginal_map_tree_data"
                onRow={({ record }) => {
                  const nodeProps = {
                    title: record.get('text'),
                  };
                  if (!record.get('hasNextFlag')) {
                    nodeProps.isLeaf = true;
                  }
                  return nodeProps;
                }}
              />
              <SearchBarTable
                hidden={tabKey !== TABENUM.lineData}
                dataSet={this.listDs}
                style={{ maxHeight: '420px' }}
                searchCode="SMDM_REGIONAL_MAP.DETAIL_LIST_FILTER"
                columns={treeCols}
                selectionMode="none"
                cacheState
                searchBarConfig={{
                  closeFilterSelector: true,
                  expandable: false,
                  autoQuery: false,
                }}
                customizedCode="smdm_reginal_map_line_data"
              />
            </div>
          </div>
        </div>
      </>
    );
  }
}
