"use client";

import type {
  GameSnapshot,
  InteractionId,
  MajorChoice,
  PlayerTelemetry,
} from "@/components/game/game-types";

export type GameSettings = {
  filmGrain: boolean;
  sensitivity: number;
  volume: number;
};

export type DialogueLine = {
  id: number;
  speaker: "Nihat Bey" | "Sen";
  text: string;
};

export type ChoiceOption<Action extends string> = {
  action: Action;
  detail: string;
  label: string;
  tone?: "danger" | "normal";
};

export function MainMenu({
  onClosePanel,
  onOpenPanel,
  onSettingsChange,
  onStart,
  panel,
  settings,
}: {
  onClosePanel: () => void;
  onOpenPanel: (panel: "controls" | "settings") => void;
  onSettingsChange: (settings: GameSettings) => void;
  onStart: () => void;
  panel: "controls" | "settings" | null;
  settings: GameSettings;
}) {
  return (
    <section className="main-menu" aria-labelledby="game-title">
      <div className="main-menu__content">
        <h1 id="game-title">İntihab</h1>
        <span>Bir gün. İki seçenek. Sayısız ihtimal.</span>
        <div className="main-menu__actions">
          <button className="main-menu__start" onClick={onStart} type="button">Başla</button>
          <button onClick={() => onOpenPanel("settings")} type="button">Ayarlar</button>
          <button onClick={() => onOpenPanel("controls")} type="button">Kontroller</button>
        </div>
      </div>

      {panel ? (
        <div className="menu-modal" role="dialog" aria-modal="true" aria-label={panel === "settings" ? "Ayarlar" : "Kontroller"}>
          <div className="menu-modal__panel">
            <button className="menu-modal__close" onClick={onClosePanel} type="button" aria-label="Kapat">×</button>
            <h2>{panel === "settings" ? "Ayarlar" : "Kontroller"}</h2>
            {panel === "settings" ? (
              <div className="settings-list">
                <label>
                  <span>Fare hassasiyeti <b>{settings.sensitivity.toFixed(1)}</b></span>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.sensitivity}
                    onChange={(event) => onSettingsChange({ ...settings, sensitivity: Number(event.target.value) })}
                  />
                </label>
                <label>
                  <span>Ses <b>{Math.round(settings.volume * 100)}</b></span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.volume}
                    onChange={(event) => onSettingsChange({ ...settings, volume: Number(event.target.value) })}
                  />
                </label>
                <label className="toggle-setting">
                  <span>Film dokusu</span>
                  <input
                    checked={settings.filmGrain}
                    onChange={(event) => onSettingsChange({ ...settings, filmGrain: event.target.checked })}
                    type="checkbox"
                  />
                </label>
              </div>
            ) : (
              <div className="controls-page">
                <div><kbd>W A S D</kbd><span>Hareket</span></div>
                <div><kbd>FARE</kbd><span>Bak / ateş et</span></div>
                <div><kbd>E</kbd><span>Etkileşim</span></div>
                <div><kbd>M</kbd><span>Büyük harita</span></div>
                <div><kbd>1 / 2</kbd><span>Eller / tabanca</span></div>
                <div><kbd>R</kbd><span>Şarjör değiştir</span></div>
                <div><kbd>SHIFT</kbd><span>Koş</span></div>
                <div><kbd>SPACE</kbd><span>Zıpla</span></div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MapPlayer({ telemetry }: { telemetry: PlayerTelemetry }) {
  const left = Math.max(2, Math.min(98, ((telemetry.x + 45) / 90) * 100));
  const top = Math.max(2, Math.min(98, ((telemetry.z + 30) / 76) * 100));
  return (
    <span
      className="map-player"
      data-player-heading={telemetry.heading.toFixed(2)}
      data-player-x={telemetry.x.toFixed(2)}
      data-player-z={telemetry.z.toFixed(2)}
      style={{ left: `${left}%`, top: `${top}%`, transform: `translate(-50%, -50%) rotate(${telemetry.heading}rad)` }}
    />
  );
}

function MapGeometry({ large = false }: { large?: boolean }) {
  return (
    <>
      <div className="map-road map-road--main">{large ? <span>Mahalle Caddesi</span> : null}</div>
      <div className="map-road map-road--cross">{large ? <span>Doğu Sokağı</span> : null}</div>
      <div className="map-place map-place--home"><span>{large ? "Bizim ev" : "EV"}</span></div>
      <div className="map-place map-place--garage"><span>{large ? "Garaj" : "G"}</span></div>
      <div className="map-place map-place--neighbor"><span>{large ? "Nihat Bey" : "N"}</span></div>
      <div className="map-place map-place--block-a"><span>{large ? "Kuzey blokları" : ""}</span></div>
      <div className="map-place map-place--block-b"><span>{large ? "Doğu evleri" : ""}</span></div>
      <div className="map-garden map-garden--ours">{large ? <span>Bizim bahçe</span> : null}</div>
      <div className="map-garden map-garden--neighbor">{large ? <span>Nihat Bey&apos;in bahçesi</span> : null}</div>
    </>
  );
}

export function GameHud({
  interaction,
  interactionLabel,
  locked,
  onLock,
  snapshot,
  telemetry,
  toast,
}: {
  interaction: InteractionId;
  interactionLabel: string | null;
  locked: boolean;
  onLock: () => void;
  snapshot: GameSnapshot;
  telemetry: PlayerTelemetry;
  toast: string | null;
}) {
  return (
    <>
      <aside className="compact-map" aria-label="Mini harita">
        <div className="compact-map__canvas">
          <MapGeometry />
          <MapPlayer telemetry={telemetry} />
        </div>
        <div className="compact-map__location"><span>{telemetry.area}</span><kbd>M</kbd></div>
      </aside>

      {snapshot.gunState === "carried" || snapshot.packageState === "carried" ? (
        <aside className="inventory-hud" aria-label="Envanter">
          {snapshot.gunState === "carried" ? (
            <>
              <div className={snapshot.selectedSlot === 1 ? "inventory-slot is-active" : "inventory-slot"}>
                <kbd>1</kbd><span>ELLER</span>
              </div>
              <div className={snapshot.selectedSlot === 2 ? "inventory-slot is-active" : "inventory-slot"}>
                <kbd>2</kbd><span>TABANCA</span><strong>{snapshot.bullets} / {snapshot.magazines}</strong>
              </div>
            </>
          ) : null}
          {snapshot.packageState === "carried" ? (
            <div className="inventory-slot inventory-slot--package">
              <span className="package-icon" aria-hidden="true" /><span>NİHAT BEY&apos;İN PAKETİ</span>
            </div>
          ) : null}
        </aside>
      ) : null}

      <div className="health-hud" aria-label="Can 100"><span>+</span><strong>100</strong></div>
      {snapshot.inCar ? <div className="vehicle-hud"><strong>ARABA</strong><span>W/S sür · A/D yönlen · E in</span></div> : null}
      <div className={`crosshair${interaction ? " crosshair--active" : ""}`} aria-hidden="true"><span /></div>

      {interaction && interactionLabel ? (
        <div className="interaction-prompt" role="status">
          <kbd>E</kbd>
          <div><span>ETKİLEŞİM</span><strong>{interactionLabel}</strong></div>
        </div>
      ) : null}

      {toast ? <div className="world-message" role="status">{toast}</div> : null}
      {!locked ? <button className="lock-hint" onClick={onLock} type="button">Kamerayı etkinleştir</button> : null}
    </>
  );
}

export function FullMap({ onClose, telemetry }: { onClose: () => void; telemetry: PlayerTelemetry }) {
  return (
    <section className="full-map" role="dialog" aria-modal="true" aria-label="Büyük harita">
      <header><div><small>İNTİHAB / DÜNYA 001</small><h2>Mahalle haritası</h2></div><button onClick={onClose} type="button">Kapat <kbd>M</kbd></button></header>
      <div className="full-map__canvas">
        <MapGeometry large />
        <MapPlayer telemetry={telemetry} />
        <div className="full-map__legend"><span><i className="legend-player" />Sen</span><span><i className="legend-home" />Yapılar</span><span><i className="legend-road" />Açık yollar</span></div>
      </div>
    </section>
  );
}

export function ChoicePanel<Action extends string>({
  choice,
  onSelect,
  options,
  pendingBranch,
  seconds,
  title,
}: {
  choice: Exclude<MajorChoice, null>;
  onSelect: (action: Action) => void;
  options: Array<ChoiceOption<Action>>;
  pendingBranch: boolean;
  seconds: number;
  title: string;
}) {
  return (
    <section className="choice-screen" role="dialog" aria-modal="true" data-choice={choice}>
      <div className="choice-panel">
        <header><span>BÜYÜK SEÇİM</span><strong>{seconds.toString().padStart(2, "0")}</strong></header>
        <h2>{title}</h2>
        <div className="choice-timer"><span style={{ width: `${(seconds / 13) * 100}%` }} /></div>
        <div className="choice-actions">
          {options.map((option, index) => (
            <button
              className={option.tone === "danger" ? "choice-action is-danger" : "choice-action"}
              key={option.action}
              onClick={() => onSelect(option.action)}
              type="button"
            >
              <kbd>{index + 1}</kbd><span><strong>{option.label}</strong><small>{option.detail}</small></span>
            </button>
          ))}
        </div>
        <p>{pendingBranch ? "Tarayıcı sekmeyi engelledi. Seçeneğe yeniden tıkla." : "Süre biterse rastgele seçim yapılır."}</p>
      </div>
    </section>
  );
}

export function DialogueFeed({ lines }: { lines: DialogueLine[] }) {
  if (lines.length === 0) return null;
  return (
    <aside className="dialogue-feed" aria-live="polite">
      {lines.slice(-4).map((line) => (
        <div key={line.id} className={line.speaker === "Sen" ? "is-player" : ""}>
          <span>{line.speaker}</span><p>{line.text}</p>
        </div>
      ))}
    </aside>
  );
}

export function WakeOverlay() {
  return (
    <div className="wake-overlay" aria-label="Uyanma animasyonu">
      <div className="wake-eyelid wake-eyelid--top" />
      <div className="wake-eyelid wake-eyelid--bottom" />
      <span>Gözlerini açıyorsun.</span>
    </div>
  );
}

export function FrozenScreen() {
  return (
    <section className="frozen-screen">
      <small>EVREN BEKLİYOR</small>
      <h2>Seçim yeni sekmede sürüyor.</h2>
      <p>Yeni sekmeyi kapatırsan tam bu ana dönüp yeniden seçebilirsin.</p>
    </section>
  );
}

export function DeathScreen({ title }: { title: string | null }) {
  return (
    <section className="death-screen">
      <small>{title ?? "BÜYÜK SEÇİM"}</small>
      <h2>Bu evrende yol burada bitti.</h2>
    </section>
  );
}
