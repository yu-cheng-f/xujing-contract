import { useState, useRef } from 'react'
import './index.css'

/* ============================================================
   墟境契约 · 青绿水墨
   ============================================================ */

const BASE = import.meta.env.BASE_URL
const B = (k) => `${BASE}assets/b-${k}.jpg`
const U = (k) => `${BASE}assets/u-${k}.png`

const CARDS = [
  { id:1, name:"青麟", cost:1, atk:1, hp:3, q:"common", img:B("qinglin"), d:"入场 · 灵息 +1" },
  { id:2, name:"玄狐", cost:2, atk:2, hp:2, q:"rare",   img:B("xuanhu"),  d:"出牌 · 抽一张牌" },
  { id:3, name:"靈鹿", cost:3, atk:3, hp:4, q:"rare",   img:B("linglu"),  d:"治愈 · 回 2 元氣" },
  { id:4, name:"雲鶴", cost:4, atk:4, hp:4, q:"epic",   img:B("yunhe"),   d:"飞行 · 无视前排" },
  { id:5, name:"玉龜", cost:5, atk:2, hp:8, q:"epic",   img:B("yugui"),   d:"受创 · 反伤 2 点" },
  { id:6, name:"白澤", cost:7, atk:7, hp:7, q:"myth",   img:B("baize"),   d:"入场 · 全体 +1/+1" },
]

const Q_COLOR = { common:"#8aa79a", rare:"#5b9bc4", epic:"#8f76c9", myth:"#c8952f" }

const BOARD = [
  { r:0, c:0, u:{ n:"血鸦", a:3, h:2, vh:80,  img:U("f-raven") } },
  { r:0, c:2, u:{ n:"尸傀", a:4, h:5, vh:108, img:U("f-corpse") } },
  { r:0, c:4, u:{ n:"血鸦", a:3, h:2, vh:80,  img:U("f-raven") } },
  { r:1, c:1, u:{ n:"骸骨狼", a:5, h:3, vh:72, img:U("f-wolf") } },
  { r:1, c:3, u:{ n:"枯巢蜥", a:2, h:4, vh:78, img:U("f-lizard") } },
  { r:2, c:0, u:{ n:"青麟", a:1, h:3, vh:96,  img:U("qinglin") } },
  { r:2, c:2, u:{ n:"玄狐", a:2, h:2, vh:84,  img:U("xuanhu") } },
  { r:2, c:4, u:{ n:"靈鹿", a:3, h:4, vh:100, img:U("linglu") } },
  { r:3, c:1, u:{ n:"玉龜", a:2, h:8, vh:46,  img:U("yugui") } },
  { r:3, c:3, u:{ n:"雲鶴", a:4, h:4, vh:94,  img:U("yunhe") } },
]

const CLOUDS = Array.from({ length: 9 }, (_, i) => ({
  left: `${(i * 31 + 7) % 94}%`,
  top: `${(i * 19 + 12) % 78}%`,
  scale: 0.6 + (i % 4) * 0.22,
  delay: `${(i * 2.3) % 14}s`,
  dur: `${22 + (i % 5) * 6}s`,
}))

function HeroRow({ enemy, name, hp, maxHp, mana, maxMana, img }) {
  return (
    <div className={`hero ${enemy ? 'foe' : 'own'}`}>
      <div className="ring">
        <img src={img} alt="" />
      </div>
      <div className="hero-meta">
        <div className="hero-top">
          <span className="hero-name">{name}</span>
          <span className="hero-qi">元氣</span>
        </div>
        <div className="hp-track">
          <div className="hp-fill" style={{ width: `${(hp / maxHp) * 100}%` }} />
          <div className="hp-gloss" />
        </div>
        <div className="beads">
          {Array.from({ length: maxMana }).map((_, i) => (
            <i key={i} className={i < mana ? 'on' : ''} />
          ))}
        </div>
      </div>
      <div className="hp-num">{hp}</div>
    </div>
  )
}

function Unit({ u, foe, proto }) {
  return (
    <div className={`unit ${foe ? 'foe' : 'own'} ${proto ? 'proto' : ''}`}>
      {proto && <img className="depth" src={u.img} alt="" aria-hidden />}
      <div className="unit-shadow" />
      <img src={u.img} alt="" style={{ '--uh': `${u.vh}px` }} />
      <div className="badge atk">{u.a}</div>
      <div className="badge hp">{u.h}</div>
    </div>
  )
}

function Card({ card, playable, onTap, onHold, i, total, sel }) {
  const mid = (total - 1) / 2
  const off = i - mid
  const timer = useRef(null)
  const held = useRef(false)

  const down = () => {
    held.current = false
    timer.current = setTimeout(() => {
      held.current = true
      onHold(card)
    }, 460)
  }
  const stop = () => clearTimeout(timer.current)
  const up = () => {
    stop()
    if (!held.current) onTap(card)
  }

  return (
    <div
      className={`card q-${card.q} ${playable ? '' : 'dim'} ${sel ? 'sel' : ''}`}
      style={{ '--rz': '0deg', '--ty': '0px' }}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={stop}
      onPointerCancel={stop}
      onContextMenu={e => e.preventDefault()}
    >
      <div className="card-inner">
        <img className="card-art" src={card.img} alt="" />
        <div className="vname">{card.name}</div>
        <div className="cost">{card.cost}</div>
        <div className="card-desc">{card.d}</div>
        <div className="card-stat">
          <span className="a">{card.atk}</span>
          <span className="seal">契</span>
          <span className="h">{card.hp}</span>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  const [turn, setTurn] = useState(4)
  const [mana, setMana] = useState(6)
  const [hand, setHand] = useState(CARDS)
  const [sel, setSel] = useState(null)
  const [detail, setDetail] = useState(null)

  const play = (card) => {
    setMana(m => m - card.cost)
    setHand(h => h.filter(x => x.id !== card.id))
  }

  const tapCard = (card) => {
    if (card.cost > mana) return
    setSel(s => (s === card.id ? null : card.id))
  }

  const confirmSet = (card) => {
    if (!card || card.cost > mana) return
    play(card)
    setSel(null)
  }

  const confirmPlay = () => confirmSet(hand.find(x => x.id === sel))

  const selCard = hand.find(x => x.id === sel)

  return (
    <div className="app">
      <div className="bg" />
      <div className="mist">
        {CLOUDS.map((c, i) => (
          <div key={i} className="cloud" style={{
            left: c.left, top: c.top,
            width: `${120 * c.scale}px`,
            height: `${44 * c.scale}px`,
            animationDelay: c.delay, animationDuration: c.dur,
          }} />
        ))}
      </div>

      <header className="top">
        <span className="ln" />
        <span className="title">墟境 · 契约</span>
        <span className="ln" />
      </header>

      <HeroRow enemy name="蚀 · 枯巢领主" hp={22} maxHp={30}
        mana={4} maxMana={6} img={`${BASE}assets/l-hero-enemy.jpg`} />

      <main className="board">
        <div className="board-plane">
          <div className="grid">
            {Array.from({ length: 4 }, (_, r) =>
              Array.from({ length: 5 }, (_, c) => {
                const dark = (r + c) % 2 === 1
                const foe = r < 2
                const unit = BOARD.find(x => x.r === r && x.c === c)
                return (
                  <div key={`${r}-${c}`}
                    className={`tile ${dark ? 'dark' : ''} ${foe ? 'foe' : 'own'} ${r === 1 ? 'seam' : ''}`}>
                    {unit && <span className={`pedestal ${foe ? 'foe' : ''}`} />}
                    {unit && <Unit u={unit.u} foe={foe} proto />}
                  </div>
                )
              })
            )}
          </div>
        </div>
        <span className="side-tag foe">敌方</span>
        <span className="side-tag own">我方</span>
      </main>

      <HeroRow name="锋 · 剑契使" hp={26} maxHp={30}
        mana={mana} maxMana={6} img={`${BASE}assets/l-hero-self.jpg`} />

      <footer className="hand">
        {selCard && (
          <div className="action-bar">
            <button className="ab-cancel" onClick={() => setSel(null)}>取消</button>
            <button className="ab-play" onClick={confirmPlay}>
              布阵 <em>· 耗 {selCard.cost} 灵</em>
            </button>
          </div>
        )}
        <div className="hand-row">
          {hand.map((c, i) => (
            <Card key={c.id} card={c} i={i} total={hand.length}
              playable={c.cost <= mana}
              sel={sel === c.id}
              onTap={tapCard}
              onHold={setDetail} />
          ))}
        </div>
      </footer>

      {detail && (
        <div className="detail-mask" onClick={() => setDetail(null)}>
          <div className="detail" onClick={e => e.stopPropagation()}>
            <img className="detail-art" src={detail.img} alt="" />
            <div className="detail-body">
              <div className="detail-head">
                <h3>{detail.name}</h3>
                <span className="detail-cost">{detail.cost} 灵</span>
              </div>
              <p className="detail-desc">{detail.d}</p>
              <div className="detail-stats">
                <span>攻 {detail.atk}</span>
                <span>命 {detail.hp}</span>
                <span>品质 {({ common:'凡', rare:'良', epic:'珍', myth:'神' })[detail.q] || '凡'}</span>
              </div>
            </div>
            <div className="detail-btns">
              <button className="ab-cancel" onClick={() => setDetail(null)}>关闭</button>
              <button
                className="ab-play"
                disabled={detail.cost > mana}
                onClick={() => { confirmSet(detail); setDetail(null) }}
              >
                {detail.cost > mana ? '灵力不足' : '布阵'}
              </button>
            </div>
          </div>
        </div>
      )}

      <button className="end-btn" onClick={() => { setTurn(t => t + 1); setMana(6) }}>
        <span>终</span>
        <em>第 {turn} 回合</em>
      </button>
    </div>
  )
}
