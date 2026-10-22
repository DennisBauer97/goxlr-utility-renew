// A stand-in for the GoXLR Utility daemon, for developing the UI without hardware.
// Serves /api/websocket on :14564 with a plausible DaemonStatus and applies a subset of
// commands so the UI reacts. Usage: `npm run mock`, then `npm run dev` in another terminal.
import { createServer } from 'node:http'
import { WebSocketServer } from 'ws'

const MINI = process.argv.includes('--mini')
const SERIAL = MINI ? 'S220202153DI7' : 'S210400000CQK'
const PORT = Number(process.env.PORT ?? 14564)

const map = (keys, fn) => Object.fromEntries(keys.map((k, i) => [k, fn(k, i)]))
const channels = ['Mic', 'LineIn', 'Console', 'System', 'Game', 'Chat', 'Sample', 'Music', 'Headphones', 'MicMonitor', 'LineOut']
const submixChannels = ['Mic', 'LineIn', 'Console', 'System', 'Game', 'Chat', 'Sample', 'Music']
const outputs = ['Headphones', 'BroadcastMix', 'ChatMic', 'Sampler', 'LineOut', 'StreamMix2']
const inputs = ['Microphone', 'Chat', 'Music', 'Game', 'Console', 'LineIn', 'System', 'Samples']
const buttons = [
  'Fader1Mute', 'Fader2Mute', 'Fader3Mute', 'Fader4Mute', 'Bleep', 'Cough',
  ...(MINI ? [] : ['EffectSelect1', 'EffectSelect2', 'EffectSelect3', 'EffectSelect4', 'EffectSelect5', 'EffectSelect6',
    'EffectFx', 'EffectMegaphone', 'EffectRobot', 'EffectHardTune', 'SamplerSelectA', 'SamplerSelectB', 'SamplerSelectC',
    'SamplerTopLeft', 'SamplerTopRight', 'SamplerBottomLeft', 'SamplerBottomRight', 'SamplerClear']),
]
const faderColours = { A: '00C8FF', B: 'A259FF', C: 'FFB000', D: 'FF2BD6' }
const eqFull = ['Equalizer31Hz', 'Equalizer63Hz', 'Equalizer125Hz', 'Equalizer250Hz', 'Equalizer500Hz', 'Equalizer1KHz', 'Equalizer2KHz', 'Equalizer4KHz', 'Equalizer8KHz', 'Equalizer16KHz']
const eqFullHz = [31.5, 63, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
const eqMini = ['Equalizer90Hz', 'Equalizer250Hz', 'Equalizer500Hz', 'Equalizer1KHz', 'Equalizer3KHz', 'Equalizer8KHz']
const eqMiniHz = [90, 250, 500, 1000, 3000, 8000]
const gains = [2, 3, 1, -2, -1, 0, 2, 3, 1, -1]

const pad = (samples) => ({ function: 'PlayNext', order: 'Sequential', samples, is_playing: false, is_recording: false })

const mixer = {
  hardware: {
    versions: { firmware: [1, 4, 2, 107], fpga_count: 22, dice: [1, 0, 0, 0] },
    serial_number: SERIAL,
    manufactured_date: '2021-04-12',
    device_type: MINI ? 'Mini' : 'Full',
    colour_way: 'Black',
    usb_device: { manufacturer_name: 'TC-Helicon', product_name: 'GoXLR', version: [1, 0, 0], bus_number: 3, address: 7, identifier: null },
  },
  shutdown_commands: [],
  sleep_commands: [],
  wake_commands: [],
  fader_status: {
    A: { channel: 'Mic', mute_type: 'All', scribble: { file_name: null, bottom_text: 'MIC', left_text: '1', inverted: false }, mute_state: 'Unmuted' },
    B: { channel: 'Music', mute_type: 'ToStream', scribble: { file_name: null, bottom_text: 'MUSIC', left_text: '2', inverted: false }, mute_state: 'Unmuted' },
    C: { channel: 'Chat', mute_type: 'All', scribble: null, mute_state: 'MutedToAll' },
    D: { channel: 'System', mute_type: 'ToPhones', scribble: null, mute_state: 'Unmuted' },
  },
  mic_status: {
    mic_type: 'Dynamic',
    mic_gains: { Dynamic: 48, Condenser: 30, Jack: 20 },
    equaliser: { gain: map(eqFull, (_, i) => gains[i]), frequency: map(eqFull, (_, i) => eqFullHz[i]) },
    equaliser_mini: { gain: map(eqMini, (_, i) => gains[i]), frequency: map(eqMini, (_, i) => eqMiniHz[i]) },
    noise_gate: { threshold: -42, attack: 'Gate10ms', release: 'Gate200ms', enabled: true, attenuation: 75 },
    compressor: { threshold: -16, ratio: 'Ratio3_2', attack: 'Comp5ms', release: 'Comp100ms', makeup_gain: 4 },
  },
  levels: {
    submix_supported: true,
    output_monitor: 'Headphones',
    volumes: map(channels, (_, i) => [209, 90, 148, 181, 158, 163, 178, 117, 140, 51, 204][i]),
    submix: null,
    bleep: -20,
    deess: 30,
  },
  router: map(inputs, (input) => map(outputs, (output) => !(input === 'Microphone' && output === 'Headphones') && !(input === 'Samples' && output === 'Sampler'))),
  cough_button: { is_toggle: true, mute_type: 'All', state: 'Unmuted' },
  lighting: {
    animation: { supported: true, mode: 'RetroRainbow', mod1: 50, mod2: 30, waterfall_direction: 'Down' },
    faders: map(['A', 'B', 'C', 'D'], (f) => ({ style: 'GradientMeter', colours: { colour_one: faderColours[f], colour_two: '1A1A2E' } })),
    buttons: map(buttons, () => ({ off_style: 'Dimmed', colours: { colour_one: 'FF1F4B', colour_two: '000000' } })),
    simple: map(['Global', 'Accent', 'Scribble1', 'Scribble2', 'Scribble3', 'Scribble4'], () => ({ colour_one: 'FFFFFF' })),
    sampler: MINI ? {} : map(['SamplerSelectA', 'SamplerSelectB', 'SamplerSelectC'], (_, i) => ({ off_style: 'Dimmed', colours: { colour_one: ['FF1F4B', '00C8FF', '2BFF88'][i], colour_two: '000000', colour_three: 'FFFFFF' } })),
    encoders: MINI ? {} : map(['Reverb', 'Pitch', 'Echo', 'Gender'], () => ({ colour_one: '00C8FF', colour_two: 'FF1F4B', colour_three: 'FFFFFF' })),
  },
  effects: MINI ? null : {
    is_enabled: true,
    active_preset: 'Preset1',
    preset_names: { Preset1: 'Deep Voice', Preset2: 'Radio Host', Preset3: 'Robot', Preset4: 'Chipmunk', Preset5: 'Arena', Preset6: 'Clean' },
    current: {
      reverb: { style: 'Chapel', amount: 62, decay: 2400, early_level: -6, tail_level: 0, pre_delay: 18, lo_colour: -10, hi_colour: 12, hi_factor: 0, diffuse: 20, mod_speed: 4, mod_depth: 0, raw_encoder: 15 },
      echo: { style: 'PingPong', amount: 30, feedback: 40, tempo: 120, delay_left: 500, delay_right: 500, feedback_left: 40, feedback_right: 40, feedback_xfb_l_to_r: 0, feedback_xfb_r_to_l: 0, raw_encoder: 7 },
      pitch: { style: 'Wide', amount: -3, character: 50, raw_encoder: -3 },
      gender: { style: 'Medium', amount: 8, raw_encoder: 8 },
      megaphone: { is_enabled: false, style: 'Radio', amount: 40, post_gain: 0 },
      robot: { is_enabled: false, style: 'Robot1', low_gain: 0, low_freq: 40, low_width: 16, mid_gain: 0, mid_freq: 130, mid_width: 16, high_gain: 0, high_freq: 210, high_width: 16, waveform: 0, pulse_width: 50, threshold: -20, dry_mix: -16 },
      hard_tune: { is_enabled: false, style: 'Hard', amount: 80, rate: 50, window: 100, source: 'All' },
    },
  },
  sampler: MINI ? null : {
    processing_state: { progress: null, last_error: null },
    active_bank: 'A',
    clear_active: false,
    record_buffer: 5000,
    banks: map(['A', 'B', 'C'], (bank) => ({
      TopLeft: pad(bank === 'A' ? [{ name: 'airhorn.wav', start_pct: 0, stop_pct: 100 }, { name: 'applause.wav', start_pct: 2.5, stop_pct: 92 }] : []),
      TopRight: pad(bank === 'A' ? [{ name: 'drumroll.mp3', start_pct: 0, stop_pct: 100 }] : []),
      BottomLeft: pad([]),
      BottomRight: pad([]),
    })),
  },
  settings: {
    display: { gate: 'Advanced', compressor: 'Advanced', equaliser: 'Advanced', equaliser_fine: 'Simple' },
    mute_hold_duration: 500,
    vc_mute_also_mute_cm: false,
    enable_monitor_with_fx: false,
    reset_sampler_on_clear: true,
    lock_faders: false,
    fade_duration: 1000,
    vod_mode: 'Routable',
  },
  button_down: map(buttons, () => false),
  profile_name: 'Streaming',
  mic_profile_name: 'SM7B Voice',
}

const status = {
  config: {
    http_settings: { enabled: true, bind_address: 'localhost', cors_enabled: false, port: PORT },
    daemon_version: '1.2.3',
    driver_interface: { interface: 'LIBUSB', version: null },
    latest_firmware: { Unknown: null, Full: { version: [1, 5, 4, 0], change_log: null }, Mini: { version: [1, 3, 2, 0], change_log: null } },
    locale: { user_locale: null, system_locale: 'de-DE' },
    activation: { active_path: null, app_path: null },
    autostart_enabled: true,
    show_tray_icon: true,
    tts_enabled: false,
    allow_network_access: false,
    log_level: 'Info',
    firmware_source: 'Live',
    open_ui_on_launch: false,
    platform: 'linux',
    handle_macos_aggregates: false,
  },
  firmware: {},
  mixers: { [SERIAL]: mixer },
  paths: { profile_directory: '/p', mic_profile_directory: '/m', samples_directory: '/s', presets_directory: '/e', icons_directory: '/i', logs_directory: '/l' },
  files: {
    profiles: ['Default', 'Streaming', 'Gaming Night'],
    mic_profiles: ['DEFAULT', 'SM7B Voice'],
    presets: ['Deep Voice', 'Radio Host'],
    samples: { 'airhorn.wav': { name: 'airhorn.wav', gain_pct: 100 }, 'applause.wav': { name: 'applause.wav', gain_pct: 100 }, 'drumroll.mp3': { name: 'drumroll.mp3', gain_pct: 100 } },
    icons: ['discord.png', 'spotify.png'],
  },
}

const base = `/mixers/${SERIAL}`
const arg = (payload, i) => (Array.isArray(payload) ? payload[i] : payload)

/** Returns JSON patch ops for the commands the mock understands; others are accepted silently. */
function apply(cmd) {
  const [name, p] = Object.entries(cmd)[0]
  const m = mixer
  const ops = []
  const set = (path, value) => ops.push({ op: 'replace', path: base + path, value })
  switch (name) {
    case 'SetVolume': set(`/levels/volumes/${p[0]}`, p[1]); break
    case 'SetFader': set(`/fader_status/${p[0]}/channel`, p[1]); break
    case 'SetFaderMuteState': set(`/fader_status/${p[0]}/mute_state`, p[1]); break
    case 'SetFaderMuteFunction': set(`/fader_status/${p[0]}/mute_type`, p[1]); break
    case 'SetCoughMuteState': set('/cough_button/state', p); break
    case 'SetCoughIsHold': set('/cough_button/is_toggle', !p); break
    case 'SetSwearButtonVolume': set('/levels/bleep', p); break
    case 'SetRouter': set(`/router/${p[0]}/${p[1]}`, p[2]); break
    case 'SetMicrophoneType': set('/mic_status/mic_type', p); break
    case 'SetMicrophoneGain': set(`/mic_status/mic_gains/${p[0]}`, p[1]); break
    case 'SetGateThreshold': set('/mic_status/noise_gate/threshold', p); break
    case 'SetGateActive': set('/mic_status/noise_gate/enabled', p); break
    case 'SetCompressorThreshold': set('/mic_status/compressor/threshold', p); break
    case 'SetEqGain': set(`/mic_status/equaliser/gain/${p[0]}`, p[1]); break
    case 'SetEqMiniGain': set(`/mic_status/equaliser_mini/gain/${p[0]}`, p[1]); break
    case 'SetElementDisplayMode': {
      const key = { NoiseGate: 'gate', Compressor: 'compressor', Equaliser: 'equaliser', EqFineTune: 'equaliser_fine' }[p[0]]
      set(`/settings/display/${key}`, p[1]); break
    }
    case 'SetFXEnabled': set('/effects/is_enabled', p); break
    case 'SetMegaphoneEnabled': set('/effects/current/megaphone/is_enabled', p); break
    case 'SetRobotEnabled': set('/effects/current/robot/is_enabled', p); break
    case 'SetHardTuneEnabled': set('/effects/current/hard_tune/is_enabled', p); break
    case 'SetActiveEffectPreset': set('/effects/active_preset', p); break
    case 'SetReverbAmount': set('/effects/current/reverb/amount', p); break
    case 'SetEchoAmount': set('/effects/current/echo/amount', p); break
    case 'SetPitchAmount': set('/effects/current/pitch/amount', p); break
    case 'SetGenderAmount': set('/effects/current/gender/amount', p); break
    case 'SetReverbStyle': set('/effects/current/reverb/style', p); break
    case 'SetActiveSamplerBank': set('/sampler/active_bank', p); break
    case 'SetSubMixEnabled':
      set('/levels/submix', p ? {
        inputs: map(submixChannels, (c) => ({ volume: m.levels.volumes[c], linked: true, ratio: 1 })),
        outputs: map(outputs, (o) => (o === 'BroadcastMix' ? 'B' : 'A')),
      } : null)
      break
    case 'SetFaderColours': set(`/lighting/faders/${p[0]}/colours`, { colour_one: p[1], colour_two: p[2] }); break
    case 'SetAnimationMode': set('/lighting/animation/mode', p); break
    case 'SetMuteHoldDuration': set('/settings/mute_hold_duration', p); break
    case 'SetLockFaders': set('/settings/lock_faders', p); break
    case 'LoadProfile': set('/profile_name', p[0]); break
    case 'LoadMicProfile': set('/mic_profile_name', p[0]); break
    case 'SaveProfileAs': set('/profile_name', p); break
  }
  // Keep the in-memory status in sync so later GetStatus calls see the change.
  for (const op of ops) {
    const keys = op.path.split('/').slice(1)
    let node = status
    for (const k of keys.slice(0, -1)) node = node[k]
    node[keys.at(-1)] = op.value
  }
  return ops
}

const server = createServer((req, res) => {
  res.writeHead(404)
  res.end()
})
const wss = new WebSocketServer({ server, path: '/api/websocket' })
let t = 0

wss.on('connection', (ws) => {
  ws.on('message', (raw) => {
    const { id, data } = JSON.parse(String(raw))
    let response = 'Ok'
    if (data === 'GetStatus') response = { Status: status }
    else if (data === 'Ping') response = 'Ok'
    else if (data.GetMicLevel) {
      t += 0.35
      response = { MicLevel: Math.max(-72, -26 + Math.sin(t) * 9 + Math.sin(t * 2.7) * 5 + (Math.random() - 0.5) * 4) }
    } else if (data.Command) {
      const ops = apply(data.Command[1])
      if (ops.length) {
        const message = `{"id":18446744073709551615,"data":${JSON.stringify({ Patch: ops })}}`
        for (const client of wss.clients) client.send(message)
      }
    }
    ws.send(JSON.stringify({ id, data: response }))
  })
})

server.listen(PORT, () => console.log(`Mock GoXLR daemon (${MINI ? 'Mini' : 'Full'}) on ws://localhost:${PORT}/api/websocket`))
