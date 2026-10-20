import React, { Component } from 'react';
import { Player } from 'video-react';
import { Bind } from 'lodash-decorators';
import { observer, Observer } from 'mobx-react-lite';
import { observable } from 'mobx';
import { isString } from 'lodash';
import { Upload } from 'choerodon-ui';
import { Spin, Form, Icon, Lov, Output, Tooltip, CheckBox } from 'choerodon-ui/pro';
import { withRouter } from 'react-router-dom';

import intl from 'utils/intl';
import { API_HOST } from 'utils/config';
import notification from 'utils/notification';
import { getAccessToken, getResponse, getCurrentOrganizationId } from 'utils/utils';
import c7nModal from '@/utils/c7nModal';
import { openCatalog, openCategory } from '@/routes/pageTree';
import { PUBLIC_BUCKET } from '_utils/config';
import SupplierHocLov from '@/components/SupplierHocLov';
import Image from '@/components/Image';
import OverflowTip from '@/components/OverflowTip';

import CropperUpload from '../CropperUpload';
import Detail from '../../CustomTemplate/Detail';

import { fetchCategory, fetchOtherCategory } from '../api';
import customStore from '../customStore';

import styles from './index.less';

const organizationId = getCurrentOrganizationId();

@withRouter
export default class BaseInfo extends Component {
  croperModal;

  state = {
    isGetDefaultCategoryId: false,
    systemDefaultCategory: null,
  };

  // state 会刷新组件，导致上传视频错误
  videoLoading = observable.box(false);

  componentDidMount() {
    // 个性化 平台分类默认值渲染后，强制更新，渲染sku
    this.forceUpdate();
  }

  componentDidUpdate() {
    const { formDs } = this.props;
    const { isGetDefaultCategoryId, systemDefaultCategory } = this.state;
    const isReceive = customStore.getState('isReceive');
    if (formDs && formDs.current) {
      const { categoryId, spuId } = formDs.current.get(['categoryId', 'spuId']);
      // 新建时，有租户个性化默认值
      if (!isGetDefaultCategoryId && categoryId && !spuId) {
        const field = formDs.getField('categoryLov');
        this.handleCategoryChange({ categoryId });
        //  阻止Lov弹窗弹两次
        field.set('lovCode', null);
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({
          isGetDefaultCategoryId: true,
        });
      }
      // 领用新建 无租户自定义默认值，走系统统一设置平台分类默认值 - 990000001101-其他
      if (!spuId && isReceive && !categoryId && !systemDefaultCategory) {
        fetchOtherCategory().then((res) => {
          const { categoryPath, categoryId: id } = (res?.content || [])?.[0] || {};
          this.setState(
            {
              systemDefaultCategory: {
                categoryPath,
                categoryId: id,
              },
            },
            () => {
              formDs.current.set('categoryLov', this.state.systemDefaultCategory || {});
              this.handleCategoryChange({ categoryId: id });
            }
          );
        });
      }
    }
  }

  @Bind()
  beforeVideoUpload(file) {
    this.videoLoading.set(true);
    if (file.size > 50 * 1024 * 1024) {
      notification.error({
        message: intl.get('smpc.productPublish.view.uploadVideoLimitSize').d('视频最大为50M'),
      });
      this.videoLoading.set(false);
      return false;
    }
    if (file.type !== 'video/mp4') {
      notification.error({
        message: intl.get('smpc.productPublish.view.uploadVideoLimitType').d('视频格式仅支持mp4'),
      });
      this.videoLoading.set(false);
      return false;
    }
    return true;
  }

  @Bind()
  uploadImageSuccess(images) {
    const { imagePath, thumbnailPath } = images?.[0] || {};
    const { formDs } = this.props;
    if (imagePath && formDs) {
      formDs.records[0].set('primaryImagePath', imagePath); // 原图
      formDs.records[0].set('largePrimaryImagePath', imagePath); // 原图
      formDs.records[0].set('primaryThumbnailImagePath', thumbnailPath); // 缩略图
    }
  }

  @Bind()
  uploadVideoSuccess(fileObj, record) {
    const { file } = fileObj;
    const { status, response } = file;
    const flag = file.response && !file.response.failed && isString(file.response);
    if (flag) {
      if (status === 'done') {
        this.videoLoading.set(false);
        record.set('primaryVideoPath', response);
      }
    } else if (file.response && file.response.failed) {
      this.videoLoading.set(false);
    }
  }

  @Bind()
  renderImage(record, noEdit = false) {
    const value = (record && record.get('primaryImagePath')) || '';
    return value ? (
      <div className="product-img-style" style={{ marginRight: 20 }}>
        <Image value={value} width={128} height={128} />
        <div className="img-btn">
          <a
            href={record.get('largePrimaryImagePath') || value}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon type="visibility-o" />
          </a>
          {!noEdit && (
            <Icon
              type="delete"
              onClick={() => {
                record.set('primaryImagePath', null);
                record.set('largePrimaryImagePath', null);
                record.set('primaryThumbnailImagePath', null);
              }}
            />
          )}
        </div>
      </div>
    ) : (
      <div style={{ marginRight: 20, height: 130 }}>
        <CropperUpload
          maxSize={{
            storageSize: 30,
            storageUnit: 'MB',
          }}
          onSuccess={this.uploadImageSuccess}
          text={intl.get('smpc.product.button.uploadPrimaryImage').d('上传主图')}
          title={intl.get('smpc.product.model.productImage').d('商品图片')}
        />
      </div>
    );
  }

  @Bind()
  renderVideo(record, noEdit = false) {
    const value = (record && record.get('primaryVideoPath')) || '';
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const action = `${API_HOST}/hfle/v1/${organizationId}/files/multipart`;
    return value ? (
      <div className="product-img-style">
        <Player muted className="video" playsInline src={value} />
        <div className="video-play-btn">
          <Icon type="baseline-arrow_right" />
        </div>
        <div className="img-btn">
          <a href={value} target="_blank" rel="noopener noreferrer">
            <Icon type="visibility-o" />
          </a>
          {!noEdit && (
            <Icon
              type="delete"
              onClick={() => {
                record.set('primaryVideoPath', null);
              }}
            />
          )}
        </div>
      </div>
    ) : (
      <Observer>
        {() => (
          <Spin spinning={this.videoLoading.get()}>
            <Upload
              disabled={noEdit || value}
              action={action}
              data={{ bucketName: PUBLIC_BUCKET, directory: 'smpc/sku/media' }}
              headers={headers}
              listType="picture-card"
              showUploadList={false}
              accept="video/mp4"
              onChange={(fileObj) => this.uploadVideoSuccess(fileObj, record)}
              beforeUpload={this.beforeVideoUpload}
            >
              <div>
                <Icon type="add" />
                <div className="c7n-upload-text">
                  {intl.get('smpc.product.button.uploadVideo').d('上传视频')}
                </div>
              </div>
            </Upload>
          </Spin>
        )}
      </Observer>
    );
  }

  @Bind()
  renderInput({ value }) {
    return (
      <span title={value} className="over-ellipsis">
        {value || ' '}
      </span>
    );
  }

  @Bind
  handleCategoryChange(item) {
    const { getAttrs = (e) => e } = this.props;
    getAttrs(item?.categoryId);
  }

  @Bind
  async changeCategory(catalogId) {
    const { formDs } = this.props;
    const res = getResponse(await fetchCategory(catalogId));
    if (res && res[0]) {
      if (formDs) {
        formDs.current.set('categoryLov', {
          categoryId: res[0].categoryId,
          categoryPath: res[0].categoryPath || res[0].categoryName,
        });
      }
      this.handleCategoryChange(res[0]);
    }
  }

  // 编辑/修改/新建
  @Bind
  handleEditCustomAttr(record, spuId) {
    const title = intl.get('smpc.product.view.editCustomAttr').d('编辑定制品属性');
    c7nModal({
      title,
      style: { width: 1090 },
      children: (
        <Detail spuId={spuId} entrance="spu" afterSave={() => record.set('customFlag', 1)} />
      ),
    });
  }

  getUrlParm(paramStr = '', key = '') {
    const arr = paramStr.split('?')[1].split('&');
    let result;
    arr.forEach((item) => {
      const [paramKey, paramVal] = item.split('=');
      if (key === paramKey) {
        result = paramVal;
      }
    });
    return result;
  }

  handleViewCustomAttr = () => {
    const { spuId } = this.props;
    const title = intl.get('smpc.product.view.customInfo').d('定制品信息');
    c7nModal({
      title,
      style: { width: 1090 },
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      children: <Detail readOnly spuId={spuId} entrance="spu" />,
    });
  };

  render() {
    const {
      spuId,
      formDs,
      isSup,
      noEdit = false,
      dataError = true,
      approveField = [],
      onSupplierChange = (e) => e,
      updateFieldRequired = () => null,
    } = this.props;
    const { customizeForm } = customStore.getCustFuncs();
    // 商品图片不可编辑
    const imgNoEdit = noEdit || approveField.includes('SPEC_INFO_ITEM_IMAGE');
    // 平台分类不可编辑
    const catgegoryNoEdit = noEdit || approveField.includes('BASE_INFO_PLATFORM_CATEGORY');
    const PrimaryImageAndVideo = observer(({ dataSet }) => {
      return (
        <>
          <div className="primaryPath">
            {this.renderImage(dataSet && dataSet.records[0], imgNoEdit)}
            {this.renderVideo(dataSet && dataSet.records[0], imgNoEdit)}
          </div>
          <OverflowTip overflow2>
            <p className="file-help-info">
              {intl
                .get('smpc.product.view.helpInfo1')
                .d('图片和视频均只能上传一个，主图会在商品列表显示，视频会在视频详情显示；')}
              {intl
                .get('smpc.product.view.helpInfo2')
                .d('图片支持PNG、JPG、JPEG格式，且不能大于30M；视频仅支持MP4格式，且不能大于50M')}
            </p>
          </OverflowTip>
        </>
      );
    });
    const customFlag = formDs && formDs.toData()[0].customFlag;
    const isReceive = customStore.getState('isReceive');

    return (
      <Spin spinning={dataError}>
        <div className={styles['base-info-container']}>
          {formDs &&
            customizeForm(
              { code: customStore.getCustomCode('BASE_INFO'), enableEmpty: true },
              <Form
                dataSet={formDs}
                useWidthPercent
                columns={3}
                labelLayout="float"
                style={{ marginRight: 60 }}
              >
                <Lov
                  clearButton={false}
                  name="categoryLov"
                  disabled={catgegoryNoEdit}
                  onClick={() => {
                    openCategory({
                      drawer: false,
                      name: 'categoryLov',
                      record: formDs.current,
                      onChange: (item) => {
                        this.handleCategoryChange(item);
                      },
                    });
                  }}
                />
                <Lov
                  clearButton={false}
                  name="catalogLov"
                  onClick={() => {
                    openCatalog({
                      drawer: false,
                      name: 'catalogLov',
                      record: formDs.current,
                      onChange: (item) => {
                        if (!spuId && item) {
                          this.changeCategory(item.catalogId);
                          updateFieldRequired();
                        }
                      },
                    });
                  }}
                />
                {/* 上传图片视频 */}
                <Output
                  name="image"
                  rowSpan={4}
                  renderer={() => <PrimaryImageAndVideo dataSet={formDs} />}
                />
                {isSup ? (
                  <Lov
                    name="supplierLov"
                    onChange={(item) => {
                      onSupplierChange(item);
                      if (item?.supplierCompanyId) {
                        updateFieldRequired();
                      }
                    }}
                  />
                ) : isReceive ? (
                  <div />
                ) : (
                  <SupplierHocLov
                    name="supplierLov"
                    dataSet={formDs}
                    oldLovFieldsProps={[
                      {
                        name: 'supplierLov',
                        lovCode: 'SMPC.SELF_PUR_SUPPLIER',
                        textField: 'supplierName',
                        valueField: 'supplierId',
                      },
                      {
                        name: 'supplierCompanyId',
                        bind: `supplierLov.supplierId`,
                      },
                      {
                        name: 'supplierCompanyName',
                        bind: `supplierLov.supplierName`,
                      },
                    ]}
                    onChange={(item) => {
                      onSupplierChange(item);
                      if (item?.supplierCompanyId) {
                        updateFieldRequired();
                      }
                    }}
                  />
                )}

                {isReceive ? (
                  <div />
                ) : (
                  <Lov
                    name="companyLov"
                    modalProps={{ title: intl.get('smpc.product.model.purchaser').d('采购方') }}
                    onChange={(item) => {
                      if (item?.companyId) {
                        updateFieldRequired();
                      }
                    }}
                  />
                )}
                <Output
                  name="customFlag"
                  renderer={({ record }) => {
                    if (isReceive) return <div />;
                    if (isSup) {
                      if (!customFlag) return <div />;
                      if (record) {
                        return (
                          <a
                            style={{ position: 'relative', top: 5, fontWeight: 600 }}
                            disabled={!spuId}
                            onClick={() => this.handleViewCustomAttr(record)}
                          >
                            {intl.get('smpc.product.model.CustomAttr').d('定制品属性')}
                          </a>
                        );
                      }
                    }
                    if (!isSup && record) {
                      const customDisabled = !spuId || !record.get('customFlag');
                      return (
                        <div>
                          <Tooltip title={intl.get('smpc.product.view.checkApply').d('勾选应用')}>
                            <CheckBox
                              name="customFlag"
                              style={{ marginRight: 8, backgroundColor: 'transparent' }}
                              disabled={!spuId}
                            />
                          </Tooltip>
                          <Tooltip
                            title={
                              !spuId && intl.get('smpc.product.model.saveInfo').d('保存后即可编辑')
                            }
                          >
                            <a
                              // disabled={!spuId || !record.get('customFlag')}
                              style={{ position: 'relative', top: 5, fontWeight: 600 }}
                              className={customDisabled && styles['custom-disabled']}
                              onClick={() =>
                                !customDisabled && this.handleEditCustomAttr(record, spuId)
                              }
                            >
                              {intl.get('smpc.product.model.editCustomAttr').d('编辑定制品属性')}
                            </a>
                          </Tooltip>
                        </div>
                      );
                    }
                  }}
                />
                {!isReceive && <Lov name="purchaseLov" />}
                <Output name="b" className={styles['empty-output']} />
                <Output name="c" className={styles['empty-output']} />
              </Form>
            )}
        </div>
      </Spin>
    );
  }
}
