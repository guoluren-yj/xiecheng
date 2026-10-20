/* eslint-disable eqeqeq */
import React, { useMemo, useEffect } from 'react';
import { connect } from 'dva';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Icon, Tooltip } from 'choerodon-ui';

import { openUnitTree } from '@/components/UnitTreeModal';
import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import { Form, TextField, Lov, DataSet, Select, IntlField, CheckBox } from 'choerodon-ui/pro';
import notification from 'utils/notification';
import { saveZhuanqu } from '@/services/mallHomeConfigService';
import colorList from '../../../GlobalSetting/ColorConfig/colors';
import colorStyles from '../../../GlobalSetting/ColorConfig/index.less';
import { formds } from '../tableds';
import styles from '../index.less';
import UploadCrop from '../../../common/UploadCrop';
import ComContent from '../../../common/ComContent';

const Banner = (props) => {
  const {
    dispatch,
    mallHome: { currentRole, purchase, mallType },
    modal,
  } = props;

  const colors = { '000': { 'primary-color': '#000' }, ...colorList };

  const formDs = useMemo(() => {
    return new DataSet(formds({ currentRole, unitId: purchase.unitId, mallType }));
  }, []);

  useEffect(() => {
    if (props.record) {
      const data = props.record?.toData() || {};
      formDs.loadData([data]);
    } else {
      formDs.create({
        fontColor: '#000',
      });
    }
  }, []);

  modal.handleOk(async () => {
    const flag = await formDs.current.validate();
    if (flag) {
      const data = formDs.current.toData();
      const body = {
        ...data,
        belongType: currentRole === 'tenant' ? 0 : 1,
        unitId: purchase.unitId,
        channel: mallType === 'sigl' ? 1 : 0,
        pageConfigAuthList: data?.pageConfigAuthList?.filter((i) => i.unitId !== 'ALL'),
      };
      if (+body.jumpPageFlag === 1 && !body.imageUrlTwo) {
        notification.warning({
          message: intl.get('small.common.view.noImage.warning').d('请上传图片'),
        });
        return false;
      }
      const res = getResponse(await saveZhuanqu(body));
      if (res) {
        dispatch({
          type: 'mallHome/fetchZhuanqu',
          payload: {
            belongType: 0,
            channel: mallType === 'sigl' ? 1 : 0,
            isPreview: 1,
          },
        });
      }
      return !!res;
    }
    return flag;
  });

  const tips = (msg) => (
    <Tooltip title={msg}>
      <Icon type="help" style={{ color: 'rgba(0, 0, 0, 0.5)' }} />
    </Tooltip>
  );

  const CurrenForm = observer(({ dataSet }) => {
    return (
      <Form dataSet={dataSet} columns={2} labelLayout="float" className={styles.bannerForm}>
        <IntlField colSpan={2} name="blockTitle" />
        <Select colSpan={2} name="blockType" />
        {+dataSet.current?.get('blockType') === 1 && (
          <Lov
            colSpan={2}
            name="productGroupLov"
            showHelp='tooltip'
            help={
              intl
                .get('small.mallHomeConfig.product.zhuanqu.tooltip')
                .d(
                  '通过点击专区直接跳转至商品列表页。如没有符合的商品集合，可至商品集合列表进行创建。'
                )
            }
          />
        )}
        {+dataSet.current?.get('blockType') === 2 && (
          <TextField
            colSpan={2}
            name="quickUrl"
            addonAfter={tips(
              intl
                .get('small.mallHomeConfig.product.zhuanqu.quickUrl')
                .d('通过点击专区直接跳转至外部链接页面。')
            )}
          />
        )}
        {mallType !== 'sigl' && (
          <Lov
            colSpan={2}
            name="pageConfigAuthList"
            onClick={() =>
              openUnitTree({
                record: dataSet.current,
                name: 'pageConfigAuthList',
              })
            }
          />
        )}
        {mallType === 'sigl' && (
          <Lov
            colSpan={2}
            name="specialBlockAssignList"
            viewMode="drawer"
            modalProps={{ style: { maxWidth: '1042px' } }}
          />
        )}
        {+dataSet.current?.get('blockType') !== 2 && (
          <>
            <CheckBox
              colSpan={2}
              showHelp="tooltip"
              help={intl
            .get('small.mallHomeConfig.view.isToSecond.zhuanquwarning')
            .d('二级页面是可跳转至该专区所对应的商品列表页，可为其配置所对应的专区')}
              dataSet={dataSet}
              name="jumpPageFlag"
            />
              {dataSet.current?.get('jumpPageFlag') === 1 && (
              <div colSpan={2}>
                <UploadCrop
                  title={intl.get('small.mallHomeConfig.secondPage.banner').d('二级页面Banner图片 ')}
                  width={1190}
                  height={340}
                  imgUrl={dataSet.current.get('imageUrlTwo')}
                  handleOk={data => {
                  dataSet.current.set('imageUrlTwo', data?.url);
                }}
                />
              </div>
            )}
          </>
        )}
        <ComContent
          colSpan={2}
          title={intl.get('small.mallHomeConfig.style.config').d('样式设置')}
          style={{ marginBottom: 0, marginTop: 32 }}
          titleStyle={{ marginBottom: 0 }}
        />
        <CheckBox name="boldFlag" />
        <CheckBox name="slantFlag" />
        <div colSpan={2} className={colorStyles.container} style={{ marginTop: 0 }}>
          <p style={{ marginBottom: 8, color: 'rgba(0, 0, 0, 0.65)' }}>
            {intl.get('small.mallHomeConfig.fontColor').d('字体颜色')}
            <span style={{ color: 'red' }}>*</span>
          </p>
          {Object.keys(colors).map(c => {
            return (
              <span
                onClick={() =>
                  dataSet.current?.set('fontColor', colors[c]?.['primary-color'] || '#000')
                }
                style={{ background: colors[c]['primary-color'] }}
                className={`item ${
                  dataSet.current?.get('fontColor') === colors[c]['primary-color'] ? 'active' : ''
                }`}
              />
            );
          })}
        </div>
      </Form>
    );
  });

  return (
    <div style={{ position: 'relative' }}>
      <CurrenForm dataSet={formDs} />
    </div>
  );
};

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(Banner);
