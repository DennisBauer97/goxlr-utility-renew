// TypeScript mirrors of the serde types in `ipc/src/device.rs`, `ipc/src/lib.rs` and
// `types/src/lib.rs`. Enums are serialised by serde as their variant name, EnumMaps as
// objects keyed by variant name, and tuple structs as arrays.

const variants = <const T extends readonly string[]>(...v: T) => v
export type Variant<T extends readonly string[]> = T[number]

export const ChannelNames = variants(
  'Mic', 'LineIn', 'Console', 'System', 'Game', 'Chat', 'Sample', 'Music',
  'Headphones', 'MicMonitor', 'LineOut',
)
export type ChannelName = Variant<typeof ChannelNames>

export const SubMixChannelNames = variants(
  'Mic', 'LineIn', 'Console', 'System', 'Game', 'Chat', 'Sample', 'Music',
)
export type SubMixChannelName = Variant<typeof SubMixChannelNames>

export const Mixes = variants('A', 'B')
export type Mix = Variant<typeof Mixes>

export const FaderNames = variants('A', 'B', 'C', 'D')
export type FaderName = Variant<typeof FaderNames>

export const OutputDevices = variants(
  'Headphones', 'BroadcastMix', 'ChatMic', 'Sampler', 'LineOut', 'StreamMix2',
)
export type OutputDevice = Variant<typeof OutputDevices>

export const InputDevices = variants(
  'Microphone', 'Chat', 'Music', 'Game', 'Console', 'LineIn', 'System', 'Samples',
)
export type InputDevice = Variant<typeof InputDevices>

export const FaderDisplayStyles = variants('TwoColour', 'Gradient', 'Meter', 'GradientMeter')
export type FaderDisplayStyle = Variant<typeof FaderDisplayStyles>

export const Buttons = variants(
  'Fader1Mute', 'Fader2Mute', 'Fader3Mute', 'Fader4Mute', 'Bleep', 'Cough',
  'EffectSelect1', 'EffectSelect2', 'EffectSelect3', 'EffectSelect4', 'EffectSelect5',
  'EffectSelect6', 'EffectFx', 'EffectMegaphone', 'EffectRobot', 'EffectHardTune',
  'SamplerSelectA', 'SamplerSelectB', 'SamplerSelectC', 'SamplerTopLeft', 'SamplerTopRight',
  'SamplerBottomLeft', 'SamplerBottomRight', 'SamplerClear',
)
export type Button = Variant<typeof Buttons>

export const SimpleColourTargetList = variants(
  'Global', 'Accent', 'Scribble1', 'Scribble2', 'Scribble3', 'Scribble4',
)
export type SimpleColourTargets = Variant<typeof SimpleColourTargetList>

export const SamplerColourTargetList = variants('SamplerSelectA', 'SamplerSelectB', 'SamplerSelectC')
export type SamplerColourTargets = Variant<typeof SamplerColourTargetList>

export const EncoderColourTargetList = variants('Reverb', 'Pitch', 'Echo', 'Gender')
export type EncoderColourTargets = Variant<typeof EncoderColourTargetList>

export const ButtonColourGroupList = variants('FaderMute', 'EffectSelector', 'EffectTypes')
export type ButtonColourGroups = Variant<typeof ButtonColourGroupList>

export const ButtonColourOffStyles = variants('Dimmed', 'Colour2', 'DimmedColour2')
export type ButtonColourOffStyle = Variant<typeof ButtonColourOffStyles>

export const MuteFunctions = variants(
  'All', 'ToStream', 'ToVoiceChat', 'ToPhones', 'ToLineOut', 'ToStream2', 'ToStreams',
)
export type MuteFunction = Variant<typeof MuteFunctions>

export const MicrophoneTypes = variants('Dynamic', 'Condenser', 'Jack')
export type MicrophoneType = Variant<typeof MicrophoneTypes>

export const EffectBankPresetList = variants(
  'Preset1', 'Preset2', 'Preset3', 'Preset4', 'Preset5', 'Preset6',
)
export type EffectBankPresets = Variant<typeof EffectBankPresetList>

export const SampleBanks = variants('A', 'B', 'C')
export type SampleBank = Variant<typeof SampleBanks>

export const SampleButtonList = variants('TopLeft', 'TopRight', 'BottomLeft', 'BottomRight')
export type SampleButtons = Variant<typeof SampleButtonList>

export const MiniEqFrequencyList = variants(
  'Equalizer90Hz', 'Equalizer250Hz', 'Equalizer500Hz', 'Equalizer1KHz', 'Equalizer3KHz',
  'Equalizer8KHz',
)
export type MiniEqFrequencies = Variant<typeof MiniEqFrequencyList>

export const EqFrequencyList = variants(
  'Equalizer31Hz', 'Equalizer63Hz', 'Equalizer125Hz', 'Equalizer250Hz', 'Equalizer500Hz',
  'Equalizer1KHz', 'Equalizer2KHz', 'Equalizer4KHz', 'Equalizer8KHz', 'Equalizer16KHz',
)
export type EqFrequencies = Variant<typeof EqFrequencyList>

export const CompressorRatios = variants(
  'Ratio1_0', 'Ratio1_1', 'Ratio1_2', 'Ratio1_4', 'Ratio1_6', 'Ratio1_8', 'Ratio2_0', 'Ratio2_5',
  'Ratio3_2', 'Ratio4_0', 'Ratio5_6', 'Ratio8_0', 'Ratio16_0', 'Ratio32_0', 'Ratio64_0',
)
export type CompressorRatio = Variant<typeof CompressorRatios>

export const GateTimeList = variants(
  'Gate10ms', 'Gate20ms', 'Gate30ms', 'Gate40ms', 'Gate50ms', 'Gate60ms', 'Gate70ms', 'Gate80ms',
  'Gate90ms', 'Gate100ms', 'Gate110ms', 'Gate120ms', 'Gate130ms', 'Gate140ms', 'Gate150ms',
  'Gate160ms', 'Gate170ms', 'Gate180ms', 'Gate190ms', 'Gate200ms', 'Gate250ms', 'Gate300ms',
  'Gate350ms', 'Gate400ms', 'Gate450ms', 'Gate500ms', 'Gate550ms', 'Gate600ms', 'Gate650ms',
  'Gate700ms', 'Gate750ms', 'Gate800ms', 'Gate850ms', 'Gate900ms', 'Gate950ms', 'Gate1000ms',
  'Gate1100ms', 'Gate1200ms', 'Gate1300ms', 'Gate1400ms', 'Gate1500ms', 'Gate1600ms',
  'Gate1700ms', 'Gate1800ms', 'Gate1900ms', 'Gate2000ms',
)
export type GateTimes = Variant<typeof GateTimeList>

export const CompressorAttackTimes = variants(
  'Comp0ms', 'Comp2ms', 'Comp3ms', 'Comp4ms', 'Comp5ms', 'Comp6ms', 'Comp7ms', 'Comp8ms',
  'Comp9ms', 'Comp10ms', 'Comp12ms', 'Comp14ms', 'Comp16ms', 'Comp18ms', 'Comp20ms', 'Comp23ms',
  'Comp26ms', 'Comp30ms', 'Comp35ms', 'Comp40ms',
)
export type CompressorAttackTime = Variant<typeof CompressorAttackTimes>

export const CompressorReleaseTimes = variants(
  'Comp0ms', 'Comp15ms', 'Comp25ms', 'Comp35ms', 'Comp45ms', 'Comp55ms', 'Comp65ms', 'Comp75ms',
  'Comp85ms', 'Comp100ms', 'Comp115ms', 'Comp140ms', 'Comp170ms', 'Comp230ms', 'Comp340ms',
  'Comp680ms', 'Comp1000ms', 'Comp1500ms', 'Comp2000ms', 'Comp3000ms',
)
export type CompressorReleaseTime = Variant<typeof CompressorReleaseTimes>

export const ReverbStyles = variants(
  'Library', 'DarkBloom', 'MusicClub', 'RealPlate', 'Chapel', 'HockeyArena',
)
export type ReverbStyle = Variant<typeof ReverbStyles>

export const EchoStyles = variants(
  'Quarter', 'Eighth', 'Triplet', 'PingPong', 'ClassicSlap', 'MultiTap',
)
export type EchoStyle = Variant<typeof EchoStyles>

export const PitchStyles = variants('Narrow', 'Wide')
export type PitchStyle = Variant<typeof PitchStyles>

export const GenderStyles = variants('Narrow', 'Medium', 'Wide')
export type GenderStyle = Variant<typeof GenderStyles>

export const MegaphoneStyles = variants(
  'Megaphone', 'Radio', 'OnThePhone', 'Overdrive', 'BuzzCutt', 'Tweed',
)
export type MegaphoneStyle = Variant<typeof MegaphoneStyles>

export const RobotStyles = variants('Robot1', 'Robot2', 'Robot3')
export type RobotStyle = Variant<typeof RobotStyles>

export const RobotRanges = variants('Low', 'Medium', 'High')
export type RobotRange = Variant<typeof RobotRanges>

export const HardTuneStyles = variants('Natural', 'Medium', 'Hard')
export type HardTuneStyle = Variant<typeof HardTuneStyles>

export const HardTuneSources = variants('All', 'Music', 'Game', 'LineIn', 'System')
export type HardTuneSource = Variant<typeof HardTuneSources>

export const SamplePlaybackModes = variants(
  'PlayNext', 'PlayStop', 'PlayFade', 'StopOnRelease', 'FadeOnRelease', 'Loop',
)
export type SamplePlaybackMode = Variant<typeof SamplePlaybackModes>

export const SamplePlayOrders = variants('Sequential', 'Random')
export type SamplePlayOrder = Variant<typeof SamplePlayOrders>

export const DisplayModes = variants('Simple', 'Advanced')
export type DisplayMode = Variant<typeof DisplayModes>

export const DisplayModeComponentList = variants(
  'NoiseGate', 'Equaliser', 'Compressor', 'EqFineTune',
)
export type DisplayModeComponents = Variant<typeof DisplayModeComponentList>

export const MuteStates = variants('Unmuted', 'MutedToX', 'MutedToAll')
export type MuteState = Variant<typeof MuteStates>

export const AnimationModes = variants(
  'RetroRainbow', 'RainbowDark', 'RainbowBright', 'Simple', 'Ripple', 'None',
)
export type AnimationMode = Variant<typeof AnimationModes>

export const WaterfallDirections = variants('Down', 'Up', 'Off')
export type WaterfallDirection = Variant<typeof WaterfallDirections>

export const VodModes = variants('Routable', 'StreamNoMusic')
export type VodMode = Variant<typeof VodModes>

export type DeviceType = 'Unknown' | 'Full' | 'Mini'
export type DriverInterface = 'TUSB' | 'LIBUSB'
export type ColourWay = 'Black' | 'White'

export const LogLevels = variants('Off', 'Error', 'Warn', 'Info', 'Debug', 'Trace')
export type LogLevel = Variant<typeof LogLevels>

export const FirmwareSources = variants('Live', 'Beta')
export type FirmwareSource = Variant<typeof FirmwareSources>

export const PathTypeList = variants(
  'Profiles', 'MicProfiles', 'Presets', 'Samples', 'Icons', 'Logs', 'Backups',
)
export type PathTypes = Variant<typeof PathTypeList>

/** `VersionNumber(u32, u32, Option<u32>, Option<u32>)` */
export type VersionNumber = [number, number, number | null, number | null]

export type EnumMap<K extends string, V> = Record<K, V>
export type PartialMap<K extends string, V> = Partial<Record<K, V>>

export interface DaemonStatus {
  config: DaemonConfig
  firmware: Record<string, FirmwareStatus>
  mixers: Record<string, MixerStatus>
  paths: Paths
  files: Files
}

export interface FirmwareDetails {
  version: VersionNumber
  change_log: string | null
}

export interface DaemonConfig {
  http_settings: HttpSettings
  daemon_version: string
  driver_interface: { interface: DriverInterface; version: VersionNumber | null }
  latest_firmware: EnumMap<DeviceType, FirmwareDetails | null> | null
  locale: { user_locale: string | null; system_locale: string }
  activation: { active_path: string | null; app_path: string | null }
  autostart_enabled: boolean
  show_tray_icon: boolean
  tts_enabled: boolean | null
  allow_network_access: boolean
  log_level: LogLevel
  firmware_source: FirmwareSource
  open_ui_on_launch: boolean
  platform: string
  handle_macos_aggregates: boolean
}

export interface HttpSettings {
  enabled: boolean
  bind_address: string
  cors_enabled: boolean
  port: number
}

export type UpdateState =
  | 'Failed'
  | 'Starting'
  | 'Manifest'
  | 'Download'
  | { Pause: { path: string; device_type: DeviceType; version: VersionNumber } }
  | 'ClearNVR'
  | 'UploadFirmware'
  | 'ValidateUpload'
  | 'HardwareValidate'
  | 'HardwareWrite'
  | 'Complete'

export interface FirmwareStatus {
  state: UpdateState
  progress: number
  error: string | null
}

export interface MixerStatus {
  hardware: HardwareStatus
  shutdown_commands: GoXLRCommand[]
  sleep_commands: GoXLRCommand[]
  wake_commands: GoXLRCommand[]
  fader_status: EnumMap<FaderName, FaderStatus>
  mic_status: MicSettings
  levels: Levels
  router: EnumMap<InputDevice, EnumMap<OutputDevice, boolean>>
  cough_button: CoughButton
  lighting: Lighting
  effects: Effects | null
  sampler: Sampler | null
  settings: Settings
  button_down: EnumMap<Button, boolean>
  profile_name: string
  mic_profile_name: string
}

export interface HardwareStatus {
  versions: { firmware: VersionNumber; fpga_count: number; dice: VersionNumber }
  serial_number: string
  manufactured_date: string
  device_type: DeviceType
  colour_way: ColourWay
  usb_device: {
    manufacturer_name: string
    product_name: string
    version: [number, number, number]
    bus_number: number
    address: number
    identifier: string | null
  }
}

export interface Scribble {
  file_name: string | null
  bottom_text: string | null
  left_text: string | null
  inverted: boolean
}

export interface FaderStatus {
  channel: ChannelName
  mute_type: MuteFunction
  scribble: Scribble | null
  mute_state: MuteState
}

export interface CoughButton {
  is_toggle: boolean
  mute_type: MuteFunction
  state: MuteState
}

export interface MicSettings {
  mic_type: MicrophoneType
  mic_gains: EnumMap<MicrophoneType, number>
  equaliser: {
    gain: PartialMap<EqFrequencies, number>
    frequency: PartialMap<EqFrequencies, number>
  }
  equaliser_mini: {
    gain: PartialMap<MiniEqFrequencies, number>
    frequency: PartialMap<MiniEqFrequencies, number>
  }
  noise_gate: {
    threshold: number
    attack: GateTimes
    release: GateTimes
    enabled: boolean
    attenuation: number
  }
  compressor: {
    threshold: number
    ratio: CompressorRatio
    attack: CompressorAttackTime
    release: CompressorReleaseTime
    makeup_gain: number
  }
}

export interface Submix {
  volume: number
  linked: boolean
  ratio: number
}

export interface Levels {
  submix_supported: boolean
  output_monitor: OutputDevice
  volumes: EnumMap<ChannelName, number>
  submix: {
    inputs: EnumMap<SubMixChannelName, Submix>
    outputs: EnumMap<OutputDevice, Mix>
  } | null
  bleep: number
  deess: number
}

export interface OneColour {
  colour_one: string
}
export interface TwoColours extends OneColour {
  colour_two: string
}
export interface ThreeColours extends TwoColours {
  colour_three: string
}

export interface Lighting {
  animation: {
    supported: boolean
    mode: AnimationMode
    mod1: number
    mod2: number
    waterfall_direction: WaterfallDirection
  }
  faders: PartialMap<FaderName, { style: FaderDisplayStyle; colours: TwoColours }>
  buttons: PartialMap<Button, { off_style: ButtonColourOffStyle; colours: TwoColours }>
  simple: PartialMap<SimpleColourTargets, OneColour>
  sampler: PartialMap<SamplerColourTargets, { off_style: ButtonColourOffStyle; colours: ThreeColours }>
  encoders: PartialMap<EncoderColourTargets, ThreeColours>
}

export interface Effects {
  is_enabled: boolean
  active_preset: EffectBankPresets
  preset_names: PartialMap<EffectBankPresets, string>
  current: ActiveEffects
}

export interface ActiveEffects {
  reverb: {
    style: ReverbStyle
    amount: number
    decay: number
    early_level: number
    tail_level: number
    pre_delay: number
    lo_colour: number
    hi_colour: number
    hi_factor: number
    diffuse: number
    mod_speed: number
    mod_depth: number
    raw_encoder: number
  }
  echo: {
    style: EchoStyle
    amount: number
    feedback: number
    tempo: number
    delay_left: number
    delay_right: number
    feedback_left: number
    feedback_right: number
    feedback_xfb_l_to_r: number
    feedback_xfb_r_to_l: number
    raw_encoder: number
  }
  pitch: { style: PitchStyle; amount: number; character: number; raw_encoder: number }
  gender: { style: GenderStyle; amount: number; raw_encoder: number }
  megaphone: { is_enabled: boolean; style: MegaphoneStyle; amount: number; post_gain: number }
  robot: {
    is_enabled: boolean
    style: RobotStyle
    low_gain: number
    low_freq: number
    low_width: number
    mid_gain: number
    mid_freq: number
    mid_width: number
    high_gain: number
    high_freq: number
    high_width: number
    waveform: number
    pulse_width: number
    threshold: number
    dry_mix: number
  }
  hard_tune: {
    is_enabled: boolean
    style: HardTuneStyle
    amount: number
    rate: number
    window: number
    source: HardTuneSource
  }
}

export interface Sample {
  name: string
  start_pct: number
  stop_pct: number
}

export interface SamplerButton {
  function: SamplePlaybackMode
  order: SamplePlayOrder
  samples: Sample[]
  is_playing: boolean
  is_recording: boolean
}

export interface Sampler {
  processing_state: { progress: number | null; last_error: string | null }
  active_bank: SampleBank
  clear_active: boolean
  record_buffer: number
  banks: PartialMap<SampleBank, PartialMap<SampleButtons, SamplerButton>>
}

export interface Settings {
  display: {
    gate: DisplayMode
    compressor: DisplayMode
    equaliser: DisplayMode
    equaliser_fine: DisplayMode
  }
  mute_hold_duration: number
  vc_mute_also_mute_cm: boolean
  enable_monitor_with_fx: boolean
  reset_sampler_on_clear: boolean
  lock_faders: boolean
  fade_duration: number
  vod_mode: VodMode
}

export interface Paths {
  profile_directory: string
  mic_profile_directory: string
  samples_directory: string
  presets_directory: string
  icons_directory: string
  logs_directory: string
}

export interface Files {
  profiles: string[]
  mic_profiles: string[]
  presets: string[]
  samples: Record<string, { name: string; gain_pct: number }>
  icons: string[]
}

/**
 * A serde externally-tagged enum value: either a unit variant (`"Name"`) or an object with a
 * single key whose value is the variant's payload. Tuple variants with several fields carry
 * an array, single-field ones carry the bare value, and empty tuple variants (`Foo()`) carry `[]`.
 */
export type GoXLRCommand = { [variant: string]: unknown }
export type DaemonCommand = string | { [variant: string]: unknown }

export type DaemonRequest =
  | 'Ping'
  | 'GetStatus'
  | { Daemon: DaemonCommand }
  | { GetMicLevel: string }
  | { Command: [string, GoXLRCommand] }
  | { RunFirmwareUpdate: [string, string | null, boolean] }
  | { ContinueFirmwareUpdate: string }
  | { ClearFirmwareState: string }

export type JsonPatchOperation = import('fast-json-patch').Operation

export type DaemonResponse =
  | 'Ok'
  | { Error: string }
  | { MicLevel: number }
  | { Status: DaemonStatus }
  | { Patch: JsonPatchOperation[] }

export interface WebsocketResponse {
  id: number
  data: DaemonResponse
}
