# MPC-HC Web UI (React + MUI)

一个现代化的 MPC-HC 播放器远程控制 Web UI，用于替换 MPC-HC 自带的经典 Web Interface。

## 功能

- **播放控制**: 播放/暂停/停止、进度条拖动跳转、快进/快退（短跳/长跳）、单帧步进、音量调节、静音
- **状态显示**: 当前文件名、播放状态、时间位置/总时长（毫秒级精度）
- **文件浏览**: 浏览本地文件系统，点击文件立即播放

## 技术栈

| 类别 | 选型 |
|------|------|
| 构建 | Vite 6 |
| 框架 | React 19 + TypeScript 5 |
| UI 库 | MUI (Material UI) v6 + @mui/icons-material |
| 状态管理 | React Hooks (无第三方状态库) |
| API 通信 | 原生 fetch + 500ms 轮询 |

## 与 MPC-HC 集成

### 部署方式

MPC-HC 的 Web Interface 支持 "Serve pages from" 选项，可以将构建后的静态文件目录指定为自定义 Web 根目录。

**步骤：**
1. 运行 `npm run build`，产物在 `dist/` 目录
2. 打开 MPC-HC → 视图 → 选项 → 播放器 → Web Interface
3. 勾选 "Serve pages from"，路径指向本项目的 `dist/` 目录
4. 浏览器访问 `http://localhost:13579/index.html`（或你在 MPC-HC 中配置的默认首页文件名）

> **注意**: MPC-HC 内部端点（`/command.html`, `/status.html`, `/browser.html` 等）优先级高于自定义文件，因此自定义页面需使用不同于内部页面的文件名（如 `index.html`）。

### 关键 API 端点

| 端点 | 用途 |
|------|------|
| `/command.html?wm_command=<id>` | 发送播放控制命令 |
| `/command.html?wm_command=-1&percent=<0-100>` | 进度跳转（百分比） |
| `/command.html?wm_command=-1&position=HH:MM:SS` | 时间跳转 |
| `/command.html?wm_command=-2&volume=<0-100>` | 音量设置 |
| `/status.html` | 获取播放状态（返回 `OnStatus(...)` JS 格式文本） |
| `/browser.html?path=<URL编码路径>` | 浏览目录或播放文件 |

### wm_command 完整列表

参见 [docs/mpchc-web-api.md](./docs/mpchc-web-api.md)。

## 项目结构

```
mpchc-webui/
├── index.html                  # Vite 入口 HTML
├── package.json                # 项目依赖与脚本
├── vite.config.ts              # Vite 构建配置（含 dev proxy）
├── tsconfig.json               # TypeScript 配置
├── QWEN.md                     # 本文件
├── public/
│   └── favicon.svg
├── docs/
│   └── mpchc-web-api.md        # MPC-HC Web Interface API 文档
└── src/
    ├── main.tsx                # React 应用入口
    ├── App.tsx                 # 根组件（Tab 布局）
    ├── theme.ts                # MUI 主题配置
    ├── api/
    │   └── mpchc.ts            # MPC-HC API 通信层
    ├── hooks/
    │   ├── useStatus.ts        # 播放状态轮询 hook
    │   └── useFileBrowser.ts   # 文件浏览数据 hook
    └── components/
        ├── NowPlaying.tsx      # 当前播放信息展示
        ├── PlayerControls.tsx  # 播放控制按钮组 + 进度条 + 音量
        └── FileBrowser.tsx     # 文件/目录列表
```

## 开发

```bash
# 安装依赖
npm install

# 启动开发服务器（需同时运行 MPC-HC 并开启 Web Interface）
npm run dev

# 构建生产产物
npm run build
```

开发模式下 Vite 会将 `/command.html`、`/status.html` 等请求代理到 `localhost:13579`（MPC-HC）。

## 已知限制

- **无播放列表 API**: MPC-HC Web Interface 不提供播放列表的增删查接口，因此本 UI 无法管理播放列表，仅支持通过浏览文件触发播放。
- **文件点击即播放**: 由 `browser.html?path=` 触发的播放会立即开始，无"仅加入队列"选项。
