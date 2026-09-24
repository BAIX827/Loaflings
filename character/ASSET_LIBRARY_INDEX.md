# Loaflings 素材库索引

> 仓库中的 `modular/manifest.json` 和对应 SVG 是运行时素材的权威来源；
> 本页是制作与评审入口，不新增游戏内容。

**同步规则：**以后 Figma 素材库有更新时，按 `ASSET_PRODUCTION_GUIDE.md` 的
“Figma 更新与游戏同步”流程核对仓库与游戏。确认用于游戏的组件要在同一项
工作中接入运行时并实机验证；只有 Figma 组件、尚未导出或尚未接入的项目须标为
“未同步”，不能计作已在游戏中可用。

Figma 主工作文件（Education 团队）：[Loaflings — Modular 2D Asset Library](https://www.figma.com/design/ILmw8f2utXWkolzvA6QkNt)。
2026-09-24 已按 `ASSET_PRODUCTION_GUIDE.md` 第 2 节建立 `00–12` 页面树，
导入 78 个可编辑 SVG 组件、几何母版、两张视觉参考图和 8 个标准色变量；
`11 — Combination QA` 有 5 个基础、5 个变异和 8 个角色的组件实例组合。
原 [Starter 工作文件](https://www.figma.com/design/45TiVIXbktxyGumJQuYDLI)
仍为空白，Education 账号对其没有编辑权限，不再用作素材库入口。

## 已有素材（仓库中可用）

| Figma 页面 | 运行时 ID / 部件 | 数量 | 仓库目录 |
|---|---|---:|---|
| `02 — Bodies` | 5 种基础身体；另有草莓粉 Pointy、抹茶绿 Melted、摩卡色 Round 三种变异身体，各自保留独立前爪和尾巴 | 23 SVG | `modular/body/` |
| `03 — Expressions` | `expr_normal`, `expr_happy`, `expr_sleepy`, `expr_curious`, `expr_surprised`, `expr_focused`, `expr_grumpy`, `expr_excited` | 8 SVG | `modular/expressions/` |
| `04 — Clouds` | 原有 10 种云朵 + `cloud_sprout`, `cloud_strawberry`, `cloud_mocha` | 13 SVG | `modular/clouds/` |
| `05 — Markings` | `marking_patchy`, `marking_sesame`, `marking_dapple` | 3 SVG | `modular/markings/` |
| `06 — Headwear` | 原有 8 件 + 书签夹、小茶杯、沙色渔夫帽、淡紫画家帽 | 12 SVG | `modular/headwear/` |
| `07 — Facewear` | 原有 4 副眼镜 + 橄榄绿圆镜、浅蜜色镜、焦糖雀斑和彩色颜料点 | 8 SVG | `modular/facewear/` |
| `08 — Outfits` | 原有 7 件 + 可可书袋、鼠尾草茶围裙、蓝色侧袋和桃色画衣 | 11 SVG | `modular/outfits/` |

合计 78 个模块 SVG。`none` 是空槽，不是素材。组合模板位于
`modular/templates/`；5 个基础、5 个变异与 8 个角色搭配均是配方，不应导入为重复的完整角色组件。

## Figma 页面与导入状态

1. `00 — Visual Bible`：已放两张参考图、8 个标准色色块及对应变量；参考背景不烘焙进透明素材。
2. `01 — Canonical Base`：已放 `svg/Pet_Base_Master.svg` 作为几何参考；当前云朵组件以 `modular/clouds/` 的干净外轮廓版本为准。
3. `02–08`：已逐类导入上表的 78 个 SVG，保留 `1200 × 900` 画布和原文件 ID。
4. `11 — Combination QA`：已按 manifest 的 `drawOrder` 建立 18 个实例组合并做页面截图检查。运行时的缩放和锚点数值仍以 manifest 与实际预览为准。
5. `12 — Export Review`：保留为空白审核页；仅在正式批准后收录导出资产。

`09 — Hatch Stages` 和 `10 — Props & Effects` 暂作为分类占位；前者已有仓库里的蛋与成长图，
但尚未完成 Figma 导入；后者没有已确认的新运行时槽位。不要将占位视作已制作素材。

## 导入验收

- Figma 组件名与 manifest ID 一致；身体四层按现有部件拆分。
- 导入后仍可编辑，透明画布为 `1200 × 900`，锚点和层序与 manifest 一致。
- 云朵没有内部圆圈分界线，且与身体有清晰空气间隙。
- 在 Figma 和 `modular/preview.html` 分别检查典型组合；仓库 SVG 仍是正式交付文件。
