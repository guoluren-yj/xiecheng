/* eslint-disable eqeqeq */
import React, { useMemo, useEffect, useRef } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import { DATETIME_MAX, DATETIME_MIN } from 'utils/constants';
import { compose } from 'lodash';

import { getResponse } from 'utils/utils';
import { PUBLIC_BUCKET } from '_utils/config';
import { Form, TextField, Lov, DataSet, DatePicker, Output } from 'choerodon-ui/pro';
import { openUnitTree } from '@/components/UnitTreeModal';
import { saveGonggao } from '@/services/mallHomeConfigService';
import RichTextEditor from 'components/RichTextEditor';

import { bannerds } from '../tableds';
import styles from '../index.less';

const Banner = (props) => {
  const {
    mallHome: { currentRole, purchase, mallType },
    modal,
  } = props;

  const refCurrent = useRef();

  const content = useMemo(() => {
    return props.record?.toData()?.bulletinContent || '';
  }, []);

  const bannerDs = useMemo(() => {
    return new DataSet(bannerds({ currentRole, unitId: purchase.unitId, mallType }));
  }, []);

  useEffect(() => {
    if (props.record) {
      const data = props.record?.toData() || {};
      bannerDs.create(data);
    } else {
      bannerDs.create({
        enabledFlag: 1,
      });
    }
  }, []);

  modal.handleOk(async () => {
    const flag = await bannerDs.current.validate();
    if (flag) {
      const data = bannerDs.current.toData();
      const body = {
        ...data,
        belongType: currentRole === 'tenant' ? 0 : 1,
        startDate: moment(data.startDate).format(DATETIME_MIN),
        endDate: moment(data.endDate).format(DATETIME_MAX),
        unitId: purchase.unitId,
        bulletinAttribute: mallType === 'sigl' ? 1 : 0,
        bulletinContent: refCurrent.current.getContent(),
        pageConfigAuthList: data?.pageConfigAuthList?.filter((i) => i.unitId !== 'ALL'),
      };
      const res = getResponse(await saveGonggao(body));
      if (res) {
        props.DS.query();
      }
      return !!res;
    }
    return flag;
  });

  const staticTextProps = {
    content,
    data: content,
    ref: refCurrent,
    bucketDirectory: 'small-mallConfig-gonggao',
    bucketName: PUBLIC_BUCKET,
    config: {
      allowedContent: true,
      removeButtons:
        'About,Flash,Save,Form,Checkbox,Button,ShowBlocks,NewPage,Print,Language,Templates,CreateDiv,Radio,TextField,Textarea,Select,HiddenField',
    },
  };

  return (
    <div style={{ position: 'relative' }}>
      <Form dataSet={bannerDs} columns={2} labelLayout="float" className={styles.bannerForm}>
        <TextField name="bulletinTitle" />
        {currentRole === 'tenant' && mallType !== 'sigl' && (
          <Lov
            name="pageConfigAuthList"
            colSpan={2}
            onClick={() => openUnitTree({ record: bannerDs.current, name: 'pageConfigAuthList' })}
          />
        )}
        <DatePicker name="validityDate" />
        <Output
          newLine
          colSpan={24}
          className="rich-editor"
          renderer={() => {
            return <RichTextEditor {...staticTextProps} />;
          }}
        />
      </Form>
    </div>
  );
};

export default compose(
  connect(({ mallHome }) => ({
    mallHome,
  }))
)(Banner);
