/**
 * FinanceInfo - 企业注册-附件信息
 * @date: 2018-7-9
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router-dom';
import { Button, Icon } from 'hzero-ui';
import { Table, DataSet, Cascader } from 'choerodon-ui/pro';
import { connect } from 'dva';
import Debounce from 'lodash-decorators/debounce';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import moment from 'moment';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { PRIVATE_BUCKET } from '_utils/config';
import { DEFAULT_DATE_FORMAT, DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import notification from 'utils/notification';
import attachmentDS from '../store/attachmentDS';

@formatterCollections({
  code: ['spfm.attachment', 'entity.attachment', 'sslm.common'],
})
@connect(({ attachment, loading, enterpriseLegal }) => ({
  attachment,
  enterpriseLegal,
  fetchLoading: loading.effects['attachment/fetchAttachment'],
}))
@withRouter
export default class AttachmentList extends PureComponent {
  /**
   * @param {object} props 属性
   */
  constructor(props) {
    super(props);
    this.state = {
      saving: false,
      // saveable: true, // 是否更新附件记录
    };
  }

  attachmentDS = new DataSet({
    ...attachmentDS(),
    autoQuery: false,
    transport: {
      destroy: ({ data }) => {
        this.handleDeleteAttachment(data);
      },
    },
  });

  /**
   * 组件挂载后执行方法
   */
  componentDidMount() {
    const { dispatch, onRef } = this.props;
    if (onRef) onRef(this);
    this.refresh();
    dispatch({
      type: 'attachment/fetchAttachmentType',
      payload: {
        'SPFM.COMPANY.ATTACHMENT_TYPE': 1,
        'SPFM.COMPANY.SUB_ATTACHMENT': 2,
      },
    });
  }

  /**
   * 渲染行
   * @returns
   */
  @Bind()
  handlecolumns() {
    return [
      {
        name: 'attachmentTypeMerge',
        width: 220,
        tooltip: 'none',
        editor: (record) => {
          return (
            <Cascader
              style={{ width: '100%' }}
              onChange={(data) => {
                if (data && data.length) {
                  record.set('attachmentType', data[0]);
                  record.set('subAttachment', data[1]);
                } else {
                  record.set('attachmentType', null);
                  record.set('subAttachment', null);
                }
              }}
              expandTrigger="hover"
              placeholder=""
            />
          );
        },
      },
      {
        name: 'description',
        width: 150,
        editor: true,
      },
      {
        name: 'endDate',
        width: 150,
        editor: true,
      },
      {
        name: 'longEffectiveFlag',
        width: 150,
        editor: true,
      },
      {
        name: 'uploadDate',
        width: 150,
        editor: true,
      },
      {
        name: 'attachmentUuid',
        width: 150,
        renderer: ({ value, record }) => {
          return (
            <div>
              <UploadModal
                uploadSuccess={() => this.setLastUploadTime(record)}
                attachmentUUID={value}
                afterOpenUploadModal={(uuid) => this.handleUuid(record, uuid)}
                removeCallback={() => this.setLastUploadTime(record)}
                bucketName={PRIVATE_BUCKET}
                bucketDirectory="spfm-comp"
                filePreview
                fileSize={500 * 1024 * 1024}
                // filesNumber={record.attachmentCount}
              />
            </div>
          );
        },
      },
      {
        name: 'remark',
        width: 200,
        editor: true,
      },
    ];
  }

  /**
   * 刷新数据
   */
  @Bind()
  refresh() {
    const { dispatch, companyId } = this.props;
    if (companyId && companyId !== 'undefined') {
      const payload = {
        companyId,
      };
      dispatch({
        type: 'attachment/fetchAttachment',
        payload,
      }).then(() => {
        const {
          attachment: { data = [] },
        } = this.props;
        this.attachmentDS.loadData(data);
      });
    }
  }

  /**
   * 删除
   * @memberof FinanceInfo
   */
  @Bind()
  handleDeleteAttachment(data = []) {
    const { dispatch, companyId } = this.props;

    const deleteRows = data.map((ele) => {
      const { endDate, ...other } = ele;
      return other;
    });

    dispatch({
      type: 'attachment/deleteAttachment',
      payload: {
        deleteRows,
        companyId,
      },
    }).then((response) => {
      if (response) {
        this.refresh();
        notification.success();
      }
    });
  }

  @Bind()
  handlePrevious() {
    const { previousCallback } = this.props;
    if (previousCallback) {
      previousCallback();
    }
  }

  /**
   * 处理要保存的数据
   */
  @Bind()
  async handleSaveData(callback) {
    const validateFlag = await this.attachmentDS.validate();
    if (this.attachmentDS.dirty) {
      if (validateFlag) {
        const data = this.attachmentDS.toJSONData();
        this.handleSave(data, callback);
      } else {
        notification.error({
          message: intl.get('sslm.common.view.message.maintainInfo').d('请维护相关信息！'),
        });
      }
    } else {
      notification.warning({
        message: intl.get('spfm.attachment.view.message.noNeedSaveData').d('暂无需要保存的数据！'),
      });
    }
  }

  /**
   * 批量保存数据
   */
  @Bind()
  handleSave(saveData, callback) {
    const { dispatch, companyId, domesticForeignRelation } = this.props;

    let uuidExisted = true;
    // 判断每一行记录是否都有上传
    // const hasNoFileRecord = data && data.find(d => d.attachmentCount === 0);
    const hasNoAttachmentNotice = () => {
      notification.error({
        message: intl.get('spfm.attachment.view.message.error').d('附件未上传!'),
      });
    };
    // 下一步-保存-跳转页面
    const saveAndJumpNext = (arr) => {
      dispatch({
        type: 'attachment/addAttachment',
        payload: {
          arr,
          companyId,
        },
      }).then((response) => {
        if (Array.isArray(response)) {
          this.refresh();
          notification.success();
          if (callback) {
            callback();
          }
        }
      });
    };
    // 若有附件才可以跳下一步，否则提示上传附件
    if (Array.isArray(saveData)) {
      const arr = saveData.map((param) => {
        // 附件 uuid 和 对应的时间戳才能判断是否有附件
        const editData = saveData.find((row) => {
          return row.attachmentUuid === param.attachmentUuid && !isUndefined(param.uploadDate);
        });
        uuidExisted = !!editData;
        const {
          description,
          uploadDate,
          attachmentType,
          subAttachment,
          companyAttachmentId,
          remark,
          longEffectiveFlag,
        } = param;
        if (!companyAttachmentId) {
          return {
            description,
            uploadDate,
            attachmentType,
            subAttachment,
            attachmentUuid: editData ? editData.attachmentUuid : editData,
            endDate: param.endDate
              ? moment(param.endDate).format(DEFAULT_DATE_FORMAT)
              : param.endDate,
            remark,
            longEffectiveFlag,
          };
        } else {
          return {
            description,
            uploadDate,
            companyAttachmentId,
            attachmentType,
            subAttachment,
            attachmentUuid: editData ? editData.attachmentUuid : editData,
            objectVersionNumber: param.objectVersionNumber,
            endDate: param.endDate
              ? moment(param.endDate).format(DEFAULT_DATE_FORMAT)
              : param.endDate,
            remark,
            longEffectiveFlag,
          };
        }
      });
      if (saveData.length !== 0 && uuidExisted) {
        saveAndJumpNext(arr);
      } else {
        // 境内可以不传
        if (Number(domesticForeignRelation) === 1) {
          hasNoAttachmentNotice();
          // callback();
          return;
        }
        hasNoAttachmentNotice();
      }
    }
  }

  /**
   * 跳转下一页
   */
  @Debounce(500)
  saveAndNext() {
    const { callback } = this.props;
    const attachmentList = this.attachmentDS.toData();
    if (attachmentList.length > 0) {
      if (this.attachmentDS.created.length || this.attachmentDS.updated.length) {
        this.handleSaveData(callback);
      } else if (callback) {
        callback();
      }
    } else if (attachmentList.length === 0) {
      // 境内阔以不传
      if (callback) {
        callback();
      }
    }
  }

  /**
   * 规范上传列表类型数据
   * @param {object} response 返回数据
   * @returns
   */
  @Bind()
  changeFileList(response) {
    return response.map((res, index) => {
      return {
        uid: index + 1,
        name: res.fileName,
        status: 'done',
        url: res.fileUrl,
      };
    });
  }

  /**
   * 控制uuid
   * @param {object} record 行数据
   * @param {string} uuid 唯一编码
   */
  @Bind()
  handleUuid(record, uuid) {
    record.set('attachmentUuid', uuid);
  }

  /**
   * 设置最新更新时间
   * @param {object} record 行数据
   */
  @Bind()
  setLastUploadTime(record) {
    const time = moment();
    record.set(`uploadDate`, time.format(DEFAULT_DATETIME_FORMAT));
  }

  /**
   * 渲染方法
   * @returns
   */
  render() {
    const {
      fetchLoading,
      buttonText = intl.get('hzero.common.button.save').d('保存'),
      showButton = true,
      previousCallback,
      backBtnText = intl.get('hzero.common.button.previous').d('上一步'),
    } = this.props;
    const { saving } = this.state;
    const columns = this.handlecolumns();
    return (
      <div>
        <Table
          rowHeight={40}
          loading={fetchLoading}
          buttons={['add', ['save', { afterClick: () => this.handleSaveData() }], 'delete']}
          dataSet={this.attachmentDS}
          columns={columns}
          pagination={false}
        />
        <div style={{ marginTop: 40, textAlign: 'right' }}>
          {previousCallback && (
            <Button type="primary" ghost onClick={this.handlePrevious} style={{ marginRight: 16 }}>
              {backBtnText}
            </Button>
          )}
          {showButton && (
            <Button type="primary" onClick={this.saveAndNext.bind(this)}>
              {saving && <Icon type="loading" />}
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    );
  }
}
