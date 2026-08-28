import { useEffect, useState } from "react";

import {
  Minimize2,
  Maximize2,
  Check,
  Zap,
  MousePointer2,
} from "lucide-react";

import "./Settings.css";

export default function Settings() {
  // =========================================================
  // COMPACT MODE
  // =========================================================

  const [compactMode, setCompactMode] = useState(() => {
    return (
      localStorage.getItem(
        "atlas_manager_compact_mode"
      ) === "true"
    );
  });

  // =========================================================
  // REDUCED MOTION
  // =========================================================

  const [reducedMotion, setReducedMotion] = useState(() => {
    return (
      localStorage.getItem(
        "atlas_manager_reduced_motion"
      ) === "true"
    );
  });

  // =========================================================
  // APPLY COMPACT MODE
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      "atlas_manager_compact_mode",
      String(compactMode)
    );

    document.documentElement.classList.toggle(
      "atlas-manager-compact",
      compactMode
    );

    window.dispatchEvent(
      new Event(
        "atlas-manager-settings-change"
      )
    );
  }, [compactMode]);

  // =========================================================
  // APPLY REDUCED MOTION
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      "atlas_manager_reduced_motion",
      String(reducedMotion)
    );

    document.documentElement.classList.toggle(
      "atlas-manager-reduced-motion",
      reducedMotion
    );

    window.dispatchEvent(
      new Event(
        "atlas-manager-settings-change"
      )
    );
  }, [reducedMotion]);

  // =========================================================
  // HANDLERS
  // =========================================================

  function handleCompactModeChange() {
    setCompactMode((previous) => !previous);
  }

  function handleReducedMotionChange() {
    setReducedMotion((previous) => !previous);
  }

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="manager-settings-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="manager-settings-header">

        <div>
          <span className="manager-settings-eyebrow">
            PREFERENCES
          </span>

          <h1>
            Settings
          </h1>

          <p>
            Customize how your Atlas manager
            workspace looks and behaves.
          </p>
        </div>

      </div>


      {/* =====================================================
          WORKSPACE
      ===================================================== */}

      <section className="manager-settings-card">

        <div className="manager-settings-card-header">

          <div>
            <h2>
              Workspace
            </h2>

            <p>
              Control the layout and interaction
              behaviour of your manager workspace.
            </p>
          </div>

        </div>


        {/* ===================================================
            COMPACT MODE
        =================================================== */}

        <button
          type="button"
          className="manager-setting-row"
          onClick={handleCompactModeChange}
        >

          <div className="manager-setting-icon">
            {compactMode ? (
              <Minimize2 size={19} />
            ) : (
              <Maximize2 size={19} />
            )}
          </div>

          <div className="manager-setting-content">

            <strong>
              Compact Mode
            </strong>

            <span>
              {compactMode
                ? "Using a more compact workspace layout."
                : "Using the standard workspace layout."}
            </span>

          </div>

          <div
            className={`manager-toggle ${
              compactMode
                ? "enabled"
                : ""
            }`}
          >
            <div className="manager-toggle-knob" />
          </div>

        </button>


        {/* ===================================================
            REDUCED MOTION
        =================================================== */}

        <button
          type="button"
          className="manager-setting-row"
          onClick={handleReducedMotionChange}
        >

          <div className="manager-setting-icon">
            {reducedMotion ? (
              <MousePointer2 size={19} />
            ) : (
              <Zap size={19} />
            )}
          </div>

          <div className="manager-setting-content">

            <strong>
              Reduced Motion
            </strong>

            <span>
              {reducedMotion
                ? "Animations and transitions are minimized."
                : "Use normal animations and transitions."}
            </span>

          </div>

          <div
            className={`manager-toggle ${
              reducedMotion
                ? "enabled"
                : ""
            }`}
          >
            <div className="manager-toggle-knob" />
          </div>

        </button>

      </section>


      {/* =====================================================
          CURRENT STATUS
      ===================================================== */}

      <section className="manager-settings-card manager-settings-status-card">

        <div className="manager-settings-card-header">

          <div>
            <h2>
              Current Workspace
            </h2>

            <p>
              Your current manager workspace preferences.
            </p>
          </div>

        </div>


        <div className="manager-settings-status-grid">

          {/* APPEARANCE */}

          <div className="manager-settings-status-item">

            <span>
              Appearance
            </span>

            <strong>
              Dark
            </strong>

            <Check size={15} />

          </div>


          {/* LAYOUT */}

          <div className="manager-settings-status-item">

            <span>
              Layout
            </span>

            <strong>
              {compactMode
                ? "Compact"
                : "Standard"}
            </strong>

            {compactMode && (
              <Check size={15} />
            )}

          </div>


          {/* MOTION */}

          <div className="manager-settings-status-item">

            <span>
              Motion
            </span>

            <strong>
              {reducedMotion
                ? "Reduced"
                : "Normal"}
            </strong>

            {reducedMotion && (
              <Check size={15} />
            )}

          </div>

        </div>

      </section>

    </div>
  );
}