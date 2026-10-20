/**
 * IconTree/index.js
 * 单据流权限分配Modal框页面
 * @date: 2021-08-26
 * @author: zhangjinxin <jinxin.zhang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, zhenyun
 */
import React from 'react';
import { Icon } from 'choerodon-ui';
import { Tree, Skeleton } from 'choerodon-ui/pro';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import './index.less';
export default class IconTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentSelect: true,
    };
  }

  componentDidMount() {
    this.props.treeDs.setQueryParameter('roleId', this.props.roleId);
    this.props.treeDs.query().then((resp) => {
      if (getResponse(resp)) {
        const allSelect = this.props.treeDs.records.filter((res) => res.get('allocated') === false);
        if (allSelect.length === 0) {
          this.setState({ currentSelect: !this.state.currentSelect });
        }
      }
    });
  }

  // 自定义全选按钮
  allSelect = () => {
    const authorityDs = this.props.treeDs;
    authorityDs.records.forEach((res) => {
      res.set('allocated', this.state.currentSelect);
    });
    this.setState({ currentSelect: !this.state.currentSelect });
  };

  render() {
    return (
      <>
        <Skeleton
          height={300}
          paragraph={{
            rows: 15,
            // style: { width: '4rem' },
          }}
          active
          dataSet={this.props.treeDs}
          skeletonTitle={false}
        >
          <div style={{ marginBottom: '16px' }}>
          {this.state.currentSelect ? (
            <Icon
              type="check_box_outline_blank"
              style={{ fontSize: '0.21rem' }}
              onClick={() => this.allSelect()}
            />
          ) : (
            <Icon
              type="check_box"
              className='check_box_ste'
              // style={{ fontSize: '0.21rem', color: '#29bece' }}
              onClick={() => this.allSelect()}
            />
          )}
           <span style={{ marginLeft: '8px' }}>
            {intl.get('hzero.common.button.selectAll').d('全选')}
          </span>
        </div>
          <Tree
            // style={{ marginLeft: '0.3rem' }}
            dataSet={this.props.treeDs}
            checkable="true"
            renderer={({ record }) => record.get('name')}
            showLine={{
              showLeafIcon: false,
            }}
          />
        </Skeleton>
      </>
    );
  }
}
