/**
 * 截图打印插件
 * 使用方法
 * 方法一:挂载即可
 * 方法二:挂载后 screenPrint(dom);
 */

let default_config = {
  // icon: "data:image/png;base64,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",
  icon: "data:image/png;base64,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",
  // position: [10, 10],
  range: document.body,
  watermark: {
    text: "",
    angle: 30,
    alpha: 0.15,
    width: 200,
    height: 200,
    lineHeight: 1.5,
  },
  before: function (config) { },
  after: function (config, canvas) { },
};

let oneButton = document.createElement("div");
oneButton.className = 'screen-print-container';
let waterMark = null;

function screenPrint(range) {
  if (!check_permissions()) {
    return alert("[截屏打印]此电脑无法使用此插件");
  }

  range = range || default_config.range;

  if (default_config.watermark.text) {
    setWaterMark(default_config.watermark);
  }

  // 带有print-hidden 会处理隐藏
  const exclude_element = [...document.querySelectorAll(".print-hidden")];

  exclude_element.forEach((item) => {
    item.attributes.old_display = item.display;
    item.style.display = "none";
  });

  // 带有print-show 默认会处理隐藏,打印的时候展现i
  const show_element = [...document.querySelectorAll(".print-show")];
  show_element.forEach((item) => {
    item.style.display = "block";
  });

  default_config.before && default_config.before(default_config);

  html2canvas(range, {
    useCORS: true,
    // allowTaint: true,
  }).then((canvas) => {
    if (canvas) {
      default_config.after && default_config.after(default_config, canvas);
      const base64 = canvas.toDataURL("image/png");
      const parent = document.body;

      exclude_element.forEach((item) => {
        item.style.display = item.attributes.old_display;
      });

      show_element.forEach((item) => {
        item.style.display = "none";
      });

      const childrens = [...document.body.children].filter(
        (item) => !["SCRIPT", "STYLE"].includes(item.nodeName)
      );

      childrens.forEach((item) => {
        item.attributes.old_display = item.style.display;
        item.style.display = "none";
      });
      let img = createImage(base64);
      parent.appendChild(img);

      parent.style.cursor = "wait";
      parent.attributes.old_overflow = parent.style.overflow;
      parent.style.overflow = "hidden";

      setTimeout(function () {
        parent.style.cursor = "default";
        parent.style.overflow = parent.attributes.old_overflow;
        window.print();
        parent.removeChild(img);
        childrens.forEach((item) => {
          item.style.display = item.attributes.old_display;
        });

        removeWaterMark();
      }, 618);
    }
  });

  function createImage(src) {
    let $img = document.createElement("img");
    $img.src = src;
    $img.style.width = "100%";
    $img.style.display = "block";
    return $img;
  }
}

screenPrint.config = function (cfg) {
  default_config = copyObject(default_config, cfg);
};

screenPrint.init = function (container) {
  const config = default_config;
  const onkey =
    "<div class='print-icon' style='width:30px'><img src='" +
    config.icon +
    "'></div>";
  oneButton.innerHTML = onkey;
  if (container && document.querySelector(container)) {
    document.querySelector(container).appendChild(oneButton);
    oneButton.onclick = function () {
      screenPrint();
    };
  }
};

screenPrint.show = function (show) {
  oneButton.style.display = show === false ? "none" : "block";
};

window.addEventListener("load", function () {
  // screenPrint.config({});
  // check_permissions() && screenPrint.init();
});

function check_permissions() {
  //   let host = location.host;

  //   if (host.indexOf("localhost") >= 0) {
  //     return true;
  //   }
  //  // https://chis2.auxyl.com/
  //   if (host && host.indexOf("auxgroup.com") < 0) {
  //     return false;
  //   }
  return true;
}

function setWaterMark(wmark) {
  let watermark_txt = wmark.text + "\n" + new Date().Format("yyyy-MM-dd hh:mm");
  return watermark.load({
    // watermark_id: "wm_div_id", //水印总体的id
    // watermark_prefix: "mask_div_id", //小水印的id前缀
    watermark_txt: watermark_txt, //水印的内容
    watermark_x: document.body.offsetLeft + 20, //水印起始位置x轴坐标
    watermark_y: document.body.offsetTop, //水印起始位置Y轴坐标
    watermark_line_height: wmark.lineHeight || 1, //水印行间距
    // watermark_rows: 0, //水印行数
    // watermark_cols: 0, //水印列数
    watermark_x_space: 100, //水印x轴间隔
    watermark_y_space: 50, //水印y轴间隔
    // watermark_font: "", //水印字体 SimHei
    // watermark_color: "black", //水印字体颜色
    // watermark_fontsize: "18px", //水印字体大小
    watermark_alpha: wmark.alpha || 0.15, //水印透明度，要求设置在大于等于0.005
    watermark_width: wmark.width || 200, //水印宽度
    watermark_height: wmark.height || 200, //水印长度
    watermark_angle: wmark.angle, //水印倾斜度数
    // watermark_parent_width: 0, //水印的总体宽度（默认值：body的scrollWidth和clientWidth的较大值）
    // watermark_parent_height: 0, //水印的总体高度（默认值：body的scrollHeight和clientHeight的较大值）
    // watermark_parent_node: null, //水印插件挂载的父元素element,不输入则默认挂在body上
    watermark_text_align: "center",
  });
}

function removeWaterMark() {
  return watermark.remove();
}

function copyObject(objA, objB) {
  for (const key in objB) {
    if (typeof objB[key] === "object") {
      objA[key] = copyObject(objA[key], objB[key]);
    } else {
      objA[key] = objB[key];
    }
  }
  return objA;
}

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(H)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd HH:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d H:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
  //author: meizz
  var o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    S: this.getMilliseconds(), //毫秒
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  for (var k in o)
    if (new RegExp("(" + k + ")").test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
  return fmt;
};
