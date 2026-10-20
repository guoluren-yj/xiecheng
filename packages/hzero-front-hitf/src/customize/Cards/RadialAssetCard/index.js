/**
 * 工作台卡片-服务领域资产地图
 * @author baitao.huang@hand-china.com
 * @date 2021/01/18
 * @version: 0.0.1
 * @copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { DataSet, Spin } from 'choerodon-ui/pro';
import { Card, Icon } from 'choerodon-ui';
import 'echarts/lib/chart/tree';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import ReactEcharts from 'echarts-for-react';
import { Bind } from 'lodash-decorators';
import { radialTreeDS } from '@/stores/customize/radialAssetCardDS';
import getLang from '@/langs/cardLang';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import styles from '../../index.less';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
class RadialAssetCard extends React.Component {
  constructor(props) {
    super(props);
    this.radialTreeDS = new DataSet(
      radialTreeDS({
        onLoad: this.handleLoad,
      })
    );
    this.state = {
      dataSource: [],
    };
  }

  @Bind()
  handleLoad({ dataSet }) {
    this.setState({
      dataSource: [
        {
          name: '',
          children: dataSet.toData(),
        },
      ],
    });
  }

  /**
   * getOption
   */
  @Bind()
  getOption() {
    const { dataSource } = this.state;
    return {
      tooltip: {
        trigger: 'item',
        triggerOn: 'mousemove',
      },
      series: [
        {
          type: 'tree',
          layout: 'radial',
          top: '18%',
          bottom: '14%',
          symbol: 'emptyCircle',
          symbolSize: 7,
          initialTreeDepth: 1,
          animationDurationUpdate: 750,
          data: dataSource,
        },
      ],
    };
  }

  render() {
    const { name } = this.props;
    return (
      <Card
        key="radialAssetCard"
        className={styles['workbench-card']}
        title={<h3>{name}</h3>}
        bordered={false}
        extra={
          <a onClick={() => this.radialTreeDS.query()}>
            {getLang('RELOAD')}
            <Icon type="refresh" />
          </a>
        }
      >
        <Spin dataSet={this.radialTreeDS}>
          <ReactEcharts
            option={this.getOption()}
            style={{ height: 500 }}
            opts={{ renderer: 'canvas' }}
          />
        </Spin>
      </Card>
    );
  }
}

export default RadialAssetCard;
