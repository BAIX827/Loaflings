# Loaflings 素材库索引

> 仓库中的 `modular/manifest.json` 和对应 SVG 是运行时素材的权威来源；
> 本页是制作与评审入口，不新增游戏内容。

Figma 工作文件：[Loaflings — Modular 2D Asset Library](https://www.figma.com/design/45TiVIXbktxyGumJQuYDLI)。
文件已创建，但 Figma Starter 套餐的 MCP 调用上限阻止了页面、变量和组件写入；
因此当前 Figma 文件仍为空白，不能作为已完成的素材库使用。恢复写入后按
`ASSET_PRODUCTION_GUIDE.md` 第 2 节建立页面，并从下表对应的 SVG 导入组件。

## 已有素材（仓库中可用）

| Figma 页面 | 运行时 ID / 部件 | 数量 | 仓库目录 |
|---|---|---:|---|
| `02 — Bodies` | `body_classic`, `body_chubby`, `body_long`；各有 body、tail、paws、shadow | 12 SVG | `modular/body/` |
| `03 — Expressions` | `expr_normal`, `expr_happy`, `expr_sleepy`, `expr_curious`, `expr_surprised`, `expr_focused`, `expr_grumpy`, `expr_excited` | 8 SVG | `modular/expressions/` |
| `04 — Clouds` | `cloud_normal`, `cloud_happy`, `cloud_sleepy`, `cloud_curious`, `cloud_focused`, `cloud_excited`, `cloud_rainy`, `cloud_stormy`, `cloud_dreamy`, `cloud_twin` | 10 SVG | `modular/clouds/` |
| `05 — Markings` | `marking_patchy` | 1 SVG | `modular/markings/` |
| `06 — Headwear` | `hat_knit_blue`, `hat_nightcap_lavender`, `hat_beret_peach`, `hat_rain_yellow` | 4 SVG | `modular/headwear/` |
| `07 — Facewear` | `glasses_round_cocoa`, `glasses_focus_blue` | 2 SVG | `modular/facewear/` |
| `08 — Outfits` | `outfit_vest_sage`, `outfit_apron_peach`, `outfit_raincoat_sky` | 3 SVG | `modular/outfits/` |

合计 40 个模块 SVG。`none` 是空槽，不是素材。组合模板位于
`modular/templates/`；它们是配方，不应当导入为 5 套重复的完整角色组件。

## 首版 Figma 导入顺序

1. `00 — Visual Bible`：放角色规范、8 个标准色和正/侧/背面参考；背景色仅用于展示，不烘焙进透明素材。
2. `01 — Canonical Base`：放 `svg/Pet_Base_Master.svg` 作为几何参考；当前云朵组件以 `modular/clouds/` 的干净外轮廓版本为准。
3. `02–08`：逐类导入上表的 40 个现有 SVG，保持 `1200 × 900` 画布与原 ID；不要新造图案或角色。
4. `11 — Combination QA`：按 manifest 的 `drawOrder` 检查 Classic、Chubby、Long 上的表情、云和穿戴。
5. `12 — Export Review`：仅收录通过小尺寸、透明背景和兼容性检查的组件。

`09 — Hatch Stages` 和 `10 — Props & Effects` 暂作为分类占位；前者已有仓库里的蛋与成长图，
但尚未完成 Figma 导入；后者没有已确认的新运行时槽位。不要将占位视作已制作素材。

## 导入验收

- Figma 组件名与 manifest ID 一致；身体四层按现有部件拆分。
- 导入后仍可编辑，透明画布为 `1200 × 900`，锚点和层序与 manifest 一致。
- 云朵没有内部圆圈分界线，且与身体有清晰空气间隙。
- 在 Figma 和 `modular/preview.html` 分别检查典型组合；仓库 SVG 仍是正式交付文件。
