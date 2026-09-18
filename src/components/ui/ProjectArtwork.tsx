import type { ProjectId } from '@/data/projects'

export function ProjectArtwork({ id }: { id: ProjectId }) {
  // Abstract domain illustrations, not product screenshots.
  if (id === 'neos')
    return (
      <div className="project-art art-terminal" aria-hidden="true">
        <div className="terminal-window">
          <div className="window-bar">
            <i />
            <i />
            <i />
            <span>neos / system</span>
          </div>
          <div className="terminal-body">
            <span className="terminal-prompt">~ $</span> cat /etc/os-release
            <br />
            <strong>NeOS</strong>
            <br />
            <span className="muted">arch base · plasma desktop</span>
            <br />
            <span className="terminal-prompt">→</span> a system, on your terms
            <span className="terminal-caret" />
          </div>
        </div>
        <span className="art-caption">LINUX / SYSTEMS</span>
      </div>
    )
  if (id === 'ferrumcalc')
    return (
      <div className="project-art art-calculator" aria-hidden="true">
        <div className="calculator-face">
          <span>PROGRAMMER</span>
          <strong>
            0xFF <em>→</em> 255
          </strong>
          <div className="calculator-keys">
            {['HEX', 'DEC', 'BIN', '＋', '7', '8', '9', '＝'].map((key) => (
              <i key={key}>{key}</i>
            ))}
          </div>
        </div>
        <span className="art-caption">RUST / DESKTOP</span>
      </div>
    )
  if (id === 'megis')
    return (
      <div className="project-art art-map" aria-hidden="true">
        <svg viewBox="0 0 500 210" preserveAspectRatio="xMidYMid slice">
          <path
            className="map-road"
            d="M0 30 500 150M70 0l90 210M310 0l-60 210M0 180 500 30M420 0l-40 210"
          />
          <path className="map-zone" d="m155 60 120-25 70 95-135 45Z" />
          <path
            className="map-route"
            d="m60 155 80-45 80 15 60-45 85 10 70-45"
          />
          <circle cx="280" cy="80" r="12" className="map-pulse" />
          <circle cx="280" cy="80" r="5" className="map-dot" />
        </svg>
        <span className="map-tag">GEOFENCE / ENTER</span>
        <span className="art-caption">GEOSPATIAL / DATA</span>
      </div>
    )
  if (id === 'forensics' || id === 'osteoporosis' || id === 'dsrpc')
    return (
      <div className={'project-art art-study art-' + id} aria-hidden="true">
        <svg viewBox="0 0 340 200" className="study-diagram">
          {id === 'forensics' ? (
            <>
              <path
                className="diagram-wire"
                d="M78 58 168 88 263 48M78 143 168 88 270 145"
              />
              {[
                [54, 34],
                [54, 119],
                [241, 24],
                [247, 121],
              ].map(([x, y]) => (
                <g
                  key={x + '-' + y}
                  transform={'translate(' + x + ' ' + y + ')'}
                >
                  <rect
                    width="43"
                    height="47"
                    rx="4"
                    className="diagram-panel"
                  />
                  <path
                    d="M10 14H31M10 23H26M10 32H29"
                    className="diagram-line"
                  />
                </g>
              ))}
              <circle cx="164" cy="84" r="35" className="diagram-lens" />
              <circle cx="164" cy="84" r="25" className="diagram-ring" />
              <path d="m189 110 25 27" className="diagram-handle" />
              <path d="M146 86h9l5-11 8 21 5-10h12" className="diagram-line" />
              <text x="170" y="177" textAnchor="middle">
                TRACE THE EVIDENCE
              </text>
            </>
          ) : id === 'osteoporosis' ? (
            <>
              <path d="M170 30V152" className="diagram-divider" />
              {[48, 85, 122].flatMap((y) =>
                [58, 112].map((z) => (
                  <path
                    key={y + '-' + z}
                    d={'M38 ' + y + ' 86 ' + z + ' 134 85'}
                    className="diagram-wire"
                  />
                )),
              )}
              {[48, 85, 122].map((y) => (
                <circle key={y} cx="38" cy={y} r="6" className="diagram-node" />
              ))}
              {[58, 112].map((y) => (
                <circle key={y} cx="86" cy={y} r="7" className="diagram-node" />
              ))}
              <circle
                cx="134"
                cy="85"
                r="9"
                className="diagram-node node-output"
              />
              {[0, 1, 2].map((layer) => (
                <rect
                  key={layer}
                  x={198 + layer * 10}
                  y={40 + layer * 8}
                  width="66"
                  height="66"
                  rx="3"
                  className="diagram-panel"
                />
              ))}
              {Array.from({ length: 9 }, (_, i) => (
                <rect
                  key={i}
                  x={224 + (i % 3) * 17}
                  y={62 + Math.floor(i / 3) * 17}
                  width="12"
                  height="12"
                  rx="1"
                  className={'matrix-cell cell-' + i}
                />
              ))}
              <path d="M286 93h23m-7-6 7 6-7 6" className="diagram-line" />
              <text x="86" y="158" textAnchor="middle">
                MLP
              </text>
              <text x="251" y="158" textAnchor="middle">
                CNN
              </text>
            </>
          ) : (
            <>
              <path d="M81 92H128M212 92H259" className="diagram-wire" />
              <rect
                x="22"
                y="59"
                width="60"
                height="47"
                rx="5"
                className="diagram-panel"
              />
              <path
                d="M52 106v12m-16 0h32M33 72h18m-18 10h34"
                className="diagram-line"
              />
              {[0, 1, 2].map((i) => (
                <g key={i}>
                  <rect
                    x="130"
                    y={52 + i * 25}
                    width="80"
                    height="20"
                    rx="3"
                    className="diagram-panel"
                  />
                  <circle
                    cx="144"
                    cy={62 + i * 25}
                    r="2.5"
                    className="diagram-node"
                  />
                  <path
                    d={'M158 ' + (62 + i * 25) + 'h38'}
                    className="diagram-line"
                  />
                </g>
              ))}
              <path
                d="M258 66v48c0 14 62 14 62 0V66"
                className="diagram-panel"
              />
              <ellipse
                cx="289"
                cy="66"
                rx="31"
                ry="11"
                className="diagram-panel"
              />
              <path d="M258 89c0 14 62 14 62 0" className="diagram-line" />
              <circle
                cx="103"
                cy="92"
                r="3"
                className="diagram-node node-output"
              />
              <circle
                cx="234"
                cy="92"
                r="3"
                className="diagram-node node-output"
              />
              <text x="52" y="158" textAnchor="middle">
                CLIENT
              </text>
              <text x="170" y="158" textAnchor="middle">
                SERVER
              </text>
              <text x="289" y="158" textAnchor="middle">
                DATABASE
              </text>
            </>
          )}
        </svg>
        <span className="art-caption">
          {id === 'forensics'
            ? 'SECURITY / INVESTIGATION'
            : id === 'osteoporosis'
              ? 'AI / MODEL EVALUATION'
              : 'SYSTEMS / RPC'}
        </span>
      </div>
    )
  return (
    <div className={'project-art art-schematic art-' + id} aria-hidden="true">
      <div className="schematic-center">
        {id === 'museek' ? (
          <div className="waveform">
            {Array.from({ length: 27 }, (_, i) => (
              <i key={i} style={{ height: 16 + ((i * 37) % 67) + 'px' }} />
            ))}
          </div>
        ) : id === 'hsfix' ? (
          <>
            <span className="code-line">
              changes <b>→</b> patch <b>→</b> apply
            </span>
            <span className="code-subline">
              small changes. traceable history.
            </span>
          </>
        ) : null}
      </div>
      <span className="art-caption">
        {id === 'museek'
          ? 'AUDIO / LOCAL FIRST'
          : id === 'hsfix'
            ? 'PYTHON / DEVELOPER TOOLS'
            : 'COURSEWORK / EXPLORATION'}
      </span>
    </div>
  )
}
