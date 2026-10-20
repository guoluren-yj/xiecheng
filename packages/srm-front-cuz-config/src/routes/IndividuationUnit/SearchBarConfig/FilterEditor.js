/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { connect } from 'dva';
import { Modal, Form } from 'hzero-ui';
import { Bind, Debounce } from 'lodash-decorators';

import TLEditor from 'components/TLEditor';
import intl from 'utils/intl';
import notification from 'utils/notification';

import { EditType } from '@/utils/constConfig';
import styles from './index.less';

@Form.create({ fieldNameProp: null })
@connect(({ loading }) => ({
  saveLoading: loading.effects['searchBarConfig/saveUnitFilter'],
  copyLoading: loading.effects['searchBarConfig/copyUnitFilter'],
}))
export default class FilterEditor extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
    this.state = {
      editType: false,
      title: null,
      filter: {},
    };
  }

  @Bind()
  handleClose() {
    const { form, onClose } = this.props;
    form.resetFields();
    onClose();
  }

  @Bind()
  handleOpenModal(editType, filter = {}) {
    this.setState({
      editType,
      filter,
      title: editType === EditType.CREATE ? intl.get('hpfm.searchBar.view.message.createFilter').d('新建筛选器')
        : editType === EditType.UPDATE ? intl.get('hpfm.searchBar.view.message.editFilter').d('编辑筛选器')
          : editType === EditType.COPY ? intl.get('hpfm.searchBar.view.message.copyFilter').d('复制筛选器')
            : null,
    });
  }

  @Bind()
  @Debounce(300)
  handleOk() {
    const { editType, filter } = this.state;
    const { form, dispatch, filterList = [], unitInfo = {}, onRefresh = () => {} } = this.props;
    const { id: unitId, unitCode } = unitInfo;
    form.validateFields((err, values) => {
      if (!err) {
        const newFilter = {
          ...filter,
          ...values,
          enabledFlag: 1,
          unitId,
          unitCode,
        };
        let newFilterList = filterList.filter(item => item.enabledFlag === 1);
        if (editType === EditType.UPDATE) {
          newFilterList = newFilterList.map(item => {
            if (item.filterId === filter.filterId) {
              return newFilter;
            } else {
              return item;
            }
          });
        } else {
          // 新建或复制都是在原启用list后增加元素
          newFilterList.push({
            ...newFilter,
            defaultFlag: 0,
          });
        }
        dispatch({
          type: editType === EditType.COPY ? 'searchBarConfig/copyUnitFilter' : 'searchBarConfig/saveUnitFilter',
          params: newFilterList,
        }).then(res => {
          if (res) {
            notification.success();
            this.handleClose();
            if (typeof onRefresh === 'function') {
              onRefresh();
            }
          }
        });
      }
    });
  }

  render() {
    const { title, filter = {} } = this.state;
    const {
      saveLoading = false,
      copyLoading = false,
      form: { getFieldDecorator = () => {} },
    } = this.props;
    const { filterName, _token } = filter;
    return (
      <Modal
        title={title}
        visible
        onOk={this.handleOk}
        onCancel={this.handleClose}
        okButtonProps={{
          loading: saveLoading || copyLoading,
        }}
        cancelButtonProps={{
          disabled: saveLoading || copyLoading,
        }}
      >
        <Form className={styles['searchBar-filter-modal-form']}>
          <Form.Item label={intl.get('hpfm.searchBar.model.searchBar.filterName').d('筛选器名称')}>
            {getFieldDecorator('filterName', {
              initialValue: filterName,
              rules: [
                {
                  required: true,
                  message: intl
                    .get('hzero.common.validation.notNull', {
                      name: intl.get('hpfm.searchBar.model.searchBar.filterName').d('筛选器名称'),
                    })
                    .d(
                      `${intl.get('hpfm.searchBar.model.searchBar.filterName').d('筛选器名称')}不能为空`
                    ),
                },
                {
                  max: 50,
                  message: intl.get('hzero.common.validation.max', {
                    max: 50,
                  }),
                },
              ],
            })(
              <TLEditor
                field="filterName"
                token={_token}
              />
            )}
          </Form.Item>
        </Form>
      </Modal>
    );
  }

}
