# MPC-HC Web Interface API 文档

> 基于 MPC-HC v2.7.2.16 (Web Interface 运行于 `http://localhost:13579`)

---

## 目录

- [概述](#概述)
- [页面端点 (HTML UI)](#页面端点-html-ui)
- [命令 API](#命令-api)
- [状态查询 API](#状态查询-api)
- [变量系统](#变量系统)
- [文件浏览器 API](#文件浏览器-api)
- [实时快照](#实时快照)
- [完整命令 ID 列表](#完整命令-id-列表)
- [使用示例](#使用示例)

---

## 概述

MPC-HC Web Interface 提供以下核心能力：

| 能力       | 机制                                               |
| -------- | ------------------------------------------------ |
| 发送播放控制命令 | `GET /command.html?wm_command=<id>`              |
| 查询播放状态   | `GET /status.html` (返回 JS `OnStatus()` 格式)       |
| 读取状态变量   | `GET /variables.html` (HTML 中 `<p id="var">` 元素) |
| 浏览文件系统   | `GET /browser.html?path=<url编码路径>`               |
| 获取当前画面   | `GET /snapshot.jpg`                              |

所有命令通过 `command.html` 发送，使用 `wm_command` 参数。支持 GET 和 POST 两种方式。

---

## 页面端点 (HTML UI)

| 端点                | 说明                                   |
| ----------------- | ------------------------------------ |
| `/player.html`    | 主控制面板（含播放控制、进度条、音量、菜单快捷入口）           |
| `/controls.html`  | 详细控制页（定位、缩放、音视频切换、DVD 菜单、窗口调整）       |
| `/variables.html` | 状态变量展示页（自动刷新）                        |
| `/browser.html`   | 文件浏览器                                |
| `/info.html`      | 当前播放信息（含 mIRC/Python Now Playing 输出） |

---

## 命令 API

### 基础命令

```
GET /command.html?wm_command=<id>
POST /command.html
  Content-Type: application/x-www-form-urlencoded
  wm_command=<id>
```

通过 `wm_command` 参数发送 MPC-HC 内部命令 ID（整数值）。

### 定位（Seek）

```
# 方式1: 百分比跳转 (0-100)
GET /command.html?wm_command=-1&percent=<0-100>

# 方式2: 跳转到指定时间
POST /command.html
  wm_command=-1&position=HH:MM:SS
```

> `-1` 是特殊命令 ID，表示_seek 操作，配合 `percent` 或 `position` 参数使用。

### 音量控制

```
GET /command.html?wm_command=-2&volume=<0-100>
```

> `-2` 是特殊命令 ID，表示音量设置操作。

### 扩展参数（extra）

部分命令需要额外参数：

```
POST /command.html
  wm_command=<id>&extra=<额外数据>
```

> 浏览器页面中文件链接使用 `redir` 参数：`/browser.html?path=<urlencoded>&redir=<目标页面>`

---

## 状态查询 API

### `/status.html` — 实时播放状态

返回格式为 JavaScript 函数调用文本：

```
OnStatus("文件名", "状态文本", 当前位置ms, "当前位置文本", 总时长ms, "总时长文本", 播放模式, 音量, "完整路径")
```

**参数说明：**

| 位置  | 参数   | 类型     | 说明                 |
| --- | ---- | ------ | ------------------ |
| 1   | 文件名  | string | 当前播放的文件名           |
| 2   | 状态   | string | 如 `"正在播放"`、`"已暂停"` |
| 3   | 当前位置 | int    | 当前播放位置（毫秒）         |
| 4   | 当前时间 | string | 格式化时间 `HH:MM:SS`   |
| 5   | 总时长  | int    | 媒体总长度（毫秒）          |
| 6   | 总时间  | string | 格式化总时长 `HH:MM:SS`  |
| 7   | 播放模式 | int    | 播放状态码              |
| 8   | 音量   | int    | 音量级别 (0-100)       |
| 9   | 完整路径 | string | 文件的绝对路径            |

**注意：** 该端点每 500ms 被前端轮询一次。

---

## 变量系统

### `/variables.html` — 状态变量页

返回 HTML，每个变量为 `<p id="变量名">值</p>` 格式。前端每 500ms 自动刷新。

**可用变量列表：**

| ID               | 类型     | 说明            | 示例值                                                                                             |
| ---------------- | ------ | ------------- | ----------------------------------------------------------------------------------------------- |
| `file`           | string | 文件名           | `[Airota&Nekomoe kissaten&VCB-Studio] Shoujo Shuumatsu Ryokou [11][Ma10p_1080p][x265_flac].mkv` |
| `filepatharg`    | string | URL 编码的完整文件路径 | `D:%5c%5bAirota%26Nekomoe...`                                                                   |
| `filepath`       | string | 完整文件路径        | `D:\...\Shoujo...mkv`                                                                           |
| `filedirarg`     | string | URL 编码的目录路径   | `D:%5c%5bAirota%26Nekomoe...`                                                                   |
| `filedir`        | string | 目录路径          | `D:\...\Shoujo Shuumatsu Ryokou [Ma10p_1080p]`                                                  |
| `state`          | int    | 播放状态码         | `2` (播放中)                                                                                       |
| `statestring`    | string | 播放状态文本        | `正在播放`                                                                                          |
| `position`       | int    | 当前位置（毫秒）      | `172490`                                                                                        |
| `positionstring` | string | 格式化当前位置       | `00:02:52`                                                                                      |
| `duration`       | int    | 总时长（毫秒）       | `1422045`                                                                                       |
| `durationstring` | string | 格式化总时长        | `00:23:42`                                                                                      |
| `volumelevel`    | int    | 音量级别 (0-100)  | `100`                                                                                           |
| `muted`          | int    | 静音状态          | `0` (未静音) / `1` (静音)                                                                            |
| `playbackrate`   | float  | 播放速率          | `1.000000`                                                                                      |
| `size`           | string | 文件大小          | `1.07 GB`                                                                                       |
| `reloadtime`     | int    | 重载计时器         | `0`                                                                                             |
| `version`        | string | 播放器版本         | `2.7.2.16`                                                                                      |
| `audiotrack`     | string | 当前音频轨信息       | `A: Japanese [jpn] (flac, 48000 Hz, stereo, s24) [default]`                                     |
| `subtitletrack`  | string | 当前字幕轨信息       | (空字符串表示无字幕)                                                                                     |

### `/info.html` — Now Playing 信息

返回单行 HTML，id 为 `mpchc_np`：

```html
<p id="mpchc_np">« MPC-HC v2.7.2.16 • 文件名.mkv • 00:03:39/00:23:42 • 1.07 GB »</p>
```

格式：`« 版本 • 文件名 • 当前时间/总时长 • 文件大小 »`

---

## 文件浏览器 API

### 列目录

```
GET /browser.html?path=<URL编码的目录路径>
```

**响应字段：**

| 列             | 说明                              |
| ------------- | ------------------------------- |
| Name          | 文件名/目录名                         |
| Type          | 文件类型：`Directory`、`Matroska` 或留空 |
| Size          | 文件大小（KB）                        |
| Date Modified | 修改时间 `YYYY.MM.DD HH:MM`         |

**导航方式：**

- 进入子目录：`/browser.html?path=<URL编码的子目录路径>`
- 返回上级：第一行固定为 `..`
- 点击文件直接播放

### 打开文件并跳转

```
GET /browser.html?path=<URL编码的文件路径>&redir=/player.html
```

> `redir` 参数指定播放后重定向的页面。

---

## 实时快照

```
GET /snapshot.jpg
```

返回当前视频帧的 JPEG 图像。前端在成功获取后 500ms 重新请求，失败后 5000ms 重试。

---

## 完整命令 ID 列表

### 文件操作

| ID  | 功能          |
| --- | ----------- |
| 800 | 打开文件        |
| 801 | 打开 DVD      |
| 802 | 打开设备        |
| 804 | 关闭文件        |
| 805 | 另存为         |
| 809 | 加载 (字幕/音频轨) |
| 810 | 保存 (字幕/音频轨) |
| 814 | 属性          |
| 816 | 退出/关闭播放器    |
| 886 | 选项          |

### 播放控制

| ID  | 功能          | 前端标签     |
| --- | ----------- | -------- |
| 887 | 播放          | `>`      |
| 888 | 暂停          | `\|\|`   |
| 890 | 停止          | `#`      |
| 891 | 步进 (单帧前进)   | `i>`     |
| 892 | 步退 (单帧后退)   | `<i`     |
| 893 | 跳转到指定时间     | Go To    |
| 894 | 降低播放速度      | `<<`     |
| 895 | 提高播放速度      | `>>`     |
| 897 | 减速 (rate--) | `< k`    |
| 898 | 加速 (rate++) | `k >`    |
| 889 | 切换视频预览      | (视频区域点击) |

### 跳转

| ID  | 功能     | 说明    |
| --- | ------ | ----- |
| 899 | 短跳转前进  | 小跳转   |
| 900 | 长跳转前进  | 大跳转   |
| 901 | 短跳转后退  | 小跳转   |
| 902 | 长跳转后退  | 大跳转   |
| 903 | 超短跳转后退 | 微跳转   |
| 904 | 超短跳转前进 | 微跳转   |
| 919 | 上一个文件  | `<<`  |
| 920 | 下一个文件  | `>>`  |
| 921 | 跳过回退   | `I<<` |
| 922 | 跳过前进   | `>>I` |

### 音频

| ID  | 功能         |
| --- | ---------- |
| 905 | 音频延迟 +10ms |
| 906 | 音频延迟 -10ms |
| 907 | 音量增加       |
| 908 | 音量减少       |
| 909 | 静音切换       |
| 952 | 下一条音轨      |
| 953 | 上一条音轨      |
| 961 | DVD 下一角度   |
| 962 | DVD 上一角度   |
| 963 | DVD 下一音轨   |
| 964 | DVD 上一音轨   |

### 字幕

| ID  | 功能       |
| --- | -------- |
| 954 | 下一条字幕    |
| 955 | 上一条字幕    |
| 965 | DVD 下一字幕 |
| 966 | DVD 上一字幕 |

### 视频画面位置

| ID  | 功能   |
| --- | ---- |
| 868 | 向左移动 |
| 869 | 向右移动 |
| 870 | 向上移动 |
| 871 | 向下移动 |
| 872 | 左上移动 |
| 873 | 右上移动 |
| 874 | 左下移动 |
| 875 | 右下移动 |
| 876 | 画面居中 |

### 视频画面大小

| ID  | 功能   |
| --- | ---- |
| 861 | 重置大小 |
| 862 | 增大画面 |
| 863 | 减小画面 |
| 864 | 增加宽度 |
| 865 | 减小宽度 |
| 866 | 增加高度 |
| 867 | 减小高度 |

### 缩放模式

| ID  | 功能             |
| --- | -------------- |
| 830 | 正常 (全屏)        |
| 831 | 不改变分辨率         |
| 832 | 缩放 50%         |
| 833 | 缩放 100%        |
| 834 | 缩放 200%        |
| 835 | 原始大小 (Half)    |
| 836 | 正常 (Normal)    |
| 837 | 双倍大小 (Double)  |
| 838 | 拉伸 (Stretch)   |
| 839 | 适应内部 (Inside)  |
| 840 | 适应外部 (Outside) |

### 视图/面板切换

| ID  | 功能     |
| --- | ------ |
| 817 | 标题栏和菜单 |
| 818 | 搜索栏    |
| 819 | 控制面板   |
| 820 | 信息面板   |
| 821 | 统计面板   |
| 822 | 状态面板   |
| 823 | 字幕同步   |
| 824 | 播放列表   |
| 825 | 截图工具   |
| 827 | 极简界面   |
| 828 | 紧凑界面   |
| 829 | 标准界面   |

### 窗口置顶

| ID  | 功能    |
| --- | ----- |
| 883 | 永不置顶  |
| 884 | 始终置顶  |
| 885 | 播放时置顶 |

### DVD 菜单导航

| ID  | 功能    |
| --- | ----- |
| 923 | 标题菜单  |
| 924 | 根菜单   |
| 925 | 字幕菜单  |
| 926 | 音频菜单  |
| 927 | 角度菜单  |
| 928 | 章节菜单  |
| 929 | 方向键左  |
| 930 | 方向键右  |
| 931 | 方向键上  |
| 932 | 方向键下  |
| 933 | 确认/激活 |
| 934 | 返回    |
| 935 | 离开菜单  |

### 滤镜与界面

| ID  | 功能             |
| --- | -------------- |
| 944 | Boss Key (老板键) |
| 949 | 播放器 (简洁)       |
| 950 | 播放器 (完整)       |
| 951 | 滤镜列表           |

---

## 使用示例

### cURL 示例

```bash
# 播放
curl "http://localhost:13579/command.html?wm_command=887"

# 暂停
curl "http://localhost:13579/command.html?wm_command=888"

# 停止
curl "http://localhost:13579/command.html?wm_command=890"

# 跳转到 50%
curl "http://localhost:13579/command.html?wm_command=-1&percent=50"

# 跳转到 00:05:00
curl -X POST "http://localhost:13579/command.html" -d "wm_command=-1&position=00:05:00"

# 设置音量为 75
curl "http://localhost:13579/command.html?wm_command=-2&volume=75"

# 查询状态
curl "http://localhost:13579/status.html"

# 列出 D 盘目录
curl "http://localhost:13579/browser.html?path=D:%5c"

# 播放指定文件
curl "http://localhost:13579/browser.html?path=D:%5cvideo.mkv"
```

### Python 示例

```python
import requests
import re

BASE = "http://localhost:13579"

# 发送命令
def send_command(cmd_id):
    requests.get(f"{BASE}/command.html", params={"wm_command": cmd_id})

# 播放/暂停
send_command(887)  # Play
send_command(888)  # Pause

# 跳转到百分比位置
def seek_percent(pct):
    requests.get(f"{BASE}/command.html", params={"wm_command": -1, "percent": pct})

# 跳转到时间（秒）
def seek_seconds(sec):
    h = sec // 3600
    m = (sec % 3600) // 60
    s = sec % 60
    requests.post(f"{BASE}/command.html", data={
        "wm_command": -1,
        "position": f"{h:02d}:{m:02d}:{s:02d}"
    })

# 设置音量 (0-100)
def set_volume(vol):
    requests.get(f"{BASE}/command.html", params={"wm_command": -2, "volume": vol})

# 获取播放状态
def get_status():
    resp = requests.get(f"{BASE}/status.html")
    # 解析 OnStatus("...", "...", num, ...)
    match = re.search(r'OnStatus\((.+)\)', resp.text)
    if match:
        # 按逗号分割，处理引号内的内容
        args = []
        current = ""
        in_quote = False
        for ch in match.group(1):
            if ch == '"' and (not current or current[-1] != '\\'):
                in_quote = not in_quote
                current += ch
            elif ch == ',' and not in_quote:
                args.append(current.strip().strip('"'))
                current = ""
            else:
                current += ch
        if current:
            args.append(current.strip().strip('"'))
        return {
            "file": args[0],
            "state": args[1],
            "position_ms": int(args[2]),
            "position": args[3],
            "duration_ms": int(args[4]),
            "duration": args[5],
            "playback_mode": int(args[6]),
            "volume": int(args[7]),
            "full_path": args[8]
        }
    return None

# 浏览目录
def browse(path):
    resp = requests.get(f"{BASE}/browser.html", params={"path": path})
    return resp.text

# 读取变量
def get_variable(var_id):
    from html.parser import HTMLParser
    resp = requests.get(f"{BASE}/variables.html")
    # 简单提取 <p id="xxx">value</p>
    pattern = rf'<p id="{var_id}">(.+?)</p>'
    match = re.search(pattern, resp.text)
    return match.group(1) if match else None

# 使用示例
if __name__ == "__main__":
    status = get_status()
    if status:
        print(f"正在播放: {status['file']}")
        print(f"进度: {status['position']} / {status['duration']}")
        print(f"音量: {status['volume']}%")

    # 静音
    send_command(909)

    # 下一条音轨
    send_command(952)
```

### JavaScript 示例 (浏览器端)

```javascript
// 发送命令
function cmd(id) {
  fetch(`/command.html?wm_command=${id}`);
}

// 跳转到百分比
function seek(percent) {
  fetch(`/command.html?wm_command=-1&percent=${percent}`);
}

// 设置音量
function volume(vol) {
  fetch(`/command.html?wm_command=-2&volume=${vol}`);
}

// 获取状态并解析
async function getStatus() {
  const resp = await fetch('/status.html');
  const text = await resp.text();
  const match = text.match(/OnStatus\((.+)\)/);
  if (match) {
    // 解析参数...
    const args = JSON.parse('[' + match[1] + ']');
    return {
      file: args[0],
      state: args[1],
      positionMs: args[2],
      position: args[3],
      durationMs: args[4],
      duration: args[5],
      volume: args[7],
      fullPath: args[8]
    };
  }
}

// 定时刷新状态
setInterval(async () => {
  const s = await getStatus();
  document.getElementById('status').textContent = 
    `${s.file} - ${s.position}/${s.position === s.duration ? 'Finished' : s.duration}`;
}, 1000);

// 使用
cmd(887);          // 播放
seek(50);          // 跳到 50%
volume(80);        // 设置音量 80%
```

---

## 前端 JavaScript 参考

MPC-HC Web Interface 的前端逻辑位于 `/javascript.js`，核心函数：

```javascript
// 发送命令
function onCommand(id) {
    makeRequest("command.html?wm_command=" + id);
}

// 通用 AJAX 请求（异步，不处理响应）
function makeRequest(req) {
    var httpRequest = getXMLHTTP();
    httpRequest.open("GET", req, true);
    httpRequest.send(null);
}

// 进度条拖动
function onSeek(percent) {
    makeRequest("command.html?wm_command=-1&percent=" + percent);
}

// 音量拖动
function onVolume(volume) {
    makeRequest("command.html?wm_command=-2&volume=" + volume);
}

// 状态轮询（每 500ms）
function statusLoop() {
    // 请求 /status.html，解析 Onstatus(...) 更新 UI
}

// 快照刷新
function loadSnapshot() {
    // 请求 /snapshot.jpg，每 500ms 刷新
}
```

---

*文档生成时间: 2026-07-08 | 数据来源: 本机 MPC-HC v2.7.2.16 Web Interface*
