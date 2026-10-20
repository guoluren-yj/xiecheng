/* eslint-disable react/state-in-constructor */
import React, { Component } from 'react';
import { routerRedux } from 'dva/router';
import { Header } from 'hzero-front/lib/components/Page';
import intl from "srm-front-boot/lib/utils/intl";
import classnames from "classnames";
import qs from 'querystring';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import withProps from 'hzero-front/lib/utils/withProps';
import ExportButton from '../../../../components/ExportButton';
import ImportButton from '../../../../components/ImportButton';
import MenuTree from './MenuTree';

import "../../../common.less";
import styles from './style.less';
import UnitSearch from './UnitSearch';

const CUSZ_DATR_MIGRATE_ENABLE = window.$$env.HZERO_PLATFORM_CUSZ_DATA_MIGRATE_ENABLE; // 环境变量，用于控制导入导出按钮是否显示

@formatterCollections({ code: ['hzero.common', 'hpfm.customize', 'hpfm.individual'] })
@withProps(() => {
  return {
    listCache: {} as any,
  };
}, { cacheState: true })
export default class DocTenant extends Component<any, any> {

  constructor(props) {
    super(props);
    this.state = {
      currentMenuCode: '__root__',
      collapse: false,
      unitTypeObj: {},
    };
    queryMapIdpValue({
      unitType: 'HPFM.CUST.UNIT_TYPE',
    }).then(res => {
      if (res) {
        const unitTypeObj = {};
        (res.unitType || []).forEach(i => {
          unitTypeObj[i.value] = i.meaning;
        });
        this.setState({
          unitTypeObj,
        });
      }
    });
  }

  onMenuChange = (menuCode: string, title) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/hpfm/ui-customize/cust-config/detail',
        search: qs.stringify({
          menuCode,
          menuName: title,
        })
      })
    );
  }


  toggleCollapse = () => {
    this.setState({ collapse: !this.state.collapse });
  }

  openUnitDetail = (data) => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/hpfm/ui-customize/cust-config/detail',
        search: qs.stringify({
          groupCode: data.unitGroupCode,
          unitId: data.id,
          unitCode: data.unitCode,
          unitType: data.unitType,
          menuCode: data.menuCode,
          menuName: data.menuName,
        })
      })
    );
  }

  expandTree = (e) => {
    const { current } = this.props.listCache;
    this.props.listCache.current = {
      expandTreeKeys: e || current && current.expandTreeKeys,
    };
  }

  render() {
    const {
      state: {
        collapse,
        unitTypeObj,
      },
      props: {
        listCache: { current }
      }
    } = this;
    return (
      <>
        <Header title={intl.get(`hpfm.individual.view.message.title.config`).d('个性化配置')}>
          {CUSZ_DATR_MIGRATE_ENABLE === 'true' && (
            <>
              <ExportButton />
              <ImportButton />
            </>
          )}
        </Header>
        <div className={classnames(styles["unit-list-page"], "unit-common-style", { "collapse": collapse })} style={{ position: "relative" }}>
          <div className="unit-common-style-clip">
            <MenuTree
              cacheExpandKeys={current && current.expandTreeKeys}
              onExpand={this.expandTree}
              onMenuChange={this.onMenuChange}
              disableUnSelect
            />
            <div className={`${styles["unit-left-container-ctrl"]}${collapse ? " collapse" : ""}`} onClick={this.toggleCollapse} />
            <UnitSearch unitTypeObj={unitTypeObj} openUnitDetail={this.openUnitDetail} />
          </div>
        </div>
      </>
    );
  }
}
