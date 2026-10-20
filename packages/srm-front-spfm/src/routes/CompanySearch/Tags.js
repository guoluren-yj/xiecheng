/**
 * ModifyGroupModel - 修改分组
 * @date: 2019-07-03
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Tag } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { map } from 'lodash';

export default class Tags extends Component {
  componentDidMount() {}

  @Bind()
  renderTag(tags) {
    if (this.div !== undefined && this.div.clientHeight > 81) {
      this.more.show();
    } else if (this.more) {
      this.more.close();
    }
    if (tags) {
      return map(tags, tag => {
        return <Tag color="orange">{tag.categoryDescription}</Tag>;
      });
    }
  }

  render() {
    const { showTagList = () => {}, data = {} } = this.props;
    return (
      <Fragment>
        <div
          ref={e => {
            this.div = e;
          }}
        >
          <Tag color="orange" onClick={() => showTagList(data.companyId)}>
            {`+${intl.get(`spfm.companySearch.view.option.title.addTags`).d('添加标签')}`}
          </Tag>
          <Tag
            color="orange"
            ref={e => {
              this.more = e;
            }}
          >
            ...
          </Tag>
          {this.renderTag(data.supplierRelLabels, data.companyId)}
        </div>
      </Fragment>
    );
  }
}
