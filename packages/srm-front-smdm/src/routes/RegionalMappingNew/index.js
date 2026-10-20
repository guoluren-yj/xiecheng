/**
 * 地区定义
 * @author WY <yang.wang06@hand-china.com>
 * @date 2019-10-31
 * @copyright HAND ® 2019
 */

import React from 'react';
// import { connect } from 'dva';
import { DataSet, Table, Form, TextField, IntlField, Modal, Button } from 'choerodon-ui/pro';
import { Tag, Radio } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import queryString from 'query-string';
import { openTab } from 'utils/menuTab';
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { Header } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';
import notification from 'utils/notification';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { treeTb, tbDs, headDs, lineCurrentDs } from './store';
import { getIsOldTenant, regionUpdate, saveCurrentData } from '@/services/regionalMappingService';
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

  @Bind()
  regionUpdate(payload) {
    const { regionUpdate } = this.props;
    return regionUpdate({
      ...payload,
    });
  }

  @Bind()
  regionImport() {
    const { regionImport } = this.props;
    regionImport().then(() => {
      this.regionQueryLazyTree();
      this.regionQueryLine();
    });
  }

  @Bind()
  regionQueryLine(payload) {
    const {
      regionQueryLine,
      match: {
        params: { id },
      },
    } = this.props;
    return regionQueryLine({
      ...payload,
      countryId: id,
    });
  }

  @Bind()
  regionQueryLazyTree(payload) {
    const {
      regionQueryLazyTree,
      match: {
        params: { id },
      },
    } = this.props;
    return regionQueryLazyTree({
      ...payload,
      countryId: id,
    });
  }

  /**
   * 批量导入
   */
  @Bind()
  handleImport(code) {
    const retitle = intl.get('smdm.regionalMapping.view.option.regionImport').d('映射地区导入');
    openTab({
      key: `/smdm/regional-mapping/import/${code}`,
      search: queryString.stringify({
        key: `/smdm/regional-mapping/import/${code}`,
        title: retitle,
        action: retitle,
      }),
    });
  }

  @Bind()
  regionQueryDetail(payload) {
    const { regionQueryDetail } = this.props;
    return regionQueryDetail(payload);
  }

  @Bind()
  async handleSave() {
    const headerValidateFlag = await this.headerDs.validate();
    if (headerValidateFlag) {
      const [data] = this.headerDs.toJSONData();
      return new Promise((resolve) => {
        saveCurrentData({
          ...(data || {}),
        })
          .then((res) => {
            if (getResponse(res)) {
              notification.success();
              this.headerDs.query();
            }
          })
          .finally(() => {
            resolve();
          });
      });
    }
  }

  @Bind()
  handleEditRecord({ record }) {
    const data = record.toData();
    const dataSet = new DataSet(lineCurrentDs());
    dataSet.loadData([data]);
    Modal.open({
      title: intl.get('smdm.country.model.common.countryMapper').d('区域映射'),
      style: { width: 380 },
      closable: true,
      drawer: true,
      children: (
        <div>
          <Form dataSet={dataSet} columns={1} labelLayout="float" useColon={false}>
            <TextField name="regionCode" />
            <IntlField name="regionName" />
            <TextField name="esRegionCode" />
            <IntlField name="esRegionName" />
          </Form>
        </div>
      ),
      onOk: () => {
        return new Promise(async (resolve) => {
          const flag = await dataSet.validate();
          if (flag) {
            regionUpdate({
              ...dataSet.current?.toData(),
            })
              .then((res) => {
                if (getResponse(res)) {
                  notification.success();
                  this.treeTbDs.query();
                  this.listDs.query();
                }
              })
              .finally(() => {
                resolve();
              });
          } else {
            resolve(false);
          }
        });
      },
      footer: (okBtn, cancelBtn) => (
        <div>
          {okBtn}
          {cancelBtn}
        </div>
      ),
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
      { name: 'regionCode', editor: false },
      ...extraColumns,
      { name: 'regionName', editor: false },
      { name: 'esRegionCode', editor: false },
      { name: 'esRegionName', editor: false },
      {
        name: 'actions',
        renderer: ({ record }) => (
          <Button onClick={() => this.handleEditRecord({ record })} funcType="link">
            {intl.get('hzero.common.button.edit').d('编辑')}{' '}
          </Button>
        ),
      },
    ];

    return (
      <>
        <Header
          title={intl.get('smdm.regionalMapping.view.message.edit').d('编辑区域映射')}
          backPath="/smdm/regional-mapping/list"
        >
          <Button onClick={this.handleSave} color="primary" funcType="raised" icon="save">
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        </Header>
        <div className={style.smdm_reginal_mapping}>
          <div className="card-content">
            <h3 className="content-title">
              {intl.get('hzero.common.view.title.baseInfo').d('基础信息')}
            </h3>
            <Form dataSet={this.headerDs} columns={3} labelLayout="float" useColon={false}>
              <TextField name="countryCode" />
              <IntlField name="countryName" />
              <TextField name="countryMapperCode" />
              <IntlField name="countryMapperName" />
            </Form>
          </div>
          <div className="card-content">
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
