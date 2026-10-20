/* eslint-disable eqeqeq */
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { connect } from 'dva';
import uuid from 'uuid/v4';
import { compose, isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';

import notification from 'utils/notification';
import intl from 'utils/intl';
import {
  Form,
  TextField,
  Select,
  Lov,
  DataSet,
  ColorPicker,
  IntlField,
  CheckBox,
} from 'choerodon-ui/pro';
import { openUnitTree } from '@/components/UnitTreeModal';
import MultipleSelectionLov from '@/routes/ProductRecommended/ListModal/MultipleSelectionLov';
import { bannerds } from '../tableds';
import styles from '../index.less';
import UploadCrop from '../../../common/UploadCrop';
import HotConfig from '../../../HotConfig';
import { openSkuSelect } from '../../../../../modals';

const Banner = (props) => {
  const {
    mallHome: { currentRole, purchase, mallType },
    modal,
    dataSet,
    setBannerList,
    validateColor,
    getBackgroundColor,
  } = props;

  const mtpLovRecord = useRef();
  const [visible, setVisible] = useState(false);

  const bannerDs = useMemo(() => {
    return new DataSet(bannerds({ currentRole, unitId: purchase.unitId, mallType }));
  }, []);

  useEffect(() => {
    if (props.record) {
      const data = props.record.toData();
      if (data.bannerType == '1') {
        data.skuId = data.productGroupId;
        data.skuName = data.productGroupName;
      }
      bannerDs.loadData([data]);
      bannerDs.forEach((r) => {
        // eslint-disable-next-line no-param-reassign
        r.status = 'update';
      });
    }
  }, []);

  const handleAddProducts = (products) => {
    if (!isEmpty(products?.[0])) {
      bannerDs.current.set('productLov', products[0]);
      bannerDs.current.set('productGroupId', products[0]?.skuId);
      bannerDs.current.set('productGroupName', products[0]?.skuName);
    }
  };

  modal.handleOk(async () => {
    const data = bannerDs.current.toData();
    const flag = await bannerDs.validate();
    if (flag) {
      if (props.record) {
        setBannerList((list) => {
          return list.map((p) => {
            if ((p.bannerId || p.uuid) === (data.bannerId || data.uuid)) {
              return {
                ...data,
                updateFlag: 1,
                pageConfigAuthList: data?.pageConfigAuthList?.filter((i) => i.unitId !== 'ALL'),
              };
            } else {
              return p;
            }
          });
        });
        props.record.set(data);
      } else {
        setBannerList((list) => [
          ...list,
          {
            ...data,
            orderSeq: dataSet.length,
            groupAttribute: mallType === 'sigl' ? 1 : 0,
            uuid: uuid(),
            unitId: purchase.unitId,
            bannerLevel: currentRole === 'tenant' ? '0' : '1',
            pageConfigAuthList: data?.pageConfigAuthList?.filter((p) => p.unitId !== 'ALL'),
          },
        ]);
      }
    } else if ((data.jumpPageFlag === 1 && !data.imgaeUrlTwo) || !data.imageUrl) {
      notification.warning({
        message: intl.get('small.common.view.noImage.warning').d('请上传图片'),
      });
    }
    return flag;
  });

  const [isList, setIslist] = useState(props.record?.get('bannerType'));

  const UploadBtn = observer(({ bannerDataSet }) => {
    return (
      <>
        {bannerDataSet.current.get('jumpPageFlag') === 1 && (
          <UploadCrop
            title={intl.get('small.mallHomeConfig.secondPage.banner').d('二级页面Banner图片 ')}
            width={1190}
            height={340}
            imgUrl={bannerDataSet.current.get('imgaeUrlTwo')}
            handleOk={(data) => {
              bannerDataSet.current.set('imgaeUrlTwo', data?.url);
            }}
          />
        )}
      </>
    );
  });

  const ColorForm = observer(({ ds }) => {
    return (
      <>
        {+ds.current.get('backgroundColorFlag') === 1 && (
          <Form dataSet={bannerDs} labelWidth="auto" labelLayout="float" style={{ marginTop: 16 }}>
            <ColorPicker name="backgroundColor" />
          </Form>
        )}
      </>
    );
  });

  return (
    <>
      <Form dataSet={bannerDs} labelWidth="auto" labelLayout="float" className={styles.bannerForm}>
        <IntlField name="bannerName" />
        <Select
          name="bannerType"
          onChange={e => {
            setIslist(e);
            bannerDs.current.set('productLov', null);
            bannerDs.current.set('productGroupLov', null);
            bannerDs.current.set('linkUrl', '');
          }}
        />
        {isList == '1' && (
          <Lov
            name="productLov"
            readOnly
            onClick={() =>
              openSkuSelect({
                selection: 'single',
                onOk: handleAddProducts,
                queryParams: {
                  channel: mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE',
                },
              })
            }
          />
        )}
        {isList == '4' && (
          <Lov
            name="productGroupLov"
            showHelp="tooltip"
            help={intl
              .get('small.common.product.list.tooltip')
              .d(
                '通过点击Banner直接跳转至商品列表页。如没有符合的商品集合，可至商品推荐列表进行创建'
              )}
          />
        )}
        {isList == '3' && (
          <TextField
            showHelp="tooltip"
            help={intl
              .get('small.common.quick.links.tooltip')
              .d('通过点击Banner直接跳转至外部链接页面')}
            name="linkUrl"
            style={{ width: '100%' }}
          />
        )}
        {currentRole === 'tenant' && mallType !== 'sigl' && (
          <Lov
            name="pageConfigAuthList"
            // readOnly
            colSpan={2}
            onClick={() => openUnitTree({ record: bannerDs.current, name: 'pageConfigAuthList' })}
          />
        )}
        <UploadCrop
          width={800}
          height={400}
          imgUrl={props.record?.get('imageUrl')}
          handleOk={data => {
            bannerDs.current.set('imageUrl', data?.url);
            if (data?.url) {
              getBackgroundColor(data?.url).then(color => {
                bannerDs.current.set('defaultBackgroundColor', validateColor(color));
              });
            } else {
              bannerDs.current.set('defaultBackgroundColor', '');
            }
          }}
        />
        {/* <UploadCrop
        width={690}
        height={328}
        isApp
        imgUrl={props.record?.get('imageUrlApp')}
        handleOk={(data) => {
          bannerDs.current.set('imageUrlApp', data?.url);
        }}
      /> */}
        <CheckBox
          name="backgroundColorFlag"
          showHelp="tooltip"
          help={intl
            .get('small.mallHomeConfig.view.isBgColor.bannerwarning')
            .d(
              '用户可为banner配置对应的背景色，若不配置将会根据上传图片的色域进行自动获取，可能存在误差。'
            )}
        />
      </Form>
      <ColorForm ds={bannerDs} />
      {isList == '4' && (
        <Form dataSet={bannerDs} labelWidth="auto" labelLayout="float" style={{ marginTop: 16 }}>
          <CheckBox
            name="jumpPageFlag"
            help={intl
              .get('small.mallHomeConfig.view.isToSecond.bannerwarning')
              .d('二级页面是可跳转至该Banner所对应的商品列表页，可为其配置所对应的Banner')}
            showHelp="tooltip"
          />
          <UploadBtn bannerDataSet={bannerDs} />
        </Form>
      )}
      {isList == '2' && <HotConfig dataSet={bannerDs} mallType={mallType} hotType="banner" />}
      <Form dataSet={bannerDs} labelWidth="auto" labelLayout="float">
        <MultipleSelectionLov
          rowKey="skuId"
          siggle
          onRef={(ref = {}) => {
            mtpLovRecord.current = ref;
          }}
          visible={visible}
          setVisible={setVisible}
          handleAddProducts={products => handleAddProducts(products)}
          groupAttribute={mallType === 'sigl' ? 'PERSONAL' : 'ENTERPRISE'}
        />
      </Form>
    </>
  );
};

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(Banner);
