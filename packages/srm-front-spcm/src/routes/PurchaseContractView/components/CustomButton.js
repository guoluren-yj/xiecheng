import React, { Component } from 'react';
import { Bind } from 'lodash-decorators';
import { Button as PermissionButton } from 'components/Permission';
import { Modal } from 'choerodon-ui/pro';
import get from 'lodash/get';

export default class ScoreModal extends Component {
  componentDidMount() {
    window.addEventListener('message', this.handleSubmit);
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.handleSubmit);
  }

  @Bind()
  handleSubmit(e) {
    if (e.origin === window.location.origin) {
      if (e.data === 'ok') {
        this.props.handleSubmit({ openModal: true });
      }
      if (this.modal && this.modal.close) {
        this.modal.close();
        // Modal.destroyAll();
      }
    }
  }

  /**
   * 弹窗跳转其它的页面
   */
  @Bind()
  handleOpenModal() {
    const { data, headerInfo } = this.props;
    const newData = data.reduce((acc, Current) => {
      acc[Current.value] = Current.meaning;
      return acc;
    }, {});
    this.modal = Modal.open({
      title: newData.title || newData.name,
      drawer: true,
      closable: true,
      children: (
        <iframe
          title={newData.title || newData.name}
          frameBorder="0"
          style={{ height: '100%', width: '100%' }}
          id="iframeContentSpcm"
          src={`${window.location.origin}/${newData.url}?pcHeaderId=${headerInfo.pcHeaderId}`}
        />
      ),
      onCancel: () => {},
      footer: null,
    });
  }

  render() {
    const {
      data,
      handleSubmit,
      selectedRows = [],
      isList,
      disabled,
      headerInfo,
      ...restProps
    } = this.props;
    if ((Array.isArray(data) && data.length === 0) || !Array.isArray(data)) {
      return null;
    }
    const newData = data.reduce((acc, Current) => {
      acc[Current.value] = Current.meaning;
      return acc;
    }, {});

    const num = get(headerInfo, 'displayFlag4') || '';
    const mutiSelect = get(newData, 'mutiSelect') === 'isTrue';
    let mutiSelectDisable = true;
    if (isList) {
      mutiSelectDisable = mutiSelect ? selectedRows.length > 0 : selectedRows.length === 1;
    }
    return (
      <PermissionButton
        permissionList={[
          {
            code: 'srm.pc-admin.pc-purchaser.view.ps.custom.function',
            type: 'button',
            meaning: name,
          },
        ]}
        disabled={!(disabled && mutiSelectDisable)}
        {...restProps}
        onClick={() => {
          if (newData.type === 'openModel' && newData.url) {
            this.handleOpenModal();
          } else {
            handleSubmit({});
          }
        }}
      >
        {newData[`name${num}`]}
      </PermissionButton>
    );
  }
}
