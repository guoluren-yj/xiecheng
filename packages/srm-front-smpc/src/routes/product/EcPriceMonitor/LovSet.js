import React from 'react';
import { DataSet, Lov, Button } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react';
import intl from 'utils/intl';

export default class LovSet {
  lovRef;

  constructor(lovFieldProps, lovEvents) {
    this.lovFieldProps = lovFieldProps;
    this.lovEvents = lovEvents;
    this.lovDataSet = new DataSet({
      autoCreate: true,
      fields: [lovFieldProps],
    });
  }

  // lov实例，需挂载
  get comp() {
    return (
      <Lov
        viewMode="drawer"
        name={this.lovFieldProps?.name}
        dataSet={this.lovDataSet}
        ref={(ref) => {
          this.lovRef = ref;
        }}
        style={{ display: 'none' }}
        tableProps={{
          style: { maxHeight: `calc(100vh - 155px)` },
        }}
        modalProps={{
          footer: (ok, cancel) => [
            <Observer>
              {() => (
                <Button
                  color="primary"
                  disabled={this.lovRef.options.status !== 'ready'}
                  onClick={() => this.handleOk()}
                >
                  {intl.get('hzero.common.button.ok').d('确定')}
                </Button>
              )}
            </Observer>,
            cancel,
          ],
          afterClose: () => {
            this.lovDataSet.reset();
          },
        }}
      />
    );
  }

  // 打开弹窗
  get openModal() {
    const _handleOpenModal = () => {};
    return this.lovRef.handleOpenModal || _handleOpenModal;
  }

  closeModal() {
    if (this.lovRef.modal) {
      this.lovRef.modal.close();
    }
  }

  // 给当前lov设置选中值
  set(value) {
    this.lovDataSet.current.set(this.lovFieldProps.name, value);
  }

  getLovSelected() {
    if (this.lovRef?.options) {
      return this.lovRef.options.selected.map((m) => m.toData());
    }
  }

  async handleOk() {
    if (this.lovEvents?.onOk) {
      const lovSelects = this.getLovSelected();
      const isClose = await this.lovEvents.onOk(lovSelects);
      if (isClose !== false) {
        this.closeModal();
      }
    } else {
      this.closeModal();
    }
  }
}
