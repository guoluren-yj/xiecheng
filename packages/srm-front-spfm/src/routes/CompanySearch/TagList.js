/**
 * ModifyGroupModel - 修改分组
 * @date: 2019-07-03
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component, Fragment } from 'react';
import { Modal, Spin, Tag } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { map } from 'lodash';

import formatterCollections from 'utils/intl/formatterCollections';

const { CheckableTag } = Tag;
@formatterCollections({ code: ['spfm.companySearch'] })
@connect(({ loading, companySearchSupplier }) => ({
  loadingQuerySupplierCategory: loading.effects['companySearchSupplier/querySupplierCategory'],
  companySearch: companySearchSupplier,
}))
export default class TagList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedTags: [],
    };
  }

  componentDidMount() {
    const { companyId } = this.props;
    this.handleTags(companyId);
  }

  /**
   * 查询标签
   */
  @Bind()
  handleTags(companyId) {
    const { dispatch } = this.props;
    dispatch({
      type: `companySearchSupplier/querySupplierCategory`,
      payload: { companyId },
    }).then((res) => {
      const keyList = [];
      if (res) {
        res.forEach((item) => {
          if (item.supplierLabelFlag === 1) {
            keyList.push(item.categoryId);
          }
        });
        this.setState({
          selectedTags: keyList,
        });
      }
    });
  }

  @Bind()
  handleChange(checked, categoryId) {
    const { selectedTags = [] } = this.state;
    if (checked && selectedTags.indexOf(categoryId) === -1) {
      selectedTags.push(categoryId);
    } else {
      selectedTags.splice(selectedTags.indexOf(categoryId), 1);
    }
    this.setState({
      selectedTags,
    });
  }

  render() {
    const { visibleTagList, onCancel, tagList = [], onSaveTags, companyId, loading } = this.props;
    const { selectedTags } = this.state;
    return (
      <Fragment>
        <Modal
          destroyOnClose
          width={700}
          onCancel={onCancel}
          visible={visibleTagList}
          title={intl.get(`spfm.companySearch.view.option.title.selectTags`).d('选择标签')}
          onOk={() => onSaveTags(selectedTags, companyId)}
        >
          <Spin spinning={loading}>
            {map(tagList, (tag) => {
              return (
                tag.categoryDescription && (
                  <CheckableTag
                    value={tag.categoryId}
                    key={tag.categoryId}
                    checked={selectedTags.indexOf(tag.categoryId) > -1}
                    onChange={(checked) => this.handleChange(checked, tag.categoryId)}
                  >
                    {tag.categoryDescription.length > 8
                      ? `${tag.categoryDescription.slice(0, 8)}...`
                      : tag.categoryDescription}
                  </CheckableTag>
                )
              );
            })}
            {/* <TagSelect onChange={e => this.handleFormSearch(e)}>
              {map(tagList, tag => {
                return (
                  <TagSelect.Option
                    value={tag.categoryId}
                    key={tag.categoryId}
                    checked={selectedTags.indexOf(tag.categoryId) > -1}
                  >
                    {tag.categoryDescription.length > 8
                      ? `${tag.categoryDescription.slice(0, 8)}...`
                      : tag.categoryDescription}
                  </TagSelect.Option>
                );
              })}
            </TagSelect> */}
          </Spin>
        </Modal>
      </Fragment>
    );
  }
}
