import { useEffect, useState } from "react";
import mainFrog from "./assets/sapo.png";
import HarryFrog from "./assets/bruxo.png";
import DarthFrog from "./assets/darth vage.png";
import SpiderFrog from "./assets/miranha.png";
import "./App.css";

// Tipos para organizar melhor
type Skin = {
  id: string;
  name: string;
  cost: number;
  image: string;
  unlocked: boolean;
};

type Upgrade = {
  id: string;
  name: string;
  kind: "perClick" | "perSecond";
  baseValue: number; // quanto aumenta por nível
  baseCost: number; // custo do nível 1
  costFactor: number; // multiplicador do custo por nível
  level: number; // nível atual
  maxLevel: number; // máximo de níveis (>= 3)
};

function App() {
  const [count, setCount] = useState(0);

  const [perClick, setPerClick] = useState(1);
  const [perSecond, setPerSecond] = useState(0);

  const [showHint, setShowHint] = useState(true);
  const [showHint1, setShowHint1] = useState(true);
  const [showHint2, setShowHint2] = useState(true);

  // Skins do jogo
  const [skins, setSkins] = useState<Skin[]>([
    { id: "frog", name: "Frog", cost: 0, image: mainFrog, unlocked: true },
    {
      id: "spider",
      name: "Spider Frog",
      cost: 100,
      image: SpiderFrog,
      unlocked: false,
    },
    {
      id: "wizzard",
      name: "Wizzard Frog",
      cost: 1000,
      image: HarryFrog,
      unlocked: false,
    },
    {
      id: "vader",
      name: "Darth Frog",
      cost: 2000,
      image: DarthFrog,
      unlocked: false,
    },
  ]);

  const [upgrades, setUpgrades] = useState<Upgrade[]>([
    {
      id: "u1",
      name: "+1 p/click",
      kind: "perClick",
      baseValue: 1,
      baseCost: 10,
      costFactor: 1.7,
      level: 0,
      maxLevel: 3,
    },
    {
      id: "u2",
      name: "+5 p/click",
      kind: "perClick",
      baseValue: 5,
      baseCost: 50,
      costFactor: 1.75,
      level: 0,
      maxLevel: 3,
    },
    {
      id: "u3",
      name: "+1 p/second",
      kind: "perSecond",
      baseValue: 1,
      baseCost: 200,
      costFactor: 1.8,
      level: 0,
      maxLevel: 3,
    },
    {
      id: "u4",
      name: "+5 p/second",
      kind: "perSecond",
      baseValue: 5,
      baseCost: 500,
      costFactor: 1.8,
      level: 0,
      maxLevel: 3,
    },
  ]);

  const nextCost = (u: Upgrade) =>
    Math.floor(u.baseCost * Math.pow(u.costFactor, u.level));

  const isMax = (u: Upgrade) => u.level >= u.maxLevel;

  const [activeSkin, setActiveSkin] = useState<string>("frog");

  useEffect(() => {
    const id = setInterval(() => {
      if (perSecond > 0) setCount((c) => c + perSecond);
    }, 1000);
    return () => clearInterval(id);
  }, [perSecond]);

  // Função de compra de skin
  const handleBuySkin = (skin: Skin) => {
    if (!skin.unlocked && count >= skin.cost) {
      setCount((prev) => prev - skin.cost);
      setSkins((prev) =>
        prev.map((s) => (s.id === skin.id ? { ...s, unlocked: true } : s))
      );
      setActiveSkin(skin.id);
    } else if (skin.unlocked) {
      setActiveSkin(skin.id);
    }
  };

  const handleBuyUpgrade = (u: Upgrade) => {
    if (isMax(u)) return;
    const cost = nextCost(u);
    if (count < cost) return;

    setCount((c) => c - cost);
    setUpgrades((prev) =>
      prev.map((x) => (x.id === u.id ? { ...x, level: x.level + 1 } : x))
    );

    if (u.kind === "perClick") {
      setPerClick((p) => p + u.baseValue);
    } else {
      setPerSecond((p) => p + u.baseValue);
    }
  };

  const currentSkin = skins.find((s) => s.id === activeSkin);
  const [skin, setSkin] = useState(currentSkin?.id || "frog");

  return (
    <>
      {/* Scoreboard */}
      <div id="scoreboard">
        <img src={mainFrog} alt="Pontuação" />
        <h3>{count}</h3>
      </div>

      {/* Botão principal */}
      <div className="card">
        <button
          id={skin}
          onClick={() => {
            setCount((c) => c + perClick);
            setShowHint(false);
          }}
        >
          <img src={currentSkin?.image} alt={currentSkin?.name} />
        </button>
        {showHint && <p id="cfi">Click on the frog to increase the score!</p>}
      </div>

      {/* Sessão de upgrades */}
      {showHint1 && count >= 10 && <p id="bcu">Buy a clicker upgrade!</p>}
      <div id="upgradeSection">
        {upgrades.map((u) => {
          const cost = nextCost(u);
          const maxed = isMax(u);
          const canBuy = !maxed && count >= cost;

          return (
            <button
              key={u.id}
              className="upgradeButton"
              onClick={() => {
                handleBuyUpgrade(u);
                setShowHint1(false);
              }}
              disabled={maxed || !canBuy}
              style={{
                border: maxed
                  ? "2px solid gold"
                  : canBuy
                  ? "2px solid green"
                  : "2px solid gray",
              }}
              title={
                maxed
                  ? "MAX"
                  : `Custo: ${cost} ${
                      u.kind === "perClick" ? "por clique" : "por segundo"
                    }`
              }
            >
              {u.name}
              {` (${cost})`}
            </button>
          );
        })}
      </div>

      {/* Sessão de skins */}
      {showHint2 && count >= 100 && <p id="bns">Buy a new skin!</p>}
      <div id="skinSection">
        {skins.map((skin) => (
          <div key={skin.id} className="skinBox">
            <button
              className="skinButton"
              onClick={() => {
                handleBuySkin(skin);
                setShowHint2(false);
                setSkin(skin.id);
              }}
              disabled={!skin.unlocked && count < skin.cost}
            >
              <img src={skin.image} alt={skin.name} />
            </button>
            {!skin.unlocked && <p>{skin.cost}</p>}
          </div>
        ))}
      </div>
    </>
  );
}

export default App;
