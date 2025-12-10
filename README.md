# 风机选型全栈示例 (Vue + Node)

本项目提供一套可直接运行的风机选型软件，包含 Vue 3 + Vite 前端、Node.js + Express 后端，以及 SQLite 数据库。支持 Excel 数据导入/导出、筛选查询、静态构建发布。

## 目录结构

- `server/`：Node.js/Express 接口与 SQLite 数据库初始化、Excel 导入导出逻辑。
- `frontend/`：Vue 3 + Vite 前端，含筛选表单、表格、导入导出面板等组件。
- `package.json`：顶层脚本，提供一键同时启动前后端的 `npm run dev`。

## 快速开始

> 注意：需要 Node 18+ 与 npm。网络可用时先执行 `npm install` 安装依赖；当前环境若无法直接下载 npm 包，可在有网络的机器上安装后将 `node_modules` 拷贝过来运行。

```bash
# 安装根依赖（包含后端）
npm install

# 安装前端依赖
(cd frontend && npm install)

# 启动开发环境（前后端并行，默认端口：前端 5173、后端 3000）
npm run dev

# 或仅启动后端
npm run dev:server

# 构建前端静态文件
npm run build
```

前端默认通过 Vite 代理访问 `http://localhost:3000/api`。生产模式下可将前端打包产物放在 `frontend/dist`，后端会自动提供静态文件服务。

## 接口概要

- `GET /api/health`：健康检查。
- `GET /api/fans`：支持查询参数 `flowMin`、`flowMax`、`pressureMin`、`pressureMax` 进行筛选。
- `POST /api/fans`：新增单条风机数据。
- `PUT /api/fans/:id`、`DELETE /api/fans/:id`：更新/删除。
- `POST /api/import`：上传 Excel 文件（字段：model/airflow/pressure/power/rpm/efficiency），自动插入或更新。
- `GET /api/export`：导出当前数据库为 Excel 文件。

## Excel 模版

Excel 文件需要包含 `model`, `airflow`, `pressure`, `power`, `rpm`, `efficiency` 等字段（支持中英文大小写常见写法，例如“型号/风量/风压/功率/转速/效率”）。导入时会按 `model` 唯一键进行插入或更新。

## 数据持久化

SQLite 数据文件位于 `server/data/fans.db`。首次启动会自动注入一批示例数据，便于快速体验筛选和导出能力。

## 设计说明

- 前端：使用组合式 API，提供筛选表单、表格展示、Excel 导入/导出面板，内置渐变背景和卡片式设计。
- 后端：Express + SQLite，带 CORS、JSON 解析、文件上传（multer），导入导出使用 `xlsx` 库。
- 部署：`npm run build` 后可将 `frontend/dist` 与 `server` 一起部署，或将静态资源交给任意前端服务器。
