// 本地界面配置工具
// 设计原则：代码内置默认配置 + localStorage 覆盖修改
// 加载时读取默认配置并用本地修改覆盖，修改后持久化到本地，永久生效，直至手动清除浏览器数据或点击恢复默认

const STORAGE_KEY = 'ez13-clock-settings';

// 默认界面配置，新增配置项时在此处补充默认值
// 配置模式由快捷键 Ctrl+E+Z 唤起，仅会话内有效，页面始终以沉浸模式初始化，故无面板状态配置
export const DEFAULT_SETTINGS = {
  // 当前显示的时钟类型：digital（数字时钟）/ binary（二进制时钟）/ flip（翻页时钟）
  clockType: 'digital',
  // 时间来源（各时钟通用）：auto（本机时间优先，偏差超过 1 秒时按网络时间静默校正）/ local（完全使用本机时间）
  timeSource: 'auto',
  // 数字时钟配置
  digital: {
    // 数字时钟主题
    theme: 'fx67ll',
    // IANA 时区标识
    timeZone: 'Asia/Shanghai',
    // 是否使用 12 小时制
    hour12: false,
    // 是否显示数字时间
    showDigital: true,
    // 秒针是否平滑扫动
    smoothSeconds: true,
    // 是否显示日期与星期
    showDate: true,
    // 是否显示模拟时钟（指针钟盘）
    showAnalog: true,
    // 时钟缩放尺寸
    zoom: 1.23,
  },
  // 二进制时钟配置
  binary: {
    // 是否显示十进制时间
    isShowTime: true,
    // 是否显示 hour/minute/second 标签
    showLabel: true,
    // 时钟缩放尺寸
    zoom: 1.2,
    // 二进制圆点基础尺寸
    dotSize: 30,
    // 0 表示使用组件随视口自适应的默认字号
    textSize: 0,
    // 十进制时间标题与二进制点阵之间的净间距（fx67ll-vue-ui 0.7.1+）
    textSpacing: 23,
  },
  // 翻页时钟配置
  flip: {
    // 显示模式：clock（时钟）/ countdown（倒计时）
    mode: 'clock',
    // 倒计时目标时间，datetime-local 输入值格式，仅倒计时模式下生效
    targetDate: '',
    // 是否显示秒
    showSeconds: true,
    // 是否显示单位标签
    showLabels: true,
    // 时钟缩放尺寸
    zoom: 1.2,
  },
};

// 枚举型配置的合法取值表，本地存储的历史遗留非法值（如已更名/已删除的主题）会被自动回退为默认值
const ENUM_WHITELIST = {
  clockType: ['digital', 'binary', 'flip'],
  timeSource: ['auto', 'local'],
  'digital.theme': ['fx67ll', 'aurora', 'ocean', 'forest', 'sunset', 'violet', 'graphite'],
  'digital.timeZone': ['Asia/Shanghai', 'Asia/Tokyo', 'Europe/London', 'America/New_York', 'UTC'],
  'flip.mode': ['clock', 'countdown'],
};

// 数值型配置的合法范围表，越界值会被自动回退为默认值
const NUMBER_RANGE = {
  'digital.zoom': [0.6, 2.4],
  'binary.zoom': [0.6, 2.4],
  'binary.dotSize': [14, 36],
  'binary.textSize': [0, 60],
  'binary.textSpacing': [0, 100],
  'flip.zoom': [0.6, 2.4],
};

// 深拷贝配置对象
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// 按路径读取配置值，如 'digital.theme'
function getPathValue(obj, path) {
  return path.split('.').reduce(function (acc, key) {
    return acc && typeof acc === 'object' ? acc[key] : undefined;
  }, obj);
}

// 按路径写入配置值，如 'digital.theme'
function setPathValue(obj, path, value) {
  var keys = path.split('.');
  var target = obj;
  for (var i = 0; i < keys.length - 1; i++) {
    target = target[keys[i]];
  }
  target[keys[keys.length - 1]] = value;
}

// 配置合法性校验：枚举取值、数值范围、布尔类型不合法时一律回退为默认值
function sanitizeSettings(settings) {
  var defaults = DEFAULT_SETTINGS;
  Object.keys(ENUM_WHITELIST).forEach(function (path) {
    if (ENUM_WHITELIST[path].indexOf(getPathValue(settings, path)) === -1) {
      setPathValue(settings, path, getPathValue(defaults, path));
    }
  });
  Object.keys(NUMBER_RANGE).forEach(function (path) {
    var value = Number(getPathValue(settings, path));
    var range = NUMBER_RANGE[path];
    if (isNaN(value) || value < range[0] || value > range[1]) {
      setPathValue(settings, path, getPathValue(defaults, path));
    } else {
      // 统一回写为数值类型，避免历史脏数据以字符串形式混入
      setPathValue(settings, path, value);
    }
  });
  return settings;
}

// 将本地修改合并到默认配置上，仅合并双方都存在的键，忽略历史遗留的无效配置
function mergeSettings(defaults, stored) {
  var result = deepClone(defaults);
  if (!stored || typeof stored !== 'object') {
    return result;
  }
  Object.keys(result).forEach(function (key) {
    if (typeof result[key] === 'object' && result[key] !== null) {
      result[key] = mergeSettings(result[key], stored[key]);
    } else if (typeof stored[key] !== 'undefined' && typeof stored[key] !== 'object') {
      // 布尔项仅接受布尔值，避免历史脏数据以字符串形式混入
      if (typeof result[key] === 'boolean' && typeof stored[key] !== 'boolean') {
        return;
      }
      result[key] = stored[key];
    }
  });
  return result;
}

// 加载配置：优先读取本地修改，任何异常情况都回退到默认配置
export function loadSettings() {
  try {
    var stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // 历史版本迁移：时间来源原存于 digital.timeSource（仅数字时钟生效），升级为全局配置后迁移至顶层
    if (stored && typeof stored === 'object' && typeof stored.timeSource === 'undefined') {
      if (stored.digital && (stored.digital.timeSource === 'local' || stored.digital.timeSource === 'auto')) {
        stored.timeSource = stored.digital.timeSource;
      }
    }
    return sanitizeSettings(mergeSettings(DEFAULT_SETTINGS, stored));
  } catch (e) {
    return deepClone(DEFAULT_SETTINGS);
  }
}

// 保存配置：修改后调用，持久化到 localStorage，永久生效直至手动清除
export function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    // 存储失败（如隐私模式/容量已满）静默忽略，仅本次会话生效
  }
}

// 重置配置：清除本地修改并返回一份全新的默认配置
export function resetSettings() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    // 清除失败静默忽略
  }
  return deepClone(DEFAULT_SETTINGS);
}
