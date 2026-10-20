import intl from 'utils/intl';
import { downloadFileByAxios } from 'hzero-front/lib/services/api';
import { getCurrentOrganizationId } from 'utils/utils';
import { PRIVATE_BUCKET, PUBLIC_BUCKET } from '_utils/config';
import { isNil } from 'lodash';
import { MSG_STATE, MSG_TYPE } from '../common/global';

// 将表情全部加载
const emojiImgList = {};

for (let i = 105; i < 145; i++) {
  // eslint-disable-next-line import/no-dynamic-require
  const img = require(`../../../../assets/emoji/emoji_${i}.gif`);
  emojiImgList[`${i}`] = img;
}

// 仅替换标签符号<>
export function replaceHtmlTagSymbol(html) {
  if (html == null) {
    return '';
  }
  return html.replace(/</gm, '&lt;').replace(/>/gm, '&gt;');
}

const emojis = {
  '[微笑]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/0.gif'>",
  '[撇嘴]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/1.gif'>",
  '[色]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/2.gif'>",
  '[发呆]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/3.gif'>",
  '[得意]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/4.gif'>",
  '[流泪]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/5.gif'>",
  '[害羞]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/6.gif'>",
  '[闭嘴]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/7.gif'>",
  '[睡]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/8.gif'>",
  '[大哭]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/9.gif'>",
  '[尴尬]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/10.gif'>",
  '[发怒]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/11.gif'>",
  '[调皮]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/12.gif'>",
  '[呲牙]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/13.gif'>",
  '[惊讶]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/14.gif'>",
  '[难过]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/15.gif'>",
  '[酷]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/16.gif'>",
  '[冷汗]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/17.gif'>",
  '[抓狂]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/18.gif'>",
  '[吐]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/19.gif'>",
  '[偷笑]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/20.gif'>",
  '[可爱]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/21.gif'>",
  '[白眼]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/22.gif'>",
  '[傲慢]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/23.gif'>",
  '[饥饿]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/24.gif'>",
  '[困]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/25.gif'>",
  '[惊恐]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/26.gif'>",
  '[流汗]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/27.gif'>",
  '[憨笑]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/28.gif'>",
  '[大兵]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/29.gif'>",
  '[奋斗]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/30.gif'>",
  '[咒骂]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/31.gif'>",
  '[疑问]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/32.gif'>",
  '[嘘]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/33.gif'>",
  '[晕]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/34.gif'>",
  '[折磨]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/35.gif'>",
  '[衰]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/36.gif'>",
  '[骷髅]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/37.gif'>",
  '[敲打]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/38.gif'>",
  '[再见]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/39.gif'>",
  '[擦汗]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/40.gif'>",
  '[抠鼻]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/41.gif'>",
  '[鼓掌]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/42.gif'>",
  '[糗大了]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/43.gif'>",
  '[坏笑]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/44.gif'>",
  '[左哼哼]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/45.gif'>",
  '[右哼哼]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/46.gif'>",
  '[哈欠]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/47.gif'>",
  '[鄙视]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/48.gif'>",
  '[委屈]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/49.gif'>",
  '[快哭了]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/50.gif'>",
  '[阴险]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/51.gif'>",
  '[亲亲]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/52.gif'>",
  '[吓]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/53.gif'>",
  '[可怜]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/54.gif'>",
  '[菜刀]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/55.gif'>",
  '[西瓜]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/56.gif'>",
  '[啤酒]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/57.gif'>",
  '[篮球]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/58.gif'>",
  '[乒乓]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/59.gif'>",
  '[咖啡]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/60.gif'>",
  '[饭]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/61.gif'>",
  '[猪头]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/62.gif'>",
  '[玫瑰]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/63.gif'>",
  '[凋谢]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/64.gif'>",
  '[示爱]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/65.gif'>",
  '[爱心]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/66.gif'>",
  '[心碎]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/67.gif'>",
  '[蛋糕]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/68.gif'>",
  '[闪电]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/69.gif'>",
  '[炸弹]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/70.gif'>",
  '[刀]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/71.gif'>",
  '[足球]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/72.gif'>",
  '[瓢虫]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/73.gif'>",
  '[便便]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/74.gif'>",
  '[月亮]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/75.gif'>",
  '[太阳]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/76.gif'>",
  '[礼物]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/77.gif'>",
  '[拥抱]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/78.gif'>",
  '[强]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/79.gif'>",
  '[弱]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/80.gif'>",
  '[握手]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/81.gif'>",
  '[胜利]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/82.gif'>",
  '[抱拳]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/83.gif'>",
  '[勾引]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/84.gif'>",
  '[拳头]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/85.gif'>",
  '[差劲]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/86.gif'>",
  '[爱你]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/87.gif'>",
  '[NO]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/88.gif'>",
  '[OK]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/89.gif'>",
  '[爱情]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/90.gif'>",
  '[飞吻]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/91.gif'>",
  '[跳跳]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/92.gif'>",
  '[发抖]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/93.gif'>",
  '[怄火]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/94.gif'>",
  '[转圈]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/95.gif'>",
  '[磕头]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/96.gif'>",
  '[回头]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/97.gif'>",
  '[跳绳]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/98.gif'>",
  '[挥手]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/99.gif'>",
  '[激动]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/100.gif'>",
  '[街舞]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/101.gif'>",
  '[献吻]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/102.gif'>",
  '[左太极]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/103.gif'>",
  '[右太极]':
    "<img class='emoji-img' src='https://res.wx.qq.com/mpres/htmledition/images/icon/emotion/104.gif'>",
  '[叹气]': `<img class='emoji-img' src=${emojiImgList['105']}>`,
  '[裂开]': `<img class='emoji-img' src=${emojiImgList['106']}>`,
  '[苦涩]': `<img class='emoji-img' src=${emojiImgList['107']}>`,
  '[666]': `<img class='emoji-img' src=${emojiImgList['108']}>`,
  '[翻白眼]': `<img class='emoji-img' src=${emojiImgList['109']}>`,
  '[让我看看]': `<img class='emoji-img' src=${emojiImgList['110']}>`,

  '[囧]': `<img class='emoji-img' src=${emojiImgList['111']}>`,
  '[愉快]': `<img class='emoji-img' src=${emojiImgList['112']}>`,
  '[悠闲]': `<img class='emoji-img' src=${emojiImgList['113']}>`,
  '[笑脸]': `<img class='emoji-img' src=${emojiImgList['114']}>`,
  '[生病]': `<img class='emoji-img' src=${emojiImgList['115']}>`,
  '[脸红]': `<img class='emoji-img' src=${emojiImgList['116']}>`,
  '[破涕为笑]': `<img class='emoji-img' src=${emojiImgList['117']}>`,
  '[恐惧]': `<img class='emoji-img' src=${emojiImgList['118']}>`,
  '[失望]': `<img class='emoji-img' src=${emojiImgList['119']}>`,
  '[无语]': `<img class='emoji-img' src=${emojiImgList['120']}>`,
  '[嘿哈]': `<img class='emoji-img' src=${emojiImgList['121']}>`,
  '[捂脸]': `<img class='emoji-img' src=${emojiImgList['122']}>`,
  '[奸笑]': `<img class='emoji-img' src=${emojiImgList['123']}>`,
  '[机智]': `<img class='emoji-img' src=${emojiImgList['124']}>`,
  '[皱眉]': `<img class='emoji-img' src=${emojiImgList['125']}>`,
  '[耶]': `<img class='emoji-img' src=${emojiImgList['126']}>`,
  '[吃瓜]': `<img class='emoji-img' src=${emojiImgList['127']}>`,
  '[加油]': `<img class='emoji-img' src=${emojiImgList['128']}>`,
  '[汗]': `<img class='emoji-img' src=${emojiImgList['129']}>`,
  '[天啊]': `<img class='emoji-img' src=${emojiImgList['130']}>`,
  '[Emm]': `<img class='emoji-img' src=${emojiImgList['131']}>`,
  '[社会社会]': `<img class='emoji-img' src=${emojiImgList['132']}>`,
  '[旺柴]': `<img class='emoji-img' src=${emojiImgList['133']}>`,
  '[好的]': `<img class='emoji-img' src=${emojiImgList['134']}>`,
  '[打脸]': `<img class='emoji-img' src=${emojiImgList['135']}>`,
  '[哇]': `<img class='emoji-img' src=${emojiImgList['136']}>`,
  '[嘴唇]': `<img class='emoji-img' src=${emojiImgList['137']}>`,
  '[合十]': `<img class='emoji-img' src=${emojiImgList['138']}>`,
  '[庆祝]': `<img class='emoji-img' src=${emojiImgList['139']}>`,
  '[红包]': `<img class='emoji-img' src=${emojiImgList['140']}>`,
  '[發]': `<img class='emoji-img' src=${emojiImgList['141']}>`,
  '[福]': `<img class='emoji-img' src=${emojiImgList['142']}>`,
  '[烟花]': `<img class='emoji-img' src=${emojiImgList['143']}>`,
  '[爆竹]': `<img class='emoji-img' src=${emojiImgList['144']}>`,
};

const symbol = [
  '😠',
  '😩',
  '😲',
  '😞',
  '😵',
  '😰',
  '😒',
  '😍',
  '😤',
  '😜',
  '😝',
  '😋',
  '😘',
  '😚',
  '😷',
  '😳',
  '😃',
  '😅',
  '😆',
  '😁',
  '😂',
  '😊',
  '☺',
  '😄',
  '😢',
  '😭',
  '😨',
  '😣',
  '😡',
  '😌',
  '😖',
  '😔',
  '😱',
  '😪',
  '😏',
  '😓',
  '😥',
  '😫',
  '😉',
  '✊',
  '✋',
  '✌',
  '👊',
  '👍',
  '☝',
  '👆',
  '👇',
  '👈',
  '👉',
  '👋',
  '👏',
  '👌',
  '👎',
];

const emojisKeys = Object.keys(emojis);

export const emojiList = {
  symbol,
  emojis: emojisKeys,
};

// 判断时间是否显示（5分钟内时间值显示开始时间）
export function judgeShowTime(records) {
  let lastShowTimeStamp = 0;
  return records.map((record) => {
    let showTime = true;
    const time = Math.floor(Date.parse(record.creationDate.replace(/-/g, '/')) / 1000);
    if (time - lastShowTimeStamp < 300) {
      showTime = false;
    } else {
      showTime = true;
      lastShowTimeStamp = time;
    }
    return { ...record, showTime };
  });
}

// 处理消息
export function judgeMessageRecords(records, roomInfo, suppliersChatType = 'single') {
  // 判断是否是供应商
  function checkCurrentIsSupplier() {
    if (!roomInfo) return false;
    return roomInfo?.suppliers?.some((supplier) => {
      return supplier?.members?.some((member) => {
        return (
          member?.companyId === roomInfo?.currentUser?.companyId &&
          member?.tenantId === roomInfo?.currentUser?.tenantId
        );
      });
    });
  }
  const isSupplier = checkCurrentIsSupplier();
  const isSingleMode = isSupplier && suppliersChatType === 'single';
  let lastShowTimeStamp = 0;
  return records.map((record) => {
    let showTime = true;
    const time = Math.floor(Date.parse(record.creationDate.replace(/-/g, '/')) / 1000);
    if (time - lastShowTimeStamp < 300) {
      showTime = false;
    } else {
      showTime = true;
      lastShowTimeStamp = time;
    }
    // 标记是否显示@符号
    const receiverHide =
      isSingleMode &&
      record?.receivers?.some((item) =>
        [roomInfo?.currentUser?.roomMemberId, roomInfo?.currentUser?.roomTenantId].includes(item)
      );
    return { ...record, receiverHide, showTime };
  });
}

export function parseTime(time, cFormat) {
  let _time = time;
  if (arguments.length === 0 || !_time) {
    return null;
  }
  const format = cFormat || '{y}-{m}-{d} {h}:{i}:{s}';
  let date;
  if (typeof _time === 'object') {
    date = _time;
  } else {
    if (typeof _time === 'string' && /^[0-9]+$/.test(_time)) {
      _time = parseInt(_time, 10);
    }
    if (typeof time === 'number' && _time.toString().length === 10) {
      _time *= 1000;
    }

    date = new Date(_time.replace(/-/g, '/'));
  }
  const formatObj = {
    y: date.getFullYear(),
    m: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    i: date.getMinutes(),
    s: date.getSeconds(),
    a: date.getDay(),
  };
  const timeStr = format.replace(/{([ymdhisa])+}/g, (result, key) => {
    const value = formatObj[key];
    // Note: getDay() returns 0 on Sunday
    if (key === 'a') {
      return ['日', '一', '二', '三', '四', '五', '六'][value];
    }

    return value.toString().padStart(2, '0');
  });
  return timeStr;
}

export function formateTime(datetime, showTime = true) {
  let _datetime = datetime;
  if (datetime == null) {
    return '';
  }

  _datetime = _datetime.replace(/-/g, '/');

  // 当前时间戳
  const time = new Date();
  let outTime = new Date(_datetime);
  if (/^[1-9]\d*$/.test(_datetime)) {
    outTime = new Date(parseInt(_datetime, 10) * 1000);
  }

  if (time.getFullYear() !== outTime.getFullYear()) {
    return parseTime(outTime, `{y}-{m}-{d}${showTime ? ' {h}:{i}' : ''}`);
  }

  if (time.getMonth() !== outTime.getMonth()) {
    return parseTime(outTime, `{m}-{d}${showTime ? ' {h}:{i}' : ''}`);
  }

  if (time.getDate() !== outTime.getDate()) {
    const day = outTime.getDate() - time.getDate();
    if (day === -1) {
      const displayTime = parseTime(outTime, '{h}:{i}');
      return intl
        .get('smbl.chat.view.message.yestodayTime', { displayTime })
        .d(`昨天 ${displayTime}`);
    }

    if (day === -2) {
      const displayTime = parseTime(outTime, '{h}:{i}');
      return intl
        .get('smbl.chat.view.message.beforeYestodayTime', { displayTime })
        .d(`前天 ${displayTime}`);
    }

    return parseTime(outTime, `{m}-{d}${showTime ? ' {h}:{i}' : ''}`);
  }

  // 一分钟内
  if (time.getTime() - outTime.getTime() < 60000) {
    return intl.get('smbl.chat.view.message.justNow').d('刚刚');
  }

  // 一小时内
  if (time.getTime() - outTime.getTime() < 3600000) {
    const minutes = Math.floor((time.getTime() - outTime.getTime()) / 60000);
    return intl.get('smbl.chat.view.message.beforeMinus', { minutes }).d(`${minutes}分钟前`);
  }

  if (time.getHours() !== outTime.getHours()) {
    return parseTime(outTime, '{h}:{i}');
  }
}

/**
 * Url 替换超链接
 *
 * @param {String} text 文本
 * @param {String} color 超链接颜色
 */
export function textReplaceLink(text) {
  // eslint-disable-next-line no-useless-escape
  const exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
  return text.replace(exp, `<a href='$1' target="_blank" style="text-decoration: revert;">$1</a >`);
}

const regEmoji = emojisKeys
  .map((value) => `|\\${value}`)
  .join('')
  .replace('|', '');

/**
 * 替换表情文字
 *
 * @param {String} content  需要替换的字符串
 */
export function textReplaceEmoji(content) {
  return content.replace(new RegExp(`(${regEmoji})`, 'gi'), ($0, $1) => {
    return emojis[$1];
  });
}

// 获取文件后缀
export function getFileSuffix(fileName) {
  if (!fileName) {
    return null;
  }
  const ary = fileName.split('.');
  const last = ary[ary.length - 1];
  return last;
}

// 下载文件
export function downloadFile(fileUrl) {
  const bucketName = fileUrl?.includes(PUBLIC_BUCKET) ? PUBLIC_BUCKET : PRIVATE_BUCKET;
  downloadFileByAxios({
    requestUrl: `/hfle/v1/${getCurrentOrganizationId()}/files/download`,
    method: 'GET',
    queryParams: [
      { name: 'bucketName', value: bucketName },
      { name: 'url', value: fileUrl },
    ],
  });
}

// 消息对象转为文本
export function transformMessageToText(message, userRoomMemberId) {
  const {
    state,
    msgType,
    content,
    recallSelfTip,
    msgContent,
    senderRoomMemberId,
    purchaseRobotMsg,
  } = message;
  // 正常发送类型
  if (Number(state) === MSG_STATE.RECEIVE || isNil(state)) {
    if (msgContent || msgType === MSG_TYPE.TEXT) {
      return msgContent;
    } else if (msgType === MSG_TYPE.IMAGE) {
      return intl.get('smbl.chat.view.message.imageContent').d('[图片]');
    } else if (msgType === MSG_TYPE.FILE) {
      return intl.get('smbl.chat.view.message.fileContent').d('[文件]');
    } else if (msgType === MSG_TYPE.ASSISTANT_TEXT) {
      return content || msgContent;
    } else if (purchaseRobotMsg?.config?.textMode === MSG_TYPE.TEXT) {
      return purchaseRobotMsg?.subTitle?.text;
    }
    return intl.get('smbl.chat.view.message.purchaseCardContent').d('[卡片]');
    // 撤回类型
  } else if (Number(state) === MSG_STATE.RECALL) {
    if (senderRoomMemberId === userRoomMemberId) {
      return intl.get('smbl.chat.view.message.selfRecall').d('你撤回了一条消息');
    } else {
      return recallSelfTip || msgContent;
    }
  }
  return '';
}
