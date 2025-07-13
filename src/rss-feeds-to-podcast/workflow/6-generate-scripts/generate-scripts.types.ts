export type ScriptItemType = 'delay' | 'host-speaks' | 'sfx';

export interface ScriptItem {
  type: ScriptItemType;
}

export interface ScriptDelayItem extends ScriptItem {
  duration: number;
}

export interface ScriptHostSpeaksItem extends ScriptItem {
  host: string;
  content: string;
}

export interface ScriptSfxItem extends ScriptItem {
  src: string;
}
