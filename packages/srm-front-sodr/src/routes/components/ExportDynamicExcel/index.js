/**
 * ExportDynamicExcel - 动态导出excel
 * @date: 2021-03-17
 * @author: mjq<jiaqi.mao@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { PureComponent, Fragment } from 'react';
import { DataSet, Form, TextField, Tree, Select, Button, Modal } from 'choerodon-ui/pro';
import { Divider } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isArray } from 'lodash';

import intl from 'utils/intl';
import notification from 'utils/notification';

import { basicFormDS, dynamicColDS } from './exportDS';
import style from './index.less';

const { Option } = Select;
const modalKey = Modal.key();

/**
 *
 * @param {Object} res - 树形数据结构
 * @returns {Array} - 平铺数据结构
 */
function dealWithData(res) {
  const temp = [];
  const loop = (item = {}) => {
    temp.push(item); // 先放进外层对象
    if (isArray(item.children)) {
      item.children.forEach((_item) => {
        loop(_item);
      });
    }
  };
  loop(res);
  return temp;
}

/**
 * 纯组件 - 展示型组件
 * @extends {PureComponent} React.PureComponent
 * @reactProps {string} [requestUrl=''] - 请求的url
 * @reactProps {Object} [queryParams={}] - 查询的参数
 * @return React.element
 */
export default class ExportDynamicExcel extends PureComponent {
  basicFormDS = new DataSet(basicFormDS());

  dynamicColDS = new DataSet(dynamicColDS());

  modalRef;

  async componentDidMount() {
    // this.basicFormDS.loadData();
    // const res = await this.dynamicColDS.query();
  }

  /**
   * 渲染节点
   */
  renderNode({ record }) {
    return record.get('fieldName');
  }

  /**
   * 渲染基础表单form
   */
  renderBasicForm() {
    const { enableAsync = true } = this.props;
    return (
      <Form
        dataSet={this.basicFormDS}
        columns={2}
        // useColon
      >
        <TextField name="fileName" />
        {/* <Select name="fillerType" /> */}
        <Select name="async" disabled={!enableAsync}>
          <Option value="false" key="false">
            {intl.get('hzero.common.status.no').d('否')}
          </Option>
          <Option value="true" key="true">
            {intl.get('hzero.common.status.yes').d('是')}
          </Option>
        </Select>
        {/* <NumberField name="singleExcelMaxSheetNum" />
        <NumberField name="singleSheetMaxRow" /> */}
      </Form>
    );
  }

  /**
   * 渲染树形动态列
   */
  renderDynamicCol() {
    return (
      <Tree
        dataSet={this.dynamicColDS}
        checkable
        defaultExpandAll
        // checkField='isChecked'
        renderer={this.renderNode}
      />
    );
  }

  /**
   * 打开导出弹窗
   */
  @Bind()
  async handleShowModal() {
    const {
      requestUrl,
      queryParams: {
        params,
        templateCode,
        // selectedRowKeys = [], // 此刻形成了闭包, 变量释放不成功
        searchType,
        statusConfigId,
      },
      feedbackIds,
    } = this.props;
    if (!this.basicFormDS.current) {
      this.basicFormDS.create({});
    }
    const onOk = async () => {
      // if (!await this.dynamicColDS.validate()) return false; // 校验不通过则直接return
      try {
        const shieldDimCodeList = this.dynamicColDS.records
          .filter((item) => item && !item.toData().isChecked)
          .map((item) => item.toData().fieldCode); // 为勾选数据
        if (shieldDimCodeList.length === this.dynamicColDS.records.length) {
          notification.warning({
            message: intl.get('sodr.common.message.validation.atLeast').d('请至少勾选一列导出'),
          });
          return false;
        }
        if (this.modalRef) {
          this.modalRef.update({
            okProps: {
              loading: true,
            },
          });
        }
        const basicInfo = this.basicFormDS.current.toData();
        // const { selectedRowKeys = [] } = this.getLatestParams(); // 获取最新的参数
        if (feedbackIds) {
          this.basicFormDS.setQueryParameter('queryParams', {
            // viewCode,
            params,
            basicInfo,
            // queryData,
            requestUrl,
            templateCode,
            // selectedRowKeys,
            shieldDimCodeList,
            feedbackIds,
            searchType,
            statusConfigId,
          });
        } else {
          this.basicFormDS.setQueryParameter('queryParams', {
            // viewCode,
            params,
            basicInfo,
            // queryData,
            requestUrl,
            templateCode,
            // selectedRowKeys,
            shieldDimCodeList,
            searchType,
            statusConfigId,
          });
        }
        const res = await this.basicFormDS.query();
        this.downloadFile(res && res.feedBackExportUrl, basicInfo.async);
      } catch (e) {
        // error统一处理
      } finally {
        if (this.modalRef) {
          this.modalRef.update({
            okProps: {
              loading: false,
            },
          });
        }
      }
      return false;
    };
    if (this.modalRef) {
      this.modalRef.open();
      this.modalRef.update({ onOk });
    } else {
      this.modalRef = Modal.open({
        key: modalKey,
        title: intl.get('sodr.common.view.message.title.exportExcel').d('导出Excel'),
        style: {
          width: 550,
        },
        children: (
          <div className={style.container}>
            {this.renderBasicForm()}
            <Divider />
            <div className={style['sub-title']}>
              <span>
                {intl.get('sodr.common.view.message.chooseExportColumns').d('选择要导出的列')}
              </span>
            </div>
            {this.renderDynamicCol()}
          </div>
        ),
        // okProps: {
        //   loading,
        // },
        onOk,
        // onCancel: () => true,
        afterClose: () => {
          this.basicFormDS.reset();
          this.dynamicColDS.reset();
        },
      });
      this.dynamicColDS.setQueryParameter('queryParams', {
        requestUrl,
        templateCode,
        searchType,
        statusConfigId,
      });
      const result = await this.dynamicColDS.query();
      this.dynamicColDS.loadData(dealWithData(result));
    }
  }

  /**
   * 通过url下载文件
   * @param {string} url - download url
   * @param {string} fileName - download fileName
   */
  downloadFile(url, async) {
    if (async === 'true') {
      setTimeout(() => {
        notification.success({
          message: intl
            .get('sodr.common.message.operation.asyncExportSuccess')
            .d('操作成功, 请至文件汇总页面查看'),
        });
      }, 1000);
    } else {
      const a = document.createElement('a');
      if (url) {
        a.href = url;
        a.click();
      } else {
        notification.success({
          message: intl.get('sodr.common.message.query.temporarilyNoData').d('暂无数据'),
        });
      }
    }

    /**
     * @remember
     * 基于后端桶名由 `public` -> 'private'
     */

    // const downloadName = fileName
    //   ? `${fileName}.xls`
    //   : `${intl.get('sodr.common.message.export.priceLibraryDetail').d('价格库明细')}.xls`; // 或者取baseInfo中filename
    // fetch(url)
    //   .then((data) => data.blob())
    //   .then((blob) => {
    //     // IE兼容性处理
    //     if (window.navigator.msSaveOrOpenBlob) {
    //       window.navigator.msSaveOrOpenBlob(blob, downloadName);
    //     } else {
    //       const blobUrl = window.URL.createObjectURL(blob);
    //       const a = document.createElement('a');
    //       a.download = decodeURIComponent(downloadName);
    //       a.href = blobUrl;
    //       a.click();
    //     }
    //   });
  }

  render() {
    const { disabled = false, btnText } = this.props;
    return (
      <Fragment>
        <Button disabled={disabled} onClick={this.handleShowModal} icon="export">
          {btnText}
        </Button>
      </Fragment>
    );
  }
}
