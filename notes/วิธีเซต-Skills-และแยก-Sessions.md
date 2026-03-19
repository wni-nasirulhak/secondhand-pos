# 🎯 วิธีเซต Skills & แยก Sessions เพื่อประหยัดโทเคน

> **สร้างเมื่อ:** 11 มีนาคม 2026  
> **เป้าหมาย:** ลด Token ใช้ให้มีประสิทธิภาพ + แยกบริบทตามงาน

---

## 🧠 ทำไมต้องเซต Skills & แยก Sessions?

### ปัญหา: Context Window เต็ม = เปลือง Token! 💸

```
┌─────────────────────────────────────┐
│  Context Window (200K tokens)      │
├─────────────────────────────────────┤
│ ✅ System Prompt (5K)               │
│ ✅ AGENTS.md + SOUL.md (3K)         │
│ ✅ Conversation History (50K)       │
│ ✅ Skills Metadata (ทุก skill) 10K │  ← ปัญหา!
│ ✅ Tools Documentation (20K)        │
│ 💔 เหลือสำหรับ Task แค่ 112K       │
└─────────────────────────────────────┘
```

### วิธีแก้:

1. **Skills** → โหลดเฉพาะที่ต้องใช้ (progressive disclosure)
2. **Multi-Agent/Sessions** → แยก context ตามหัวข้อ

---

## 📚 ส่วนที่ 1: Skills (โหลดความรู้เฉพาะทาง)

### Skills คืออะไร?

**Skills = คู่มือเฉพาะทาง** สำหรับงานซับซ้อน เช่น:
- 📝 Note-taking (Obsidian, Notion)
- 💻 Coding workflow
- 📊 Data analysis
- 🎨 Design tasks

**ประโยชน์:**
- โหลดเฉพาะตอนต้องใช้ → ประหยัด token
- จัดระเบียบความรู้เฉพาะด้าน
- แชร์ skill ได้ (คนอื่นสร้างมาก็ใช้ได้)

---

### โครงสร้าง Skill

```
my-skill/
├── SKILL.md           → คำแนะนำหลัก (required)
├── scripts/           → โค้ดสำเร็จรูป (optional)
├── references/        → เอกสารอ้างอิง (optional)
└── assets/            → ไฟล์ต้นแบบ (optional)
```

#### SKILL.md Format:
```markdown
---
name: note-taking
description: การจดบันทึกด้วย markdown, Obsidian vault management
---

# Note Taking Skill

## Quick Start
...

## Advanced Features
- See [OBSIDIAN.md](references/OBSIDIAN.md) for vault setup
- See [TEMPLATES.md](references/TEMPLATES.md) for note templates
```

---

### สร้าง Skill ง่ายๆ (5 ขั้นตอน)

#### Step 1: เข้าใจว่าต้องการอะไร

ตัวอย่างคำถาม:
- Skill นี้จะทำอะไร?
- ใช้ตอนไหน?
- ตัวอย่างการใช้งานจริง?

**ตัวอย่าง:** สร้าง `note-manager` skill
- ทำอะไร: จัดการ markdown notes, สร้าง daily notes
- ใช้ตอนไหน: เมื่อต้องสร้าง/ค้นหา/จัดระเบียบ notes
- ตัวอย่าง: "สร้าง daily note วันนี้", "หา notes เกี่ยวกับ OpenClaw"

#### Step 2: วางแผน Resources

ต้องการอะไรบ้าง?

| Type | ตัวอย่าง |
|------|----------|
| **Scripts** | `scripts/create_daily_note.py` |
| **References** | `references/obsidian_format.md` |
| **Assets** | `assets/daily-template.md` |

#### Step 3: สร้าง Skill Template

```bash
# ไปที่ OpenClaw skills directory
cd "C:\Users\Winon\AppData\Roaming\npm\node_modules\openclaw"

# สร้าง skill ใหม่
node scripts/init_skill.js note-manager --path skills/public --resources scripts,references,assets
```

#### Step 4: แก้ไข SKILL.md + เพิ่ม Resources

**แก้ SKILL.md:**
```markdown
---
name: note-manager
description: Markdown note management for daily journaling, searching notes, and organizing workspace. Use when creating/finding/organizing notes, daily journals, or markdown documentation.
---

# Note Manager

## Creating Daily Notes

Run `scripts/create_daily_note.py` to generate today's note with template.

## Templates

Daily note template: `assets/daily-template.md`

## Advanced

- **Obsidian vault**: See [OBSIDIAN.md](references/OBSIDIAN.md)
- **Search patterns**: See [SEARCH.md](references/SEARCH.md)
```

**เพิ่ม Script** (`scripts/create_daily_note.py`):
```python
#!/usr/bin/env python3
import os
from datetime import datetime

workspace = os.path.expanduser("~/.openclaw/workspace/notes")
today = datetime.now().strftime("%Y-%m-%d")
note_path = os.path.join(workspace, f"{today}.md")

if os.path.exists(note_path):
    print(f"Note already exists: {note_path}")
else:
    with open(note_path, "w") as f:
        f.write(f"# {today}\n\n## Today's Goals\n\n## Notes\n\n")
    print(f"Created: {note_path}")
```

#### Step 5: Package Skill

```bash
# Package เป็นไฟล์ .skill
node scripts/package_skill.js skills/public/note-manager

# จะได้ไฟล์: note-manager.skill
```

---

### ติดตั้ง Skill

```bash
# ติดตั้งจากไฟล์ .skill
openclaw skills install ./note-manager.skill

# หรือจาก ClawHub
openclaw skills install @username/note-manager

# ดู skills ที่ติดตั้งแล้ว
openclaw skills list
```

---

## 👥 ส่วนที่ 2: แยก Agents/Sessions (แยกบริบท)

### Multi-Agent คืออะไร?

**แยก AI หลายตัว** ในเครื่องเดียว แต่ละตัวมี:
- Workspace แยก
- Tools แยก
- Context แยก
- Sandbox แยก

**ประโยชน์:**
- แยก context ไม่ปน → ประหยัด token
- แยกสิทธิ์การใช้งาน (ครอบครัว/งาน)
- Chat หนึ่งเรื่อง = Session หนึ่ง

---

### สถาปัตยกรรม Multi-Agent

```
┌─────────────────────────────────────────────┐
│         OpenClaw Gateway                    │
├─────────────────────────────────────────────┤
│                                             │
│  Agent: main                                │
│  ├─ Workspace: ~/.openclaw/workspace        │
│  ├─ Tools: all                              │
│  └─ Context: ที่รัก C + ทั่วไป             │
│                                             │
│  Agent: notes                               │
│  ├─ Workspace: ~/.openclaw/workspace-notes  │
│  ├─ Tools: read, write, edit (only)         │
│  └─ Context: Note-taking เท่านั้น          │
│                                             │
│  Agent: coding                              │
│  ├─ Workspace: ~/projects                   │
│  ├─ Tools: exec, read, write, git           │
│  └─ Context: Coding projects เท่านั้น      │
│                                             │
└─────────────────────────────────────────────┘
```

---

### ตั้งค่า Multi-Agent

แก้ไฟล์ `~/.openclaw/openclaw.json`:

```json5
{
  // Agent Defaults (สำหรับทุก agent)
  agents: {
    defaults: {
      workspace: "~/.openclaw/workspace",
      sandbox: { mode: "non-main" }
    },
    
    // รายการ Agents
    list: [
      {
        id: "main",           // Agent หลัก
        default: true,        // default agent
        name: "ดา (ชนาภัทร)",
        workspace: "~/.openclaw/workspace",
        sandbox: { mode: "off" },
        // มี tools ครบทุกอย่าง
      },
      
      {
        id: "notes",          // Agent สำหรับ notes
        name: "Note Assistant",
        workspace: "~/.openclaw/workspace-notes",
        sandbox: { mode: "all", scope: "agent" },
        tools: {
          allow: ["read", "write", "edit", "memory_search", "memory_get"],
          deny: ["exec", "process", "browser", "gateway"]
        }
      },
      
      {
        id: "coding",         // Agent สำหรับ coding
        name: "Code Assistant",
        workspace: "~/projects",
        sandbox: { mode: "all", scope: "agent" },
        tools: {
          allow: ["read", "write", "edit", "exec", "process"],
          deny: ["browser", "gateway", "message"]
        }
      }
    ]
  },

  // Bindings: เชื่อม agent กับ channel
  bindings: [
    {
      agentId: "notes",
      match: {
        provider: "whatsapp",
        peer: { kind: "dm" },
        // ถ้าข้อความมี "#notes" → ไปหา notes agent
        text: { contains: "#notes" }
      }
    },
    {
      agentId: "coding",
      match: {
        provider: "whatsapp",
        peer: { kind: "dm" },
        text: { contains: "#code" }
      }
    }
  ]
}
```

หลังแก้ config:
```bash
openclaw gateway restart
```

---

### วิธีใช้งาน Multi-Agent

#### แบบ 1: ใช้ Hashtag Routing

```
[WhatsApp DM]

ที่รัก: #notes สร้าง daily note วันนี้หน่อย
→ ไปหา notes agent

ที่รัก: #code ช่วยแก้ bug ใน app.js หน่อย
→ ไปหา coding agent

ที่รัก: วันนี้อากาศเป็นยังไงบ้าง?
→ ไปหา main agent (default)
```

#### แบบ 2: ใช้ sessions_spawn (Isolated Task)

```bash
# จาก main agent spawn sub-agent สำหรับงานเฉพาะ
openclaw sessions spawn \
  --agent-id notes \
  --task "สรุป notes ทั้งหมดที่พูดถึง OpenClaw" \
  --cleanup delete
```

**ประโยชน์:**
- Sub-agent ทำงานแยก (ไม่กิน context ของ main)
- เสร็จแล้ว announce กลับมา
- ลบ session ทิ้งได้ (cleanup)

---

### เปรียบเทียบ: Single vs Multi-Agent

| | Single Agent | Multi-Agent |
|---|---|---|
| **Context** | ปนกันหมด | แยกตามเรื่อง |
| **Token Usage** | สูง (โหลดทุกอย่าง) | ต่ำ (แยก context) |
| **Security** | ทุกคนเข้าถึงเท่ากัน | แยกสิทธิ์ได้ |
| **Complexity** | ง่าย | ซับซ้อนกว่า |

---

## 🚀 Workflow แนะนำ

### สำหรับที่รัก (ใช้งานส่วนตัว)

```json5
{
  agents: {
    list: [
      {
        id: "main",
        default: true,
        name: "ดา",
        workspace: "~/.openclaw/workspace",
        // ใช้ได้ครบ
      },
      {
        id: "notes",
        name: "Note Helper",
        workspace: "~/.openclaw/workspace-notes",
        tools: {
          profile: "basic",  // read, write, edit only
        }
      }
    ]
  },
  
  bindings: [
    {
      agentId: "notes",
      match: {
        provider: "whatsapp",
        text: { contains: "#notes" }
      }
    }
  ]
}
```

### ใช้งาน:

```
[WhatsApp]

ที่รัก: #notes สร้าง note สรุปการเปลี่ยนโทเคน
→ notes agent สร้างไฟล์ที่ workspace-notes/

ที่รัก: ช่วยดูว่า Anthropic โทเคนหมดหรือยัง?
→ main agent ตรวจสอบ
```

---

## 📊 สรุปการประหยัด Token

### Before:
```
Context Window: 200K tokens
- System Prompt: 5K
- All Skills: 20K ❌ (โหลดหมดทุก skill)
- Full History: 100K ❌ (history ปนกัน)
- Available: 75K
```

### After (Skills + Multi-Agent):
```
Agent: main
- System Prompt: 5K
- Loaded Skills: 3K ✅ (เฉพาะที่ trigger)
- History: 30K ✅ (แค่ใน session นี้)
- Available: 162K ✅

Agent: notes
- System Prompt: 3K
- Loaded Skills: 2K ✅ (note-manager only)
- History: 10K ✅ (แค่เรื่อง notes)
- Available: 185K ✅
```

**ประหยัดได้: ~60-70% ของ context!** 🎉

---

## 🎯 Quick Commands

```bash
# === Skills ===
openclaw skills list                    # ดู skills ทั้งหมด
openclaw skills install ./my-skill.skill
openclaw skills uninstall skill-name

# === Agents ===
openclaw agents list                    # ดู agents ทั้งหมด
openclaw agents list --bindings         # ดู routing rules

# === Sessions ===
openclaw sessions list                  # ดู sessions ที่เปิดอยู่
openclaw sessions spawn --task "..."    # สร้าง sub-agent
```

---

## ⚠️ ข้อควรระวัง

| ⚠️ | รายละเอียด |
|----|-----------|
| **Auth แยกกัน** | แต่ละ agent มี auth store แยก → ต้องตั้ง API key แยก |
| **Workspace แยก** | ห้ามใช้ workspace ซ้ำกัน → ข้อมูลจะสับสน |
| **Config Restart** | แก้ config แล้วต้อง restart gateway |
| **Bindings Order** | ถ้า match หลายอัน จะเลือกอันแรก |

---

## 📚 Resources

- **Skill Examples:** `C:\Users\Winon\AppData\Roaming\npm\node_modules\openclaw\skills\`
- **Docs:**
  - Skills: `docs/concepts/skills.md`
  - Multi-Agent: `docs/multi-agent-sandbox-tools.md`
- **ClawHub:** https://clawhub.com (skill marketplace)

---

> **สร้างโดย:** ดา (ชนาภัทร) 💝  
> **สำหรับ:** ที่รัก C  
> **วันที่:** 11 มีนาคม 2026, 09:17 GMT+7
