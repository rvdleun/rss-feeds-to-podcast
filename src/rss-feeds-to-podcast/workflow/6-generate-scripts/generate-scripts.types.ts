export type ScriptItemType = 'delay' | 'host-speaks' | 'sfx' | 'start-segment';

export interface EvaluateArticleResponseFormat {
  isValid?: boolean;
  reason?: string;
}

export interface ScriptItem {
  id?: number;
  type: ScriptItemType;
  lengthAudio?: number;
}

export interface ScriptDelayItem extends ScriptItem {
  duration?: number;
}

export interface ScriptHostSpeaksItem extends ScriptItem {
  content: string;
  host: string;
}

export interface ScriptSfxItem extends ScriptItem {
  src: string;
}

export interface ScriptStartSegmentItem extends ScriptItem {
  origin: string;
  src: string;
  title: string;
}
