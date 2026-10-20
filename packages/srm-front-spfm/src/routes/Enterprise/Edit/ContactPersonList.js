import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { isEmpty, isFunction } from 'lodash';
import { withRouter } from 'react-router-dom';
import { Table, DataSet, TelField } from 'choerodon-ui/pro';
import { Button } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import notification from 'utils/notification';
import { yesOrNoRender } from 'utils/renderer';

import contactPersonDS from '../store/contactPersonDS';

const NAME_SPACE = 'enterpriseContactPerson';

@connect((models) => ({
  contactPerson: models[NAME_SPACE],
  queryLoading: models.loading.effects[`${NAME_SPACE}/fetchBatchEnums`],
  createContactPersonsLoading:
    models.loading.effects['enterpriseContactPerson/createContactPersons'],
  updateContactPersonsLoading:
    models.loading.effects['enterpriseContactPerson/updateContactPersons'],
}))
@formatterCollections({ code: 'spfm.contactPerson' })
@withRouter
export default class ContactPersonList extends PureComponent {
  state = {};

  contactPersonDS = new DataSet({
    ...contactPersonDS(),
    autoQuery: false,
    events: {
      update: ({ record, name, value }) => {
        if (name === 'defaultFlag') {
          if (value === 1) {
            record.set('enabledFlag', 1);
          }
        }
        if (name === 'internationalTelCode') {
          record.set('mobilephone', null);
        }
      },
    },
    transport: {
      destroy: ({ data }) => {
        this.remove(data);
      },
      submit: ({ dataSet, data }) => {
        if (!dataSet.destroyed.length) {
          this.handleEditFormSave(data);
        }
      },
    },
  });

  componentDidMount() {
    const { onRef } = this.props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    this.init();
  }

  loadContactPersonList() {
    const { dispatch, companyId } = this.props;
    const { init } = this.state;
    if (companyId && companyId !== 'undefined') {
      dispatch({
        type: `${NAME_SPACE}/queryContactPerson`,
        payload: companyId,
      }).then((contactList) => {
        this.contactPersonDS.loadData(contactList);
        this.setState({
          init: !init,
        });
      });
    }
  }

  /**
   * 加载 证件的值集 和 公司所有的联系人
   */
  init() {
    this.loadContactPersonList();
  }

  @Bind()
  async saveAndNext() {
    const { companyId, dispatch, callback } = this.props;
    const flag = await this.contactPersonDS.validate();
    if ((this.contactPersonDS.created.length || this.contactPersonDS.updated.length) && flag) {
      const goToNext = () => {
        dispatch({
          type: `${NAME_SPACE}/verification`,
          payload: {
            companyId,
          },
        }).then((res) => {
          if (res) {
            if (callback) {
              callback();
            }
          }
        });
      };
      const data = this.contactPersonDS.toJSONData();
      this.handleEditFormSave(data, goToNext);
    } else if (flag) {
      dispatch({
        type: `${NAME_SPACE}/verification`,
        payload: {
          companyId,
        },
      }).then((res) => {
        if (res) {
          if (callback) {
            callback();
          }
        }
      });
    }
  }

  @Bind()
  handleEditFormSave(data, callback) {
    const { companyId, dispatch } = this.props;
    const allData = this.contactPersonDS.toData();
    // 启用的数据
    const enabledData = allData.filter((e) => e.enabledFlag);
    // 启用行的默认联系人
    const enabledDataDefault = enabledData.filter((e) => e.defaultFlag).length !== 1;
    // 所有行默认联系人
    const allDataDefault = allData.filter((e) => e.defaultFlag).length !== 1;
    if (!isEmpty(enabledData)) {
      if (enabledDataDefault || allDataDefault) {
        notification.error({
          message: intl
            .get('spfm.contactPerson.model.contactPerson.onlyDefault')
            .d('公司默认联系人必须有且仅有一个,请及时修改'),
        });
        return;
      }
    }
    Promise.all(
      data.map((item) => {
        if (item.companyContactId) {
          return dispatch({
            type: `${NAME_SPACE}/updateContactPersons`,
            payload: {
              companyContact: item,
              companyId,
              companyContactId: item.companyContactId,
            },
          });
        } else {
          return dispatch({
            type: `${NAME_SPACE}/createContactPersons`,
            payload: { companyContact: item, companyId },
          });
        }
      })
    ).then((res) => {
      if (!res.find((e) => !e.success)) {
        notification.success();
        if (callback) {
          callback();
        }
      }
      this.loadContactPersonList();
    });
  }

  /**
   * 删除
   */
  @Bind()
  remove(deleteRows) {
    const { dispatch, companyId } = this.props;
    if (deleteRows.length > 0) {
      dispatch({
        type: `${NAME_SPACE}/deleteContactPerson`,
        payload: {
          deleteRows,
          companyId,
        },
      }).then((response) => {
        if (response) {
          this.loadContactPersonList();
          notification.success();
        }
      });
    } else {
      this.loadContactPersonList();
      notification.success();
    }
  }

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  render() {
    const {
      createContactPersonsLoading,
      updateContactPersonsLoading,
      queryLoading,
      buttonText,
      showButton,
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
      companyId,
    } = this.props;
    const buttonFlag = companyId && companyId !== 'undefined';
    const columns = [
      {
        name: 'name',
        width: 150,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      // {
      //   name: 'gender',
      //   width: 150,
      //   editor: (record) => {
      //     return record.status === 'add' || record.getState('editing');
      //   },
      // },
      {
        name: 'mail',
        width: 150,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        style: {
          wordBreak: 'break-all',
        },
      },
      {
        name: 'mobilephone',
        width: 200,
        editor: false,
        renderer: ({ record, name }) =>
          (record.status === 'add' || record.getState('editing')) && (
            <TelField record={record} name={name} />
          ),
      },
      {
        name: 'department',
        width: 150,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'position',
        width: 150,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'telephone',
        width: 150,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'description',
        width: 150,
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
      },
      {
        name: 'defaultFlag',
        editor: (record) => {
          return record.status === 'add' || record.getState('editing');
        },
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'enabledFlag',
        editor: (record) => {
          return (
            (record.status === 'add' || record.getState('editing')) &&
            record.get('defaultFlag') === 0
          );
        },
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'option',
        width: 180,
        renderer: ({ record }) => {
          if (record.status === 'add') {
            return (
              <a
                onClick={() => {
                  this.contactPersonDS.remove(record);
                }}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </a>
            );
          } else if (record.getState('editing')) {
            return (
              <a
                onClick={() => {
                  record.reset();
                  record.setState('editing', false);
                }}
              >
                {intl.get('hzero.common.button.cancel').d('取消')}
              </a>
            );
          } else {
            return (
              <a
                onClick={() => {
                  record.setState('editing', true);
                  record.set('option', 'edit');
                }}
              >
                {intl.get('hzero.common.button.edit').d('编辑')}
              </a>
            );
          }
        },
      },
    ];
    return (
      <React.Fragment>
        <Table
          rowHeight="auto"
          loading={updateContactPersonsLoading || queryLoading || createContactPersonsLoading}
          buttons={buttonFlag ? ['add', 'save', 'delete'] : []}
          dataSet={this.contactPersonDS}
          columns={columns}
          pagination={false}
        />
        {buttonFlag && (
          <div style={{ clear: 'both', marginTop: 40, textAlign: 'right' }}>
            {previousCallback && (
              <Button
                type="primary"
                ghost
                onClick={this.handlePrevious}
                style={{ marginRight: 16 }}
              >
                {backBtnText}
              </Button>
            )}
            {showButton && (
              <Button type="primary" style={{ marginBottom: '24px' }} onClick={this.saveAndNext}>
                {buttonText}
              </Button>
            )}
          </div>
        )}
      </React.Fragment>
    );
  }
}
